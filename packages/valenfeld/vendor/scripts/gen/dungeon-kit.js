// The dungeon kit: one room, the corridors, or an overworld mouth, built from a plan made by
// scripts/lib/dungeon-builder.js. Style (textures + dressing set) comes from dungeon-styles.yml by kind.
// PARAMS beyond the plan (Codex Kits): style = any dungeon-styles.yml key; feats = the dressing set over the style's own
// (bands roots bones sarcophagi beams columns rocks props rails channel sky); drop = feats taken off. Omitted = the style as written.
// Every part stands at the place origin: its geometry is in place coordinates. Collider = same builder, boxes only.
import { kit } from "./barrow-kit.js";
import { channelFloor } from "../lib/channel.js";
import { vaultArc, vaultShell, vaultRibs } from "../lib/vault.js";
import STYLES from "../lib/data/dungeon-styles.json";

const OAK = "cdn/texture-dark-oak-planks-weathered.png";
const BEAM = "cdn/texture-adze-hewn-oak-timber-long-grain-weathered-side-face.png";   // critic r2: hewn timber along its length, not planks or end rings
const T = 0.6;    // wall thickness
const DH = 4.5;   // doorway and corridor height
const CW = 3;     // corridor width

const mk = (s) => { let a = (s * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const rr = (r, a, b) => a + (b - a) * r();

export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }

function build(ctx, col) {
  const p = ctx.params ?? {}, S = STYLES[p.style] ?? STYLES.barrow, K = kit(ctx, col);
  const feats = (p.feats ?? S.feats ?? []).filter((f) => !(p.drop ?? []).includes(f));
  const E = { ctx, K, S, F: new Set(feats), col, lod: ctx.lod ?? 1, oakTrim: p.style === "mine", open: !!p.open };   // open: a cut-away room with no lid (the component yard draws its plots roofless, so a plot reads from above);
  let oakN = 0;   // critic r2 (mine): every timber one plank-texture brown; each piece now takes hewn beam grain and its own age, fresh pine to smoke-black oak
  const OAKS = ["oklch(0.92 0.03 75)", "oklch(0.78 0.04 60)", "oklch(0.66 0.03 50)", "oklch(0.86 0.05 85)", "oklch(0.72 0.02 40)"];
  E.paint = (k, rough = 0.92) => K.paint(k === "oak" ? BEAM : (S[k] ?? S.wall), k === "oak" ? OAKS[(oakN++ * 7 + (p.seed ?? 0)) % OAKS.length] : (S.tint ?? "#ffffff"), rough);
  E.flat = (css, rough = 0.85, metal = 0) => K.paint(null, css, rough, metal);
  if (p.part === "mouth") return mouth(E, p);
  if (p.part === "corridor") { for (const c of p.corridors ?? []) (c.path ? bentCorridor : corridor)(E, c); for (const t of p.torches ?? []) fixture(E, t); return; }
  if (p.room) { const f = () => { room(E, p.room); for (const t of p.room.torches ?? []) fixture(E, t); }; p.room.fy ? K.at(f, 0, p.room.fy, 0) : f(); }   // organic relief: the whole room stands at its floor height
}

// a box against a room side: along-side [s0,s1], height [y0,y1], depth [a,b] measured into the room from the wall plane
function sbox(E, R, side, s0, s1, y0, y1, a, b, bevel = false) {
  const f = bevel ? E.K.bbox : E.K.box;
  if (side === "n") f(s0, y0, R.z0 + a, s1, y1, R.z0 + b);
  else if (side === "s") f(s0, y0, R.z1 - b, s1, y1, R.z1 - a);
  else if (side === "w") f(R.x0 + a, y0, s0, R.x0 + b, y1, s1);
  else f(R.x1 - b, y0, s0, R.x1 - a, y1, s1);
}
const span = (R, side) => (side === "n" || side === "s") ? [R.x0, R.x1] : [R.z0, R.z1];
const spt = (R, side, s, off) => side === "n" ? [s, R.z0 + off, 90] : side === "s" ? [s, R.z1 - off, 90] : side === "w" ? [R.x0 + off, s, 0] : [R.x1 - off, s, 0];
const doorsOn = (R, side) => (R.doors ?? []).filter((d) => d.side === side);
const nearDoor = (R, side, s, pad) => doorsOn(R, side).some((d) => Math.abs(d.at - s) < CW / 2 + pad);

// rails: a mine's cart track down the long axis (c = centre across, a0..a1 along); sleepers every 0.6 m, two iron rails on 1 m gauge
function track(E, alongZ, c, a0, a1) {
  const { K, col, lod } = E; if (col) return;
  const B = (u0, y0, v0, u1, y1, v1) => alongZ ? K.box(u0, y0, v0, u1, y1, v1) : K.box(v0, y0, u0, v1, y1, u1);
  if (lod <= 2) { E.paint("oak"); for (let a = a0 + 0.3; a < a1 - 0.2; a += 0.6) B(c - 0.75, 0, a - 0.1, c + 0.75, 0.07, a + 0.1); }
  E.flat("oklch(0.36 0.012 50)", 0.55, 0.7);
  for (const g of [-0.5, 0.5]) B(c + g - 0.035, 0.07, a0, c + g + 0.035, 0.15, a1);
}
// an ore cart on the line: oak tub, iron bands, wheels, a heap of ore
function cart(E, alongZ, c, a, r) {
  const { K, col } = E;
  const B = (u0, y0, v0, u1, y1, v1) => alongZ ? K.box(u0, y0, v0, u1, y1, v1) : K.box(v0, y0, u0, v1, y1, u1);
  if (col) return B(c - 0.6, 0.15, a - 0.8, c + 0.6, 1.05, a + 0.8);
  E.flat("oklch(0.3 0.01 50)", 0.6, 0.6);
  for (const g of [-0.5, 0.5]) for (const t of [-0.5, 0.5]) B(c + g - 0.06, 0.12, a + t - 0.2, c + g + 0.06, 0.52, a + t + 0.2);
  B(c - 0.55, 0.3, a - 0.75, c + 0.55, 0.4, a + 0.75);
  E.paint("oak");
  B(c - 0.6, 0.4, a - 0.8, c + 0.6, 0.48, a + 0.8);
  B(c - 0.6, 0.48, a - 0.8, c - 0.52, 1.05, a + 0.8); B(c + 0.52, 0.48, a - 0.8, c + 0.6, 1.05, a + 0.8);
  B(c - 0.52, 0.48, a - 0.8, c + 0.52, 1.05, a - 0.72); B(c - 0.52, 0.48, a + 0.72, c + 0.52, 1.05, a + 0.8);
  E.flat("oklch(0.3 0.01 50)", 0.6, 0.6);
  for (const t of [-0.45, 0.45]) { B(c - 0.63, 0.55, a + t - 0.04, c + 0.63, 0.62, a + t + 0.04); B(c - 0.63, 0.95, a + t - 0.04, c + 0.63, 1.0, a + t + 0.04); }
  E.flat("oklch(0.32 0.02 60)", 0.95);
  for (let i = 0; i < 4; i++) { const u = c + rr(r, -0.3, 0.3), v = a + rr(r, -0.5, 0.5); alongZ ? K.rock(u, 1.0, v, rr(r, 0.2, 0.32), rr(r, 0.15, 0.25), rr(r, 0.2, 0.32), 6, 4, 0.25) : K.rock(v, 1.0, u, rr(r, 0.2, 0.32), rr(r, 0.15, 0.25), rr(r, 0.2, 0.32), 6, 4, 0.25); }
}

function room(E, R) {
  E.vaulted = false;
  const { K, F, col, lod } = E, r = mk(R.seed ?? 7);
  const { x0, z0, x1, z1, h: H } = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  const rocky = F.has("rocks") || R.kind === "cavern";
  // floor
  E.paint("floor");
  if (R.pit) pit(E, R, r);
  else if (R.basin) basin(E, R);
  else if (F.has("channel") && R.kind !== "boss" && R.kind !== "entry") channel(E, R);
  else if (F.has("sea") && R.kind !== "bridge" && w >= 10) seaPool(E, R, r);   // critic r4: "nothing marine": a tide pool sunk off the walk line
  else K.box(x0 - 0.3, -1.2, z0 - 0.3, x1 + 0.3, 0, z1 + 0.3);   // a thick slab that runs under the walls
  // walls with their doorways; a pit room's walls fall to the pit floor
  E.paint("wall");
  for (const side of ["n", "s", "w", "e"]) {
    const ext = side === "n" || side === "s" ? T : 0, [a0, a1] = span(R, side), A0 = a0 - ext, A1 = a1 + ext;
    if (R.pit) sbox(E, R, side, A0, A1, -(R.pitDepth ?? 10.4), 0, -T, 0);
    let cur = A0;
    for (const dr of doorsOn(R, side).filter((q) => !q.exit).sort((p, q) => p.at - q.at)) {
      const o0 = dr.at - CW / 2, o1 = dr.at + CW / 2;
      if (o0 > cur) sbox(E, R, side, cur, o0, 0, H + 0.4, -T, 0);
      sbox(E, R, side, o0, o1, DH, H + 0.4, -T, 0); cur = o1;
    }
    if (cur < A1) sbox(E, R, side, cur, A1, 0, H + 0.4, -T, 0);
  }
  // ceiling (a ruin's big rooms are open to the sky in the middle)
  E.paint("ceil");
  const hole = E.open ? 0 : F.has("sky") && w >= 10 && d >= 10 ? 2 : 0;
  if (hole) {
    K.box(x0 - T, H, z0 - T, x1 + T, H + 0.4, cz - hole); K.box(x0 - T, H, cz + hole, x1 + T, H + 0.4, z1 + T);
    K.box(x0 - T, H, cz - hole, cx - hole, H + 0.4, cz + hole); K.box(cx + hole, H, cz - hole, x1 + T, H + 0.4, cz + hole);
    if (!col) { E.paint("wall"); for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283; K.rock(cx + Math.cos(a) * hole * 1.15, H + 0.1, cz + Math.sin(a) * hole * 1.15, rr(r, 0.4, 0.8), rr(r, 0.25, 0.45), rr(r, 0.4, 0.8)); } }
  } else if (E.open) { /* cut-away: no lid, the walls stand open to the sky */ }
  else if (!col && !rocky && !R.pit && !E.oakTrim && Math.min(w, d) >= 5 && R.kind !== "cavern") {
    // critic r3: "flat ceilings, one identical room shell": a segmental barrel vault along the long axis, its rise varied per room,
    // lunettes closed by the end walls; the flat lid moves up over the crown (the collider keeps the old lid at H)
    const along = d >= w, hs = (along ? w : d) / 2, rise = Math.min(hs * rr(r, 0.42, 0.62), 3.2), n = lod <= 2 ? 12 : 5;   // the shared vault (scripts/lib/vault.js), segmental profile
    const spec = { profile: "segmental", mid: along ? cx : cz, half: hs, spring: H, rise, n }, arc = vaultArc(spec), out = [cx, H + rise + 20, cz];
    const q0 = (along ? z0 : x0) - 0.05, q1 = (along ? z1 : x1) + 0.05;
    E.paint(E.S.vault ? "vault" : "ceil");
    vaultShell(K.quad, along, arc, q0, q1, out);
    E.paint("wall");   // the end walls rise to close the lunettes
    if (along) { K.box(x0 - T, H, z0 - T, x1 + T, H + rise + 0.2, z0); K.box(x0 - T, H, z1, x1 + T, H + rise + 0.2, z1 + T); }
    else { K.box(x0 - T, H, z0 - T, x0, H + rise + 0.2, z1 + T); K.box(x1, H, z0 - T, x1 + T, H + rise + 0.2, z1 + T); }
    E.paint("trim");   // transverse ribs ride the vault at each bay
    if (lod <= 2) { const L = along ? d : w, nb = Math.max(1, Math.round(L / 4.5)), lines = []; for (let b = 1; b < nb; b++) lines.push((along ? z0 : x0) + b * L / nb);
      vaultRibs(K.quad, along, arc, vaultArc({ ...spec, inset: 0.97 }), lines, 0.3, out); }
    E.vaulted = true;
  } else K.box(x0 - T, H, z0 - T, x1 + T, H + 0.4, z1 + T);
  // doorway surrounds: jambs and a lintel in the trim stone (timber in a mine)
  E.paint(E.oakTrim ? "oak" : "trim");
  const rockDoor = (F.has("rocks") || R.kind === "cavern") && !E.oakTrim;   // critic r5 (grotto): a cut-stone square doorway in raw rock read as a box; a cave's mouths are heaped boulders
  for (const dr of R.doors ?? []) {
    const o0 = dr.at - (dr.exit ? 1.5 : CW / 2), o1 = dr.at + (dr.exit ? 1.5 : CW / 2), top = dr.exit ? 3.6 : DH;
    if (rockDoor && !dr.exit) { const rd = mk((R.seed ?? 7) + Math.round(dr.at * 13) + dr.side.charCodeAt(0)); E.paint("wall");
      for (const [s0, sg] of [[o0, -1], [o1, 1]]) for (let k = 0; k < 3; k++) { const [x, z] = spt(R, dr.side, s0 + sg * rr(rd, 0.45, 0.75), rr(rd, 0.05, 0.35)); K.rock(x, 0.5 + k * 1.15, z, rr(rd, 0.55, 0.85), rr(rd, 0.7, 1.0), rr(rd, 0.55, 0.85), 7, 5, 0.22); }
      for (let q = o0 - 0.4; q <= o1 + 0.41; q += (o1 - o0 + 0.8) / 2) { const [x, z] = spt(R, dr.side, q, rr(rd, 0.05, 0.3)); K.rock(x, top + 0.55, z, rr(rd, 0.8, 1.1), rr(rd, 0.45, 0.65), rr(rd, 0.6, 0.9), 7, 5, 0.22); }
      continue; }
    sbox(E, R, dr.side, o0 - 0.55, o0, 0, top, 0, 0.24, true); sbox(E, R, dr.side, o1, o1 + 0.55, 0, top, 0, 0.24, true);
    sbox(E, R, dr.side, o0 - 0.75, o1 + 0.75, top, top + 0.6, 0, 0.3, true);
    if (dr.exit) {   // the way out: a heavy banded door sunk in the wall, the portal arch stands before it
      E.paint("oak"); sbox(E, R, dr.side, o0, o1, 0, top, 0.02, 0.12);
      E.flat("#2b2a28", 0.55, 0.7); for (const y of [0.5, 1.7, 2.9]) sbox(E, R, dr.side, o0 + 0.05, o1 - 0.05, y, y + 0.12, 0.12, 0.16);
      E.paint(E.oakTrim ? "oak" : "trim");
    }
  }
  // carved base course and cornice
  if (F.has("bands") && !R.pit) for (const side of ["n", "s", "w", "e"]) {
    const [a0, a1] = span(R, side); let cur = a0;
    for (const dr of doorsOn(R, side).sort((p, q) => p.at - q.at)) { const o0 = dr.at - (dr.exit ? 2.05 : 2.05); if (o0 > cur) sbox(E, R, side, cur, o0, 0, 0.5, 0, 0.14); cur = dr.at + 2.05; }
    if (cur < a1) sbox(E, R, side, cur, a1, 0, 0.5, 0, 0.14);
    sbox(E, R, side, a0, a1, H - 0.35, H, 0, 0.2);
  }
  // bays: pilasters up the walls carrying ribs across the vault (worked stone rooms of size)
  if (!rocky && !R.pit && Math.max(w, d) >= 10 && R.kind !== "crypt") {
    const along = d >= w, L = along ? d : w, n = Math.max(2, Math.round(L / 3.6)), step = L / n;
    for (let i = 1; i < n; i++) {
      const s = (along ? z0 : x0) + i * step, sides = along ? ["w", "e"] : ["n", "s"];
      if (sides.every((sd) => nearDoor(R, sd, s, 1.0))) continue;
      for (const sd of sides) if (!nearDoor(R, sd, s, 1.0)) sbox(E, R, sd, s - 0.35, s + 0.35, 0, H, 0, 0.3, true);
      if (!E.vaulted) { if (along) K.bbox(x0, H - 0.55, s - 0.35, x1, H, s + 0.35); else K.bbox(s - 0.35, H - 0.55, z0, s + 0.35, H, z1); }
    }
  }
  if (F.has("beams") && !rocky) {
    E.paint("oak");
    const along = d >= w, L = along ? d : w;
    for (let s = 1.25; s < L - 0.5; s += 2.5) { const q = (along ? z0 : x0) + s; if (along) K.bbox(x0, H - 0.75, q - 0.17, x1, H - 0.4, q + 0.17); else K.bbox(q - 0.17, H - 0.75, z0, q + 0.17, H - 0.4, z1); }
  }
  if (F.has("props")) {   // a mine's timber sets: posts against the long walls, a cap across
    E.paint("oak");
    const along = d >= w, L = along ? d : w, sides = along ? ["w", "e"] : ["n", "s"];
    for (let s = 1.5; s < L - 0.5; s += 3) {
      const q = (along ? z0 : x0) + s;
      for (const sd of sides) if (!nearDoor(R, sd, q, 0.6)) sbox(E, R, sd, q - 0.16, q + 0.16, 0, 3.9, 0.05, 0.37);
      if (along) K.box(x0, 3.9, q - 0.18, x1, 4.25, q + 0.18); else K.box(q - 0.18, 3.9, z0, q + 0.18, 4.25, z1);
    }
  }
  if (F.has("rails") && !R.pit && !R.basin) {   // critic r1 "nothing says mine": a cart line through every room, a cart left in half of them
    // a spur from every doorway to the room's middle: opposite doors join into one line, the tunnel tracks run on through
    let best = null;
    for (const dr of R.doors ?? []) {
      const ns = dr.side === "n" || dr.side === "s", a0 = dr.side === "n" ? z0 : dr.side === "s" ? cz : dr.side === "w" ? x0 : cx, a1 = dr.side === "n" ? cz + 0.75 : dr.side === "s" ? z1 : dr.side === "w" ? cx + 0.75 : x1;
      track(E, ns, dr.at, a0, a1);
      if (!best || a1 - a0 > best.a1 - best.a0) best = { ns, c: dr.at, a0, a1 };
    }
    if (best && R.kind !== "entry" && best.a1 - best.a0 > 4 && r() < 0.55) cart(E, best.ns, best.c, (best.a0 + best.a1) / 2, r);
  }
  // living rock over the walls and hanging from the roof
  if (rocky) {
    E.paint("wall");
    for (const side of ["n", "s", "w", "e"]) {
      const [a0, a1] = span(R, side);
      for (let s = a0 + 0.6; s < a1 - 0.3; s += rr(r, 1.4, 2.0)) {
        if (nearDoor(R, side, s, 0.9)) continue;
        if (F.has("props") && ((d >= w) === (side === "w" || side === "e"))) {   // critic r4: boulders swallowed the timber sets: keep 1 m clear either side of each post
          const k = (s - ((d >= w) ? z0 : x0) - 1.5) / 3, off = Math.abs(k - Math.round(k)) * 3; if (off < 1.0) continue; }
        const big = R.kind === "cavern" ? 1.5 : 1;
        const [x, z] = spt(R, side, s, rr(r, 0.15, 0.5) * big);
        const ry = rr(r, 0.2, 1.2), rsx = rr(r, 0.9, 1.5) * big, rsy = rr(r, 1.1, 1.9), rsz = rr(r, 0.8, 1.3) * big;   // critic r5: wall rocks were ankle bumps on a 5 m flat face
        if (!R.pitDepth) K.rock(x, ry, z, rsx, rsy, rsz, 8, 5, 0.2);   // an organic pit keeps its walls clear at deck height: the stair back up runs beneath
        if (r() < 0.85) { const [x2, z2] = spt(R, side, s + 0.5, rr(r, -0.2, 0.2)); K.rock(x2, rr(r, 2.4, H - 0.8), z2, rr(r, 0.6, 1.1), rr(r, 0.7, 1.2), rr(r, 0.6, 1.1), 7, 5, 0.22); }
        if (!col && lod <= 3 && r() < 0.7) { const [x3, z3] = spt(R, side, s + rr(r, -0.4, 0.4), rr(r, 0, 0.3)); K.rock(x3, H - rr(r, 0.1, 0.5), z3, rr(r, 0.9, 1.5), rr(r, 0.6, 1.0), rr(r, 0.8, 1.3), 7, 5, 0.25); }   // critic r5: the wall met the roof in a straight line, a box; rock bulges over the join
      }
    }
    if (!col && lod <= 2 && !E.open) {
      E.paint("ceil");
      const n = Math.round(w * d / 9);
      for (let i = 0; i < n; i++) { const len = rr(r, 0.4, 1.6); K.cyl(rr(r, x0 + 0.8, x1 - 0.8), H - len, rr(r, z0 + 0.8, z1 - 0.8), 0.02, rr(r, 0.12, 0.3), len + 0.05, 6); }
      E.paint("wall"); for (let i = 0; i < Math.max(2, Math.round(w * d / 28)); i++) K.rock(rr(r, x0 + 1.5, x1 - 1.5), H - rr(r, 0.05, 0.3), rr(r, z0 + 1.5, z1 - 1.5), rr(r, 1.4, 2.6), rr(r, 0.5, 0.95), rr(r, 1.4, 2.6), 8, 5, 0.25);   // critic r5: a flat lid; the roof sags in rock masses
    }
  }
  if (F.has("roots") && !col && !E.open && lod <= 2) { E.flat("#3a2a1c", 1); for (let i = 0; i < Math.round(w * d / 10); i++) K.root(rr(r, x0 + 0.5, x1 - 0.5), H, rr(r, z0 + 0.5, z1 - 0.5), rr(r, 0.6, 1.8)); }
  // what each kind of room is for
  const fn = KINDS[R.kind]; if (fn) fn(E, R, r);
  if (F.has("columns") && !rocky && w >= 8 && d >= 10 && ["hall", "chamber", "boss"].includes(R.kind)) {
    if (R.kind === "boss") { const along = (R.dir === "n" || R.dir === "s"); for (const t of [0.22, 0.5, 0.78]) for (const sg of [-1, 1]) along ? column(E, cx + sg * (w / 2 - 2.6), z0 + d * t, H) : column(E, x0 + w * t, cz + sg * (d / 2 - 2.6), H); }
    else if (R.kind === "hall") { const along = d >= w; for (let t = 3; t < (along ? d : w) - 2; t += 3.6) for (const sg of [-1, 1]) along ? column(E, cx + sg * (w / 2 - 1.5), z0 + t, H) : column(E, x0 + t, cz + sg * (d / 2 - 1.5), H); }
    else for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) column(E, cx + sx * (w / 2 - 2.6), cz + sz * (d / 2 - 2.6), H);
  }
  if (F.has("bones") && !col && lod <= 2 && !R.pit && R.kind !== "entry") for (let i = 0; i < 3; i++) K.at(() => K.skeleton(true), rr(r, x0 + 1.5, x1 - 1.5), R.basin ? -0.6 : 0, rr(r, z0 + 1.5, z1 - 1.5), rr(r, 0, 360), 0, rr(r, -20, 20));
}

