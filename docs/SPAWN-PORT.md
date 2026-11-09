# Valenfeld Spawn component port

Run from this repository or the enclosing react-godot-demo directory:

```sh
npm run game:spawn
npm run game:spawn:explorer
npm run game:spawn:web
```

Godot requires the .NET edition and a .NET SDK. Set `GODOT_BIN` if automatic discovery cannot find it. Explorer runs at http://127.0.0.1:3000; the playable web demo runs at http://127.0.0.1:5174. Run one Explorer server at a time. The playable demos share the generated output directory; rebuilding another world switches its contents.

`worlds/spawn-demo.tsx` composes eight houses with the original JSX placements, roof choices, shutters, and chimneys. `worlds/spawn/components.tsx` provides reusable House, Storey, Roof, Windows, Chimney, Well, MarketStall, Tavern, DrownedLantern, and TreasureChest components. The town square and its ground are demo staging, not the original terrain.

The original JSX is composition rather than the whole art implementation. Spawn's procedural generators supply detailed triangles, materials, and collision shapes. A local snapshot of six generators and their dependencies lives in `worlds/spawn/vendor`; `capture.ts` translates their geometry context to WDL indexed meshes and separate invisible collision meshes. `provenance.json` records original paths and SHA-256 hashes. Reference JSX snapshots live in `worlds/spawn/reference`.

The original Spawn project is unchanged. To refresh the local snapshot deliberately, run `python scripts/import-spawn.py PATH_TO_SPAWN` (requires PyYAML), then rebuild and review the diff.

Four exported spaces demonstrate portable behavior: the town, Drowned Lantern interior, and newly authored cottage and workshop. See [Valenfeld](VALENFELD.md) for the tour and [integration guide](INTEGRATION.md) for adopting it in a game. Press E at the inn entrance/exit to travel; chests grant one keepsake and retain their collected state. WASD walks, mouse looks, Shift sprints, F5 saves, F9 restores, Escape releases the mouse. Godot and Three implement the same inventory and travel capability contracts. The original Spawn game logic is not converted; these demo interactions are authored in WDL.

Original CDN texture references use deterministic local procedural substitutes. Geometry and material colors are retained, but this is not visual parity with Spawn: original texture maps, emissive lights, flat/smooth shading hints, effects, terrain, NPCs, quests, and multiplayer are outside this port. The simple Three controller stays on one floor and does not support the interior's stairs or cellar traversal; the Godot controller also lacks stair stepping.

Validation: `vitest run tests/spawn.test.tsx` checks deterministic compilation, eight house instances, portable colliders and materials, travel, and persistent single-use chests. After building and importing, Godot's `--headless --path examples/godot-dotnet -- --smoke-spawn` loads all four native scenes and exercises town-to-inn-to-town travel and chest persistence. `--capture` renders a screenshot into `generated/preview.png`.
