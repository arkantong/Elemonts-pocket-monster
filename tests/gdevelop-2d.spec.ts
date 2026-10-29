import { test, expect, type Page } from "@playwright/test";
import {
  emptySave,
  transition,
  makeMonster,
  SAVE_KEY,
} from "../src/game/state";
import { createBattle } from "../src/game/battle";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { STARTERS } from "../src/game/data";
const opponents: Record<string, string> = {
  pyroo: "croobit",
  croobit: "pyroo",
  voltavi: "mippo",
  mippo: "voltavi",
  mallow: "swifttail",
  swifttail: "mallow",
  aurapaw: "noxarion",
  noxarion: "aurapaw",
  georoll: "burrowox",
  burrowox: "georoll",
};
async function fixture(page: Page, species: string, battle = false) {
  const isStarter = STARTERS.some((s) => s.id === species);
  const save = transition(emptySave(), {
    type: "starter",
    species: isStarter ? species : "pyroo",
  });
  if (!isStarter) {
    const monster = makeMonster(species, 5);
    save.monsters = [monster];
    save.team = [monster.uid];
  }
  save.tutorial = true;
  save.captureTutorial = "done";
  if (battle) {
    const partner = makeMonster("flicklet", 5);
    save.monsters.push(partner);
    save.team.push(partner.uid);
    save.battle = createBattle(
      "wild",
      [save.monsters[0], partner],
      [makeMonster(opponents[species], 5)],
    );
    save.battle.turn = 2;
  }
  await page.addInitScript(
    ({ save, key }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem("elemonts.language.v1", "en");
      localStorage.setItem("elemonts.music.v1", "off");
    },
    { save, key: SAVE_KEY },
  );
}
test("production bundle reaches its first GDevelop frame and resolves a move", async ({
  page,
}) => {
  // Use compiled assets: Vite development did not reproduce opacity/iframe RAF throttling.
  const mime: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".json": "application/json",
    ".m4a": "audio/mp4",
  };
  const root = path.resolve("dist");
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    const file = path.resolve(
      root,
      "." + (url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await fixture(page, "pyroo", true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      `http://127.0.0.1:${(server.address() as { port: number }).port}/`,
    );
    await expect(page.locator(".battle-scene-2d")).toHaveAttribute(
      "data-engine",
      "gdevelop",
      { timeout: 12000 },
    );
    const hp = await page.locator(".health-panel.side-1 small").innerText();
    await page.locator(".move-button").nth(1).click();
    await expect(page.locator(".health-panel.side-1 small")).not.toHaveText(hp);
    await expect(page.locator(".battle-stage")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(errors).toEqual([]);
  } finally {
    await page.goto("about:blank");
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
for (const species of [
  "pyroo",
  "croobit",
  "voltavi",
  "mippo",
  "mallow",
  "swifttail",
  "aurapaw",
  "noxarion",
  "georoll",
  "burrowox",
])
  test(`${species} uses the concept sheet in Home and Collection`, async ({
    page,
  }) => {
    await fixture(page, species);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator(".pet-illustration image")).toHaveAttribute(
      "href",
      `/art/monsters-2d/${species}-home.png`,
    );
    await expect(page.locator(".pet-home canvas")).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [1280, 900],
    ]) {
      await page.setViewportSize({ width, height });
      const label = await page.locator(".pet-name").boundingBox();
      const sprite = await page.locator(".pet-illustration").boundingBox();
      expect(sprite!.y - label!.y - label!.height).toBeGreaterThanOrEqual(11.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `/tmp/elemonts-2d-home-${species}.png` });
    await page.getByRole("button", { name: "Collection", exact: true }).click();
    const image = page.locator('.monster-card .portrait [role="img"]').first();
    await expect(image).toHaveCSS(
      "background-image",
      new RegExp(`/art/monsters-2d/${species}-home.png`),
    );
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page.locator(".pet-illustration")).toBeVisible();
    expect(errors).toEqual([]);
  });
