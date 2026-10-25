import { t } from "../i18n";
import { lazy, Suspense, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeftRight,
  Footprints,
  Package,
  Heart,
  Shield,
  Trophy,
} from "lucide-react";
import { SPECIES, SKILLS, ITEMS, type ItemId } from "../game/data";
import type { Battle as BattleState, BattleAction } from "../game/types";
import { ElementIcon, Meter, Modal, Portrait } from "../components/ui";
const CreatureScene = lazy(() => import("../components/CreatureScene"));
export function BattleScreen({
  battle,
  onAction,
  onFinish,
  inventory,
  waiting = false,
  onForfeit,
}: {
  battle: BattleState;
  onAction: (a: BattleAction) => void;
  onFinish: () => void;
  inventory?: Record<ItemId, number>;
  waiting?: boolean;
  onForfeit?: () => void;
}) {
  const [menu, setMenu] = useState<"switch" | "bag" | null>(null);
  const [captureFx, setCaptureFx] = useState<number>();
  const ours = battle.teams[0][battle.active[0]],
    enemy = battle.teams[1][battle.active[1]],
    noPP = ours.pp.every((p) => p <= 0);
  const send = (a: BattleAction) => {
    if (a.type === "capture") setCaptureFx(Date.now());
    onAction(a);
    setMenu(null);
  };
  return (
    <div className="battle-page">
      <div className="page-heading">
        <div>
          <h1>
            {t(
              battle.mode === "wild"
                ? "Pertemuan di Nusaraya."
                : battle.mode === "duel"
                  ? "Duel persahabatan."
                  : battle.mode === "gym"
                    ? `Gym ${battle.gym === 5 ? `Final · Babak ${(battle.round ?? 0) + 1}/3` : (battle.gym ?? 0) + 1}`
                    : "Latihan bersama Trainer.",
            )}
          </h1>
          <p>
            {t(
              battle.mode === "wild"
                ? "Lemahkan, tangkap, dan temukan teman baru."
                : battle.mode === "duel"
                  ? "Tanpa bonus makanan dan dekorasi."
                  : "Setiap pertandingan membuat kalian lebih dekat.",
            )}
          </p>
        </div>
        <span className="turn-label">
          {t("Giliran ")}
          {t(battle.turn)}
        </span>
      </div>
      <section className="battle-stage">
        {t(
          captureFx && (
            <motion.div
              key={captureFx}
              className="capture-fx"
              aria-hidden="true"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: [0, 90, 155],
                y: [0, -100, -25],
                rotate: [0, 180, 360],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onAnimationComplete={() => setCaptureFx(undefined)}
            >
              <svg viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="#f8edd2"
                  stroke="#2e5138"
                  strokeWidth="3"
                />
                <path d="M3 24a21 21 0 0 1 42 0Z" fill="#76a14e" />
                <path d="M3 24h42" stroke="#2e5138" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="7"
                  fill="#fff8dd"
                  stroke="#2e5138"
                  strokeWidth="3"
                />
              </svg>
            </motion.div>
          ),
        )}
        <img
          className="scene-background"
          src="/art/nusaraya.png"
          alt={t("Arena alam Nusaraya")}
        />
        <div className="health-panels">
          {t(
            [ours, enemy].map((f, i) => (
              <div className={`health-panel side-${i}`} key={i}>
                <div>
                  <strong>{t(SPECIES[f.monster.species].name)}</strong>
                  <span>
                    <ElementIcon element={SPECIES[f.monster.species].element} />
                    {t(" ")}
                    {t("Lv. ")}
                    {t(f.monster.level)}
                  </span>
                </div>
                <Meter
                  value={f.hp}
                  max={f.maxHp}
                  color={f.hp / f.maxHp < 0.3 ? "#c94c3e" : "#6a913e"}
                  label={t(`HP ${SPECIES[f.monster.species].name}`)}
                />
                <small>
                  {t(f.hp)}
                  {t(" / ")}
                  {t(f.maxHp)}
                  {t(" HP")}
                  {t(" ")}
                  {t(
                    f.status
                      ? `· ${f.status === "burn" ? "Terbakar" : "Melambat"}`
                      : "",
                  )}
                  {t(f.guard ? " · Bertahan" : "")}
                </small>
              </div>
            )),
          )}
        </div>
        <Suspense
          fallback={
            <div className="scene-loading">{t("Menyiapkan arena…")}</div>
          }
        >
          <CreatureScene
            species={ours.monster.species}
            enemy={enemy.monster.species}
            react={battle.turn}
            room={false}
          />
        </Suspense>
      </section>
      <div className="battle-console">
        <div className="battle-log" role="log" aria-live="polite">
          {t(
            battle.log
              .slice(-3)
              .map((line, i) => <p key={`${battle.turn}-${i}`}>{t(line)}</p>),
          )}
        </div>
        {t(
          battle.result ? (
            <div className="battle-result">
              <Trophy size={29} />
              <div>
                <h2>
                  {t(
                    {
                      win: "Kemenangan yang manis!",
                      loss: "Istirahat, lalu coba lagi.",
                      draw: "Pertandingan berakhir seri.",
                      captured: "Selamat datang, teman baru!",
                      escaped: "Berhasil pulang.",
                    }[battle.result],
                  )}
                </h2>
                <p>
                  {t(
                    battle.result === "win"
                      ? battle.mode === "wild"
                        ? "EXP dibagi rata kepada peserta. Setiap peserta memakai 1 energi."
                        : battle.mode === "trainer"
                          ? "Hadiah: 100 gold dan intimasi peserta."
                          : battle.mode === "gym" &&
                              battle.gym === 5 &&
                              (battle.round ?? 0) < 2
                            ? "HP dan skill pulih. Lanjutkan babak berikutnya."
                            : battle.mode === "gym"
                              ? "Medali Gym dan 300 gold menantimu."
                              : "Duel selesai. Progres koleksi tetap."
                      : battle.result === "captured"
                        ? "Monster baru memiliki 5 energi. Energi tim tidak berkurang."
                        : battle.result === "loss" || battle.result === "draw"
                          ? "HP akan pulih setelah battle."
                          : "Energi tim tidak berkurang.",
                  )}
                </p>
              </div>
              <button className="button primary" onClick={onFinish}>
                {t(
                  battle.mode === "gym" &&
                    battle.result === "win" &&
                    battle.gym === 5 &&
                    (battle.round ?? 0) < 2
                    ? "Babak berikutnya"
                    : "Selesai",
                )}
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="action-heading">
                <h3>
                  {t(
                    waiting
                      ? "Menunggu pilihan lawan…"
                      : ours.hp <= 0
                        ? "Pilih monster berikutnya."
                        : `Apa yang akan ${SPECIES[ours.monster.species].name} lakukan?`,
                  )}
                </h3>
                {t(
                  onForfeit && (
                    <button className="text-button" onClick={onForfeit}>
                      {t("Menyerah")}
                    </button>
                  ),
                )}
              </div>
              <div className="move-grid">
                {t(
                  ours.monster.skills.map((id, i) => {
                    const skill = SKILLS[id];
                    return (
                      <button
                        key={id}
                        className="move-button"
                        disabled={waiting || ours.hp <= 0 || ours.pp[i] === 0}
                        onClick={() => send({ type: "skill", index: i })}
                      >
                        <ElementIcon element={skill.element} size={23} />
                        <div>
                          <strong>{t(skill.name)}</strong>
                          <small>
                            {t(
                              skill.power
                                ? `${skill.power} power · ${skill.accuracy}% akurasi`
                                : "Kurangi damage serangan berikutnya",
                            )}
                          </small>
                        </div>
                        <span>
                          {t(ours.pp[i])}
                          {t("/")}
                          {t(skill.pp)}
                        </span>
                      </button>
                    );
                  }),
                )}
              </div>
              {t(
                noPP && (
                  <button
                    className="button orange"
                    disabled={waiting || ours.hp <= 0}
                    onClick={() => send({ type: "skill", index: -1 })}
                  >
                    {t("Usaha terakhir")}
                  </button>
                ),
              )}
              <div className="battle-tools">
                <button disabled={waiting} onClick={() => setMenu("switch")}>
                  <ArrowLeftRight size={20} />
                  {t(" Ganti monster")}
                </button>
                {t(
                  battle.mode !== "duel" && (
                    <button
                      disabled={waiting || ours.hp <= 0}
                      onClick={() => setMenu("bag")}
                    >
                      <Package size={20} />
                      {t(" Tas")}
                    </button>
                  ),
                )}
                {t(
                  battle.mode === "wild" && (
                    <button
                      disabled={waiting || ours.hp <= 0}
                      onClick={() => send({ type: "run" })}
                    >
                      <Footprints size={20} />
                      {t(" Kabur")}
                    </button>
                  ),
                )}
                <span>
                  <Shield size={16} />
                  {t(" Tim")}
                  {t(" ")}
                  {t(battle.teams[0].filter((f) => f.hp > 0).length)}
                  {t("/")}
                  {t(battle.teams[0].length)}
                </span>
              </div>
            </>
          ),
        )}
      </div>
      {t(
        menu && (
          <Modal
            title={t(
              menu === "switch" ? "Pilih teman bertarung" : "Tas petualang",
            )}
            onClose={() => setMenu(null)}
          >
            {t(
              menu === "switch" ? (
                <div className="item-list">
                  {t(
                    battle.teams[0].map((f, i) => (
                      <button
                        className="item-row"
                        key={f.monster.uid}
                        disabled={f.hp <= 0 || i === battle.active[0]}
                        onClick={() => send({ type: "switch", index: i })}
                      >
                        <Portrait species={f.monster.species} />
                        <span>
                          <strong>{t(SPECIES[f.monster.species].name)}</strong>
                          <small>
                            {t("Lv. ")}
                            {t(f.monster.level)}
                            {t(" · HP ")}
                            {t(f.hp)}
                            {t("/")}
                            {t(f.maxHp)}
                          </small>
                        </span>
                        {t(
                          i === battle.active[0] ? (
                            "Aktif"
                          ) : f.hp <= 0 ? (
                            "KO"
                          ) : (
                            <ArrowRight size={18} />
                          ),
                        )}
                      </button>
                    )),
                  )}
                </div>
              ) : (
                <div className="item-list">
                  {t(
                    battle.mode === "wild" &&
                      (["moco", "prime", "element", "genesis"] as ItemId[]).map(
                        (id) => (
                          <button
                            key={id}
                            className="item-row"
                            disabled={!inventory?.[id]}
                            onClick={() =>
                              send({ type: "capture", capsule: id })
                            }
                          >
                            <Package size={24} />
                            <span>
                              <strong>{t(ITEMS[id].name)}</strong>
                              <small>{t(ITEMS[id].description)}</small>
                            </span>
                            <b>
                              {t("×")}
                              {t(inventory?.[id] ?? 0)}
                            </b>
                          </button>
                        ),
                      ),
                  )}
                  <button
                    className="item-row"
                    disabled={!inventory?.potion || ours.hp === ours.maxHp}
                    onClick={() => send({ type: "potion" })}
                  >
                    <Heart size={24} />
                    <span>
                      <strong>{t("Ramuan pulih")}</strong>
                      <small>{t("+35 HP, menggunakan satu giliran.")}</small>
                    </span>
                    <b>
                      {t("×")}
                      {t(inventory?.potion ?? 0)}
                    </b>
                  </button>
                </div>
              ),
            )}
          </Modal>
        ),
      )}
    </div>
  );
}
