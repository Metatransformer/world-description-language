// Dungeon Design Language (DDL): a dungeon is a JS program of layers (creator Nov 6: "a DSL in a programming language
// where i can program a place ... some procedural placements, then some hand movements forming another layer, then
// maybe procedural on top of it").
//
//   export default dungeon("greywood-den", { name, style, tier, grid }, (d) => {
//     d.layer("shape", () => { room("mouth", { rect: [x, z, w, d], floor: 0 }); link("mouth", "run", { side: "n", at: 0 }); });
//     d.layer("scatter", () => scatter("bones", { in: "hall", count: 4, along: "walls", seed: 3 }));
//     d.layer("hand", () => { place("boulder", { in: "lip", at: [-3, -40] }); move("hall/bones#2", [-4, -31]); remove("run/fleece#0"); });
//   });
//
// Layers run in order. Every call writes into one model; a later layer sees what earlier ones made, so a hand layer can
// move or remove a scattered thing by its id ("room/kind#n"), and a procedural layer after it keeps clear of every hand
// placement. Units: grid cells (grid metres, default 2) for rect/at, metres for floor/height/y. North is -z.
// compile(program) → the plan object; tools/compile.mjs builds it into a place (lib/scene.mjs, or your own writer).

import { solve as solveRel, placeNext } from "./relate.mjs";
let CUR = null;                      // the dungeon being written; the verbs below write into it
const need = () => { if (!CUR) throw new Error("ddl: verbs run inside dungeon(...)"); return CUR; };
const R = (id) => { const r = need().rooms.get(id); if (!r) throw new Error(`ddl: no room "${id}" (layer ${CUR.layer})`); return r; };
const rng = (seed) => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

export function dungeon(id, opts, body) { return { id, opts, body, ddl: 1 }; }


// ---- locations: where things go, as values you compose (creator Nov 6: "coordinates should be semantic ... location data
// structures"). A Loc is resolved against the model when a verb uses it, so it can name rooms, doors and earlier placements.
//
//   the("run")                       a room handle (lazy: name a room before or after it is declared)
//   .center  .at(u, v)               the middle; or a fraction across it (u 0 west → 1 east, v 0 north → 1 south)
//   .wall("w", t?, off?)             against a wall; t along it ("start" | "quarter" | "middle" | "three-quarters" | "end" | 0..1), off cells in
//   .corner("nw", off?)              tucked in a corner
//   .door("hall", inset?)            just inside the doorway that leads to the hall
//   .walls / .floor                  regions for scatter, along(), ring(), grid()
//   near("camp/firering#0")          where an earlier placement stands
//   between(a, b, t?)                part way from one Loc to another
//   loc.by(dx, dz)                   nudged, in cells; loc.toward(other, cells) stepped toward another Loc
//   loc.side(dir, cells)             a step in a compass direction ("n" | "s" | "e" | "w" | "ne" …)
//   along(region, { every | count }) a row of Locs; ring(loc, r, n) a circle; grid(loc, cols, rows, gap) a block
// Every verb's at: takes a Loc, a [x, z] pair (cells), or a list of Locs (one placement each). in: defaults to the Loc's room.
const T = { start: 0.15, quarter: 0.25, middle: 0.5, "three-quarters": 0.75, end: 0.85 };
const tOf = (t) => typeof t === "string" ? (T[t] ?? 0.5) : (t ?? 0.5);
const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [0.7071, -0.7071], nw: [-0.7071, -0.7071], se: [0.7071, 0.7071], sw: [-0.7071, 0.7071] };
export class Loc {
  constructor(room, f, label) { this.room = room; this.f = f; this.label = label; }
  xy() { const v = this.f(); return [round(v[0]), round(v[1])]; }
  by(dx, dz = 0) { return new Loc(this.room, () => { const [x, z] = this.f(); return [x + dx, z + dz]; }, `${this.label}.by(${dx}, ${dz})`); }
  side(dir, n = 1) { const [a, b] = DIRS[dir]; return this.by(a * n, b * n); }
  toward(o, n = 1) { return new Loc(this.room, () => { const [x, z] = this.f(), [x2, z2] = at(o), L = Math.hypot(x2 - x, z2 - z) || 1; return [x + (x2 - x) / L * n, z + (z2 - z) / L * n]; }, `${this.label}.toward(…)`); }
}
const at = (v) => v instanceof Loc ? v.xy() : Array.isArray(v) && typeof v[0] === "number" ? v : null;
const rectOf = (id) => R(id).rect;
const handles = new Map();
export function the(id) {
  if (handles.has(id)) return handles.get(id);
  const q = () => rectOf(id), L = (f, label) => new Loc(id, f, `the("${id}")${label}`);
  const h = {
    id,
    get center() { return L(() => { const r = q(); return [r.x + r.w / 2, r.z + r.d / 2]; }, ".center"); },
    at(u, v) { return L(() => { const r = q(); return [r.x + u * r.w, r.z + v * r.d]; }, `.at(${u}, ${v})`); },
    wall(side, t, off = 0.6) { const tt = tOf(t); return L(() => { const r = q();
      return side === "n" ? [r.x + tt * r.w, r.z + off] : side === "s" ? [r.x + tt * r.w, r.z + r.d - off] : side === "w" ? [r.x + off, r.z + tt * r.d] : [r.x + r.w - off, r.z + tt * r.d]; }, `.wall("${side}")`); },
    corner(c, off = 0.8) { return L(() => { const r = q(); return [c.includes("w") ? r.x + off : r.x + r.w - off, c.includes("n") ? r.z + off : r.z + r.d - off]; }, `.corner("${c}")`); },
    door(to, inset = 1) { return L(() => { const dd = doorOf(need(), id, to); if (!dd) throw new Error(`ddl: no door from "${id}" to "${to}"`); const [a, b] = DIRS[{ n: "s", s: "n", e: "w", w: "e" }[dd.side]]; return [dd.x + a * inset, dd.z + b * inset]; }, `.door("${to}")`); },
    get walls() { return { room: id, along: "walls" }; },
    get floor() { return { room: id, along: "floor" }; },
  };
  handles.set(id, h); return h;
}
export function near(pid) { return new Loc(pid.split("/")[0], () => find(pid)[1].at, `near("${pid}")`); }
export function between(a, b, t = 0.5) { return new Loc(a.room ?? b.room, () => { const p = at(a), q = at(b); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }, "between(…)"); }
export function ring(c, r, n, phase = 0) { return Array.from({ length: n }, (_, i) => { const a = phase + (i / n) * Math.PI * 2; return c.by(Math.cos(a) * r, Math.sin(a) * r); }); }
export function grid(c, cols, rows, gap = 1) { const out = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) out.push(c.by((i - (cols - 1) / 2) * gap, (j - (rows - 1) / 2) * gap)); return out; }
export function along(region, o = {}) {   // evenly down the walls (or across the floor) of a room: count or every (cells)
  const id = region.room, q = rectOf(id), m = o.off ?? 0.6;
  if (region.along === "floor") { const n = o.count ?? 3; return Array.from({ length: n }, (_, i) => the(id).at(0.5, (i + 1) / (n + 1))); }
  const sides = o.sides ?? ["n", "e", "s", "w"], out = [];
  for (const sd of sides) { const len = sd === "n" || sd === "s" ? q.w : q.d, n = o.count ? Math.round(o.count / sides.length) : Math.max(1, Math.floor(len / (o.every ?? 3)));
    for (let i = 0; i < n; i++) out.push(the(id).wall(sd, (i + 1) / (n + 1), m)); }
  return out;
}
// a placement option's Locs resolved to cells, deep (dais.at, phase2 adds, …)
const resolve = (v) => v instanceof Loc ? v.xy() : Array.isArray(v) ? v.map(resolve) : v && typeof v === "object" && !(v.room && v.along) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)])) : v;
// a room's door on the side that leads to `to`: { side, x, z } in cells
function doorOf(d, id, to) {
  const q = rectOf(id);
  for (const l of d.links) { let side, a;
    if (l.a === id && l.b === to) { side = l.side; a = l.at; } else if (l.b === id && l.a === to) { side = { n: "s", s: "n", e: "w", w: "e" }[l.side]; a = l.bat ?? l.at; } else continue;
    return { side, x: side === "w" ? q.x : side === "e" ? q.x + q.w : a, z: side === "n" ? q.z : side === "s" ? q.z + q.d : a }; }
  if (to === "exit" && d.exit?.room === id) return { side: "s", x: d.exit.at?.[0] ?? 0, z: q.z + q.d };
  return null;
}

