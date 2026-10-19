import { en, type MessageKey, type Messages } from "./locales/en";
import { ru } from "./locales/ru";
import { zh } from "./locales/zh";
import type { LocaleSetting } from "./settings";

export type Lang = "en" | "ru" | "zh";
export const MESSAGES: Record<Lang, Messages> = { en, ru, zh };
export const LANG_NAMES: Record<Lang, string> = { en: "English", ru: "Русский", zh: "中文" };
const INTL: Record<Lang, string> = { en: "en-US", ru: "ru-RU", zh: "zh-CN" };

export function detectLang(uiLanguage: string): Lang {
  const l = uiLanguage.toLowerCase();
  if (l.startsWith("ru") || l.startsWith("uk") || l.startsWith("be")) return "ru";
  if (l.startsWith("zh")) return "zh";
  return "en";
}

export function resolveLang(setting: LocaleSetting, uiLanguage: string): Lang {
  return setting === "auto" ? detectLang(uiLanguage) : setting;
}

export interface I18n {
  lang: Lang;
  intl: string;
  t(key: MessageKey, vars?: Record<string, string | number>): string;
  /** Monday first everywhere except English. */
  weekStart: 0 | 1;
}

export function makeI18n(lang: Lang): I18n {
  const dict = MESSAGES[lang];
  return {
    lang,
    intl: INTL[lang],
    weekStart: lang === "en" ? 0 : 1,
    t(key, vars) {
      const raw = dict[key] ?? en[key] ?? key;
      return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : raw;
    },
  };
}
