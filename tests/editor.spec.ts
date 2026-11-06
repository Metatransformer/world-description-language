import { expect, test } from "@playwright/test";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("searches, selects, and shows source provenance", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Valenreach Region").first()).toBeVisible();
  await page.getByLabel("Search world").fill("Lume River");
  await page.getByRole("button", { name: /Lume River/ }).click();
  await expect(page.locator(".identity h2")).toHaveText("Lume River");
  await expect(page.locator(".source-meta")).toContainText(
    /valenreach\.tsx|kits\.tsx/,
  );
  await expect(page.locator(".code .hot")).toBeVisible();
});

test("traverses a connection and returns", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search world").fill("Enter Lume Inn");
  const entrance = page
    .locator(".object-list button")
    .filter({ hasText: "Enter Lume Inn" })
    .first();
  await entrance.click();
  await page.getByRole("button", { name: /Follow to/ }).click();
  await expect(page.locator(".viewport-top")).toContainText("interior");
  await page.getByRole("button", { name: /Return to previous space/ }).click();
  await expect(page.locator(".viewport-top")).toContainText(
    "Valenreach Region",
  );
});

test("recompile preserves camera context and selection", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search world").fill("Lume River");
  await page.getByRole("button", { name: /Lume River/ }).click();
  await page.getByRole("button", { name: /Recompile/ }).click();
  await expect(page.locator(".identity h2")).toHaveText("Lume River");
  await expect(page.locator("header .status")).toContainText("COMPILED");
});

test("compile failure retains the last good manifest", async ({ page }) => {
  const entry = resolve("worlds/valenreach.tsx"),
    original = await readFile(entry, "utf8");
  try {
    await page.goto("/");
    const count = await page.locator(".panel-title.objects b").textContent();
    await appendFile(entry, "\n<invalid-syntax\n");
    await page.getByRole("button", { name: /Recompile/ }).click();
    await expect(page.locator("header .status")).toContainText("STALE BUILD");
    await expect(page.locator(".panel-title.objects b")).toHaveText(
      count ?? "",
    );
  } finally {
    await writeFile(entry, original);
    await page.request.post("/api/compile", { data: {} });
  }
});