// ---- shape -------------------------------------------------------------------------------------------------------
export function level(n, name, floor, note) { need().levels.push({ n, name, floor, note }); }
export function room(id, o) {
  const d = need(); if (d.rooms.has(id)) throw new Error(`ddl: room "${id}" twice`);
  if (o.below || o.above) o = vertical(o);
  if (o.anchor && o.rect) {   // a child of an anchored Flex/Grid: its rect is local to the group; the group's origin is solved once
    const A = o.anchor; d.anchors ??= new Map();
    if (!d.anchors.has(A.key)) { const other = R(A.ref), lv = A.level ?? other.level ?? 1, at = (q) => ({ rect: [q.rect.x, q.rect.z, q.rect.w, q.rect.d], level: q.level ?? 1 });
      const laid = [...d.rooms.values()].map(at).filter((q) => q.level === lv);
      const g = placeNext({ ...at(other), level: lv }, A.size, A.rel, { gap: A.gap, align: A.align, shift: A.shift }, laid).rect;
      d.anchors.set(A.key, [g[0], g[1]]); }
    const [gx, gz] = d.anchors.get(A.key), [x, z, w, dd] = o.rect; o = { ...o, rect: [x + gx, z + gz, w, dd] }; delete o.anchor; }
  const rel = ["northOf", "southOf", "eastOf", "westOf", "beside"].find((k) => o[k]);
  if (rel && !o.rect) {   // relational: solved against every room already laid on that level, so it slides clear of them
    if (!o.size) throw new Error(`ddl: room "${id}" says ${rel} but has no size [w, d]`);
    const other = R(o[rel]), lv = o.level ?? other.level ?? 1, at = (q) => ({ rect: [q.rect.x, q.rect.z, q.rect.w, q.rect.d], level: q.level ?? 1 });
    const laid = [...d.rooms.values()].map(at).filter((q) => q.level === lv);
    const r = placeNext({ ...at(other), level: lv }, o.size, rel, { gap: o.gap, align: o.align, side: o.side, shift: o.shift }, laid).rect;
    o = { ...o, rect: r, level: lv }; }
  const [x, z, w, dd] = o.rect ?? besideOf(o);
  d.rooms.set(id, { id, n: o.n ?? d.rooms.size + 1,   /* o.n: a room regrouped under its Level keeps its seed slot */ name: o.name ?? id, kind: o.kind ?? "chamber", level: o.level ?? 1, rect: { x, z, w, d: dd }, floor: o.floor ?? 0,
    ...(o.height ? { height: o.height } : {}), ...(o.pitDepth ? { pitDepth: o.pitDepth } : {}), purpose: o.purpose, sightline: o.sightline, ...(o.dais ? { dais: o.dais } : {}), ...(o.phase2 ? { phase2: o.phase2 } : {}), ...(o.feature ? { feature: o.feature } : {}),
    enemies: [], props: [], lights: [], loot: [], layerOf: d.layer });
}
// room("run", { size: [5, 9], from: "mouth", dir: "n", gap: 0, shift: 1 }): laid against another room instead of at numbers.
// shift slides it along the shared edge (cells from the other room's west / north edge; "middle" centres it).
function besideOf(o) {
  // room(id, { around, ring, dir, size }): on a concentric ring round another room's centre: `ring` cells out toward dir
  // (n s e w ne nw se sw). Harvested from the Barrow's tiers (Nov 6); any ring-plan place (a mound, a keep's ward, a pit) uses it.
  if (o.around) { const c = rectOf(o.around), [w, d] = o.size, [ux, uz] = DIRS[o.dir ?? "n"], cx = c.x + c.w / 2 + ux * o.ring, cz = c.z + c.d / 2 + uz * o.ring;
    return [round(cx - w / 2), round(cz - d / 2), w, d]; }
  if (!o.size || !o.from) throw new Error("ddl: a room needs rect, or size + from + dir");
  const f = rectOf(o.from), [w, d] = o.size, g = o.gap ?? 0, dir = o.dir ?? "n";
  const sh = o.shift === "middle" || o.shift == null ? (dir === "n" || dir === "s" ? (f.w - w) / 2 : (f.d - d) / 2) : o.shift;
  return dir === "n" ? [f.x + sh, f.z - g - d, w, d] : dir === "s" ? [f.x + sh, f.z + f.d + g, w, d] : dir === "w" ? [f.x - g - w, f.z + sh, w, d] : [f.x + f.w + g, f.z + sh, w, d];
}
// link(a, b, { side, at | t }): t places the doorway a fraction along a's wall (0..1 or "middle"); at stays as cells.
export function link(a, b, o = {}) {
  const ra = R(a); R(b); const l = { a, b, ...o };
  if (!l.side) { const A = ra.rect, B = R(b).rect, ox = [Math.max(A.x, B.x), Math.min(A.x + A.w, B.x + B.w)], oz = [Math.max(A.z, B.z), Math.min(A.z + A.d, B.z + B.d)];
    if (oz[1] - oz[0] > 0.2 && (B.x >= A.x + A.w - 0.01 || B.x + B.w <= A.x + 0.01)) { l.side = B.x >= A.x + A.w - 0.01 ? "e" : "w"; l.at ??= round((oz[0] + oz[1]) / 2); }
    else if (ox[1] - ox[0] > 0.2) { l.side = B.z >= A.z + A.d - 0.01 ? "s" : "n"; l.at ??= round((ox[0] + ox[1]) / 2); }
    else if (o.auto === false) throw new Error(`ddl: link ${a}→${b}: the rooms share no wall; give side and at`);
    // no shared wall: the corridor leaves a's wall that faces b (dominant axis between centres) and doglegs there (harvested: Barrow rings, Nov 6)
    else { const dx = (B.x + B.w / 2) - (A.x + A.w / 2), dz = (B.z + B.d / 2) - (A.z + A.d / 2);
      l.side = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? "e" : "w") : (dz > 0 ? "s" : "n"); } }
  if (l.at == null) { const q = ra.rect, tt = tOf(l.t); l.at = round(l.side === "n" || l.side === "s" ? q.x + tt * q.w : q.z + tt * q.d); delete l.t; }
  if (l.bat == null && l.bt != null) { const q = R(b).rect, tt = tOf(l.bt); l.bat = round(l.side === "n" || l.side === "s" ? q.x + tt * q.w : q.z + tt * q.d); delete l.bt; }
  need().links.push(l);
}
export function lock(id, o) { need().locks.push({ id, ...o }); }
export function exit(roomId, o) { R(roomId); need().exit = { room: roomId, ...resolve(o) }; }
export function beat(n, kind, roomId, text) { need().beats.push({ n, beat: kind, room: roomId, text }); }
export function premise(o) { need().premise = o; }

// ---- kits: which visual kit dresses a room (shell style, palette); default is the dungeon's style ----------------
export function kit(roomId, style, o = {}) { const r = R(roomId); r.kit = { style, ...o }; }

// ---- placement: one hand-placed thing -----------------------------------------------------------------------------
// every verb: at is a Loc, [x, z] cells, or a list of Locs (one each, ids returned); in defaults to the Loc's room
const many = (o, fn) => Array.isArray(o.at) && o.at.length && o.at[0] instanceof Loc ? o.at.map((a) => fn({ ...o, at: a })) : fn(o);
const roomFor = (o) => R(o.in ?? o.at?.room ?? (() => { throw new Error("ddl: give in: or a Loc for at:"); })());
const norm = (o) => ({ at: at(o.at) ?? o.at, ...resolve(strip(o, ["in", "at"])) });
export function place(kind, o) { return many(o, (o) => {
  const r = roomFor(o), n = r.props.filter((p) => p.kind === kind).length;
  const p = { id: `${r.id}/${kind}#${n}`, kind, ...norm(o), layer: need().layer, hand: true };
  r.props.push(p); return p.id; }); }
export const light = (kind, o) => many(o, (o) => { roomFor(o).lights.push({ kind, ...norm(o), layer: need().layer }); });
export const foe = (kind, o) => many(o, (o) => { roomFor(o).enemies.push({ kind, ...norm(o), layer: need().layer }); });
export const loot = (kind, o) => many(o, (o) => { roomFor(o).loot.push({ kind, ...norm(o), layer: need().layer }); });
export const trap = (kind, o) => place(`trap-${kind}`, o);
// hold(id, { at, y, why }): an authored row (a set piece, a herb, a quest object) carried whole from what stands now,
// re-anchored at a semantic spot; the compiler copies its spec from the live build, so its id and contents never change.
export const hold = (sid, o) => place("thing", { ...o, id: sid, hold: true });

// ---- hand edits on what earlier layers made -------------------------------------------------------------------------
const find = (pid) => { const [rid] = pid.split("/"); const r = R(rid), p = r.props.find((q) => q.id === pid); if (!p) throw new Error(`ddl: nothing at "${pid}"`); return [r, p]; };
export function move(pid, to) { const [, p] = find(pid); p.at = at(to) ?? to; p.hand = true; p.movedIn = need().layer; }
export function remove(pid) { const [r, p] = find(pid); r.props.splice(r.props.indexOf(p), 1); }
export function tweak(pid, o) { const [, p] = find(pid); Object.assign(p, o); }

