// SHUT DOOR: the shared closed front door for any walk-in building switched to a portal interior (params.closed).
// Fills a doorway gap with an oak plank leaf, two iron straps and a ring pull, set in from the outer face.
// The door object (tags door, interactable, state.link "+int-…") stands outside it and carries you in.
// shutDoor(c, kit, { x0, x1, y0, y1, zOut, s }) draws; shutCollider(box, same) seals the gap.
//   x0..x1, y0..y1: the gap in the wall's local frame; zOut: the outer face's z; s: +1 when outward is +z.
export function shutDoor(c, { BX, paint, flatc, OAK, IR, WOOD, IRONC }, { x0, x1, y0, y1, zOut, s = 1 }) {
  const zf = zOut - s * 0.12, za = Math.min(zf, zf - s * 0.1), zb = Math.max(zf, zf - s * 0.1), w = x1 - x0;
  paint(c, OAK, "oklch(0.5 0.05 50)"); BX(c, x0, y0, za, x1, y1, zb);
  // plank seams
  flatc(c, "oklch(0.22 0.03 45)"); const n = Math.max(2, Math.round(w / 0.3));
  for (let i = 1; i < n; i++) { const x = x0 + (w * i) / n; BX(c, x - 0.012, y0, s > 0 ? zb : za - 0.005, x + 0.012, y1, s > 0 ? zb + 0.005 : za); }
  // iron straps and a ring pull
  paint(c, IR, IRONC ?? "oklch(0.3 0.01 250)"); const zo = s > 0 ? [zb, zb + 0.03] : [za - 0.03, za];
  for (const f of [0.22, 0.75]) { const y = y0 + (y1 - y0) * f; BX(c, x0 + 0.05, y - 0.05, zo[0], x1 - 0.05, y + 0.05, zo[1]); }
  const rx = x0 + w * 0.78, ry = y0 + 1.05; BX(c, rx - 0.07, ry - 0.07, zo[0], rx + 0.07, ry + 0.07, zo[1] + s * 0.02);
}
export function shutCollider(box, { x0, x1, y0, y1, zOut, s = 1 }) { const zf = zOut - s * 0.12; return box(x0, y0, Math.min(zf, zf - s * 0.1), x1, y1, Math.max(zf, zf - s * 0.1)); }
