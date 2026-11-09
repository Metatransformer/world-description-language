// sewer kit · Drip
import { h } from "../../lib/react.mjs";

// Drip({ at, clip, gain }): the sound a wet vault makes: one looping bed, spatial
export const Drip = ({ at = (r) => r.center, y = 2, clip = "cdn/sfx-slow-water-drips-echoing-in-a-brick-sewer-loop.mp3", gain = 0.2, reach = 30 }) =>
  h("place", { kind: "thing", at, y, spec: { audio: { clip, gain, loop: true, maxDistance: reach } } });

// card: Drip: the looping spatial sound a wet vault makes.
export const meta = {
  "layer": "dressing",
  "is": "the slow echoing drip of water you hear in a wet brick vault",
  "tags": [
    "drip",
    "sound",
    "ambience",
    "audio",
    "water",
    "sewer",
    "loop"
  ],
  "props": {
    "at": "spot (default the room's centre)",
    "y": "height, metres (2)",
    "clip": "the looping sound file",
    "gain": "volume (0.2)",
    "reach": "metres until silent (30)"
  },
  "footprint": {
    "kind": "point"
  },
  "topology": {
    "under": [
      "In",
      "Vault",
      "Tunnel",
      "Channel",
      "Cistern"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [],
  "pitfalls": [
    "one per room is plenty: stacked beds get loud",
    "it is sound only: visible drips come from Seep or Wet",
    "a reach longer than the room bleeds into the next vault"
  ]
};

Drip.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
