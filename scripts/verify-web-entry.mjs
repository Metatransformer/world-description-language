import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve("examples/three-runtime/index.html")).href);
  const message = await page.locator("#status").textContent();
  console.log({ canvas: await page.locator("canvas").count(), message });
  assert.match(message, /npm run game:web/);
  assert.equal(await page.locator("#play").isDisabled(), true);
} finally { await browser.close(); }
