import type { BangIndex } from "../bangs";
import type { I18n } from "../i18n";
import type { MessageKey } from "../locales/en";
import type { Palette } from "../palette";
import type { Settings } from "../settings";
import type { Store } from "../store";

export interface Ctx {
  store: Store;
  s: Settings;
  i18n: I18n;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  p: Palette;
  wallpaper: string | null;
  edit: boolean;
  bangs(): BangIndex | null;
  /** Runs `fn` every second while this render is alive, and once right away. */
  tick(fn: (now: Date) => void): void;
  /** Cleanup hook for listeners and timers owned by the current render. */
  onDispose(fn: () => void): void;
  setEdit(v: boolean): void;
  openSettings(section?: string): void;
  addShortcut(): void;
  rerender(): void;
}

export const FONT_STACKS: Record<Settings["fonts"]["ui"], string> = {
  onest: "'Onest', system-ui, sans-serif",
  unbounded: "'Unbounded', 'Onest', system-ui, sans-serif",
  mplus: "'M PLUS Rounded 1c', 'Onest', system-ui, sans-serif",
  jetbrains: "'JetBrains Mono', ui-monospace, monospace",
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const CJK_FALLBACK = "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'Noto Sans CJK SC', sans-serif";

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function timeParts(d: Date, clock24: boolean): { hh: string; mm: string; ss: string; suffix: string } {
  const h = d.getHours();
  const hh = clock24 ? pad(h) : String(((h + 11) % 12) + 1);
  return { hh, mm: pad(d.getMinutes()), ss: pad(d.getSeconds()), suffix: clock24 ? "" : h < 12 ? "AM" : "PM" };
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtDate(d: Date, intl: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intl, opts).format(d);
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** First visible letter of a name, for monogram tiles. */
export function monogram(name: string): string {
  return [...name.trim()][0]?.toUpperCase() ?? "?";
}

/** Small deterministic hash, used to place notes on the staff. */
export function hash(s: string): number {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619);
  return x >>> 0;
}

export function dayLine(ctx: Ctx, now: Date): string {
  const lines = ctx.s.lines.length ? ctx.s.lines : ctx.t("defaultLines").split("|");
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
  return lines[day % lines.length];
}
