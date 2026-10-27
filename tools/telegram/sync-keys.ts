// Snapshots every theme color key of Telegram for Android and Telegram Desktop, with the
// client's own default and fallback, into tools/telegram/keys.json. Run it when Telegram
// adds keys: bun tools/telegram/sync-keys.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AndroidKey, DesktopKey, KeySnapshot } from "./keys";
import { readZip } from "./zip";

const ANDROID = {
  repo: "DrKLO/Telegram",
  branch: "master",
  dir: "TMessagesProj/src/main/java/org/telegram/ui/ActionBar",
  night: "TMessagesProj/src/main/assets/night.attheme",
};
const DESKTOP = { repo: "desktop-app/lib_ui", branch: "master", file: "ui/colors.palette" };
const DESKTOP_NIGHT = { repo: "telegramdesktop/tdesktop", branch: "dev", file: "Telegram/Resources/night.tdesktop-theme" };

/** Keys in the Android map that hold numbers, not colors. */
const ANDROID_NOT_COLORS = new Set(["wallpaperFileOffset", "chat_wallpaper_gradient_rotation"]);

async function headOf(repo: string, branch: string): Promise<string> {
  const r = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, { headers: { Accept: "application/vnd.github.sha" } });
  if (!r.ok) throw new Error(`${repo}@${branch}: HTTP ${r.status}`);
  return (await r.text()).trim();
}

