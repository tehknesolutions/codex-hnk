import { existsSync, readFileSync } from 'node:fs';

const required = [
  'packages/vault-interop-vectors/package.json',
  'packages/vault-interop-vectors/src/index.ts',
  'apps/mobile/src/features/vault/NativeVaultInteropHarness.ts',
  'apps/mobile/src/app/index.tsx',
  'apps/mobile/src/app/labs/vault-interop.tsx',
  '.github/workflows/vault-native-android-interop.yml',
  '.github/workflows/vault-native-ios-interop.yml',
  'scripts/run-vault-native-android-interop.sh',
  'scripts/run-vault-native-ios-interop.sh',
  'docs/security/HNK_WEB_E2EE_EXECUTABLE_SPEC_V1_CANDIDATE.md',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing Native Vault interoperability files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const vector = readFileSync('packages/vault-interop-vectors/src/index.ts', 'utf8');
const harness = readFileSync('apps/mobile/src/features/vault/NativeVaultInteropHarness.ts', 'utf8');
const mobileIndex = readFileSync('apps/mobile/src/app/index.tsx', 'utf8');
const route = readFileSync('apps/mobile/src/app/labs/vault-interop.tsx', 'utf8');
const androidWorkflow = readFileSync('.github/workflows/vault-native-android-interop.yml', 'utf8');
const iosWorkflow = readFileSync('.github/workflows/vault-native-ios-interop.yml', 'utf8');
const androidRunner = readFileSync('scripts/run-vault-native-android-interop.sh', 'utf8');
const iosRunner = readFileSync('scripts/run-vault-native-ios-interop.sh', 'utf8');
const mobilePackage = readFileSync('apps/mobile/package.json', 'utf8');
const webVectors = readFileSync('packages/vault-web-crypto-lab/src/vectors.ts', 'utf8');
const productionVault = readFileSync('apps/mobile/src/features/vault/vault-crypto.ts', 'utf8');
const day001 = readFileSync('apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx', 'utf8');
const spec = readFileSync('docs/security/HNK_WEB_E2EE_EXECUTABLE_SPEC_V1_CANDIDATE.md', 'utf8');

const frozenChecks = ['nonce-exact', 'ciphertext-tag-exact', 'checksum-exact', 'decrypt-roundtrip'];

const invariants = [
  ['Neutral vector package is wired to Mobile', mobilePackage.includes('"@hnk/vault-interop-vectors": "workspace:*"')],
  ['File-system proof dependency is explicit in Mobile', mobilePackage.includes('"expo-file-system": "~57.0.6"')],
  ['Web and Native share one vector source', webVectors.includes("from '@hnk/vault-interop-vectors'") && harness.includes("from '@hnk/vault-interop-vectors'")],
  ['Frozen vector checksum is unchanged', vector.includes('157c92b5e1b1da403003fe1fd244bb7d46f3a3f085bc407373388491055a4020')],
  ['Native harness refuses Web as native proof', harness.includes("platform !== 'android' && platform !== 'ios'") && harness.includes("status: 'NATIVE_DEVICE_REQUIRED'")],
  ['Native harness imports fixed VDK through Expo Crypto', harness.includes('AESEncryptionKey.import') && harness.includes('vector.vdkHex')],
  ['Native harness injects exact frozen nonce', harness.includes('nonce: { bytes: vector.nonceBase64 }')],
  ['Native harness supplies frozen base64 AAD', harness.includes('additionalData: vector.aadBase64')],
  ['Native harness reads sealed ciphertext and nonce as bytes', harness.includes('sealed.ciphertext({ includeTag: true })') && harness.includes('sealed.iv()')],
  ['Native harness normalizes native bytes to base64 in JS', harness.includes('function bytesToBase64') && harness.includes('bytesToBase64(ciphertextBytes)') && harness.includes('bytesToBase64(nonceBytes)')],
  ['Native harness does not depend on Expo ciphertext base64 option', !harness.includes("encoding: 'base64'") && !harness.includes("sealed.iv('base64')")],
  ['Native harness compares ciphertext with appended tag', harness.includes('includeTag: true') && harness.includes('vector.ciphertextBase64')],
  ['Native harness verifies frozen checksum', harness.includes('CryptoDigestAlgorithm.SHA256') && harness.includes('vector.checksumSha256')],
  ['Native harness verifies decrypt round-trip', harness.includes("name: 'decrypt-roundtrip'")],
  ['Native harness has no SecureStore dependency', !harness.includes("from 'expo-secure-store'") && !harness.includes('SecureStore.')],
  ['Native harness has no Supabase/network dependency', !harness.includes('@hnk/supabase-client') && !harness.includes('fetch(')],
  ['Lab route is explicitly experimental and makes no Vault writes', route.includes('EXPERIMENTAL · NO VAULT WRITES')],
  ['Lab route CI autorun is gated to Android/iOS', route.includes('EXPO_PUBLIC_HNK_NATIVE_INTEROP_AUTORUN') && route.includes("Platform.OS === 'android'") && route.includes("Platform.OS === 'ios'")],
  ['Lab route exposes redacted accessibility evidence', route.includes('native-interop-status-${result.status}') && route.includes("native-interop-check-${check.name}-${check.ok ? 'PASS' : 'FAIL'}")],
  ['Lab route writes a CI-only redacted proof file', route.includes("from 'expo-file-system'") && route.includes("CI_PROOF_FILENAME = 'hnk-native-interop-proof-v1.json'") && route.includes("CI_PROOF_SCHEMA = 'hnk-native-interop-proof-v1'") && route.includes('secretsCaptured: false')],
  ['Lab proof persists only redacted result fields', route.includes('checks: nextResult.checks.map') && route.includes('errorCode') && !route.includes('vdkHex') && !route.includes('ciphertextBase64') && !route.includes('nonceBase64') && !route.includes('recoveryRootSecret')],
  ['Native interop CI autorun enters the Lab through an internal Expo Router redirect', mobileIndex.includes("from 'expo-router'") && mobileIndex.includes('EXPO_PUBLIC_HNK_NATIVE_INTEROP_AUTORUN') && mobileIndex.includes('Redirect href="/labs/vault-interop"')],
  ['Android proof workflow pins emulator action commit', androidWorkflow.includes('ReactiveCircus/android-emulator-runner@a421e43855164a8197daf9d8d40fe71c6996bb0d') && !androidWorkflow.includes('android-emulator-runner@v2')],
  ['Android proof workflow pins setup-java v5 commit', androidWorkflow.includes('actions/setup-java@b6effb05e454b25005698d916606bdc6ffcbf961') && !androidWorkflow.includes('actions/setup-java@v4')],
  ['Android proof workflow delegates one command to versioned runner', androidWorkflow.includes('script: sh scripts/run-vault-native-android-interop.sh') && !androidWorkflow.includes('script: |')],
  ['Android runner remains POSIX-sh compatible', androidRunner.includes('#!/usr/bin/env sh') && androidRunner.includes('set -eu') && !androidRunner.includes('pipefail')],
  ['Android proof builds Release directly through Gradle', androidRunner.includes('./gradlew app:assembleRelease') && !androidRunner.includes('expo run:android')],
  ['Android proof limits laboratory build to emulator ABI only', androidRunner.includes('-PreactNativeArchitectures=x86_64') && androidRunner.includes('abi=x86_64')],
  ['Android proof installs the generated release APK explicitly', androidRunner.includes('adb install -r') && androidRunner.includes('app-release.apk')],
  ['Android proof deep link is a single shell command with explicit package', androidRunner.includes("adb shell am start -W -a android.intent.action.VIEW -d 'hnk:///labs/vault-interop' -p com.tehknesolutions.codexhnk") && !androidRunner.includes('adb shell am start -W \\\n')],
  ['Android proof verifies all four frozen checks through native UI', frozenChecks.every((name) => androidRunner.includes(name)) && androidRunner.includes('uiautomator dump')],
  ['Android proof uploads only redacted proof surface', androidWorkflow.includes('hnk-native-vault-android-interop-v1') && androidRunner.includes('secrets-captured=NO') && !androidWorkflow.includes('vdkHex') && !androidRunner.includes('vdkHex') && !androidRunner.includes('recoveryRootSecret')],
  ['iOS proof uses the supported macOS 26 runner', iosWorkflow.includes('runs-on: macos-26')],
  ['iOS proof workflow watches the internal autorun entry route', iosWorkflow.includes("'apps/mobile/src/app/index.tsx'")],
  ['iOS proof workflow delegates to versioned POSIX runner', iosWorkflow.includes('run: sh scripts/run-vault-native-ios-interop.sh') && iosRunner.includes('#!/usr/bin/env sh') && iosRunner.includes('set -eu') && !iosRunner.includes('pipefail')],
  ['iOS proof builds a Release Simulator app without signing', iosRunner.includes('expo prebuild --platform ios --clean --no-install') && iosRunner.includes('pod install') && iosRunner.includes('-configuration Release') && iosRunner.includes('-sdk iphonesimulator') && iosRunner.includes('CODE_SIGNING_ALLOWED=NO')],
  ['iOS proof installs and launches the CI-routed native Lab without custom-scheme UI', iosRunner.includes('xcrun simctl install') && iosRunner.includes('xcrun simctl launch --terminate-running') && !iosRunner.includes('simctl openurl') && iosRunner.includes("bundle_id='com.tehknesolutions.codexhnk'")],
  ['iOS proof is read from the app sandbox instead of visual OCR', iosRunner.includes('simctl get_app_container') && iosRunner.includes('Documents/$proof_filename') && iosRunner.includes('result.json')],
  ['iOS proof verifies all four frozen checks and rejects unknown fields', frozenChecks.every((name) => iosRunner.includes(name)) && iosRunner.includes('unexpected_top_level_proof_field') && iosRunner.includes('unexpected_check_field')],
  ['iOS proof captures a Simulator screenshot and SHA256 manifest', iosRunner.includes('simctl io') && iosRunner.includes('screen.png') && iosRunner.includes('shasum -a 256')],
  ['iOS workflow uploads only the redacted Lab artifact directory', iosWorkflow.includes('hnk-native-vault-ios-interop-v1') && iosWorkflow.includes('artifacts/native-ios-interop') && !iosWorkflow.includes('vdkHex') && !iosWorkflow.includes('recoveryRootSecret')],
  ['iOS proof explicitly asserts no secrets captured', iosRunner.includes('secrets-captured=NO') && iosRunner.includes("data.get('secretsCaptured') is not False")],
  ['Production Native Vault remains independent from public test vectors', !productionVault.includes('@hnk/vault-interop-vectors')],
  ['Day 001 remains disconnected from Native interop harness', !day001.includes('NativeVaultInteropHarness') && !day001.includes('@hnk/vault-interop-vectors')],
  ['Executable spec still treats actual physical-device proof as pending', spec.includes('NATIVE DEVICE VECTOR PROOF = PENDING')],
];

const failed = invariants.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Native Vault interoperability contract validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`HNK Native Vault interoperability contract: valid (${invariants.length} invariants)`);
