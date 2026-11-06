# World Description Language

WDL is a TypeScript/JSX world compiler with a local Three.js workbench and a language-independent JSON/glTF artifact contract. The Valenreach demo contains 15 linked spaces and more than 600 compiled objects.

## Run the workbench

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. Source changes under the project roots are polled and compiled; use `npm run build`, `npm test`, and `npm run test:e2e` for validation. The live MCP integration test requires the app to be running: `WDL_MCP_INTEGRATION=1 npm run test:mcp`. It is intentionally skipped from the ordinary test command when that flag is absent.

## Connect MCP

Start the viewer first, then register the stdio server using this repository's absolute path:

```bash
codex mcp add wdl -- node /ABSOLUTE/PATH/world-description-language/scripts/mcp.mjs
```

The launcher resolves the repository and works from any working directory. Restart your Codex chat after registering the server to load its tools. `WDL_URL` defaults to `http://127.0.0.1:3000`. The server exposes compile, bounded query, inspect/provenance, real viewer navigation and selection, canvas capture, and current-build export. It writes protocol messages only to stdout; failures and SDK diagnostics use stderr.

See [authoring guidance](docs/AUTHORING.md) and the [artifact contract](docs/ARTIFACT-CONTRACT.md). Exported files are written to `.wdl/export/` only from a current successful build.

## Verification and Blender

Run `npx playwright install chromium` once, then `npm run test:e2e`. To use installed Chrome instead, run `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`.

With the app running, `node scripts/verify-workflow.mjs` exercises MCP, captures the real viewport, changes the JSX world, verifies stable identities and exports, then restores the original source. Evidence is saved in `.wdl/verification/`.

Run `npm run compile` to export scenes. In Blender, use **File → Import → glTF 2.0** and select a scene from `.wdl/export/`. Each space has its own scene; world relationships remain in `manifest.json`. For automated verification:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/verify-blender.py -- .wdl/export
```

The check imports every scene, verifies meshes and materials, and saves `.wdl/export/valenreach.blend` with separate Blender scenes.
