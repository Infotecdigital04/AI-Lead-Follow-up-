import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDown, Check, ChevronRight, Menu, X, Users, MessageCircle, Layers3, CalendarDays, Wrench, Scissors, Camera, BriefcaseBusiness, Plus, Play } from "lucide-react";
import { Brand, Language } from "./ui";
import { PlanCards } from "./public";
import "./studio-home.css";

const views = [
  { name: "Daily focus", icon: Users, title: "A clear head start.", text: "Know who needs a reply, what is due, and where to give your attention. One considered view of the day ahead.", image: "/workspace-preview.jpg", route: "/demo/overview" },
  { name: "Service tracking", icon: Layers3, title: "Good work. All together.", text: "Keep the details close and the next step clear. Follow each job from the first conversation to the final handover.", image: "/product-services.jpg", route: "/demo/jobs" },
  { name: "Client portal", icon: MessageCircle, title: "A better client experience.", text: "Give clients a place of their own to see progress and stay connected. Less chasing. More confidence.", image: "/product-portal.jpg", route: "/portal/demo" },
];
const trades = [
  { name: "Automotive", icon: Wrench, title: "Every service. Every detail.", description: "Keep enquiries, vehicle notes and service progress connected, from the first call to the keys back in hand.", stages: ["Enquiry", "Inspection", "In progress", "Ready"], client: "Olivia Rhye", job: "Annual vehicle service", next: "Confirm the collection time", message: "Hi Olivia, your service is nearly complete. Would a collection at 4 pm work for you?" },
  { name: "Beauty & wellness", icon: Scissors, title: "Care that continues after the visit.", description: "Make room for a more personal experience. Keep client preferences, appointments and follow-ups in one place.", stages: ["Enquiry", "Booked", "Appointment", "Follow-up"], client: "Amelia Stone", job: "Colour consultation", next: "Follow up after the appointment", message: "Hi Amelia, it was lovely seeing you. How are you finding your new colour?" },
  { name: "Creative studios", icon: Camera, title: "More room for your best work.", description: "Bring enquiries, project notes and client updates together, so the details never interrupt the creative process.", stages: ["Enquiry", "Proposal", "Production", "Delivery"], client: "Alex Morgan", job: "Brand photography", next: "Confirm the shoot brief", message: "Hi Alex, I have your shoot brief ready. Shall we walk through the details together?" },
  { name: "Professional services", icon: BriefcaseBusiness, title: "Every relationship deserves attention.", description: "Keep a clear view of proposals, tasks and client conversations, whether you work independently or with a team.", stages: ["Discovery", "Proposal", "In progress", "Review"], client: "Jordan Lee", job: "Strategy consultation", next: "Arrange the proposal review", message: "Hi Jordan, following up on our conversation. Would Thursday work for a proposal review?" },
];
const questions = [
  ["Can I try Relaynest before creating an account?", "Yes. The live demo opens straight into a workspace with sample data. No signup or card is required. Demo changes stay in your browser."],
  ["Will this work for my kind of business?", "Relaynest brings together leads, customers, follow-up tasks, service jobs and a client portal. Explore the examples above, then try your everyday workflow in the demo."],
  ["Can I use it on my phone?", "Yes. The workspace adapts to phones, tablets and desktops, so you can check on a client or a job away from your desk."],
  ["Can I pay in my local currency?", "The pricing selector offers local currencies. Paid subscriptions will open after payment-provider approval; final currency, taxes and totals will be shown at checkout."],
];

