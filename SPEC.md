# Build WDL: a JSX world compiler with a browsable fantasy-region demo

## Problem Statement

AI can help implement game systems, but constructing a substantial, coherent game world remains difficult. A world contains nested places, architecture, terrain, interiors, props, placement rules, and connections. Authors need a way to describe these together, reuse their decisions, inspect what was generated, and deliver the result to a game without tying world authoring to one engine.

Nick wants to test whether a fantasy region approaching the structural complexity of Balmora and its surroundings can be expressed as a composable program. A small collection of primitive placements would not prove this. The demonstration must exercise deep composition, reusable kits, procedural placement, separate spaces, and references across the world. Attractive finished art and accurate recreation of Morrowind are unnecessary.

## Solution

Build World Description Language (WDL): TypeScript/JSX world programs using React-style components, props, children, explicit keys, and reusable abstractions. Compile those programs into engine-independent world data and scene assets.

Provide a local browser editor/viewer using Three.js. Authors can fly through the region, search for places and objects, select them, inspect their properties and defining WDL, and follow connections into separate interiors and dungeons. All world edits occur in source and require compilation. Source changes refresh the preview; failed compilation preserves the last successful world.

Provide an MCP server that connects the editor/compiler to the author's existing Codex. Codex edits project files using its existing tools and uses MCP to compile, inspect, navigate, and capture the world. Compilation itself never calls an LLM.

Demonstrate export by importing generated scenes into Blender. The same compiled world contract drives both browser preview and export. The accompanying manifest preserves world relationships and game-facing meaning that a scene format cannot express.

## User Stories

1. As a world author, I want to write worlds in TypeScript and JSX, so that I can use familiar code tools and composition patterns.
2. As a world author, I want components with typed props and children, so that I can express reusable world pieces with clear interfaces.
3. As a world author, I want deeply nested composition, so that regions, districts, buildings, rooms, and details can each have their own abstractions.
4. As a world author, I want to define project-specific object vocabularies and schemas, so that the world reflects my game's concepts.
5. As a project owner, I want to constrain the vocabulary and functions available to authoring agents, so that generated source follows project conventions.
6. As a world author, I want reusable architecture kits, so that related structures share a coherent style while allowing deliberate variations.
7. As a world author, I want reusable texture and material kits, so that surface appearance can be shared and changed centrally.
8. As a world author, I want reusable terrain kits, so that landscape shape, surfaces, and vegetation rules can be composed.
9. As a world author, I want reusable placement algorithms, so that scattering barrels, boxes, and vegetation does not require hand-authoring every instance.
10. As a world author, I want explicitly seeded generation, so that unchanged inputs reproduce the same world.
11. As a world author, I want placement to consume anchors, surfaces, boundaries, and exclusions, so that generated objects respect the surrounding environment.
12. As a world author, I want clutter placement to avoid doorways and vegetation placement to avoid roads, so that procedural detail preserves authored spatial intent.
13. As a world author, I want geometry for terrain, water, roads, buildings, and dungeon passages, so that the demo represents a recognizable region.
14. As a world author, I want reusable asset references, so that authored or imported assets can participate in the same language.
15. As a world author, I want separate coordinate spaces for interiors and dungeons, so that those places can be authored independently of exterior dimensions.
16. As a world author, I want explicit connections with destination spaces and arrival positions, so that the world remains navigable across spaces.
17. As a world author, I want stable identities for referenceable objects, so that unrelated edits do not silently redirect links.
18. As a world author, I want duplicate identities and dangling references reported as errors, so that invalid worlds cannot masquerade as successful builds.
19. As a world author, I want to fly through the compiled world in a browser, so that I can evaluate scale and composition.
20. As a world author, I want to search named places and objects, so that I can navigate a complex region without manually flying everywhere.
21. As a world author, I want to select an object and inspect its type, properties, and relationships, so that I can understand the compiled world.
22. As a world author, I want to follow a selected object's source provenance, so that I can find the JSX invocation or generator responsible for it.
23. As a world author, I want generator parameters available during inspection, so that I can understand why an instance exists.
24. As a world author, I want to click connections into interiors and back outside, so that I can review the region as linked places.
25. As a world author, I want source changes to trigger compilation and preview refresh, so that I can iterate quickly.
26. As a world author, I want camera and selection preserved when possible after recompilation, so that iteration does not repeatedly interrupt inspection.
27. As a world author, I want the last successful world retained after compilation errors, so that I can diagnose mistakes without losing my visual context.
28. As a world author, I want diagnostics linked to source, so that I can repair the relevant definition.
29. As a world author, I want to store sketches, Markdown, and structured reference data beside world source, so that design intent remains available to humans and AI.
30. As a world author, I want references linked to the places they inform, so that an architecture brief or dungeon plan is discoverable in context.
31. As a Codex user, I want an MCP connection to the running WDL tools, so that my existing agent can observe the results of its edits.
32. As an authoring agent, I want compilation diagnostics and world queries through MCP, so that I can check my changes against actual compiled output.
33. As an authoring agent, I want camera navigation, selection, and viewport captures through MCP, so that I can inspect spatial results.
34. As a game developer, I want language-independent compiled artifacts, so that my game does not execute the WDL TypeScript source.
35. As a game developer, I want descriptive object meanings and an explicit integration contract, so that my game can implement the appropriate behavior.
36. As a world author, I want scene export that imports into Blender, so that I can verify the world exists beyond the Three.js viewer.
37. As a world author, I want a shared kit change to update its consumers, so that reuse has a visible practical benefit.
38. As a world author, I want to extract reusable components from an authored structure, so that the vocabulary evolves through ordinary DRY refactoring.
39. As a project owner, I want the demo to exercise substantial world complexity, so that success means more than rendering a small hand-built scene.
40. As a project owner, I want a final Codex-driven edit and export exercise, so that the complete authoring workflow is demonstrated.

