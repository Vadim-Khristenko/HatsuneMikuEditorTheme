// Builds every browser package from browser/src and the shared palette.
//   bun browser/build.ts            unpacked folders in browser/build/
//   bun browser/build.ts --zip      plus zips in dist/
import { cpSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromeThemeManifest, zenChromeCss, zenPreferences, zenUserChrome } from "./src/browser-themes";
import { THEME_IDS } from "./src/palette";

const require = createRequire(import.meta.url);
const archiverMod = require("archiver");
const archiver = archiverMod.default ?? archiverMod; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

const here = import.meta.dir;
const repo = join(here, "..");
const out = join(here, "build");
// The browser port has its own version in release.json; the repository version names the tag.
const version: string = JSON.parse(readFileSync(join(repo, "release.json"), "utf8")).ports.browser;
const zip = process.argv.includes("--zip");

const LOCALES: Record<string, { extName: string; extDescription: string }> = {
  en: { extName: "HatsuneMikuEditor", extDescription: "A Hatsune Miku new tab: four layouts, widgets, Helium style !bangs and the Miku Dark, Miku Light, Sakura Dark and Sakura Light themes." },
  ru: { extName: "HatsuneMikuEditor", extDescription: "Новая вкладка в стиле Хацунэ Мику: четыре макета, виджеты, !бэнги как в Helium и темы Miku Dark, Miku Light, Sakura Dark и Sakura Light." },
  zh_CN: { extName: "HatsuneMikuEditor", extDescription: "初音未来风格的新标签页：四种布局、小组件、Helium 式 !bang，以及 Miku Dark、Miku Light、Sakura Dark、Sakura Light 主题。" },
};

const ICONS = { "16": "icons/16.png", "32": "icons/32.png", "48": "icons/48.png", "128": "icons/128.png" };

function manifest(target: "chromium" | "firefox") {
  const base = {
    manifest_version: 3,
    name: "__MSG_extName__",
    short_name: "Miku Tab",
    version,
    description: "__MSG_extDescription__",
    default_locale: "en",
    icons: ICONS,
    chrome_url_overrides: { newtab: "newtab.html" },
    optional_permissions: ["tabs"],
    // "Icons from the site" reads a shortcut's own page; access is asked per site, never for all.
    optional_host_permissions: ["*://*/*"],
  };
  if (target === "chromium") {
    return { ...base, minimum_chrome_version: "116", permissions: ["storage", "search", "fontSettings", "favicon"] };
  }
  return {
    ...base,
    permissions: ["storage", "search", "theme"],
    background: { scripts: ["background.js"], type: "module" },
    // Firefox for Android has no new tab override; this button opens the page there.
    action: { default_title: "Miku Tab", default_icon: ICONS },
    browser_specific_settings: {
      gecko: {
        // hatsune-miku-editor@vai-rice.space was deleted on AMO, and AMO never takes a deleted ID back.
        id: "hatsune-miku-tab@vai-rice.space",
        strict_min_version: "140.0",
        // Nothing leaves the browser until the user asks for weather or remote icons.
        data_collection_permissions: { required: ["none"], optional: ["locationInfo", "browsingActivity"] },
      },
      // Built-in data consent reaches Android in 142.
      gecko_android: { strict_min_version: "142.0" },
    },
  };
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function zipDir(dir: string, file: string): Promise<void> {
  mkdirSync(join(repo, "dist"), { recursive: true });
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(join(repo, "dist", file));
    const archive = archiver("zip", { zlib: { level: 9 } });
    stream.on("close", () => resolve());
    archive.on("error", reject);
    archive.pipe(stream);
    archive.directory(dir + "/", false);
    void archive.finalize();
  });
}

async function bundle(): Promise<Map<string, string>> {
  const res = await Bun.build({
    entrypoints: [join(here, "src", "newtab.ts"), join(here, "src", "background.ts")],
    target: "browser",
    format: "esm",
    minify: true,
    naming: "[name].js",
  });
  if (!res.success) {
    for (const log of res.logs) console.error(log);
    throw new Error("bundle failed");
  }
  const files = new Map<string, string>();
  for (const o of res.outputs) files.set(o.path.split("/").pop()!, await o.text());
  return files;
}