// ---- procedural ------------------------------------------------------------------------------------------------------
// scatter(kind, { in, count, along: "walls" | "floor", seed, clear: 1.5, meaning }): seeded spots in the room that keep
// `clear` cells from every door, every earlier placement and each other. The same seed always gives the same spots.
export function scatter(kind, o) {
  const d = need(), r = R(o.in), q = r.rect, rand = rng((o.seed ?? 1) * 7919 + hash(r.id + kind)), clear = o.clear ?? 1.5, out = [];
  const doors = doorCells(d, r), taken = () => r.props.map((p) => p.at);
  for (let tries = 0; out.length < (o.count ?? 3) && tries < 400; tries++) {
    let x, z;
    if ((o.along ?? "walls") === "walls") { const side = Math.floor(rand() * 4), t = rand(), m = 0.45;
      [x, z] = side === 0 ? [q.x + m, q.z + t * q.d] : side === 1 ? [q.x + q.w - m, q.z + t * q.d] : side === 2 ? [q.x + t * q.w, q.z + m] : [q.x + t * q.w, q.z + q.d - m]; }
    else [x, z] = [q.x + 0.8 + rand() * (q.w - 1.6), q.z + 0.8 + rand() * (q.d - 1.6)];
    const ok = [...doors, ...taken()].every(([a, b]) => Math.hypot(a - x, b - z) >= clear);
    if (!ok) continue;
    const id = place(kind, { in: r.id, at: [round(x), round(z)], ...(o.meaning ? { meaning: o.meaning } : {}) });
    find(id)[1].hand = false; out.push(id);
  }
  return out;
}


// ---- shells: what a room is BUILT of (harvested from scripts/gen/gaol.js's room table, Nov 6 prison refactor) ------------
// shell(room, { wall: "fs"|"brick"|"vault"|"rock"|"ashlar", floor: "flag"|"wet"|"earth", ceil: "oak"|"earth"|"vault"|"iron", vault: "x"|"z", h })
// channel(room, { along: "x"|"z", width })  a sewer channel down the room's long axis (width in cells)
// pool(room, { depth })                      standing water in the room (depth in metres)
// generator(path, { table })                 the procedural layer that draws these shells; an as-built compile checks every
//                                            declared rect, shell, channel and pool against the generator's own table (>1 m or a
//                                            different material = the build refuses), so the program and the geometry cannot drift.
export function shell(roomId, o) { R(roomId).shell = { ...o }; }
export function channel(roomId, o = {}) { R(roomId).channel = { along: o.along ?? "z", ...o }; }
export function pool(roomId, o = {}) { R(roomId).pool = { ...o }; }
export function generator(path, o = {}) { need().generator = { path, table: o.table ?? "ROOMS" }; }

// ---- seeded procedural verbs (creator Nov 6: "scatter along walls, grow rooms from a seed, carve corridors, fill encounters by
// budget, all deterministic per seed"). Same seed, same answer; a later hand layer move()s / remove()s / tweak()s what they made.
export function seeded(seed, salt = "") { return rng(((seed ?? 1) * 7919 + hash(String(salt))) >>> 0); }
// scatterWalls(kind, room, { count, seed, clear }): scatter() pinned to the walls
export function scatterWalls(kind, roomId, o = {}) { return scatter(kind, { ...o, in: roomId, along: "walls" }); }
// growRooms(seed, { from, count, size: [min, max], dirs, prefix, kind, purpose }): rooms budded off `from` and each other,
// never overlapping a room that stands; each joined to its parent by a link in the shared wall's middle. Returns the ids.
export function growRooms(seed, o) {
  const d = need(), rand = seeded(seed, "grow:" + o.from), out = [], [lo, hi] = o.size ?? [3, 6], dirs = o.dirs ?? ["n", "e", "s", "w"];
  const hits = (a) => [...d.rooms.values()].some(({ rect: b }) => a[0] < b.x + b.w && a[0] + a[2] > b.x && a[1] < b.z + b.d && a[1] + a[3] > b.z);
  let parents = [o.from];
  for (let tries = 0; out.length < (o.count ?? 3) && tries < 200; tries++) {
    const from = parents[Math.floor(rand() * parents.length)], dir = dirs[Math.floor(rand() * dirs.length)];
    const w = lo + Math.floor(rand() * (hi - lo + 1)), dd = lo + Math.floor(rand() * (hi - lo + 1)), r = besideOf({ from, dir, size: [w, dd] });
    if (hits(r)) continue;
    const id = `${o.prefix ?? from}-${out.length + 1}`;
    room(id, { rect: r, kind: o.kind ?? "chamber", level: R(from).level, floor: R(from).floor, purpose: o.purpose ?? `grown from ${from} (seed ${seed})` });
    const f = R(from).rect, n = dir === "n" || dir === "s";
    link(from, id, { side: dir, at: round(n ? Math.max(f.x, r[0]) + Math.min(f.x + f.w, r[0] + r[2]) - Math.max(f.x, r[0]) : 0) / 1 || round(n ? (Math.max(f.x, r[0]) + Math.min(f.x + f.w, r[0] + r[2])) / 2 : (Math.max(f.z, r[1]) + Math.min(f.z + f.d, r[1] + r[3])) / 2) });
    d.links[d.links.length - 1].at = round(n ? (Math.max(f.x, r[0]) + Math.min(f.x + f.w, r[0] + r[2])) / 2 : (Math.max(f.z, r[1]) + Math.min(f.z + f.d, r[1] + r[3])) / 2);
    out.push(id); parents.push(id);
  }
  return out;
}
// carve(a, b, { width, seed, id, purpose }): a corridor room from a's wall to b's facing wall, straight where they share a span,
// else bent once (two rooms, the elbow chosen by the seed). Links both ends. Returns the corridor ids.
export function carve(a, b, o = {}) {
  const A = R(a).rect, B = R(b).rect, w = o.width ?? 1, rand = seeded(o.seed, `carve:${a}:${b}`), base = o.id ?? `${a}-${b}`;
  const ox = [Math.max(A.x, B.x), Math.min(A.x + A.w, B.x + B.w)], oz = [Math.max(A.z, B.z), Math.min(A.z + A.d, B.z + B.d)];
  const mk = (id, rect) => room(id, { rect, kind: "corridor", level: R(a).level, floor: R(a).floor, purpose: o.purpose ?? `carved between ${a} and ${b}` });
  if (ox[1] - ox[0] >= w) { const x = round(ox[0] + (ox[1] - ox[0] - w) * rand()), top = A.z < B.z ? A : B, bot = A.z < B.z ? B : A, z0 = top.z + top.d, z1 = bot.z;
    mk(base, [x, z0, w, z1 - z0]); const [n, s] = A.z < B.z ? [a, b] : [b, a]; link(n, base, { side: "s", at: x + w / 2 }); link(base, s, { side: "s", at: x + w / 2 }); return [base]; }
  if (oz[1] - oz[0] >= w) { const z = round(oz[0] + (oz[1] - oz[0] - w) * rand()), l = A.x < B.x ? A : B, r = A.x < B.x ? B : A, x0 = l.x + l.w, x1 = r.x;
    mk(base, [x0, z, x1 - x0, w]); const [W, E] = A.x < B.x ? [a, b] : [b, a]; link(W, base, { side: "e", at: z + w / 2 }); link(base, E, { side: "e", at: z + w / 2 }); return [base]; }
  // bent: leave a southward/northward from its middle, turn toward b
  const ax = round(A.x + A.w / 2 - w / 2), bz = round(B.z + B.d / 2 - w / 2), down = B.z > A.z, eastward = B.x > A.x;
  const z0 = down ? A.z + A.d : bz, z1 = down ? bz + w : A.z; mk(`${base}-1`, [ax, z0, w, z1 - z0]);
  const x0 = eastward ? ax + w : B.x + B.w, x1 = eastward ? B.x : ax; mk(`${base}-2`, [x0, bz, x1 - x0, w]);
  link(a, `${base}-1`, { side: down ? "s" : "n", at: ax + w / 2 }); link(`${base}-1`, `${base}-2`, { side: eastward ? "e" : "w", at: bz + w / 2 }); link(`${base}-2`, b, { side: eastward ? "e" : "w", at: bz + w / 2 });
  return [`${base}-1`, `${base}-2`];
}
// fillFoes(rooms, { budget, table: { kind: cost }, seed, why, clear }): spends the budget on foes, room by room in turn,
// each at a seeded floor spot clear of doors and earlier foes; slots are <room>-<kind>-<n>. Returns the slots.
export function fillFoes(rooms, o) {
  const d = need(), rand = seeded(o.seed, "foes:" + rooms.join(",")), kinds = Object.entries(o.table), out = [];
  let left = o.budget ?? 0, i = 0;
  while (left > 0 && i < 200) { i++;
    const afford = kinds.filter(([, c]) => c <= left); if (!afford.length) break;
    const [kind, cost] = afford[Math.floor(rand() * afford.length)], r = R(rooms[out.length % rooms.length]), q = r.rect;
    const spots = [...doorCells(d, r), ...r.enemies.map((e) => e.at)]; let p = null;
    for (let t = 0; t < 40 && !p; t++) { const c = [round(q.x + 0.8 + rand() * (q.w - 1.6)), round(q.z + 0.8 + rand() * (q.d - 1.6))]; if (spots.every(([x, z]) => Math.hypot(x - c[0], z - c[1]) >= (o.clear ?? 1.5))) p = c; }
    if (!p) continue;
    const slot = `${r.id}-${kind}-${r.enemies.filter((e) => e.kind === kind).length + 1}`;
    foe(kind, { in: r.id, at: p, slot, why: o.why ?? `budget ${o.budget} (seed ${o.seed})` }); left -= cost; out.push(slot);
  }
  return out;
}