function column(E, x, z, H) {
  const { K, ctx } = E;
  E.paint(E.oakTrim ? "oak" : "trim");
  K.bbox(x - 0.55, 0, z - 0.55, x + 0.55, 0.45, z + 0.55, 0.05);
  K.bbox(x - 0.5, H - 0.55, z - 0.5, x + 0.5, H, z + 0.5, 0.05);
  if (!E.col) ctx.smooth();
  K.cyl(x, 0.45, z, 0.38, 0.33, H - 1.0, E.col ? 8 : (E.lod >= 3 ? 8 : 14));
  if (!E.col) ctx.flat();
}

function sarcophagus(E, x, z, yaw, r) {
  const { K } = E;
  K.at(() => {
    E.paint("trim"); K.bbox(-0.5, 0, -1.15, 0.5, 0.75, 1.15, 0.04);
    E.paint("wall"); K.bbox(-0.56, 0.75, -1.22, 0.56, 0.95, 1.22, 0.05);
    if (!E.col && E.lod <= 2) { K.bbox(-0.3, 0.95, -0.95, 0.3, 1.08, 0.95, 0.04); K.rock(0, 1.12, -0.75, 0.2, 0.11, 0.17, 7, 5, 0.1); }
  }, x, 0, z, yaw + rr(r, -4, 4));
}

