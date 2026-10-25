import { test, expect } from "@playwright/test";
import { emptySave, transition, SAVE_KEY } from "../src/game/state";

for (const language of ["id", "en"] as const)
  test(`mandatory capture walkthrough: ${language}, reload, navigation lock, collection and no replay`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    const id = language === "id";
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: id ? 390 : 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (lang) => localStorage.setItem("elemonts.language.v1", lang),
      language,
    );
    await page.goto(id ? "http://localhost:3001" : "/");
    await page
      .getByRole("button", {
        name: id ? "Pilih Pyroo" : "Choose Pyroo",
        exact: true,
      })
      .click();
    const intro = page.getByRole("dialog");
    await expect(intro).toContainText(
      id ? "Ayo tangkap teman pertamamu!" : "Catch your first wild friend!",
    );
    await expect(
      intro.getByRole("button", { name: id ? "Tutup" : "Close", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(intro).toBeVisible();
    if (id)
      await page.screenshot({
        path: "/tmp/elemonts-capture-intro.png",
        fullPage: true,
      });
    await page
      .getByRole("button", {
        name: id ? "Mulai latihan menangkap" : "Start capture practice",
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: id ? "Temukan teman di Wild" : "Meet a friend in the Wild",
      }),
    ).toBeVisible();
    await page.evaluate(() => {
      location.hash = "arena";
    });
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: id ? "Temukan teman di Wild" : "Meet a friend in the Wild",
      }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", {
      name: id ? "Navigasi mobile" : "Main navigation",
    });
    await expect(
      nav.getByRole("button", { name: id ? "Arena" : "Arena", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", {
        name: id ? "Masuk Wild" : "Enter Wild",
        exact: true,
      })
      .click();
    await expect(page.locator(".move-button").nth(1)).toBeDisabled();
    await expect(
      page.getByRole("button", { name: id ? "Kabur" : "Run", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: id ? "Tas" : "Bag", exact: true }),
    ).toBeDisabled();
    await page.locator(".move-button").first().click();
    await expect(
      page.getByRole("heading", {
        name: id ? "Sekarang buka Tas" : "Now open the Bag",
      }),
    ).toBeVisible();
    await expect(page.locator(".move-button").first()).toBeDisabled();
    if (id) {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await expect
        .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
        .toBe(true);
      await context.setOffline(true);
    }
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: id ? "Sekarang buka Tas" : "Now open the Bag",
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: id ? "Tas" : "Bag", exact: true })
      .click();
    await expect(page.locator("dialog .capture-guide")).toContainText(
      id ? "Pilih Mococapsule" : "Choose Mococapsule",
    );
    await page.reload();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: id ? "Tas" : "Bag", exact: true })
      .click();
    if (id)
      await page.screenshot({
        path: "/tmp/elemonts-capture-bag.png",
        fullPage: true,
      });
    await page.getByRole("button", { name: /Mococapsule/ }).click();
    await page
      .getByRole("button", { name: id ? "Selesai" : "Done", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      id ? "Tangkapan pertamamu berhasil!" : "Your first catch was a success!",
    );
    await page.reload();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeVisible();
    if (id)
      await page.screenshot({
        path: "/tmp/elemonts-capture-complete.png",
        fullPage: true,
      });
    await page
      .getByRole("button", {
        name: id ? "Lihat teman baruku" : "Meet my new friend",
      })
      .click();
    await expect(page.locator(".monster-card")).toHaveCount(2);
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      SAVE_KEY,
    );
    expect(saved.captureTutorial).toBe("done");
    expect(saved.inventory.moco).toBe(7);
    expect(saved.monsters[1].species).toBe("flicklet");
    expect(saved.monsters[1].energy).toBe(5);
    await page.reload();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      nav.getByRole("button", { name: "Arena", exact: true }),
    ).toBeEnabled();
    expect(errors).toEqual([]);
  });

test("existing saves are preserved without forcing a new capture", async ({
  page,
}) => {
  const s = transition(emptySave(), { type: "starter", species: "croobit" });
  delete s.captureTutorial;
  s.tutorial = true;
  await page.addInitScript(
    ({ s, key }) => {
      localStorage.setItem(key, JSON.stringify(s));
      localStorage.setItem("elemonts.language.v1", "en");
    },
    { s, key: SAVE_KEY },
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("button", { name: "Arena", exact: true }),
  ).toBeEnabled();
});
