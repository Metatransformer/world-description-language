// hall kit · Lectern
import { useHall, row, pos } from "./_shared.mjs";

const OAK = { color: "oklch(0.5 0.04 60)", roughness: 0.9, texture: "cdn/texture-smoke-dark-oak-planks.png" };
// Lectern({ id, at, y, yaw, cover, book, tags }): an oak stand with a book open on its slope; E reads it (Read, then Take or Leave)
export function Lectern({ id, at, y, yaw = 200, cover = "oklch(0.4 0.09 30)", rough = 0.8, size = [0.26, 0.06, 0.34], book, bookYaw, tags = ["act1-book", "interactable"], why }) {
  const slope = bookYaw == null ? { pitch: -25 } : { pitch: -25, yaw: bookYaw };
  return row(id, {
    castShadow: true,
    children: [
      { feetPosition: { x: 0, y: 0.05, z: 0 }, material: OAK, primitive: { depth: 0.12, height: 0.9, kind: "box", width: 0.12 } },
      { feetPosition: { x: 0, y: 0.95, z: 0 }, material: OAK, primitive: { depth: 0.38, height: 0.05, kind: "box", width: 0.46 }, rotation: { pitch: -25 } },
      { feetPosition: { x: 0, y: 1.06, z: 0 }, id: "book", material: { color: cover, roughness: rough }, primitive: { depth: size[2], height: size[1], kind: "box", width: size[0] }, rotation: slope,
        state: { act: "Read", book: book.text, name: book.name }, tags: ["interactable"] }],
    feetPosition: pos(useHall(), at, y), id, material: OAK, physics: "static",
    primitive: { depth: 0.36, height: 0.05, kind: "box", width: 0.36 }, rotation: { yaw }, tags,
  }, why);
}

export const meta = {
  layer: "dressing",
  is: "a reading stand with one book open on it: the room's lore, read with E (Read, then Take or Leave)",
  tags: ["lectern", "book", "lore", "reading", "stand", "library", "journal", "interior"],
  props: { id: "row id", at: "[x, z] m", y: "height m (absolute)", yaw: "facing degrees (default 200)", cover: "book cover colour", rough: "cover roughness", book: "{ name, text }", size: "the book [width, thickness, length] m (default a full tome 0.26×0.06×0.34)", bookYaw: "the book's own yaw on the slope, if any", tags: "row tags (default act1-book, interactable)", why: "a note" },
  footprint: { kind: "point", height: 1.1 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/CacheNote", "hall/Container"],
  pitfalls: ["the book child keeps id 'book': the reader looks for it", "y is absolute like Lamp"],
};
Lectern.meta = meta;
