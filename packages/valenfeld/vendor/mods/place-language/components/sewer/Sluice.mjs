// sewer kit · Sluice
import { h } from "../../lib/react.mjs";
import { Barrier } from "../plan/index.mjs";

// Sluice({ id, a, b, side, at, what, barred, opened, taught }): an iron sluice gate, its wheel on b's side only: it lifts from
// b and stays up (the shortcut home once you've gone round)
export const Sluice = ({ b, act = "Wind", name = "the sluice gate", ...p }) => h(Barrier, { b, how: "sluice", key_lives: b, opens_from: b, act, name, ...p });

// card: Sluice: an iron sluice gate whose wheel is on b's side only: it lifts from b and stays up, the shortcut home.
export const meta = {
  "layer": "mechanism",
  "is": "an iron sluice gate wound shut, its wheel on the far side: you lift it once you come round, and it stays open as a shortcut",
  "tags": [
    "sluice",
    "gate",
    "shortcut",
    "one-way",
    "wheel",
    "barrier",
    "sewer",
    "lock"
  ],
  "props": {
    "id": "lock id",
    "a": "room on the near (barred) side",
    "b": "room the wheel is in: the gate opens from here",
    "side": "wall of a",
    "at": "metres along that wall",
    "what": "what the gate is",
    "opener": "what opens it, in words",
    "taught": "how the player learns the wheel is beyond",
    "barred": "line shown when tried from a",
    "opened": "line shown when wound up",
    "act": "verb on the prompt (Wind)",
    "name": "prompt name (the sluice gate)"
  },
  "footprint": {
    "kind": "edge"
  },
  "topology": {
    "under": [
      "Depth",
      "Drains"
    ],
    "takes": [],
    "joins": [
      "Vault",
      "RatHall"
    ],
    "emits": [
      "link",
      "lock"
    ]
  },
  "twins": [
    "plan/Gate",
    "plan/Barrier",
    "cave/OneWayGate",
    "seacave/SeaGate",
    "mine/Seal"
  ],
  "pitfalls": [
    "b must be reachable some other way (a Culvert or a loop) or the player is locked out for good",
    "the wheel lives in b: taught= should say the player can see it is beyond",
    "for a sluice that drains water elsewhere see seacave/SluiceWheel"
  ]
};

Sluice.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
