import { describe, expect, test } from "bun:test";
import { bestIcon, iconLinks, manifestIcons, sizeOf } from "../src/site-icon";

describe("site icons", () => {
  const page = `<!doctype html><html><head>
    <link rel="stylesheet" href="/app.css">
    <link rel="icon" href="/favicon-32.png" sizes="32x32">
    <link rel='shortcut icon' href='favicon.ico'>
    <LINK REL="apple-touch-icon" HREF="/touch.png">
    <link rel="mask-icon" href="/pin.svg" color="#000">
    <link rel="icon" type="image/svg+xml" href="https://cdn.example.net/logo.svg?v=2&amp;x=1">
    <link rel="manifest" href="/site.webmanifest">
  </head><body><link rel="icon" href="/late.png" sizes="999x999"></body></html>`;

  test("reads icon links from the head, relative and absolute, and skips mask-icon", () => {
    const { icons, manifest } = iconLinks(page, "https://example.com/start/");
    expect(icons.map((i) => i.href)).toEqual([
      "https://example.com/favicon-32.png",
      "https://example.com/start/favicon.ico",
      "https://example.com/touch.png",
      "https://cdn.example.net/logo.svg?v=2&x=1",
    ]);
    expect(manifest).toBe("https://example.com/site.webmanifest");
  });

  test("an apple-touch-icon without sizes counts as 180, an SVG as 512", () => {
    const { icons } = iconLinks(page, "https://example.com/");
    expect(icons.find((i) => i.href.endsWith("touch.png"))?.size).toBe(180);
    expect(bestIcon(icons)).toBe("https://cdn.example.net/logo.svg?v=2&x=1");
  });

  test("sizes take the largest side", () => {
    expect(sizeOf("16x16 48x48 32x32", "/a.png", null)).toBe(48);
    expect(sizeOf("any", "/a.png", null)).toBe(512);
    expect(sizeOf(null, "/a.png", null)).toBe(0);
  });

  test("manifest icons resolve against the manifest and skip maskable-only ones", () => {
    const icons = manifestIcons({ icons: [
      { src: "icons/192.png", sizes: "192x192" },
      { src: "icons/512-mask.png", sizes: "512x512", purpose: "maskable" },
      { src: "icons/384.png", sizes: "384x384", purpose: "any maskable" },
    ] }, "https://example.com/static/site.webmanifest");
    expect(icons.map((i) => i.href)).toEqual(["https://example.com/static/icons/192.png", "https://example.com/static/icons/384.png"]);
    expect(bestIcon(icons)).toBe("https://example.com/static/icons/384.png");
  });

  test("garbage in, nothing out", () => {
    expect(iconLinks("<link rel=icon href='javascript:alert(1)'>", "https://example.com/").icons).toEqual([]);
    expect(manifestIcons("nope", "https://example.com/")).toEqual([]);
    expect(bestIcon([])).toBeNull();
  });
});
