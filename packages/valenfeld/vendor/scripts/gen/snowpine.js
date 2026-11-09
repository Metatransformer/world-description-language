// A Hrothspine fir, true size (16-24 m at scale 1): a narrow dark spire of drooping spruce-card boughs with
// snow lying along the top of the laden ones, thickest low. params.seed shapes it; params.snow (0..1) how laden.
import { conifer, rng, BARK } from "../lib/treekit.js";
export function geometry(ctx) {
  ctx.roughness?.(1); ctx.metalness?.(0); // matte: bark and stone never shine
  const R = rng(5000 + (ctx.params.seed ?? 1) * 41), H = 16 + R() * 8;
  return conifer(ctx, { R, H, lean: 0.5, r0: 0.22 + H * 0.008, crownBase: 1.8 + H * 0.06 + R() * 1, Rmax: H * 0.13, shape: 1.0,
    whorls: Math.round(H * 1.15), boughs: 5, stubs: 6, rise0: -0.2, rise1: 0.4, droop: 0.5, tipUp: 0.08,
    bark: BARK.pine, barkTint: "oklch(0.84 0.015 50)", tintL: 0.7, tintC: 0.03, tintH: 150, hullTint: "oklch(0.62 0.035 180)", snow: ctx.params.snow ?? 0.7 });
}
export function collider() { return { kind: "cylinder", radiusTop: 0.28, radiusBottom: 0.48, height: 6, center: [0, 3, 0] }; }
