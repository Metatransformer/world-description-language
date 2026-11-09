// a cave glowcap: a clump of 3-5 pale mushrooms, slim stems leaning out, domed caps with a frilled underside that glows faintly
// params: seed. Drawn at the ingredient's feet; the picked state scales the whole clump down (scripts/ingredient.js).
export function geometry(ctx) {
  let s = (ctx.params?.seed ?? 7) >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const lod = ctx.lod ?? 1, seg = lod <= 2 ? 10 : 6, n = lod <= 2 ? 3 + Math.floor(r() * 3) : 2;
  const ring = (cx, cy, cz, rad, k) => { const o = []; for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2; o.push([cx + Math.cos(a) * rad, cy, cz + Math.sin(a) * rad]); } return o; };
  const band = (A, B) => { for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length; ctx.quad(...A[i], ...A[j], ...B[j], ...B[i]); } };
  for (let m = 0; m < n; m++) {
    const a = r() * 6.283, d = m === 0 ? 0 : 0.09 + r() * 0.1, x = Math.cos(a) * d, z = Math.sin(a) * d;
    const h = (m === 0 ? 0.24 : 0.1 + r() * 0.12), cr = h * (0.55 + r() * 0.25), lean = m === 0 ? 0 : 0.35;
    const tx = x + Math.cos(a) * h * lean, tz = z + Math.sin(a) * h * lean;
    ctx.albedo(null); ctx.color("#d9d2bf"); ctx.roughness(0.8); ctx.emissive(null);   // the stem
    band(ring(x, 0, z, 0.012 + h * 0.035, 6), ring(tx, h, tz, 0.009 + h * 0.03, 6));
    ctx.color("#9fe0d4"); ctx.roughness(0.45); ctx.emissive(0.12, 0.42, 0.38);   // the cap, lit from inside
    const rows = lod <= 2 ? 4 : 2; let prev = ring(tx, h - cr * 0.12, tz, cr, seg);
    for (let k = 1; k <= rows; k++) { const t = k / rows, ph = t * Math.PI / 2, cur = ring(tx, h - cr * 0.12 + Math.sin(ph) * cr * 0.6, tz, Math.max(0.002, Math.cos(ph) * cr), seg); band(prev, cur); prev = cur; }
    ctx.color("#3f6f68"); ctx.emissive(0.05, 0.2, 0.18);   // the gills underneath
    band(ring(tx, h - cr * 0.1, tz, 0.015, seg), ring(tx, h - cr * 0.12, tz, cr * 0.98, seg));
  }
}
