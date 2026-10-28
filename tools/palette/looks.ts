// The eight looks of palette 1.0 and the rules that give each its roles.
//
// Hatsune Miku and Sakura Miku keep their backgrounds, text and accent from v1; every color of the
// wheel gets as much color as its hue holds without losing contrast (the "vivid" rules). Snow Miku
// and Kasane Teto are new families built from colors sampled off official art.
import templateRoles from "../../palette/templates/roles.json";
import { contrast, hexToOklch, maxChroma, oklchToHex } from "./oklch";

export const NEUTRALS = ["alt", "bg", "surface", "raised", "hover", "line", "secondary", "faint", "muted", "fg"] as const;
export const WHEEL = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "pink"] as const;
export type Neutral = (typeof NEUTRALS)[number];
export type Hue = (typeof WHEEL)[number];
export type RoleName = Neutral | Hue | "accent" | "accentHover" | "onAccent" | "second";
export type Roles = Record<RoleName, string>;

export type TemplateId = keyof typeof templateRoles;
export type Family = "miku" | "sakura" | "snow" | "teto";

export interface Look {
  /** Two letters, used by the palette checks and Telegram. */
  code: string;
  id: string;
  family: Family;
  dark: boolean;
  /** The name people see. */
  title: string;
  /** Hand-written files of this look are the source every port of this look is drawn from. */
  template: TemplateId;
  /** The Telegram cloud theme, t.me/addtheme/<slug>. */
  slug: string;
}

export const LOOKS: Look[] = [
  { code: "MD", id: "miku-dark", family: "miku", dark: true, title: "Hatsune Miku Dark", template: "miku-dark", slug: "HatsuneMikuEditorDark" },
  { code: "ML", id: "miku-light", family: "miku", dark: false, title: "Hatsune Miku Light", template: "miku-light", slug: "HatsuneMikuEditorLight" },
  { code: "SD", id: "sakura-dark", family: "sakura", dark: true, title: "Sakura Miku Dark", template: "sakura-dark", slug: "SakuraMikuEditorDark" },
  { code: "SL", id: "sakura-light", family: "sakura", dark: false, title: "Sakura Miku Light", template: "sakura-light", slug: "SakuraMikuEditorLight" },
  { code: "ND", id: "snow-dark", family: "snow", dark: true, title: "Snow Miku Dark", template: "miku-dark", slug: "SnowMikuEditorDark" },
  { code: "NL", id: "snow-light", family: "snow", dark: false, title: "Snow Miku Light", template: "miku-light", slug: "SnowMikuEditorLight" },
  { code: "TD", id: "teto-dark", family: "teto", dark: true, title: "Kasane Teto Dark", template: "miku-dark", slug: "KasaneTetoEditorDark" },
  { code: "TL", id: "teto-light", family: "teto", dark: false, title: "Kasane Teto Light", template: "miku-light", slug: "KasaneTetoEditorLight" },
];

export const lookById = (id: string) => {
  const l = LOOKS.find((x) => x.id === id);
  if (!l) throw new Error(`no look ${id}`);
  return l;
};

/** The v1 roles of a template look, as the hand-written files use them. */
export function templateRolesOf(id: TemplateId): Roles {
  const r = templateRoles[id].roles as Record<string, string>;
  // v1 has no second color: Miku's is its pink, Sakura's its teal.
  return { ...r, second: id.startsWith("miku") ? r.red : r.green } as Roles;
}

/**
 * The vivid rules, per color of the wheel: never less saturated than now; on light backgrounds never
 * less contrast than now and at least 4.5:1; on dark ones at least 7:1 or what it has, whichever is
 * lower. Within those, the most color the hue can hold near its current lightness. The accent and the
 * official Miku teal #39c5bb are the face of the theme and stay exactly as they are.
 */
