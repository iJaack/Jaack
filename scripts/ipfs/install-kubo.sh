#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# One pin for local runs and CI. GitHub release assets mirror dist.ipfs.tech.
version=v0.43.1
system=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$(uname -m)" in arm64|aarch64) arch=arm64 ;; x86_64|amd64) arch=amd64 ;; *) echo 'Unsupported Kubo architecture' >&2; exit 1 ;; esac
case "$system" in darwin|linux) ;; *) echo 'Unsupported Kubo OS' >&2; exit 1 ;; esac
name="kubo_${version}_${system}-${arch}.tar.gz"
cache="$PWD/.tools/kubo-${version}-${system}-${arch}"
mkdir -p "$cache"
if [[ ! -f "$cache/$name" || ! -f "$cache/$name.sha512" ]]; then
  download=$(mktemp -d "${TMPDIR:-/tmp}/jaack-kubo.XXXXXX")
  trap 'rm -rf "$download"' EXIT
  base="https://github.com/ipfs/kubo/releases/download/$version"
  curl --fail --silent --show-error --location --retry 3 --connect-timeout 20 --max-time 300 "$base/$name" -o "$download/$name"
  curl --fail --silent --show-error --location --retry 3 --connect-timeout 20 --max-time 60 "$base/$name.sha512" -o "$download/$name.sha512"
  mv "$download/$name" "$download/$name.sha512" "$cache/"
fi
# Verify the cached archive on every run; never trust a previously extracted binary.
(cd "$cache" && shasum -a 512 -c "$name.sha512" >&2)
tar -xzf "$cache/$name" -C "$cache" kubo/ipfs
"$cache/kubo/ipfs" version >&2
printf '%s\n' "$cache/kubo/ipfs"
