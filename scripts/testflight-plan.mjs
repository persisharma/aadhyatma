import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const IOS_APP_ID = 'com.prashantsharma.vedansh';
export const ASC_APP_ID = '6766086529';
export const EAS_PROJECT_ID = 'c83547c2-423c-4902-9087-a9ec9879a1f9';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function target(app, eas) {
  if (app.expo?.ios?.bundleIdentifier !== IOS_APP_ID || app.expo?.extra?.eas?.projectId !== EAS_PROJECT_ID || String(eas.submit?.production?.ios?.ascAppId) !== ASC_APP_ID) {
    throw new Error('The checkout is not the configured Vedansh iOS/TestFlight destination.');
  }
}

export function prepareTestflight(app, eas, buildNumber) {
  target(app, eas);
  if (eas.cli?.appVersionSource !== 'local') throw new Error('Version source changed; reconcile remote numbering before using this workflow.');
  if (!/^[1-9][0-9]{0,3}$/.test(buildNumber) || !/^[1-9][0-9]{0,3}$/.test(String(app.expo.ios.buildNumber)) || Number(buildNumber) <= Number(app.expo.ios.buildNumber)) {
    throw new Error('Supply an unused integer build number greater than the committed iOS build number (maximum 9999).');
  }
  if (!eas.build?.production) throw new Error('Missing production build profile.');
  const nextApp = structuredClone(app); const nextEas = structuredClone(eas);
  nextApp.expo.ios.buildNumber = buildNumber;
  // A CI-only profile preserves production options, but uses exactly the
  // explicitly selected number. Do not lose numbering in ephemeral checkouts.
  nextEas.build['ci-testflight'] = {
    extends: 'production', distribution: 'store', credentialsSource: 'remote',
    autoIncrement: false, ios: { simulator: false, autoIncrement: false },
  };
  return { app: nextApp, eas: nextEas };
}

export function validateFinishedBuild(raw, expectedNumber) {
  const values = Array.isArray(raw) ? raw : [raw];
  if (values.length !== 1) throw new Error('Expected exactly one iOS build.');
  const b = values[0];
  if (!uuid.test(b?.id ?? '') || String(b.platform).toUpperCase() !== 'IOS' || String(b.status).toUpperCase() !== 'FINISHED' || String(b.distribution).toUpperCase() !== 'STORE' || b.app?.id !== EAS_PROJECT_ID || b.appIdentifier !== IOS_APP_ID || b.isForIosSimulator === true) {
    throw new Error('Only a finished Vedansh iOS App Store build may be submitted.');
  }
  if (expectedNumber && String(b.appBuildVersion) !== expectedNumber) throw new Error('Finished build number differs from the requested build number.');
  return { id: b.id, appVersion: b.appVersion, appBuildVersion: b.appBuildVersion, platform: b.platform, status: b.status, distribution: b.distribution, gitCommitHash: b.gitCommitHash };
}

function main() {
  const [operation, root, file] = process.argv.slice(2);
  const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  if (operation === 'prepare') {
    const next = prepareTestflight(read('app.json'), read('eas.json'), process.env.IOS_TESTFLIGHT_BUILD_NUMBER ?? '');
    fs.writeFileSync(path.join(root, 'app.json'), JSON.stringify(next.app, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'eas.json'), JSON.stringify(next.eas, null, 2) + '\n');
  } else if (operation === 'record') {
    target(read('app.json'), read('eas.json'));
    const selected = validateFinishedBuild(JSON.parse(fs.readFileSync(file, 'utf8')), process.env.IOS_OPERATION === 'build-and-submit' ? process.env.IOS_TESTFLIGHT_BUILD_NUMBER : undefined);
    fs.mkdirSync(path.join(root, '../testflight-output'), { recursive: true });
    fs.writeFileSync(path.join(root, '../testflight-output/build-info.json'), JSON.stringify(selected, null, 2) + '\n');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `build_id=${selected.id}\n`);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Built/selected iOS ${selected.appVersion} (${selected.appBuildVersion})\n\nhttps://expo.dev/accounts/prashant.sharma/projects/vedansh/builds/${selected.id}\n`);
  } else if (operation === 'validate-input') {
    target(read('app.json'), read('eas.json'));
    if (process.env.IOS_OPERATION === 'submit-existing') {
      if (!uuid.test(process.env.IOS_EXISTING_BUILD_ID ?? '')) throw new Error('Supply the exact EAS build UUID to submit; latest is never selected implicitly.');
    } else if (process.env.IOS_OPERATION !== 'build-and-submit') throw new Error('Unknown release operation.');
  } else throw new Error('Unknown testflight-plan command.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
