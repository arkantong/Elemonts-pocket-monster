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
const nav = [
  { id: "rumah", name: "Rumah", icon: HomeIcon },
  { id: "koleksi", name: "Koleksi", icon: PawPrint },
  { id: "jelajah", name: "Jelajah", icon: Compass },
  { id: "arena", name: "Arena", icon: Swords },
  { id: "toko", name: "Toko", icon: Store },
];
export default function App() {
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
  const screen = save.battle ? (
    <BattleScreen
      battle={save.battle}
      inventory={save.inventory}
      onAction={(action) => act({ type: "turn", action })}
      onFinish={() => act({ type: "settle" })}
    />
  ) : tab === "rumah" ? (
    <Home navigate={navigate} />
  ) : tab === "koleksi" ? (
    <Collection />
  ) : tab === "jelajah" ? (
    <Explore />
  ) : tab === "arena" ? (
    <Arena />
  ) : (
    <Shop />
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#rumah" aria-label="Elemonts, rumah">
            <Leaf size={30} />
            <span>Elemonts</span>
          </a>
          <nav aria-label="Navigasi utama">
            {nav.map((n) => (
              <button
                key={n.id}
                className={tab === n.id ? "active" : ""}
                disabled={!!save.battle}
                aria-current={tab === n.id ? "page" : undefined}
                onClick={() => navigate(n.id)}
              >
                <n.icon size={23} />
                <span>{n.name}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-foot">
            <span>Nusaraya</span>
            <small>Rumah untuk setiap elemen.</small>
          </div>
        </aside>
        <div className="app-content">
          <header className="topbar">
            <a className="mobile-brand" href="#rumah">
              <Leaf size={22} />
              <strong>Elemonts</strong>
            </a>
            <span className="desktop-topline">Jurnal petualanganmu</span>
            <div className="top-actions">
              <span className="wallet" aria-label={`${save.gold} gold`}>
                <Coins size={20} />
                {save.gold.toLocaleString("id-ID")}
              </span>
              <span
                className="wallet capsules"
                aria-label={`${save.inventory.moco} Mococapsule`}
              >
                <Package size={19} />
                {save.inventory.moco}
              </span>
              <button
                className="icon-button"
                aria-label="Pengaturan"
                onClick={() => setSettings(true)}
              >
                <SettingsIcon size={21} />
              </button>
            </div>
          </header>
          <main>
            {storageError && (
              <div className="notice" role="alert">
                {storageError}
                <button
                  className="text-button"
                  onClick={() => setSettings(true)}
                >
                  Buka Pengaturan
                </button>
              </div>
            )}
            {save.monsters.length ? (
              screen
            ) : (
              <section className="starter-screen">
                <div className="starter-banner">
                  <img
                    src="/art/nusaraya.png"
                    alt="Selamat datang di pulau Nusaraya"
                  />
                  <div>
                    <h1>
                      Sebuah pulau.
                      <br />
                      Seorang teman.
                      <br />
                      Cerita kalian.
                    </h1>
                    <p>
                      Pilih partner pertamamu dan mulai petualangan di Nusaraya.
                    </p>
                  </div>
                </div>
                <div className="starter-choices">
                  {STARTERS.map((s) => (
                    <button
                      key={s.id}
                      className={starter === s.id ? "selected" : ""}
                      onClick={() => setStarter(s.id)}
                      aria-pressed={starter === s.id}
                    >
                      <Portrait species={s.id} />
                      <h3>{s.name}</h3>
                      <span>
                        <ElementIcon element={s.element} />
                        {s.element}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="starter-confirm">
                  <div>
                    <h2>{SPECIES[starter].name}</h2>
                    <p>{SPECIES[starter].description}</p>
                  </div>
                  <button
                    className="button primary"
                    onClick={() => act({ type: "starter", species: starter })}
                  >
                    Pilih {SPECIES[starter].name}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
        <nav className="bottom-nav" aria-label="Navigasi mobile">
          {nav.map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "active" : ""}
              disabled={!!save.battle}
              aria-current={tab === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={22} />
              <span>{n.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            className="toast"
            role="status"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      {settings && <Settings close={() => setSettings(false)} />}{" "}
      {!!save.monsters.length && !save.tutorial && !storageError && (
        <Modal
          title="Halo, petualang."
          onClose={() => act({ type: "tutorial" })}
        >
          <p>Partner pertamamu sudah menunggu di rumah.</p>
          <ol className="tutorial-list">
            <li>
              <strong>Kenali temanmu.</strong> Sapa monster di rumah dan berikan
              makanan dari tas.
            </li>
            <li>
              <strong>Jelajahi Nusaraya.</strong> Lemahkan monster Wild lalu
              gunakan kapsul untuk menangkapnya.
            </li>
            <li>
              <strong>Bangun timmu.</strong> Bawa maksimal empat monster.
              Peserta battle yang mendapat EXP memakai satu energi.
            </li>
          </ol>
          <button
            className="button primary full"
            onClick={() => act({ type: "tutorial" })}
          >
            Temui partnerku
          </button>
        </Modal>
      )}
    </MotionConfig>
  );
}
