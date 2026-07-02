#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SRC_DIR = "08_본선/_system/visualizations";
const OUT_DIR = "08_본선/assets/excalidraw/exported-images/20260702";
const PADDING = 40;
const GENERATED_AT = "2026-07-02 KST";
const EXPORT_STYLE = "hand-drawn";

const SHARE_PICKS = new Set([
  "workflow-gantt-blueprint",
  "project-master-timeline",
  "team-contribution-role-radar",
  "research-to-product-funnel",
  "evidence-traceability-board",
  "demo-video-storyboard",
]);

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function opacity(el) {
  return Math.max(0, Math.min(1, (el.opacity ?? 100) / 100));
}

function hashString(value) {
  let h = 2166136261;
  for (const ch of String(value)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitter(el, salt, amount = 1.9) {
  const n = hashString(`${el.id}:${salt}`) / 0xffffffff;
  return (n * 2 - 1) * amount * (el.roughness ?? 1);
}

function jitteredPoint(el, x, y, salt, amount = 1.9) {
  return [x + jitter(el, `${salt}:x`, amount), y + jitter(el, `${salt}:y`, amount)];
}

function boundsOf(el) {
  if (el.type === "line" || el.type === "arrow") {
    const xs = el.points.map(([x]) => el.x + x);
    const ys = el.points.map(([, y]) => el.y + y);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }
  return {
    minX: el.x,
    minY: el.y,
    maxX: el.x + (el.width || 0),
    maxY: el.y + (el.height || 0),
  };
}

function sceneBounds(elements) {
  const live = elements.filter((el) => !el.isDeleted);
  const box = live.reduce(
    (acc, el) => {
      const b = boundsOf(el);
      return {
        minX: Math.min(acc.minX, b.minX),
        minY: Math.min(acc.minY, b.minY),
        maxX: Math.max(acc.maxX, b.maxX),
        maxY: Math.max(acc.maxY, b.maxY),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  if (!Number.isFinite(box.minX)) return { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
  return box;
}

function dash(el) {
  if (el.strokeStyle !== "dashed") return "";
  return ' stroke-dasharray="8 6"';
}

function rect(el) {
  const stroke = el.strokeColor === "transparent" ? "none" : esc(el.strokeColor || "#111827");
  const fill = el.backgroundColor === "transparent" ? "none" : esc(el.backgroundColor || "none");
  const fillShape =
    fill === "none"
      ? ""
      : `<path d="${roughRectPath(el, "fill")}" fill="${fill}" stroke="none" opacity="${Math.min(opacity(el), 0.9)}" filter="url(#fillRoughen)" />`;
  const outlineStroke = stroke === "none" ? fill : stroke;
  if (outlineStroke === "none") return fillShape;
  const outlineA = roughRectPath(el, 0);
  const outlineB = roughRectPath(el, 1);
  const sw = Math.max(1.15, el.strokeWidth || 1);
  return `${fillShape}
  <path d="${outlineA}" fill="none" stroke="${outlineStroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity(el) * (stroke === "none" ? 0.34 : 0.82)}"${dash(el)} filter="url(#roughen)" />
  <path d="${outlineB}" fill="none" stroke="${outlineStroke}" stroke-width="${Math.max(0.9, sw * 0.72)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity(el) * (stroke === "none" ? 0.22 : 0.62)}"${dash(el)} />`;
}

function ellipse(el) {
  const stroke = el.strokeColor === "transparent" ? "none" : esc(el.strokeColor || "#111827");
  const fill = el.backgroundColor === "transparent" ? "none" : esc(el.backgroundColor || "none");
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const rx = Math.abs(el.width / 2);
  const ry = Math.abs(el.height / 2);
  const fillShape = fill === "none" ? "" : `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="none" opacity="${Math.min(opacity(el), 0.9)}" />`;
  if (stroke === "none") return fillShape;
  return `${fillShape}
  <ellipse cx="${cx + jitter(el, "ea", 1.2)}" cy="${cy + jitter(el, "eb", 1.2)}" rx="${rx + jitter(el, "ec", 1.5)}" ry="${ry + jitter(el, "ed", 1.5)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(1.1, el.strokeWidth || 1)}" opacity="${opacity(el) * 0.82}"${dash(el)} filter="url(#roughen)" />
  <ellipse cx="${cx + jitter(el, "ee", 1.2)}" cy="${cy + jitter(el, "ef", 1.2)}" rx="${rx + jitter(el, "eg", 1.5)}" ry="${ry + jitter(el, "eh", 1.5)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.85, (el.strokeWidth || 1) * 0.7)}" opacity="${opacity(el) * 0.62}"${dash(el)} />`;
}

function polyline(el, asArrow = false) {
  const ptsA = el.points.map(([x, y], idx) => jitteredPoint(el, el.x + x, el.y + y, `pa${idx}`, 1.6).join(",")).join(" ");
  const ptsB = el.points.map(([x, y], idx) => jitteredPoint(el, el.x + x, el.y + y, `pb${idx}`, 1.4).join(",")).join(" ");
  const markerEnd = asArrow && el.endArrowhead ? ' marker-end="url(#arrowhead)"' : "";
  const markerStart = asArrow && el.startArrowhead ? ' marker-start="url(#arrowhead-start)"' : "";
  const stroke = esc(el.strokeColor || "#111827");
  const sw = Math.max(1.15, el.strokeWidth || 1.5);
  return `<polyline points="${ptsA}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity(el) * 0.76}"${dash(el)} filter="url(#roughen)" />
  <polyline points="${ptsB}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.85, sw * 0.68)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity(el) * 0.66}"${dash(el)}${markerEnd}${markerStart} />`;
}

function roughRectPath(el, pass) {
  const amount = pass === 0 ? 3.1 : pass === 1 ? 2.3 : 1.7;
  const x = el.x;
  const y = el.y;
  const w = el.width || 0;
  const h = el.height || 0;
  const p1 = jitteredPoint(el, x, y, `r${pass}:1`, amount);
  const p2 = jitteredPoint(el, x + w, y, `r${pass}:2`, amount);
  const p3 = jitteredPoint(el, x + w, y + h, `r${pass}:3`, amount);
  const p4 = jitteredPoint(el, x, y + h, `r${pass}:4`, amount);
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} L ${p4[0]} ${p4[1]} Z`;
}

function text(el) {
  const fontSize = el.fontSize || 16;
  const lineHeight = fontSize * (el.lineHeight || 1.25);
  const anchor = el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start";
  const x = el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x;
  const y = el.y + fontSize;
  const lines = String(el.text || "").split("\n");
  const tspans = lines
    .map((line, idx) => `<tspan x="${x}" dy="${idx === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
    .join("");
  const weight = fontSize >= 20 ? 700 : 500;
  return `<text x="${x}" y="${y}" fill="${esc(el.strokeColor || "#111827")}" font-family="Virgil, Comic Sans MS, Pretendard, Apple SD Gothic Neo, Noto Sans CJK KR, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity(el)}">${tspans}</text>`;
}

function renderElement(el) {
  if (el.type === "rectangle") return rect(el);
  if (el.type === "ellipse") return ellipse(el);
  if (el.type === "line") return polyline(el);
  if (el.type === "arrow") return polyline(el, true);
  if (el.type === "text") return text(el);
  return `<!-- unsupported element: ${esc(el.type)} -->`;
}

function svgFor(name, elements) {
  const box = sceneBounds(elements);
  const minX = Math.floor(box.minX - PADDING);
  const minY = Math.floor(box.minY - PADDING);
  const width = Math.ceil(box.maxX - box.minX + PADDING * 2);
  const height = Math.ceil(box.maxY - box.minY + PADDING * 2);
  const body = elements.filter((el) => !el.isDeleted).map(renderElement).join("\n  ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-label="${esc(name)}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#1e293b" />
    </marker>
    <marker id="arrowhead-start" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M9,0 L9,6 L0,3 z" fill="#1e293b" />
    </marker>
    <filter id="roughen" x="-4%" y="-4%" width="108%" height="108%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.65" />
    </filter>
    <filter id="fillRoughen" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.35" />
    </filter>
  </defs>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />
  ${body}
</svg>
`;
}

function writeIndex(rows) {
  const lines = [
    "---",
    "tags:",
    "  - area/assets",
    "  - type/index",
    "  - status/active",
    "date: 2026-07-02",
    'up: "[[08_본선/_system/visualizations/_viz-index|시각화 인덱스]]"',
    "---",
    "",
    "# Excalidraw Exported Images",
    "",
    `- Generated: ${GENERATED_AT}`,
    `- Export style: ${EXPORT_STYLE}`,
    "- Source: `08_본선/_system/visualizations/*.excalidraw`",
    "- Output: `08_본선/assets/excalidraw/exported-images/20260702/`",
    "",
    "## 공유 우선 후보",
    "",
    "| 우선 | 이미지 | 원본 | 용도 |",
    "|---|---|---|---|",
  ];

  for (const row of rows.filter((row) => SHARE_PICKS.has(row.name))) {
    lines.push(
      `| ✅ | ![[${row.png}]] | \`${path.relative(OUT_DIR, row.source)}\` | ${purpose(row.name)} |`,
    );
  }

  lines.push("", "## 전체 Export", "", "| PNG | SVG | 원본 |", "|---|---|---|");
  for (const row of rows) {
    lines.push(`| \`${row.png}\` | \`${row.svg}\` | \`${row.source}\` |`);
  }
  lines.push("");
  fs.writeFileSync(path.join(OUT_DIR, "_export-index.md"), `${lines.join("\n")}\n`);
}

function purpose(name) {
  return {
    "workflow-gantt-blueprint": "팀 운영·간트·역할 보고",
    "project-master-timeline": "프로젝트 전체 일정 공유",
    "team-contribution-role-radar": "팀원/AI 기여 설명",
    "research-to-product-funnel": "리서치→제품결정 흐름",
    "evidence-traceability-board": "주장→근거→제출물 추적",
    "demo-video-storyboard": "시연영상 구성 논의",
  }[name] || "공유 후보";
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const rows = [];
for (const file of fs.readdirSync(SRC_DIR).filter((file) => file.endsWith(".excalidraw")).sort()) {
  const source = path.join(SRC_DIR, file);
  const name = path.basename(file, ".excalidraw");
  const json = JSON.parse(fs.readFileSync(source, "utf8"));
  const svg = `${name}.svg`;
  const png = `${name}.png`;
  const svgPath = path.join(OUT_DIR, svg);
  const pngPath = path.join(OUT_DIR, png);
  fs.writeFileSync(svgPath, svgFor(name, json.elements || []));
  execFileSync("rsvg-convert", ["--format=png", "--output", pngPath, svgPath], { stdio: "inherit" });
  rows.push({ name, source, svg, png });
}

writeIndex(rows);
console.log(`[viz-exporter] exported ${rows.length} boards to ${OUT_DIR}`);
