import { parseRgba, rgbaHex, withAlpha, type Rgba } from "./color";
import { KEYS } from "./keys";
import { rampStep, type Palette } from "./palette";
import { familyColor, familyOf, isColored, LIGHT_ONLY, remap, type Axis } from "./remap";

const keys = KEYS.desktop.keys;

/** Keys drawn inside the outgoing bubble: Telegram tints them green, the themes tint them with the accent. */
const isOut = (k: string) => /^(msg|history)\w*Out/.test(k);

function axisOf(night: boolean): Axis {
  const literal = (k: string): Rgba => {
    const v = night ? keys[k].night : keys[k].default;
    if (!v?.startsWith("#")) throw new Error(`desktop axis: ${k} has no literal ${night ? "night" : "default"} value`);
    return parseRgba(v);
  };
  return { bg: literal("windowBg"), fg: literal("windowFg") };
}

/** The colors that carry the look. Everything else follows Telegram's own design, recolored. */
export function desktopRoles(p: Palette): Record<string, Rgba> {
  const a = (c: Rgba, alpha: number) => withAlpha(c, alpha);
  const over = rampStep(p, p.bg, 1);
  const r: Record<string, Rgba> = {
    windowBg: p.bg,
    windowFg: p.fg,
    windowBgOver: over,
    windowBgRipple: rampStep(p, p.bg, 2),
    windowSubTextFg: p.muted,
    windowSubTextFgOver: p.muted,
    windowBoldFg: p.fg,
    windowBoldFgOver: p.fg,
    windowBgActive: p.accent,
    windowFgActive: p.onAccent,
    windowActiveTextFg: p.accent,
    windowShadowFg: p.black,
    windowShadowFgFallback: p.alt,

    activeButtonBg: p.accent,
    activeButtonBgOver: p.accentHover,
    activeButtonBgRipple: p.accentHover,
    activeButtonFg: p.onAccent,
    activeButtonSecondaryFg: p.onAccent,
    activeLineFg: p.accent,
    activeLineFgError: p.red,
    lightButtonBg: p.surface,
    lightButtonBgOver: a(p.accent, 0x1a),
    lightButtonBgRipple: a(p.accent, 0x33),
    lightButtonFg: p.accent,
    attentionButtonFg: p.red,
    attentionButtonFgOver: p.red,
    attentionButtonBgOver: a(p.red, 0x1a),
    attentionButtonBgRipple: a(p.red, 0x33),

    menuBg: p.surface,
    menuBgOver: over,
    menuBgRipple: rampStep(p, p.bg, 2),
    menuIconFg: p.muted,
    menuIconFgOver: p.fg,
    menuSubmenuArrowFg: p.muted,
    menuFgDisabled: p.faint,
    menuSeparatorFg: p.line,

    scrollBarBg: a(p.fg, 0x53),
    scrollBarBgOver: a(p.fg, 0x7a),
    scrollBg: a(p.fg, 0x1a),
    scrollBgOver: a(p.fg, 0x2c),
    placeholderFg: p.muted,
    placeholderFgActive: p.muted,
    filterInputBorderFg: p.accent,
    filterInputActiveBg: p.raised,
    filterInputInactiveBg: p.raised,
    inputBorderFg: p.line,
    checkboxFg: p.faint,
    sliderBgInactive: p.line,
    sliderBgActive: p.accent,
    tooltipBg: p.surface,
    tooltipFg: p.fg,
    tooltipBorderFg: p.line,

    titleBg: p.alt,
    titleBgActive: p.alt,
    titleFg: p.muted,
    titleFgActive: p.fg,
    titleButtonFg: p.muted,
    titleButtonBgOver: over,
    titleButtonFgOver: p.fg,
    titleButtonFgActive: p.muted,
    titleButtonBgActiveOver: over,
    titleButtonFgActiveOver: p.fg,
    titleButtonCloseBgOver: p.red,
    titleButtonCloseFgOver: p.onAccent,
    titleButtonCloseBgActiveOver: p.red,
    titleButtonCloseFgActiveOver: p.onAccent,

    boxBg: p.surface,
    boxTextFg: p.fg,
    boxTextFgGood: p.green,
    boxTextFgError: p.red,
    boxTitleFg: p.fg,
    boxSearchBg: p.raised,
    boxTitleAdditionalFg: p.muted,
    boxTitleCloseFg: p.muted,
    boxTitleCloseFgOver: p.fg,
    boxDividerBg: p.alt,
    boxDividerFg: p.line,

    sideBarBg: p.alt,
    sideBarBgActive: p.secondary,
    sideBarTextFg: p.muted,
    sideBarTextFgActive: p.accent,
    sideBarIconFg: p.muted,
    sideBarIconFgActive: p.accent,
    sideBarBadgeBg: p.accent,
    sideBarBadgeBgMuted: p.muted,
    sideBarBadgeFg: p.onAccent,

    dialogsBg: p.bg,
    dialogsBgOver: over,
    dialogsBgActive: p.secondary,
    dialogsRippleBg: rampStep(p, p.bg, 2),
    dialogsRippleBgActive: rampStep(p, p.secondary, 1),
    dialogsNameFg: p.fg,
    dialogsNameFgActive: p.fg,
    dialogsTextFg: p.muted,
    dialogsTextFgActive: p.muted,
    dialogsTextFgService: p.accent,
    dialogsTextFgServiceActive: p.accent,
    dialogsDateFg: p.muted,
    dialogsDateFgActive: p.muted,
    dialogsChatIconFg: p.fg,
    dialogsChatIconFgActive: p.fg,
    dialogsDraftFg: p.red,
    dialogsDraftFgActive: p.red,
    dialogsVerifiedIconBg: p.accent,
    dialogsVerifiedIconBgActive: p.accent,
    dialogsVerifiedIconFg: p.onAccent,
    dialogsVerifiedIconFgActive: p.onAccent,
    dialogsSendingIconFg: p.muted,
    dialogsSendingIconFgActive: p.muted,
    dialogsSentIconFg: p.accent,
    dialogsSentIconFgActive: p.accent,
    dialogsUnreadBg: p.accent,
    dialogsUnreadBgActive: p.accent,
    dialogsUnreadBgMuted: p.muted,
    dialogsUnreadBgMutedActive: p.muted,
    dialogsUnreadFg: p.onAccent,
    dialogsUnreadFgActive: p.onAccent,
    dialogsOnlineBadgeFg: p.green,
    dialogsOnlineBadgeFgActive: p.green,
    dialogsMenuIconFg: p.muted,
    dialogsMenuIconFgOver: p.fg,
    dialogsMentionIconFg: p.onAccent,
    dialogsReactionIconFg: p.onAccent,
    topBarBg: p.alt,

    emojiPanBg: p.surface,
    emojiPanCategories: p.alt,
    emojiPanHeaderFg: p.muted,

    msgInBg: p.raised,
    msgInBgSelected: rampStep(p, p.raised, 1),
    msgOutBg: p.secondary,
    msgOutBgSelected: rampStep(p, p.secondary, 1),
    msgInShadow: a(p.black, p.dark ? 0x40 : 0x1a),
    msgInShadowSelected: a(p.black, p.dark ? 0x40 : 0x1a),
    msgOutShadow: a(p.black, p.dark ? 0x40 : 0x1a),
    msgOutShadowSelected: a(p.black, p.dark ? 0x40 : 0x1a),
    msgInServiceFg: p.accent,
    msgInServiceFgSelected: p.accent,
    msgOutServiceFg: p.accent,
    msgOutServiceFgSelected: p.accent,
    msgInDateFg: p.muted,
    msgInDateFgSelected: p.muted,
    msgOutDateFg: p.muted,
    msgOutDateFgSelected: p.muted,
    msgInReplyBarColor: p.accent,
    msgInReplyBarSelColor: p.accent,
    msgOutReplyBarColor: p.accent,
    msgOutReplyBarSelColor: p.accent,
    msgInMonoFg: p.code.string,
    msgOutMonoFg: p.code.string,
    msgInMonoFgSelected: p.code.string,
    msgOutMonoFgSelected: p.code.string,
    msgServiceBg: a(p.bg, 0xcc),
    msgServiceBgSelected: a(p.bg, 0xee),
    msgServiceFg: p.fg,
    historyTextInFg: p.fg,
    historyTextInFgSelected: p.fg,
    historyTextOutFg: p.fg,
    historyTextOutFgSelected: p.fg,
    historyLinkInFg: p.link,
    historyLinkInFgSelected: p.link,
    historyLinkOutFg: p.link,
    historyLinkOutFgSelected: p.link,
    historyOutIconFg: p.accent,
    historyOutIconFgSelected: p.accent,
    historyComposeAreaBg: p.alt,
    historyComposeAreaFg: p.fg,
    historyComposeAreaFgService: p.muted,
    historyComposeIconFg: p.muted,
    historyComposeIconFgOver: p.accent,
    historyComposeButtonBg: p.alt,
    historyComposeButtonBgOver: over,
    historyComposeButtonBgRipple: rampStep(p, p.bg, 2),
    historySendIconFg: p.accent,
    historySendIconFgOver: p.accentHover,

    profileVerifiedCheckBg: p.accent,
    profileVerifiedCheckFg: p.onAccent,
    introBg: p.bg,

    // Telegram Desktop paints syntax with these: the editor theme's own token colors.
    statisticsChartLineBlue: p.blue,
    statisticsChartLineGreen: p.green,
    statisticsChartLineRed: p.red,
    statisticsChartLineGolden: p.yellow,
    statisticsChartLineLightblue: p.cyan,
    statisticsChartLineLightgreen: p.green,
    statisticsChartLineOrange: p.orange,
    statisticsChartLineIndigo: p.violet,
    statisticsChartLinePurple: p.violet,
    statisticsChartLineCyan: p.cyan,
  };

  for (let i = 1; i <= 8; i++) {
    const base = keys[`historyPeer${i}UserpicBg`]?.default;
    if (!base) continue;
    const f = familyOf(parseRgba(base));
    const c = f === "blue" ? p.blue : familyColor(p, f);
    for (const k of [`historyPeer${i}NameFg`, `historyPeer${i}NameFgSelected`, `historyPeer${i}UserpicBg`, `historyPeer${i}UserpicBg2`]) r[k] = c;
  }
  r.historyPeerUserpicFg = p.onAccent;
  r.historyPeerSavedMessagesBg = p.accent;
  r.historyPeerArchiveUserpicBg = p.muted;
  return r;
}

