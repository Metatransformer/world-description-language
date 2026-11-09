// seacave kit · Prop
import { h } from "../../lib/react.mjs";

// Prop({ id, kind, at, meaning, s, yaw, state }): one street-kit prop (scripts/gen/prop.js) standing as a thing with a fixed id
export const Prop = ({ id, kind, at, meaning, s = 0.7, yaw = 0, state }) => h("place", { kind: "thing", id, at, meaning,
  spec: { template: "templates/kits.js#prop", overrides: { physics: "static", castShadow: true, rotation: { yaw },
    primitive: { kind: "scripted", script: "scripts/gen/prop.js", params: { kind, s } }, ...(state ? { state, tags: state.items ? ["interactable", "container"] : ["interactable"] } : {}) } } });

// meta card (lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "one prop (a barrel, a crate, a cask) standing as a thing with its own fixed id, optionally something a player can interact with",
  tags: ["seacave", "prop", "barrel", "crate", "cask", "thing", "interactable"],
  props: {"id": "fixed id (quests may name it)", "kind": "prop kind (barrel, crate ...: scripts/gen/prop.js)", "at": "spot", "meaning": "why it is here", "s": "scale (0.7)", "yaw": "turn degrees", "state": "state bag: makes it interactable"},
  footprint: { kind: "point" },
  topology: { under: ["In"], takes: [], joins: [], emits: ["prop"] },
  twins: ["sewer/Barrels", "sewer/Crates", "wilds/CampProp", "hall/Container"],
  pitfalls: ["an id used twice writes two things under one id", "it is not a container: for loot use Strongbox", "static physics: keep it off doorways"],
};

Prop.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
