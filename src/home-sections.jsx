import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Mail,
  MessageCircle,
  Play,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PlanCards } from "./public";
import "./home-sections.css";

export function ProductStory({ onWalkthrough }) {
  return (
    <section
      className="rn-story"
      id="product"
      aria-labelledby="rn-product-title"
    >
      <div className="rn-content-width">
        <div className="rn-story-heading" id="journey">
          <div>
            <p className="rn-eyebrow">FROM ENQUIRY TO DELIVERY</p>
            <h2 id="rn-product-title">
              A clear next step.
              <br />
              <span>At every stage.</span>
            </h2>
          </div>
          <div className="rn-story-intro">
            <p>
              Keep conversations, follow-ups and service progress connected.
            </p>
            <button
              className="rn-story-watch"
              id="walkthrough"
              onClick={onWalkthrough}
              aria-label="Play product walkthrough"
            >
              <Play size={16} /> Watch the walkthrough
            </button>
          </div>
        </div>
        <p className="rn-story-sample">
          Sample workflow / automotive consultation
        </p>
        <div className="rn-story-grid">
          <article className="rn-story-step">
            <div className="rn-step-index">
              <span>01</span>
              <span />
            </div>
            <h3>Capture the enquiry</h3>
            <div className="rn-closeup rn-enquiry-closeup">
              <div className="rn-closeup-heading">
                <strong>New enquiry</strong>
                <UserRound size={20} />
              </div>
              <div className="rn-contact-preview">
                <span className="rn-contact-initials">OR</span>
                <div>
                  <h4>Olivia Rhye</h4>
                  <p>Consultation enquiry</p>
                </div>
              </div>
              <span className="rn-sample-status">New lead</span>
              <div className="rn-enquiry-details">
                <p>
                  <Mail size={17} /> olivia@example.com
                </p>
                <p>
                  <MessageCircle size={17} /> Interested in a vehicle detailing
                  consultation.
                </p>
              </div>
              <Link className="rn-closeup-link" to="/demo/leads">
                Explore leads <ArrowRight size={17} />
              </Link>
            </div>
          </article>
          <article className="rn-story-step">
            <div className="rn-step-index">
              <span>02</span>
              <span />
            </div>
            <h3>Prepare the follow-up</h3>
            <div className="rn-closeup rn-draft-closeup">
              <div className="rn-closeup-heading">
                <strong>
                  <Sparkles size={19} /> Message draft
                </strong>
              </div>
              <span className="rn-closeup-label">
                AI-ASSISTED / SAMPLE DRAFT
              </span>
              <p className="rn-story-message">
                Hi Olivia,
                <br />
                <br />
                Shall we confirm a time for your consultation? I'm available
                next week and can share a few options that suit you.
              </p>
              <span className="rn-review-note">
                <Check size={15} /> Review before sending
              </span>
              <Link className="rn-pill" to="/demo/leads">
                Review a draft <ArrowRight size={17} />
              </Link>
            </div>
          </article>
          <article className="rn-story-step">
            <div className="rn-step-index">
              <span>03</span>
              <span />
            </div>
            <h3>Share service progress</h3>
            <div className="rn-closeup rn-portal-closeup">
              <div className="rn-closeup-heading">
                <strong>Client portal</strong>
                <Link
                  to="/portal/demo"
                  aria-label="Open the sample client portal"
                  title="Open the sample client portal"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>
              <img
                src="/industry-automotive.webp"
                alt="Illustrative vehicle detailing service"
                width="1000"
                height="667"
                loading="lazy"
              />
              <div className="rn-service-caption">
                <strong>Vehicle service</strong>
                <span className="rn-sample-status">In progress</span>
              </div>
              <ol
                className="rn-story-progress"
                aria-label="Sample service progress"
              >
                <li className="done">
                  <span>
                    <Check size={12} />
                  </span>
                  Enquiry received
                </li>
                <li className="current">
                  <span />
                  Service in progress
                </li>
                <li>
                  <span />
                  Ready for collection
                </li>
              </ol>
              <Link className="rn-closeup-link" to="/portal/demo">
                Explore the client portal <ArrowRight size={17} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
export function HomePricing() {
  const navigate = useNavigate();
  return (
    <section
      className="rn-home-pricing"
      id="pricing"
      aria-labelledby="rn-pricing-title"
    >
      <div className="rn-pricing-inner">
        <div className="rn-pricing-heading">
          <p className="rn-eyebrow">YOUR NEXT CHAPTER</p>
          <h2 id="rn-pricing-title">Room to grow.</h2>
          <p>Compare the plans. Start with a look around.</p>
        </div>
        <PlanCards
          exploreLabels
          onSelect={(plan, interval) =>
            navigate(`/login?plan=${plan}&interval=${interval}`)
          }
        />
        <div className="rn-pricing-demo">
          <Link to="/demo/overview">
            Explore the free demo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
