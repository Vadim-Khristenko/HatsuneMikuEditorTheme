import { parseAddress } from "../address";
import { siteAccess } from "../ext";
import { type Shortcut, uid } from "../settings";
import { shortcutFace } from "./common";
import { type Ctx, hostOf, monogram } from "./ctx";
import { button, closeOnBackdrop, debounce, fill, h, icon } from "./dom";
import { I } from "./icons";
import { iconFromFile } from "./icon-image";

const MAX_SHORTCUTS = 48;

/** One modal for adding and editing: the name first, then the address, the picture beside them. */
export function shortcutDialog(ctx: Ctx, id?: string): void {
  const { t } = ctx;
  const existing = id ? ctx.s.shortcuts.find((x) => x.id === id) : undefined;
  if (id && !existing) return;
  let pic = existing?.icon;
  let cover = !!existing?.fill;

  const name = h("input", { class: "field", attrs: { id: "sc-name", type: "text", maxlength: 40, value: existing?.name ?? "", placeholder: t("shortcutNameHint"), autocomplete: "off" } });
  const url = h("input", { class: "field", attrs: { id: "sc-url", type: "text", value: existing?.url ?? "", placeholder: "github.com", inputmode: "url", autocomplete: "off", spellcheck: "false", "aria-describedby": "sc-url-err" } });
  const urlErr = h("p", { class: "field-error", attrs: { id: "sc-url-err", "aria-live": "polite" } });
  const file = h("input", { class: "sr", attrs: { type: "file", accept: "image/*", id: "sc-file", tabindex: -1 } });
  const preview = h("span", { class: "sc-preview-face" });
  const isLink = !!pic && !pic.startsWith("data:");
  const link = h("input", { class: "field", attrs: { id: "sc-pic-url", type: "text", value: isLink ? pic : "", placeholder: "https://example.com/icon.png", inputmode: "url", spellcheck: "false", "aria-describedby": "sc-pic-err" } });
  const linkRow = h("div", { class: "sc-link-row", attrs: { hidden: !isLink } },
    h("label", { class: "field-col", attrs: { for: "sc-pic-url" }, text: t("iconLinkLabel") }), link);
  const picErr = h("p", { class: "field-error", attrs: { id: "sc-pic-err", "aria-live": "polite" } });
  const linkBtn = button(t("iconLink"), { class: "btn-icon tiny", attrs: { "aria-pressed": String(isLink) } }, icon(I.link));
  const resetBtn = button(t("iconReset"), { class: "btn-icon tiny", attrs: { hidden: !pic } }, icon(I.reset));

  const paint = () => {
    const u = parseAddress(url.value);
    const label = name.value.trim() || (u ? hostOf(u) : "");
    // Without a usable address there is nothing to fetch an icon for, so only the letter shows.
    fill(preview, u || pic
      ? shortcutFace(ctx, { name: label || "?", url: u ?? "", icon: pic, fill: cover }, "sc-face")
      : h("span", { class: "sc-face" }, h("span", { class: "letter", text: label ? monogram(label) : "?" })));
    resetBtn.hidden = !pic;
  };
  const repaint = debounce(paint, 300);

  const checkUrl = (show: boolean): string | null => {
    const u = parseAddress(url.value);
    const bad = !u && (show || url.getAttribute("aria-invalid") === "true") && url.value.trim() !== "";
    url.setAttribute("aria-invalid", String(bad));
    urlErr.textContent = bad ? t("badUrl") : "";
    return u;
  };
  const checkLink = (): string | null | undefined => {
    if (linkRow.hidden || !link.value.trim()) return undefined;
    const p = parseAddress(link.value);
    link.setAttribute("aria-invalid", String(!p));
    picErr.textContent = p ? "" : t("badPicture");
    return p;
  };

  name.addEventListener("input", repaint);
  url.addEventListener("input", () => { checkUrl(false); repaint(); });
  url.addEventListener("blur", () => { checkUrl(true); });
  link.addEventListener("change", () => {
    const p = checkLink();
    if (!p) return;
    pic = p;
    cover = false;
    paint();
  });
  linkBtn.addEventListener("click", () => {
    linkRow.hidden = !linkRow.hidden;
    linkBtn.setAttribute("aria-pressed", String(!linkRow.hidden));
    if (!linkRow.hidden) link.focus();
  });
  resetBtn.addEventListener("click", () => {
    pic = undefined;
    cover = false;
    link.value = "";
    link.removeAttribute("aria-invalid");
    picErr.textContent = "";
    linkRow.hidden = true;
    linkBtn.setAttribute("aria-pressed", "false");
    paint();
  });
  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    file.value = "";
    if (!f) return;
    try {
      ({ src: pic, fill: cover } = await iconFromFile(f));
      picErr.textContent = "";
      link.value = "";
      linkRow.hidden = true;
      linkBtn.setAttribute("aria-pressed", "false");
      paint();
    } catch {
      picErr.textContent = t("badPicture");
    }
  });

  const full = !existing && ctx.s.shortcuts.length >= MAX_SHORTCUTS;
  const dialog = h("dialog", { class: "mini-dialog sc-dialog", attrs: { "aria-labelledby": "sc-title" } },
    h("form", {
      attrs: { method: "dialog", novalidate: true },
      on: {
        submit: (e: SubmitEvent) => {
          if ((e.submitter as HTMLButtonElement | null)?.value === "cancel") return;
          const u = checkUrl(true);
          if (!u || full) {
            e.preventDefault();
            if (!u) {
              if (!url.value.trim()) urlErr.textContent = t("badUrl");
              url.focus();
            }
            return;
          }
          const p = checkLink();
          if (p === null) {
            e.preventDefault();
            link.focus();
            return;
          }
          if (p) { pic = p; cover = false; }
          const data: Shortcut = { id: existing?.id ?? uid(), name: name.value.trim() || hostOf(u), url: u };
          if (pic) { data.icon = pic; if (cover) data.fill = true; }
          // In "from the site" mode a new site is asked for access right away, while the click still counts.
          const asked = ctx.s.icons === "site" && !pic && u !== existing?.url ? siteAccess.request([u]) : Promise.resolve(true);
          void asked.finally(() => ctx.store.update((s) => {
            const i = s.shortcuts.findIndex((x) => x.id === data.id);
            if (i >= 0) s.shortcuts[i] = data;
            else s.shortcuts.push(data);
          }));
        },
      },
    },
      h("h3", { attrs: { id: "sc-title" }, text: existing ? t("editShortcut") : t("addShortcut") }),
      h("div", { class: "sc-editor" },
        h("div", { class: "sc-pic" },
          h("label", { class: "sc-preview", attrs: { for: "sc-file", title: t("iconUpload"), tabindex: 0, role: "button", "aria-label": t("iconUpload") },
            on: { keydown: (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } } } },
            preview, h("span", { class: "sc-preview-badge", attrs: { "aria-hidden": "true" } }, icon(I.upload))),
          file,
          h("div", { class: "sc-pic-tools" }, linkBtn, resetBtn)),
        h("div", { class: "sc-fields" },
          h("label", { class: "field-col", attrs: { for: "sc-name" }, text: t("shortcutName") }), name,
          h("label", { class: "field-col", attrs: { for: "sc-url" }, text: t("shortcutUrl") }), url,
          urlErr)),
      linkRow,
      picErr,
      full ? h("p", { class: "field-error", text: t("shortcutsFull", { n: MAX_SHORTCUTS }) }) : null,
      h("div", { class: "row end" },
        existing
          ? button(t("remove"), { class: "btn-ghost danger sc-delete", on: { click: () => {
              ctx.store.update((s) => { s.shortcuts = s.shortcuts.filter((x) => x.id !== existing.id); });
              dialog.close();
            } } }, icon(I.trash), h("span", { text: t("remove") }))
          : null,
        h("button", { class: "btn-ghost", attrs: { type: "submit", value: "cancel", formnovalidate: true }, text: t("cancel") }),
        h("button", { class: "btn-fill", attrs: { type: "submit", disabled: full }, text: t("save") }))));
  closeOnBackdrop(dialog);
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  paint();
  dialog.showModal();
  name.focus();
}
