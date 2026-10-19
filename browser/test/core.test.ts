import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { BangIndex, expandBang, parseBang, type BangRow } from "../src/bangs";
import { chromeThemeManifest, firefoxTheme, zenChromeCss, zenPreferences } from "../src/browser-themes";
import { detectLang, makeI18n, MESSAGES } from "../src/i18n";
import { contrast, PALETTES, THEME_IDS } from "../src/palette";
import { engineUrl, looksLikeUrl, resolve } from "../src/search";
import { defaults, normalize, normalizeUrl, WIDGETS } from "../src/settings";

const rows = JSON.parse(readFileSync(join(import.meta.dir, "..", "data", "bangs.json"), "utf8")) as BangRow[];
const index = new BangIndex(rows);

describe("bangs", () => {
  test("snapshot has the Helium list", () => {
    expect(index.size).toBeGreaterThan(10000);
    expect(index.get("ttv")?.name).toBe("Twitch");
    expect(index.get("!GH")?.name).toBe("GitHub");
  });

  test("parse finds the bang anywhere", () => {
    expect(parseBang("!ttv lofi girl")).toEqual({ trigger: "ttv", query: "lofi girl" });
    expect(parseBang("lofi girl !ttv")).toEqual({ trigger: "ttv", query: "lofi girl" });
    expect(parseBang("hatsune miku w!")).toEqual({ trigger: "w", query: "hatsune miku" });
    expect(parseBang("hello world")).toBeNull();
    expect(parseBang("wow!")).toBeNull();
  });

  test("expand follows Helium flags", () => {
    const ttv = index.get("ttv")!;
    expect(expandBang(ttv, "lofi girl")).toBe("https://www.twitch.tv/search?term=lofi+girl");
    expect(expandBang(ttv, "")).toBe("https://www.twitch.tv/search");
    const repo = index.bangs.find((b) => b.name === "GitHub Repo")!;
    expect(expandBang(repo, "Vadim-Khristenko/HatsuneMikuEditorTheme")).toBe("https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme");
    const deepl = index.bangs.find((b) => b.name === "DeepL Translator")!;
    expect(expandBang(deepl, "мику топ")).toBe("https://www.deepl.com/translator#xx/en/%D0%BC%D0%B8%D0%BA%D1%83%20%D1%82%D0%BE%D0%BF");
  });

  test("suggest ranks exact and short triggers first", () => {
    const s = index.suggest("tt");
    expect(s.length).toBeGreaterThan(0);
    expect(s[0].trigger.startsWith("tt")).toBe(true);
    expect(index.suggest("ttv")[0].bang.name).toBe("Twitch");
    expect(index.suggest("tt").map((x) => x.bang.name).slice(0, 2)).toContain("Twitch");
    expect(index.suggest("")).toEqual([]);
  });
});

describe("search", () => {
  test("urls are detected", () => {
    for (const u of ["github.com", "https://a.b/c?d", "localhost:3000", "192.168.1.1", "vai-rice.space/path"]) expect(looksLikeUrl(u)).toBe(true);
    for (const q of ["hatsune miku", "what is 1.5", "miku", "c++"]) expect(looksLikeUrl(q)).toBe(false);
  });

  test("resolve prefers bangs, then urls, then search", () => {
    expect(resolve("!ttv lofi", index, true)).toMatchObject({ kind: "bang", url: "https://www.twitch.tv/search?term=lofi" });
    expect(resolve("!ttv lofi", index, false)).toEqual({ kind: "search", query: "!ttv lofi" });
    expect(resolve("!nosuchbang123 x", index, true)).toEqual({ kind: "search", query: "!nosuchbang123 x" });
    expect(resolve("github.com", index, true)).toEqual({ kind: "url", url: "https://github.com" });
    expect(resolve("localhost:5173", null, true)).toEqual({ kind: "url", url: "http://localhost:5173" });
    expect(resolve("   ", index, true)).toEqual({ kind: "none" });
  });

  test("engine urls", () => {
    expect(engineUrl("browser", "", "x")).toBeNull();
    expect(engineUrl("duckduckgo", "", "miku 39")).toBe("https://duckduckgo.com/?q=miku%2039");
    expect(engineUrl("custom", "https://s.example/?q={searchTerms}", "a")).toBe("https://s.example/?q=a");
    expect(engineUrl("custom", "broken", "a")).toBe("https://duckduckgo.com/?q=a");
  });
});

