import appearances from "../game/appearance.json" with { type: "json" };
const visualPalette = Object.fromEntries(
  appearances.map((a) => [a.id, a.palette[0]]),
);
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
import { monsterPortrait } from "../game/visuals";
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
  const s = SPECIES[species];
  return (
    <div
      className={`portrait ${className} stage-${s.stage}`}
      style={{ backgroundColor: `${visualPalette[species]}38` }}
    >
      <div
        role="img"
        aria-label={s.name}
        style={{
          backgroundImage: `url(${monsterPortrait(species)})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {s.stage > 1 && <small>{s.stage === 2 ? "II" : "III"}</small>}
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
  dismissible = true,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  dismissible?: boolean;
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
      onKeyDown={(e) => {
        if (!dismissible && e.key === "Escape") e.preventDefault();
      }}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{t(title)}</h2>
        {dismissible && (
          <button
            className="icon-button"
            aria-label={t("Tutup")}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        )}
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
