import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  Check,
  Play,
  Pause,
  LayoutDashboard,
  Layers3,
  PanelTop,
  ArrowUpRight,
} from "lucide-react";

export function MotionControl() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const sync = () =>
      setPaused(document.documentElement.dataset.motion === "off");
    sync();
    window.addEventListener("relaynest-motion-applied", sync);
    return () => window.removeEventListener("relaynest-motion-applied", sync);
  }, []);
  return (
    <button
      className="motion-control icon-button"
      aria-label={paused ? "Enable page motion" : "Pause page motion"}
      title={paused ? "Enable page motion" : "Pause page motion"}
      aria-pressed={paused}
      onClick={() => {
        const value = paused ? "on" : "off";
        try {
          localStorage.setItem("relaynest-motion", value);
        } catch {
          /* Optional preference storage. */
        }
        window.dispatchEvent(
          new CustomEvent("relaynest-motion", { detail: value }),
        );
      }}
    >
      {paused ? <Play size={17} /> : <Pause size={17} />}
    </button>
  );
}

export function PremiumHero() {
  return (
    <>
      <section className="premium-hero" aria-labelledby="premium-title">
        <picture className="hero-photograph">
          <source
            media="(max-width: 760px)"
            srcSet="/relaynest-studio-small.webp"
          />
          <img
            src="/relaynest-studio.webp"
            width="1536"
            height="1024"
            fetchPriority="high"
            alt="Relaynest's service workspace displayed on a graphite laptop in a bright studio"
          />
        </picture>
        <div className="premium-hero-copy">
          <span className="premium-eyebrow">
            <span /> FOR THE BUSINESS BEHIND GREAT SERVICE
          </span>
          <h1 id="premium-title">
            Relaynest<span>.</span>
          </h1>
          <h2>
            Exceptional service.
            <br className="mobile-break" /> Beautifully connected.
          </h2>
          <p>
            From the first inquiry to the final detail.
            <br />
            One place to give every client your best.
          </p>
          <div className="hero-actions">
            <Link to="/demo/overview" className="button primary">
              Explore Relaynest <ArrowUpRight size={18} />
            </Link>
            <a href="#product" className="hero-tour-link">
              See it in action <ArrowDown size={17} />
            </a>
          </div>
          <span className="hero-reassurance">
            <Check size={13} /> No signup or card needed for the demo
          </span>
        </div>
        <div className="hero-caption">
          <span>DESIGNED FOR THE FOLLOW-THROUGH</span>
          <a href="#product">
            Discover the workspace <ArrowDown size={14} />
          </a>
        </div>
        <MotionControl />
      </section>
      <div className="audience-ribbon">
        <span>One-person ambition.</span>
        <span>Growing teams.</span>
        <span>High-touch service.</span>
        <strong>
          One connected workspace.
          <ArrowRight size={16} />
        </strong>
      </div>
    </>
  );
}

const views = [
  {
    key: "focus",
    label: "Daily focus",
    Icon: LayoutDashboard,
    title: "Less noise. A clear next move.",
    text: "The follow-ups and tasks that need you, brought into one focused view.",
    image: "/workspace-preview.jpg",
    href: "/demo/overview",
    alt: "Actual Relaynest demo dashboard with a due-date priority list",
  },
  {
    key: "services",
    label: "Service flow",
    Icon: Layers3,
    title: "Every detail, moving forward.",
    text: "A shared view of every service, from booking through to completion.",
    image: "/product-services.jpg",
    href: "/demo/jobs",
    alt: "Actual Relaynest service board showing the stages of customer jobs",
  },
  {
    key: "portal",
    label: "Client experience",
    Icon: PanelTop,
    title: "Clarity your clients can feel.",
    text: "A considered home for approved updates, without exposing internal notes.",
    image: "/product-portal.jpg",
    href: "/portal/demo",
    alt: "Actual Relaynest client portal showing approved service updates",
  },
];

export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const view = views[active];
  return (
    <section className="product-showcase" id="product">
      <div className="showcase-inner">
        <div className="showcase-heading" data-reveal>
          <span className="premium-eyebrow">
            A LITTLE LESS BUSYWORK. A LOT MORE POSSIBILITY.
          </span>
          <h2>
            A higher standard
            <br />
            of follow-through.
          </h2>
          <p>Thoughtful for your clients. Effortless to come back to.</p>
        </div>
        <div
          className="showcase-tabs"
          role="tablist"
          aria-label="Explore Relaynest views"
        >
          {views.map(({ key, label, Icon }, index) => (
            <button
              key={key}
              id={`showcase-${key}`}
              role="tab"
              aria-selected={active === index}
              aria-controls="showcase-panel"
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(e) => {
                const next =
                  e.key === "ArrowRight"
                    ? (index + 1) % views.length
                    : e.key === "ArrowLeft"
                      ? (index + 2) % views.length
                      : e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 2
                          : null;
                if (next !== null) {
                  e.preventDefault();
                  setActive(next);
                  document
                    .getElementById(`showcase-${views[next].key}`)
                    ?.focus();
                }
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <div
          id="showcase-panel"
          className="showcase-panel"
          role="tabpanel"
          aria-labelledby={`showcase-${view.key}`}
          tabIndex={0}
        >
          <div className="showcase-description">
            <div>
              <h3>{view.title}</h3>
              <p>{view.text}</p>
            </div>
            <Link to={view.href}>
              Open live demo
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <Link
            className="showcase-image-link"
            to={view.href}
            aria-label={`Open ${view.label} demo`}
          >
            <div className="showcase-browser">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>relaynest / {view.key}</span>
              <span>Sample workspace</span>
            </div>
            <img
              key={view.image}
              src={view.image}
              width="1440"
              height="980"
              loading="lazy"
              decoding="async"
              alt={view.alt}
            />
          </Link>
        </div>
        <div className="showcase-bottom">
          <span>REAL WORKFLOWS. YOUR NEXT CHAPTER.</span>
          <Link to="/pricing">
            Explore the plans <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

