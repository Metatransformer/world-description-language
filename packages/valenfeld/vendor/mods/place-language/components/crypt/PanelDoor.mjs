// crypt kit · PanelDoor
import { h } from "../../lib/react.mjs";
import { Door } from "../masonry/Door.mjs";

export const PANEL = "its own panel (scripts/dungeon-panel.js)";
// PanelDoor({ id, uv, at, note }): an old stone door with no keyhole that swings when you find and press the panel set in the wall beside it
export const PanelDoor = ({ id, uv, at, note }) => h(Door, { id, uv, at, lock: { id, key: PANEL, ...(note ? { note } : {}) } });
export const meta = {
  layer: "relation",
  is: "a sealed stone door with no lock to pick: it opens when you press the hidden panel in the wall by it",
  tags: ["door", "panel", "secret", "hidden", "sprung", "crypt", "lever", "held"],
  props: {
    id: "id of the held door row (and its lock)",
    uv: "[u, v] fraction across its room where the door stands",
    at: "semantic spot instead of uv",
    note: "what the door hides or why it is shut, for the design page",
  },
  footprint: { kind: "edge", cells: [1, 1] },
  topology: { under: ["Vault", "Channel", "Room", "In"], takes: [], joins: ["the room behind it"], emits: ["hold"] },
  twins: ["masonry/Door", "crypt/GraveDoor", "sewer/Grate", "sewer/Sluice"],
  pitfalls: [
    "the door row must exist in the place's hand layer (or a generator): PanelDoor only holds it, it does not build one",
    "the panel's script (scripts/dungeon-panel.js) opens it in play; a door id the script does not know stays shut for good",
  ],
};
PanelDoor.meta = meta;
