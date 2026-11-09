// layRooms(plan): metre-scale axis rooms laid against each other instead of at map numbers (the gaol and sewers; any box-room place).
// A row: { id, size: [w, d], northOf | southOf | eastOf | westOf: <earlier id>, gap, shift, ...rest } or { id, at: [x0, z0], size } for the first.
// gap: metres of wall between the two; shift: metres along the shared edge from the anchor's west / north end.
// Inside a row everything is LOCAL to the room's own north-west corner: open N/S spans are x from its west wall, E/W spans z from its north wall;
// pool x0/x1/z0/z1 likewise; chan c / a / b follow the vault's run (vault "z": c across x, a..b along z; vault "x": the reverse).
// North is -z. The result is the absolute { x0, x1, z0, z1 } rows every gaol pass reads.
const R = (v) => Math.round(v * 1000) / 1000;
export function layRooms(plan) {
  const out = new Map();
  for (const p of plan) {
    const { size: [w, d], at, northOf, southOf, eastOf, westOf, gap = 0, shift = 0, open, pool, chan, ...rest } = p;
    const ref = northOf ?? southOf ?? eastOf ?? westOf, a = ref && out.get(ref);
    if (ref && !a) throw new Error(`layRooms: ${p.id} is laid against ${ref}, which is not laid yet`);
    let x0, z0;
    if (at) [x0, z0] = at;
    else if (northOf) { x0 = a.x0 + shift; z0 = a.z0 - gap - d; }
    else if (southOf) { x0 = a.x0 + shift; z0 = a.z1 + gap; }
    else if (eastOf) { x0 = a.x1 + gap; z0 = a.z0 + shift; }
    else if (westOf) { x0 = a.x0 - gap - w; z0 = a.z0 + shift; }
    else throw new Error(`layRooms: ${p.id} needs at or a neighbour`);
    const row = { id: p.id, x0: R(x0), x1: R(x0 + w), z0: R(z0), z1: R(z0 + d), ...rest };
    delete row.id; const r = { id: p.id, ...row };
    if (pool) r.pool = { ...pool, x0: R(pool.x0 + x0), x1: R(pool.x1 + x0), z0: R(pool.z0 + z0), z1: R(pool.z1 + z0) };
    if (chan) { const [c0, l0] = rest.vault === "x" ? [z0, x0] : [x0, z0]; r.chan = { ...chan, c: R(chan.c + c0), a: R(chan.a + l0), b: R(chan.b + l0) }; }
    if (open) { r.open = {}; for (const [s, spans] of Object.entries(open)) { const o = s === "N" || s === "S" ? x0 : z0; r.open[s] = spans.map(([f, t, top]) => [R(f + o), R(t + o), top]); } }
    out.set(p.id, r);
  }
  return [...out.values()];
}
