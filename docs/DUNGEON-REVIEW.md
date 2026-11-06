# Dungeon generation review

This review covers the first dungeon-maker demo, not a claim of finished level design. The intended experience is to inspect and fly through a coherent fantasy place, then reuse its authored components in another world.

## What is generated

Ash Barrow is a 16-room burial complex with four loops. The Sunken Cistern is an 18-room waterworks with five loops. Both have two elevations and physically modeled stairs, door sockets, ceilings, corridors, and themed furnishings. Their critical paths lead from an entry chamber to a named landmark. The town and its twelve interiors remain connected to them.

The plan generator uses stable grid-cell identities, a seeded spanning tree, and additional adjacent-cell connections. Tests compare twelve seeds without added loops to establish that the seed changes actual routes. Boundary tests cover 8–24 rooms and both elevation modes. These are structural samples; they are not twelve human playtests.

## Review findings

**Variation:** Main routes and shortcut choices vary with the seed. Room sizes also vary. The footprint remains a compact grid of wings, so this implementation does not yet produce caves, irregular ruins, overlapping storeys, or radically different silhouettes.

**Distinct destinations:** The crypt leads toward a ritual hearth; the cistern toward a pump and valve. Storage rooms use stacked supplies, galleries and archives use records, burial rooms use tomb furnishings, and waterworks rooms use channels. The kits have different materials and purposes rather than merely different random seeds.

**Spatial intent:** The entrance, landmark, critical path, and alternative routes are explicit data. Corridors derive from room sockets. Stair spacing provides a rise/run ratio of at most 1:2. Tests check the actual compiled ramp transforms, including east/west stairs. Furnishings were moved away from central door lanes during review.

**Readability limits:** Geometry is deliberately simple. Room roles and the floorplan communicate intent, but lighting, environmental storytelling, signs, and landmark silhouettes need further art direction. Descriptive roles do not implement encounters, locked doors, loot, or progression. Flight inspection does not prove a collision-enabled player can traverse an engine adapter.

## Acceptance evidence

The repository includes repeatability, connectivity, loop, socket, overlap, clearance, compiled geometry, identity, and source-provenance tests. Browser tests exercise floorplan selection, cutaway, exploration, and return connections. The Blender verification script imports the exported scenes independently of the workbench.

The review supports shipping this as an inspectable procedural authoring demo. It does not establish that generated dungeons are fun to play; that requires a game integration and human playtesting.

```json
{
  "scope": "WDL first dungeon-maker demo",
  "structuralSeedSamples": 12,
  "authoredDemoDungeons": 2,
  "humanPlaytests": 0,
  "variation": "Seeded routes and loops; fixed grid-wing footprint",
  "intent": "Explicit entrance, destination, critical path, and themed room roles",
  "remainingLimits": ["No gameplay or collision", "Simple visual storytelling", "No irregular or overlapping floor plans"]
}
```
