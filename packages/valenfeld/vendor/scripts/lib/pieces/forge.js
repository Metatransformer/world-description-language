// PIECES: forge gear. The working kit of a smithy, any forge's: quench trough, smith's worktable, bar-stock rack,
// ore bin, water buckets, a hardy stump with a bick anvil, a hammer rail. Palette factories like the other pieces:
// forgeGear(pal) hands back draw functions in whatever textures and helpers pal carries
// (pal: BX RB LA CY paint flatc metal plain OAK FS IR WOOD STONE STEEL DARK LEATHER).
// Every piece draws at room-space (x, z) on floor y, local +z is "away from the wall" when yaw is 0.
export function forgeGear(pal) {
  const { BX, RB, LA, CY, paint, flatc, metal, plain, OAK, FS, WOOD, STONE, DARK, LEATHER } = pal;
  const rot = (x, z, yaw) => { const a = yaw * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c]; };
  const water = (c) => { flatc(c, "oklch(0.26 0.04 225)"); c.metalness?.(0.2); c.roughness?.(0.06); };

  // a stone quench trough, long axis along z, iron-banded, dark water near the brim, a pair of tongs resting across
  function trough(c, x, z, y = 0, len = 1.5, D = 1) {
    const w = 0.62, h = 0.62, t = 0.1, z0 = z - len / 2, z1 = z + len / 2;
    paint(c, FS, STONE); BX(c, x - w / 2, y, z0, x + w / 2, y + 0.1, z1);
    BX(c, x - w / 2, y, z0, x - w / 2 + t, y + h, z1); BX(c, x + w / 2 - t, y, z0, x + w / 2, y + h, z1);
    BX(c, x - w / 2 + t, y, z0, x + w / 2 - t, y + h, z0 + t); BX(c, x - w / 2 + t, y, z1 - t, x + w / 2 - t, y + h, z1);
    water(c); BX(c, x - w / 2 + t, y + 0.1, z0 + t, x + w / 2 - t, y + h - 0.08, z1 - t); plain(c);
    metal(c, DARK); for (const zz of [z0 + 0.25, z1 - 0.25]) { BX(c, x - w / 2 - 0.015, y + 0.42, zz - 0.03, x + w / 2 + 0.015, y + 0.48, zz + 0.03); }
    RB(c, x, y + h + 0.02, z + 0.2, 0.7, 0.025, 0.03, 0, 0, 0); RB(c, x + 0.04, y + h + 0.02, z + 0.24, 0.7, 0.025, 0.03, 8);
    plain(c);
  }
  // the smith's worktable: thick oak top on trestles, a vise on one end, blades in progress, a file, a hammer, rivets
  function worktable(c, x, z, yaw = 0, D = 1) {
    const p = rot(x, z, yaw), L = 1.7, W = 0.8, H = 0.86, A = yaw;
    paint(c, OAK, WOOD);
    { const [cx, cz] = p(0, 0); RB(c, cx, H - 0.05, cz, L, 0.1, W, A); }
    for (const s of [-1, 1]) { const [lx, lz] = p(s * 0.7, 0); RB(c, lx, 0.4, lz, 0.1, 0.8, W - 0.1, A); }
    { const [sx, sz] = p(0, 0); RB(c, sx, 0.25, sz, L - 0.3, 0.06, 0.08, A); }
    metal(c, DARK);
    { const [vx, vz] = p(0.68, -0.28); RB(c, vx, H + 0.09, vz, 0.18, 0.18, 0.2, A); const [jx, jz] = p(0.68, -0.43); RB(c, jx, H + 0.12, jz, 0.06, 0.12, 0.14, A + 90); }
    metal(c);
    for (let i = 0; i < 3; i++) { const [bx, bz] = p(-0.35 + i * 0.22, 0.05 + (i % 2) * 0.08); RB(c, bx, H + 0.012, bz, 0.06, 0.012, 0.75 - i * 0.08, A + 6 - i * 5); }
    metal(c, DARK);
    { const [fx, fz] = p(0.25, 0.22); RB(c, fx, H + 0.012, fz, 0.32, 0.012, 0.03, A + 20); }
    { const [hx, hz] = p(-0.1, -0.25); plain(c); paint(c, OAK, WOOD); RB(c, hx, H + 0.02, hz, 0.4, 0.03, 0.03, A - 15); metal(c, DARK); const [kx, kz] = p(0.08, -0.3); RB(c, kx, H + 0.04, kz, 0.06, 0.07, 0.12, A - 15); }
    if (D <= 2) { for (let i = 0; i < 9; i++) { const [rx, rz] = p(-0.65 + (i % 3) * 0.04, -0.25 + Math.floor(i / 3) * 0.04); BX(c, rx - 0.008, H, rz - 0.008, rx + 0.008, H + 0.012, rz + 0.008); } }
    // a half-shaped breastplate waiting on the far corner
    metal(c, "oklch(0.6 0.012 250)"); { const [ax, az] = p(-0.55, 0.12); LA(c, ax, H, az, [[0.18, 0], [0.2, 0.06], [0.16, 0.12]], D <= 2 ? 10 : 6, true); }
    plain(c);
  }
  // an upright rack of bar stock and rod against a wall: an oak frame, iron bars leaning in it
  function barRack(c, x, z, yaw = 0, D = 1) {
    const p = rot(x, z, yaw);
    paint(c, OAK, WOOD);
    { const [cx, cz] = p(0, 0); RB(c, cx, 0.06, cz, 1.1, 0.12, 0.45, yaw); const [tx, tz] = p(0, -0.12); RB(c, tx, 1.25, tz, 1.1, 0.08, 0.08, yaw); }
    for (const s of [-1, 1]) { const [px, pz] = p(s * 0.5, -0.12); RB(c, px, 0.65, pz, 0.08, 1.3, 0.08, yaw); }
    metal(c, DARK);
    const n = D <= 2 ? 11 : 6;
    for (let i = 0; i < n; i++) { const [bx, bz] = p(-0.42 + i * (0.84 / (n - 1)), 0.05 + (i % 2) * 0.06); RB(c, bx, 0.12 + 0.72, bz, 0.03 + (i % 3) * 0.012, 1.45 - (i % 4) * 0.1, 0.03 + (i % 3) * 0.012, yaw, -8 - (i % 3) * 2); }
    plain(c);
  }
  // a plank bin heaped with grey-brown ore lumps
  function oreBin(c, x, z, yaw = 0, D = 1) {
    const p = rot(x, z, yaw);
    paint(c, OAK, "oklch(0.5 0.05 55)");
    { const [cx, cz] = p(0, 0); RB(c, cx, 0.05, cz, 0.9, 0.1, 0.7, yaw); }
    for (const [dx, dz, w, d] of [[0, -0.33, 0.9, 0.05], [0, 0.33, 0.9, 0.05], [-0.43, 0, 0.05, 0.7], [0.43, 0, 0.05, 0.7]]) { const [bx, bz] = p(dx, dz); RB(c, bx, 0.3, bz, w, 0.5, d, yaw); }
    paint(c, FS, "oklch(0.48 0.03 60)");
    const n = D <= 2 ? 16 : 7;
    for (let i = 0; i < n; i++) { const a = i * 2.39, r = 0.05 + (i % 4) * 0.08; const [ox, oz] = p(Math.cos(a) * r, Math.sin(a) * r * 0.8); const s = 0.12 + (i % 3) * 0.04;
      RB(c, ox, 0.48 + (3 - (i % 4)) * 0.03, oz, s, s * 0.8, s * 0.9, i * 41, i * 17, i * 23); }
    plain(c);
  }
  // a wooden bucket, iron-hooped, water inside
  function bucket(c, x, z, y = 0, D = 1) {
    paint(c, OAK, "oklch(0.55 0.06 55)"); LA(c, x, y, z, [[0.15, 0], [0.18, 0.32]], D <= 2 ? 12 : 8, false);
    paint(c, OAK, "oklch(0.45 0.05 55)"); LA(c, x, y, z, [[0, 0], [0.15, 0]], D <= 2 ? 12 : 8, false);
    water(c); LA(c, x, y + 0.25, z, [[0, 0], [0.17, 0]], D <= 2 ? 12 : 8, false);
    metal(c, DARK); for (const h of [0.06, 0.25]) LA(c, x, y + h, z, [[0.158 + h * 0.09, 0], [0.162 + h * 0.09, 0.03]], D <= 2 ? 12 : 8, false);
    plain(c);
  }
  // a hardy stump with a small bick anvil and a sledge leaning on it
  function bickStump(c, x, z, yaw = 0, D = 1) {
    const p = rot(x, z, yaw);
    paint(c, OAK, "oklch(0.5 0.06 55)"); CY(c, x, 0, z, 0.26, 0.62, D <= 2 ? 12 : 8);
    metal(c, DARK); RB(c, x, 0.7, z, 0.14, 0.16, 0.34, yaw); { const [hx, hz] = p(0, 0.24); RB(c, hx, 0.72, hz, 0.08, 0.1, 0.16, yaw, -20); }
    RB(c, x, 0.8, z, 0.2, 0.04, 0.4, yaw);
    paint(c, OAK, WOOD); { const [sx, sz] = p(0.32, 0); RB(c, sx, 0.42, sz, 0.04, 0.85, 0.04, yaw, 0, -14); }
    metal(c, DARK); { const [kx, kz] = p(0.22, 0); RB(c, kx, 0.06, kz, 0.1, 0.1, 0.22, yaw); }
    plain(c);
  }
  // an oak rail on a wall with hammers, tongs and punches hung from pegs (wall at local -z)
  function hammerRail(c, x, z, y = 1.6, yaw = 0, n = 7, D = 1) {
    const p = rot(x, z, yaw);
    paint(c, OAK, WOOD); { const [cx, cz] = p(0, 0.04); RB(c, cx, y, cz, n * 0.22 + 0.2, 0.12, 0.06, yaw); }
    for (let i = 0; i < n; i++) {
      const dx = -((n - 1) * 0.22) / 2 + i * 0.22, [hx, hz] = p(dx, 0.1);
      paint(c, OAK, WOOD); BX(c, hx - 0.012, y - 0.02, hz - 0.012, hx + 0.012, y + 0.02, hz + 0.012);
      const k = i % 3;
      if (k === 0) { plain(c); paint(c, OAK, WOOD); RB(c, hx, y - 0.22, hz, 0.03, 0.4, 0.03, yaw); metal(c, DARK); RB(c, hx, y - 0.44, hz, 0.14, 0.06, 0.06, yaw); }
      else if (k === 1) { metal(c, DARK); RB(c, hx - 0.02, y - 0.25, hz, 0.02, 0.5, 0.02, yaw, 0, 4); RB(c, hx + 0.02, y - 0.25, hz, 0.02, 0.5, 0.02, yaw, 0, -4); }
      else { metal(c, DARK); RB(c, hx, y - 0.14, hz, 0.025, 0.26, 0.025, yaw); }
    }
    plain(c);
  }
  const clean = (f) => (c, ...a) => { plain(c); f(c, ...a); plain(c); };   // every piece starts and ends with plain finish, so no metal sheen leaks in or out
  return Object.fromEntries(Object.entries({ trough, worktable, barRack, oreBin, bucket, bickStump, hammerRail }).map(([k, f]) => [k, clean(f)]));
}
