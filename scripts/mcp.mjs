import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Codex can launch this from any working directory.
const root = fileURLToPath(new URL("../", import.meta.url));
const child = spawn(
  process.execPath,
  ["--import", "tsx", "src/server/mcp.ts"],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
