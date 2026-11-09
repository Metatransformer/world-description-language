"""Snapshot only the procedural kits needed by the WDL port. Never writes to Spawn."""
import hashlib
import json
import pathlib
import re
import sys
import yaml

source = pathlib.Path(sys.argv[1]).resolve()
root = pathlib.Path(__file__).resolve().parents[1]
target = root / "worlds" / "spawn" / "vendor"
entries = ["house", "well", "market-stall", "tavern", "inn-hall", "chest"]
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
    for match in re.finditer(r'(?:from\s+|import\s*)["\'](\.[^"\']+)["\']', text):
        dependency = (path.parent / match.group(1)).resolve().relative_to(source)
        copy(dependency)
    text = re.sub(r'(["\'])([^"\']+)\.ya?ml\1', lambda m: m[1] + m[2] + ".json" + m[1], text)
    dest.write_text(text, encoding="utf8")
for entry in entries:
    copy(pathlib.Path("scripts/gen") / (entry + ".js"))
    (target / "scripts/gen" / (entry + ".d.ts")).write_text(
        "export function geometry(context: unknown): void;\nexport function collider(context: unknown): unknown;\n", encoding="utf8")
reference = root / "worlds/spawn/reference"
reference.mkdir(parents=True, exist_ok=True)
for file in ["content/place-program/settlement/valenfeld.houses.jsx", "content/place-program/interior/valenfeld-inn.tree.jsx"]:
    raw = (source / file).read_bytes()
    seen[file] = hashlib.sha256(raw).hexdigest()
    (reference / (pathlib.Path(file).name + ".txt")).write_bytes(raw)
(target.parent / "provenance.json").write_text(json.dumps({"source": "Valenfeld/Spawn", "files": seen}, indent=2) + "\n", encoding="utf8")
print(f"Snapshotted {len(seen)} source files for {len(entries)} procedural components.")
