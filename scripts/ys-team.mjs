#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import https from "node:https";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const bundledSkillsDir = path.join(packageRoot, "skills");
const bundledBaselineDir = path.join(packageRoot, "examples", "baseline");
const bundledBaselineChangelogPath = path.join(bundledBaselineDir, "CHANGELOG.md");
const baselineAgentsPath = path.join(packageRoot, "examples", "baseline", "AGENTS.md");
const baselineClaudePath = path.join(packageRoot, "examples", "baseline", "CLAUDE.md");
const installedBaselineSkillName = "ys-team";
const managedEntryStartRegex = /<!--\s*ys-team:managed:start\b[^>]*-->/;
const managedEntryEndRegex = /<!--\s*ys-team:managed:end\s*-->/;
const legacyEntryHeadingPatterns = [
  /^ys-team\b/,
  /^工作流$/,
  /^首先做什么$/,
  /^第一优先级$/,
  /^工作方式$/,
  /^三道闸$/,
  /^入口闸$/,
  /^出口闸$/,
  /^Verifier\s*卡$/,
  /^验收门槛$/,
  /^现实读取$/,
  /^现实索引$/,
  /^Scope$/,
  /^可见性$/,
  /^可见标志$/,
  /^结果状态$/
];

function defaultSkillsDir() {
  return path.join(os.homedir(), ".claude", "skills");
}

function helpText() {
  return [
    "ys-team — verifier-first AI coding workflow",
    "",
    "Commands:",
    "  ys-team install-skills [--dest <dir>] [--force] [--dry-run]",
    "  ys-team init-project [--dir <project-dir>] [--force] [--dry-run]",
    "  ys-team check-update",
    "  ys-team --help",
    "",
    `Default install destination: ${defaultSkillsDir()}`,
    "",
    "Quick start:",
    "  npx toughman-ys-team install-skills --force",
    "  # Then in your project, tell Claude: 用 ys-team-init 初始化这个项目",
    "",
    "Update:",
    "  npx toughman-ys-team check-update",
    "  npx toughman-ys-team@latest install-skills --force",
    "  npx toughman-ys-team@latest init-project --dir /path/to/project",
    "  # --force prunes stale bundled ys-team skills",
    "  # init-project refreshes repo-local skills and AGENTS.md / CLAUDE.md managed blocks",
    "",
    "Workflow:",
    "  Simple reversible changes run directly with minimal verification.",
    "  Non-trivial changes use grill -> verifier card -> loop -> evidence.",
    "  Routing is based on irreversibility x uncertainty, not file counts.",
    "",
    "Verifier card focus:",
    "  intent, non-goals, Write-Scope, fidelity level, human-equivalent check, Feedback Loop",
    "",
    "Docs: docs/methodology/ for the full method specification"
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    command: null,
    dest: defaultSkillsDir(),
    dir: process.cwd(),
    force: false,
    dryRun: false,
    help: false
  };

  const rest = argv.slice(2);
  if (rest.length === 0) {
    args.help = true;
    return args;
  }

  for (let i = 0; i < rest.length; i += 1) {
    const value = rest[i];
    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }
    if (!args.command && !value.startsWith("--")) {
      args.command = value;
      continue;
    }
    if (value === "--dest") {
      const next = rest[i + 1];
      if (!next) {
        throw new Error("Missing value for --dest");
      }
      args.dest = path.resolve(next);
      i += 1;
      continue;
    }
    if (value === "--dir") {
      const next = rest[i + 1];
      if (!next) {
        throw new Error("Missing value for --dir");
      }
      args.dir = path.resolve(next);
      i += 1;
      continue;
    }
    if (value === "--force") {
      args.force = true;
      continue;
    }
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    throw new Error(`Unsupported argument: ${value}`);
  }

  return args;
}

function ensureBundledSkills() {
  if (!fs.existsSync(bundledSkillsDir)) {
    throw new Error(`Bundled skills directory not found: ${bundledSkillsDir}`);
  }
  if (!fs.existsSync(bundledBaselineDir)) {
    throw new Error(`Bundled baseline directory not found: ${bundledBaselineDir}`);
  }
  if (!fs.existsSync(baselineAgentsPath) || !fs.existsSync(baselineClaudePath)) {
    throw new Error("Baseline AGENTS.md / CLAUDE.md templates not found");
  }
}

function sharedBaselineInstallPath(dest) {
  return path.join(dest, installedBaselineSkillName, "baseline");
}

