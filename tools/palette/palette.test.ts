import { describe, expect, test } from "bun:test";
import { LOOKS, NEUTRALS, rolesOf, templateRolesOf, WHEEL } from "./looks";
import { contrast, hexToOklch } from "./oklch";
import { ColorMap } from "./recolor";

describe("looks", () => {
  test("eight looks, unique codes, ids and Telegram names", () => {
    expect(LOOKS).toHaveLength(8);
    for (const key of ["code", "id", "slug"] as const) expect(new Set(LOOKS.map((l) => l[key])).size).toBe(8);
    for (const l of LOOKS) expect(l.slug).toMatch(/^[A-Za-z]+Editor(Dark|Light)$/);
  });

  for (const l of LOOKS) {
    test(`${l.title} reads well`, () => {
      const r = rolesOf(l);
      expect(contrast(r.fg, r.bg)).toBeGreaterThanOrEqual(11);
      expect(contrast(r.muted, r.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(r.accent, r.bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(r.onAccent, r.accent)).toBeGreaterThanOrEqual(3);
      // The wheel: every color holds text contrast on light pages and stays readable on dark ones.
      for (const h of WHEEL) expect(contrast(r[h], r.bg)).toBeGreaterThanOrEqual(l.dark ? 4.5 : 3.5);
    });
  }

  test("the four v1 looks keep their face: backgrounds, text and accent", () => {
    for (const l of LOOKS.filter((x) => x.family === "miku" || x.family === "sakura")) {
      const before = templateRolesOf(l.template), after = rolesOf(l);
      for (const k of [...NEUTRALS, "accent", "onAccent"] as const) expect(after[k]).toBe(before[k]);
      // Vivid never takes color away.
      for (const h of WHEEL) expect(hexToOklch(after[h]).C).toBeGreaterThanOrEqual(hexToOklch(before[h]).C * 0.8);
    }
  });
});

describe("recolor", () => {
  test("a role becomes the same role of the look", () => {
    for (const l of LOOKS) {
      const m = ColorMap.forLook(l), from = templateRolesOf(l.template), to = rolesOf(l);
      for (const k of ["bg", "fg", "muted", "accent"] as const) expect(m.get(from[k])).toBe(to[k]);
    }
  });

  test("neutrals of the v1 looks do not move, other shades follow their neighbors", () => {
    const m = ColorMap.forLook("miku-dark");
    expect(m.get("#131526")).toBe("#131526");
    expect(m.get("#3d4470")).toBe("#3d4470");
    const snow = ColorMap.forLook("snow-dark");
    const between = hexToOklch(snow.get("#131526"));
    expect(between.L).toBeGreaterThan(hexToOklch(rolesOf(LOOKS[4]).bg).L);
    expect(between.L).toBeLessThan(hexToOklch(rolesOf(LOOKS[4]).raised).L);
  });

  test("alpha, case and bare hex attributes survive", () => {
    const m = ColorMap.forLook("teto-dark");
    expect(m.recolor('"#39C5BB44"')).toBe(`"#${m.get("#39c5bb").slice(1).toUpperCase()}44"`);
    expect(m.recolorAttributes('fgColor="ccd6f6" other="ccd6f6"', ["fgColor"])).toBe(`fgColor="${m.get("#ccd6f6").slice(1)}" other="ccd6f6"`);
    expect(m.get("#ffffff")).toBe("#ffffff");
  });
});
