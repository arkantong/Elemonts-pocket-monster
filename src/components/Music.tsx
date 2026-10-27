import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Music2, VolumeX } from "lucide-react";
import { App as NativeApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useGame } from "../game/context";
import { useLanguage } from "../i18n/LanguageProvider";
const KEY = "elemonts.music.v1";
const Context = createContext({ enabled: true, toggle: () => {} });
export function MusicProvider({ children }: { children: ReactNode }) {
  const { save } = useGame();
  const { chosen } = useLanguage();
  const [tab, setTab] = useState(() => location.hash.slice(1) || "rumah");
  useEffect(() => {
    const update = () => setTab(location.hash.slice(1) || "rumah");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const lesson = save.captureTutorial && save.captureTutorial !== "done";
  const route = lesson ? (save.captureTutorial === "intro" ? "rumah" : "jelajah") : tab;
  const track = !chosen ? "01-welcome-to-elemonts"
    : !save.monsters.length ? "02-our-first-friend"
    : save.battle ? (save.battle.mode === "wild" ? "06-a-wild-encounter" : null)
    : route === "rumah" ? "03-home-in-nusaraya"
    : route === "koleksi" ? "04-pocket-companions"
    : route === "jelajah" ? "05-beyond-the-garden" : null;
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== "off";
    } catch {
      return true;
    }
  });
  const audio = useRef<HTMLAudioElement | null>(null);
  const allowed = useRef(false),
    foreground = useRef(true);
  allowed.current = enabled && !!track;
  useEffect(() => {
    const player = new Audio();
    audio.current = player;
    player.loop = true;
    player.volume = 0.3;
    player.preload = "none";
    const sync = () => {
      if (allowed.current && foreground.current && !document.hidden)
        void player.play().catch(() => {
          /* Autoplay unlock is retried on user interaction. */
        });
      else player.pause();
    };
    const visibility = () => sync();
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerdown", sync);
    document.addEventListener("keydown", sync);
    const listener = Capacitor.isNativePlatform()
      ? NativeApp.addListener("appStateChange", ({ isActive }) => {
          foreground.current = isActive;
          sync();
        })
      : null;
    sync();
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerdown", sync);
      document.removeEventListener("keydown", sync);
      void listener?.then((l) => l.remove());
      player.pause();
      player.removeAttribute("src");
      player.load();
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.pause();
    if (track) player.src = `/audio/music/bgm-${track}.m4a`;
    else player.removeAttribute("src");
    player.load();
    if (allowed.current && foreground.current && !document.hidden)
      void player.play().catch(() => {});
    else player.pause();
  }, [track]);
  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    if (allowed.current && foreground.current && !document.hidden) void player.play().catch(() => {});
    else player.pause();
  }, [enabled]);
  const toggle = () => {
    const next = !enabled;
    allowed.current = next && !!track;
    setEnabled(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      /* Keep session preference. */
    }
    if (!allowed.current) audio.current?.pause();
    else if (!document.hidden) void audio.current?.play().catch(() => {});
  };
  return (
    <Context.Provider value={{ enabled, toggle }}>{children}</Context.Provider>
  );
}
export function MusicToggle({ settings = false }: { settings?: boolean }) {
  const { enabled, toggle } = useContext(Context),
    { language } = useLanguage(),
    id = language === "id";
  const action = id
    ? enabled
      ? "Matikan musik"
      : "Nyalakan musik"
    : enabled
      ? "Turn music off"
      : "Turn music on";
  return (
    <button
      type="button"
      className={settings ? "item-row" : "icon-button music-toggle"}
      onClick={toggle}
      aria-label={action}
      aria-pressed={enabled}
      title={action}
    >
      {enabled ? <Music2 size={21} /> : <VolumeX size={21} />}
      {settings && (
        <span>
          <strong>{id ? "Musik latar" : "Background music"}</strong>
          <small>
            {id ? (enabled ? "Aktif" : "Nonaktif") : enabled ? "On" : "Off"}
          </small>
        </span>
      )}
    </button>
  );
}
