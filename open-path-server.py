#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs, unquote
import subprocess
import os

ALLOWED_PREFIXES = [
    '/Users/brandonkatz/.openclaw/workspace/betsorted/',
    '/Users/brandonkatz/Documents/BetSorted/',
]

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != '/open':
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')
            return

        qs = parse_qs(parsed.query)
        path = qs.get('path', [''])[0]
        path = unquote(path)

        if not path:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path')
            return

        # Security: only allow whitelisted prefixes
        if not any(path.startswith(prefix) for prefix in ALLOWED_PREFIXES):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b'Forbidden')
            return

        if not os.path.exists(path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Path not found')
            return

        # Open path in Finder
        subprocess.Popen(['open', path])
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8766), Handler)
    print('OpenPath server running on http://localhost:8766')
    server.serve_forever()