// ---- host adapter: Place React trees compile down to these verbs (lib/react.mjs is the one component system) ------
// components(tree, { root }): render() the tree to host rows, then each row calls its verb in tree order. A row's room is its
// own id (type "room"), else props.in, else the nearest ancestor room row: semantic location flows down. Any prop that is a
// function of the room handle (at: (r) => r.corner("ne", 1)) is called with the(<that room>); { u, v } is r.at(u, v).
// The declared tree's outline is kept on the program (P.tree) for its design page.
import { render as renderTree, outline as outlineTree } from "./react.mjs";
const HOSTS = {
  premise: (p) => premise(p), level: (p) => level(p.n, p.name, p.floor, p.note),
  room: (p) => room(p.id, p), link: (p) => link(p.a, p.b, p),
  lock: ({ opener, ...p }) => lock(p.id, opener != null && p.key == null ? { ...p, key: opener } : p),   /* opener: the lock's key (in JSX `key` is identity) */ exit: (p, r) => exit(p.room ?? r, p),
  beat: (p, r) => beat(p.n, p.beat, p.room ?? r, p.text), kit: (p, r) => kit(p.room ?? r, p.style, p),
  shell: (p, r) => shell(p.room ?? r, p), channel: (p, r) => channel(p.room ?? r, p), pool: (p, r) => pool(p.room ?? r, p),
  generator: (p) => generator(p.path, p), dress: (p, r) => { (R(p.room ?? r).dress ??= []).push({ kinds: p.kinds, why: p.why }); },
  foe: (p, r) => foe(p.kind, { ...p, in: p.in ?? r }), hold: (p, r) => hold(p.id, { ...p, in: p.in ?? r }),
  light: (p, r) => light(p.kind, { ...p, in: p.in ?? r }), loot: (p, r) => loot(p.kind, { ...p, in: p.in ?? r }),
  place: (p, r) => place(p.kind, { ...p, in: p.in ?? r }), scatter: (p, r) => scatter(p.kind, { ...p, in: p.in ?? r }),
  in: () => {},   // <In room="x">: no row of its own; its children stand in that room
  "fill-foes": (p) => fillFoes(p.rooms, p), "grow-rooms": (p) => growRooms(p.seed, p), carve: (p) => carve(p.a, p.b, p),
};
export function components(tree, o = {}) {
  const rows = renderTree(tree, { root: o.root ?? "" }), roomAt = new Map(), d = need(), later = [];
  for (const row of rows) {
    const fn = HOSTS[row.type]; if (!fn) throw new Error(`ddl: no host primitive "${row.type}" (at ${row.id})`);
    const r = row.type === "room" ? row.props.id : row.type === "in" ? row.props.room : (row.props.in ?? roomAt.get(row.parent) ?? null);
    roomAt.set(row.id, r);
    if (Array.isArray(row.props.uv) && (row.props.in ?? r) && row.props.at == null) { const [u, v] = row.props.uv; row.props = { ...row.props, at: the(row.props.in ?? r).at(u, v) }; delete row.props.uv; }   // uv: a fraction across its room
    const props = Object.fromEntries(Object.entries(row.props).map(([k, v]) => [k, typeof v === "function" && r ? v(the(r)) : v && typeof v === "object" && "u" in v && "v" in v && r ? the(r).at(v.u, v.v) : v]));
    d.trace.push({ id: row.id, type: row.type, via: row.via ?? [], room: r, parent: row.parent });
    try { fn(props, r); } catch (e) {
      if (row.type === "link" && /^ddl: no room /.test(e.message)) { later.push([fn, props, r, row]); continue; }   // a way to a room a layout lays further on: run it once every room is down
      e.message = `${e.message} (component row ${row.type} ${row.id}, room ${r ?? "none"})`; throw e; }
  }
  for (const [fn, props, r, row] of later) { try { fn(props, r); } catch (e) { e.message = `${e.message} (component row ${row.type} ${row.id}, room ${r ?? "none"})`; throw e; } }
  d.tree.push(...outlineTree(tree));
  return rows;
}
// the trace rides the plan unseen: JSON (runtime catalogs, as-built checks) never carries it; trace and compile read P.trace
const withTrace = (t, P) => Object.defineProperty(P, "trace", { value: t, enumerable: false });
// ---- compile --------------------------------------------------------------------------------------------------------
export function compile(prog) {
  handles.clear();
  const d = CUR = { rooms: new Map(), links: [], locks: [], levels: [], beats: [], exit: null, premise: null, layer: null, layers: [], tree: [], trace: [], generator: null };
  try {
    prog.body({ layer(name, fn) { d.layer = name; d.layers.push(name); fn(); d.layer = null; } });
    // clutter rides every program as its last procedural layer unless the program says clutter: false (creator Nov 7)
    if ((prog.opts ?? {}).clutter !== false) { d.layer = "clutter"; d.layers.push("clutter"); clutterAll({ style: prog.opts?.style, ...(prog.opts?.clutter ?? {}) }); d.layer = null; }
    d.roomsOut = [...d.rooms.values()].map(({ layerOf, ...r }) => ({ ...resolve(r), props: r.props.map(({ id, layer, hand, movedIn, ...p }) => ({ ...resolve(p), ddl: id, layer })) }));
  } finally { CUR = null; }
  const o = prog.opts ?? {};
  return withTrace(d.trace, { grid: o.grid ?? 2, id: prog.id, name: o.name ?? prog.id, style: o.style ?? "cave", tier: o.tier ?? 1, map: o.map, exit: d.exit,
    premise: d.premise, levels: d.levels, beats: d.beats, layers: d.layers,
    rooms: d.roomsOut,
    links: d.links, locks: d.locks, ...(d.tree.length ? { tree: d.tree } : {}), ...(d.generator ? { generator: d.generator } : {}), ...(o.asBuilt ? { asBuilt: o.asBuilt } : {}) });
}

// a room's door spots in grid cells (from its links and the exit), for scatter to keep clear of
function doorCells(d, r) {
  const q = r.rect, out = [];
  for (const l of d.links) for (const [rid, side, at] of [[l.a, l.side, l.at], [l.b, { n: "s", s: "n", e: "w", w: "e" }[l.side], l.bat ?? l.at]]) if (rid === r.id)
    out.push(side === "n" ? [at, q.z] : side === "s" ? [at, q.z + q.d] : side === "w" ? [q.x, at] : [q.x + q.w, at]);
  if (d.exit?.room === r.id) out.push([d.exit.at?.[0] ?? 0, q.z + q.d]);
  return out;
}
const strip = (o, ks) => Object.fromEntries(Object.entries(o).filter(([k]) => !ks.includes(k)));
const round = (v) => Math.round(v * 10) / 10;
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

