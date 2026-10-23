import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Check,
  Clock,
  Layers3,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Brand, Language, Badge, Empty } from "./ui";
import { api, getDemo, stages, dateLabel } from "./data";
export default function Portal() {
  const { id } = useParams();
  const demo = id === "demo";
  const [job, setJob] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    document.title = "Your service | Relaynest";
    if (demo) {
      const r = getDemo().find((r) => r.kind === "jobs");
      if (r)
        setJob({
          ...r.data,
          id: r.id,
          updates: r.data.updates.filter((u) => u.visible),
        });
      else
        setError(
          "There are no sample services. Reset the demo workspace to restore them.",
        );
    } else
      api("/portal/" + id)
        .then(setJob)
        .catch((e) => setError(e.message));
  }, [id, demo]);
  return (
    <div className="client-page">
      <header className="client-header">
        <Brand />
        <Language />
      </header>
      {demo && (
        <div className="client-demo">
          Client portal demo · Sample service
          <Link to="/demo/jobs">
            Back to workspace
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
      <main className="client-content">
        <span className="eyebrow">A LITTLE PEACE OF MIND</span>
        <h1>Your service, in the picture.</h1>
        <p>Good work is happening. Here’s where things stand.</p>
        {error ? (
          <div className="panel portal-error">
            <p>{error}</p>
            {!demo && (
              <Link
                className="button primary"
                to={`/login?next=${encodeURIComponent("/portal/" + id)}`}
              >
                Sign in to view your service
              </Link>
            )}
          </div>
        ) : !job ? (
          <p>Loading your service...</p>
        ) : (
          <>
            <section className="service-summary">
              <span className="feature-icon teal">
                <Layers3 />
              </span>
              <div>
                <span className="muted">
                  SERVICE #{job.id.slice(-4).toUpperCase()}
                </span>
                <h2>{job.title}</h2>
                <p>{job.customer}</p>
              </div>
              <Badge>{job.stage}</Badge>
            </section>
            <section className="service-progress">
              {stages.map((s, i) => (
                <div
                  className={i <= stages.indexOf(job.stage) ? "complete" : ""}
                  key={s}
                >
                  <span>
                    {i < stages.indexOf(job.stage) ? (
                      <Check size={16} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <strong>{s}</strong>
                </div>
              ))}
            </section>
            <div className="client-columns">
              <section>
                <h2>The latest on your service</h2>
                <div className="updates-list client-updates">
                  {job.updates.length ? (
                    job.updates
                      .slice()
                      .reverse()
                      .map((u, i) => (
                        <div key={i}>
                          <span className="timeline-marker" />
                          <div>
                            <small>{dateLabel(u.date)}</small>
                            <p>{u.text}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <Empty title="Updates will appear here" />
                  )}
                </div>
              </section>
              <aside>
                <h3>
                  <Clock size={18} />
                  Expected completion
                </h3>
                <strong className="completion-date">
                  {dateLabel(job.due)}
                </strong>
                <p>Your service team will confirm when everything is ready.</p>
                <div className="portal-help">
                  <MessageCircle size={20} />
                  <h3>A question along the way?</h3>
                  <p>
                    Reply to your service team using the contact details in your
                    booking confirmation.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
        <div className="client-security">
          <ShieldCheck size={16} />
          Only updates approved for you are shown here.
        </div>
      </main>
      <footer className="client-footer">
        Powered by <Brand />
      </footer>
    </div>
  );
}
