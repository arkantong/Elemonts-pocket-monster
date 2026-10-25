import { describe, expect, it } from 'vitest';
import { createBattle, resolveTurn } from '../src/game/battle';
import { makeMonster } from '../src/game/state';
import { SKILLS } from '../src/game/data';

describe('ordered battle presentation',()=>{
 it('emits the actual skill and intermediate HP for every existing skill',()=>{
  for(const skill of Object.values(SKILLS)){
   const ours=makeMonster('pyroo',30),enemy=makeMonster('mippo',1);
   ours.skills=[skill.id,'guard','tackle'];
   const before=createBattle('wild',[ours],[enemy]);
   const after=resolveTurn(before,{type:'skill',index:0},{type:'skill',index:2},()=>.1);
   const frame=after.frames!.find(f=>f.event.side===0)!;
   expect(frame.event.skill).toBe(skill.id);
   expect(frame.active).toEqual(before.active);
   expect(frame.teams[1][0].hp).toBe(before.teams[1][0].hp-(frame.event.damage??0));
   expect(before.teams[0][0].pp[0]).toBe(SKILLS[skill.id].pp);
   if(frame.event.ko)expect(after.frames).toHaveLength(1);
  }
 });
 it('records misses with no damage and guard with its own event',()=>{
  const a=makeMonster('pyroo',10),b=makeMonster('mippo',10);a.skills=['Api-2','guard','tackle'];
  const base=createBattle('wild',[a],[b]);
  const miss=resolveTurn(base,{type:'skill',index:0},{type:'skill',index:2},()=>.999);
  const e=miss.frames!.find(f=>f.event.side===0)!.event;
  expect(e.missed).toBe(true);expect(e.damage).toBeUndefined();
  const guard=resolveTurn(base,{type:'skill',index:1},{type:'skill',index:2},()=>.1);
  expect(guard.frames!.find(f=>f.event.side===0)!.event.skill).toBe('guard');
 });
});