const KINDS = {
  entry(E, R, r) {   // critic r2: the first room was four bare walls; it now says what this place is before the player takes a step
    const { K, F, col, lod } = E; if (col || lod > 2) return;
    const { x0, z0, x1, z1 } = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, along = (z1 - z0) >= (x1 - x0);
    if (F.has("sarcophagi")) {   // a crypt: one lidded dead off the walk line, bones at its foot
      sarcophagus(E, along ? x0 + 1.4 : cx + 1.5, along ? cz + 1.2 : z0 + 1.4, along ? 0 : 90, r);
      for (let i = 0; i < 2; i++) K.at(() => K.skeleton(true), along ? x1 - 1.2 : rr(r, x0 + 1, x1 - 1), 0, along ? rr(r, z0 + 1, z1 - 1) : z1 - 1.2, rr(r, 0, 360), 0, rr(r, -15, 15));
    }
    if (F.has("channel")) {   // a sewer: the outfalls are shared spout rows (scripts/lib/spout.js facingPair) the builders place; here the grate and sludge
      E.flat("oklch(0.22 0.01 60)", 0.5, 0.8);   // the grate over the channel at the room's far end
      for (let i = -3; i <= 3; i++) along ? K.box(cx - 0.75, -0.05, z0 + 2 + i * 0.12, cx + 0.75, 0.02, z0 + 2.05 + i * 0.12) : K.box(x0 + 2 + i * 0.12, -0.05, cz - 0.75, x0 + 2.05 + i * 0.12, 0.02, cz + 0.75);
      K.paint("cdn/texture-dark-wet-sewer-sludge-silt-with-debris.png", "oklch(0.75 0.06 125)", 0.12);   // sludge heaps against the walls, wet
      for (let i = 0; i < 4; i++) K.rock(along ? (i % 2 ? x0 + 0.5 : x1 - 0.5) : rr(r, x0 + 1, x1 - 1), 0, along ? rr(r, z0 + 1, z1 - 1) : (i % 2 ? z0 + 0.5 : z1 - 0.5), rr(r, 0.3, 0.6), rr(r, 0.1, 0.2), rr(r, 0.3, 0.6), 6, 4, 0.3);
    }
  },
  crypt(E, R, r) {   // burial niches between pilasters, shelves of the dead
    const { K } = E; const H = R.h;
    for (const side of ["n", "s", "w", "e"]) {
      const [a0, a1] = span(R, side);
      for (let s = a0 + 0.3; s + 2.4 <= a1 - 0.3; s += 2.4) {
        if (nearDoor(R, side, s + 1.2, 1.4)) continue;
        E.paint("trim");
        sbox(E, R, side, s, s + 0.6, 0, 3.0, 0, 0.75, true); sbox(E, R, side, s + 1.8, s + 2.4, 0, 3.0, 0, 0.75, true);
        sbox(E, R, side, s, s + 2.4, 3.0, 3.4, 0, 0.8, true);
        sbox(E, R, side, s + 0.6, s + 1.8, 0, 0.5, 0, 0.7);
        sbox(E, R, side, s + 0.6, s + 1.8, 1.5, 1.62, 0, 0.7);
        if (!E.col && E.lod <= 2) {
          const [x, z, yaw] = spt(R, side, s + 1.2, 0.36);
          K.at(() => K.skeleton(r() < 0.4), x, 0.5, z, yaw, 0, 0);
          K.at(() => K.skeleton(true), x, 1.62, z, yaw + 180, 0, 0);
        }
      }
    }
    const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2, along = (R.z1 - R.z0) >= (R.x1 - R.x0);
    if (E.F.has("sarcophagi")) for (const sg of [-1, 1]) sarcophagus(E, along ? cx + sg * 1.4 : cx, along ? cz : cz + sg * 1.4, along ? 0 : 90, r);
    else { E.paint("trim"); K.bbox(cx - 0.9, 0, cz - 0.9, cx + 0.9, 1.0, cz + 0.9); }
  },
  boss(E, R, r) {   // the dais: two steps, an altar, a standing stone behind
    const { K } = E; const D = R.dais; if (!D) return;
    E.paint("trim"); K.bbox(D.x - 4.2, 0, D.z - 4.2, D.x + 4.2, 0.4, D.z + 4.2, 0.05);
    E.paint("floor"); K.bbox(D.x - 3.1, 0.4, D.z - 3.1, D.x + 3.1, 0.8, D.z + 3.1, 0.05);
    const [fx, fz] = D.back; // unit vector toward the back wall
    E.paint("wall"); K.bbox(D.x - 1.2, 0.8, D.z - 1.2, D.x + 1.2, 1.0, D.z + 1.2, 0.04);
    E.paint("trim"); K.bbox(D.x - 0.9, 1.0, D.z - 0.55, D.x + 0.9, 1.9, D.z + 0.55, 0.05);
    const bx = D.x + fx * 2.2, bz = D.z + fz * 2.2;
    E.paint("wall"); K.bbox(bx - 0.7, 0.8, bz - 0.7, bx + 0.7, 5.2, bz + 0.7, 0.06);
    E.flat("#1b1a18", 0.6, 0.6); K.bbox(bx - 0.75, 4.2, bz - 0.75, bx + 0.75, 4.45, bz + 0.75);
    if (!E.col) { E.flat("#8a2a1c", 0.95); K.box(D.x - 0.92, 1.9, D.z - 0.35, D.x + 0.92, 1.93, D.z + 0.35); }
  },
  shrine(E, R, r) {
    const { K } = E; const A = R.altar; if (!A) return;
    K.at(() => {
      E.paint("trim"); K.bbox(-1.3, 0, -0.7, 1.3, 0.3, 0.7); K.bbox(-1.05, 0.3, -0.55, 1.05, 1.15, 0.55, 0.05); K.bbox(-1.15, 1.15, -0.62, 1.15, 1.3, 0.62);
      if (!E.col) { E.flat("#6a1e1a", 0.95); K.box(-0.5, 1.3, -0.63, 0.5, 1.31, 0.63); K.box(-0.5, 0.6, -0.64, 0.5, 1.3, -0.62); E.flat("#e8dcc0", 0.6); for (const x of [-0.8, -0.65, 0.7, 0.85]) K.cyl(x, 1.3, 0.2 * Math.sign(x), 0.035, 0.035, 0.2 + Math.abs(x) * 0.1, 6); }
      E.paint("wall"); K.bbox(-0.6, 0, 0.9, 0.6, 3.6, 1.4, 0.06); E.paint("trim"); K.bbox(-0.8, 3.6, 0.8, 0.8, 4.0, 1.5);
    }, A.x, 0, A.z, A.yaw);
  },
  treasury(E, R, r) {
    const { K, col } = E; if (col && false) return;
    for (const side of ["n", "s", "w", "e"]) {
      const [a0, a1] = span(R, side);
      for (let s = a0 + 1; s < a1 - 0.8; s += rr(r, 1.3, 2.2)) {
        if (nearDoor(R, side, s, 0.8)) continue;
        const [x, z] = spt(R, side, s, 0.55);
        if (r() < 0.6) { E.flat("#8a5a3c", 0.8); K.cyl(x, 0, z, 0.17, 0.3, 0.32, 9); K.cyl(x, 0.32, z, 0.3, 0.14, 0.34, 9); K.cyl(x, 0.66, z, 0.12, 0.16, 0.14, 9); }
        else if (!col) { E.flat("#c9a45a", 0.35, 0.8); K.rock(x, 0.02, z, rr(r, 0.35, 0.6), rr(r, 0.12, 0.22), rr(r, 0.35, 0.6), 8, 4, 0.12); }
      }
    }
  },
  chamber(E, R, r) {
    const { K } = E; const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
    if (E.F.has("rocks")) return;
    E.paint("trim"); K.bbox(cx - 0.9, 0, cz - 0.9, cx + 0.9, 0.9, cz + 0.9, 0.05); K.bbox(cx - 1.05, 0.9, cz - 1.05, cx + 1.05, 1.05, cz + 1.05);
    E.paint("wall"); K.rock(cx, 1.6, cz, 0.45, 0.6, 0.4, 8, 6, 0.25);
  },
  cavern(E, R, r) {
    const { K, col } = E; E.paint("wall");
    const { x0, x1, z0, z1 } = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let i = 0; i < 7; i++) {   // boulders and stalagmites, kept off the cross-paths between doors
      const x = rr(r, x0 + 2, x1 - 2), z = rr(r, z0 + 2, z1 - 2);
      if (Math.abs(x - cx) < 2.2 || Math.abs(z - cz) < 2.2) continue;
      if (r() < 0.5) K.rock(x, 0.3, z, rr(r, 0.8, 1.6), rr(r, 0.6, 1.3), rr(r, 0.8, 1.6), 8, 5, 0.22);
      else if (!col || true) { const hgt = rr(r, 1.2, 3.2); K.cyl(x, 0, z, rr(r, 0.35, 0.6), 0.04, hgt, 7); }
    }
  },
  hall(E, R, r) {
    if (E.F.has("sarcophagi") && !E.F.has("columns")) { const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2, along = (R.z1 - R.z0) >= (R.x1 - R.x0); sarcophagus(E, cx, cz, along ? 0 : 90, r); }
  },
  flooded(E, R, r) {
    if (E.col) return; const { K } = E; E.paint("wall");
    for (let i = 0; i < 4; i++) K.rock(rr(r, R.x0 + 2.4, R.x1 - 2.4), -0.6, rr(r, R.z0 + 2.4, R.z1 - 2.4), rr(r, 0.3, 0.7), rr(r, 0.3, 0.6), rr(r, 0.3, 0.7), 7, 4, 0.25);
  },
};

