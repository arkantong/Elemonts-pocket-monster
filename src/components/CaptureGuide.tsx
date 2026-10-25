import { useEffect, useRef } from "react";
import { Compass, Package, Sparkles } from "lucide-react";
import { useGame } from "../game/context";
import type { Save } from "../game/types";
import { SPECIES } from "../game/data";
import { t } from "../i18n";
import { Modal, Portrait } from "./ui";

const steps = {
  explore: {
    number: 1,
    title: "Temukan teman di Wild",
    text: "Tekan Masuk Wild. Monster liar dapat ditangkap; monster milik Trainer dan pemain lain tidak bisa.",
  },
  weaken: {
    number: 2,
    title: "Lemahkan, jangan sampai KO",
    text: "Tekan Terjang pada skill pertama. HP yang lebih rendah membuat monster lebih mudah ditangkap. Dalam latihan ini, lawan tidak akan KO.",
  },
  bag: {
    number: 3,
    title: "Sekarang buka Tas",
    text: "HP lawan sudah berkurang. Tekan Tas untuk menemukan kapsul penangkap. Jangan serang lagi hingga lawan KO.",
  },
  capsule: {
    number: 4,
    title: "Pilih Mococapsule",
    text: "Tekan Mococapsule untuk menangkap monster. Satu kapsul dipakai setiap percobaan. Tangkapan latihan ini dijamin berhasil; setelah tutorial, tangkapan bisa gagal.",
  },
} as const;

export function CaptureGuide({
  step,
  pending = false,
}: {
  step: Save["captureTutorial"];
  pending?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const content =
    step && step in steps ? steps[step as keyof typeof steps] : undefined;
  useEffect(() => {
    if (content && !pending)
      ref.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [step, pending, !!content]);
  if (!content) return null;
  return (
    <section
      ref={ref}
      className="capture-guide"
      aria-label={t("Panduan menangkap")}
      aria-live="polite"
    >
      <div className="capture-guide-label">
        <Compass size={18} />
        <strong>{t("Latihan wajib")}</strong>
        <span>{content.number}/4</span>
      </div>
      <h2>{t(pending ? "Tunggu aksi selesai…" : content.title)}</h2>
      <p>
        {t(
          pending
            ? "Perhatikan gerakan monster dan perubahan HP. Panduan berikutnya muncul setelah animasi selesai."
            : content.text,
        )}
      </p>
      <div className="capture-guide-progress" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= content.number ? "filled" : ""} />
        ))}
      </div>
    </section>
  );
}

export function CaptureLessonModal({ onComplete }: { onComplete: () => void }) {
  const { save, act } = useGame();
  if (save.captureTutorial === "intro")
    return (
      <Modal
        title={t("Ayo tangkap teman pertamamu!")}
        onClose={() => {}}
        dismissible={false}
      >
        <div className="capture-welcome-icon">
          <Package size={34} />
        </div>
        <p>
          {t(
            "Partner pertamamu sudah siap. Sekarang kita akan berlatih menangkap satu monster Wild bersama-sama.",
          )}
        </p>
        <ol className="tutorial-list">
          <li>
            <strong>{t("Masuk Wild.")}</strong>{" "}
            {t("Temukan monster liar di Jelajah.")}
          </li>
          <li>
            <strong>{t("Kurangi HP-nya.")}</strong>{" "}
            {t("Gunakan serangan tanpa membuat lawan KO.")}
          </li>
          <li>
            <strong>{t("Tas → Mococapsule.")}</strong>{" "}
            {t("Tangkap monster, lalu lihat teman barumu di Koleksi.")}
          </li>
        </ol>
        <p className="quiet-note">
          {t(
            "Latihan ini wajib diselesaikan sebelum petualangan bebas. Progres tersimpan jika kamu menutup game.",
          )}
        </p>
        <button
          className="button primary full"
          onClick={() => act({ type: "tutorial" })}
        >
          {t("Mulai latihan menangkap")}
        </button>
      </Modal>
    );
  if (save.captureTutorial !== "caught" || save.battle) return null;
  const friend = save.monsters.at(-1)!;
  return (
    <Modal
      title={t("Tangkapan pertamamu berhasil!")}
      onClose={() => {}}
      dismissible={false}
    >
      <div className="capture-new-friend">
        <Portrait species={friend.species} />
        <strong>{t(SPECIES[friend.species].name)}</strong>
        <Sparkles size={24} />
      </div>
      <p>
        {t(
          "Teman barumu sudah masuk Koleksi dan timmu. Sekarang kamu siap menjelajah sendiri.",
        )}
      </p>
      <p>
        {t(
          "Ingat: kurangi HP tanpa membuat lawan KO, buka Tas, lalu gunakan kapsul. Penangkapan berikutnya tidak selalu berhasil dan kapsul tetap terpakai.",
        )}
      </p>
      <button
        className="button primary full"
        onClick={() => {
          if (act({ type: "capture-guide", step: "done" })) onComplete();
        }}
      >
        {t("Lihat teman baruku")}
      </button>
    </Modal>
  );
}
