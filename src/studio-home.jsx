import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Layers3,
  Menu,
  MessageCircle,
  Pause,
  Play,
  Search,
  Settings,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { Language } from "./ui";
import { createHomeMotion } from "./home-motion";
import "./studio-home.css";

const industries = [
  {
    name: "Automotive",
    image: "/industry-automotive.webp",
    alt: "A freshly detailed black sports car in an automotive workshop",
    text: "From first inquiry to final handover, keep every detail connected.",
    route: "/demo/jobs",
  },
  {
    name: "Beauty & wellness",
    image: "/industry-salon.webp",
    alt: "An appointment-ready boutique beauty salon",
    text: "Turn more inquiries into appointments and lasting client relationships.",
    route: "/demo/appointments",
  },
  {
    name: "Creative studios",
    image: "/workspace-complete.jpg",
    alt: "Relaynest project tasks and client follow-ups",
    text: "Bring briefs, client conversations and the next creative milestone together.",
    route: "/demo/tasks",
    product: true,
  },
  {
    name: "Professional services",
    image: "/portal-complete.jpg",
    alt: "Relaynest client portal showing shared service progress",
    text: "A considered experience for every proposal, project and client.",
    route: "/portal/demo",
    product: true,
  },
];
const focusItems = [
  {
    icon: MessageCircle,
    title: "Follow up with Olivia",
    detail: "New lead / Consultation request",
    time: "10:00 AM",
    status: "Ready to follow up",
    route: "/demo/leads",
  },
  {
    icon: Wrench,
    title: "Review service progress",
    detail: "Alex Morgan / Project update",
    time: "1:00 PM",
    status: "In progress",
    route: "/demo/jobs",
  },
  {
    icon: CalendarDays,
    title: "Confirm tomorrow's appointment",
    detail: "Jamie Park / Initial consultation",
    time: "4:00 PM",
    status: "Needs confirmation",
    route: "/demo/appointments",
  },
];
const productViews = [
  {
    name: "Daily focus",
    title: "Follow up with Olivia",
    subtitle: "New lead / Consultation request",
    label: "Your next conversation",
    message:
      "Hi Olivia, thanks again for your interest. I've put together a few options based on what you're looking for. Let me know if you'd like to talk through the details.",
    action: "Explore follow-ups",
    route: "/demo/leads",
  },
  {
    name: "Service tracking",
    title: "Every detail, in view.",
    subtitle: "From booked to beautifully delivered",
    label: "Service in progress",
    message:
      "Keep job details, due dates and client updates together. A shared view of the work makes the next step clear for everyone.",
    action: "Explore service jobs",
    route: "/demo/jobs",
  },
  {
    name: "Client portal",
    title: "A space of their own.",
    subtitle: "Your client experience, connected",
    label: "A shared view of progress",
    message:
      "Give every client a calm, clear place to follow their service, check the latest update and know what comes next.",
    action: "Open the client portal",
    route: "/portal/demo",
  },
];
function Wordmark() {
  return (
    <Link to="/" className="rn-wordmark" aria-label="Relaynest home">
      Relaynest<span>.</span>
    </Link>
  );
}
function SampleDashboard() {
  return (
    <div className="rn-device" aria-label="Sample Relaynest workspace">
      <div className="rn-device-inner">
        <aside className="rn-device-sidebar">
          <span className="rn-device-brand">
            Relaynest<span>.</span>
          </span>
          <nav aria-label="Sample workspace">
            {[
              [CalendarDays, "Today", "/demo/overview"],
              [Users, "Leads", "/demo/leads"],
              [Users, "Clients", "/demo/customers"],
              [Layers3, "Services", "/demo/jobs"],
              [CalendarDays, "Calendar", "/demo/appointments"],
            ].map(([Icon, name, route], i) => (
              <Link className={i === 0 ? "selected" : ""} to={route} key={name}>
                <Icon size={15} />
                <span>{name}</span>
              </Link>
            ))}
          </nav>
          <div className="rn-device-bottom">
            <Link to="/demo/tasks">
              <MessageCircle size={14} />
              Follow-ups
            </Link>
            <Link to="/demo/settings">
              <Settings size={14} />
              Settings
            </Link>
          </div>
        </aside>
        <div className="rn-device-main">
          <div className="rn-device-top">
            <span>SAMPLE WORKSPACE</span>
            <div>
              <Search size={15} />
              <Bell size={15} />
              <span className="rn-avatar">AC</span>
              <span className="rn-owner">
                Alex Carter<small>Studio owner</small>
              </span>
            </div>
          </div>
          <h2>Good morning, Alex.</h2>
          <p>A clear view of what comes next.</p>
          <div className="rn-device-grid">
            <div className="rn-focus-list">
              <div className="rn-focus-heading">
                <h3>Today's focus</h3>
                <span>Tuesday, 22 April</span>
              </div>
              {focusItems.map(({ icon: Icon, ...item }, i) => (
                <Link
                  to={item.route}
                  className="rn-focus-item"
                  key={item.title}
                >
                  <span className={"rn-task-icon rn-task-" + i}>
                    <Icon size={22} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <div className="rn-task-meta">
                    <time>{item.time}</time>
                    <span className={"rn-status rn-status-" + i}>
                      {item.status}
                    </span>
                  </div>
                  <ChevronRight size={15} />
                </Link>
              ))}
              <Link to="/demo/overview" className="rn-all-tasks">
                View your workspace <ArrowRight size={13} />
              </Link>
            </div>
            <div className="rn-device-rail">
              <div className="rn-calendar">
                <div>
                  <strong>April 2025</strong>
                  <CalendarDays size={14} />
                </div>
                <div className="rn-calendar-days">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <b key={i}>{d}</b>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => (
                    <span key={i} className={i === 23 ? "today" : ""}>
                      {i < 2 || i > 31 ? "" : i - 1}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/demo/jobs" className="rn-service-mini">
                <Wrench size={24} />
                <div>
                  <strong>Service in progress</strong>
                  <small>Project delivery</small>
                  <span className="rn-status">In progress</span>
                </div>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function StudioHome() {
  const root = useRef(null),
    motion = useRef(null),
    pausedRef = useRef(false);
  const [menu, setMenu] = useState(false),
    [paused, setPaused] = useState(false),
    [industry, setIndustry] = useState(0),
    [view, setView] = useState(0);
  const current = productViews[view];
  const shownIndustries = [
    industries[industry],
    industries[(industry + 1) % industries.length],
  ];
  useEffect(() => {
    let active = true;
    createHomeMotion(root.current, () => active)
      .then((controller) => {
        if (active) {
          motion.current = controller;
          controller.pause(pausedRef.current);
        } else controller.dispose();
      })
      .catch(() => {});
    return () => {
      active = false;
      motion.current?.dispose();
      motion.current = null;
    };
  }, []);
  useEffect(() => {
    pausedRef.current = paused;
    motion.current?.pause(paused);
  }, [paused]);
  useEffect(() => {
    if (!menu) return;
    const close = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        root.current?.querySelector(".rn-menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  return (
    <div className="rn-home" ref={root}>
      <a className="rn-skip" href="#main">
        Skip to content
      </a>
      <header className="rn-header">
        <div className="rn-nav">
          <Wordmark />
          <nav className="rn-nav-links" aria-label="Main navigation">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <Link to="/pricing">Pricing</Link>
          </nav>
          <div className="rn-nav-actions">
            <Link className="rn-login" to="/login">
              Log in
            </Link>
            <Link className="rn-pill rn-small" to="/demo/overview">
              Explore demo <ArrowRight size={15} />
            </Link>
            <button
              className="rn-menu-toggle"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="rn-mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {menu && (
          <nav
            id="rn-mobile-navigation"
            className="rn-mobile-nav"
            aria-label="Mobile navigation"
          >
            <a href="#product" onClick={() => setMenu(false)}>
              Product
            </a>
            <a href="#solutions" onClick={() => setMenu(false)}>
              Solutions
            </a>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login">Log in</Link>
            <Language />
          </nav>
        )}
      </header>
      <main id="main">
        <section className="rn-hero" aria-labelledby="rn-headline">
          <div className="rn-hero-copy">
            <p className="rn-eyebrow">YOUR WORK. BEAUTIFULLY CONNECTED.</p>
            <h1 className="rn-sr-only">
              Relaynest: AI lead follow-up and client portal
            </h1>
            <h2 id="rn-headline">
              Less chasing.
              <br />
              <span>More connection.</span>
            </h2>
            <p className="rn-hero-description">
              Your leads, your work, your clients. One beautifully connected
              workspace.
            </p>
            <div className="rn-hero-actions">
              <Link className="rn-pill" to="/demo/overview">
                Explore the workspace <ArrowRight size={17} />
              </Link>
              <a className="rn-text-link" href="#product">
                See it in action
              </a>
            </div>
            <p className="rn-reassurance">
              No signup. No card. Just a look around.
            </p>
          </div>
          <div className="rn-hero-scene">
            <div className="rn-ribbon-motion">
              <img
                className="rn-ribbon"
                src="/ribbon-sculpture.webp"
                alt=""
                width="1536"
                height="1024"
                fetchPriority="high"
              />
            </div>
            <div className="rn-tablet-wrap">
              <SampleDashboard />
            </div>
            <Link className="rn-floating-followup" to="/demo/leads">
              <small>Next follow-up</small>
              <div>
                <span className="rn-avatar">OR</span>
                <span>
                  <strong>Olivia Rhye</strong>
                  <small>Ready when you are.</small>
                </span>
                <span className="rn-circle-arrow">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
          <button
            className="rn-motion-toggle"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={
              paused ? "Resume ambient animation" : "Pause ambient animation"
            }
            title={
              paused ? "Resume ambient animation" : "Pause ambient animation"
            }
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </section>
        <section
          className="rn-product"
          id="product"
          aria-labelledby="rn-product-title"
        >
          <div className="rn-section-heading rn-reveal">
            <div>
              <p className="rn-eyebrow">01 / THE WORKSPACE</p>
              <h2 id="rn-product-title">
                A little less busy.
                <br />
                <span>A lot more clarity.</span>
              </h2>
            </div>
            <p>
              Make space for the work you love.
              <br />
              Bring the rest together in Relaynest.
            </p>
          </div>
          <div className="rn-dark-stage">
            <div className="rn-dark-console">
              <aside className="rn-dark-sidebar">
                {[
                  [Zap, "Follow-ups", 0],
                  [CalendarDays, "Appointments", 1],
                  [Wrench, "Service jobs", 1],
                  [Users, "Clients", 2],
                ].map(([Icon, name, index], i) =>
                  name === "Appointments" ? (
                    <Link
                      className="rn-dark-nav-link"
                      key={name}
                      to="/demo/appointments"
                    >
                      <Icon size={21} />
                      <span>{name}</span>
                    </Link>
                  ) : (
                    <button
                      className={
                        (i === 0 && view === 0) ||
                        (i === 2 && view === 1) ||
                        (i === 3 && view === 2)
                          ? "active"
                          : ""
                      }
                      key={name}
                      onClick={() => setView(index)}
                    >
                      <Icon size={21} />
                      <span>{name}</span>
                    </button>
                  ),
                )}
              </aside>
              <div className="rn-dark-content">
                <div className="rn-dark-client">
                  <span className="rn-avatar rn-avatar-large">OR</span>
                  <div>
                    <h3>{current.title}</h3>
                    <p>{current.subtitle}</p>
                  </div>
                  <span className="rn-dark-status">
                    <span />
                    Sample workspace
                  </span>
                </div>
                <div
                  className="rn-product-tabs"
                  role="group"
                  aria-label="Workspace preview"
                >
                  {productViews.map((item, index) => (
                    <button
                      key={item.name}
                      aria-pressed={view === index}
                      onClick={() => setView(index)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <div className="rn-message-preview" key={view}>
                  <div>
                    <Sparkles size={18} />
                    <span>{current.label}</span>
                  </div>
                  <p>{current.message}</p>
                  <Link to={current.route}>
                    {current.action}
                    <ArrowRight size={17} />
                  </Link>
                </div>
                <div className="rn-dark-bottom">
                  <span>
                    <Check size={14} />
                    Every next step, connected.
                  </span>
                  <Link to="/demo/overview">
                    Explore the demo <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="rn-solutions"
          id="solutions"
          aria-labelledby="rn-solutions-title"
        >
          <div className="rn-solutions-head rn-reveal">
            <div>
              <p className="rn-eyebrow">02 / YOUR KIND OF BUSINESS</p>
              <h2 id="rn-solutions-title">
                Built around
                <br />
                your kind of work.
              </h2>
            </div>
            <div
              className="rn-industry-tabs"
              role="group"
              aria-label="Business type"
            >
              {industries.map((item, index) => (
                <button
                  key={item.name}
                  aria-pressed={industry === index}
                  onClick={() => setIndustry(index)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="rn-industry-grid">
            {shownIndustries.map((item) => (
              <Link
                key={item.name}
                className={
                  "rn-industry-card" +
                  (item.product ? " rn-industry-product" : "")
                }
                to={item.route}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  width="1000"
                  height="667"
                />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="rn-card-arrow">
                  <ArrowRight size={22} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="rn-footer">
        <Wordmark />
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refunds">Refunds</Link>
          <a href="mailto:info@infotecdigital.com">Contact</a>
        </nav>
        <Link className="rn-footer-invite" to="/demo/overview">
          Stay close. Go further.
          <span>
            <ArrowRight size={18} />
          </span>
        </Link>
      </footer>
    </div>
  );
}