// knee-deep water: a ledge round the walls at floor level, a step, a sunken basin
// a sea cave's tide pool: the floor opens west of the walk line onto teal water over shingle; a tide line darkens the doorless walls,
// and the sea's leavings sit on the shore: barrels, a rope coil, an upturned rowboat in the big rooms
function seaPool(E, R, r) {
  const { K, col, ctx, lod } = E, { x0, x1, z0, z1 } = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const px0 = x0 + 0.6, px1 = cx - 3.6, pz0 = z0 + 2, pz1 = z1 - 2;   // the walk line and the record's props (x ±3) stay on dry shingle
  K.box(x0 - 0.3, -1.2, z0 - 0.3, px0, 0, z1 + 0.3); K.box(px1, -1.2, z0 - 0.3, x1 + 0.3, 0, z1 + 0.3);
  K.box(px0, -1.2, z0 - 0.3, px1, 0, pz0); K.box(px0, -1.2, pz1, px1, 0, z1 + 0.3);
  K.box(px0, -1.2, pz0, px1, -0.7, pz1);   // the pool bed, shingle, half a metre down
  if (col) return;
  E.paint("trim");   // wet black rock lips the pool
  for (let i = 0; i < (lod <= 2 ? 10 : 4); i++) { const t = r(); const onX = i % 2; K.rock(onX ? px1 + rr(r, -0.2, 0.15) : rr(r, px0, px1), -0.1, onX ? pz0 + t * (pz1 - pz0) : (i % 4 < 2 ? pz0 : pz1) + rr(r, -0.15, 0.15), rr(r, 0.25, 0.55), rr(r, 0.15, 0.3), rr(r, 0.25, 0.5), 6, 4, 0.3); }
  ctx.albedo(null); ctx.color("#2c6a6c", 0.86); ctx.roughness(0.03); ctx.metalness(0.3); ctx.emissive(0.02, 0.085, 0.09);   // sea water lit from below
  K.quad([px0, -0.22, pz0], [px1, -0.22, pz0], [px1, -0.22, pz1], [px0, -0.22, pz1], [(px0 + px1) / 2, -1.2, (pz0 + pz1) / 2]);
  E.flat("oklch(0.24 0.03 210)", 0.12);   // the tide line: the rock wet and dark to knee height on the walls the sea reaches
  for (const side of ["w", "e"]) if (!doorsOn(R, side).length) side === "w" ? K.box(x0 - 0.02, 0, z0, x0 + 0.015, rr(r, 0.6, 0.85), z1) : K.box(x1 - 0.015, 0, z0, x1 + 0.02, rr(r, 0.5, 0.75), z1);
  const sx = cx + 3.2;   // the dry shore east of the walk line
  for (let i = 0; i < 2 + (r() < 0.5 ? 1 : 0); i++) {   // salt-bleached barrels, iron-hooped
    const bx = sx + rr(r, 0.5, 3), bz = z0 + 1.5 + i * 0.9 + rr(r, 0, 0.3), tip = i === 2;
    K.at(() => { E.paint("oak"); K.cyl(0, 0, 0, 0.3, 0.36, 0.42, 10); K.cyl(0, 0.42, 0, 0.36, 0.3, 0.42, 10);
      E.flat("oklch(0.27 0.015 60)", 0.6, 0.6); for (const y of [0.1, 0.72]) K.cyl(0, y, 0, 0.345, 0.345, 0.05, 10); }, bx, tip ? 0.32 : 0, bz, rr(r, 0, 360), tip ? 90 : 0, 0);
  }
  E.flat("oklch(0.55 0.04 80)", 0.95);   // a coil of hemp rope
  const rx = sx + rr(r, 0.4, 2), rz = z1 - 1.6;
  for (let k = 0; k < 3; k++) { const R0 = 0.32 - k * 0.07, n = 10; for (let i = 0; i < n; i++) { const a = i / n * 6.283, b = (i + 1) / n * 6.283; K.seg([rx + Math.cos(a) * R0, 0.04 + k * 0.05, rz + Math.sin(a) * R0], [rx + Math.cos(b) * R0, 0.04 + k * 0.05, rz + Math.sin(b) * R0], 0.035, 0.035, 5); } }
  if ((R.kind === "cavern" || R.kind === "chamber") && lod <= 3) {   // an upturned rowboat hauled up on the shore, keel to the roof
    const L = 3.4, HW = 0.62, HH = 0.5, N = 10, M = 7;
    K.at(() => {
      E.paint("oak");
      const P = (i, k) => { const t = i / N, wv = Math.pow(Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, t))), 0.55), a = Math.PI * k / M; return [Math.cos(a) * HW * wv, 0.08 + Math.sin(a) * HH * (0.45 + 0.55 * wv), (t - 0.5) * L]; };
      for (let i = 0; i < N; i++) for (let k = 0; k < M; k++) K.quad(P(i, k), P(i + 1, k), P(i + 1, k + 1), P(i, k + 1), [0, -2, (i / N - 0.5) * L]);
      E.flat("oklch(0.3 0.03 50)", 0.8); K.bbox(-0.05, 0.56, -L / 2 + 0.25, 0.05, 0.64, L / 2 - 0.25);   // the keel
    }, sx + 1.6, 0, cz + 1.2, rr(r, -20, 20), 0, rr(r, -6, 6));
  }
}
function basin(E, R) {
  const { K, ctx, col } = E, { x0, x1, z0, z1 } = R, L = 1.6, S = 0.45;
  K.box(x0, -1.0, z0, x1, 0, z0 + L); K.box(x0, -1.0, z1 - L, x1, 0, z1);
  K.box(x0, -1.0, z0 + L, x0 + L, 0, z1 - L); K.box(x1 - L, -1.0, z0 + L, x1, 0, z1 - L);
  E.paint("trim");
  K.box(x0 + L, -1.0, z0 + L, x1 - L, -0.3, z0 + L + S); K.box(x0 + L, -1.0, z1 - L - S, x1 - L, -0.3, z1 - L);
  K.box(x0 + L, -1.0, z0 + L + S, x0 + L + S, -0.3, z1 - L - S); K.box(x1 - L - S, -1.0, z0 + L + S, x1 - L, -0.3, z1 - L - S);
  E.paint("floor"); K.box(x0 + L, -1.2, z0 + L, x1 - L, -0.6, z1 - L);
  if (!col) water(E, x0 + L, z0 + L, x1 - L, z1 - L, -0.14);
}
function channel(E, R) {   // the shared channel (scripts/lib/channel.js): a 1.4 m drain down the room's long axis, murky water in it
  const { K, col } = E, { x0, x1, z0, z1 } = R, along = (z1 - z0) >= (x1 - x0), c = along ? (x0 + x1) / 2 : (z0 + z1) / 2;
  channelFloor((...p) => K.box(...p), { along, x0, x1, z0, z1, c, w: 1.4, top: 0, slab: 0.4, bedTop: -0.32, bedBot: -0.6, paintBed: () => E.paint("trim") });
  if (!col) along ? water(E, c - 0.7, z0, c + 0.7, z1, -0.1) : water(E, x0, c - 0.7, x1, c + 0.7, -0.1);
}
function water(E, x0, z0, x1, z1, y) {
  const { ctx, K } = E;
  ctx.albedo(null); ctx.color("#3a4a38", 0.9); ctx.roughness(0.02); ctx.metalness(0.35); ctx.emissive(0.03, 0.055, 0.04);   // critic r2: the near-black strip read as no water; a murky green with a hard sheen catches the torches
  K.quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [(x0 + x1) / 2, y - 1, (z0 + z1) / 2]);
  ctx.emissive(null);
}
// the bridge room: no floor but stone spans from each door to the middle, railed, over a ten-metre drop
function pit(E, R, r) {
  const { K, col, ctx } = E, { x0, x1, z0, z1 } = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = 1.6;
  const strips = [];
  for (const dr of R.doors ?? []) {
    if (dr.side === "n") strips.push([cx - hw, z0, cx + hw, cz + hw, "z", "n"]);
    if (dr.side === "s") strips.push([cx - hw, cz - hw, cx + hw, z1, "z", "s"]);
    if (dr.side === "w") strips.push([x0, cz - hw, cx + hw, cz + hw, "x", "w"]);
    if (dr.side === "e") strips.push([cx - hw, cz - hw, x1, cz + hw, "x", "e"]);
  }
  E.paint(E.oakTrim ? "oak" : "trim");
  for (const [a, b, c, d] of strips) K.bbox(a, -0.55, b, c, 0, d, 0.06);
  E.paint("wall"); K.box(cx - 1.3, -10.4, cz - 1.3, cx + 1.3, -0.55, cz + 1.3);
  for (const [a, b, c, d, ax] of strips) {   // corbels under each span where it meets the wall
    if (ax === "z") { const zz = b <= z0 + 0.01 ? b : d - 1.2; K.box(a + 0.2, -2.5, zz, c - 0.2, -0.55, zz + 1.2); }
    else { const xx = a <= x0 + 0.01 ? a : c - 1.2; K.box(xx, -2.5, b + 0.2, xx + 1.2, -0.55, d - 0.2); }
  }
  // rails: posts and a top rail along both edges of each span, open at the middle crossing
  E.paint(E.oakTrim ? "oak" : "trim");
  const ST = R.pitDepth ? pitStair(E, R) : null;   // organic pits: a timber stair climbs from the floor to the span on the first door's side
  for (const [a, b, c, d, ax, sd] of strips) for (const sg of [-1, 1]) {
    const segs = ax === "z" ? [[b, cz - hw], [cz + hw, d]] : [[a, cx - hw], [cx + hw, c]];
    for (const [s0, s1] of segs) {
      if (s1 - s0 < 0.6) continue;
      const gap = ST && sd === ST.side ? ST.bw + 0.3 : 0, atWall0 = sd === "n" || sd === "w", e0 = s0 + 0.3 + (atWall0 && s0 <= (ax === "z" ? z0 : x0) + 0.01 ? gap : 0), e1 = s1 - 0.3 - (!atWall0 && s1 >= (ax === "z" ? z1 : x1) - 0.01 ? gap : 0);
      if (e1 - e0 < 0.3) continue;
      const n = Math.max(1, Math.round((e1 - e0) / 1.8));
      for (let i = 0; i <= n; i++) { const s = e0 + (e1 - e0) * i / n; if (ax === "z") K.bbox(cx + sg * (hw - 0.14) - 0.12, 0, s - 0.12, cx + sg * (hw - 0.14) + 0.12, 1.05, s + 0.12, 0.03); else K.bbox(s - 0.12, 0, cz + sg * (hw - 0.14) - 0.12, s + 0.12, 1.05, cz + sg * (hw - 0.14) + 0.12, 0.03); }
      if (ax === "z") K.box(cx + sg * (hw - 0.14) - 0.09, 0.95, e0, cx + sg * (hw - 0.14) + 0.09, 1.12, e1); else K.box(e0, 0.95, cz + sg * (hw - 0.14) - 0.09, e1, 1.12, cz + sg * (hw - 0.14) + 0.09);
    }
  }
  const PD = R.pitDepth ?? 10.4;
  if (R.pitDepth) { E.paint("floor"); K.box(x0, -PD - 0.4, z0, x1, -PD, z1); }   // organic pits: a floor you land on (and a stair back up)
  if (col) return;   // a legacy pit floor is seen, never stood on: the place's bottom bound sends a faller home
  if (!R.pitDepth) { E.paint("floor"); K.box(x0, -10.8, z0, x1, -10.4, z1); }
  E.paint("wall"); for (let i = 0; i < 10; i++) K.rock(rr(r, x0 + 1, x1 - 1), -PD, rr(r, z0 + 1, z1 - 1), rr(r, 0.5, 1.3), rr(r, 0.4, 0.9), rr(r, 0.5, 1.3), 7, 4, 0.25);
  if (E.lod <= 2) { E.flat("#2a2826", 0.6, 0.5); for (let i = 0; i < 14; i++) { const x = rr(r, x0 + 1, x1 - 1), z = rr(r, z0 + 1, z1 - 1); K.cyl(x, -PD, z, 0.06, 0.005, rr(r, 0.8, 1.6), 5); } for (let i = 0; i < 3; i++) K.at(() => K.skeleton(true), rr(r, x0 + 2, x1 - 2), -PD, rr(r, z0 + 2, z1 - 2), rr(r, 0, 360)); }
}