export function vivid(roles: Roles, dark: boolean): Roles {
  const out = { ...roles };
  for (const h of WHEEL) {
    if (roles[h] === roles.accent || roles[h] === "#39c5bb") continue;
    const now = hexToOklch(roles[h]);
    // Where a variant reuses yellow for orange, orange gets a hue of its own.
    const H = h === "orange" && roles.orange === roles.yellow ? (now.H - 32 + 360) % 360 : now.H;
    const nowContrast = contrast(roles[h], roles.bg);
    const need = dark ? Math.min(nowContrast, 7) : Math.max(nowContrast, 4.5);
    const cap = dark ? 0.21 : 0.24;
    const win = dark ? 0.05 : 0.12;
    const search = (floor: number) => {
      let best: { hex: string; score: number } | null = null;
      for (let L = now.L - win; L <= now.L + win; L += 0.003) {
        const C = Math.min(maxChroma(L, H), cap);
        if (C < floor) continue;
        const hex = oklchToHex({ L, C, H });
        if (contrast(hex, roles.bg) < need) continue;
        const score = C * 10 - Math.abs(L - now.L) * 2;
        if (!best || score > best.score) best = { hex, score };
      }
      return best;
    };
    // Yellow on a light page cannot be both deep and saturated; it gives up a little color for 4.5:1.
    const best = search(now.C * 0.98) ?? search(now.C * 0.8);
    out[h] = best ? best.hex : roles[h];
  }
  return out;
}

interface FamilySpec {
  /** Hue and chroma of the neutrals. */
  nH: number;
  nC: number;
  accent: { dark: string; light: string };
  second: { dark: string; light: string };
}

/** Anchors sampled off official art (see palette/README.md). */
export const FAMILIES: Record<"snow" | "teto", FamilySpec> = {
  // Snow Miku key visuals 2019-2026 on snowmiku.com: snow white, ice blue, deep navy hair, strawberry pink.
  snow: { nH: 250, nC: 0.04, accent: { dark: "#95caed", light: "#05598b" }, second: { dark: "#efa7b5", light: "#b8456a" } },
  // Teto's Synthesizer V art on kasaneteto.jp: hair #c13c51 with highlight #da646a, a warm uniform, gold buttons.
  teto: { nH: 22, nC: 0.014, accent: { dark: "#da646a", light: "#c13c51" }, second: { dark: "#e3b56a", light: "#8f6420" } },
};

const NEUTRAL_L: Record<"dark" | "light", Record<Neutral, number>> = {
  dark: { alt: 0.155, bg: 0.175, surface: 0.195, raised: 0.22, hover: 0.22, line: 0.27, secondary: 0.3, faint: 0.47, muted: 0.64, fg: 0.91 },
  light: { alt: 0.962, bg: 0.982, surface: 0.982, raised: 1, hover: 0.94, line: 0.905, secondary: 0.93, faint: 0.7, muted: 0.49, fg: 0.27 },
};

/** A family from three anchors: the hue and chroma of its neutrals, the accent and a second color. */
export function familyRoles(family: "snow" | "teto", dark: boolean): Roles {
  const spec = FAMILIES[family];
  const mode = dark ? "dark" : "light";
  const r = {} as Roles;
  for (const k of NEUTRALS) {
    const L = NEUTRAL_L[mode][k];
    r[k] = L >= 1 ? "#ffffff" : oklchToHex({ L, C: spec.nC * (dark ? 1 : 0.6) * (k === "fg" || k === "muted" ? 1.4 : 1), H: spec.nH });
  }
  r.accent = spec.accent[mode];
  const ao = hexToOklch(r.accent);
  r.accentHover = oklchToHex({ ...ao, L: ao.L + (dark ? 0.06 : -0.06) });
  r.onAccent = contrast(r.accent, r.bg) >= contrast(r.accent, "#ffffff") ? r.bg : "#ffffff";
  // The wheel of meaning keeps Miku's hue angles, tuned to this family's background by the vivid rules.
  const base = templateRolesOf(dark ? "miku-dark" : "miku-light");
  const seed = { ...r } as Roles;
  for (const h of WHEEL) seed[h] = base[h];
  const tuned = vivid({ ...seed, accent: r.accent }, dark);
  for (const h of WHEEL) r[h] = tuned[h];
  if (family === "teto") r.pink = r.accent;
  r.second = spec.second[mode];
  return r;
}

/** The roles of a look in palette 1.0. */
export function rolesOf(look: Look): Roles {
  if (look.family === "snow" || look.family === "teto") return familyRoles(look.family, look.dark);
  const r = vivid(templateRolesOf(look.template), look.dark);
  return { ...r, second: look.family === "miku" ? r.red : r.green };
}
