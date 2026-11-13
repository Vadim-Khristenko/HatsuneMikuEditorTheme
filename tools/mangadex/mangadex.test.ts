import { describe, expect, test } from "bun:test";
import { contrast } from "../palette/oklch";
import { LOOKS, rolesOf } from "../palette/looks";
import { decode, DEFAULTS, encode, themeOf, VARS } from "./mangadex";

// The site's own dark theme, as its editor shares it.
const SITE_DARK =
  "AAMxLjEBAQIAA_____8EHBoZ_wUsLCz_Bjk5Of8HHR0d_wg9PT3_CUlJSf8KJycn_wtPT0__DGhoaP8NIiIi_w5YWFj_D3BwcP8QPj4-_xFdXV3_EmhoaP8TNzc3_xRmZmb_FXl5ef8WOzs7_xeMjIz_GE9PT_8ZT09P_xpYWFj_G09PT_8cLCws_x1AZ___Hj5h5v8fO1W8_yBAQP__IQDQBP8iAHXa_yP1yQD_JMTExP8l_0B9_ybxmEv_J0BA__8oMTHb_ykhIb__";

describe("mangadex", () => {
  test("reads a link the site made and writes it back byte for byte", () => {
    const t = decode(SITE_DARK);
    expect([t.version, t.dark, t.author]).toEqual(["1.1", true, null]);
    expect(t.colors).toEqual(DEFAULTS.dark);
    expect(encode({ dark: true, colors: DEFAULTS.dark })).toBe(SITE_DARK);
  });

  test("alpha survives the trip", () => {
    const colors = [...DEFAULTS.light];
    colors[2] = "#11223380";
    expect(decode(encode({ dark: false, colors })).colors[2]).toBe("#11223380");
  });

  test("every look fills every variable and keeps its own background, text and accent", () => {
    for (const look of LOOKS) {
      const t = themeOf(look);
      const r = rolesOf(look);
      expect(t.colors.length).toBe(VARS.length);
      expect(t.colors.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
      expect([t.colors[0], t.colors[1], t.colors[26]]).toEqual([r.fg, r.bg, r.accent]);
      expect(decode(encode(t)).colors).toEqual(t.colors);
    }
  });

  test("text stays readable on every card level", () => {
    for (const look of LOOKS) {
      const t = themeOf(look);
      for (let i = 2; i < 20; i += 3) expect(contrast(t.colors[0], t.colors[i])).toBeGreaterThan(4.5);
    }
  });
});
