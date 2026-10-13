import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Layers3,
  Mail,
  Pause,
  Play,
  Plus,
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

export function WalkthroughDialog({ onClose }) {
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
            { y: 10 },
            { y: 0, duration: 0.4 },
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

export function HomeExtras() {
  return (
    <section className="rn-faq-section" id="faq" aria-labelledby="rn-faq-title">
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
