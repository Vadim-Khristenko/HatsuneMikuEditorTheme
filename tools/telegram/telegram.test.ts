import { describe, expect, test } from "bun:test";
import { androidColors, attheme, WALLPAPER_KEYS } from "./android";
import { renderArt } from "./art";
import { argbHex, contrast, over, rgbaHex, rgbHex, type Rgba } from "./color";
import { desktopColors, tdesktopColors } from "./desktop";
import { KEYS } from "./keys";
import { paletteOf, VARIANTS } from "./palette";
import { encodePng } from "./png";
import { parseAttheme, parseTdesktopColors } from "./sync-keys";
import { crc32, readZip, writeZip } from "./zip";

type Pair = [fg: string, bg: string, min: number];

const ANDROID_PAIRS: Pair[] = [
  ["windowBackgroundWhiteBlackText", "windowBackgroundWhite", 4.5],
  ["windowBackgroundWhiteGrayText", "windowBackgroundWhite", 3],
  ["windowBackgroundWhiteHintText", "windowBackgroundWhite", 3],
  ["windowBackgroundWhiteBlueText4", "windowBackgroundWhite", 3],
  ["windowBackgroundWhiteLinkText", "windowBackgroundWhite", 3],
  ["windowBackgroundWhiteBlackText", "windowBackgroundGray", 4.5],
  ["actionBarDefaultTitle", "actionBarDefault", 4.5],
  ["actionBarDefaultIcon", "actionBarDefault", 3],
  ["actionBarDefaultSubtitle", "actionBarDefault", 3],
  ["actionBarDefaultSubmenuItem", "actionBarDefaultSubmenuBackground", 4.5],
  ["chats_name", "windowBackgroundWhite", 4.5],
  ["chats_message", "windowBackgroundWhite", 3],
  ["chats_date", "windowBackgroundWhite", 3],
  ["chats_nameMessage", "windowBackgroundWhite", 3],
  ["chats_unreadCounterText", "chats_unreadCounter", 3],
  ["chats_unreadCounterText", "chats_unreadCounterMuted", 3],
  ["chats_actionIcon", "chats_actionBackground", 3],
  ["chats_menuItemText", "chats_menuBackground", 4.5],
  ["chats_menuName", "chats_menuTopBackground", 4.5],
  ["chat_messageTextIn", "chat_inBubble", 4.5],
  ["chat_messageTextOut", "chat_outBubble", 4.5],
  ["chat_messageLinkIn", "chat_inBubble", 3],
  ["chat_messageLinkOut", "chat_outBubble", 3],
  ["chat_inTimeText", "chat_inBubble", 3],
  ["chat_outTimeText", "chat_outBubble", 3],
  ["chat_outSentCheckRead", "chat_outBubble", 3],
  ["chat_inReplyNameText", "chat_inBubble", 3],
  ["chat_outReplyNameText", "chat_outBubble", 3],
  ["chat_messageTextIn", "chat_inBubbleSelected", 4.5],
  ["chat_messageTextOut", "chat_outBubbleSelected", 4.5],
  ["chat_messagePanelText", "chat_messagePanelBackground", 4.5],
  ["chat_messagePanelHint", "chat_messagePanelBackground", 3],
  ["chat_serviceText", "chat_serviceBackground", 4.5],
  ["chat_goDownButtonCounter", "chat_goDownButtonCounterBackground", 3],
  ["dialogTextBlack", "dialogBackground", 4.5],
  ["dialogTextGray2", "dialogBackground", 3],
  ["dialogButton", "dialogBackground", 3],
  ["featuredStickers_buttonText", "featuredStickers_addButton", 3],
  ["profile_actionIcon", "profile_actionBackground", 3],
  ["checkboxSquareCheck", "checkboxSquareBackground", 3],
  ["avatar_text", "avatar_backgroundRed", 3],
  ["avatar_text", "avatar_backgroundOrange", 3],
  ["avatar_text", "avatar_backgroundViolet", 3],
  ["avatar_text", "avatar_backgroundGreen", 3],
  ["avatar_text", "avatar_backgroundCyan", 3],
  ["avatar_text", "avatar_backgroundBlue", 3],
  ["avatar_text", "avatar_backgroundPink", 3],
  ["avatar_text", "avatar_backgroundSaved", 3],
];

const DESKTOP_PAIRS: Pair[] = [
  ["windowFg", "windowBg", 4.5],
  ["windowSubTextFg", "windowBg", 3],
  ["windowActiveTextFg", "windowBg", 3],
  ["windowFgActive", "windowBgActive", 3],
  ["activeButtonFg", "activeButtonBg", 3],
  ["lightButtonFg", "lightButtonBg", 3],
  ["menuIconFg", "menuBg", 3],
  ["windowFg", "menuBgOver", 4.5],
  ["boxTextFg", "boxBg", 4.5],
  ["titleFgActive", "titleBgActive", 4.5],
  ["dialogsNameFg", "dialogsBg", 4.5],
  ["dialogsTextFg", "dialogsBg", 3],
  ["dialogsDateFg", "dialogsBg", 3],
  ["dialogsNameFg", "dialogsBgOver", 4.5],
  ["dialogsNameFgActive", "dialogsBgActive", 4.5],
  ["dialogsTextFgActive", "dialogsBgActive", 3],
  ["dialogsUnreadFg", "dialogsUnreadBg", 3],
  ["dialogsUnreadFg", "dialogsUnreadBgMuted", 3],
  ["sideBarTextFgActive", "sideBarBgActive", 3],
  ["sideBarTextFg", "sideBarBg", 3],
  ["sideBarBadgeFg", "sideBarBadgeBg", 3],
  ["historyTextInFg", "msgInBg", 4.5],
  ["historyTextOutFg", "msgOutBg", 4.5],
  ["historyTextInFgSelected", "msgInBgSelected", 4.5],
  ["historyTextOutFgSelected", "msgOutBgSelected", 4.5],
  ["historyLinkInFg", "msgInBg", 3],
  ["historyLinkOutFg", "msgOutBg", 3],
  ["msgInDateFg", "msgInBg", 3],
  ["msgOutDateFg", "msgOutBg", 3],
  ["msgInServiceFg", "msgInBg", 3],
  ["msgOutServiceFg", "msgOutBg", 3],
  ["historyOutIconFg", "msgOutBg", 3],
  ["historyFileInIconFg", "msgFileInBg", 3],
  ["historyFileOutIconFg", "msgFileOutBg", 3],
  ["msgServiceFg", "msgServiceBg", 4.5],
  ["historyComposeAreaFg", "historyComposeAreaBg", 4.5],
  ["placeholderFg", "historyComposeAreaBg", 3],
  ["historyPeerUserpicFg", "historyPeer1UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer2UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer3UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer4UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer5UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer6UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer7UserpicBg", 3],
  ["historyPeerUserpicFg", "historyPeer8UserpicBg", 3],
];

