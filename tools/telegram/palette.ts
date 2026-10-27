import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrast, lightness, parseRgba, rgbHex, type Rgba } from "./color";
import { familyOf, isColored } from "./remap";

const ROOT = join(import.meta.dir, "..", "..");

export const VARIANTS = [
  { code: "MD", id: "miku-dark", vsc: "mikuV1-dark", title: "Hatsune Miku Dark", dark: true },
  { code: "ML", id: "miku-light", vsc: "mikuV1-light", title: "Hatsune Miku Light", dark: false },
  { code: "SD", id: "sakura-dark", vsc: "sakuraV1-dark", title: "Hatsune Miku Sakura Dark", dark: true },
  { code: "SL", id: "sakura-light", vsc: "sakuraV1-light", title: "Hatsune Miku Sakura Light", dark: false },
] as const;

export type Variant = (typeof VARIANTS)[number];

/** Surfaces and text, from the deepest panel to the brightest white, as the editor themes use them. */
const RAMP_KEYS = [
  "statusBar.background", "panel.background", "activityBar.background", "sideBar.background", "editor.background",
  "editorWidget.background", "editor.lineHighlightBackground", "list.hoverBackground", "input.background",
  "editorGroup.border", "button.secondaryBackground", "button.secondaryHoverBackground", "editorWhitespace.foreground",
  "terminal.ansiBlack", "editorLineNumber.foreground", "editorGhostText.foreground", "sideBarSectionHeader.foreground",
  "statusBar.foreground", "editor.foreground", "terminal.ansiWhite", "terminal.ansiBrightWhite",
];

export interface Palette {
  variant: Variant;
  dark: boolean;
  /** Every #rrggbb the canonical VSC theme of this variant uses. Telegram files may only use these. */
  canon: Set<string>;
  /** Neutral surfaces and text sorted by lightness. */
  ramp: Rgba[];
  bg: Rgba;
  /** Side panels: the chat list header, the compose bar. */
  alt: Rgba;
  /** Popups and widgets. */
  surface: Rgba;
  /** Inputs and cards, a step up from the background. */
  raised: Rgba;
  hover: Rgba;
  line: Rgba;
  secondary: Rgba;
  faint: Rgba;
  muted: Rgba;
  fg: Rgba;
  white: Rgba;
  black: Rgba;
  accent: Rgba;
  /** Text and icons on an accent fill. */
  onAccent: Rgba;
  accentHover: Rgba;
  link: Rgba;
  red: Rgba;
  orange: Rgba;
  yellow: Rgba;
  green: Rgba;
  cyan: Rgba;
  blue: Rgba;
  violet: Rgba;
  pink: Rgba;
  /** Syntax colors of the editor theme, for code blocks in messages. */
  code: { keyword: Rgba; operator: Rgba; constant: Rgba; string: Rgba; number: Rgba; comment: Rgba; function: Rgba };
}

/** The ramp entry `steps` away from `c`, toward the text color for positive steps. */
export function rampStep(p: Palette, c: Rgba, steps: number): Rgba {
  const i = p.ramp.findIndex((x) => x.r === c.r && x.g === c.g && x.b === c.b);
  if (i < 0) throw new Error(`${p.variant.code}: color is not on the ramp`);
  const j = Math.max(0, Math.min(p.ramp.length - 1, i + (p.dark ? steps : -steps)));
  return p.ramp[j];
}

interface VscTheme {
  colors: Record<string, string>;
  tokenColors: { scope?: string | string[]; settings?: { foreground?: string } }[];
}

const cache = new Map<string, Palette>();

export function paletteOf(v: Variant): Palette {
  const hit = cache.get(v.code);
  if (hit) return hit;
  const theme: VscTheme = JSON.parse(readFileSync(join(ROOT, "vsc", "themes", v.vsc + ".json"), "utf8"));
  const jb = JSON.parse(readFileSync(join(ROOT, "tools", "jb-palette.json"), "utf8"))[v.code] as Record<string, string>;

  const canon = new Set<string>();
  for (const c of Object.values(theme.colors)) canon.add(c.toLowerCase().slice(0, 7));
  for (const r of theme.tokenColors) if (r.settings?.foreground) canon.add(r.settings.foreground.toLowerCase().slice(0, 7));

  const pick = (src: string): Rgba => {
    const hex = (src.startsWith("#") ? src : theme.colors[src])?.toLowerCase().slice(0, 7);
    if (!hex) throw new Error(`${v.vsc}: no color ${src}`);
    if (!canon.has(hex)) throw new Error(`${v.vsc}: ${src} = ${hex} is not in the canonical palette`);
    return parseRgba(hex);
  };
  const first = (...srcs: string[]) => pick(srcs.find((s) => s.startsWith("#") || theme.colors[s])!);

  const seen = new Set<string>();
  const ramp: Rgba[] = [];
  for (const k of RAMP_KEYS) {
    const hex = theme.colors[k]?.toLowerCase().slice(0, 7);
    if (!hex || seen.has(hex)) continue;
    seen.add(hex);
    ramp.push(pick(hex));
  }
  ramp.sort((a, b) => lightness(a) - lightness(b));

  const accent = pick("button.background");
  const purple = pick("charts.purple");
  const p: Palette = {
    variant: v,
    dark: v.dark,
    canon,
    ramp,
    bg: pick("editor.background"),
    alt: pick("sideBar.background"),
    surface: pick("editorWidget.background"),
    raised: pick("input.background"),
    hover: pick("list.hoverBackground"),
    line: pick("editorGroup.border"),
    secondary: pick("button.secondaryBackground"),
    faint: pick("editorGhostText.foreground"),
    muted: pick("sideBarSectionHeader.foreground"),
    fg: pick("editor.foreground"),
    white: pick("terminal.ansiBrightWhite"),
    black: pick("#000000"),
    accent,
    onAccent: pick("button.foreground"),
    accentHover: pick("button.hoverBackground"),
    link: pick("textLink.foreground"),
    red: pick("editorError.foreground"),
    orange: first("charts.orange", "editorWarning.foreground"),
    yellow: pick("editorWarning.foreground"),
    green: pick("gitDecoration.addedResourceForeground"),
    cyan: pick("terminal.ansiCyan"),
    blue: pick("editorInfo.foreground"),
    // Sakura has no purple: its chart purple is its own pink accent, so violet becomes the bright blue.
    violet: purple.r === accent.r && purple.g === accent.g && purple.b === accent.b ? pick("terminal.ansiBrightBlue") : purple,
    pink: pick(jb.escape),
    code: {
      keyword: pick(jb.keyword),
      operator: pick(jb.operator),
      constant: pick(jb.num),
      string: pick(jb.str),
      number: pick(jb.num),
      comment: pick(jb.comment),
      function: pick(jb.fn),
    },
  };
  // Peer colors fill avatars under initials in onAccent, so each keeps its hue but must hold 3:1.
  for (const f of ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "pink"] as const) {
    if (contrast(p[f], p.onAccent) >= 3) continue;
    const pool = [...canon].map(parseRgba).filter((c) => familyOf(c) === f && isColored(c) && contrast(c, p.onAccent) >= 3);
    if (!pool.length) throw new Error(`${v.code}: no ${f} in the palette holds 3:1 against ${rgbHex(p.onAccent)}`);
    const L = lightness(p[f]);
    p[f] = pool.sort((a, b) => Math.abs(lightness(a) - L) - Math.abs(lightness(b) - L))[0];
  }
  cache.set(v.code, p);
  return p;
}
