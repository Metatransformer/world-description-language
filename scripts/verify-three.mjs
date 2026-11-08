import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:5174");
  await page.getByText("TOWN · Coins: 0", { exact: true }).waitFor();
  await page.screenshot({ path: ".wdl/three-preview.png" });
  await page.getByRole("button", { name: "Explore world" }).click();
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(6000);
  await page.keyboard.up("KeyW");
  await page.keyboard.press("KeyE");
  await page.getByText("EXTERIOR · Coins: 0", { exact: true }).waitFor();
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(6000);
  await page.keyboard.up("KeyW");
  await page.keyboard.press("KeyE");
  await page.getByText("DUNGEON · Coins: 0", { exact: true }).waitFor();
  async function walk(key, ms) {
    await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key);
  }
  await walk("KeyA", 1000);
  await walk("KeyW", 1500);
  await page.getByText("[E] Toggle dungeon gate", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await walk("KeyD", 1000);
  await walk("KeyW", 2600);
  await page.getByText("[E] Collect ancient coin", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await page.getByText("DUNGEON · Coins: 1", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  assert.equal(await page.locator("#place").textContent(), "DUNGEON · Coins: 1");
  assert.deepEqual(errors, []);
  console.log("WDL_THREE_OK: walked town/exterior/dungeon, opened gate, collected group-bound chest once.");
} finally { await browser.close(); }
