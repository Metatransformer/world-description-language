// A pass town's storm beacon (Frostwatch's Blind Lantern; any beacon landmark reuses it): a square dark-fieldstone
// tower tapering up from a stepped plinth, slit windows, a timber hoarding gallery on corbels, then the lantern:
// a fire cage behind iron shutter slats, one face's shutters thrown open and glowing, under a steep snow-capped
// slab roof with an iron finial. params: { h: shaft height (15), s: base half-width (2.2), open: open face 0..3 }.
// Origin = the plinth's centre on the ground; the door faces -z.
const Q = (c, a, b, d, e) => c.quad(...a, ...b, ...d, ...e);
// a square frustum from y0 to y1, half-widths r0 -> r1; faces outward (top/bottom optional)
function frust(c, y0, y1, r0, r1, top = false, bottom = false) {
  const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < 4; i++) { const [ax, az] = P[i], [bx, bz] = P[(i + 1) % 4];
    Q(c, [ax * r0, y0, az * r0], [ax * r1, y1, az * r1], [bx * r1, y1, bz * r1], [bx * r0, y0, bz * r0]); }
  if (top) Q(c, [-r1, y1, -r1], [-r1, y1, r1], [r1, y1, r1], [r1, y1, -r1]);
  if (bottom) Q(c, [-r0, y0, -r0], [r0, y0, -r0], [r0, y0, r0], [-r0, y0, r0]);
}
// a box centred at (x, y, z)
function box(c, x, y, z, w, h, d) { const X = w / 2, Y = h / 2, Z = d / 2;
  Q(c, [x - X, y - Y, z - Z], [x - X, y + Y, z - Z], [x + X, y + Y, z - Z], [x + X, y - Y, z - Z]);
  Q(c, [x + X, y - Y, z + Z], [x + X, y + Y, z + Z], [x - X, y + Y, z + Z], [x - X, y - Y, z + Z]);
  Q(c, [x - X, y - Y, z + Z], [x - X, y + Y, z + Z], [x - X, y + Y, z - Z], [x - X, y - Y, z - Z]);
  Q(c, [x + X, y - Y, z - Z], [x + X, y + Y, z - Z], [x + X, y + Y, z + Z], [x + X, y - Y, z + Z]);
  Q(c, [x - X, y + Y, z - Z], [x - X, y + Y, z + Z], [x + X, y + Y, z + Z], [x + X, y + Y, z - Z]); }
