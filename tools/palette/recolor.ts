// Turns a look's template files into the look: every color of the template maps to one color of the look.
//
// - A color that is a role of the template (background, accent, red...) becomes the same role of the look.
// - Any other color follows the role it is closest to: neutrals shift the way the two neutrals around
//   them shift, colored ones keep their lightness, chroma and hue offsets from their nearest colored role.
// So a hover shade stays a hover shade, a dimmed red stays a dimmed red, in every look.
import { lookById, NEUTRALS, rolesOf, templateRolesOf, WHEEL, type Look, type RoleName, type Roles } from "./looks";
import { hexToOklch, hueDelta, oklabDistance, oklchToHex, type Oklch } from "./oklch";

/** When one hex plays several roles in a template, the first role here decides where it goes. */
const PRIORITY: RoleName[] = [...NEUTRALS, "accent", "accentHover", "onAccent", ...WHEEL, "second"];
const NEUTRAL = new Set<RoleName>(NEUTRALS);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Shift {
  dL: number;
  dC: number;
  /** Chroma as a ratio, for colored roles; null for neutrals. */
  kC: number | null;
  dH: number;
}

function shiftOf(from: Oklch, to: Oklch, colored: boolean): Shift {
  return { dL: to.L - from.L, dC: to.C - from.C, kC: colored && from.C > 0.02 ? to.C / from.C : null, dH: hueDelta(from.H, to.H) };
}

function apply(c: Oklch, s: Shift): string {
  const C = s.kC === null ? Math.max(0, c.C + s.dC) : c.C * s.kC;
  return oklchToHex({ L: c.L + s.dL, C, H: (c.H + s.dH + 360) % 360 });
}

export class ColorMap {
  private memo = new Map<string, string>();
  private anchors: { role: RoleName; hex: string; o: Oklch }[] = [];
  private neutrals: { o: Oklch; shift: Shift }[] = [];

  constructor(readonly source: Roles, readonly target: Roles) {
    const seen = new Set<string>();
    for (const role of PRIORITY) {
      const hex = source[role].toLowerCase();
      if (seen.has(hex)) continue;
      seen.add(hex);
      this.memo.set(hex, target[role].toLowerCase());
      this.anchors.push({ role, hex, o: hexToOklch(hex) });
    }
    for (const a of this.anchors.filter((x) => NEUTRAL.has(x.role))) {
      this.neutrals.push({ o: a.o, shift: shiftOf(a.o, hexToOklch(target[a.role]), false) });
    }
    this.neutrals.sort((a, b) => a.o.L - b.o.L);
  }

  static forLook(look: Look | string): ColorMap {
    const l = typeof look === "string" ? lookById(look) : look;
    return new ColorMap(templateRolesOf(l.template), rolesOf(l));
  }

  /** The look's color for a template #rrggbb. */
  get(hex: string): string {
    const key = hex.toLowerCase();
    const hit = this.memo.get(key);
    if (hit) return hit;
    const out = key === "#ffffff" || key === "#000000" ? key : this.derive(hexToOklch(key));
    this.memo.set(key, out);
    return out;
  }

  private derive(c: Oklch): string {
    const nearest = this.anchors.reduce((best, a) => (oklabDistance(a.o, c) < oklabDistance(best.o, c) ? a : best));
    if (!NEUTRAL.has(nearest.role)) return apply(c, shiftOf(nearest.o, hexToOklch(this.target[nearest.role]), true));
    // Between the two neutrals around it by lightness, the shift is blended; past the ends, the end's shift.
    const n = this.neutrals;
    if (c.L <= n[0].o.L) return apply(c, n[0].shift);
    if (c.L >= n[n.length - 1].o.L) return apply(c, n[n.length - 1].shift);
    const i = n.findIndex((x) => x.o.L >= c.L);
    const [a, b] = [n[i - 1], n[i]];
    const t = b.o.L === a.o.L ? 0 : (c.L - a.o.L) / (b.o.L - a.o.L);
    return apply(c, {
      dL: lerp(a.shift.dL, b.shift.dL, t),
      dC: lerp(a.shift.dC, b.shift.dC, t),
      kC: null,
      dH: lerp(a.shift.dH, b.shift.dH, t),
    });
  }

  /** Every #rrggbb and #rrggbbaa in a text, recolored; alpha and letter case are kept. */
  recolor(text: string): string {
    return text.replace(/#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?\b/g, (_, rgb: string, a = "") => {
      const out = this.get("#" + rgb).slice(1);
      return "#" + (rgb === rgb.toUpperCase() && /[A-F]/.test(rgb) ? out.toUpperCase() : out) + a;
    });
  }

  /** Bare hex attributes like Notepad++'s fgColor="ccd6f6". */
  recolorAttributes(text: string, attrs: string[]): string {
    const re = new RegExp(`\\b(${attrs.join("|")})="([0-9a-fA-F]{6})"`, "g");
    return text.replace(re, (_, attr: string, rgb: string) => {
      const out = this.get("#" + rgb).slice(1);
      return `${attr}="${/[A-F]/.test(rgb) ? out.toUpperCase() : out}"`;
    });
  }
}
