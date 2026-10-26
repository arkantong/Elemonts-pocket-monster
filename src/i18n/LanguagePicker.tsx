import { MusicToggle } from "../components/Music";
import { BrandMark } from "../components/BrandMark";
import { useState } from "react";
import { Check, Globe, Leaf, ArrowRight } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import type { Language } from "./index";

export function LanguageOptions({
  value,
  onChange,
}: {
  value: Language;
  onChange: (value: Language) => void;
}) {
  return (
    <div
      className="language-options"
      role="group"
      aria-label="Language / Bahasa"
    >
      {(["en", "id"] as const).map((language) => (
        <button
          key={language}
          type="button"
          className={`language-option ${value === language ? "selected" : ""}`}
          lang={language}
          aria-pressed={value === language}
          onClick={() => onChange(language)}
        >
          <span>
            <strong>
              {language === "en" ? "English" : "Bahasa Indonesia"}
            </strong>
            <small>{language === "en" ? "English" : "Indonesian"}</small>
          </span>
          {value === language && <Check size={22} aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
export function LanguagePicker() {
  const { language, chooseLanguage } = useLanguage();
  const [selected, setSelected] = useState(language);
  return (
    <main className="language-screen">
      <div className="language-card">
        <div className="opening-music">
          <MusicToggle />
        </div>
        <div className="language-brand">
          <BrandMark size={48} /> Elemonts
        </div>
        <Globe className="language-globe" size={40} aria-hidden="true" />
        <h1>Choose your language</h1>
        <p lang="id">Pilih bahasa petualanganmu.</p>
        <LanguageOptions value={selected} onChange={setSelected} />
        <button
          className="button primary full"
          onClick={() => chooseLanguage(selected)}
        >
          {selected === "en" ? "Continue" : "Lanjutkan"}{" "}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <p className="small-help">
          You can change this in Settings.
          <br />
          <span lang="id">Bisa diganti lagi di Pengaturan.</span>
        </p>
      </div>
    </main>
  );
}
