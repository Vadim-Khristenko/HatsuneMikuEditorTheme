import { alpha, FAMILIES, type Family, hexToRgb, PALETTES, type Palette, THEME_IDS, type ThemeId } from "./palette";

/** `theme` block of a Chromium theme manifest (HatsuneMikuEditor Colorful Browser). */
export function chromeThemeColors(p: Palette): Record<string, [number, number, number]> {
  const c = (hex: string) => hexToRgb(hex);
  return {
    frame: c(p.alt),
    frame_inactive: c(p.alt),
    frame_incognito: c(p.dark ? "#06070f" : p.line),
    frame_incognito_inactive: c(p.dark ? "#06070f" : p.line),
    background_tab: c(p.alt),
    background_tab_inactive: c(p.alt),
    toolbar: c(p.bg),
    toolbar_text: c(p.fg),
    toolbar_button_icon: c(p.fg),
    tab_text: c(p.fg),
    tab_background_text: c(p.muted),
    tab_background_text_inactive: c(p.muted),
    bookmark_text: c(p.fg),
    omnibox_background: c(p.card),
    omnibox_text: c(p.fg),
    button_background: c(p.card),
    ntp_background: c(p.bg),
    ntp_text: c(p.fg),
    ntp_link: c(p.accent),
    ntp_header: c(p.alt),
  };
}

export function chromeThemeManifest(id: ThemeId, version: string) {
  const p = PALETTES[id];
  return {
    manifest_version: 3,
    name: `HatsuneMikuEditor (Colorful Browser) · ${p.name}`,
    short_name: `Miku ${p.name}`,
    version,
    description: `Hatsune Miku ${p.name} colors for the whole Chromium window: tabs, toolbar, address bar.`,
    icons: { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" },
    theme: {
      colors: chromeThemeColors(p),
      properties: { ntp_background_alignment: "bottom" },
    },
  };
}

/** Argument for `browser.theme.update()` in Firefox and Zen. */
export function firefoxTheme(p: Palette) {
  return {
    colors: {
      frame: p.alt,
      frame_inactive: p.alt,
      tab_background_text: p.fg,
      tab_selected: p.card,
      tab_text: p.fg,
      tab_line: p.accent,
      tab_loading: p.accent,
      toolbar: p.bg,
      toolbar_text: p.fg,
      toolbar_top_separator: p.line,
      toolbar_bottom_separator: p.line,
      toolbar_vertical_separator: p.line,
      toolbar_field: p.card,
      toolbar_field_text: p.fg,
      toolbar_field_border: p.line,
      toolbar_field_focus: p.card,
      toolbar_field_text_focus: p.fg,
      toolbar_field_border_focus: p.accent,
      toolbar_field_highlight: alpha(p.accent, 0.3),
      toolbar_field_highlight_text: p.fg,
      button_background_hover: alpha(p.accent, 0.14),
      button_background_active: alpha(p.accent, 0.24),
      icons: p.fg,
      icons_attention: p.accent,
      focus_outline: p.accent,
      popup: p.card,
      popup_text: p.fg,
      popup_border: p.line,
      popup_highlight: p.fill,
      popup_highlight_text: p.ink,
      sidebar: p.alt,
      sidebar_text: p.fg,
      sidebar_border: p.line,
      sidebar_highlight: p.fill,
      sidebar_highlight_text: p.ink,
      ntp_background: p.bg,
      ntp_text: p.fg,
      bookmark_text: p.fg,
    },
    properties: {
      color_scheme: p.dark ? "dark" : "light",
      content_color_scheme: "auto",
    },
  };
}

const ZEN_VARIANTS: { value: string; label: string; id: ThemeId }[] = THEME_IDS.map((id) => ({ value: id, label: PALETTES[id].name, id }));
const FAMILY_LABEL: Record<Family, string> = { miku: "Miku", sakura: "Sakura", snow: "Snow Miku", teto: "Kasane Teto" };

function zenBlock(p: Palette): string {
  const v: [string, string][] = [
    ["--zen-primary-color", p.accent],
    ["--zen-colors-primary", p.card],
    ["--zen-colors-secondary", p.card],
    ["--zen-colors-tertiary", p.alt],
    ["--zen-colors-border", p.line],
    ["--zen-main-browser-background", p.alt],
    ["--zen-themed-toolbar-bg", p.alt],
    ["--toolbox-bgcolor-inactive", p.alt],
    ["--toolbar-bgcolor", p.bg],
    ["--toolbar-color", p.fg],
    ["--toolbar-field-color", p.fg],
    ["--toolbar-field-focus-color", p.fg],
    ["--toolbarbutton-icon-fill", p.fg],
    ["--lwt-text-color", p.fg],
    ["--tab-selected-textcolor", p.fg],
    ["--arrowpanel-background", p.card],
    ["--arrowpanel-color", p.fg],
    ["--sidebar-text-color", p.fg],
    ["--lwt-sidebar-text-color", p.fg],
    ["--lwt-sidebar-background-color", p.alt],
    ["--newtab-background-color", p.bg],
    ["--newtab-text-primary-color", p.fg],
    ["--focus-outline-color", p.accent],
  ];
  const vars = v.map(([k, val]) => `    ${k}: ${val} !important;`).join("\n");
  return `  :root {\n${vars}\n  }\n  .urlbar-background { background-color: ${p.card} !important; }\n  .urlbarView-url { color: ${p.accent} !important; }\n  #zen-appcontent-navbar-container, hbox#titlebar, #TabsToolbar { background-color: ${p.alt} !important; }\n  .tabbrowser-tab[selected] .tab-background { background-color: ${p.card} !important; box-shadow: inset 0 0 0 1px ${alpha(p.accent, 0.35)} !important; }\n  ::selection { background-color: ${alpha(p.accent, 0.3)}; }`;
}

/** chrome.css of the Zen mod, one block per dropdown value plus the two "follow system" modes. */
export function zenChromeCss(): string {
  const parts = ["/* Generated by browser/build.ts from tools/jb-palette.json. Do not edit by hand. */"];
  for (const z of ZEN_VARIANTS) {
    parts.push(`@media (-moz-pref("mod.hatsunemiku.variant", "${z.value}")) {\n${zenBlock(PALETTES[z.id])}\n}`);
  }
  for (const fam of FAMILIES) {
    parts.push(`@media (-moz-pref("mod.hatsunemiku.variant", "${fam}-auto")) and (prefers-color-scheme: dark) {\n${zenBlock(PALETTES[`${fam}-dark`])}\n}`);
    parts.push(`@media (-moz-pref("mod.hatsunemiku.variant", "${fam}-auto")) and (prefers-color-scheme: light) {\n${zenBlock(PALETTES[`${fam}-light`])}\n}`);
  }
  return parts.join("\n\n") + "\n";
}

export function zenPreferences() {
  return [
    {
      property: "mod.hatsunemiku.variant",
      label: "Variant",
      type: "dropdown",
      defaultValue: "miku-auto",
      options: [
        ...FAMILIES.map((f) => ({ label: `${FAMILY_LABEL[f]}, follow system`, value: `${f}-auto` })),
        ...ZEN_VARIANTS.map(({ label, value }) => ({ label, value })),
      ],
    },
  ];
}

/** Plain userChrome.css for one fixed variant, for people who do not use a mod manager. */
export function zenUserChrome(id: ThemeId): string {
  return `/* HatsuneMikuEditor for Zen: ${PALETTES[id].name}. Generated, do not edit by hand. */\n@media all {\n${zenBlock(PALETTES[id])}\n}\n`;
}
