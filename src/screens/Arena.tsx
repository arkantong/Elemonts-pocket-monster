import { useState } from "react";
import { Swords, Trophy, Lock, Check, Ticket, ArrowRight } from "lucide-react";
import { useGame } from "../game/context";
import { BALANCE, ELEMENTS } from "../game/data";
import { ElementIcon } from "../components/ui";
import { Duel } from "./Duel";
export function Arena() {
  const { save, act } = useGame(),
    [tab, setTab] = useState("Trainer");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Saatnya unjuk keberanian.</h1>
          <p>Berlatih bersama, raih medali, atau tantang temanmu.</p>
        </div>
        <Swords size={31} />
      </div>
      <div className="filter-tabs">
        {["Trainer", "Gym", "Duel"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Trainer" ? (
        <section className="trainer-panel">
          <div className="trainer-art">
            <Swords size={88} strokeWidth={1} />
            <div className="trainer-leaves">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div>
            <h2>
              Latihan kecil,
              <br />
              ikatan yang besar.
            </h2>
            <p>
              Hadapi Trainer acak untuk mendapatkan gold dan intimasi. Tanpa
              EXP, tanpa biaya energi.
            </p>
            <div className="training-remaining">
              <Ticket size={22} />
              <strong>
                {Math.max(
                  0,
                  BALANCE.trainerLimit + save.trainerBonus - save.trainerUsed,
                )}
              </strong>
              <span>kesempatan tersisa hari ini</span>
            </div>
            <button
              className="button primary"
              disabled={
                save.trainerUsed >= BALANCE.trainerLimit + save.trainerBonus
              }
              onClick={() => act({ type: "battle", mode: "trainer" })}
            >
              Temui Trainer <ArrowRight size={19} />
            </button>
            <small>
              Reset setiap pukul 05.00 WIB. Tiket tambahan tersedia di toko.
            </small>
          </div>
        </section>
      ) : tab === "Gym" ? (
        <>
          <p className="muted">
            Empat monster dalam tim harus memenuhi level dan intimasi. Raih
            medali secara berurutan.
          </p>
          <div className="gym-grid">
            {Array.from({ length: 6 }, (_, i) => {
              const done = save.medals.includes(i),
                locked = i > save.medals.length;
              return (
                <article
                  className={`gym-card ${locked ? "locked" : ""}`}
                  key={i}
                >
                  <div className="gym-emblem">
                    {i < 5 ? (
                      <ElementIcon element={ELEMENTS[i]} size={42} />
                    ) : (
                      <Trophy size={42} />
                    )}
                  </div>
                  <span>{i === 5 ? "Final Cup" : `Gym ${i + 1}`}</span>
                  <h2>
                    {i === 5 ? "Mahkota Nusaraya" : `Medali ${ELEMENTS[i]}`}
                  </h2>
                  <p>
                    Lv. {BALANCE.gymLevels[i]} · Intimasi{" "}
                    {BALANCE.gymIntimacy[i]}
                    <br />
                    {i === 5
                      ? "Tiga pertandingan berturut-turut"
                      : "Satu pertandingan melawan tim Gym"}
                  </p>
                  <button
                    className="button soft"
                    disabled={locked}
                    onClick={() => act({ type: "battle", mode: "gym", gym: i })}
                  >
                    {locked ? (
                      <>
                        <Lock size={16} />
                        Terkunci
                      </>
                    ) : done ? (
                      <>
                        <Check size={16} />
                        Tanding ulang
                      </>
                    ) : (
                      "Tantang Gym"
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <Duel />
      )}
    </>
  );
}
