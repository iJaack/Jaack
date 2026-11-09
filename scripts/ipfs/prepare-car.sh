#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export IPFS_BIN
IPFS_BIN=$(scripts/ipfs/install-kubo.sh)
run_dir=$(mktemp -d "${TMPDIR:-/tmp}/jaack-ipfs-car.XXXXXX")
export IPFS_PATH="$run_dir/repo"
trap 'rm -rf "$run_dir"' EXIT
"$IPFS_BIN" init --profile=test > "$run_dir/init.log"
cid=$(scripts/ipfs/add.sh "${1:-_site_ipfs}")
car="$PWD/.tools/jaack-me.car"
"$IPFS_BIN" dag export --offline "$cid" > "$car"
size=$(wc -c < "$car" | tr -d ' ')
commit=$(git rev-parse HEAD)
printf 'CID: %s\nCommit: %s\nCAR bytes: %s\n' "$cid" "$commit" "$size"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then printf 'cid=%s\ncar=%s\nsize=%s\n' "$cid" "$car" "$size" >> "$GITHUB_OUTPUT"; fi
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then printf '### IPFS archive\n\n- CID: `%s`\n- Commit: `%s`\n- CAR: %s bytes\n' "$cid" "$commit" "$size" >> "$GITHUB_STEP_SUMMARY"; fi
