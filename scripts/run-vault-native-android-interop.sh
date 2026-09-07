#!/usr/bin/env sh
set -eu

artifact_dir='artifacts/native-android-interop'
proof_xml="$artifact_dir/window.xml"
apk_path='apps/mobile/android/app/build/outputs/apk/release/app-release.apk'

mkdir -p "$artifact_dir"

pnpm --filter @hnk/mobile exec expo prebuild --platform android --clean --no-install
(
  cd apps/mobile/android
  ./gradlew app:assembleRelease -PreactNativeArchitectures=x86_64
)

test -f "$apk_path"
adb install -r "$apk_path" >/dev/null
adb shell am force-stop com.tehknesolutions.codexhnk
adb shell am start -W -a android.intent.action.VIEW -d 'hnk:///labs/vault-interop' -p com.tehknesolutions.codexhnk >/dev/null

success=0
attempt=1
while [ "$attempt" -le 60 ]; do
  adb shell uiautomator dump /sdcard/hnk-native-interop.xml >/dev/null 2>&1 || true
  adb pull /sdcard/hnk-native-interop.xml "$proof_xml" >/dev/null 2>&1 || true
  if [ -f "$proof_xml" ] && grep -q 'content-desc="native-interop-status-PASS"' "$proof_xml"; then
    success=1
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
done

adb exec-out screencap -p > "$artifact_dir/screen.png" || true

if [ "$success" -ne 1 ]; then
  echo 'Android native interop did not reach PASS.'
  if [ -f "$proof_xml" ]; then
    cat "$proof_xml"
  fi
  exit 1
fi

for check in nonce-exact ciphertext-tag-exact checksum-exact decrypt-roundtrip; do
  grep -q "content-desc=\"native-interop-check-${check}-PASS\"" "$proof_xml"
done

if grep -q 'native-interop-status-NATIVE_DEVICE_REQUIRED\|native-interop-status-FAIL\|native-interop-check-.*-FAIL' "$proof_xml"; then
  echo 'Android native interop exposed a failing status.'
  exit 1
fi

android_release="$(adb shell getprop ro.build.version.release | tr -d '\r')"
android_sdk="$(adb shell getprop ro.build.version.sdk | tr -d '\r')"
cat > "$artifact_dir/proof.txt" <<EOF
HNK Vault Native Interop Proof V1
platform=android
runtime=emulator
android_release=${android_release}
android_sdk=${android_sdk}
abi=x86_64
vector=HNK Native-Web vector 001
nonce-exact=PASS
ciphertext-tag-exact=PASS
checksum-exact=PASS
decrypt-roundtrip=PASS
secrets-captured=NO
EOF
sha256sum "$artifact_dir/proof.txt" "$proof_xml" > "$artifact_dir/SHA256SUMS"
