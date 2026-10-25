import { chromium } from 'playwright';
import { emptySave, transition, makeMonster, SAVE_KEY } from '../src/game/state';
import { createBattle } from '../src/game/battle';
import { copyFileSync, mkdirSync } from 'node:fs';
const s=transition(emptySave(),{type:'starter',species:'pyroo'});s.tutorial=true;s.monsters[0].level=30;s.monsters[0].skills=['Api-2','Api-1','guard'];
const enemy=makeMonster('croobit',30);enemy.skills=['Air-2','Air-1','guard'];
s.battle=createBattle('wild',[s.monsters[0]],[enemy]);for(const team of s.battle.teams){team[0].hp=500;team[0].maxHp=500;}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:'/tmp/elemonts-battle-recording',size:{width:390,height:844}}});
await context.addInitScript(({s,key})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('elemonts.language.v1','en');Math.random=()=>.1;},{s,key:SAVE_KEY});
const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.locator('canvas').waitFor();await page.waitForTimeout(800);
for(const index of [0,2,1]){
 await page.locator('.move-button').nth(index).click();await page.waitForFunction(()=>document.querySelector('.battle-stage')?.getAttribute('aria-busy')==='true');
 await page.waitForTimeout(650);
 if(index===0)await page.screenshot({path:'docs/qa/screenshots/battle-attack-impact.png'});
 await page.waitForFunction(()=>document.querySelector('.battle-stage')?.getAttribute('aria-busy')==='false');await page.waitForTimeout(600);
}
await page.waitForTimeout(800);const video=page.video()!;await context.close();mkdirSync('docs/qa/videos',{recursive:true});copyFileSync(await video.path(),'docs/qa/videos/battle-animation.webm');console.log({errors});await browser.close();
