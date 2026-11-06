const {execFileSync}=require('node:child_process');
const baseline='a469ea3696f29baf588b3783fee83c9c1e000202';
const files=execFileSync('git',['diff','--name-only','--relative','-z',baseline,'HEAD','--','.'],{encoding:'utf8'}).split('\0').filter(Boolean);
const allowed=file=>file.includes('/__tests__/')||file.startsWith('.maestro/')||file.startsWith('scripts/')||file.startsWith('visual/')||file.startsWith('docs/')||file.startsWith('src/components/sanatan/')||file.startsWith('src/data/sanatan-parichay/')||/^src\/screens\/Sanatan[^/]*\.tsx$/.test(file)||['src/components/SanatanHomeCard.tsx','src/components/FramedPainting.tsx'].includes(file);
const incompatible=files.filter(file=>!allowed(file));
console.log(JSON.stringify({baseline,changedFiles:files,nativeSourceChanged:incompatible},null,2));
process.exitCode=incompatible.length?1:0;
