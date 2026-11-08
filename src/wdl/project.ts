import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import type { ReactElement } from "react";
import { compileWorld } from "./compiler.js";
import type { VocabularyRegistry, WorldManifest } from "./types.js";
import { WdlCompileError } from "./types.js";

export async function compileProject(
  entryPath: string,
  registry?: VocabularyRegistry,
  options?: { onDependencies?: (paths: string[]) => void },
): Promise<WorldManifest> {
  const entry = resolve(entryPath);
  const source = await readFile(entry, "utf8");
  const forbidden = [
    /\bMath\.random\s*\(/,
    /\bDate\.(now|parse)\s*\(/,
    /\bnew\s+Date\s*\(/,
    /\b(fetch|XMLHttpRequest|WebSocket)\s*\(/,
  ];
  const match = forbidden.find((pattern) => pattern.test(source));
  if (match)
    throw new WdlCompileError([
      {
        code: "NONDETERMINISTIC_SOURCE",
        message: `Unsupported nondeterministic construct matching ${match}. This check is practical, not a hostile-code sandbox.`,
        path: entry,
      },
    ]);
  const output = resolve(".wdl", "bundle.mjs");
  await mkdir(dirname(output), { recursive: true });
  const result = await build({
    write: false,
    metafile: true,
    entryPoints: [entry],
    outfile: output,
    bundle: true,
    packages: "external",
    platform: "node",
    format: "esm",
    target: "node20",
    jsx: "automatic",
    jsxDev: true,
    jsxImportSource: "wdl",
    sourcemap: "inline",
    alias: {
      "wdl/jsx-dev-runtime": resolve("src/wdl/jsx-dev-runtime.ts"),
      "wdl/jsx-runtime": resolve("src/wdl/jsx-runtime.ts"),
    },
  });
  options?.onDependencies?.(Object.keys(result.metafile!.inputs).map(path => resolve(path)));
  const bundled = Buffer.from(result.outputFiles![0]!.contents);
  const executable = bundled
    .toString("utf8")
    .split("//# sourceMappingURL=")[0]!;
  if (forbidden.some((pattern) => pattern.test(executable)))
    throw new WdlCompileError([
      {
        code: "NONDETERMINISTIC_SOURCE",
        message: "Imported project code contains unsupported nondeterminism",
        path: entry,
      },
    ]);
  const revision = createHash("sha256")
    .update(bundled)
    .digest("hex")
    .slice(0, 16);
  const modulePath = resolve(".wdl", `bundle-${revision}.mjs`);
  await writeFile(modulePath, bundled);
  const module = (await import(
    /* webpackIgnore: true */ /* @vite-ignore */ pathToFileURL(modulePath).href
  )) as {
    default?: ReactElement | (() => ReactElement);
    world?: ReactElement;
    vocabulary?: VocabularyRegistry;
  };
  const exported = module.world ?? module.default;
  const element = typeof exported === "function" ? exported() : exported;
  if (!element)
    throw new WdlCompileError([
      {
        code: "INVALID_WORLD",
        message:
          "Project must default-export a World element or export it as 'world'",
        path: entry,
      },
    ]);
  return compileWorld(element, registry ?? module.vocabulary);
}