async function extension(target: "chromium" | "firefox", js: Map<string, string>): Promise<string> {
  const dir = join(out, target);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  cpSync(join(here, "static"), dir, { recursive: true });
  cpSync(join(here, "data", "bangs.json"), join(dir, "bangs.json"));
  writeFileSync(join(dir, "newtab.js"), js.get("newtab.js")!);
  if (target === "firefox") writeFileSync(join(dir, "background.js"), js.get("background.js")!);
  for (const [loc, msgs] of Object.entries(LOCALES)) {
    mkdirSync(join(dir, "_locales", loc), { recursive: true });
    writeJson(join(dir, "_locales", loc, "messages.json"), Object.fromEntries(Object.entries(msgs).map(([k, v]) => [k, { message: v }])));
  }
  const walls = existsSync(join(here, "wallpapers")) ? readdirSync(join(here, "wallpapers")).filter((f) => /\.(webp|avif|jpe?g|png)$/i.test(f)).sort() : [];
  mkdirSync(join(dir, "wallpapers"), { recursive: true });
  for (const f of walls) cpSync(join(here, "wallpapers", f), join(dir, "wallpapers", f));
  writeJson(join(dir, "wallpapers.json"), walls);
  writeJson(join(dir, "manifest.json"), manifest(target));
  writeFileSync(join(dir, "THIRD_PARTY.txt"), readFileSync(join(here, "THIRD_PARTY.md"), "utf8"));
  return dir;
}

function colorful(id: (typeof THEME_IDS)[number]): string {
  const dir = join(out, `colorful-${id}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "icons"), { recursive: true });
  for (const s of ["16", "48", "128"]) cpSync(join(here, "static", "icons", `${s}.png`), join(dir, "icons", `${s}.png`));
  writeJson(join(dir, "manifest.json"), chromeThemeManifest(id, version));
  return dir;
}

/** The Zen mod lives in the repo (people copy it by hand), so it is regenerated in place. */
function zenMod(): string {
  const dir = join(here, "zen");
  mkdirSync(join(dir, "userChrome"), { recursive: true });
  writeFileSync(join(dir, "chrome.css"), zenChromeCss());
  writeJson(join(dir, "preferences.json"), zenPreferences());
  writeJson(join(dir, "theme.json"), {
    id: "hatsune-miku-editor",
    name: "HatsuneMikuEditor",
    description: "Miku and Sakura colors for Zen: sidebar, tabs, toolbar and URL bar. Pairs with the HatsuneMikuEditor new tab.",
    // Sine fetches updates from `${homepage}/theme.json`, so this has to name the branch and the folder.
    homepage: "https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/tree/master/browser/zen",
    style: "chrome.css",
    readme: "readme.md",
    preferences: "preferences.json",
    author: "Vadim Khristenko",
    version,
    tags: ["miku", "vocaloid", "teal", "pink", "dark", "light"],
  });
  for (const id of THEME_IDS) writeFileSync(join(dir, "userChrome", `${id}.css`), zenUserChrome(id));
  return dir;
}

const js = await bundle();
const chromium = await extension("chromium", js);
const firefox = await extension("firefox", js);
const themes = THEME_IDS.map((id) => [id, colorful(id)] as const);
const zen = zenMod();
console.log(`built ${version}: chromium, firefox, ${themes.length} colorful themes, zen mod`);

if (zip) {
  await zipDir(chromium, `hatsune-miku-editor-chromium-${version}.zip`);
  await zipDir(firefox, `hatsune-miku-editor-firefox-${version}.zip`);
  for (const [id, dir] of themes) await zipDir(dir, `hatsune-miku-colorful-browser-${id}-${version}.zip`);
  await zipDir(zen, `hatsune-miku-zen-mod-${version}.zip`);
  console.log("zips written to dist/");
}

if (!existsSync(join(chromium, "newtab.js"))) process.exit(1);
