import { test, expect } from "@playwright/test";
import {
  emptySave,
  transition,
  makeMonster,
  SAVE_KEY,
} from "../src/game/state";
import { createBattle } from "../src/game/battle";
test("battle shows ordered skills, locks input, and changes HP at impact", async ({
  page,
}) => {
  let s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  s.captureTutorial = "done";
  s.monsters[0].skills = ["tackle", "Api-0", "guard"];
  s.battle = createBattle("wild", [s.monsters[0]], [makeMonster("mippo", 5)]);
  await page.addInitScript(
    ({ s, key }) => {
      localStorage.setItem(key, JSON.stringify(s));
      localStorage.setItem("elemonts.language.v1", "en");
      Math.random = () => 0.1;
    },
    { s, key: SAVE_KEY },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator(".creature-canvas canvas").waitFor();
  await page.screenshot({ path: "docs/qa/battle-depth.png" });
  const hp = await page.locator(".health-panel.side-1 small").innerText();
  await page.locator(".move-button").nth(1).click();
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator(".move-button").first()).toBeDisabled();
  await expect(page.locator(".battle-fx")).toHaveAttribute(
    "data-skill",
    "Api-0",
  );
  await expect(page.locator(".health-panel.side-1 small")).toHaveText(hp);
  await expect(page.locator(".health-panel.side-1 small")).not.toHaveText(hp);
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 430, height: 932 },
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
      path: `/tmp/elemonts-portrait-${viewport.width}.png`,
    });
  }
  expect(errors).toEqual([]);
});
