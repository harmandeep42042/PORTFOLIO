import { useMemo, useState, type FormEvent } from "react";
import "./App.css";

const projects = [
  {
    number: "01",
    type: "COMMUNITY IMPACT · INTERACTIVE DEMO",
    title: "Blood Emergency Finder",
    description:
      "A community-support concept that helps people explore donor search, blood groups and emergency request workflows using clearly labelled sample data.",
    tags: ["React", "TypeScript", "Responsive UI"],
    accent: "coral",
    demoHref: "#blood-demo",
    sourceHref: null,
  },
  {
    number: "02",
    type: "BUSINESS · WEB DESIGN",
    title: "Business Website",
    description:
      "A clean, conversion-focused website concept for a growing business, with clear services, strong visual hierarchy and direct contact paths.",
    tags: ["Web Design", "Accessibility", "SEO-ready"],
    accent: "violet",
    demoHref: null,
    sourceHref: null,
  },
  {
    number: "03",
    type: "PRODUCT · DASHBOARD",
    title: "Smart Dashboard",
    description:
      "A dashboard concept that brings key information, activity and useful actions together in a simple, easy-to-navigate workspace.",
    tags: ["UI/UX", "Dashboard", "Frontend"],
    accent: "mint",
    demoHref: null,
    sourceHref: null,
  },
];

const sampleDonors = [
  { name: "Sample donor A", group: "O+", city: "Ludhiana", distance: "2.4 km" },
  { name: "Sample donor B", group: "B+", city: "Chandigarh", distance: "5.1 km" },
  { name: "Sample donor C", group: "A+", city: "Amritsar", distance: "3.8 km" },
  { name: "Sample donor D", group: "O-", city: "Ludhiana", distance: "4.2 km" },
  { name: "Sample donor E", group: "AB+", city: "Patiala", distance: "6.0 km" },
];

const services = [
  {
    icon: "↗",
    number: "01",
    title: "Website Development",
    description:
      "Responsive business websites and landing pages that look polished on mobile, tablet and desktop.",
  },
  {
    icon: "▦",
    number: "02",
    title: "Web App Interfaces",
    description:
      "Interactive dashboards, searchable interfaces and practical web application experiences.",
  },
  {
    icon: "✳",
    number: "03",
    title: "UI Implementation",
    description:
      "Turn a design idea or reference into a clean, consistent and maintainable frontend.",
  },
];

const CURRENT_YEAR = new Date().getFullYear();

