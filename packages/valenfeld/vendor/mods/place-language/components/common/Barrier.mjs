// common · Barrier: a way between two rooms shut until something opens it: the barred link and its lock row together
import { h, Fragment } from "../../lib/react.mjs";
// Barrier({ id, a, b, how, side, at, tag, where, ...lock }): link keyed <tag>-<id> from a to b, lock keyed lock-<id> met in where
export const Barrier = ({ id, a, b, how = "gate", side, at, tag = "barrier", where = a, ...lk }) => h(Fragment, null,
  h("link", { key: `${tag}-${id}`, a, b, side, at, how, lock: id }),
  h("lock", { key: `lock-${id}`, id, where, ...lk }));
export const meta = {
  layer: "relation",
  is: "a way between two rooms that is shut until something opens it: a gate, a fall of rock, a sluice, a sea-gate",
  tags: ["barrier", "lock", "gate", "blocked", "barred", "door", "rockfall", "sluice", "common"],
  props: { id: "lock id", a: "room on the near side", b: "room behind it", how: "link kind (gate | rockfall | sluice | sea-gate | seal)", side: "wall of a", at: "cell along it", tag: "the link's id prefix (barrier)", where: "room that sees it shut (a)", what: "what the player sees shut", opener: "what opens it (never key)", key_lives: "room where the opener is", opens_from: "room it opens from", taught: "how the player learns it", barred: "line while shut", opened: "line once open", act: "verb", name: "its name", style: "lock style" },
  footprint: { kind: "edge", cells: [1, 1] },
  topology: { under: ["Plan", "Level"], takes: [], joins: ["Space", "Touchstone"], emits: ["link", "lock"] },
  twins: ["plan/Barrier", "plan/Gate", "plan/Seal", "cave/Rockfall", "cave/OneWayGate", "sewer/Sluice", "seacave/SeaGate"],
  pitfalls: ["it writes its own link: don't also give b a from to a", "it places no opener: put it in key_lives naming this id", "tag is part of the link's identity: changing it renames a saved link", "mine/CaveIn and seacave/Sump are this idea but keep their own row ids and order: folding them would rename saved rows"],
};
Barrier.meta = meta;
