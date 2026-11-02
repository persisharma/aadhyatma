import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTestflight, validateFinishedBuild, EAS_PROJECT_ID, IOS_APP_ID, ASC_APP_ID } from '../testflight-plan.mjs';
const app = { expo: { version: '1.5.5', ios: { buildNumber: '75', bundleIdentifier: IOS_APP_ID }, extra: { eas: { projectId: EAS_PROJECT_ID } }, android: { versionCode: 15 } } };
const eas = { cli: { appVersionSource: 'local' }, build: { production: { autoIncrement: true, channel: 'production', env: { META_TRACKING_ENABLED: 'true' } } }, submit: { production: { ios: { ascAppId: ASC_APP_ID } } } };
const good = { id: '11111111-2222-4333-8444-555555555555', platform: 'IOS', status: 'FINISHED', distribution: 'STORE', app: { id: EAS_PROJECT_ID }, appIdentifier: IOS_APP_ID, appBuildVersion: '76', appVersion: '1.5.5' };

test('prepares exactly the approved iOS number without changing version, Android or existing production behaviour', () => {
  const before = JSON.stringify({ app, eas });
  const result = prepareTestflight(app, eas, '76');
  assert.equal(result.app.expo.ios.buildNumber, '76');
  assert.equal(result.app.expo.version, app.expo.version);
  assert.deepEqual(result.app.expo.android, app.expo.android);
  assert.deepEqual(result.eas.build.production, eas.build.production);
  assert.deepEqual(result.eas.build['ci-testflight'], { extends: 'production', distribution: 'store', credentialsSource: 'remote', autoIncrement: false, ios: { simulator: false, autoIncrement: false } });
  assert.equal(JSON.stringify({ app, eas }), before);
});
test('rejects reused, malformed and out-of-range numbers before a build can start', () => {
  for (const value of ['', '75', '74', '0', '-1', '76; echo bad', '1.2.3', '10000']) assert.throws(() => prepareTestflight(app, eas, value));
});
test('rejects a changed app, EAS project, Apple destination or numbering policy', () => {
  for (const mutate of [
    (a,e) => { a.expo.ios.bundleIdentifier = 'other.app'; },
    (a,e) => { a.expo.extra.eas.projectId = 'other'; },
    (a,e) => { e.submit.production.ios.ascAppId = 'other'; },
    (a,e) => { e.cli.appVersionSource = 'remote'; },
  ]) { const a=structuredClone(app), e=structuredClone(eas); mutate(a,e); assert.throws(() => prepareTestflight(a,e,'76')); }
});
test('selects the exact completed device build and excludes temporary archive links', () => {
  const value=validateFinishedBuild([{...good,artifacts:{buildUrl:'temporary-private-url'}}],'76');
  assert.equal(value.id,good.id); assert.equal(value.artifacts,undefined);
});
test('refuses wrong platform, project, unfinished/internal/simulator builds and ambiguous results', () => {
  for (const change of [{platform:'ANDROID'},{app:{id:'other'}},{appIdentifier:'other.app'},{status:'ERRORED'},{distribution:'INTERNAL'},{isForIosSimulator:true},{id:'not-an-id'}]) assert.throws(() => validateFinishedBuild({...good,...change},'76'));
  assert.throws(() => validateFinishedBuild([good,good]));
  assert.throws(() => validateFinishedBuild(good,'77'));
});
