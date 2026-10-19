import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Resend } from "resend";

const allowedInquiryTypes = new Set(["NGO", "Hospital", "Business", "Individual", "Other"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cleanLine(value, maxLength) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sendError(res, status, message) {
  return res.status(status).json({ ok: false, message });
}

export default async function handler(req, res) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowedOrigins = new Set(
    (process.env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean),
  );

  const isLocalDevOrigin =
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  if (!origin || (!allowedOrigins.has(origin) && !isLocalDevOrigin)) {
    return sendError(res, 403, "Origin not allowed.");
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "600");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendError(res, 405, "Method not allowed.");
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendError(res, 400, "Invalid request.");
  }

  // Quietly accept the honeypot so simple bots do not trigger an email.
  if (cleanLine(body.companyWebsite, 200)) {
    return res.status(200).json({ ok: true });
  }

  const requiredEnv = [
    "RESEND_API_KEY",
    "CONTACT_FROM_EMAIL",
    "CONTACT_TO_EMAIL",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ];
  if (requiredEnv.some((key) => !process.env[key]?.trim())) {
    return sendError(res, 503, "Contact service is not configured.");
  }

  const inquiryType = cleanLine(body.inquiryType, 30);
  const organization = cleanLine(body.organization, 120);
  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254);
  const project = String(body.project ?? "")
    .replace(/\r\n?/g, "\n")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return !(code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127);
    })
    .join("")
    .trim();

  if (
    !allowedInquiryTypes.has(inquiryType) ||
    !name ||
    !emailPattern.test(email) ||
    project.length < 20 ||
    project.length > 2000 ||
    organization.length > 120 ||
    name.length > 100 ||
    email.length > 254
  ) {
    return sendError(res, 400, "Please check your inquiry details.");
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "portfolio-contact",
  });

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
    ?.split(",")[0]?.trim() || "unknown";

  let limit;
  try {
    limit = await limiter.limit(ip);
  } catch {
    return sendError(res, 503, "Contact service is temporarily unavailable.");
  }

  if (!limit.success) {
    return sendError(res, 429, "Too many inquiries. Please try again later.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const text = [
    "New portfolio inquiry",
    "",
    `Inquiry type: ${inquiryType}`,
    `Organisation: ${organization || "Not provided"}`,
    `Name: ${name}`,
    `Reply email: ${email}`,
    "",
    "Project details:",
    project,
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      replyTo: email,
      subject: `Portfolio inquiry: ${inquiryType} - ${name}`,
      text,
    });

    if (error) {
      return sendError(res, 502, "Email delivery failed. Please try again later.");
    }

    return res.status(200).json({ ok: true });
  } catch {
    return sendError(res, 502, "Email delivery failed. Please try again later.");
  }
}