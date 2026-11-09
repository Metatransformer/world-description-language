// crypt kit · Tablet
import { h } from "../../lib/react.mjs";

// Tablet({ wall, where, off, name, lore, meaning }): words cut or scratched into a wall that you stop and read: the room's clue
export const Tablet = ({ wall = "e", where = "middle", off = 0.8, ...said }) => h("place", { kind: "journal", at: (r) => r.wall(wall, where, off), ...said });

export const meta = {
  layer: "meaning",
  is: "writing on the wall (a warden's carved tablet, a thief's scratched tally) that tells you what happened here and what to do",
  tags: ["tablet", "journal", "lore", "clue", "writing", "inscription", "tally", "story", "read"],
  props: {
    wall: "which wall it is cut into (n s e w; e)",
    where: "where along that wall (middle, quarter, three-quarters, end)",
    off: "how far out from the wall it stands, metres (0.8)",
    name: "what the reader sees it called",
    lore: "the words on it",
    meaning: "why it is here, for the design page",
  },
  footprint: { kind: "point" },
  topology: { under: ["In", "Burial", "Vault"], takes: [], joins: [], emits: ["prop"] },
  twins: ["cave/Camp", "hall/Book", "wilds/Sign"],
  pitfalls: [
    "a tablet on a wall with a door in its middle lands in the doorway: pick another wall or where",
    "the clue must be readable before the lock it explains is met, or the player never needs it",
  ],
};
Tablet.meta = meta;
