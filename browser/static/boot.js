// Paints the last used background before the module loads, so a new tab never flashes white.
try {
  var b = JSON.parse(localStorage.getItem("hme:boot") || "null");
  if (b) {
    document.documentElement.style.setProperty("--bg", b.bg);
    document.documentElement.style.setProperty("--fg", b.fg);
    document.documentElement.style.colorScheme = b.dark ? "dark" : "light";
  }
} catch (e) {}
