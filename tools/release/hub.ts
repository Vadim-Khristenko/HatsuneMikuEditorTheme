// The "latest" release: one place with every download under a name that never changes, so
// https://github.com/OWNER/REPO/releases/latest/download/<file> always gives the newest build,
// plus the looks, the install steps and what changed, generated on every release.
//
//   bun tools/release/hub.ts assets --dir dist --out hub   copy builds to stable names
//   bun tools/release/hub.ts notes --tag vX.Y.Z            the hub page in Markdown
//   bun tools/release/hub.ts branch --dir hub --out themes --tag vX.Y.Z
//                                                          the "themes" branch: files by app, README with links
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { rgbHex } from "../telegram/color";
import { LOOKS as PALETTE_LOOKS } from "../palette/looks";
import { paletteOf, VARIANTS } from "../telegram/palette";
import { showAt } from "./git";
import { PORTS } from "./ports";
import { sectionOf } from "./release";

const REPO = process.env.GITHUB_REPOSITORY ?? "Vadim-Khristenko/HatsuneMikuEditorTheme";
const dl = (file: string) => `https://github.com/${REPO}/releases/latest/download/${file}`;
const blob = (path: string) => `https://github.com/${REPO}/blob/master/${path}`;
/** A file on the "themes" branch, as a direct download. */
const raw = (path: string) => `https://github.com/${REPO}/raw/${BRANCH}/${path}`;
export const BRANCH = "themes";

/** A build's name without its version: zed-0.2.3.zip becomes hatsune-miku-zed.zip. */
export function stableName(file: string): string {
  const name = basename(file);
  const bare = name.replace(/-\d+\.\d+\.\d+(?=\.[a-z]+$)/i, "");
  // Telegram files carry the look in a capitalized name (SnowMikuDark.attheme) and stay as they are.
  return /^(hatsune-miku|[A-Z])/.test(bare) ? bare : `hatsune-miku-${bare}`;
}

export function copyStable(dir: string, out: string): string[] {
  mkdirSync(out, { recursive: true });
  const done: string[] = [];
  for (const f of readdirSync(dir)) {
    if (f.startsWith(".") || !statSync(join(dir, f)).isFile()) continue;
    const target = stableName(f);
    copyFileSync(join(dir, f), join(out, target));
    done.push(target);
  }
  return done.sort();
}

type Group = "Editors" | "Browsers" | "Chat" | "Music";

interface App {
  port: string;
  group: Group;
  name: string;
  files: { label: string; file: string }[];
  store?: { label: string; url: string };
  steps: string[];
  guide: string;
  /** One-tap links that need no file, like Telegram cloud themes. */
  cloud?: { label: string; url: string }[];
}

/** Telegram cloud themes from tools/telegram/cloud.yml: one t.me/addtheme link per look, for every device. */
function cloudThemes(): { label: string; url: string }[] {
  const file = join(import.meta.dir, "..", "telegram", "cloud.yml");
  if (!existsSync(file)) return [];
  const list = Bun.YAML.parse(readFileSync(file, "utf8")) as { slug: string; title?: string }[];
  const titles = new Map<string, string>();
  for (const t of list) if (t.title || !titles.has(t.slug)) titles.set(t.slug, t.title ?? t.slug);
  return [...titles].map(([slug, title]) => ({ label: title, url: `https://t.me/addtheme/${slug}` }));
}

/** Telegram files are named after the look: HatsuneMikuSakuraDark, SnowMikuDark. */
const TG = VARIANTS.map((v) => ({ label: v.title.replace(/^Hatsune Miku /, ""), base: v.title.replace(/\s+/g, "") }));

