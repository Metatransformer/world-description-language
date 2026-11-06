import { expect, test } from "@playwright/test";

test("inspects and explores authored dungeons", async ({ page }) => {
  await page.goto("/");
  const manifest = await page.request.get("/api/manifest").then((response) => response.json());
  const ash = manifest.spaces.find((space: { id: string }) => space.id === "ash-barrow");
  const cistern = manifest.spaces.find((space: { id: string }) => space.id === "sunken-cistern");
  expect(ash).toBeTruthy();
  expect(cistern).toBeTruthy();

  await page.request.post("/api/command", {
    data: { kind: "navigate", spaceId: "ash-barrow" },
  });
  const ashMap = page.getByRole("region", { name: `Dungeon map: ${ash.name}` });
  await expect(ashMap).toBeVisible();
  await expect(ashMap).toContainText("16 rooms");
  await expect(ashMap).toContainText("4 loops");
  await expect(ashMap).toContainText("2 levels");
  await expect(ashMap).toContainText(/\d+ stairs/);
  await expect(ashMap.getByRole("button", { name: "All levels" })).toHaveClass(/active/);

  const room = ash.properties.dungeonPlan.rooms[0];
  await ashMap.getByRole("button", { name: new RegExp(`^${room.name},`) }).click();
  await expect(page.locator(".identity h2")).toHaveText(room.name);
  await expect(page.locator(".identity .type")).toHaveText("DUNGEON-ROOM");
  await expect(page.getByRole("button", { name: "Open source" })).toBeVisible();

  await ashMap.getByRole("button", { name: "Explore room" }).click();
  await expect(page.locator(".scene .mode")).toHaveText("Fly");
  await ashMap.getByRole("button", { name: "Overview" }).click();
  await expect(page.locator(".scene .mode")).toHaveText("Orbit");
  const cutaway = ashMap.getByRole("checkbox", { name: "Ceiling cutaway" });
  await expect(cutaway).toBeChecked();
  await cutaway.uncheck();
  await expect(cutaway).not.toBeChecked();
  await cutaway.check();

  await page.locator(".space-list").getByRole("button", { name: new RegExp(cistern.name) }).click();
  const cisternMap = page.getByRole("region", { name: `Dungeon map: ${cistern.name}` });
  await expect(cisternMap).toContainText("18 rooms");
  await expect(cisternMap).toContainText("5 loops");
  await page.getByRole("button", { name: /Follow to/ }).click();
  await expect(page.locator(".viewport-top")).toContainText("Valenreach Region");
});
