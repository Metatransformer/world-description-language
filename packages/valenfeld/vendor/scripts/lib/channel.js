// The sunken channel: a floor split by a drain cut into it. One definition for the gaol's drains and the dungeon kit's.
// The room's floor is two slabs either side of the cut; the cut has a bed below the floor; where the channel stops
// short of the room's ends (a..b along it) the floor is filled in over the bed so you can walk past its end.
//   along: true = the channel runs along z.  c, w: its centre and width on the cross axis.  a, b: where it runs along.
//   top: the floor's top.  slab: floor thickness.  bedTop, bedBot: the bed's top and bottom.  paintBed(): material for the bed.
//   bedFull: false lays the bed only from a to b (the gaol's east-west drains; under solid floor it is never seen).
export function channelFloor(B, { along, x0, x1, z0, z1, c, w, a, b, top, slab, bedTop, bedBot, paintBed, paintFloor, bedFull = true }) {
  const lo = c - w / 2, hi = c + w / 2, L0 = along ? z0 : x0, L1 = along ? z1 : x1;
  a ??= L0; b ??= L1;
  const box = (u0, y0, l0, u1, y1, l1) => { if (u1 - u0 < 0.001 || l1 - l0 < 0.001 || y1 - y0 < 0.001) return; along ? B(u0, y0, l0, u1, y1, l1) : B(l0, y0, u0, l1, y1, u1); };
  const U0 = along ? x0 : z0, U1 = along ? x1 : z1;
  box(U0, top - slab, L0, lo, top, L1); box(hi, top - slab, L0, U1, top, L1);   // the floor either side
  paintBed && paintBed();
  bedFull ? box(lo, bedBot, L0, hi, bedTop, L1) : box(lo, bedBot, a, hi, bedTop, b);   // the bed: the whole length, or only where water runs (bedFull false)
  paintFloor && paintFloor();
  box(lo, bedTop, L0, hi, top, a); box(lo, bedTop, b, hi, top, L1);              // walkable over the bed past its ends
}
