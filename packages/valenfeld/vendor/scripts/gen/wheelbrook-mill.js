// WHEELBROOK MILL (#229): a two-storey fieldstone mill, smoke-dark oak frame, mossy slate roof with a
// chimney, plank door on the front (-Z), shuttered windows, a wheel pit and timber flume on the west (-X)
// side where the wheel (scripts/gen/wheelbrook-wheel.js) turns. Origin = ground at the footprint centre.
import { kit } from "./barrow-kit.js";
const TX = {
  stone: "cdn/texture-fieldstone-wall-lichen.png", oak: "cdn/texture-dark-oak-planks-weathered.png",
  slate: "cdn/texture-mossy-slate-roof.png", plaster: "cdn/texture-limewash-plaster.png", iron: "cdn/texture-wrought-iron.png",
};
const W = 8, D = 6.4, H = 5.6, T = 0.5; // footprint, eave height, wall thickness
function build(ctx, col) {
  const K = kit(ctx, col), lod = col ? 4 : ctx.lod, hw = W / 2, hd = D / 2;
  // plinth
  K.paint(TX.stone, "oklch(0.82 0.01 80)");
  K.bbox(-hw - 0.25, -0.8, -hd - 0.25, hw + 0.25, 0.25, hd + 0.25, 0.05);
  // walls: front with door gap (x -0.65..0.65, h 2.3), side windows as gaps on the upper floor
  K.paint(TX.stone, "oklch(0.9 0.015 85)");
  K.box(-hw, 0.25, -hd, -0.65, H, -hd + T); K.box(0.65, 0.25, -hd, hw, H, -hd + T); K.box(-0.65, 2.55, -hd, 0.65, H, -hd + T);
  K.box(-hw, 0.25, hd - T, hw, H, hd);
  K.box(-hw, 0.25, -hd + T, -hw + T, H, hd - T); K.box(hw - T, 0.25, -hd + T, hw, H, hd - T);
  // gables
  const R = 2.6;
  for (const z of [-hd, hd - T]) { K.quad([-hw, H, z], [hw, H, z], [0, H + R, z], [0, H + R, z], [0, H, z + (z < 0 ? T : -T) / 2]); }
  if (!col) for (const z of [-hd - 0.001, hd + 0.001]) K.tri([-hw, H, z], [hw, H, z], [0, H + R, z], [0, H + R * 0.5, 0]);
  // floor + inner floor
  K.paint(TX.oak, "oklch(0.75 0.03 60)"); K.box(-hw + T, 0.25, -hd + T, hw - T, 0.3, hd - T);
  if (!col) {
    // oak corner posts and a mid beam band
    K.paint(TX.oak, "oklch(0.6 0.03 55)");
    for (const x of [-hw, hw]) for (const z of [-hd, hd]) K.bbox(x - 0.18, 0.25, z - 0.18, x + 0.18, H, z + 0.18);
    K.bbox(-hw - 0.08, 2.9, -hd - 0.08, hw + 0.08, 3.15, -hd + 0.1); K.bbox(-hw - 0.08, 2.9, hd - 0.1, hw + 0.08, 3.15, hd + 0.08);
    // door frame, plank door ajar, lintel
    K.bbox(-0.8, 0.25, -hd - 0.1, -0.62, 2.6, -hd + 0.05); K.bbox(0.62, 0.25, -hd - 0.1, 0.8, 2.6, -hd + 0.05); K.bbox(-0.9, 2.55, -hd - 0.12, 0.9, 2.8, -hd + 0.05);
    K.paint(TX.oak, "oklch(0.7 0.04 55)");
    K.at(() => { K.box(0, 0, -0.03, 1.25, 2.25, 0.03); K.paint(TX.iron, "oklch(0.5 0 0)", 0.6, 0.8); for (const y of [0.4, 1.8]) K.box(0.05, y, -0.05, 1.0, y + 0.07, 0.05); }, -0.62, 0.3, -hd + 0.25, -70);
    // windows: dark glass behind frames, shutters open
    const win = (x, y, z, face) => K.at(() => {
      K.paint(null, "#1a1a1e", 0.2); K.box(-0.45, 0, 0, 0.45, 1.0, 0.04);
      K.paint(TX.oak, "oklch(0.62 0.03 55)"); K.bbox(-0.55, -0.12, -0.12, 0.55, 0, 0.06); K.bbox(-0.55, 1.0, -0.1, 0.55, 1.1, 0.06);
      K.box(-0.04, 0, -0.03, 0.04, 1.0, 0.0); K.box(-0.45, 0.48, -0.03, 0.45, 0.54, 0);
      K.paint(TX.oak, "oklch(0.55 0.08 145)"); K.box(-1.05, 0, -0.08, -0.55, 1.0, -0.04); K.box(0.55, 0, -0.08, 1.05, 1.0, -0.04);
    }, x, y, z, face);
    win(-2.4, 3.6, -hd - 0.01, 0); win(2.4, 3.6, -hd - 0.01, 0); win(2.3, 1.2, -hd - 0.01, 0);
    win(hw + 0.01, 3.6, 0, 90); win(-1.5, 3.6, hd + 0.01, 180);
  }
  // roof: two slate planes with eaves, ridge cap
  K.paint(TX.slate, "oklch(0.88 0.02 150)", 0.95);
  const ov = 0.5, e = H - 0.25;
  for (const s of [-1, 1]) {
    const A = [s * (hw + ov), e, -hd - ov], B = [0, H + R + 0.15, -hd - ov], C = [0, H + R + 0.15, hd + ov], E = [s * (hw + ov), e, hd + ov];
    K.quad(A, B, C, E, [0, H, 0]); if (!col) { const lift = (p) => [p[0], p[1] + 0.14, p[2]]; K.quad(lift(A), lift(B), lift(C), lift(E), [0, 0, 0]); }
  }
  if (!col) {
    K.paint(TX.slate, "oklch(0.6 0.02 150)"); K.seg([0, H + R + 0.25, -hd - ov], [0, H + R + 0.25, hd + ov], 0.14, 0.14, 6, true);
    // chimney on the east slope
    K.paint(TX.stone, "oklch(0.8 0.01 80)"); K.bbox(2.2, H, 1.2, 3.0, H + R + 1.4, 2.0, 0.05);
    K.paint(null, "#120e0c", 1); K.box(2.35, H + R + 1.39, 1.35, 2.85, H + R + 1.41, 1.85);
    // flume: a timber trough on trestles running from the pond (-X) over the wheel
    K.paint(TX.oak, "oklch(0.62 0.03 55)");
    const fy = 5.4;
    K.box(-hw - 7, fy, -0.55, -hw - 0.6, fy + 0.08, 0.55); K.box(-hw - 7, fy, -0.62, -hw - 0.6, fy + 0.55, -0.55); K.box(-hw - 7, fy, 0.55, -hw - 0.6, fy + 0.55, 0.62);
    for (const x of [-hw - 6.5, -hw - 4.2]) for (const z of [-0.5, 0.5]) K.seg([x, -0.6, z], [x, fy, z], 0.1, 0.09, 6);
    K.paint(null, "oklch(0.55 0.06 220 / 0.85)", 0.05); K.box(-hw - 7, fy + 0.09, -0.54, -hw - 0.6, fy + 0.35, 0.54);
    // wheel pit walls
    K.paint(TX.stone, "oklch(0.75 0.01 80)");
    K.box(-hw - 2.4, -1.2, -1.3, -hw, 0.5, -0.9); K.box(-hw - 2.4, -1.2, 0.9, -hw, 0.5, 1.3);
    // sacks and a bench by the door
    K.paint(null, "oklch(0.72 0.04 80)", 1);
    for (const [x, z] of [[2.6, -hd - 0.9], [3.1, -hd - 0.7], [2.85, -hd - 0.8]]) K.rock(x, 0.6, z, 0.28, 0.35, 0.22, 7, 5, 0.1);
    K.paint(TX.oak, "oklch(0.7 0.03 60)"); K.bbox(-3.2, 0.68, -hd - 0.75, -1.6, 0.76, -hd - 0.4); for (const x of [-3.0, -1.8]) K.box(x - 0.05, 0.25, -hd - 0.7, x + 0.05, 0.68, -hd - 0.45);
    // lichen-mossed rocks at the plinth
    K.paint(TX.stone, "oklch(0.7 0.04 135)");
    for (let k = 0; k < (lod <= 2 ? 14 : 6); k++) { const a = ctx.random() * 6.283; K.rock(Math.cos(a) * (hw + 0.6), 0.15, Math.sin(a) * (hd + 0.6), 0.25 + ctx.random() * 0.2, 0.18, 0.25, 6, 4, 0.3); }
  }
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
