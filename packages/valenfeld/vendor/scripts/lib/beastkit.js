// Shared helpers for the bestiary's rigged bodies (scripts/gen/{quad,spider,scorpion,bird,serpent,wraith}.js):
// stateful paint, limbs, blobs and chains over mesh.js tubes. Each generator binds parts whole to its skeleton() bones.
import { mesher } from "./mesh.js";
import B from "./data/kit-beast.json";   // segment counts, tapers, blob profile: scripts/lib/data/kit-beast.yml
export function bk(ctx) {
  const lod = ctx.lod ?? 1, n = lod <= B.lod.near ? B.sides.near : lod <= B.lod.mid ? B.sides.mid : B.sides.far, k = lod <= B.smooth.upToLod ? B.smooth.k : 1;
  const m = mesher(ctx);
  ctx.smooth();
  const K = {
    lod, n, m, P: ctx.params ?? {},
    paint: (c, rough = B.rough) => { ctx.color(c); ctx.emissive(null); ctx.roughness?.(rough); },
    glow: (c) => { ctx.color(c); ctx.emissive(c); },
    bone: (b) => ctx.bone(b),
    // a tapered limb a→b
    limb: (a, b, r0, r1 = r0 * B.limb.taper) => m.tube([{ p: a, rx: r0 }, { p: b, rx: r1 }], { sides: n, capStart: r0 * B.limb.capStart, capEnd: r1 * B.limb.capEnd }),
    // a smooth chain through points with radii (rx, or [rx, ry])
    chain: (pts, rs, o = {}) => m.tube(pts.map((p, i) => { const r = rs[i]; return { p, rx: Array.isArray(r) ? r[0] : r, ry: Array.isArray(r) ? r[1] : r }; }),
      { sides: n, k, capStart: o.capStart ?? B.chainCap, capEnd: o.capEnd ?? B.chainCap, ref: o.ref }),
    // an ellipsoid along z: centre, half-widths
    blob: (c, rx, ry, rz) => {
      const S = B.blob.slices, path = [], [s0, s1] = B.blob.span;
      for (let i = 0; i <= S; i++) { const t = i / S, f = Math.max(B.blob.minRadius, Math.sin(Math.PI * (s0 + s1 * t)) ** B.blob.power); path.push({ p: [c[0], c[1], c[2] - rz + 2 * rz * t], rx: rx * f, ry: ry * f }); }
      m.tube(path, { sides: n, k: 1, capStart: rz * B.blob.cap, capEnd: rz * B.blob.cap, ref: [0, 1, 0] });
    },
    // a flat membrane (wing): a fan of tris from a root edge, both faces
    sheet: (pts) => { for (let i = 1; i < pts.length - 1; i++) { m.raw(pts[0], pts[i], pts[i + 1]); m.raw(pts[0], pts[i + 1], pts[i]); } },
    eyes: (pts, r, c) => { K.glow(c); for (const p of pts) K.blob(p, r, r, r); },
  };
  return K;
}