export const APPS: App[] = [
  {
    port: "vsc", group: "Editors", name: "VS Code, Cursor, VSCodium", files: [{ label: ".vsix", file: "hatsune-miku-vsc.vsix" }],
    store: { label: "Open VSX", url: "https://open-vsx.org/extension/Vadim-Khristenko/hatsune-miku-by-vai-theme" },
    steps: ["Install from Open VSX, or download the `.vsix`.", "For the `.vsix`: Extensions → `⋯` → Install from VSIX.", "Ctrl+K Ctrl+T and pick a Hatsune Miku look."],
    guide: "vsc/README.md",
  },
  {
    port: "jetbrains", group: "Editors", name: "JetBrains IDEs", files: [{ label: "plugin .zip", file: "hatsune-miku-jetbrains.zip" }],
    store: { label: "JetBrains Marketplace", url: "https://plugins.jetbrains.com/plugin/33785-hatsune-miku-theme" },
    steps: ["Settings → Plugins → `⚙` → Install Plugin from Disk, pick the `.zip` (or install from the Marketplace).", "Settings → Appearance & Behavior → Appearance → Theme.", "Optional wallpaper: Settings → Appearance & Behavior → Hatsune Miku."],
    guide: "jetbrains/README.md",
  },
  {
    port: "zed", group: "Editors", name: "Zed", files: [{ label: ".zip", file: "hatsune-miku-zed.zip" }],
    steps: ["Unpack the `.zip`.", "Command palette → `zed: install dev extension`, pick the folder.", "Command palette → `theme selector: toggle`."],
    guide: "README.md#editors",
  },
  {
    port: "neovim", group: "Editors", name: "Neovim", files: [{ label: ".zip", file: "hatsune-miku-neovim.zip" }],
    steps: ["Copy `colors/` into `~/.config/nvim/` (Windows: `%LOCALAPPDATA%\\nvim\\`).", "`:colorscheme hatsune-miku`, or `hatsune-miku-light`, `hatsune-miku-sakura`, `hatsune-miku-sakura-light`."],
    guide: "neovim/README.md",
  },
  {
    port: "sublime", group: "Editors", name: "Sublime Text", files: [{ label: ".zip", file: "hatsune-miku-sublime.zip" }],
    steps: ["Preferences → Browse Packages, unpack into `User`.", "Preferences → Select Color Scheme."],
    guide: "sublime/README.md",
  },
  {
    port: "notepadpp", group: "Editors", name: "Notepad++", files: [{ label: ".zip", file: "hatsune-miku-notepadpp.zip" }],
    steps: ["Unpack the `.zip`.", "Settings → Import → Import style theme(s), pick an `.xml`.", "Settings → Style Configurator → Select theme."],
    guide: "notepadpp/README.md",
  },
  {
    port: "browser", group: "Browsers", name: "Firefox", files: [{ label: "signed .xpi", file: "hatsune-miku-editor-firefox.xpi" }],
    store: { label: "addons.mozilla.org", url: "https://addons.mozilla.org/firefox/addon/hatsunemikueditor/" },
    steps: ["Install from addons.mozilla.org; Firefox keeps it updated.", "Open a new tab; the gear in the corner holds layouts, widgets and looks."],
    guide: "browser/README.md",
  },
  {
    port: "browser", group: "Browsers", name: "Chrome, Edge, Helium, any Chromium",
    files: [{ label: "new tab", file: "hatsune-miku-editor-chromium.zip" }, ...VARIANTS.map((v) => ({ label: `frame ${v.id}`, file: `hatsune-miku-colorful-browser-${v.id}.zip` }))],
    steps: ["Unpack the `.zip`.", "`chrome://extensions` → Developer mode on → Load unpacked → pick the folder.", "Frame colors are separate extensions, one per look."],
    guide: "browser/README.md",
  },
  {
    port: "browser", group: "Browsers", name: "Zen", files: [{ label: "mod", file: "hatsune-miku-zen-mod.zip" }],
    steps: ["Install Sine, then add the mod from this repository; the readme walks through it."],
    guide: "browser/zen/readme.md",
  },
  {
    port: "telegram", group: "Chat", name: "Telegram for Android", files: TG.map((t) => ({ label: t.label, file: `${t.base}.attheme` })),
    cloud: cloudThemes(),
    steps: ["Easiest: open a cloud theme link on your phone; Telegram applies it and keeps it updated.", "Or send the `.attheme` to Saved Messages, tap the file → Apply."],
    guide: "README.md#telegram",
  },
  {
    port: "telegram", group: "Chat", name: "Telegram Desktop", files: TG.map((t) => ({ label: t.label, file: `${t.base}.tdesktop-theme` })),
    cloud: cloudThemes(),
    steps: ["Easiest: open a cloud theme link in Telegram Desktop; it applies and keeps it updated.", "Or open the `.tdesktop-theme` in Telegram (or send it to Saved Messages and click it) → Apply."],
    guide: "README.md#telegram",
  },
  {
    port: "spicetify", group: "Music", name: "Spotify (Spicetify)", files: [{ label: ".zip", file: "hatsune-miku-spicetify.zip" }],
    steps: ["Install Spicetify and run `spicetify backup apply` once.", "Unpack the `.zip` into the Spicetify Themes folder (`spicetify path userdata` shows where).", "`spicetify config current_theme HatsuneMiku color_scheme MikuDark`, then `spicetify apply`. Schemes: MikuDark, MikuLight, SakuraDark, SakuraLight, SnowDark, SnowLight, TetoDark, TetoLight."],
    guide: "spicetify/README.md",
  },
];