export function StudioHome() {
  const { t, i18n } = useTranslation();
  const english = i18n.resolvedLanguage === "en";
  const [menu, setMenu] = useState(false);
  const [view, setView] = useState(0);
  const [trade, setTrade] = useState(0);
  const root = useRef(null);
  const navigate = useNavigate();
  const current = views[view];
  const industry = trades[trade];
  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    node.classList.add("rn-motion");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("rn-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    node.querySelectorAll(".rn-reveal").forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); node.classList.remove("rn-motion"); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (event) => { if (event.key === "Escape") { setMenu(false); root.current?.querySelector(".rn-menu-button")?.focus(); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);

  return <div className="rn-home" ref={root}>
    <a className="rn-skip" href="#main">Skip to content</a>
    <header className="rn-header"><div className="rn-nav">
      <Brand />
      <nav className="rn-links" aria-label="Main navigation"><a href="#product">{t("product")}</a><a href="#industries">{t("industries")}</a><a href="#pricing">{t("pricing")}</a><Link to="/demo/overview">{t("tryDemo")}</Link></nav>
      <div className="rn-actions"><Language /><Link className="rn-login" to="/login">{t("login")}</Link><Link className="rn-button rn-small" to="/demo/overview">Explore <ArrowUpRight size={15} /></Link><button className="rn-menu-button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="rn-mobile-nav" onClick={() => setMenu(!menu)}>{menu ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>{menu && <nav id="rn-mobile-nav" className="rn-mobile-nav" aria-label="Mobile navigation" onClick={(event) => { if (event.target.closest("a")) setMenu(false); }}><a href="#product">Product</a><a href="#industries">Industries</a><a href="#pricing">Pricing</a><Link to="/demo/overview">Live demo</Link><Link to="/login">Log in</Link><Language /></nav>}</header>
    <main id="main">
      <section className="rn-hero" aria-labelledby="rn-title"><div className="rn-hero-copy">
        <p className="rn-eyebrow"><span /> A LITTLE FOLLOW-UP. A LOT OF POSSIBILITY.</p>
        <h1 id="rn-title">Relaynest<span>.</span></h1><p className="rn-hero-title">{english ? "Stay close. Go further." : t("hero")}</p>
        <p className="rn-hero-description">{english ? "Your leads, your work, your clients. Beautifully connected." : t("heroSub")}</p>
        <div className="rn-hero-actions"><Link className="rn-button rn-mint" to="/demo/overview">{english ? "Explore the workspace" : t("tryDemo")} <ArrowUpRight size={18} /></Link><a className="rn-text-link" href="#product"><Play size={15} /> See it in action</a></div>
        <p className="rn-reassurance"><Check size={13} /> No signup. No card. Just a look around.</p>
      </div><div className="rn-hero-product"><div className="rn-product-caption"><span><span className="rn-status-dot" /> YOUR DAY, CONNECTED</span><span>SAMPLE WORKSPACE <ArrowUpRight size={12} /></span></div><Link to="/demo/overview" aria-label="Explore the Relaynest daily focus workspace"><img src="/workspace-focus.jpg" alt="Relaynest daily focus: follow-ups and tasks organised by priority" width="1147" height="455" fetchPriority="high" /></Link></div></section>
      <div className="rn-value-strip"><span>Made for the business behind great service.</span><a href="#product">Less chasing. More connection. <ArrowDown size={16} /></a></div>

      <section className="rn-section rn-product" id="product">
        <div className="rn-section-head rn-reveal"><div><p className="rn-eyebrow">01 / THE WORKSPACE</p><h2>A little less busy.<br /><span>A lot more clarity.</span></h2></div><p>Make space for the work you love.<br />Bring the rest together in Relaynest.</p></div>
        <div className="rn-product-tabs" role="group" aria-label="Product views">{views.map((item, index) => <button key={item.name} aria-pressed={view === index} onClick={() => setView(index)}><item.icon size={17} />{item.name}</button>)}</div>
        <div className="rn-product-stage rn-reveal"><div className="rn-product-story" aria-live="polite"><div><h3>{current.title}</h3><p>{current.text}</p></div><Link to={current.route}>Explore this view <ArrowUpRight size={18} /></Link></div><Link to={current.route} className="rn-screen-link" aria-label={`Open ${current.name} demo`}><img key={current.image} src={current.image} alt={`Relaynest ${current.name} sample screen`} loading="lazy" decoding="async" width="1440" height="980" /></Link></div>
        <div className="rn-benefits rn-reveal">{[[MessageCircle, "A more personal follow-up.", "Keep context close, prepare your next reply, and remember the conversations that matter."], [CalendarDays, "A day with direction.", "Appointments, tasks and next steps, organised around the people who need you."], [Layers3, "A connected client journey.", "Move from enquiry to delivery with a shared view of the work in progress."]].map(([Icon, title, text], i) => <article key={title}><span className={`rn-benefit-icon rn-accent-${i}`}><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="rn-industries" id="industries"><div className="rn-section"><div className="rn-section-head rn-reveal"><div><p className="rn-eyebrow">02 / YOUR KIND OF BUSINESS</p><h2>Your craft.<br /><span>Your way of working.</span></h2></div><p>From an independent studio to a growing team.<br />Every client deserves your best.</p></div>
        <div className="rn-industry-layout rn-reveal"><div className="rn-industry-options" role="group" aria-label="Industry examples">{trades.map((item, index) => <button key={item.name} aria-pressed={trade === index} onClick={() => setTrade(index)}><item.icon size={20} /><span>{item.name}</span><ChevronRight size={18} /></button>)}</div>
        <div className="rn-industry-detail" aria-live="polite"><span className="rn-example-label">ILLUSTRATIVE WORKFLOW</span><h3>{industry.title}</h3><p>{industry.description}</p><ol className="rn-stages">{industry.stages.map((stage, i) => <li key={stage} className={i === 2 ? "rn-current" : ""}><span>{i < 2 ? <Check size={12} /> : i + 1}</span>{stage}</li>)}</ol><div className="rn-client-line"><span className="rn-avatar">{industry.client.split(" ").map((part) => part[0]).join("")}</span><div><strong>{industry.client}</strong><span>{industry.job}</span></div><span className="rn-client-status">In progress</span></div><div className="rn-message"><span><MessageCircle size={14} />{industry.next}</span><p>{industry.message}</p></div></div></div>
      </div></section>
      <section className="rn-section rn-pricing" id="pricing"><div className="rn-section-head rn-reveal"><div><p className="rn-eyebrow">03 / ROOM TO GROW</p><h2>Big ambition.<br /><span>A thoughtful starting point.</span></h2></div><p>Explore a plan that fits your next chapter.<br />Start with the demo, at your own pace.</p></div><PlanCards onSelect={(plan, interval) => navigate(`/login?plan=${plan}&interval=${interval}`)} /></section>
      <section className="rn-faq-section"><div className="rn-section rn-faq-grid"><div><p className="rn-eyebrow">A FEW MORE DETAILS</p><h2>Good questions.<br /><span>Clear answers.</span></h2><a className="rn-text-link" href="mailto:info@infotecdigital.com">Talk to us <ArrowUpRight size={17} /></a></div><div className="rn-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={19} /></summary><p>{answer}</p></details>)}</div></div></section>
      <section className="rn-closing"><p className="rn-eyebrow">THE NEXT HELLO STARTS HERE.</p><h2>Make room for<br /><span>what comes next.</span></h2><Link className="rn-button rn-mint" to="/demo/overview">Find your flow <ArrowUpRight size={18} /></Link><p className="rn-reassurance">Open the demo. Make yourself at home.</p></section>
    </main><footer className="rn-footer"><div><Brand /><p>A little follow-up. A lasting connection.</p></div><nav aria-label="Footer navigation"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/refunds">Refunds</Link><a href="mailto:info@infotecdigital.com">Contact</a></nav><p>© 2026 Infotec Digital</p></footer>
  </div>;
}
