# Valenfeld component library

214 build-time JSX components from Valenfeld's procedural geometry library, with three supporting generator modules and their dependency graph. Includes architecture, trees, plants, rocks, furnishings, props, vessels, dungeon pieces, and creatures in a static pose. `catalog.json` lists every generated component and source file. The original Place Language composition modules are included under `vendor/content/place-program/components` for reference; their Spawn-specific host rows, contexts, and game systems are not directly executable as Studio JSX.

```tsx
import { World, Space } from "@generative-world-studio/core";
import { SpawnPalette, House, Pine, Well } from "@generative-world-studio/valenfeld";

export default function Example() {
  const palette = new SpawnPalette();
  return <World key="world" name="A reusable village" materials={palette.materials}>
    <Space key="village" name="Village">
      <House key="home" palette={palette} at={[0, 0, 0]} params={{ w: 7, d: 6 }} />
      <Pine key="pine" palette={palette} at={[12, 0, 0]} seed={24} />
      <Well key="well" palette={palette} at={[5, 0, 8]} />
    </Space>
  </World>;
}
```

Every generated component accepts `palette`, `at`, `rotation` (radians), `scale`, `seed`, and `params`. Read its generator's header for parameter options. Most have a visible default; Clutter, CurtainWall, DungeonKit, MarshEdge, Merged, Pieces, Prop, and Settlement require authored content parameters and may emit no geometry when those are omitted. `ComposedHouse` additionally supports Storey/Roof/Windows/Chimney JSX children. `TreasureChest` provides portable inventory interaction; the generic `Chest` is geometry only.

Register this installed package in `generative-world-studio.json`:

```json
{ "libraries": ["@generative-world-studio/valenfeld"] }
```

Studio then bundles its TypeScript source, tracks imported dependencies, and indexes its exported component definitions even if no instances are placed. Imports remain explicit: a package cannot silently replace another library's House.

## Port fidelity

`Woodland` and `Village` are Studio-native compositions over these pieces. They demonstrate biome and architecture kits with stable instance keys, seeded variants, and layout props; compose portals and gameplay alongside them. They do not attempt to reproduce Spawn's original runtime host-row assembly system.

Geometry, basic material colors, and supplied collision proxies are adapted at build time. CDN texture references use local procedural substitutes. Noise is deterministic but differs from Spawn; terrain sampling uses a flat plane. Skeletal weights/animations, UV atlases, emissive lighting, smooth/flat shading hints, effects, NPC behaviors, and engine state are not imported. Creature components are static geometry. Cylinder proxies use the maximum radius; capsules use a cylinder with spherical ends. The copied toll-hut generator has a reproducible correction to its malformed triangle-list call. `provenance.json` hashes the original inputs before conversion. Original Spawn files are unchanged.

## Distribution

This package is bundled as an npm workspace and has not been published to the npm registry. Use `npm pack --workspace @generative-world-studio/valenfeld`, then install its tarball together with the core package. Review `npm pack --dry-run` before publishing under a scope you control. Publishing the component package does not publish your game world or call Spawn services.
