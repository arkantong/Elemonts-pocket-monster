import {chromium} from 'playwright';
import {emptySave,transition,SAVE_KEY} from '../src/game/state';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844}});
const s=transition(emptySave(),{type:'starter',species:'pyroo'});s.tutorial=true;s.captureTutorial='done';
await page.addInitScript(({s,key})=>{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('elemonts.language.v1','en');},{s,key:SAVE_KEY});
await page.goto('http://localhost:5173');await page.locator('canvas').waitFor();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'docs/qa/screenshots/pocket-pals-home.png',fullPage:true});
await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Collection',exact:true}).click();await page.screenshot({path:'docs/qa/screenshots/pocket-pals-collection.png',fullPage:true});
await browser.close();
