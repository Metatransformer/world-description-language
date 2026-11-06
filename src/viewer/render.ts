import * as THREE from "three";
import type {
  Material,
  MeshGeometry,
  ProceduralTexture,
  WorldManifest,
} from "../wdl/types";

function geometry(value: MeshGeometry): THREE.BufferGeometry {
  if (value.shape === "box") return new THREE.BoxGeometry(...value.size);
  if (value.shape === "cylinder")
    return new THREE.CylinderGeometry(
      value.radius,
      value.radius,
      value.height,
      value.segments ?? 16,
    );
  if (value.shape === "cone")
    return new THREE.ConeGeometry(
      value.radius,
      value.height,
      value.segments ?? 16,
    );
  if (value.shape === "sphere")
    return new THREE.SphereGeometry(
      value.radius,
      value.segments ?? 16,
      Math.max(8, Math.floor((value.segments ?? 16) / 2)),
    );
  const result = new THREE.BufferGeometry();
  if (value.shape === "indexed") {
    result.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(value.positions, 3),
    );
    result.setIndex(value.indices);
    if (value.normals)
      result.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(value.normals, 3),
      );
    else result.computeVertexNormals();
    return result;
  }
  const positions: number[] = [],
    indices: number[] = [];
  for (let z = 0; z < value.rows; z++)
    for (let x = 0; x < value.columns; x++)
      positions.push(
        (x / (value.columns - 1) - 0.5) * value.width,
        value.heights[z * value.columns + x] ?? 0,
        (z / (value.rows - 1) - 0.5) * value.depth,
      );
  for (let z = 0; z < value.rows - 1; z++)
    for (let x = 0; x < value.columns - 1; x++) {
      const a = z * value.columns + x,
        b = a + 1,
        c = a + value.columns,
        d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  result.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  result.setIndex(indices);
  result.computeVertexNormals();
  return result;
}

function texture(value: ProceduralTexture): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = value.colors[0];
  context.fillRect(0, 0, 64, 64);
  context.fillStyle = value.colors[1];
  if (value.kind === "checker")
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++)
        if ((x + y) % 2) context.fillRect(x * 8, y * 8, 8, 8);
  if (value.kind === "stripes")
    for (let x = 0; x < 64; x += 12) context.fillRect(x, 0, 5, 64);
  if (value.kind === "noise") {
    let seed = [...(value.seed ?? "wdl")].reduce(
      (n, c) => (n * 31 + c.charCodeAt(0)) >>> 0,
      7,
    );
    for (let i = 0; i < 800; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = seed % 64;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      context.globalAlpha = 0.08 + (seed % 25) / 100;
      context.fillRect(x, (seed >>> 8) % 64, 2, 2);
    }
    context.globalAlpha = 1;
  }
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(value.scale ?? 1, value.scale ?? 1);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

function material(value: Material): THREE.MeshStandardMaterial {
  const map =
    value.texture && value.texture.kind !== "asset"
      ? texture(value.texture)
      : undefined;
  return new THREE.MeshStandardMaterial({
    color: map ? "#ffffff" : value.color,
    roughness: value.roughness ?? 0.9,
    metalness: value.metallic ?? 0,
    opacity: value.opacity ?? 1,
    transparent: (value.opacity ?? 1) < 1,
    side: value.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    map,
    depthWrite: (value.opacity ?? 1) >= 1,
  });
}

export function buildSpace(manifest: WorldManifest, spaceId: string) {
  const group = new THREE.Group();
  group.name = spaceId;
  const objects = new Map<string, THREE.Mesh>();
  const materials = new Map(
    manifest.materials.map((item) => [item.id, material(item)]),
  );
  const fallback = new THREE.MeshStandardMaterial({
    color: "#b89562",
    roughness: 0.9,
  });
  for (const object of manifest.objects) {
    if (object.spaceId !== spaceId || !object.geometry) continue;
    const base = object.material
      ? (materials.get(object.material) ?? fallback)
      : fallback;
    const meshMaterial = base.clone();
    meshMaterial.map = base.map;
    const shape = geometry(object.geometry);
    if (!shape.getAttribute("uv")) {
      const positions = shape.getAttribute("position"),
        uv: number[] = [];
      for (let i = 0; i < positions.count; i++)
        uv.push(positions.getX(i) / 20, positions.getZ(i) / 20);
      shape.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    }
    const mesh = new THREE.Mesh(shape, meshMaterial);
    mesh.name = object.name ?? object.id;
    mesh.userData.wdlId = object.id;
    mesh.matrix.fromArray(object.matrix);
    mesh.matrixAutoUpdate = false;
    mesh.castShadow = object.type !== "terrain" && object.type !== "river";
    mesh.receiveShadow = true;
    group.add(mesh);
    objects.set(object.id, mesh);
  }
  return {
    group,
    objects,
    dispose() {
      group.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          item.geometry.dispose();
          (item.material as THREE.Material).dispose();
        }
      });
      for (const item of [...materials.values(), fallback]) {
        item.map?.dispose();
        item.dispose();
      }
    },
  };
}

export function setSelected(objects: Map<string, THREE.Mesh>, id?: string) {
  for (const [objectId, mesh] of objects) {
    const selected =
      objectId === id || (id !== undefined && objectId.startsWith(`${id}/`));
    mesh.renderOrder = selected ? 2 : 0;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissive.set(selected ? "#d5a84d" : "#000000");
    material.emissiveIntensity = selected ? 0.6 : 0;
  }
}
