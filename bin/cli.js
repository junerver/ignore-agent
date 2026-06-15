#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } = require("node:fs");
const { join, resolve, dirname } = require("node:path");

const ENTRIES = ["AGENTS.md", "CLAUDE.md", ".claude/"];
const SEPARATOR = "# === ignore-agent ===";

function findGitRoot(start) {
  let dir = resolve(start);
  while (true) {
    const candidate = join(dir, ".git");
    if (existsSync(candidate)) {
      const st = statSync(candidate);
      if (st.isDirectory()) return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function main() {
  const cwd = process.cwd();
  const root = findGitRoot(cwd);

  if (!root) {
    console.error("✖ Not inside a git repository.");
    process.exit(1);
  }

  const infoDir = join(root, ".git", "info");
  const excludePath = join(infoDir, "exclude");

  if (!existsSync(infoDir)) mkdirSync(infoDir, { recursive: true });

  let content = "";
  if (existsSync(excludePath)) content = readFileSync(excludePath, "utf8");

  if (content.includes(SEPARATOR)) {
    console.log("✔ Already configured – skipping.");
    return;
  }

  const block =
    `\n${SEPARATOR}\n` +
    ENTRIES.map((e) => e).join("\n") +
    `\n${SEPARATOR}\n`;

  writeFileSync(excludePath, content + block, "utf8");
  console.log(`✔ Injected ${ENTRIES.length} entries into ${excludePath}`);
}

main();
