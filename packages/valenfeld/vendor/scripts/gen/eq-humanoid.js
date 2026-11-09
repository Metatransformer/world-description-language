// The Valen humanoid, Morrowind / EverQuest-1 era: ~2800-3000 triangles at lod 1, under 1500 at lod 3, faceted-smooth lofted body
// (shoulder slope, chest, waist, hips, thigh, knee, calf, ankle, boots), a sculpted head wearing a painted race face
// (per race sheet: left half male, right half female), mitten hands with a thumb, clothes in painted cloth / mail /
// leather / plate from one atlas tinted by colors [main, trim]. Skinned per vertex (blended rings at every joint).
// Rig: the library humanoid names, T-pose, facing -Z, feet at the origin; height comes from the row's scale (EQ_SCALE).
// params: kind (person | skeleton | draugr), race (human asheni hessk reshi stoneborn vyr korl, or the old ids in
// RACE_ALIAS), sex (m | f), skin, hair (bald short long topknot braid), hairColor, beard (none stubble goatee full long),
// beardColor, outfit (tunic robe mail leather rags plate), colors [main, trim], apron (true | colour),
// helm (none cap hood nasal horned), helmColor, wrap, wrapColor, mask, maskColor, eyes, glow (true | colour),
// bone (skeleton colour), ragged, seed.

export const EQ_SCALE = { valemen: 1, hrothi: 1.07, sarai: 1, vaelin: 1.01, duskari: 0.99, dvergr: 0.8, human: 1, korl: 1.07, reshi: 1, hessk: 1.01, asheni: 0.99, stoneborn: 0.8, vyr: 1.05, orc: 1.1, goblin: 0.72, kobold: 0.68, troll: 1.55, skeleton: 1, draugr: 1.1 };

const SH_Y = 1.45, SH_X = 0.19, ELB = 0.46, WR = 0.71, HIP_Y = 0.96, LX = 0.1, KNEE = 0.52, ANK = 0.09;

export function skeleton() {
  const b = {
    Hips: { pivot: [0, HIP_Y, 0] },
    Spine: { parent: "Hips", pivot: [0, 1.06, 0] },
    Spine1: { parent: "Spine", pivot: [0, 1.2, 0] },
    Spine2: { parent: "Spine1", pivot: [0, 1.34, 0] },
    Neck: { parent: "Spine2", pivot: [0, 1.52, 0] },
    Head: { parent: "Neck", pivot: [0, 1.6, 0] },
  };
  for (const [S, s] of [["Left", -1], ["Right", 1]]) {
    b[S + "Shoulder"] = { parent: "Spine2", pivot: [s * 0.06, 1.46, 0] };
    b[S + "Arm"] = { parent: S + "Shoulder", pivot: [s * SH_X, SH_Y, 0] };
    b[S + "ForeArm"] = { parent: S + "Arm", pivot: [s * ELB, SH_Y, 0] };
    b[S + "Hand"] = { parent: S + "ForeArm", pivot: [s * WR, SH_Y, 0] };
    b[S + "UpLeg"] = { parent: "Hips", pivot: [s * LX, HIP_Y - 0.02, 0] };
    b[S + "Leg"] = { parent: S + "UpLeg", pivot: [s * LX, KNEE, 0] };
    b[S + "Foot"] = { parent: S + "Leg", pivot: [s * LX, ANK, 0] };
    b[S + "ToeBase"] = { parent: S + "Foot", pivot: [s * LX, 0.03, -0.1] };
  }
  return b;
}
const BI = Object.fromEntries(Object.keys(skeleton()).map((k, i) => [k, i]));

export function collider() { return { kind: "capsule", radius: 0.3, halfHeight: 0.6, center: [0, 0.9, 0] }; }

// ---- art ----
const ATLAS = "/cdn/value.1035fb9c9bb8a55c917b1f338e8ae285f5a7a7a73c199fd3c8038f276bddf928.png"; // 4x4 grey painted tiles (cell 0: coarse homespun twill)
const CELL = { wool: 0, robe: 1, mail: 2, leather: 3, plate: 4, sack: 5, hair: 6, bone: 7, skin: 8, beard: 9, dleather: 10, wool2: 11, plain: 12, skin2: 13 };
const FACE = {
  human: "/cdn/value.455b588c9475f2aaebd630a72eedecda1db7318073157e4391dbdff9716c6524.png",
  asheni: "/cdn/value.4da57765fa6b4ff77700d89f4b2229fb3f7f48f1791a929ed67da2465d61102d.png",
  hessk: "/cdn/value.3aab233f1eb263d6d5241679fc460b28c07b70c81f7d70d0efd542e34ba44e2d.png",
  reshi: "/cdn/value.aaaa1d9bbd8b27510c76aebbaa348cf1883bc3cfc23122b866b95be32b390f33.png",
  stoneborn: "/cdn/value.a2e3407914fe5aedcf233f90a35eb88a87289b89d6f01b5dcacceb17d27ecfc7.png",
  vyr: "/cdn/value.86c155c36490e489e271900ad9f391d89d1a2b05411bd21fe9a6a95c863cc7db.png",
  korl: "/cdn/value.da88a887f63045d7e5708dac342c9cd943c4b7ba47604288c48797a07c2e89ab.png",
  // monster races (creator, Oct 29: "trolls are humanoids so they should be treated like other humanoids - orcs, goblins, kobolds")
  orc: "/cdn/value.c9d1e2a580bb8d0457564bbcf61fa2dabf94ed18be09223cb18214da23e95207.png",
  goblin: "/cdn/value.13f7f41a25e433470e3440ed551e21f3e4609b7e31cb7b4b508324454622fe16.png",
  kobold: "/cdn/value.b8aaa4421ffa94654c52f5c170bea62ce189011a95ae50ba033f89b39e4822da.png",
  troll: "/cdn/value.bb3e94c0d8e73bec27f376bd2d20d36bffb8bba2e5034b4f072dcfd50c9016fa.png",
};
// skin tones sampled off each face sheet's cheeks [male, female], so neck, ears, arms match the painting
const RACE = {
  human: { id: "human", skin: ["#93603f", "#a66a45"], hair: ["brown", "black", "auburn", "blonde"], w: 1, arm: 1, hs: 1 },
  asheni: { id: "asheni", skin: ["#665c5a", "#686262"], hair: ["black", "black", "grey"], w: 0.95, arm: 0.95, hs: 1 },
  hessk: { id: "hessk", skin: ["#ab807c", "#b58983"], hair: ["black", "silver", "brown"], w: 0.93, arm: 0.92, hs: 1.01, elf: true },
  reshi: { id: "reshi", skin: ["#78552b", "#7a5024"], hair: ["brown", "auburn", "black"], w: 0.9, arm: 0.9, hs: 0.97, cat: true },
  stoneborn: { id: "stoneborn", skin: ["#a86442", "#be6f4e"], hair: ["red", "brown", "grey", "black"], w: 1.34, arm: 1.3, hs: 1.12, beard: "long" },
  vyr: { id: "vyr", skin: ["#80602f", "#836432"], hair: ["white", "silver", "blonde"], w: 0.86, arm: 0.86, hs: 1.0, elf: true },
  korl: { id: "korl", skin: ["#977066", "#9a7266"], hair: ["white", "blonde", "grey", "black"], w: 1.26, arm: 1.32, hs: 1.04, beard: "full" },
  // monster races: same body, bones, clips and weapon holds as the playable ones; size is EQ_SCALE
  orc: { id: "orc", skin: ["#5b533e", "#635c45"], hair: ["black", "black", "grey"], w: 1.3, arm: 1.34, hs: 1.06, beard: "none", elf: true, monster: true },
  goblin: { id: "goblin", skin: ["#6f5f27", "#75672b"], hair: ["black", "grey"], w: 0.82, arm: 0.95, hs: 1.22, beard: "none", elf: true, bald: true, monster: true },
  kobold: { id: "kobold", skin: ["#883a19", "#8c381b"], hair: ["black"], w: 0.86, arm: 0.9, hs: 1.18, beard: "none", bald: true, monster: true },
  troll: { id: "troll", skin: ["#6c624e", "#655637"], hair: ["grey"], w: 1.5, arm: 1.6, hs: 0.92, beard: "none", elf: true, bald: true, monster: true },
};
const RACE_ALIAS = { valemen: "human", hrothi: "korl", sarai: "reshi", vaelin: "hessk", duskari: "asheni", dvergr: "stoneborn" };
const HAIR = { black: "#2a2420", brown: "#5a3a26", auburn: "#8a4424", blonde: "#d8b46a", red: "#a8502a", grey: "#9a958e", white: "#e6e2d8", silver: "#c4c9cf" };
const STEEL = "#b4bac2", DSTEEL = "#80868e", LEATHER = "#9a6a44", DLEATHER = "#5e4028", BOOT = "#5a3e28", CLOTH = "#e2d8bc", BRASS = "#c9a45a";

