#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

JAVA_VERSION="${JAVA_VERSION:-17}"
INSTALL_ROOT="${JAVA_INSTALL_DIR:-$PWD/.render/java}"
TMP_DIR="$PWD/.render/tmp-java"
ARCHIVE_PATH="$TMP_DIR/temurin-jdk.tar.gz"
DOWNLOAD_URL="https://api.adoptium.net/v3/binary/latest/${JAVA_VERSION}/ga/linux/x64/jdk/hotspot/normal/eclipse"

mkdir -p "$TMP_DIR"
rm -rf "$INSTALL_ROOT"
mkdir -p "$INSTALL_ROOT"

echo "Downloading Temurin JDK ${JAVA_VERSION}..."
curl -fsSL "$DOWNLOAD_URL" -o "$ARCHIVE_PATH"

echo "Extracting JDK to $INSTALL_ROOT..."
tar -xzf "$ARCHIVE_PATH" -C "$INSTALL_ROOT" --strip-components=1

"$INSTALL_ROOT/bin/java" -version

rm -rf "$TMP_DIR"
