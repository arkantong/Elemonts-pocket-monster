(function () {
  function fail(error) {
    console.error("Elemonts 2D scene:", error);
    parent.postMessage(
      { type: "elemonts:scene-error" },
      location.origin === "null" ? "*" : location.origin,
    );
  }
  window.addEventListener("error", (e) => fail(e.message));
  window.addEventListener("unhandledrejection", (e) => fail(String(e.reason)));
  try {
    const game = new gdjs.RuntimeGame(gdjs.projectData, { isPreview: true });
    window.ElemontsRuntimeGame = game;
    game.enableMetrics(false);
    game.getRenderer().createStandardCanvas(document.body);
    game.getRenderer().keepAspectRatio(false);
    const resize = () =>
      game.setGameResolutionSize(
        960,
        Math.round((960 * innerHeight) / innerWidth),
      );
    resize();
    window.addEventListener("resize", resize);
    let ready = false;
    gdjs.callbacksRuntimeScenePostEvents.push(() => {
      if (ready) return;
      ready = true;
      // The first scene is loaded asynchronously after the resource callback.
      // Announce readiness after it has actually reached its first render.
      requestAnimationFrame(() =>
        parent.postMessage(
          { type: "elemonts:scene-ready" },
          location.origin === "null" ? "*" : location.origin,
        ),
      );
    });
    game.loadAllAssets(() => {
      game.startGameLoop();
    });
    document.addEventListener("visibilitychange", () =>
      game.pause(document.hidden),
    );
    window.addEventListener("pagehide", () => game.dispose());
  } catch (error) {
    fail(error);
  }
})();
