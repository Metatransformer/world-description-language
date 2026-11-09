import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve("docs"), output = join(root, "public");
async function markdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.filter(e => !e.name.startsWith(".") && e.name !== "public").map(e =>
    e.isDirectory() ? markdown(join(directory, e.name)) : e.name.endsWith(".md") ? [join(directory, e.name)] : []))).flat();
}
const files = (await markdown(root)).sort();
const index = ["# Generative World Studio", "", "> JSX worlds, portable state, and native engine adapters.", "", "Start with [Agent quickstart](./markdown/AGENT-QUICKSTART.md).", "", "## Documentation", ""];
const full = ["# Generative World Studio documentation", ""];
for (const file of files) {
  const path = relative(root, file).replaceAll("\\", "/"), body = await readFile(file, "utf8");
  const title = /^# (.+)$/m.exec(body)?.[1] ?? path;
  const target = join(output, "markdown", path);
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, body);
  index.push(`- [${title}](./markdown/${path})`);
  full.push(`<!-- source: docs/${path} -->`, body, "");
}
await writeFile(join(output, "llms.txt"), index.join("\n") + "\n");
await writeFile(join(output, "llms-full.txt"), full.join("\n"));
await cp(join(root, "images"), join(output, "markdown", "images"), { recursive: true });
console.log(`Exported ${files.length} Markdown documents for agents.`);
