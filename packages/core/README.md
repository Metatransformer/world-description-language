# Generative World Studio core

Build-time JSX vocabulary, types, and portable behavior helpers. Import `World`, `Space`, `Group`, `Mesh`, `defineStore`, `local`, `read`, and `action` from `@generative-world-studio/core`.

This package intentionally distributes TypeScript sources. Generative World Studio bundles those sources during world compilation. Use its compiler or an equivalent TypeScript/JSX build pipeline; this is not a Godot runtime dependency. React is a peer dependency. The Studio compiler automatically selects the JSX runtime; standalone builds can use `jsxImportSource: "@generative-world-studio/core"`.

The npm scope is a proposed package name, not a claim that this package has been published. From the Studio repository run `npm pack --workspace @generative-world-studio/core`; install the resulting tarball in a consumer to test distribution. Publish under a scope you control after reviewing the package contents.
