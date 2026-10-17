import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const steps = [
  {
    label: "The inquiry",
    title: "One lead. One clear next step.",
    body: "Keep the request, contact details and follow-up date together. Open the record when it is time to get back in touch.",
    href: "/demo/leads",
    link: "Explore the lead workspace",
  },
  {
    label: "The follow-up",
    title: "Your words. With a head start.",
    body: "Start with a draft, make it your own, and approve it before sending. Your customer relationships stay in your hands.",
    href: "/demo/overview",
    link: "Try a follow-up draft",
  },
  {
    label: "The handover",
    title: "A client who knows what is next.",
    body: "Give clients a private view of their service progress. Share the updates they need, while keeping internal notes with your team.",
    href: "/portal/demo",
    link: "Open the client portal",
  },
];

export function Journey() {
  const [step, setStep] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState(
    "Hi Olivia, thanks for asking about an annual vehicle service. Would you like us to find a convenient time to take a closer look?",
  );
  const current = steps[step];
  function keyboard(event, index) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % 3
        : event.key === "ArrowLeft"
          ? (index + 2) % 3
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : null;
    if (next !== null) {
      event.preventDefault();
      setStep(next);
      document.getElementById(`journey-tab-${next}`)?.focus();
    }
  }
  return (
    <section className="journey-section section-wrap" id="journey" data-reveal>
      <div className="journey-heading">
        <span className="eyebrow">FROM FIRST HELLO TO HAPPY CLIENT</span>
        <h2>
          A better follow-through.
          <br />
          At every step.
        </h2>
        <p>One connected journey for you and the people you serve.</p>
      </div>
      <div
        className="journey-tabs"
        role="tablist"
        aria-label="Customer journey"
      >
        {steps.map((item, index) => (
          <button
            key={item.label}
            id={`journey-tab-${index}`}
            role="tab"
            aria-selected={step === index}
            aria-controls="journey-panel"
            tabIndex={step === index ? 0 : -1}
            onKeyDown={(e) => keyboard(e, index)}
            onClick={() => setStep(index)}
          >
            <span>0{index + 1}</span>
            {item.label}
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
      <div
        className="journey-content"
        role="tabpanel"
        id="journey-panel"
        aria-labelledby={`journey-tab-${step}`}
        tabIndex={0}
      >
        <div className="journey-story" key={step}>
          <h3>{current.title}</h3>
          <p>{current.body}</p>
          <Link className="text-button" to={current.href}>
            {current.link}
            <ArrowRight size={16} />
          </Link>
          <span className="journey-footnote">
            <ShieldCheck size={15} /> Sample scenario. No messages are sent.
          </span>
        </div>
        <div className="journey-example">
          <div className="example-heading">
            <span>
              <Wrench size={17} /> Northside Auto
            </span>
            <small>EXAMPLE</small>
          </div>
          {step === 0 ? (
            <div className="inquiry-example">
              <div className="example-person">
                <span className="avatar">OR</span>
                <div>
                  <strong>Olivia Rhye</strong>
                  <span>Annual vehicle service</span>
                </div>
                <span className="badge blue">New inquiry</span>
              </div>
              <blockquote>
                "Hi, I would like to book an annual service. Do you have any
                availability this week?"
              </blockquote>
              <div className="example-next">
                <Clock3 size={18} />
                <div>
                  <strong>Next step: follow up</strong>
                  <span>Check availability and prepare a reply.</span>
                </div>
                <Check size={17} />
              </div>
            </div>
          ) : step === 1 ? (
            <div className="draft-example">
              <label htmlFor="sample-draft">
                <MessageCircle size={16} /> Reply to Olivia{" "}
                <span>Template draft</span>
              </label>
              <textarea
                id="sample-draft"
                maxLength={1000}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setReviewed(false);
                }}
              />
              <div className="draft-example-actions">
                <span role="status">
                  {reviewed
                    ? "Reviewed. Nothing was sent."
                    : "Ready for your review"}
                </span>
                <button
                  className="button primary small"
                  disabled={!message.trim() || reviewed}
                  onClick={() => setReviewed(true)}
                >
                  <CheckCheck size={16} />
                  {reviewed ? "Reviewed" : "Approve example"}
                </button>
              </div>
            </div>
          ) : (
            <div className="handover-example">
              <div className="handover-title">
                <span>Olivia's annual service</span>
                <strong>Quality check</strong>
              </div>
              <ol>
                {[
                  ["Booked", "Your appointment is confirmed."],
                  ["In service", "Your vehicle is with our team."],
                  ["Quality check", "Final checks before collection."],
                ].map(([label, detail], index) => (
                  <li key={label}>
                    <span>
                      {index < 2 ? <Check size={14} /> : <Clock3 size={14} />}
                    </span>
                    <div>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="example-private">
                <ShieldCheck size={15} /> Only approved updates appear here.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
