import { test, expect } from '@playwright/test';
import { emptySave, transition, SAVE_KEY } from '../src/game/state';
test('compact pet rooms, play, food and saved care', async ({page})=>{
 const s=transition(emptySave(),{type:'starter',species:'pyroo'});s.tutorial=true;s.captureTutorial='done';s.inventory.intimacy=2;
 await page.addInitScript(({s,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('elemonts.language.v1','en');localStorage.setItem('elemonts.music.v1','off');},{s,key:SAVE_KEY});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Home',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Next room',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Kitchen',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Choose food',exact:true}).click();
 const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).inventory.intimacy,SAVE_KEY);
 await page.locator('dialog .item-row').nth(1).click();
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).inventory.intimacy,SAVE_KEY)).toBe(before-1);
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await page.getByRole('button',{name:'Catch the ball',exact:true}).click();await expect(page.locator('.pet-room-action')).toContainText('1');
 await page.getByRole('button',{name:'Rest',exact:true}).click();await expect(page.getByRole('heading',{name:'Bedroom',exact:true})).toBeVisible();
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Next room',exact:true}).click();await page.locator('canvas').waitFor();await page.waitForTimeout(1500);await page.screenshot({path:'/tmp/elemonts-pet-home.png',fullPage:true});expect(errors).toEqual([]);
});
