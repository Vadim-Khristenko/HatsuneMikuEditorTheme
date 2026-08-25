import { readFileSync, writeFileSync } from "node:fs";

const P = JSON.parse(readFileSync("tools/jb-palette.json", "utf8"));
const strip = (h) => h.replace("#", "");

function attr(name, fg, opts = {}) {
  const inner = [];
  if (fg) inner.push(`        <option name="FOREGROUND" value="${strip(fg)}" />`);
  if (opts.bg) inner.push(`        <option name="BACKGROUND" value="${strip(opts.bg)}" />`);
  if (opts.italic) inner.push(`        <option name="FONT_TYPE" value="2" />`);
  if (opts.bold) inner.push(`        <option name="FONT_TYPE" value="1" />`);
  return `      <option name="${name}">\n        <value>\n${inner.join("\n")}\n        </value>\n      </option>`;
}

function scheme(t) {
  const colors = [
    ["CARET_COLOR", t.accent],
    ["CARET_ROW_COLOR", t.linehl],
    ["CONSOLE_BACKGROUND_KEY", t.alt],
    ["GUTTER_BACKGROUND", t.bg],
    ["LINE_NUMBERS_COLOR", t.linenr],
    ["LINE_NUMBER_ON_CARET_ROW_COLOR", t.accent],
    ["SELECTION_BACKGROUND", t.sel],
    ["SELECTION_FOREGROUND", t.fg],
    ["INDENT_GUIDE", t.border],
    ["WHITESPACES", t.faint + "66"],
    ["RIGHT_MARGIN_COLOR", t.border],
    ["DOCUMENTATION_COLOR", t.comment_doc],
    ["TEARLINE_COLOR", t.border],
    ["ADDED_LINES_COLOR", t.git_add + "26"],
    ["MODIFIED_LINES_COLOR", t.git_mod + "26"],
    ["DELETED_LINES_COLOR", t.git_del + "26"],
  ]
    .map(([n, v]) => `    <option name="${n}" value="${strip(v)}" />`)
    .join("\n");

  const attributes = [
    attr("TEXT", t.fg, { bg: t.bg }),
    attr("DEFAULT_TEXT", t.fg, { bg: t.bg }),
    attr("DEFAULT_LINE_COMMENT", t.comment, { italic: true }),
    attr("DEFAULT_BLOCK_COMMENT", t.comment, { italic: true }),
    attr("DEFAULT_DOC_COMMENT", t.comment_doc, { italic: true }),
    attr("DEFAULT_DOC_COMMENT_TAG", t.accent),
    attr("DEFAULT_KEYWORD", t.keyword),
    attr("DEFAULT_NUMBER", t.num),
    attr("DEFAULT_STRING", t.str),
    attr("DEFAULT_VALID_STRING_ESCAPE", t.escape),
    attr("DEFAULT_INVALID_STRING_ESCAPE", t.err),
    attr("DEFAULT_CONSTANT", t.num, { bold: true }),
    attr("DEFAULT_FUNCTION_DECLARATION", t.fn),
    attr("DEFAULT_FUNCTION_CALL", t.fn),
    attr("DEFAULT_INSTANCE_METHOD", t.fn),
    attr("DEFAULT_STATIC_METHOD", t.fn),
    attr("DEFAULT_CLASS_NAME", t.type),
    attr("DEFAULT_CLASS_REFERENCE", t.type),
    attr("DEFAULT_IDENTIFIER", t.fg),
    attr("DEFAULT_GLOBAL_VARIABLE", t.prop),
    attr("DEFAULT_INSTANCE_FIELD", t.prop),
    attr("DEFAULT_STATIC_FIELD", t.prop),
    attr("DEFAULT_LOCAL_VARIABLE", t.fg),
    attr("DEFAULT_PARAMETER", t.param),
    attr("DEFAULT_METADATA", t.decor, { italic: true }),
    attr("DEFAULT_OPERATION_SIGN", t.operator),
    attr("DEFAULT_PARENTHS", t.muted),
    attr("DEFAULT_BRACKETS", t.muted),
    attr("DEFAULT_BRACES", t.muted),
    attr("DEFAULT_COMMA", t.muted),
    attr("DEFAULT_DOT", t.muted),
    attr("DEFAULT_SEMICOLON", t.muted),
    attr("DEFAULT_LABEL", t.type),
    attr("DEFAULT_TEMPLATE_LANGUAGE_COLOR", null, { bg: t.elevated }),
  ].join("\n");

  return `<scheme name="${t.name}" version="142" parent_scheme="${t.parent}">
  <meta>
    <property name="created">2026-08-25</property>
  </meta>
  <colors>
${colors}
  </colors>
  <attributes>
${attributes}
  </attributes>
</scheme>
`;
}

for (const code of Object.keys(P)) {
  const t = P[code];
  // 1. Write editor scheme XML
  writeFileSync(`jetbrains/src/main/resources/themes/${t.file}.xml`, scheme(t));
  console.log(`themes/${t.file}.xml written`);
  // 2. Patch theme.json: inline object -> string reference
  const jsonPath = `jetbrains/src/main/resources/themes/${t.file}.theme.json`;
  const j = JSON.parse(readFileSync(jsonPath, "utf8"));
  j.editorScheme = `/themes/${t.file}.xml`;
  writeFileSync(jsonPath, JSON.stringify(j, null, 2) + "\n");
  console.log(`${t.file}.theme.json -> editorScheme string`);
}
console.log("done");
