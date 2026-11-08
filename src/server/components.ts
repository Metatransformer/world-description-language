import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import ts from "typescript";
import type { WorldManifest } from "../wdl/types";

export type ComponentDefinition = {
  id: string;
  name: string;
  file: string;
  line: number;
  endLine: number;
  code: string;
  instances: Array<{ id: string; name: string; spaceId: string }>;
};

/** Index declarations, including components that have no current world instances. */
export async function listProjectComponents(manifest?: WorldManifest): Promise<ComponentDefinition[]> {
  const root = process.cwd();
  async function files(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
      ? files(join(directory, entry.name))
      : Promise.resolve(/\.tsx?$/.test(entry.name) ? [join(directory, entry.name)] : [])));
    return nested.flat();
  }
  const paths = (await Promise.all(["worlds", "src/wdl", "src/dungeon"].map((directory) => files(resolve(root, directory))))).flat().sort();
  const definitions: ComponentDefinition[] = [];
  for (const path of paths) {
    const file = relative(root, path).replaceAll("\\", "/");
    const content = await readFile(path, "utf8");
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function add(name: string, node: ts.Node) {
      if (!/^[A-Z]/.test(name)) return;
      const start = node.getStart(source);
      const instances = (manifest?.objects ?? []).filter((object) =>
        object.source?.components?.some((component, index) => component.name === name && (component.file === file || object.source?.file === file || object.source?.components?.[index + 1]?.file === file)));
      // The nearest matching object per invocation is the useful placed instance;
      // descendants carry the same provenance and should not inflate the list.
      const ids = new Set(instances.map((object) => object.id));
      definitions.push({
        id: `${file}:${name}:${start}`,
        name, file,
        line: source.getLineAndCharacterOfPosition(start).line + 1,
        endLine: source.getLineAndCharacterOfPosition(node.end).line + 1,
        code: content.slice(start, node.end),
        instances: instances.filter((object) => !object.parentId || !ids.has(object.parentId)).map((object) => ({ id: object.id, name: object.name ?? object.id, spaceId: object.spaceId })),
      });
    }
    for (const statement of source.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name && statement.body) add(statement.name.text, statement);
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && declaration.initializer &&
              (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)))
            add(declaration.name.text, declaration);
        }
      }
    }
  }
  for (const definition of definitions) {
    if (definitions.filter((item) => item.name === definition.name).length !== 1) continue;
    const matches = (manifest?.objects ?? []).filter((object) => object.source?.componentChain.includes(definition.name));
    const ids = new Set(matches.map((object) => object.id));
    definition.instances = matches.filter((object) => !object.parentId || !ids.has(object.parentId)).map((object) => ({ id: object.id, name: object.name ?? object.id, spaceId: object.spaceId }));
  }
  return definitions.sort((a, b) => a.name.localeCompare(b.name) || a.file.localeCompare(b.file));
}
