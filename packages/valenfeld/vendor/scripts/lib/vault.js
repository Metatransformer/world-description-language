// The barrel vault, one definition for every place that roofs a room with one.
// Learned from two hand builds that drew it separately: the gaol's half-ellipse brick vault (scripts/gen/gaol.js)
// and the dungeon kit's segmental vault with ribs (scripts/gen/dungeon-kit.js, 16 dungeons).
// A vault is: an ARC across the span (a profile), swept along the room's length, closed or open at its ends.
//   along: true = the vault runs along z (the arc crosses x); false = it runs along x.
//   mid, half: the span's centre and half-width on the cross axis.  spring: the y the arc springs from.
//   profile "ellipse": a half-ellipse, rise = half * k (k default 0.75).  profile "segmental": a circle segment of the given rise.
//   n: segments in the arc.  inset: a radius factor (a rib's soffit sits at 0.97).

export function vaultArc({ profile = "ellipse", mid, half, spring, rise, k = 0.75, n, inset = 1 }) {
  const pts = [];
  if (profile === "ellipse") {
    for (let i = 0; i <= n; i++) { const t = Math.PI * i / n; pts.push([mid - Math.cos(t) * half, spring + Math.sin(t) * half * k]); }
  } else {
    const Rr = (half * half + rise * rise) / (2 * rise), yc = spring + rise - Rr, A = Math.asin(half / Rr), s = Rr * inset;
    for (let i = 0; i <= n; i++) { const t = -A + 2 * A * i / n; pts.push([mid + s * Math.sin(t), yc + s * Math.cos(t)]); }
  }
  return pts;
}
const at = (along, [u, y], l) => (along ? [u, y, l] : [l, y, u]);

// the shell: the arc swept from l0 to l1; quad(a, b, c, d, ...extra) is the caller's kit quad
export function vaultShell(quad, along, arc, l0, l1, ...extra) {
  for (let i = 0; i < arc.length - 1; i++) quad(...wrap(at(along, arc[i], l0), at(along, arc[i + 1], l0), at(along, arc[i + 1], l1), at(along, arc[i], l1), extra));
}
// an end closed by a fan from the springing line's centre (a lunette)
export function vaultEnd(quad, along, arc, l, centre, ...extra) {
  const c = at(along, centre, l);
  for (let i = 0; i < arc.length - 1; i++) quad(...wrap(c, at(along, arc[i], l), at(along, arc[i + 1], l), c, extra));
}
// ribs: a band of the vault at each bay line, with its soffit face hanging under it
export function vaultRibs(quad, along, arc, soffit, lines, width, ...extra) {
  for (const q of lines) for (let i = 0; i < arc.length - 1; i++) {
    quad(...wrap(at(along, arc[i], q - width), at(along, arc[i + 1], q - width), at(along, arc[i + 1], q + width), at(along, arc[i], q + width), extra));
    quad(...wrap(at(along, soffit[i], q - width), at(along, soffit[i + 1], q - width), at(along, soffit[i + 1], q + width), at(along, soffit[i], q + width), extra));
  }
}
// a flat-arg quad (ctx.quad) takes 12 numbers; an array-arg quad (kit K.quad) takes 4 points + extras
const wrap = (a, b, c, d, extra) => (extra.length && extra[0] === FLAT ? [...a, ...b, ...c, ...d] : [a, b, c, d, ...extra]);
export const FLAT = Symbol("flat");
