import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayingEvent } from "../game/useBattlePlayback";
import { CONCEPT_MONSTERS, monsterPortrait } from "../game/visuals";
import { SPECIES } from "../game/data";
import { useLanguage } from "../i18n/LanguageProvider";

export function BattleScene2D({
  species,
  enemy,
  event,
  entry,
  fainted,
  onReady,
}: {
  species: string;
  enemy: string;
  event?: PlayingEvent;
  entry: number;
  fainted: [boolean, boolean];
  onReady: (ready: boolean) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const { language } = useLanguage();
  const eventClock = useRef({ key: event?.key, startedAt: Date.now() });
  if (eventClock.current.key !== event?.key)
    eventClock.current = { key: event?.key, startedAt: Date.now() };
  const latest = useRef({
    species,
    enemy,
    event,
    entry,
    fainted,
    eventStartedAt: eventClock.current.startedAt,
  });
  latest.current = {
    species,
    enemy,
    event,
    entry,
    fainted,
    eventStartedAt: eventClock.current.startedAt,
  };
  const sync = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      {
        type: "elemonts:battle-state",
        ...latest.current,
        reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      },
      window.location.origin === "null" ? "*" : window.location.origin,
    );
  }, []);
  useEffect(() => {
    const receive = (message: MessageEvent) => {
      if (
        message.source !== frame.current?.contentWindow ||
        message.origin !== location.origin
      )
        return;
      if (message.data?.type === "elemonts:scene-ready") {
        setStatus("ready");
        sync();
      } else if (message.data?.type === "elemonts:scene-error")
        setStatus("fallback");
    };
    window.addEventListener("message", receive);
    const timeout = setTimeout(
      () => setStatus((s) => (s === "loading" ? "fallback" : s)),
      15000,
    );
    return () => {
      window.removeEventListener("message", receive);
      clearTimeout(timeout);
    };
  }, [sync]);
  useEffect(sync, [
    sync,
    species,
    enemy,
    event?.key,
    entry,
    fainted[0],
    fainted[1],
  ]);
  useEffect(() => onReady(status !== "loading"), [status, onReady]);
  return (
    <div
      className="battle-scene-2d"
      data-engine={status === "ready" ? "gdevelop" : status}
    >
      <div className="battle-2d-fallback" aria-hidden="true">
        <img
          src={
            CONCEPT_MONSTERS.has(species)
              ? `/art/monsters-2d/${species}-back.png`
              : monsterPortrait(species)
          }
          className="sprite-player"
          alt=""
        />
        <img
          src={
            CONCEPT_MONSTERS.has(enemy)
              ? `/art/monsters-2d/${enemy}-front.png`
              : monsterPortrait(enemy)
          }
          className="sprite-enemy"
          alt=""
        />
      </div>
      {status !== "fallback" && (
        <iframe
          ref={frame}
          src="/gdevelop/index.html"
          title={language === "id" ? "Arena battle 2D" : "2D battle arena"}
          tabIndex={-1}
          onError={() => setStatus("fallback")}
        />
      )}
      <span className="sr-only">
        {SPECIES[species].name} / {SPECIES[enemy].name}
      </span>
    </div>
  );
}