// the pit's way back up: an L of open timber stair (stringers + treads, a hidden smooth ramp under them for the body) hugging two walls,
// in a frame where the chosen door wall is local north: flight A climbs the west wall to a corner landing, flight B runs along the north wall to the span
function pitStair(E, R) {
  const { K, col } = E, side = (R.doors ?? []).find((d) => !d.exit)?.side ?? "n", yaw = { n: 0, w: 90, s: 180, e: 270 }[side];
  const w = R.x1 - R.x0, d = R.z1 - R.z0, ns = side === "n" || side === "s", hx = (ns ? w : d) / 2, hz = (ns ? d : w) / 2, hw = 1.6, bw = 1.4, PD = R.pitDepth, m = 1.2;
  const LA = 2 * hz - m - bw, LB = hx - hw - bw, L = LA + LB, yL = -PD + PD * LA / L;
  const cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  const flight = (ax, a0, a1, b0, b1, y0, y1) => {   // ax "z": runs along z from a0 (y0) to a1 (y1) over x band [b0,b1]; ax "x" likewise
    const P = (a, b, y) => ax === "z" ? [b, y, a] : [a, y, b];
    if (col) { const t = 0.3, Q = [P(a0, b0, y0 - t), P(a0, b1, y0 - t), P(a1, b1, y1 - t), P(a1, b0, y1 - t), P(a0, b0, y0), P(a0, b1, y0), P(a1, b1, y1), P(a1, b0, y1)], I = P((a0 + a1) / 2, (b0 + b1) / 2, (y0 + y1) / 2 - t / 2);
      const q = (i, j, k, l) => K.quad(Q[i], Q[j], Q[k], Q[l], I); q(4, 5, 6, 7); q(0, 1, 2, 3); q(0, 1, 5, 4); q(3, 2, 6, 7); q(0, 3, 7, 4); q(1, 2, 6, 5); return; }
    const n = Math.max(2, Math.ceil(Math.abs(y1 - y0) / 0.24)), da = (a1 - a0) / n, dy = (y1 - y0) / n;
    E.paint("oak");
    for (let i = 0; i < n; i++) { const a = a0 + da * (i + 0.5), y = y0 + dy * (i + 1); const p = P(a, 0, 0); ax === "z" ? K.bbox(b0 + 0.12, y - 0.07, a - Math.abs(da) / 2 - 0.02, b1 - 0.12, y, a + Math.abs(da) / 2 + 0.02, 0.015) : K.bbox(a - Math.abs(da) / 2 - 0.02, y - 0.07, b0 + 0.12, a + Math.abs(da) / 2 + 0.02, y, b1 - 0.12, 0.015); }
    E.paint("trim");
    for (const b of [b0 + 0.06, b1 - 0.06]) K.seg(P(a0, b, y0 - 0.15), P(a1, b, y1 - 0.15), 0.07, 0.07, 4);   // stringers: the ladder's rails
    const inner = b1 - 0.06, np = Math.max(1, Math.round(Math.abs(a1 - a0) / 2.2));
    for (let i = 0; i <= np; i++) { const a = a0 + (a1 - a0) * i / np, y = y0 + (y1 - y0) * i / np; K.seg(P(a, inner, -PD), P(a, inner, y - 0.15), 0.08, 0.08, 5); K.seg(P(a, inner, y), P(a, inner, y + 1.0), 0.05, 0.05, 4); }   // props under, rail posts above
    K.seg(P(a0, inner, y0 + 1.0), P(a1, inner, y1 + 1.0), 0.045, 0.045, 4);
  };
  K.at(() => {
    flight("z", hz - m, -hz + bw, -hx, -hx + bw, -PD, yL);
    flight("x", -hx + bw, -hw, -hz, -hz + bw, yL, 0);
    E.paint("oak"); K.bbox(-hx, yL - 0.18, -hz, -hx + bw, yL, -hz + bw, 0.03);
    if (!col) { E.paint("trim"); K.seg([-hx + bw - 0.06, -PD, -hz + bw - 0.06], [-hx + bw - 0.06, yL - 0.18, -hz + bw - 0.06], 0.1, 0.1, 5); }
  }, cx, 0, cz, yaw);
  return { side, bw };
}

