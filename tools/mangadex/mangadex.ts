// MangaDex custom themes travel in a link: https://mangadex.org/?theme=<code>. The code is the site's own
// binary format (theme version 1.1), read from its bundle:
//
//   00 len "1.1"        the theme version
//   01 00|01            color scheme, light or dark
//   02 00 | 36 bytes    the author's user id, or none
//   key rgba32 ...      one color per CSS variable, key = 3 + its index below,
//                       the color an ARGB int written little endian (so b, g, r, a)
//
// then base64 with `/` as `_` and `+` as `-`.
import { hexToOklch, oklchToHex } from "../palette/oklch";
import { NEUTRALS, rolesOf, type Look, type Roles } from "../palette/looks";

/** The CSS variables of a MangaDex theme in the order of the code, with the names the site's editor shows. */
export const VARS: [css: string, label: string][] = [
  ["color", "Text Color"],
  ["md-background", "Main Background"],
  ...["", "-10", "-20", "-30", "-40", "-50"].flatMap((l, i): [string, string][] => {
    const label = i ? `Accent L${i}` : "Accent";
    return [[`md-accent${l}`, label], [`md-accent${l}-hover`, `${label} (hover)`], [`md-accent${l}-active`, `${label} (active)`]];
  }),
  ["md-midTone", "Mid-tone"],
  ["md-contrast-1", "Contrast L1"],
  ["md-scrollbar-thumb", "Scrollbar color"],
  ["md-scrollbar-thumb-hover", "Scrollbar color when hovered"],
  ["md-button-accent", "Button Accent"],
  ["md-button-accent-alt", "Button Accent (alternate)"],
  ["md-primary", "Primary"],
  ["md-primary-10", "Primary L1"],
  ["md-primary-20", "Primary L2"],
  ["md-status-red", "Status Red"],
  ["md-status-green", "Status Green"],
  ["md-status-yellow", "Status Yellow"],
  ["md-status-blue", "Status Blue"],
  ["md-status-grey", "Status Grey"],
  ["md-status-purple", "Status Purple"],
  ["md-indication-blue", "Indication Blue"],
  ["md-danger", "Danger"],
  ["md-danger-10", "Danger L1"],
  ["md-danger-20", "Danger L2"],
];

export interface Theme {
  dark: boolean;
  /** #rrggbb or #rrggbbaa, one per entry of VARS. */
  colors: string[];
}

const rgb = (r: number, g: number, b: number) => "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

/** The site's built-in themes, in the order of VARS. */
export const DEFAULTS: Record<"dark" | "light", string[]> = {
  dark: [
    rgb(255, 255, 255), rgb(25, 26, 28),
    rgb(44, 44, 44), rgb(57, 57, 57), rgb(29, 29, 29),
    rgb(61, 61, 61), rgb(73, 73, 73), rgb(39, 39, 39),
    rgb(79, 79, 79), rgb(104, 104, 104), rgb(34, 34, 34),
    rgb(88, 88, 88), rgb(112, 112, 112), rgb(62, 62, 62),
    rgb(93, 93, 93), rgb(104, 104, 104), rgb(55, 55, 55),
    rgb(102, 102, 102), rgb(121, 121, 121), rgb(59, 59, 59),
    rgb(140, 140, 140), rgb(79, 79, 79),
    rgb(79, 79, 79), rgb(88, 88, 88),
    rgb(79, 79, 79), rgb(44, 44, 44),
    rgb(255, 103, 64), rgb(230, 97, 62), rgb(188, 85, 59),
    rgb(255, 64, 64), rgb(4, 208, 0), rgb(218, 117, 0), rgb(0, 201, 245), rgb(196, 196, 196), rgb(125, 64, 255),
    rgb(75, 152, 241),
    rgb(255, 64, 64), rgb(219, 49, 49), rgb(191, 33, 33),
  ],
  light: [
    rgb(36, 36, 36), rgb(255, 255, 255),
    rgb(240, 241, 242), rgb(218, 220, 223), rgb(201, 203, 206),
    rgb(232, 234, 235), rgb(216, 219, 220), rgb(203, 206, 208),
    rgb(224, 228, 230), rgb(205, 209, 210), rgb(189, 193, 195),
    rgb(217, 221, 223), rgb(193, 196, 198), rgb(179, 183, 185),
    rgb(209, 214, 216), rgb(181, 187, 188), rgb(154, 161, 163),
    rgb(201, 207, 209), rgb(160, 166, 168), rgb(145, 151, 153),
    rgb(103, 114, 117), rgb(0, 0, 0),
    rgb(240, 241, 242), rgb(224, 228, 230),
    rgb(240, 241, 242), rgb(224, 228, 230),
    rgb(255, 103, 64), rgb(230, 97, 62), rgb(188, 85, 59),
    rgb(255, 64, 64), rgb(4, 208, 0), rgb(218, 117, 0), rgb(0, 201, 245), rgb(196, 196, 196), rgb(125, 64, 255),
    rgb(75, 152, 241),
    rgb(255, 64, 64), rgb(219, 49, 49), rgb(191, 33, 33),
  ],
};

