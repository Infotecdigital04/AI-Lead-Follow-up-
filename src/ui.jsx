import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, X, Globe2, Check, Inbox } from "lucide-react";
import { languages } from "./i18n";
export function Brand() {
  return (
    <Link to="/" className="brand">
      <img src="/favicon.svg" width="32" height="32" alt="" />
      relaynest<span className="brand-dot">.</span>
    </Link>
  );
}
export function Language() {
  const { i18n, t } = useTranslation();
  return (
    <label className="language">
      <Globe2 size={16} />
      <select
        aria-label={t("language")}
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {Object.entries(languages).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Badge({ children }) {
  return (
    <span
      className={
        "badge " +
        ({
          New: "blue",
          Hot: "orange",
          Warm: "amber",
          Cold: "gray",
          Converted: "green",
          Paid: "green",
          Ready: "green",
          Completed: "green",
          Confirmed: "green",
          "Follow-up Required": "orange",
          "Quotation Sent": "violet",
          "Appointment Booked": "green",
          High: "orange",
          Partial: "amber",
          Pending: "amber",
          "In progress": "blue",
          "In Progress": "blue",
          "Quality check": "violet",
        }[children] || "gray")
      }
    >
      {children}
    </span>
  );
}
export function Empty({ title, children }) {
  const { t } = useTranslation();
  return (
    <div className="empty">
      <Inbox size={30} />
      <h3>{title || t("noResults")}</h3>
      <p>{children || t("empty")}</p>
    </div>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    const dlg = ref.current;
    dlg.showModal();
    const listener = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    dlg.addEventListener("keydown", listener);
    return () => {
      dlg.removeEventListener("keydown", listener);
      dlg.close();
      old?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = [...document.querySelectorAll("[data-reveal]")];
    let observer,
      frame = 0,
      preference = null;
    try {
      preference = localStorage.getItem("relaynest-motion");
    } catch {
      /* Motion does not require storage. */
    }
    const apply = () => {
      observer?.disconnect();
      const enabled = !media.matches && preference !== "off";
      root.dataset.motion = enabled ? "on" : "off";
      if (enabled && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
              }
            }),
          { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
        );
        elements.forEach((element) => {
          element.classList.add("reveal-ready");
          element.classList.remove("revealed");
          observer.observe(element);
        });
      } else
        elements.forEach((element) => element.classList.remove("reveal-ready"));
      window.dispatchEvent(new Event("relaynest-motion-applied"));
    };
    const changed = (event) => {
      preference = event.detail;
      apply();
    };
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        root.style.setProperty(
          "--page-progress",
          String(scrollY / Math.max(1, root.scrollHeight - innerHeight)),
        );
        root.style.setProperty(
          "--hero-shift",
          root.dataset.motion === "on"
            ? `${Math.min(scrollY * 0.07, 24)}px`
            : "0px",
        );
        frame = 0;
      });
    };
    apply();
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("relaynest-motion", changed);
    media.addEventListener("change", apply);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("relaynest-motion", changed);
      media.removeEventListener("change", apply);
      root.style.removeProperty("--page-progress");
      root.style.removeProperty("--hero-shift");
    };
  }, []);
}
export function Footer() {
  return (
    <footer>
      <Brand />
      <span>Made for the follow-through. By Infotec Digital.</span>
      <div>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refunds">Refunds</Link>
        <a href="mailto:hello@infotecdigital.com">
          Contact <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
export function CheckItem({ children }) {
  return (
    <li>
      <Check size={17} />
      {children}
    </li>
  );
}

