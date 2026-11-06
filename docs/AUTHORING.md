# Authoring WDL

Worlds are ordinary TypeScript/JSX programs compiled into descriptive artifacts. Import the public vocabulary from `src/wdl/index.js`, compose pure components, give referenceable elements explicit keys/IDs, and keep generation deterministic.

```tsx
import { Connection, Mesh, Space, World } from "../src/wdl/index.js";

export default <World key="world" name="Small world" materials={[{ id: "stone", color: "#77736b", roughness: 1 }]}>
  <Space key="outside" name="Outside">
    <Mesh key="gate" name="North Gate" type="gate" position={[0, 2, 0]}
      geometry={{ shape: "box", size: [6, 4, 1] }} material="stone" />
    <Connection key="enter" id="enter-hall" to="hall" arrival={[0, 0, 2]} />
  </Space>
  <Space key="hall" name="Hall">
    <Mesh key="floor" type="floor" geometry={{ shape: "box", size: [10, .2, 12] }} material="stone" />
  </Space>
</World>;
```

Reusable kits are typed functions/components. Pass explicit seeds to scatter logic, expose meaningful properties, and use project-relative references for supporting Markdown/images. `Math.random`, clocks, and network calls are rejected by the project compiler's practical determinism check. This is a local authoring tool, not a hostile-code sandbox.

Run `npm run dev`, edit the files under `worlds/`, and use Recompile or wait for the viewer's source poll. The viewer never writes source. A failed build shows diagnostics and retains the last successful preview.

## Project vocabulary and identity

Export an optional `vocabulary` value from the world entry, with `types` mapping names to Zod schemas and `builtins` listing permitted core types. Compilation validates groups, meshes, and generated instances. `compileWorld(element, registry)` also accepts the registry directly.

Every component invocation needs an explicit React key. WDL scopes identities through component nesting; spaces have globally unique keys. Keys containing `%` or `/` are escaped in manifest IDs. Scatter identities use deterministic candidate keys: adding an exclusion does not renumber surviving samples.

## Extracting reusable architecture

The Valenreach building body is expressed once in `HouseShell`: walls with an opening, roofs, surfaces, entrance exclusions, and clutter. `Building` supplies placement and vocabulary; `District` supplies the town arrangement. To extract another building style, move its JSX into a typed component, retain explicit child keys, and pass dimensions/materials as props. `createValenreach` demonstrates varying the shared wall material, clutter density, tower/courtyard architecture, and an additional linked interior. The workflow verification script makes these edits and checks their artifacts.

The determinism check detects common direct random/clock/network constructs in bundled local source. It is not a proof of purity for arbitrary JavaScript, dependencies, filesystem reads, or aliases. Authored programs remain trusted local code.
