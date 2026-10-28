import type { CSSProperties } from "react";
import { SKILLS, COLORS } from "../game/data";
import type { PlayingEvent } from "../game/useBattlePlayback";
import { t } from "../i18n";
export function BattleEffects({ event }: { event?: PlayingEvent }) {
  if (!event) return null;
  const move = event.skill ? SKILLS[event.skill] : undefined;
  const element = move?.element ?? "Netral";
  const tier = event.skill?.endsWith("-2")
    ? 2
    : event.skill?.endsWith("-1")
      ? 1
      : 0;
  const guard = event.skill === "guard",
    melee =
      ["tackle", "struggle"].includes(event.skill ?? "") ||
      element === "Netral";
  const style = {
    "--fx-color": COLORS[element],
    "--fx-time": `${event.duration}ms`,
    "--fx-impact": `${event.impact}ms`,
    "--fx-start": `${event.motionStart}ms`,
    "--fx-motion": `${event.animationEnd - event.motionStart}ms`,
    "--fx-travel": `${(event.impact - event.motionStart) / 0.8}ms`,
    "--fx-result": `${event.hpStart}ms`,
  } as CSSProperties;
  const count = guard ? 1 : tier === 2 ? 16 : tier === 1 ? 10 : 6;
  return (
    <div
      key={event.key}
      className={`battle-fx element-${element} tier-${tier} ${event.side === 1 ? "from-right" : ""} ${guard ? "guard-fx" : ""} ${melee ? "melee-fx" : ""} ${event.missed ? "miss-fx" : ""}`}
      style={style}
      aria-hidden="true"
      data-skill={event.skill ?? event.kind}
    >
      <div className="skill-announcement">
        {t(
          move?.name ??
            (
              {
                switch: "Ganti monster",
                potion: "Ramuan pulih",
                capture: "Kapsul",
                run: "Kabur",
              } as Record<string, string>
            )[event.kind],
        )}
      </div>
      {event.kind === "skill" && (
        <svg viewBox="0 0 400 230" preserveAspectRatio="none">
          <g
            transform={
              event.side === 0
                ? "matrix(1.205,-.179,0,1,-38.5,24.8)"
                : "matrix(-1.205,.284,0,1,443.5,-67.8)"
            }
          >
            <g className="fx-charge">
              <circle cx="105" cy="150" r="22" />
              <circle cx="105" cy="150" r="33" />
            </g>
            {guard ? (
              <ellipse
                className="fx-shield"
                cx="105"
                cy="140"
                rx="44"
                ry="62"
              />
            ) : (
              <>
                {Array.from({ length: count }, (_, i) => (
                  <g
                    key={i}
                    className="fx-projectile"
                    style={
                      {
                        "--i": i,
                        "--spread": `${(i - count / 2) * 5}px`,
                      } as CSSProperties
                    }
                  >
                    {element === "Listrik" ? (
                      <path d="M0 -14 L-8 1 L2 0 L-5 16 L14 -4 L3 -3 Z" />
                    ) : element === "Tanah" ? (
                      <path d="M-10 -7 L3 -12 L12 -2 L7 10 L-8 8 Z" />
                    ) : element === "Netral" ? (
                      <path d="M-18 10 Q-5 -16 20 -12 Q0 -4 -18 10" />
                    ) : element === "Holy" ? (
                      <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" />
                    ) : (
                      <ellipse
                        rx={element === "Air" ? 8 : 11}
                        ry={element === "Api" ? 17 : 10}
                      />
                    )}
                  </g>
                ))}
                {tier > 0 && (
                  <path
                    className="fx-beam"
                    d={
                      element === "Listrik"
                        ? "M105 150 L150 128 L170 158 L208 128 L238 150 L295 140"
                        : "M105 150 Q200 110 295 140"
                    }
                  />
                )}
                {!event.missed && (
                  <g className="fx-impact">
                    <circle cx="295" cy="140" r="29" />
                    <circle cx="295" cy="140" r="46" />
                    {Array.from({ length: 10 }, (_, i) => (
                      <path
                        key={i}
                        d="M295 96 L295 77"
                        transform={`rotate(${i * 36} 295 140)`}
                      />
                    ))}
                  </g>
                )}
              </>
            )}
          </g>
        </svg>
      )}
      <div className={`fx-result ${event.side === 1 ? "target-left" : ""}`}>
        {event.missed
          ? t("Meleset")
          : guard
            ? t("Bertahan")
            : event.damage
              ? `${event.critical ? "CRITICAL · " : ""}−${event.damage}${event.ko ? " · KO" : ""}`
              : event.kind === "potion"
                ? "+HP"
                : ""}
      </div>
    </div>
  );
}
