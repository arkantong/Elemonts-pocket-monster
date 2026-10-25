import { expect, type Page } from "@playwright/test";

export async function completeCapturePractice(
  page: Page,
  language: "id" | "en" = "id",
) {
  const id = language === "id";
  await page
    .getByRole("button", {
      name: id ? "Mulai latihan menangkap" : "Start capture practice",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: id ? "Masuk Wild" : "Enter Wild",
      exact: true,
    })
    .click();
  await page.locator(".move-button").first().click();
  await expect(page.locator(".battle-stage")).toHaveAttribute(
    "aria-busy",
    "false",
    { timeout: 15000 },
  );
  await page
    .getByRole("button", { name: id ? "Tas" : "Bag", exact: true })
    .click();
  await page.getByRole("button", { name: /Mococapsule/ }).click();
  await page
    .getByRole("button", { name: id ? "Selesai" : "Done", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: id ? "Lihat teman baruku" : "Meet my new friend",
      exact: true,
    })
    .click();
  await page
    .getByRole("navigation", {
      name: id ? "Navigasi mobile" : "Mobile navigation",
    })
    .getByRole("button", { name: id ? "Rumah" : "Home", exact: true })
    .click();
}
