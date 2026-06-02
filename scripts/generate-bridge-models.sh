#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKSPACE="$(dirname "$ROOT")"
OPENAPI="$ROOT/generated/openapi.yaml"

KOTLIN_API="$WORKSPACE/freewind-kotlin-android-debug-bridge/debug-bridge/src/main/kotlin/com/freewind/android/debugbridge/api"
SWIFT_GEN="$WORKSPACE/freewind-swiftui-debug-bridge/Sources/FreewindSwiftUIDebugBridge/Generated"
RUST_GEN="$WORKSPACE/freewind-dioxus-debug-bridge/debug-bridge/src/api_models"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$OPENAPI" ]]; then
  echo "missing openapi: $OPENAPI (run pnpm generate first)" >&2
  exit 1
fi

generate() {
  pnpm exec openapi-generator-cli generate -i "$OPENAPI" "$@"
}

echo "==> kotlin"
generate -g kotlin -o "$TMP/kotlin" \
  --global-property models,supportingFiles \
  --additional-properties=serializationLibrary=moshi,moshiCodeGen=true,packageName=com.freewind.android.debugbridge.api,apiPackage=com.freewind.android.debugbridge.api,modelPackage=com.freewind.android.debugbridge.api.models >/dev/null

rm -rf "$KOTLIN_API"
mkdir -p "$KOTLIN_API/models" "$KOTLIN_API/infrastructure"
cp -R "$TMP/kotlin/src/main/kotlin/com/freewind/android/debugbridge/api/models/." "$KOTLIN_API/models/"
for file in Serializer.kt OffsetDateTimeAdapter.kt LocalDateTimeAdapter.kt LocalDateAdapter.kt \
  UUIDAdapter.kt ByteArrayAdapter.kt URIAdapter.kt BigDecimalAdapter.kt BigIntegerAdapter.kt; do
  cp "$TMP/kotlin/src/main/kotlin/com/freewind/android/debugbridge/api/infrastructure/$file" "$KOTLIN_API/infrastructure/"
done

echo "==> swift"
generate -g swift5 -o "$TMP/swift" \
  --global-property models,supportingFiles \
  --additional-properties=projectName=FreewindDebugBridgeAPI,responseAs=AsyncAwait,nonPublicApi=false >/dev/null

rm -rf "$SWIFT_GEN"
mkdir -p "$SWIFT_GEN/Models"
cat > "$SWIFT_GEN/Models.swift" <<'EOF'
// Models.swift
//
// Minimal OpenAPI model support (no HTTP client types).
//

import Foundation

protocol JSONEncodable {
    func encodeToJSON() -> Any
}

open class CodableHelper: @unchecked Sendable {
    nonisolated(unsafe) private static var customDateFormatter: DateFormatter?
    private static let defaultDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXXXX"
        return formatter
    }()

    public static var dateFormatter: DateFormatter {
        get { customDateFormatter ?? defaultDateFormatter }
        set { customDateFormatter = newValue }
    }

    public static let jsonDecoder = JSONDecoder()

    public static let jsonEncoder = JSONEncoder()

    open class func decode<T>(_ type: T.Type, from data: Data) throws -> T where T: Decodable {
        try jsonDecoder.decode(type, from: data)
    }

    open class func encode<T>(_ value: T) throws -> Data where T: Encodable {
        try jsonEncoder.encode(value)
    }
}
EOF
cp "$TMP/swift/FreewindDebugBridgeAPI/Classes/OpenAPIs/Extensions.swift" "$SWIFT_GEN/"
cp "$TMP/swift/FreewindDebugBridgeAPI/Classes/OpenAPIs/Models/"*.swift "$SWIFT_GEN/Models/"
perl -0pi -e 's/\nextension HTTPURLResponse \{.*?\n\}\n/\n/s' "$SWIFT_GEN/Extensions.swift"

echo "==> rust"
generate -g rust -o "$TMP/rust" \
  --global-property models,supportingFiles \
  --additional-properties=packageName=freewind_debug_bridge_api,supportAsync=false,avoidBoxedTypes=true >/dev/null

rm -rf "$RUST_GEN"
mkdir -p "$RUST_GEN"
cp "$TMP/rust/src/models/"*.rs "$RUST_GEN/"
cp "$TMP/rust/src/models/mod.rs" "$RUST_GEN/"

while IFS= read -r file; do
  sd 'use crate::models;' '' "$file"
  sd 'models::' 'super::' "$file"
  sd 'Option<Box<(super::[^>]+)>>' 'Option<$1>' "$file"
  sd 'Box<super::ActionRequest>' 'super::ActionRequest' "$file"
  sd 'Box::new\(example\)' 'example' "$file"
done < <(fd -e rs . "$RUST_GEN")

echo "done: kotlin=$KOTLIN_API swift=$SWIFT_GEN rust=$RUST_GEN"
