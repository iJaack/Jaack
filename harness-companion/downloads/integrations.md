# Connect any harness

The reference adapter uses Python 3.10+ and its standard library. Initial certificate generation
requires the system `openssl` command. It executes only the three built-in protocol operations;
it does not execute scripts, shell commands, or model-generated code.

From the directory where you saved companion.py:

```sh
python3 companion.py init
python3 companion.py serve
```

Configuration defaults to `~/.harness-companion` (0700). The harness token, private key and
SQLite database are private files (0600). Keep this directory outside source control and
back it up securely. `init` requires an empty directory and never overwrites an existing identity.
The certificate lasts 365 days; replacing it requires new pairing on each device.

For an iPhone or iPad, initialize with the Mac's reachable LAN address and explicitly listen
on the LAN. The device and Mac must be able to reach each other; no hosted relay is provided.

```sh
python3 companion.py --config ~/.companion-lan init --url https://192.168.1.2:8766
python3 companion.py --config ~/.companion-lan serve --host 0.0.0.0 --port 8766
```

In a separate terminal, request one worker credential:

```sh
python3 companion.py --config ~/.companion-lan pair
```

Paste the resulting pairing JSON into Harness Companion. This command intentionally displays
the worker secret: do not publish it or paste it into a shared chat. Each `pair` creates a
separate credential, permanently bound to the first device that registers with it. Forgetting a
connection in the app creates a new device UUID for the next pairing. A new credential cannot
take over an existing device UUID, even after revocation. A worker
credential cannot submit jobs, list devices, or inspect other devices' work. Start sharing in
the app before submitting. Mobile sharing runs during the visible foreground session.

## CLI lifecycle

All commands accept `--config DIRECTORY` **before** their subcommand. Responses are JSON;
failures exit nonzero and print a safe message to stderr. `serve` and `mcp` never print credentials.
Use a stable UUID with `--id` when retrying submission. Reusing an ID with altered input conflicts.

```sh
python3 companion.py devices
# Write {"text":"Hello world"} to input.json, then use an ID returned by devices:
python3 companion.py submit --device DEVICE_UUID --operation text.analyze --input input.json --id JOB_UUID
python3 companion.py status JOB_UUID
python3 companion.py artifact JOB_UUID
python3 companion.py cancel JOB_UUID
python3 companion.py revoke DEVICE_UUID
```

`--input -` reads JSON from stdin. `--id` is optional; omission generates a UUID.
Operations: `text.analyze`, `text.chunk`, and `image.ocr`. The exact input formats and limits
are specified in [the protocol](protocol.md). Only operations advertised by the target device
are accepted. Devices become offline after 15 seconds without registration/polling.

A lease lasts 60 seconds and progress renews it. Out-of-order valid progress reports renew
the lease while retaining the highest reported progress. An expired lease can be reissued on the next
poll with a fresh lease ID and reset progress. Old workers cannot complete or modify that lease.
Cancellation is terminal and wins over subsequent completion. Revocation invalidates the worker
credential and cancels its queued/running jobs; historical results remain in the local database.
To erase all local records, stop the broker and delete its private configuration directory;
this also destroys its identity and invalidates existing pairings.

Artifacts include SHA256 of canonical UTF-8 JSON output: sorted keys, no spaces, Unicode
unescaped, no floating point output. The broker and CLI verify the digest. The broker also recomputes text analysis counters and
text chunks from the stored input, rejecting forged output even with a matching digest. OCR
results must have exactly text and lines fields, with text equal to the lines joined by LF;
the broker does not independently rerun Vision. A digest proves
content integrity, not that the result independently establishes factual truth.

## MCP stdio

Configure the harness's MCP server launcher with an absolute Python executable, script path,
and private config path. For harnesses accepting the common `mcpServers` configuration shape:

```json
{
  "mcpServers": {
    "companion": {
      "command": "/usr/bin/python3",
      "args": ["/absolute/path/companion.py", "--config", "/absolute/path/.harness-companion", "mcp"]
    }
  }
}
```

Choose a Python 3.10+ installation on your machine. The adapter communicates using newline
delimited JSON-RPC on stdin/stdout and exposes `companion_devices`, `companion_submit`,
`companion_status`, `companion_cancel`, and `companion_artifact`. Submit arguments are
`{id,deviceId,operation,input}`; status/cancel/artifact arguments are `{id}`; devices takes `{}`.
It supports initialize, initialized notification, ping, tools/list and tools/call. Configuration
syntax differs by harness; this protocol adapter has been tested directly, without implying
independent certification of every Codex, Claude Code, or OpenClaw version.

Both the CLI and app pin the exact broker leaf certificate. The CLI checks the pin before
sending a bearer credential and follows no redirects. Never disable pin checks to work around
a connection failure. JSON request/response size is limited to 2 MiB.

## Verification

The release tests exercise a real HTTPS broker and native Swift client, authorization, role/device isolation, pin and redirect rejection, lease expiry, cancellation, payload bounds, artifact hashes and MCP framing.
