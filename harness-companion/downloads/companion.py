#!/usr/bin/env python3
"""Dependency-free, pinned HTTPS reference broker and harness adapter."""
import argparse
import base64
import hashlib
import http.client
import json
import math
import os
from pathlib import Path
import re
import secrets
import sqlite3
import ssl
import struct
import subprocess
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

VERSION = 1
LIMIT = 2 * 1024 * 1024
OPERATIONS = ['text.analyze', 'text.chunk', 'image.ocr']

def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode('utf-8')

def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()

class APIError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status

def require(value, message='Invalid request', status=400):
    if not value:
        raise APIError(message, status)

def identifier(value):
    require(isinstance(value, str) and re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', value))
    return value

def image_dimensions(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n') and len(data) >= 24 and data[12:16] == b'IHDR':
        return struct.unpack('>II', data[16:24])
    if data.startswith(b'\xff\xd8'):
        offset = 2
        while offset + 4 <= len(data):
            require(data[offset] == 255, 'Invalid image')
            while offset < len(data) and data[offset] == 255:
                offset += 1
            require(offset < len(data), 'Invalid image')
            marker = data[offset]
            offset += 1
            if marker in (0xd8, 0x01) or 0xd0 <= marker <= 0xd7:
                continue
            require(offset + 2 <= len(data), 'Invalid image')
            size = int.from_bytes(data[offset:offset+2], 'big')
            require(size >= 2 and offset + size <= len(data), 'Invalid image')
            if marker in (0xc0, 0xc1, 0xc2):
                require(size >= 8, 'Invalid image')
                height, width = struct.unpack('>HH', data[offset+3:offset+7])
                return width, height
            if marker in (0xda, 0xd9):
                break
            offset += size
    raise APIError('Expected PNG or JPEG')

def validate_input(operation, value):
    require(operation in OPERATIONS, 'Unsupported operation')
    require(isinstance(value, dict))
    if operation.startswith('text.'):
        require(set(value) <= ({'text', 'chunkSize'} if operation == 'text.chunk' else {'text'}))
        require(isinstance(value.get('text'), str))
        require(len(value['text'].encode('utf-8')) <= 200000, 'Text too large')
        if operation == 'text.chunk':
            size = value.get('chunkSize', 2000)
            require(type(size) is int and 100 <= size <= 10000, 'Invalid chunk size')
    else:
        require(set(value) == {'imageBase64'} and isinstance(value['imageBase64'], str))
        try:
            raw = base64.b64decode(value['imageBase64'], validate=True)
        except (ValueError, TypeError):
            raise APIError('Invalid image encoding')
        require(len(raw) <= 1024 * 1024, 'Image too large')
        width, height = image_dimensions(raw)
        require(width > 0 and height > 0 and width * height <= 20000000, 'Image dimensions too large')

def validate_result(result, job=None):
    require(isinstance(result, dict) and set(result) == {'output', 'artifactSHA256'})
    require(isinstance(result['output'], dict))
    def integers_only(value):
        require(not isinstance(value, float), 'Floating point output is unsupported')
        if isinstance(value, dict):
            for item in value.values(): integers_only(item)
        elif isinstance(value, list):
            for item in value: integers_only(item)
    integers_only(result['output'])
    require(result['artifactSHA256'] == digest(result['output']), 'Artifact digest mismatch')
    if job is None:
        return
    output = result['output']
    operation = job['operation']
    if operation == 'text.analyze':
        text = job['input']['text']
        expected = {'characters': len(text), 'words': len(text.split()),
                    'lines': text.count('\n') + 1 if text else 0,
                    'sha256': hashlib.sha256(text.encode('utf-8')).hexdigest()}
        require(set(output) == set(expected) and all(type(output[key]) is int for key in ('characters', 'words', 'lines')) and output == expected,
                'Text analysis does not match input')
    elif operation == 'text.chunk':
        text = job['input']['text']
        size = job['input'].get('chunkSize', 2000)
        expected = [text[start:start + size] for start in range(0, len(text), size)]
        require(set(output) == {'chunks', 'count', 'sha256'} and isinstance(output.get('chunks'), list)
                and type(output.get('count')) is int and output['count'] == len(expected)
                and output['chunks'] == expected and output['sha256'] == hashlib.sha256(text.encode('utf-8')).hexdigest(),
                'Text chunks do not match input')
    elif operation == 'image.ocr':
        require(set(output) == {'text', 'lines'} and isinstance(output.get('text'), str)
                and isinstance(output.get('lines'), list) and all(isinstance(line, str) for line in output['lines'])
                and output['text'] == '\n'.join(output['lines']), 'Invalid OCR result')
    else:
        raise APIError('Unsupported result operation')

class Store:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.config = json.loads((self.directory / 'config.json').read_text())
        self.lock = threading.RLock()
        self.db = sqlite3.connect(self.directory / 'broker.sqlite3', check_same_thread=False)
        os.chmod(self.directory / 'broker.sqlite3', 0o600)
        self.db.executescript('''CREATE TABLE IF NOT EXISTS workers(token TEXT PRIMARY KEY, device TEXT UNIQUE, revoked INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY, data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, payload TEXT NOT NULL, data TEXT NOT NULL, deadline REAL);''')
        self.db.commit()

    def pair(self):
        token = secrets.token_urlsafe(32)
        with self.lock, self.db:
            self.db.execute('INSERT INTO workers(token) VALUES (?)', (hashlib.sha256(token.encode()).hexdigest(),))
        return {'version': VERSION, 'url': self.config['url'], 'token': token, 'certificateSHA256': self.config['certificateSHA256']}

    def save(self, job, deadline=None):
        self.db.execute('UPDATE jobs SET data=?, deadline=? WHERE id=?', (canonical(job).decode(), deadline, job['id']))

    def job(self, job_id):
        row = self.db.execute('SELECT data,deadline FROM jobs WHERE id=?', (identifier(job_id),)).fetchone()
        require(row is not None, 'Job not found', 404)
        return json.loads(row[0]), row[1]

    def dispatch(self, method, path, token, body):
        require(len(canonical(body)) <= LIMIT, 'Request too large', 413)
        require(isinstance(body, dict))
        with self.lock, self.db:
            admin = secrets.compare_digest(token, self.config['harnessToken'])
            worker = self.db.execute('SELECT device,revoked FROM workers WHERE token=?', (hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
            require(admin or (worker is not None and not worker[1]), 'Unauthorized', 401)
            parts = path.strip('/').split('/')
            require(parts and parts[0] == 'v1', 'Not found', 404)
            worker_route = path in ('/v1/register', '/v1/poll') or (len(parts) == 4 and parts[1] == 'jobs' and parts[3] in ('progress','complete','fail'))
            require(not admin if worker_route else admin, 'Forbidden', 403)
            now = time.time()
            if worker_route:
                require(method == 'POST', 'Method not allowed', 405)
                device = identifier(body.get('id') if path == '/v1/register' else body.get('deviceId'))
                require(worker[0] is None and path == '/v1/register' or worker[0] == device, 'Wrong device', 403)
            if path == '/v1/register':
                require(set(body) == {'id','name','platform','capabilities'})
                require(isinstance(body['name'], str) and 0 < len(body['name']) <= 128)
                require(body['platform'] in ('iOS','iPadOS','macOS'))
                caps = body['capabilities']
                require(isinstance(caps, list) and caps and all(isinstance(c, str) and c in OPERATIONS for c in caps) and len(set(caps)) == len(caps))
                existing = self.db.execute('SELECT id FROM devices WHERE id=?', (device,)).fetchone()
                require(not existing or worker[0] == device, 'Device already registered', 409)
                self.db.execute('UPDATE workers SET device=? WHERE token=?', (device, hashlib.sha256(token.encode()).hexdigest()))
                self.db.execute('INSERT OR REPLACE INTO devices VALUES (?,?)', (device, canonical(dict(body, lastSeen=now)).decode()))
                return {'id': device}
            if path == '/v1/poll':
                row = self.db.execute('SELECT data FROM devices WHERE id=?', (device,)).fetchone()
                require(row is not None, 'Register first', 409)
                info = json.loads(row[0]); info['lastSeen'] = now
                self.db.execute('UPDATE devices SET data=? WHERE id=?', (canonical(info).decode(), device))
                for raw, deadline in self.db.execute('SELECT data,deadline FROM jobs ORDER BY rowid').fetchall():
                    job = json.loads(raw)
                    if job['deviceId'] == device and (job['status'] == 'queued' or job['status'] == 'running' and deadline <= now):
                        job.update(status='running', leaseId=str(uuid.uuid4()), progress=0)
                        self.save(job, now + 60)
                        return {'job': job}
                return {'job': None}
            if path == '/v1/devices' and method == 'GET':
                return {'devices': [json.loads(r[0]) for r in self.db.execute('SELECT data FROM devices WHERE id IN (SELECT device FROM workers WHERE revoked=0)')]}
            if path == '/v1/jobs' and method == 'POST':
                require(set(body) == {'id','deviceId','operation','input'})
                identifier(body['id']); identifier(body['deviceId']); validate_input(body['operation'], body['input'])
                payload = canonical(body).decode()
                old = self.db.execute('SELECT payload,data FROM jobs WHERE id=?', (body['id'],)).fetchone()
                if old:
                    require(old[0] == payload, 'ID payload conflict', 409)
                    return json.loads(old[1])
                row = self.db.execute('SELECT data FROM devices WHERE id=? AND id IN (SELECT device FROM workers WHERE revoked=0)', (body['deviceId'],)).fetchone()
                require(row is not None, 'Device unavailable', 409)
                info = json.loads(row[0])
                require(now - info['lastSeen'] <= 15, 'Device offline', 409)
                require(body['operation'] in info['capabilities'], 'Unsupported capability', 409)
                job = dict(body, status='queued', leaseId=None, createdAt=now, progress=0)
                self.db.execute('INSERT INTO jobs VALUES (?,?,?,NULL)', (job['id'], payload, canonical(job).decode()))
                return job
            if len(parts) == 4 and parts[1] == 'devices' and parts[3] == 'revoke' and method == 'POST':
                identifier(parts[2])
                self.db.execute('UPDATE workers SET revoked=1 WHERE device=?', (parts[2],))
                for raw, in self.db.execute('SELECT data FROM jobs').fetchall():
                    job = json.loads(raw)
                    if job['deviceId'] == parts[2] and job['status'] in ('queued','running'):
                        job['status'] = 'cancelled'; self.save(job)
                return {'ok': True}
            if len(parts) in (3,4) and parts[1] == 'jobs':
                job, deadline = self.job(parts[2])
                action = parts[3] if len(parts) == 4 else ''
                if not action and method == 'GET': return job
                if action == 'artifact' and method == 'GET':
                    require(job['status'] == 'completed', 'Artifact unavailable', 409)
                    return job['result']
                if action == 'cancel' and method == 'POST':
                    if job['status'] in ('queued','running'):
                        job['status'] = 'cancelled'; self.save(job)
                    return job
                if worker_route:
                    require(job['deviceId'] == device and job['leaseId'] == body.get('leaseId') and job['leaseId'] is not None, 'Invalid lease', 409)
                    if action == 'progress' and job['status'] == 'cancelled': return {'cancelled': True}
                    require(job['status'] == 'running' and deadline is not None and deadline > now, 'Lease expired or job terminal', 409)
                    if action == 'progress':
                        progress = body.get('progress')
                        require(type(progress) in (int,float) and math.isfinite(progress) and 0 <= progress <= 1, 'Invalid progress')
                        job['progress'] = max(job['progress'], progress); self.save(job, now + 60)
                        return {'cancelled': False}
                    if action == 'complete':
                        validate_result(body.get('result'), job)
                        job.update(status='completed', progress=1, result=body['result'])
                        require(len(canonical(job)) <= LIMIT, 'Result too large', 413)
                    else:
                        require(isinstance(body.get('error'), str) and 0 < len(body['error']) <= 2048)
                        job.update(status='failed', error=body['error'])
                    self.save(job)
                    return {'ok': True}
            raise APIError('Not found', 404)

class Handler(BaseHTTPRequestHandler):
    def setup(self):
        self.request.settimeout(10)
        self.request.do_handshake()
        super().setup()
    def log_message(self, *args): pass
    def do_GET(self): self.handle_api()
    def do_POST(self): self.handle_api()
    def handle_api(self):
        self.connection.settimeout(10)
        try:
            require(not self.headers.get('Transfer-Encoding'), 'Unsupported transfer encoding')
            lengths = self.headers.get_all('Content-Length', [])
            require(len(lengths) <= 1)
            size = int(lengths[0]) if lengths else 0
            require(0 <= size <= LIMIT, 'Request too large', 413)
            raw = self.rfile.read(size)
            require(len(raw) == size)
            body = json.loads(raw, parse_constant=lambda _: (_ for _ in ()).throw(ValueError())) if raw else {}
            auth = self.headers.get('Authorization', '')
            require(auth.startswith('Bearer '), 'Unauthorized', 401)
            result = self.server.store.dispatch(self.command, self.path, auth[7:], body)
            status = 200
        except APIError as error:
            status, result = error.status, {'error': str(error)}
        except (ValueError, TypeError, UnicodeError, RecursionError):
            status, result = 400, {'error': 'Invalid request'}
        except Exception:
            status, result = 500, {'error': 'Internal error'}
        data = canonical(result)
        if len(data) > LIMIT:
            status, data = 413, canonical({'error': 'Response too large'})
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Connection', 'close')
        self.end_headers()
        try: self.wfile.write(data)
        except (OSError, ssl.SSLError): pass
        self.close_connection = True

class Server(ThreadingHTTPServer):
    daemon_threads = True
    def __init__(self, address, store):
        self.store = store
        super().__init__(address, Handler)
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        context.load_cert_chain(store.directory / 'certificate.pem', store.directory / 'private-key.pem')
        self.socket = context.wrap_socket(self.socket, server_side=True, do_handshake_on_connect=False)

    def handle_error(self, request, client_address):
        # Disconnects and failed TLS handshakes carry no useful protocol output.
        pass

class Client:
    def __init__(self, config): self.config = config
    def request(self, method, path, body=None):
        url = urlsplit(self.config['url'])
        require(url.scheme == 'https' and url.hostname and not url.username and not url.password and url.path in ('','/') and not url.query and not url.fragment, 'Invalid broker URL')
        require(re.fullmatch('[0-9a-f]{64}', self.config['certificateSHA256']) is not None, 'Invalid certificate pin')
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE  # Trust is the exact leaf pin, checked before credentials leave.
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        connection = http.client.HTTPSConnection(url.hostname, url.port or 443, context=context, timeout=15)
        try:
            connection.connect()
            actual = hashlib.sha256(connection.sock.getpeercert(binary_form=True)).hexdigest()
            require(secrets.compare_digest(actual, self.config['certificateSHA256']), 'Certificate pin mismatch', 403)
            data = canonical(body) if body is not None else None
            require(data is None or len(data) <= LIMIT, 'Request too large', 413)
            connection.request(method, path, body=data, headers={'Authorization': 'Bearer ' + self.config.get('harnessToken', self.config.get('token','')), 'Content-Type':'application/json'})
            response = connection.getresponse()
            raw = response.read(LIMIT + 1)
            require(len(raw) <= LIMIT, 'Response too large', 413)
            require(response.status == 200, 'Broker rejected request (HTTP %s)' % response.status, response.status)
            result = json.loads(raw)
            if path.endswith('/artifact'): validate_result(result)
            return result
        finally: connection.close()

def initialize(directory, url):
    parsed = urlsplit(url)
    require(parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password and parsed.path in ('', '/') and not parsed.query and not parsed.fragment, 'Invalid broker URL')
    directory = Path(directory).expanduser()
    directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(directory, 0o700)
    require(not any(directory.iterdir()), 'Configuration directory must be empty')
    old_umask = os.umask(0o077)
    try:
        subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-sha256','-nodes','-keyout',str(directory/'private-key.pem'),'-out',str(directory/'certificate.pem'),'-days','365','-subj','/CN=Harness Companion'], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        der = ssl.PEM_cert_to_DER_cert((directory/'certificate.pem').read_text())
        config = {'url':url, 'harnessToken':secrets.token_urlsafe(32), 'certificateSHA256':hashlib.sha256(der).hexdigest()}
        (directory/'config.json').write_bytes(canonical(config))
        for path in directory.iterdir(): os.chmod(path, 0o600)
        store = Store(directory); store.db.close()
    finally: os.umask(old_umask)

TOOLS = [
    {'name':'companion_devices','description':'List connected compute devices','inputSchema':{'type':'object','properties':{},'additionalProperties':False}},
    {'name':'companion_submit','description':'Submit a typed job; reuse id for safe retries','inputSchema':{'type':'object','properties':{'id':{'type':'string','format':'uuid'},'deviceId':{'type':'string','format':'uuid'},'operation':{'type':'string','enum':OPERATIONS},'input':{'type':'object','properties':{'text':{'type':'string'},'chunkSize':{'type':'integer','minimum':100,'maximum':10000},'imageBase64':{'type':'string'}},'additionalProperties':False}},'required':['id','deviceId','operation','input'],'additionalProperties':False}},
] + [{'name':'companion_'+name,'description':description,'inputSchema':{'type':'object','properties':{'id':{'type':'string','format':'uuid'}},'required':['id'],'additionalProperties':False}} for name,description in [('status','Read job state'),('cancel','Cancel pending work'),('artifact','Retrieve and verify completed artifact')]]

def mcp(client, source=sys.stdin, sink=sys.stdout):
    while True:
        line = source.readline(LIMIT + 2)
        if not line: return
        request_id = None
        try:
            require(len(line.encode('utf-8')) <= LIMIT, 'Message too large')
            message = json.loads(line)
            require(isinstance(message, dict) and message.get('jsonrpc') == '2.0')
            candidate_id = message.get('id')
            require(candidate_id is None or type(candidate_id) is int or isinstance(candidate_id, str) and len(candidate_id.encode('utf-8')) <= 128, 'Invalid request ID')
            request_id = candidate_id
            if 'id' not in message: continue
            method = message.get('method')
            if method == 'initialize': result = {'protocolVersion':'2024-11-05','capabilities':{'tools':{}},'serverInfo':{'name':'harness-companion','version':'1.0.0'}}
            elif method == 'ping': result = {}
            elif method == 'tools/list': result = {'tools':TOOLS}
            elif method == 'tools/call':
                params = message.get('params', {})
                name = params.get('name'); args = params.get('arguments', {})
                require(name in {tool['name'] for tool in TOOLS}, 'Unknown tool')
                require(isinstance(args, dict))
                try:
                    if name == 'companion_devices': value = client.request('GET','/v1/devices')
                    elif name == 'companion_submit': value = client.request('POST','/v1/jobs',args)
                    else:
                        job_id = identifier(args.get('id'))
                        action = name.removeprefix('companion_')
                        value = client.request('POST' if action == 'cancel' else 'GET', '/v1/jobs/'+job_id+('' if action == 'status' else '/'+action), {} if action == 'cancel' else None)
                    result = {'content':[{'type':'text','text':canonical(value).decode()}]}
                except (APIError, OSError, ValueError): result = {'content':[{'type':'text','text':'Broker request failed; check connection, input, and job status.'}], 'isError':True}
            else: raise APIError('Method not found', -32601)
            response = {'jsonrpc':'2.0','id':request_id,'result':result}
        except (APIError, ValueError, TypeError, AttributeError, RecursionError) as error:
            response = {'jsonrpc':'2.0','id':request_id,'error':{'code':-32601 if isinstance(error, APIError) and error.status == -32601 else -32600,'message':'Invalid request or unsupported method'}}
        encoded = canonical(response)
        if len(encoded) > LIMIT: encoded = canonical({'jsonrpc':'2.0','id':request_id,'error':{'code':-32603,'message':'Response too large'}})
        sink.write(encoded.decode()+'\n'); sink.flush()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default=str(Path.home()/'.harness-companion'), help='Private configuration directory')
    sub = parser.add_subparsers(dest='command', required=True)
    init = sub.add_parser('init'); init.add_argument('--url', default='https://127.0.0.1:8766')
    serve = sub.add_parser('serve'); serve.add_argument('--host', default='127.0.0.1'); serve.add_argument('--port', type=int, default=8766)
    for name in ('pair','devices','mcp'): sub.add_parser(name)
    submit = sub.add_parser('submit'); submit.add_argument('--id', default=None); submit.add_argument('--device', required=True); submit.add_argument('--operation', choices=OPERATIONS, required=True); submit.add_argument('--input', required=True, help='JSON input file, or - for stdin')
    for name in ('status','cancel','artifact','revoke'): sub.add_parser(name).add_argument('id')
    args = parser.parse_args()
    try:
        if args.command == 'init': initialize(args.config,args.url); print('Initialized private broker configuration.'); return
        if args.command in ('serve','pair'):
            store = Store(args.config)
            if args.command == 'pair': print(canonical(store.pair()).decode()); store.db.close(); return
            Server((args.host,args.port), store).serve_forever(); return
        client = Client(json.loads((Path(args.config)/'config.json').read_text()))
        if args.command == 'mcp': mcp(client); return
        if args.command == 'devices': result = client.request('GET','/v1/devices')
        elif args.command == 'submit':
            source = sys.stdin if args.input == '-' else open(args.input)
            try: raw = source.read(LIMIT+1)
            finally:
                if source is not sys.stdin: source.close()
            require(len(raw.encode()) <= LIMIT, 'Input too large')
            result = client.request('POST','/v1/jobs',{'id':args.id or str(uuid.uuid4()),'deviceId':identifier(args.device),'operation':args.operation,'input':json.loads(raw)})
        else:
            job_id = identifier(args.id)
            path = '/v1/devices/'+job_id+'/revoke' if args.command == 'revoke' else '/v1/jobs/'+job_id+('' if args.command == 'status' else '/'+args.command)
            mutation = args.command in ('cancel','revoke')
            result = client.request('POST' if mutation else 'GET',path,{} if mutation else None)
        print(canonical(result).decode())
    except (APIError, OSError, ValueError, subprocess.SubprocessError):
        print('Request failed. Check configuration, connection, and input.',file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__': main()
