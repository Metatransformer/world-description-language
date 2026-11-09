// THE HIGHBRIDGE COLISEUM: the Royal Annvyr arcaded shell around the city arena (highbridge-arena-* rows stay
// inside it). Two storeys of arches in cream ashlar, a gold string course, an attic with crimson banners on masts,
// four gate pylons (N E S W) with lead-blue roofs, and stepped seating between the shell and the arena tiers.
// Feet at the arena centre. Art: art.yml arch-hb-royal. Numbers: scripts/lib/data/hb/coliseum.yml.
import D from "../lib/data/hb/coliseum.json";
import { paint, flatc, glow, RB, LA, CY } from "../lib/buildkit.js";
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", SLATE = "cdn/texture-blue-grey-lead-slate-roof-tiles.png";
const CLOTH = "cdn/texture-faded-red-cloth-weave.png", FLAGS = "cdn/texture-flagstone-floor-worn.png";
const IVORY = "oklch(0.95 0.025 85)", SHADE = "oklch(0.86 0.025 80)", GOLD = "oklch(0.8 0.13 85)", CRIMSON = "oklch(0.75 0.12 25)", LEAD = "oklch(0.88 0.03 245)";
const rad = (d) => d * Math.PI / 180;
// a box tangent to the ring at angle a (deg): u along the ring, r out from the centre
function TB(c, a, r, u, y, w, h, d) { const A = rad(a), tx = -Math.sin(A), tz = Math.cos(A);
  RB(c, r * Math.cos(A) + u * tx, y + h / 2, r * Math.sin(A) + u * tz, w, h, d, -(a + 90)); }
const isGate = (i) => D.gates.includes(i);

function arcade(c, a, bw, y0, H, spring, half, L) {   // one bay of one storey: two half piers and a stepped round head
  const R = D.R, T = D.thick, pier = D.pier;
  TB(c, a, R, -bw / 2 + pier / 2, y0, pier, H, T); TB(c, a, R, bw / 2 - pier / 2, y0, pier, H, T);
  const top = spring + half, bands = L <= 1 ? 7 : L <= 3 ? 3 : 1;
  for (let k = 0; k < bands; k++) { const yb = spring + (half * k) / bands, hb = half / bands, ym = (k + 0.5) / bands * half;
    const chord = Math.sqrt(Math.max(0, half * half - ym * ym)), side = bw / 2 - pier - chord;
    if (side > 0.02) for (const s of [-1, 1]) TB(c, a, R, s * (bw / 2 - pier - side / 2), y0 + yb, side, hb, T); }
  TB(c, a, R, 0, y0 + top, bw - 2 * pier, H - top, T);
}

export function geometry(c) {
  const L = c.lod ?? 1, R = D.R, T = D.thick, N = D.bays, step = 360 / N, bw = 2 * Math.PI * R / N + 0.05;
  for (let i = 0; i < N; i++) { const a = i * step, g = isGate(i);
    paint(c, ASH, i % 2 ? IVORY : SHADE);
    if (L >= 5) { TB(c, a, R, 0, 0, bw, D.top, T); continue; }
    if (g) arcade(c, a, bw, 0, D.storey, D.gateSpring, D.gateHalf, L); else arcade(c, a, bw, 0, D.storey, D.spring, D.half, L);
    arcade(c, a, bw, D.storey, D.storey2, D.spring2, D.half2, L);
    TB(c, a, R, 0, D.storey + D.storey2, bw, D.top - D.storey - D.storey2, T);   // the attic
    if (L <= 2) { paint(c, ASH, IVORY); TB(c, a, R + T / 2 + 0.25, 0, D.storey - 0.05, bw, 0.5, 0.5);
      flatc(c, GOLD); TB(c, a, R + T / 2 + 0.2, 0, D.storey + D.storey2 - 0.1, bw, 0.35, 0.4);
      paint(c, ASH, IVORY); TB(c, a, R + T / 2 + 0.35, 0, D.top - 0.1, bw, 0.6, 0.7);
      flatc(c, "oklch(0.32 0.03 60)"); TB(c, a, R + T / 2 + 0.02, 0, D.storey + D.storey2 + 1.1, 0.8, 1.0, 0.05); }   // an attic window
    if (L <= 3 && i % 4 === 2) { const A = rad(a), x = (R + T / 2 + 0.6) * Math.cos(A), z = (R + T / 2 + 0.6) * Math.sin(A);   // a banner mast and its cloth
      flatc(c, "oklch(0.35 0.03 60)"); CY(c, x, D.top - 1.5, z, 0.09, 6, 6);
      paint(c, CLOTH, CRIMSON); TB(c, a, R + T / 2 + 0.75, 0, D.top - 2.5, 1.6, 4.2, 0.05);
      flatc(c, GOLD); TB(c, a, R + T / 2 + 0.79, 0, D.top - 1.0, 0.7, 0.7, 0.04); }
    if (!g && L <= 3) for (let s = 0; s < D.seats.length; s++) { const [r, h] = D.seats[s];   // stepped seating inside the shell
      paint(c, FLAGS, s % 2 ? SHADE : IVORY); TB(c, a, r, 0, 0, 2 * Math.PI * r / N + 0.05, h, 1.6); }
  }
  for (const gi of D.gates) { const a = gi * step;   // gate pylons, lead-blue roofs, gold finials
    for (const s of [-1, 1]) { const A = rad(a), u = s * (bw / 2 + 1.4), x = (R + 0.6) * Math.cos(A) - Math.sin(A) * u, z = (R + 0.6) * Math.sin(A) + Math.cos(A) * u;
      paint(c, ASH, IVORY); RB(c, x, D.pylon / 2, z, 3.2, D.pylon, 3.2, -(a + 90));
      if (L <= 3) { paint(c, SLATE, LEAD); LA(c, x, D.pylon, z, [[2.4, 0], [0.05, 4.2]], 4, true, "y", false);
        flatc(c, GOLD); CY(c, x, D.pylon + 4.1, z, 0.06, 1.0, 6); }
      if (L <= 2) { glow(c, "oklch(0.85 0.12 70)", [2.2, 1.4, 0.5]); const A2 = rad(a); RB(c, x + 1.7 * Math.cos(A2), 3.4, z + 1.7 * Math.sin(A2), 0.3, 0.45, 0.3, -(a + 90)); } }
  }
  c.albedo(null); c.color(null); c.emissive(null);
}

export function collider(c) {   // piers, heads and attic as drawn; seats solid; gate openings open
  const R = D.R, T = D.thick, N = D.bays, step = 360 / N, bw = 2 * Math.PI * R / N + 0.05;
  for (let i = 0; i < N; i++) { const a = i * step, g = isGate(i), pier = D.pier;
    for (const s of [-1, 1]) TB(c, a, R, s * (bw / 2 - pier / 2), 0, pier, D.top, T);
    const sp = g ? D.gateSpring : D.spring; TB(c, a, R, 0, sp, bw - 2 * pier, D.top - sp, T);
    if (!g) for (const [r, h] of D.seats) TB(c, a, r, 0, 0, 2 * Math.PI * r / N + 0.05, h, 1.6); }
  for (const gi of D.gates) { const a = gi * step; for (const s of [-1, 1]) TB(c, a, R + 0.6, s * (bw / 2 + 1.4), 0, 3.2, D.pylon, 3.2); }
}
