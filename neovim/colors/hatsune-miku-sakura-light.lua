-- Hatsune Miku Sakura Light — Neovim colorscheme
-- Part of HatsuneMikuEditorTheme. Generated from VS Code canonical palette.
vim.cmd("hi clear")
if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
vim.o.termguicolors = true
vim.o.background = "light"
vim.g.colors_name = "hatsune-miku-sakura-light"

local c = {
  bg = "#fff5f8",
  alt = "#fdeaf0",
  surface = "#fff5f8",
  elevated = "#ffffff",
  linehl = "#fce8f0",
  border = "#f0d0dc",
  fg = "#3a1428",
  muted = "#c088a0",
  faint = "#ddb0c0",
  linenr = "#ddb0c0",
  accent = "#cc4477",
  hover = "#ee6699",
  comment = "#c088a0",
  comment_doc = "#a87090",
  keyword = "#cc2244",
  operator = "#2244aa",
  fn = "#227766",
  str = "#996600",
  escape = "#ee3366",
  num = "#aa2255",
  type = "#2244aa",
  prop = "#7a2244",
  param = "#6a3020",
  builtin = "#ee3366",
  attr = "#cc4477",
  decor = "#996600",
  err = "#cc2244",
  warn = "#996600",
  info = "#2244aa",
  hint = "#c088a0",
  git_add = "#227766",
  git_mod = "#2244aa",
  git_del = "#cc2244",
  invisible = "#f0d0dc",
}
local hi = vim.api.nvim_set_hl
local H = function(g, o) hi(0, g, o) end
local L = function(to, from) hi(0, to, { link = from }) end

-- Base UI
H("Normal", { fg = c.fg, bg = c.bg })
H("NormalFloat", { fg = c.fg, bg = c.elevated })
H("FloatBorder", { fg = c.border, bg = c.elevated })
H("FloatTitle", { fg = c.accent, bg = c.elevated, bold = true })
H("CursorLine", { bg = c.linehl })
H("CursorColumn", { bg = c.linehl })
H("CursorLineNr", { fg = c.accent, bold = true })
H("LineNr", { fg = c.linenr })
H("SignColumn", { bg = c.bg })
H("VertSplit", { fg = c.border })
H("WinSeparator", { fg = c.border })
H("Visual", { bg = c.accent .. "22" })
H("Search", { bg = c.accent .. "44" })
H("IncSearch", { fg = c.bg, bg = c.hover })
H("CurSearch", { fg = c.bg, bg = c.hover })
H("Substitute", { fg = c.bg, bg = c.keyword })
H("Pmenu", { fg = c.fg, bg = c.elevated })
H("PmenuSel", { fg = c.accent, bg = c.surface })
H("PmenuSbar", { bg = c.elevated })
H("PmenuThumb", { bg = c.border })
H("WildMenu", { fg = c.accent, bg = c.surface })
H("Folded", { fg = c.muted, bg = c.surface })
H("FoldColumn", { fg = c.linenr, bg = c.bg })
H("MatchParen", { fg = c.accent, bg = c.accent .. "22", bold = true })
H("StatusLine", { fg = c.fg, bg = c.surface })
H("StatusLineNC", { fg = c.muted, bg = c.surface })
H("TabLine", { fg = c.muted, bg = c.alt })
H("TabLineSel", { fg = c.fg, bg = c.surface })
H("TabLineFill", { bg = c.alt })
H("Title", { fg = c.accent, bold = true })
H("Directory", { fg = c.accent })
H("EndOfBuffer", { fg = c.bg })
H("NonText", { fg = c.faint })
H("Whitespace", { fg = c.invisible })
H("Conceal", { fg = c.muted })
H("ColorColumn", { bg = c.linehl })
H("ErrorMsg", { fg = c.err })
H("WarningMsg", { fg = c.warn })
H("ModeMsg", { fg = c.muted })
H("MoreMsg", { fg = c.accent })
H("Question", { fg = c.accent })
H("SpecialKey", { fg = c.faint })
H("Underlined", { underline = true })
H("Ignore", { fg = c.faint })
H("Todo", { fg = c.keyword, bold = true })
H("Error", { fg = c.err })
H("QuickFixLine", { bg = c.surface })

H("DiffAdd", { bg = c.git_add .. "0d" })
H("DiffChange", { bg = c.git_mod .. "0d" })
H("DiffDelete", { bg = c.git_del .. "0d" })
H("DiffText", { fg = c.bg, bg = c.git_mod })
H("Added", { fg = c.git_add })
H("Removed", { fg = c.git_del })
H("Changed", { fg = c.git_mod })
H("GitSignsAdd", { fg = c.git_add })
H("GitSignsChange", { fg = c.git_mod })
H("GitSignsDelete", { fg = c.git_del })

H("SpellBad", { fg = c.err, undercurl = true, sp = c.err })
H("SpellCap", { fg = c.info, undercurl = true, sp = c.info })
H("SpellRare", { fg = c.num, undercurl = true, sp = c.num })
H("SpellLocal", { fg = c.git_add, undercurl = true, sp = c.git_add })