function listBundledSkills() {
  ensureBundledSkills();
  return fs.readdirSync(bundledSkillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listManagedInstalledSkills(dest) {
  if (!fs.existsSync(dest)) {
    return [];
  }

  return fs.readdirSync(dest, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name === installedBaselineSkillName || name.startsWith(`${installedBaselineSkillName}-`))
    .sort();
}

function copyDirectoryRecursive(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function copyFileWithPolicy(sourcePath, targetPath, { force, dryRun }) {
  const exists = fs.existsSync(targetPath);
  if (exists && !force) {
    return { action: "skipped", targetPath };
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }

  return { action: exists ? "replaced" : "created", targetPath };
}

function findManagedBlockRange(markdown) {
  const startMatch = managedEntryStartRegex.exec(markdown);
  if (!startMatch) {
    return null;
  }

  const rest = markdown.slice(startMatch.index + startMatch[0].length);
  const endMatch = managedEntryEndRegex.exec(rest);
  if (!endMatch) {
    return null;
  }

  return {
    start: startMatch.index,
    end: startMatch.index + startMatch[0].length + endMatch.index + endMatch[0].length
  };
}

function extractManagedBlock(markdown) {
  const range = findManagedBlockRange(markdown);
  if (!range) {
    throw new Error("Baseline entry template is missing ys-team managed block markers");
  }
  return markdown.slice(range.start, range.end).trim();
}

function findFirstHeadingEnd(markdown) {
  const match = /^# .*(?:\r?\n|$)/.exec(markdown);
  if (!match) {
    return 0;
  }

  let offset = match[0].length;
  const blank = /^\r?\n/.exec(markdown.slice(offset));
  if (blank) {
    offset += blank[0].length;
  }
  return offset;
}

function isLegacyEntryHeadingTitle(title) {
  return legacyEntryHeadingPatterns.some((pattern) => pattern.test(title.trim()));
}

function findLegacyEntryEnd(markdown, firstHeadingIndex) {
  const headingRegex = /^##\s+(.+)$/gm;
  headingRegex.lastIndex = firstHeadingIndex + 1;

  let match = headingRegex.exec(markdown);
  while (match) {
    if (match.index > firstHeadingIndex && !isLegacyEntryHeadingTitle(match[1])) {
      return match.index;
    }
    match = headingRegex.exec(markdown);
  }

  return markdown.length;
}

function appendAfterManagedBlock(managedBlock, rest) {
  const trimmedRest = rest.replace(/^\s+/, "");
  return trimmedRest ? `${managedBlock}\n\n${trimmedRest}` : `${managedBlock}\n`;
}

function findLegacyEntryRange(markdown, kind) {
  const headingPatterns = kind === "claude"
    ? [/^##\s+ys-team\b.*$/m, /^##\s+首先做什么\s*$/m, /^##\s+工作方式\s*$/m]
    : [/^##\s+ys-team\b.*$/m];

  for (const pattern of headingPatterns) {
    const match = pattern.exec(markdown);
    if (!match) {
      continue;
    }

    let start = match.index;

    if (kind === "claude") {
      const h1End = findFirstHeadingEnd(markdown);
      const lead = markdown.slice(h1End, match.index);
      if (/本(项目|仓库).*ys-team/.test(lead)) {
        start = h1End;
      }
    }

    const end = findLegacyEntryEnd(markdown, match.index);

    const candidate = markdown.slice(start, end);
    const legacySignals = [
      /L0\s*\/\s*L1\s*\/\s*L2/,
      /L0 trivial|L1 patch|L2 spec/,
      /Response Markers/,
      /必须带.*状态标记/,
      /排他工作流/,
      /governance_slots|slot_bindings/,
      /spec-talk\s*->\s*spec-review\s*->\s*spec-work/
    ];

    if (legacySignals.some((signal) => signal.test(candidate)) || /ys-team/.test(candidate)) {
      return { start, end };
    }
  }

  return null;
}

function normalizeBlockForCompare(text) {
  return text.replace(/\s+/g, " ").trim();
}

function mergeManagedEntryMarkdown(existingMarkdown, templateMarkdown, { kind }) {
  const managedBlock = extractManagedBlock(templateMarkdown);

  if (!existingMarkdown) {
    return { action: "created", markdown: templateMarkdown };
  }

  const currentRange = findManagedBlockRange(existingMarkdown);
  if (currentRange) {
    const currentBlock = existingMarkdown.slice(currentRange.start, currentRange.end);
    if (normalizeBlockForCompare(currentBlock) === normalizeBlockForCompare(managedBlock)) {
      return { action: "unchanged", markdown: existingMarkdown };
    }
    return {
      action: "managed-block-updated",
      markdown: `${existingMarkdown.slice(0, currentRange.start)}${managedBlock}${existingMarkdown.slice(currentRange.end)}`
    };
  }

  const legacyRange = findLegacyEntryRange(existingMarkdown, kind);
  if (legacyRange) {
    return {
      action: "legacy-entry-replaced",
      markdown: `${existingMarkdown.slice(0, legacyRange.start)}${appendAfterManagedBlock(managedBlock, existingMarkdown.slice(legacyRange.end))}`
    };
  }

  const insertAt = findFirstHeadingEnd(existingMarkdown);
  return {
    action: "managed-block-inserted",
    markdown: `${existingMarkdown.slice(0, insertAt)}${managedBlock}\n\n${existingMarkdown.slice(insertAt)}`
  };
}

function updateManagedEntryFile(sourcePath, targetPath, { dryRun, kind }) {
  const templateMarkdown = fs.readFileSync(sourcePath, "utf8");
  const exists = fs.existsSync(targetPath);
  const existingMarkdown = exists ? fs.readFileSync(targetPath, "utf8") : "";
  const result = mergeManagedEntryMarkdown(existingMarkdown, templateMarkdown, { kind });

  if (!dryRun && result.action !== "unchanged") {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, result.markdown);
  }

  return { action: result.action, targetPath };
}

function installSkills({ dest, force, dryRun, includeNext = true }) {
  const skills = listBundledSkills();
  const operations = [];
  const skipped = [];
  const staleSkills = [];
  const baselineTargetPath = sharedBaselineInstallPath(dest);
  const baselineExists = fs.existsSync(baselineTargetPath);

  if (force) {
    const bundledSet = new Set(skills);
    for (const installedSkill of listManagedInstalledSkills(dest)) {
      if (!bundledSet.has(installedSkill)) {
        staleSkills.push(installedSkill);
      }
    }
  }

  for (const skill of skills) {
    const sourcePath = path.join(bundledSkillsDir, skill);
    const targetPath = path.join(dest, skill);
    const exists = fs.existsSync(targetPath);

    if (exists && !force) {
      skipped.push(skill);
      continue;
    }

    operations.push({ skill, sourcePath, targetPath, replace: exists });
  }

  if (!dryRun) {
    fs.mkdirSync(dest, { recursive: true });
    for (const staleSkill of staleSkills) {
      fs.rmSync(path.join(dest, staleSkill), { recursive: true, force: true });
    }
    for (const op of operations) {
      if (op.replace) {
        fs.rmSync(op.targetPath, { recursive: true, force: true });
      }
      copyDirectoryRecursive(op.sourcePath, op.targetPath);
    }

    if (baselineExists && force) {
      fs.rmSync(baselineTargetPath, { recursive: true, force: true });
    }
    if (!baselineExists || force) {
      copyDirectoryRecursive(bundledBaselineDir, baselineTargetPath);
    }
  }

  const lines = [
    dryRun ? "ys-team install-skills dry-run" : "ys-team install-skills",
    "",
    `destination: ${dest}`,
    `shared baseline: ${baselineTargetPath}`,
    `bundled skills: ${skills.length}`,
    `scheduled installs: ${operations.length}`,
    `skipped existing: ${skipped.length}`,
    `stale managed skills: ${staleSkills.length}`,
    `baseline action: ${baselineExists ? (force ? "replace" : "skip") : "create"}`
  ];

  if (operations.length > 0) {
    lines.push("", "planned:");
    for (const op of operations) {
      lines.push(`- ${op.skill}${op.replace ? " (replace)" : ""}`);
    }
  }

  if (skipped.length > 0) {
    lines.push("", "skipped:");
    for (const skill of skipped) {
      lines.push(`- ${skill}`);
    }
    lines.push("", "Use --force to replace existing installed skills.");
  }

  if (staleSkills.length > 0) {
    lines.push("", force ? "stale managed skills to remove:" : "stale managed skills detected:");
    for (const skill of staleSkills) {
      lines.push(`- ${skill}`);
    }
  }

  if (includeNext && !dryRun && operations.length > 0) {
    lines.push("", "next:");
    lines.push("- run ys-team-init in the target repository");
    lines.push("- run `ys-team init-project --dir <repo>` to refresh AGENTS.md / CLAUDE.md managed blocks in existing projects");
  }

  return lines.join("\n");
}

function initProject({ dir, force, dryRun }) {
  const skillsDest = path.join(dir, ".agents", "skills");
  const agentsDest = path.join(dir, "AGENTS.md");
  const claudeDest = path.join(dir, "CLAUDE.md");

  const installSummary = installSkills({
    dest: skillsDest,
    force,
    dryRun,
    includeNext: false
  });

  const agentsResult = updateManagedEntryFile(baselineAgentsPath, agentsDest, { dryRun, kind: "agents" });
  const claudeResult = updateManagedEntryFile(baselineClaudePath, claudeDest, { dryRun, kind: "claude" });

  return [
    dryRun ? "ys-team init-project dry-run" : "ys-team init-project",
    "",
    `project: ${dir}`,
    `local skills: ${skillsDest}`,
    `AGENTS.md: ${agentsResult.action}`,
    `CLAUDE.md: ${claudeResult.action}`,
    "",
    installSummary,
    "",
    "next:",
    "- open the target repository",
    "- run ys-team-init in that repository",
    `- baseline assets are available at ${sharedBaselineInstallPath(skillsDest)}`,
    "- verify AGENTS.md and CLAUDE.md kept project-local instructions outside the managed block"
  ].join("\n");
}

function fetchUrl(url, { responseType = "text", redirects = 0 } = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: "application/json" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects >= 5) {
          reject(new Error("请求重定向次数过多"));
          return;
        }
        resolve(fetchUrl(res.headers.location, { responseType, redirects: redirects + 1 }));
        return;
      }

      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`请求失败（HTTP ${res.statusCode}）`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => { chunks.push(chunk); });
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(responseType === "buffer" ? buffer : buffer.toString("utf8"));
      });
    }).on("error", reject);
  });
}

