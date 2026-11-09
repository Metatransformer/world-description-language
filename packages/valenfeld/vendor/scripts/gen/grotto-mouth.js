// THE GROTTO MOUTH: a black basalt sea-cliff of hexagonal columns on the Saltmarch shore, a cave cut into it
// holding the portal in a smugglers' timber frame, a plank walk with a rope rail up to it, braziers either side,
// a lantern on a pole, lobster pots, a beached rowboat. Origin = sand at the gate's foot; front -Z.
import { kit } from "./barrow-kit.js";
import { sea, TX, rng } from "./grotto-kit.js";
const PW = 2.3, PH = 4.4, PZ0 = -1, PZ1 = 7, DECK = 0.2, GATE_Z = 3; // passage half-width, height, depth, deck top
const R = 0.82, DX = R * Math.sqrt(3), DZ = R * 1.5; // hex column radius and grid
function H(x, z, r) { // column top height: a ridge rising to the back, stepping down to a causeway at the front
  const back = 5.2 + 0.5 * (z + 1), side = 1 - 0.55 * Math.pow(Math.min(1, Math.abs(x) / 17), 2);
  let h = back * side + (r() - 0.5) * 1.6;
  if (z < 1.5 && Math.abs(x) > PW + 2.2) h = 0.6 + (Math.abs(x) - PW) * 0.18 + r() * 1.4 + Math.max(0, z + 2) * 0.9; // the stepped causeway
  return Math.max(0.5, h);
}
function build(ctx, col) {
  const K = kit(ctx, col), S = sea(K, ctx, col), lod = col ? 4 : ctx.lod, r = rng(7151);
  const rock = (c = "oklch(0.86 0.01 230)") => K.paint(TX.rock, c, 0.45);
  // ---- the basalt columns
  rock();
  const tops = [];
  for (let j = 0; ; j++) {
    const z = -2 + j * DZ; if (z > 21) break;
    for (let i = -11; i <= 11; i++) {
      const x = i * DX + (j % 2 ? DX / 2 : 0), rr = r(), h = H(x, z, r);
      if (Math.abs(x) > 17 + rr * 2) continue;
      if (z < -1.2 && Math.abs(x) < PW + 2.6) continue; // the cove before the mouth stays open
      const inPass = Math.abs(x) < PW + R * 0.6 && z < PZ1 + R;
      const y0 = inPass ? PH : -0.4, top = inPass ? Math.max(h, PH + 1.6 + rr * 1.2) : h;
      const rad = R * (0.97 - rr * 0.05);
      if (!col && lod <= 2) { // a darker wet foot, a bevelled lighter top
        K.paint(TX.rock, "oklch(0.7 0.012 220)", 0.25); if (!inPass) K.seg([x, y0, z], [x, Math.min(top, 1.1), z], rad + 0.01, rad + 0.01, 6);
        rock(); K.seg([x, inPass ? y0 : Math.min(top, 1.1), z], [x, top - 0.08, z], rad, rad, 6);
        K.paint(TX.rock, "oklch(0.95 0.01 230)", 0.6); K.seg([x, top - 0.08, z], [x, top, z], rad, rad * 0.86, 6, true);
        if (inPass) K.seg([x, y0 - 0.06, z], [x, y0, z], rad * 0.86, rad, 6, true);
      } else K.seg([x, y0, z], [x, top, z], rad, rad, 6, true);
      if (!inPass && z < 1) tops.push([x, z, rad]);
    }
  }
  // ---- the passage: shingle floor, wall linings, ceiling, back wall
  K.paint(TX.floor, "oklch(0.8 0.01 220)", 0.3);
  K.box(-PW, -0.3, PZ0 - 1.5, PW, 0.02, PZ1);
  rock("oklch(0.78 0.01 220)");
  for (const s of [-1, 1]) K.box(s * PW, -0.3, PZ0, s * (PW + 0.5), PH + 0.3, PZ1 + 0.3);
  K.box(-PW - 0.5, PH, PZ0, PW + 0.5, PH + 0.5, PZ1 + 0.3);
  K.box(-PW, -0.3, PZ1, PW, PH, PZ1 + 0.5);
  if (!col && lod <= 2) { // jagged rock bosses on the linings
    rock("oklch(0.72 0.012 220)");
    for (let z = PZ0 + 0.4; z < PZ1; z += 1.1) for (const s of [-1, 1]) K.rock(s * (PW - 0.05), 0.6 + ctx.random() * 3, z, 0.25, 0.5 + ctx.random() * 0.5, 0.45, 6, 4, 0.3);
    for (let z = PZ0 + 0.5; z < PZ1; z += 1.4) K.rock((ctx.random() - 0.5) * 3, PH - 0.05, z, 0.5, 0.25, 0.45, 6, 4, 0.3);
  }
  // ---- the smugglers' timber frame round the portal, boarded either side
  S.oak();
  for (const s of [-1, 1]) K.box(s * 1.22, DECK, GATE_Z - 0.2, s * 1.5, 3.5, GATE_Z + 0.2);
  K.box(-1.65, 3.2, GATE_Z - 0.22, 1.65, 3.52, GATE_Z + 0.22);
  if (!col) for (const s of [-1, 1]) K.seg([s * 1.36, 2.55, GATE_Z - 0.25], [s * 0.6, 3.2, GATE_Z - 0.25], 0.06, 0.06, 5);
  S.wood(TX.plank, "oklch(0.8 0.03 70)");
  for (const s of [-1, 1]) {
    if (col) K.box(s * 1.5, 0, GATE_Z - 0.06, s * PW, PH, GATE_Z + 0.06);
    else for (let x = 1.5; x < PW - 0.01; x += 0.27) K.box(s * x, 0, GATE_Z - 0.05 - (x * 7 % 0.03), s * Math.min(PW, x + 0.25), PH - 0.1 * ((x * 13) % 1), GATE_Z + 0.05);
  }
  if (col) K.box(-1.5, 3.52, GATE_Z - 0.06, 1.5, PH, GATE_Z + 0.06);
  else for (let x = -1.5; x < 1.5; x += 0.27) K.box(x, 3.52, GATE_Z - 0.05, Math.min(1.5, x + 0.25), PH, GATE_Z + 0.05);
  // ---- the plank walk, on posts, up to the frame, a rope rail along its east side
  S.walk([[0, -17], [0.4, -9], [0, -2], [0, GATE_Z - 0.25]], DECK, 1.7, 0.7);
  if (!col) {
    const rail = [[1.05, -16.5], [1.2, -12.5], [1.35, -9], [1.15, -5.5], [0.95, -2]];
    for (let k = 0; k < rail.length; k++) { S.oak(); K.seg([rail[k][0], -0.4, rail[k][1]], [rail[k][0], 1.15, rail[k][1]], 0.07, 0.06, 6, true); }
    for (let k = 0; k < rail.length - 1; k++) for (const y of [1.05, 0.6]) S.rope([rail[k][0], y, rail[k][1]], [rail[k + 1][0], y, rail[k + 1][1]], 0.12);
    // barnacles and kelp along the front columns' feet and the walk posts
    for (const [x, z, rad] of tops) { S.barnacles(x, 0, 0.9, z, rad, lod <= 1 ? 10 : 5); if (ctx.random() < 0.6) S.kelp(x + (ctx.random() - 0.5), 0.02, z - rad - 0.1, 0.8 + ctx.random() * 1.2, 160 + ctx.random() * 40); }
    for (let z = -16; z < 2; z += 1.5) S.barnacles(0.69, -0.1, 0.25, z, 0.08, 4);
    for (let k = 0; k < 10; k++) S.kelp(-2 + ctx.random() * 4, 0.03, -1.5 - ctx.random() * 3, 0.6 + ctx.random(), ctx.random() * 360);
    S.net([-PW + 0.05, 0.4, -0.6], [0, 0, 2.8], [0, 2.2, 0], [1, 0, 0], 0.15);
  }
  // ---- braziers either side of the mouth, a lantern pole by the walk
  S.brazier(-3.3, 0, -2.4); S.brazier(3.3, 0, -2.4);
  S.oak(); K.seg([-1.4, -0.3, -8], [-1.4, 3.3, -8], 0.08, 0.065, 7, true);
  if (!col) { K.seg([-1.4, 3.1, -8], [-0.75, 3.1, -8], 0.04, 0.04, 5, true); S.iron(); K.seg([-0.8, 3.1, -8], [-0.8, 2.85, -8], 0.01, 0.01, 3); S.lanternBody(-0.8, 2.6, -8); }
  // ---- lobster pots, crates and a barrel by the cove; the beached rowboat
  S.pot(-3.6, 0, -5.5, 20); S.pot(-4.2, 0, -6.4, -15); S.pot(-3.9, 0.3, -5.9, 5); S.pot(3.6, 0, -6.2, 70);
  S.crate(2.8, 0, -4.4, 0.7, 12); S.barrel(3.9, 0, -3.9);
  K.at(() => S.hull(4.4, 1.5, 0.62, 0), 5.8, 0.15, -10.5, 28, 0, 14);
  if (!col) { S.oak(); K.seg([4.6, 0.25, -9.2], [6.9, 0.35, -12.5], 0.035, 0.03, 5, true); S.rope([5.0, 0.4, -8.6], [1.0, 0.25, -7], 0.05); }
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
