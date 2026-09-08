import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('apps/mobile/package.json'));
const app = JSON.parse(read('apps/mobile/app.json'));
const native = read('apps/mobile/src/features/kether/MahasiahDay025Experience.native.tsx');
const web = read('apps/mobile/src/features/kether/MahasiahDay025Experience.web.tsx');
const scene = read('apps/mobile/src/features/kether/MahasiahDay025ArScene.tsx');
const geometry = read('apps/mobile/src/features/kether/DaiKoMyoArGeometry.tsx');
const definitions = read('apps/mobile/src/features/kether/runtime-definitions/mahasiah.ts');
const cycle = read('apps/mobile/src/features/kether/KetherCycle05Mahasiah.tsx');

const plugins = app.expo?.plugins ?? [];
const plugin = (name) => plugins.find((entry) => entry === name || (Array.isArray(entry) && entry[0] === name));
const cameraPlugin = plugin('expo-camera');
const viroPlugin = plugin('@reactvision/react-viro');

const checks = [
  ['Viro pinned to reviewed runtime', pkg.dependencies?.['@reactvision/react-viro'] === '2.58.1'],
  ['Expo Camera pinned to SDK 57 line', pkg.dependencies?.['expo-camera'] === '~57.0.4'],
  ['Expo camera config plugin present', Boolean(cameraPlugin)],
  ['Camera permission is contextual to Day 025', Array.isArray(cameraPlugin) && cameraPlugin[1]?.cameraPermission?.includes('Dia 025')],
  ['Camera plugin does not request Android audio recording', Array.isArray(cameraPlugin) && cameraPlugin[1]?.recordAudioAndroid === false],
  ['Viro config plugin present', Boolean(viroPlugin)],
  ['Viro Android mode is AR', Array.isArray(viroPlugin) && viroPlugin[1]?.android?.xRMode === 'AR'],
  ['Native runtime uses contextual permission hook', native.includes('useCameraPermissions') && native.includes('askCamera()')],
  ['Native runtime uses ViroARSceneNavigator', native.includes('ViroARSceneNavigator')],
  ['Cloud providers disabled for local Day 025', native.includes('provider="none"')],
  ['Native runtime preserves AR pose only as local session state', native.includes('localPose') && !native.includes('anchorId:localPose')],
  ['No CameraView video/screenshot surrogate', !native.includes('CameraView') && !native.includes('startVideoRecording') && !native.includes('takeScreenshot')],
  ['Raw camera frames explicitly not persisted', native.includes('camera_frames_persisted:false') && native.includes('video_recorded:false')],
  ['AR scene uses plane selector', scene.includes('ViroARPlaneSelector')],
  ['AR scene detects horizontal planes', scene.includes("anchorDetectionTypes={['PlanesHorizontal']}")],
  ['AR selector forwards found anchors', scene.includes('handleAnchorFound')],
  ['AR selector forwards updated anchors', scene.includes('handleAnchorUpdated')],
  ['AR selector forwards removed anchors', scene.includes('handleAnchorRemoved')],
  ['AR scene gates optimal tracking', scene.includes('ViroTrackingStateConstants.TRACKING_NORMAL')],
  ['AR scene exposes exactly four canonical perimeter point indices', [0, 1, 2, 3].every((index) => scene.includes(`index: ${index}`))],
  ['Control condition hides Dai Ko Myo', scene.includes("visible={props.mode !== 'control'}")],
  ['AR geometry is derived from approved reference id', geometry.includes("reiki-usui-dai-ko-myo-v1")],
  ['AR geometry remains three-dimensional', geometry.includes('ViroGeometry') && geometry.includes('DAI_KO_MYO_AR_DEPTH_METERS = 0.025')],
  ['AR geometry preserves holes/topology data', geometry.includes('holes') && geometry.includes('ViroPolygon')],
  ['Day 025 requires real AR evidence', definitions.includes("'ar_anchor_created'") && definitions.includes("'active_map_completed'") && definitions.includes("'control_map_completed'")],
  ['Day 025 requires four environment points', definitions.includes('environment_points_logged: 4')],
  ['Native seal emits required evidence', ['ar_anchor_created:true','active_map_completed:','control_map_completed:','environment_points_logged:4','comparison_logged:true'].every((token) => native.includes(token))],
  ['Native flow includes active/control seven-minute gates', native.includes('activeSeconds>=420') && native.includes('controlSeconds>=420')],
  ['Reanchoring preserves practice state outside navigator key', native.includes('setSessionKey') && native.includes('setReanchors')],
  ['Web refuses fake 2D equivalence', web.includes('SEM FALLBACK 2D') && web.includes('ARCore/ARKit')],
  ['Cycle V mounts Day 025 runtime', cycle.includes('MahasiahDay025Experience')],
  ['No spiritual-detector claim in native runtime', !/campo energético detectado[^”"<]*[✓✅]|chakra ativado[^”"<]*[✓✅]/i.test(native)],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} · ${label}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`\nMahasiah Day 025 AR gate failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`\nMahasiah Day 025 AR gate PASS: ${checks.length}/${checks.length}`);
