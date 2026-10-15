import React from "react";
import { Link } from "react-router-dom";

export function Brand({ className = "brand", tone = "light" }) {
  return (
    <Link
      to="/"
      className={`${className} rn-brand rn-brand-${tone}`}
      aria-label="Relaynest home"
    >
      <img
        className="rn-brand-image"
        src={`/brand/logo-${tone}.webp?v=nest2`}
        width="704"
        height={tone === "dark" ? "183" : "164"}
        alt="Relaynest"
        decoding="async"
      />
    </Link>
  );
}

export function BrandIcon() {
  return (
    <img
      className="rn-brand-icon"
      src="/brand/mark.webp?v=nest2"
      width="40"
      height="40"
      alt="Relaynest"
      decoding="async"
    />
  );
}