async function rawBytes(repo: string, commit: string, path: string): Promise<Uint8Array> {
  const r = await fetch(`https://raw.githubusercontent.com/${repo}/${commit}/${path}`);
  if (!r.ok) throw new Error(`${repo}/${path}: HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

const raw = async (repo: string, commit: string, path: string) => new TextDecoder().decode(await rawBytes(repo, commit, path));

const argb = (n: number) => "#" + (n >>> 0).toString(16).padStart(8, "0");

export function parseAndroid(themeColors: string, theme: string): Record<string, AndroidKey> {
  const constants = new Map<string, number>([["Color.WHITE", 0xffffffff], ["Color.BLACK", 0xff000000], ["Color.TRANSPARENT", 0]]);
  for (const m of themeColors.matchAll(/static final int (\w+)\s*=\s*0x([0-9a-fA-F]{8});/g)) constants.set(m[1], parseInt(m[2], 16));

  const value = (expr: string, key: string): number => {
    const e = expr.trim();
    let m: RegExpMatchArray | null;
    if ((m = e.match(/^0x([0-9a-fA-F]{1,8})$/))) return parseInt(m[1], 16);
    if (/^-?\d+$/.test(e)) return Number(e) >>> 0;
    if (constants.has(e)) return constants.get(e)!;
    if ((m = e.match(/^ColorUtils\.setAlphaComponent\(([\w.]+),\s*(\d+)\)$/)) && constants.has(m[1])) {
      return ((constants.get(m[1])! & 0xffffff) | (Number(m[2]) << 24)) >>> 0;
    }
    throw new Error(`android default of ${key}: cannot read "${e}"`);
  };

  const defaults = new Map<string, number>();
  for (const m of themeColors.matchAll(/defaultColors\[key_(\w+)\]\s*=\s*([^;]+);/g)) defaults.set(m[1], value(m[2], m[1]));

  const fallbacks = new Map<string, string>();
  for (const m of theme.matchAll(/fallbackKeys\.put\((?:Theme\.)?key_(\w+),\s*(?:Theme\.)?key_(\w+)\);/g)) fallbacks.set(m[1], m[2]);

  const out: Record<string, AndroidKey> = {};
  const names = new Map<string, string>();
  for (const m of themeColors.matchAll(/colorKeysMap\.put\(key_(\w+),\s*"([^"]+)"\);/g)) names.set(m[1], m[2]);
  for (const [id, name] of [...names].sort((a, b) => a[1].localeCompare(b[1]))) {
    if (ANDROID_NOT_COLORS.has(name)) continue;
    const entry: AndroidKey = {};
    if (defaults.has(id)) entry.default = argb(defaults.get(id)!);
    const fb = fallbacks.get(id);
    if (fb && names.has(fb)) entry.fallback = names.get(fb);
    out[name] = entry;
  }
  return out;
}

/** key=value lines of an .attheme, values as signed ints or #[aa]rrggbb, up to the wallpaper. */
export function parseAttheme(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of text.split("\n")) {
    if (line.startsWith("WPS")) break;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const v = line.slice(i + 1).trim();
    let n: number;
    if (v.startsWith("#")) {
      const h = v.slice(1);
      n = parseInt(h.length === 6 ? "ff" + h : h, 16);
    } else n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`attheme: cannot read ${line}`);
    out.set(line.slice(0, i).trim(), argb(n));
  }
  return out;
}

/** name: #rrggbb[aa]; lines of a .tdesktop-theme palette. References stay unresolved. */
export function parseTdesktopColors(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of text.matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*([#A-Za-z0-9_]+)\s*;/gm)) out.set(m[1], m[2].startsWith("#") ? m[2].toLowerCase() : m[2]);
  return out;
}

export function parseDesktop(palette: string): Record<string, DesktopKey> {
  const out: Record<string, DesktopKey> = {};
  for (const line of palette.split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*([^;]+);\s*(?:\/\/\s*(.*))?$/);
    if (!m) continue;
    const [, name, rawValue, note] = m;
    const [first, fallback] = rawValue.split("|").map((s) => s.trim());
    const entry: DesktopKey = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(first) ? { default: first.toLowerCase() } : { ref: first };
    if (entry.ref && !out[entry.ref]) throw new Error(`desktop ${name}: refers to ${entry.ref} before it is defined`);
    if (fallback) entry.fallback = fallback;
    if (note) entry.note = note.trim();
    out[name] = entry;
  }
  return out;
}

if (import.meta.main) {
  const aCommit = await headOf(ANDROID.repo, ANDROID.branch);
  const dCommit = await headOf(DESKTOP.repo, DESKTOP.branch);
  const nCommit = await headOf(DESKTOP_NIGHT.repo, DESKTOP_NIGHT.branch);
  const [themeColors, theme, androidNight, palette, desktopNightZip] = await Promise.all([
    raw(ANDROID.repo, aCommit, `${ANDROID.dir}/ThemeColors.java`),
    raw(ANDROID.repo, aCommit, `${ANDROID.dir}/Theme.java`),
    raw(ANDROID.repo, aCommit, ANDROID.night),
    raw(DESKTOP.repo, dCommit, DESKTOP.file),
    rawBytes(DESKTOP_NIGHT.repo, nCommit, DESKTOP_NIGHT.file),
  ]);

  const android = parseAndroid(themeColors, theme);
  for (const [k, v] of parseAttheme(androidNight)) if (android[k]) android[k].night = v;

  const desktop = parseDesktop(palette);
  const scheme = readZip(desktopNightZip).find((e) => /^colors\.tdesktop-(theme|palette)$/i.test(e.name));
  if (!scheme) throw new Error("night.tdesktop-theme has no colors file");
  for (const [k, v] of parseTdesktopColors(new TextDecoder().decode(scheme.data))) if (desktop[k]) desktop[k].night = v;

  const snapshot: KeySnapshot = {
    android: {
      source: `https://github.com/${ANDROID.repo}/tree/${aCommit}`,
      files: [`${ANDROID.dir}/ThemeColors.java`, `${ANDROID.dir}/Theme.java`, ANDROID.night],
      keys: android,
    },
    desktop: {
      source: `https://github.com/${DESKTOP.repo}/blob/${dCommit}/${DESKTOP.file}`,
      night: `https://github.com/${DESKTOP_NIGHT.repo}/blob/${nCommit}/${DESKTOP_NIGHT.file}`,
      keys: desktop,
    },
  };
  const file = join(import.meta.dir, "keys.json");
  writeFileSync(file, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`android ${Object.keys(snapshot.android.keys).length} keys, desktop ${Object.keys(snapshot.desktop.keys).length} keys -> ${file}`);
}
