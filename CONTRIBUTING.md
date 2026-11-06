# Contributing to WDL

WDL explores a simple idea: a game world should be a composable program. Contributions should improve the authoring language, portable artifact contract, spatial generation, or the ability to inspect the generated world.

## Local setup

Use Node.js 22.12 or newer and npm. Fork the repository, clone your fork, run `npm ci`, and start the workbench with `npm run dev`. The local URL is printed in the terminal. No account, database, or API key is required.

World programs are trusted local TypeScript. Read a downloaded world before compiling it, just as you would any executable project.

## Make a focused change

Open an issue describing the authoring problem or bug. For a larger change, explain the public API and show the smallest world that needs it before committing to an implementation. Keep unrelated cleanup separate.

All persistent world edits belong in source. Keep stable explicit JSX keys and explicit seeds. The Three.js viewer consumes the compiled manifest; avoid making world generation depend on the viewer or a particular game engine. Preserve existing space connections when changing a demo.

## Validate your change

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Compiler tests exercise JSX-to-manifest behavior. Dungeon tests exercise layout generation, validation, and compilation. Browser tests exercise the rendered workbench. Prefer those public boundaries over tests of internal helper functions.

For MCP changes, leave the workbench running and run `npm run test:mcp`. For a full authoring walkthrough, run `node scripts/verify-workflow.mjs`; it temporarily edits the demo source and restores it afterward. Close other authoring sessions before running that script. It uses installed Chrome by default; set `PLAYWRIGHT_CHANNEL=chromium` to use Playwright's Chromium.

For exporter changes, run `npm run compile`, import the generated glTF scenes into Blender, and inspect materials, transforms, and separate spaces. The automated Blender check is described in the README.

## Pull requests

Explain the visible change, why it matters, how to try it, and which checks passed. Include a screenshot for spatial or viewer changes. Call out changes to the artifact contract explicitly. Do not commit `node_modules`, `.next`, `.wdl`, test recordings, credentials, or locally generated export files.

Contributions are licensed under the repository's MIT license.
