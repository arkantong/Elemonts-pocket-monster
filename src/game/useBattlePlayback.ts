import { useEffect, useRef, useState } from "react";
import type { Battle, BattleEvent } from "./types";
import { playSound } from "./audio";
import { battleTiming } from "./battleTiming";
export type PlayingEvent = BattleEvent &
  ReturnType<typeof battleTiming> & { key: string };
export type PlaybackPhase =
  "idle" | "announce" | "motion" | "hit" | "hp" | "result";
export function useBattlePlayback(incoming: Battle, sound: boolean) {
  const [view, setView] = useState(incoming),
    [event, setEvent] = useState<PlayingEvent>(),
    [playing, setPlaying] = useState(false),
    [phase, setPhase] = useState<PlaybackPhase>("idle");
  const seen = useRef(`${incoming.id}:${incoming.turn}`),
    latest = useRef(incoming),
    displayed = useRef(view),
    soundRef = useRef(sound);
  latest.current = incoming;
  displayed.current = view;
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
      setPhase("idle");
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (time: number, callback: () => void) =>
      timers.push(setTimeout(callback, time));
    setPlaying(true);
    let offset = 0;
    incoming.frames.forEach((frame, i) => {
      const timing = battleTiming(frame.event, reduced);
      const before = i ? incoming.frames![i - 1] : displayed.current;
      at(offset, () => {
        setEvent({ ...frame.event, ...timing, key: `${key}:${i}` });
        setPhase("announce");
      });
      at(offset + timing.motionStart, () => setPhase("motion"));
      at(offset + timing.impact, () => {
        if (frame.event.damage) playSound("hit", soundRef.current);
      });
      at(offset + timing.hitStart, () => setPhase("hit"));
      at(offset + timing.hpStart, () => setPhase("hp"));
      const steps = timing.hpDuration ? 12 : 1;
      for (let step = 1; step <= steps; step++) {
        at(offset + timing.hpStart + (timing.hpDuration * step) / steps, () => {
          const teams = frame.teams.map((team, side) =>
            team.map((fighter, index) => {
              const previous = before.teams[side][index];
              const hp =
                previous?.monster.uid === fighter.monster.uid
                  ? Math.round(
                      previous.hp + ((fighter.hp - previous.hp) * step) / steps,
                    )
                  : fighter.hp;
              return { ...fighter, hp };
            }),
          ) as Battle["teams"];
          setView({
            ...incoming,
            ...frame,
            teams,
            log: before.log,
            result: undefined,
          });
        });
      }
      at(offset + timing.resultStart, () => {
        setView({ ...incoming, ...frame, result: undefined });
        setPhase("result");
      });
      offset += timing.duration;
    });
    at(offset, () => {
      setView(latest.current);
      setPlaying(false);
      setEvent(undefined);
      setPhase("idle");
    });
    return () => timers.forEach(clearTimeout);
  }, [incoming.id, incoming.turn]);
  return { battle: view, event, playing, phase };
}