// ---- the emitter: every triangle pushes its uvs and per-vertex skin weights ----
let G = null;
const D = Math.PI / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gs = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
const WCACHE = new Map();
function pushW(w) {
  let e = WCACHE.get(w);
  if (!e) {
    const ks = Object.keys(w).filter((k) => w[k] > 0).sort((a, b) => w[b] - w[a]).slice(0, 4);
    let s = 0; for (const k of ks) s += w[k];
    e = [0, 0, 0, 0, 0, 0, 0, 0]; ks.forEach((k, i) => { e[i] = BI[k]; e[4 + i] = w[k] / s; });
    WCACHE.set(w, e);
  }
  G.jn.push(e[0], e[1], e[2], e[3]); G.wt.push(e[4], e[5], e[6], e[7]);
}
function tri(a, b, c, ua, ub, uc, wa, wb, wc, inside) {
  const n = crs(sub(b, a), sub(c, a));
  if (len(n) < 1e-10) return;
  if (inside) { const f = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]; if (dot(n, sub(f, inside)) < 0) { [b, c] = [c, b]; [ub, uc] = [uc, ub]; [wb, wc] = [wc, wb]; } }
  G.ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  G.uv.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
  pushW(wa); pushW(wb); pushW(wc); G.n++;
}
function quad(a, b, c, d, ua, ub, uc, ud, wa, wb, wc, wd, inside) { tri(a, b, c, ua, ub, uc, wa, wb, wc, inside); tri(a, c, d, ua, uc, ud, wa, wc, wd, inside); }
// a uv inside one atlas tile (s, t in 0..1; t = 1 the tile's top)
function au(cell, s, t) { const col = cell % 4, row = Math.floor(cell / 4); s = Math.min(1, Math.max(0, s)); t = Math.min(1, Math.max(0, t)); return [(col + 0.02 + s * 0.96) / 4, 1 - (row + 0.02 + (1 - t) * 0.96) / 4]; }
// material state: m = { cell, c, metal, flat, tex, em, tint }
function mat(m) {
  const ctx = G.ctx; if (!m || G.m === m) return; G.m = m;
  ctx.albedo(m.tex ?? ATLAS); ctx.color(m.c ?? "#ffffff"); ctx.metalness(m.metal ? 0.55 : 0); ctx.roughness(m.metal ? 0.42 : 0.9);
  if (m.flat) ctx.flat(); else ctx.smooth(); ctx.emissive(m.em ?? null);
}
const M = (cell, c, o = {}) => ({ cell, c, ...o });

// a loft through nodes { p, r: [a+, b+, a-, b-], e (superellipse), w (bone weights), m (material from here on), f(c, s) radial }
// axis y: a = x, b = z (+z back); axis x (arms): a = z, b = y; axis z (feet): a = x, b = y. Seam at the back / underside.
const FR = { y: [[1, 0, 0], [0, 0, 1], Math.PI / 2], x: [[0, 0, 1], [0, 1, 0], -Math.PI / 2], z: [[1, 0, 0], [0, 1, 0], -Math.PI / 2] };
function tube(nodes, ax, n, o = {}) {
  const [e1, e2, t0] = FR[ax];
  const rings = nodes.map((nd) => {
    const r = nd.r, ex = 2 / (nd.e ?? 2), ring = [];
    for (let j = 0; j <= n; j++) {
      const t = t0 + (j / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const ra = c >= 0 ? r[0] : (r[2] ?? r[0]), rb = s >= 0 ? r[1] : (r[3] ?? r[1]);
      const cc = Math.sign(c) * Math.abs(c) ** ex, ss = Math.sign(s) * Math.abs(s) ** ex, k = nd.f ? nd.f(c, s) : 1;
      const p = nd.p;
      ring.push([p[0] + (e1[0] * cc * ra + e2[0] * ss * rb) * k, p[1] + (e1[1] * cc * ra + e2[1] * ss * rb) * k, p[2] + (e1[2] * cc * ra + e2[2] * ss * rb) * k]);
    }
    return ring;
  });
  const L = [0]; for (let i = 1; i < nodes.length; i++) L.push(L[i - 1] + len(sub(nodes[i].p, nodes[i - 1].p)));
  const tl = o.tl ?? (L[L.length - 1] || 1), su = o.su ?? 1;
  let m = o.m ?? nodes[0].m ?? G.m;
  const m0 = m;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (nodes[i].m) m = nodes[i].m;
    mat(m);
    const A = rings[i], B = rings[i + 1], pa = nodes[i].p, pb = nodes[i + 1].p, mid = o.inside ?? [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2];
    const ta = 1 - L[i] / tl, tb = 1 - L[i + 1] / tl, wa = nodes[i].w, wb = nodes[i + 1].w;
    for (let j = 0; j < n; j++) {
      const s0 = (j / n) * su, s1 = ((j + 1) / n) * su;
      quad(A[j], A[j + 1], B[j + 1], B[j], au(m.cell, s0, ta), au(m.cell, s1, ta), au(m.cell, s1, tb), au(m.cell, s0, tb), wa, wa, wb, wb, mid);
    }
  }
  const cap = (ring, nd, inside, mm) => {
    mat(mm); const c = nd.p, uc = au(mm.cell, 0.5, 0.5);
    for (let j = 0; j < n; j++) tri(c, ring[j], ring[j + 1], uc, au(mm.cell, 0.5 + 0.4 * Math.cos(j / n * 6.28), 0.5 + 0.4 * Math.sin(j / n * 6.28)), au(mm.cell, 0.5 + 0.4 * Math.cos((j + 1) / n * 6.28), 0.5 + 0.4 * Math.sin((j + 1) / n * 6.28)), nd.w, nd.w, nd.w, inside);
  };
  if (o.cap0) cap(rings[0], o.cap0p ? { ...nodes[0], p: o.cap0p } : nodes[0], nodes[1].p, nodes[0].m ?? m0);
  if (o.cap1) cap(rings[rings.length - 1], o.cap1p ? { ...nodes[nodes.length - 1], p: o.cap1p } : nodes[nodes.length - 1], nodes[nodes.length - 2].p, m);
  return rings;
}
const N = (p, r, w, extra) => ({ p, r, w, ...extra });

// ---- the head: a sculpted lat-long shell; every feature is a gaussian push on the base ellipsoid ----
let HD = null;
function hpos(th, ph, off = 0) {
  const t = th * D, p = ph * D, sp = Math.sin(p), cp = Math.cos(p), ct = Math.cos(t), st = Math.sin(t);
  const h = HD, back = Math.max(0, -ct), front = Math.max(0, ct), at = Math.abs(th);
  let x = sp * st * h.rx, y = cp * (cp >= 0 ? h.ry : h.ryl), z = -sp * ct * (ct >= 0 ? h.rzf : h.rzb);
  // the cranium is wider than the jaw: below the cheekbones the head narrows, most toward the front
  x *= 1 - 0.27 * (h.jaw ?? 1) * sstep(98, 172, ph) * (0.55 + 0.45 * front);
  // a flatter face plane in front, the nape tucked in under a round occiput behind
  if (ct > 0) z *= 1 - 0.1 * gs(at, 55, 30) * sstep(60, 110, ph);
  z *= 1 - 0.5 * sstep(112, 172, ph) * back;
  y += 0.03 * sstep(118, 176, ph) * back * h.s;
  let push = 0;
  if (h.skull) {
    push += -0.02 * gs(ph, 88, 9) * gs(at, 34, 13) - 0.014 * gs(ph, 110, 6) * gs(th, 0, 8) + 0.01 * gs(ph, 100, 7) * gs(at, 62, 12) - 0.012 * gs(ph, 78, 10) * gs(at, 70, 10) + 0.012 * gs(ph, 85, 28) * gs(at, 180, 50);
  } else {
    const m = h.male ?? 0, g = h.gaunt ?? 0;
    push += (0.007 + 0.006 * m) * gs(ph, 75, 7) * gs(at, 22, 20); // brow ridge
    push += 0.006 * gs(ph, 82, 5) * gs(th, 0, 8); // glabella
    push -= (0.011 + 0.008 * g) * gs(ph, 87, 7) * gs(at, 36, 11); // eye sockets
    push += 0.012 * gs(ph, 99, 8) * gs(th, 0, 6); // nose bridge
    push += 0.03 * gs(ph, 111, 6.5) * gs(th, 0, 8); // nose tip
    push += 0.009 * gs(ph, 114, 5) * gs(at, 13, 6); // nostril wings
    push += 0.006 * gs(ph, 127, 4) * gs(at, 0, 16) - 0.005 * gs(ph, 132, 2.5) * gs(at, 0, 20) + 0.006 * gs(ph, 137, 4) * gs(at, 0, 14); // lips
    push += (0.011 + 0.005 * m) * gs(ph, 154, 8) * gs(th, 0, 16); // chin
    push += (0.011 + 0.004 * g) * gs(ph, 96, 9) * gs(at, 55, 13); // cheekbones
    push -= (0.004 + 0.012 * g) * gs(ph, 122, 10) * gs(at, 52, 12); // cheek hollow
    push += (0.004 + 0.012 * m) * gs(ph, 142, 10) * gs(at, 78, 14); // jaw angle
    push -= 0.006 * gs(ph, 72, 10) * gs(at, 64, 10); // temples
    push += 0.014 * gs(ph, 85, 28) * gs(at, 180, 50); // occiput
    if (h.cat) push += 0.022 * gs(ph, 122, 14) * gs(th, 0, 22);
  }
  push *= h.s;
  x += st * push; z -= ct * push;
  if (off) { const l = Math.hypot(x, y, z) || 1; x += (x / l) * off; y += (y / l) * off; z += (z / l) * off; }
  return [x, y + h.c[1], z + h.c[2]];
}
const VIMG = [[0, 0], [40, 0.08], [70, 0.29], [84, 0.37], [112, 0.62], [133, 0.76], [160, 0.95], [180, 1]];
function vImg(ph) { for (let i = 1; i < VIMG.length; i++) if (ph <= VIMG[i][0]) { const [a, va] = VIMG[i - 1], [b, vb] = VIMG[i]; return lerp(va, vb, (ph - a) / (b - a)); } return 1; }
function faceUv(th, ph) { const u = 0.5 - Math.max(-0.5, Math.min(0.5, (th / 95) * 0.46)); return [u * 0.5 + (HD.fem ? 0.5 : 0), 1 - vImg(ph)]; }
// emit the head grid's cells chosen by pred(thc, phc) at offset off; uvMode "face" | atlas cell
function shell(pred, off, m, faceM) {
  const TH = HD.TH, PH = HD.PH, w = HD.w;
  for (let i = 0; i < PH.length - 1; i++) for (let j = 0; j < TH.length - 1; j++) {
    const t0 = TH[j], t1 = TH[j + 1], p0 = PH[i], p1 = PH[i + 1], tc = (t0 + t1) / 2, pc = (p0 + p1) / 2;
    if (!pred(tc, pc, t0, t1, p0, p1)) continue;
    const a = hpos(t0, p0, off), b = hpos(t1, p0, off), c = hpos(t1, p1, off), d = hpos(t0, p1, off);
    const isFace = faceM && Math.max(Math.abs(t0), Math.abs(t1)) <= 95 && p0 >= 48 && p1 <= 168;
    if (isFace) { mat(faceM); quad(a, b, c, d, faceUv(t0, p0), faceUv(t1, p0), faceUv(t1, p1), faceUv(t0, p1), w, w, w, w, HD.c); }
    else { mat(m); const U = (t) => (t + 180) / 360, V = (p) => 1 - p / 180; quad(a, b, c, d, au(m.cell, U(t0), V(p0)), au(m.cell, U(t1), V(p0)), au(m.cell, U(t1), V(p1)), au(m.cell, U(t0), V(p1)), w, w, w, w, HD.c); }
  }
}
// a flat little patch stood on the head surface (eyes, sockets): centre (th, ph), half sizes in degrees
function decal(th, ph, dth, dph, off, m) {
  mat(m); const w = HD.w, u = au(m.cell ?? CELL.plain, 0.5, 0.5);
  quad(hpos(th - dth, ph - dph, off), hpos(th + dth, ph - dph, off), hpos(th + dth, ph + dph, off), hpos(th - dth, ph + dph, off), u, u, u, u, w, w, w, w, HD.c);
}

