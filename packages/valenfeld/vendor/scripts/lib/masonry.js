// Masonry parts: the shared drawing behind the town-works kits and gaol dressing. A part is data:
// { f: block|drum|cone|orb, x,y,z (its feet, local), w,h,d | r | rt,rb,h, seg, yaw,pitch,roll, sx,sy,sz, tex, col, rough, metal, em, ei, solid }
import { G, X } from "./geo.js";
const D = Math.PI / 180;
export function drawPart(ctx, p) {
  ctx.albedo(p.tex ? p.tex.replace(/^\//, "") : null); ctx.color(p.col || "#ffffff");
  ctx.roughness(p.rough ?? 0.9); ctx.metalness(p.metal ?? 0); ctx.emissive(p.em ?? null, p.ei ?? 1);
  const g = new G(ctx), f = p.f ?? "block";
  g.at(X([p.x ?? 0, p.y ?? 0, p.z ?? 0], p.yaw ?? 0, p.pitch ?? 0, p.roll ?? 0, [p.sx ?? 1, p.sy ?? 1, p.sz ?? 1]), () => {
    if (f === "block") return g.box(0, (p.h ?? 1) / 2, 0, p.w ?? 1, p.h ?? 1, p.d ?? 1);
    const n = Math.max(6, Math.min(48, p.seg ?? 12));
    if (f === "orb") {
      const r = p.r ?? 0.5, m = Math.max(4, Math.round(n / 2)), P = (i, j) => { const t = 2 * Math.PI * i / n, v = Math.PI * j / m - Math.PI / 2; return [Math.cos(v) * Math.cos(t) * r, r + Math.sin(v) * r, Math.cos(v) * Math.sin(t) * r]; };
      for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) g.quad(P(i + 1, j), P(i, j), P(i, j + 1), P(i + 1, j + 1));
      return;
    }
    const h = p.h ?? 1, rb = p.rb ?? p.r ?? 0.5, rt = f === "cone" ? 0 : (p.rt ?? p.r ?? 0.5);
    const Q = (i, r, y) => { const t = 2 * Math.PI * i / n; return [Math.cos(t) * r, y, Math.sin(t) * r]; };
    for (let i = 0; i < n; i++) {
      g.quad(Q(i + 1, rb, 0), Q(i, rb, 0), Q(i, rt, h), Q(i + 1, rt, h));
      if (rt > 0) g.tri([0, h, 0], Q(i + 1, rt, h), Q(i, rt, h));
      g.tri([0, 0, 0], Q(i, rb, 0), Q(i + 1, rb, 0));
    }
  });
  ctx.albedo(null); ctx.color(null); ctx.emissive(null);
}
// collider shapes for the solid parts (yawed blocks as their bounding box)
export function partColliders(parts) {
  const L = [];
  for (const p of parts) {
    if (p.solid === false) continue;
    const f = p.f ?? "block", sx = p.sx ?? 1, sy = p.sy ?? 1, sz = p.sz ?? 1, x = p.x ?? 0, y = p.y ?? 0, z = p.z ?? 0;
    if (f === "block") {
      const c = Math.abs(Math.cos((p.yaw ?? 0) * D)), s = Math.abs(Math.sin((p.yaw ?? 0) * D)), w = (p.w ?? 1) * sx, d = (p.d ?? 1) * sz, h = (p.h ?? 1) * sy;
      L.push({ kind: "box", width: c * w + s * d, height: h, depth: s * w + c * d, center: [x, y + h / 2, z] });
    } else if (f === "orb") L.push({ kind: "sphere", radius: (p.r ?? 0.5) * Math.max(sx, sy, sz), center: [x, y + (p.r ?? 0.5) * sy, z] });
    else L.push({ kind: "cylinder", radiusTop: f === "cone" ? 0.01 : (p.rt ?? p.r ?? 0.5) * sx, radiusBottom: (p.rb ?? p.r ?? 0.5) * sx, height: (p.h ?? 1) * sy, center: [x, y + (p.h ?? 1) * sy / 2, z] });
  }
  return L;
}
// a placement's parts: params.parts, or the params themselves as one part at its feet
export const partsOf = (params) => params?.parts ?? [params ?? {}];