const VERSION = "1.1";
const FIRST_KEY = 3;

export function encode(theme: Theme): string {
  if (theme.colors.length !== VARS.length) throw new Error(`a MangaDex theme has ${VARS.length} colors, got ${theme.colors.length}`);
  const bytes = [0, VERSION.length, ...[...VERSION].map((c) => c.charCodeAt(0)), 1, theme.dark ? 1 : 0, 2, 0];
  theme.colors.forEach((hex, i) => {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i);
    if (!m) throw new Error(`not a color: ${hex}`);
    const [r, g, b, a] = [m[1], m[2], m[3], m[4] ?? "ff"].map((x) => parseInt(x, 16));
    bytes.push(FIRST_KEY + i, b, g, r, a);
  });
  return Buffer.from(bytes).toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
}

export function decode(code: string): Theme & { version: string; author: string | null } {
  const b = Buffer.from(code.replace(/_/g, "/").replace(/-/g, "+"), "base64");
  let i = 0, version = "", dark = true, author: string | null = null;
  while (i < b.length && b[i] < FIRST_KEY) {
    const field = b[i++];
    if (field === 0) {
      const n = b[i++];
      version = b.subarray(i, i + n).toString("latin1");
      i += n;
    } else if (field === 1) dark = b[i++] !== 0;
    else if (b[i] === 0) i++;
    else {
      author = b.subarray(i, i + 36).toString("latin1");
      i += 36;
    }
  }
  const colors: string[] = [];
  for (; i + 5 <= b.length; i += 5) {
    const [key, bl, g, r, a] = b.subarray(i, i + 5);
    colors[key - FIRST_KEY] = rgb(r, g, bl) + (a === 255 ? "" : a.toString(16).padStart(2, "0"));
  }
  return { version, dark, author, colors };
}

export const link = (theme: Theme) => `https://mangadex.org/?theme=${encode(theme)}`;

/**
 * A look's neutral at the lightness `t` of the way from its background to its text, 0 the background
 * and 1 the text: lightness is spread evenly, chroma and hue follow the look's own neutral ramp.
 */
function neutralAt(roles: Roles, t: number): string {
  const ramp = NEUTRALS.map((n) => hexToOklch(roles[n])).sort((a, b) => a.L - b.L);
  const bg = hexToOklch(roles.bg), fg = hexToOklch(roles.fg);
  const L = bg.L + (fg.L - bg.L) * t;
  if (L <= ramp[0].L) return oklchToHex({ ...ramp[0], L });
  if (L >= ramp[ramp.length - 1].L) return oklchToHex({ ...ramp[ramp.length - 1], L });
  const k = ramp.findIndex((x) => x.L >= L);
  const [a, b] = [ramp[k - 1], ramp[k]];
  const f = b.L === a.L ? 0 : (L - a.L) / (b.L - a.L);
  const dH = ((b.H - a.H + 540) % 360) - 180;
  return oklchToHex({ L, C: a.C + (b.C - a.C) * f, H: (a.H + dH * f + 360) % 360 });
}

/** Moves `base` the way MangaDex moves its own `from` to `to`: same lightness step, same chroma ratio. */
function stepLike(base: string, from: string, to: string): string {
  const [b, f, t] = [base, from, to].map(hexToOklch);
  return oklchToHex({ L: b.L + (t.L - f.L), C: f.C > 0.02 ? b.C * (t.C / f.C) : b.C, H: b.H });
}

const CSS = Object.fromEntries(VARS.map(([css], i) => [css, i]));

/** One look as a MangaDex theme. Neutrals sit where MangaDex puts its own, measured from background to text. */
export function themeOf(look: Look): Theme {
  const roles = rolesOf(look);
  const base = DEFAULTS[look.dark ? "dark" : "light"];
  const L = (hex: string) => hexToOklch(hex).L;
  const [bgL, fgL] = [L(base[CSS["md-background"]]), L(base[CSS.color])];
  const colors = base.map((hex) => neutralAt(roles, (L(hex) - bgL) / (fgL - bgL)));

  const set = (css: string, hex: string) => (colors[CSS[css]] = hex);
  set("color", roles.fg);
  set("md-background", roles.bg);
  set("md-midTone", roles.muted);
  for (const [name, color] of [["primary", roles.accent], ["danger", roles.red]] as const) {
    const [b0, b1, b2] = ["", "-10", "-20"].map((l) => base[CSS[`md-${name}${l}`]]);
    set(`md-${name}`, color);
    set(`md-${name}-10`, stepLike(color, b0, b1));
    set(`md-${name}-20`, stepLike(color, b0, b2));
  }
  set("md-status-red", roles.red);
  set("md-status-green", roles.green);
  set("md-status-yellow", roles.yellow);
  set("md-status-blue", roles.blue);
  set("md-status-grey", roles.muted);
  set("md-status-purple", roles.violet);
  set("md-indication-blue", roles.blue);
  return { dark: look.dark, colors };
}
