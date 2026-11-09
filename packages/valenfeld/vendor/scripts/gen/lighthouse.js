// Witness Point's lighthouse (Aurenmar): a tapered whitewashed stone tower on a rough rock footing, a red band
// at mid-height, a corbelled gallery with an iron rail, a glazed lantern room and a slate cone cap.
// params: { h: tower height (24), r: base radius (4) }. Origin = centre of the footing on the ground.
const N = 28;
const Q = (ctx, a, b, c, d) => ctx.quad(...a, ...b, ...c, ...d), T = (ctx, a, b, c) => ctx.tri(...a, ...b, ...c);
function ring(ctx, y0, y1, r0, r1, n = N) {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    Q(ctx, p(a0, r0, y0), p(a0, r1, y1), p(a1, r1, y1), p(a1, r0, y0));
  }
}
function disc(ctx, y, r, up = true, n = N) {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const A = [Math.cos(a0) * r, y, Math.sin(a0) * r], B = [Math.cos(a1) * r, y, Math.sin(a1) * r];
    up ? T(ctx, [0, y, 0], B, A) : T(ctx, [0, y, 0], A, B);
  }
}
export function geometry(ctx) {
  const { h = 24, r = 4 } = ctx.params, top = r * 0.62;
  
  // rock footing
  ctx.albedo("cdn/texture-lichen-spotted-fieldstone.png"); ctx.color("oklch(0.9 0.01 80)");
  ring(ctx, -1.5, 1.2, r * 1.9, r * 1.45, 14); disc(ctx, 1.2, r * 1.45, true, 14);
  // tower shaft, whitewashed, with a red band
  ctx.albedo("cdn/texture-limewash-plaster.png");
  const band0 = h * 0.48, band1 = h * 0.58;
  const rAt = (y) => r + (top - r) * (y / h);
  ctx.color("oklch(0.96 0.01 90)"); ring(ctx, 1.2, band0, rAt(1.2), rAt(band0));
  ctx.color("oklch(0.62 0.16 30)"); ring(ctx, band0, band1, rAt(band0), rAt(band1));
  ctx.color("oklch(0.96 0.01 90)"); ring(ctx, band1, h, rAt(band1), top);
  // windows up the shaft
  ctx.albedo(null); ctx.color("oklch(0.25 0.02 250)");
  for (let k = 0; k < 4; k++) { const y = 4 + k * (h - 6) / 4, rr = rAt(y) + 0.02, a = k * 1.7; const c = Math.cos(a), s = Math.sin(a), tx = -s * 0.35, tz = c * 0.35;
    Q(ctx, [c * rr - tx, y, s * rr - tz], [c * rr + tx, y, s * rr + tz], [c * rr + tx, y + 1.1, s * rr + tz], [c * rr - tx, y + 1.1, s * rr - tz]); }
  // corbelled gallery
  ctx.albedo("cdn/texture-grey-ashlar-stone-wall.png"); ctx.color("oklch(0.92 0.01 80)");
  ring(ctx, h, h + 0.6, top, top + 1.1); disc(ctx, h + 0.6, top + 1.1); ring(ctx, h + 0.35, h + 0.6, top + 1.1, top + 1.1);
  // iron rail
  ctx.albedo(null); ctx.color("oklch(0.25 0.01 60)");
  ring(ctx, h + 1.5, h + 1.62, top + 1.05, top + 1.05); 
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, x = Math.cos(a) * (top + 1.05), z = Math.sin(a) * (top + 1.05);
    Q(ctx, [x - 0.04, h + 0.6, z], [x + 0.04, h + 0.6, z], [x + 0.04, h + 1.6, z], [x - 0.04, h + 0.6 + 1, z]); }
  // lantern room: dark mullions round warm glass
  const lr = top * 0.8, l0 = h + 0.6, l1 = h + 3.4;
  ctx.color("oklch(0.85 0.12 85)"); ctx.emissive?.("oklch(0.85 0.14 80)", 2.5); ring(ctx, l0, l1, lr, lr, 10); ctx.emissive?.(null);
  ctx.color("oklch(0.22 0.01 60)");
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, x = Math.cos(a) * (lr + 0.03), z = Math.sin(a) * (lr + 0.03);
    Q(ctx, [x - 0.06, l0, z], [x + 0.06, l0, z], [x + 0.06, l1, z], [x - 0.06, l1, z]); }
  // slate cone cap and finial
  ctx.albedo("cdn/texture-mossy-slate-roof.png"); ctx.color("oklch(0.7 0.02 240)");
  ring(ctx, l1, l1 + 0.3, lr + 0.4, lr + 0.4, 12); disc(ctx, l1, lr + 0.4, false, 12); ring(ctx, l1 + 0.3, l1 + 2.6, lr + 0.4, 0.05, 12);
  ctx.albedo(null); ctx.color("oklch(0.3 0.02 60)"); ring(ctx, l1 + 2.6, l1 + 3.4, 0.08, 0.02, 6);
}
export function collider(ctx) {
  const { h = 24, r = 4 } = ctx.params;
  ring(ctx, -1.5, 1.2, r * 1.9, r * 1.45, 14); disc(ctx, 1.2, r * 1.45, true, 14);
  ring(ctx, 1.2, h, r, r * 0.62, 14);
}
