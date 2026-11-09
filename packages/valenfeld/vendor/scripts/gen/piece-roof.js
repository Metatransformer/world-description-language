// THE ROOF alone, for the Codex bench: Highbridge's shared roof pieces (scripts/lib/pieces/roof.js) on a little plaster box.
// params.w, d: footprint (x, z); params.pitch: degrees; params.ridge: "z" (gables face ±z, roofZ) | "x" (buildkit ROOF);
// params.skin: terracotta | copper | lead; params.gable: "wedge" (solid stone gable) | "fill" (thin board gable).
import { paint, BX, ROOF } from "../lib/buildkit.js";
import { roofZ, gableWedgeX, gableWedgeZ, gableFill } from "../lib/pieces/roof.js";
const SKINS = { terracotta: ["cdn/texture-terracotta-roof-tiles-weathered.png", "oklch(0.88 0.05 40)"], copper: ["cdn/texture-verdigris-copper-roof-sheets.png", "#7fb08a"], lead: ["cdn/texture-blue-grey-lead-slate-roof-tiles.png", "oklch(0.9 0.05 255)"] };
const PL = "cdn/texture-lime-plaster-wall.png";
export function geometry(c) {
  const p = c.params ?? {}, w = p.w ?? 5, d = p.d ?? 6, H = p.wall ?? 3, ov = 0.35, t = 0.18;
  const span = p.ridge === "x" ? d : w, rise = Math.tan(((p.pitch ?? 45) * Math.PI) / 180) * (span / 2 + ov), yr = H + rise;
  const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
  paint(c, PL, "oklch(0.93 0.09 82)"); BX(c, x0, 0, z0, x1, H, z1);
  if (p.ridge === "x") { for (const x of [x0 + 0.1, x1 - 0.1]) gableWedgeX(c, x, z0, z1, H, yr - 0.15, 0.1); }
  else if (p.gable === "fill") for (const z of [z0, z1 - 0.12]) gableFill(c, x0, x1, z, H, yr - 0.15, 0.12);
  else for (const z of [z0 + 0.1, z1 - 0.1]) gableWedgeZ(c, z, x0, x1, H, yr - 0.15, 0.1);
  const [tex, col] = SKINS[p.skin] ?? SKINS.terracotta; paint(c, tex, col);
  if (p.ridge === "x") ROOF(c, x0 - ov, x1 + ov, z0 - ov, z1 + ov, H - 0.15, yr, t); else roofZ(c, x0 - ov, x1 + ov, z0 - ov, z1 + ov, H - 0.15, yr, t);
  c.albedo(null); c.color(null); c.emissive(null); c.metalness?.(null); c.roughness?.(null);
}
