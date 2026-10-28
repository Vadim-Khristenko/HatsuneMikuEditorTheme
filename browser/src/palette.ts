import jbPalette from "../../tools/jb-palette.json";
import canon from "../../palette/palette.json";

export const THEME_IDS = ["miku-dark", "miku-light", "sakura-dark", "sakura-light", "snow-dark", "snow-light", "teto-dark", "teto-light"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type Family = "miku" | "sakura" | "snow" | "teto";
export const FAMILIES: Family[] = ["miku", "sakura", "snow", "teto"];

export interface Palette {
  id: ThemeId;
  name: string;
  family: Family;
  dark: boolean;
  bg: string;
  alt: string;
  card: string;
  line: string;
  line2: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  /** Filled controls. Differs from accent only where white text on accent would fail WCAG AA. */
  fill: string;
  /** Text on `fill`. */
  ink: string;
}

type JbEntry = (typeof jbPalette)["MD"];
const jb = jbPalette as Record<string, JbEntry>;
const looks = canon.looks as { id: string; code: string; family: Family; dark: boolean; roles: Record<string, string> }[];
const lookOf = (id: ThemeId) => looks.find((l) => l.id === id)!;

// Editor `muted` is tuned for code comments; text on a page needs AA contrast, so a few are lifted here.
function fromEditor(id: ThemeId, name: string, over: Partial<Palette> = {}): Palette {
  const look = lookOf(id);
  const src = jb[look.code];
  return {
    id,
    name,
    family: look.family,
    dark: look.dark,
    bg: src.bg,
    alt: src.alt,
    card: src.elevated,
    line: src.border,
    line2: src.faint,
    fg: src.fg,
    muted: src.muted,
    accent: src.accent,
    accent2: src.keyword,
    fill: src.accent,
    ink: look.dark ? src.bg : "#ffffff",
    ...over,
  };
}

// Snow Miku and Kasane Teto carry their second color from the art: strawberry pink and Teto's gold.
const second = (id: ThemeId) => lookOf(id).roles.second;

export const PALETTES: Record<ThemeId, Palette> = {
  "miku-dark": fromEditor("miku-dark", "Miku Dark", { muted: "#8a93c0" }),
  "miku-light": fromEditor("miku-light", "Miku Light", { line2: "#6f9896" }),
  "sakura-dark": fromEditor("sakura-dark", "Sakura Dark", { muted: "#b08aa6", accent2: jb.SD.fn, line2: "#7a5870" }),
  "sakura-light": fromEditor("sakura-light", "Sakura Light", {
    muted: "#8a4a68",
    accent: "#bd3b6e",
    accent2: jb.SL.fn,
    line2: "#c08aa0",
    fill: "#b5366a",
  }),
  "snow-dark": fromEditor("snow-dark", "Snow Dark", { accent2: second("snow-dark") }),
  "snow-light": fromEditor("snow-light", "Snow Light", { accent2: second("snow-light") }),
  "teto-dark": fromEditor("teto-dark", "Teto Dark", { accent2: second("teto-dark") }),
  "teto-light": fromEditor("teto-light", "Teto Light", { accent2: second("teto-light") }),
};

export function pairOf(id: ThemeId): { dark: ThemeId; light: ThemeId } {
  const f = PALETTES[id].family;
  return { dark: `${f}-dark` as ThemeId, light: `${f}-light` as ThemeId };
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** CSS custom properties consumed by newtab.css. */
export function cssVars(p: Palette): Record<string, string> {
  return {
    "--bg": p.bg,
    "--alt": p.alt,
    "--card": p.card,
    "--line": p.line,
    "--line2": p.line2,
    "--fg": p.fg,
    "--muted": p.muted,
    "--accent": p.accent,
    "--accent2": p.accent2,
    "--fill": p.fill,
    "--ink": p.ink,
    "--soft": alpha(p.accent, p.dark ? 0.12 : 0.1),
    "--soft2": alpha(p.accent2, p.dark ? 0.12 : 0.09),
    "--glass": alpha(p.dark ? p.bg : "#ffffff", p.dark ? 0.62 : 0.66),
    "--glass-card": alpha(p.card, p.dark ? 0.72 : 0.82),
    "--scrim": p.dark ? "rgba(4, 5, 12, 0.62)" : alpha(p.fg, 0.28),
    "--shadow": p.dark ? "0 24px 60px rgba(0, 0, 0, 0.45)" : `0 24px 60px ${alpha(p.fg, 0.14)}`,
  };
}
