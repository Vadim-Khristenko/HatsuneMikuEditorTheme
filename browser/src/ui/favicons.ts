import { dataConsent, faviconUrl, siteAccess } from "../ext";
import type { IconMode, Shortcut } from "../settings";
import { bestIcon, iconLinks, manifestIcons } from "../site-icon";
import { hostOf } from "./ctx";

/** Modes that may ask DuckDuckGo or Google for an icon, and so need consent in Firefox. */
export const usesRemoteIcons = (mode: IconMode) => mode === "auto" || mode === "duckduckgo" || mode === "google";

/** A source that is not a URL yet: the site's own page is read first to find its icon. */
const SITE = "site:";

/** Where to look for a site's icon, best first. Remote services only ever see the domain. */
export function iconSources(url: string, mode: IconMode): string[] {
  if (mode === "letters") return [];
  const host = hostOf(url);
  const local = faviconUrl(url);
  // Without consent in Firefox nothing leaves the browser, and the tile keeps its letter.
  const remote = (src: string) => (dataConsent.has("browsingActivity") ? [src] : []);
  const site = siteAccess.available ? [SITE + url] : [];
  const ddg = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
  const google = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  switch (mode) {
    case "browser": return local ? [local] : [];
    case "site": return site;
    case "duckduckgo": return remote(ddg);
    case "google": return remote(google);
    // The site's own icon is used only where the user already gave access to that site.
    case "auto": return [...(local ? [local] : []), ...site, ...remote(ddg)];
  }
}

const SITE_KEY = "hme:site-icons";
const WEEK = 7 * 24 * 3600 * 1000;
let siteCache: Record<string, { src: string | null; at: number }> = {};
try {
  siteCache = JSON.parse(localStorage.getItem(SITE_KEY) ?? "{}");
} catch {
  siteCache = {};
}
const cachedSite = (url: string): string | null | undefined => {
  const hit = siteCache[url];
  return hit && Date.now() - hit.at < (hit.src ? WEEK : WEEK / 7) ? hit.src : undefined;
};

async function fetchText(url: string, accept: string): Promise<{ text: string; url: string } | null> {
  try {
    // No cookies: the site sees a visit from nobody in particular.
    const res = await fetch(url, { credentials: "omit", redirect: "follow", headers: { accept }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return { text: (await res.text()).slice(0, 600_000), url: res.url || url };
  } catch {
    return null;
  }
}

const inflight = new Map<string, Promise<string | null>>();

/** Reads the shortcut's page and picks the largest icon it declares, the manifest included. */
function resolveSite(pageUrl: string): Promise<string | null> {
  const hit = cachedSite(pageUrl);
  if (hit !== undefined) return Promise.resolve(hit);
  let job = inflight.get(pageUrl);
  if (job) return job;
  job = (async () => {
    if (!(await siteAccess.has(pageUrl))) return null;
    const page = await fetchText(pageUrl, "text/html");
    if (!page) return null;
    const { icons, manifest } = iconLinks(page.text, page.url);
    if (manifest && !icons.some((i) => i.size >= 128)) {
      const m = await fetchText(manifest, "application/manifest+json, application/json");
      try {
        if (m) icons.push(...manifestIcons(JSON.parse(m.text), m.url));
      } catch {
        /* not JSON */
      }
    }
    const src = bestIcon(icons) ?? new URL("/favicon.ico", page.url).href;
    siteCache[pageUrl] = { src, at: Date.now() };
    try {
      localStorage.setItem(SITE_KEY, JSON.stringify(siteCache));
    } catch {
      /* storage blocked */
    }
    return src;
  })().finally(() => inflight.delete(pageUrl));
  inflight.set(pageUrl, job);
  return job;
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

const isLocal = (src: string) => !/^https?:/.test(src) && !src.startsWith(SITE);

/** Starts loading every icon right away, so tiles show them without a flash of letters. */
export function preloadIcons(shortcuts: Shortcut[], mode: IconMode): void {
  for (const sc of shortcuts) {
    if (sc.icon) {
      new Image().src = sc.icon;
      continue;
    }
    const srcs = iconSources(sc.url, mode);
    const first = picks[sc.url] && srcs.includes(picks[sc.url]) ? picks[sc.url] : srcs[0];
    const src = first?.startsWith(SITE) ? cachedSite(sc.url) : first;
    if (src) new Image().src = src;
  }
}

/** The user's own picture for a tile. When it does not load, the letter stays. */
export function attachCustomIcon(holder: HTMLElement, src: string, fill: boolean): void {
  const img = document.createElement("img");
  img.className = "face-img";
  img.alt = "";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.addEventListener("load", () => {
    holder.classList.add("has-img", "own-img");
    holder.classList.toggle("img-fill", fill);
    img.classList.add("loaded");
  });
  img.addEventListener("error", () => img.remove());
  img.src = src;
  holder.append(img);
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
  const load = () => {
    const src = order[i];
    if (!src.startsWith(SITE)) {
      img.src = src;
      return;
    }
    void resolveSite(url).then((found) => {
      if (found) img.src = found;
      else next();
    });
  };
  const next = () => {
    i += 1;
    if (i < order.length) load();
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
  load();
  holder.append(img);
}
