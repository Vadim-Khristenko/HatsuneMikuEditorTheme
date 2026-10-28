// sRGB <-> OKLCH and WCAG contrast, the color math every palette rule is written in.

export interface Oklch {
  L: number;
  C: number;
  H: number;
}

const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToRgb({ L, C, H }: Oklch): [number, number, number] {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** A color as #rrggbb, with chroma reduced until it fits sRGB. */
export function oklchToHex(c: Oklch): string {
  const cc = { ...c, L: Math.min(1, Math.max(0, c.L)), C: Math.max(0, c.C) };
  for (let i = 0; i < 60; i++) {
    const rgb = oklchToRgb(cc);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) {
      return "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, gam(Math.min(1, Math.max(0, v)))))).toString(16).padStart(2, "0")).join("");
    }
    cc.C *= 0.94;
  }
  return cc.L > 0.5 ? "#ffffff" : "#000000";
}

/** The most chroma a hue holds at a lightness while staying in sRGB. */
export function maxChroma(L: number, H: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (oklchToRgb({ L, C: mid, H }).every((v) => v >= 0 && v <= 1)) lo = mid;
    else hi = mid;
  }
  return lo;
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Signed shortest turn from hue a to hue b, in degrees. */
export const hueDelta = (a: number, b: number) => ((b - a + 540) % 360) - 180;

/** Distance in OKLab, for "which known color is this closest to". */
export function oklabDistance(a: Oklch, b: Oklch): number {
  const ax = a.C * Math.cos((a.H * Math.PI) / 180), ay = a.C * Math.sin((a.H * Math.PI) / 180);
  const bx = b.C * Math.cos((b.H * Math.PI) / 180), by = b.C * Math.sin((b.H * Math.PI) / 180);
  return Math.hypot(a.L - b.L, ax - bx, ay - by);
}
