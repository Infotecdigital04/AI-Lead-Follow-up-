import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
await build({
  configLoader: "native",
  build: { ssr: "src/prerender.jsx", outDir: "work/ssr", emptyOutDir: true },
});
const { render } = await import(
  pathToFileURL(resolve("work/ssr/prerender.js")).href
);
const shell = await readFile("dist/index.html", "utf8");
const pages = [
  ["", "Relaynest | AI Lead Follow-up & Client Portal"],
  ["pricing", "Pricing | Relaynest"],
  ["privacy", "Privacy | Relaynest"],
  ["terms", "Terms | Relaynest"],
  ["refunds", "Refunds | Relaynest"],
];
for (const [path, title] of pages) {
  const markup = render(path);
  const html = shell
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      'rel="canonical" href="https://relaynest.infotecdigital.com/"',
      `rel="canonical" href="https://relaynest.infotecdigital.com/${path}"`,
    );
  const dir = path ? `dist/${path}` : "dist";
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, html);
}
console.log(
  "Pre-rendered 5 public pages for fast loading and search indexing.",
);
