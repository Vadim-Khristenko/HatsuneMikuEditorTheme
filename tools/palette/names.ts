// What each look is called in each port. The four v1 looks keep their names, so nobody's chosen
// theme resets after an update; the new ones follow the same patterns.
import type { Look } from "./looks";

export interface PortNames {
  /** VS Code: themes/<vsc>.json, shown as `label`. Sublime uses the same label for its file and name. */
  vsc: string;
  label: string;
  /** Zed family file themes/<zedFile>.json with this family name. */
  zedFile: string;
  zedFamily: string;
  /** Neovim :colorscheme name. */
  nvim: string;
  /** Notepad++ file name. */
  npp: string;
  /** JetBrains theme file and name. */
  jb: string;
}

const NAMES: Record<string, PortNames> = {
  MD: { vsc: "mikuV1-dark", label: "Hatsune Miku Dark", zedFile: "mikuV1", zedFamily: "Hatsune Miku Theme", nvim: "hatsune-miku", npp: "HatsuneMikuDark", jb: "hatsuneMikuDark" },
  ML: { vsc: "mikuV1-light", label: "Hatsune Miku Light", zedFile: "mikuV1", zedFamily: "Hatsune Miku Theme", nvim: "hatsune-miku-light", npp: "HatsuneMikuLight", jb: "hatsuneMikuLight" },
  SD: { vsc: "sakuraV1-dark", label: "Hatsune Miku Sakura Dark", zedFile: "sakuraV1", zedFamily: "Hatsune Miku Sakura", nvim: "hatsune-miku-sakura", npp: "HatsuneMikuSakuraDark", jb: "hatsuneMikuSakuraDark" },
  SL: { vsc: "sakuraV1-light", label: "Hatsune Miku Sakura Light", zedFile: "sakuraV1", zedFamily: "Hatsune Miku Sakura", nvim: "hatsune-miku-sakura-light", npp: "HatsuneMikuSakuraLight", jb: "hatsuneMikuSakuraLight" },
  ND: { vsc: "snowV1-dark", label: "Snow Miku Dark", zedFile: "snowV1", zedFamily: "Snow Miku", nvim: "snow-miku", npp: "SnowMikuDark", jb: "snowMikuDark" },
  NL: { vsc: "snowV1-light", label: "Snow Miku Light", zedFile: "snowV1", zedFamily: "Snow Miku", nvim: "snow-miku-light", npp: "SnowMikuLight", jb: "snowMikuLight" },
  TD: { vsc: "tetoV1-dark", label: "Kasane Teto Dark", zedFile: "tetoV1", zedFamily: "Kasane Teto", nvim: "kasane-teto", npp: "KasaneTetoDark", jb: "kasaneTetoDark" },
  TL: { vsc: "tetoV1-light", label: "Kasane Teto Light", zedFile: "tetoV1", zedFamily: "Kasane Teto", nvim: "kasane-teto-light", npp: "KasaneTetoLight", jb: "kasaneTetoLight" },
};

export function namesOf(look: Look | string): PortNames {
  const n = NAMES[typeof look === "string" ? look : look.code];
  if (!n) throw new Error(`no port names for ${typeof look === "string" ? look : look.code}`);
  return n;
}

/** The v1 look a template id stands for, by code. */
export const TEMPLATE_CODE: Record<string, string> = { "miku-dark": "MD", "miku-light": "ML", "sakura-dark": "SD", "sakura-light": "SL" };
