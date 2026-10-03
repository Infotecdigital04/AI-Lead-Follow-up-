import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import "./i18n";
import { Home, Pricing, Legal } from "./public";
export function render(path) {
  return renderToString(
    <MemoryRouter initialEntries={["/" + path]}>
      {path === "" ? (
        <Home />
      ) : path === "pricing" ? (
        <Pricing />
      ) : (
        <Legal type={path} />
      )}
    </MemoryRouter>,
  );
}