// ---- mine craft (harvested from Crowfoot Mine, Nov 6): shared verbs any program may use ---------------------------------
// rails(from, to, { every, cart, in, meaning }): a tram line of sleepered rail lengths between two spots, an ore cart on it at
//   fraction `cart` (0..1) when given. Component host: h("rails", { from, to, cart }).
export function rails(from, to, o = {}) {
  const a = at(from), b = at(to), dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, n = Math.max(1, Math.round(L / (o.every ?? 2)));
  const yaw = Math.round(Math.atan2(-dx, -dz) * 180 / Math.PI), inRoom = o.in ?? o.room ?? from.room ?? to.room, ids = [];
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; ids.push(place("rail", { in: inRoom, at: [round(a[0] + dx * t), round(a[1] + dz * t)], yaw, len: round(L / n), meaning: o.meaning ?? "a length of tram rail" })); }
  if (o.cart != null) ids.push(place("cart", { in: inRoom, at: [round(a[0] + dx * o.cart), round(a[1] + dz * o.cart)], yaw, meaning: o.cartMeaning ?? "an ore cart left on the line" }));
  return ids;
}
// timbers(roomId, { every, axis, height }): mine timber sets (two stulls and a cap) across a room's long axis every `every`
//   cells, skipping a set whose post would stand in a doorway. Component host: h("timbers", { every }) under a room.
export function timbers(roomId, o = {}) {
  const d = need(), r = R(roomId), q = r.rect, alongX = (o.axis ?? (q.w >= q.d ? "x" : "z")) === "x", len = alongX ? q.w : q.d, every = o.every ?? 3;
  const n = Math.max(1, Math.floor(len / every)), doors = doorCells(d, r), ids = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) * len / n, p = alongX ? [q.x + u, q.z + q.d / 2] : [q.x + q.w / 2, q.z + u];
    const posts = alongX ? [[p[0], q.z], [p[0], q.z + q.d]] : [[q.x, p[1]], [q.x + q.w, p[1]]];
    if (posts.some(([x, z]) => doors.some(([a, b]) => Math.hypot(a - x, b - z) < 1.6))) continue;
    ids.push(place("stull", { in: roomId, at: [round(p[0]), round(p[1])], yaw: alongX ? 90 : 0, span: alongX ? q.d : q.w, ...(o.height ? { h: o.height } : {}), meaning: o.meaning ?? "a timber set: two stulls and a cap" }));
  }
  return ids;
}
HOSTS.rails = (p) => rails(p.from, p.to, p);
HOSTS.timbers = (p) => timbers(p.room ?? p.in, p);
// the React vocabulary, re-exported so a dungeon program needs one import; mount = components (the name the prison program uses)
export { h, Fragment, createContext, useContext, useRandom, useSeed, useSpot, SeedContext } from "./react.mjs";
export const mount = (tree, o) => components(tree, o);
// ---- crypt craft (harvested from the Barrow, Nov 6): burial niches along a room's walls ---------------------------------
// niches(roomId, { sides, count, every, occupant, size, height, meaning }): slabs / loculi / sarcophagi set into the walls, each a
//   rise row carrying who lies there. Returns the ids (near("<room>/rise#i") finds them). Component host: h("niches", {…}).
export function niches(roomId, o = {}) {
  const spots = along(the(roomId).walls, { sides: o.sides ?? ["e", "w"], count: o.count, every: o.every ?? 3, off: o.off ?? 1 });
  return spots.map((at, i) => place("rise", { in: roomId, at, size: o.size ?? [1.2, 0.8], height: o.height ?? 0.8, occupant: Array.isArray(o.occupant) ? o.occupant[i % o.occupant.length] : o.occupant,
    meaning: o.meaning ?? `a burial niche: ${Array.isArray(o.occupant) ? o.occupant[i % o.occupant.length] : o.occupant ?? "the dead"}` }));
}
HOSTS.niches = (p, r) => niches(p.room ?? p.in ?? r, p);

// ---- placement relations (creator Nov 7: "reusable concepts like what it means to place things in the center of a room,
// versus along a wall, versus on top of something"). Every relation is a function of a room (and maybe a thing) that answers
// spots; every procedural verb asks the same relations, so "against a wall" means one thing in every program.
//
//   spots.center(room)                 the middle, and a few cells round it in a big room
//   spots.wall(room, { sides, every }) against the walls, facing in (yaw rides each spot)
//   spots.corner(room, { off })        the four corners, tucked in
//   spots.doorside(room, { off })      either side of every doorway, just inside, never in it
//   spots.onTop(pid)                   on top of an earlier placement (y = its height); a lamp on a crate, a skull on a coffin
//   spots.beside(pid, { gap })         round an earlier placement, touching it
//   spots.under(pid)                   beneath it (a puddle under a barrel, a rat under a table)
//   walkLine(room)                     the line people walk: door to door (one door: door to middle). Nothing procedural stands on it.
//   cluster(spot, n, { r, seed })      a tight group round one spot, the way things pile up
// A spot is { at: [x, z], yaw?, y?, on? }. Every verb below takes `where:` = one of those names or a list of spots.
const yawIn = { n: 180, s: 0, w: 90, e: -90 };
export function walkLine(roomId) {
  const d = need(), r = R(roomId), q = r.rect, doors = doorCells(d, r), mid = [q.x + q.w / 2, q.z + q.d / 2];
  if (doors.length <= 1) return doors.length ? [[doors[0], mid]] : [];
  const segs = []; for (let i = 1; i < doors.length; i++) segs.push([doors[0], doors[i]]);
  if (doors.length > 2) for (let i = 1; i < doors.length; i++) segs.push([doors[i], mid]);
  return segs;
}
const segDist = ([x, z], [[ax, az], [bx, bz]]) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)); return Math.hypot(x - ax - t * dx, z - az - t * dz); };
const propOf = (pid) => find(pid)[1];
export const spots = {
  center(roomId) { const q = R(roomId).rect, c = [q.x + q.w / 2, q.z + q.d / 2]; return q.w * q.d >= 36 ? [c, [c[0] - 1, c[1]], [c[0] + 1, c[1]], [c[0], c[1] - 1], [c[0], c[1] + 1]].map((at) => ({ at })) : [{ at: c }]; },
  wall(roomId, o = {}) { const q = R(roomId).rect, m = o.off ?? 0.45, out = [];
    for (const sd of o.sides ?? ["n", "e", "s", "w"]) { const len = sd === "n" || sd === "s" ? q.w : q.d, n = Math.max(1, Math.floor(len / (o.every ?? 1)));
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; out.push({ at: sd === "n" ? [q.x + t * q.w, q.z + m] : sd === "s" ? [q.x + t * q.w, q.z + q.d - m] : sd === "w" ? [q.x + m, q.z + t * q.d] : [q.x + q.w - m, q.z + t * q.d], yaw: yawIn[sd], wall: sd }); } }
    return out; },
  corner(roomId, o = {}) { const q = R(roomId).rect, m = o.off ?? 0.5; return [["nw", q.x + m, q.z + m], ["ne", q.x + q.w - m, q.z + m], ["sw", q.x + m, q.z + q.d - m], ["se", q.x + q.w - m, q.z + q.d - m]].map(([c, x, z]) => ({ at: [x, z], corner: c })); },
  doorside(roomId, o = {}) { const d = need(), r = R(roomId), q = r.rect, off = o.off ?? 1.1, inset = 0.5, out = [];
    for (const [x, z] of doorCells(d, r)) { const onX = Math.abs(z - q.z) < 0.01 || Math.abs(z - q.z - q.d) < 0.01, inz = Math.abs(z - q.z) < 0.01 ? inset : -inset, inx = Math.abs(x - q.x) < 0.01 ? inset : -inset;
      if (onX) out.push({ at: [x - off, z + inz] }, { at: [x + off, z + inz] }); else out.push({ at: [x + inx, z - off] }, { at: [x + inx, z + off] }); }
    return out.filter(({ at: [x, z] }) => x > q.x && x < q.x + q.w && z > q.z && z < q.z + q.d); },
  onTop(pid) { const p = propOf(pid); return [{ at: [...p.at], y: p.height ?? HEIGHTS[p.kind] ?? 0.8, on: pid }]; },
  beside(pid, o = {}) { const p = propOf(pid), g = (o.gap ?? 0.7); return [0, 90, 180, 270].map((a) => ({ at: [round(p.at[0] + Math.cos(a * Math.PI / 180) * g), round(p.at[1] + Math.sin(a * Math.PI / 180) * g)], by: pid })); },
  under(pid) { const p = propOf(pid); return [{ at: [...p.at], y: 0, under: pid }]; },
};
const HEIGHTS = { barrel: 0.9, crate: 0.7, sack: 0.5, table: 0.8, rise: 0.8, chest: 0.6, coffin: 0.7 };
export function cluster(spot, n, o = {}) { const rand = seeded(o.seed, "cluster:" + spot.at.join(",")), r = o.r ?? 0.6, out = [spot];
  for (let i = 1; i < n; i++) { const a = rand() * Math.PI * 2, d = r * (0.6 + rand() * 0.5); out.push({ ...spot, at: [round(spot.at[0] + Math.cos(a) * d), round(spot.at[1] + Math.sin(a) * d)] }); }
  return out; }
// fits(room, at, { clear, walk }): the one test every procedural verb uses: inside the room, clear of doors, of the walking line,
// and of every earlier placement by `clear` cells
export function fits(roomId, at, o = {}) {
  const d = need(), r = R(roomId), q = r.rect, [x, z] = at, m = 0.3;
  if (x < q.x + m || x > q.x + q.w - m || z < q.z + m || z > q.z + q.d - m) return false;
  if (doorCells(d, r).some(([a, b]) => Math.hypot(a - x, b - z) < (o.door ?? 1.4))) return false;
  if ((o.walk ?? 0.9) > 0 && walkLine(roomId).some((s) => segDist(at, s) < (o.walk ?? 0.9))) return false;
  const others = [...r.props.map((p) => p.at), ...r.enemies.map((e) => e.at), ...r.loot.map((l) => l.at)].filter(Boolean);
  return others.every(([a, b]) => Math.hypot(a - x, b - z) >= (o.clear ?? 0.55));
}
// arrange(kind, { in, where, count, group, seed, ...props }): `count` things (or groups of `group`) at spots from a relation,
// each tested by fits(); the one procedural placer the higher words below are written in.
export function arrange(kind, o) {
  const r = R(o.in), rand = seeded(o.seed, `arrange:${r.id}:${kind}`), list = typeof o.where === "string" ? spots[o.where](r.id, o) : o.where ?? spots.wall(r.id, o);
  const pool = [...list]; for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const out = [], { in: _i, where: _w, count: _c, group: _g, seed: _s, sides: _sd, every: _e, off: _o, ...props } = o;
  for (const s of pool) { if (out.length >= (o.count ?? 3)) break;
    const g = Array.isArray(o.group) ? o.group[0] + Math.floor(rand() * (o.group[1] - o.group[0] + 1)) : (o.group ?? 1);
    for (const c of cluster(s, g, { seed: (o.seed ?? 1) + out.length, r: 0.55 })) {
      if (!c.on && !fits(r.id, c.at, o)) continue;
      const id = place(kind, { ...props, in: r.id, at: c.at, ...(c.yaw != null ? { yaw: c.yaw + Math.round((rand() - 0.5) * 30) } : { yaw: Math.round(rand() * 360) }), ...(c.y ? { y: c.y } : {}), ...(c.on ? { on: c.on } : {}) });
      propOf(id).hand = false; out.push(id); } }
  return out;
}

