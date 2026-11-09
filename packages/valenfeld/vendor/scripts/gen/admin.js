// The admin galleries' pieces, one generator: params.kind = floor | dais | plinth | pad | pylon.
// Dark polished stone, worn brass. Origin at the feet, metres.
const STONE = ["#1d1f22", "#202326", "#1a1c1f", "#23262a"], BRASS = "#b48a46";
function box(ctx, x0, y0, z0, x1, y1, z1) {
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0);   // top
  ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1);   // bottom
  ctx.quad(x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0);   // -z
  ctx.quad(x1, y0, z1, x1, y1, z1, x0, y1, z1, x0, y0, z1);   // +z
  ctx.quad(x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1);   // +x
  ctx.quad(x0, y0, z1, x0, y1, z1, x0, y1, z0, x0, y0, z0);   // -x
}
function prism(ctx, n, R, y0, y1, rot = Math.PI / n) {
  const p = Array.from({ length: n + 1 }, (_, i) => { const a = rot + i * 2 * Math.PI / n; return [Math.cos(a) * R, Math.sin(a) * R]; });
  for (let i = 0; i < n; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    ctx.tri(0, y1, 0, bx, y1, bz, ax, y1, az);
    ctx.quad(ax, y0, az, ax, y1, az, bx, y1, bz, bx, y0, bz);
  }
}
function ring(ctx, n, r0, r1, y, rot = Math.PI / n) {
  for (let i = 0; i < n; i++) {
    const a = rot + i * 2 * Math.PI / n, b = rot + (i + 1) * 2 * Math.PI / n;
    ctx.quad(Math.cos(a) * r0, y, Math.sin(a) * r0, Math.cos(b) * r0, y, Math.sin(b) * r0, Math.cos(b) * r1, y, Math.sin(b) * r1, Math.cos(a) * r1, y, Math.sin(a) * r1);
  }
}
function floor(ctx, S) {
  const h = S / 2, T = 4;
  ctx.roughness(0.16); ctx.metalness(0.05);
  for (let x = -h; x < h; x += T) for (let z = -h; z < h; z += T) {
    const v = ctx.noise2d(x * 0.37, z * 0.41), k = (v + 1) * 0.5;
    ctx.color(`oklch(${(0.31 + k * 0.04).toFixed(3)} 0.006 ${240 + v * 20})`);
    ctx.quad(x, 0, z, x, 0, z + T, x + T, 0, z + T, x + T, 0, z);
  }
  ctx.roughness(0.4);
  for (let i = -h; i <= h; i += 1) {
    const major = i % 10 === 0, w = major ? 0.035 : 0.012;
    ctx.color(major ? "oklch(0.36 0.02 75)" : "oklch(0.4 0.012 240)");
    ctx.quad(i - w, 0.004, -h, i - w, 0.004, h, i + w, 0.004, h, i + w, 0.004, -h);
    ctx.quad(-h, 0.005, i + w, h, 0.005, i + w, h, 0.005, i - w, -h, 0.005, i - w);
  }
  ctx.color(STONE[0]); box(ctx, -h, -1, -h, h, -0.001, h);
}
function dais(ctx) {
  ctx.roughness(0.2); ctx.metalness(0.05);
  ctx.color("#3d4046"); prism(ctx, 8, 7.2, -0.2, 0.3);
  ctx.color("#44484e"); prism(ctx, 8, 5.6, 0.3, 0.6);
  ctx.metalness(0.9); ctx.roughness(0.35); ctx.color(BRASS); ctx.emissive("#3a2a10");
  ring(ctx, 8, 6.7, 6.95, 0.305); ring(ctx, 8, 5.1, 5.3, 0.605); ring(ctx, 24, 1.3, 1.45, 0.606, 0);
  for (let k = 0; k < 6; k++) {   // spokes toward the six galleries (30° + 60k from north, clockwise)
    const t = (30 + 60 * k) * Math.PI / 180, dx = Math.sin(t), dz = -Math.cos(t), px = -dz * 0.07, pz = dx * 0.07;
    ctx.quad(dx * 1.5 + px, 0.607, dz * 1.5 + pz, dx * 1.5 - px, 0.607, dz * 1.5 - pz, dx * 5 - px, 0.607, dz * 5 - pz, dx * 5 + px, 0.607, dz * 5 + pz);
  }
  ctx.emissive(null);
}
function plinth(ctx) {
  ctx.roughness(0.22); ctx.metalness(0.05);
  ctx.color("#34373c"); box(ctx, -1, 0, -1, 1, 0.14, 1);
  ctx.color("#3d4046"); box(ctx, -0.86, 0.14, -0.86, 0.86, 0.8, 0.86);
  ctx.metalness(0.9); ctx.roughness(0.35); ctx.color(BRASS); box(ctx, -0.88, 0.68, -0.88, 0.88, 0.72, 0.88);
  ctx.metalness(0.05); ctx.roughness(0.15); ctx.color("#474b51"); box(ctx, -1, 0.8, -1, 1, 0.9, 1);
}
function pad(ctx, S) {
  const h = S / 2;
  ctx.roughness(0.3); ctx.color("#4a4d52"); box(ctx, -h, 0, -h, h, 0.05, h);
  ctx.metalness(0.9); ctx.roughness(0.35); ctx.color(BRASS); ctx.emissive("#2a1e0a");
  const b = 0.25;
  box(ctx, -h, 0.05, -h, h, 0.06, -h + b); box(ctx, -h, 0.05, h - b, h, 0.06, h);
  box(ctx, -h, 0.05, -h + b, -h + b, 0.06, h - b); box(ctx, h - b, 0.05, -h + b, h, 0.06, h - b);
  for (let i = -h + 5; i < h; i += 5) { box(ctx, i - 0.03, 0.05, -0.4, i + 0.03, 0.055, 0.4); box(ctx, -0.4, 0.05, i - 0.03, 0.4, 0.055, i + 0.03); }
  ctx.emissive(null);
}
function pylon(ctx) {
  ctx.roughness(0.2); ctx.color("#34373c"); box(ctx, -0.5, 0, -0.5, 0.5, 0.25, 0.5);
  ctx.color("#3d4046"); box(ctx, -0.32, 0.25, -0.32, 0.32, 2.7, 0.32);
  ctx.metalness(0.9); ctx.roughness(0.35); ctx.color(BRASS); ctx.emissive("#3a2a10"); box(ctx, -0.4, 2.7, -0.4, 0.4, 2.85, 0.4); ctx.emissive(null);
}
export function geometry(ctx) {
  const p = ctx.params ?? {};
  if (p.kind === "floor") floor(ctx, p.size ?? 260);
  else if (p.kind === "dais") dais(ctx);
  else if (p.kind === "pad") pad(ctx, p.size ?? 40);
  else if (p.kind === "pylon") pylon(ctx);
  else plinth(ctx);
  return { uvProjection: "triplanar" };
}
export function collider(ctx) {
  const p = ctx.params ?? {};
  if (p.kind === "floor") return { kind: "box", width: p.size ?? 260, height: 1, depth: p.size ?? 260, center: [0, -0.5, 0] };
  if (p.kind === "dais") return [{ kind: "cylinder", radiusTop: 7.2, radiusBottom: 7.2, height: 0.5, center: [0, 0.05, 0] }, { kind: "cylinder", radiusTop: 5.6, radiusBottom: 5.6, height: 0.3, center: [0, 0.45, 0] }];
  if (p.kind === "pad") return { kind: "box", width: p.size ?? 40, height: 0.05, depth: p.size ?? 40, center: [0, 0.025, 0] };
  if (p.kind === "pylon") return { kind: "box", width: 0.8, height: 2.85, depth: 0.8, center: [0, 1.425, 0] };
  return { kind: "box", width: 2, height: 0.9, depth: 2, center: [0, 0.45, 0] };
}
