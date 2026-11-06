import { createDungeonPlan } from "../src/dungeon/plan.js";

export const ashBarrowPlan = createDungeonPlan({
  seed: "ash-covenant-barrow-v1",
  theme: "crypt",
  roomCount: 16,
  levels: 2,
  loopCount: 4,
  corridorWidth: 4,
});

export const sunkenCisternPlan = createDungeonPlan({
  seed: "first-waterwright-cistern-v1",
  theme: "cistern",
  roomCount: 18,
  levels: 2,
  loopCount: 5,
  corridorWidth: 4,
});
