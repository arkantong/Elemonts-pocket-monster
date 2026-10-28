/* Shared JavaScript event: embedded in the editable GDevelop scene and web runtime. */
(function installElemontsBattle() {
  if (window.ElemontsBattle) return;
  const positions = [
    { x: 215, y: 1000, width: 365, height: 365 },
    { x: 755, y: 700, width: 245, height: 245 },
  ];
  const concept = new Set(window.ElemontsConceptSpecies || []);
  const ease = (n) => 1 - Math.pow(1 - Math.max(0, Math.min(1, n)), 3);
  const state = {
    species: "pyroo",
    enemy: "croobit",
    entry: 3,
    fainted: [false, false],
    reduced: false,
    event: null,
    eventStartedAt: 0,
    entryStartedAt: Date.now(),
  };
  window.addEventListener("message", (message) => {
    if (
      message.source !== parent ||
      message.origin !== location.origin ||
      message.data?.type !== "elemonts:battle-state"
    )
      return;
    const next = message.data;
    if (!/^[a-z]+$/.test(next.species) || !/^[a-z]+$/.test(next.enemy)) return;
    if (next.entry !== state.entry) state.entryStartedAt = Date.now();
    Object.assign(state, {
      species: next.species,
      enemy: next.enemy,
      entry: next.entry,
      fainted: next.fainted,
      reduced: !!next.reduced,
      event: next.event,
      eventStartedAt: next.eventStartedAt || Date.now(),
    });
  });
  window.ElemontsBattle = {
    state,
    positions,
    update(scene) {
      if (!scene._elemontsLayoutReady) {
        for (let side = 0; side < 2; side++) {
          const actor = scene.getObjects(side ? "Opponent" : "Partner")[0];
          if (actor)
            Object.assign(positions[side], {
              x: actor.getX(),
              y: actor.getY(),
              width: actor.getWidth(),
              height: actor.getHeight(),
            });
        }
        scene._elemontsLayoutReady = true;
      }
      const now = Date.now();
      const vertical = scene.getGame().getGameResolutionHeight() / 1200;
      const size = Math.min(1, vertical);
      for (let side = 0; side < 2; side++) {
        const actor = scene.getObjects(side ? "Opponent" : "Partner")[0];
        if (!actor) continue;
        const species = side ? state.enemy : state.species;
        const base = positions[side];
        const event = state.event;
        const elapsed = now - state.eventStartedAt;
        const target = event?.side === side ? 1 - side : side;
        const hit =
          event?.kind === "skill" &&
          event.side !== side &&
          !event.missed &&
          event.damage > 0 &&
          elapsed >= event.hitStart &&
          elapsed < event.hpStart;
        const guard = event?.skill === "guard";
        const melee =
          event?.skill === "tackle" ||
          event?.skill === "struggle" ||
          event?.skill?.startsWith("Netral-");
        const isActing =
          event?.side === side &&
          elapsed >= event.motionStart &&
          elapsed < event.animationEnd;
        const sprite = concept.has(species)
          ? hit && side === 1
            ? "hit"
            : side === 0
              ? "back"
              : "front"
          : "front";
        const animation = `${species}:${sprite}`;
        actor.setAnimationName(animation);
        const frame = window.ElemontsSpriteFrames[animation];
        const scale =
          size * Math.min(base.width / frame[4], base.height / frame[5]);
        let x = base.x,
          y = base.y * vertical;
        let stretch =
          1 + (state.reduced ? 0 : Math.sin(now / 440 + side * 2) * 0.012);
        let opacity = state.fainted?.[side] ? 85 : 255;
        if (isActing && !state.reduced) {
          const progress =
            (elapsed - event.motionStart) /
            (event.animationEnd - event.motionStart);
          if (melee && !guard) {
            const impactAt =
              (event.impact - event.motionStart) /
              (event.animationEnd - event.motionStart);
            const amount =
              progress < impactAt
                ? ease(progress / impactAt)
                : 1 - ease((progress - impactAt) / (1 - impactAt));
            const other = positions[target];
            x += (other.x - base.x) * 0.72 * amount;
            y +=
              (other.y - base.y) * vertical * 0.72 * amount -
              Math.sin(progress * Math.PI) * 30;
          } else {
            y -= Math.sin(progress * Math.PI) * 18;
            stretch += Math.sin(progress * Math.PI) * 0.035;
          }
        }
        if (hit && !state.reduced) {
          const age = elapsed - event.hitStart;
          x += Math.sin(age / 25) * 10 * Math.max(0, 1 - age / 500);
          opacity = Math.floor(age / 65) % 2 ? 130 : 255;
        }
        if (state.entry < (side ? 1 : 2)) opacity = 0;
        else if (state.entry < 3 && !state.reduced) {
          const arrival = ease((now - state.entryStartedAt) / 450);
          x += (side ? 220 : -260) * (1 - arrival);
          opacity *= arrival;
        }
        if (state.fainted?.[side]) {
          y += 28;
          stretch *= 0.7;
        }
        actor.setScaleX(scale / stretch);
        actor.setScaleY(scale * stretch);
        actor.setPosition(x, y);
        actor.setOpacity(opacity);
        actor.setZOrder(side ? 2 : 4);
        const shadow = scene.getObjects(
          side ? "OpponentShadow" : "PartnerShadow",
        )[0];
        if (shadow) {
          shadow.setPosition(
            x - base.width * size * 0.3,
            base.y * vertical - 14,
          );
          shadow.setWidth(base.width * size * 0.6);
          shadow.setHeight(side ? 26 : 38);
          shadow.setOpacity(opacity * 0.8);
        }
      }
      // Stable observability for QA and edit previews; never drives battle rules.
      window.ElemontsBattle.scene = scene;
    },
  };
})();

gdjs.BattleGardenCode = {func: scene => window.ElemontsBattle.update(scene)};
