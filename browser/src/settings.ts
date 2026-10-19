import { THEME_IDS, type ThemeId } from "./palette";

export const LAYOUTS = ["stage", "score", "bento", "zen"] as const;
export type Layout = (typeof LAYOUTS)[number];

export const LOCALES = ["auto", "ru", "en", "zh"] as const;
export type LocaleSetting = (typeof LOCALES)[number];

export const FONTS = ["onest", "unbounded", "mplus", "jetbrains", "system"] as const;
export type FontId = (typeof FONTS)[number];

export const ENGINES = ["browser", "duckduckgo", "google", "bing", "yandex", "brave", "startpage", "kagi", "baidu", "custom"] as const;
export type EngineId = (typeof ENGINES)[number];

export const WIDGETS = ["clock", "weather", "calendar", "shortcuts", "todos", "nowPlaying", "pomodoro", "note", "line"] as const;
export type WidgetId = (typeof WIDGETS)[number];

export const WALLPAPERS = ["art", "bundled", "image", "none"] as const;
export type WallpaperKind = (typeof WALLPAPERS)[number];

export interface Shortcut { id: string; name: string; url: string }
export interface Todo { id: string; text: string; done: boolean }
export interface CalEvent { id: string; date: string; time: string; title: string }

export interface Settings {
  v: 1;
  theme: ThemeId;
  followSystem: boolean;
  paintBrowser: boolean;
  layout: Layout;
  locale: LocaleSetting;
  name: string;
  fonts: { ui: FontId; display: FontId };
  clock24: boolean;
  seconds: boolean;
  search: { engine: EngineId; custom: string; bangs: boolean };
  shortcuts: Shortcut[];
  favicons: boolean;
  widgets: Record<WidgetId, boolean>;
  order: WidgetId[];
  weather: { city: string; lat: number | null; lon: number | null; units: "c" | "f" };
  wallpaper: { kind: WallpaperKind; dim: number; blur: number };
  lines: string[];
  note: string;
  todos: Todo[];
  events: CalEvent[];
  pomodoro: { focus: number; rest: number };
  zenDrawer: boolean;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  ["GitHub", "https://github.com/"],
  ["YouTube", "https://www.youtube.com/"],
  ["Gmail", "https://mail.google.com/"],
  ["Telegram", "https://web.telegram.org/"],
  ["Figma", "https://www.figma.com/"],
  ["Reddit", "https://www.reddit.com/"],
  ["Twitch", "https://www.twitch.tv/"],
  ["Wikipedia", "https://www.wikipedia.org/"],
].map(([name, url], i) => ({ id: `s${i + 1}`, name, url }));

