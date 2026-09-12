import unittest
import threading
import time
import urllib.request
import json
import socketserver
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'clipmerge'))
import db
import serve

TEST_PORT = 8999

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        serve.PORT = TEST_PORT
        socketserver.TCPServer.allow_reuse_address = True
        cls.httpd = socketserver.TCPServer(("", TEST_PORT), serve.Handler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_health_check(self):
        req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/api/health")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode('utf-8'))
            self.assertEqual(data.get("status"), "ok")
            self.assertEqual(data.get("database"), "sqlite3")

    def test_character_endpoints(self):
        char_payload = {
            "id": "char_api_001",
            "name": "Arjun",
            "role": "Cyber Investigator",
            "gender": "male",
            "voice_id": "google_gemini-fenrir",
            "voice_settings": {"pitch": 0.8, "rate": 1.0},
            "script_text": "System breach detected in sector 7.",
            "avatar_preset": "hacker"
        }

        # 1. POST character
        req = urllib.request.Request(
            f"http://127.0.0.1:{TEST_PORT}/api/characters",
            data=json.dumps(char_payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 201)
            saved = json.loads(resp.read().decode('utf-8'))
            self.assertEqual(saved["name"], "Arjun")
            self.assertEqual(saved["gender"], "male")

        # 2. GET characters
        req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/api/characters")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            chars = json.loads(resp.read().decode('utf-8'))
            self.assertTrue(any(c["id"] == "char_api_001" for c in chars))

        # 3. DELETE character
        req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/api/characters/char_api_001", method="DELETE")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            res = json.loads(resp.read().decode('utf-8'))
            self.assertTrue(res.get("success"))

    def test_custom_voice_endpoints(self):
        voice_payload = {
            "id": "voice_api_001",
            "name": "Zephyr-Aoede Hybrid",
            "description": "50% Zephyr + 50% Aoede",
            "gender": "female",
            "base_voice_a": "google_gemini-zephyr",
            "blend_voice_b": "google_gemini-aoede",
            "ratio_a": 0.5,
            "pitch": 1.29,
            "rate": 1.10,
            "timbre": "Youthful Podcast Soprano"
        }

        # 1. POST voice
        req = urllib.request.Request(
            f"http://127.0.0.1:{TEST_PORT}/api/voices",
            data=json.dumps(voice_payload).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 201)
            saved = json.loads(resp.read().decode('utf-8'))
            self.assertEqual(saved["name"], "Zephyr-Aoede Hybrid")

        # 2. GET voices
        req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/api/voices")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            voices = json.loads(resp.read().decode('utf-8'))
            self.assertTrue(any(v["id"] == "voice_api_001" for v in voices))

        # 3. DELETE voice
        req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}/api/voices/voice_api_001", method="DELETE")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            res = json.loads(resp.read().decode('utf-8'))
            self.assertTrue(res.get("success"))

if __name__ == '__main__':
    unittest.main()
