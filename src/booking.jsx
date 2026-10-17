import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  Pencil,
  UserRound,
} from "lucide-react";
import { Brand } from "./brand";
import "./booking.css";

const steps = ["Service", "Preferred time", "Your details", "Review"];
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function dateLabel(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not selected";
}
export default function Booking() {
  const { id } = useParams();
  return <BookingForm key={id} id={id} />;
}
function BookingForm({ id }) {
  const demo = id === "demo";
  const [biz, setBiz] = useState(demo ? { name: "Northside Auto" } : null);
  const [loading, setLoading] = useState(!demo);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [step, setStep] = useState(0);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const heading = useRef(null);
  const sending = useRef(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const preference = `${dateLabel(date)}${time ? ` at ${time}` : " (flexible time)"} (${timezone})`;
  const set = (patch) => setDetails((d) => ({ ...d, ...patch }));
  useEffect(() => {
    document.title = "Request an appointment | Relaynest";
    if (demo) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    fetch(`/api/book/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "This booking page is unavailable.");
        return data;
      })
      .then(setBiz)
      .catch((e) => {
        if (!controller.signal.aborted)
          setLoadError(e.message || "Unable to open this booking page.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, demo, retry]);
  useEffect(() => {
    if (!loading) heading.current?.focus({ preventScroll: true });
  }, [step, done, loading]);
  function go(next) {
    setError("");
    setStep(next);
  }
  async function advance(event) {
    event.preventDefault();
    setError("");
    if (!service.trim()) {
      setError("Please describe the service you need.");
      setStep(0);
      return;
    }
    if (step >= 1 && (!date || date < localToday())) {
      setError("Choose today or a future date.");
      setStep(1);
      return;
    }
    if (
      step >= 2 &&
      (!details.name.trim() || (!details.email.trim() && !details.phone.trim()))
    ) {
      setError("Add your name and either an email address or phone number.");
      setStep(2);
      return;
    }
    if (step < 3) {
      go(step + 1);
      return;
    }
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    const payload = {
      ...Object.fromEntries(
        Object.entries(details).map(([k, v]) => [k, v.trim()]),
      ),
      service: service.trim(),
      slot: preference,
    };
    try {
      if (demo) {
        const { getDemo, saveDemo } = await import("./data");
        const records = getDemo();
        records.unshift({
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
            notes: `Online booking - requested ${payload.slot}.${payload.notes ? ` Note: ${payload.notes}` : ""}`,
          },
        });
        saveDemo(records);
      } else {
        const response = await fetch(`/api/book/${encodeURIComponent(id)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || "Your request could not be sent. Please try again.",
          );
        }
      }
      setDone(true);
    } catch (e) {
      setError(
        demo
          ? "We couldn't save this demo request in your browser. Please allow local storage and try again."
          : e.message,
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  const summary = (
    <dl className="bk-summary">
      <div>
        <dt>
          <UserRound size={17} /> Service
        </dt>
        <dd>{service || "Tell us what you need"}</dd>
      </div>
      <div>
        <dt>
          <CalendarDays size={17} /> Preferred date
        </dt>
        <dd>{dateLabel(date)}</dd>
      </div>
      <div>
        <dt>
          <Clock size={17} /> Preferred time
        </dt>
        <dd>
          {time || "Flexible"}
          <small>{timezone}</small>
        </dd>
      </div>
    </dl>
  );
  return (
    <div className="bk-page">
      <header className="bk-topbar">
        <Brand />
        <span>Appointment requests</span>
      </header>
      {loading || loadError ? (
        <main className="bk-unavailable">
          <CalendarDays size={32} />
          <h1>
            {loading ? "Opening your booking page" : "Booking page unavailable"}
          </h1>
          <p role={loading ? "status" : "alert"}>
            {loading ? "Getting the business details..." : loadError}
          </p>
          {!loading && (
            <button
              className="bk-button primary"
              onClick={() => setRetry((v) => v + 1)}
            >
              Try again
            </button>
          )}
        </main>
      ) : (
        <main className="bk-layout">
          <aside className="bk-business">
            <span className="bk-business-mark" aria-hidden="true">
              {biz?.name?.slice(0, 2).toUpperCase()}
            </span>
            <p className="bk-eyebrow">
              {demo ? "Sample business" : "Your appointment"}
            </p>
            <h2>{biz?.name}</h2>
            <p>
              Tell us what you need. The team will get in touch to agree the
              details.
            </p>
            {summary}
            <div className="bk-note">
              <Clock size={19} />
              <p>
                Your preferred time is a request, not a confirmed appointment.
              </p>
            </div>
          </aside>
          <section className="bk-main" aria-label="Appointment request">
            {demo && (
              <div className="bk-demo">
                Demo booking{" "}
                <span>Sample data only. Nothing is sent to a business.</span>
              </div>
            )}
            {done ? (
              <div className="bk-success">
                <CheckCircle2 size={44} />
                <h1 ref={heading} tabIndex={-1}>
                  {demo ? "Demo request saved" : "Request received"}
                </h1>
                <p>
                  {demo
                    ? "Your request is now a lead in this browser's demo workspace."
                    : `Thank you, ${details.name.trim().split(" ")[0]}. ${biz?.name} will contact you to confirm availability.`}
                </p>
                <div className="bk-confirmation">
                  <span>Requested service</span>
                  <strong>{service}</strong>
                  <span>Preferred time</span>
                  <strong>{preference}</strong>
                </div>
                <p className="bk-support">
                  {demo
                    ? "No appointment has been booked and no messages have been sent."
                    : "Your appointment is not confirmed until you hear from the team."}
                </p>
                {demo && (
                  <Link className="bk-button primary" to="/demo/leads">
                    View demo leads <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            ) : (
              <>
                <ol className="bk-progress" aria-label="Booking progress">
                  {steps.map((label, i) => (
                    <li
                      key={label}
                      aria-current={step === i ? "step" : undefined}
                      className={i < step ? "complete" : ""}
                    >
                      <span>{i < step ? <Check size={15} /> : i + 1}</span>
                      <b>{label}</b>
                    </li>
                  ))}
                </ol>
                <form className="bk-form" onSubmit={advance}>
                  <div className="bk-form-content">
                    <p className="bk-step-count">Step {step + 1} of 4</p>
                    <h1 ref={heading} tabIndex={-1}>
                      {
                        [
                          "What can we help with?",
                          "When works for you?",
                          "How can we reach you?",
                          "Everything look right?",
                        ][step]
                      }
                    </h1>
                    <p className="bk-intro">
                      {
                        [
                          "Start with a short description of the service you need.",
                          "Choose your preferred date. The team will confirm availability with you.",
                          "Leave a name and at least one way for the team to contact you.",
                          "Review your details before sending your appointment request.",
                        ][step]
                      }
                    </p>
                    {step === 0 && (
                      <label className="bk-field">
                        Service or enquiry
                        <input
                          required
                          maxLength={160}
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          placeholder="For example, an initial consultation"
                        />
                      </label>
                    )}
                    {step === 1 && (
                      <>
                        <div className="bk-fields-two">
                          <label className="bk-field">
                            Preferred date
                            <input
                              required
                              type="date"
                              min={localToday()}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                          </label>
                          <label className="bk-field">
                            Preferred time (optional)
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                            />
                          </label>
                        </div>
                        <p className="bk-support">
                          Times are in {timezone}. Leave the time blank if you
                          are flexible.
                        </p>
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <label className="bk-field">
                          Full name
                          <input
                            required
                            autoComplete="name"
                            maxLength={160}
                            value={details.name}
                            onChange={(e) => set({ name: e.target.value })}
                          />
                        </label>
                        <div className="bk-fields-two">
                          <label className="bk-field">
                            Email address
                            <input
                              type="email"
                              autoComplete="email"
                              maxLength={160}
                              value={details.email}
                              onChange={(e) => set({ email: e.target.value })}
                            />
                          </label>
                          <label className="bk-field">
                            Phone number
                            <input
                              type="tel"
                              autoComplete="tel"
                              maxLength={160}
                              value={details.phone}
                              onChange={(e) => set({ phone: e.target.value })}
                            />
                          </label>
                        </div>
                        <label className="bk-field">
                          Additional details (optional)
                          <textarea
                            rows={3}
                            maxLength={1000}
                            value={details.notes}
                            onChange={(e) => set({ notes: e.target.value })}
                            placeholder="Anything the team should know before getting in touch"
                          />
                        </label>
                      </>
                    )}
                    {step === 3 && (
                      <div className="bk-review">
                        {[
                          { title: "Service", text: service, step: 0 },
                          {
                            title: "Preferred time",
                            text: preference,
                            step: 1,
                          },
                          {
                            title: "Contact details",
                            text: [details.name, details.email, details.phone]
                              .filter(Boolean)
                              .join("\n"),
                            step: 2,
                          },
                        ].map((item) => (
                          <div key={item.title}>
                            <div>
                              <span>{item.title}</span>
                              <p>{item.text}</p>
                            </div>
                            <button
                              type="button"
                              title={`Edit ${item.title.toLowerCase()}`}
                              aria-label={`Edit ${item.title.toLowerCase()}`}
                              disabled={busy}
                              onClick={() => go(item.step)}
                            >
                              <Pencil size={17} />
                            </button>
                          </div>
                        ))}
                        {details.notes && (
                          <div>
                            <div>
                              <span>Additional details</span>
                              <p>{details.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {error && (
                      <p className="bk-error" role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                  <footer className="bk-actions">
                    {step > 0 ? (
                      <button
                        type="button"
                        className="bk-button secondary"
                        disabled={busy}
                        onClick={() => go(step - 1)}
                      >
                        <ArrowLeft size={17} /> Back
                      </button>
                    ) : (
                      <span className="bk-support">
                        <Mail size={16} /> No payment required
                      </span>
                    )}
                    <button className="bk-button primary" disabled={busy}>
                      {busy
                        ? "Sending..."
                        : step === 3
                          ? demo
                            ? "Save demo request"
                            : "Send request"
                          : step === 2
                            ? "Review request"
                            : "Continue"}
                      <ArrowRight size={17} />
                    </button>
                  </footer>
                </form>
              </>
            )}
          </section>
        </main>
      )}
      <footer className="bk-footer">
        <span>Powered by Relaynest</span>
        <Link to="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