// an organic corridor: a dogleg (stub, diagonal, stub) in plan whose floor climbs linearly across the gap between its rooms' floor heights;
// path.nodes ([u, l, wl, wr]…, from place-language lib/wander.mjs) makes it a wandering way: any number of nodes, each with its
// own wall half-width on either side (rough walls, alcoves). Without nodes the dogleg is drawn exactly as before.
function bentCorridor(E, c) {
  const { K, F, col, lod } = E, r = mk(c.seed ?? 3), P = c.path, alongZ = c.axis === "z", LAP = T + 0.25, hw = CW / 2;
  const ND = P.nodes ?? [[P.u0, P.la], [P.u0 + P.stub, P.la], [P.u1 - P.stub, P.lb], [P.u1, P.lb]], M = ND.length - 1;
  const U = ND.map((n) => n[0]), Lc = ND.map((n) => n[1]), WL = ND.map((n) => n[2] ?? hw), WR = ND.map((n) => n[3] ?? hw);
  U[0] -= LAP; U[M] += LAP;
  const yAt = (u) => P.ya + (P.yb - P.ya) * Math.min(1, Math.max(0, (u - P.u0) / (P.u1 - P.u0)));
  const W = (u, l, y) => alongZ ? [l, y, u] : [u, y, l];
  // mitred cross-sections: the lateral offset direction at each node is the bisector, stretched so the hall keeps its width
  const dirs = ND.slice(0, M).map((_, i) => { const du = U[i + 1] - U[i], dl = Lc[i + 1] - Lc[i], m = Math.hypot(du, dl); return [du / m, dl / m]; });
  const sec = U.map((u, i) => { const a = dirs[Math.max(0, i - 1)], b = dirs[Math.min(M - 1, i)], t = [a[0] + b[0], a[1] + b[1]], tm = Math.hypot(t[0], t[1]), tn = [t[0] / tm, t[1] / tm], n = [-tn[1], tn[0]], k = 1 / Math.max(0.5, n[0] * -a[1] + n[1] * a[0]); return { u, l: Lc[i], y: yAt(u), n: [n[0] * k, n[1] * k] }; });
  const pt = (S, o, dy) => W(S.u + S.n[0] * o, S.l + S.n[1] * o, S.y + dy);
  const band = (f0, f1, y0, y1) => { for (let i = 0; i < M; i++) { const A = sec[i], B = sec[i + 1], a0 = f0(i), a1 = f1(i), b0 = f0(i + 1), b1 = f1(i + 1), Q = [pt(A, a0, y0), pt(A, a1, y0), pt(B, b1, y0), pt(B, b0, y0), pt(A, a0, y1), pt(A, a1, y1), pt(B, b1, y1), pt(B, b0, y1)];
    const I = Q.reduce((s, q) => [s[0] + q[0] / 8, s[1] + q[1] / 8, s[2] + q[2] / 8], [0, 0, 0]), q = (a, b, cc, d) => K.quad(Q[a], Q[b], Q[cc], Q[d], I);
    q(4, 5, 6, 7); q(0, 1, 2, 3); q(0, 1, 5, 4); q(3, 2, 6, 7); q(0, 3, 7, 4); q(1, 2, 6, 5); } };
  const oL = (i) => -WL[i] - T, iL = (i) => -WL[i], iR = (i) => WR[i], oR = (i) => WR[i] + T;
  E.paint("floor"); band(oL, oR, -1.2, 0);
  E.paint("wall"); band(oL, iL, 0, DH + 0.4); band(iR, oR, 0, DH + 0.4);
  E.paint("ceil"); band(oL, oR, DH, DH + 0.4);
  // along the path: ribs every ~3 m (stone, or timber sets where the style props its halls), boulders against rocky walls, roots from the roof
  const segL = dirs.map((_, i) => Math.hypot(U[i + 1] - U[i], Lc[i + 1] - Lc[i])), total = segL.reduce((s, v) => s + v, 0);
  const at = (s) => { let i = 0; while (i < M - 1 && s > segL[i]) { s -= segL[i]; i++; } const t = s / segL[i], u = U[i] + (U[i + 1] - U[i]) * t, l = Lc[i] + (Lc[i + 1] - Lc[i]) * t; return { u, l, y: yAt(u), d: dirs[i], wl: WL[i] + (WL[i + 1] - WL[i]) * t, wr: WR[i] + (WR[i + 1] - WR[i]) * t }; };
  const rocky = F.has("rocks");
  const rib = (q, wd, inset, th, h) => { const nl = [-q.d[1], q.d[0]], f = (o, s, y) => W(q.u + nl[0] * o + q.d[0] * s, q.l + nl[1] * o + q.d[1] * s, q.y + y);
    const box = (o0, o1, y0, y1) => { const Q = [f(o0, -wd, y0), f(o1, -wd, y0), f(o1, wd, y0), f(o0, wd, y0), f(o0, -wd, y1), f(o1, -wd, y1), f(o1, wd, y1), f(o0, wd, y1)], I = f((o0 + o1) / 2, 0, (y0 + y1) / 2), qq = (a, b, cc, d) => K.quad(Q[a], Q[b], Q[cc], Q[d], I); qq(4, 5, 6, 7); qq(0, 1, 2, 3); qq(0, 1, 5, 4); qq(3, 2, 6, 7); qq(0, 3, 7, 4); qq(1, 2, 6, 5); };
    box(-hw, -hw + inset, -0.1, h); box(hw - inset, hw, -0.1, h); box(-hw, hw, h - th, h); };
  const n = Math.max(1, Math.round(total / 3));
  if (!col || F.has("props") || !rocky) for (let i = 1; i < n; i++) { const q = at(LAP + (total - 2 * LAP) * i / n);
    if (F.has("props")) { E.paint("oak"); rib(q, 0.16, 0.32, 0.4, DH); }
    else if (!rocky) { E.paint("trim"); rib(q, 0.3, 0.22, 0.45, DH); } }
  if (rocky) { E.paint("wall");
    for (let s = LAP + 0.8; s < total - LAP - 0.8; s += rr(r, 1.3, 1.9)) for (const sg of [-1, 1]) { if (F.has("props")) { const k = (s - LAP) / ((total - 2 * LAP) / n); if (Math.abs(k - Math.round(k)) * (total - 2 * LAP) / n < 0.9) continue; } const q = at(s), ro = rr(r, 0.5, 0.8), off = (sg < 0 ? q.wl : q.wr) + ro - rr(r, 0.25, 0.45), nl = [-q.d[1], q.d[0]];
      K.rock(...W(q.u + nl[0] * off * sg, q.l + nl[1] * off * sg, q.y + rr(r, 0.3, 3)), rr(r, 0.6, 0.9), rr(r, 0.6, 1.0), rr(r, 0.6, 0.9), 7, 5, 0.2); } }
  if (F.has("roots") && !col && lod <= 2) { E.flat("#3a2a1c", 1); for (let i = 0; i < Math.round(total / 2.5); i++) { const q = at(rr(r, LAP, total - LAP)), nl = [-q.d[1], q.d[0]], o = rr(r, -hw + 0.3, hw - 0.3); K.root(...W(q.u + nl[0] * o, q.l + nl[1] * o, q.y + DH), rr(r, 0.4, 1.3)); } }
}

