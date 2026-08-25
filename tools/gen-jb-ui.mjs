import { readFileSync, writeFileSync } from "node:fs";

const P = JSON.parse(readFileSync("tools/jb-palette.json", "utf8"));
const extra = {
  MD: { surface: "#11121f", hover: "#00e5d6", warn: "#ffd580", info: "#86a8ff" },
  ML: { surface: "#f0fafa", hover: "#00a89e", warn: "#b07800", info: "#2255aa" },
  SD: { surface: "#1a1020", hover: "#ff99bb", warn: "#ffcc88", info: "#99aaff" },
  SL: { surface: "#fff5f8", hover: "#ee6699", warn: "#996600", info: "#2244aa" },
};

for (const code of Object.keys(P)) {
  const t = { ...P[code], ...extra[code] };
  const path = `jetbrains/src/main/resources/themes/${t.file}.theme.json`;
  const j = JSON.parse(readFileSync(path, "utf8"));
  const a = t.accent, b = t.border, alt = t.alt, elev = t.elevated, fg = t.fg;

  const patch = {
    // Wildcard: themes EVERY component (tool windows, panels, New UI)
    "*": {
      foreground: fg,
      background: alt,
      disabledBackground: alt,
      inactiveBackground: alt,
      selectionBackground: a + "44",
      selectionForeground: fg,
      selectionInactiveBackground: a + "22",
      selectionInactiveForeground: fg,
      separatorColor: b,
      borderColor: b,
      focusColor: a,
      infoForeground: t.muted,
    },
    ActionButton: { hoverBackground: a + "22", pressedBackground: a + "22", hoverBorderColor: b },
    Banner: {
      errorBackground: t.err + "14", errorBorderColor: t.err, errorForeground: fg,
      informativeBackground: t.info + "14", informativeBorderColor: t.info, informativeForeground: fg,
      warningBackground: t.warn + "14", warningBorderColor: t.warn, warningForeground: fg,
    },
    Borders: { color: b, ContrastBorderColor: b },
    Button: {
      disabledBorderColor: b, focusedBorderColor: a,
      endBackground: elev, endBorderColor: b, startBackground: elev, startBorderColor: b,
    },
    CheckBox: { background: alt },
    ComboBox: {
      nonEditableBackground: elev,
      ArrowButton: { background: elev, nonEditableBackground: elev, iconColor: a, disabledIconColor: t.muted },
      modifiedItemForeground: a,
    },
    Component: {
      iconColor: fg, errorFocusColor: t.err, warningFocusColor: t.warn,
      inactiveErrorFocusColor: t.err, inactiveWarningFocusColor: t.warn,
    },
    Counter: { background: a, foreground: t.bg },
    DefaultTabs: { background: alt, hoverBackground: a + "22", underlinedTabBackground: alt },
    DragAndDrop: { borderColor: a, rowBackground: a + "22", areaForeground: fg, areaBackground: alt, areaBorderColor: a },
    Editor: { background: t.bg, shortcutForeground: a, Toolbar: { borderColor: b } },
    EditorPane: { splitBorder: b },
    EditorTabs: {
      hoverBackground: a + "22", underTabsBorderColor: b,
      underlinedTabBackground: t.surface, inactiveUnderlinedTabBackground: t.surface,
      underlinedBorderColor: a, inactiveColoredFileBackground: alt,
    },
    NotificationsToolwindow: { newNotification: { background: alt, hoverBackground: elev } },
    Panel: { foreground: fg, background: alt },
    PasswordField: { background: elev },
    Popup: {
      Advertiser: { background: t.surface, foreground: fg },
      Header: { activeBackground: t.surface, inactiveBackground: t.surface },
      borderColor: b, inactiveBorderColor: b,
    },
    ProgressBar: {
      progressColor: a, trackColor: elev, passedColor: t.git_add, failedColor: t.err,
      indeterminateStartColor: a, indeterminateEndColor: t.hover,
    },
    RadioButton: { background: alt },
    RunWidget: { background: elev, foreground: fg, iconColor: fg, separatorColor: b },
    ScrollBar: {
      thumbColor: b, thumbBorderColor: b, hoverThumbColor: a + "44", hoverThumbBorderColor: a + "44",
      Mac: { thumbColor: b, thumbBorderColor: b, hoverThumbColor: a + "44", hoverThumbBorderColor: a + "44" },
    },
    ToolWindow: {
      background: alt,
      borderColor: b,
      Header: { background: alt, foreground: fg },
      errorBackground: alt, errorBorderColor: t.err, errorForeground: fg,
      informativeBackground: alt, informativeBorderColor: t.info, informativeForeground: fg,
      warningBackground: alt, warningBorderColor: t.warn, warningForeground: fg,
    },
    Tree: {
      background: alt, foreground: fg,
      hoverBackground: a + "14",
      selectionBackground: a + "44", selectionInactiveBackground: a + "22",
      modifiedItemForeground: t.git_mod,
    },
    ValidationTooltip: {
      errorBackground: t.bg, errorBorderColor: t.err,
      warningBackground: t.bg, warningBorderColor: t.warn,
    },
    Viewport: { background: alt },
  };

  // merge: wildcard first, then existing keys, then patch overrides
  const ui = { "*": patch["*"], ...j.ui };
  for (const [k, v] of Object.entries(patch)) {
    if (k === "*") continue;
    ui[k] = typeof v === "object" && !Array.isArray(v) && j.ui[k] && !Array.isArray(j.ui[k])
      ? { ...j.ui[k], ...v }
      : v;
  }
  j.ui = ui;
  writeFileSync(path, JSON.stringify(j, null, 2) + "\n");
  console.log(`${t.file}.theme.json: ui patched (${Object.keys(ui).length} keys)`);
}
console.log("done");
