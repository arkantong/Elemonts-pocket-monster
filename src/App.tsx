import { APPEARANCE } from "./game/appearance";
import { t, formatLocale } from "./i18n";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  Home as HomeIcon,
  Compass,
  Swords,
  Store,
  PawPrint,
  Settings as SettingsIcon,
  Coins,
  Package,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { App as NativeApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useGame } from "./game/context";
import { STARTERS, SPECIES } from "./game/data";
import { Home } from "./screens/Home";
import { Explore } from "./screens/Explore";
import { Collection } from "./screens/Collection";
import { Shop } from "./screens/Shop";
import { Arena } from "./screens/Arena";
import { BattleScreen } from "./screens/Battle";
import { Settings } from "./components/Settings";
import { Portrait, ElementIcon, Modal } from "./components/ui";
import { useLanguage } from "./i18n/LanguageProvider";
import { LanguagePicker } from "./i18n/LanguagePicker";
import { CaptureLessonModal } from "./components/CaptureGuide";
const nav = [
  { id: "rumah", name: "Rumah", icon: HomeIcon },
  { id: "koleksi", name: "Koleksi", icon: PawPrint },
  { id: "jelajah", name: "Jelajah", icon: Compass },
  { id: "arena", name: "Arena", icon: Swords },
  { id: "toko", name: "Toko", icon: Store },
];
export default function App() {
  const { chosen } = useLanguage();
  const { save, act, toast, storageError } = useGame(),
    [tab, setTab] = useState(() =>
      nav.some((n) => n.id === location.hash.slice(1))
        ? location.hash.slice(1)
        : "rumah",
    ),
    [settings, setSettings] = useState(false),
    [starter, setStarter] = useState("pyroo");
  const navigate = (id: string) => {
    location.hash = id;
    setTab(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const change = () => {
      const id = location.hash.slice(1);
      if (nav.some((n) => n.id === id)) setTab(id);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = NativeApp.addListener("backButton", () => {
      const dialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      if (dialog) {
        dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
        return;
      }
      if (settings) setSettings(false);
      else if (tab !== "rumah") navigate("rumah");
      else NativeApp.minimizeApp();
    });
    return () => {
      listener.then((l) => l.remove());
    };
  }, [settings, tab]);
  const lessonActive =
    !!save.captureTutorial &&
    save.captureTutorial !== "done" &&
    !!save.monsters.length;
  const activeTab = lessonActive
    ? save.captureTutorial === "intro"
      ? "rumah"
      : "jelajah"
    : tab;
  const screen = save.battle ? (
    <BattleScreen
      battle={save.battle}
      inventory={save.inventory}
      onAction={(action) => act({ type: "turn", action })}
      onFinish={() => act({ type: "settle" })}
    />
  ) : activeTab === "rumah" ? (
    <Home navigate={navigate} />
  ) : activeTab === "koleksi" ? (
    <Collection />
  ) : activeTab === "jelajah" ? (
    <Explore />
  ) : activeTab === "arena" ? (
    <Arena />
  ) : (
    <Shop />
  );
  if (!chosen) return <LanguagePicker />;
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#rumah" aria-label={t("Elemonts, rumah")}>
            <Leaf size={30} />
            <span>{t("Elemonts")}</span>
          </a>
          <nav aria-label={t("Navigasi utama")}>
            {t(
              nav.map((n) => (
                <button
                  key={n.id}
                  className={activeTab === n.id ? "active" : ""}
                  disabled={!!save.battle || lessonActive}
                  aria-current={activeTab === n.id ? "page" : undefined}
                  onClick={() => navigate(n.id)}
                >
                  <n.icon size={23} />
                  <span>{t(n.name)}</span>
                </button>
              )),
            )}
          </nav>
          <div className="sidebar-foot">
            <span>{t("Nusaraya")}</span>
            <small>{t("Rumah untuk setiap elemen.")}</small>
          </div>
        </aside>
        <div className="app-content">
          <header className="topbar">
            <a className="mobile-brand" href="#rumah">
              <Leaf size={22} />
              <strong>{t("Elemonts")}</strong>
            </a>
            <span className="desktop-topline">{t("Jurnal petualanganmu")}</span>
            <div className="top-actions">
              <span className="wallet" aria-label={t(`${save.gold} gold`)}>
                <Coins size={20} />
                {t(save.gold.toLocaleString(formatLocale()))}
              </span>
              <span
                className="wallet capsules"
                aria-label={t(`${save.inventory.moco} Mococapsule`)}
              >
                <Package size={19} />
                {t(save.inventory.moco)}
              </span>
              <button
                className="icon-button"
                aria-label={t("Pengaturan")}
                onClick={() => setSettings(true)}
              >
                <SettingsIcon size={21} />
              </button>
            </div>
          </header>
          <main>
            {t(
              storageError && (
                <div className="notice" role="alert">
                  {t(storageError)}
                  <button
                    className="text-button"
                    onClick={() => setSettings(true)}
                  >
                    {t("Buka Pengaturan")}
                  </button>
                </div>
              ),
            )}
            {t(
              save.monsters.length ? (
                screen
              ) : (
                <section className="starter-screen">
                  <div className="starter-banner">
                    <img
                      src="/art/nusaraya.png"
                      alt={t("Selamat datang di pulau Nusaraya")}
                    />
                    <div>
                      <h1>
                        {t("Sebuah pulau.")}
                        <br />
                        {t("Seorang teman.")}
                        <br />
                        {t("Cerita kalian.")}
                      </h1>
                      <p>
                        {t(
                          "Pilih partner pertamamu dan mulai petualangan di Nusaraya.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="starter-choices">
                    {t(
                      STARTERS.map((s) => (
                        <button
                          key={s.id}
                          className={starter === s.id ? "selected" : ""}
                          onClick={() => setStarter(s.id)}
                          aria-pressed={starter === s.id}
                        >
                          <Portrait species={s.id} />
                          <h3>{t(s.name)}</h3>
                          <span>
                            <ElementIcon element={s.element} />
                            {t(s.element)}
                          </span>
                        </button>
                      )),
                    )}
                  </div>
                  <div className="starter-confirm">
                    <div>
                      <h2>{t(SPECIES[starter].name)}</h2>
                      <p>{t(APPEARANCE[starter].signature)}</p>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => act({ type: "starter", species: starter })}
                    >
                      {t("Pilih ")}
                      {t(SPECIES[starter].name)}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </section>
              ),
            )}
          </main>
        </div>
        <nav className="bottom-nav" aria-label={t("Navigasi mobile")}>
          {t(
            nav.map((n) => (
              <button
                key={n.id}
                className={activeTab === n.id ? "active" : ""}
                disabled={!!save.battle || lessonActive}
                aria-current={activeTab === n.id ? "page" : undefined}
                onClick={() => navigate(n.id)}
              >
                <n.icon size={22} />
                <span>{t(n.name)}</span>
              </button>
            )),
          )}
        </nav>
      </div>
      <AnimatePresence>
        {t(
          toast && (
            <motion.div
              key={toast}
              className="toast"
              role="status"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {t(toast)}
            </motion.div>
          ),
        )}
      </AnimatePresence>
      {t(settings && <Settings close={() => setSettings(false)} />)}
      {!storageError && lessonActive && (
        <CaptureLessonModal onComplete={() => navigate("koleksi")} />
      )}
      {t(" ")}
      {t(
        !!save.monsters.length &&
          !save.tutorial &&
          !save.captureTutorial &&
          !storageError && (
            <Modal
              title={t("Halo, petualang.")}
              onClose={() => act({ type: "tutorial" })}
            >
              <p>{t("Partner pertamamu sudah menunggu di rumah.")}</p>
              <ol className="tutorial-list">
                <li>
                  <strong>{t("Kenali temanmu.")}</strong>
                  {t(" Sapa monster di rumah dan berikan makanan dari tas.")}
                </li>
                <li>
                  <strong>{t("Jelajahi Nusaraya.")}</strong>
                  {t(
                    " Lemahkan monster Wild lalu gunakan kapsul untuk menangkapnya.",
                  )}
                </li>
                <li>
                  <strong>{t("Bangun timmu.")}</strong>
                  {t(
                    " Bawa maksimal empat monster. Peserta battle yang mendapat EXP memakai satu energi.",
                  )}
                </li>
              </ol>
              <button
                className="button primary full"
                onClick={() => act({ type: "tutorial" })}
              >
                {t("Temui partnerku")}
              </button>
            </Modal>
          ),
      )}
    </MotionConfig>
  );
}
