import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { loadSave, SAVE_KEY, transition, type Action } from "./state";
import type { Save } from "./types";
import { playSound } from "./audio";
type GameContext = {
  save: Save;
  act: (a: Action) => boolean;
  notify: (s: string) => void;
  replace: (s: Save) => void;
  toast: string;
  storageError: string;
};
const Context = createContext<GameContext>(null!);
export const useGame = () => useContext(Context);
export function GameProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadSave),
    [save, setSave] = useState(loaded.save),
    [toast, setToast] = useState(""),
    [storageError, setStorageError] = useState(loaded.error ?? "");
  const current = useRef(save),
    blocked = useRef(!!loaded.error);
  current.current = save;
  const notify = (s: string) => setToast(s);
  useEffect(() => {
    if (blocked.current) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      setStorageError(
        "Penyimpanan penuh atau tidak tersedia. Ekspor cadangan melalui Pengaturan.",
      );
    }
  }, [save]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const resume = () => {
      if (!document.hidden && !blocked.current)
        setSave((s) => transition(s, { type: "refresh" }));
    };
    document.addEventListener("visibilitychange", resume);
    const t = setInterval(() => {
      if (!blocked.current) setSave((s) => transition(s, { type: "refresh" }));
    }, 60000);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);
  const act = (a: Action) => {
    if (blocked.current) {
      notify("Pulihkan atau unduh simpanan lama melalui Pengaturan dahulu.");
      return false;
    }
    try {
      const next = transition(current.current, a);
      current.current = next;
      setSave(next);
      playSound(
        a.type === "turn"
          ? "hit"
          : a.type === "feed"
            ? "feed"
            : a.type === "settle"
              ? "win"
              : "tap",
        next.sound,
      );
      return true;
    } catch (e) {
      notify(e instanceof Error ? e.message : "Aksi gagal. Coba lagi.");
      return false;
    }
  };
  const replace = (s: Save) => {
    blocked.current = false;
    setStorageError("");
    current.current = s;
    setSave(s);
  };
  return (
    <Context.Provider
      value={{ save, act, notify, replace, toast, storageError }}
    >
      {children}
    </Context.Provider>
  );
}
