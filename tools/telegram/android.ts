import { argbHex, parseArgb, withAlpha, type Rgba } from "./color";
import { KEYS } from "./keys";
import { contrast } from "./color";
import { rampStep, selectedOf, type Palette } from "./palette";
import { familyOf, isColored, LIGHT_ONLY, position, remap, type Axis } from "./remap";

const keys = KEYS.android.keys;

function axisOf(source: "default" | "night"): Axis {
  const get = (k: string) => parseArgb((source === "night" ? keys[k].night : undefined) ?? keys[k].default!);
  return { bg: get("windowBackgroundWhite"), fg: get("windowBackgroundWhiteBlackText") };
}

/** Keys drawn inside the outgoing bubble: Telegram tints them green, the themes tint them with the accent. */
const isOut = (k: string) => /^chat_out|^chat_messageLinkOut|^chat_messageTextOut/.test(k);

/** Keys that hold words to read, not icons, lines or fills. */
const isText = (k: string) => /Text|Title|Name|Date|Time$|Hint|Placeholder|Caption|Label/.test(k) && !/Background|Bg$|Icon|Line|Selector/.test(k);

/** The colors that carry the look. Everything else follows Telegram's own design, recolored. */
export function androidRoles(p: Palette): Record<string, Rgba> {
  const a = (c: Rgba, alpha: number) => withAlpha(c, alpha);
  const inBubble = p.raised;
  const outBubble = p.secondary;
  // A seekbar track: the faint gray, or the first neutral toward the background the accent fill holds 2:1 on.
  let track = p.faint;
  for (let s = 1; contrast(p.accent, track) < 2 && s < p.ramp.length; s++) track = rampStep(p, p.faint, -s);
  const peer = { Red: p.red, Orange: p.orange, Violet: p.violet, Green: p.green, Cyan: p.cyan, Blue: p.blue, Pink: p.pink };

  const r: Record<string, Rgba> = {
    windowBackgroundWhite: p.bg,
    windowBackgroundGray: p.alt,
    windowBackgroundWhiteBlackText: p.fg,
    windowBackgroundWhiteGrayText: p.muted,
    windowBackgroundWhiteGrayText2: p.muted,
    windowBackgroundWhiteGrayText3: p.muted,
    windowBackgroundWhiteGrayText4: p.muted,
    windowBackgroundWhiteGrayText5: p.muted,
    windowBackgroundWhiteGrayText6: p.muted,
    windowBackgroundWhiteGrayText7: p.muted,
    windowBackgroundWhiteGrayText8: p.muted,
    windowBackgroundWhiteGrayIcon: p.muted,
    windowBackgroundWhiteHintText: p.muted,
    windowBackgroundWhiteValueText: p.accent,
    windowBackgroundWhiteLinkText: p.link,
    windowBackgroundWhiteLinkSelection: a(p.accent, 0x33),
    windowBackgroundWhiteBlueHeader: p.accent,
    windowBackgroundWhiteBlueButton: p.accent,
    windowBackgroundWhiteBlueIcon: p.accent,
    windowBackgroundWhiteGreenText: p.green,
    windowBackgroundWhiteGreenText2: p.green,
    windowBackgroundWhiteInputField: p.line,
    windowBackgroundWhiteInputFieldActivated: p.accent,
    windowBackgroundChecked: p.accent,
    windowBackgroundCheckText: p.onAccent,
    windowBackgroundUnchecked: p.faint,

    actionBarDefault: p.alt,
    actionBarDefaultTitle: p.fg,
    actionBarDefaultSubtitle: p.muted,
    actionBarDefaultIcon: p.fg,
    actionBarDefaultSelector: a(p.fg, 0x1a),
    actionBarDefaultSearch: p.fg,
    actionBarDefaultSearchPlaceholder: p.muted,
    actionBarDefaultSubmenuBackground: p.surface,
    actionBarDefaultSubmenuItem: p.fg,
    actionBarDefaultSubmenuItemIcon: p.muted,
    actionBarDefaultSubmenuSeparator: p.line,
    actionBarActionModeDefault: p.alt,
    actionBarActionModeDefaultIcon: p.fg,
    actionBarTabActiveText: p.accent,
    actionBarTabLine: p.accent,
    actionBarTabUnactiveText: p.muted,

    chats_name: p.fg,
    chats_message: p.muted,
    chats_message_threeLines: p.muted,
    chats_date: p.muted,
    chats_nameMessage: p.accent,
    chats_nameMessage_threeLines: p.accent,
    chats_attachMessage: p.accent,
    chats_actionMessage: p.accent,
    chats_draft: p.red,
    chats_unreadCounter: p.accent,
    chats_unreadCounterMuted: p.muted,
    chats_unreadCounterText: p.onAccent,
    chats_tabUnreadActiveBackground: p.accent,
    chats_tabUnreadUnactiveBackground: p.muted,
    chats_onlineCircle: p.green,
    chats_sentCheck: p.accent,
    chats_sentReadCheck: p.accent,
    chats_sentClock: p.muted,
    chats_sentError: p.red,
    chats_sentErrorIcon: p.onAccent,
    chats_pinnedIcon: p.muted,
    chats_muteIcon: p.muted,
    chats_mentionIcon: p.onAccent,
    chats_verifiedBackground: p.accent,
    chats_verifiedCheck: p.onAccent,
    chats_secretIcon: p.green,
    chats_secretName: p.green,
    chats_actionBackground: p.accent,
    chats_actionPressedBackground: p.accentHover,
    chats_actionIcon: p.onAccent,
    chats_menuBackground: p.surface,
    chats_menuTopBackground: p.alt,
    chats_menuTopBackgroundCats: p.alt,
    chats_menuTopShadow: a(p.black, 0x00),
    chats_menuTopShadowCats: a(p.black, 0x00),
    chats_menuName: p.fg,
    chats_menuPhone: p.muted,
    chats_menuPhoneCats: p.muted,
    chats_menuItemText: p.fg,
    chats_menuItemIcon: p.muted,
    chats_menuItemCheck: p.accent,

    chat_inBubble: inBubble,
    chat_inBubbleSelected: selectedOf(p, inBubble),
    chat_inBubbleSelectedOverlay: a(p.accent, 0x1f),
    chat_inBubbleShadow: a(p.black, p.dark ? 0x40 : 0x1a),
    chat_outBubble: outBubble,
    chat_outBubbleSelected: selectedOf(p, outBubble),
    chat_outBubbleSelectedOverlay: a(p.accent, 0x1f),
    chat_outBubbleGradientSelectedOverlay: a(p.accent, 0x1f),
    chat_outBubbleShadow: a(p.black, p.dark ? 0x40 : 0x1a),
    chat_messageTextIn: p.fg,
    chat_messageTextOut: p.fg,
    chat_messageLinkIn: p.link,
    chat_messageLinkOut: p.link,
    chat_inTimeText: p.muted,
    chat_outTimeText: p.muted,
    chat_inTimeSelectedText: p.muted,
    chat_outTimeSelectedText: p.muted,
    chat_outSentCheck: p.accent,
    chat_outSentCheckSelected: p.accent,
    chat_outSentCheckRead: p.accent,
    chat_outSentCheckReadSelected: p.accent,
    chat_outSentClock: p.muted,
    chat_outSentClockSelected: p.muted,
    chat_inReplyLine: p.accent,
    chat_outReplyLine: p.accent,
    chat_outReplyLine2: p.accent,
    chat_inReplyNameText: p.accent,
    chat_outReplyNameText: p.accent,
    chat_inReplyMessageText: p.fg,
    chat_outReplyMessageText: p.fg,
    chat_inReplyMediaMessageText: p.muted,
    chat_outReplyMediaMessageText: p.muted,
    chat_inReplyMediaMessageSelectedText: p.muted,
    chat_outReplyMediaMessageSelectedText: p.muted,
    chat_inLoader: p.accent,
    chat_outLoader: p.accent,
    chat_inLoaderSelected: p.accent,
    chat_outLoaderSelected: p.accent,
    chat_inMenu: p.muted,
    chat_outMenu: p.muted,
    chat_inMenuSelected: p.muted,
    chat_outMenuSelected: p.muted,
    chat_botButtonText: p.fg,

    // A loader is an accent circle; its icon and progress ring are cut out of the bubble.
    chat_inFileProgress: inBubble,
    chat_inFileProgressSelected: inBubble,
    chat_inAudioProgress: inBubble,
    chat_inAudioSelectedProgress: inBubble,
    chat_outFileProgress: outBubble,
    chat_outFileProgressSelected: outBubble,
    chat_outAudioProgress: outBubble,
    chat_outAudioSelectedProgress: outBubble,
    chat_inAudioSeekbar: track,
    chat_inAudioCacheSeekbar: p.muted,
    chat_inAudioSeekbarFill: p.accent,
    chat_inAudioSeekbarSelected: p.accent,
    chat_outAudioSeekbar: track,
    chat_outAudioCacheSeekbar: p.muted,
    chat_outAudioSeekbarFill: p.accent,
    chat_outAudioSeekbarSelected: p.accent,
    chat_inVoiceSeekbar: track,
    chat_inVoiceSeekbarFill: p.accent,
    chat_inVoiceSeekbarSelected: p.accent,
    chat_outVoiceSeekbar: track,
    chat_outVoiceSeekbarFill: p.accent,
    chat_outVoiceSeekbarSelected: p.accent,

    chat_messagePanelBackground: p.alt,
    chat_messagePanelText: p.fg,
    chat_messagePanelHint: p.muted,
    chat_messagePanelIcons: p.muted,
    chat_messagePanelSend: p.accent,
    chat_messagePanelCursor: p.accent,
    chat_messagePanelVoiceBackground: p.accent,
    chat_messagePanelVoiceDuration: p.onAccent,
    // The send button of the attach sheet paints this icon on the floating button fill.
    chat_messagePanelVoicePressed: p.onAccent,
    dialogFloatingButton: p.accent,
    dialogFloatingButtonPressed: p.accentHover,
    dialogFloatingIcon: p.onAccent,
    chat_emojiPanelBackspace: p.muted,
    undo_cancelColor: p.accentOnInk,
    undo_infoColor: p.dark ? p.fg : p.bg,
    chat_messagePanelShadow: a(p.black, 0x00),

    chat_serviceBackground: a(p.bg, 0xcc),
    chat_serviceBackgroundSelected: a(p.bg, 0xee),
    chat_serviceBackgroundSelector: a(p.fg, 0x20),
    chat_serviceText: p.fg,
    chat_serviceLink: p.link,
    chat_serviceIcon: p.fg,
    chat_status: p.accent,
    chat_topPanelBackground: p.alt,
    chat_topPanelLine: p.accent,
    chat_topPanelTitle: p.accent,
    chat_topPanelMessage: p.muted,
    chat_topPanelClose: p.muted,
    chat_replyPanelLine: p.line,
    chat_replyPanelName: p.accent,
    chat_replyPanelIcons: p.accent,
    chat_replyPanelClose: p.muted,
    chat_goDownButton: p.surface,
    chat_goDownButtonCounterBackground: p.accent,
    chat_goDownButtonCounter: p.onAccent,
    chat_unreadMessagesStartBackground: p.alt,
    chat_unreadMessagesStartText: p.accent,
    chat_unreadMessagesStartArrowIcon: p.muted,
    chat_emojiPanelBackground: p.alt,
    chat_emojiPanelIcon: p.muted,
    chat_emojiPanelIconSelected: p.accent,

    avatar_text: p.onAccent,
    avatar_backgroundSaved: p.accent,
    avatar_background2Saved: p.accent,
    avatar_backgroundArchived: p.muted,
    avatar_backgroundArchivedHidden: p.muted,
    avatar_backgroundActionBarBlue: p.alt,
    avatar_backgroundInProfileBlue: p.accent,
    avatar_actionBarIconBlue: p.fg,
    avatar_actionBarSelectorBlue: a(p.fg, 0x1a),
    avatar_subtitleInProfileBlue: p.muted,

    switchTrack: p.faint,
    switchTrackChecked: p.accent,
    switchTrackBlue: p.faint,
    switchTrackBlueChecked: p.accent,
    switchTrackBlueThumb: p.bg,
    switchTrackBlueThumbChecked: p.bg,
    switch2Track: p.faint,
    switch2TrackChecked: p.accent,
    checkbox: p.accent,
    checkboxCheck: p.onAccent,
    checkboxSquareBackground: p.accent,
    checkboxSquareCheck: p.onAccent,
    checkboxSquareUnchecked: p.muted,
    checkboxSquareDisabled: p.faint,
    checkboxDisabled: p.faint,
    radioBackground: p.faint,
    radioBackgroundChecked: p.accent,
    progressCircle: p.accent,

    featuredStickers_addButton: p.accent,
    featuredStickers_addButton2: p.accent,
    featuredStickers_addButtonPressed: p.accentHover,
    featuredStickers_buttonText: p.onAccent,
    featuredStickers_buttonProgress: p.onAccent,
    featuredStickers_addedIcon: p.accent,
    featuredStickers_removeButtonText: p.red,
    featuredStickers_unread: p.accent,
    chat_msgIvButtonPrimaryIn: p.accent,
    chat_msgIvButtonPrimaryOut: p.accent,
    chat_msgIvButtonPrimaryInPressed: p.accentHover,
    chat_msgIvButtonPrimaryOutPressed: p.accentHover,
    chat_msgIvButtonPrimaryInText: p.onAccent,
    chat_msgIvButtonPrimaryOutText: p.onAccent,

    dialogBackground: p.surface,
    dialogBackgroundGray: p.alt,
    dialogTextBlack: p.fg,
    dialogTextGray: p.accent,
    dialogTextGray2: p.muted,
    dialogTextGray3: p.muted,
    dialogTextGray4: p.faint,
    dialogTextHint: p.muted,
    dialogTextLink: p.link,
    dialogTextBlue: p.accent,
    dialogTextBlue2: p.accent,
    dialogTextBlue4: p.accent,
    dialogLinkSelection: a(p.accent, 0x33),
    dialogIcon: p.muted,
    dialogButton: p.accent,
    dialogButtonSelector: a(p.fg, 0x14),
    dialogTopBackground: p.accent,
    dialogInputField: p.line,
    dialogInputFieldActivated: p.accent,
    dialogRoundCheckBox: p.accent,
    dialogRoundCheckBoxCheck: p.onAccent,
    dialogCheckboxSquareBackground: p.accent,
    dialogCheckboxSquareCheck: p.onAccent,
    dialogCheckboxSquareUnchecked: p.muted,
    dialogCheckboxSquareDisabled: p.faint,
    dialogRadioBackground: p.faint,
    dialogRadioBackgroundChecked: p.accent,
    dialogLineProgress: p.accent,
    dialogLineProgressBackground: p.line,
    dialogSearchBackground: p.raised,
    dialogSearchHint: p.muted,
    dialogSearchIcon: p.muted,
    dialogSearchText: p.fg,

    profile_title: p.fg,
    profile_status: p.muted,
    profile_actionBackground: p.accent,
    profile_actionPressedBackground: p.accentHover,
    profile_actionIcon: p.onAccent,
    profile_tabSelectedLine: p.accent,
    profile_tabSelectedText: p.accent,
    profile_tabText: p.muted,
    profile_tabSelector: a(p.fg, 0x14),
    profile_verifiedBackground: p.accent,
    profile_verifiedCheck: p.onAccent,

    glass_tabSelected: p.accent,
    glass_tabSelectedText: p.accent,
    glass_tabUnselected: p.muted,
    glass_targetMainTabs: p.bg,
    glass_targetMainTopPanel: p.bg,

    telegram_color: p.accent,
    telegram_color_text: p.accent,
    telegram_color_dialogsLogo: p.accent,
    fill_RedDark: p.red,
    botKeyboard_button_primary: p.accent,
    botKeyboard_button_success: p.green,
    botKeyboard_button_danger: p.red,

    code_keyword: p.code.keyword,
    code_operator: p.code.operator,
    code_constant: p.code.constant,
    code_string: p.code.string,
    code_number: p.code.number,
    code_comment: p.code.comment,
    code_function: p.code.function,
  };
  for (const [name, c] of Object.entries(peer)) {
    r[`avatar_background${name}`] = c;
    r[`avatar_background2${name}`] = c;
    r[`avatar_nameInMessage${name}`] = c;
  }
  return r;
}

