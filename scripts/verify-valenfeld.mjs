import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:5174");
  await page.getByText("TOWN · Coins: 0", { exact: true }).waitFor();
  for (const space of ["inn", "cottage", "workshop"]) {
    await page.selectOption("#destination", space);
    await page.getByRole("button", { name: "Visit", exact: true }).click();
    await page.getByText(space.toUpperCase() + " · Coins: 0", { exact: true }).waitFor();
  }
  await page.getByRole("button", { name: "Explore world" }).click();
  async function walk(key, ms) {
    await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key);
  }
  await walk("KeyA", 750); await walk("KeyW", 650);
  await page.getByText("[E] Toggle workshop storeroom", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await walk("KeyD", 750); await walk("KeyW", 1250);
  await page.getByText("[E] Open Valenfeld chest", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await page.getByText("WORKSHOP · Coins: 1", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  await page.evaluate(() => document.exitPointerLock());
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.reload();
  await page.getByText("TOWN · Coins: 0", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await page.getByText("WORKSHOP · Coins: 1", { exact: true }).waitFor();
  await page.keyboard.press("KeyE");
  assert.equal(await page.locator("#place").textContent(), "WORKSHOP · Coins: 1");
  assert.deepEqual(errors, []);
  console.log("VALENFELD_BROWSER_OK spaces=4; gate traversed; chest collected once; reload/restore passed.");
} finally { await browser.close(); }