export function defaults(): Settings {
  return {
    v: 1,
    theme: "miku-dark",
    followSystem: false,
    paintBrowser: true,
    layout: "stage",
    locale: "auto",
    name: "",
    fonts: { ui: "onest", display: "unbounded" },
    clock24: true,
    seconds: false,
    search: { engine: "browser", custom: "", bangs: true },
    shortcuts: DEFAULT_SHORTCUTS.map((s) => ({ ...s })),
    favicons: false,
    widgets: { clock: true, weather: true, calendar: true, shortcuts: true, todos: true, nowPlaying: true, pomodoro: true, note: true, line: true },
    order: [...WIDGETS],
    weather: { city: "", lat: null, lon: null, units: "c" },
    wallpaper: { kind: "art", dim: 30, blur: 0 },
    lines: [],
    note: "",
    todos: [],
    events: [],
    pomodoro: { focus: 25, rest: 5 },
    zenDrawer: true,
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const str = (v: unknown, fallback: string, max = 2000) => (typeof v === "string" ? v.slice(0, max) : fallback);
const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const coord = (v: unknown, lim: number) => (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= lim ? v : null);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function normalizeUrl(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (!["http:", "https:"].includes(u.protocol) || !u.hostname) return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Accepts anything (storage, an imported backup) and returns a valid Settings object. */
export function normalize(input: unknown): Settings {
  const d = defaults();
  if (!isObj(input)) return d;
  const fonts = isObj(input.fonts) ? input.fonts : {};
  const search = isObj(input.search) ? input.search : {};
  const weather = isObj(input.weather) ? input.weather : {};
  const wallpaper = isObj(input.wallpaper) ? input.wallpaper : {};
  const pomodoro = isObj(input.pomodoro) ? input.pomodoro : {};
  const widgetsIn = isObj(input.widgets) ? input.widgets : {};

  const widgets = { ...d.widgets };
  for (const w of WIDGETS) widgets[w] = bool(widgetsIn[w], d.widgets[w]);

  const orderIn = Array.isArray(input.order) ? input.order.filter((w): w is WidgetId => (WIDGETS as readonly unknown[]).includes(w)) : [];
  const order = [...new Set([...orderIn, ...WIDGETS])];

  const shortcuts = Array.isArray(input.shortcuts)
    ? input.shortcuts.flatMap((s): Shortcut[] => {
        if (!isObj(s)) return [];
        const url = normalizeUrl(str(s.url, ""));
        if (!url) return [];
        const name = str(s.name, "", 40).trim() || new URL(url).hostname.replace(/^www\./, "");
        return [{ id: str(s.id, "", 20) || uid(), name, url }];
      }).slice(0, 48)
    : d.shortcuts;

  const todos = Array.isArray(input.todos)
    ? input.todos.flatMap((t): Todo[] =>
        isObj(t) && typeof t.text === "string" && t.text.trim()
          ? [{ id: str(t.id, "", 20) || uid(), text: t.text.slice(0, 200), done: bool(t.done, false) }]
          : []).slice(0, 100)
    : [];

  const events = Array.isArray(input.events)
    ? input.events.flatMap((e): CalEvent[] =>
        isObj(e) && typeof e.date === "string" && DATE_RE.test(e.date) && typeof e.time === "string" && TIME_RE.test(e.time) && typeof e.title === "string" && e.title.trim()
          ? [{ id: str(e.id, "", 20) || uid(), date: e.date, time: e.time, title: e.title.slice(0, 120) }]
          : []).slice(0, 500)
    : [];

  return {
    v: 1,
    theme: pick(input.theme, THEME_IDS, d.theme),
    followSystem: bool(input.followSystem, d.followSystem),
    paintBrowser: bool(input.paintBrowser, d.paintBrowser),
    layout: pick(input.layout, LAYOUTS, d.layout),
    locale: pick(input.locale, LOCALES, d.locale),
    name: str(input.name, d.name, 40),
    fonts: { ui: pick(fonts.ui, FONTS, d.fonts.ui), display: pick(fonts.display, FONTS, d.fonts.display) },
    clock24: bool(input.clock24, d.clock24),
    seconds: bool(input.seconds, d.seconds),
    search: {
      engine: pick(search.engine, ENGINES, d.search.engine),
      custom: str(search.custom, "", 500),
      bangs: bool(search.bangs, d.search.bangs),
    },
    shortcuts,
    favicons: bool(input.favicons, d.favicons),
    widgets,
    order,
    weather: {
      city: str(weather.city, "", 80),
      lat: coord(weather.lat, 90),
      lon: coord(weather.lon, 180),
      units: pick(weather.units, ["c", "f"] as const, "c"),
    },
    wallpaper: {
      kind: pick(wallpaper.kind, WALLPAPERS, d.wallpaper.kind),
      dim: num(wallpaper.dim, d.wallpaper.dim, 0, 90),
      blur: num(wallpaper.blur, d.wallpaper.blur, 0, 40),
    },
    lines: Array.isArray(input.lines) ? input.lines.filter((l): l is string => typeof l === "string" && !!l.trim()).map((l) => l.slice(0, 200)).slice(0, 100) : [],
    note: str(input.note, "", 5000),
    todos,
    events,
    pomodoro: { focus: Math.round(num(pomodoro.focus, 25, 1, 180)), rest: Math.round(num(pomodoro.rest, 5, 1, 60)) },
    zenDrawer: bool(input.zenDrawer, d.zenDrawer),
  };
}