/** Keys that switch the chat background to a color or gradient and hide the embedded picture. */
export const WALLPAPER_KEYS = new Set(["chat_wallpaper", "chat_wallpaper_gradient_to", "key_chat_wallpaper_gradient_to2", "key_chat_wallpaper_gradient_to3"]);

/** Keys that turn on effects the themes do not use. Telegram leaves them off when they are absent. */
const OFF_KEYS = new Set(["chat_outBubbleGradient", "chat_outBubbleGradient2", "chat_outBubbleGradient3", "chat_outBubbleGradientAnimated"]);

/**
 * Keys Telegram works out from the bubbles and the text when a theme leaves them out
 * (Theme.applyCalculatedTableColors, RichMessageLayout.RichButton). Setting them would only
 * freeze a guess, so the themes leave them to Telegram.
 */
export const DERIVED_KEYS = new Set([
  ...["in", "out"].flatMap((side) => [
    `chat_${side}TableBackground`, `chat_${side}TableBorder`, `chat_${side}Divider`,
    `chat_${side}ArticleDetailsLine`, `chat_${side}ArticleDetailsArrow`,
    `chat_${side}ArticleCodeScrollbarBackground`, `chat_${side}ArticleCodeScrollbar`,
  ]),
  "chat_inArticleCodeBackground",
  ...["Default", "DefaultInline", "Danger", "Success"].flatMap((style) =>
    ["In", "Out"].flatMap((side) => [`chat_msgIvButton${style}${side}`, `chat_msgIvButton${style}${side}Pressed`]),
  ),
]);

