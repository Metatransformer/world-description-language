// mine kit · CaveIn
import { h, Fragment } from "../../lib/react.mjs";

// CaveIn({ a, b, id, name, what, opener, opensWith, barred, opened, taught }): a fall of rock that splits the workings between
// two rooms: a rockfall link barred by a lock row. Its opener text says what breaks it.
export const CaveIn = ({ a, b, id, side, t, opener, ...lk }) => h(Fragment, null,
  h("lock", { key: `lock-${id}`, id, where: a, act: "Dig", ...lk, opener }), h("link", { key: `cavein-${id}`, a, b, how: "rockfall", lock: id, side, t }));

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a cave-in: a fall of rock blocking the way between two workings, until it is dug through or brought down from the far side",
  tags: ["mine", "cave-in", "rockfall", "blocked", "barrier", "lock", "dig"],
  props: { id: "lock id", a: "room on the near side (where the lock is read)", b: "room beyond", name: "the fall's name", what: "what the player sees blocking it", opener: "text saying what breaks it", key: "the thing that opens it", key_lives: "room id where that key lies", opensWith: "item/act that clears it", barred: "text while blocked", opened: "text once open", taught: "where the player learns how", side: "a's wall", t: "fraction along it" },
  footprint: { kind: "edge" },
  topology: { under: ["Mine", "Level"], takes: [], joins: ["Working", "Gallery"], emits: ["lock", "link"] },
  twins: ["cave/Rockfall", "cave/RockfallSeal", "plan/Barrier", "sewer/Sluice"],
  pitfalls: ["same idea as common/Barrier, kept apart on purpose: its lock row comes before its link, the link is keyed cavein-<id> and carries t not at, so folding it would rename and reorder saved rows", "a key_lives behind the cave-in itself softlocks the dungeon", "unlike Seal it writes its own link: don't also link a and b", "id must be unique among locks"],
};

CaveIn.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
