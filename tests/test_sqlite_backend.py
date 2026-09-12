import unittest
import os
import tempfile
import sys

# Add clipmerge directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'clipmerge'))
import db

class TestSQLiteBackend(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_db = os.path.join(self.temp_dir.name, 'test_clipmerge.db')
        db.init_db(self.test_db)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_project_crud(self):
        # 1. Create a project
        sample_project = {
            "id": "proj_test_001",
            "name": "Cinematic Teaser",
            "description": "Epic 4K trailer cut",
            "resolution": "2160p",
            "script_text": "In a world of sound and light...",
            "language": "en-US",
            "voice_settings": {"pitch": 0.75, "rate": 0.9, "preset": "cinematic"},
            "clips": [
                {
                    "id": "c1",
                    "name": "drone_opening.mp4",
                    "shot_number": 1,
                    "order_index": 0,
                    "duration": 4.5,
                    "prompt_text": "Aerial wide shot over mountains",
                    "ai_metadata": {"confidence": 0.98, "scene": "nature"}
                },
                {
                    "id": "c2",
                    "name": "actor_close_up.mp4",
                    "shot_number": 2,
                    "order_index": 1,
                    "duration": 3.2,
                    "prompt_text": "Intense close-up of protagonist",
                    "ai_metadata": {"confidence": 0.95, "scene": "character"}
                }
            ]
        }

        saved = db.save_project(sample_project, db_path=self.test_db)
        self.assertIsNotNone(saved)
        self.assertEqual(saved["name"], "Cinematic Teaser")
        self.assertEqual(len(saved["clips"]), 2)
        self.assertEqual(saved["clips"][0]["name"], "drone_opening.mp4")
        self.assertEqual(saved["voice_settings"]["preset"], "cinematic")

        # 2. List projects
        projects_list = db.list_projects(db_path=self.test_db)
        self.assertEqual(len(projects_list), 1)
        self.assertEqual(projects_list[0]["clip_count"], 2)

        # 3. Retrieve single project
        retrieved = db.get_project("proj_test_001", db_path=self.test_db)
        self.assertEqual(retrieved["id"], "proj_test_001")
        self.assertEqual(retrieved["description"], "Epic 4K trailer cut")

        # 4. Delete project
        deleted = db.delete_project("proj_test_001", db_path=self.test_db)
        self.assertTrue(deleted)
        self.assertEqual(len(db.list_projects(db_path=self.test_db)), 0)

    def test_render_history(self):
        render_data = {
            "project_name": "Test Montage",
            "output_filename": "final_montage_1080p.mp4",
            "resolution": "1080p",
            "file_size_bytes": 10485760,
            "duration_seconds": 12.5,
            "has_voiceover": 1
        }
        added = db.add_render(render_data, db_path=self.test_db)
        self.assertIsNotNone(added["id"])
        self.assertEqual(added["output_filename"], "final_montage_1080p.mp4")

        renders = db.list_renders(db_path=self.test_db)
        self.assertEqual(len(renders), 1)
        self.assertEqual(renders[0]["resolution"], "1080p")

    def test_settings(self):
        db.set_setting("theme", "dark", db_path=self.test_db)
        settings = db.get_settings(db_path=self.test_db)
        self.assertEqual(settings.get("theme"), "dark")

    def test_character_crud(self):
        char_data = {
            "id": "char_001",
            "name": "Detective Priya",
            "role": "Lead Investigator",
            "avatar_url": "https://example.com/priya.png",
            "gender": "female",
            "voice_id": "google-te-a",
            "voice_settings": {"pitch": 1.15, "rate": 0.98},
            "script_text": "The clue was hidden right before our eyes."
        }
        saved = db.save_character(char_data, db_path=self.test_db)
        self.assertIsNotNone(saved)
        self.assertEqual(saved["name"], "Detective Priya")
        self.assertEqual(saved["gender"], "female")
        self.assertEqual(saved["voice_settings"]["pitch"], 1.15)

        chars = db.list_characters(db_path=self.test_db)
        self.assertEqual(len(chars), 1)
        self.assertEqual(chars[0]["name"], "Detective Priya")

        fetched = db.get_character("char_001", db_path=self.test_db)
        self.assertEqual(fetched["role"], "Lead Investigator")

        deleted = db.delete_character("char_001", db_path=self.test_db)
        self.assertTrue(deleted)
        self.assertEqual(len(db.list_characters(db_path=self.test_db)), 0)

    def test_custom_voice_crud(self):
        voice_data = {
            "id": "voice_hybrid_001",
            "name": "Puck-Lyra Dynamic",
            "description": "70% Puck dynamic energy + 30% Lyra crystal resonance",
            "gender": "male",
            "base_voice_a": "gemini-puck",
            "blend_voice_b": "gemini-lyra",
            "ratio_a": 0.7,
            "pitch": 1.11,
            "rate": 1.08,
            "timbre": "Dynamic Crystal Baritone"
        }
        saved = db.save_custom_voice(voice_data, db_path=self.test_db)
        self.assertIsNotNone(saved)
        self.assertEqual(saved["name"], "Puck-Lyra Dynamic")
        self.assertEqual(saved["gender"], "male")
        self.assertAlmostEqual(saved["ratio_a"], 0.7)

        voices = db.list_custom_voices(db_path=self.test_db)
        self.assertEqual(len(voices), 1)
        self.assertEqual(voices[0]["base_voice_a"], "gemini-puck")

        deleted = db.delete_custom_voice("voice_hybrid_001", db_path=self.test_db)
        self.assertTrue(deleted)
        self.assertEqual(len(db.list_custom_voices(db_path=self.test_db)), 0)

if __name__ == '__main__':
    unittest.main()

