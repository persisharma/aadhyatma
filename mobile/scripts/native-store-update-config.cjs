const fs=require('node:fs');
const version=process.argv[2];
if(!['1.5.3','1.5.4'].includes(version))throw Error('Unsupported native fixture version');
const file='app.json', config=JSON.parse(fs.readFileSync(file));
config.expo.version=version;
config.expo.runtimeVersion={policy:'appVersion'};
config.expo.updates={...config.expo.updates,enabled:true,checkAutomatically:'NEVER',fallbackToCacheTimeout:0};
fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');
console.log(JSON.stringify({fixtureOnly:true,version,runtimePolicy:'appVersion',otaFetching:'NEVER',published:false}));
