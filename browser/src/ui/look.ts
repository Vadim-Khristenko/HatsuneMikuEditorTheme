import { browserTheme } from "../ext";
import { firefoxTheme } from "../browser-themes";
import { cssVars, PALETTES, pairOf, type Palette } from "../palette";
import type { Settings } from "../settings";
import { CJK_FALLBACK, type Ctx, FONT_STACKS } from "./ctx";

export function effectivePalette(s: Settings, prefersDark: boolean): Palette {
  if (!s.followSystem) return PALETTES[s.theme];
  const pair = pairOf(s.theme);
  return PALETTES[prefersDark ? pair.dark : pair.light];
}

let paintedFor = "";

/** Pushes theme, fonts and wallpaper settings into CSS variables on <html>. */
export function applyLook(ctx: Ctx): void {
  const root = document.documentElement;
  const { p, s } = ctx;
  for (const [k, v] of Object.entries(cssVars(p))) root.style.setProperty(k, v);
  root.style.setProperty("--font-ui", `${FONT_STACKS[s.fonts.ui]}, ${CJK_FALLBACK}`);
  root.style.setProperty("--font-display", `${FONT_STACKS[s.fonts.display]}, ${CJK_FALLBACK}`);
  root.style.setProperty("--wall-dim", String(s.wallpaper.dim / 100));
  root.style.setProperty("--wall-blur", `${s.wallpaper.blur}px`);
  root.dataset.theme = p.id;
  root.dataset.family = p.family;
  root.style.colorScheme = p.dark ? "dark" : "light";
  root.lang = ctx.i18n.lang === "zh" ? "zh-CN" : ctx.i18n.lang;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", p.alt);
  try {
    localStorage.setItem("hme:boot", JSON.stringify({ bg: p.bg, fg: p.fg, dark: p.dark }));
  } catch {
    /* storage blocked */
  }

  // Firefox and Zen can recolor the whole window from here; the background script repeats it at startup.
  const want = s.paintBrowser ? p.id : "";
  if (browserTheme.available && want !== paintedFor) {
    paintedFor = want;
    if (want) void browserTheme.update(firefoxTheme(p));
  }
}
