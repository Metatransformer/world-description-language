// THE LAMP POST alone, for the Codex bench: the shared Highbridge street lamp (scripts/lib/pieces/lamppost.js).
// params.look: arcade | castle | guildhall (default) | wall; params.h: post height (castle, wall); params.lantern: arcade | castle,
// whose lantern hangs on it (mix a district's post with another's lantern); params.light: "warm" | "cold" | "green".
import { paint, flatc, glow, BX, LA, SEG, PIPE } from "../lib/buildkit.js";
import { lampPost } from "../lib/pieces/lamppost.js";
import { lampHeads as ARCADE } from "./hb-arcade.js";
import { lampHeads as CASTLE } from "./hb-castle.js";
import * as WALL from "./hb-wall.js";
const LIGHTS = { warm: null, cold: ["oklch(0.88 0.08 230)", [1.2, 2.0, 3.4]], green: ["oklch(0.88 0.14 150)", [1.0, 3.0, 1.2]] };
export function geometry(c) {
  const p = c.params ?? {}, look = p.look ?? "guildhall";
  if (look === "wall" && !p.lantern) return WALL.geometry({ ...c, params: { kind: "lamp", h: p.h } });
  const heads = { ...CASTLE, ...(look === "arcade" ? ARCADE : {}), ...(p.lantern === "arcade" ? { lantern: ARCADE.lantern } : p.lantern === "castle" ? { lantern: CASTLE.lantern } : {}) };
  lampPost(c, { paint, flatc, glow, BX, LA, SEG, PIPE }, look, { h: p.h, lod: c.lod ?? 1, heads, light: LIGHTS[p.light] ?? undefined });
  c.albedo(null); c.color(null); c.emissive(null); c.metalness?.(null); c.roughness?.(null);
}
export function collider(c) { const h = c.params?.h ?? 3.6; return [{ kind: "cylinder", radiusTop: 0.12, radiusBottom: 0.22, height: h, center: [0, c.params?.look === "castle" ? -h / 2 : h / 2, 0] }]; }
