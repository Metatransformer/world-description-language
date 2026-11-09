"""Snapshot the full Valenfeld procedural library. Never writes to Spawn."""
import hashlib
import json
import pathlib
import re
import sys
import yaml

source = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path(__file__).resolve().parents[1]
target = root / "packages" / "valenfeld" / "vendor"
entries = sorted(p.stem for p in (source / "scripts/gen").glob("*.js"))
seen = {}
def copy(relative):
    path = (source / relative).resolve()
    path.relative_to(source)
    key = path.relative_to(source).as_posix()
    if key in seen:
        return
    raw = path.read_bytes()
    seen[key] = hashlib.sha256(raw).hexdigest()
    dest = target / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix in [".yml", ".yaml"]:
        data = yaml.safe_load(raw)
        if path.name == "kits.yml":
            data["sets"] = {name: {k: v for k, v in values.items() if k in entries} for name, values in data["sets"].items()}
        dest.with_suffix(".json").write_text(json.dumps(data, indent=2) + "\n", encoding="utf8")
        return
    text = raw.decode("utf-8-sig")
    # Original toll-hut passes six vertices to tris(), which expects triangle triples.
    if path.name == "toll-hut.js":
        text = text.replace("g.tris([[-W", "g.tris([[[-W").replace("H + 1.2, z], [-W", "H + 1.2, z]], [[-W").replace("[W / 2, H, z]]);", "[W / 2, H, z]]]);")
    for match in re.finditer(r'(?:from\s+|import\s*)["\'](\.[^"\']+)["\']', text):
        dependency = (path.parent / match.group(1)).resolve().relative_to(source)
        copy(dependency)
    text = re.sub(r'(["\'])([^"\']+)\.ya?ml\1', lambda m: m[1] + m[2] + ".json" + m[1], text)
    dest.write_text(text, encoding="utf8")
for file in (source / "content/place-program/components").glob("*.mjs"):
    copy(file.relative_to(source))
for entry in entries:
    copy(pathlib.Path("scripts/gen") / (entry + ".js"))
    (target / "scripts/gen" / (entry + ".d.ts")).write_text(
        "export function geometry(context: unknown): void;\nexport function collider(context: unknown): unknown;\n", encoding="utf8")
reference = target.parent / "reference"
reference.mkdir(parents=True, exist_ok=True)
for file in ["content/place-program/settlement/valenfeld.houses.jsx", "content/place-program/interior/valenfeld-inn.tree.jsx"]:
    raw = (source / file).read_bytes()
    seen[file] = hashlib.sha256(raw).hexdigest()
    (reference / (pathlib.Path(file).name + ".txt")).write_bytes(raw)
(target.parent / "provenance.json").write_text(json.dumps({"source": "Valenfeld/Spawn", "files": seen}, indent=2) + "\n", encoding="utf8")
print(f"Snapshotted {len(seen)} source files for {len(entries)} procedural components.")

# Generate the public JSX wrappers and machine-readable catalog from the snapshot.
package = target.parent
src = package / "src"
src.mkdir(parents=True, exist_ok=True)
lines = ['import * as React from "react";', 'import { Group, type Vec3 } from "@generative-world-studio/core";', 'import { Geometry } from "./components.js";', 'import type { SpawnPalette } from "./capture.js";', 'export type KitProps = { palette: SpawnPalette; at?: Vec3; rotation?: Vec3; scale?: Vec3; seed?: number; params?: Record<string, unknown> };']
catalog = []
for file in sorted((target / "scripts/gen").glob("*.js")):
    text = file.read_text(encoding="utf8")
    if not re.search(r"export\s+(?:function\s+geometry|\{[^}]*geometry)", text):
        continue
    name = "".join(part.title() for part in file.stem.split("-"))
    lines.append('import * as gen' + name + ' from "../vendor/scripts/gen/' + file.name + '";')
    lines.append('export function ' + name + '(props: KitProps) { return <Group key="root" name="' + name + '" position={props.at} rotation={props.rotation} scale={props.scale}><Geometry key="geometry" generator={gen' + name + '} palette={props.palette} params={props.params} seed={props.seed} /></Group>; }')
    catalog.append({"name": name, "source": "scripts/gen/" + file.name, "module": "./src/library.tsx"})
(src / "library.tsx").write_text("\n".join(lines) + "\n", encoding="utf8")
(package / "catalog.json").write_text(json.dumps({"version": 1, "components": catalog}, indent=2) + "\n", encoding="utf8")
