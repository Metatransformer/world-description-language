// SHELL KIT: the open-front lean-to. A flagstone floor, a fieldstone back wall, side walls that step down to a
// half-wall at the open front, oak posts with knee braces carrying a beam, one mono-pitch slate slab roof with rafters.
// Hroald's smithy is its golden case: every number below is the smithy's, in its 10 × 10 m frame, scaled by
// w/10 and d/10 (a scale of exactly 1 keeps every float the smithy drew). Anything that stands under it (a forge,
// stalls, a cart) is the caller's.
//   openShed(c, o)            draws the shell
//   openShedColliders(b, o, part)   part "walls" (floor, walls, posts) | "roof"
//   o.pal.WALL / WALLC: the wall texture and tint (default the fieldstone FS / STONE)
//   o = { w = 10, d = 10, eave = 3.45, rise = 1.25, posts = 4, pal: { FS, OAK, SL, FLAG, STONE, WOOD, BX, HX, RB, paint } }
export function shedFrame(o = {}) {
  const sx = (o.w ?? 10) / 10, sz = (o.d ?? 10) / 10, eave = o.eave ?? 3.45, rise = o.rise ?? 1.25;
  const X = (v) => v * sx, Z = (v) => v * sz;
  const yR = (z) => eave + (z + Z(5.7)) / Z(11.1) * rise;   // roof underside over z
  const n = o.posts ?? 4;
  const posts = n === 4 ? [-4.7, -1.9, 1.9, 4.7].map(X) : Array.from({ length: n }, (_, i) => X(-4.7 + 9.4 * i / (n - 1)));
  return { sx, sz, X, Z, yR, posts };
}
export function openShed(c, o = {}) {
  const { FS, OAK, SL, FLAG, STONE, WOOD, BX, HX, RB, paint } = o.pal; const D = c.lod;
  const { X, Z, yR, posts } = shedFrame(o);
  paint(c, FLAG, STONE); BX(c, X(-4.6), -0.2, Z(-5.1), X(4.6), 0.06, Z(4.4));
  const WT = o.pal.WALL ?? FS, WC = o.pal.WALLC ?? STONE;   // wall face: fieldstone unless the caller hands timber or plaster
  paint(c, WT, WC);
  BX(c, X(-5), -0.5, Z(4.4), X(5), yR(Z(5)), Z(5));
  for (const [x0, x1] of [[X(-5), X(-4.4)], [X(4.4), X(5)]]) {
    HX(c, [[x0, -0.5, Z(-0.6)], [x1, -0.5, Z(-0.6)], [x1, -0.5, Z(4.4)], [x0, -0.5, Z(4.4)], [x0, yR(Z(-0.6)), Z(-0.6)], [x1, yR(Z(-0.6)), Z(-0.6)], [x1, yR(Z(4.4)), Z(4.4)], [x0, yR(Z(4.4)), Z(4.4)]]);
    BX(c, x0, -0.5, Z(-4.6), x1, 1.0, Z(-0.6));
  }
  // posts, beam, knee braces
  paint(c, OAK, WOOD);
  for (const x of posts) { BX(c, x - 0.14, 0, Z(-4.99), x + 0.14, 3.25, Z(-4.71)); if (D <= 2) for (const s of [-1, 1]) RB(c, x + s * 0.42, 2.95, Z(-4.85), 0.95, 0.12, 0.12, 0, 0, s * 40); }
  BX(c, X(-5.3), 3.2, Z(-5.05), X(5.3), 3.48, Z(-4.65));
  // roof
  paint(c, SL, "oklch(0.95 0.01 200)");
  HX(c, [[X(-5.5), yR(Z(-5.7)), Z(-5.7)], [X(5.5), yR(Z(-5.7)), Z(-5.7)], [X(5.5), yR(Z(5.4)), Z(5.4)], [X(-5.5), yR(Z(5.4)), Z(5.4)], [X(-5.5), yR(Z(-5.7)) + 0.2, Z(-5.7)], [X(5.5), yR(Z(-5.7)) + 0.2, Z(-5.7)], [X(5.5), yR(Z(5.4)) + 0.2, Z(5.4)], [X(-5.5), yR(Z(5.4)) + 0.2, Z(5.4)]]);
  if (D <= 2) { paint(c, OAK, WOOD); for (let x0 = -4.9; x0 <= 4.91; x0 += 1.1) { const x = X(x0);
    HX(c, [[x - 0.07, yR(Z(-5.6)) - 0.16, Z(-5.6)], [x + 0.07, yR(Z(-5.6)) - 0.16, Z(-5.6)], [x + 0.07, yR(Z(4.4)) - 0.16, Z(4.4)], [x - 0.07, yR(Z(4.4)) - 0.16, Z(4.4)], [x - 0.07, yR(Z(-5.6)), Z(-5.6)], [x + 0.07, yR(Z(-5.6)), Z(-5.6)], [x + 0.07, yR(Z(4.4)), Z(4.4)], [x - 0.07, yR(Z(4.4)), Z(4.4)]]); } }
}
export function openShedColliders(b, o = {}, part = "walls") {
  const { X, Z, yR, posts } = shedFrame(o);
  if (part === "roof") { b(X(-5.5), yR(Z(-1)), Z(-5.7), X(5.5), yR(Z(-1)) + 0.3, Z(5.4)); return; }
  b(X(-4.6), -0.2, Z(-5.1), X(4.6), 0.06, Z(4.4));
  b(X(-5), -0.5, Z(4.4), X(5), 4.7 + ((o.eave ?? 3.45) - 3.45) + ((o.rise ?? 1.25) - 1.25), Z(5)); b(X(-5), -0.5, Z(-0.6), X(-4.4), 4.6 + ((o.eave ?? 3.45) - 3.45), Z(4.4)); b(X(4.4), -0.5, Z(-0.6), X(5), 4.6 + ((o.eave ?? 3.45) - 3.45), Z(4.4)); b(X(-5), -0.5, Z(-4.6), X(-4.4), 1.0, Z(-0.6)); b(X(4.4), -0.5, Z(-4.6), X(5), 1.0, Z(-0.6));
  for (const x of posts) b(x - 0.14, 0, Z(-4.99), x + 0.14, 3.25, Z(-4.71));
}
// the closed front (params.enclosed on the smithy): fieldstone sill, plaster panels, an oak doorway in the middle
// (a door object fills it), two shuttered windows, side half-walls raised to the roof.
// the front's x stretch: the doorway (|x| <= 1) keeps its width, the side walls (|x| >= 4.4) their thickness, the panels take the rest
function frontX(sx) { const W = 5 * sx; return (x) => { const a = Math.abs(x), g = Math.sign(x); return a <= 1 ? x : a >= 4.4 ? g * (W - (5 - a)) : g * (1 + (a - 1) * (W - 1.6) / 3.4); }; }
export function openShedFrontColliders(b, o = {}) {
  const { Z, sx } = shedFrame(o), XF = frontX(sx), B = (x0, y0, z0, x1, y1, z1) => b(XF(x0), y0, Z(z0), XF(x1), y1, Z(z1));
  B(-5, 0, -4.97, -0.75, 3.3, -4.73); B(0.75, 0, -4.97, 5, 3.3, -4.73); B(-0.75, 2.45, -4.97, 0.75, 3.3, -4.73); B(-5, 1.0, -4.73, -4.4, 3.6, -0.6); B(4.4, 1.0, -4.73, 5, 3.6, -0.6);
}
export function openShedFront(c, o = {}) {
  const { FS, OAK, STONE, WOOD, PL, WHITE, IR, IRONC, paint } = o.pal; const D = c.lod; const { Z, yR: yF, sx } = shedFrame(o);
  // authored in the 10 × 10 frame and stretched to w × d: the doorway (|x| ≤ 1) keeps its width, the panels and windows take the rest
  const XF = frontX(sx);
  const yR = (z) => yF(Z(z));
  const BX = (c, x0, y0, z0, x1, y1, z1) => o.pal.BX(c, XF(x0), y0, Z(z0), XF(x1), y1, Z(z1));
  const HX = (c, pts) => o.pal.HX(c, pts.map(([x, y, z]) => [XF(x), y, Z(z)]));
  const PX = [[-5, -3.7], [-2.9, -0.75], [0.75, 2.9], [3.7, 5]];
  paint(c, FS, STONE); BX(c, -5, 0, -4.97, -0.9, 0.9, -4.73); BX(c, 0.9, 0, -4.97, 5, 0.9, -4.73);
  paint(c, PL, WHITE);
  for (const [x0, x1] of PX) BX(c, x0, 0.9, -4.9, x1, 3.2, -4.8);
  for (const s of [-1, 1]) { const a = s < 0 ? -3.7 : 2.9, b = s < 0 ? -2.9 : 3.7; BX(c, a, 0.9, -4.9, b, 1.3, -4.8); BX(c, a, 2.1, -4.9, b, 3.2, -4.8); }
  BX(c, -0.75, 2.45, -4.9, 0.75, 3.2, -4.8);
  if (o.pal.WALL) paint(c, o.pal.WALL, o.pal.WALLC);   // the side walls rise in the shed's own walls when it names them
  for (const [x0, x1] of [[-5, -4.4], [4.4, 5]])
    HX(c, [[x0, 1.0, -4.73], [x1, 1.0, -4.73], [x1, 1.0, -0.6], [x0, 1.0, -0.6], [x0, yR(-4.73), -4.73], [x1, yR(-4.73), -4.73], [x1, yR(-0.6), -0.6], [x0, yR(-0.6), -0.6]]);
  paint(c, OAK, WOOD);
  BX(c, -0.9, 0, -4.98, -0.75, 2.45, -4.72); BX(c, 0.75, 0, -4.98, 0.9, 2.45, -4.72); BX(c, -1.0, 2.45, -5.0, 1.0, 2.62, -4.7);
  BX(c, -5, 0.9, -4.95, 5, 1.0, -4.75);
  for (const [x0, x1] of [[-5, -4.4], [4.4, 5]]) { BX(c, x0 - 0.02, 1.0, -2.7, x1 + 0.02, yR(-2.6), -2.5); BX(c, x0 - 0.02, 1.9, -4.73, x1 + 0.02, 2.0, -0.6); }
  for (const s of [-1, 1]) {
    const a = s < 0 ? -3.7 : 2.9, b = s < 0 ? -2.9 : 3.7;
    BX(c, a - 0.08, 1.22, -5.02, b + 0.08, 1.3, -4.78); BX(c, a - 0.06, 2.1, -4.98, b + 0.06, 2.2, -4.78);
    paint(c, OAK, "oklch(0.86 0.035 55)");
    for (const k of [0, 1]) { const x0 = k ? (a + b) / 2 + 0.005 : a, x1 = k ? b : (a + b) / 2 - 0.005;
      BX(c, x0, 1.3, -4.96, x1, 2.1, -4.9);
      if (D <= 2) { BX(c, x0 + 0.03, 1.42, -4.985, x1 - 0.03, 1.5, -4.96); BX(c, x0 + 0.03, 1.9, -4.985, x1 - 0.03, 1.98, -4.96); } }
    if (D <= 2) { paint(c, IR, IRONC); BX(c, (a + b) / 2 - 0.02, 1.62, -5.0, (a + b) / 2 + 0.02, 1.78, -4.96); }
    paint(c, OAK, WOOD);
  }
}