async function fetchLatestPackageMeta(packageName) {
  const url = `https://registry.npmjs.org/${packageName}/latest`;
  const data = await fetchUrl(url);

  try {
    const json = JSON.parse(data);
    return {
      version: json.version,
      dist: json.dist ?? {},
      repository: json.repository ?? null
    };
  } catch {
    throw new Error("解析 npm registry 响应失败");
  }
}

function tarEntrySize(header) {
  const sizeField = header.subarray(124, 136).toString("utf8").replace(/\0/g, "").trim();
  return sizeField ? Number.parseInt(sizeField, 8) : 0;
}

function extractFileFromTarGz(tarballBuffer, entryPath) {
  const tarBuffer = zlib.gunzipSync(tarballBuffer);
  let offset = 0;

  while (offset + 512 <= tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + 512);
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");

    if (!name) {
      break;
    }

    const size = tarEntrySize(header);
    const bodyStart = offset + 512;
    const bodyEnd = bodyStart + size;

    if (name === entryPath) {
      return tarBuffer.subarray(bodyStart, bodyEnd).toString("utf8");
    }

    offset = bodyStart + Math.ceil(size / 512) * 512;
  }

  throw new Error(`未在 tarball 中找到 ${entryPath}`);
}

function parseSectionBody(markdown, heading) {
  const lines = markdown.split("\n");
  const collected = [];
  let capture = false;

  for (const line of lines) {
    if (line === `### ${heading}`) {
      capture = true;
      continue;
    }
    if (capture && line.startsWith("### ")) {
      break;
    }
    if (capture) {
      collected.push(line);
    }
  }

  return collected.join("\n").trim();
}

