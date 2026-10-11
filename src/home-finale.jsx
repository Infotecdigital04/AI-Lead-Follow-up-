import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Home,
  Layers3,
  Mail,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Users,
  X,
} from "lucide-react";
import "./home-finale.css";

const chapters = [
  {
    title: "Organise your leads",
    heading: "Every conversation, in view.",
    text: "Keep the enquiry, contact details and next step together.",
    route: "/demo/leads",
    rows: [
      ["Olivia Rhye", "New enquiry", "Consultation request"],
      ["Alex Morgan", "Contacted", "Project estimate"],
      ["Jamie Park", "Follow-up due", "Appointment enquiry"],
    ],
  },
  {
    title: "Prepare your follow-up",
    heading: "A more personal next hello.",
    text: "Review a draft, make it your own, and keep the conversation going.",
    route: "/demo/tasks",
  },
  {
    title: "Track the client journey",
    heading: "Keep your clients in the loop.",
    text: "Share a clear view of the work, from first enquiry to final handover.",
    route: "/portal/demo",
  },
];
const faqs = [
  [
    "Can I try Relaynest before creating an account?",
    <>
      Yes. The <Link to="/demo/overview">live demo</Link> uses sample data. No
      signup or card is required, and demo changes stay in your browser.
    </>,
  ],
  [
    "Will this work for my kind of business?",
    <>
      Relaynest brings leads, follow-ups, appointments and service progress
      together. Explore the <a href="#solutions">business examples</a> and try
      your everyday workflow in the demo before choosing a plan.
    </>,
  ],
  [
    "Can I use it on my phone?",
    <>
      Yes. The workspace adapts to phones, tablets and desktops, so you can
      check a client, a task or a service while away from your desk.
    </>,
  ],
  [
    "What is included in each plan?",
    <>
      Starter covers core lead and customer management, reminders, service
      tracking and the client portal. Growth adds AI-assisted drafts,
      appointments, tasks and invoice tracking. Pro offers higher capacity by
      arrangement and additional support.{" "}
      <a href="#pricing">Compare the proposed plans.</a>
    </>,
  ],
  [
    "When will paid subscriptions be available?",
    <>
      Paid subscriptions will open after payment-provider approval. There is no
      confirmed launch date yet. You can explore the free demo now without
      entering card details.
    </>,
  ],
  [
    "How will billing and cancellation work?",
    <>
      When subscriptions open, checkout will confirm the currency, taxes,
      billing interval and final total before payment. Cancellation and refund
      terms will be finalised before sales open; the current{" "}
      <Link to="/refunds">policy page</Link> is a pre-launch draft.
    </>,
  ],
];

