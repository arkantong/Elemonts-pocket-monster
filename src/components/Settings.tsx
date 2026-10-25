import { t } from "../i18n";
import { useState } from "react";
import { Download, Upload, Volume2, VolumeX, Trash2 } from "lucide-react";
import { useGame } from "../game/context";
import { emptySave, parseSave, SAVE_KEY } from "../game/state";
import { Modal } from "./ui";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useLanguage } from "../i18n/LanguageProvider";
import { LanguageOptions } from "../i18n/LanguagePicker";
export function Settings({ close }: { close: () => void }) {
  const { language, chooseLanguage } = useLanguage();
  const { save, act, notify, replace, storageError } = useGame(),
    [reset, setReset] = useState(false);
  const exportSave = async () => {
    try {
      const data = storageError
        ? (localStorage.getItem(SAVE_KEY) ?? "{}")
        : JSON.stringify(save, null, 2);
      const name = `elemonts-${new Date().toISOString().slice(0, 10)}.json`;
      if (Capacitor.isNativePlatform()) {
        const file = await Filesystem.writeFile({
          path: name,
          data,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: t("Cadangan Elemonts"),
          url: file.uri,
          dialogTitle: t("Simpan cadangan petualangan"),
        });
        return;
      }
      const blob = new Blob([data], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      notify("Cadangan belum tersimpan. Coba ekspor kembali.");
    }
  };
  return (
    <Modal title={t("Pengaturan")} onClose={close}>
      <h3>{language === "en" ? "Language" : "Bahasa"}</h3>
      <LanguageOptions value={language} onChange={chooseLanguage} />
      <p className="muted">
        {t(
          "Progres tersimpan otomatis di perangkat ini. Simpan cadangan sebelum menghapus data aplikasi.",
        )}
      </p>
      {t(storageError && <p className="notice">{t(storageError)}</p>)}
      <button className="item-row" onClick={() => act({ type: "sound" })}>
        {t(save.sound ? <Volume2 /> : <VolumeX />)}
        <span>
          <strong>{t("Efek suara")}</strong>
          <small>{t(save.sound ? "Aktif" : "Nonaktif")}</small>
        </span>
      </button>
      <div className="button-row section-space">
        <button className="button soft" onClick={exportSave}>
          <Download size={18} />
          {t(" Ekspor cadangan")}
        </button>
        <label className="button soft file-input">
          <Upload size={18} />
          {t(" Impor cadangan")}
          <input
            type="file"
            accept="application/json,.json"
            aria-label={t("Impor cadangan")}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 2000000) throw Error("Berkas terlalu besar.");
                const imported = parseSave(JSON.parse(await file.text()));
                delete imported.battle;
                if (
                  !window.confirm(
                    t(
                      "Ganti progres perangkat ini dengan cadangan yang dipilih?",
                    ),
                  )
                )
                  return;
                replace(imported);
                notify("Cadangan berhasil dipulihkan.");
                close();
              } catch {
                notify("Cadangan tidak valid. Progres saat ini tetap aman.");
              }
            }}
          />
        </label>
      </div>
      <p className="small-help">
        {t(
          "Impor mengganti progres saat ini. Battle yang sedang berlangsung tidak diimpor.",
        )}
      </p>
      <button
        className="text-button danger section-space"
        onClick={() => setReset(true)}
      >
        <Trash2 size={16} />
        {t(" Mulai petualangan baru")}
      </button>
      {t(
        reset && (
          <div className="confirm-box">
            <p>
              {t(
                "Seluruh progres lokal akan diganti. Ekspor cadangan dahulu bila ingin menyimpannya.",
              )}
            </p>
            <div className="button-row">
              <button
                className="button danger"
                onClick={() => {
                  replace(emptySave());
                  close();
                }}
              >
                {t("Hapus dan mulai baru")}
              </button>
              <button className="button soft" onClick={() => setReset(false)}>
                {t("Batal")}
              </button>
            </div>
          </div>
        ),
      )}
      <p className="small-help section-space">
        {t("Elemonts 0.1.2 · Prototipe internal")}
        <br />
        {t("Model 3D dan balancing masih dalam tahap penyempurnaan.")}
      </p>
    </Modal>
  );
}
