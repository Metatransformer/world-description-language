import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { texturePng } from "./texture.js";
import type { Material, MeshGeometry, WorldManifest } from "./types.js";

type Geo = { positions: number[]; indices: number[] };
const box = (size: readonly [number, number, number]): Geo => {
  const [x, y, z] = size.map((v) => v / 2);
  return {
    positions: [
      -x,
      -y,
      -z,
      x,
      -y,
      -z,
      x,
      y,
      -z,
      -x,
      y,
      -z,
      -x,
      -y,
      z,
      x,
      -y,
      z,
      x,
      y,
      z,
      -x,
      y,
      z,
    ],
    indices: [
      0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 1,
      2, 6, 1, 6, 5, 0, 4, 7, 0, 7, 3,
    ],
  };
};
const radial = (
  radius: number,
  height: number,
  segments: number,
  cone: boolean,
): Geo => {
  const positions: number[] = [0, -height / 2, 0, 0, height / 2, 0],
    indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(a) * radius, -height / 2, Math.sin(a) * radius);
    if (!cone)
      positions.push(Math.cos(a) * radius, height / 2, Math.sin(a) * radius);
  }
  const stride = cone ? 1 : 2;
  for (let i = 0; i < segments; i++) {
    const n = (i + 1) % segments,
      b = 2 + i * stride,
      bn = 2 + n * stride;
    indices.push(0, b, bn);
    if (cone) indices.push(b, 1, bn);
    else {
      const t = b + 1,
        tn = bn + 1;
      indices.push(b, tn, bn, b, t, tn, 1, tn, t);
    }
  }
  return { positions, indices };
};
const sphere = (radius: number, segments: number): Geo => {
  const rings = Math.max(3, Math.floor(segments / 2)),
    positions: number[] = [],
    indices: number[] = [];
  for (let y = 0; y <= rings; y++)
    for (let x = 0; x <= segments; x++) {
      const v = y / rings,
        u = x / segments,
        p = v * Math.PI;
      positions.push(
        -radius * Math.cos(u * Math.PI * 2) * Math.sin(p),
        radius * Math.cos(p),
        radius * Math.sin(u * Math.PI * 2) * Math.sin(p),
      );
    }
  for (let y = 0; y < rings; y++)
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x,
        b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  return { positions, indices };
};
function geometry(value: MeshGeometry): Geo {
  if (value.shape === "box") return box(value.size);
  if (value.shape === "cylinder" || value.shape === "cone")
    return radial(
      value.radius,
      value.height,
      value.segments ?? 16,
      value.shape === "cone",
    );
  if (value.shape === "sphere")
    return sphere(value.radius, value.segments ?? 16);
  if (value.shape === "indexed")
    return { positions: value.positions, indices: value.indices };
  const positions: number[] = [],
    indices: number[] = [];
  for (let z = 0; z < value.rows; z++)
    for (let x = 0; x < value.columns; x++)
      positions.push(
        (x / (value.columns - 1) - 0.5) * value.width,
        value.heights[z * value.columns + x]!,
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
  return { positions, indices };
}
const hex = (color: string): [number, number, number, number] => {
  const raw = color.replace("#", "");
  const n = Number.parseInt(
    raw.length === 3
      ? raw
          .split("")
          .map((v) => v + v)
          .join("")
      : raw,
    16,
  );
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};
async function createGltf(manifest: WorldManifest, spaceId: string) {
  const buffers: Buffer[] = [],
    bufferViews: Array<Record<string, number>> = [],
    accessors: Array<Record<string, unknown>> = [],
    meshes: Array<Record<string, unknown>> = [],
    nodes: Array<Record<string, unknown>> = [];
  const images: Array<{ uri: string }> = [],
    textures: Array<{ source: number; sampler: number }> = [];
  const textureIndex = new Map<string, number>();
  for (const item of manifest.materials) {
    if (!item.texture) continue;
    let uri: string;
    if (item.texture.kind === "asset") {
      const data = await readFile(item.texture.uri);
      const mime =
        item.texture.uri.toLowerCase().endsWith(".jpg") ||
        item.texture.uri.toLowerCase().endsWith(".jpeg")
          ? "image/jpeg"
          : "image/png";
      uri = `data:${mime};base64,${data.toString("base64")}`;
    } else
      uri = `data:image/png;base64,${texturePng(item.texture).toString("base64")}`;
    const index = images.push({ uri }) - 1;
    textureIndex.set(item.id, textures.push({ source: index, sampler: 0 }) - 1);
  }
  const materials = manifest.materials.map((item: Material) => ({
    name: item.id,
    pbrMetallicRoughness: {
      baseColorFactor: [
        ...(item.texture
          ? [1, 1, 1]
          : hex(item.color)
              .slice(0, 3)
              .map((value) =>
                value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4,
              )),
        item.opacity ?? 1,
      ],
      baseColorTexture: textureIndex.has(item.id)
        ? { index: textureIndex.get(item.id) }
        : undefined,
      metallicFactor: item.metallic ?? 0,
      roughnessFactor: item.roughness ?? 1,
    },
    doubleSided: item.doubleSided ?? false,
    alphaMode: (item.opacity ?? 1) < 1 ? "BLEND" : "OPAQUE",
  }));
  const materialIndex = new Map(
    manifest.materials.map((item, index) => [item.id, index]),
  );
  let byteOffset = 0;
  const append = (data: Buffer, target: number) => {
    const padding = (4 - (byteOffset % 4)) % 4;
    if (padding) {
      buffers.push(Buffer.alloc(padding));
      byteOffset += padding;
    }
    const index = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength: data.length,
      target,
    });
    buffers.push(data);
    byteOffset += data.length;
    return index;
  };
  for (const object of manifest.objects.filter(
    (item) => item.spaceId === spaceId && item.geometry,
  )) {
    const raw = geometry(object.geometry!);
    const geo: Geo = { positions: [], indices: [] };
    const normals: number[] = [],
      uvs: number[] = [];
    const repeat = manifest.materials.find(
      (item) => item.id === object.material,
    )?.texture;
    const uvScale = repeat && repeat.kind !== "asset" ? (repeat.scale ?? 1) : 1;
    for (let face = 0; face < raw.indices.length; face += 3) {
      const points = raw.indices
        .slice(face, face + 3)
        .map((index) => raw.positions.slice(index * 3, index * 3 + 3));
      const a = points[0]!,
        b = points[1]!,
        c = points[2]!;
      const ab = b.map((v, i) => v - a[i]!),
        ac = c.map((v, i) => v - a[i]!);
      const normal = [
        ab[1]! * ac[2]! - ab[2]! * ac[1]!,
        ab[2]! * ac[0]! - ab[0]! * ac[2]!,
        ab[0]! * ac[1]! - ab[1]! * ac[0]!,
      ];
      const magnitude = Math.hypot(...normal) || 1;
      const axis = normal
        .map(Math.abs)
        .indexOf(Math.max(...normal.map(Math.abs)));
      for (const point of points) {
        geo.indices.push(geo.positions.length / 3);
        geo.positions.push(...point);
        normals.push(...normal.map((v) => v / magnitude));
        uvs.push(
          point[axis === 0 ? 2 : 0]! / uvScale,
          point[axis === 1 ? 2 : 1]! / uvScale,
        );
      }
    }
    const positions = Buffer.alloc(geo.positions.length * 4);
    geo.positions.forEach((v, i) => positions.writeFloatLE(v, i * 4));
    const indices = Buffer.alloc(geo.indices.length * 4);
    geo.indices.forEach((v, i) => indices.writeUInt32LE(v, i * 4));
    const posView = append(positions, 34962),
      idxView = append(indices, 34963);
    const triples = Array.from({ length: geo.positions.length / 3 }, (_, i) =>
      geo.positions.slice(i * 3, i * 3 + 3),
    );
    const posAccessor =
      accessors.push({
        bufferView: posView,
        componentType: 5126,
        count: triples.length,
        type: "VEC3",
        min: [0, 1, 2].map((axis) => Math.min(...triples.map((v) => v[axis]!))),
        max: [0, 1, 2].map((axis) => Math.max(...triples.map((v) => v[axis]!))),
      }) - 1;
    const idxAccessor =
      accessors.push({
        bufferView: idxView,
        componentType: 5125,
        count: geo.indices.length,
        type: "SCALAR",
      }) - 1;
    const floatAccessor = (
      values: number[],
      components: number,
      type: string,
    ) => {
      const data = Buffer.alloc(values.length * 4);
      values.forEach((value, i) => data.writeFloatLE(value, i * 4));
      return (
        accessors.push({
          bufferView: append(data, 34962),
          componentType: 5126,
          count: values.length / components,
          type,
        }) - 1
      );
    };
    const normalAccessor = floatAccessor(normals, 3, "VEC3"),
      uvAccessor = floatAccessor(uvs, 2, "VEC2");
    const mesh =
      meshes.push({
        name: object.id,
        primitives: [
          {
            attributes: {
              POSITION: posAccessor,
              NORMAL: normalAccessor,
              TEXCOORD_0: uvAccessor,
            },
            indices: idxAccessor,
            material: object.material
              ? materialIndex.get(object.material)
              : undefined,
          },
        ],
      }) - 1;
    nodes.push({ name: object.id, mesh, matrix: object.matrix });
  }
  const binary = Buffer.concat(buffers);
  return {
    asset: { version: "2.0", generator: "WDL 1.0" },
    scene: 0,
    scenes: [{ name: spaceId, nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    images,
    textures,
    samplers: [
      { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 },
    ],
    buffers: [
      {
        byteLength: binary.length,
        uri: `data:application/octet-stream;base64,${binary.toString("base64")}`,
      },
    ],
    bufferViews,
    accessors,
  };
}
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stable(item)]),
    );
  return value;
}
export async function writeWorldArtifacts(
  manifest: WorldManifest,
  outputDir: string,
): Promise<{ manifestPath: string; scenePaths: string[] }> {
  const sceneName = (id: string) =>
    `${id.replace(/[^a-zA-Z0-9_-]/g, "-")}.gltf`;
  const sceneFiles = manifest.spaces.map((space) => sceneName(space.id));
  if (new Set(sceneFiles).size !== sceneFiles.length)
    throw new Error("Space IDs collide after export filename normalization");
  // Prepare every asset before touching the last successful export.
  const scenes = await Promise.all(
    manifest.spaces.map(
      async (space) =>
        JSON.stringify(await createGltf(manifest, space.id), null, 2) + "\n",
    ),
  );
  await mkdir(outputDir, { recursive: true });
  const manifestPath = join(outputDir, "manifest.json");
  let previous: WorldManifest | undefined;
  try {
    previous = JSON.parse(
      await readFile(manifestPath, "utf8"),
    ) as WorldManifest;
  } catch {
    /* First export. */
  }
  const scenePaths = sceneFiles.map((file) => join(outputDir, file));
  for (let index = 0; index < scenePaths.length; index++)
    await writeFile(scenePaths[index]!, scenes[index]!);
  await writeFile(
    manifestPath,
    `${JSON.stringify(stable(manifest), null, 2)}\n`,
  );
  for (const space of previous?.spaces ?? []) {
    const filename = sceneName(space.id);
    if (!sceneFiles.includes(filename))
      await rm(join(outputDir, filename), { force: true });
  }
  return { manifestPath, scenePaths };
}