function checkPairs(colors: Map<string, Rgba>, base: Rgba, pairs: Pair[]): string[] {
  const bad: string[] = [];
  for (const [fgKey, bgKey, min] of pairs) {
    const fg = colors.get(fgKey);
    const bg = colors.get(bgKey);
    if (!fg || !bg) {
      bad.push(`${fgKey} on ${bgKey}: missing`);
      continue;
    }
    const under = over(bg, base);
    const ratio = contrast(over(fg, under), under);
    if (ratio < min) bad.push(`${fgKey} ${rgbHex(fg)} on ${bgKey} ${rgbHex(bg)}: ${ratio.toFixed(2)} < ${min}`);
  }
  return bad;
}

function offPalette(colors: Map<string, Rgba>, canon: Set<string>): string[] {
  return [...colors].filter(([, c]) => !canon.has(rgbHex(c))).map(([k, c]) => `${k} ${rgbHex(c)}`);
}

describe("file formats", () => {
  const p = paletteOf(VARIANTS[0]);

  test("an .attheme reads back the way Telegram reads it, wallpaper after WPS", () => {
    const colors = androidColors(p);
    const picture = encodePng(new Uint8Array(4 * 2 * 3).fill(7), 4, 2);
    const file = attheme(colors, picture);
    const text = new TextDecoder("latin1").decode(file);
    const parsed = parseAttheme(text);
    expect(parsed.size).toBe(colors.size);
    for (const [k, c] of colors) expect(parsed.get(k)).toBe(argbHex(c));
    const start = text.indexOf("WPS\n") + 4;
    expect([...file.subarray(start, start + picture.length)]).toEqual([...picture]);
    expect(text.endsWith("\nWPE\n")).toBe(true);
  });

  test("a .tdesktop-theme is a zip with the colors and the background", () => {
    const colors = desktopColors(p);
    const zip = writeZip([
      { name: "colors.tdesktop-theme", data: new TextEncoder().encode(tdesktopColors(colors)) },
      { name: "background.png", data: encodePng(new Uint8Array(3), 1, 1) },
    ]);
    const entries = readZip(zip);
    expect(entries.map((e) => e.name)).toEqual(["colors.tdesktop-theme", "background.png"]);
    const parsed = parseTdesktopColors(new TextDecoder().decode(entries[0].data));
    expect(parsed.size).toBe(colors.size);
    for (const [k, c] of colors) expect(parsed.get(k)).toBe(rgbaHex(c));
  });

  test("the png has a valid signature and chunk checksums", () => {
    const png = encodePng(renderArt(p, 64, 36), 64, 36);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset);
    for (let o = 8; o < png.length; ) {
      const len = view.getUint32(o);
      expect(view.getUint32(o + 8 + len)).toBe(crc32(png.subarray(o + 4, o + 8 + len)));
      o += 12 + len;
    }
  });

  test("the art keeps the background where nothing is drawn", () => {
    const rgb = renderArt(p, 64, 36);
    expect([rgb[0], rgb[1], rgb[2]]).toEqual([p.bg.r, p.bg.g, p.bg.b]);
  });
});

for (const v of VARIANTS) {
  const p = paletteOf(v);

  describe(`android ${v.id}`, () => {
    const colors = androidColors(p);
    test("covers every color key Telegram reads", () => {
      const want = Object.keys(KEYS.android.keys).filter((k) => !WALLPAPER_KEYS.has(k) && !/^chat_outBubbleGradient/.test(k));
      expect(want.filter((k) => !colors.has(k))).toEqual([]);
    });
    test("uses only the canonical palette", () => expect(offPalette(colors, p.canon)).toEqual([]));
    test("text holds its contrast", () => expect(checkPairs(colors, p.bg, ANDROID_PAIRS)).toEqual([]));
    test("reads as dark or light the way Telegram decides it", () => {
      const bg = colors.get("windowBackgroundWhite")!;
      expect(contrast(bg, { r: 0, g: 0, b: 0, a: 255 }) < contrast(bg, { r: 255, g: 255, b: 255, a: 255 })).toBe(v.dark);
    });
  });

  describe(`desktop ${v.id}`, () => {
    const colors = desktopColors(p);
    test("covers every key of the palette", () => expect(Object.keys(KEYS.desktop.keys).filter((k) => !colors.has(k))).toEqual([]));
    test("uses only the canonical palette", () => expect(offPalette(colors, p.canon)).toEqual([]));
    test("text holds its contrast", () => expect(checkPairs(colors, p.bg, DESKTOP_PAIRS)).toEqual([]));
  });
}
