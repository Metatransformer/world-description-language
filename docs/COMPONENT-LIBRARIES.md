# Reuse and publish component libraries

Tell your agent: **“Read docs/COMPONENT-LIBRARIES.md. Use the bundled Valenfeld kit to build a scene, and package my reusable components using the same npm contract.”**

Generative World Studio separates the authoring vocabulary (`packages/core`) from the Valenfeld library (`packages/valenfeld`). Both are ordinary npm workspaces. They can move to separate repositories without changing their import names or public exports. Start with this package boundary; separate release schedules are a reason to split repositories later.

## Use the bundled kit

`npm ci` links the bundled packages. The Valenfeld example imports `Pine` and `Boulder` from `@generative-world-studio/valenfeld`. Open Components in Explorer to find all 214 generated visual components, including unused ones. Read the package README and `catalog.json` for examples, source locations, required content parameters, and portability limits.

Libraries are globally discoverable in the Studio workspace, while JSX imports remain explicit. Use aliases such as `import { House as TimberHouse } from "my-kit"` when two kits export the same name. Props compose architecture; higher-level components compose districts and biomes. Portable actions and capabilities remain separate from engine-specific gameplay.

## Install a community kit

Install its npm package or a local tarball using normal npm commands, then add its package name to the `libraries` array in `generative-world-studio.json`. Packages are trusted build-time code; install libraries whose code you intend to execute.

The two bundled `@generative-world-studio/*` names are not yet published registry packages. To try distribution locally:

```sh
npm pack --workspace @generative-world-studio/core
npm pack --workspace @generative-world-studio/valenfeld
# In a consumer project, install both resulting .tgz files plus React.
npm install /path/to/generative-world-studio-core-0.1.0.tgz /path/to/generative-world-studio-valenfeld-0.1.0.tgz react
```

## Create your own kit

Export keyed JSX functions from a TypeScript entry point. Import authoring primitives and state helpers from the core package. Use explicit seeds, accept layout/material/behavior props, and keep persistent state scoped to component instances.

Example package metadata:

```json
{
  "name": "@your-scope/architecture-kit",
  "version": "0.1.0",
  "type": "module",
  "license": "MIT",
  "exports": { ".": "./src/index.ts" },
  "files": ["src", "README.md", "LICENSE"],
  "peerDependencies": {
    "react": "^19.0.0",
    "@generative-world-studio/core": "^0.1.0"
  },
  "generativeWorldStudio": {
    "version": 1,
    "entry": "./src/index.ts",
    "sources": ["src"]
  }
}
```

The metadata entry is bundled by Studio instead of being left as an external runtime import. `sources` identifies directories for component discovery and source inspection. Explicit declarations such as `export function Cottage(...)` are indexed; re-export the component from the package entry. Include any assets/data imported by those sources in `files`. Keep peer dependencies compatible with the consuming world.

## Validate and release

Compile a world importing the package by its public npm name, check deterministic output, and run representative geometry/state checks. Then use `npm pack --dry-run` to inspect exactly what will be distributed, install the actual tarball into a clean consumer, and compile again. This catches accidental imports back into the original monorepo.

Use `npm publish --access public` under a scope you control when you are ready to release; this is a deliberate publishing step, not part of a world build. Include a license, version changes, required capability contracts, texture/asset rights, and compatibility notes. Studio currently provides installed-package discovery, not a hosted marketplace or package moderation service.

For the Valenfeld snapshot, `scripts/import-spawn.py` copies the dependency graph and records original source hashes. The full original composition vocabulary is retained as source reference; the portable exports are the 214 visual generators plus the authored Studio components. Spawn's host-row assembly language and its runtime gameplay are not automatically converted.