function rng(seed) { let a = (Math.floor(seed * 2654435761) >>> 0) || 7; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function geometry(ctx) {
  G = { ctx, uv: [], jn: [], wt: [], n: 0, m: null };
  const P = ctx.params ?? {}, R = rng((P.seed ?? 1) + 0.37), pick = (a) => a[Math.floor(R() * a.length) % a.length];
  const lod = ctx.lod ?? 1, kind = P.kind ?? "person", race = RACE[P.race] ?? RACE[RACE_ALIAS[P.race]] ?? RACE.human;
  const fem = P.sex === "f", bones = kind === "skeleton", draugr = kind === "draugr";
  const NT = [16, 16, 12, 7, 6, 6][lod] ?? 8, NL = [10, 10, 8, 5, 4, 4][lod] ?? 6, NH = [6, 6, 5, 4, 4, 4][lod] ?? 4, fine = lod <= 2, mid = lod <= 3;
  const W = (draugr ? 1.1 : race.w) * (fem ? 0.9 : 1), AW = (draugr ? 1.05 : race.arm) * (fem ? 0.86 : 1), HS = draugr ? 1 : race.hs;
  const faceSkin = race.skin[fem ? 1 : 0];
  const skin = P.skin ?? (draugr ? "#6f8088" : faceSkin);
  const hairStyle = P.hair ?? (race.bald && !draugr ? "bald" : draugr ? "long" : fem ? pick(["long", "long", "braid", "topknot"]) : pick(["short", "short", "bald", "long", "topknot"]));
  const hairC = HAIR[P.hairColor] ?? P.hairColor ?? (draugr ? HAIR.white : HAIR[pick(race.hair)]);
  const beard = P.beard ?? (race.monster && !draugr ? "none" : fem ? "none" : draugr ? "long" : race.beard ?? pick(["none", "none", "stubble", "goatee", "full"]));
  const beardC = HAIR[P.beardColor] ?? P.beardColor ?? hairC;
  const outfit = P.outfit ?? (draugr ? "mail" : "tunic"), ragged = P.ragged ?? (draugr || outfit === "rags");
  const [A, B] = P.colors ?? [pick(["#7a3328", "#3d5a3a", "#3a4a6a", "#7a6a3a", "#5a3a5a"]), pick(["#4a3a2a", "#3a3a3a", "#5a4a32"])];
  const helm = P.helm ?? (draugr ? "horned" : "none"), wrap = !!P.wrap && helm === "none";
  const glowC = typeof P.glow === "string" ? P.glow : P.glow || draugr ? (P.eyes ?? (draugr ? "#8fe0ff" : "#ff5a2a")) : null;
  const BONE = P.bone ?? "#d8cca8";
  const furBoots = race.id === "korl" || outfit === "rags";
  // materials
  const mSkin = M(CELL.skin, skin), mBoot = furBoots ? M(CELL.beard, outfit === "rags" ? "#7a6248" : "#8a6a4a") : M(CELL.dleather, BOOT);
  const mBootCuff = furBoots ? M(CELL.beard, "#a08060") : M(CELL.leather, "#7a5434");
  const mA = M(outfit === "robe" ? CELL.robe : outfit === "rags" ? CELL.sack : CELL.wool, A), mB = M(outfit === "rags" ? CELL.sack : CELL.wool2, B);
  const mMail = M(CELL.mail, STEEL, { metal: true }), mMailD = M(CELL.mail, DSTEEL, { metal: true }), mPlate = M(CELL.plate, STEEL, { metal: true, flat: true });
  const mLeather = M(CELL.leather, LEATHER), mDLeather = M(CELL.dleather, DLEATHER), mBelt = M(CELL.dleather, "#4a3220"), mBrass = M(CELL.plain, BRASS, { metal: true, flat: true });
  const mTrous = M(outfit === "rags" ? CELL.sack : CELL.wool2, outfit === "plate" ? DSTEEL : outfit === "leather" ? "#5a4a3a" : B);
  const mBone = M(CELL.bone, BONE), mHair = M(CELL.hair, hairC), mBeard = M(CELL.beard, beardC);

  if (bones) buildSkeleton(ctx, { NT, NL, NH, fine, mid, mBone, BONE, R, ragged, outfit, A, mSack: M(CELL.sack, A), glowC, P });
  else {
    // ================= BODY =================
    const hf = fem ? 1.13 : 1, waist = fem ? 0.84 : 0.92, chest = fem ? 0.94 : 1, bust = fem ? 0.22 : 0.05;
    const Wh = (k) => k;
    const TW = { hipsOnly: { Hips: 1 }, belt: { Hips: 0.7, Spine: 0.3 }, waist: { Spine: 0.6, Hips: 0.2, Spine1: 0.2 }, ribs: { Spine: 0.4, Spine1: 0.6 }, chest: { Spine1: 0.5, Spine2: 0.5 }, up: { Spine2: 1 }, top: { Spine2: 0.8, Neck: 0.2 } };
    const bustF = (k) => (c, s) => 1 + k * Math.max(0, -s) * gs(Math.abs(c), 0.5, 0.32);
    const torsoM = { tunic: mA, robe: mA, mail: mMail, leather: mLeather, rags: mA, plate: mPlate }[outfit] ?? mA;
    const lowM = outfit === "robe" ? mA : outfit === "plate" ? mMailD : outfit === "mail" ? mMail : outfit === "leather" ? mLeather : mA;
    const T = [
      N([0, 0.85, 0.005], [0.105 * W * hf, 0.07, 0.105 * W * hf, 0.065], TW.hipsOnly, { m: mTrous }),
      N([0, 0.93, 0.005], [0.162 * W * hf, 0.108, 0.162 * W * hf, 0.088], TW.hipsOnly, { e: 2.2, m: lowM, f: (c, s) => 1 + 0.08 * Math.max(0, s) * gs(Math.abs(c), 0.45, 0.35) }),
      N([0, 1.01, 0.0], [0.155 * W * (fem ? 1.08 : 1), 0.1, 0.155 * W * (fem ? 1.08 : 1), 0.088], TW.belt, { e: 2.2, m: torsoM }),
      N([0, 1.1, 0.0], [0.158 * W * waist, 0.095, 0.158 * W * waist, 0.088], TW.waist, { e: 2.2 }),
      N([0, 1.22, 0.0], [0.168 * W * chest, 0.1, 0.168 * W * chest, 0.098], TW.ribs, { e: 2.3, f: bustF(bust * 0.55) }),
      N([0, 1.32, 0.0], [0.188 * W * chest, 0.108, 0.188 * W * chest, 0.108], TW.chest, { e: 2.4, f: bustF(bust) }),
      N([0, 1.41, 0.005], [0.192 * W * chest, 0.1, 0.192 * W * chest, 0.094], TW.up, { e: 2.4 }),
      N([0, 1.47, 0.012], [0.172 * W * chest, 0.086, 0.172 * W * chest, 0.076], TW.up, { e: 2.3 }),
      N([0, 1.505, 0.016], [0.138 * W, 0.078, 0.138 * W, 0.07], TW.top, { e: 2.1 }),
      N([0, 1.535, 0.018], [0.098 * W, 0.068, 0.098 * W, 0.062], TW.top, { e: 2.0, m: outfit === "tunic" || outfit === "robe" ? mB : torsoM }),
      N([0, 1.55, 0.018], [0.07 * W, 0.058, 0.07 * W, 0.054], TW.top),
    ];
    if (lod >= 4) T.splice(3, 1);
    tube(T, "y", NT, { cap0: true, cap1: true });
    const tzF = (y) => { for (let i = 1; i < T.length; i++) if (y <= T[i].p[1]) { const a = T[i - 1], b = T[i], k = (y - a.p[1]) / (b.p[1] - a.p[1]); return lerp(a.r[3], b.r[3], k) * (1 + (b.f ? 0.5 * bust : 0)); } return 0.06; };
    const txR = (y) => { for (let i = 1; i < T.length; i++) if (y <= T[i].p[1]) { const a = T[i - 1], b = T[i], k = (y - a.p[1]) / (b.p[1] - a.p[1]); return [lerp(a.r[0], b.r[0], k), lerp(a.r[1], b.r[1], k), lerp(a.r[3], b.r[3], k)]; } return [0.07, 0.05, 0.05]; };

    // neck
    { const nk = 1.08 * Math.sqrt(W) * (fem ? 0.86 : 1); tube([N([0, 1.46, 0.015], [0.07 * nk, 0.066, 0.07 * nk, 0.06], { Spine2: 0.6, Neck: 0.4 }), N([0, 1.56, 0.014], [0.062 * nk, 0.062, 0.062 * nk, 0.056], { Neck: 1 }, { f: fem ? undefined : (c, sn) => 1 + 0.1 * Math.max(0, -sn) ** 8 }), N([0, 1.63, 0.012], [0.058 * nk, 0.06, 0.058 * nk, 0.052], { Neck: 0.4, Head: 0.6 }), N([0, 1.69, 0.012], [0.05 * nk, 0.05, 0.05 * nk, 0.044], { Head: 1 })], "y", NL, { m: mSkin }); }

    // belt
    if (mid) {
      const [rx, rb, rf] = txR(1.015), k = 1.06;
      tube([N([0, 0.985, 0], [rx * k, rb * k, rx * k, rf * k], TW.belt, { e: 2.2 }), N([0, 1.045, 0], [rx * k, rb * k, rx * k, rf * k], TW.belt, { e: 2.2 })], "y", NT, { m: mBelt, su: 2 });
      if (fine) { // the buckle: a little brass block
        const z = -(rf * k) - 0.004, w = TW.belt, u = au(CELL.plain, 0.5, 0.5);
        mat(mBrass); const bx = 0.026, by = 0.024, bz = 0.01, c = [0, 1.015, z - bz];
        const v = (sx, sy, sz) => [sx * bx, 1.015 + sy * by, z - bz + sz * bz];
        const F = [[v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1)], [v(-1, -1, -1), v(-1, 1, -1), v(-1, 1, 1), v(-1, -1, 1)], [v(1, -1, -1), v(1, -1, 1), v(1, 1, 1), v(1, 1, -1)], [v(-1, 1, -1), v(1, 1, -1), v(1, 1, 1), v(-1, 1, 1)], [v(-1, -1, -1), v(-1, -1, 1), v(1, -1, 1), v(1, -1, -1)]];
        for (const q of F) quad(q[0], q[1], q[2], q[3], u, u, u, u, w, w, w, w, c);
      }
    }

    // skirts / hems
    const hemN = Math.max(6, NT);
    const skirt = (rows, m, mTrim, rag) => { // rows: [y, rx, rb, rf]
      const nodes = rows.map(([y, rx, rb, rf], i) => N([0, y, 0], [rx, rb, rx, rf], TW.hipsOnly, { m: i === rows.length - 2 && mTrim ? mTrim : i === 0 ? m : undefined, e: 2.1 }));
      const rings = tube(nodes, "y", hemN, { m });
      void rings; void rag;
    };
    const jag = (rows, m) => { // a torn hem: the last ring's vertices hang at random lengths
      const Rr = rng((P.seed ?? 1) * 3.1 + 0.7), n = hemN;
      mat(m);
      for (let i = 0; i < rows.length - 1; i++) {
        const [y0, rx0, rb0, rf0] = rows[i], [y1, rx1, rb1, rf1] = rows[i + 1], last = i === rows.length - 2;
        const dr = []; for (let j = 0; j <= n; j++) dr.push(last ? (j === n ? dr[0] : (Rr() - 0.35) * 0.13) : 0);
        for (let j = 0; j < n; j++) {
          const pt = (y, rx, rb, rf, jj, dy) => { const t = Math.PI / 2 + (jj / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); return [c * rx, y + dy, s * (s >= 0 ? rb : rf)]; };
          const a = pt(y0, rx0, rb0, rf0, j, 0), b = pt(y0, rx0, rb0, rf0, j + 1, 0), c = pt(y1, rx1, rb1, rf1, j + 1, dr[j + 1]), d = pt(y1, rx1, rb1, rf1, j, dr[j]);
          const ta = 1 - i / (rows.length - 1), tb = 1 - (i + 1) / (rows.length - 1), w = TW.hipsOnly;
          quad(a, b, c, d, au(m.cell, j / n, ta), au(m.cell, (j + 1) / n, ta), au(m.cell, (j + 1) / n, tb), au(m.cell, j / n, tb), w, w, w, w, [0, (y0 + y1) / 2, 0]);
        }
      }
    };
    const [hx, hb, hfz] = txR(0.95);
    const hem = (yEnd, flare, m, mTrim) => {
      const rows = [[1.0, hx * 1.07, hb * 1.07, hfz * 1.07], [lerp(1.0, yEnd, 0.5), hx * (1.07 + flare * 0.5), hb * (1.1 + flare * 0.6), hfz * (1.12 + flare * 0.6)], [yEnd + (mTrim ? 0.05 : 0), hx * (1.08 + flare * 0.9), hb * (1.12 + flare), hfz * (1.15 + flare)]];
      if (mTrim) rows.push([yEnd, hx * (1.08 + flare), hb * (1.12 + flare * 1.08), hfz * (1.15 + flare * 1.08)]);
      if (ragged) jag(rows, m); else skirt(rows, m, mTrim);
    };
    if (outfit === "tunic") hem(0.7, 0.35, mA, mid ? mB : null);
    if (outfit === "leather") hem(0.8, 0.25, mLeather, mid ? mDLeather : null);
    if (outfit === "mail") hem(0.68, 0.3, mMail, null);
    if (outfit === "rags") jag([[1.0, hx * 1.07, hb * 1.07, hfz * 1.07], [0.85, hx * 1.2, hb * 1.22, hfz * 1.25], [0.74, hx * 1.32, hb * 1.35, hfz * 1.4]], mA);
    if (outfit === "plate") { const pm = { ...mPlate }; mat(pm); skirt([[1.0, hx * 1.08, hb * 1.08, hfz * 1.08], [0.9, hx * 1.22, hb * 1.2, hfz * 1.25], [0.8, hx * 1.32, hb * 1.3, hfz * 1.38]], pm, null); }
    if (outfit === "robe") {
      const rows = [[1.0, hx * 1.07, hb * 1.07, hfz * 1.08], [0.72, hx * 1.25, hb * 1.3, hfz * 1.38], [0.42, hx * 1.42, hb * 1.5, hfz * 1.6], [0.13, hx * 1.6, hb * 1.7, hfz * 1.82], [0.04, hx * 1.66, hb * 1.76, hfz * 1.88]];
      if (lod >= 4) rows.splice(1, 2);
      if (ragged) jag(rows, mA); else skirt(rows, mA, mid ? mB : null);
    }

    // tabard (mail) or apron: a front (and back) panel with trim edges
    const apronC = P.apron ? (P.apron === true ? CLOTH : P.apron) : null;
    if ((outfit === "mail" && !apronC) || apronC) {
      const mainC = apronC ?? A, trimC = apronC ? "#9a8a6a" : B, cell = apronC ? CELL.sack : CELL.wool;
      const mMain = M(cell, mainC), mTr = M(CELL.wool2, trimC), hw = (apronC ? 0.13 : 0.125) * W;
      const ys = apronC ? [1.3, 1.2, 1.05, 0.9, 0.75, 0.6] : [1.47, 1.36, 1.24, 1.1, 0.98, 0.84, 0.66];
      for (const side of apronC ? [-1] : [-1, 1]) {
        const zs = ys.map((y) => (y > 1.0 ? (side < 0 ? txR(y)[2] : txR(y)[1]) + 0.014 : (side < 0 ? hfz : hb) * (1.15 + (1.0 - y) * 0.9) + 0.018));
        const wts = ys.map((y) => (y > 1.36 ? TW.up : y > 1.24 ? TW.chest : y > 1.1 ? TW.ribs : y > 1.0 ? TW.waist : TW.hipsOnly));
        const xs = [-hw, -hw + 0.018, hw - 0.018, hw];
        for (let i = 0; i < ys.length - 1; i++) for (let k = 0; k < 3; k++) {
          const m = k === 1 ? mMain : mTr; mat(m);
          const p = (xi, yi) => [xs[xi] * (yi === ys.length - 1 ? 1.08 : 1), ys[yi], side * zs[yi]];
          const uvp = (xi, yi) => au(m.cell, (xs[xi] + hw) / (2 * hw), 1 - yi / (ys.length - 1));
          quad(p(k, i), p(k + 1, i), p(k + 1, i + 1), p(k, i + 1), uvp(k, i), uvp(k + 1, i), uvp(k + 1, i + 1), uvp(k, i + 1), wts[i], wts[i], wts[i + 1], wts[i + 1], [0, (ys[i] + ys[i + 1]) / 2, 0]);
        }
        if (!apronC && side < 0 && fine) { // the house emblem: a trim-coloured lozenge on the chest
          mat(mTr); const z = -(txR(1.3)[2] + 0.02), w = TW.chest, u = au(CELL.wool2, 0.5, 0.5), cy = 1.3, r = 0.045;
          quad([0, cy + r, z], [r * 0.8, cy, z], [0, cy - r * 1.2, z], [-r * 0.8, cy, z], u, u, u, u, w, w, w, w, [0, cy, 0]);
        }
      }
    }
    // leather: a cross strap over the jerkin
    if (outfit === "leather" && mid) {
      mat(mDLeather); const pts = [[-0.15 * W, 1.47], [-0.06 * W, 1.34], [0.04 * W, 1.21], [0.15 * W, 1.05]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], z0 = -(txR(y0)[2] + 0.012), z1 = -(txR(y1)[2] + 0.012), h = 0.028;
        const w0 = y0 > 1.36 ? TW.up : TW.chest, w1 = y1 > 1.24 ? TW.chest : TW.ribs;
        quad([x0, y0 + h, z0], [x1, y1 + h, z1], [x1, y1 - h, z1], [x0, y0 - h, z0], au(CELL.dleather, 0, 1 - i / 3), au(CELL.dleather, 0, 1 - (i + 1) / 3), au(CELL.dleather, 0.2, 1 - (i + 1) / 3), au(CELL.dleather, 0.2, 1 - i / 3), w0, w1, w1, w0, [0, (y0 + y1) / 2, 0]);
      }
    }

    // ================= ARMS =================
    const sleeveM = { tunic: mA, robe: mA, mail: mMail, leather: mA, rags: mSkin, plate: mMailD }[outfit] ?? mA;
    const foreM = { tunic: mA, robe: mA, mail: mMail, leather: mA, rags: mSkin, plate: mMailD }[outfit] ?? mSkin;
    const handM = { plate: M(CELL.plate, DSTEEL, { metal: true }), leather: mDLeather, mail: mDLeather }[outfit] ?? mSkin;
    for (const s of [-1, 1]) {
      const S = s < 0 ? "Left" : "Right", aw = AW;
      const WS = { [S + "Shoulder"]: 1 }, WD = { [S + "Shoulder"]: 0.35, [S + "Arm"]: 0.65 }, WA = { [S + "Arm"]: 1 }, WE = { [S + "Arm"]: 0.5, [S + "ForeArm"]: 0.5 }, WF = { [S + "ForeArm"]: 1 }, WW = { [S + "ForeArm"]: 0.5, [S + "Hand"]: 0.5 }, WH = { [S + "Hand"]: 1 };
      const robe = outfit === "robe", cuffM = outfit === "tunic" || robe ? mB : null;
      const arm = [
        N([s * 0.1, 1.455, 0.005], [0.062 * aw, 0.07 * aw], WS, { m: outfit === "rags" ? mA : sleeveM }),
        N([s * 0.19, 1.452, 0.0], [0.058 * aw, 0.066 * aw], WD, { m: outfit === "rags" && lod < 4 ? mSkin : undefined }),
        N([s * 0.3, 1.45, 0.0], [0.05 * aw, 0.053 * aw], WA),
        N([s * 0.42, 1.45, 0.0], [0.042 * aw, 0.043 * aw], { [S + "Arm"]: 0.85, [S + "ForeArm"]: 0.15 }),
        N([s * 0.46, 1.45, 0.0], [0.04 * aw, 0.04 * aw], WE, { m: foreM }),
        N([s * 0.52, 1.45, 0.0], [0.045 * aw * (robe ? 1.25 : 1), 0.043 * aw * (robe ? 1.25 : 1)], WF),
        N([s * 0.64, 1.45, 0.0], [(robe ? 0.07 : 0.036) * aw, (robe ? 0.07 : 0.031) * aw], WF, { m: cuffM ?? undefined }),
        N([s * 0.705, 1.45, 0.0], [(robe ? 0.085 : 0.029) * aw, (robe ? 0.085 : 0.024) * aw], WW),
      ];
      if (lod >= 4) arm.splice(3, 1);
      if (!fine) arm.splice(1, 0); 
      tube(arm, "x", NL, { cap1: !robe });
      if (robe) tube([N([s * 0.6, 1.45, 0], [0.03 * aw, 0.027 * aw], WF), N([s * 0.705, 1.45, 0], [0.028 * aw, 0.024 * aw], WW)], "x", NH, { m: mSkin });
      // bracers / vambraces
      if (outfit === "leather" || outfit === "mail" || outfit === "plate") {
        const bm = outfit === "plate" ? mPlate : mDLeather, k = outfit === "plate" ? 1.3 : 1.22;
        tube([N([s * 0.55, 1.45, 0], [0.043 * aw * k, 0.041 * aw * k], WF), N([s * 0.69, 1.45, 0], [0.033 * aw * k, 0.029 * aw * k], WW)], "x", NL, { m: bm, cap0: true, cap1: true });
      }
      // pauldrons
      if (outfit === "plate") {
        const pm = mPlate;
        tube([N([s * 0.07, 1.47, 0.0], [0.07 * aw, 0.08 * aw], WS), N([s * 0.16, 1.48, 0.0], [0.105 * aw, 0.105 * aw], WD), N([s * 0.27, 1.45, 0.0], [0.09 * aw, 0.085 * aw], WA)], "x", NL, { m: pm, cap0: true });
        if (fine) tube([N([s * 0.24, 1.445, 0.0], [0.085 * aw, 0.08 * aw], WA), N([s * 0.32, 1.44, 0.0], [0.075 * aw, 0.07 * aw], WA)], "x", NL, { m: pm });
      }
      if (outfit === "leather" && s < 0 && mid) tube([N([s * 0.08, 1.47, 0.0], [0.07 * aw, 0.078 * aw], WS), N([s * 0.2, 1.47, 0.0], [0.08 * aw, 0.082 * aw], WD), N([s * 0.27, 1.455, 0.0], [0.068 * aw, 0.068 * aw], WA)], "x", NL, { m: mDLeather, cap0: true });
      // the mitten hand, palm down, fingers curled a touch, a thumb forward (-z)
      const hk = Math.min(1.25, aw);
      if (lod >= 4) {
        tube([
          N([s * 0.69, 1.45, 0], [0.03 * hk, 0.022 * hk], { [S + "Hand"]: 0.7, [S + "ForeArm"]: 0.3 }, { m: handM }),
          N([s * 0.76, 1.449, -0.002], [0.046 * hk, 0.028 * hk], WH),
          N([s * 0.85, 1.42, -0.003], [0.038 * hk, 0.018 * hk], WH),
        ], "x", NH, { cap1: true });
      } else {
        // palm: a flattened wedge, wider across the knuckles than the wrist
        tube([
          N([s * 0.69, 1.45, 0], [0.028 * hk, 0.021 * hk], { [S + "Hand"]: 0.7, [S + "ForeArm"]: 0.3 }, { m: handM }),
          N([s * 0.725, 1.449, -0.001], [0.039 * hk, 0.025 * hk], WH),
          N([s * 0.77, 1.447, -0.002], [0.044 * hk, 0.022 * hk], WH),
          N([s * 0.785, 1.444, -0.002], [0.041 * hk, 0.018 * hk], WH),
        ], "x", NH, { cap1: true });
        // fingers: four at lod 1, two fused pairs further off, each curling down in three joints
        const fingers = lod <= 1 ? [[-0.026, 0.074, 0.0105], [-0.009, 0.082, 0.0105], [0.008, 0.077, 0.0102], [0.024, 0.062, 0.0092]] : [[-0.018, 0.078, 0.019], [0.016, 0.07, 0.018]];
        for (const [fz, len, fr] of fingers) {
          const x0 = s * 0.775, k = hk;
          tube([
            N([x0, 1.446, fz * k], [fr * k, fr * 0.85 * k], WH),
            N([x0 + s * len * 0.42, 1.444 - len * 0.04, fz * k * 1.05], [fr * 0.95 * k, fr * 0.8 * k], WH),
            N([x0 + s * len * 0.78, 1.434 - len * 0.12, fz * k * 1.07], [fr * 0.85 * k, fr * 0.72 * k], WH),
            N([x0 + s * len * 0.98, 1.418 - len * 0.26, fz * k * 1.08], [fr * 0.7 * k, fr * 0.6 * k], WH),
          ], "x", lod <= 1 ? 5 : 4, { cap1: true });
        }
      }
      // ================= LEGS =================
      const WU = { [S + "UpLeg"]: 1 }, WK = { [S + "UpLeg"]: 0.5, [S + "Leg"]: 0.5 }, WL = { [S + "Leg"]: 1 }, WAk = { [S + "Leg"]: 0.5, [S + "Foot"]: 0.5 }, WFt = { [S + "Foot"]: 1 }, WT = { [S + "Foot"]: 0.5, [S + "ToeBase"]: 0.5 }, WTo = { [S + "ToeBase"]: 1 };
      const lw = W * (fem ? 1.08 : 1), legM = outfit === "robe" ? mA : mTrous, bk = 1.12;
      const leg = [
        N([s * 0.088, 1.0, 0.0], [0.088 * lw, 0.092 * lw, 0.088 * lw, 0.09 * lw], { Hips: 0.6, [S + "UpLeg"]: 0.4 }, { m: legM }),
        N([s * 0.092, 0.9, 0.0], [0.088 * lw, 0.09 * lw, 0.088 * lw, 0.094 * lw], { Hips: 0.2, [S + "UpLeg"]: 0.8 }),
        N([s * 0.097, 0.76, -0.004], [0.073 * lw, 0.074 * lw, 0.073 * lw, 0.078 * lw], WU),
        N([s * 0.1, 0.61, -0.004], [0.058 * lw, 0.058 * lw, 0.058 * lw, 0.062 * lw], { [S + "UpLeg"]: 0.85, [S + "Leg"]: 0.15 }),
        N([s * 0.1, 0.52, -0.006], [0.053 * lw, 0.052 * lw, 0.053 * lw, 0.06 * lw], WK),
        N([s * 0.1, 0.43, 0.0], [0.052 * lw * bk, 0.064 * lw * bk, 0.052 * lw * bk, 0.052 * lw * bk], WL, { m: mBoot }),
        N([s * 0.1, 0.3, 0.004], [0.048 * lw * bk, 0.058 * lw * bk, 0.048 * lw * bk, 0.047 * lw * bk], WL),
        N([s * 0.1, 0.17, 0.004], [0.04 * lw * bk, 0.042 * lw * bk, 0.04 * lw * bk, 0.04 * lw * bk], WL),
        N([s * 0.1, 0.1, 0.004], [0.04 * lw * bk, 0.044 * lw * bk, 0.04 * lw * bk, 0.04 * lw * bk], WAk),
      ];
      if (lod >= 4) { leg.splice(6, 1); leg.splice(3, 1); }
      tube(leg, "y", NL, {});
      // boot cuff: a folded flare at the top of the shaft
      if (mid) tube([N([s * 0.1, 0.47, 0.0], [0.064 * lw * bk, 0.074 * lw * bk, 0.064 * lw * bk, 0.064 * lw * bk], WL), N([s * 0.1, 0.4, 0.002], [0.058 * lw * bk, 0.069 * lw * bk, 0.058 * lw * bk, 0.057 * lw * bk], WL)], "y", NL, { m: mBootCuff, inside: [s * 0.1, 0.435, 0] });
      // greaves and knee cops
      if (outfit === "plate") {
        tube([N([s * 0.1, 0.5, -0.004], [0.06 * lw, 0.066 * lw, 0.06 * lw, 0.068 * lw], WK), N([s * 0.1, 0.38, 0.0], [0.062 * lw * bk, 0.074 * lw * bk, 0.062 * lw * bk, 0.062 * lw * bk], WL), N([s * 0.1, 0.2, 0.004], [0.05 * lw * bk, 0.054 * lw * bk, 0.05 * lw * bk, 0.052 * lw * bk], WL)], "y", NL, { m: mPlate });
        if (fine) tube([N([s * 0.1, 0.58, -0.02], [0.05 * lw, 0.03, 0.05 * lw, 0.05], WK), N([s * 0.1, 0.5, -0.03], [0.05 * lw, 0.03, 0.05 * lw, 0.05], WK)], "y", NL, { m: mPlate, cap0: true, cap1: true });
      }
      // the boot foot: flat sole, heel, rounded toe
      const fk = Math.min(1.15, W);
      tube([
        N([s * 0.1, 0.06, 0.075], [0.044 * fk, 0.048, 0.044 * fk, 0.06], WFt, { m: mBoot }),
        N([s * 0.1, 0.065, 0.02], [0.05 * fk, 0.055, 0.05 * fk, 0.065], WFt),
        N([s * 0.1, 0.045, -0.06], [0.054 * fk, 0.04, 0.054 * fk, 0.045], WFt),
        N([s * 0.1, 0.038, -0.115], [0.051 * fk, 0.031, 0.051 * fk, 0.038], WT),
        N([s * 0.1, 0.03, -0.175], [0.042 * fk, 0.024, 0.042 * fk, 0.03], WTo),
        N([s * 0.1, 0.026, -0.2], [0.026 * fk, 0.016, 0.026 * fk, 0.022], WTo),
      ].slice(0, lod >= 4 ? 5 : 6), "z", NL, { cap0: true, cap1: true });
    }

    // reshi tail
    if (race.cat && !draugr && lod <= 4) {
      const tw = { Hips: 1 }, tm = M(CELL.beard, faceSkin);
      tube([N([0, 0.97, 0.07], [0.032, 0.032], tw, { m: tm }), N([0, 0.9, 0.17], [0.03, 0.03], tw), N([0, 0.72, 0.25], [0.026, 0.026], tw), N([0, 0.5, 0.27], [0.022, 0.022], tw), N([0.02, 0.32, 0.22], [0.02, 0.02], tw), N([0.04, 0.24, 0.16], [0.016, 0.016], tw)].slice(0, mid ? 6 : 4), "y", Math.max(4, NH), { cap1: true });
    }

    // ================= HEAD =================
    buildHead({ lod, fem, HS, race, draugr, skin, faceSkin, glowC, hairStyle, hairC, beard, beardC, helm, wrap, P, A, B, W, outfit, mSkin, mHair, mBeard, fine, mid, NL, NH });
  }
  ctx.color(null); ctx.emissive(null); ctx.albedo(null); ctx.metalness(null); ctx.roughness(null);
  if (lod === 1) ctx.log?.("eq-humanoid tris", { tris: G.n, race: race.id, outfit: P.outfit ?? null, kind });
  return { uvs: G.uv, joints: G.jn, weights: G.wt };
}

