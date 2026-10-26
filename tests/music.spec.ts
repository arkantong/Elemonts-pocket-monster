import { test, expect } from '@playwright/test';
import { emptySave, transition, makeMonster, SAVE_KEY } from '../src/game/state';
import { createBattle } from '../src/game/battle';
test('BGM plays after interaction, toggle persists and pauses while hidden',async({page})=>{
 await page.addInitScript(()=>{
  const Original=window.Audio;
  window.Audio=class extends Original {constructor(src?:string){super(src);if(src?.includes('bgm-01'))(window as any).bgm=this;}};
 });
 await page.goto('/');
 const off=page.getByRole('button',{name:'Turn music off',exact:true});
 await off.click();await expect(page.getByRole('button',{name:'Turn music on',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.reload();await expect(page.getByRole('button',{name:'Turn music on',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Turn music on',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).bgm.paused)).toBe(false);
 await expect.poll(()=>page.evaluate(()=>(window as any).bgm.currentTime)).toBeGreaterThan(0);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>page.evaluate(()=>(window as any).bgm.paused)).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>page.evaluate(()=>(window as any).bgm.paused)).toBe(false);
 await off.click();await expect.poll(()=>page.evaluate(()=>(window as any).bgm.paused)).toBe(true);
});
test('battle does not play the menu BGM',async({page})=>{
 const s=transition(emptySave(),{type:'starter',species:'pyroo'});s.tutorial=true;s.captureTutorial='done';s.battle=createBattle('wild',[s.monsters[0]],[makeMonster('mippo',5)]);
 await page.addInitScript(({s,key})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('elemonts.language.v1','en');const Original=window.Audio;window.Audio=class extends Original {constructor(src?:string){super(src);if(src?.includes('bgm-01'))(window as any).bgm=this;}};},{s,key:SAVE_KEY});
 await page.goto('/');await page.locator('.battle-stage').waitFor();await page.locator('.move-button').first().click();
 expect(await page.evaluate(()=>(window as any).bgm.paused)).toBe(true);
});
test('music control fits the home header on narrow phones',async({page})=>{
 const s=transition(emptySave(),{type:'starter',species:'pyroo'});s.tutorial=true;s.captureTutorial='done';
 await page.addInitScript(({s,key})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('elemonts.language.v1','en');localStorage.setItem('elemonts.music.v1','off');},{s,key:SAVE_KEY});
 await page.setViewportSize({width:320,height:740});await page.goto('/');await page.locator('canvas').waitFor();await page.evaluate(()=>document.fonts.ready);
 await expect(page.getByRole('button',{name:'Turn music on',exact:true})).toBeInViewport();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'/tmp/elemonts-music-header.png'});
});
