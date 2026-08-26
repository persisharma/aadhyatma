const fs = require('fs');
const path = require('path');
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const PbxFile = require('xcode/lib/pbxFile');

const TARGET = 'VedanshWidgets';
const FONTS = [
  ['@expo-google-fonts/noto-serif-devanagari', '500Medium/NotoSerifDevanagari_500Medium.ttf'],
  ['@expo-google-fonts/noto-serif-devanagari', '600SemiBold/NotoSerifDevanagari_600SemiBold.ttf'],
  ['@expo-google-fonts/noto-serif-gujarati', '500Medium/NotoSerifGujarati_500Medium.ttf'],
  ['@expo-google-fonts/noto-serif-gujarati', '600SemiBold/NotoSerifGujarati_600SemiBold.ttf'],
  ['@expo-google-fonts/noto-serif-kannada', '500Medium/NotoSerifKannada_500Medium.ttf'],
  ['@expo-google-fonts/noto-serif-kannada', '600SemiBold/NotoSerifKannada_600SemiBold.ttf'],
  ['@expo-google-fonts/inter', '500Medium/Inter_500Medium.ttf'],
  ['@expo-google-fonts/inter', '600SemiBold/Inter_600SemiBold.ttf'],
];

function withFiles(config) {
  return withDangerousMod(config, ['ios', async (cfg) => {
    const projectRoot = cfg.modRequest.projectRoot;
    const destination = path.join(cfg.modRequest.platformProjectRoot, TARGET);
    const source = path.join(projectRoot, 'plugins', 'home-widgets', 'ios');
    fs.mkdirSync(destination, { recursive: true });
    fs.copyFileSync(path.join(source, 'WidgetPayloadContract.swift'), path.join(destination, 'WidgetPayloadContract.swift'));
    fs.copyFileSync(path.join(source, 'VedanshWidgets.swift'), path.join(destination, 'VedanshWidgets.swift'));
    fs.copyFileSync(path.join(source, 'Info.plist'), path.join(destination, `${TARGET}-Info.plist`));
    fs.copyFileSync(path.join(source, 'VedanshWidgets.entitlements'), path.join(destination, 'VedanshWidgets.entitlements'));
    fs.copyFileSync(path.join(projectRoot, 'src', 'widgets', 'fixtures', 'widget-payload-v1.json'), path.join(destination, 'widget-payload-v1.json'));
    for (const [pkg, relative] of FONTS) {
      const file = require.resolve(`${pkg}/${relative}`, { paths: [projectRoot] });
      fs.copyFileSync(file, path.join(destination, path.basename(file)));
    }
    return cfg;
  }]);
}

function targetBuildConfigurations(project, target) {
  const list = project.pbxXCConfigurationList()[target.pbxNativeTarget.buildConfigurationList];
  const configs = project.pbxXCBuildConfigurationSection();
  return list.buildConfigurations.map((item) => configs[item.value]);
}

function withTarget(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    if (project.findTargetKey(TARGET)) return cfg;
    const bundleId = `${cfg.ios.bundleIdentifier}.widgets`;
    // xcode's addTarget only wires dependency objects when these optional
    // sections already exist; Expo's minimal template omits both.
    project.hash.project.objects.PBXTargetDependency ||= {};
    project.hash.project.objects.PBXContainerItemProxy ||= {};
    const target = project.addTarget(TARGET, 'app_extension', TARGET, bundleId);
    const host = project.getFirstTarget();
    const copyRef = host.firstTarget.buildPhases.find((phase) => phase.comment === 'Copy Files');
    if (!copyRef) throw new Error('withHomeWidgets: extension embed phase was not created');
    copyRef.comment = 'Embed App Extensions';
    project.hash.project.objects.PBXCopyFilesBuildPhase[`${copyRef.value}_comment`] = 'Embed App Extensions';
    project.hash.project.objects.PBXCopyFilesBuildPhase[copyRef.value].name = '"Embed App Extensions"';
    project.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    const group = project.addPbxGroup([], TARGET, TARGET);
    project.addToPbxGroup(group.uuid, project.getFirstProject().firstProject.mainGroup);
    project.addSourceFile('WidgetPayloadContract.swift', { target: target.uuid }, group.uuid);
    project.addSourceFile('VedanshWidgets.swift', { target: target.uuid }, group.uuid);
    for (const [, relative] of FONTS) {
      const file = new PbxFile(path.basename(relative));
      file.target = target.uuid; file.uuid = project.generateUuid(); file.fileRef = project.generateUuid();
      project.addToPbxFileReferenceSection(file); project.addToPbxBuildFileSection(file); project.addToPbxResourcesBuildPhase(file); project.addToPbxGroup(file, group.uuid);
    }
    const fixture = new PbxFile('widget-payload-v1.json');
    fixture.target = target.uuid; fixture.uuid = project.generateUuid(); fixture.fileRef = project.generateUuid();
    project.addToPbxFileReferenceSection(fixture); project.addToPbxBuildFileSection(fixture); project.addToPbxResourcesBuildPhase(fixture); project.addToPbxGroup(fixture, group.uuid);
    project.addFramework('WidgetKit.framework', { target: target.uuid });
    project.addFramework('SwiftUI.framework', { target: target.uuid });
    // EAS only injects DEVELOPMENT_TEAM into the main app target's build
    // settings, so the extension's `$(DEVELOPMENT_TEAM)` resolves empty and
    // xcodebuild fails with "Signing for VedanshWidgets requires a development
    // team". Set it explicitly (overridable via env for other Apple accounts).
    const DEVELOPMENT_TEAM = process.env.APPLE_TEAM_ID || 'S72ZMP59GG';
    for (const build of targetBuildConfigurations(project, target)) {
      Object.assign(build.buildSettings, {
        APPLICATION_EXTENSION_API_ONLY: 'YES',
        DEVELOPMENT_TEAM,
        CODE_SIGN_ENTITLEMENTS: `"${TARGET}/VedanshWidgets.entitlements"`,
        CURRENT_PROJECT_VERSION: `"${cfg.ios.buildNumber || '1'}"`,
        GENERATE_INFOPLIST_FILE: 'NO',
        INFOPLIST_FILE: `"${TARGET}/${TARGET}-Info.plist"`,
        IPHONEOS_DEPLOYMENT_TARGET: '16.0',
        MARKETING_VERSION: `"${cfg.version || '1.0.0'}"`,
        PRODUCT_BUNDLE_IDENTIFIER: `"${bundleId}"`,
        PRODUCT_NAME: `"${TARGET}"`,
        SKIP_INSTALL: 'YES',
        SWIFT_EMIT_LOC_STRINGS: 'YES',
        SWIFT_VERSION: '5.0',
        TARGETED_DEVICE_FAMILY: '"1,2"',
      });
    }
    project.addTargetAttribute('DevelopmentTeam', DEVELOPMENT_TEAM, target);
    cfg.modResults = project;
    return cfg;
  });
}

module.exports = function withHomeWidgetsIos(config) {
  config = withFiles(config);
  config = withTarget(config);
  return config;
};
