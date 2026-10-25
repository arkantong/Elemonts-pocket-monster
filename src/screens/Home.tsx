import { t, formatLocale } from "../i18n";
import { lazy, Suspense, useState } from "react";
import {
  ArrowRight,
  Heart,
  Zap,
  Gift,
  Utensils,
  Hand,
  Compass,
  Plus,
  Leaf,
} from "lucide-react";
import { useGame } from "../game/context";
import { SPECIES, ITEMS, type ItemId } from "../game/data";
import { dayKey, energyCap, neededExp } from "../game/state";
import { ElementIcon, Meter, Modal, Portrait } from "../components/ui";
const CreatureScene = lazy(() => import("../components/CreatureScene"));
export function Home({ navigate }: { navigate: (s: string) => void }) {
  const { save, act, notify } = useGame(),
    [food, setFood] = useState(false),
    [reaction, setReaction] = useState(0);
  const m = save.monsters.find((m) => m.uid === save.team[0])!,
    s = SPECIES[m.species];
  const claimed = save.claimedDay === dayKey();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{t("Selamat datang di rumah.")}</h1>
          <p>{t("Petualangan besar dimulai dari teman kecil.")}</p>
        </div>
        <span className="home-time">
          <Leaf size={16} />
          {t(" Rumah Nusaraya")}
        </span>
      </div>
      <div className="home-layout">
        <div className="home-main">
          <div className="home-scene">
            <img
              className="scene-background"
              src="/art/home.png"
              alt={t("Rumah kayu tropis yang hangat di Nusaraya")}
            />
            <Suspense
              fallback={
                <div className="scene-loading">{t("Menyiapkan rumah…")}</div>
              }
            >
              <CreatureScene species={m.species} react={reaction} />
            </Suspense>
            <button
              className="scene-interact"
              aria-label={t(`Sapa ${s.name}`)}
              onClick={() => {
                setReaction((r) => r + 1);
                notify(`${s.name} senang kamu datang!`);
              }}
            />
            <div className="scene-note">{t("Rumah kecil, cerita besar.")}</div>
            {t(
              save.decor && (
                <div className="decor-status">
                  <Leaf size={16} />
                  {t(" Kebun embun aktif")}
                </div>
              ),
            )}
          </div>
          <section className="partner-panel">
            <div className="partner-intro">
              <Portrait species={m.species} />
              <div>
                <h2>{t(s.name)}</h2>
                <div className="level-line">
                  <ElementIcon element={s.element} />
                  <strong>
                    {t("Lv. ")}
                    {t(m.level)}
                  </strong>
                  <Meter
                    value={m.exp}
                    max={neededExp(m.level)}
                    color="#d8773e"
                    label={t("EXP")}
                  />
                  <small>
                    {t(m.exp)}
                    {t(" / ")}
                    {t(neededExp(m.level))}
                  </small>
                </div>
                <p>{t(s.description)}</p>
              </div>
            </div>
            <div className="partner-care">
              <div className="stat-line">
                <Zap size={17} />
                <span>{t("Energi")}</span>
                <Meter
                  value={m.energy}
                  max={energyCap(save, m)}
                  label={t("Energi")}
                />
                <small>
                  {t(m.energy)}
                  {t(" / ")}
                  {t(energyCap(save, m))}
                </small>
              </div>
              <div className="stat-line">
                <Heart size={17} />
                <span>{t("Intimasi")}</span>
                <Meter
                  value={m.intimacy}
                  max={100}
                  color="#d87b85"
                  label={t("Intimasi")}
                />
                <small>
                  {t(m.intimacy)}
                  {t(" / 100")}
                </small>
              </div>
              <div className="button-row">
                <button className="button orange" onClick={() => setFood(true)}>
                  <Utensils size={18} />
                  {t(" Beri makan")}
                </button>
                <button
                  className="button soft"
                  onClick={() => {
                    setReaction((r) => r + 1);
                    notify(`${s.name} melompat menyambutmu.`);
                  }}
                >
                  <Hand size={18} />
                  {t(" Ajak bermain")}
                </button>
              </div>
            </div>
          </section>
        </div>
        <aside className="home-aside">
          <section className="team-panel">
            <div className="section-heading">
              <h2>{t("Tim petualang")}</h2>
              <button
                className="text-button"
                onClick={() => navigate("koleksi")}
              >
                {t("Kelola tim ")}
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="team-slots">
              {t(
                Array.from({ length: 4 }, (_, i) => {
                  const member = save.monsters.find(
                    (m) => m.uid === save.team[i],
                  );
                  return member ? (
                    <button
                      key={member.uid}
                      className={`team-slot ${i === 0 ? "selected" : ""}`}
                      onClick={() => act({ type: "lead", uid: member.uid })}
                      aria-label={t(
                        `Jadikan ${SPECIES[member.species].name} partner`,
                      )}
                    >
                      <Portrait species={member.species} />
                      <span>
                        <ElementIcon
                          element={SPECIES[member.species].element}
                          size={14}
                        />
                        {t(" ")}
                        {t("Lv. ")}
                        {t(member.level)}
                      </span>
                    </button>
                  ) : (
                    <button
                      className="empty-slot"
                      key={i}
                      onClick={() => navigate("jelajah")}
                      aria-label={t("Cari teman baru")}
                    >
                      <Plus size={23} />
                      <small>{t("Teman baru")}</small>
                    </button>
                  );
                }),
              )}
            </div>
          </section>
          <section className="map-preview">
            <img
              src="/art/nusaraya.png"
              alt={t("Sungai dan pegunungan tropis Nusaraya")}
            />
            <div className="map-title">
              <Compass size={33} />
              <div>
                <h2>{t("Nusaraya")}</h2>
                <p>
                  {t("Tanah luas, elemen yang hidup,")}
                  <br />
                  {t("dan cerita yang menantimu.")}
                </p>
              </div>
            </div>
            <button
              className="button primary"
              onClick={() => navigate("jelajah")}
            >
              {t("Jelajahi Wild ")}
              <ArrowRight size={18} />
            </button>
          </section>
        </aside>
      </div>
      <section className="mail-strip">
        <div className="gift-icon">
          <Gift size={29} />
        </div>
        <div>
          <h3>{t("Kiriman untuk petualang")}</h3>
          <p>
            {t("Tiga Mococapsule gratis setiap hari. Reset pukul 05.00 WIB.")}
          </p>
        </div>
        <button
          className={`button ${claimed ? "soft" : "primary"}`}
          disabled={claimed}
          onClick={() => {
            if (act({ type: "claim" }))
              notify("Tiga Mococapsule masuk ke tasmu.");
          }}
        >
          {t(claimed ? "Sudah diambil" : "Ambil hadiah")}
        </button>
      </section>
      {t(
        save.buff && (
          <p className="buff-note">
            <Leaf size={16} />
            {t(" ")}
            {t(save.buff.type === "rare" ? "Buah pelangi" : "Daun penuntun")}
            {t(" aktif sampai")}
            {t(" ")}
            {t(
              new Date(save.buff.until).toLocaleTimeString(formatLocale(), {
                hour: "2-digit",
                minute: "2-digit",
              }),
            )}
            {t(".")}
          </p>
        ),
      )}
      {t(
        food && (
          <Modal
            title={t(`Makanan untuk ${s.name}`)}
            onClose={() => setFood(false)}
          >
            <p className="muted">
              {t("Pilih makanan dari tasmu. Kamu bisa membeli lagi di toko.")}
            </p>
            <div className="item-list">
              {t(
                Object.entries(ITEMS)
                  .filter(([, v]) => v.type === "food")
                  .map(([id, item]) => (
                    <button
                      key={id}
                      className="item-row"
                      disabled={!save.inventory[id as ItemId]}
                      onClick={() => {
                        if (
                          act({ type: "feed", uid: m.uid, item: id as ItemId })
                        ) {
                          setReaction((r) => r + 1);
                          notify(`${s.name} menikmati ${item.name}.`);
                        }
                      }}
                    >
                      <Utensils size={23} />
                      <span>
                        <strong>{t(item.name)}</strong>
                        <small>{t(item.description)}</small>
                      </span>
                      <b>
                        {t("×")}
                        {t(save.inventory[id as ItemId])}
                      </b>
                    </button>
                  )),
              )}
            </div>
          </Modal>
        ),
      )}
    </>
  );
}
