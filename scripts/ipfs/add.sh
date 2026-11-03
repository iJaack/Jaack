#!/usr/bin/env bash
set -euo pipefail
# Kubo's unixfs-v1-2025 profile: CIDv1, SHA-256, raw leaves, balanced layout,
# fixed 1 MiB chunks and max 1024 children. Profile also pins directory sharding settings.
# IPFS_PATH and the binary must be supplied by the caller (never touch the default ~/.ipfs).
: "${IPFS_PATH:?Set a throwaway IPFS_PATH}"
: "${IPFS_BIN:?Set IPFS_BIN}"
"$IPFS_BIN" config profile apply unixfs-v1-2025 > /dev/null
"$IPFS_BIN" add --offline --trickle=false --recursive --hidden --quieter --pin=true "${1:-_site_ipfs}"