H("Comment", { fg = c.comment, italic = true })
H("SpecialComment", { fg = c.comment_doc, italic = true })
H("Constant", { fg = c.num })
H("String", { fg = c.str })
H("Character", { fg = c.str })
H("Number", { fg = c.num })
H("Boolean", { fg = c.num, bold = true })
H("Float", { fg = c.num })
H("Identifier", { fg = c.fg })
H("Function", { fg = c.fn })
H("Statement", { fg = c.keyword })
H("Conditional", { fg = c.keyword })
H("Repeat", { fg = c.keyword })
H("Label", { fg = c.type })
H("Operator", { fg = c.operator })
H("Keyword", { fg = c.keyword })
H("Exception", { fg = c.keyword, bold = true })
H("PreProc", { fg = c.decor })
H("Include", { fg = c.decor })
H("Define", { fg = c.decor })
H("Macro", { fg = c.decor })
H("PreCondit", { fg = c.decor })
H("Type", { fg = c.type })
H("StorageClass", { fg = c.keyword })
H("Structure", { fg = c.keyword })
H("Typedef", { fg = c.type, italic = true })
H("Special", { fg = c.escape })
H("SpecialChar", { fg = c.escape })
H("Tag", { fg = c.keyword })
H("Delimiter", { fg = c.muted })

L("@comment", "Comment")
H("@comment.documentation", { fg = c.comment_doc, italic = true })
L("@keyword", "Statement")
H("@keyword.function", { fg = c.keyword, italic = true })
L("@keyword.operator", "Operator")
H("@keyword.return", { fg = c.keyword, bold = true })
L("@operator", "Operator")
L("@string", "String")
L("@string.escape", "SpecialChar")
H("@string.regex", { fg = c.hover })
L("@number", "Number")
L("@boolean", "Boolean")
L("@constant", "Number")
H("@constant.builtin", { fg = c.builtin, italic = true })
L("@function", "Function")
H("@function.builtin", { fg = c.hover, italic = true })
L("@function.call", "Function")
L("@method", "Function")
H("@constructor", { fg = c.accent })
L("@type", "Type")
H("@type.builtin", { fg = c.type, italic = true })
H("@property", { fg = c.prop })
L("@field", "@property")
H("@parameter", { fg = c.param })
L("@variable", "Identifier")
H("@variable.builtin", { fg = c.builtin, italic = true })
L("@label", "Label")
L("@tag", "Tag")
H("@tag.attribute", { fg = c.attr })
L("@punctuation.bracket", "Delimiter")
L("@punctuation.delimiter", "Delimiter")
H("@punctuation.special", { fg = c.operator })
L("@text.literal", "String")
H("@markup.heading", { fg = c.accent, bold = true })
H("Italic", { italic = true })
H("Bold", { bold = true })
H("@markup.link", { fg = c.accent, underline = true })
L("@markup.list", "Directory")
L("@diff.plus", "Added")
L("@diff.minus", "Removed")
L("@diff.delta", "Changed")

H("DiagnosticError", { fg = c.err })
H("DiagnosticWarn", { fg = c.warn })
H("DiagnosticInfo", { fg = c.info })
H("DiagnosticHint", { fg = c.hint })
H("DiagnosticOk", { fg = c.git_add })
H("DiagnosticUnderlineError", { undercurl = true, sp = c.err })
H("DiagnosticUnderlineWarn", { undercurl = true, sp = c.warn })
H("DiagnosticUnderlineInfo", { undercurl = true, sp = c.info })
H("DiagnosticUnderlineHint", { undercurl = true, sp = c.hint })
L("LspDiagnosticsDefaultError", "DiagnosticError")
L("LspDiagnosticsDefaultWarning", "DiagnosticWarn")
L("LspDiagnosticsDefaultInformation", "DiagnosticInfo")
L("LspDiagnosticsDefaultHint", "DiagnosticHint")

L("@lsp.type.namespace", "Type")
L("@lsp.type.type", "Type")
L("@lsp.type.class", "Type")
L("@lsp.type.enum", "Number")
L("@lsp.type.interface", "Type")
L("@lsp.type.struct", "Type")
L("@lsp.type.parameter", "@parameter")
L("@lsp.type.variable", "Identifier")
L("@lsp.type.property", "@property")
L("@lsp.type.macro", "PreProc")
L("@lsp.type.function", "Function")
L("@lsp.type.method", "Function")
L("@lsp.type.keyword", "Keyword")
L("@lsp.type.comment", "Comment")
L("@lsp.type.string", "String")
L("@lsp.type.number", "Number")
L("@lsp.type.operator", "Operator")

-- Terminal ANSI
vim.g["terminal_color_0"] = "#3a1428"
vim.g["terminal_color_1"] = "#cc2244"
vim.g["terminal_color_2"] = "#227766"
vim.g["terminal_color_3"] = "#996600"
vim.g["terminal_color_4"] = "#2244aa"
vim.g["terminal_color_5"] = "#cc4477"
vim.g["terminal_color_6"] = "#226655"
vim.g["terminal_color_7"] = "#fdeaf0"
vim.g["terminal_color_8"] = "#7a4460"
vim.g["terminal_color_9"] = "#ee3366"
vim.g["terminal_color_10"] = "#339988"
vim.g["terminal_color_11"] = "#bb8800"
vim.g["terminal_color_12"] = "#4466cc"
vim.g["terminal_color_13"] = "#ee6699"
vim.g["terminal_color_14"] = "#448877"
vim.g["terminal_color_15"] = "#ffffff"
