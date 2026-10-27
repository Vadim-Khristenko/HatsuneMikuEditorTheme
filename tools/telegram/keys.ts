import snapshot from "./keys.json";

/** A key of Telegram for Android: its default as #aarrggbb, and the key it borrows from when a theme leaves it out. */
export interface AndroidKey {
  default?: string;
  fallback?: string;
  /** Value in Telegram's own night.attheme, #aarrggbb. */
  night?: string;
}

/** A key of Telegram Desktop: a #rrggbb[aa] default or a reference to an earlier key, plus an optional fallback key. */
export interface DesktopKey {
  default?: string;
  ref?: string;
  fallback?: string;
  note?: string;
  /** Value in Telegram Desktop's own night theme: #rrggbb[aa] or another key. */
  night?: string;
}

export interface KeySnapshot {
  android: { source: string; files: string[]; keys: Record<string, AndroidKey> };
  desktop: { source: string; night: string; keys: Record<string, DesktopKey> };
}

export const KEYS = snapshot as KeySnapshot;
