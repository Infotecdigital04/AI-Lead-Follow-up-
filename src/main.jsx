import React, { Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./i18n";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/manrope/wght.css";
import "./style.css";
import "./readability.css";
import { Home, Pricing, Login, Checkout, Legal, NotFound } from "./public.jsx";
const Workspace = lazy(() => import("./workspace.jsx"));
const Portal = lazy(() => import("./portal.jsx"));
function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const names = {
      "/": "AI Lead Follow-up & Client Portal",
      "/pricing": "Pricing",
      "/login": "Log in",
      "/privacy": "Privacy",
      "/terms": "Terms",
      "/refunds": "Refunds",
      "/checkout": "Checkout",
    };
    if (names[pathname]) document.title = `${names[pathname]} | Relaynest`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical)
      canonical.href = "https://relaynest.infotecdigital.com" + pathname;
  }, [pathname]);
  return null;
}
export function App() {
  return (
    <BrowserRouter>
      <RouteMetadata />
      <Suspense fallback={<div className="loading">Opening Relaynest...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/demo/*" element={<Workspace demo />} />
          <Route path="/app/*" element={<Workspace />} />
          <Route path="/portal/:id" element={<Portal />} />
          <Route path="/privacy" element={<Legal type="privacy" />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/refunds" element={<Legal type="refunds" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")).render(<App />);
