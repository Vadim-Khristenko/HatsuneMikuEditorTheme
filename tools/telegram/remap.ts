import { hueSat, lightness, withAlpha, type Rgba } from "./color";
import type { Palette } from "./palette";

/** Background and text of the theme a color comes from: they define where it sits between the two. */
export interface Axis {
  bg: Rgba;
  fg: Rgba;
}

export type Family = "red" | "orange" | "yellow" | "green" | "cyan" | "blue" | "violet" | "pink";

const FAMILIES: [number, Family][] = [
  [15, "red"], [40, "orange"], [70, "yellow"], [165, "green"], [190, "cyan"], [250, "blue"], [290, "violet"], [345, "pink"], [360, "red"],
];

export function familyOf(c: Rgba): Family {
  const { h } = hueSat(c);
  return FAMILIES.find(([end]) => h < end)![1];
}

/**
 * A hue that carries meaning (Telegram blue, online green, error red) rather than a tinted surface.
 * Pale tints such as the light out bubble and deep tints such as the night out bubble are surfaces.
 */
export function isColored(c: Rgba): boolean {
  const L = lightness(c);
  return hueSat(c).s > 0.3 && L >= 38 && L <= 88;
}

/** Where a color sits on the axis: 0 is the background, 1 the text, outside the range is beyond either. */
export function position(c: Rgba, axis: Axis): number {
  const from = lightness(axis.bg);
  return (lightness(c) - from) / (lightness(axis.fg) - from);
}

/** Telegram blue is the brand color, so it becomes the accent of the variant. */
export function familyColor(p: Palette, f: Family): Rgba {
  return f === "blue" ? p.accent : p[f];
}

/** The ramp entry that sits at the same place between background and text. */
export function nearestNeutral(p: Palette, t: number): Rgba {
  const axis = { bg: p.bg, fg: p.fg };
  let best = p.ramp[0];
  let dist = Infinity;
  for (const c of p.ramp) {
    const d = Math.abs(position(c, axis) - t);
    if (d < dist) [best, dist] = [c, d];
  }
  return best;
}

/**
 * Keys the night themes leave out although their default is drawn for a light window.
 * Everything else they leave out looks the same by day and by night, like call screens.
 */
export const LIGHT_ONLY = {
  android: new Set([
    "chat_inArticleCodeBackground", "chat_inArticleCodeScrollbarBackground", "chat_outArticleCodeScrollbarBackground",
    "premiumGradientBackgroundOverlay", "voipgroup_windowBackgroundWhiteInputField",
  ]),
  desktop: new Set(["searchedTextMatchBg", "callIconBgActive", "creditsBg2"]),
};

/** Recolors one Telegram color into the palette, keeping its alpha. */
export function remap(c: Rgba, axis: Axis, p: Palette): Rgba {
  if (c.a === 0) return withAlpha(p.bg, 0);
  const target = isColored(c) ? familyColor(p, familyOf(c)) : nearestNeutral(p, position(c, axis));
  return withAlpha(target, c.a);
}
