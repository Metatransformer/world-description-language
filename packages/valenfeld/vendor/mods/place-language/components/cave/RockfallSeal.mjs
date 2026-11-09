// cave kit · RockfallSeal
import { h, Fragment } from "../../lib/react.mjs";

// RockfallSeal({ lock, at, draftAt }): the fallen rock standing in a doorway, and the cold draft through its cracks that says a way lies past it
export const RockfallSeal = ({ lock, at, draftAt, meaning = "the sealed way: the lock", draft = "the draft: air moves, so there is a way through" }) => h(Fragment, null,
  h("place", { kind: "rockfall", at, meaning, lock }), draftAt && h("place", { kind: "draft", at: draftAt, meaning: draft }));

export const meta = {
  layer: "dressing",
  is: "the fallen rock standing in a sealed doorway and a cold draft through its cracks telling the player a way lies past it",
  tags: ["rockfall", "seal", "draft", "clue", "cave", "blocked"],
  props: { lock: "the lock id it stands for", at: "where the rock stands (the doorway)", draftAt: "where the draft is felt (omit for none)", meaning: "what the rock means", draft: "what the draft means" },
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: ["Rockfall"], emits: ["place"] },
  twins: [],
  pitfalls: ["not common/Barrier: it places the fallen-rock rows that dress a seal, it writes no link or lock", "it is only the look: the barred way is a Rockfall (or Barrier) with the same lock id", "at off the doorway leaves the rock in the middle of the room"],
};

RockfallSeal.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