function parseBullets(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}

function parseChangelog(markdown) {
  const matches = [...markdown.matchAll(/^## \[([^\]]+)\] - (.+)$/gm)];
  const sections = [];

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const bodyStart = current.index + current[0].length;
    const bodyEnd = next ? next.index : markdown.length;
    const body = markdown.slice(bodyStart, bodyEnd).trim();

    sections.push({
      version: current[1],
      date: current[2],
      whatChanged: parseBullets(parseSectionBody(body, "What Changed")),
      why: parseBullets(parseSectionBody(body, "Why")),
      keyFiles: parseBullets(parseSectionBody(body, "Key Files")),
      migrationHint: parseBullets(parseSectionBody(body, "Migration Hint"))
    });
  }

  return sections;
}

function isSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

function collectUpgradeNotes(localVersion, latestVersion, changelogMarkdown) {
  return parseChangelog(changelogMarkdown)
    .filter((section) => isSemver(section.version))
    .filter((section) => compareVersions(section.version, localVersion) > 0)
    .filter((section) => compareVersions(section.version, latestVersion) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
}

function changelogUrlFromRepository(repository) {
  const repoUrl = typeof repository === "string" ? repository : repository?.url;
  if (!repoUrl) {
    return null;
  }

  const cleaned = repoUrl
    .replace(/^git\+/, "")
    .replace(/\.git$/, "");

  return `${cleaned}/blob/main/examples/baseline/CHANGELOG.md`;
}

function formatUpdateReport({ packageName, localVersion, latestVersion, notes, changelogUrl, summaryAvailable }) {
  const lines = [
    "ys-team check-update",
    "",
    `已安装版本: v${localVersion}`,
    `npm 最新版:  v${latestVersion}`,
  ];

  const cmp = compareVersions(latestVersion, localVersion);

  if (cmp === 0) {
    lines.push("", "已是最新版本。");
    return lines.join("\n");
  }

  if (cmp < 0) {
    lines.push("", "本地版本比 npm 更新（开发中或未发布）。");
    return lines.join("\n");
  }

  lines.push("", "发现新版本，运行以下命令更新 skills 和项目入口：");
  lines.push(`  npx ${packageName}@${latestVersion} install-skills --force`);
  lines.push(`  npx ${packageName}@${latestVersion} init-project --dir /path/to/project`);

  if (summaryAvailable && notes.length > 0) {
    lines.push("", `落后版本: ${notes.map((note) => `v${note.version}`).join(", ")}`);
    for (const note of notes) {
      lines.push("", `v${note.version} (${note.date})`);

      if (note.whatChanged.length > 0) {
        lines.push("  主要变化:");
        for (const item of note.whatChanged) {
          lines.push(`  - ${item}`);
        }
      }

      if (note.keyFiles.length > 0) {
        lines.push("  关键文件:");
        for (const item of note.keyFiles.slice(0, 5)) {
          lines.push(`  - ${item}`);
        }
      }

      if (note.migrationHint.length > 0) {
        lines.push("  迁移建议:");
        for (const item of note.migrationHint) {
          lines.push(`  - ${item}`);
        }
      }
    }
  } else {
    lines.push("", "未能提取变更摘要。");
    if (changelogUrl) {
      lines.push(`查看 CHANGELOG: ${changelogUrl}`);
    }
  }

  return lines.join("\n");
}

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

async function checkUpdate() {
  const localPkg = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  const localVersion = localPkg.version;
  const localChangelog = fs.existsSync(bundledBaselineChangelogPath)
    ? fs.readFileSync(bundledBaselineChangelogPath, "utf8")
    : null;

  process.stdout.write("正在检查更新...\n");
  const latestMeta = await fetchLatestPackageMeta(localPkg.name);
  const latestVersion = latestMeta.version;

  let notes = [];
  let summaryAvailable = false;

  if (compareVersions(latestVersion, localVersion) > 0 && latestMeta.dist.tarball) {
    try {
      const tarball = await fetchUrl(latestMeta.dist.tarball, { responseType: "buffer" });
      const changelogMarkdown = extractFileFromTarGz(tarball, "package/examples/baseline/CHANGELOG.md");
      notes = collectUpgradeNotes(localVersion, latestVersion, changelogMarkdown);
      summaryAvailable = notes.length > 0;
    } catch {
      if (localChangelog) {
        notes = collectUpgradeNotes(localVersion, latestVersion, localChangelog);
        summaryAvailable = notes.length > 0;
      }
    }
  }

  return formatUpdateReport({
    packageName: localPkg.name,
    localVersion,
    latestVersion,
    notes,
    changelogUrl: changelogUrlFromRepository(latestMeta.repository),
    summaryAvailable
  });
}

function main() {
  try {
    const args = parseArgs(process.argv);

    if (args.help || !args.command) {
      console.log(helpText());
      process.exit(0);
    }

    if (args.command === "install-skills") {
      console.log(installSkills(args));
      process.exit(0);
    }

    if (args.command === "init-project") {
      console.log(initProject(args));
      process.exit(0);
    }

    if (args.command === "check-update") {
      checkUpdate().then((output) => {
        console.log(output);
        process.exit(0);
      }).catch((err) => {
        console.error(`ys-team error: ${err.message}`);
        process.exit(1);
      });
      return;
    }

    console.error(`Unsupported command: ${args.command}`);
    console.error("Run `ys-team --help`.");
    process.exit(1);
  } catch (error) {
    console.error(`ys-team error: ${error.message}`);
    process.exit(1);
  }
}

function isMainModule() {
  if (!process.argv[1]) {
    return false;
  }

  return fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(__filename);
}

if (isMainModule()) {
  main();
}

export {
  checkUpdate,
  collectUpgradeNotes,
  compareVersions,
  extractFileFromTarGz,
  extractManagedBlock,
  formatUpdateReport,
  mergeManagedEntryMarkdown,
  parseChangelog
};