describe("settings", () => {
  test("garbage becomes defaults", () => {
    expect(normalize(null)).toEqual(defaults());
    expect(normalize("x")).toEqual(defaults());
    expect(normalize({ theme: "neon", layout: 4 }).theme).toBe("miku-dark");
  });

  test("valid values survive a round trip", () => {
    const s = defaults();
    s.theme = "sakura-light";
    s.layout = "score";
    s.todos = [{ id: "a", text: "ship", done: true }];
    s.events = [{ id: "e", date: "2026-10-19", time: "19:00", title: "Release" }];
    expect(normalize(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  test("bad items are dropped and order is completed", () => {
    const n = normalize({
      shortcuts: [{ name: "ok", url: "example.com" }, { name: "js", url: "javascript:alert(1)" }, 5],
      events: [{ date: "2026-1-1", time: "25:00", title: "x" }],
      order: ["note", "nope", "clock"],
      wallpaper: { dim: 400 },
    });
    expect(n.shortcuts.map((s) => s.url)).toEqual(["https://example.com/"]);
    expect(n.events).toEqual([]);
    expect(n.order.slice(0, 2)).toEqual(["note", "clock"]);
    expect(new Set(n.order)).toEqual(new Set(WIDGETS));
    expect(n.wallpaper.dim).toBe(90);
  });

  test("normalizeUrl only allows http(s)", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
    expect(normalizeUrl("file:///etc/passwd")).toBeNull();
    expect(normalizeUrl("")).toBeNull();
  });
});

describe("i18n", () => {
  test("every locale has every key and keeps placeholders", () => {
    const keys = Object.keys(MESSAGES.en).sort();
    for (const lang of ["ru", "zh"] as const) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) {
        const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
        expect(vars(MESSAGES[lang][k as keyof typeof MESSAGES.en])).toEqual(vars(MESSAGES.en[k as keyof typeof MESSAGES.en]));
      }
    }
  });

  test("language detection and interpolation", () => {
    expect(detectLang("ru-RU")).toBe("ru");
    expect(detectLang("zh-TW")).toBe("zh");
    expect(detectLang("de")).toBe("en");
    expect(makeI18n("ru").t("bangsHint", { count: 5 })).toContain("5");
  });
});

describe("palette", () => {
  test("text keeps WCAG AA contrast in every theme", () => {
    for (const id of THEME_IDS) {
      const p = PALETTES[id];
      for (const surface of [p.bg, p.card, p.alt]) {
        expect(contrast(p.fg, surface)).toBeGreaterThanOrEqual(7);
        expect(contrast(p.muted, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.accent, surface)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(p.ink, p.fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("browser themes are generated for every variant", () => {
    for (const id of THEME_IDS) {
      const m = chromeThemeManifest(id, "1.0.0");
      expect(m.theme.colors.toolbar).toHaveLength(3);
      expect(m.name).toContain("Colorful Browser");
      expect(firefoxTheme(PALETTES[id]).properties.color_scheme).toBe(PALETTES[id].dark ? "dark" : "light");
    }
    const css = zenChromeCss();
    for (const o of zenPreferences()[0].options) expect(css).toContain(`"${o.value}"`);
  });

  test("committed Zen mod matches the palette (run bun run build:browser)", () => {
    const zen = join(import.meta.dir, "..", "zen");
    expect(readFileSync(join(zen, "chrome.css"), "utf8")).toBe(zenChromeCss());
    expect(JSON.parse(readFileSync(join(zen, "preferences.json"), "utf8"))).toEqual(zenPreferences());
  });
});

describe("repo rules", () => {
  test("no em dashes in browser sources", () => {
    const bad: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) {
          if (!["build", "node_modules", "fonts", "data"].includes(f)) walk(p);
        } else if (/\.(ts|css|html|json|md)$/.test(f) && readFileSync(p, "utf8").includes(String.fromCharCode(0x2014))) bad.push(p);
      }
    };
    walk(join(import.meta.dir, ".."));
    expect(bad).toEqual([]);
  });
});
