# Build a dungeon with WDL

A dungeon is a reusable program that produces both a navigable layout and its physical architecture. The demo keeps the town and interiors, and replaces its small dungeon sketches with two larger places: Ash Barrow and the Sunken Cistern.

## Change the demo

Edit `worlds/dungeons.tsx`. Each exported plan calls `createDungeonPlan` from `src/dungeon/plan.ts`. The workbench watches these modules and `src/dungeon/` for changes.

| Option | Meaning |
| --- | --- |
| `seed` | A string identifying a repeatable layout and furnishing sequence. |
| `theme` | `crypt` or `cistern`; determines architectural materials and room purposes. |
| `roomCount` | The number of rooms, from 8 to 24. |
| `levels` | One or two elevations, joined by stairs when necessary. |
| `loopCount` | Extra graph connections that create alternative routes. Impossible requests fail validation. |
| `corridorWidth` | Clear passage width in meters; defaults to 4. |

Change the seed to explore another layout. Keep it fixed while tuning the architecture. Every edit belongs in source; the manifest and exported scenes are generated outputs.

## Compose your own space

```tsx
import { World } from "../src/wdl/index.js";
import { DungeonSpace } from "../src/dungeon/components.js";
import { dungeonMaterials } from "../src/dungeon/kits.js";
import { createDungeonPlan } from "../src/dungeon/plan.js";

const plan = createDungeonPlan({
  seed: "under-the-old-market",
  theme: "cistern",
  roomCount: 18,
  levels: 2,
  loopCount: 2,
});

// In a world containing an "outside" space:
// <World name="My world" materials={dungeonMaterials}>
//   ...outside space...
//   <DungeonSpace key="market-cellars" id="market-cellars"
//     name="Market Cellars" plan={plan} returnArrival={[0, 2, 0]} />
// </World>
```

`DungeonSpace` includes a return connection to `outside`. Add a connection from your overworld to the new space using the ordinary WDL `Connection` component. The entry room is centered at the origin, with an arrival position of `[0, 2, 4]`.

## Plan first, geometry second

The serializable plan records rooms, roles, positions, sizes, doors, corridor endpoints and paths, stairs, entry, goal, and a critical path. `validateDungeonPlan(plan)` checks the layout before it becomes geometry. A connected graph alone is insufficient: door openings must align with passages, rooms must not overlap, and stairs must bridge elevation changes.

The generator uses a grid to make physical adjacency predictable. It builds a connected layout, adds alternative routes, assigns room purposes, and emits geometry from that same plan. Two levels are spatial wings at different elevations, not overlapping storeys. The demo is intended for free-flight inspection; it does not implement player collision or pathfinding.

The crypt kit expresses a burial complex through stonework, tomb furnishings, niches, and a ritual destination. The cistern kit expresses water infrastructure through channels, maintenance spaces, pipes, and a machinery destination. Shared room, wall, passage, and furnishing functions keep those differences reusable.

## Inspect and extend

In a dungeon, use the floorplan to select rooms, inspect their metadata and source, and move the camera. Use Overview for the whole layout and Explore room for a view inside. Cutaway hides ceilings in the browser only; exports retain them.

Useful extension points:

- `src/dungeon/plan.ts`: layout and validation rules.
- `src/dungeon/types.ts`: the data contract for plans.
- `src/dungeon/components.tsx`: JSX room, corridor, stair, and furnishing geometry.
- `src/dungeon/kits.ts`: themed material definitions.
- `worlds/dungeons.tsx`: the two authored demo configurations.

Keep authored keys stable. Add geometry through reusable components, and keep the central travel lanes and door sockets clear. Describe game-specific meanings with types and properties; a consuming game can implement encounters, locked doors, loot, or triggers against that contract.

## Verify a change

```bash
npx vitest run tests/dungeon.test.tsx
npm run typecheck
npm run compile
```

The generator tests cover multiple seeds and the compiled world boundary. Inspect both themes in the browser as well: graph checks cannot establish that a room is memorable or that a route is visually clear. Exported glTF scenes can be imported into Blender using the instructions in the repository README.
