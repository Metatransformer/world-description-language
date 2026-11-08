# Portable WDL worlds and Godot .NET demo

## Problem Statement
WDL authors reusable JSX worlds but exports static visuals. Developers need portable world state, dynamic interactions, reusable component imports, and a predictable build workflow without embedding JavaScript in Godot.

## Solution
Compile React-style authoring into engine-neutral geometry, state/action contracts, bindings, and capability requirements. Provide a Godot C#/.NET editor plugin and demo plus a standalone Three.js runtime consuming the same artifacts.

## User Stories
1. As an author, I compose keyed JSX components through props.
2. As an author, I keep internal objects and private state encapsulated.
3. As an author, I connect components through shared state and actions.
4. As a developer, I declare typed state and deterministic reducers without engine code.
5. As a developer, I register typed capabilities implemented by each engine.
6. As a developer, I receive build errors for invalid state, actions, or bindings.
7. As a player, I walk through town, exterior, interiors, and dungeon.
8. As a player, I interact with doors to travel between spaces.
9. As a player, I use a lever to open a blocking gate.
10. As a player, I collect a chest once, including after returning or restoring a save.
11. As a developer, I receive explicit success/failure actions from asynchronous effects.
12. As an author, I opt selected component state into persistence with durable keys.
13. As a game developer, I own snapshot storage and see incompatible saves rejected.
14. As a Godot developer, I import entire spaces and nested components as native scenes.
15. As a Godot developer, I place independent instances without exposing internal IDs.
16. As a developer, I wire public contracts and capabilities once rather than every object.
17. As an author, I run Build Changed, Build All, or optional Watch.
18. As an author, Watch defaults off and unchanged outputs are not rewritten.
19. As an author, failed compilation preserves the last successful output.
20. As an author, dependency changes are detected, including imported JSX.
21. As a developer, I test the same interactions in JavaScript and C#.
22. As an artist, I author textured procedural scenery with WDL as source of truth.
23. As a developer, I use WDL scenes inside a larger engine-owned game.
24. As an author, I inspect documented limits rather than assuming full React runtime support.

## Implementation Decisions
- Existing JSX compiler and glTF exporter remain the geometry pipeline.
- Add a versioned behavior artifact with global stores, component-local scopes, deterministic actions, expressions, bindings, and capability argument schemas.
- State uses typed scalar fields initially; assignments, toggle, arithmetic, and conditional action execution cover the demo.
- Ordinary JSX runs at build time. Runtime expressions and action bindings are explicit serializable descriptions. Arbitrary JS closures do not cross the engine boundary.
- Compiler-generated handles derive from existing keyed component identities. Local references resolve within component scopes. Persistence uses explicit durable keys independent of scene paths.
- Each runtime instance owns a separate state registry and object map. Reusable scene roots expose the contract; generated internals remain WDL-owned.
- Reducers execute synchronously. Effects are asynchronous and dispatch declared completion/failure actions. Pending interactions cannot duplicate inventory grants.
- Engine-neutral capability contracts describe parameter types; implementations are registered and validated before play.
- Godot C# addon supplies editor build controls and native scene generation; walking, rendering, collision, and interaction adapters execute in Godot.
- Standalone Three.js runtime is separate from the authoring workbench and executes the same portable reducer.
- Build changed hashes compiler dependencies and relevant assets; build all forces compilation. Watch is explicitly toggled, off by default. Changed-only writes avoid import churn.
- Use generation staging so compilation/export errors do not replace successful artifacts.
- Persistence snapshots include contract compatibility and instance identity; storage belongs to the game.
- Demo uses original procedural textured materials and no external paid assets.
- Full runtime hot reload is deferred; restart play after rebuilding.
- All implementation stays in the cloned WDL repository, with demo and addon clearly separated for upstream reuse.

## Testing Decisions
Test public JSX-to-artifact and runtime interaction boundaries, using existing compiler Vitest conventions. Exercise a shared behavior sequence in JavaScript and C#: isolated instances, lever/gate, chest effect success/failure, snapshot restore, and invalid contracts. Verify generated Godot scenes with the installed headless .NET engine and exercise the demo visually where possible. Verify incremental builds, unchanged mtimes, and failure preservation. Avoid testing private helpers.

## Out of Scope
Full React runtime semantics; arbitrary TypeScript-to-C# translation; multiplayer; combat; NPC AI; quests; production art tooling; scenery painting UI; live structural replacement during play; automatic save migrations.

## Further Notes
The user approved the design and implementation, specifying Godot C#/.NET. Watch must remain optional to avoid editor reimport interruption. A future painting tool must persist portable WDL-owned data. This is an initial versioned implementation, not a general-purpose engine replacement.

