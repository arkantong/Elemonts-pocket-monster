import { useLanguage } from "../i18n/LanguageProvider";
import { useGame } from "../game/context";
import { useBattlePlayback } from "../game/useBattlePlayback";
import { BattleEffects } from "../components/BattleEffects";
import { CaptureGuide } from "../components/CaptureGuide";
import { t } from "../i18n";
import { useState, useEffect, type CSSProperties } from "react";
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
import { SPECIES, SKILLS, ITEMS, COLORS, type ItemId } from "../game/data";
import type { Battle as BattleState, BattleAction } from "../game/types";
import { ElementIcon, Meter, Modal, Portrait } from "../components/ui";
import { BattleScene2D } from "../components/BattleScene2D";
export function BattleScreen({
  battle: incoming,
  onAction,
  onFinish,
  inventory,
  waiting: remoteWaiting = false,
  onForfeit,
}: {
  battle: BattleState;
  onAction: (a: BattleAction) => void;
  onFinish: () => void;
  inventory?: Record<ItemId, number>;
  waiting?: boolean;
  onForfeit?: () => void;
}) {
  const { save, act } = useGame();
  const { language } = useLanguage();
  const [entry, setEntry] = useState(incoming.turn === 1 ? 0 : 3);
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    if (incoming.turn !== 1) {
      setEntry(3);
      return;
    }
    setEntry(0);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const times = reduced ? [80, 160, 300] : [400, 1050, 1850];
    const timers = times.map((ms, i) => setTimeout(() => setEntry(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [incoming.id]);
  const lesson =
    save.battle?.id === incoming.id &&
    !!save.captureTutorial &&
    save.captureTutorial !== "done";
  const { battle, event, playing, phase } = useBattlePlayback(
    incoming,
    save.sound,
  );
  const animating =
    playing || incoming.turn !== battle.turn || incoming.id !== battle.id;
  const waiting = remoteWaiting || animating || entry < 3 || !sceneReady;
  const [menu, setMenu] = useState<"switch" | "bag" | null>(() =>
    lesson && save.captureTutorial === "capsule" ? "bag" : null,
  );
  const [captureFx, setCaptureFx] = useState<number>();
  const ours = battle.teams[0][battle.active[0]],
    enemy = battle.teams[1][battle.active[1]],
    noPP = ours.pp.every((p) => p <= 0);
  const send = (a: BattleAction) => {
    if (waiting) return;
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
      <section
        className="battle-stage"
        aria-busy={animating || entry < 3 || !sceneReady}
        data-entry={entry}
        data-phase={phase}
      >
        {entry === 0 && (
          <div className="battle-entry-wipe" aria-hidden="true" />
        )}
        <BattleEffects event={event} />
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
          <BattleScene2D
            species={ours.monster.species}
            enemy={enemy.monster.species}
            event={event}
            entry={entry}
            fainted={[ours.hp <= 0, enemy.hp <= 0]}
            onReady={setSceneReady}
          />
      </section>
      <div className="battle-console">
        <div className="battle-log" role="log" aria-live="polite">
          {entry < 3 ? (
            <p>
              {language === "id"
                ? entry < 2
                  ? `${SPECIES[enemy.monster.species].name} muncul!`
                  : `Ayo, ${SPECIES[ours.monster.species].name}!`
                : entry < 2
                  ? `${SPECIES[enemy.monster.species].name} appeared!`
                  : `Go, ${SPECIES[ours.monster.species].name}!`}
            </p>
          ) : event?.skill && phase !== "result" ? (
            <p>
              {
                SPECIES[
                  battle.teams[event.side][battle.active[event.side]].monster
                    .species
                ].name
              }{" "}
              {language === "id" ? "menggunakan" : "used"}{" "}
              {t(SKILLS[event.skill].name)}!
            </p>
          ) : (
            battle.log
              .slice(-3)
              .map((line, i) => <p key={`${battle.turn}-${i}`}>{t(line)}</p>)
          )}
        </div>
        {lesson && !battle.result && (
          <CaptureGuide step={save.captureTutorial} pending={animating} />
        )}
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
                    animating
                      ? "Serangan berlangsung…"
                      : waiting
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
                        style={
                          {
                            "--skill-color": COLORS[skill.element],
                          } as CSSProperties
                        }
                        className={`move-button ${lesson && save.captureTutorial === "weaken" && i === 0 ? "capture-target" : ""}`}
                        disabled={
                          waiting ||
                          ours.hp <= 0 ||
                          ours.pp[i] === 0 ||
                          (lesson &&
                            (save.captureTutorial !== "weaken" || i !== 0))
                        }
                        onClick={() => send({ type: "skill", index: i })}
                      >
                        {id === "guard" ? (
                          <Shield className="skill-icon" size={23} />
                        ) : (
                          <ElementIcon element={skill.element} size={23} />
                        )}
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
                <button
                  disabled={waiting || lesson}
                  onClick={() => setMenu("switch")}
                >
                  <ArrowLeftRight size={20} />
                  {t(" Ganti monster")}
                </button>
                {t(
                  battle.mode !== "duel" && (
                    <button
                      className={
                        lesson && save.captureTutorial === "bag"
                          ? "capture-target"
                          : undefined
                      }
                      disabled={
                        waiting ||
                        ours.hp <= 0 ||
                        (lesson && save.captureTutorial !== "bag")
                      }
                      onClick={() => {
                        if (
                          lesson &&
                          !act({ type: "capture-guide", step: "capsule" })
                        )
                          return;
                        setMenu("bag");
                      }}
                    >
                      <Package size={20} />
                      {t(" Tas")}
                    </button>
                  ),
                )}
                {t(
                  battle.mode === "wild" && (
                    <button
                      disabled={waiting || ours.hp <= 0 || lesson}
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
            onClose={() => {
              if (lesson && menu === "bag")
                act({ type: "capture-guide", step: "bag" });
              setMenu(null);
            }}
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
                  {lesson && <CaptureGuide step="capsule" />}
                  {t(
                    battle.mode === "wild" &&
                      (["moco", "prime", "element", "genesis"] as ItemId[]).map(
                        (id) => (
                          <button
                            key={id}
                            className={`item-row ${lesson && id === "moco" ? "capture-target" : ""}`}
                            disabled={
                              waiting ||
                              !inventory?.[id] ||
                              (lesson && id !== "moco")
                            }
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
                    disabled={
                      waiting ||
                      lesson ||
                      !inventory?.potion ||
                      ours.hp === ours.maxHp
                    }
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
