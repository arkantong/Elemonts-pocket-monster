import {it,expect} from 'vitest';
import {battleTiming,gbaFrames} from '../src/game/battleTiming';
it('separates contact, 32-frame hit blink, HP drain and outcome',()=>{
 const p=battleTiming({kind:'skill',skill:'tackle',side:0,damage:8});
 expect(p.impact-p.motionStart).toBe(gbaFrames(6));
 expect(p.hpStart-p.hitStart).toBe(gbaFrames(32));
 expect(p.hpStart).toBeGreaterThan(p.impact);
 expect(p.resultStart).toBe(p.hpStart+p.hpDuration);
 expect(p.duration).toBeGreaterThan(p.resultStart);
});
it('uses distinct elemental timings and does not blink or drain for a miss',()=>{
 expect(battleTiming({kind:'skill',skill:'Api-2',side:0}).animationEnd).toBeGreaterThan(battleTiming({kind:'skill',skill:'tackle',side:0}).animationEnd);
 const miss=battleTiming({kind:'skill',skill:'tackle',side:0,missed:true});
 expect(miss.hpDuration).toBe(0);expect(miss.hpStart).toBe(miss.hitStart);
});
it('shortens presentation for reduced motion',()=>{
 const e={kind:'skill' as const,skill:'tackle',side:0,damage:8};
 expect(battleTiming(e,true).duration).toBeLessThan(battleTiming(e).duration);
});