function corridor(E, c) {
  const { K, F, col, lod } = E, r = mk(c.seed ?? 3);
  // the hall runs through both doorways and laps into each room's floor: no seam at a threshold, ever
  const alongZ = c.axis === "z", LAP = T + 0.25, x0 = alongZ ? c.x0 : c.x0 - LAP, x1 = alongZ ? c.x1 : c.x1 + LAP, z0 = alongZ ? c.z0 - LAP : c.z0, z1 = alongZ ? c.z1 + LAP : c.z1;
  const L = alongZ ? z1 - z0 : x1 - x0;
  E.paint("floor");
  if (F.has("channel")) {
    const m = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2, k = 0.55;
    channelFloor((...p) => K.box(...p), { along: alongZ, x0, x1, z0, z1, c: m, w: 2 * k, top: 0, slab: 0.4, bedTop: -0.3, bedBot: -0.6, paintBed: () => E.paint("trim") });   // the shared channel
    if (!col) alongZ ? water(E, m - k, z0, m + k, z1, -0.1) : water(E, x0, m - k, x1, m + k, -0.1);
  } else K.box(x0 - T, -1.2, z0, x1 + T, 0, z1);
  E.paint("wall");
  if (alongZ) { K.box(x0 - T, 0, z0, x0, DH + 0.4, z1); K.box(x1, 0, z0, x1 + T, DH + 0.4, z1); }
  else { K.box(x0, 0, z0 - T, x1, DH + 0.4, z0); K.box(x0, 0, z1, x1, DH + 0.4, z1 + T); }
  E.paint("ceil"); alongZ ? K.box(x0 - T, DH, z0, x1 + T, DH + 0.4, z1) : K.box(x0, DH, z0 - T, x1, DH + 0.4, z1 + T);
  const rocky = F.has("rocks");
  // ribs: timber sets in a mine, stone ribs elsewhere, every 3 m
  const n = Math.max(1, Math.round(L / 3)), step = L / n;
  for (let i = 1; i < n; i++) {
    const s = (alongZ ? z0 : x0) + i * step;
    if (F.has("props")) {
      E.paint("oak");
      if (alongZ) { K.box(x0, 0, s - 0.16, x0 + 0.32, DH - 0.4, s + 0.16); K.box(x1 - 0.32, 0, s - 0.16, x1, DH - 0.4, s + 0.16); K.box(x0, DH - 0.4, s - 0.18, x1, DH, s + 0.18); }
      else { K.box(s - 0.16, 0, z0, s + 0.16, DH - 0.4, z0 + 0.32); K.box(s - 0.16, 0, z1 - 0.32, s + 0.16, DH - 0.4, z1); K.box(s - 0.18, DH - 0.4, z0, s + 0.18, DH, z1); }
    } else if (!rocky) {
      E.paint("trim");
      if (alongZ) { K.bbox(x0, 0, s - 0.3, x0 + 0.22, DH, s + 0.3); K.bbox(x1 - 0.22, 0, s - 0.3, x1, DH, s + 0.3); K.bbox(x0, DH - 0.45, s - 0.3, x1, DH, s + 0.3); }
      else { K.bbox(s - 0.3, 0, z0, s + 0.3, DH, z0 + 0.22); K.bbox(s - 0.3, 0, z1 - 0.22, s + 0.3, DH, z1); K.bbox(s - 0.3, DH - 0.45, z0, s + 0.3, DH, z1); }
    }
  }
  if (F.has("rails")) track(E, alongZ, alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2, alongZ ? z0 : x0, alongZ ? z1 : x1);
  if (rocky) {
    E.paint("wall");
    for (let s = 0.8; s < L - 0.8; s += rr(r, 1.3, 1.9)) for (const sg of [0, 1]) {
      const q = (alongZ ? z0 : x0) + s, ro = rr(r, 0.5, 0.8), off = rr(r, -0.35, -0.1);   // critic r5: rocks sunk to a hand's depth left a square tube; now each bulges 0.2-0.7 m out of the wall
      if (alongZ) K.rock(sg ? x1 - off : x0 + off, rr(r, 0.3, 3), q, ro, rr(r, 0.6, 1.0), rr(r, 0.6, 0.9), 7, 5, 0.2);
      else K.rock(q, rr(r, 0.3, 3), sg ? z1 - off : z0 + off, rr(r, 0.6, 0.9), rr(r, 0.6, 1.0), ro, 7, 5, 0.2);
    }
    if (!col && lod <= 3) for (let s = 1.2; s < L - 1.2; s += rr(r, 1.6, 2.4)) { const q = (alongZ ? z0 : x0) + s, o = rr(r, 0.25, 0.75);   // the roof hangs low in rock lumps
      alongZ ? K.rock(rr(r, x0 + o, x1 - o), DH - rr(r, 0, 0.15), q, rr(r, 0.6, 1.0), rr(r, 0.35, 0.6), rr(r, 0.6, 1.0), 7, 5, 0.22) : K.rock(q, DH - rr(r, 0, 0.15), rr(r, z0 + o, z1 - o), rr(r, 0.6, 1.0), rr(r, 0.35, 0.6), rr(r, 0.6, 1.0), 7, 5, 0.22); }
  }
  if (F.has("roots") && !col && lod <= 2) { E.flat("#3a2a1c", 1); for (let i = 0; i < Math.round(L / 2.5); i++) K.root(rr(r, x0 + 0.3, x1 - 0.3), DH, rr(r, z0 + 0.3, z1 - 0.3), rr(r, 0.4, 1.3)); }
}

