// A gatherable plant, one mesh: its parts are frusta (a cone is rt 0) listed per form in kits.yml (herb: params.forms).
// Drawn white: the row's material.color is the plant's colour, so scripts/ingredient.js recolours and shrinks it on picking.
function frustum(ctx, [ox, oy, oz], h, rb, rt, n) {
  const P = (r, y, i) => { const a = (i / n) * Math.PI * 2; return [ox + Math.sin(a) * r, oy + y, oz + Math.cos(a) * r]; };
  const T = (a, b, c) => ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  const C0 = [ox, oy, oz], C1 = [ox, oy + h, oz];
  for (let i = 0; i < n; i++) {
    const a = P(rb, 0, i), b = P(rb, 0, i + 1);
    if (rt > 0) { const c = P(rt, h, i + 1), d = P(rt, h, i); T(a, b, c); T(a, c, d); T(C1, d, c); } else T(a, b, C1);
    T(C0, b, a);
  }
}
import KITS from "../lib/data/kits.json";
const DEF = KITS.sets.base.herb.params;
export function geometry(ctx) {
  const p = { ...DEF, ...(ctx.params ?? {}) }, parts = (p.forms ?? DEF.forms)[p.form ?? "herb"] ?? [];
  for (const q of parts) frustum(ctx, q.at ?? [0, 0, 0], q.h, q.rb, q.rt ?? 0, q.n ?? 5);
}
