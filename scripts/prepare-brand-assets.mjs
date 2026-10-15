import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const [icon, dark, light] = process.argv.slice(2);
if (!icon || !dark || !light) {
  throw new Error(
    "Provide the supplied icon, dark logo and light logo PNG paths.",
  );
}
await mkdir("public/brand", { recursive: true });
const wordmarks = [
  [light, "logo-light", { left: 225, top: 295, width: 1330, height: 310 }],
  [dark, "logo-dark", { left: 280, top: 300, width: 1210, height: 300 }],
];
for (const [source, name, crop] of wordmarks) {
  await sharp(source)
    .extract(crop)
    .resize({ width: 704 })
    .webp({ quality: 94 })
    .toFile(`public/brand/${name}.webp`);
}
const mark = () =>
  sharp(icon).extract({ left: 248, top: 272, width: 760, height: 760 });
await mark()
  .resize(256, 256)
  .webp({ quality: 94 })
  .toFile("public/brand/mark.webp");
await mark().resize(180, 180).png().toFile("public/apple-touch-icon.png");
const icons = [];
for (const size of [16, 32]) {
  const png = await mark().resize(size, size).png().toBuffer();
  await writeFile(`public/favicon-${size}.png`, png);
  icons.push({ size, png });
}
// ICO entries wrap the resized PNGs; no artwork is redrawn.
const header = Buffer.alloc(6 + icons.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icons.length, 4);
let offset = header.length;
icons.forEach(({ size, png }, index) => {
  const entry = 6 + index * 16;
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile(
  "public/favicon.ico",
  Buffer.concat([header, ...icons.map((i) => i.png)]),
);
const legacy = await mark().resize(64, 64).png().toBuffer();
await writeFile(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${legacy.toString("base64")}"/></svg>\n`,
);
console.log(
  "Prepared original-artwork logo variants, favicons and Apple touch icon.",
);
