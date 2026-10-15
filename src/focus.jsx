import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCheck,
  Clock3,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  SquareCheckBig,
  Layers3,
} from "lucide-react";
import { today, dateLabel } from "./data";
import { focusItems } from "./focus.js";
import "./workspace-polish.css";

const kinds = {
  leads: ["Follow-ups", MessageCircle],
  tasks: ["Tasks", SquareCheckBig],
  jobs: ["Services", Layers3],
};

export function DailyFocus({ records, base, onSelect }) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(today);
  useEffect(() => {
    const timer = setInterval(() => setDate(today()), 60000);
    return () => clearInterval(timer);
  }, []);
  const items = focusItems(records, date);
  const filtered = items.filter(
    (item) => filter === "all" || item.record.kind === filter,
  );
  const visible = expanded ? filtered : filtered.slice(0, 3);
  const overdue = items.filter((item) => item.due < date).length;
  return (
    <section className="daily-focus" aria-labelledby="focus-heading">
      <div className="focus-top">
        <div>
          <span className="focus-eyebrow">
            <Clock3 size={14} /> YOUR DAILY FOCUS
          </span>
          <h2 id="focus-heading">
            {items.length
              ? "Your next steps."
              : "Nothing due. Room to breathe."}
          </h2>
          <p>
            {items.length
              ? `${items.length} items need your attention. Oldest first.`
              : "No dated follow-ups, tasks or services are due today."}
          </p>
        </div>
        <div className="focus-top-actions">
          {overdue > 0 && (
            <span className="focus-overdue-count">{overdue} overdue</span>
          )}
          <Link to={`${base}/tasks`} className="text-button">
            All tasks <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="focus-filters" aria-label="Filter daily focus">
        {[
          ["all", "All"],
          ...Object.entries(kinds).map(([key, [label]]) => [key, label]),
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={filter === key}
            onClick={() => {
              setFilter(key);
              setExpanded(false);
            }}
          >
            {label}
            <span>
              {key === "all"
                ? items.length
                : items.filter((item) => item.record.kind === key).length}
            </span>
          </button>
        ))}
      </div>
      {visible.length > 0 && (
        <div className="focus-column-labels" aria-hidden="true">
          <span>Next step</span>
          <span>Due</span>
          <span />
        </div>
      )}
      <div className="focus-results" aria-live="polite">
        {visible.length ? (
          visible.map(({ record, due, action }) => {
            const [label, Icon] = kinds[record.kind];
            return (
              <button
                className="focus-row"
                key={record.id}
                onClick={() => onSelect(record)}
              >
                <span className={`focus-symbol ${record.kind}`}>
                  <Icon size={18} />
                </span>
                <span className="focus-record">
                  <strong>{record.data.name || record.data.title}</strong>
                  <small>
                    {label}
                    <span aria-hidden="true"> · </span>
                    {record.data.service ||
                      record.data.customer ||
                      record.data.status}
                  </small>
                </span>
                <span className={due < date ? "focus-due past" : "focus-due"}>
                  <span>{due < date ? "Overdue" : "Today"}</span>
                  <time dateTime={due}>{dateLabel(due)}</time>
                </span>
                <span className="focus-action">
                  <span className="sr-only">{action}</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </span>
              </button>
            );
          })
        ) : (
          <div className="focus-clear">
            <CheckCheck size={22} />
            <span>
              {items.length
                ? "Nothing due in this category."
                : "Your next steps are up to date."}
            </span>
          </div>
        )}
      </div>
      {filtered.length > 0 && (
        <div className="focus-bottom">
          <span>
            Showing {visible.length} of {filtered.length}
          </span>
          {filtered.length > 3 && (
            <button
              className="focus-expand text-button"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show fewer" : `View all ${filtered.length}`}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
