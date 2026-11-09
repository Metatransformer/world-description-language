import { readFile } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute } from "node:path";

export async function componentLibraries() {
  const root = process.cwd();
  let config: { libraries?: string[] } = {};
  try { config = JSON.parse(await readFile(resolve(root, "generative-world-studio.json"), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  return Promise.all((config.libraries ?? []).map(async name => {
    const entry = await packageEntry(name, resolve(root, "package.json"));
    let directory = dirname(entry);
    while (true) {
      try {
        const pkg = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
        if (pkg.name === name) {
          const info = pkg.generativeWorldStudio;
          if (info?.version !== 1) throw new Error(`Unsupported component package metadata: ${name}`);
          const inside = (path: string) => {
            const resolved = resolve(directory, path), rel = relative(directory, resolved);
            if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`Package path escapes ${name}: ${path}`);
            return resolved;
          };
          return { name, entry: inside(info.entry), roots: (info.sources ?? ["src"]).map(inside) as string[] };
        }
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      const parent = dirname(directory);
      if (parent === directory) throw new Error(`Cannot locate component package ${name}`);
      directory = parent;
    }
  }));
}

export async function packageEntry(name: string, from: string): Promise<string> {
  // Keep resolution native: Next's bundler cannot statically resolve user-installed kits.
  const node = await import(/* webpackIgnore: true */ "node:module");
  return node.createRequire(from).resolve(name);
}
