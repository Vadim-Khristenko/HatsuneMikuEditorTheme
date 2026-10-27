export interface Rgba {
  r: number;
  g: number;
  b: number;
  /** 0..255 */
  a: number;
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

/** #rrggbb or #rrggbbaa, the CSS and Telegram Desktop order. */
export function parseRgba(hex: string): Rgba {
  const m = hex.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (!m) throw new Error(`not a #rrggbb[aa] color: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: m[2] ? parseInt(m[2], 16) : 255 };
}

/** #aarrggbb, the Android order. */
export function parseArgb(hex: string): Rgba {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{6})$/i);
  if (!m) throw new Error(`not a #aarrggbb color: ${hex}`);
  const c = parseRgba("#" + m[2]);
  return { ...c, a: parseInt(m[1], 16) };
}

export const rgbHex = (c: Rgba) => "#" + hex2(c.r) + hex2(c.g) + hex2(c.b);
export const rgbaHex = (c: Rgba) => rgbHex(c) + (c.a === 255 ? "" : hex2(c.a));
export const argbHex = (c: Rgba) => "#" + hex2(c.a) + rgbHex(c).slice(1);

export const withAlpha = (c: Rgba, a: number): Rgba => ({ ...c, a: Math.max(0, Math.min(255, Math.round(a))) });

function linear(v: number): number {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(c: Rgba): number {
  return 0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);
}

/** CIE L*, 0..100: perceived lightness. */
export function lightness(c: Rgba): number {
  const y = luminance(c);
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

/** HSL hue in degrees and saturation 0..1. */
export function hueSat(c: Rgba): { h: number; s: number } {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  const l = (max + min) / 2;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s };
}

/** WCAG contrast of two opaque colors. */
export function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `top` laid over an opaque `bottom`. */
export function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a / 255;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 255,
  };
}
