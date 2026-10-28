import { existsSync, readFileSync } from "node:fs";
const { version } = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { emptySave, transition, SAVE_KEY } from "../src/game/state";

// Extract old assets from the published APK to /tmp/elemonts-upgrade-old first.
// Build the new assets with npm run build:android before this regression test.
test("legacy APK worker is retired without deleting player storage", async ({
  page,
}) => {
  test.skip(
    !existsSync("/tmp/elemonts-upgrade-old/index.html") ||
      !existsSync("dist/index.html") ||
      existsSync("dist/registerSW.js"),
    "Requires assets extracted from APK 0.1.9 and npm run build:android.",
  );
  test.setTimeout(120000);
  let root = "/tmp/elemonts-upgrade-old";
  const mime: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".m4a": "audio/mp4",
    ".glb": "model/gltf-binary",
  };
  const server: Server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    const relative = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname,
    );
    if (relative.includes("..")) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(path.join(root, relative));
      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(relative)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}`;
  const s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  s.captureTutorial = "done";
  s.gold = 4321;
  // Only seed the first visit, so a reload cannot hide deleted storage.
  await page.addInitScript(
    ({ s, key }) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem(key, JSON.stringify(s));
        localStorage.setItem("elemonts.language.v1", "en");
        localStorage.setItem("elemonts.music.v1", "off");
        sessionStorage.setItem("seeded", "yes");
      }
    },
    { s, key: SAVE_KEY },
  );
  try {
    await page.goto(url);
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), {
        timeout: 40000,
      })
      .toBe(true);
    await expect(page.locator(".creature-canvas")).toBeVisible();
    await page.evaluate(async () => {
      const cache = await caches.open("player-owned-cache");
      await cache.put("/sentinel", new Response("keep me"));
    });
    const before = await page.evaluate(
      (key) => localStorage.getItem(key),
      SAVE_KEY,
    );
    root = path.resolve("dist");
    await page.reload();
    // Reproduce: native bundle changed, but the old worker still serves the old app.
    await expect(page.locator(".creature-canvas")).toBeVisible();
    await expect(page.locator(".creature-canvas")).not.toHaveAttribute(
      "data-player-model",
      "blender",
    );
    const recovery = await readFile(
      "android/app/src/main/assets/native-upgrade.js",
      "utf8",
    );
    await page.evaluate((version) => {
      (window as any).__elemontsNativeVersion = version;
    }, version);
    const navigation = page.waitForEvent(
      "framenavigated",
      (frame) => frame === page.mainFrame(),
    );
    await page.evaluate(recovery);
    await navigation;
    await expect(page.locator(".pet-illustration")).toBeVisible({timeout:30000});
    await expect(page.locator(".pet-home canvas")).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          navigator.serviceWorker.getRegistrations().then((r) => r.length),
        ),
      )
      .toBe(0);
    expect(
      await page.evaluate(() => !!navigator.serviceWorker.controller),
    ).toBe(false);
    const after = await page.evaluate(
      (key) => localStorage.getItem(key),
      SAVE_KEY,
    );
    expect(JSON.parse(after!).gold).toBe(JSON.parse(before!).gold);
    expect(JSON.parse(after!).inventory).toEqual(JSON.parse(before!).inventory);
    expect(JSON.parse(after!).team).toEqual(JSON.parse(before!).team);
    expect(JSON.parse(after!).monsters.map((m: any) => m.uid)).toEqual(
      JSON.parse(before!).monsters.map((m: any) => m.uid),
    );
    expect(
      await page.evaluate(() => localStorage.getItem("elemonts.language.v1")),
    ).toBe("en");
    expect(
      await page.evaluate(() => localStorage.getItem("elemonts.music.v1")),
    ).toBe("off");
    expect(
      await page.evaluate(
        async () =>
          !!(await (
            await caches.open("player-owned-cache")
          ).match("/sentinel")),
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByText(`Elemonts ${version} · Internal prototype`),
    ).toBeVisible();
    await page.screenshot({ path: "/tmp/elemonts-upgrade-verified.png" });
    await page.reload();
    await expect(page.locator(".pet-illustration")).toBeVisible({timeout:30000});
    await expect(page.locator(".pet-home canvas")).toHaveCount(0);
    expect(
      await page.evaluate(() =>
        navigator.serviceWorker.getRegistrations().then((r) => r.length),
      ),
    ).toBe(0);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

for (const refreshWorks of [true, false]) {
  test(`native recovery verifies HTML without a service worker (refresh=${refreshWorks})`, async ({page}) => {
    let loads=0;
    let current="old-ui";
    await page.route('http://127.0.0.1:5189/**', route => {
      loads++;
      return route.fulfill({contentType:'text/html',body:`<!doctype html><html data-elemonts-ui-version="${current}"><head><meta name="elemonts-ui-version" content="${current}"></head><body><h1>Test UI</h1></body></html>`});
    });
    await page.goto('http://127.0.0.1:5189/');
    await page.evaluate(()=>{localStorage.setItem('player-save','keep-save');localStorage.setItem('elemonts.language.v1','id');});
    if(refreshWorks)current=version;
    const recovery=readFileSync('android/app/src/main/assets/native-upgrade.js','utf8');
    await page.evaluate(v=>{(window as any).__elemontsNativeVersion=v;},version);
    const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
    await page.evaluate(recovery);
    await navigation;
    await expect(page).toHaveURL(new RegExp('elemontsBuild='+version.replaceAll('.','\\.')));
    await page.evaluate(v=>{(window as any).__elemontsNativeVersion=v;},version);
    await page.evaluate(recovery);
    if(refreshWorks)await expect(page.locator('meta[name="elemonts-ui-version"]')).toHaveAttribute('content',version);
    else await expect(page.locator('#elemonts-build-mismatch')).toContainText('old-ui');
    expect(await page.evaluate(()=>localStorage.getItem('player-save'))).toBe('keep-save');
    expect(await page.evaluate(()=>localStorage.getItem('elemonts.language.v1'))).toBe('id');
    expect(loads).toBe(2);
  });
}
