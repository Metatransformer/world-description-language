# Agent quickstart

Start at the repository root. Read `package.json` for available commands. Install dependencies with `npm ci`; Node's required version is in `engines`. Generated output is ignored by Git and must be built on a fresh clone.

## Run or extend Valenfeld

1. Run `npm run game:spawn:web`. Completion: the served page renders the town; use its Demo tour picker to visit inn, cottage, and workshop. Use the HTTP URL printed by the launcher.
2. Run `npm run game:spawn:explorer` in a second terminal. Completion: Explorer lists four spaces and lets you inspect placed components and their source. Stop an existing Explorer on port 3000 before starting another.
3. Read [the example map](VALENFELD.md). Edit `worlds/spawn-demo.tsx` for composition, `worlds/spawn/components.tsx` for imported architecture, or `worlds/spawn/interiors.tsx` for new interiors. Keep explicit JSX keys and persistent store keys stable across ordinary edits.
4. Run `npm run game:spawn:build` and reload the playable page. Completion: `npm run typecheck` and `npx vitest run tests/spawn.test.tsx` pass; the changed component renders and its interactions work. Explorer recompiles its source independently.

## Integrate a Godot game

Read [INTEGRATION.md](INTEGRATION.md) before copying the adapter. Inspect the target project's Godot/.NET versions, player controller, scene ownership, inventory, and save system. Reuse those systems through capabilities.

Follow its ordered integration steps. Completion: the target game instantiates an exported scene, native input dispatches an interaction, a registered game capability executes, gate state changes collision, and save/restore retains chest state. Record commands actually run and any unavailable native checks. A browser-only check does not verify Godot integration.

## Implement another engine adapter

Read [ARTIFACT-CONTRACT.md](ARTIFACT-CONTRACT.md), then compare `examples/three-runtime/main.ts` and `examples/godot-dotnet/addons/wdl`. Preserve the manifest hierarchy and use `index.json` handles rather than sanitized node names. Implement the behavior version explicitly and validate required capabilities. Completion: the shared parity fixtures pass and the Valenfeld travel/gate/chest flow works in the new engine.

## Change compiler or behavior semantics

Read [GODOT.md](GODOT.md) for state/effect semantics. Compiler source is `src/wdl`; contract validation, JS runtime, and code generation are `src/runtime`; the C# interpreter is `examples/godot-dotnet/addons/wdl/PortableRuntime.cs`. Completion: relevant unit tests, typecheck, and `npm run game:verify` pass; both interpreters agree for added operations. The parity command builds the smaller Alder Vale fixture into the shared output directory: rebuild Valenfeld afterward.

## Ownership and portability

JSX runs at build time. Runtime React hooks and arbitrary JavaScript functions are not portable gameplay. Use declared actions for portable state changes and capability delegates for engine services. Persist using explicit `persistenceKey` and durable component `InstanceId`; generated object handles are not user-facing global IDs. Keep engine scripts on wrappers around generated scenes. Rebuild generated content from source.

The toy browser controller is intentionally small: axis-aligned collisions and one walking plane. Valenfeld's flat cottage/workshop support its interaction tour; the imported inn's stairs/cellar are geometry examples, not a complete traversal implementation. Original Spawn CDN textures use local substitutes. See [port provenance](SPAWN-PORT.md) before describing visual parity.
