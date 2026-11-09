import type { Material, MeshGeometry, Vec3 } from "../../src/wdl/types.js";

type Batch = { material: string; geometry: Extract<MeshGeometry, { shape: "indexed" }> };
type Collider = { kind: string; width?: number; height: number; depth?: number; radiusTop?: number; radiusBottom?: number; center?: Vec3 };
export type Generator = { geometry(context: unknown): void; collider(context: unknown): unknown };
const hash = (text: string) => {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return (value >>> 0).toString(16);
};
function hex(rgb: number[]) {
  return "#" + rgb.map(value => Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16).padStart(2, "0")).join("");
}
export function sourceColor(color: string | null): string {
  if (!color) return "#ffffff";
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) return "#" + [...color.slice(1)].map(c => c + c).join("");
  const match = /^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.-]+)\)$/.exec(color);
  if (!match) throw new Error("Unsupported Spawn color: " + color);
  const L = Number(match[1]), C = Number(match[2]), h = Number(match[3]) * Math.PI / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  // Björn Ottosson's public-domain Oklab inverse: bottosson.github.io/posts/oklab/
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const linear = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  return hex(linear.map(v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055));
}
function shade(color: string, factor: number, base = "#ffffff") {
  return hex([0, 1, 2].map(i => Number.parseInt(color.slice(1 + i * 2, 3 + i * 2), 16) / 255 *
    Number.parseInt(base.slice(1 + i * 2, 3 + i * 2), 16) / 255 * factor));
}
export class SpawnPalette {
  readonly materials: Material[] = [];
  readonly substitutions = new Set<string>();
  private ids = new Set<string>();
  material(texture: string | null, tint: string | null, roughness: number, metallic: number, opacity: number): string {
    const color = sourceColor(tint);
    const id = "spawn-" + hash(JSON.stringify([texture, color, roughness, metallic, opacity]));
    if (this.ids.has(id)) return id;
    this.ids.add(id);
    const material: Material = { id, color, roughness, metallic, opacity, doubleSided: true };
    if (texture) {
      this.substitutions.add(texture);
      const wood = /oak|bark|plank/.test(texture), stone = /stone|granite/.test(texture), hay = /hay|straw/.test(texture);
      const base = wood ? "#886344" : stone ? "#97958a" : hay ? "#d5b66c" : /slate/.test(texture) ? "#717c82" : /iron/.test(texture) ? "#59616b" : "#e0d7bd";
      material.texture = { kind: wood ? "stripes" : stone ? "checker" : "noise",
        colors: [shade(color, 0.85, base), shade(color, 1.05, base)], scale: wood ? 0.35 : 1, seed: id };
    }
    this.materials.push(material);
    return id;
  }
}
/** Implements the geometry-only part of Spawn's context, entirely at WDL compile time. */
export function capture(generator: Generator, palette: SpawnPalette, params: Record<string, unknown> = {}, seed = 1) {
  let texture: string | null = null, tint: string | null = null, rough = 0.85, metal = 0, opacity = 1, randomState = seed >>> 0;
  const batches = new Map<string, Batch>();
  const context = {
    params, seed, lod: 1,
    albedo(value: string | null) { texture = value; },
    color(value: string | null, alpha = 1) { tint = value; opacity = alpha; },
    roughness(value: number | null) { rough = value ?? 0.85; },
    metalness(value: number | null) { metal = value ?? 0; },
    emissive(..._values: unknown[]) { /* Emissive lighting is recorded as a port limitation. */ },
    smooth() {}, flat() {},
    random() { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; },
    tri(...points: number[]) {
      if (points.length !== 9 || points.some(v => !Number.isFinite(v))) throw new Error("Spawn emitted an invalid triangle");
      const material = palette.material(texture, tint, rough, metal, opacity);
      let batch = batches.get(material);
      if (!batch) { batch = { material, geometry: { shape: "indexed", positions: [], indices: [] } }; batches.set(material, batch); }
      const index = batch.geometry.positions.length / 3;
      batch.geometry.positions.push(...points);
      batch.geometry.indices.push(index, index + 1, index + 2);
    },
    quad(...points: number[]) {
      this.tri(...points.slice(0, 9));
      this.tri(...points.slice(0, 3), ...points.slice(6, 12));
    },
  };
  generator.geometry(context);
  const raw = generator.collider(context);
  const colliders = (Array.isArray(raw) ? raw : raw ? [raw] : []) as Collider[];
  for (const collider of colliders) if (!["box", "cylinder"].includes(collider.kind)) throw new Error("Unsupported Spawn collider: " + collider.kind);
  return { batches: [...batches.values()], colliders };
}
