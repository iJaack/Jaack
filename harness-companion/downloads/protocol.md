# Harness Companion Protocol 1

HTTPS JSON, `/v1`, `Authorization: Bearer <token>`. Max request/response JSON 2 MiB.
All IDs lowercase UUID strings. Dates Unix seconds. Error `{ "error": "safe message" }`.
Pairing JSON `{ "version":1,"url":"https://192.168.1.2:8766","token":"worker-secret","certificateSHA256":"64-lowercase-hex" }`.
The worker token is bound to one worker upon registration. Harness token is different.

## Worker endpoints
- POST `/v1/register` body `{id,name,platform,capabilities:["text.analyze","text.chunk","image.ocr"]}` -> `{id}`.
- POST `/v1/poll` body `{deviceId}` -> `{job: Job|null}`. Poll every 2 s while user session active.
- POST `/v1/jobs/<id>/progress` `{deviceId,leaseId,progress:0...1}` -> `{cancelled:bool}`.
- POST `/v1/jobs/<id>/complete` `{deviceId,leaseId,result:Result}` -> `{ok:true}`.
- POST `/v1/jobs/<id>/fail` `{deviceId,leaseId,error}` -> `{ok:true}`.
Job `{id,operation,input:{text?:string,chunkSize?:integer,imageBase64?:string},status,deviceId,leaseId,createdAt,progress}`.
Lease expires after 60s without progress. Only exact current device+lease can mutate a job.
Cancelled jobs cannot complete; cancellation wins. Device polls advertise liveness.
Valid out-of-order progress renews the lease and retains the maximum progress value.
The broker independently verifies deterministic text results against input, and verifies OCR
output shape and that text equals lines joined by LF. A new pairing cannot reuse a previous
device UUID; Forget rotates the app's registration UUID so credentials cannot hijack another device.
Result `{output:object,artifactSHA256:string}` digest is SHA256 of UTF8 canonical JSON output
(sorted keys, no spaces, Unicode unescaped); avoid floating point in output.

## Harness endpoints
- GET `/v1/devices` -> `{devices:[{id,name,platform,capabilities,lastSeen}]}`.
- POST `/v1/jobs` `{id,deviceId,operation,input}` -> Job; same ID same payload returns current job;
  changed payload conflicts. Unsupported/offline device => error. Offline threshold 15s.
- GET `/v1/jobs/<id>` -> Job plus optional `result` or `error`.
- POST `/v1/jobs/<id>/cancel` `{}` -> Job. Terminal completed/failed remains unchanged.
- GET `/v1/jobs/<id>/artifact` -> Result only if completed.
- POST `/v1/devices/<id>/revoke` `{}` -> `{ok:true}` invalidates worker credential.

## Operations
text.analyze input text <=200,000 UTF8 bytes. Output `{characters,words,lines,sha256}`.
characters = Unicode scalar count; words = whitespace-separated segments; lines = split on LF,
empty text has 0 lines. sha256 is UTF8 input digest. All counters integers.
text.chunk input same bound, chunkSize 100...10000 default 2000 Unicode scalars.
Output `{chunks:[string],count:integer,sha256}`; joining chunks MUST reproduce input exactly.
image.ocr imageBase64 PNG/JPEG <=1MiB decoded, <=20 million pixels. Vision text recognition.
Output `{text:string,lines:[string]}`. Results are not independent factual verification.

## Harness adapter
CLI init/serve/pair/devices/submit/status/cancel/artifact/revoke/mcp. Private config directory
mode 0700, keys/DB mode 0600. Pair prints only explicit requested worker pairing secret.
MCP stdio newline-delimited JSON-RPC 2.0 initialize, notifications/initialized, ping,
tools/list, tools/call. Tools companion_devices, companion_submit, companion_status,
companion_cancel, companion_artifact. Tool schemas match above. No protocol logs on stdout.
