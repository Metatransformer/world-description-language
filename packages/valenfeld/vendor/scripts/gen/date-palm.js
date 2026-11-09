// A DATE PALM: a leaning, bowed trunk ringed with old frond scars, a boot of cut stubs, a crown of
// feather fronds (young ones up, old ones drooping and yellowed) and hanging date clusters.
// params: h (trunk height), lean (degrees, along +x), bow, seed. Origin at the trunk's foot.
import { TX, paint, flatc } from "../lib/desert-kit.js";
import { G, rng } from "../lib/geo.js";
function trunk(p) { const h = p.h ?? 7.5, lean = (p.lean ?? 8) * Math.PI / 180, bow = p.bow ?? 0.4;
  return (t) => [Math.sin(lean) * h * t + Math.sin(t * Math.PI) * bow, Math.cos(lean) * h * t, 0]; }
export function geometry(c) {
  const p = c.params, D = c.lod, R = rng(p.seed ?? 1), g = new G(c), at = trunk(p);
  const segs = D <= 1 ? 18 : D <= 2 ? 12 : D <= 3 ? 7 : 4, rs = D <= 2 ? 9 : D <= 3 ? 7 : 5;
  const path = []; for (let i = 0; i <= segs; i++) { const t = i / segs, q = at(t); path.push([q[0], q[1] - (i === 0 ? 0.3 : 0), q[2], (0.27 - 0.09 * t) * (i === 0 ? 1.45 : i === 1 ? 1.12 : 1)]); }
  paint(c, TX.bark, "oklch(0.9 0.025 70)"); c.smooth();
  g.tube(path, rs, { capB: true, rough: D <= 2 ? (th, k) => (k % 2 ? 0.93 : 1.05) + 0.03 * Math.sin(th * 3 + k) : undefined }); c.flat();
  const top = at(1);
  // boot: cut frond bases ringing the crown's foot
  if (D <= 2) { paint(c, TX.bark, "oklch(0.8 0.04 65)");
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + R() * 0.4, y = top[1] - 0.5 - R() * 0.6, ca = Math.cos(a), sa = Math.sin(a);
      g.tri([top[0] + ca * 0.18, y, top[2] + sa * 0.18], [top[0] + ca * 0.55 - sa * 0.08, y + 0.35, top[2] + sa * 0.55 + ca * 0.08], [top[0] + ca * 0.55 + sa * 0.08, y + 0.35, top[2] + sa * 0.55 - ca * 0.08]); } }
  // fronds
  const nF = D <= 1 ? 17 : D <= 2 ? 14 : D <= 3 ? 10 : 7, nS = D <= 1 ? 12 : D <= 2 ? 8 : D <= 3 ? 5 : 3;
  for (let i = 0; i < nF; i++) {
    const az = i / nF * 6.283 + R() * 0.35, layer = i % 3, L = 3.0 + R() * 1.3;
    let th = (layer === 0 ? 62 : layer === 1 ? 30 : 2) * Math.PI / 180 + (R() - 0.5) * 0.2;
    const droop = (layer === 2 ? 95 : 70) * Math.PI / 180, ha = [Math.cos(az), 0, Math.sin(az)], side = [-Math.sin(az), 0, Math.cos(az)];
    const old = layer === 2 && R() < 0.6, L0 = old ? 0.62 : 0.4;
    flatc(c, old ? `oklch(${(0.58 + R() * 0.08).toFixed(2)} 0.08 ${(80 + R() * 15).toFixed(0)})` : `oklch(${(0.46 + R() * 0.12).toFixed(2)} 0.1 ${(120 + R() * 15).toFixed(0)})`);
    const sp = [[top[0], top[1] - 0.15, top[2]]];
    for (let s = 1; s <= nS; s++) { const a = th - droop * Math.pow(s / nS, 1.4), q = sp[s - 1], dl = L / nS; sp.push([q[0] + ha[0] * Math.cos(a) * dl, q[1] + Math.sin(a) * dl, q[2] + ha[2] * Math.cos(a) * dl]); }
    for (let s = 0; s < nS; s++) { const a = sp[s], b = sp[s + 1], u = (s + 0.5) / nS, wl = (s === 0 ? 0.25 : 0.95) * Math.sin(Math.PI * (0.12 + 0.88 * u)) * L0 * 2.2;
      if (D <= 2) { // leaflets: two pairs a segment, raised in a V
        for (const f of [0, 0.5]) { const m = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], tg = [(b[0] - a[0]) * 0.5, (b[1] - a[1]) * 0.5, (b[2] - a[2]) * 0.5];
          for (const sg of [-1, 1]) { const tip = [m[0] + side[0] * sg * wl + tg[0] * 0.6, m[1] + wl * (old ? -0.5 : 0.18), m[2] + side[2] * sg * wl + tg[2] * 0.6];
            g.quad(m, [m[0] + tg[0] * 0.5, m[1] + tg[1] * 0.5, m[2] + tg[2] * 0.5], [tip[0] + tg[0] * 0.12, tip[1], tip[2] + tg[2] * 0.12], tip); } } }
      else { for (const sg of [-1, 1]) { const ea = [a[0] + side[0] * sg * wl * 0.8, a[1] + wl * 0.1, a[2] + side[2] * sg * wl * 0.8], eb = [b[0] + side[0] * sg * wl * 0.6, b[1] + wl * 0.05, b[2] + side[2] * sg * wl * 0.6]; g.quad(a, b, eb, ea); } }
    }
    if (D <= 2) { flatc(c, "oklch(0.55 0.06 90)"); g.tube(sp.map((q, s) => [q[0], q[1], q[2], 0.035 * (1 - s / nS) + 0.008]), 4); }
  }
  // dates
  if (D <= 2) for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + R(), cx = top[0] + Math.cos(a) * 0.45, cz = top[2] + Math.sin(a) * 0.45, cy = top[1] - 0.75;
    flatc(c, "oklch(0.62 0.09 85)"); g.tube([[top[0] + Math.cos(a) * 0.2, top[1] - 0.25, top[2] + Math.sin(a) * 0.2, 0.03], [cx, cy + 0.3, cz, 0.025]], 4);
    flatc(c, i === 1 ? "oklch(0.5 0.13 40)" : "oklch(0.64 0.15 60)"); c.smooth(); g.tris(g.blob([cx, cy, cz], [0.22, 0.38, 0.22], 1, 0.35, 3, i + (p.seed ?? 1), null)); c.flat(); }
}
export function collider(c) { const h = c.params.h ?? 7.5, at = trunk(c.params), m = at(0.35); return { kind: "cylinder", radiusTop: 0.24, radiusBottom: 0.32, height: h * 0.7, center: [m[0], h * 0.35, 0] }; }
