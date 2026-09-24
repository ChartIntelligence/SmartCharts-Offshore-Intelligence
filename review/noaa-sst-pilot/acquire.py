"""One-shot Task 11D acquisition. Explicit manual invocation only; no runtime import.

The socket receive ceiling includes TLS and HTTP overhead, a stricter bound than
the authorized environmental-body ceiling. No requests/session/retry machinery.
"""
import datetime
import hashlib
import json
from pathlib import Path
import socket
import ssl
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[2]
META = ROOT / '.local/ocean-quarantine/sst/noaa-geo-polar/task11d-metadata'
DEST = META.parent / 'task11d-20260922T120000Z-gulf'
LIMIT = 4 * 1024 * 1024


def unchunk(data):
    result = bytearray()
    pos = 0
    while True:
        end = data.index(b'\r\n', pos)
        size = int(data[pos:end].split(b';')[0], 16)
        pos = end + 2
        if size == 0:
            if data[pos:] != b'\r\n':
                raise ValueError('Unexpected trailers')
            return bytes(result)
        if pos + size + 2 > len(data) or data[pos+size:pos+size+2] != b'\r\n':
            raise ValueError('Incomplete chunk')
        result.extend(data[pos:pos+size])
        pos += size + 2


def acquire():
    # Pin the already inspected selection; refuse a moved/latest request.
    head = json.loads((META / 'subset-head.json').read_text(encoding='utf-8-sig'))
    url = head['url']
    selected = json.loads((META / 'selected-time.json').read_text())['table']['rows']
    assert selected == [['2026-09-22T12:00:00Z']]
    cmr = json.loads((META / 'cmr.json').read_text())
    model = cmr['SpatialExtent']['HorizontalSpatialDomain']['ResolutionAndCoordinateSystem']['GeodeticModel']
    assert model['HorizontalDatumName'] == 'World Geodetic System 1984'
    assert model['EllipsoidName'] == 'WGS 84'
    assert head['status'] == 200
    parts = urlsplit(url)
    assert parts.scheme == 'https' and parts.hostname == 'oceanwatch.pifsc.noaa.gov'
    assert parts.path == '/erddap/griddap/noaacwBLENDEDsstDaily.nc'
    assert unquote(parts.query) == ','.join(v + '[8730][2160:1:2419][5240:1:5599]'
                                          for v in ['analysed_sst', 'analysis_error', 'mask'])
    DEST.mkdir(exist_ok=False)  # One attempt; never overwrite or retry automatically.
    receipt = dict(requestedUrl=url, finalUrl=url, status='INCOMPLETE',
                   startedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   selectedTime=selected[0][0], timeIndex=8730,
                   requestedBounds=[-98, 18, -80, 31], sourceBounds=[262, 18, 280, 31],
                   dimensions=[1, 260, 360], variables=['analysed_sst', 'analysis_error', 'mask'],
                   transferCeiling=LIMIT, receivedTlsBytes=0, bodyBytes=0,
                   retries=0, redirects=0, classification='REAL PILOT / NOT OPERATIONAL')
    incoming, outgoing = ssl.MemoryBIO(), ssl.MemoryBIO()
    tls = ssl.create_default_context().wrap_bio(incoming, outgoing, server_side=False,
                                               server_hostname=parts.hostname)
    plain = bytearray()
    sock = None
    try:
        sock = socket.create_connection((parts.hostname, 443), timeout=90)
        def flush():
            while outgoing.pending:
                sock.sendall(outgoing.read())
        def receive():
            flush()
            remaining = LIMIT - receipt['receivedTlsBytes']
            if remaining <= 0:
                raise ValueError('Hard receive ceiling reached')
            data = sock.recv(min(16384, remaining))
            receipt['receivedTlsBytes'] += len(data)
            if not data:
                return False
            incoming.write(data)
            return True
        while True:
            try:
                tls.do_handshake()
                flush()
                break
            except ssl.SSLWantReadError:
                if not receive():
                    raise ValueError('Handshake EOF')
        request = (f'GET {parts.path}?{parts.query} HTTP/1.1\r\nHost: {parts.hostname}\r\n'
                   'Accept: application/x-netcdf\r\nAccept-Encoding: identity\r\n'
                   'User-Agent: Pelora-bounded-evidence-pilot/1\r\nConnection: close\r\n\r\n').encode('ascii')
        tls.write(request)
        flush()
        headers = None
        while True:
            try:
                data = tls.read(16384)
                if not data:
                    break
                plain.extend(data)
                if headers is None and b'\r\n\r\n' in plain:
                    raw_headers = bytes(plain).split(b'\r\n\r\n', 1)[0].decode('iso-8859-1')
                    lines = raw_headers.split('\r\n')
                    receipt['httpStatus'] = int(lines[0].split()[1])
                    headers = dict(line.split(': ', 1) for line in lines[1:])
                    receipt['headers'] = headers
                    lower = {k.lower(): v for k, v in headers.items()}
                    if receipt['httpStatus'] != 200:
                        raise ValueError('Non-200 response; redirects forbidden')
                    if not lower.get('content-type', '').startswith('application/x-netcdf'):
                        raise ValueError('Unexpected response type')
                    if lower.get('content-encoding', 'identity') != 'identity':
                        raise ValueError('Unexpected content encoding')
                    if int(lower.get('content-length', '0')) > LIMIT:
                        raise ValueError('Advertised body exceeds ceiling')
                if headers is None and len(plain) > 32768:
                    raise ValueError('Oversized HTTP header')
            except ssl.SSLWantReadError:
                if not receive():
                    break
            except ssl.SSLZeroReturnError:
                break
        _, body = bytes(plain).split(b'\r\n\r\n', 1)
        lower = {k.lower(): v for k, v in headers.items()}
        if lower.get('transfer-encoding') == 'chunked':
            body = unchunk(body)
        elif 'content-length' in lower:
            if len(body) != int(lower['content-length']):
                raise ValueError('Incomplete response')
        if body[:4] not in (b'CDF\x01', b'CDF\x02'):
            raise ValueError('Unexpected NetCDF signature')
        (DEST / 'source.nc').write_bytes(body)
        receipt.update(status='ACQUIRED_PENDING_DECODE', bodyBytes=len(body),
                       sha256=hashlib.sha256(body).hexdigest())
    except Exception as exc:
        (DEST / 'incomplete-http.bin').write_bytes(plain)
        receipt['failure'] = type(exc).__name__ + ': ' + str(exc)
        raise
    finally:
        if sock:
            sock.close()
        receipt['completedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        (DEST / 'acquisition.receipt.json').write_text(json.dumps(receipt, indent=2))
        print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    acquire()
