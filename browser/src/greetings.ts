import type { Lang } from "./i18n";
import { PHRASES, type Phrases } from "./locales/phrases";

export type Occasion = "birthday" | "newYear" | "mikuBirthday" | "mikuDay" | "halloween";

const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Birthday on Feb 29 is celebrated on Feb 28 in common years. */
function birthdayToday(birthday: string, now: Date): boolean {
  if (!birthday) return false;
  const want = birthday.slice(5);
  if (want === md(now)) return true;
  const leap = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
  return want === "02-29" && !leap && md(now) === "02-28";
}

export function occasionOf(now: Date, birthday: string): Occasion | null {
  if (birthdayToday(birthday, now)) return "birthday";
  const d = md(now);
  if (d === "12-31" || d === "01-01" || d === "01-02") return "newYear";
  if (d === "08-31") return "mikuBirthday";
  if (d === "03-09") return "mikuDay";
  if (d === "10-31") return "halloween";
  return null;
}

export function ageOn(birthday: string, now: Date): number | null {
  const year = Number(birthday.slice(0, 4));
  if (!year || year < 1900) return null;
  const age = now.getFullYear() - year;
  return age > 0 && age < 130 ? age : null;
}

/** Days until the next birthday, when it is 1 to 7 days away. */
export function daysUntilBirthday(birthday: string, now: Date): number | null {
  if (!birthday) return null;
  const [, m, d] = birthday.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), m - 1, d);
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  return days >= 1 && days <= 7 ? days : null;
}

function slot(p: Phrases, now: Date, roll: number): string[] {
  const h = now.getHours();
  const dow = now.getDay();
  if (h >= 1 && h < 5) return p.late;
  // A weekday line now and then, so Mondays and Fridays feel different.
  if (roll < 0.4 && h >= 6 && h < 21) {
    if (dow === 1) return p.monday;
    if (dow === 5) return p.friday;
    if (dow === 0 || dow === 6) return p.weekend;
  }
  if (h >= 5 && h < 12) return p.morning;
  if (h >= 12 && h < 18) return p.day;
  if (h >= 18 && h < 23) return p.evening;
  return p.night;
}

function fillName(template: string, name: string, sep: string, age: number | null): string {
  return template.replace("{name}", name ? `${sep}${name}` : "").replace("{age}", age === null ? "" : String(age));
}

export interface Greeting { text: string; occasion: Occasion | null; soon: string | null }

/**
 * `seed` is drawn once per page, so the greeting stays the same while the tab is open
 * and changes with the next new tab.
 */
export function greet(lang: Lang, now: Date, opts: { name: string; birthday: string; seed: number; sep: string; intl: string }): Greeting {
  const p = PHRASES[lang];
  const name = opts.name.trim();
  const occasion = occasionOf(now, opts.birthday);
  const age = occasion === "birthday" ? ageOn(opts.birthday, now) : null;
  let pool: string[];
  if (occasion === "birthday") pool = age !== null ? [...p.birthday, ...p.birthdayAge] : p.birthday;
  else if (occasion) pool = p[occasion];
  else pool = slot(p, now, (opts.seed * 7.31) % 1);
  const text = fillName(pool[Math.floor(opts.seed * pool.length) % pool.length], name, opts.sep, age);
  const days = occasion === "birthday" ? null : daysUntilBirthday(opts.birthday, now);
  const soon = days === null ? null : p.soon.replace("{when}", new Intl.RelativeTimeFormat(opts.intl, { numeric: "auto" }).format(days, "day"));
  return { text, occasion, soon };
}

export function tagline(lang: Lang, kind: "stage" | "zen", seed: number): string {
  const pool = PHRASES[lang][kind];
  return pool[Math.floor(((seed * 13.7) % 1) * pool.length)];
}