// ---- clutter: what people left lying about, written in arrange() (creator Nov 7: "place barrels and such throughout all the
// dungeons using a placement algorithm / component"). A SET names what a kind of place keeps and where it keeps it; a DENSITY
// says how much; the room's kind sets a default. clutterAll() runs it through a whole dungeon in one line.
export const CLUTTER_SETS = {
  // LEARNED from the gaol sewer's 159 hand-placed crates and barrels (Nov 7 audit): all 0.5-1 m off a wall, none mid-floor,
  // 99 groups for 159 pieces (ones and twos), crates and barrels about even, any yaw, about 1 in 8 tucked in a corner.
  "gaol-stores": [{ kind: "crate", where: "wall", group: [1, 2], off: 0.75 }, { kind: "barrel", where: "wall", group: [1, 2], off: 0.75 },
                  { kind: "crate", where: "wall", group: [1, 2], off: 0.75 }, { kind: "barrel", where: "wall", group: [1, 2], off: 0.75 },
                  { kind: "crate", where: "wall", group: [1, 2], off: 0.75 }, { kind: "barrel", where: "wall", group: [1, 2], off: 0.75 },
                  { kind: "barrel", where: "corner", group: [2, 3], off: 0.7 }],
  cellar:  [{ kind: "barrel", where: "corner", group: [2, 3] }, { kind: "crate", where: "wall", group: [1, 2] }, { kind: "crate", where: "doorside" }, { kind: "barrel", where: "wall", group: [1, 2] }],
  sewer:   [{ kind: "barrel", where: "wall", group: [1, 3], tipped: true }, { kind: "crate", where: "corner", group: [1, 2] }, { kind: "rubble", where: "corner" }],
  mine:    [{ kind: "crate", where: "wall", group: [1, 3] }, { kind: "barrel", where: "corner", group: [1, 2] }, { kind: "barrel", where: "doorside" }, { kind: "rubble", where: "corner" }],
  crypt:   [{ kind: "rubble", where: "corner" }, { kind: "bones", where: "wall", group: [1, 2] }, { kind: "rubble", where: "wall" }],
  cave:    [{ kind: "rubble", where: "corner", group: [1, 2] }, { kind: "bones", where: "wall" }, { kind: "rubble", where: "wall" }],
  camp:    [{ kind: "crate", where: "wall", group: [1, 2] }, { kind: "crate", where: "corner", group: [2, 3] }, { kind: "barrel", where: "doorside" }],
};
export const STYLE_SET = { sewer: "sewer", mine: "mine", barrow: "crypt", tomb: "crypt", temple: "crypt", cave: "cave", seacave: "camp", fortress: "cellar", ruin: "cave", underwater: "cave" };
const DENSITY = { bare: 0, sparse: 0.02, "lived-in": 0.05, hoard: 0.1 };   /* clusters per square cell */
const KIND_DENSITY = { entry: "sparse", corridor: "sparse", hall: "sparse", boss: "sparse", shrine: "bare", bridge: "bare", flooded: "bare", chamber: "lived-in", cavern: "lived-in", treasury: "hoard", storeroom: "hoard", camp: "hoard" };
export function clutter(roomId, o = {}) {
  const r = R(roomId), set = CLUTTER_SETS[o.set ?? "cellar"], dens = typeof o.density === "number" ? o.density : (DENSITY[o.density ?? KIND_DENSITY[r.kind] ?? "sparse"] ?? 0);   // a number = pieces per m², measured off a place that stands
  const n = Math.round(r.rect.w * r.rect.d * dens);   // rects are metres here
  if (!n || !set) return [];
  const rand = seeded(o.seed, "clutter:" + roomId), out = [];
  for (let i = 0; i < n; i++) { const { kind, ...e } = set[Math.floor(rand() * set.length)];
    out.push(...arrange(kind, { ...e, ...(o.door != null ? { door: o.door } : {}), ...(o.walk != null ? { walk: o.walk } : {}), in: roomId, count: 1, seed: (o.seed ?? 1) * 31 + i, meaning: o.meaning ?? `left here (${o.set ?? "cellar"} clutter)` })); }
  return out;
}
export function clutterAll(o = {}) {
  const d = need(), set = o.set ?? STYLE_SET[o.style] ?? "cellar", skip = new Set(o.skip ?? []);
  return [...d.rooms.values()].filter((r) => !skip.has(r.id)).flatMap((r) => clutter(r.id, { set: o.sets?.[r.id] ?? set, density: o.density?.[r.id] ?? o.density?.[r.kind] ?? (typeof o.density === "string" ? o.density : undefined), seed: o.seed ?? 1 }));
}
HOSTS.arrange = (p, r) => arrange(p.kind, { ...p, in: p.in ?? r });
HOSTS.clutter = (p, r) => p.all ? clutterAll(p) : clutter(p.room ?? p.in ?? r, p);
// ---- seep: the water a wet room weeps (creator Nov 7: "build abstractions"; harvested from the gaol's 35 hand drips and mists).
// A run's mist sits on its centre line every mistEvery m (a channel or a pool), its drips hang off the vault every dripEvery m,
// staggered side to side; a small room gets one drip. mist: false = drips only (a damp room with no standing water).
// The compiler (from-asbuilt WET) turns each into templates/sewer.js#drip | #mist; y is metres above the room floor.
// seep(room, { mist, mistEvery = 8, mistY = -0.49 (channel) | -0.25 (pool), dripEvery = 12, drips, meaning })
export function seep(roomId, o = {}) {
  const r = R(roomId), q = r.rect, G = need().grid ?? 2, out = [], alongX = o.along ? o.along === "x" : q.w >= q.d;
  const len = alongX ? q.w : q.d, half = (alongX ? q.d : q.w) / 2, cx = q.x + q.w / 2, cz = q.z + q.d / 2;
  const line = (everyM, n0) => { const step = everyM / G, n = n0 ?? Math.max(1, Math.floor((len - 1) / step)), start = (alongX ? q.x : q.z) + (len - (n - 1) * step) / 2;
    return Array.from({ length: n }, (_, i) => start + i * step); };
  const mist = o.mist ?? !!(r.channel || r.pool), why = o.meaning ?? "water coming through";
  if (mist) for (const t of line(o.mistEvery ?? 8, o.mists)) out.push(place("mist", { in: roomId, at: alongX ? [t, cz] : [cx, t], y: o.mistY ?? (r.channel ? -0.49 : -0.25), meaning: `wet: mist off the ${r.channel ? "channel" : "water"}` }));
  line(o.dripEvery ?? 12, o.drips).forEach((t, i) => { const off = (i % 2 ? 1 : -1) * half * 0.5;
    out.push(place("drip", { in: roomId, at: alongX ? [t, cz + off] : [cx + off, t], meaning: `wet: ${why}` })); });
  return out;
}
HOSTS.seep = (p, r) => seep(p.room ?? p.in ?? r, p);