## Implementation Decisions

### Authoring and composition

- TypeScript with JSX is the world authoring language. React is the authoring model: components, props, children, composition, explicit keys, and normal code reuse.
- Reuse React conventions and compatible tooling wherever useful. The exact runtime implementation is not yet selected. A custom renderer or reuse of React internals must serve compilation requirements; this spec does not mandate either.
- World components are pure descriptions, not Three.js object constructors. Components produce engine-independent descriptions; the compiler resolves them into world data.
- Components may nest to arbitrary practical depth. The demo must visibly exercise several levels of reusable composition, not just one layer of placements.
- Kits are typed values and functions. Architecture, terrain, material/texture, and scattering kits remain extensible project code.
- Project vocabularies extend one compiler contract rather than inventing a new compiler per project. Projects define object schemas, permitted vocabulary, and authoring rules.
- Abstraction follows ordinary React-style DRY practices. Humans and agents explicitly refactor source; the system does not automatically discover or rewrite abstractions.
- All persistent world changes are expressed in source code or declared source data and compiled. Viewer navigation and selection do not modify the authored world.

### Compiler and world contract

- Logical modules comprise the JSX authoring API, vocabulary/schema validation, compiler, compiled artifact contract, Three.js viewer/editor, local MCP server, export path, and demonstration world.
- Identical source, declared inputs, compiler version, and explicit seeds must produce identical world content. No LLM calls or unseeded randomness occur during compilation.
- Compilation must not depend on implicit clock values, undeclared network responses, or other changing external state. General sandboxing of hostile TypeScript is not part of this local demo.
- The compiled representation includes spatial hierarchy, spaces, stable identities, vocabulary types and properties, transforms, geometry/material/asset references, explicit relationships, and source provenance.
- Referenceable authored objects have explicit keys scoped to component instances. Generators provide deterministic identities. Duplicate identities and unresolved links fail validation.
- React's key convention informs authoring identity; durable exported identity remains an explicit WDL contract.
- Spatial producers expose named anchors, surfaces, boundaries, and exclusion regions. Placement consumers declare dependencies on these outputs.
- The compiler resolves placement dependencies and reports cycles or unsatisfied constraints. This is not a commitment to a general-purpose optimization solver.
- Interiors and dungeons are separate spaces. Connections identify their destination space and arrival position; the browser supports following those connections and their authored return links.
- Objects describe gameplay meaning and parameters without implementing mechanics. Future engine adapters handle scene construction; game-specific adapters bind vocabulary to game behavior.
- Export artifacts are versioned and language-independent. Consumers load compiled data and assets without executing WDL source.
- Coordinate conventions, units, asset addressing, and supported material features must be explicit in the artifact contract. Their exact encodings and interchange format remain implementation choices.

### Browser experience and MCP

- Three.js displays the compiled world. The viewer offers flight controls, place/object search, selection, relationships, source inspection, and connection traversal.
- Selected objects expose stable ID, type, properties, relationships, source location, and applicable generating component/invocation parameters.
- Source changes trigger compilation and preview refresh. Successful builds preserve camera and selection where the corresponding space and identity survive.
- Failed builds retain the last successful preview, clearly indicate that it is stale, and present source-linked diagnostics. They do not replace successful exports.
- The local MCP server exposes compile results/diagnostics, world and object queries, provenance, camera navigation, selection, and viewport captures.
- Codex edits source with its existing filesystem tools. There is no embedded model picker or new chat UI in this demo.
- Human-readable and machine-readable references can include images, Markdown, and structured data. Compilation does not infer geometry from those references; explicitly authored data drives output.

