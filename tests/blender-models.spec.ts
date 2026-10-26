import { test, expect as baseExpect } from "@playwright/test";
import {
  emptySave,
  transition,
  makeMonster,
  SAVE_KEY,
} from "../src/game/state";
import { createBattle } from "../src/game/battle";
const expect = baseExpect.configure({ timeout: 20000 });

for (const species of ["pyroo", "croobit"]) {
  test(`${species} Blender model loads at home and returns after navigation`, async ({
    page,
  }) => {
    const s = transition(emptySave(), { type: "starter", species });
    s.tutorial = true;
    s.captureTutorial = "done";
    await page.addInitScript(
      ({ s, key }) => {
        localStorage.setItem(key, JSON.stringify(s));
        localStorage.setItem("elemonts.language.v1", "en");
        localStorage.setItem("elemonts.music.v1", "off");
      },
      { s, key: SAVE_KEY },
    );
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await expect(page.locator(".creature-canvas")).toHaveAttribute(
      "data-player-model",
      "blender",
    );
    await page.screenshot({
      path: `/tmp/elemonts-${species}-blender-home.png`,
    });
    await page.getByRole("button", { name: "Collection", exact: true }).click();
    await expect(
      page
        .locator(".monster-card")
        .filter({ hasText: species === "pyroo" ? "Pyroo" : "Croobit" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page.locator(".creature-canvas")).toHaveAttribute(
      "data-player-model",
      "blender",
    );
    expect(errors).toEqual([]);
  });
}
test("both Blender models load in battle and attack still resolves", async ({
  page,
}) => {
  const s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  s.captureTutorial = "done";
  s.battle = createBattle("wild", [s.monsters[0]], [makeMonster("croobit", 5)]);
  await page.addInitScript(
    ({ s, key }) => {
      localStorage.setItem(key, JSON.stringify(s));
      localStorage.setItem("elemonts.language.v1", "en");
    },
    { s, key: SAVE_KEY },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator(".creature-canvas")).toHaveAttribute(
    "data-player-model",
    "blender",
  );
  await expect(page.locator(".creature-canvas")).toHaveAttribute(
    "data-enemy-model",
    "blender",
  );
  await page.screenshot({ path: "/tmp/elemonts-blender-battle.png" });
  const hp = await page.locator(".health-panel.side-1 small").innerText();
  await page.locator(".move-button").first().click();
  await expect(page.locator(".health-panel.side-1 small")).not.toHaveText(hp);
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.screenshot({ path: "/tmp/elemonts-blender-battle-after.png" });
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator(".move-button").first()).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: `/tmp/elemonts-painterly-${viewport.width}.png`,
    });
  }
  expect(errors).toEqual([]);
});
test("failed GLB request keeps a usable fallback", async ({ page }) => {
  const s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  s.captureTutorial = "done";
  await page.addInitScript(
    ({ s, key }) => {
      localStorage.setItem(key, JSON.stringify(s));
      localStorage.setItem("elemonts.language.v1", "en");
    },
    { s, key: SAVE_KEY },
  );
  await page.route("**/models/pyroo-v1.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".creature-canvas")).toHaveAttribute(
    "data-player-model",
    "fallback",
  );
  await expect(page.locator(".creature-canvas canvas")).toBeVisible();
});
