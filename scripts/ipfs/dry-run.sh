#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
report="${TMPDIR:-/tmp}/jaack-ipfs-dry-run.json"
rm -f "$report"
case "${1:-}" in '') bundle exec jekyll build ;; --skip-build) ;; *) echo 'Usage: scripts/ipfs/dry-run.sh [--skip-build]' >&2; exit 1 ;; esac
node scripts/ipfs/gateway-safe.mjs
node scripts/ipfs/check.mjs
export IPFS_BIN
IPFS_BIN=$(scripts/ipfs/install-kubo.sh)
run_dir=$(mktemp -d "${TMPDIR:-/tmp}/jaack-ipfs.XXXXXX")
export IPFS_PATH="$run_dir/repo"
daemon_pid=''
cleanup() {
  if [[ -n "$daemon_pid" ]]; then kill "$daemon_pid" 2>/dev/null || true; wait "$daemon_pid" 2>/dev/null || true; fi
  rm -rf "$run_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
"$IPFS_BIN" init --profile=test > "$run_dir/init.log"
# Allocate two distinct free loopback ports; Kubo must bind them successfully below.
ports=$(node --input-type=module - <<'NODE'
import net from 'node:net';
const servers = await Promise.all([0, 1].map(() => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => resolve(s)); })));
console.log(servers.map(s => s.address().port).join(' '));
servers.forEach(s => s.close());
NODE
)
read -r api_port gateway_port <<< "$ports"
"$IPFS_BIN" config Addresses.API "/ip4/127.0.0.1/tcp/$api_port"
"$IPFS_BIN" config Addresses.Gateway "/ip4/127.0.0.1/tcp/$gateway_port"
"$IPFS_BIN" config --json Addresses.Swarm '[]'
"$IPFS_BIN" config --json Bootstrap '[]'
"$IPFS_BIN" config --json Discovery.MDNS.Enabled false
cid=$(scripts/ipfs/add.sh _site_ipfs)
second=$(scripts/ipfs/add.sh _site_ipfs)
[[ "$cid" == "$second" ]] || { echo 'Non-reproducible CID' >&2; exit 1; }
car="$run_dir/site.car"
"$IPFS_BIN" dag export --offline "$cid" > "$car"
echo "Root CID: $cid"
echo "CAR bytes: $(wc -c < "$car" | tr -d ' ')"
"$IPFS_BIN" daemon --offline > "$run_dir/daemon.log" 2>&1 &
daemon_pid=$!
ready=false
for ((attempt=0; attempt<60; attempt++)); do
  if ! kill -0 "$daemon_pid" 2>/dev/null; then cat "$run_dir/daemon.log" >&2; exit 1; fi
  if curl --silent --fail --max-time 1 "http://127.0.0.1:$gateway_port/ipfs/$cid/" -o /dev/null; then ready=true; break; fi
  sleep 1
done
[[ "$ready" == true ]] || { cat "$run_dir/daemon.log" >&2; echo 'Offline gateway did not start' >&2; exit 1; }
node scripts/ipfs/gateway-smoke.mjs "http://127.0.0.1:$gateway_port" "$cid" _site_ipfs "$report" "$car"