// ---- layouts (creator Nov 7: "arrange in a fractal type of loop, along a line, midway points, thirds, all sorts of spacing,
// layouts, random locations"). A layout answers spots ({ at, yaw? }) in cells; any of them is a `where:` for arrange().
// Every one is pure geometry over Locs or [x, z], so rooms, towns and wilds share them.
const P = (v) => v instanceof Loc ? v.xy() : Array.isArray(v) ? v : at(v);
const lerp2 = (a, b, t) => [round(a[0] + (b[0] - a[0]) * t), round(a[1] + (b[1] - a[1]) * t)];
const yawAlong = (a, b) => Math.round(Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])) * 180 / Math.PI);
const Q = (room) => (room && typeof room === "object" && room.rect) ? room : R(room);   // a room id, or any { rect } (outdoors)
export const layout = {
  // fractions of the way from a to b: fractions(a, b, [1/3, 2/3]); the named ones below are sugar for it
  fractions(a, b, ts) { const A = P(a), B = P(b), y = yawAlong(A, B); return ts.map((t) => ({ at: lerp2(A, B, t), yaw: y })); },
  midpoint(a, b) { return layout.fractions(a, b, [0.5]); },
  thirds(a, b) { return layout.fractions(a, b, [1 / 3, 2 / 3]); },
  quarters(a, b) { return layout.fractions(a, b, [0.25, 0.5, 0.75]); },
  golden(a, b) { return layout.fractions(a, b, [0.382, 0.618]); },
  // line(a, b, { count | every, ends, spacing: "even" | "jitter" | "grow" | "shrink", seed }): things down a line
  line(a, b, o = {}) { const A = P(a), B = P(b), L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = o.count ?? Math.max(1, Math.floor(L / (o.every ?? 2))), rand = seeded(o.seed, "line"), y = yawAlong(A, B), out = [];
    for (let i = 0; i < n; i++) { let t = o.ends ? (n === 1 ? 0.5 : i / (n - 1)) : (i + 0.5) / n;
      if (o.spacing === "jitter") t = Math.min(1, Math.max(0, t + (rand() - 0.5) * (0.8 / n)));
      else if (o.spacing === "grow") t = t * t; else if (o.spacing === "shrink") t = 1 - (1 - t) * (1 - t);
      out.push({ at: lerp2(A, B, t), yaw: y }); }
    return out; },
  // path(points, o): line() over a polyline, spacing measured along the whole length
  path(points, o = {}) { const ps = points.map(P), segs = ps.slice(1).map((b, i) => [ps[i], b, Math.hypot(b[0] - ps[i][0], b[1] - ps[i][1])]), L = segs.reduce((s, x) => s + x[2], 0), n = o.count ?? Math.max(1, Math.floor(L / (o.every ?? 2))), out = [];
    for (let i = 0; i < n; i++) { let d = (o.ends ? (n === 1 ? 0.5 : i / (n - 1)) : (i + 0.5) / n) * L; for (const [a, b, l] of segs) { if (d <= l || b === segs.at(-1)[1]) { out.push({ at: lerp2(a, b, Math.min(1, d / (l || 1))), yaw: yawAlong(a, b) }); break; } d -= l; } }
    return out; },
  // arc / ring round a centre; facing: "in" | "out" | "along"
  arc(c, r, { from = 0, to = 360, count = 6, facing = "in" } = {}) { const C = P(c), full = Math.abs(to - from) >= 360, out = [];
    for (let i = 0; i < count; i++) { const deg = from + (to - from) * (full ? i / count : count === 1 ? 0.5 : i / (count - 1)), a = deg * Math.PI / 180, p = [round(C[0] + Math.cos(a) * r), round(C[1] + Math.sin(a) * r)];
      out.push({ at: p, yaw: facing === "in" ? yawAlong(p, C) : facing === "out" ? yawAlong(C, p) : Math.round(-deg) }); }
    return out; },
  // grid in a rectangle: rows/cols or every; stagger offsets odd rows (a brick or hex pattern)
  grid(room, { cols, rows, every = 2, margin = 1, stagger = false } = {}) { const q = Q(room).rect, w = q.w - 2 * margin, d = q.d - 2 * margin, nc = cols ?? Math.max(1, Math.floor(w / every) + 1), nr = rows ?? Math.max(1, Math.floor(d / every) + 1), out = [];
    for (let j = 0; j < nr; j++) for (let i = 0; i < nc; i++) { const sx = stagger && j % 2 ? 0.5 : 0; out.push({ at: [round(q.x + margin + (nc === 1 ? w / 2 : ((i + sx) / (nc - 1)) * w)), round(q.z + margin + (nr === 1 ? d / 2 : (j / (nr - 1)) * d))] }); }
    return out.filter(({ at: [x] }) => x <= q.x + q.w - margin + 0.01); },
  // random(room, n, { seed, margin }): plain seeded spots
  random(room, n, { seed, margin = 0.8 } = {}) { const q = Q(room).rect, rand = seeded(seed, "random:" + room); return Array.from({ length: n }, () => ({ at: [round(q.x + margin + rand() * (q.w - 2 * margin)), round(q.z + margin + rand() * (q.d - 2 * margin))] })); },
  // spread(room, { gap, max, seed }): random but never closer than gap: an even, natural scatter (Poisson-disc by darts)
  spread(room, { gap = 2, max = 64, seed, margin = 0.8 } = {}) { const q = Q(room).rect, rand = seeded(seed, "spread:" + room), out = [];
    for (let t = 0; t < max * 30 && out.length < max; t++) { const p = [q.x + margin + rand() * (q.w - 2 * margin), q.z + margin + rand() * (q.d - 2 * margin)]; if (out.every(({ at: [x, z] }) => Math.hypot(x - p[0], z - p[1]) >= gap)) out.push({ at: [round(p[0]), round(p[1])] }); }
    return out; },
  // spiral(c, { turns, count, r }): a coil out from a centre
  spiral(c, { turns = 2, count = 12, r = 3 } = {}) { const C = P(c); return Array.from({ length: count }, (_, i) => { const t = (i + 1) / count, a = t * turns * Math.PI * 2; return { at: [round(C[0] + Math.cos(a) * r * t), round(C[1] + Math.sin(a) * r * t)] }; }); },
  // recurse(seed spots, step, depth): a pattern repeated inside itself. step(spot, level) answers the child spots of one spot;
  // recurse runs it `depth` times and returns every level's spots tagged { level }. ring-of-rings, branching lines, a fractal
  // cluster of rubble all are one step function.
  recurse(start, step, depth = 2) { let level = start.map((s) => ({ ...s, level: 0 })), out = [...level];
    for (let k = 1; k <= depth; k++) { level = level.flatMap((s) => step(s, k).map((c) => ({ ...c, level: k }))); out.push(...level); }
    return out; },
  // the two recurse() shapes everyone wants, ready-made:
  ringOfRings(c, { r = 4, count = 6, shrink = 0.4, depth = 1 } = {}) { return layout.recurse(layout.arc(c, r, { count }), (s, k) => layout.arc(s.at, r * Math.pow(shrink, k), { count: Math.max(3, count - 2 * k) }), depth); },
  branch(a, b, { depth = 2, spread = 35, every = 1.5, shrink = 0.6 } = {}) { const A = P(a), B = P(b);
    const seg = (p, q) => layout.line(p, q, { every });
    let tips = [[A, B]], out = seg(A, B).map((s) => ({ ...s, level: 0 }));
    for (let k = 1; k <= depth; k++) { const next = []; for (const [p, q] of tips) { const dx = q[0] - p[0], dz = q[1] - p[1];
        for (const s of [-1, 1]) { const ang = s * spread * Math.PI / 180, c = Math.cos(ang), sn = Math.sin(ang), e = [round(q[0] + (dx * c - dz * sn) * shrink), round(q[1] + (dx * sn + dz * c) * shrink)]; next.push([q, e]); out.push(...seg(q, e).map((x) => ({ ...x, level: k }))); } }
      tips = next; }
    return out; },
  // filters that compose: keep spots inside a room / clear of the walking line / every nth
  within(room, spots, m = 0.3) { const q = Q(room).rect; return spots.filter(({ at: [x, z] }) => x >= q.x + m && x <= q.x + q.w - m && z >= q.z + m && z <= q.z + q.d - m); },
  clearOfWalk(room, spots, w = 0.9) { const segs = walkLine(room); return spots.filter(({ at }) => segs.every((s) => segDist(at, s) >= w)); },
  every(spots, n, offset = 0) { return spots.filter((_, i) => (i - offset) % n === 0); },
};
// spots and layouts are one namespace for arrange({ where: "thirds" }) when a room is enough to answer it
Object.assign(spots, {
  random: (room, o) => layout.random(room, o.count ?? 3, o), spread: (room, o) => layout.spread(room, o), grid: (room, o) => layout.grid(room, o),
  thirds: (room, o) => { const q = R(room).rect, alongX = q.w >= q.d, a = alongX ? [q.x, q.z + q.d / 2] : [q.x + q.w / 2, q.z], b = alongX ? [q.x + q.w, q.z + q.d / 2] : [q.x + q.w / 2, q.z + q.d]; return layout.thirds(a, b); },
  midline: (room, o) => { const q = R(room).rect, alongX = q.w >= q.d, a = alongX ? [q.x, q.z + q.d / 2] : [q.x + q.w / 2, q.z], b = alongX ? [q.x + q.w, q.z + q.d / 2] : [q.x + q.w / 2, q.z + q.d]; return layout.line(a, b, o); },
});
HOSTS.layout = (p, r) => { const fn = layout[p.shape]; if (!fn) throw new Error(`ddl: no layout "${p.shape}"`); const room = p.in ?? r, ss = fn(...(p.args ?? [room]), p);
  return arrange(p.kind, { ...p, in: room, where: p.clear === false ? ss : layout.within(room, ss), count: p.count ?? ss.length }); };

