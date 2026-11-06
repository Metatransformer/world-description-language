import { expect, test } from "@playwright/test";

test("browses all components, highlights definitions, and navigates placed instances", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Components", exact: true }).click();
  const library = page.getByRole("dialog", { name: "Component library" });
  await expect(library).toBeVisible();
  await library.getByLabel("Search components").fill("DungeonRoomGeometry");
  await library.getByRole("button", { name: /^DungeonRoomGeometry/ }).click();
  await expect(library.locator(".component-file h2")).toHaveText("DungeonRoomGeometry");
  await expect(library.locator(".hljs-keyword").first()).toBeVisible();
  await expect(library.locator(".syntax-code")).toContainText("roomId: room.id");
  await library.locator("summary").click();
  await library.locator(".component-instances button").first().click();
  await expect(library).not.toBeVisible();
  await expect(page.locator(".identity .type")).toHaveText("DUNGEON-ROOM");
  await page.getByRole("button", { name: "Components", exact: true }).click();
  await library.getByLabel("Search components").fill("DungeonRoom worlds/kits.tsx");
  await library.getByRole("button", { name: /^DungeonRoom/ }).click();
  await expect(library.locator(".component-file h2")).toHaveText("DungeonRoom");
  await expect(library.locator("summary")).toContainText("(0)");
  await page.keyboard.press("Escape");
  await expect(library).not.toBeVisible();
  // Leave the shared viewer session at the overworld for other browser tests.
  await page.request.post("/api/command", { data: { kind: "navigate", spaceId: "outside" } });
  await expect(page.locator(".viewport-top")).toContainText("Valenreach Region");
});
