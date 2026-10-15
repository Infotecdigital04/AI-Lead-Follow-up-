import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Home,
  Layers3,
  Menu,
  Pause,
  Play,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Language } from "./ui";
import { createHomeMotion } from "./home-motion";
import { ProductStory, HomePricing } from "./home-sections";
import { HomeExtras, ClosingFooter, WalkthroughDialog } from "./home-finale";
import "./studio-home.css";

const industries = [
  {
    name: "Automotive",
    image: "/industry-automotive.webp",
    alt: "Illustrative vehicle detailing workshop",
    text: "Keep enquiries and service progress together.",
    route: "/demo/jobs",
  },
  {
    name: "Beauty & wellness",
    image: "/industry-salon.webp",
    alt: "Illustrative salon appointment space",
    text: "Organise enquiries and upcoming appointments.",
    route: "/demo/appointments",
  },
  {
    name: "Creative studios",
    image: "/workspace-complete.jpg",
    alt: "Relaynest sample project workspace",
    text: "Keep briefs, tasks and client conversations connected.",
    route: "/demo/tasks",
    product: true,
  },
  {
    name: "Professional services",
    image: "/portal-complete.jpg",
    alt: "Relaynest sample client portal",
    text: "Share a clear view of every client's next step.",
    route: "/portal/demo",
    product: true,
  },
];
const focusItems = [
  {
    icon: UserRound,
    title: "Follow up with Olivia",
    detail: "Consultation enquiry",
    route: "/demo/leads",
  },
  {
    icon: Wrench,
    title: "Review service progress",
    detail: "Client project / In progress",
    route: "/demo/jobs",
  },
  {
    icon: CalendarDays,
    title: "Confirm an appointment",
    detail: "James Carter / Tomorrow, 10:00",
    route: "/demo/appointments",
  },
];

function Wordmark() {
  return (
    <Link to="/" className="rn-wordmark" aria-label="Relaynest home">
      Relaynest<span>.</span>
    </Link>
  );
}
function FocusPreview() {
  return (
    <div className="rn-focus-preview" aria-label="Sample Relaynest workspace">
      <aside className="rn-preview-rail">
        <Link
          to="/demo/overview"
          className="rn-preview-brand"
          aria-label="Open Relaynest demo"
        >
          R<span>.</span>
        </Link>
        <nav aria-label="Sample workspace">
          {[
            [Home, "Today", "/demo/overview"],
            [Users, "Leads", "/demo/leads"],
            [UserRound, "Clients", "/demo/customers"],
            [Layers3, "Services", "/demo/jobs"],
          ].map(([Icon, label, route], index) => (
            <Link
              key={label}
              to={route}
              className={index === 0 ? "selected" : ""}
              title={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <Link
          className="rn-preview-settings"
          to="/demo/settings"
          title="Settings"
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </aside>
      <div className="rn-preview-main">
        <div className="rn-preview-top">
          <span>Sample workspace</span>
          <Link
            className="rn-preview-search"
            to="/demo/leads"
            aria-label="Search sample leads"
            title="Search sample leads"
          >
            <Search size={18} />
          </Link>
          <span
            className="rn-preview-avatar"
            aria-label="Sample user Alex Carter"
          >
            AC
          </span>
        </div>
        <h2>Today's focus</h2>
        <div className="rn-preview-tasks">
          {focusItems.map(({ icon: Icon, title, detail, route }) => (
            <Link to={route} className="rn-preview-task" key={title}>
              <span className="rn-preview-task-icon">
                <Icon size={23} />
              </span>
              <div>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
              <ChevronRight size={18} />
            </Link>
          ))}
        </div>
        <Link className="rn-preview-open" to="/demo/overview">
          Open the workspace <ArrowRight size={16} />
        </Link>
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
    [walkthrough, setWalkthrough] = useState(false);
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
    root.current?.dispatchEvent(new Event("relaynest:industry-change"));
  }, [industry]);
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
    <div className="rn-home rn-refined" ref={root}>
      <a className="rn-skip" href="#main">
        Skip to content
      </a>
      <header className="rn-header">
        <div className="rn-nav">
          <Wordmark />
          <nav className="rn-nav-links" aria-label="Main navigation">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="rn-nav-actions">
            <Link className="rn-login" to="/login">
              Log in
            </Link>
            <Link className="rn-pill rn-small" to="/demo/overview">
              Explore demo <ArrowRight size={16} />
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
            <a href="#pricing" onClick={() => setMenu(false)}>
              Pricing
            </a>
            <Link to="/login">Log in</Link>
            <Language />
          </nav>
        )}
      </header>
      <main id="main">
        <section className="rn-lead-hero" aria-labelledby="rn-headline">
          <div className="rn-hero-layout rn-content-width">
            <div className="rn-lead-copy">
              <p className="rn-eyebrow">CLIENT WORK, CONNECTED.</p>
              <h1 id="rn-headline">
                <span className="rn-title-line">Keep every lead</span>{" "}
                <span className="rn-title-line rn-title-accent">
                  moving forward.
                </span>
              </h1>
              <p className="rn-lead-description">
                Manage leads, prepare follow-ups and track client work in one
                connected workspace.
              </p>
              <div className="rn-lead-actions">
                <Link className="rn-pill" to="/demo/overview">
                  Explore the demo <ArrowRight size={18} />
                </Link>
                <a className="rn-outline-button" href="#pricing">
                  Compare plans
                </a>
              </div>
              <p className="rn-lead-note">No signup. No card.</p>
              <ul className="rn-lead-features" aria-label="Workspace features">
                <li>Lead management</li>
                <li>Follow-up reminders</li>
                <li>Client portal</li>
              </ul>
            </div>
            <div className="rn-lead-visual">
              <img
                className="rn-lead-sculpture"
                src="/ribbon-sculpture.webp"
                alt=""
                width="1536"
                height="1024"
                fetchPriority="high"
              />
              <div className="rn-product-tilt">
                <FocusPreview />
              </div>
              <div className="rn-lead-draft">
                <div>
                  <Sparkles size={18} />
                  <strong>AI-assisted draft</strong>
                  <span>Sample</span>
                </div>
                <p>Hi Olivia, shall we confirm a time for your consultation?</p>
              </div>
              <button
                className="rn-motion-toggle"
                onClick={() => setPaused(!paused)}
                aria-pressed={paused}
                aria-label={
                  paused
                    ? "Resume ambient animation"
                    : "Pause ambient animation"
                }
                title={
                  paused
                    ? "Resume ambient animation"
                    : "Pause ambient animation"
                }
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
            </div>
          </div>
        </section>
        <ProductStory onWalkthrough={() => setWalkthrough(true)} />
        <section
          className="rn-solutions"
          id="solutions"
          aria-labelledby="rn-solutions-title"
        >
          <span id="industries" className="rn-anchor-alias" />
          <div className="rn-solutions-head">
            <div>
              <p className="rn-eyebrow">BUILT AROUND YOUR BUSINESS</p>
              <h2 id="rn-solutions-title">
                Your craft.
                <br />
                <span>Your way of working.</span>
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
        <HomePricing />
        <HomeExtras />
      </main>
      <ClosingFooter />
      {walkthrough && (
        <WalkthroughDialog onClose={() => setWalkthrough(false)} />
      )}
    </div>
  );
}