function App() {
  const [bloodGroup, setBloodGroup] = useState("All groups");
  const [city, setCity] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDonors = useMemo(() => {
    const normalizedCity = city.trim().toLowerCase();
    return sampleDonors.filter((donor) => {
      const matchesGroup = bloodGroup === "All groups" || donor.group === bloodGroup;
      const matchesCity = !normalizedCity || donor.city.toLowerCase().includes(normalizedCity);
      return matchesGroup && matchesCity;
    });
  }, [bloodGroup, city]);

    async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const apiUrl = import.meta.env.VITE_CONTACT_API_URL?.trim();
    if (!apiUrl) {
      setFormStatus("Email delivery is not configured yet. Please email harmandeep42042@gmail.com directly.");
      return;
    }

    setIsSubmitting(true);
    setFormStatus("Sending your inquiry...");

    const formData = new FormData(form);
    const payload = {
      inquiryType: String(formData.get("inquiryType") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      project: String(formData.get("project") ?? ""),
      companyWebsite: String(formData.get("companyWebsite") ?? ""),
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.ok !== true) {
        throw new Error("Contact submission failed");
      }

      setFormStatus("Thanks — your inquiry has been sent. I'll get back to you soon.");
      form.reset();
    } catch {
      setFormStatus("Your inquiry could not be sent. Please try again later or email harmandeep42042@gmail.com directly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="site-header" onKeyDown={(event) => { if (event.key === "Escape") closeMenu(); }}>
        <div className="nav-shell">
          <a className="brand" href="#home" onClick={closeMenu} aria-label="Harmandeep Singh home">
            <span className="brand-mark">h.</span>
            <span>harmandeep<span className="brand-dot">.</span></span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
            <a href="#work" onClick={closeMenu}>Work</a>
            <a href="#services" onClick={closeMenu}>Services</a>
            <a href="#about" onClick={closeMenu}>About</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>
              Let's talk <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section-shell" id="home">
          <div className="hero-copy">
            <div className="availability">
              <span className="availability-dot" />
              OPEN TO FREELANCE PROJECTS
            </div>
            <p className="eyebrow">WEB DEVELOPER · CREATIVE PROBLEM SOLVER</p>
            <h1>
              Ideas into
              <br />
              <span className="gradient-text">digital reality.</span>
            </h1>
            <p className="hero-description">
              I build clean, thoughtful websites and web experiences that help
              people and businesses move forward.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                Explore my work <span aria-hidden="true">↘</span>
              </a>
              <a className="button button-secondary" href="#contact">
                Start a project <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="hero-meta">
              <span><span className="meta-symbol">⌘</span> Design-minded development</span>
              <span><span className="meta-symbol">◎</span> Built for real screens</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Abstract portfolio illustration">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-glow" />
            <div className="art-window">
              <div className="window-top">
                <span /><span /><span />
                <div className="window-label">A LITTLE BIT OF CODE, A LOT OF CARE</div>
              </div>
              <div className="code-lines" aria-hidden="true">
                <div><span className="code-muted">01</span><span className="code-purple">const</span> idea = <span className="code-green">"yours"</span>;</div>
                <div><span className="code-muted">02</span><span className="code-purple">function</span> <span className="code-blue">buildSomething</span>() {"{"}</div>
                <div><span className="code-muted">03</span>&nbsp;&nbsp;<span className="code-purple">return</span> <span className="code-green">meaningful</span>;</div>
                <div><span className="code-muted">04</span>{"}"}</div>
              </div>
              <div className="art-bottom">
                <span className="art-bottom-icon">✳</span>
                <div>
                  <strong>Thoughtfully made.</strong>
                  <small>From first sketch to final build.</small>
                </div>
                <span className="art-arrow">↗</span>
              </div>
            </div>
            <div className="floating-chip chip-top"><span>✦</span> Thoughtful design</div>
            <div className="floating-chip chip-bottom"><span className="chip-check">✓</span> Responsive by default</div>
            <div className="art-stamp">MAKE<br />IT<br /><span>MATTER.</span></div>
          </div>
          <a className="scroll-note" href="#work"><span /> SCROLL TO EXPLORE</a>
        </section>

        <section className="trust-strip" aria-label="Development principles">
          <div className="trust-inner">
            <span>BUILT WITH PURPOSE</span><i>✳</i>
            <span>RESPONSIVE FIRST</span><i>✳</i>
            <span>CLEAN CODE</span><i>✳</i>
            <span>USER FOCUSED</span>
          </div>
        </section>

        <section className="section-shell section-block" id="work">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A FEW THINGS I'M BUILDING</p>
              <h2>Selected <span className="gradient-text">work.</span></h2>
            </div>
            <p className="section-intro">
              Practical concepts, built around clear design and useful experiences.
              These are portfolio demos, not client endorsements.
            </p>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article className={`project-card ${project.accent}`} key={project.number}>
                <div className="project-visual">
                  <div className="project-card-top">
                    <span>PROJECT / {project.number}</span>
                    <span className="project-visual-icon">↗</span>
                  </div>
                  {project.number === "01" ? (
                    <div className="blood-preview">
                      <div className="blood-preview-head">
                        <span className="blood-symbol">+</span>
                        <div><strong>LifeLink</strong><small>Community donor finder</small></div>
                      </div>
                      <div className="blood-search-preview">
                        <span>⌕ &nbsp; Search blood group</span><span>⌄</span>
                      </div>
                      <div className="blood-result-preview">
                        <span className="blood-type">O+</span>
                        <div><strong>Sample donor</strong><small>Example location · Demo data</small></div>
                        <span className="result-dot" />
                      </div>
                      <div className="blood-result-preview">
                        <span className="blood-type blood-type-alt">B+</span>
                        <div><strong>Sample donor</strong><small>Example location · Demo data</small></div>
                        <span className="result-dot" />
                      </div>
                    </div>
                  ) : project.number === "02" ? (
                    <div className="business-preview">
                      <div className="business-preview-nav"><span className="mini-brand">STUDIO<span>.</span></span><span>ABOUT &nbsp; WORK &nbsp; CONTACT</span></div>
                      <p>Good work.<br /><span>Good people.</span></p>
                      <div className="business-preview-foot"><span>MADE FOR WHAT'S NEXT</span><span>↗</span></div>
                    </div>
                  ) : (
                    <div className="dashboard-preview">
                      <div className="dashboard-side"><span>◈</span><i /><i /><i /><i /></div>
                      <div className="dashboard-main">
                        <span className="dashboard-caption">OVERVIEW</span>
                        <div className="dashboard-number">Your work, <b>in focus.</b></div>
                        <div className="dashboard-stats"><i /><i /><i /></div>
                        <div className="dashboard-chart"><span /><span /><span /><span /><span /><span /><span /><span /></div>
                      </div>
                    </div>
                  )}
                  <span className="visual-index">{project.number}</span>
                </div>
                <div className="project-info">
                  <p className="project-type">{project.type}</p>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="tag-row">
                    {project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                  </div>
                  {project.demoHref ? (
                    <a className="text-link" href={project.demoHref}>Explore interactive demo <span>↘</span></a>
                  ) : (
                    <span className="project-note">Design concept — no live demo yet <span>✳</span></span>
                  )}
                  {project.sourceHref && (
                    <a className="text-link" href={project.sourceHref} target="_blank" rel="noreferrer">View source code <span>↗</span></a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="demo-section" id="blood-demo">
          <div className="section-shell demo-layout">
            <div className="demo-copy">
              <p className="eyebrow">FEATURED INTERACTIVE CONCEPT</p>
              <h2>Technology with a <span className="gradient-text">human side.</span></h2>
              <p>
                LifeLink explores how a community donor finder could work:
                filter sample profiles by blood group and city, then review
                example results in a simple interface.
              </p>
              <div className="demo-warning">
                <span>ⓘ</span>
                <div>
                  <strong>Demo data only — not for real emergencies.</strong>
                  <p>This prototype does not verify donors, availability, locations or medical suitability. It is not a real blood donation service.</p>
                </div>
              </div>
              <div className="demo-feature-list">
                <span><b>✓</b> Search and filter interactions</span>
                <span><b>✓</b> Responsive layout</span>
                <span><b>✓</b> Clear demo-data labelling</span>
              </div>
            </div>

            <div className="finder-panel">
              <div className="finder-header">
                <div className="finder-brand"><span className="finder-brand-icon">+</span><div><strong>LifeLink</strong><small>DONOR FINDER CONCEPT</small></div></div>
                <span className="demo-badge">DEMO</span>
              </div>
              <div className="finder-content">
                <h3>Find a sample donor</h3>
                <p>Try the filters with fictional profiles.</p>
                <label className="field-label" htmlFor="blood-group">Blood group</label>
                <select id="blood-group" value={bloodGroup} onChange={(event) => { setBloodGroup(event.target.value); setShowResults(false); }}>
                  <option>All groups</option>
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option>
                  <option>O+</option><option>O-</option>
                </select>
                <label className="field-label" htmlFor="city-search">City</label>
                <input id="city-search" type="text" placeholder="Try Ludhiana, Chandigarh..." value={city} onChange={(event) => { setCity(event.target.value); setShowResults(false); }} />
                <button className="button button-primary finder-button" type="button" onClick={() => setShowResults(true)}>
                  Search sample profiles <span>⌕</span>
                </button>
                {showResults && (
                  <div className="finder-results" aria-live="polite">
                    <div className="results-heading">{filteredDonors.length} sample {filteredDonors.length === 1 ? "profile" : "profiles"} found</div>
                    {filteredDonors.length ? filteredDonors.map((donor) => (
                      <div className="donor-row" key={donor.name}>
                        <span className="donor-group">{donor.group}</span>
                        <div><strong>{donor.name}</strong><small>{donor.city} · {donor.distance} (illustrative)</small></div>
                        <span className="sample-label">SAMPLE</span>
                      </div>
                    )) : <p className="no-results">No sample profiles match these filters. Try another city or blood group.</p>}
                    <p className="results-disclaimer">Fictional records. Distances and locations are illustrative.</p>
                  </div>
                )}
                <div className="finder-footnote"><span>ⓘ</span> For demonstration only. No contact or emergency request is sent.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell section-block" id="services">
          <div className="section-heading">
            <div>
              <p className="eyebrow">HOW I CAN HELP</p>
              <h2>Good ideas deserve <span className="gradient-text">good builds.</span></h2>
            </div>
            <p className="section-intro">
              Clear communication, considered details and a practical approach
              from the first conversation to the final handoff.
            </p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-top"><span className="service-icon">{service.icon}</span><span>{service.number}</span></div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#contact" aria-label={`Ask about ${service.title}`}>Discuss a project <span>↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-shell about-layout">
            <div className="about-stamp">
              <div className="about-monogram">h<span>.</span></div>
              <span>CURIOUS BY NATURE<br />BUILDER BY CHOICE</span>
              <div className="about-orbit" />
            </div>
            <div className="about-copy">
              <p className="eyebrow">A LITTLE ABOUT ME</p>
              <h2>Making the web feel a little more <span className="gradient-text">human.</span></h2>
              <p>
                I'm a developer who enjoys turning ideas into useful digital
                experiences. I care about clear interfaces, thoughtful details
                and building things that are easy for people to understand.
              </p>
              <p>
                This portfolio is where I share experiments, demonstrate my
                approach and collaborate on new website and web app ideas.
              </p>
              <div className="skill-list">
                <span>React</span><span>TypeScript</span><span>Responsive UI</span><span>Web Design</span><span>Problem Solving</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell contact-section" id="contact">
          <div className="contact-panel">
            <div className="contact-copy">
              <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
              <h2>Let's make something <span className="gradient-text">useful.</span></h2>
              <p>Have a website idea, need a web interface or want to discuss a project? Share a few details to get the conversation started.</p>
              <div className="contact-decoration">LET'S BUILD<br /><span>WHAT'S NEXT ↗</span></div>
            </div>
                        <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="contact-honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input id="contact-website" name="companyWebsite" tabIndex={-1} autoComplete="off" />
              </div>

              <label htmlFor="contact-type">Type of inquiry</label>
              <select id="contact-type" name="inquiryType" defaultValue="" required>
                <option value="" disabled>Select an inquiry type</option>
                <option value="NGO">NGO / Non-profit</option>
                <option value="Hospital">Hospital / Healthcare organisation</option>
                <option value="Business">Business / Company</option>
                <option value="Individual">Personal project</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="contact-organization">Organisation name (optional)</label>
              <input id="contact-organization" name="organization" autoComplete="organization" maxLength={120} placeholder="Your NGO, hospital or company" />

              <label htmlFor="contact-name">Your name</label>
              <input id="contact-name" name="name" autoComplete="name" maxLength={100} placeholder="How should I call you?" required />

              <label htmlFor="contact-email">Work or contact email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required />

              <label htmlFor="contact-project">How can I help?</label>
              <textarea id="contact-project" name="project" placeholder="Tell me about your website, web app or project requirements..." rows={5} minLength={20} maxLength={2000} required />

              <button className="button button-primary contact-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending inquiry..." : "Send inquiry"} <span>↗</span>
              </button>
              {formStatus && <p className="form-status" role="status" aria-live="polite">{formStatus}</p>}
              <p className="form-note">Submissions require the configured contact API. Please do not include passwords, payment details or sensitive personal information.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <a className="brand footer-brand" href="#home"><span className="brand-mark">h.</span><span>harmandeep<span className="brand-dot">.</span></span></a>
          <p>Designed with intent. Built with care.</p>
          <a href="#home" className="back-top">Back to top ↑</a>
        </div>
        <div className="footer-bottom"><span>© {CURRENT_YEAR} Harmandeep Singh</span><span>INDEPENDENT DEVELOPER PORTFOLIO</span></div>
      </footer>
    </>
  );
}

export default App;
