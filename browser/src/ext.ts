// Thin wrapper over the WebExtension APIs, so the UI also runs as a plain page (dev preview, tests).
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;
declare const browser: any;

const api: any = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : undefined;
export const isExtension = !!api?.runtime?.id;
export const isFirefox = typeof browser !== "undefined" && !!browser?.runtime?.getBrowserInfo;

export const storage = {
  async get(key: string): Promise<unknown> {
    if (api?.storage?.local) {
      const res = await api.storage.local.get(key);
      return res?.[key];
    }
    try {
      const raw = localStorage.getItem(`hme:${key}`);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  },
  async set(key: string, value: unknown): Promise<void> {
    if (api?.storage?.local) {
      await api.storage.local.set({ [key]: value });
      return;
    }
    try {
      localStorage.setItem(`hme:${key}`, JSON.stringify(value));
    } catch {
      /* private mode */
    }
  },
  onChanged(fn: (key: string) => void): void {
    api?.storage?.onChanged?.addListener((changes: Record<string, unknown>, area: string) => {
      if (area === "local") for (const k of Object.keys(changes)) fn(k);
    });
  },
};

export function uiLanguage(): string {
  return api?.i18n?.getUILanguage?.() ?? navigator.language ?? "en";
}

export function assetUrl(path: string): string {
  return api?.runtime?.getURL ? api.runtime.getURL(path) : path;
}

export const canBrowserSearch = !!(api?.search?.query || api?.search?.search);

/** Searches with the engine the user picked in the browser itself. */
export async function browserSearch(text: string, newTab: boolean): Promise<boolean> {
  if (api?.search?.query) {
    await api.search.query({ text, disposition: newTab ? "NEW_TAB" : "CURRENT_TAB" });
    return true;
  }
  if (api?.search?.search) {
    await api.search.search({ query: text, disposition: newTab ? "NEW_TAB" : "CURRENT_TAB" });
    return true;
  }
  return false;
}

export function faviconUrl(pageUrl: string): string | null {
  if (isFirefox || !api?.runtime?.getURL || !isExtension) return null;
  const u = new URL(api.runtime.getURL("/_favicon/"));
  u.searchParams.set("pageUrl", pageUrl);
  u.searchParams.set("size", "64");
  return u.toString();
}

export interface AudibleTab { id: number; windowId: number; title: string | null; muted: boolean; favIconUrl: string | null }

export const tabs = {
  available: !!api?.tabs?.query,
  async audible(): Promise<AudibleTab[]> {
    if (!api?.tabs?.query) return [];
    const list: any[] = await api.tabs.query({ audible: true });
    return (list ?? []).map((t) => ({
      id: t.id,
      windowId: t.windowId,
      title: t.title ?? null,
      muted: !!t.mutedInfo?.muted,
      favIconUrl: t.favIconUrl ?? null,
    }));
  },
  async focus(t: AudibleTab): Promise<void> {
    await api.tabs.update(t.id, { active: true });
    if (api.windows?.update) await api.windows.update(t.windowId, { focused: true });
  },
  async mute(t: AudibleTab, muted: boolean): Promise<void> {
    await api.tabs.update(t.id, { muted });
  },
  /** One browser listener for the whole page; widgets come and go on every render. */
  onChange(fn: () => void): () => void {
    if (!tabHooked && api?.tabs?.onUpdated) {
      tabHooked = true;
      api.tabs.onUpdated.addListener((_id: number, info: any) => {
        if ("audible" in info || "mutedInfo" in info || "title" in info) for (const f of tabListeners) f();
      });
      api.tabs.onRemoved?.addListener(() => { for (const f of tabListeners) f(); });
    }
    tabListeners.add(fn);
    return () => tabListeners.delete(fn);
  },
};

const tabListeners = new Set<() => void>();
let tabHooked = false;

export const permissions = {
  async has(p: string): Promise<boolean> {
    if (!api?.permissions?.contains) return false;
    return api.permissions.contains({ permissions: [p] });
  },
  async request(p: string): Promise<boolean> {
    if (!api?.permissions?.request) return false;
    return api.permissions.request({ permissions: [p] });
  },
};

export type GenericFamily = "standard" | "sansserif" | "serif" | "fixed";

export const fontSettings = {
  available: !!api?.fontSettings?.getFontList,
  async list(): Promise<{ fontId: string; displayName: string }[]> {
    if (!api?.fontSettings?.getFontList) return [];
    return api.fontSettings.getFontList();
  },
  async get(family: GenericFamily): Promise<{ fontId: string; levelOfControl: string }> {
    return api.fontSettings.getFont({ genericFamily: family });
  },
  async set(family: GenericFamily, fontId: string | null): Promise<void> {
    if (fontId === null) await api.fontSettings.clearFont({ genericFamily: family });
    else await api.fontSettings.setFont({ genericFamily: family, fontId });
  },
};

export const browserTheme = {
  available: !!api?.theme?.update,
  async update(theme: unknown): Promise<void> {
    if (api?.theme?.update) await api.theme.update(theme);
  },
  async reset(): Promise<void> {
    if (api?.theme?.reset) await api.theme.reset();
  },
};
