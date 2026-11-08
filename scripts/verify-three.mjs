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
  assert.deepEqual(errors, []);
  console.log("WDL_THREE_OK: rendered world, walked town and exterior, traversed portals into dungeon.");
} finally { await browser.close(); }