function headGrid(lod) {
  if (lod <= 1) return { TH: [-180, -130, -95, -74, -56, -42, -30, -19, -8, 0, 8, 19, 30, 42, 56, 74, 95, 130, 180], PH: [0, 26, 48, 64, 75, 84, 92, 100, 107, 113, 120, 127, 133, 140, 150, 160, 168, 180] };
  if (lod <= 3) return { TH: [-180, -120, -95, -62, -38, -18, 0, 18, 38, 62, 95, 120, 180], PH: [0, 30, 48, 70, 84, 98, 112, 126, 140, 154, 168, 180] };
  return { TH: [-180, -95, -45, 0, 45, 95, 180], PH: [0, 48, 84, 120, 168, 180] };
}

function buildHead(o) {
  const { lod, fem, HS, race, draugr, faceSkin, glowC, hairStyle, hairC, beard, helm, wrap, P, A, B, W, outfit, mSkin, mHair, mBeard, fine, mid } = o;
  const hw = race.id === "stoneborn" ? 1.08 : race.id === "korl" ? 1.04 : fem ? 0.95 : 1;
  HD = { c: [0, 1.7, 0.005], rx: 0.094 * HS * hw, ry: 0.118 * HS, ryl: 0.122 * HS, rzf: 0.102 * HS, rzb: 0.124 * HS, s: HS, w: { Head: 1 }, fem, male: fem ? 0 : 1, gaunt: draugr ? 1 : 0, cat: race.cat && !draugr, jaw: fem ? 1.12 : race.id === "korl" || race.id === "stoneborn" ? 0.62 : 0.8, ...headGrid(lod) };
  const faceM = { tex: FACE[draugr ? "human" : race.id], c: draugr ? "#a9bcb6" : "#ffffff", cell: 0 };
  const headSkin = M(CELL.skin, draugr ? o.skin : faceSkin);
  shell(() => true, 0, headSkin, faceM);
  if (glowC) { const em = M(CELL.plain, glowC, { em: glowC }); decal(-39, 84, 7, 4, 0.004, em); decal(39, 84, 7, 4, 0.004, em); }
  // ears
  const ear = (s) => {
    const base = hpos(s * 100, 94, -0.008), m = M(CELL.skin, draugr ? o.skin : faceSkin), w = HD.w;
    const big = race.id === "korl" || race.id === "stoneborn" ? 1.12 : fem ? 0.92 : 1;
    if (race.cat && !draugr) return;
    const elf = race.elf && !draugr;
    const f = elf ? (c, sn) => 1 + 1.9 * Math.max(0, 0.45 * c + 0.89 * sn) ** 5 : (c, sn) => 1 + 0.18 * Math.max(0, -sn) ** 3;
    tube([
      N(base, [0.015 * big, 0.024 * big], w, { m, f }),
      N([base[0] + s * 0.016, base[1] + 0.002, base[2] + 0.008], [0.022 * big, 0.036 * big], w, { f }),
      N([base[0] + s * 0.026, base[1] + 0.003, base[2] + 0.014], [0.016 * big, 0.031 * big], w, { f }),
    ], "x", lod <= 1 ? 8 : 6, { cap1: true });
  };
  if (lod <= 4 && helm !== "hood" && helm !== "coif" && !wrap) { ear(-1); ear(1); }
  const covered = helm === "hood" || wrap;
  if (race.cat && !draugr && !covered && helm !== "nasal" && helm !== "horned" && lod <= 4) for (const s of [-1, 1]) { // cat ears
    const a = hpos(s * 40, 28, -0.003), b = hpos(s * 78, 42, -0.003), c = hpos(s * 62, 30, 0.012), tip = [s * HD.rx * 0.95, 1.71 + HD.ry + 0.055, 0.0], w = HD.w, m = M(CELL.beard, faceSkin);
    mat(m); const u = [au(CELL.beard, 0, 0), au(CELL.beard, 1, 0), au(CELL.beard, 0.5, 1)];
    tri(a, b, tip, u[0], u[1], u[2], w, w, w, [0, 1.75, 0.04]); tri(b, c, tip, u[0], u[1], u[2], w, w, w, [0, 1.75, 0]); tri(c, a, tip, u[0], u[1], u[2], w, w, w, [0, 1.75, 0]);
  }
  // hair: a shell over the scalp above a hairline, cards for long / braid / topknot
  if (hairStyle !== "bald" && !covered) {
    const longH = hairStyle === "long" || hairStyle === "braid";
    const line = (t) => { const a = Math.abs(t); return a < 30 ? 50 : a < 70 ? lerp(52, 72, (a - 30) / 40) : a < 110 ? lerp(72, 96, (a - 70) / 40) : lerp(96, longH ? 150 : 126, Math.min(1, (a - 110) / 60)); };
    const off = hairStyle === "short" ? 0.008 : 0.012;
    shell((tc, pc, t0, t1, p0) => p0 < line(tc) - 4, off, mHair, null);
    const w2 = { Head: 0.6, Neck: 0.4 };
    if (hairStyle === "long" && lod <= 4) { // a curtain of hair down the back
      // #4c8822cf: the old curtain flared 1.3x wide at every lower row and cut off square, so from behind it read as a box over the head.
      // now it hugs the skull, narrows toward the shoulders like hair falling, and ends in a pointed, uneven fringe (centre longest).
      mat(mHair); const ths = [-105, -140, 180, 140, 105], ys = [1.7, 1.57, 1.46, 1.37];
      const NARROW = [1, 0.86, 0.72, 0.6], FRINGE = [0.05, 0.02, -0.02, 0.02, 0.05];
      for (let r = 0; r < ys.length - 1; r++) for (let k = 0; k < ths.length - 1; k++) {
        const pt = (t, y, ri) => { const tt = t * D, ki = ths.indexOf(t), yy = ri === ys.length - 1 ? y + FRINGE[ki] : y; return [Math.sin(tt) * (HD.rx + 0.016) * NARROW[ri], yy, Math.max(0.03, -Math.cos(tt) * (HD.rzb + 0.018) * (1 - ri * 0.05)) + ri * 0.006]; };
        const wa = r === 0 ? HD.w : w2;
        quad(pt(ths[k], ys[r], r), pt(ths[k + 1], ys[r], r), pt(ths[k + 1], ys[r + 1], r + 1), pt(ths[k], ys[r + 1], r + 1), au(CELL.hair, k / 4, 1 - r / 3), au(CELL.hair, (k + 1) / 4, 1 - r / 3), au(CELL.hair, (k + 1) / 4, 1 - (r + 1) / 3), au(CELL.hair, k / 4, 1 - (r + 1) / 3), wa, wa, w2, w2, [0, ys[r], -0.05]);
      }
      if (fine) for (const s of [-1, 1]) { // side locks framing the face
        const a = hpos(s * 90, 70, 0.012), b = hpos(s * 72, 74, 0.012), c = [s * (HD.rx + 0.01), 1.5, -0.02], d = [s * (HD.rx + 0.025), 1.52, 0.02];
        quad(a, b, c, d, au(CELL.hair, 0, 1), au(CELL.hair, 0.3, 1), au(CELL.hair, 0.3, 0), au(CELL.hair, 0, 0), HD.w, HD.w, w2, w2, [0, 1.65, 0.02]);
      }
    }
    if (hairStyle === "braid" && lod <= 4) tube([N([0, 1.66, 0.11 * HS], [0.03, 0.03], HD.w, { m: mHair }), N([0, 1.5, 0.13], [0.026, 0.026], w2), N([0, 1.36, 0.15], [0.02, 0.02], { Spine2: 1 }), N([0, 1.3, 0.155], [0.014, 0.014], { Spine2: 1 })], "y", 5, { cap1: true });
    if (hairStyle === "topknot" && lod <= 4) tube([N([0, 1.71 + HD.ry - 0.01, 0.03], [0.045, 0.045], HD.w, { m: mHair }), N([0, 1.71 + HD.ry + 0.05, 0.04], [0.04, 0.04], HD.w), N([0, 1.71 + HD.ry + 0.08, 0.045], [0.022, 0.022], HD.w)], "y", 6, { cap1: true });
  }
  // beard
  if (beard !== "none" && beard !== "stubble" && !fem && mid) {
    if (beard === "goatee") shell((tc, pc, t0, t1, p0) => Math.abs(tc) < 25 && p0 >= 126 && p0 < 168, 0.01, mBeard, null);
    else {
      shell((tc, pc, t0, t1, p0) => Math.max(Math.abs(t0), Math.abs(t1)) <= 95 && ((p0 >= 126 && p0 < 168) || (p0 >= 112 && Math.abs(tc) > 25 && p0 < 168)), 0.012, mBeard, null);
      if (beard === "long" || beard === "full") { // the hanging beard
        const L2 = beard === "long" ? 0.24 : 0.11, w = { Head: 0.8, Neck: 0.2 };
        tube([N([0, 1.6, -0.05], [0.075 * HS, 0.035, 0.075 * HS, 0.035], HD.w, { m: mBeard }), N([0, 1.6 - L2 * 0.5, -0.085], [0.07 * HS, 0.03], w), N([0, 1.6 - L2, -0.1], [0.035, 0.02], w)], "y", 6, { cap1: true });
      }
    }
  }
  const cloth = (c) => M(CELL.wool, c);
  if (wrap) shell((tc, pc, t0, t1, p0, p1) => !(Math.max(Math.abs(t0), Math.abs(t1)) <= 62 && p1 > 62) && p0 < 150, 0.02, cloth(P.wrapColor ?? (outfit === "rags" ? A : "#d8c9a4")), null);
  if (P.mask) shell((tc, pc, t0, t1, p0) => Math.max(Math.abs(t0), Math.abs(t1)) <= 100 && p0 >= 98 && p0 < 168, 0.016, cloth(P.maskColor ?? B), null);
  if (helm === "cap") shell((tc, pc, t0, t1, p0, p1) => p1 <= (Math.abs(tc) > 100 ? 98 : 70), 0.016, M(CELL.leather, P.helmColor ?? "#8a6440"), null);
  if (helm === "hood") {
    shell((tc, pc, t0, t1, p0, p1) => !(Math.max(Math.abs(t0), Math.abs(t1)) <= 62 && p1 > 62) && p0 < 154, 0.026, cloth(P.helmColor ?? A), null);
    tube([N([0, 1.62, 0.03], [0.088 * W, 0.112, 0.088 * W, 0.07], { Neck: 0.3, Head: 0.7 }, { m: cloth(P.helmColor ?? A) }), N([0, 1.54, 0.025], [0.13 * W, 0.11, 0.13 * W, 0.082], { Spine2: 0.4, Neck: 0.6 }), N([0, 1.48, 0.02], [0.19 * W, 0.112, 0.19 * W, 0.098], { Spine2: 1 }, { e: 2.3 }), N([0, 1.43, 0.02], [0.215 * W, 0.12, 0.215 * W, 0.11], { Spine2: 1 }, { e: 2.3 })], "y", 12, {});
  }
  if (helm === "nasal" || helm === "horned") {
    const hm = M(CELL.plate, P.helmColor ?? STEEL, { metal: true, flat: true });
    shell((tc, pc, t0, t1, p0, p1) => p1 <= (Math.abs(tc) > 70 ? 98 : 70), 0.02, hm, null);
    if (mid) { const a = hpos(0, 62, 0.024), b = hpos(0, 104, 0.03); tube([N(a, [0.014, 0.008], HD.w, { m: hm }), N(b, [0.012, 0.007], HD.w)], "y", 4, { cap1: true }); }
    if (helm === "horned" && mid) for (const s of [-1, 1]) tube([N([s * 0.07, 1.8, 0.0], [0.03, 0.03], HD.w, { m: M(CELL.bone, "#e2d4b0") }), N([s * 0.15, 1.85, -0.01], [0.024, 0.024], HD.w), N([s * 0.2, 1.93, -0.04], [0.014, 0.014], HD.w), N([s * 0.21, 2.0, -0.08], [0.003, 0.003], HD.w)], "x", 5, {});
  }
}

