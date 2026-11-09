import { execFileSync } from "node:child_process";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const env = { ...process.env, DOCS_BASE: process.env.DOCS_BASE ?? "/world-description-language/", GAME_ARTIFACT_DIR: resolve(".wdl/public-world") };
function run(args) { execFileSync(process.execPath, args, { env, stdio: "inherit" }); }
run(["scripts/build-agent-docs.mjs"]);
run(["node_modules/vitepress/bin/vitepress.js", "build", "docs"]);
run(["--import", "tsx", "scripts/build-game.ts", "--entry", "worlds/spawn-demo.tsx", "--out", env.GAME_ARTIFACT_DIR]);
run(["node_modules/vite/bin/vite.js", "build", "--config", "examples/three-runtime/vite.config.ts"]);
await mkdir(".wdl/public-site", { recursive: true });
await cp("docs/.vitepress/dist", ".wdl/public-site", { recursive: true });
await cp(".wdl/three-runtime", ".wdl/public-site/demo", { recursive: true });
await writeFile(".wdl/public-site/.nojekyll", "");
console.log("PUBLIC_SITE_READY .wdl/public-site");
