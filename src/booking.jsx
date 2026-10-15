import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./booking.css";

const SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];
const QUICK = ["New enquiry", "Repair", "Service", "Quote / estimate", "Consultation"];

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function Logo() {
  return (
    <span className="bk-brand">
      <span className="bk-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
      Relaynest
    </span>
  );
}

export default function Booking() {
  const { id } = useParams();
  const demo = id === "demo";
  const [biz, setBiz] = useState(demo ? { name: "Northside Auto" } : null);
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(!demo);
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Book an appointment";
    if (demo) return;
    let alive = true;
    fetch("/api/book/" + encodeURIComponent(id))
      .then((r) => r.json().then((d) => (r.ok ? d : Promise.reject(d))))
      .then((d) => alive && setBiz(d))
      .catch((e) => alive && setLoadErr(e.error || "This booking page isn't available."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id, demo]);

  const today = new Date().toISOString().slice(0, 10);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const hasContact = form.name.trim() && (form.email.trim() || form.phone.trim());

  async function submit() {
    setSubmitting(true);
    setErr("");
    const slotLabel = date ? `${fmtDate(date)}${slot ? " at " + slot : ""}` : "";
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service: service.trim(),
      slot: slotLabel,
      notes: form.notes.trim(),
    };
    try {
      if (demo) {
        try {
          const { getDemo, saveDemo } = await import("./data");
          const recs = getDemo();
          recs.unshift({
            id: crypto.randomUUID(),
            kind: "leads",
            data: {
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              service: payload.service,
              source: "Booking",
              status: "Appointment Booked",
              temperature: "Warm",
              followup: "",
              value: 0,
              currency: "USD",
              assignee: "",
              notes:
                `Online booking — requested ${payload.slot || "no time given"}.` +
                (payload.notes ? ` Note: ${payload.notes}` : ""),
            },
          });
          saveDemo(recs);
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 450));
      } else {
        const r = await fetch("/api/book/" + encodeURIComponent(id), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.error || "Could not send your booking. Please try again.");
        }
      }
      setDone(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="bk-page">
        <div className="bk-card bk-center">Loading…</div>
      </div>
    );

  if (loadErr)
    return (
      <div className="bk-page">
        <div className="bk-card bk-center">
          <h1 className="bk-h1">Page not available</h1>
          <p className="bk-sub">{loadErr}</p>
          <Logo />
        </div>
      </div>
    );

  if (done)
    return (
      <div className="bk-page">
        <div className="bk-card bk-success">
          <span className="bk-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="bk-h1">Request sent</h1>
          <p className="bk-sub">
            Thanks{form.name ? ", " + form.name.split(" ")[0] : ""}! {biz?.name || "The team"} has
            received your request{slot || date ? ` for ${fmtDate(date)}${slot ? " at " + slot : ""}` : ""}
            {" "}and will confirm shortly.
          </p>
          <div className="bk-recap">
            <div>
              <span>Service</span>
              <b>{service}</b>
            </div>
            {date && (
              <div>
                <span>Preferred time</span>
                <b>
                  {fmtDate(date)}
                  {slot ? " · " + slot : ""}
                </b>
              </div>
            )}
          </div>
          <p className="bk-powered">
            Powered by <Logo />
          </p>
        </div>
      </div>
    );

  const canNext = step === 1 ? service.trim() : step === 2 ? !!date : hasContact;

  return (
    <div className="bk-page">
      <div className="bk-card">
        <header className="bk-head">
          <div className="bk-biz">
            <span className="bk-biz-avatar">{(biz?.name || "B").slice(0, 2).toUpperCase()}</span>
            <div>
              <div className="bk-biz-name">{biz?.name || "Book an appointment"}</div>
              <div className="bk-biz-sub">Book an appointment</div>
            </div>
          </div>
          <div className="bk-steps" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span key={n} className={"bk-dot" + (n <= step ? " on" : "")} />
            ))}
          </div>
        </header>

        <div className="bk-body">
          {step === 1 && (
            <div className="bk-step">
              <h1 className="bk-h1">What can we help with?</h1>
              <p className="bk-sub">Tell us what you need and we'll take it from there.</p>
              <input
                className="bk-input"
                autoFocus
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. Full service, brake repair, consultation…"
                maxLength={160}
              />
              <div className="bk-chips">
                {QUICK.map((q) => (
                  <button
                    type="button"
                    key={q}
                    className={"bk-chip" + (service === q ? " on" : "")}
                    onClick={() => setService(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bk-step">
              <h1 className="bk-h1">Pick a time</h1>
              <p className="bk-sub">Choose a day and a slot that suits you. We'll confirm availability.</p>
              <label className="bk-label">
                Preferred date
                <input
                  className="bk-input"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSlot("");
                  }}
                />
              </label>
              {date && (
                <>
                  <div className="bk-label" style={{ marginTop: 4 }}>
                    Preferred time <span className="bk-opt">(optional)</span>
                  </div>
                  <div className="bk-slots">
                    <button
                      type="button"
                      className={"bk-slot" + (slot === "" ? " on" : "")}
                      onClick={() => setSlot("")}
                    >
                      I'm flexible
                    </button>
                    {SLOTS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={"bk-slot" + (slot === s ? " on" : "")}
                        onClick={() => setSlot(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="bk-step">
              <h1 className="bk-h1">Your details</h1>
              <p className="bk-sub">So we can confirm your booking.</p>
              <label className="bk-label">
                Full name
                <input
                  className="bk-input"
                  autoFocus
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Your name"
                  maxLength={160}
                />
              </label>
              <div className="bk-two">
                <label className="bk-label">
                  Email
                  <input
                    className="bk-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="you@email.com"
                  />
                </label>
                <label className="bk-label">
                  Phone
                  <input
                    className="bk-input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    placeholder="Mobile number"
                  />
                </label>
              </div>
              <label className="bk-label">
                Anything else? <span className="bk-opt">(optional)</span>
                <textarea
                  className="bk-input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="Vehicle, symptoms, preferences…"
                  maxLength={1000}
                />
              </label>
              {!hasContact && (form.name || form.email || form.phone) && (
                <p className="bk-hint">Please add your name and an email or phone so we can reach you.</p>
              )}
              {err && <p className="bk-err">{err}</p>}
            </div>
          )}
        </div>

        <footer className="bk-foot">
          {step > 1 ? (
            <button type="button" className="bk-btn ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <span className="bk-powered-sm">
              Powered by <Logo />
            </span>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="bk-btn pri"
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="bk-btn pri"
              disabled={!hasContact || submitting}
              onClick={submit}
            >
              {submitting ? "Sending…" : "Confirm booking"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
