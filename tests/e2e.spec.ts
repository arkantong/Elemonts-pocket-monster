import { test, expect, type Page } from "@playwright/test";
import {
  emptySave,
  transition,
  makeMonster,
  SAVE_KEY,
} from "../src/game/state";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("elemonts.language.v1", "id"),
  );
});
const seed = () => {
  let s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  return s;
};
async function init(page: Page, s = seed()) {
  await page.addInitScript(() =>
    localStorage.setItem("elemonts.language.v1", "id"),
  );
  await page.addInitScript(
    ({ key, save }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(save));
    },
    { key: SAVE_KEY, save: s },
  );
  await page.goto("/");
}
const nav = (page: Page, label: string) =>
  page
    .getByRole("navigation", { name: "Navigasi mobile" })
    .getByRole("button", { name: label, exact: true });
test("choose starter, tutorial, food, mailbox, save reload and responsive navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Pilih Pyroo", exact: true }).click();
  await page.getByRole("button", { name: "Temui partnerku" }).click();
  await expect(
    page.getByRole("heading", { name: "Selamat datang di rumah." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Beri makan", exact: true }).click();
  await page.getByRole("button", { name: /Beri matahari/ }).click();
  await page.getByRole("button", { name: "Tutup", exact: true }).click();
  await expect(page.getByText("120 / 200", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ambil hadiah", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sudah diambil" }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.getByText("120 / 200", { exact: true })).toBeVisible();
  await nav(page, "Koleksi").click();
  await page.getByRole("button", { name: "Ensiklopedia · 37" }).click();
  await expect(page.locator(".monster-card")).toHaveCount(37);
  await page.getByLabel("Cari monster").fill("Noxarion");
  await expect(page.locator(".monster-card")).toHaveCount(1);
  await expect(page.getByText("Menanti event mendatang")).toBeVisible();
  await nav(page, "Toko").click();
  await page.getByRole("button", { name: "Kapsul", exact: true }).click();
  await expect(page.locator(".shop-item")).toHaveCount(4);
  await page.locator(".shop-item").first().getByRole("button").click();
  await nav(page, "Rumah").click();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  expect(errors).toEqual([]);
});
test("Wild capture, trainer victory, progress and reload of active battle", async ({
  page,
}) => {
  test.setTimeout(90000);
  await init(page);
  await page.evaluate(() => {
    Math.random = () => 0.1;
  });
  await nav(page, "Jelajah").click();
  await page.getByRole("button", { name: "Masuk Wild" }).click();
  await expect(
    page.getByRole("heading", { name: "Pertemuan di Nusaraya." }),
  ).toBeVisible();
  await page.reload();
  await page.evaluate(() => {
    Math.random = () => 0.1;
  });
  await page.getByRole("button", { name: "Tas", exact: true }).click();
  await page.getByRole("button", { name: /Mococapsule/ }).click();
  await expect(
    page.getByRole("heading", { name: "Selamat datang, teman baru!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Selesai", exact: true }).click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.monsters).toHaveLength(2);
  expect(saved.monsters[0].energy).toBe(20);
  expect(saved.monsters[1].energy).toBe(5);
  expect(saved.inventory.moco).toBe(7);
  await nav(page, "Arena").click();
  await page.getByRole("button", { name: "Temui Trainer" }).click();
  for (let i = 0; i < 30; i++) {
    await expect(page.locator(".battle-stage")).toHaveAttribute("aria-busy", "false");
    if (
      await page.getByRole("button", { name: "Selesai", exact: true }).count()
    )
      break;
    if (
      await page
        .getByRole("heading", { name: "Pilih monster berikutnya." })
        .count()
    ) {
      await page.getByRole("button", { name: "Ganti monster" }).click();
      await page.locator("dialog .item-row:not([disabled])").first().click();
    } else await page.locator(".move-button:not([disabled])").first().click();
    await expect(page.locator(".battle-stage")).toHaveAttribute("aria-busy", "true");
  }
  await expect(
    page.getByRole("button", { name: "Selesai", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Selesai", exact: true }).click();
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(after.trainerUsed).toBe(1);
  expect(after.monsters[0].energy).toBe(20);
  expect(after.monsters[0].exp).toBe(0);
});
test("allocate points, change skill, sacrifice duplicate and native-independent export", async ({
  page,
}) => {
  const s = seed();
  s.monsters[0].level = 10;
  s.monsters.push(makeMonster("pyroo"));
  s.inventory.reset = 1;
  await init(page, s);
  await nav(page, "Koleksi").click();
  await page.locator(".monster-card").first().click();
  await page.getByLabel("Tambah attack", { exact: true }).click();
  await expect(page.getByText("4 poin tersedia / 5")).toBeVisible();
  await page.getByLabel("Skill slot 2").selectOption("Api-1");
  await page.getByRole("button", { name: /Gunakan Batu keseimbangan/ }).click();
  await expect(page.getByText("5 poin tersedia / 5")).toBeVisible();
  await page.locator(".donor-list button").click();
  await page.getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByText("7 poin tersedia / 7")).toBeVisible();
  await page.getByRole("button", { name: "Tutup", exact: true }).click();
  await expect(page.locator(".monster-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Pengaturan" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor cadangan" }).click();
  expect((await download).suggestedFilename()).toMatch(/^elemonts-.*\.json$/);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
});
test("two independent players join LAN Duel and resolve the same turn", async ({
  browser,
}) => {
  const a = await browser.newContext({ viewport: { width: 390, height: 844 } }),
    b = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await a.newPage(),
    q = await b.newPage();
  await init(p);
  await init(q);
  for (const page of [p, q]) {
    await nav(page, "Arena").click();
    await page.getByRole("button", { name: "Duel", exact: true }).click();
  }
  await p.getByRole("button", { name: "Buat room" }).click();
  await expect(p.locator(".room-wait>strong")).toHaveText(/^\d{6}$/);
  const code = await p.locator(".room-wait>strong").innerText();
  await q.getByLabel("Kode room teman").fill(code);
  await q.getByRole("button", { name: "Gabung", exact: true }).click();
  for (const page of [p, q])
    await expect(
      page.getByRole("heading", { name: "Duel persahabatan." }),
    ).toBeVisible();
  await p.locator(".move-button").first().click();
  await expect(
    p.getByRole("heading", { name: "Menunggu pilihan lawan…" }),
  ).toBeVisible();
  await q.locator(".move-button").first().click();
  for (const page of [p, q])
    await expect(page.getByText("Giliran 2", { exact: true })).toBeVisible();
  const php = await p.locator(".health-panel.side-0 small").innerText(),
    qhp = await q.locator(".health-panel.side-1 small").innerText();
  expect(php).toBe(qhp);
  await p.getByRole("button", { name: "Menyerah", exact: true }).click();
  await expect(
    q.getByText(
      "Lawan meninggalkan room. Duel berakhir tanpa hadiah atau pengurangan energi.",
    ),
  ).toBeVisible();
  await a.close();
  await b.close();
});

test("corrupted save is preserved until explicit recovery", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    SAVE_KEY,
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Simpanan tidak bisa dibaca",
  );
  await page.getByRole("button", { name: "Pilih Pyroo", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY),
  ).toBe("{broken");
  await page.getByRole("button", { name: "Pengaturan", exact: true }).click();
  await page.getByRole("button", { name: "Mulai petualangan baru" }).click();
  await page.getByRole("button", { name: "Hapus dan mulai baru" }).click();
  await page.getByRole("button", { name: "Pilih Pyroo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Temui partnerku" }),
  ).toBeVisible();
});

test("production single player reloads with the network offline", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await context.addInitScript(() =>
    localStorage.setItem("elemonts.language.v1", "id"),
  );
  await page.goto("http://localhost:3001");
  await page.getByRole("button", { name: "Pilih Pyroo", exact: true }).click();
  await page.getByRole("button", { name: "Temui partnerku" }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Selamat datang di rumah." }),
  ).toBeVisible();
  await nav(page, "Jelajah").click();
  await page.getByRole("button", { name: "Masuk Wild" }).click();
  await expect(
    page.getByRole("heading", { name: "Pertemuan di Nusaraya." }),
  ).toBeVisible();
  await context.close();
});
