// Relational room layout, solved at compile (creator Nov 7: "what it means for a room to be on top of another room").
// Say where rooms are relative to each other; the solver finds cells. No coordinates in the program.
//
//   const rects = solve({
//     rooms: { mouth: [6, 5], hall: [10, 8], crypt: [8, 8], well: [4, 4] },          // size in cells [w, d]
//     relations: [
//       ["hall", "northOf", "mouth"],                 // touching, centred on the shared edge
//       ["crypt", "below", "hall"],                   // same footprint column, a storey down (level + 1)
//       ["well", "eastOf", "hall", { gap: 2, align: "start" }],   // gap = a corridor's length; align start | middle | end
//     ],
//     anchor: "mouth",                                // defaults to the first room, at [0, 0]
//   });
//   → { mouth: { rect: [x, z, w, d], level: 1 }, hall: {…}, … }; feed rect/level into room(id, { rect, level }).
//
// Rooms on one level never overlap: a clash slides the newcomer along the shared edge, then outward, until clear.
// Unrelated rooms throw: every room must hang from the anchor by some chain.
const SIDES = {
  northOf: [0, -1], southOf: [0, 1], eastOf: [1, 0], westOf: [-1, 0],
  above: [0, 0, -1], below: [0, 0, 1], beside: null,
};
export function solve({ rooms, relations, anchor }) {
  const ids = Object.keys(rooms); anchor ??= ids[0];
  const out = { [anchor]: { rect: [0, 0, ...rooms[anchor]], level: 1 } };
  const pending = relations.map(([a, rel, b, o = {}]) => ({ a, rel, b, o }));
  for (const r of pending) { if (!(r.rel in SIDES)) throw new Error(`relate: unknown relation "${r.rel}" (${Object.keys(SIDES).join(", ")})`);
    for (const x of [r.a, r.b]) if (!rooms[x]) throw new Error(`relate: no room "${x}"`); }
  let moved = true;
  while (moved) { moved = false;
    for (const r of pending) {
      if (r.done) continue;
      const [fixed, free, flip] = out[r.b] && !out[r.a] ? [r.b, r.a, false] : out[r.a] && !out[r.b] ? [r.a, r.b, true] : [null];
      if (!fixed) { if (out[r.a] && out[r.b]) r.done = true; continue; }
      out[free] = place(out[fixed], rooms[free], r.rel, r.o, flip, out); r.done = moved = true;
    }
  }
  const lost = ids.filter((i) => !out[i]); if (lost.length) throw new Error(`relate: ${lost.join(", ")} hang from nothing; relate them to ${anchor}'s chain`);
  return out;
}
const inv = { northOf: "southOf", southOf: "northOf", eastOf: "westOf", westOf: "eastOf", above: "below", below: "above", beside: "beside" };
// placeNext(anchorRect, size, rel, opts, laid): one room against one already laid, clear of every rect in laid ({ rect, level } rows)
export function placeNext(anchor, size, rel, o = {}, laid = []) { return place(anchor, size, rel, o, false, Object.fromEntries(laid.map((q, i) => [i, q]))); }
function place(f, [w, d], rel, o, flip, out) {
  if (flip) rel = inv[rel];
  const [fx, fz, fw, fd] = f.rect, g = o.gap ?? 0, level = f.level + (rel === "below" ? 1 : rel === "above" ? -1 : 0);
  if (rel === "below" || rel === "above") return { rect: [fx + Math.round((fw - w) / 2), fz + Math.round((fd - d) / 2), w, d], level };
  if (rel === "beside") rel = (o.side ?? "e") === "w" ? "westOf" : "eastOf";
  const [ux, uz] = SIDES[rel], a = o.align ?? "middle";
  const along = (span, s) => (typeof o.shift === "number" ? o.shift : a === "start" ? 0 : a === "end" ? span - s : Math.round((span - s) / 2));   // shift: cells along the shared edge from its west / north end, past align
  let x = ux > 0 ? fx + fw + g : ux < 0 ? fx - g - w : fx + along(fw, w);
  let z = uz > 0 ? fz + fd + g : uz < 0 ? fz - g - d : fz + along(fd, d);
  // clear of every room already on this level: slide along the edge (±1, ±2 …), then step outward
  const clash = (x, z) => Object.values(out).some((q) => q.level === level && x < q.rect[0] + q.rect[2] && x + w > q.rect[0] && z < q.rect[1] + q.rect[3] && z + d > q.rect[1]);
  for (let out_ = 0; out_ < 40 && clash(x, z); out_++) {
    let ok = false;
    for (let s = 1; s <= 12 && !ok; s++) for (const k of [s, -s]) { const nx = ux ? x : x + k, nz = uz ? z : z + k; if (!clash(nx, nz)) { x = nx; z = nz; ok = true; break; } }
    if (!ok) { x += ux; z += uz; }
  }
  return { rect: [x, z, w, d], level };
}
