import { completeCapturePractice } from "./capture-helper";
import { test, expect } from "@playwright/test";
import { LANGUAGE_KEY } from "../src/i18n";

test("first launch defaults to English, persists, and switches language without changing progress", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Choose your language" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "English English" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Choose Pyroo", exact: true }).click();
  await completeCapturePractice(page, "en");
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Feed", exact: true }).click();
  await expect(page.getByRole("button", { name: /Sun berry/ })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  const before = await page.evaluate(() =>
    localStorage.getItem("elemonts-save-v1"),
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Bahasa Indonesia Indonesian" })
    .click();
  await expect(page.getByRole("heading", { name: "Pengaturan" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await page.getByRole("button", { name: "Tutup", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Selamat datang di rumah." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("elemonts-save-v1")),
  ).toBe(before);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Selamat datang di rumah." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pengaturan", exact: true }).click();
  await page.getByRole("button", { name: "English English" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  await nav.getByRole("button", { name: "Collection", exact: true }).click();
  await page.getByRole("button", { name: "Encyclopedia · 37" }).click();
  await page.getByLabel("Filter elements").selectOption("Air");
  await expect(page.locator(".monster-card")).toHaveCount(7);
  await expect(page.locator(".monster-card").first()).toContainText("Water");
  await nav.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: "Enter Wild", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "An encounter in Nusaraya." }),
  ).toBeVisible();
  await expect(page.locator(".battle-log")).toContainText(
    "is ready to battle.",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY),
  ).toBe("en");
});

test("Indonesian can be chosen before choosing a starter", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bahasa Indonesia Indonesian" })
    .click();
  await page.getByRole("button", { name: "Lanjutkan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pilih Pyroo", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pilih Pyroo", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose your language" }),
  ).toHaveCount(0);
});
