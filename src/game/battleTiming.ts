import type { BattleEvent } from "./types";
/** GBA refresh rate; source reference and adaptation notes in docs/design/LEAFGREEN-BATTLE.md. */
export const gbaFrames = (frames: number) =>
  Math.round((frames * 1000) / 59.7275);
export function battleTiming(event: BattleEvent, reduced = false) {
  const melee =
    event.skill === "tackle" ||
    event.skill === "struggle" ||
    event.skill?.startsWith("Netral-");
  const tier = event.skill?.endsWith("-2")
    ? 2
    : event.skill?.endsWith("-1")
      ? 1
      : 0;
  const motionStart = reduced ? 180 : 900;
  const contact = reduced
    ? 100
    : melee
      ? gbaFrames(6)
      : gbaFrames(24 + tier * 8);
  const animationEnd =
    motionStart + (reduced ? 220 : melee ? 420 : 650 + tier * 200);
  const hitStart = animationEnd;
  const hpStart =
    hitStart +
    (event.damage && !event.missed ? (reduced ? 100 : gbaFrames(32)) : 0);
  const hpDuration =
    event.damage || event.kind === "potion" ? (reduced ? 180 : 400) : 0;
  const resultStart = hpStart + hpDuration;
  const duration =
    resultStart +
    (reduced
      ? 200
      : event.critical || event.missed || event.ko
        ? gbaFrames(64)
        : 450);
  return {
    motionStart,
    impact: motionStart + contact,
    animationEnd,
    hitStart,
    hpStart,
    hpDuration,
    resultStart,
    duration,
  };
}
