// Local metres: +x east, +z south; the front door faces -z.
// Accept either authored dimensions or the mesh generator's normalized dimensions.
export function shopLayout(p, sign = {}) {
  const hw = p.hw ?? (p.w ?? 8) / 2, hd = p.hd ?? (p.d ?? 6) / 2;
  const style = p.b ?? p.style ?? 'forest';
  const t = p.t ?? (style === 'alpine' ? .6 : style === 'desert' ? .45 : .3);
  const dx = p.dx ?? 0, y = p.y0 ?? 0;
  if (![hw, hd, t, dx, y].every(Number.isFinite) || hw <= t + 1 || hd <= t + 1) throw new RangeError('Shop dimensions leave no usable interior');
  const cz = Math.min(hd * .2, hd - 2), cx0 = -hw + t + .15, cx1 = hw - t - 1;
  const kz = (cz + .3 + hd - t - .45) / 2, kx = Math.max(cx0 + .6, Math.min(cx1 - .6, dx));
  return { cz, cx0, cx1, kz, kx,
    anchors: {
      keeper: { x: kx, y, z: kz },
      counter: { x: (cx0 + cx1) / 2, y, z: cz },
      door: { x: dx, y, z: -hd },
      sign: { x: sign.side ?? Math.min(hw - .5, 2.4), y, z: -(hd + (sign.out ?? 1.8)) }
    }
  };
}

// Shared placement transform; rounding remains the output adapter's decision.
export function placeShopAnchor(anchor, lot) {
  const angle = (lot.yaw ?? 0) * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  return { x: (lot.x ?? 0) + anchor.x * c + anchor.z * s, y: (lot.y ?? 0) + anchor.y, z: (lot.z ?? 0) - anchor.x * s + anchor.z * c };
}
