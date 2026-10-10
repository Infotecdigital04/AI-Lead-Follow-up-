import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardList,
  Home,
  Layers3,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { PlanCards } from "./public";
import "./home-sections.css";

const steps = [
  [
    "Capture the enquiry",
    "Keep client details and conversation context close.",
  ],
  ["Prepare the follow-up", "Draft your next reply with AI assistance."],
  [
    "Keep clients in the loop",
    "Track service progress with a connected client portal.",
  ],
];
const workflowLinks = [
  [ClipboardList, "Leads", "/demo/leads"],
  [MessageCircle, "Follow-ups", "/demo/tasks"],
  [Layers3, "Service tracking", "/demo/jobs"],
  [UserRound, "Client portal", "/portal/demo"],
];

function JourneyProgress({ compact = false }) {
  return (
    <ol
      className={
        "rn-journey-progress" + (compact ? " rn-progress-compact" : "")
      }
      aria-label="Service progress: in progress"
    >
      {["Enquiry", "Scheduled", "In progress", "Ready"].map((label, index) => (
        <li
          key={label}
          className={index < 2 ? "complete" : index === 2 ? "current" : ""}
        >
          <span>{index < 2 && <Check size={12} />}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}

function JourneyPreview() {
  return (
    <div className="rn-journey-visual rn-reveal">
      <div className="rn-journey-stage">
        <p className="rn-eyebrow">ILLUSTRATIVE WORKFLOW</p>
        <div className="rn-journey-desktop">
          <aside className="rn-journey-sidebar">
            <span className="rn-journey-brand">
              <Layers3 size={16} />
              Relaynest
            </span>
            <nav aria-label="Workflow demo">
              {[
                [Home, "Home", "/demo/overview"],
                [Users, "Leads", "/demo/leads"],
                [Users, "Clients", "/demo/customers"],
                [Layers3, "Services", "/demo/jobs"],
                [CalendarDays, "Calendar", "/demo/appointments"],
                [MessageCircle, "Follow-ups", "/demo/tasks"],
                [BarChart3, "Reports", "/demo/reports"],
              ].map(([Icon, label, to]) => (
                <Link
                  className={label === "Leads" ? "active" : ""}
                  to={to}
                  key={label}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <div className="rn-journey-workspace">
            <div className="rn-journey-person">
              <span className="rn-avatar">OR</span>
              <div>
                <h3>Olivia's service journey</h3>
                <p>Automotive example</p>
              </div>
              <MoreHorizontal size={17} />
            </div>
            <JourneyProgress />
            <div className="rn-journey-draft">
              <div className="rn-draft-heading">
                <h4>Next follow-up</h4>
                <span>
                  <Sparkles size={11} />
                  AI-assisted draft
                </span>
              </div>
              <div className="rn-draft-body">
                <p>
                  Hi Olivia, your service is nearly complete.
                  <br />
                  Shall we confirm your collection time?
                </p>
                <div>
                  <Paperclip size={14} />
                  <Link to="/demo/leads">
                    Try in the demo <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
            <div className="rn-journey-activity">
              <h4>Recent activity</h4>
              <ol>
                <li className="complete">
                  <span>
                    <Check size={9} />
                  </span>
                  <div>
                    <strong>Service in progress</strong>
                    <small>Today, 10:24</small>
                  </div>
                </li>
                <li>
                  <span />
                  <div>
                    <strong>Vehicle checked in</strong>
                    <small>Yesterday, 14:08</small>
                  </div>
                </li>
                <li>
                  <span />
                  <div>
                    <strong>Enquiry received</strong>
                    <small>12 March, 09:17</small>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <Link
          to="/portal/demo"
          className="rn-journey-phone"
          aria-label="Explore the sample client portal"
        >
          <div className="rn-phone-person">
            <span className="rn-avatar">OR</span>
            <strong>Olivia Ross</strong>
            <ArrowRight size={15} />
          </div>
          <img
            src="/industry-automotive.webp"
            alt="Vehicle receiving a detailing service in this automotive example"
            width="1000"
            height="667"
            loading="lazy"
          />
          <p className="rn-phone-category">AUTOMOTIVE EXAMPLE</p>
          <h4>Your service update</h4>
          <span className="rn-phone-status">
            <span />
            In progress
          </span>
          <JourneyProgress compact />
          <div className="rn-phone-update">
            <Wrench size={21} />
            <p>
              We're currently working on your service. We'll let you know as
              soon as it's ready for collection.
            </p>
          </div>
        </Link>
      </div>
      <nav className="rn-workflow-links" aria-label="Explore the workflow">
        {workflowLinks.map(([Icon, label, to]) => (
          <Link key={label} to={to}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function HomeSections() {
  const navigate = useNavigate();
  return (
    <>
      <section
        className="rn-journey"
        id="journey"
        aria-labelledby="rn-journey-title"
      >
        <div className="rn-journey-copy rn-reveal">
          <p className="rn-eyebrow">FROM FIRST HELLO TO FINAL HANDOVER</p>
          <h2 id="rn-journey-title">
            Every enquiry.
            <br />A clear next step.
          </h2>
          <p className="rn-journey-intro">
            Keep leads, follow-ups and service progress together. Give every
            client a connected experience.
          </p>
          <ol className="rn-journey-steps">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rn-journey-cta">
            <Link className="rn-pill" to="/demo/overview">
              See it in the demo <ArrowRight size={18} />
            </Link>
            <p>No signup. No card.</p>
          </div>
        </div>
        <JourneyPreview />
      </section>
      <section
        className="rn-home-pricing"
        id="pricing"
        aria-labelledby="rn-pricing-title"
      >
        <div className="rn-pricing-inner">
          <div className="rn-pricing-heading rn-reveal">
            <p className="rn-eyebrow">A PLAN FOR YOUR NEXT CHAPTER</p>
            <h2 id="rn-pricing-title">Choose your room to grow.</h2>
            <p>One connected workspace. A plan that fits your business.</p>
          </div>
          <PlanCards
            exploreLabels
            onSelect={(plan, interval) =>
              navigate(`/login?plan=${plan}&interval=${interval}`)
            }
          />
          <div className="rn-pricing-demo">
            <h3>Start with a look around.</h3>
            <Link to="/demo/overview">
              Explore the free demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
