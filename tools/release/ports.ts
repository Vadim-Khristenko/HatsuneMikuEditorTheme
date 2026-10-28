import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const ROOT = join(import.meta.dir, "..", "..");
const at = (p: string) => join(ROOT, p);

/** A place where a port writes its own version, read and written as text so formatting stays put. */
export interface VersionSpot {
  file: string;
  pattern: RegExp;
}

export interface Port {
  id: string;
  title: string;
  /** Paths whose changes ship in this port. A commit touching none of them does not release it. */
  paths: string[];
  /** Version files besides release.json; the first capture group of each pattern is the version. */
  versions: VersionSpot[];
  changelog: string;
  /** Where the port is published besides the GitHub release. */
  stores: ("openvsx" | "jetbrains" | "amo")[];
}

export const PORTS: Port[] = [
  {
    id: "vsc",
    title: "VS Code",
    paths: ["vsc/themes", "vsc/package.json", "vsc/README.md", "vsc/icon.png", "vsc/LICENSE"],
    versions: [{ file: "vsc/package.json", pattern: /^ {2}"version": "([^"]+)"/m }],
    changelog: "vsc/CHANGELOG.md",
    stores: ["openvsx"],
  },
  {
    id: "zed",
    title: "Zed",
    paths: ["zed"],
    versions: [{ file: "zed/extension.toml", pattern: /^version = "([^"]+)"/m }],
    changelog: "zed/CHANGELOG.md",
    stores: [],
  },
  {
    id: "jetbrains",
    title: "JetBrains",
    paths: ["jetbrains/src", "jetbrains/build.gradle.kts", "jetbrains/settings.gradle.kts", "jetbrains/README.md", "tools/gen-jb-schemes.mjs", "tools/gen-jb-ui.mjs", "tools/jb-palette.json"],
    versions: [
      { file: "jetbrains/gradle.properties", pattern: /^pluginVersion = (\S+)/m },
      { file: "jetbrains/src/main/resources/META-INF/plugin.xml", pattern: /<version>([^<]+)<\/version>/ },
    ],
    changelog: "jetbrains/CHANGELOG.md",
    stores: ["jetbrains"],
  },
  {
    id: "neovim",
    title: "Neovim",
    paths: ["neovim"],
    versions: [],
    changelog: "neovim/CHANGELOG.md",
    stores: [],
  },
  {
    id: "sublime",
    title: "Sublime Text",
    paths: ["sublime"],
    versions: [],
    changelog: "sublime/CHANGELOG.md",
    stores: [],
  },
  {
    id: "notepadpp",
    title: "Notepad++",
    paths: ["notepadpp"],
    versions: [],
    changelog: "notepadpp/CHANGELOG.md",
    stores: [],
  },
  {
    id: "browser",
    title: "Browser",
    paths: ["browser/src", "browser/static", "browser/data", "browser/zen", "browser/build.ts", "browser/wallpapers", "tools/jb-palette.json", "palette/palette.json"],
    versions: [{ file: "browser/zen/theme.json", pattern: /^ {2}"version": "([^"]+)"/m }],
    changelog: "browser/CHANGELOG.md",
    stores: ["amo"],
  },
  {
    id: "telegram",
    title: "Telegram",
    paths: ["tools/telegram/android.ts", "tools/telegram/desktop.ts", "tools/telegram/art.ts", "tools/telegram/palette.ts", "tools/telegram/remap.ts", "tools/telegram/color.ts", "tools/telegram/keys.json", "tools/telegram/png.ts", "tools/telegram/zip.ts", "tools/telegram/build.ts", "tools/telegram/cloud.yml", "tools/palette", "vsc/themes", "tools/jb-palette.json"],
    versions: [],
    changelog: "tools/telegram/CHANGELOG.md",
    stores: [],
  },
  {
    id: "spicetify",
    title: "Spicetify",
    paths: ["spicetify"],
    versions: [],
    changelog: "spicetify/CHANGELOG.md",
    stores: [],
  },
];

export const portById = (id: string): Port => {
  const p = PORTS.find((x) => x.id === id);
  if (!p) throw new Error(`unknown port ${id}`);
  return p;
};

export interface ReleaseFile {
  /** Version of every port; the repository version lives in package.json and names the tag. */
  ports: Record<string, string>;
}

export const readRelease = (): ReleaseFile => JSON.parse(readFileSync(at("release.json"), "utf8"));
export const writeRelease = (r: ReleaseFile) => writeFileSync(at("release.json"), JSON.stringify(r, null, 2) + "\n");

export const readRootVersion = (): string => JSON.parse(readFileSync(at("package.json"), "utf8")).version;
export function writeRootVersion(v: string): void {
  const text = readFileSync(at("package.json"), "utf8");
  writeFileSync(at("package.json"), text.replace(/^ {2}"version": "[^"]+"/m, `  "version": "${v}"`));
}

/** Versions a port's own files declare, by file. */
export function nativeVersions(port: Port): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of port.versions) {
    const m = readFileSync(at(s.file), "utf8").match(s.pattern);
    if (!m) throw new Error(`${s.file}: no version found`);
    out[s.file] = m[1];
  }
  return out;
}

export function writeNativeVersions(port: Port, v: string): void {
  for (const s of port.versions) {
    const text = readFileSync(at(s.file), "utf8");
    const m = text.match(s.pattern);
    if (!m) throw new Error(`${s.file}: no version found`);
    writeFileSync(at(s.file), text.replace(m[0], m[0].replace(m[1], v)));
  }
}

/** Every mismatch between release.json and the version a port's own files declare. */
export function versionDrift(): string[] {
  const release = readRelease();
  const bad: string[] = [];
  for (const port of PORTS) {
    const v = release.ports[port.id];
    if (!v) {
      bad.push(`release.json has no version for ${port.id}`);
      continue;
    }
    for (const [file, got] of Object.entries(nativeVersions(port))) if (got !== v) bad.push(`${file}: ${got}, release.json says ${port.id} ${v}`);
  }
  for (const id of Object.keys(release.ports)) if (!PORTS.some((p) => p.id === id)) bad.push(`release.json: unknown port ${id}`);
  return bad;
}
