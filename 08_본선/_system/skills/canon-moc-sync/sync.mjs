#!/usr/bin/env node
/**
 * canon-moc-sync v2 — 섹션 인지 MOC 동기화 + frontmatter 보정
 *
 * 버그픽스: 기본 MOC 경로를 실제 위치(_MOC/_MOC_HOME.md)로 자동 탐색.
 * 맵-인지 라우팅: 파일 경로에 따라 해당 섹션 MOC에 위키링크를 추가.
 * 모드:
 *   --dry-run (기본) — 리포트만 출력, 파일 수정 없음
 *   --apply          — 섹션 MOC에 위키링크 1행 추가 + frontmatter 보정
 *
 * 표준 라이브러리만 사용.
 */

import fs from "node:fs";
import path from "node:path";

// ── 설정 ──────────────────────────────────────────────────────────────────

// 실행 위치에 무관하게 08_본선 루트를 안정적으로 탐색
function findVaultRoot() {
  const candidates = [
    // node 로 직접 호출: cwd = project root
    path.join(process.cwd(), "08_본선"),
    // cwd 가 이미 08_본선 인 경우
    process.cwd(),
    // cwd 가 _system/skills/canon-moc-sync 인 경우
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", ".."),
  ];
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, "_MOC"))) return p;
  }
  // 최후 폴백: cwd 기준 08_본선
  return path.join(process.cwd(), "08_본선");
}

const VAULT_ROOT = findVaultRoot();
const SYSTEM_DIR = path.join(VAULT_ROOT, "_system");
const MOC_DIR    = path.join(VAULT_ROOT, "_MOC");

// 섹션 → MOC 파일 매핑 (경로 접두사 기준)
const SECTION_ROUTES = [
  { prefix: path.join(VAULT_ROOT, "01_대회정보"), moc: path.join(MOC_DIR, "_01_대회정보_MOC.md") },
  { prefix: path.join(VAULT_ROOT, "02_전략"),     moc: path.join(MOC_DIR, "_02_전략_MOC.md") },
  { prefix: path.join(VAULT_ROOT, "03_제품"),     moc: path.join(MOC_DIR, "_03_제품_MOC.md") },
  { prefix: path.join(VAULT_ROOT, "04_증빙"),     moc: path.join(MOC_DIR, "_04_증빙_MOC.md") },
  { prefix: path.join(VAULT_ROOT, "05_제출"),     moc: path.join(MOC_DIR, "_05_제출_MOC.md") },
  // _system, _분석, _MOC, 루트 파일은 시스템 MOC로
  { prefix: path.join(VAULT_ROOT, "_system"),     moc: path.join(MOC_DIR, "_system_tools_MOC.md") },
  { prefix: path.join(VAULT_ROOT, "_분석"),       moc: path.join(MOC_DIR, "_system_tools_MOC.md") },
];

// 루트 허브 파일들 — up 누락이 정상(에러 아님)
const HUB_FILES = new Set([
  path.join(MOC_DIR, "_MOC_HOME.md"),
  path.join(VAULT_ROOT, "HOME.md"),
  path.join(VAULT_ROOT, "PLAN.md"),
  path.join(VAULT_ROOT, "PROGRESS.md"),
  path.join(VAULT_ROOT, "AGENTS.md"),
  path.join(VAULT_ROOT, "SHARE-PACKAGE.md"),
]);

const args    = process.argv.slice(2);
const APPLY   = args.includes("--apply");
const DRY_RUN = !APPLY; // 기본이 dry-run

// ── 헬퍼 ─────────────────────────────────────────────────────────────────

function collectMd(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectMd(full, results);
    else if (e.isFile() && e.name.endsWith(".md")) results.push(full);
  }
  return results;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { fields: {}, endIdx: -1 };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { fields: {}, endIdx: -1 };
  const fm = text.slice(4, end);
  const fields = {};
  for (const line of fm.split("\n")) {
    const m = line.match(/^(\w[\w-]*):/);
    if (m) fields[m[1]] = true;
  }
  return { fields, endIdx: end + 4 }; // endIdx: 닫는 "---" 다음 위치
}

