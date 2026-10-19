import { expandBang, parseBang, type Bang, type BangIndex } from "./bangs";
import type { EngineId } from "./settings";

export const ENGINE_URLS: Record<Exclude<EngineId, "browser" | "custom">, { name: string; url: string }> = {
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
  google: { name: "Google", url: "https://www.google.com/search?q=%s" },
  bing: { name: "Bing", url: "https://www.bing.com/search?q=%s" },
  yandex: { name: "Yandex", url: "https://ya.ru/search/?text=%s" },
  brave: { name: "Brave Search", url: "https://search.brave.com/search?q=%s" },
  startpage: { name: "Startpage", url: "https://www.startpage.com/do/search?q=%s" },
  kagi: { name: "Kagi", url: "https://kagi.com/search?q=%s" },
  baidu: { name: "Baidu", url: "https://www.baidu.com/s?wd=%s" },
};

export type Action =
  | { kind: "url"; url: string }
  | { kind: "bang"; url: string; bang: Bang }
  | { kind: "search"; query: string }
  | { kind: "none" };

const SCHEME_RE = /^(https?|ftp|file|about|chrome|edge|brave|vivaldi|moz-extension|chrome-extension):/i;
const HOST_RE = /^(localhost|(\d{1,3}\.){3}\d{1,3}|\[[0-9a-f:]+\]|([a-z0-9-]+\.)+[a-z][a-z0-9-]{1,62})(:\d{1,5})?([/?#].*)?$/i;

export function looksLikeUrl(input: string): boolean {
  const s = input.trim();
  if (!s || /\s/.test(s)) return false;
  if (SCHEME_RE.test(s)) return true;
  return HOST_RE.test(s);
}

export function toUrl(input: string): string {
  const s = input.trim();
  return SCHEME_RE.test(s) ? s : `${/^(localhost|\d)/.test(s) ? "http" : "https"}://${s}`;
}

/** Decides what Enter in the search box does. `bangs` may be null while the list is still loading. */
export function resolve(input: string, bangs: BangIndex | null, useBangs: boolean): Action {
  const s = input.trim();
  if (!s) return { kind: "none" };
  if (useBangs && bangs) {
    const parsed = parseBang(s);
    const bang = parsed && bangs.get(parsed.trigger);
    if (parsed && bang) return { kind: "bang", url: expandBang(bang, parsed.query), bang };
  }
  if (looksLikeUrl(s)) return { kind: "url", url: toUrl(s) };
  return { kind: "search", query: s };
}

export function engineUrl(engine: EngineId, custom: string, query: string): string | null {
  if (engine === "browser") return null;
  const template = engine === "custom" ? custom : ENGINE_URLS[engine].url;
  if (!template || !/%s|\{searchTerms\}/.test(template)) return ENGINE_URLS.duckduckgo.url.replace("%s", encodeURIComponent(query));
  return template.replace(/%s|\{searchTerms\}/g, encodeURIComponent(query));
}
