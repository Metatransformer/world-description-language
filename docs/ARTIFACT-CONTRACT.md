# WDL artifact contract

WDL 1.0 exports one `manifest.json` and one glTF 2.0 scene per space. Consumers load generated JSON/glTF; they do not execute the TypeScript authoring source.

Coordinates are right-handed, Y-up, in meters. Euler angles are XYZ radians. Every object matrix is a complete column-major world matrix; consumers must assign it directly and must not also apply the object's parent or position/rotation/scale fields. Those decomposed fields are descriptive conveniences.

The manifest contains `spaces`, `objects`, `materials`, `connections`, `relationships`, `producers`, `references`, and project `metadata`. Object IDs are stable authored/generated identities. Objects may have box, cylinder, cone, sphere, heightfield, or indexed geometry. Indexed positions and normals are flat XYZ arrays; indices address vertices. Materials use base color, roughness, metallic, opacity, double-sided state, and optional checker/noise/stripe procedural texture descriptions. Asset texture URIs are descriptive and are not embedded by the current browser renderer.

Connections are not scene nodes. A connection names its source and destination spaces, arrival point, optional source object, bidirectional flag, properties, and source provenance. Gameplay adapters decide how traversal is presented. Relationships and vocabulary properties likewise preserve meaning that glTF does not implement.

Source provenance records a project-relative file, line/column, component chain, parameters, and the ancestor component invocations with their parameters. Generated instances retain their producing invocation data. Large provenance parameter values use explicit `$summary` previews to avoid duplicating full plans and geometry buffers at every child; full semantic data remains in space/object properties and geometry. References point to project files and remain metadata; compilation does not infer geometry from them.

Current limits: no animation, skinning, physics, gameplay implementation, remote asset loading, or game-engine adapter. glTF exports include generated UVs and baked PNG procedural textures; local asset textures are embedded by the exporter. Transparent materials are exported with glTF `BLEND`. Export is refused while the browser session is stale after a failed compile.
