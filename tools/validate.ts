import { spawnSync } from "node:child_process";
console.log("validate: running check-themes.mjs...");
const r = spawnSync("node", ["tools/check-themes.mjs"], { stdio: "inherit", cwd: process.cwd() });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log("validate: checking package scripts dry-run...");
for (const pkg of ["zed","jetbrains","neovim","sublime","notepadpp"]) {
  const res = spawnSync("bun", ["tools/package.ts", pkg], { stdio: "inherit" });
  if (res.status !== 0) { console.error(`package:${pkg} failed`); process.exit(1); }
}
console.log("validate: OK");
