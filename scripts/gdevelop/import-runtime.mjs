/** Import the locally installed GDevelop 5.6.285 runtime. No editor global changes. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {basename,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.env.GDEVELOP_RUNTIME_ROOT || '/workspace/shared/gdevelop/squashfs-root/resources/GDJS/Runtime';
const files=JSON.parse(readFileSync('scripts/gdevelop/runtime-files.json','utf8'));
const records=[];mkdirSync('public/gdevelop/vendor',{recursive:true});
for(const file of files){const content=readFileSync(join(root,file),'utf8').replace(/^\/\/# sourceMappingURL=.*$/gm,'');writeFileSync(join('public/gdevelop/vendor',basename(file)),content);records.push({source:file,file:basename(file),sha256:createHash('sha256').update(content).digest('hex')});}
writeFileSync('public/gdevelop/runtime-info.json',JSON.stringify({editor:'GDevelop 5.6.285',source:'4ian/GDevelop',upstreamCommit:'bc466cd57b8005d254859400c0dbf0940db6e53c',renderer:'PixiJS 2D; Canvas fallback; no Three.js library',files:records},null,2)+'\n');
console.log(`Imported ${records.length} GDevelop runtime files`);
