import { lazy, Suspense, useState } from "react";
import { ChevronLeft, ChevronRight, Utensils, Heart, Zap, Moon, Users, Gift, CircleDot } from "lucide-react";
import { useGame } from "../game/context";
import { useLanguage } from "../i18n/LanguageProvider";
import { SPECIES, ITEMS, type ItemId } from "../game/data";
import { dayKey, energyCap } from "../game/state";
import { Meter, Modal, Portrait } from "../components/ui";
import { t } from "../i18n";
const CreatureScene = lazy(() => import("../components/CreatureScene"));
export function Home({ navigate }: { navigate: (s: string) => void }) {
  const { save, act, notify } = useGame();
  const { language } = useLanguage();
  const id = language === "id";
  const [food, setFood] = useState(false), [reaction, setReaction] = useState(0),
    [room, setRoom] = useState(0), [team, setTeam] = useState(false),
    [gifts, setGifts] = useState(false), [score, setScore] = useState(0);
  const m = save.monsters.find(m => m.uid === save.team[0])!;
  const s = SPECIES[m.species];
  const rooms = id ? ["Rumah", "Dapur", "Ruang bermain", "Kamar tidur"] : ["Home", "Kitchen", "Playroom", "Bedroom"];
  const claimed = save.claimedDay === dayKey();
  const changeRoom = (next: number) => setRoom((next + rooms.length) % rooms.length);
  return <section className={`pet-home room-${room}`} aria-label={id ? "Rumah partner" : "Partner home"}>
    <div className="pet-needs">
      <div><Zap size={23}/><span>{id ? "Energi" : "Energy"}<Meter value={m.energy} max={energyCap(save,m)} label={id ? "Energi" : "Energy"}/></span><b>{m.energy}/{energyCap(save,m)}</b></div>
      <div><Heart size={23}/><span>{id ? "Intimasi" : "Bond"}<Meter value={m.intimacy} max={100} color="#d87baf" label={id ? "Intimasi" : "Bond"}/></span><b>{m.intimacy}/100</b></div>
    </div>
    <div className="pet-room-nav">
      <button aria-label={id ? "Ruangan sebelumnya" : "Previous room"} onClick={()=>changeRoom(room-1)}><ChevronLeft/></button>
      <h1>{rooms[room]}</h1>
      <button aria-label={id ? "Ruangan berikutnya" : "Next room"} onClick={()=>changeRoom(room+1)}><ChevronRight/></button>
    </div>
    <div className="pet-name"><h2>{s.name}</h2><span>Lv. {m.level}</span></div>
    <div className="pet-stage">
      <img className="pet-room-art" src="/art/home.png" alt=""/>
      <Suspense fallback={<div className="scene-loading">{t("Menyiapkan rumah…")}</div>}><CreatureScene species={m.species} react={reaction}/></Suspense>
      <button className="scene-interact" aria-label={t(`Sapa ${s.name}`)} onClick={()=>{setReaction(r=>r+1);notify(`${s.name}${id ? " senang kamu datang!" : " is happy to see you!"}`);}}/>
      {room===3 && <div className="pet-sleep" aria-hidden="true">Z z z</div>}
      {room===2 && <button className={`pet-ball position-${score%3}`} aria-label={id ? "Tangkap bola" : "Catch the ball"} onClick={()=>{setScore(v=>v+1);setReaction(r=>r+1);}}><CircleDot size={44}/></button>}
      <button className="pet-gift" aria-label={id ? "Hadiah harian" : "Daily gift"} onClick={()=>setGifts(true)}><Gift size={22}/></button>
    </div>
    <div className="pet-room-action" aria-live="polite">
      {room===0 ? <p>{id ? "Sentuh partner untuk menyapanya." : "Tap your partner to say hello."}</p>
      : room===1 ? <button className="button primary" onClick={()=>setFood(true)}><Utensils size={18}/>{id ? "Pilih makanan" : "Choose food"}</button>
      : room===2 ? <p>{id ? "Tangkap bola" : "Catch the ball"} · {score}</p>
      : <p>{id ? "Waktunya tenang. Energi pulih bertahap seperti biasa." : "Quiet time. Energy recovers gradually as usual."}</p>}
    </div>
    <nav className="pet-actions" aria-label={id ? "Aktivitas partner" : "Partner activities"}>
      {[{icon:Utensils,label:id?"Makan":"Food",target:1},{icon:CircleDot,label:id?"Main":"Play",target:2},{icon:Moon,label:id?"Istirahat":"Rest",target:3}].map(a=><button key={a.target} aria-pressed={room===a.target} onClick={()=>setRoom(a.target)}><span><a.icon size={28}/></span>{a.label}</button>)}
      <button onClick={()=>setTeam(true)}><span><Users size={28}/></span>{id ? "Tim" : "Team"}</button>
    </nav>
    {team && <Modal title={id ? "Pilih partner" : "Choose partner"} onClose={()=>setTeam(false)}><div className="team-slots">{save.team.map(uid=>{const member=save.monsters.find(v=>v.uid===uid);return member && <button className="team-slot" key={uid} onClick={()=>{act({type:"lead",uid});setTeam(false);}}><Portrait species={member.species}/><strong>{SPECIES[member.species].name}</strong><small>Lv. {member.level}</small></button>;})}</div><button className="button soft" onClick={()=>navigate("koleksi")}>{id ? "Kelola tim" : "Manage team"}</button></Modal>}
    {gifts && <Modal title={id ? "Hadiah harian" : "Daily gift"} onClose={()=>setGifts(false)}><p>{t("Tiga Mococapsule gratis setiap hari. Reset pukul 05.00 WIB.")}</p><button className="button primary" disabled={claimed} onClick={()=>act({type:"claim"})}>{t(claimed ? "Sudah diambil" : "Ambil hadiah")}</button></Modal>}
      {t(
        food && (
          <Modal
            title={t(`Makanan untuk ${s.name}`)}
            onClose={() => setFood(false)}
          >
            <p className="muted">
              {t("Pilih makanan dari tasmu. Kamu bisa membeli lagi di toko.")}
            </p>
            <div className="item-list">
              {t(
                Object.entries(ITEMS)
                  .filter(([, v]) => v.type === "food")
                  .map(([id, item]) => (
                    <button
                      key={id}
                      className="item-row"
                      disabled={!save.inventory[id as ItemId]}
                      onClick={() => {
                        if (
                          act({ type: "feed", uid: m.uid, item: id as ItemId })
                        ) {
                          setReaction((r) => r + 1);
                          notify(`${s.name} menikmati ${item.name}.`);
                        }
                      }}
                    >
                      <Utensils size={23} />
                      <span>
                        <strong>{t(item.name)}</strong>
                        <small>{t(item.description)}</small>
                      </span>
                      <b>
                        {t("×")}
                        {t(save.inventory[id as ItemId])}
                      </b>
                    </button>
                  )),
              )}
            </div>
          </Modal>
        ),
      )}
  </section>;
}