function extractWikilinks(text) {
  const set = new Set();
  for (const m of text.matchAll(/\[\[([^\]|#]+?)(?:\|[^\]]*)?\]\]/g)) {
    // basename 추출 (경로 포함 링크도 basename으로 정규화)
    const raw = m[1].trim();
    const base = path.basename(raw);
    set.add(base);
    set.add(raw); // 경로 포함 형태도 저장
  }
  return set;
}

/** 파일의 섹션 MOC 경로를 반환. 해당 없으면 null */
function resolveSectionMoc(filePath) {
  for (const { prefix, moc } of SECTION_ROUTES) {
    if (filePath.startsWith(prefix + path.sep) || filePath.startsWith(prefix + "/")) {
      return moc;
    }
  }
  // 루트 수준 파일 (HOME, PLAN 등) → _MOC_HOME
  const rel = path.relative(VAULT_ROOT, filePath);
  if (!rel.includes(path.sep)) {
    return null; // 루트 허브, 별도 처리 안 함
  }
  return null;
}

/** MOC에 위키링크 1행 추가 (멱등: 이미 있으면 스킵) */
function addWikilinkToMoc(mocPath, wikilink, existingLinks) {
  if (!fs.existsSync(mocPath)) return false;
  if (existingLinks.has(wikilink) || existingLinks.has(path.basename(wikilink))) return false;

  const text = fs.readFileSync(mocPath, "utf8");
  const recheck = extractWikilinks(text);
  if (recheck.has(wikilink) || recheck.has(path.basename(wikilink))) return false;

  const MARKER = "<!-- AUTO-LINKS -->";
  const linkLine = `- [[${wikilink}]]`;
  let newText;
  if (text.includes(MARKER)) {
    newText = text.replace(MARKER, `${MARKER}\n${linkLine}`);
  } else {
    newText = text.trimEnd() + `\n\n${MARKER}\n${linkLine}\n`;
  }
  fs.writeFileSync(mocPath, newText, "utf8");
  return true;
}

/** frontmatter up 필드 보정 — 파일 앞부분에 up 삽입 */
function addFrontmatterUp(filePath, upValue) {
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.startsWith("---")) return false;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return false;
  // 이미 up 존재하면 스킵
  const fmBlock = text.slice(4, end);
  if (/^up:/m.test(fmBlock)) return false;
  // date: 줄 뒤에 삽입
  const upLine = `up: "${upValue}"`;
  let newFm;
  if (/^date:/m.test(fmBlock)) {
    newFm = fmBlock.replace(/^(date:.*)/m, `$1\n${upLine}`);
  } else {
    newFm = fmBlock.trimEnd() + `\n${upLine}`;
  }
  const newText = "---" + newFm + text.slice(end);
  fs.writeFileSync(filePath, newText, "utf8");
  return true;
}

/** tags + date 빠진 파일에 최소 frontmatter 추가 */
function ensureFrontmatter(filePath, missingFields, sectionMocPath) {
  let text = fs.readFileSync(filePath, "utf8");
  const today = new Date().toISOString().slice(0, 10);

  if (!text.startsWith("---")) {
    // frontmatter 자체가 없으면 삽입
    const mocBase = sectionMocPath ? path.basename(sectionMocPath, ".md") : "_MOC_HOME";
    const upVal   = `[[08_본선/_MOC/${mocBase}|${mocBase.replace(/^_/, "")}]]`;
    const header = `---\ntags:\n  - area/general\n  - status/draft\ndate: ${today}\nup: "${upVal}"\n---\n\n`;
    fs.writeFileSync(filePath, header + text, "utf8");
    return true;
  }

  const end = text.indexOf("\n---", 4);
  if (end === -1) return false;
  let fmBlock = text.slice(4, end);
  let changed = false;

  if (missingFields.includes("tags")) {
    fmBlock = "tags:\n  - area/general\n  - status/draft\n" + fmBlock;
    changed = true;
  }
  if (missingFields.includes("date")) {
    fmBlock = fmBlock.trimEnd() + `\ndate: ${today}`;
    changed = true;
  }
  if (missingFields.includes("up") && sectionMocPath) {
    const mocBase = path.basename(sectionMocPath, ".md");
    const upVal = `[[08_본선/_MOC/${mocBase}|${mocBase.replace(/^_/, "")}]]`;
    fmBlock = fmBlock.trimEnd() + `\nup: "${upVal}"`;
    changed = true;
  }

  if (!changed) return false;
  const newText = "---" + fmBlock + text.slice(end);
  fs.writeFileSync(filePath, newText, "utf8");
  return true;
}

// ── 메인 ─────────────────────────────────────────────────────────────────

function main() {
  const mode = APPLY ? "--apply" : "--dry-run";
  process.stdout.write(`[canon-moc-sync] 모드: ${mode} | 볼트: ${path.relative(process.cwd(), VAULT_ROOT)}\n\n`);

  const allFiles = collectMd(VAULT_ROOT);
  let exitCode = 0;

  // ── 1. 중복 basename 검사 ──────────────────────────────────────────────
  const nameMap = {};
  for (const f of allFiles) {
    const base = path.basename(f, ".md");
    if (!nameMap[base]) nameMap[base] = [];
    nameMap[base].push(f);
  }
  const duplicates = Object.entries(nameMap).filter(([, arr]) => arr.length > 1);

  // _system 내부 파일(SKILL, README 등)끼리의 중복은 경고로만
  const contentDuplicates = duplicates.filter(([, arr]) => {
    const nonSystem = arr.filter(p => !p.startsWith(SYSTEM_DIR));
    return nonSystem.length > 1;
  });
  const systemOnlyDuplicates = duplicates.filter(([, arr]) => {
    const nonSystem = arr.filter(p => !p.startsWith(SYSTEM_DIR));
    return nonSystem.length <= 1;
  });

  if (contentDuplicates.length) {
    process.stdout.write(`[1/4] ⚠ 중복 파일명(콘텐츠): ${contentDuplicates.length}건 — 경로지정 위키링크 권장\n`);
    for (const [name, paths] of contentDuplicates) {
      process.stdout.write(`  ⚠ "${name}"\n`);
      for (const p of paths) process.stdout.write(`      ${path.relative(process.cwd(), p)}\n`);
    }
    exitCode = 0; // 에러가 아닌 경고
  } else {
    process.stdout.write(`[1/4] ✓ 중복 파일명(콘텐츠): 없음\n`);
  }
  if (systemOnlyDuplicates.length) {
    process.stdout.write(`       (시스템 내부 중복 ${systemOnlyDuplicates.length}건은 정상 — 무시)\n`);
  }

  // ── 2. frontmatter 필수 필드 검증 ─────────────────────────────────────
  const REQUIRED = ["tags", "date", "up"];
  const fmIssues = [];

  for (const f of allFiles) {
    // _system/ 내부 SKILL.md, README.md 파일은 제외
    const isSkillFile = f.startsWith(SYSTEM_DIR) && (
      path.basename(f) === "SKILL.md" || path.basename(f) === "README.md"
    );
    if (isSkillFile) continue;

    let text;
    try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
    const { fields } = parseFrontmatter(text);
    const missing = REQUIRED.filter(k => !fields[k]);

    if (missing.length) {
      // 허브 파일은 up 누락을 정상으로 처리
      const effectiveMissing = HUB_FILES.has(f)
        ? missing.filter(k => k !== "up")
        : missing;
      if (effectiveMissing.length) fmIssues.push({ file: f, missing: effectiveMissing });
    }
  }

  if (fmIssues.length) {
    process.stdout.write(`[2/4] frontmatter 누락: ${fmIssues.length}건\n`);
    for (const { file, missing } of fmIssues) {
      process.stdout.write(`  - ${path.relative(process.cwd(), file)} (누락: ${missing.join(", ")})\n`);
    }
  } else {
    process.stdout.write(`[2/4] ✓ frontmatter: 전체 정합\n`);
  }

  // ── 3. 섹션 MOC 누락 위키링크 감지 ───────────────────────────────────
  // 각 섹션 MOC별 existing 링크 캐시
  const mocLinksCache = {};
  function getMocLinks(mocPath) {
    if (!mocLinksCache[mocPath]) {
      if (!fs.existsSync(mocPath)) {
        mocLinksCache[mocPath] = new Set();
      } else {
        mocLinksCache[mocPath] = extractWikilinks(fs.readFileSync(mocPath, "utf8"));
      }
    }
    return mocLinksCache[mocPath];
  }

  // 대상 파일 필터: MOC 자체, _시스템 내 SKILL/README, _ 접두어 파일, 루트 허브 제외
  const CANDIDATES = allFiles.filter(f => {
    const base = path.basename(f, ".md");
    if (base.startsWith("_")) return false;
    if (f.startsWith(MOC_DIR)) return false; // MOC 파일들 자체
    if (f.startsWith(SYSTEM_DIR)) return false; // 시스템 파일 → _system_tools_MOC 자동화 범위 아님
    if (HUB_FILES.has(f)) return false;
    return true;
  });

  const mocGaps = {}; // mocPath → [{ file, wikilink }]

  for (const f of CANDIDATES) {
    const mocPath = resolveSectionMoc(f);
    if (!mocPath) continue;

    const existing = getMocLinks(mocPath);
    const base = path.basename(f, ".md");
    const relPath = path.relative(VAULT_ROOT, f).replace(/\.md$/, "").replace(/\\/g, "/");
    const fullWikilink = `08_본선/${relPath}`;

    // 이미 링크됐으면 스킵
    if (existing.has(base) || existing.has(fullWikilink) || existing.has(relPath)) continue;

    if (!mocGaps[mocPath]) mocGaps[mocPath] = [];
    mocGaps[mocPath].push({ file: f, base, fullWikilink });
  }

  const totalGaps = Object.values(mocGaps).reduce((s, arr) => s + arr.length, 0);
  if (totalGaps > 0) {
    process.stdout.write(`[3/4] MOC 누락 링크: ${totalGaps}건\n`);
    for (const [mocPath, items] of Object.entries(mocGaps)) {
      const mocName = path.basename(mocPath);
      process.stdout.write(`  ${mocName}:\n`);
      for (const { file, fullWikilink } of items) {
        process.stdout.write(`    + [[${fullWikilink}]]\n`);
      }
    }
  } else {
    process.stdout.write(`[3/4] ✓ MOC 누락 링크: 없음\n`);
  }

  // ── 4. APPLY 모드 실행 ─────────────────────────────────────────────────
  if (!APPLY) {
    process.stdout.write(`\n[canon-moc-sync] dry-run 완료 — 수정 없음. --apply 로 실제 적용.\n`);
    process.exit(exitCode);
  }

  let appliedLinks = 0;
  let appliedFm    = 0;

  // 4a. 섹션 MOC 위키링크 추가
  // 캐시를 무효화하고 실시간으로 중복 체크해야 하므로 mocLinksCache 를 참조
  for (const [mocPath, items] of Object.entries(mocGaps)) {
    for (const { file, fullWikilink, base } of items) {
      const existing = getMocLinks(mocPath);
      if (existing.has(base) || existing.has(fullWikilink)) continue;

      if (!fs.existsSync(mocPath)) continue;
      const text = fs.readFileSync(mocPath, "utf8");
      const recheck = extractWikilinks(text);
      if (recheck.has(base) || recheck.has(fullWikilink)) {
        // 캐시 갱신
        mocLinksCache[mocPath] = recheck;
        continue;
      }

      const MARKER = "<!-- AUTO-LINKS -->";
      const linkLine = `- [[${fullWikilink}]]`;
      let newText;
      if (text.includes(MARKER)) {
        newText = text.replace(MARKER, `${MARKER}\n${linkLine}`);
      } else {
        newText = text.trimEnd() + `\n\n${MARKER}\n${linkLine}\n`;
      }
      fs.writeFileSync(mocPath, newText, "utf8");
      // 캐시 갱신
      mocLinksCache[mocPath] = extractWikilinks(newText);
      appliedLinks++;
      process.stdout.write(`  [link+] ${path.basename(mocPath)} ← [[${fullWikilink}]]\n`);
    }
  }

  // 4b. frontmatter 보정
  for (const { file, missing } of fmIssues) {
    const mocPath = resolveSectionMoc(file) ?? path.join(MOC_DIR, "_system_tools_MOC.md");
    const changed = ensureFrontmatter(file, missing, mocPath);
    if (changed) {
      appliedFm++;
      process.stdout.write(`  [fm+]   ${path.relative(process.cwd(), file)} (보정: ${missing.join(", ")})\n`);
    }
  }

  process.stdout.write(`\n[canon-moc-sync] apply 완료 — 링크추가: ${appliedLinks}건, frontmatter보정: ${appliedFm}건\n`);
  process.exit(exitCode);
}

main();