/** What comes next, so people know where the themes are heading. */
export const COMING = [
  "**Discord**, desktop and mobile, for clients that take themes.",
  "**Telegram for iOS**.",
  "**Palette tokens**: full scales and named tokens for every part of an interface, so new apps start from roles instead of hex.",
];

/** A colored chip with its hex, rendered by shields.io; GitHub shows it inline. */
const chip = (label: string, hex: string) => `![${label} ${hex}](https://img.shields.io/badge/${encodeURIComponent(label)}-${hex.slice(1)}-${hex.slice(1)}?style=flat-square)`;

const NAMES: Record<string, string> = Object.fromEntries(PALETTE_LOOKS.map((l) => [l.code, l.title]));

function looks(): string[] {
  const out = ["## Looks", "", "| Look | Background | Text | Accent | Error | Warning | Info |", "|---|---|---|---|---|---|---|"];
  for (const v of VARIANTS) {
    const p = paletteOf(v);
    const row = [p.bg, p.fg, p.accent, p.red, p.yellow, p.blue].map((c, i) => chip(["bg", "text", "accent", "error", "warning", "info"][i], rgbHex(c)));
    out.push(`| **${NAMES[v.code]}** | ${row.join(" | ")} |`);
  }
  return out;
}

function whatsNew(tag: string, ports: Record<string, string>): string[] {
  const out = ["## What's new", ""];
  for (const port of PORTS) {
    const v = ports[port.id];
    const text = v ? showAt(tag, port.changelog) : null;
    const section = text && sectionOf(text, v);
    if (!section || /released together/i.test(section)) continue;
    const top = section.split("\n").filter((l) => /^- /.test(l)).slice(0, 3);
    out.push(`**${port.title} ${v}**: ${top.map((l) => l.slice(2)).join("; ")}. [Changelog](${blob(port.changelog)})`, "");
  }
  return out.length > 2 ? out : [];
}

/** Where a file lives on the "themes" branch: one folder per port. */
export const branchPath = (port: string, file: string) => `${port}/${file}`;

