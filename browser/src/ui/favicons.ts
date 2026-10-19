import { faviconUrl } from "../ext";
import type { IconMode, Shortcut } from "../settings";
import { hostOf } from "./ctx";

/** Where to look for a site's icon, best first. Remote services only ever see the domain. */
export function iconSources(url: string, mode: IconMode): string[] {
  if (mode === "letters") return [];
  const host = hostOf(url);
  const local = faviconUrl(url);
  const ddg = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
  const google = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  switch (mode) {
    case "browser": return local ? [local] : [];
    case "duckduckgo": return [ddg];
    case "google": return [google];
    case "auto": return local ? [local, ddg] : [ddg];
  }
}

const KEY = "hme:icon-pick";
let picks: Record<string, string> = {};
try {
  picks = JSON.parse(localStorage.getItem(KEY) ?? "{}");
} catch {
  picks = {};
}
const remember = (url: string, src: string) => {
  if (picks[url] === src) return;
  picks[url] = src;
  try {
    localStorage.setItem(KEY, JSON.stringify(picks));
  } catch {
    /* storage blocked */
  }
};

// Chromium answers an unknown site with its generic globe. Its pixels are the same every time,
// so one probe for a domain that cannot exist gives the signature to skip.
let globe: Promise<string | null> | null = null;

function signature(img: HTMLImageElement): string | null {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d");
    if (!g) return null;
    g.drawImage(img, 0, 0, 16, 16);
    return c.toDataURL();
  } catch {
    return null;
  }
}

function globeSignature(): Promise<string | null> {
  const probe = faviconUrl("https://no-such-site.invalid/");
  if (!probe) return Promise.resolve(null);
  globe ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(signature(img));
    img.onerror = () => resolve(null);
    img.src = probe;
  });
  return globe;
}

const isLocal = (src: string) => !/^https?:/.test(src);

/** Starts loading every icon right away, so tiles show them without a flash of letters. */
export function preloadIcons(shortcuts: Shortcut[], mode: IconMode): void {
  for (const sc of shortcuts) {
    const srcs = iconSources(sc.url, mode);
    const first = picks[sc.url] && srcs.includes(picks[sc.url]) ? picks[sc.url] : srcs[0];
    if (first) new Image().src = first;
  }
}

/**
 * Tries the sources in order. A tiny result (the browser's generic globe, a 16px favicon)
 * gives way to the next source when there is one.
 */
export function attachIcon(holder: HTMLElement, url: string, mode: IconMode): void {
  const all = iconSources(url, mode);
  if (!all.length) return;
  const remembered = picks[url];
  const order = remembered && all.includes(remembered) ? [remembered, ...all.filter((s) => s !== remembered)] : all;
  let i = 0;
  const img = document.createElement("img");
  img.className = "face-img";
  img.alt = "";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  const next = () => {
    i += 1;
    if (i < order.length) img.src = order[i];
    else img.remove();
  };
  img.addEventListener("load", async () => {
    const src = order[i];
    if (img.naturalWidth < 24 && i < order.length - 1) return next();
    if (isLocal(src)) {
      const glob = await globeSignature();
      if (glob && signature(img) === glob) return next();
    }
    remember(url, src);
    holder.classList.add("has-img");
    img.classList.add("loaded");
  });
  img.addEventListener("error", next);
  img.src = order[0];
  holder.append(img);
}
