import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./homev2.css";

/* ---------- icons (stroke path strings) ---------- */
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  car: '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 13h16v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="15.5" r=".6"/><circle cx="16.5" cy="15.5" r=".6"/>',
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 18M8 16.5 20 6"/>',
  wrench: '<path d="M14.5 5.5a3.5 3.5 0 0 0-4.8 4.4L4 15.6 8.4 20l5.7-5.7a3.5 3.5 0 0 0 4.4-4.8l-2.2 2.2-2.1-.4-.4-2.1z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h12"/>',
  camera: '<path d="M4 8a2 2 0 0 1 2-2h1l1.2-1.6a1 1 0 0 1 .8-.4h6a1 1 0 0 1 .8.4L18 6a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="12" cy="12.5" r="3"/>',
  health: '<path d="M4 12h3l2-5 3 10 2-5h6"/>',
  spray: '<path d="M9 8h6v11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><path d="M17 5h2M17 8h3M18 11h2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M4 9v6M20 9v6M6.5 12h11"/>',
  build: '<path d="M4 7h16M4 12h10M4 17h7"/><circle cx="18" cy="15" r="3"/><path d="M18 13.5v3M16.5 15h3"/>',
  inbox: '<path d="M4 13h4l1 2h6l1-2h4"/><path d="M4 13 6 5h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  star: '<path d="m12 3 2.6 5.6 6 .6-4.5 4 1.3 5.9L12 16l-5.4 3.1 1.3-5.9-4.5-4 6-.6z"/>',
  bot: '<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M12 8V4M9 13h.01M15 13h.01"/><path d="M3 12v3M21 12v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  calcheck: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 9v11"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  checksq: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  team: '<path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M22 20v-2a4 4 0 0 0-3-3.8"/>',
  plug: '<path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
};
function Ic({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
const svgStr = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";

/* ---------- data ---------- */
const BLUEPRINTS = [
  { id: "auto", name: "Auto garage", icon: "car", sub: "Repair & service shops", sample: "annual service", stages: ["Booked", "Inspection", "In progress", "Quality check", "Ready", "Completed"], msg: "Hi {name}, your quote for the {service} is ready. Shall we book you in this week?", trigger: "Sends when a lead sits 1 day with no reply", booking: [["Vehicle reg.", "e.g. KA01 AB 1234"], ["Service needed", "Dropdown of your services"], ["Preferred date", "Calendar"]], portal: "Customers track their repair stage, approve the quote, and pay the invoice — all branded as your garage." },
  { id: "salon", name: "Hair salon", icon: "scissors", sub: "Salons & stylists", sample: "colour", stages: ["Enquiry", "Booked", "In chair", "Styling", "Checked out", "Rebook due"], msg: "Hi {name}, it’s been 6 weeks since your {service}. Want your usual slot with your stylist?", trigger: "Sends automatically when a client is due to rebook", booking: [["Service", "Cut, colour, treatment…"], ["Preferred stylist", "Your team"], ["Date & time", "Live availability"]], portal: "Clients rebook in one tap, see their colour history, and leave a review after each visit." },
  { id: "plumber", name: "Plumber", icon: "wrench", sub: "Plumbing & heating", sample: "boiler repair", stages: ["New call", "Quoted", "Scheduled", "On site", "Completed", "Invoiced"], msg: "Hi {name}, following up on your {service}. I can be there tomorrow morning — does that work?", trigger: "Sends the moment a new job enquiry comes in", booking: [["Problem", "Leak, boiler, blocked drain…"], ["Address", "With map pin"], ["Urgency", "Emergency / this week"]], portal: "Customers see arrival time, approve extra work before you do it, and pay on the spot." },
  { id: "tutor", name: "Tutor", icon: "book", sub: "Tutors & coaches", sample: "maths tutoring", stages: ["Enquiry", "Trial booked", "Enrolled", "Ongoing", "Renewal due"], msg: "Hi {name}, thanks for your interest in {service}. Would a free trial lesson this week suit you?", trigger: "Sends within 1 hour of a new enquiry", booking: [["Subject & level", "e.g. GCSE Maths"], ["Student name", "For your records"], ["Preferred slot", "Weekly schedule"]], portal: "Parents see lesson notes, progress and invoices, and book the next term in one click." },
  { id: "photo", name: "Photographer", icon: "camera", sub: "Photo & video", sample: "wedding shoot", stages: ["Enquiry", "Quote sent", "Booked", "Shoot day", "Editing", "Delivered"], msg: "Hi {name}, so excited about your {service}! Here’s your quote — shall I hold the date?", trigger: "Sends when an enquiry has no reply after 1 day", booking: [["Event type", "Wedding, portrait, product…"], ["Date", "Calendar"], ["Location", "Venue or studio"]], portal: "Clients approve the quote, sign the contract, and download their gallery from the portal." },
  { id: "clinic", name: "Clinic", icon: "health", sub: "Clinics & therapists", sample: "appointment", stages: ["Enquiry", "Appointment", "Consultation", "Treatment", "Follow-up"], msg: "Hi {name}, a gentle reminder about your {service}. Reply YES to confirm your appointment.", trigger: "Sends 24 hours before every appointment", booking: [["Reason for visit", "Private, kept secure"], ["Preferred date", "Calendar"], ["Contact number", "For reminders"]], portal: "Patients confirm appointments, get secure reminders, and settle fees privately online." },
  { id: "cleaner", name: "Cleaner", icon: "spray", sub: "Cleaning services", sample: "home clean", stages: ["Request", "Quote", "Scheduled", "Cleaning", "Done", "Recurring"], msg: "Hi {name}, your quote for the {service} is ready. Want to set it up weekly or one-off?", trigger: "Sends as soon as a quote request lands", booking: [["Property size", "Studio to large home"], ["Frequency", "One-off / weekly"], ["First clean date", "Calendar"]], portal: "Clients manage recurring visits, skip a week, and pay automatically each clean." },
  { id: "electric", name: "Electrician", icon: "bolt", sub: "Electrical work", sample: "rewire", stages: ["Enquiry", "Survey", "Quote", "Scheduled", "Completed", "Certified"], msg: "Hi {name}, following up on your {service}. I can survey the job this week — which day suits?", trigger: "Sends when a new enquiry is 1 day old", booking: [["Job type", "Rewire, EV charger, fault…"], ["Address", "With map pin"], ["Preferred date", "Calendar"]], portal: "Customers approve quotes, receive their safety certificate, and pay — all in one place." },
  { id: "consult", name: "Consultant", icon: "chart", sub: "Agencies & advisors", sample: "strategy work", stages: ["Lead", "Discovery", "Proposal", "Engaged", "Delivered", "Renewal"], msg: "Hi {name}, great speaking about {service}. I’ve put a proposal together — may I walk you through it?", trigger: "Sends after a discovery call with no reply in 2 days", booking: [["Service", "What you need help with"], ["Company", "For the proposal"], ["Call time", "Your availability"]], portal: "Clients approve proposals, sign, track deliverables and pay retainers from the portal." },
  { id: "gym", name: "Gym / PT", icon: "dumbbell", sub: "Gyms & trainers", sample: "fitness", stages: ["Enquiry", "Trial", "Member", "Active", "Renewal due"], msg: "Hi {name}, ready to hit your {service} goals? Your free trial session is waiting — book it here.", trigger: "Sends the instant someone enquires", booking: [["Your goal", "Strength, weight loss…"], ["Preferred time", "Class schedule"], ["Start date", "Calendar"]], portal: "Members book classes, renew memberships, and pay dues automatically each month." },
  { id: "custom", name: "Build your own", icon: "build", sub: "Any other service", sample: "your service", stages: ["New", "Contacted", "Quoted", "Won", "In progress", "Done"], msg: "Hi {name}, thanks for getting in touch about {service}. When is a good time to talk?", trigger: "You choose exactly when each follow-up fires", booking: [["Your fields", "Name them whatever you like"], ["Your stages", "Rename and reorder freely"], ["Your currency", "Any of 10, auto-detected"]], portal: "Design the portal, the pipeline and the messages around the exact way you work." },
];
const FEATURES_ALL = [
  { ic: "inbox", t: "Lead capture", d: "Web forms, WhatsApp, social, calls and CSV — every enquiry in one inbox." },
  { ic: "bot", t: "AI follow-up", d: "Auto-replies and nurture sequences that chase leads for you, in any language." },
  { ic: "cal", t: "Online booking", d: "A branded booking link for your trade; slots drop into your calendar." },
  { ic: "calcheck", t: "Appointments", d: "Calendar, confirmations, reminders and no-show nudges, all automatic." },
  { ic: "user", t: "Customer management", d: "A tidy CRM with full history, notes, vehicles or files per client." },
  { ic: "layers", t: "Service & job tracking", d: "Move each job through your own stages on a visual pipeline board." },
  { ic: "panel", t: "Client portal", d: "A branded portal where clients track progress, approve quotes and pay." },
  { ic: "file", t: "Quotes & invoices", d: "Line-item quotes and invoices, sent, tracked and chased automatically." },
  { ic: "card", t: "Online payments", d: "Take card payments through invoices and the client portal." },
  { ic: "checksq", t: "Tasks", d: "Shared to-dos with priorities, owners and due dates — nothing forgotten." },
  { ic: "chart", t: "Reports & insights", d: "Conversion, revenue and lead-source analytics at a glance." },
  { ic: "star", t: "Reviews & reputation", d: "Auto-request reviews and reply with AI after every completed job." },
  { ic: "bell", t: "Smart notifications", d: "Alerts for new leads, due follow-ups, bookings and payments." },
  { ic: "team", t: "Team & roles", d: "Staff accounts, assignments and permissions that scale as you grow." },
  { ic: "plug", t: "Integrations & API", d: "QuickBooks, Stripe, Zapier and an open API for everything else." },
  { ic: "globe", t: "8 languages · 10 currencies", d: "Serve customers worldwide in their own language and money." },
];
const TIERS = [
  { name: "Solo", badge: "One person", title: "Just you, your phone, and your leads.", desc: "A clean, simple workspace that captures every enquiry and follows up for you — no team to manage, nothing to learn.", who: "For solo laborers & one-person shops", feats: ["Lead capture from web, WhatsApp and calls", "Automatic follow-up messages", "Your branded client portal", "Booking link to share anywhere"] },
  { name: "Team", badge: "2–15 people", title: "Share the work without dropping a ball.", desc: "Assign leads and jobs to staff, see who is doing what, and keep every customer update in one shared place.", who: "For small teams & growing shops", feats: ["Staff accounts, roles and assignments", "Shared pipeline and calendar", "Quotes, invoices and online payments", "Review requests after every job"] },
  { name: "Multi-location", badge: "Several branches", title: "Many branches, one clear view.", desc: "Run each location its own way while head office sees the whole picture — leads, revenue and performance across sites.", who: "For multi-branch businesses", feats: ["Per-location pipelines and teams", "Cross-location reporting", "Automated SMS & email sequences", "QuickBooks and accounting sync"] },
  { name: "Enterprise", badge: "Large operations", title: "Serious scale, your brand on everything.", desc: "White-label portals, an open API, advanced analytics and security built for operations with thousands of jobs a month.", who: "For national & enterprise operators", feats: ["White-label client portals", "Full API & Zapier access", "Revenue forecasting & advanced reports", "SSO, audit logs and priority support"] },
];
const CMP = [
  ["Works in your own language", "8 languages", "1–2", "1", "Limited", "1"],
  ["Prices in your local currency", "10 currencies", "Limited", "Limited", "Limited", "Limited"],
  ["Pre-built for your exact trade", "YES", "NO", "NO", "NO", "NO"],
  ["Grows solo → enterprise", "YES", "Small–mid", "Small–mid", "Enterprise only", "Agencies"],
  ["AI automatic follow-up", "YES", "NO", "NO", "NO", "YES"],
  ["Client portal + online payments", "YES", "YES", "YES", "YES", "YES"],
  ["Set up in minutes", "YES", "YES", "YES", "Weeks", "NO"],
  ["Starts cheap for solo users", "YES", "From $25", "From $59", "Custom", "From $97"],
];
const PRICES = { USD: { sym: "$", starter: 9, growth: 29, pro: 79 }, INR: { sym: "₹", starter: 699, growth: 1999, pro: 4999 }, EUR: { sym: "€", starter: 9, growth: 27, pro: 75 }, GBP: { sym: "£", starter: 8, growth: 25, pro: 69 }, AED: { sym: "AED ", starter: 33, growth: 109, pro: 299 } };
const PLANS = [
  { id: "starter", name: "Starter", for: "For solo laborers getting their first leads in order.", feats: ["Lead capture + inbox", "Automatic follow-ups", "1 user, mobile-first", "Branded client portal", "Booking link"] },
  { id: "growth", name: "Growth", featured: true, for: "For small teams winning and booking more work.", feats: ["Everything in Starter", "Up to 10 users", "Quotes, invoices & payments", "SMS + email sequences", "Review requests"] },
  { id: "pro", name: "Pro", for: "For busy, multi-location businesses.", feats: ["Everything in Growth", "Multi-location + reporting", "Accounting integrations", "Revenue forecasting", "Priority support"] },
  { id: "ent", name: "Enterprise", custom: true, for: "For large operators who need scale and control.", feats: ["Everything in Pro", "White-label portals", "Full API & Zapier", "SSO & audit logs", "Dedicated manager"] },
];
const FAQ = [
  ["Do I need to be technical to use it?", "Not at all. You pick your trade and Relaynest sets up everything for you. If you can use WhatsApp, you can run your whole business here."],
  ["Can I switch from another tool?", "Yes. Import your leads and customers from a spreadsheet in a few clicks, and your Blueprint is ready the same day."],
  ["What if my trade isn’t in the list?", "Choose “Build your own” and name your own stages, booking fields and messages. Relaynest fits any service business, not just the common ones."],
  ["Does it really work in my language and currency?", "Yes — 8 languages and 10 currencies today, detected automatically from where you are, and you can change both any time."],
  ["Will it work on my phone?", "Relaynest is built mobile-first. You and your customers can do everything from a phone, out in the field or on the sofa."],
  ["Can I cancel anytime?", "Yes. Plans are month to month with no lock-in, and your data is always yours to export."],
];
const I18N = {
  en: { pill: "New · AI replies to leads in under 60 seconds", title: "Win every client.", sub: "From your first job to your thousandth. Lead follow-up, booking and a client portal — tailored to your trade, in your language and currency.", cta1: "Start your trial", cta2: "Try the live demo", micro: "Loved by service businesses in 12 countries", nav: "Start your trial", rtl: false },
  hi: { pill: "नया · AI 60 सेकंड में लीड का जवाब देता है", title: "हर ग्राहक को जीतें।", sub: "पहले काम से हज़ारवें तक। लीड फ़ॉलो-अप, बुकिंग और क्लाइंट पोर्टल — आपके काम के अनुसार, आपकी भाषा और मुद्रा में।", cta1: "अपना ट्रायल शुरू करें", cta2: "लाइव डेमो देखें", micro: "12 देशों के सेवा व्यवसायों का पसंदीदा", nav: "ट्रायल शुरू करें", rtl: false },
  es: { pill: "Nuevo · la IA responde en menos de 60 s", title: "Gana a cada cliente.", sub: "Desde tu primer trabajo hasta el número mil. Seguimiento, reservas y portal de clientes — adaptado a tu oficio, en tu idioma y tu moneda.", cta1: "Comienza tu prueba", cta2: "Ver el demo", micro: "La eligen negocios de servicios en 12 países", nav: "Comienza tu prueba", rtl: false },
  fr: { pill: "Nouveau · l’IA répond en moins de 60 s", title: "Gagnez chaque client.", sub: "Du premier chantier au millième. Suivi, réservations et portail client — adapté à votre métier, dans votre langue et votre devise.", cta1: "Commencez votre essai", cta2: "Voir la démo", micro: "Adopté par des entreprises de services dans 12 pays", nav: "Commencez l’essai", rtl: false },
  ar: { pill: "جديد · الذكاء الاصطناعي يرد في أقل من 60 ثانية", title: "اكسب كل عميل.", sub: "من أول عمل إلى الألف. متابعة العملاء، الحجز وبوابة العميل — مصممة لمهنتك، بلغتك وعملتك.", cta1: "ابدأ تجربتك", cta2: "جرّب العرض", micro: "يحبها أصحاب الأعمال الخدمية في 12 دولة", nav: "ابدأ تجربتك", rtl: true },
};

/* ---------- helpers that return raw HTML for injected blocks ---------- */
function previewHTML(bp) {
  const stageHtml = bp.stages.map((s, i) => '<span class="chip">' + s + "</span>" + (i < bp.stages.length - 1 ? '<span class="arw">' + svgStr(P.arrow) + "</span>" : "")).join("");
  const bookHtml = bp.booking.map((f) => '<div class="field"><span class="k">' + f[0] + "</span><span>" + f[1] + "</span></div>").join("");
  const msg = bp.msg.replace(/\{(name|service)\}/g, (m, k) => '<span class="tok">' + (k === "name" ? "Olivia" : bp.sample) + "</span>");
  return (
    '<div class="bp-card"><div class="bp-head"><span class="ic">' + svgStr(P[bp.icon]) + "</span><span><b>" + bp.name + "</b><small>" + bp.sub + "</small></span></div>" +
    '<h4>Your pipeline</h4><div class="flowline" style="margin-bottom:22px">' + stageHtml + "</div>" +
    '<h4>Automated follow-up</h4><div class="msg">' + msg + '<div class="msg-meta"><span class="tag">Auto</span>' + bp.trigger + "</div></div></div>" +
    '<div class="bp-card"><div class="stack"><div><h4>Online booking form</h4>' + bookHtml + "</div>" +
    '<div><h4>Client portal</h4><div class="portal-line">' + svgStr(P.check) + "<span>" + bp.portal + "</span></div></div></div></div>"
  );
}
function demoFrames() {
  return [
    '<div class="demo-step"><span class="n">1</span> New lead captured</div><div class="d-card show"><div class="d-lead"><span class="av">OR</span><div><b>Olivia Rhye</b><small>Annual vehicle service</small></div><span class="src">Website</span></div></div><div class="d-progress"><i class="on"></i><i></i><i></i><i></i></div>',
    '<div class="demo-step"><span class="n">2</span> Relaynest AI follows up</div><div class="d-card show"><div class="d-lead"><span class="av">OR</span><div><b>Olivia Rhye</b><small>Annual vehicle service</small></div><span class="src">Website</span></div></div><div class="d-card show"><div class="d-typing"><span class="dots"><i></i><i></i><i></i></span> Drafting a reply in English…</div></div><div class="d-progress"><i class="on"></i><i class="on"></i><i></i><i></i></div>',
    '<div class="demo-step"><span class="n">3</span> Sent automatically</div><div class="d-card show"><div class="d-bubble">Hi <span class="tok">Olivia</span>, thanks for your interest in an <span class="tok">annual service</span>. I have Tuesday 9:30 or Thursday 2:00 free — which suits you?</div><div class="msg-meta"><span class="tag">Auto</span> Replied in 38 seconds</div></div><div class="d-progress"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>',
    '<div class="demo-step"><span class="n">4</span> Booked</div><div class="d-card show"><div class="d-win"><span class="ok">' + svgStr(P.check) + '</span><div><b>Appointment booked</b><small>Tuesday 9:30 · added to your calendar</small></div></div></div><div class="d-card show"><div class="d-lead"><span class="av">OR</span><div><b>Olivia Rhye</b><small>In your pipeline · Appointment booked</small></div><span class="src">Won</span></div></div><div class="d-progress"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>',
  ];
}
const DASH_HTML =
  '<div class="dash product-dark" aria-hidden="true">' +
  '<div class="dash-chrome"><i></i><i></i><i></i><span class="u">relaynest / focus</span><span class="r">Sample workspace</span></div>' +
  '<div class="dash-body"><aside class="dash-side">' +
  '<div class="brand"><span class="logo-tile" style="width:28px;height:28px;font-size:15px">R</span><span class="logo-word" style="font-size:17px;color:var(--ink)">relaynest.</span></div>' +
  '<div class="dash-switch"><span class="av">NA</span><span><b>Northside Auto</b><small>Demo business</small></span></div>' +
  '<div><div class="dash-navlabel" style="margin-bottom:8px">Workspace</div><nav class="dash-nav">' +
  '<a class="on">' + svgStr('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>') + " Overview</a>" +
  "<a>" + svgStr('<path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M22 20v-2a4 4 0 0 0-3-3.8"/>') + ' Leads <span class="count">8</span></a>' +
  "<a>" + svgStr('<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>') + " Customers</a>" +
  "<a>" + svgStr('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>') + " Appointments</a>" +
  "<a>" + svgStr('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>') + " Service jobs</a>" +
  "<a>" + svgStr('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/>') + ' Tasks <span class="ndot"></span></a>' +
  "</nav></div></aside>" +
  '<div class="dash-main">' +
  '<div class="dash-topbar"><span class="crumb">Workspace <span class="sep">/</span> <b>Overview</b></span><span class="right">' + svgStr('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>') + svgStr('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>') + "</span></div>" +
  '<div class="dash-banner"><span>Demo workspace · Sample data · Changes stay in this browser</span><a>Create your workspace ' + svgStr('<path d="M5 12h14M13 6l6 6-6 6"/>') + "</a></div>" +
  '<div class="dash-greet"><div><span class="eyebrow">Your day, connected</span><h3>A little follow-up. A lot of possibility.</h3><p>Your business, moving in the right direction.</p></div><span class="dash-newlead">' + svgStr('<path d="M12 5v14M5 12h14"/>') + " New lead</span></div>" +
  '<div class="kpi-row">' +
  '<div class="kpi"><div class="k-top">Total leads ' + svgStr('<path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/>') + '</div><div class="k-big">8</div><div class="k-sub">Across all sources</div></div>' +
  '<div class="kpi"><div class="k-top">Follow-ups due ' + svgStr('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') + '</div><div class="k-big">3</div><div class="k-sub">A little attention needed</div></div>' +
  '<div class="kpi"><div class="k-top">Active jobs ' + svgStr('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>') + '</div><div class="k-big">3</div><div class="k-sub">Good work in progress</div></div>' +
  '<div class="kpi"><div class="k-top">Conversion rate ' + svgStr('<path d="M4 20V4M4 20h16M8 16l3-4 3 2 5-7"/>') + '</div><div class="k-big">25%</div><div class="k-sub">2 inquiries became clients</div></div>' +
  "</div>" +
  '<div class="dash-lower"><div class="pcard"><h5>Your daily focus <a>All tasks</a></h5><div class="lead-sub">5 due items, including 2 overdue. Oldest first.</div>' +
  '<div class="focus-item"><span class="box"></span><span class="ft"><b>Follow up on the brake inspection</b><small>Phoenix Baker · High priority</small></span><span class="due over">Overdue</span></div>' +
  '<div class="focus-item"><span class="box"></span><span class="ft"><b>Prepare Olivia’s service estimate</b><small>Olivia Rhye · Medium priority</small></span><span class="due">Today</span></div>' +
  '<div class="focus-item"><span class="box"></span><span class="ft"><b>Confirm tomorrow’s appointments</b><small>3 appointments · Low priority</small></span><span class="due">Tomorrow</span></div>' +
  '<div class="focus-item done"><span class="box">' + svgStr('<path d="M20 6 9 17l-5-5"/>') + '</span><span class="ft"><b>Send Natali her invoice</b><small>Completed this morning</small></span><span class="due">Done</span></div></div>' +
  '<div class="pcard"><h5>Leads by source</h5><div class="lead-sub">Where this month’s enquiries came from.</div>' +
  '<div class="src-row"><span>Website</span><span class="bar"><i style="width:100%"></i></span><span class="v">2</span></div>' +
  '<div class="src-row"><span>Google</span><span class="bar"><i style="width:100%"></i></span><span class="v">2</span></div>' +
  '<div class="src-row"><span>Referral</span><span class="bar"><i style="width:100%"></i></span><span class="v">2</span></div>' +
  '<div class="src-row"><span>WhatsApp</span><span class="bar"><i style="width:50%"></i></span><span class="v">1</span></div>' +
  '<div class="src-row"><span>Meta</span><span class="bar"><i style="width:50%"></i></span><span class="v">1</span></div></div></div>' +
  "</div></div></div>";

function priceFor(plan, cur, billing) {
  const p = PRICES[cur];
  let base = p[plan];
  if (billing === "yearly") { let y = Math.round(base * 0.8); if (cur === "INR") y = Math.round(y / 10) * 10; base = y; }
  return p.sym + base.toLocaleString("en-US");
}

/* ---------- component ---------- */
export function HomeV2() {
  const [lang, setLang] = useState("en");
  const [cur, setCur] = useState("USD");
  const [billing, setBilling] = useState("monthly");
  const [trade, setTrade] = useState(0);
  const [tier, setTier] = useState(0);
  const [frame, setFrame] = useState(0);
  const [menu, setMenu] = useState(false);
  const rootRef = useRef(null);
  const t = I18N[lang] || I18N.en;
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FRAMES = demoFrames();

  useEffect(() => {
    if (reduce) { setFrame(3); return; }
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 2300);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduce || !("IntersectionObserver" in window)) return;
    root.classList.add("anim");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  const langSelect = (cls) => (
    <select className={"picker " + cls} aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}>
      <option value="en">English</option><option value="hi">{"हिन्दी"}</option><option value="es">{"Español"}</option><option value="fr">{"Français"}</option><option value="ar">{"العربية"}</option>
    </select>
  );
  const curSelect = (cls) => (
    <select className={"picker " + cls} aria-label="Currency" value={cur} onChange={(e) => setCur(e.target.value)}>
      <option value="USD">$ USD</option><option value="INR">{"₹ INR"}</option><option value="EUR">{"€ EUR"}</option><option value="GBP">{"£ GBP"}</option><option value="AED">AED</option>
    </select>
  );

  return (
    <div className="ah" ref={rootRef}>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand"><span className="logo-tile">R</span><span className="logo-word">relaynest.</span></Link>
          <nav className="nav-links">
            <a href="#livedemo">Live demo</a><a href="#blueprints">Blueprints</a><a href="#features">Features</a><a href="#compare">Compare</a><a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-actions">
            {langSelect("lang")}
            {curSelect("cur")}
            <Link to="/login" className="login">Log in</Link>
            <Link to="/login" className="cta">{t.nav}</Link>
            <button className="burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <Ic d='<path d="M3 6h18M3 12h18M3 18h18"/>' />
            </button>
          </div>
        </div>
        <div className={"mobile-menu" + (menu ? " open" : "")} onClick={() => setMenu(false)}>
          <a href="#livedemo">Live demo</a><a href="#blueprints">Blueprints</a><a href="#features">Features</a><a href="#compare">Compare</a><a href="#pricing">Pricing</a>
          <Link to="/login">Log in</Link>
          <div className="row">{langSelect("")}{curSelect("")}</div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="inner" dir={t.rtl ? "rtl" : "ltr"}>
            <p className="kicker">{t.pill}</p>
            <h1>{t.title}</h1>
            <p className="tag">{t.sub}</p>
            <div className="links">
              <Link className="lnk" to="/login">{t.cta1}</Link>
              <Link className="lnk" to="/demo/overview">{t.cta2}</Link>
            </div>
            <p className="microtrust">{t.micro}</p>
          </div>
          <div className="hero-visual">
            <div className="demo-frame product-dark" aria-hidden="true">
              <div className="demo-top"><i></i><i></i><i></i><span>relaynest</span><span className="live"><i></i> LIVE</span></div>
              <div className="demo-body" dangerouslySetInnerHTML={{ __html: FRAMES[frame] }} />
            </div>
          </div>
        </section>

        {/* LIVE DEMO DASHBOARD */}
        <section className="chapter grey" id="livedemo">
          <div className="inner">
            <p className="kicker">See the workspace</p>
            <h2>Your whole business, on one calm screen.</h2>
            <p className="tag">The real Relaynest workspace. Leads, follow-ups, jobs and conversion in a single view.</p>
            <div className="links"><Link className="lnk" to="/demo/overview">Open the live demo</Link></div>
          </div>
          <div className="visual dash-wrap reveal" dangerouslySetInnerHTML={{ __html: DASH_HTML }} />
        </section>

        {/* BLUEPRINTS */}
        <section className="chapter" id="blueprints">
          <div className="inner">
            <p className="kicker">Relaynest Blueprints</p>
            <h2>One platform. Every trade. Set up in 60 seconds.</h2>
            <p className="tag">Pick what you do and Relaynest builds your whole workspace around it.</p>
          </div>
          <div className="visual reveal">
            <div className="trade-grid">
              {BLUEPRINTS.map((bp, i) => (
                <button key={bp.id} className={"trade" + (trade === i ? " active" : "")} onClick={() => setTrade(i)}>
                  <Ic d={P[bp.icon]} /><span>{bp.name}</span>
                </button>
              ))}
            </div>
            <div className="bp-preview" dangerouslySetInnerHTML={{ __html: previewHTML(BLUEPRINTS[trade]) }} />
          </div>
        </section>

        {/* FEATURES */}
        <section className="chapter grey" id="features">
          <div className="inner">
            <p className="kicker">The full journey</p>
            <h2>Everything from first contact to repeat business.</h2>
            <p className="tag">No bolt-on tools, no extra logins. One platform, every plan.</p>
          </div>
          <div className="feat-all reveal">
            {FEATURES_ALL.map((f) => (
              <div className="fa-card" key={f.t}><span className="ic"><Ic d={P[f.ic]} /></span><h5>{f.t}</h5><p>{f.d}</p></div>
            ))}
          </div>
        </section>

        {/* GROWS */}
        <section className="chapter" id="grows">
          <div className="inner">
            <p className="kicker">Grows with you</p>
            <h2>From one pair of hands to ten thousand.</h2>
            <p className="tag">The same Relaynest fits a solo laborer and a national enterprise. You never outgrow it.</p>
            <div className="steps">
              {TIERS.map((ti, i) => (
                <button key={ti.name} className={"step-tab" + (tier === i ? " active" : "")} onClick={() => setTier(i)}>{ti.name}</button>
              ))}
            </div>
          </div>
          <div className="visual reveal" style={{ marginTop: 0 }}>
            <div className="grow-panel">
              <div className="grow-left">
                <span className="scale-badge">{TIERS[tier].badge}</span>
                <h3>{TIERS[tier].title}</h3>
                <p>{TIERS[tier].desc}</p>
                <span className="who">{TIERS[tier].who}</span>
              </div>
              <div className="feat-list">
                {TIERS[tier].feats.map((f) => (
                  <div className="f" key={f}><span className="ck"><Ic d={P.check} /></span><b>{f}</b></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMPARE */}
        <section className="chapter grey" id="compare">
          <div className="inner">
            <p className="kicker">Why Relaynest</p>
            <h2>The one built for everyone, everywhere.</h2>
            <p className="tag">Every rival is locked to one size of business and one part of the world.</p>
          </div>
          <div className="visual reveal" style={{ paddingInline: 22 }}>
            <div className="cmp-scroll">
              <table className="cmp-table">
                <colgroup><col /><col className="me-col" /><col /><col /><col /><col /></colgroup>
                <thead><tr><th>Capability</th><th className="me"><span className="cmp-brand"><span className="dot"></span>Relaynest</span></th><th>Jobber</th><th>Housecall Pro</th><th>ServiceTitan</th><th>GoHighLevel</th></tr></thead>
                <tbody>
                  {CMP.map((r) => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      {r.slice(1).map((c, ci) => {
                        const inner = c === "YES" ? <span className="yes"><Ic d={P.check} /></span> : c === "NO" ? <span className="no">{"—"}</span> : <span>{c}</span>;
                        return <td key={ci} className={ci === 0 ? "me-cell" : ""}>{inner}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="chapter" id="pricing">
          <div className="inner">
            <p className="kicker">Pricing</p>
            <h2>Start cheap. Pay in your own currency.</h2>
            <p className="tag">Every plan is full-featured at its level. No surprise add-ons.</p>
            <div className="price-toggle" role="tablist" aria-label="Billing period">
              <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button>
              <button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>Yearly <span className="save-note">save 20%</span></button>
            </div>
          </div>
          <div className="visual reveal" style={{ paddingInline: 22, marginTop: 0 }}>
            <div className="pg">
              {PLANS.map((plan) => (
                <div className={"plan" + (plan.featured ? " featured" : "")} key={plan.id}>
                  {plan.featured && <span className="tagpop">Most popular</span>}
                  <h3>{plan.name}</h3>
                  <div className="tag-for">{plan.for}</div>
                  {plan.custom ? (
                    <>
                      <div className="amt"><span className="num" style={{ fontSize: 30 }}>{"Let’s talk"}</span></div>
                      <div className="bill">Tailored to your scale</div>
                    </>
                  ) : (
                    <>
                      <div className="amt"><span className="num">{priceFor(plan.id, cur, billing)}</span><span className="per">/mo</span></div>
                      <div className="bill">{billing === "yearly" ? "per user, billed yearly" : "per user, billed monthly"}</div>
                    </>
                  )}
                  <Link to="/login" className={"pbtn " + (plan.featured ? "pbtn-primary" : "pbtn-ghost")}>{plan.custom ? "Contact sales" : "Start your trial"}</Link>
                  <ul>{plan.feats.map((f) => (<li key={f}><Ic d={P.check} /><span>{f}</span></li>))}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="chapter grey">
          <div className="inner">
            <p className="kicker">Questions</p>
            <h2>Good to know.</h2>
            <div className="faq reveal">
              {FAQ.map((q) => (
                <details className="q" key={q[0]}>
                  <summary>{q[0]}<span className="pm"><Ic d={P.plus} /></span></summary>
                  <div className="ans">{q[1]}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="chapter dark">
          <div className="inner">
            <h2>Ready to win every client?</h2>
            <p className="tag" style={{ color: "#a1a1a6" }}>Set up your trade in 60 seconds and send your first automated follow-up today.</p>
            <div className="links"><Link className="lnk" to="/login">Start your trial</Link><a className="lnk" href="#blueprints">See it for your trade</a></div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-inner">
          <p className="foot-note">Relaynest is the lead-to-client platform for service businesses worldwide — available in 8 languages and 10 currencies. Sample stories and figures shown on this page are illustrative. Prices shown are indicative and billed per user; taxes may apply.</p>
          <div className="foot-grid">
            <div className="foot-col"><h5>Product</h5><a href="#livedemo">Live demo</a><a href="#blueprints">Blueprints</a><a href="#features">Features</a><a href="#pricing">Pricing</a></div>
            <div className="foot-col"><h5>Trades</h5><a href="#blueprints">Auto garages</a><a href="#blueprints">Salons</a><a href="#blueprints">Trades</a><a href="#blueprints">Clinics</a></div>
            <div className="foot-col"><h5>Company</h5><Link to="/login">Log in</Link><a href="#">About</a><a href="#">Contact</a><a href="#">Blog</a></div>
            <div className="foot-col"><h5>Legal</h5><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/refunds">Refunds</Link><a href="#">Security</a></div>
          </div>
          <div className="foot-bottom"><span>© 2026 Relaynest by Infotec Digital. All rights reserved.</span><span>Made for the world.</span></div>
        </div>
      </footer>
    </div>
  );
}

export default HomeV2;