/** Every Android color key for one variant. */
export function androidColors(p: Palette): Map<string, Rgba> {
  const roles = androidRoles(p);
  const light = axisOf("default");
  const night = axisOf("night");
  const out = new Map<string, Rgba>();
  const visiting = new Set<string>();
  const textAxis = { bg: p.bg, fg: p.fg };

  const compute = (k: string): Rgba | undefined => {
    if (out.has(k)) return out.get(k);
    if (visiting.has(k)) throw new Error(`android: fallback loop at ${k}`);
    visiting.add(k);
    const key = keys[k];
    let c: Rgba | undefined = roles[k];
    if (!c) {
      // A dark variant starts from what Telegram shows in its own night theme: the night value, else
      // the fallback key, else the default as is, because the night theme leaves mode-independent keys out.
      let source: string | undefined;
      let axis = light;
      if (!p.dark) source = key.default;
      else if (key.night) [source, axis] = [key.night, night];
      else if (!key.fallback) [source, axis] = [key.default, LIGHT_ONLY.android.has(k) ? light : night];
      // A fallback names what a key means (the text of a primary button is the text on the accent), so
      // a solid key whose fallback carries a role takes that role. Tints keep their own alpha below.
      if (key.fallback && roles[key.fallback] && (!source || parseArgb(source).a === 255)) {
        c = compute(key.fallback);
      } else if (source) {
        const base = parseArgb(source);
        c = remap(base, axis, p);
        if (isOut(k) && isColored(base) && familyOf(base) === "green") c = withAlpha(p.accent, base.a);
        // Telegram's light gray captions land on the editor's faint comment shade, too pale to read.
        else if (isText(k) && !isColored(base) && base.a === 255 && position(c, textAxis) < position(p.muted, textAxis)) c = p.muted;
      } else if (key.fallback) {
        c = compute(key.fallback);
      }
    }
    visiting.delete(k);
    if (c) out.set(k, c);
    return c;
  };

  for (const k of Object.keys(keys)) {
    if (WALLPAPER_KEYS.has(k) || OFF_KEYS.has(k)) continue;
    compute(k);
  }
  for (const k of DERIVED_KEYS) {
    if (!keys[k]) throw new Error(`android: derived key ${k} is not in the snapshot`);
    out.delete(k);
  }
  for (const k of Object.keys(roles)) if (!keys[k]) throw new Error(`android: role for unknown key ${k}`);
  return out;
}

/** An .attheme: key=#aarrggbb lines, then the wallpaper between WPS and WPE. */
export function attheme(colors: Map<string, Rgba>, wallpaper?: Uint8Array): Uint8Array {
  const lines = [...colors].sort(([a], [b]) => a.localeCompare(b)).map(([k, c]) => `${k}=${argbHex(c)}`);
  const text = new TextEncoder().encode(lines.join("\n") + "\n");
  if (!wallpaper) return text;
  const wps = new TextEncoder().encode("WPS\n");
  const wpe = new TextEncoder().encode("\nWPE\n");
  const out = new Uint8Array(text.length + wps.length + wallpaper.length + wpe.length);
  out.set(text, 0);
  out.set(wps, text.length);
  out.set(wallpaper, text.length + wps.length);
  out.set(wpe, text.length + wps.length + wallpaper.length);
  return out;
}
