// plan kit · Way
import { h, useContext } from "../../lib/react.mjs";
import { WanderContext } from "../../lib/wander.mjs";

// Way({ from, to, how, side, at, bat, oneway, lock, secret }): the link row a Space writes right after itself, so links keep the plan's reading order.
// wander: { amount, seed } | false: a natural way (lib/wander.mjs); an organic Flex/Grid above hands one down by WanderContext.
export const Way = ({ from, to, how = "tunnel", side, at, bat, oneway, lock, secret, wander, shape }) => {
  if (!from) return null;
  const w0 = wander === false ? null : wander ?? useContext(WanderContext);
  const w = shape ? { amount: 0.8, seed: 1, ...(w0 ?? {}), shape } : w0;   // a passage kit component names its shape
  return h("link", { key: `way-${from}-${to}`, a: from, b: to, side, at, ...(bat != null ? { bat } : {}), how, ...(oneway ? { oneway } : {}), ...(lock ? { lock } : {}), ...(secret ? { secret } : {}), ...(w ? { wander: w } : {}) });
};

export const meta = {
  "layer": "relation",
  "is": "the way into a room from the one before it: a tunnel, arch, stair or door written right where the room is",
  "tags": [
    "link",
    "way",
    "door",
    "tunnel",
    "connection",
    "corridor"
  ],
  "props": {
    "from": "room the way comes from (no from = writes nothing)",
    "to": "room it leads into",
    "how": "tunnel (default) arch stair door crawl ramp gate",
    "side": "wall of `from` it leaves by",
    "at": "cell along that wall",
    "bat": "cell along to's wall",
    "oneway": "only from → to",
    "lock": "lock id barring it",
    "secret": "a hidden way",
    "shape": "meander switchback fissure gallery choke squiggle: the passage's shape (lib/wander.mjs SHAPES); the passage kit names one per component",
    "wander": "{ amount, seed } or false: a natural way that meanders (2–4 bends on the grid, rough walls, alcoves); an organic Flex/Grid sets it for every way under it"
  },
  "footprint": {
    "kind": "edge",
    "cells": [
      1,
      1
    ]
  },
  "topology": {
    "under": [
      "Space"
    ],
    "takes": [],
    "joins": [
      "Space"
    ],
    "emits": [
      "link"
    ]
  },
  "twins": [
    "mine/Tunnel",
    "sewer/Junction"
  ],
  "pitfalls": [
    "an internal piece: use Space's from/how or a Passage instead of writing Way by hand",
    "from omitted writes nothing, silently"
  ]
};

Way.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