// lights' bodies: an iron sconce on a wall, a stone fire ring on the floor, a brazier on legs
function fixture(E, t) {
  const { K, col } = E;
  if (t.type === "glow" || t.type === "sky") return;
  E.flat("#2a2826", 0.55, 0.65);
  if (t.type === "torch") {
    const wx = t.x - t.nx * 0.32, wz = t.z - t.nz * 0.32;
    K.bbox(wx - 0.09 - Math.abs(t.nz) * 0.05, t.y - 0.6, wz - 0.09 - Math.abs(t.nx) * 0.05, wx + 0.09 + Math.abs(t.nz) * 0.05, t.y - 0.15, wz + 0.09 + Math.abs(t.nx) * 0.05, 0.02);
    if (col) return;
    K.seg([wx, t.y - 0.45, wz], [t.x, t.y - 0.18, t.z], 0.025, 0.025, 5);
    K.cyl(t.x, t.y - 0.24, t.z, 0.05, 0.12, 0.2, 8);
    E.flat("#3a2a1c", 1); K.cyl(t.x, t.y - 0.18, t.z, 0.04, 0.05, 0.16, 6);
  } else if (t.type === "pit") {
    E.paint("wall");
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283; K.rock(t.x + Math.cos(a) * 0.55, 0.05, t.z + Math.sin(a) * 0.55, 0.17, 0.13, 0.17, 6, 4, 0.2); }
    if (col) return;
    E.flat("#1a1410", 1); for (let i = 0; i < 3; i++) { const a = i * 2.1; K.seg([t.x + Math.cos(a) * 0.45, 0.05, t.z + Math.sin(a) * 0.45], [t.x - Math.cos(a) * 0.1, 0.22, t.z - Math.sin(a) * 0.1], 0.06, 0.05, 6); }
  } else if (t.type === "brazier") {
    for (let i = 0; i < 3; i++) { const a = i * 2.094; K.seg([t.x + Math.cos(a) * 0.38, 0, t.z + Math.sin(a) * 0.38], [t.x + Math.cos(a) * 0.2, 0.85, t.z + Math.sin(a) * 0.2], 0.035, 0.03, 5); }
    K.cyl(t.x, t.y - 0.45, t.z, 0.2, 0.46, 0.3, 10); if (!col) { E.flat("#1a0f0a", 1); K.cyl(t.x, t.y - 0.16, t.z, 0.4, 0.4, 0.02, 10); }
  }
}

// the overworld mouth: a stone door set into an earthen mound, front facing local -Z, feet on the ground
function mouth(E, p) {
  const { K, col, ctx } = E, r = mk(p.seed ?? 11);
  if (col) {   // the shell a walker meets: the mound behind, the wings, the frame, the steps
    K.box(-5.2, -2, 0.9, 5.2, 4.2, 9); K.box(-4.6, -1, -0.2, -2.0, 2.6, 0.9); K.box(2.0, -1, -0.2, 4.6, 2.6, 0.9);
    K.box(-2.0, 0, -0.4, -1.4, 4.0, 0.9); K.box(1.4, 0, -0.4, 2.0, 4.0, 0.9); K.box(-2.4, 4.0, -0.5, 2.4, 4.8, 0.9);
    K.box(-2.4, -1.5, -2.2, 2.4, 0.15, -0.6); K.box(-2.2, -1.5, -0.6, 2.2, 0.3, 0.9); K.box(-1.4, 0.3, 1.5, 1.4, 4, 1.8);
    return;
  }
  E.paint(p.style === "cave" || p.style === "mine" ? "wall" : "ceil");
  K.rock(0, -0.5, 5, 6.2, 4.6, 5.4, 12, 8, 0.12);
  E.paint("wall");
  for (let i = 0; i < 8; i++) { const a = rr(r, -0.3, 3.44); K.rock(Math.cos(a) * rr(r, 4.5, 6.5), rr(r, -0.3, 0.6), 4 - Math.sin(a) * rr(r, 3.5, 5.5) + 1, rr(r, 0.5, 1.2), rr(r, 0.4, 0.9), rr(r, 0.5, 1.1), 7, 5, 0.25); }
  K.bbox(-4.6, -1, -0.2, -2.0, 2.6, 0.9, 0.06); K.bbox(2.0, -1, -0.2, 4.6, 2.6, 0.9, 0.06);
  E.paint(p.style === "mine" ? "oak" : "trim");
  K.bbox(-2.0, 0.3, -0.4, -1.4, 4.0, 0.9, 0.05); K.bbox(1.4, 0.3, -0.4, 2.0, 4.0, 0.9, 0.05); K.bbox(-2.4, 4.0, -0.5, 2.4, 4.8, 0.9, 0.06);
  K.bbox(-1.0, 4.8, -0.35, 1.0, 5.3, 0.6, 0.05);
  E.paint("floor"); K.bbox(-2.4, -1.5, -2.2, 2.4, 0.15, -0.6, 0.04); K.bbox(-2.2, -1.5, -0.6, 2.2, 0.3, 0.9, 0.04);
  E.paint("wall"); K.box(-1.4, 0.3, 0.9, -1.2, 4, 1.8); K.box(1.2, 0.3, 0.9, 1.4, 4, 1.8); K.box(-1.4, 3.8, 0.9, 1.4, 4.0, 1.8);
  E.flat("#070605", 1); K.box(-1.4, 0.3, 1.5, 1.4, 4, 1.8);
  for (const t of p.torches ?? []) fixture(E, t);
}
