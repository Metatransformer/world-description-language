// hall kit · CacheNote
import { useHall, row, pos } from "./_shared.mjs";

// CacheNote({ id, at, y, cache, note }): a dark crate with a letter and an inkpot on it; reading it marks a buried cache on the map
export function CacheNote({ id, at, y, cache, note, why }) {
  return row(id, {
    children: [
      { feetPosition: { x: 0, y: 0.5, z: 0 }, material: { color: "oklch(0.86 0.04 85)", roughness: 1 }, primitive: { depth: 0.22, height: 0.01, kind: "box", width: 0.17 }, rotation: { yaw: 14 } },
      { feetPosition: { x: 0.1, y: 0.5, z: -0.08 }, material: { color: "oklch(0.45 0.05 70)", roughness: 0.6 }, primitive: { height: 0.09, kind: "cylinder", radiusBottom: 0.045, radiusTop: 0.05 } }],
    feetPosition: pos(useHall(), at, y), id,
    material: { color: "oklch(0.42 0.04 60)", roughness: 0.9, texture: "cdn/texture-smoke-dark-oak-planks.png" }, physics: "static",
    primitive: { depth: 0.45, height: 0.5, kind: "box", width: 0.45 },
    state: { act: "Read", book: note.text, cache: cache, name: note.name }, tags: ["cache-note", "interactable"],
  }, why);
}

export const meta = {
  layer: "dressing",
  is: "a letter left on a crate that tells you, in paces from a landmark, where something is buried: reading it starts a treasure hunt",
  tags: ["note", "letter", "cache", "treasure", "clue", "buried", "hunt", "interior"],
  props: { id: "row id", at: "[x, z] m", y: "height m (absolute)", cache: "the buried cache's key (data/caches)", note: "{ name, text }", why: "a note" },
  footprint: { kind: "point", height: 0.55 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Lectern"],
  pitfalls: ["cache must name a real cache key or the hunt has no end", "y is absolute"],
};
CacheNote.meta = meta;
