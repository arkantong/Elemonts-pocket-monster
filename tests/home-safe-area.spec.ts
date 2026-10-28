import { test, expect } from '@playwright/test';
import { emptySave, transition, makeMonster, SAVE_KEY } from '../src/game/state';
import conceptFrames from '../src/game/conceptFrames.json' with { type: 'json' };
import frames from '../src/game/portraitFrames.json' with { type: 'json' };
for(const species of ['flicklet','pyroo'])for(const [width,height,top,bottom]of [[384,854,24,32],[320,640,28,24],[390,844,0,0]]){
 test(`${species} Home respects system insets ${width}x${height} ${top}/${bottom}`,async({page})=>{
  const save=transition(emptySave(),{type:'starter',species:'pyroo'});if(species!=='pyroo'){const partner=makeMonster(species);save.monsters.push(partner);save.team=[partner.uid];}save.tutorial=true;save.captureTutorial='done';
  await page.addInitScript(({save,key})=>{localStorage.setItem(key,JSON.stringify(save));localStorage.setItem('elemonts.language.v1','en');localStorage.setItem('elemonts.music.v1','off');},{save,key:SAVE_KEY});
  await page.setViewportSize({width,height});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--safe-area-inset-top',`${top}px`);document.documentElement.style.setProperty('--safe-area-inset-bottom',`${bottom}px`);},{top,bottom});
  await expect(page.locator('.pet-illustration')).toBeVisible();
  const header=await page.locator('.topbar').boundingBox();
  const nav=await page.locator('.bottom-nav').boundingBox();
  expect(header!.y).toBeGreaterThanOrEqual(top);expect(nav!.y+nav!.height).toBeLessThanOrEqual(height-bottom+1);
  const icons=await page.locator('.bottom-nav button').evaluateAll(buttons=>buttons.map(b=>{const s=getComputedStyle(b,'::before');return{w:parseFloat(s.width),h:parseFloat(s.height),shrink:s.flexShrink};}));
  for(const icon of icons){expect(icon.h).toBeGreaterThanOrEqual(28);expect(Math.abs(icon.w-icon.h)).toBeLessThan(1);expect(icon.shrink).toBe('0');}
  const frame=species==='pyroo'?conceptFrames['pyroo-home']:frames[species as keyof typeof frames];
  await expect(page.locator('.pet-illustration')).toHaveAttribute('viewBox',frame.slice(2).join(' '));
  await expect(page.locator('.pet-illustration')).toHaveAttribute('preserveAspectRatio','xMidYMax meet');
  await expect(page.locator('.pet-illustration image')).toHaveAttribute('href',species==='pyroo'?'/art/monsters-2d/pyroo-home.png':`/art/monsters/${species}.png`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===384){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`/tmp/elemonts-safe-${species}.png`});}
  await page.getByRole('button',{name:'Next room',exact:true}).click();await expect(page.getByRole('heading',{name:'Kitchen',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
 });
}