// a flat panel on face f (0 = -z, 1 = +x, 2 = +z, 3 = -x) of a square of half-width r: u along the face, out off it
function onFace(c, f, r, u, y, w, h, out = 0.03) {
  const n = [[0, -1], [1, 0], [0, 1], [-1, 0]][f], t = [[1, 0], [0, 1], [-1, 0], [0, -1]][f];
  const cx = n[0] * (r + out) + t[0] * u, cz = n[1] * (r + out) + t[1] * u, hx = t[0] * w / 2, hz = t[1] * w / 2;
  Q(c, [cx - hx, y, cz - hz], [cx - hx, y + h, cz - hz], [cx + hx, y + h, cz + hz], [cx + hx, y, cz + hz]);
}
export function geometry(c) {
  const p = c.params ?? {}, H = p.h ?? 15, S = p.s ?? 2.2, OPEN = p.open ?? 0, lod = c.lod ?? 1;
  if (lod >= 4) {   // far: the silhouette alone, shaft, glowing lantern, white cap
    const top = S * 0.82, LR = top * 0.78, L1 = H + 3.6;
    c.color("oklch(0.5 0.012 75)"); frust(c, 0, H, S + 0.4, top);
    c.color("oklch(0.9 0.13 75)"); c.emissive?.("oklch(0.82 0.16 65)", 3.2); frust(c, H, L1, LR, LR); c.emissive?.(null);
    c.color("oklch(0.95 0.01 240)"); frust(c, L1, L1 + 3.3, LR + 0.7, 0.08, false, true); return;
  }
  const top = S * 0.82, rAt = (y) => S + (top - S) * (y / H);
  // plinth: two rough steps of dark fieldstone sunk into the ground
  c.albedo("cdn/texture-dark-fieldstone-wall-lichen.png"); c.color("oklch(0.62 0.012 80)");
  frust(c, -1.2, 0.45, S + 0.9, S + 0.8, true); frust(c, 0.45, 0.9, S + 0.45, S + 0.4, true);
  // the shaft, a hair lighter at the foot where hands and carts rub it
  c.color("oklch(0.58 0.012 75)"); frust(c, 0.9, H * 0.35, S, rAt(H * 0.35));
  c.color("oklch(0.52 0.012 75)"); frust(c, H * 0.35, H, rAt(H * 0.35), top);
  // quoins: paler dressed corner stones every 0.9 m
  if (lod > 0.4) { c.albedo("cdn/texture-grey-ashlar-stone-wall.png"); c.color("oklch(0.74 0.01 80)");
    for (let y = 1.1, k = 0; y < H - 0.5; y += 0.9, k++) { const r = rAt(y) + 0.04, L = k % 2 ? 0.7 : 0.45;
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { box(c, sx * (r - L / 2 + 0.02), y + 0.22, sz * r, L, 0.42, 0.1); box(c, sx * r, y + 0.22, sz * (r - L / 2 + 0.02), 0.1, 0.42, L); } } }
  // the door: an oak slab in a stone surround, iron straps
  c.albedo("cdn/texture-grey-ashlar-stone-wall.png"); c.color("oklch(0.7 0.01 80)"); onFace(c, 0, S, 0, 0.9, 1.8, 2.6, 0.06);
  c.albedo("cdn/texture-smoke-dark-oak-planks.png"); c.color("oklch(0.55 0.04 60)"); onFace(c, 0, S, 0, 0.95, 1.3, 2.25, 0.09);
  c.albedo(null); c.color("oklch(0.22 0.01 60)"); for (const y of [1.35, 2.6]) onFace(c, 0, S, 0, y, 1.3, 0.1, 0.1);
  // arrow slits up each face, staggered
  c.color("oklch(0.12 0.01 250)");
  for (let f = 0; f < 4; f++) for (let k = 0; k < 3; k++) { const y = 4 + k * (H - 6) / 3 + (f % 2) * 1.1; if (f === 0 && y < 4.5) continue; onFace(c, f, rAt(y + 0.6), (f % 2 ? 0.4 : -0.4), y, 0.16, 1.1, 0.02); }
  // one warm slit on the -z face: someone keeps the stair lit
  c.color("oklch(0.85 0.12 75)"); c.emissive?.("oklch(0.8 0.14 70)", 1.8); onFace(c, 0, rAt(H * 0.62), 0, H * 0.62, 0.16, 1.0, 0.025); c.emissive?.(null);
  // corbels and the timber hoarding gallery
  c.albedo("cdn/texture-dark-fieldstone-wall-lichen.png"); c.color("oklch(0.6 0.012 80)");
  frust(c, H, H + 0.5, top, top + 0.55, false, false);
  c.albedo("cdn/texture-smoke-dark-oak-planks.png"); c.color("oklch(0.5 0.035 60)");
  const G = top + 0.55; frust(c, H + 0.5, H + 0.75, G, G, true, true);
  // gallery rail: posts and a top rail
  for (let f = 0; f < 4; f++) for (let k = -2; k <= 2; k++) { const n = [[0, -1], [1, 0], [0, 1], [-1, 0]][f], t = [[1, 0], [0, 1], [-1, 0], [0, -1]][f];
    box(c, n[0] * (G - 0.08) + t[0] * k * G / 2.2, H + 1.3, n[1] * (G - 0.08) + t[1] * k * G / 2.2, 0.12, 1.1, 0.12); }
  frust(c, H + 1.8, H + 1.92, G - 0.02, G - 0.02, true, true);
  // the lantern room: a fire cage, iron shutter slats round it, one face thrown open
  const L0 = H + 0.75, L1 = H + 3.6, LR = top * 0.78;
  c.albedo(null); c.color("oklch(0.9 0.13 75)"); c.emissive?.("oklch(0.82 0.16 65)", 3.2); frust(c, L0, L1, LR - 0.15, LR - 0.15); c.emissive?.(null);
  c.albedo("cdn/texture-worn-iron-plate.png"); c.color("oklch(0.42 0.01 60)");
  const slats = lod > 0.4 ? 9 : 4;
  for (let f = 0; f < 4; f++) { const open = f === OPEN;
    for (let i = 0; i < slats; i++) { const y = L0 + 0.15 + i * (L1 - L0 - 0.3) / slats, hh = (L1 - L0 - 0.3) / slats * (open ? 0.25 : 0.82);
      onFace(c, f, LR, 0, y, LR * 2 - 0.1, hh, open ? 0.25 : 0.02); } }
  // corner posts of the cage
  c.albedo(null); c.color("oklch(0.25 0.01 60)");
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(c, sx * LR, (L0 + L1) / 2, sz * LR, 0.18, L1 - L0, 0.18);
  // the roof: a steep slate pyramid, snow on its upper two-thirds, an iron finial
  c.albedo("cdn/texture-mossy-slate-roof.png"); c.color("oklch(0.55 0.02 240)");
  const RR = LR + 0.7, R1 = L1 + 0.6;
  frust(c, L1, L1 + 0.2, RR, RR, false, true); frust(c, L1 + 0.2, R1, RR, RR * 0.66);
  c.albedo("cdn/texture-snow-packed-fresh.png"); c.color("oklch(0.98 0.008 240)");
  frust(c, R1, L1 + 3.3, RR * 0.66 + 0.04, 0.08);
  c.albedo(null); c.color("oklch(0.24 0.01 60)"); box(c, 0, L1 + 3.75, 0, 0.09, 1.0, 0.09); box(c, 0.28, L1 + 4.05, 0, 0.5, 0.28, 0.04);   // a spike and a pennant-shaped iron vane, not a cross
}
export function collider(c) {
  const p = c.params ?? {}, H = p.h ?? 15, S = p.s ?? 2.2, top = S * 0.82;
  frust(c, -1.2, 0.45, S + 0.9, S + 0.8, true); frust(c, 0.45, 0.9, S + 0.45, S + 0.4, true);
  frust(c, 0.9, H, S, top, true);
}
