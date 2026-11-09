// The camp's props, one script for the set: params.kind = fire | seat | rack | crate | cart.
import { G, rng, TEX, mossyRock } from "../lib/geo.js";
const K = {
  fire(g, ctx) {
    const R = rng(5);
    for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.283, r = 0.78; mossyRock(g, [Math.cos(a) * r, 0.08, Math.sin(a) * r], [0.2 + R() * 0.06, 0.16, 0.16], 1, i, { rock: TEX.rock, rockTint: "oklch(0.8 0.01 60)", amp: 0.3 }); }
    ctx.color("oklch(0.32 0.01 60)"); for (const t of g.blob([0, -0.02, 0], [0.65, 0.07, 0.65], 1, 0.2, 2, 1, -0.1)) g.tri(t[0], t[1], t[2]);
    ctx.smooth(); ctx.albedo(TEX.log);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 + 0.3; ctx.color(i % 2 ? "oklch(0.55 0.02 50)" : "oklch(0.75 0.03 55)"); g.tube([[Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55, 0.07], [Math.cos(a) * 0.08, 0.38, Math.sin(a) * 0.08, 0.05]], 6, { capA: true, capB: true }); }
    // spit: two forked sticks and a crossbar
    ctx.color("oklch(0.9 0.02 60)");
    for (const x of [-0.95, 0.95]) { g.tube([[x, -0.2, 0, 0.035], [x, 1.1, 0, 0.03]], 5); g.tube([[x, 1.0, 0, 0.02], [x, 1.2, 0.1, 0.015]], 4); g.tube([[x, 1.0, 0, 0.02], [x, 1.2, -0.1, 0.015]], 4); }
    g.tube([[-1.15, 1.08, 0, 0.022], [1.15, 1.08, 0, 0.022]], 5, { capA: true, capB: true });
    ctx.albedo(TEX.iron); ctx.color("oklch(0.9 0 0)"); g.tube([[0, 1.07, 0, 0.0], [0, 0.98, 0, 0.18], [0, 0.72, 0, 0.2], [0, 0.6, 0, 0.0]], 10);
  },
  seat(g, ctx) {
    ctx.smooth(); ctx.albedo(TEX.log); ctx.color("oklch(0.92 0.02 60)");
    g.tube([[-0.9, 0.22, 0, 0.24], [0.9, 0.22, 0, 0.22]], 9, { rough: (th) => (Math.sin(th) > 0.75 ? 0.82 : 1) });
    ctx.flat(); ctx.albedo(null); ctx.color("oklch(0.62 0.07 70)");
    for (const [x, s] of [[-0.9, -1], [0.9, 1]]) for (let i = 0; i < 9; i++) { const a0 = i / 9 * 6.283, a1 = (i + 1) / 9 * 6.283, r = 0.23, A = [x, 0.22 + Math.cos(a0) * r, Math.sin(a0) * r], B = [x, 0.22 + Math.cos(a1) * r, Math.sin(a1) * r]; s > 0 ? g.tri([x, 0.22, 0], A, B) : g.tri([x, 0.22, 0], B, A); }
  },
  rack(g, ctx) {
    ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.92 0.02 60)");
    for (const x of [-0.9, 0.9]) { g.tube([[x, -0.1, -0.35, 0.045], [x, 1.5, 0, 0.04]], 6); g.tube([[x, -0.1, 0.35, 0.045], [x, 1.5, 0, 0.04]], 6); }
    g.tube([[-1.05, 1.42, 0, 0.04], [1.05, 1.42, 0, 0.04]], 6, { capA: true, capB: true });
    g.tube([[-1.0, 0.35, -0.25, 0.035], [1.0, 0.35, -0.25, 0.035]], 6, { capA: true, capB: true });
    const R = rng(9);
    for (let i = 0; i < 5; i++) {
      const x = -0.7 + i * 0.35, tilt = (R() - 0.5) * 0.12;
      ctx.albedo(TEX.oak); ctx.color("oklch(0.85 0.03 55)");
      if (i % 2 === 0) { g.tube([[x, 0.02, -0.3, 0.025], [x + tilt, 1.9, 0.05, 0.022]], 5); ctx.albedo(TEX.iron); ctx.color("oklch(0.92 0 0)"); g.tube([[x + tilt, 1.88, 0.05, 0.03], [x + tilt * 1.08, 2.2, 0.08, 0.001]], 4); }
      else { ctx.albedo(TEX.iron); ctx.color("oklch(0.95 0 0)"); ctx.flat(); g.at({ m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [x, 0, -0.27] }, () => { g.box(0, 0.62, 0.12, 0.05, 1.0, 0.012); g.box(0, 1.15, 0.2, 0.22, 0.035, 0.04); ctx.albedo(TEX.oak); g.box(0, 1.3, 0.22, 0.04, 0.24, 0.04); }); ctx.smooth(); }
    }
    ctx.albedo(TEX.oak); ctx.color("oklch(0.6 0.12 40)"); ctx.flat();
    for (const t of g.blob([0.9, 0.3, 0.45], [0.32, 0.32, 0.06], 1, 0.05, 1, 4)) g.tri(t[0], t[1], t[2]); // a round shield leaning
  },
  crate(g, ctx) {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.93 0.03 70)");
    const s = 0.8; g.box(0, s / 2, 0, s, s, s);
    ctx.color("oklch(0.75 0.03 60)");
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.box(sx * (s / 2 - 0.04), s / 2, sz * (s / 2 - 0.04), 0.1, s + 0.02, 0.1);
    for (const y of [0.05, s - 0.05]) { g.box(0, y, s / 2, s, 0.1, 0.03); g.box(0, y, -s / 2, s, 0.1, 0.03); g.box(s / 2, y, 0, 0.03, 0.1, s); g.box(-s / 2, y, 0, 0.03, 0.1, s); }
    g.at({ m: [0.7071, -0.7071, 0, 0.7071, 0.7071, 0, 0, 0, 1], t: [0, s / 2, s / 2 + 0.01] }, () => g.box(0, 0, 0, 0.1, s * 1.25, 0.02));
  },
  cart(g, ctx) {
    ctx.albedo(TEX.oak); ctx.color("oklch(0.92 0.03 65)");
    const by = 0.75;
    g.box(0, by, 0, 1.4, 0.08, 2.6);
    for (const s of [-1, 1]) { g.box(s * 0.68, by + 0.3, 0, 0.06, 0.5, 2.6); g.box(0, by + 0.3, s * 1.28, 1.4, 0.5, 0.06); }
    for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) g.box(s * 0.7, by + 0.3, i * 0.6, 0.08, 0.62, 0.08);
    // shafts resting on the ground ahead
    ctx.smooth();
    for (const s of [-1, 1]) g.tube([[s * 0.45, by - 0.02, -1.2, 0.05], [s * 0.42, 0.05, -3.0, 0.045]], 6, { capB: true });
    g.tube([[-0.9, 0.55, 0.2, 0.05], [0.9, 0.55, 0.2, 0.05]], 6, { capA: true, capB: true });
    // wheels, spoked, iron-rimmed
    for (const s of [-1, 1]) {
      const x = s * 0.82, c = [x, 0.55, 0.2];
      ctx.albedo(TEX.iron); ctx.color("oklch(0.85 0 0)");
      const rim = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * 6.283; rim.push([x, c[1] + Math.cos(a) * 0.52, c[2] + Math.sin(a) * 0.52, 0.05]); }
      g.tube(rim, 6);
      ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.03 60)");
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; g.tube([[x, c[1], c[2], 0.03], [x, c[1] + Math.cos(a) * 0.5, c[2] + Math.sin(a) * 0.5, 0.025]], 4); }
      g.tube([[x - s * 0.1, c[1], c[2], 0.09], [x + s * 0.08, c[1], c[2], 0.09]], 8, { capA: true, capB: true });
    }
    // the stolen goods: sacks, a barrel, a chest corner
    ctx.flat(); ctx.albedo(TEX.canvas);
    const R = rng(3);
    for (let i = 0; i < 4; i++) { ctx.color(`oklch(${(0.88 + R() * 0.08).toFixed(2)} 0.04 80)`); for (const t of g.blob([-0.3 + (i % 2) * 0.55, by + 0.32, -0.8 + Math.floor(i / 2) * 0.6], [0.3, 0.28, 0.24], 1, 0.15, 1.4, i, -0.5)) g.tri(t[0], t[1], t[2]); }
    ctx.smooth(); ctx.albedo(TEX.oak); ctx.color("oklch(0.9 0.04 60)");
    g.tube([[0.15, by + 0.05, 0.75, 0.0], [0.15, by + 0.05, 0.75, 0.3], [0.15, by + 0.4, 0.75, 0.36], [0.15, by + 0.75, 0.75, 0.3], [0.15, by + 0.75, 0.75, 0.0]], 10);
    ctx.albedo(TEX.iron); ctx.color("oklch(0.85 0 0)");
    for (const y of [0.15, 0.62]) g.tube([[0.15, by + y, 0.75, 0.335], [0.15, by + y + 0.05, 0.75, 0.34]], 10);
  },
};
export function geometry(ctx) { const g = new G(ctx); K[ctx.params.kind ?? "crate"](g, ctx); ctx.albedo(null); ctx.color(null); ctx.flat(); }
export function collider(ctx) {
  const k = ctx.params.kind ?? "crate";
  if (k === "fire") return { kind: "cylinder", radiusTop: 0.9, radiusBottom: 0.9, height: 0.25 };
  if (k === "seat") return { kind: "box", width: 1.8, height: 0.44, depth: 0.45 };
  if (k === "rack") return { kind: "box", width: 2.1, height: 1.6, depth: 0.8 };
  if (k === "cart") return [{ kind: "box", width: 1.8, height: 1.3, depth: 2.7, center: [0, 0.65, 0] }];
  return { kind: "box", width: 0.8, height: 0.8, depth: 0.8 };
}
