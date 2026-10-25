import { useEffect, useRef, useState } from "react";
import type { Battle, BattleEvent } from "./types";
import { playSound } from "./audio";
export type PlayingEvent = BattleEvent & {
  key: string;
  duration: number;
  impact: number;
};
export function useBattlePlayback(incoming: Battle, sound: boolean) {
  const [view, setView] = useState(incoming),
    [event, setEvent] = useState<PlayingEvent>(),
    [playing, setPlaying] = useState(false);
  const seen = useRef(`${incoming.id}:${incoming.turn}`),
    latest = useRef(incoming),
    soundRef = useRef(sound);
  latest.current = incoming;
  soundRef.current = sound;
  useEffect(() => {
    const key = `${incoming.id}:${incoming.turn}`;
    if (key === seen.current) return;
    const sameBattle = seen.current.startsWith(incoming.id + ":");
    seen.current = key;
    if (!sameBattle || !incoming.frames?.length) {
      setView(incoming);
      setEvent(undefined);
      setPlaying(false);
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 450 : 1250,
      impact = reduced ? 150 : 650;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setPlaying(true);
    incoming.frames.forEach((frame, i) => {
      timers.push(
        setTimeout(
          () =>
            setEvent({ ...frame.event, key: `${key}:${i}`, duration, impact }),
          i * duration,
        ),
      );
      timers.push(
        setTimeout(
          () => {
            setView({ ...incoming, ...frame, result: undefined });
            if (frame.event.damage) playSound("hit", soundRef.current);
          },
          i * duration + impact,
        ),
      );
    });
    timers.push(
      setTimeout(() => {
        setView(latest.current);
        setPlaying(false);
        setEvent(undefined);
      }, incoming.frames.length * duration),
    );
    return () => timers.forEach(clearTimeout);
  }, [incoming.id, incoming.turn]);
  return { battle: view, event, playing };
}
