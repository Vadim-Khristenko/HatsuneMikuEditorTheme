import { assetUrl, storage } from "./ext";
import { uid, type Playlist, type Rotation } from "./settings";

let bundled: Promise<string[]> | null = null;

/** Wallpapers shipped inside the extension (browser/wallpapers, listed by the build in wallpapers.json). */
export function bundledList(): Promise<string[]> {
  bundled ??= fetch(assetUrl("wallpapers.json")).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  return bundled;
}

/** The picture named after the theme (miku-dark.webp), else the first one. */
export async function bundledUrl(themeId: string): Promise<string | null> {
  const list = await bundledList();
  const file = list.find((f) => f.replace(/\.[a-z0-9]+$/i, "") === themeId) ?? list[0];
  return file ? assetUrl(`wallpapers/${file}`) : null;
}

// Uploaded pictures live in IndexedDB: storage.local would need "unlimitedStorage" for big images.
const DB = "hme";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

/** Stores a picture and returns its playlist item, `img:<key>`. */
export async function saveImage(blob: Blob): Promise<string> {
  const key = uid();
  await tx("readwrite", (s) => s.put(blob, key));
  return `img:${key}`;
}

export async function deleteImage(item: string): Promise<void> {
  if (!item.startsWith("img:")) return;
  forget(item);
  await tx("readwrite", (s) => s.delete(item.slice(4))).catch(() => undefined);
}

export async function clearImages(): Promise<void> {
  for (const item of [...urls.keys()]) forget(item);
  await tx("readwrite", (s) => s.clear()).catch(() => undefined);
}

const urls = new Map<string, Promise<string | null>>();

function forget(item: string): void {
  void urls.get(item)?.then((u) => { if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
  urls.delete(item);
}

/** URL for a playlist item; object URLs are created once per page. */
export function itemUrl(item: string): Promise<string | null> {
  let u = urls.get(item);
  if (!u) {
    u = item.startsWith("set:")
      ? Promise.resolve(assetUrl(`wallpapers/${item.slice(4)}`))
      : tx<Blob | undefined>("readonly", (s) => s.get(item.slice(4))).then((b) => (b ? URL.createObjectURL(b) : null)).catch(() => null);
    urls.set(item, u);
  }
  return u;
}

export const ROTATION_MS: Record<Rotation, number> = { tab: 0, "5m": 300_000, "15m": 900_000, "1h": 3_600_000, "1d": 86_400_000 };

type RotState = Record<string, { i: number; at: number }>;
const ROT_KEY = "wallRotation";

export type Step = "open" | "timer" | "next" | "prev";

/** Pure part of the carousel: which index comes next. `rand` is injectable for tests. */
export function nextIndex(pl: Playlist, cur: { i: number; at: number } | undefined, step: Step, now: number, rand: () => number = Math.random): { i: number; at: number; changed: boolean } {
  const n = pl.items.length;
  const pickOther = (i: number) => (n < 2 ? 0 : (i + 1 + Math.floor(rand() * (n - 1))) % n);
  if (!cur) return { i: pl.shuffle ? Math.floor(rand() * n) : 0, at: now, changed: true };
  const i = Math.min(cur.i, n - 1);
  const elapsed = now - cur.at >= ROTATION_MS[pl.every];
  const due = step === "next" || (step === "open" && (pl.every === "tab" || elapsed)) || (step === "timer" && pl.every !== "tab" && elapsed);
  if (step === "prev") return { i: (i - 1 + n) % n, at: now, changed: n > 1 };
  if (!due) return { i, at: cur.at, changed: i !== cur.i };
  return { i: pl.shuffle ? pickOther(i) : (i + 1) % n, at: now, changed: n > 1 };
}

/** Moves the playlist's carousel and returns the item to show. */
export async function rotate(pl: Playlist, step: Step): Promise<string | null> {
  if (!pl.items.length) return null;
  const state = ((await storage.get(ROT_KEY)) as RotState | undefined) ?? {};
  const res = nextIndex(pl, state[pl.id], step, Date.now());
  state[pl.id] = { i: res.i, at: res.at };
  await storage.set(ROT_KEY, state);
  return pl.items[res.i];
}

/**
 * The wallpaper layer sits outside the app root so re-renders never flash it.
 * Two stacked layers cross-fade when the picture changes.
 */
export class WallLayer {
  private el: HTMLElement;
  private layers: HTMLElement[];
  private current: string | null = null;
  private front = 0;

  constructor() {
    this.layers = [document.createElement("div"), document.createElement("div")];
    for (const l of this.layers) l.className = "wall-img";
    this.el = document.createElement("div");
    this.el.className = "wall";
    this.el.setAttribute("aria-hidden", "true");
    this.el.append(...this.layers);
    document.body.prepend(this.el);
  }

  get url(): string | null {
    return this.current;
  }

  show(url: string | null): void {
    if (url === this.current) return;
    this.current = url;
    document.body.classList.toggle("has-image", !!url);
    if (!url) {
      for (const l of this.layers) l.classList.remove("on");
      return;
    }
    const back = this.layers[1 - this.front];
    const img = new Image();
    img.onload = img.onerror = () => {
      if (this.current !== url) return;
      back.style.backgroundImage = `url("${url}")`;
      back.classList.add("on");
      this.layers[this.front].classList.remove("on");
      this.front = 1 - this.front;
    };
    img.src = url;
  }
}