// ---- height (creator Nov 7: "2d in 3d space: a room on top of another, a ladder between them, elevation, rooms with multiple
// elevations within them, natural terrain"). Every word compiles to what the generator already builds: a room's floor (m),
// its level, rise/ledge rows (a raised block the body stands on), a link between floors (drawn as a stair or slope; oneway =
// a drop you can't climb back), and pitDepth. So a program says WHAT the height means; the kit decides how it looks.
//
//   room(id, { below: "hall", depth: 3, dir: "n", size }) / { above: … , rise: 2 }   a room a storey down/up, laid off another
//   descend(a, b, { by: "stair" | "ramp" | "drop" | "ladder" })   how you get between two floors (sets the link's kind)
//   terrace(room, { steps, along, rise, from })   the floor climbs in bands across the room (an amphitheatre, a stepped cave)
//   gallery(room, { side, width, height })        a raised walk along one wall, with a short stair up at one end
//   dais(room, { at, size, height })              one raised block (a throne step, an altar platform)
//   pit(room, { depth })                          the middle falls away; a stair climbs back up
//   rough(room, { bumps, height, seed })          natural ground: low uneven mounds clear of doors and the walking line
//   elevation(room, [x, z])                       the floor height a body stands at there (rises included): what onTop uses
const STOREY = 3;
const _room = room;
export { _room as roomFlat };
function vertical(o) {
  if (!o.below && !o.above) return o;
  const other = R(o.below ?? o.above), dy = o.below ? -(o.depth ?? STOREY) : (o.rise ?? STOREY);
  return { ...o, from: o.from ?? (o.below ?? o.above), dir: o.dir ?? "n", floor: o.floor ?? round((other.floor ?? 0) + dy), level: o.level ?? (other.level ?? 1) + (o.below ? 1 : -1) };
}
// room() is re-entered through vertical(): an above/below room is a room laid beside its anchor on another floor
export function storey(id, o) { return room(id, vertical(o)); }
export function descend(a, b, o = {}) {
  const by = o.by ?? "stair", fa = R(a).floor ?? 0, fb = R(b).floor ?? 0;
  link(a, b, { ...o, kind: by, ...(by === "drop" ? { oneway: true } : {}), ...(by === "ladder" ? { ladder: true } : {}) });
  if (by === "drop" && fa < fb) throw new Error(`ddl: a drop from ${a} (${fa} m) to ${b} (${fb} m) falls upward`);
  if (by === "ladder" || by === "drop") { const l = need().links.at(-1); l.why ??= by === "ladder" ? `a ladder: ${Math.abs(fa - fb)} m between floors` : `a drop: ${Math.abs(fa - fb)} m, no way back up here`; }
}
const rise = (roomId, at, size, height, meaning, kind = "rise") => place(kind, { in: roomId, at, size, height, meaning });
export function terrace(roomId, o = {}) {
  const q = R(roomId).rect, n = o.steps ?? 3, h = o.rise ?? 0.5, along = o.along ?? (q.w >= q.d ? "x" : "z"), from = o.from ?? (along === "x" ? "w" : "n"), out = [];
  for (let i = 1; i <= n; i++) { const len = (along === "x" ? q.w : q.d) / (n + 1), t0 = i * len;
    const c = along === "x" ? [from === "w" ? q.x + t0 + len / 2 : q.x + q.w - t0 - len / 2, q.z + q.d / 2] : [q.x + q.w / 2, from === "n" ? q.z + t0 + len / 2 : q.z + q.d - t0 - len / 2];
    out.push(rise(roomId, c.map(round), along === "x" ? [len, q.d - 0.4] : [q.w - 0.4, len], round(h * i), o.meaning ?? `terrace ${i} of ${n}`)); }
  return out;
}
export function gallery(roomId, o = {}) {
  // a raised run along one wall. It never walls a doorway off: each door on that wall leaves a gap (door width + a step each
  // side), and every piece gets its own short stair at its start, so you can walk in at the floor and climb up anywhere.
  const r = R(roomId), q = r.rect, side = o.side ?? "n", w = o.width ?? 1.5, h = o.height ?? 1.5, nS = side === "n" || side === "s";
  const lo = nS ? q.x + 1 : q.z + 1, hi = nS ? q.x + q.w - 1 : q.z + q.d - 1, gap = o.gap ?? 1.6;
  const doors = doorCells(need(), r).filter(([dx, dz]) => nS ? Math.abs(dz - (side === "n" ? q.z : q.z + q.d)) < 0.01 : Math.abs(dx - (side === "w" ? q.x : q.x + q.w)) < 0.01)
    .map(([dx, dz]) => nS ? dx : dz).sort((a, b) => a - b);
  const runs = []; let a = lo;
  for (const dc of doors) { if (dc - gap > a) runs.push([a, dc - gap]); a = Math.max(a, dc + gap); }
  if (hi > a) runs.push([a, hi]);
  const cross = nS ? (side === "n" ? q.z + w / 2 : q.z + q.d - w / 2) : (side === "w" ? q.x + w / 2 : q.x + q.w - w / 2), out = [];
  const steps = Math.max(2, Math.ceil(h / 0.4));
  for (const [s0, s1] of runs.filter(([s0, s1]) => s1 - s0 >= 1.5)) {
    const mid = (s0 + s1) / 2, c = nS ? [mid, cross] : [cross, mid];
    out.push(rise(roomId, c.map(round), nS ? [s1 - s0, w] : [w, s1 - s0], h, o.meaning ?? `a gallery along the ${side} wall`, "ledge"));
    for (let i = 1; i < steps; i++) { const t = i / steps, inward = (side === "n" || side === "w" ? 1 : -1) * w * t;
      const sc = nS ? [s0 + 0.5, cross + inward] : [cross + inward, s0 + 0.5];
      out.push(rise(roomId, sc.map(round), [1, 0.6], round(h * (1 - t)), `stair to the gallery, step ${i}`)); }
  }
  return out;
}
export function dais(roomId, o = {}) { const a = at(o.at ?? the(roomId).at(0.5, 0.25)); return rise(roomId, a, o.size ?? [3, 2], o.height ?? 0.6, o.meaning ?? "a raised dais"); }
export function pit(roomId, o = {}) { R(roomId).pitDepth = o.depth ?? 3; }
export function rough(roomId, o = {}) {
  const ss = layout.clearOfWalk(roomId, layout.spread(roomId, { gap: o.gap ?? 2.2, max: o.bumps ?? 5, seed: o.seed }), 1.2), rand = seeded(o.seed, "rough:" + roomId);
  return ss.filter(({ at: p }) => fits(roomId, p, { clear: 1.2 })).map(({ at: p }) => rise(roomId, p, [round(1 + rand() * 1.4), round(1 + rand() * 1.4)], round((o.height ?? 0.4) * (0.4 + rand() * 0.6)), o.meaning ?? "uneven ground"));
}
export function elevation(roomId, p) {
  const r = R(roomId); let y = r.floor ?? 0;
  for (const q of r.props) if ((q.kind === "rise" || q.kind === "ledge") && q.at && Math.abs(p[0] - q.at[0]) <= (q.size?.[0] ?? 2) / 2 && Math.abs(p[1] - q.at[1]) <= (q.size?.[1] ?? 1) / 2) y = Math.max(y, (r.floor ?? 0) + (q.height ?? 1));
  return y;
}
spots.onRise = (roomId) => R(roomId).props.filter((q) => q.kind === "rise" || q.kind === "ledge").map((q) => ({ at: [...q.at], y: q.height ?? 1, on: q.id }));
Object.assign(HOSTS, {
  storey: (p) => storey(p.id, p), descend: (p) => descend(p.a, p.b, p),
  terrace: (p, r) => terrace(p.room ?? p.in ?? r, p), gallery: (p, r) => gallery(p.room ?? p.in ?? r, p), dais: (p, r) => dais(p.room ?? p.in ?? r, p),
  pit: (p, r) => pit(p.room ?? p.in ?? r, p), rough: (p, r) => rough(p.room ?? p.in ?? r, p),
});

// ---- natural vs built (creator Nov 7: "dungeons that have multiple types of rooms: natural parts, human made parts, diff styles").
// Every room can carry its own kit; these two words say what KIND of space it is and dress the floor to match.
//   natural(room, { style: "cave", rough: true })  rock walls, an uneven floor of low mounds, no straight-line clutter
//   built(room, { style: "crypt" | "masonry" | "mine" | "sewer" | "hall" })  cut walls, level floor, the style's own clutter set
export function natural(roomId, o = {}) { kit(roomId, o.style ?? "cave", { natural: true, ...o }); R(roomId).natural = true; if (o.rough !== false) rough(roomId, { bumps: o.bumps ?? 4, height: o.height ?? 0.45, seed: o.seed }); }
export function built(roomId, o = {}) { kit(roomId, o.style ?? "masonry", { natural: false, ...o }); R(roomId).natural = false; }
HOSTS.natural = (p, r) => natural(p.room ?? p.in ?? r, p); HOSTS.built = (p, r) => built(p.room ?? p.in ?? r, p);
