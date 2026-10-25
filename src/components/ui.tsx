import { t } from "../i18n";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Flame,
  Droplets,
  Zap,
  Mountain,
  Feather,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { COLORS, SPECIES, type Element } from "../game/data";
export function ElementIcon({
  element,
  size = 18,
}: {
  element: Element;
  size?: number;
}) {
  const Icon = {
    Api: Flame,
    Air: Droplets,
    Listrik: Zap,
    Tanah: Mountain,
    Netral: Feather,
    Holy: Sun,
    Dark: Moon,
  }[element];
  return <Icon aria-hidden="true" size={size} color={COLORS[element]} />;
}
export function Portrait({
  species,
  className = "",
}: {
  species: string;
  className?: string;
}) {
  const s = SPECIES[species],
    index = ["Api", "Air", "Listrik", "Tanah", "Netral"].indexOf(s.element);
  return (
    <div
      className={`portrait ${className} stage-${s.stage}`}
      style={{ backgroundColor: `${COLORS[s.element]}18` }}
    >
      <div
        style={{
          backgroundImage: "url(/art/starters.png)",
          backgroundPosition: `${Math.max(0, index) * 25}% 50%`,
        }}
        role="img"
        aria-label={t(s.name)}
      />
      {t(s.stage > 1 && <small>{t(s.stage === 2 ? "II" : "III")}</small>)}
    </div>
  );
}
export function Meter({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      className="meter"
      role="progressbar"
      aria-label={t(label)}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span
        style={{
          width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
          background: color,
        }}
      />
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const focus = document.activeElement;
    return () => {
      d?.close();
      if (focus instanceof HTMLElement) focus.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{t(title)}</h2>
        <button
          className="icon-button"
          aria-label={t("Tutup")}
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </header>
      {t(children)}
    </dialog>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{t(title)}</h3>
      <p>{t(children)}</p>
    </div>
  );
}