for (const species of [
  "voltavi",
  "mippo",
  "mallow",
  "swifttail",
  "aurapaw",
  "noxarion",
  "georoll",
  "burrowox",
])
  test(`${species} uses rear/front/hit sprites during battle`, async ({
    page,
  }) => {
    await fixture(page, species, true);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      let seed = 123;
      Math.random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page).toHaveTitle(/Elemonts/);
    await expect(page.locator(".battle-scene-2d")).toHaveAttribute(
      "data-engine",
      "gdevelop",
      { timeout: 15000 },
    );
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    const frame = page
      .frames()
      .find((f) => f.url().includes("/gdevelop/index.html"))!;
    const opponent = opponents[species];
    await expect
      .poll(() =>
        frame.evaluate(() =>
          (window as any).ElemontsBattle.scene
            .getObjects("Partner")[0]
            .getAnimationName(),
        ),
      )
      .toBe(`${species}:back`);
    await expect
      .poll(() =>
        frame.evaluate(() =>
          (window as any).ElemontsBattle.scene
            .getObjects("Opponent")[0]
            .getAnimationName(),
        ),
      )
      .toBe(`${opponent}:front`);
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [1280, 900],
    ]) {
      await page.setViewportSize({ width, height });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect
        .poll(() =>
          frame.evaluate(() => {
            const c = document.querySelector("canvas")!;
            return Math.abs(c.width / c.height - innerWidth / innerHeight);
          }),
        )
        .toBeLessThan(0.002);
      await page.screenshot({
        path: `/tmp/elemonts-batch02-${species}-${width}.png`,
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() =>
        frame.evaluate(() => {
          const canvas = document.querySelector("canvas")!;
          return Math.abs(
            canvas.width / canvas.height - innerWidth / innerHeight,
          );
        }),
      )
      .toBeLessThan(0.002);
    await frame.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const hpBar = page.locator('.health-panel.side-1 [role="progressbar"]');
    const hp = (await hpBar.getAttribute("aria-valuenow"))!;
    // Record rendered transitions inside the game loop, rather than sampling a
    // short pose from the browser process after screenshots/resizes.
    await frame.evaluate(() => {
      const w = window as any;
      w.__poseLog = [];
      let previous = "";
      w.gdjs.callbacksRuntimeScenePostEvents.push((scene: any) => {
        const animation = scene.getObjects("Opponent")[0]?.getAnimationName();
        if (animation && animation !== previous) {
          previous = animation;
          w.__poseLog.push({
            animation,
            hp: parent.document
              .querySelector('.health-panel.side-1 [role="progressbar"]')
              ?.getAttribute("aria-valuenow"),
          });
        }
      });
    });
    await page.locator(".move-button").nth(1).click();
    await expect
      .poll(
        () =>
          frame.evaluate(
            (name) =>
              (window as any).__poseLog.some(
                (pose: any) => pose.animation === name,
              ),
            `${opponent}:hit`,
          ),
        { intervals: [30, 60, 100], timeout: 12000 },
      )
      .toBe(true);
    const hit = await frame.evaluate(
      (name) =>
        (window as any).__poseLog.find((pose: any) => pose.animation === name),
      `${opponent}:hit`,
    );
    expect(hit.hp).toBe(hp);
    await page.screenshot({ path: `/tmp/elemonts-batch02-${species}-hit.png` });
    await expect(hpBar).not.toHaveAttribute("aria-valuenow", hp);
    await expect(page.locator(".battle-stage")).toHaveAttribute(
      "aria-busy",
      "false",
      { timeout: 15000 },
    );
    expect(errors).toEqual([]);
  });
test("GDevelop renders spaced 2D actors without WebGL, switches partners and resolves a move", async ({
  page,
}) => {
  await fixture(page, "croobit", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: any[]
    ) {
      if (
        kind === "webgl" ||
        kind === "webgl2" ||
        kind === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".battle-scene-2d")).toHaveAttribute(
    "data-engine",
    "gdevelop",
    { timeout: 15000 },
  );
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("canvas")).toBeVisible();
  const iframe = page
    .frames()
    .find((f) => f.url().includes("/gdevelop/index.html"))!;
  const engine = await iframe.evaluate(() => {
    const w = window as any;
    const g = w.ElemontsRuntimeGame;
    const scene = w.ElemontsBattle.scene;
    const p = scene.getObjects("Partner")[0],
      e = scene.getObjects("Opponent")[0];
    return {
      three: typeof w.THREE,
      canvas: g.getRenderer().getPIXIRenderer().type,
      player: p.getAnimationName(),
      enemy: e.getAnimationName(),
      gap:
        e.getX() -
        (w.ElemontsSpriteFrames[e.getAnimationName()][4] * e.getScaleX()) / 2 -
        (p.getX() +
          (w.ElemontsSpriteFrames[p.getAnimationName()][4] * p.getScaleX()) /
            2),
    };
  });
  expect(engine.three).toBe("undefined");
  expect(engine.canvas).toBe(2);
  expect(engine.player).toBe("croobit:back");
  expect(engine.enemy).toBe("pyroo:front");
  expect(engine.gap).toBeGreaterThan(200);
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [1280, 900],
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".move-button").first()).toBeVisible();
    await expect
      .poll(() =>
        iframe.evaluate(() => {
          const canvas = document.querySelector("canvas")!;
          return Math.abs(
            canvas.width / canvas.height - innerWidth / innerHeight,
          );
        }),
      )
      .toBeLessThan(0.002);
    await page.screenshot({
      path: `/tmp/elemonts-2d-battle-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const hp = await page.locator(".health-panel.side-1 small").innerText();
  await page.locator(".move-button").first().click();
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator(".health-panel.side-1 small")).not.toHaveText(hp);
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page
    .getByRole("button", { name: "Switch monster", exact: true })
    .click();
  await page
    .locator("dialog .item-row")
    .filter({ hasText: "Flicklet" })
    .click();
  await expect
    .poll(() =>
      iframe.evaluate(() =>
        (window as any).ElemontsBattle.scene
          .getObjects("Partner")[0]
          .getAnimationName(),
      ),
    )
    .toBe("flicklet:front");
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(
    requests.filter((u) =>
      /\.glb|CreatureScene|three\.js|three\.module/.test(u),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
test("a reported scene failure leaves a playable flat-sprite fallback", async ({
  page,
}) => {
  await fixture(page, "pyroo", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/gdevelop/boot.js", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: "parent.postMessage({type:'elemonts:scene-error'},location.origin);",
    }),
  );
  await page.goto("/");
  await expect(page.locator(".battle-scene-2d")).toHaveAttribute(
    "data-engine",
    "fallback",
  );
  await expect(page.locator(".battle-scene-2d iframe")).toHaveCount(0);
  await expect(page.locator(".sprite-player")).toBeVisible();
  await expect(page.locator(".move-button").first()).toBeEnabled();
  await page.locator(".move-button").first().click();
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
  );
});
