// The drawn Miku wallpaper of the JetBrains plugin (MikuArt.java) and the new tab, painted for a chat:
// a sun, two twin tails and a thin one in the second color, a staff with a few notes. It is laid
// over the theme background at a fixed strength, because Telegram has no opacity slider for it.
import type { Rgba } from "./color";
import type { Palette } from "./palette";

interface Shape {
  /** Signed distance in pixels, negative inside. */
  dist(x: number, y: number): number;
  box: [x0: number, y0: number, x1: number, y1: number];
  color: Rgba;
  alpha: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

function circle(cx: number, cy: number, r: number, color: Rgba, alpha: number): Shape {
  return { dist: (x, y) => Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) - r, box: [cx - r, cy - r, cx + r, cy + r], color, alpha };
}

/** A capsule `width` wide and `length` long, tilted by `deg` around a pivot. */
function band(x: number, top: number, width: number, length: number, deg: number, px: number, py: number, color: Rgba, alpha: number): Shape {
  const cos = Math.cos(rad(-deg)), sin = Math.sin(rad(-deg));
  const r = width / 2, cx = x + r, y0 = top + r, y1 = top + length - r;
  const reach = Math.hypot(Math.max(Math.abs(x - px), Math.abs(x + width - px)), Math.max(Math.abs(top - py), Math.abs(top + length - py)));
  return {
    dist(qx, qy) {
      const dx = qx - px, dy = qy - py;
      const lx = px + dx * cos - dy * sin, ly = py + dx * sin + dy * cos;
      const cy = Math.max(y0, Math.min(y1, ly));
      return Math.sqrt((lx - cx) * (lx - cx) + (ly - cy) * (ly - cy)) - r;
    },
    box: [px - reach, py - reach, px + reach, py + reach],
    color,
    alpha,
  };
}

function rect(x0: number, y0: number, x1: number, y1: number, color: Rgba, alpha: number): Shape {
  return {
    dist: (x, y) => Math.max(x0 - x, x - x1, y0 - y, y - y1),
    box: [x0 - 1, y0 - 1, x1 + 1, y1 + 1],
    color,
    alpha,
  };
}

function ellipse(cx: number, cy: number, a: number, b: number, deg: number, color: Rgba, alpha: number): Shape {
  const cos = Math.cos(rad(-deg)), sin = Math.sin(rad(-deg));
  return {
    dist(x, y) {
      const dx = x - cx, dy = y - cy;
      const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
      return (Math.sqrt((lx / a) * (lx / a) + (ly / b) * (ly / b)) - 1) * Math.min(a, b);
    },
    box: [cx - a - 1, cy - a - 1, cx + a + 1, cy + a + 1],
    color,
    alpha,
  };
}

/** The second color of the art: the editor's keyword red for Miku, the Miku teal for Sakura. */
export function artColors(p: Palette): { accent: Rgba; accent2: Rgba } {
  return { accent: p.accent, accent2: p.variant.id.startsWith("miku") ? p.red : p.green };
}

/** Same proportions as MikuArt.render on a wide screen; a tall screen gets the tails across its middle. */
export function shapes(p: Palette, w: number, h: number): Shape[] {
  const { accent, accent2 } = artColors(p);
  const wide = w >= h;
  const u = Math.min(w, h) / 100;
  const out: Shape[] = [];

  const sun = wide ? { x: w * 0.7, y: h * 0.4 } : { x: w * 0.64, y: h * 0.3 };
  out.push(circle(sun.x, sun.y, 30 * u, accent, 0.28));

  const pivot = wide ? { x: w * 0.74, y: h * 0.5 } : { x: w * 0.6, y: h * 0.5 };
  const len = Math.hypot(w, h) * 1.2;
  const top = pivot.y - len / 2;
  const tails: [number, number, Rgba, number][] = [
    [-14.2, 7.5, accent, 0.85],
    [3.6, 7.5, accent, 0.55],
    [20.4, 1.8, accent2, 0.9],
  ];
  for (const [dx, width, color, alpha] of tails) out.push(band(pivot.x + dx * u, top, width * u, len, 22, pivot.x, pivot.y, color, alpha));

  const [x0, x1, y0] = wide ? [w * 0.52, w * 0.97, h * 0.8] : [w * 0.08, w * 0.92, h * 0.8];
  const gap = 2.2 * u;
  const stroke = Math.max(1.5, 0.18 * u);
  for (let i = 0; i < 5; i++) out.push(rect(x0, y0 + i * gap - stroke / 2, x1, y0 + i * gap + stroke / 2, accent, 0.55));
  const notes = [[0.12, 3], [0.27, 1.5], [0.41, 2.5], [0.58, 0.5], [0.74, 2], [0.88, 1]];
  notes.forEach(([at, line], i) => {
    const nx = x0 + (x1 - x0) * at, ny = y0 + line * gap;
    const c = i % 3 === 2 ? accent2 : accent;
    out.push(ellipse(nx, ny, gap * 0.75, gap * 0.52, -20, c, 1));
    out.push(rect(nx + gap * 0.58, ny - gap * 3.4, nx + gap * 0.58 + Math.max(1.5, gap * 0.14), ny, c, 1));
  });
  return out;
}

/** How loud the art is over the background: enough to be Miku, quiet enough for messages. */
export const STRENGTH = { dark: 0.22, light: 0.26 };

/** Packed rgb rows: the theme background with the art laid over it. */
export function renderArt(p: Palette, w: number, h: number, strength = p.dark ? STRENGTH.dark : STRENGTH.light): Uint8Array {
  const list = shapes(p, w, h);
  const rgb = new Uint8Array(w * h * 3);
  const { r: br, g: bg, b: bb } = p.bg;
  for (let y = 0; y < h; y++) {
    const cy = y + 0.5;
    const hits = list.filter((s) => cy >= s.box[1] && cy <= s.box[3]);
    for (let x = 0; x < w; x++) {
      const cx = x + 0.5;
      // Premultiplied layer of the art, shapes laid over each other in order.
      let lr = 0, lg = 0, lb = 0, la = 0;
      for (const s of hits) {
        if (cx < s.box[0] || cx > s.box[2]) continue;
        const cover = Math.max(0, Math.min(1, 0.5 - s.dist(cx, cy)));
        if (cover === 0) continue;
        const a = cover * s.alpha;
        lr = s.color.r * a + lr * (1 - a);
        lg = s.color.g * a + lg * (1 - a);
        lb = s.color.b * a + lb * (1 - a);
        la = a + la * (1 - a);
      }
      const o = (y * w + x) * 3;
      const k = strength * la;
      rgb[o] = Math.round(br * (1 - k) + lr * strength);
      rgb[o + 1] = Math.round(bg * (1 - k) + lg * strength);
      rgb[o + 2] = Math.round(bb * (1 - k) + lb * strength);
    }
  }
  return rgb;
}
