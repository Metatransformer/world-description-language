import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, ".wdl/verification");
const base = process.env.WDL_URL ?? "http://127.0.0.1:3000";
const entry = resolve(root, "worlds/valenreach.tsx");
const original = await readFile(entry, "utf8");
await mkdir(output, { recursive: true });
const client = new Client({ name: "wdl-acceptance", version: "1" });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "scripts/mcp.mjs")],
    cwd: "/tmp",
    env: { ...process.env, WDL_URL: base },
  }),
);
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const api = async (name) => (await fetch(`${base}/api/${name}`)).json();
async function tool(name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  assert(!result.isError, JSON.stringify(result));
  return result;
}
const parse = (result) =>
  JSON.parse(result.content.find((item) => item.type === "text").text);
async function settle() {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (!(await api("state")).command) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error("Viewer did not acknowledge command");
}
async function capture(name) {
  const result = await tool("wdl_capture");
  const image = result.content.find((item) => item.type === "image");
  assert(image?.data.length > 1000, "Expected an actual rendered image");
  await writeFile(resolve(output, name), Buffer.from(image.data, "base64"));
}
try {
  await page.goto(base);
  await page.locator(".viewport canvas").waitFor();
  assert.equal(parse(await tool("wdl_compile")).stale, false);
  const before = await api("manifest");
  const buildings = parse(
    await tool("wdl_query", { type: "building", limit: 5 }),
  );
  assert.equal(buildings.objects.length, 5);
  const inspected = parse(
    await tool("wdl_inspect", { object: buildings.objects[0].id }),
  );
  assert(inspected.source.excerpt.length > 0);
  assert(inspected.object.source.components.length >= 4);
  await tool("wdl_select", { object: buildings.objects[0].id });
  await settle();
  assert.equal(
    (await api("state")).session.selectedId,
    buildings.objects[0].id,
  );
  await tool("wdl_navigate", {
    space: "outside",
    position: [140, 110, 145],
    lookAt: [0, 0, 20],
  });
  await settle();
  await capture("overview.png");
  await page.screenshot({ path: resolve(output, "workbench.png") });

  const entryLink = before.connections.find(
    (link) => link.id === "enter-river-2",
  );
  await tool("wdl_select", { object: entryLink.fromObject });
  await settle();
  await page.getByRole("button", { name: /Follow to.*Lume Inn/ }).click();
  await page.waitForFunction(() =>
    document
      .querySelector(".viewport-top")
      ?.textContent?.includes("Lume Inn interior"),
  );
  await settle();
  await capture("interior.png");

  await writeFile(
    entry,
    original.replace(
      "export const world = createValenreach();",
      "export const world = createValenreach({ wallMaterial: 'river-stone', clutterDensity: 3, extraBuildingVariant: 'tower', extraInterior: true });",
    ),
  );
  assert.equal(parse(await tool("wdl_compile")).stale, false);
  const after = await api("manifest");
  const ids = new Set(after.objects.map((object) => object.id));
  assert(before.objects.every((object) => ids.has(object.id)));
  assert.equal(after.spaces.length, before.spaces.length + 1);
  assert(after.connections.some((link) => link.id === "enter-new-variant"));
  assert(
    after.objects.some(
      (object) => object.type === "wall" && object.material === "river-stone",
    ),
  );
  const exported = parse(await tool("wdl_export"));
  const gltf = JSON.parse(
    await readFile(
      exported.scenePaths.find((path) => path.endsWith("outside.gltf")),
      "utf8",
    ),
  );
  assert(gltf.images.length > 0);
  await tool("wdl_navigate", {
    space: "outside",
    position: [140, 110, 145],
    lookAt: [0, 0, 20],
  });
  await settle();
  await capture("modified-world.png");
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(output, "workflow.json"),
    JSON.stringify(
      {
        before: {
          objects: before.objects.length,
          spaces: before.spaces.length,
        },
        after: { objects: after.objects.length, spaces: after.spaces.length },
        preservedIdentities: before.objects.length,
        mcpTools: (await client.listTools()).tools.map((item) => item.name),
        browserErrors: errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("WDL_WORKFLOW_VERIFIED", output);
} finally {
  await writeFile(entry, original);
  try {
    await tool("wdl_compile");
    await tool("wdl_export");
  } finally {
    await browser.close();
    await client.close();
  }
}