### Demo content and Blender export

- Build an original fantasy region inspired by the complexity of Balmora and its surroundings, not a faithful recreation of Morrowind.
- The agreed working content target is one town with three districts and approximately 30 buildings, including 10 enterable interiors; surrounding wilderness with three landscape areas, roads, a river, and a bridge; and two multi-room dungeons.
- The quality threshold is structural and authoring complexity, not finished art. Recognizable roofs, openings, walls, floors, rooms, passages, terrain, roads, and water should make the region understandable.
- Demonstrate reusable architecture, terrain and texture/material kits, seeded barrel/box scattering, and terrain-aware vegetation placement.
- Include at least one linked dungeon plan and one architecture brief.
- Export scenes that can be imported into Blender with expected geometry, transforms, and supported materials. Separate spaces may be represented as separate exported scenes.
- World relationships and vocabulary metadata remain available in the manifest even when the scene interchange format cannot express them.
- Blender import proves scene portability. It does not claim that Blender implements traversal, gameplay semantics, or future engine adapters.

## Testing Decisions

The user confirmed the primary test boundary: JSX source to compiled world artifacts, followed by consumer-level checks in the browser/MCP and Blender.

- Test observable behavior and artifacts rather than component implementation details, private compiler passes, or incidental renderer internals.
- Use the compiler's public interface as the main automated contract boundary. Small representative world programs should prove nested composition, kit reuse, deterministic seeded placement, stable identities, valid links, and exported provenance.
- Compile identical inputs repeatedly and compare world content. Ignore only documented nonsemantic metadata, if any.
- Make targeted source changes and verify the intended consumers change while unrelated referenceable identities remain stable.
- Validate duplicate keys, missing references, dependency cycles, and unsatisfied placement constraints through public diagnostics.
- Verify spatial results directly: scattered clutter respects entrance exclusions, vegetation respects road exclusions, and connections resolve to valid spaces and arrival positions.
- Exercise the browser against compiled artifacts: fly through a scene, search and select an object, inspect its source, enter and return from a separate space, and refresh after a source edit.
- Introduce a compilation error and confirm the last good world remains visible with an out-of-date indication and useful diagnostics; successful export artifacts remain intact.
- Exercise MCP through its public operations and verify its observations correspond to the viewer/compiler state. The final authoring demonstration uses the user's existing Codex connection.
- Import the exported demo scenes into Blender and inspect geometry, orientation, scale, transforms, and supported materials. Browser and Blender must consume outputs from the same successful compilation.
- Run a final authoring exercise: add a building variant, change a shared architecture kit, adjust a scatter rule, and connect a new interior. Recompile, inspect source provenance and links, confirm unrelated identities survive, then export and import into Blender.
- Demonstrate an explicit refactor from one distinctive structure into reusable architecture used in multiple variations.
- No existing test modules, fixtures, ADRs, glossary, package configuration, or other implementation prior art were found: the local project directory was empty at inspection. Concrete test tools will be chosen with the initial project setup.
- Acceptance requires the region and workflow above to work, not merely isolated compiler tests or a static screenshot.

## Out of Scope

- Combat, inventory, quests, NPC behavior, lock mechanics, and other gameplay systems.
- A Godot game or Godot, Unity, or Unreal adapters in this demo.
- Claims of universal engine compatibility before adapters are implemented and verified.
- Accurate recreation of Morrowind's geography, locations, assets, or textures.
- Finished production art or a large external asset library.
- Runtime world components driven by gameplay state or per-frame effects.
- LLM calls during compilation.
- Automatic abstraction discovery or autonomous rewriting of source into reusable components.
- Persistent visual edits that bypass source, and arbitrary round-trip import of Blender or engine edits into WDL.
- Embedded agent chat, model/thinking selectors, and a separate Claude integration.
- Hosted deployment, multi-user collaboration, billing, authentication, and an open-source licensing decision.
- Security isolation for running untrusted third-party world programs.
- Broad performance, streaming, or production-scale infrastructure beyond what this demo requires.

## Further Notes

- This specification records the design discussion and confirmed test boundaries. It authorizes a defined demo scope; implementation work packages and validation commands must still be planned against the initial codebase.
- “React for game worlds” describes the authoring experience and composition discipline. Geometry generation, dependency resolution, export identity, and world relationships are additional compiler responsibilities.
- The central proof is that a coherent, complex world can be authored, inspected, modified, and exported through reusable code. The demo must not quietly collapse into a collection of hardcoded Three.js objects.
- The repository is initially private because hosted versus open-source distribution remains undecided.
- Requested issue triage label: ready-for-agent.
