#!/usr/bin/env sh
set -eu

repo_root="$(pwd)"
artifact_dir="$repo_root/artifacts/native-ios-interop"
derived_data="${RUNNER_TEMP:-/tmp}/hnk-native-ios-derived"
bundle_id='com.tehknesolutions.codexhnk'
proof_filename='hnk-native-interop-proof-v1.json'
udid=''

cleanup() {
  if [ -n "${udid:-}" ]; then
    xcrun simctl shutdown "$udid" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

rm -rf "$artifact_dir" "$derived_data"
mkdir -p "$artifact_dir"

pnpm --filter @hnk/mobile exec expo prebuild --platform ios --clean --no-install

cd "$repo_root/apps/mobile/ios"
pod install

workspace="$(find . -maxdepth 1 -name '*.xcworkspace' -print | head -n 1)"
if [ -z "$workspace" ]; then
  echo 'No iOS workspace was generated.'
  exit 1
fi

workspace_name="$(basename "$workspace" .xcworkspace)"
scheme="$(xcodebuild -workspace "$workspace" -list -json | python3 -c 'import json,sys; data=json.load(sys.stdin); schemes=data.get("workspace",{}).get("schemes",[]); target=sys.argv[1]; print(target if target in schemes else (schemes[0] if schemes else ""))' "$workspace_name")"
if [ -z "$scheme" ]; then
  echo 'No shared iOS scheme was found.'
  exit 1
fi

simulator_json="${RUNNER_TEMP:-/tmp}/hnk-simulators.json"
xcrun simctl list devices available -j > "$simulator_json"
udid="$(python3 - "$simulator_json" <<'PY'
import json, re, sys
with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)
choices = []
for runtime, devices in data.get('devices', {}).items():
    if 'iOS' not in runtime:
        continue
    match = re.search(r'iOS-(\d+)-(\d+)', runtime)
    version = tuple(map(int, match.groups())) if match else (0, 0)
    for device in devices:
        if device.get('isAvailable') and device.get('name', '').startswith('iPhone'):
            choices.append((version, device['name'], device['udid'], runtime))
if not choices:
    raise SystemExit('no_available_iphone_simulator')
choices.sort(reverse=True)
print(choices[0][2])
PY
)"

simulator_name="$(python3 - "$simulator_json" "$udid" <<'PY'
import json, sys
with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)
for runtime, devices in data.get('devices', {}).items():
    for device in devices:
        if device.get('udid') == sys.argv[2]:
            print(device.get('name', 'unknown'))
            raise SystemExit(0)
print('unknown')
PY
)"

simulator_runtime="$(python3 - "$simulator_json" "$udid" <<'PY'
import json, sys
with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)
for runtime, devices in data.get('devices', {}).items():
    if any(device.get('udid') == sys.argv[2] for device in devices):
        print(runtime)
        raise SystemExit(0)
print('unknown')
PY
)"

xcrun simctl shutdown all >/dev/null 2>&1 || true
xcrun simctl boot "$udid"
xcrun simctl bootstatus "$udid" -b

xcodebuild \
  -workspace "$workspace" \
  -scheme "$scheme" \
  -configuration Release \
  -sdk iphonesimulator \
  -destination "id=$udid" \
  -derivedDataPath "$derived_data" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  build

app_path="$(find "$derived_data/Build/Products/Release-iphonesimulator" -maxdepth 1 -name '*.app' -print | head -n 1)"
if [ -z "$app_path" ] || [ ! -d "$app_path" ]; then
  echo 'Release Simulator .app was not produced.'
  exit 1
fi

xcrun simctl install "$udid" "$app_path"
# CI autorun is compiled into the app and HomeScreen redirects internally to the
# isolated Lab route. Avoid external custom-scheme navigation because recent iOS
# Simulator versions show a human confirmation alert that makes the proof flaky.
xcrun simctl launch --terminate-running "$udid" "$bundle_id" >/dev/null

container_path="$(xcrun simctl get_app_container "$udid" "$bundle_id" data)"
proof_path="$container_path/Documents/$proof_filename"
proof_ready=0
for attempt in $(seq 1 60); do
  if [ -f "$proof_path" ]; then
    proof_ready=1
    break
  fi
  sleep 2
done

xcrun simctl io "$udid" screenshot "$artifact_dir/screen.png" >/dev/null 2>&1 || true

if [ "$proof_ready" -ne 1 ]; then
  printf '%s\n' 'iOS Simulator native interop proof file was not produced.' > "$artifact_dir/diagnostic.txt"
  exit 1
fi

cp "$proof_path" "$artifact_dir/result.json"

python3 - "$artifact_dir/result.json" <<'PY'
import json, sys
path = sys.argv[1]
with open(path, encoding='utf-8') as handle:
    data = json.load(handle)
allowed_top = {'schema', 'platform', 'vector', 'status', 'checks', 'errorCode', 'secretsCaptured'}
if set(data) - allowed_top:
    raise SystemExit('unexpected_top_level_proof_field')
if data.get('schema') != 'hnk-native-interop-proof-v1':
    raise SystemExit('invalid_proof_schema')
if data.get('platform') != 'ios':
    raise SystemExit('invalid_proof_platform')
if data.get('status') != 'PASS':
    raise SystemExit('native_interop_status_not_pass')
if data.get('secretsCaptured') is not False:
    raise SystemExit('proof_must_assert_no_secrets')
expected = {'nonce-exact', 'ciphertext-tag-exact', 'checksum-exact', 'decrypt-roundtrip'}
checks = data.get('checks')
if not isinstance(checks, list):
    raise SystemExit('invalid_proof_checks')
seen = set()
for check in checks:
    if not isinstance(check, dict) or set(check) - {'name', 'ok'}:
        raise SystemExit('unexpected_check_field')
    name = check.get('name')
    if name not in expected or check.get('ok') is not True:
        raise SystemExit(f'failed_or_unknown_check:{name}')
    seen.add(name)
if seen != expected:
    raise SystemExit('missing_frozen_check')
serialized = json.dumps(data, sort_keys=True).lower()
for forbidden in ('vdkhex', 'recoveryrootsecret', 'ciphertextbase64', 'plaintext', 'noncebase64'):
    if forbidden in serialized:
        raise SystemExit(f'forbidden_secret_material:{forbidden}')
print('iOS Simulator Native Vault interop proof: PASS')
PY

xcode_version="$(xcodebuild -version | tr '\n' ';' | sed 's/;$//')"
cat > "$artifact_dir/proof.txt" <<EOF
HNK Vault Native Interop Proof V1
platform=ios
runtime=simulator
simulator_name=${simulator_name}
simulator_runtime=${simulator_runtime}
xcode=${xcode_version}
vector=HNK Native-Web vector 001
nonce-exact=PASS
ciphertext-tag-exact=PASS
checksum-exact=PASS
decrypt-roundtrip=PASS
secrets-captured=NO
EOF

shasum -a 256 "$artifact_dir/proof.txt" "$artifact_dir/result.json" "$artifact_dir/screen.png" > "$artifact_dir/SHA256SUMS"
