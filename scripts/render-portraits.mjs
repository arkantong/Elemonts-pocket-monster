import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const designs=JSON.parse(readFileSync(new URL('../src/game/appearance.json',import.meta.url),'utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:256,height:256},deviceScaleFactor:1});
await page.goto('http://localhost:5173');
await page.evaluate(async()=>{
 const THREE=await import('/node_modules/three/build/three.module.js');
 const {creature}=await import('/src/components/creatures.ts');
 document.body.replaceChildren();document.body.style.cssText='margin:0;background:transparent';
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(256,256);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.body.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,30);camera.position.set(0,1.6,5.4);camera.lookAt(0,1.15,0);
 scene.add(new THREE.HemisphereLight('#fff4e7','#738075',2.5));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-3,5,4);scene.add(light);
 window.drawCreature=(id)=>{const old=scene.getObjectByName('portrait');if(old){scene.remove(old);old.traverse(o=>{if(o.isMesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}})}const g=creature(id);g.name='portrait';g.rotation.y=-.14;scene.add(g);renderer.render(scene,camera);return renderer.domElement.toDataURL("image/png");};
});
for(const d of designs){const png=await page.evaluate(id=>window.drawCreature(id),d.id);writeFileSync(`public/art/monsters/${d.id}.png`,Buffer.from(png.split(',')[1],'base64'));}
await page.setViewportSize({width:1120,height:1400});
await page.setContent(`<style>body{margin:0;background:#eff2e9;font:14px sans-serif;color:#304738}main{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;padding:12px}article{background:#fffdf6;border-radius:12px;text-align:center;padding:5px}img{width:140px;height:140px;object-fit:contain}small{display:block;font-size:11px;min-height:26px}</style><main>${designs.map(d=>`<article><img src="http://localhost:5173/art/monsters/${d.id}.png"><b>${d.name}</b><small>${d.form}</small></article>`).join('')}</main>`);
await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
await page.screenshot({path:'docs/qa/screenshots/monster-roster-37.png',fullPage:true});
await browser.close();console.log('Rendered 37 portraits and roster contact sheet.');