function TourContent({ step }) {
  return (
    <div className="rn-tour-content" key={step}>
      <div className="rn-tour-scene-title">
        <span className="rn-avatar">OR</span>
        <div>
          <h3>{chapters[step].heading}</h3>
          <p>{chapters[step].text}</p>
        </div>
      </div>
      {step === 0 && (
        <div className="rn-tour-leads">
          {chapters[0].rows.map(([name, status, detail]) => (
            <div key={name}>
              <span className="rn-avatar">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <strong>{name}</strong>
                <small>{detail}</small>
              </div>
              <span>{status}</span>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="rn-tour-message">
          <div>
            <Mail size={18} />
            <strong>Follow-up draft</strong>
            <span>To: Olivia</span>
          </div>
          <p>
            Hi Olivia,
            <br />
            <br />
            Thanks for your enquiry. I'd love to welcome you in next week. Here
            are a few available times for a consultation.
            <br />
            <br />
            Which would work best for you?
          </p>
          <span className="rn-tour-review">
            <Check size={14} />
            Review before sending
          </span>
        </div>
      )}
      {step === 2 && (
        <div className="rn-tour-journey">
          <div>
            <Layers3 size={24} />
            <strong>Your service update</strong>
            <span>In progress</span>
          </div>
          <ol>
            {[
              "Enquiry received",
              "Appointment scheduled",
              "Service in progress",
              "Ready for handover",
            ].map((label, i) => (
              <li key={label} className={i < 3 ? "done" : ""}>
                <span>
                  {i < 2 ? <Check size={13} /> : i === 2 ? <span /> : null}
                </span>
                <div>
                  <strong>{label}</strong>
                  <small>
                    {
                      [
                        "Details captured",
                        "The next step is confirmed",
                        "Your team is working on it",
                        "Your next milestone",
                      ][i]
                    }
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function WalkthroughDialog({ onClose }) {
  const dialog = useRef(null),
    progress = useRef(null);
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(
      () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const el = dialog.current,
      previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.showModal();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", change);
    const visibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      el.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    let active = true,
      timeline;
    import("gsap")
      .then(({ gsap }) => {
        if (!active) return;
        timeline = gsap.timeline({
          onComplete: () => {
            if (step < 2) setStep(step + 1);
            else setPlaying(false);
          },
        });
        timeline.fromTo(
          progress.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 6, ease: "none" },
          0,
        );
        if (!reduced)
          timeline.fromTo(
            dialog.current.querySelector(".rn-tour-content"),
            { y: 10, opacity: 0.4 },
            { y: 0, opacity: 1, duration: 0.4 },
            0,
          );
      })
      .catch(() => {
        if (active) setPlaying(false);
      });
    return () => {
      active = false;
      timeline?.kill();
    };
  }, [playing, step, reduced]);
  const select = (index) => {
    setPlaying(false);
    setStep(index);
  };
  return (
    <dialog
      ref={dialog}
      className="rn-tour-dialog"
      aria-labelledby="rn-tour-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="rn-tour-header">
        <div>
          <p>INTERACTIVE WALKTHROUGH / SAMPLE DATA</p>
          <h2 id="rn-tour-title">{chapters[step].title}</h2>
        </div>
        <button
          autoFocus
          className="rn-tour-icon"
          aria-label="Close walkthrough"
          title="Close walkthrough"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <div className="rn-tour-progress" aria-hidden="true">
        <span ref={progress} />
      </div>
      <TourContent step={step} />
      <nav className="rn-tour-chapters" aria-label="Walkthrough chapters">
        {chapters.map((item, i) => (
          <button
            key={item.title}
            aria-pressed={step === i}
            onClick={() => select(i)}
          >
            <span>0{i + 1}</span>
            {item.title}
          </button>
        ))}
      </nav>
      <div className="rn-tour-controls">
        <div>
          <button
            className="rn-tour-icon"
            aria-label="Previous chapter"
            title="Previous chapter"
            disabled={step === 0}
            onClick={() => select(step - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="rn-tour-icon"
            aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
            title={playing ? "Pause walkthrough" : "Play walkthrough"}
            onClick={() => {
              if (!playing && step === 2) setStep(0);
              setPlaying(!playing);
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            className="rn-tour-icon"
            aria-label="Next chapter"
            title="Next chapter"
            disabled={step === 2}
            onClick={() => select(step + 1)}
          >
            <ArrowRight size={18} />
          </button>
          <span>{step + 1} / 3</span>
        </div>
        <Link className="rn-pill" to={chapters[step].route}>
          Try this in the demo <ArrowRight size={15} />
        </Link>
      </div>
    </dialog>
  );
}

function WalkthroughPreview() {
  return (
    <div className="rn-walk-device" aria-hidden="true">
      <aside>
        <strong>
          <span />
          Relaynest
        </strong>
        {[
          [Home, "Today"],
          [Users, "Leads"],
          [Users, "Clients"],
          [Layers3, "Services"],
          [CalendarDays, "Calendar"],
        ].map(([Icon, label], i) => (
          <div key={label} className={i === 0 ? "selected" : ""}>
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </aside>
      <div className="rn-walk-main">
        <div className="rn-walk-topline">
          <span>SAMPLE WORKSPACE</span>
          <small>Thursday, 12 March</small>
        </div>
        <h3>Today's focus</h3>
        <div className="rn-walk-grid">
          <div className="rn-walk-tasks">
            {[
              [
                Check,
                "Follow up with Olivia",
                "New enquiry / Sent 2 days ago",
                "9:00 am",
              ],
              [
                MessageCircle,
                "Review service progress",
                "3 active clients",
                "11:00 am",
              ],
              [
                CalendarDays,
                "Confirm tomorrow's appointment",
                "Consultation with James",
                "4:00 pm",
              ],
            ].map(([Icon, title, text, time], i) => (
              <div key={title}>
                <span className={"rn-walk-icon rn-walk-icon-" + i}>
                  <Icon size={20} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
                <time>{time}</time>
                <ChevronRight size={15} />
              </div>
            ))}
          </div>
          <div className="rn-walk-calendar">
            <strong>March 2026</strong>
            <div>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <b key={i}>{d}</b>
              ))}
              {Array.from({ length: 42 }, (_, i) => (
                <span className={i === 17 ? "today" : ""} key={i}>
                  {i < 6 || i > 36 ? "" : i - 5}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeExtras() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section
        className="rn-walkthrough"
        id="walkthrough"
        aria-labelledby="rn-walkthrough-title"
      >
        <div className="rn-walk-heading rn-reveal">
          <p className="rn-eyebrow">SEE THE WORKSPACE IN ACTION</p>
          <h2 id="rn-walkthrough-title">
            See how your day
            <br />
            comes together.
          </h2>
          <p>
            Explore leads, follow-ups and service progress in one connected
            workspace.
          </p>
        </div>
        <div className="rn-walk-frame rn-reveal">
          <img
            className="rn-walk-backdrop"
            src="/walkthrough-desk.webp"
            alt=""
            width="1440"
            height="960"
            loading="lazy"
          />
          <WalkthroughPreview />
          <div className="rn-walk-draft" aria-hidden="true">
            <div>
              <span>
                <Mail size={16} />
              </span>
              <strong>Follow-up draft</strong>
              <small>To: Olivia</small>
            </div>
            <p>
              Hi Olivia,
              <br />
              Thanks for your enquiry. I'd love to welcome you in next week.
              Here are a few available times...
            </p>
          </div>
          <button
            className="rn-walk-play"
            aria-label="Play product walkthrough"
            title="Play product walkthrough"
            onClick={() => setOpen(true)}
          >
            <Play size={27} fill="currentColor" />
          </button>
        </div>
        <p className="rn-walk-caption">Product walkthrough preview</p>
        <ol className="rn-walk-steps">
          {chapters.map((item, i) => (
            <li key={item.title}>
              <span>0{i + 1}</span>
              {item.title}
            </li>
          ))}
        </ol>
        <div className="rn-walk-demo">
          <Link to="/demo/overview">
            Explore the live demo <ArrowRight size={17} />
          </Link>
          <p>No signup. No card.</p>
        </div>
      </section>
      <section
        className="rn-faq-section"
        id="faq"
        aria-labelledby="rn-faq-title"
      >
        <div className="rn-faq-intro rn-reveal">
          <p className="rn-eyebrow">BEFORE YOU CHOOSE</p>
          <h2 id="rn-faq-title">
            Good questions.
            <br />
            Clear answers.
          </h2>
          <p>Get to know Relaynest before your next step.</p>
          <a href="mailto:info@infotecdigital.com">
            Talk to us <ArrowRight size={16} />
          </a>
        </div>
        <div className="rn-faq-list rn-reveal">
          {faqs.map(([question, answer], i) => (
            <details key={question} open={i === 0}>
              <summary>
                {question}
                <Plus size={19} />
              </summary>
              <div>{answer}</div>
            </details>
          ))}
        </div>
      </section>
      {open && <WalkthroughDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function ClosingFooter() {
  return (
    <div className="rn-final-band">
      <section className="rn-final-cta" aria-labelledby="rn-final-title">
        <img
          className="rn-final-art"
          src="/closing-sculpture.webp"
          alt=""
          width="1440"
          height="960"
          loading="lazy"
        />
        <div className="rn-final-copy rn-reveal">
          <p className="rn-eyebrow">MAKE ROOM FOR WHAT'S NEXT</p>
          <h2 id="rn-final-title">
            Your next chapter.
            <br />
            <span>All together.</span>
          </h2>
          <p>Less chasing. More connection. Start with a look around.</p>
          <div className="rn-final-actions">
            <Link className="rn-pill" to="/demo/overview">
              Explore the free demo <ArrowRight size={17} />
            </Link>
            <a href="#pricing">
              Compare plans <ArrowRight size={16} />
            </a>
          </div>
          <p className="rn-final-note">
            No signup. No card.
            <small>
              Paid subscriptions open after payment-provider approval.
            </small>
          </p>
        </div>
      </section>
      <footer className="rn-footer rn-final-footer">
        <Link to="/" className="rn-wordmark" aria-label="Relaynest home">
          <span className="rn-footer-dot" />
          Relaynest
        </Link>
        <small>© {new Date().getFullYear()} Infotec Digital</small>
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refunds">Refunds</Link>
          <a href="mailto:info@infotecdigital.com">Contact</a>
        </nav>
      </footer>
    </div>
  );
}
