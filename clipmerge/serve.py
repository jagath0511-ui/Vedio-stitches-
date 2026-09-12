import http.server
import socketserver
import os
import json
import urllib.parse
from datetime import datetime, timezone
import db

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Critical headers for WebAssembly SharedArrayBuffer (FFmpeg.wasm)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length <= 0:
            return {}
        raw = self.rfile.read(content_length).decode('utf-8')
        return json.loads(raw)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            return self._send_json({
                'status': 'ok',
                'database': 'sqlite3',
                'timestamp': datetime.now(timezone.utc).isoformat()
            })

        if path == '/api/projects':
            projects = db.list_projects()
            return self._send_json(projects)

        if path.startswith('/api/projects/'):
            proj_id = path[len('/api/projects/'):].strip('/')
            project = db.get_project(proj_id)
            if project:
                return self._send_json(project)
            else:
                return self._send_json({'error': 'Project not found'}, status=404)

        if path == '/api/renders':
            renders = db.list_renders()
            return self._send_json(renders)

        if path == '/api/characters':
            chars = db.list_characters()
            return self._send_json(chars)

        if path.startswith('/api/characters/'):
            char_id = path[len('/api/characters/'):].strip('/')
            char = db.get_character(char_id)
            if char:
                return self._send_json(char)
            else:
                return self._send_json({'error': 'Character not found'}, status=404)

        if path == '/api/voices':
            voices = db.list_custom_voices()
            return self._send_json(voices)

        if path == '/api/settings':
            settings = db.get_settings()
            return self._send_json(settings)

        # Fallback to serving static frontend files
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/projects':
            try:
                data = self._read_json()
                saved = db.save_project(data)
                return self._send_json(saved, status=201)
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/renders':
            try:
                data = self._read_json()
                recorded = db.add_render(data)
                return self._send_json(recorded, status=201)
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/characters':
            try:
                data = self._read_json()
                saved = db.save_character(data)
                return self._send_json(saved, status=201)
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/voices':
            try:
                data = self._read_json()
                saved = db.save_custom_voice(data)
                return self._send_json(saved, status=201)
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/settings':
            try:
                data = self._read_json()
                key = data.get('key')
                value = data.get('value')
                if not key:
                    return self._send_json({'error': 'Key is required'}, status=400)
                db.set_setting(key, value)
                return self._send_json({'success': True, 'key': key})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        self.send_error(404, "Endpoint not found")

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/projects/'):
            proj_id = path[len('/api/projects/'):].strip('/')
            deleted = db.delete_project(proj_id)
            if deleted:
                return self._send_json({'success': True, 'id': proj_id})
            else:
                return self._send_json({'error': 'Project not found'}, status=404)

        if path.startswith('/api/characters/'):
            char_id = path[len('/api/characters/'):].strip('/')
            deleted = db.delete_character(char_id)
            if deleted:
                return self._send_json({'success': True, 'id': char_id})
            else:
                return self._send_json({'error': 'Character not found'}, status=404)

        if path.startswith('/api/voices/'):
            voice_id = path[len('/api/voices/'):].strip('/')
            deleted = db.delete_custom_voice(voice_id)
            if deleted:
                return self._send_json({'success': True, 'id': voice_id})
            else:
                return self._send_json({'error': 'Voice not found'}, status=404)

        self.send_error(404, "Endpoint not found")

if __name__ == '__main__':
    db.init_db()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"ClipMerge local server running with SQLite API & COOP/COEP headers at http://localhost:{PORT}")
        httpd.serve_forever()
