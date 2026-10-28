// Releases only what changed. Every port keeps its own version; a release bumps the ports whose
// files changed since the last tag, by the Conventional Commits that changed them, and writes
// their changelogs from those commits.
//
//   bun tools/release/release.ts plan                  what the next release would bump
//   bun tools/release/release.ts prepare [--date D] [--version V]
//                                                     bump versions, write changelogs and change notes;
//                                                     --version puts every port on V (a release for everything)
//   bun tools/release/release.ts check [--tag vX.Y.Z]  versions agree with release.json (and the tag)
//   bun tools/release/release.ts changed --tag vX.Y.Z  JSON list of ports this tag releases
//   bun tools/release/release.ts notes --tag vX.Y.Z    GitHub release notes for the tag
//   bun tools/release/release.ts section --port ID [--version V] [--format md|html|text]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bumpOf, bumpVersion, htmlNotes, markdownSection, maxBump, type Bump, type Commit } from "./commits";
import { LOOKS, rolesOf } from "../palette/looks";
import { commitsTouching, previousTag, showAt } from "./git";
import {
  PORTS, ROOT, portById, readRelease, readRootVersion, versionDrift, writeNativeVersions, writeRelease, writeRootVersion, type Port,
} from "./ports";

const at = (p: string) => join(ROOT, p);

export interface PortPlan {
  port: Port;
  from: string;
  to: string;
  bump: Bump | null;
  commits: Commit[];
}

export function plan(): { tag: string | null; root: { from: string; to: string }; ports: PortPlan[] } {
  const tag = previousTag();
  const release = readRelease();
  const ports = PORTS.map((port) => {
    const from = release.ports[port.id];
    const commits = commitsTouching(tag, "HEAD", port.paths);
    const bump = bumpOf(commits, from);
    return { port, from, to: bump ? bumpVersion(from, bump) : from, bump, commits };
  });
  const rootFrom = readRootVersion();
  const rootBump = maxBump(ports.map((p) => p.bump));
  return { tag, root: { from: rootFrom, to: rootBump ? bumpVersion(rootFrom, rootBump) : rootFrom }, ports };
}

const HEADER = (title: string) =>
  `# Changelog: ${title}\n\nEvery release of this port, newest first. Written from the commits that changed it.\nThe format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [SemVer](https://semver.org/).\n\n`;

