# Generative World Studio

For running examples, authoring worlds, integrating Godot, or implementing another engine adapter, start with [docs/AGENT-QUICKSTART.md](docs/AGENT-QUICKSTART.md). It routes each task to its source files and completion checks.

`wdl` remains the compiler/API identifier for compatibility. Author worlds in JSX and gameplay in the consuming engine; generated artifacts are build outputs. Keep the portable behavior contract and both runtimes consistent when changing behavior semantics.

For documentation changes, Markdown in `docs/` is authoritative. Run `npm run docs:build` to validate the VitePress site and refresh its generated agent-readable exports. Keep this file short; put task-specific instructions behind the quickstart links.
