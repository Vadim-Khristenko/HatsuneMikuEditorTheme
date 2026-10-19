import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { BangIndex, expandBang, parseBang, type BangRow } from "../src/bangs";
import { chromeThemeManifest, firefoxTheme, zenChromeCss, zenPreferences } from "../src/browser-themes";
import { detectLang, makeI18n, MESSAGES } from "../src/i18n";
import { contrast, PALETTES, THEME_IDS } from "../src/palette";
import { buildIndex, engineName, engineUrl, looksLikeUrl, resolve } from "../src/search";
import { ageOn, daysUntilBirthday, greet, occasionOf } from "../src/greetings";
import { PHRASES } from "../src/locales/phrases";
import { defaults, normalize, normalizeUrl, WIDGETS } from "../src/settings";
import { nextIndex } from "../src/wallpaper";

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

  test("engine urls, presets and custom", () => {
    const mine = [{ id: "e1", name: "Lite", url: "https://lite.example/?q=%s" }];
    expect(engineUrl("browser", mine, "x")).toBeNull();
    expect(engineUrl("duckduckgo", mine, "miku 39")).toBe("https://duckduckgo.com/?q=miku%2039");
    expect(engineUrl("custom:e1", mine, "a b")).toBe("https://lite.example/?q=a%20b");
    expect(engineUrl("custom:gone", mine, "a")).toBe("https://duckduckgo.com/?q=a");
    expect(engineName("custom:e1", mine)).toBe("Lite");
    expect(engineName("browser", mine)).toBeNull();
  });

  test("personal bangs win over built-in ones", () => {
    const idx = buildIndex(rows, [{ id: "b", trigger: "ttv", name: "Mine", url: "https://mine.example/s/%s" }, { id: "c", trigger: "home", name: "Home", url: "https://vai-rice.space" }]);
    expect(resolve("!ttv lofi", idx, true)).toMatchObject({ url: "https://mine.example/s/lofi" });
    expect(resolve("!home", idx, true)).toMatchObject({ url: "https://vai-rice.space/" });
    expect(idx.suggest("hom")[0].bang.name).toBe("Home");
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

  test("0.1 settings migrate: single picture, custom engine, favicons", () => {
    const n = normalize({ wallpaper: { kind: "image", dim: 20 }, search: { engine: "custom", custom: "https://s.example/?q=%s" }, favicons: true });
    expect(n.wallpaper.kind).toBe("playlist");
    expect(n.wallpaper.playlists[0].items).toEqual(["img:wallpaper"]);
    expect(n.wallpaper.active).toBe(n.wallpaper.playlists[0].id);
    expect(n.search.engine).toBe("custom:legacy");
    expect(n.search.engines[0].url).toBe("https://s.example/?q=%s");
    expect(n.icons).toBe("browser");
  });

  test("birthday, custom bangs and playlists are validated", () => {
    const n = normalize({
      birthday: "2010-13-40",
      search: { myBangs: [{ trigger: "!Mk", url: "example.com/?q=%s" }, { trigger: "bad trigger", url: "https://x.y" }], engines: [{ name: "no terms", url: "https://x.y" }] },
      wallpaper: { playlists: [{ name: "a", items: ["img:abc", "set:miku-dark.webp", "evil:../../x", "img:abc"], every: "weekly" }] },
    });
    expect(n.birthday).toBe("");
    expect(n.search.myBangs.map((b) => b.trigger)).toEqual(["mk"]);
    expect(n.search.engines).toEqual([]);
    expect(n.wallpaper.playlists[0].items).toEqual(["img:abc", "set:miku-dark.webp"]);
    expect(n.wallpaper.playlists[0].every).toBe("tab");
    expect(normalize({ birthday: "2009-08-31" }).birthday).toBe("2009-08-31");
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

describe("greetings", () => {
  const at = (iso: string) => new Date(`${iso}`);
  const opts = { name: "Вадим", birthday: "", seed: 0.42, sep: ", ", intl: "ru-RU" };

  test("every bank has phrases in every language, all with the name slot", () => {
    for (const lang of ["ru", "en", "zh"] as const) {
      for (const [key, list] of Object.entries(PHRASES[lang])) {
        if (key === "soon") continue;
        expect((list as string[]).length).toBeGreaterThan(1);
        if (!["stage", "zen"].includes(key)) for (const ph of list as string[]) expect(ph).toContain("{name}");
      }
    }
  });

  test("time of day, name and no name", () => {
    const morning = greet("ru", at("2026-10-20T08:00"), opts).text;
    expect(PHRASES.ru.morning.map((p) => p.replace("{name}", ", Вадим"))).toContain(morning);
    const noName = greet("en", at("2026-10-20T03:00"), { ...opts, name: "" }).text;
    expect(noName).not.toContain("{name}");
    expect(PHRASES.en.late.map((p) => p.replace("{name}", ""))).toContain(noName);
  });

  test("different seeds give different greetings", () => {
    const texts = new Set([0.05, 0.25, 0.45, 0.65, 0.85].map((seed) => greet("ru", at("2026-10-20T19:00"), { ...opts, seed }).text));
    expect(texts.size).toBeGreaterThan(2);
  });

  test("occasions and birthday", () => {
    expect(occasionOf(at("2026-08-31T12:00"), "")).toBe("mikuBirthday");
    expect(occasionOf(at("2026-03-09T12:00"), "")).toBe("mikuDay");
    expect(occasionOf(at("2027-01-01T00:30"), "")).toBe("newYear");
    expect(occasionOf(at("2026-08-31T12:00"), "2010-08-31")).toBe("birthday");
    expect(occasionOf(at("2027-02-28T12:00"), "2008-02-29")).toBe("birthday");
    const g = greet("ru", at("2026-08-31T12:00"), { ...opts, birthday: "2010-08-31", seed: 0.99 });
    expect(g.occasion).toBe("birthday");
    expect(g.text).toContain("Вадим");
    expect(ageOn("2010-08-31", at("2026-08-31T12:00"))).toBe(16);
  });

  test("birthday countdown during the last week", () => {
    expect(daysUntilBirthday("2010-10-23", at("2026-10-20T12:00"))).toBe(3);
    expect(daysUntilBirthday("2010-12-23", at("2026-10-20T12:00"))).toBeNull();
    expect(daysUntilBirthday("2010-01-02", at("2026-12-30T12:00"))).toBe(3);
    expect(greet("ru", at("2026-10-20T12:00"), { ...opts, birthday: "2010-10-23" }).soon).toContain("3");
  });
});

describe("wallpaper carousel", () => {
  const pl = (every: "tab" | "1h", shuffle = false) => ({ id: "p", name: "", items: ["img:a", "img:b", "img:c"], every, shuffle });

  test("first open starts at the beginning", () => {
    expect(nextIndex(pl("tab"), undefined, "open", 1000)).toMatchObject({ i: 0, changed: true });
  });

  test("every new tab moves on, timers wait for their interval", () => {
    expect(nextIndex(pl("tab"), { i: 2, at: 0 }, "open", 10).i).toBe(0);
    expect(nextIndex(pl("tab"), { i: 0, at: 0 }, "timer", 10_000_000).i).toBe(0);
    expect(nextIndex(pl("1h"), { i: 0, at: 0 }, "open", 60_000).i).toBe(0);
    expect(nextIndex(pl("1h"), { i: 0, at: 0 }, "timer", 3_600_000).i).toBe(1);
    expect(nextIndex(pl("1h"), { i: 0, at: 0 }, "prev", 5).i).toBe(2);
    expect(nextIndex(pl("1h"), { i: 1, at: 0 }, "next", 5).i).toBe(2);
  });

  test("shuffle never repeats the current picture", () => {
    for (const r of [0, 0.3, 0.6, 0.99]) expect(nextIndex(pl("tab", true), { i: 1, at: 0 }, "next", 5, () => r).i).not.toBe(1);
  });

  test("a shrunk playlist never points past its end", () => {
    expect(nextIndex(pl("1h"), { i: 9, at: 0 }, "open", 5).i).toBe(2);
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
