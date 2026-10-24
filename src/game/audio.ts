import { Howl } from "howler";
let sounds: Record<string, Howl> | undefined;
export function playSound(
  kind: "tap" | "hit" | "win" | "feed",
  enabled: boolean,
) {
  if (!enabled) return;
  sounds ??= Object.fromEntries(
    ["tap", "hit", "win", "feed"].map((k) => [
      k,
      new Howl({ src: [`/audio/${k}.wav`], volume: 0.2 }),
    ]),
  );
  sounds[kind]?.play();
}
