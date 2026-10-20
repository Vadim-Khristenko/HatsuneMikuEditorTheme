// Finds the icon a site declares for itself: <link rel="icon">, apple-touch-icon and the web app manifest.
// Plain string work, no DOM, so it runs in tests and in any page.

export interface IconRef {
  href: string;
  /** Largest side in pixels; 0 when the page does not say. An SVG counts as 512. */
  size: number;
}

const ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", "#39": "'", "#x2F": "/", "#x2f": "/", "#47": "/" };
const decode = (s: string) => s.replace(/&(amp|quot|apos|lt|gt|#39|#x2F|#x2f|#47);/g, (_, e: string) => ENTITIES[e]);

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function resolve(href: string, base: string): string | null {
  try {
    const u = new URL(href.trim(), base);
    return /^https?:$/.test(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

/** "16x16 32x32", "any", "180x180" to the largest side; SVG and "any" read as 512. */
export function sizeOf(sizes: string | null, href: string, type: string | null): number {
  if (type?.includes("svg") || /\.svg(\?|#|$)/i.test(href) || sizes?.toLowerCase().includes("any")) return 512;
  let best = 0;
  for (const m of (sizes ?? "").matchAll(/(\d+)\s*x\s*(\d+)/gi)) best = Math.max(best, Number(m[1]), Number(m[2]));
  return best;
}

/** Every icon link in the head, plus the manifest address if there is one. */
export function iconLinks(html: string, base: string): { icons: IconRef[]; manifest: string | null } {
  const end = html.search(/<\/head\s*>/i);
  const head = end > 0 ? html.slice(0, end) : html.slice(0, 300_000);
  const icons: IconRef[] = [];
  let manifest: string | null = null;
  for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    const raw = attr(tag, "href");
    if (!raw) continue;
    const href = resolve(raw, base);
    if (!href) continue;
    if (rel.includes("manifest")) {
      manifest ??= href;
      continue;
    }
    // mask-icon is a one-color silhouette for Safari pins, not a picture.
    const apple = rel.some((r) => r.startsWith("apple-touch-icon"));
    if (!apple && !rel.includes("icon")) continue;
    const size = sizeOf(attr(tag, "sizes"), href, attr(tag, "type"));
    icons.push({ href, size: size || (apple ? 180 : 0) });
  }
  return { icons, manifest };
}

/** Icons from a web app manifest; their src is relative to the manifest itself. */
export function manifestIcons(json: unknown, base: string): IconRef[] {
  const list = (json as { icons?: unknown })?.icons;
  if (!Array.isArray(list)) return [];
  const out: IconRef[] = [];
  for (const it of list as { src?: unknown; sizes?: unknown; type?: unknown; purpose?: unknown }[]) {
    if (typeof it?.src !== "string") continue;
    // A maskable icon is drawn with a safe zone and looks shrunk inside a tile.
    if (typeof it.purpose === "string" && !it.purpose.split(/\s+/).includes("any") && it.purpose.includes("maskable")) continue;
    const href = resolve(it.src, base);
    if (href) out.push({ href, size: sizeOf(typeof it.sizes === "string" ? it.sizes : null, href, typeof it.type === "string" ? it.type : null) });
  }
  return out;
}

/** The largest icon wins; among icons of unknown size, the first one the page lists. */
export function bestIcon(icons: IconRef[]): string | null {
  if (!icons.length) return null;
  return [...icons].sort((a, b) => b.size - a.size)[0].href;
}
