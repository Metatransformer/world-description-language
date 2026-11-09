// mine kit · Seal
import { h } from "../../lib/react.mjs";

// Seal({ id, what, where, opener, key, key_lives, taught }): a lock described where the dig is barred
export const Seal = ({ id, ...lk }) => h("lock", { key: `seal-${id}`, id, ...lk });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "relation",
  is: "a lock where an existing dig is barred: the gate, door or grate a player must open, with what opens it and where its key lies",
  tags: ["mine", "as-built", "lock", "seal", "gate", "barred", "key"],
  props: { id: "lock id (a link names it with lock=)", what: "what bars the way", where: "room the lock is read from", opener: "what opens it", key: "the key's name", key_lives: "room id holding the key", taught: "where the player learns it", barred: "text while shut", opened: "text when open" },
  footprint: { kind: "none" },
  topology: { under: ["Dig", "Mine"], takes: [], joins: ["Tunnel"], emits: ["lock"] },
  twins: ["plan/Seal", "plan/Barrier", "cave/Locks", "sewer/Grate"],
  pitfalls: ["not common/Barrier: it writes only the lock, no link; the passage is laid elsewhere", "writes only the lock: a link must name it (lock=id) or nothing is barred", "a key_lives behind the seal softlocks", "for a rockfall that writes its own link, CaveIn"],
};

Seal.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