/** The hub page: for the "latest" release, or as the README of the "themes" branch with links into it. */
export function hubNotes(tag: string, where: "release" | "branch" = "release", missing = new Set<string>()): string {
  const ports: Record<string, string> = JSON.parse(showAt(tag, "release.json") ?? "null")?.ports ?? {};
  const link = (a: App, file: string) => (where === "release" ? dl(file) : raw(branchPath(a.port, file)));
  const release = `[${tag}](https://github.com/${REPO}/releases/tag/${tag})`;
  const intro =
    where === "release"
      ? [`Every Hatsune Miku theme in one place, from release ${release}. The download links always point at the newest build: bookmark them, they never change.`]
      : [
          "# Hatsune Miku themes, ready to download",
          "",
          `Every theme from release ${release}, one folder per app. Every release rebuilds this branch, so these links always give the newest build. Sources, docs and issues live on [master](https://github.com/${REPO}).`,
        ];
  const out = [
    ...intro,
    "",
    ...looks(),
    "",
    "## Download",
    "",
  ];
  for (const group of ["Editors", "Browsers", "Chat", "Music"] as Group[]) {
    out.push(`### ${group}`, "", "| App | Version | Get it |", "|---|---|---|");
    for (const a of APPS.filter((x) => x.group === group)) {
      const files = a.files.filter((f) => !missing.has(f.file)).map((f) => `[${f.label}](${link(a, f.file)})`).join(" · ");
      const store = a.store ? `**[${a.store.label}](${a.store.url})**` : "";
      out.push(`| **${a.name}** | \`${ports[a.port] ?? "?"}\` | ${[store, files].filter(Boolean).join(" · ")} |`);
    }
    out.push("");
    const cloud = APPS.find((x) => x.group === group && x.cloud?.length)?.cloud;
    if (cloud) out.push(`**Telegram cloud themes**, one link for Android and Desktop, updated with every release: ${cloud.map((c) => `[${c.label}](${c.url})`).join(" · ")}`, "");
  }
  out.push("## Install", "");
  for (const a of APPS) {
    out.push(`<details><summary><b>${a.name}</b></summary>`, "", ...a.steps.map((s, i) => `${i + 1}. ${s}`), "", `More in the [guide](${blob(a.guide)}).`, "", "</details>");
  }
  out.push("", ...whatsNew(tag, ports));
  out.push("## Coming next", "", ...COMING.map((c) => `- ${c}`), "");
  out.push(
    "## Help",
    "",
    `Something looks off? [Open an issue](https://github.com/${REPO}/issues/new/choose) and pick the app; a screenshot helps most. Every port has its own changelog: ${PORTS.map((p) => `[${p.title}](${blob(p.changelog)})`).join(", ")}.`,
    "",
  );
  return out.join("\n");
}

/**
 * Lays out the "themes" branch: every app's files in its port folder, and the hub page as README.md
 * with links into the branch. Returns the files the apps list but the release did not have.
 */
export function writeBranch(dir: string, out: string, tag: string): string[] {
  const missing: string[] = [];
  for (const a of APPS) {
    for (const f of a.files) {
      const from = join(dir, f.file);
      if (!existsSync(from)) {
        missing.push(f.file);
        continue;
      }
      mkdirSync(join(out, a.port), { recursive: true });
      copyFileSync(from, join(out, branchPath(a.port, f.file)));
    }
  }
  writeFileSync(join(out, "README.md"), hubNotes(tag, "branch", new Set(missing)));
  return missing;
}

if (import.meta.main) {
  const arg = (n: string) => {
    const i = process.argv.indexOf(`--${n}`);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const cmd = process.argv[2];
  if (cmd === "assets") for (const f of copyStable(arg("dir") ?? "dist", arg("out") ?? "hub")) console.log(f);
  else if (cmd === "notes") {
    // --have: a file listing every asset the hub will carry; links to anything else are left out.
    const have = arg("have");
    const present = have ? new Set(readFileSync(have, "utf8").split(/\r?\n/).map((l) => basename(l.trim())).filter(Boolean)) : null;
    const missing = present ? APPS.flatMap((a) => a.files.map((f) => f.file)).filter((f) => !present.has(f)) : [];
    process.stdout.write(hubNotes(arg("tag") ?? "HEAD", "release", new Set(missing)));
  }
  else if (cmd === "branch") {
    for (const m of writeBranch(arg("dir") ?? "hub", arg("out") ?? BRANCH, arg("tag") ?? "HEAD")) console.error(`not in this release: ${m}`);
  } else {
    console.error("usage: hub.ts assets --dir D --out O | notes --tag T | branch --dir D --out O --tag T");
    process.exit(2);
  }
}
