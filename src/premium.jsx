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
  MessageSquare,
  CalendarCheck2,
  ShieldCheck,
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
      <section className="signature-hero" aria-labelledby="premium-title">
        <div className="signature-copy">
          <span className="signature-kicker">
            LEAD FOLLOW-UP. CLIENT EXPERIENCE. CONNECTED.
          </span>
          <h1 id="premium-title">
            Relaynest<span>.</span>
          </h1>
          <h2>Make every client feel like your only client.</h2>
          <p>
            Bring your leads, follow-ups and client updates into one beautifully
            clear workspace.
          </p>
          <div className="signature-actions">
            <Link to="/demo/overview" className="button primary">
              Explore Relaynest <ArrowUpRight size={18} />
            </Link>
            <a href="#product" className="signature-tour">
              Discover the product <ArrowDown size={17} />
            </a>
          </div>
          <p className="signature-reassurance">
            <Check size={14} /> Free demo. No signup. No card.
          </p>
        </div>
        <div className="signature-stage">
          <div className="signature-stage-label">
            <span>
              <span className="signature-status" /> YOUR NEXT MOVE, IN FOCUS
            </span>
            <Link to="/demo/overview">
              Enter the workspace <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link
            to="/demo/overview"
            className="signature-product"
            aria-label="Explore the Relaynest demo workspace"
          >
            <picture>
              <source
                media="(max-width: 600px)"
                srcSet="/workspace-mobile.jpg"
              />
              <img
                src="/workspace-focus.jpg"
                width="1147"
                height="454"
                fetchPriority="high"
                alt="Relaynest demo: today's follow-ups, tasks and service progress in one workspace"
              />
            </picture>
          </Link>
        </div>
        <div className="signature-bottom">
          <span>THE DETAILS MAKE THE DIFFERENCE.</span>
          <MotionControl />
        </div>
      </section>
      <div className="audience-ribbon">
        <span>
          <MessageSquare size={18} /> A thoughtful first reply
        </span>
        <span>
          <CalendarCheck2 size={18} /> A clear next step
        </span>
        <span>
          <ShieldCheck size={18} /> A more personal experience
        </span>
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

