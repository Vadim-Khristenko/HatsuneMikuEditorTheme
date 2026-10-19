import { assetUrl } from "./ext";

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

// The user's picture lives in IndexedDB: storage.local would need "unlimitedStorage" for big images.
const DB = "hme";
const STORE = "files";
const KEY = "wallpaper";

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

export async function loadWallpaper(): Promise<Blob | null> {
  try {
    return (await tx<Blob | undefined>("readonly", (s) => s.get(KEY))) ?? null;
  } catch {
    return null;
  }
}

export async function saveWallpaper(blob: Blob | null): Promise<void> {
  await tx("readwrite", (s) => (blob ? s.put(blob, KEY) : s.delete(KEY)));
}

let current: string | null = null;

/** Object URL of the stored picture, created once per page. */
export async function wallpaperUrl(): Promise<string | null> {
  if (current) return current;
  const blob = await loadWallpaper();
  current = blob ? URL.createObjectURL(blob) : null;
  return current;
}

export function forgetWallpaperUrl(): void {
  if (current) URL.revokeObjectURL(current);
  current = null;
}