function sweepBone(pts, r, ws, m) {
  // a bone along a curved path: a squared, bevel-less section whose frame follows the path
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)];
    let t = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; const tl = Math.hypot(...t) || 1; t = t.map((v) => v / tl);
    let sd = [t[2], 0, -t[0]]; if (Math.hypot(...sd) < 0.2) sd = [1, 0, 0]; const sl = Math.hypot(...sd); sd = sd.map((v) => v / sl);
    const up = [sd[1] * t[2] - sd[2] * t[1], sd[2] * t[0] - sd[0] * t[2], sd[0] * t[1] - sd[1] * t[0]];
    const rr = Array.isArray(r[0]) ? r[i] : r, k = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    return k.map(([u, v]) => [p[0] + sd[0] * u * rr[0] + up[0] * v * rr[1], p[1] + sd[1] * u * rr[0] + up[1] * v * rr[1], p[2] + sd[2] * u * rr[0] + up[2] * v * rr[1]]);
  });
  mat(m);
  for (let i = 0; i < pts.length - 1; i++) {
    const A = rings[i], B = rings[i + 1], mid = pts[i].map((v, j) => (v + pts[i + 1][j]) / 2), wa = ws[i] ?? ws[0], wb = ws[i + 1] ?? ws[ws.length - 1];
    for (let j = 0; j < 4; j++) { const j1 = (j + 1) % 4; quad(A[j], A[j1], B[j1], B[j], au(m.cell, j / 4, 0), au(m.cell, (j + 1) / 4, 0), au(m.cell, (j + 1) / 4, 1), au(m.cell, j / 4, 1), wa, wa, wb, wb, mid); }
  }
}
function buildSkeleton(ctx, o) {
  const { NT, NL, NH, mid, mBone, R, ragged, outfit, glowC, P } = o, n = Math.max(4, NL - 2), lod = ctx.lod ?? 1;
  const b = (name) => ({ [name]: 1 });
  // pelvis: sacrum, two flared ilium wings and the pubic arch
  tube([N([0, 0.9, 0.04], [0.045, 0.03], b("Hips"), { m: mBone }), N([0, 0.97, 0.055], [0.06, 0.035], b("Hips")), N([0, 1.03, 0.05], [0.05, 0.03], b("Hips"))], "y", 6, { cap0: true, cap1: true });
  for (const s of [-1, 1]) {
    sweepBone([[s * 0.04, 1.02, 0.05], [s * 0.11, 1.05, 0.03], [s * 0.15, 1.03, -0.01], [s * 0.14, 0.97, -0.04], [s * 0.1, 0.93, -0.03]], [0.028, 0.04], [b("Hips")], mBone);
    sweepBone([[s * 0.1, 0.93, -0.03], [s * 0.07, 0.88, -0.06], [s * 0.015, 0.87, -0.07]], [0.018, 0.02], [b("Hips")], mBone);
  }
  // spine: a knuckled S-curve of vertebrae
  const sp = [];
  const spineW = (y) => y < 1.06 ? b("Hips") : y < 1.2 ? { Spine: 1 } : y < 1.34 ? { Spine1: 1 } : y < 1.52 ? { Spine2: 1 } : y < 1.6 ? { Neck: 1 } : { Neck: 0.4, Head: 0.6 };
  const steps = lod <= 1 ? 22 : lod <= 2 ? 14 : 8;
  for (let i = 0; i <= steps; i++) { const y = 0.98 + (i / steps) * 0.63, z = 0.06 + 0.02 * Math.sin((y - 0.98) * 6.5) - (y > 1.5 ? (y - 1.5) * 0.35 : 0), r = (i % 2 ? 0.024 : 0.032) * (y > 1.5 ? 0.8 : 1); sp.push(N([0, y, z], [r, r * 0.9], spineW(y), i ? {} : { m: mBone })); }
  tube(sp, "y", n, {});
  // ribs: each an arc from the spine round to the breastbone, drooping toward the front
  const ribs = lod <= 1 ? [[1.44, 0.1, 0.075], [1.39, 0.13, 0.09], [1.34, 0.15, 0.1], [1.29, 0.16, 0.105], [1.24, 0.155, 0.1], [1.19, 0.145, 0.095]] : lod <= 2 ? [[1.42, 0.12, 0.085], [1.34, 0.15, 0.1], [1.26, 0.16, 0.105], [1.19, 0.145, 0.095]] : [[1.38, 0.14, 0.095], [1.26, 0.155, 0.1]];
  const rp = lod <= 1 ? 7 : 5;
  for (const [y0, rx, rz] of ribs) for (const s of [-1, 1]) {
    const pts = [], ws = [];
    for (let i = 0; i <= rp; i++) { const f = i / rp, a = f * Math.PI * 0.86; pts.push([s * rx * Math.sin(a), y0 - 0.07 * f * f, 0.055 + (rz) * Math.cos(a) - 0.055 * f]); ws.push(y0 > 1.34 ? { Spine2: 1 } : { Spine1: 0.7, Spine2: 0.3 }); }
    sweepBone(pts, [0.012, 0.007], ws, mBone);
  }
  // breastbone, collarbones, shoulder blades
  sweepBone([[0, 1.45, -0.075], [0, 1.36, -0.098], [0, 1.22, -0.1], [0, 1.15, -0.085]], [[0.026, 0.01], [0.022, 0.01], [0.02, 0.01], [0.008, 0.008]], [{ Spine2: 1 }, { Spine2: 1 }, { Spine1: 1 }, { Spine1: 1 }], mBone);
  for (const s of [-1, 1]) {
    const S = s < 0 ? "Left" : "Right";
    sweepBone([[s * 0.02, 1.46, -0.07], [s * 0.09, 1.475, -0.06], [s * 0.17, 1.48, -0.01], [s * 0.19, 1.47, 0.02]], [0.012, 0.011], [{ Spine2: 1 }, { Spine2: 0.5, [S + "Shoulder"]: 0.5 }, { [S + "Shoulder"]: 1 }], mBone);
    sweepBone([[s * 0.17, 1.46, 0.09], [s * 0.12, 1.4, 0.115], [s * 0.08, 1.3, 0.11]], [[0.035, 0.007], [0.045, 0.007], [0.012, 0.006]], [{ [S + "Shoulder"]: 0.6, Spine2: 0.4 }, { Spine2: 1 }, { Spine2: 1 }], mBone);
    const WA = { [S + "Arm"]: 1 }, WF = { [S + "ForeArm"]: 1 }, WE = { [S + "Arm"]: 0.5, [S + "ForeArm"]: 0.5 }, WH = { [S + "Hand"]: 1 };
    // humerus with its ball and condyles
    tube([N([s * 0.17, SH_Y, 0], [0.036, 0.036], { [S + "Shoulder"]: 0.4, [S + "Arm"]: 0.6 }, { m: mBone }), N([s * 0.205, SH_Y, 0], [0.026, 0.026], WA), N([s * 0.3, SH_Y, 0], [0.019, 0.019], WA), N([s * 0.41, SH_Y, 0], [0.02, 0.022], WA), N([s * 0.45, SH_Y, 0], [0.024, 0.036], WE)], "x", n, { cap0: true, cap1: true });
    // radius and ulna side by side
    for (const dz of [-0.014, 0.014]) tube([N([s * 0.465, SH_Y, dz], [0.016, 0.016], WE, { m: mBone }), N([s * 0.5, SH_Y, dz * 1.1], [0.012, 0.012], WF), N([s * 0.66, SH_Y, dz * 1.2], [0.011, 0.012], WF), N([s * 0.695, SH_Y, dz * 1.3], [0.015, 0.014], { [S + "ForeArm"]: 0.5, [S + "Hand"]: 0.5 })], "x", Math.max(4, n - 2), { cap0: true, cap1: true });
    // hand: carpals, then finger bones curling down
    tube([N([s * 0.7, SH_Y, 0], [0.022, 0.013], WH, { m: mBone }), N([s * 0.735, SH_Y, 0], [0.03, 0.012], WH)], "x", 5, { cap0: true, cap1: true });
    const fz = lod <= 2 ? [-0.022, -0.008, 0.007, 0.021] : [-0.015, 0.014];
    for (const z of fz) sweepBone([[s * 0.735, SH_Y, z * 0.8], [s * 0.79, SH_Y - 0.002, z], [s * 0.835, SH_Y - 0.012, z * 1.05], [s * 0.86, SH_Y - 0.035, z * 1.08]], [0.0055, 0.005], [WH], mBone);
    sweepBone([[s * 0.71, SH_Y, -0.02], [s * 0.74, SH_Y - 0.006, -0.05], [s * 0.765, SH_Y - 0.014, -0.066]], [0.006, 0.0055], [WH], mBone);
    // femur, kneecap, tibia and fibula
    const WU = { [S + "UpLeg"]: 1 }, WL = { [S + "Leg"]: 1 }, WK = { [S + "UpLeg"]: 0.5, [S + "Leg"]: 0.5 };
    tube([N([s * 0.075, 0.93, -0.01], [0.032, 0.032], { Hips: 0.4, [S + "UpLeg"]: 0.6 }, { m: mBone }), N([s * 0.11, 0.9, 0], [0.026, 0.026], WU), N([s * 0.105, 0.8, 0], [0.021, 0.021], WU), N([s * 0.1, 0.6, -0.005], [0.022, 0.022], WU), N([s * 0.1, 0.535, 0], [0.04, 0.032], WK)], "y", n, { cap0: true, cap1: true });
    tube([N([s * 0.1, 0.55, -0.04], [0.02, 0.012], WK, { m: mBone }), N([s * 0.1, 0.5, -0.042], [0.018, 0.01], WL)], "y", 4, { cap0: true, cap1: true });
    tube([N([s * 0.1, 0.515, -0.005], [0.036, 0.03], WK, { m: mBone }), N([s * 0.1, 0.46, -0.008], [0.022, 0.022], WL), N([s * 0.1, 0.13, 0], [0.017, 0.017], WL), N([s * 0.1, 0.085, 0], [0.026, 0.024], { [S + "Leg"]: 0.5, [S + "Foot"]: 0.5 })], "y", n, { cap0: true, cap1: true });
    if (mid) tube([N([s * 0.117, 0.48, 0.014], [0.01, 0.01], WL, { m: mBone }), N([s * 0.115, 0.12, 0.012], [0.009, 0.009], WL)], "y", 4, { cap0: true, cap1: true });
    // foot: heel, arch and toe bones
    const WFt = { [S + "Foot"]: 1 }, WT = { [S + "ToeBase"]: 1 };
    tube([N([s * 0.1, 0.045, 0.055], [0.024, 0.03, 0.024, 0.03], WFt, { m: mBone }), N([s * 0.1, 0.06, 0.0], [0.03, 0.025], WFt), N([s * 0.1, 0.035, -0.07], [0.04, 0.012], { [S + "Foot"]: 0.5, [S + "ToeBase"]: 0.5 })], "z", 6, { cap0: true, cap1: true });
    for (const dx of lod <= 2 ? [-0.028, -0.01, 0.008, 0.024] : [-0.015, 0.015]) sweepBone([[s * (0.1 + dx * 0.8), 0.03, -0.075], [s * (0.1 + dx), 0.016, -0.13], [s * (0.1 + dx * 1.05), 0.008, -0.17]], [0.007, 0.006], [WT], mBone);
  }
  // skull: a full cranium sitting on the top vertebra, deep at the back
  HD = { c: [0, 1.672, 0.008], rx: 0.09, ry: 0.11, ryl: 0.104, rzf: 0.098, rzb: 0.118, s: 1, w: { Head: 1 }, skull: true, jaw: 1.25, ...headGrid(lod) };
  shell(() => true, 0, mBone, null);
  const dark = M(CELL.plain, "#141110");
  decal(-30, 88, 17, 14, 0.004, dark); decal(30, 88, 17, 14, 0.004, dark); decal(0, 108, 6, 9, 0.004, dark);
  if (mid) { decal(0, 132, 28, 4, 0.004, dark); for (let k = -3; k <= 3; k++) decal(k * 7.5, 132, 2.6, 3.2, 0.007, mBone); }
  if (glowC) { const em = M(CELL.plain, glowC, { em: glowC }); decal(-30, 88, 7, 6, 0.009, em); decal(30, 88, 7, 6, 0.009, em); }
  // the lower jaw: a U of bone from ear to chin, hung open a little
  for (const sd of [-1, 1]) sweepBone([[sd * 0.07, 1.652, 0.02], [sd * 0.068, 1.582, 0.0], [sd * 0.05, 1.567, -0.05], [sd * 0.015, 1.572, -0.085]], [0.009, 0.012], [HD.w], mBone);
  tube([N([0, 1.564, -0.095], [0.022, 0.014], HD.w, { m: mBone }), N([0, 1.582, -0.09], [0.02, 0.012], HD.w)], "y", 5, { cap0: true, cap1: true });
  if (outfit === "rags") { // a torn loincloth
    const m = o.mSack, Rr = rng((P.seed ?? 1) * 7.3), nn = 10; mat(m);
    for (let j = 0; j < nn; j++) {
      const t0 = Math.PI / 2 + (j / nn) * 6.283, t1 = Math.PI / 2 + ((j + 1) / nn) * 6.283, d0 = (Rr() - 0.3) * 0.12, d1 = (Rr() - 0.3) * 0.12, w = { Hips: 1 };
      quad([Math.cos(t0) * 0.16, 1.02, Math.sin(t0) * 0.1], [Math.cos(t1) * 0.16, 1.02, Math.sin(t1) * 0.1], [Math.cos(t1) * 0.19, 0.76 + d1, Math.sin(t1) * 0.13], [Math.cos(t0) * 0.19, 0.76 + d0, Math.sin(t0) * 0.13], au(m.cell, j / nn, 1), au(m.cell, (j + 1) / nn, 1), au(m.cell, (j + 1) / nn, 0), au(m.cell, j / nn, 0), w, w, w, w, [0, 1.1, 0]);
    }
  }
  void R; void NH; void NT; void ragged;
}
