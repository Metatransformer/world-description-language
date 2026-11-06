"""Import every exported glTF in a clean Blender scene and save a review file.

Run with Blender --background --factory-startup --python this_file -- export_dir.
This deliberately tests Blender's importer, rather than reproducing the exporter.
"""

import json
from pathlib import Path
import sys

import bpy


def verify_exports(directory):
    paths = sorted(directory.glob("*.gltf"))
    if not paths:
        raise RuntimeError(f"No glTF scenes found in {directory}")
    results = []
    for path in paths:
        scene = bpy.data.scenes.new(path.stem)
        bpy.context.window.scene = scene
        document = json.loads(path.read_text())
        expected = sum("mesh" in node for node in document.get("nodes", []))
        bpy.ops.import_scene.gltf(filepath=str(path))
        meshes = [obj for obj in scene.objects if obj.type == "MESH"]
        if len(meshes) != expected or expected == 0:
            raise RuntimeError(f"{path.name}: expected {expected} meshes, imported {len(meshes)}")
        if any(len(obj.data.vertices) == 0 for obj in meshes):
            raise RuntimeError(f"{path.name}: empty mesh after import")
        if any(not obj.data.materials for obj in meshes):
            raise RuntimeError(f"{path.name}: mesh has no imported material")
        results.append({"scene": path.stem, "meshes": len(meshes),
                        "vertices": sum(len(obj.data.vertices) for obj in meshes)})
    bpy.context.window.scene = bpy.data.scenes[paths[0].stem]
    output = directory / "valenreach.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(output))
    report = {"blender": bpy.app.version_string, "scenes": results, "file": str(output)}
    (directory / "blender-verification.json").write_text(json.dumps(report, indent=2) + "\n")
    print("WDL_BLENDER_VERIFIED " + json.dumps(report))


if __name__ == "__main__":
    arguments = sys.argv[sys.argv.index("--") + 1:]
    verify_exports(Path(arguments[0]).resolve())
