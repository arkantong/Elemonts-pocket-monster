import { Compass, ArrowRight, Lock, MapPin } from "lucide-react";
import { useGame } from "../game/context";
import { ROSTER } from "../game/data";
import { Portrait, ElementIcon } from "../components/ui";
export function Explore() {
  const { save, act } = useGame();
  const empty = save.monsters.some(
    (m) => save.team.includes(m.uid) && m.energy < 1,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Di luar sana, teman menanti.</h1>
          <p>Pilih lokasi dan temukan monster yang belum pernah kamu jumpai.</p>
        </div>
        <Compass size={32} />
      </div>
      <div className="explore-hero">
        <img
          src="/art/nusaraya.png"
          alt="Pulau Nusaraya dengan hutan dan sungai"
        />
        <div className="explore-caption">
          <div>
            <span>
              <MapPin size={17} /> Map pertama
            </span>
            <h2>Nusaraya</h2>
            <p>
              Dari padang hangat hingga sungai yang tenang.
              <br />
              Lima elemen hidup bersama di pulau ini.
            </p>
          </div>
          <button
            className="button primary"
            disabled={empty}
            onClick={() => act({ type: "battle", mode: "wild" })}
          >
            Masuk Wild <ArrowRight size={20} />
          </button>
        </div>
      </div>
      {empty && (
        <p className="notice">
          Ada anggota tim dengan energi nol. Pulihkan energi atau ganti anggota
          di Koleksi.
        </p>
      )}
      <div className="section-heading section-space">
        <h2>Jejak kehidupan</h2>
        <span>15 keluarga dapat ditemui</span>
      </div>
      <div className="encounter-strip">
        {ROSTER.filter((m) => m.stage === 1 && m.category !== "Mythical").map(
          (s) => (
            <div key={s.id}>
              <Portrait species={s.id} />
              <strong>{s.name}</strong>
              <small>
                <ElementIcon element={s.element} size={13} />
                {s.rarity}
              </small>
            </div>
          ),
        )}
      </div>
      <p className="quiet-note">
        <Lock size={16} /> Wilayah baru dan event mythical akan menyusul dalam
        update.
      </p>
    </>
  );
}
