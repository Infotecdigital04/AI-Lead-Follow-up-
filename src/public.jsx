import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Play,
  Check,
  MessageCircle,
  CalendarDays,
  Layers3,
  ShieldCheck,
  Globe2,
  Menu,
  X,
  Wrench,
  Building2,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";
import { Brand, Language, Footer, CheckItem, useReveal } from "./ui";
import { api, post, money, currencies } from "./data";
import { Journey } from "./journey";
import { PremiumHero, ProductShowcase } from "./premium";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-nav">
        <Brand />
        <nav
          aria-label="Main navigation"
          className={open ? "open" : ""}
          onClick={() => setOpen(false)}
        >
          <a href="/#product">{t("product")}</a>
          <a href="/#industries">{t("industries")}</a>
          <Link to="/pricing">{t("pricing")}</Link>
          <Link to="/demo/overview">Live demo</Link>
          <Link className="mobile-login" to="/login">
            {t("login")}
          </Link>
        </nav>
        <div className="nav-actions">
          <Language />
          <Link className="login-link" to="/login">
            {t("login")}
          </Link>
          <Link className="button primary small" to="/demo/overview">
            {t("tryDemo")}
            <ArrowRight size={15} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Home() {
  const { t } = useTranslation();
  useReveal();
  return (
    <>
      <Header />
      <main className="marketing premium">
        <PremiumHero />
        <ProductShowcase />
        <section className="value-strip" data-reveal>
          <div>
            <MessageCircle />
            <strong>Every conversation, continued.</strong>
            <span>Thoughtful follow-ups</span>
          </div>
          <div>
            <Layers3 />
            <strong>Every job, in the picture.</strong>
            <span>Clear service progress</span>
          </div>
          <div>
            <ShieldCheck />
            <strong>Every client, in the loop.</strong>
            <span>A portal they can trust</span>
          </div>
        </section>
        <Journey />
        <section className="feature-section section-wrap" data-reveal>
          <div className="section-intro">
            <span className="eyebrow">LESS CHASING. MORE CONNECTING.</span>
            <h2>
              Good service starts
              <br />
              before the first appointment.
            </h2>
            <p>
              From an interested stranger to your next regular. Keep every step
              together, without keeping it all in your head.
            </p>
          </div>
          <div className="features">
            <article>
              <span className="feature-icon teal">
                <MessageCircle />
              </span>
              <h3>Pick up where you left off.</h3>
              <p>
                Capture inquiries, see who needs a reply, and prepare a
                thoughtful follow-up. You always approve the message.
              </p>
              <Link to="/demo/leads">
                Meet your lead workspace <ArrowRight size={16} />
              </Link>
            </article>
            <article>
              <span className="feature-icon blue">
                <CalendarDays />
              </span>
              <h3>Make room for the next yes.</h3>
              <p>
                Book appointments, assign the next action, and keep your day
                moving with a shared view of the work ahead.
              </p>
              <Link to="/demo/appointments">
                See the schedule <ArrowRight size={16} />
              </Link>
            </article>
            <article>
              <span className="feature-icon peach">
                <Layers3 />
              </span>
              <h3>A little clarity goes a long way.</h3>
              <p>
                Track each service from booked to complete. Share approved
                progress updates through a private client portal.
              </p>
              <Link to="/portal/demo">
                Visit the client portal <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </section>
        <section className="industry-section" id="industries" data-reveal>
          <div className="section-wrap industry-inner">
            <div>
              <span className="eyebrow">YOUR WORK. YOUR WORKSPACE.</span>
              <h2>
                For people who take
                <br />
                service personally.
              </h2>
              <p>
                From independent specialists to high-touch service teams. A
                thoughtful client experience belongs in every business.
              </p>
            </div>
            <div className="industry-list">
              {[
                [
                  Wrench,
                  "Automotive & specialist care",
                  "From the first inquiry to keys handed back.",
                ],
                [
                  BriefcaseBusiness,
                  "Agencies & private consultants",
                  "Keep every client and next step connected.",
                ],
                [
                  Building2,
                  "Property & personal services",
                  "Less back-and-forth. More work moving forward.",
                ],
              ].map(([Icon, title, sub]) => (
                <div key={title}>
                  <Icon />
                  <div>
                    <h3>{title}</h3>
                    <p>{sub}</p>
                  </div>
                  <ArrowRight size={18} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="trust-band" data-reveal>
          <div className="section-wrap trust-inner">
            <div>
              <span className="eyebrow">CONFIDENCE COMES FROM CLARITY</span>
              <h2>
                Your relationships.
                <br />
                Your control.
              </h2>
              <p>
                Know what you can use today, and what still needs to be
                connected.
              </p>
            </div>
            <dl className="readiness-list">
              <div>
                <dt>
                  <Check size={17} /> Explore now
                </dt>
                <dd>
                  Sample leads, follow-up drafts, tasks, service tracking and
                  the client portal.
                </dd>
              </div>
              <div>
                <dt>
                  <ShieldCheck size={17} /> Always in your control
                </dt>
                <dd>
                  Review messages before sending. Keep internal notes separate
                  from client updates.
                </dd>
              </div>
              <div>
                <dt>
                  <Globe2 size={17} /> Before live use
                </dt>
                <dd>
                  Email sign-in, AI generation and subscription payments require
                  provider setup. WhatsApp and channel sync are not connected.
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <section className="section-wrap faq-section" data-reveal>
          <div>
            <span className="eyebrow">A FEW GOOD QUESTIONS</span>
            <h2>Get to know Relaynest.</h2>
          </div>
          <div>
            {[
              [
                "Can I try it before signing up?",
                "Yes. The interactive demo includes sample leads, appointments, service jobs, and invoices. Changes are saved in your browser and never contact real customers.",
              ],
              [
                "Does AI send messages automatically?",
                "No. Message drafts always need your approval. When AI is not connected, a clearly identified message template is available.",
              ],
              [
                "Can my clients see my internal notes?",
                "No. Client access is restricted to their own service and approved updates. Staff notes are kept private.",
              ],
              [
                "Can I use it outside my country?",
                "Relaynest is designed for international access. Payment availability, supported currencies, and account eligibility depend on the payment provider and region.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing" data-reveal>
          <span className="eyebrow">KEEP THE GOOD THINGS GOING.</span>
          <h2>{t("ready")}</h2>
          <p>{t("readySub")}</p>
          <Link to="/demo/overview" className="button primary">
            {t("tryDemo")}
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

const priceBook = {
  USD: [39, 99, 249],
  INR: [2999, 7999, 19999],
  EUR: [39, 95, 239],
  GBP: [32, 79, 199],
  AED: [145, 365, 915],
  CAD: [55, 139, 349],
  AUD: [59, 149, 379],
  SGD: [52, 132, 332],
  JPY: [5900, 14900, 37900],
  BRL: [199, 499, 1249],
};
const countryCurrency = {
  IN: "INR",
  GB: "GBP",
  AE: "AED",
  CA: "CAD",
  AU: "AUD",
  SG: "SGD",
  JP: "JPY",
  BR: "BRL",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  PT: "EUR",
  IE: "EUR",
  AT: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
};
export function PlanCards({ onSelect }) {
  const { t } = useTranslation();
  const [interval, setInterval] = useState("monthly"),
    [currency, setCurrency] = useState("USD");
  useEffect(() => {
    api("/config")
      .then((c) => setCurrency(countryCurrency[c.country] || "USD"))
      .catch(() => {});
  }, []);
  return (
    <>
      <div className="pricing-controls">
        <div className="segmented">
          <button
            className={interval === "monthly" ? "active" : ""}
            onClick={() => setInterval("monthly")}
          >
            {t("monthly")}
          </button>
          <button
            className={interval === "yearly" ? "active" : ""}
            onClick={() => setInterval("yearly")}
          >
            {t("yearly")}
            <span>−20%</span>
          </button>
        </div>
        <label className="currency-select">
          <Globe2 size={16} />
          <select
            aria-label={t("currency")}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="plans">
        {[
          [
            "starter",
            "Starter",
            "A clear start for your service business.",
            [
              "Lead and customer management",
              "Follow-up reminders",
              "Service tracking & client portal",
              "Basic reports",
            ],
          ],
          [
            "growth",
            "Growth",
            "More connected work. More possibilities.",
            [
              "Everything in Starter",
              "AI-assisted message drafts",
              "Appointments and tasks",
              "Invoice tracking & source reports",
            ],
          ],
          [
            "pro",
            "Pro",
            "For a growing service operation.",
            [
              "Everything in Growth",
              "Higher capacity by arrangement",
              "Onboarding assistance",
              "Priority support by email",
            ],
          ],
        ].map(([key, name, sub, features], i) => {
          const amount = Math.round(
            priceBook[currency][i] * (interval === "yearly" ? 0.8 : 1),
          );
          return (
            <article
              className={"plan " + (i === 1 ? "featured" : "")}
              key={key}
            >
              {i === 1 && <span className="plan-ribbon">ROOM TO GROW</span>}
              <h2>{name}</h2>
              <p>{sub}</p>
              <div className="price">
                {money(amount, currency)}
                <span>/ month</span>
              </div>
              <div className="billing-period">
                {interval === "yearly"
                  ? `${money(amount * 12, currency)} billed yearly`
                  : "Billed monthly"}
              </div>
              <button
                className={"button " + (i === 1 ? "primary" : "secondary")}
                onClick={() => onSelect(key, interval)}
              >
                {t("choosePlan")}
                <ArrowRight size={16} />
              </button>
              <ul>
                {features.map((f) => (
                  <CheckItem key={f}>{f}</CheckItem>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <p className="pricing-note">
        Launch pricing proposals. Subscriptions open after payment-provider
        approval. Final currency, taxes, and total are confirmed at checkout.
        Feature limits will be published before sales open.
      </p>
    </>
  );
}
export function Pricing() {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main className="pricing-page section-wrap">
        <span className="eyebrow">SPACE FOR YOUR NEXT CHAPTER</span>
        <h1>Simple plans. Thoughtful follow-through.</h1>
        <p>Start small, keep your clients close, and grow at your own pace.</p>
        <PlanCards
          onSelect={(plan, interval) =>
            navigate(`/login?plan=${plan}&interval=${interval}`)
          }
        />
        <div className="payment-note">
          <ShieldCheck size={20} />
          <span>
            Secure hosted checkout. Your card details never pass through
            Relaynest.
          </span>
        </div>
      </main>
      <Footer />
    </>
  );
}
export function Login() {
  const { t } = useTranslation();
  const [params] = useSearchParams(),
    navigate = useNavigate();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [stage, setStage] = useState("email"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (stage === "email") {
        await post("/auth/request", { email });
        setStage("code");
      } else {
        await post("/auth/verify", { email, code });
        const next = params.get("next");
        navigate(
          next?.startsWith("/portal/")
            ? next
            : "/app/overview" +
                (params.get("plan") ? "?" + params.toString() : ""),
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-top">
        <Brand />
        <Language />
      </div>
      <main className="auth-content">
        <span className="feature-icon teal">
          <MessageCircle />
        </span>
        <h1>{t("signIn")}</h1>
        <p>{t("signInSub")}</p>
        <form onSubmit={submit}>
          <label>
            {t("email")}
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              disabled={stage === "code"}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
            />
          </label>
          {stage === "code" && (
            <>
              <p className="info-note">
                A six-digit code has been sent to your email.
              </p>
              <label>
                Sign-in code
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy
              ? "Please wait..."
              : t(stage === "email" ? "sendCode" : "verify")}
            <ArrowRight size={17} />
          </button>
          {stage === "code" && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setStage("email");
                setCode("");
              }}
            >
              Use a different email or request a new code
            </button>
          )}
        </form>
        <div className="auth-divider">
          <span>just looking around?</span>
        </div>
        <Link className="button secondary" to="/demo/overview">
          <Play size={15} />
          {t("tryDemo")}
        </Link>
        <p className="legal-note">
          By continuing, you agree to our <Link to="/terms">terms</Link> and{" "}
          <Link to="/privacy">privacy notice</Link>.
        </p>
      </main>
      <div className="auth-bottom">A product by Infotec Digital</div>
    </div>
  );
}
export async function openCheckout(plan, interval, onPaid) {
  const [config, transaction] = await Promise.all([
    api("/config"),
    post("/billing/checkout", { plan, interval }),
  ]);
  const { initializePaddle } = await import("@paddle/paddle-js");
  const paddle = await initializePaddle({
    environment:
      config.paddleEnvironment === "production" ? "production" : "sandbox",
    token: config.paddleToken,
    eventCallback: (e) => {
      if (e.name === "checkout.completed") onPaid?.();
    },
  });
  if (!paddle) throw new Error("Checkout could not load.");
  paddle.Checkout.open({
    transactionId: transaction.transactionId,
    settings: {
      displayMode: "overlay",
      successUrl: location.origin + "/app/overview?payment=processing",
    },
  });
}
export function Checkout() {
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    (async () => {
      const config = await api("/config");
      if (!config.paddleToken) throw new Error("Checkout is not open yet.");
      const { initializePaddle } = await import("@paddle/paddle-js");
      if (alive)
        await initializePaddle({
          environment:
            config.paddleEnvironment === "production"
              ? "production"
              : "sandbox",
          token: config.paddleToken,
        });
    })().catch((e) => setError(e.message));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <>
      <Header />
      <main className="simple-page">
        <ShieldCheck size={32} />
        <h1>Secure subscription checkout</h1>
        <p>
          {error ||
            "Your payment is processed by Paddle. Your workspace opens after payment verification."}
        </p>
        <Link to="/app/overview" className="button primary">
          Return to workspace
        </Link>
      </main>
    </>
  );
}
export function Legal({ type }) {
  const titles = {
    privacy: "Privacy notice",
    terms: "Terms of service",
    refunds: "Cancellation & refunds",
  };
  return (
    <>
      <Header />
      <main className="legal-page">
        <span className="eyebrow">RELAYNEST BY INFOTEC DIGITAL</span>
        <h1>{titles[type]}</h1>
        <p className="info-note">
          Pre-launch policy draft. Paid subscriptions are not open. The
          operator’s legal details and final policies must be confirmed before
          accepting payments.
        </p>
        {type === "privacy" ? (
          <>
            <h2>Information used by the service</h2>
            <p>
              Accounts use your email address and business name. Your workspace
              stores the lead, customer, appointment, job, task, and invoice
              information you choose to enter. The demo stores sample data in
              your browser; do not enter sensitive personal information there.
            </p>
            <h2>Service providers</h2>
            <p>
              Cloudflare hosts the application and database. When configured,
              Resend delivers sign-in and approved follow-up emails, Paddle
              processes subscriptions, and Cloudflare Workers AI drafts
              messages. Draft generation uses the selected lead’s name,
              requested service, and status. Card details are handled by the
              payment provider.
            </p>
            <h2>Your choices</h2>
            <p>
              You can export supported workspace records, remove records, and
              request account deletion or access to your information at
              hello@infotecdigital.com. Essential cookies keep you signed in. No
              advertising trackers are included in this build.
            </p>
          </>
        ) : type === "terms" ? (
          <>
            <h2>Using your workspace</h2>
            <p>
              You are responsible for the accuracy of your records, permission
              to contact customers, and review of every suggested message. Do
              not upload sensitive health records, payment card details, or
              unlawful content. AI suggestions may be inaccurate and must be
              checked.
            </p>
            <h2>Availability and subscriptions</h2>
            <p>
              Service availability depends on configured providers and usage
              limits. Proposed prices are shown on the pricing page; the
              checkout confirms the final total and billing interval. Features
              described as planned or requiring setup are not available until
              activated.
            </p>
            <h2>Contact</h2>
            <p>
              Relaynest is a product of Infotec Digital. Contact
              hello@infotecdigital.com for support, account requests, and
              questions about the service.
            </p>
          </>
        ) : (
          <>
            <h2>Before payment</h2>
            <p>
              The demo requires no payment. Subscription checkout remains
              unavailable until the payment provider and final sale terms are
              activated.
            </p>
            <h2>Cancellation</h2>
            <p>
              Once subscriptions open, use the subscription-management link in
              your billing email or contact hello@infotecdigital.com.
              Cancellation should stop the next renewal; the applicable service
              end date will be shown by the billing provider.
            </p>
            <h2>Refund requests</h2>
            <p>
              Contact hello@infotecdigital.com with your billing email and
              transaction reference. Do not include card details. Final refund
              eligibility and statutory consumer rights must be published before
              paid sales begin.
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
export function NotFound() {
  return (
    <>
      <Header />
      <main className="simple-page">
        <h1>This page has moved out of view.</h1>
        <Link to="/" className="button primary">
          Back to Relaynest
        </Link>
      </main>
    </>
  );
}

