import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { LANGUAGE_KEY, setTranslationLanguage, type Language } from "./index";

type Preference = { language: Language; chosen: boolean };
function loadPreference(): Preference {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === "id" || stored === "en")
      return { language: stored, chosen: true };
  } catch {
    /* Game remains usable when device storage is unavailable. */
  }
  return { language: "en", chosen: false };
}
const Context = createContext<
  Preference & { chooseLanguage: (language: Language) => void }
>(null!);
export const useLanguage = () => useContext(Context);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(() => {
    const initial = loadPreference();
    setTranslationLanguage(initial.language);
    return initial;
  });
  useLayoutEffect(() => {
    document.documentElement.lang = preference.language;
  }, [preference.language]);
  function chooseLanguage(language: Language) {
    setTranslationLanguage(language);
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* Keep session preference. */
    }
    setPreference({ language, chosen: true });
  }
  return (
    <Context.Provider value={{ ...preference, chooseLanguage }}>
      {children}
    </Context.Provider>
  );
}
