// things kit · sign boards: the words on a signpost's arrow boards, one shape for every signpost in the world
// (creator: "dont repeat yourself"). A board is { word, x, y, size?, id? }; a look names the lettering: its plank's
// viewBox, its printed width, baseline, ink, weight. faces "both" letters the back too (ids <id>-front / <id>-back).
export const BOARD_LOOKS = {
  kingsway: { view: [160, 30], width: 1.4, base: 21, size: 16, fill: "#2a1d12", z: 0.03 },          // the Kingsway's painted boards
  fields:   { view: [140, 30], width: 1.3, base: 21, size: 17, fill: "#2a1d12", z: 0.03 },          // farm-track boards east of town
  carved:   { view: [130, 26], width: 1.15, base: 19, size: 17, fill: "#2a1f14", bold: true, spacing: 1, z: 0.032, faces: "both" }, // wildwood posts, cut capitals, read from both sides
};
export function boardSvg(word, look) {
  const L = typeof look === "string" ? BOARD_LOOKS[look] : look, [w, hh] = L.view;
  return `<svg viewBox='0 0 ${w} ${hh}' width='${L.width}m'><text x='${w / 2}' y='${L.base}' text-anchor='middle' font-family='serif' font-size='${L.sizeOf ?? L.size}'${L.bold ? " font-weight='bold'" : ""} fill='${L.fill}'${L.spacing ? ` letter-spacing='${L.spacing}'` : ""}>${word}</text></svg>`;
}
// signBoards(boards, look): the vector rows that ride the post, in the post's own metres
export function signBoards(boards, look = "kingsway") {
  const L = BOARD_LOOKS[look] ?? look, out = [];
  for (const b of boards) {
    const svg = boardSvg(b.word, { ...L, sizeOf: b.size ?? L.size });
    if (L.faces === "both") {
      out.push({ feetPosition: { x: b.x, y: b.y, z: -L.z }, id: `${b.id}-front`, rotation: { yaw: 0 }, vector: svg });
      out.push({ feetPosition: { x: b.x, y: b.y, z: L.z }, id: `${b.id}-back`, rotation: { yaw: 180 }, vector: svg });
    } else out.push({ feetPosition: { x: b.x, y: b.y, z: L.z }, vector: svg });
  }
  return out;
}
