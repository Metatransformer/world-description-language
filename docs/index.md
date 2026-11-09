# Generative World Studio

Build game worlds as reusable JSX components. Compile geometry, materials, scenes, and portable state; connect them to your game's native systems.

[Play Valenfeld in your browser](https://metatransformer.github.io/world-description-language/demo/) — town, interiors, and Founders' Barrow. Desktop keyboard and mouse recommended; no installation needed.

## Tell your agent

> Read AGENTS.md and docs/AGENT-QUICKSTART.md in this repo. Run the Valenfeld example in the browser, then integrate its exported scenes and behavior contract into my Godot .NET game. Keep my player controller and inventory, implement the required capabilities, and verify travel, a gate, and save/restore.

For a first look:

> Read docs/AGENT-QUICKSTART.md and launch Valenfeld in the toy browser engine and the Explorer. Show me where to edit a house component and its interiors.

[Agent quickstart](AGENT-QUICKSTART.md) · [Explore Valenfeld](VALENFELD.md) · [Integrate Godot](INTEGRATION.md)

## One world, several consumers

| Part | Responsibility |
| --- | --- |
| JSX component library | Layout, geometry, materials, compile-time props, keys |
| Portable behavior | Scalar state, actions, visibility/collision bindings, capability requests |
| Browser toy engine | Walking, interaction, inventory demo, save storage |
| Godot .NET adapter | Native scenes, collision, C# state interpreter, game capability delegates |
| Explorer | Inspect components and authored data; it is not the playable engine |

The Valenfeld example includes a town, three interiors, and a dungeon. Its architectural components come from a procedural game project; the cottage and workshop interiors demonstrate extending that library in JSX. It runs locally without an account or external asset service.

Generative World Studio was previously called WDL. Existing `wdl` source paths, artifact fields, namespaces, commands, and repository URL remain compatible. Compilation is deterministic; it does not invoke a generative model. An agent authors the program, then the compiler builds it.

## Reference

- [Component packages](COMPONENT-LIBRARIES.md): bundled Valenfeld components, npm imports, and publishing your own kits.

- [Authoring](AUTHORING.md): components, materials, keys, and procedural placement.
- [Godot runtime reference](GODOT.md): build control, persistence, limitations, and verification.
- [Artifact contract](ARTIFACT-CONTRACT.md): the boundary for engine adapters.
- [Dungeon generation](DUNGEONS.md): reusable room and corridor generation.
- [Port provenance](SPAWN-PORT.md): what came from Spawn and what was substituted.

Docs are ordinary Markdown in the repository, rendered with [VitePress](https://vitepress.dev/guide/getting-started). Agents can read the files directly. The built site also serves `/llms.txt`, `/llms-full.txt`, and `/markdown/` copies generated from the same files; these are discovery aids, not a separate specification.
