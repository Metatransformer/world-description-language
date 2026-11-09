import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://127.0.0.1:5174");
  const manifest = await (await page.request.get("http://127.0.0.1:5174/manifest.json")).json();
  const plan = manifest.spaces.find(space => space.id === "dungeon").properties.dungeonPlan;
  await page.selectOption("#destination", "dungeon");
  await page.getByRole("button", { name: "Visit", exact: true }).click();
  await page.getByText("DUNGEON · Coins: 0", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Explore world" }).click();
  const position = () => page.evaluate(() => {
    document.querySelector("#save").click();
    return JSON.parse(localStorage.getItem("wdl-" + document.querySelector("h1").textContent)).position;
  });
  async function go(target, tolerance = 0.6) {
    for (const axis of [0, 2]) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const p = await position(), delta = target[axis] - p[axis];
        if (Math.abs(delta) < 0.3) break;
        const key = axis === 0 ? delta > 0 ? "KeyD" : "KeyA" : delta > 0 ? "KeyS" : "KeyW";
        await page.keyboard.down("ShiftLeft"); await page.keyboard.down(key);
        await page.waitForTimeout(Math.min(5000, Math.abs(delta) / 7 * 1000));
        await page.keyboard.up(key); await page.keyboard.up("ShiftLeft");
      }
    }
    const p = await position();
    assert.ok(Math.hypot(p[0] - target[0], p[2] - target[2]) < tolerance, `Blocked on route: ${p} -> ${target}`);
  }
  await go([-2, 0, 1]);
  await page.getByText("[E] Release the founders' seals", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await go([0, 0, 0]);
  for (const id of plan.criticalPath.slice(1)) await go(plan.rooms.find(room => room.id === id).position, id === plan.goalRoom ? 1.2 : 0.6);
  await page.getByText("[E] Open Valenfeld chest", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await page.getByText("DUNGEON · Coins: 1", { exact: true }).waitFor();
  console.log(`BARROW_WALK_OK: ${plan.criticalPath.length} rooms on the critical path, seals opened, heirloom collected.`);
} finally { await browser.close(); }