/** Every Desktop color key for one variant. */
export function desktopColors(p: Palette): Map<string, Rgba> {
  const roles = desktopRoles(p);
  const light = axisOf(false);
  const night = axisOf(true);
  const out = new Map<string, Rgba>();
  const visiting = new Set<string>();

  const fromValue = (k: string, v: string, axis: Axis): Rgba => {
    if (!v.startsWith("#")) return compute(v);
    const base = parseRgba(v);
    const c = remap(base, axis, p);
    return isOut(k) && isColored(base) && familyOf(base) === "green" ? withAlpha(p.accent, base.a) : c;
  };

  const compute = (k: string): Rgba => {
    const done = out.get(k);
    if (done) return done;
    if (visiting.has(k)) throw new Error(`desktop: reference loop at ${k}`);
    const key = keys[k];
    if (!key) throw new Error(`desktop: unknown key ${k}`);
    visiting.add(k);
    let c = roles[k];
    if (!c) {
      // A reference says what a color means (a download arrow is cut out of its bubble), so it wins.
      // Otherwise a dark variant starts from Telegram's own night theme, and what the night theme
      // leaves out follows its fallback, or else the default as is, the way Telegram shows it.
      if (key.ref) c = compute(key.ref);
      else if (p.dark && key.night) c = fromValue(k, key.night, night);
      else if (p.dark && key.fallback) c = compute(key.fallback);
      else c = fromValue(k, key.default!, p.dark && !LIGHT_ONLY.desktop.has(k) ? night : light);
    }
    visiting.delete(k);
    out.set(k, c);
    return c;
  };

  for (const k of Object.keys(roles)) if (!keys[k]) throw new Error(`desktop: role for unknown key ${k}`);
  for (const k of Object.keys(keys)) compute(k);
  return out;
}

/** A colors.tdesktop-theme: one `key: #rrggbb[aa];` line per key, in Telegram's order. */
export function tdesktopColors(colors: Map<string, Rgba>): string {
  return Object.keys(keys).map((k) => `${k}: ${rgbaHex(colors.get(k)!)};`).join("\n") + "\n";
}
