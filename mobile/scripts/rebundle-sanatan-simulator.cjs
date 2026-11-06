const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const app=path.resolve(process.argv[2]);
const output=path.resolve(process.argv[3]);
const project=process.cwd();
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function filesUnder(directory){return fs.existsSync(directory)?fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?filesUnder(path.join(directory,entry.name)):fs.statSync(path.join(directory,entry.name)).isFile()?[path.join(directory,entry.name)]:[]):[];}
const nativeFiles=[path.join(app,'Vedansh'),path.join(app,'Info.plist'),...filesUnder(path.join(app,'Frameworks')),...filesUnder(path.join(app,'PlugIns'))].sort();
const nativeBefore=nativeFiles.map(file=>[path.relative(app,file),digest(file)]);
(async()=>{
 execFileSync(process.execPath,[path.join(project,'node_modules/expo/bin/cli'),'export:embed','--platform','ios','--entry-file','index.ts','--dev','false','--bytecode','--max-workers','2','--bundle-output',path.join(app,'main.jsbundle'),'--assets-dest',app],{stdio:'inherit'});
 process.env.CONFIGURATION='Release';
 const {createManifestForBuildAsync}=require(path.join(project,'node_modules/expo-updates/utils/build/createManifestForBuildAsync.js'));
 await createManifestForBuildAsync('ios',project,path.join(app,'EXUpdates.bundle'),'index.ts');
 const nativeAfter=nativeFiles.map(file=>[path.relative(app,file),digest(file)]);
 if(JSON.stringify(nativeBefore)!==JSON.stringify(nativeAfter))throw Error('Native executable/framework/widget resources changed during JS bundling');
 const receipt={nativeSourceHead:'a469ea3696f29baf588b3783fee83c9c1e000202',javascriptSourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceArtifact:13481645746,appArchiveSha256:'3c74f9dd7f1a830ba092ae94b3e82772040d18ef9f22580eadb84b5be56bf419',rebundled:true,nativeFilesUnchanged:true,bundleSha256:digest(path.join(app,'main.jsbundle')),manifestSha256:digest(path.join(app,'EXUpdates.bundle/app.manifest')),nativeFiles:nativeBefore};
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'binary-origin.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log('Embedded current production JS and assets; verified unchanged native executables/frameworks.');
})().catch(error=>{console.error(error);process.exitCode=1;});