/** Splits a changelog into its header, the hand-written [Unreleased] text and the released sections. */
export function splitChangelog(text: string): { unreleased: string; released: string } {
  const unreleased = text.match(/^## \[Unreleased\][^\n]*\n([\s\S]*?)(?=^## \[|(?![\s\S]))/m)?.[1] ?? "";
  const first = text.search(/^## \[(?!Unreleased)/m);
  return { unreleased: unreleased.trim(), released: first >= 0 ? text.slice(first) : "" };
}

export function sectionOf(text: string, version: string): string | null {
  const esc = version.replace(/\./g, "\\.");
  const m = text.match(new RegExp(`^## \\[${esc}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`, "m"));
  return m ? m[1].trim() : null;
}

function prepare(date: string, version?: string): void {
  const p = plan();
  const release = readRelease();
  if (version) {
    for (const x of p.ports) x.to = version;
    p.root.to = version;
  }
  const bumped = p.ports.filter((x) => (version ? x.from !== version : x.bump));
  if (!bumped.length) {
    console.log("nothing to release: no shipping commits since " + (p.tag ?? "the start"));
    return;
  }
  for (const x of bumped) {
    release.ports[x.port.id] = x.to;
    writeNativeVersions(x.port, x.to);
    const file = at(x.port.changelog);
    const text = existsSync(file) ? readFileSync(file, "utf8") : "";
    const { unreleased, released } = splitChangelog(text);
    writeFileSync(file, HEADER(x.port.title) + "## [Unreleased]\n\n" + markdownSection(x.to, date, x.commits, unreleased) + (released ? "\n" + released : ""));
    if (x.port.id === "jetbrains") writeFileSync(at("jetbrains/change-notes.html"), htmlNotes(x.to, x.commits, unreleased));
    console.log(`${x.port.id.padEnd(10)} ${x.from} -> ${x.to}  (${x.commits.length} commits)`);
  }
  writeRelease(release);
  writeRootVersion(p.root.to);
  console.log(`\nrelease ${p.root.to}. Review the changelogs, then:\n  git commit -am "release: ${p.root.to}" && git tag -s v${p.root.to} -m v${p.root.to}`);
}

/** Ports whose version in release.json differs from the previous tag; before release.json, from its root version. */
export function changedAt(tag: string): string[] {
  const now = JSON.parse(showAt(tag, "release.json") ?? "null")?.ports as Record<string, string> | undefined;
  if (!now) return PORTS.map((p) => p.id);
  const prev = previousTag(tag);
  const before = prev ? JSON.parse(showAt(prev, "release.json") ?? "null")?.ports : null;
  const prevRoot = prev ? JSON.parse(showAt(prev, "package.json") ?? "{}").version : null;
  return PORTS.filter((p) => (before ? before[p.id] !== now[p.id] : now[p.id] !== prevRoot)).map((p) => p.id);
}

const INSTALL: Record<string, string> = {
  vsc: "VS Code: `hatsune-miku-vsc-*.vsix` → Extensions → Install from VSIX, or Open VSX",
  zed: "Zed: `zed-*.zip` → unpack, then Install Dev Extension",
  jetbrains: "JetBrains: `jetbrains-*.zip` → Settings → Plugins → Install Plugin from Disk, or JetBrains Marketplace",
  neovim: "Neovim: `neovim-*.zip` → `:colorscheme hatsune-miku`",
  sublime: "Sublime Text: `sublime-*.zip` → Preferences → Color Scheme",
  notepadpp: "Notepad++: `notepadpp-*.zip` → Settings → Import → Import style theme(s)",
  browser:
    "Browser: Chromium `hatsune-miku-editor-chromium-*.zip` → Load unpacked; frame colors `hatsune-miku-colorful-browser-*.zip`; Firefox from [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/hatsunemikueditor/) or `hatsune-miku-editor-firefox-*.xpi`; Zen `hatsune-miku-zen-mod-*.zip`",
  telegram: "Telegram: one link per look on [the themes branch](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/tree/themes), or the `.attheme` for Android and `.tdesktop-theme` for Desktop → open the file in Telegram, Apply",
  spicetify: "Spotify: `spicetify-*.zip` → unpack into the Spicetify Themes folder, then `spicetify config current_theme HatsuneMiku color_scheme MikuDark` and `spicetify apply`",
};

/** One line naming every look with its background and accent. */
const looksLine = () => `${LOOKS.length} looks, one palette: ${LOOKS.map((l) => `${l.title} \`${rolesOf(l).bg}\`/\`${rolesOf(l).accent}\``).join(", ")}.`;

function notes(tag: string): string {
  const changed = new Set(changedAt(tag));
  const ports = JSON.parse(showAt(tag, "release.json") ?? "null")?.ports ?? {};
  const out = [`## Hatsune Miku themes ${tag.replace(/^v/, "")}`, "", looksLine(), ""];
  for (const port of PORTS.filter((p) => changed.has(p.id))) {
    const v = ports[port.id];
    const text = showAt(tag, port.changelog);
    const section = (text && v && sectionOf(text, v)) || "No notes.";
    out.push(`### ${port.title} ${v ?? ""}`.trim(), "", section.replace(/^### /gm, "#### "), "");
  }
  const same = PORTS.filter((p) => !changed.has(p.id) && ports[p.id]);
  if (same.length) out.push(`Unchanged, rebuilt for completeness: ${same.map((p) => `${p.title} ${ports[p.id]}`).join(", ")}.`, "");
  out.push("### Install", "", ...PORTS.map((p) => `- ${INSTALL[p.id]}`), "");
  return out.join("\n");
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

if (import.meta.main) {
  const cmd = process.argv[2];
  const tag = arg("tag");
  switch (cmd) {
    case "plan": {
      const p = plan();
      console.log(`since ${p.tag ?? "the first commit"}: release ${p.root.from} -> ${p.root.to}\n`);
      for (const x of p.ports) {
        console.log(`${x.port.id.padEnd(10)} ${x.bump ? `${x.from} -> ${x.to} (${x.bump})` : `${x.from} unchanged`}`);
        for (const c of x.commits) console.log(`  ${c.hash} ${c.type}${c.scope ? `(${c.scope})` : ""}: ${c.subject}`);
      }
      break;
    }
    case "prepare":
      prepare(arg("date") ?? new Date().toISOString().slice(0, 10), arg("version"));
      break;
    case "check": {
      const bad = versionDrift();
      if (tag && tag.replace(/^v/, "") !== readRootVersion()) bad.push(`tag ${tag} does not match package.json ${readRootVersion()}`);
      for (const b of bad) console.error("FAIL " + b);
      if (bad.length) process.exit(1);
      console.log("release versions agree");
      break;
    }
    case "changed":
      console.log(JSON.stringify(changedAt(tag ?? "HEAD")));
      break;
    case "notes":
      process.stdout.write(notes(tag ?? "HEAD"));
      break;
    case "section": {
      const port = portById(arg("port")!);
      const v = arg("version") ?? readRelease().ports[port.id];
      const text = readFileSync(at(port.changelog), "utf8");
      const s = sectionOf(text, v);
      if (!s) throw new Error(`${port.changelog} has no section for ${v}`);
      const format = arg("format") ?? "md";
      process.stdout.write(format === "md" ? s + "\n" : format === "text" ? mdToText(s) : s);
      break;
    }
    default:
      console.error("usage: release.ts plan | prepare | check | changed | notes | section");
      process.exit(2);
  }
}

/** A changelog section as plain text for stores that show raw text. */
export function mdToText(md: string): string {
  return md
    .replace(/^### (.*)$/gm, "$1:")
    .replace(/^ {2}- /gm, "   ◦ ")
    .replace(/^- /gm, "• ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim() + "\n";
}

