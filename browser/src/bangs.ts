/** One row of data/bangs.json: [name, space separated triggers, url template, flags?]. */
export type BangRow = [string, string, string, number?];

export interface Bang {
  name: string;
  triggers: string[];
  url: string;
  flags: number;
}

// Bit layout of Helium's `f` field; a missing field means the Kagi default (all but snap domain).
export const OPEN_BASE_PATH = 1;
export const OPEN_SNAP_DOMAIN = 2;
export const ENCODE_PLACEHOLDER = 4;
export const SPACE_TO_PLUS = 8;
export const DEFAULT_FLAGS = OPEN_BASE_PATH | ENCODE_PLACEHOLDER | SPACE_TO_PLUS;

const PLACEHOLDER = "{searchTerms}";

// Well known triggers float to the top of suggestions, the way Helium boosts popular domains.
const POPULAR = new Set([
  "g", "w", "yt", "gh", "ttv", "r", "a", "ddg", "b", "bd", "ya", "yandex", "wiki", "imdb", "maps", "gm", "x", "tw",
  "so", "mdn", "npm", "crates", "docs", "rs", "py", "pypi", "gi", "news", "tr", "gt", "deepl", "sp", "spotify",
  "steam", "reddit", "hn", "wa", "cgpt", "claude", "pplx", "t3", "aur", "arch", "nix", "brave", "kagi", "sx", "ebay",
  "ali", "vk", "tg", "twitch", "github", "youtube", "google", "duckduckgo", "pixiv", "nico", "bili", "zhihu",
]);

export function normalizeTrigger(t: string): string {
  return t.trim().toLowerCase().replace(/^!+|!+$/g, "");
}

export class BangIndex {
  readonly bangs: Bang[];
  private byTrigger = new Map<string, Bang>();
  private sorted: [string, Bang][];

  constructor(rows: BangRow[]) {
    this.bangs = rows.map(([name, triggers, url, flags]) => ({
      name,
      triggers: triggers.split(" ").filter(Boolean),
      url,
      flags: flags ?? DEFAULT_FLAGS,
    }));
    for (const b of this.bangs) {
      for (const t of b.triggers) {
        const key = normalizeTrigger(t);
        if (key && !this.byTrigger.has(key)) this.byTrigger.set(key, b);
      }
    }
    this.sorted = [...this.byTrigger.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  }

  get size(): number {
    return this.bangs.length;
  }

  get(trigger: string): Bang | undefined {
    return this.byTrigger.get(normalizeTrigger(trigger));
  }

  /** Bangs whose trigger starts with `prefix`, exact match first, then shorter triggers. */
  suggest(prefix: string, limit = 6): { trigger: string; bang: Bang }[] {
    const p = normalizeTrigger(prefix);
    if (!p) return [];
    let lo = 0;
    let hi = this.sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sorted[mid][0] < p) lo = mid + 1;
      else hi = mid;
    }
    const hits: { trigger: string; bang: Bang }[] = [];
    const seen = new Set<Bang>();
    for (let i = lo; i < this.sorted.length && this.sorted[i][0].startsWith(p); i++) {
      const [trigger, bang] = this.sorted[i];
      if (seen.has(bang)) continue;
      seen.add(bang);
      hits.push({ trigger, bang });
    }
    const rank = (t: string) => (t === p ? 0 : POPULAR.has(t) ? 1 : 2);
    hits.sort((a, b) => rank(a.trigger) - rank(b.trigger) || a.trigger.length - b.trigger.length || a.trigger.localeCompare(b.trigger));
    return hits.slice(0, limit);
  }
}

/** Finds `!trigger` (or `trigger!`) anywhere in the input; the rest is the query. */
export function parseBang(input: string): { trigger: string; query: string } | null {
  const tokens = input.trim().split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const m = /^!(\S+)$/.exec(tok) ?? (i === tokens.length - 1 && i > 0 ? /^([^!\s]+)!$/.exec(tok) : null);
    if (m) {
      const query = [...tokens.slice(0, i), ...tokens.slice(i + 1)].join(" ").trim();
      return { trigger: normalizeTrigger(m[1]), query };
    }
  }
  return null;
}

function encodeTerms(query: string, flags: number): string {
  let q = query;
  if (flags & ENCODE_PLACEHOLDER) q = encodeURIComponent(q);
  if (flags & SPACE_TO_PLUS) q = q.replace(/%20| /g, "+");
  return q;
}

/** Turns a bang and its query into the target URL, the way Helium does. */
export function expandBang(bang: Bang, query: string): string {
  if (!query) {
    const url = new URL(bang.url.replace(PLACEHOLDER, ""));
    if (!(bang.flags & OPEN_BASE_PATH)) return url.origin + "/";
    const base = new URL(bang.url.slice(0, bang.url.indexOf(PLACEHOLDER)).replace(/[?#].*$/, ""), url.origin);
    return base.origin + base.pathname;
  }
  return bang.url.split(PLACEHOLDER).join(encodeTerms(query, bang.flags));
}
