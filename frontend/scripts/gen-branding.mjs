// One-off placeholder branding generator for Onewatch.
// Renders green-themed logo/icon assets from inline SVG into public/.
// Run: node scripts/gen-branding.mjs   (needs sharp + png-to-ico installed)
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUB = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const GREEN = "#16a34a";
const GREEN_LT = "#22c55e";
const DARK = "#141414";

// Square app icon: green rounded tile with a white play triangle.
const iconSvg = (size, pad = 0.12) => {
  const r = size * 0.22;
  const inset = size * pad;
  const box = size - inset * 2;
  // play triangle inside the tile
  const cx = inset + box * 0.5;
  const cy = inset + box * 0.5;
  const t = box * 0.22;
  const p1 = `${cx - t * 0.75},${cy - t}`;
  const p2 = `${cx - t * 0.75},${cy + t}`;
  const p3 = `${cx + t},${cy}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${GREEN_LT}"/><stop offset="1" stop-color="${GREEN}"/>
  </linearGradient></defs>
  <rect x="${inset}" y="${inset}" width="${box}" height="${box}" rx="${r}" fill="url(#g)"/>
  <polygon points="${p1} ${p2} ${p3}" fill="#ffffff"/>
</svg>`;
};

// Wordmark: play glyph + "Onewatch" text. optional dark background.
const wordmarkSvg = (w, h, bg) => {
  const cy = h / 2;
  const ps = h * 0.34; // play size
  const px = w * 0.06;
  const p1 = `${px},${cy - ps}`;
  const p2 = `${px},${cy + ps}`;
  const p3 = `${px + ps * 1.6},${cy}`;
  const fs = h * 0.42;
  const tx = px + ps * 1.6 + w * 0.03;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}
  <polygon points="${p1} ${p2} ${p3}" fill="${GREEN}"/>
  <text x="${tx}" y="${cy}" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif"
    font-weight="800" font-size="${fs}" letter-spacing="-2" fill="#ffffff">Onewatch</text>
</svg>`;
};

const png = (svg, out, w, h) =>
  sharp(Buffer.from(svg)).resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(join(PUB, out));

const flatPng = (svg, out) => sharp(Buffer.from(svg)).png().toFile(join(PUB, out));

// Square icons
const squares = [
  ["favicon-16x16.png", 16], ["favicon-32x32.png", 32],
  ["apple-touch-icon-180x180.png", 180], ["pwa-64x64.png", 64],
  ["pwa-192x192.png", 192], ["pwa-512x512.png", 512],
  ["ONEWATCH_LOGO_round.png", 512],
];
for (const [name, s] of squares) await flatPng(iconSvg(s), name);
// Maskable: extra padding for the safe zone
await flatPng(iconSvg(512, 0.2), "maskable-icon-512x512.png");

// Wordmarks
await png(wordmarkSvg(640, 160), "ONEWATCH_LOGO.png", 640, 160);
await png(wordmarkSvg(640, 160), "new-logo-onewatch.png", 640, 160);

// OG / social card 1200x630 on dark bg
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${DARK}"/>
  <g transform="translate(300,235)">${wordmarkSvg(600, 160, null).replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="600" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
    font-size="34" fill="#b3b3b3">Watch Free Movies &amp; TV Shows Online</text>
</svg>`;
await flatPng(og, "meta_tag.png");

// favicon.ico from 16/32/48
const icoBufs = await Promise.all([16, 32, 48].map((s) =>
  sharp(Buffer.from(iconSvg(s))).png().toBuffer()));
await writeFile(join(PUB, "favicon.ico"), await pngToIco(icoBufs));

console.log("branding assets generated");
