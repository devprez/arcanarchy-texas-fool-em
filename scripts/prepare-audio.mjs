// Publish only real files. This never creates audio or installs a dependency.
import {readdir,mkdir,writeFile,stat} from 'node:fs/promises';
const installed=[];
for(const folder of ['sfx','music']){
  const dir=`public/audio/${folder}`;await mkdir(dir,{recursive:true});
  for(const file of await readdir(dir)){if(/\.mp3$/i.test(file)&&(await stat(`${dir}/${file}`)).size>0)installed.push(`/audio/${folder}/${file}`)}
}
await writeFile('public/audio/manifest.json',JSON.stringify({version:1,installed:installed.sort()},null,2)+'\n');
console.log(`Audio manifest: ${installed.length} real audio files. Missing cues remain silent.`);
