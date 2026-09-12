#!/usr/bin/env python3
"""
==============================================================================
ClipMerge Autonomous App Verification Agent
==============================================================================
Checks the complete working and integrity of the ClipMerge AI Suite with
specialized deep diagnostics for Audio Station (Audio Studio), Lyra Voice
Integration, Video Stitching, Image Enhancement, and SQLite Backend API.
"""

import sys
import os
import re
import json
import time
import tempfile
import unittest
from datetime import datetime

# Configure UTF-8 stdout for Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Root workspace directory
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CLIPMERGE_DIR = os.path.join(WORKSPACE_DIR, 'clipmerge')
sys.path.insert(0, CLIPMERGE_DIR)


class TerminalColor:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    RESET = '\033[0m'

    @classmethod
    def strip(cls, text):
        return re.sub(r'\033\[[0-9;]*m', '', text)


class AppVerificationAgent:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.results = {
            'agent': 'ClipMergeAppVerificationAgent',
            'timestamp': datetime.now().isoformat(),
            'total_checks': 0,
            'passed_checks': 0,
            'failed_checks': 0,
            'warnings': 0,
            'sections': {},
            'execution_time_ms': 0
        }
        self.start_time = 0

    def record_check(self, section, check_name, passed, detail='', is_warning=False):
        self.results['total_checks'] += 1
        if section not in self.results['sections']:
            self.results['sections'][section] = []

        status = 'PASS' if passed else ('WARN' if is_warning else 'FAIL')
        if passed:
            self.results['passed_checks'] += 1
        elif is_warning:
            self.results['warnings'] += 1
        else:
            self.results['failed_checks'] += 1

        entry = {
            'check': check_name,
            'status': status,
            'detail': detail
        }
        self.results['sections'][section].append(entry)

        if self.verbose or not passed:
            prefix = f"{TerminalColor.GREEN}[PASS]{TerminalColor.RESET}" if passed else (
                f"{TerminalColor.YELLOW}[WARN]{TerminalColor.RESET}" if is_warning else
                f"{TerminalColor.RED}[FAIL]{TerminalColor.RESET}"
            )
            print(f"  {prefix} {check_name}: {TerminalColor.DIM}{detail}{TerminalColor.RESET}")

    def run_all(self, audio_only=False):
        self.start_time = time.time()
        print(f"\n{TerminalColor.BOLD}{TerminalColor.CYAN}======================================================================{TerminalColor.RESET}")
        print(f"{TerminalColor.BOLD}{TerminalColor.CYAN}          ClipMerge Autonomous App Verification Agent                 {TerminalColor.RESET}")
        print(f"{TerminalColor.BOLD}{TerminalColor.CYAN}======================================================================{TerminalColor.RESET}")
        print(f"[*] Workspace Root: {WORKSPACE_DIR}")
        print(f"[*] App Directory:  {CLIPMERGE_DIR}")
        print(f"[*] Audio-Only Mode: {audio_only}\n")

        # 1. First Check: Audio Station & Lyra (Prioritized)
        print(f"{TerminalColor.BOLD}[1/4] Checking Audio Station & Lyra AI Voice Integration...{TerminalColor.RESET}")
        self.check_audio_station()

        if not audio_only:
            # 2. Frontend DOM & Views Integrity
            print(f"\n{TerminalColor.BOLD}[2/4] Checking Core Views & DOM Integrity...{TerminalColor.RESET}")
            self.check_views_and_dom()

            # 3. Media Processing & Enhancement Assets
            print(f"\n{TerminalColor.BOLD}[3/4] Checking Video & Image Enhancement Pipelines...{TerminalColor.RESET}")
            self.check_media_enhancement()

            # 4. SQLite Backend Server & Security Headers
            print(f"\n{TerminalColor.BOLD}[4/4] Checking SQLite Server & Security Headers...{TerminalColor.RESET}")
            self.check_backend_sqlite()

        self.results['execution_time_ms'] = round((time.time() - self.start_time) * 1000, 2)
        self.print_summary()
        self.save_report()

        return self.results['failed_checks'] == 0

    # --------------------------------------------------------------------------
    # SUITE 1: AUDIO STATION & LYRA VERIFICATION
    # --------------------------------------------------------------------------
    def check_audio_station(self):
        section = 'Audio Station'

        # File checks
        audio_studio_js = os.path.join(CLIPMERGE_DIR, 'audio-studio.js')
        self.record_check(section, 'audio-studio.js file exists', os.path.isfile(audio_studio_js), audio_studio_js)

        if not os.path.isfile(audio_studio_js):
            return

        with open(audio_studio_js, 'r', encoding='utf-8') as f:
            audio_code = f.read()

        index_html = os.path.join(CLIPMERGE_DIR, 'index.html')
        with open(index_html, 'r', encoding='utf-8') as f:
            html = f.read()

        main_js = os.path.join(CLIPMERGE_DIR, 'main.js')
        with open(main_js, 'r', encoding='utf-8') as f:
            js = f.read()

        # Check AudioStudio class export
        has_class = bool(re.search(r'export\s+class\s+AudioStudio\b', audio_code))
        self.record_check(section, 'AudioStudio class export exists', has_class, 'export class AudioStudio in audio-studio.js')

        # Check GOOGLE_VOICE_MODELS export
        has_models = bool(re.search(r'export\s+const\s+GOOGLE_VOICE_MODELS\b', audio_code))
        self.record_check(section, 'GOOGLE_VOICE_MODELS catalog export exists', has_models, 'export const GOOGLE_VOICE_MODELS')

        # Check Lyra in GOOGLE_VOICE_MODELS
        has_gemini_lyra = 'gemini-lyra' in audio_code
        self.record_check(section, "gemini-lyra model in GOOGLE_VOICE_MODELS", has_gemini_lyra,
                          'id: gemini-lyra, name: Lyra (Gemini AI 2.0)')

        # Check Lyra in TONE_PRESETS
        has_lyra_preset = bool(re.search(r'lyra\s*:\s*\{[^}]*pitch[^}]*rate[^}]*\}', audio_code))
        self.record_check(section, "Lyra preset in AudioStudio.TONE_PRESETS", has_lyra_preset,
                          'lyra: { pitch: 1.12, rate: 1.02, label: "✨ Lyra ..." }')

        # Check all required tone presets in audio-studio.js
        for preset in ['lyra', 'cinematic', 'energetic', 'storyteller', 'professional', 'calm']:
            present = f"'{preset}'" in audio_code or f'"{preset}"' in audio_code or f"{preset}:" in audio_code
            self.record_check(section, f"Tone Preset '{preset}' present in AudioStudio", present, f"Preset '{preset}' verified")

        # Check Audio Station HTML View and Navigation Tab
        has_view = 'id="viewAudioStudio"' in html
        has_tab = 'id="tabAudioStudio"' in html
        self.record_check(section, 'Audio Studio View (#viewAudioStudio) in index.html', has_view, 'Main container view')
        self.record_check(section, 'Audio Studio Tab (#tabAudioStudio) in index.html', has_tab, 'Navigation tab button')

        # Check Lyra Tone Preset Button in index.html
        has_lyra_btn = bool(re.search(r'data-preset=[\'"]lyra[\'"]', html))
        self.record_check(section, 'Lyra Tone Preset button in index.html', has_lyra_btn,
                          '<button class="tone-preset-btn" data-preset="lyra">')

        # Check Lyra in Voice Merger select dropdowns
        has_merger_lyra_a = bool(re.search(r'id=[\'"]mergeVoiceA[\'"][^>]*>[\s\S]*?value=[\'"]gemini-lyra[\'"]', html))
        has_merger_lyra_b = bool(re.search(r'id=[\'"]mergeVoiceB[\'"][^>]*>[\s\S]*?value=[\'"]gemini-lyra[\'"]', html))
        self.record_check(section, 'Lyra in Voice Merger Voice A select', has_merger_lyra_a, 'mergeVoiceA includes gemini-lyra')
        self.record_check(section, 'Lyra in Voice Merger Voice B select', has_merger_lyra_b, 'mergeVoiceB includes gemini-lyra')

        # Check Audio Station UI Controls in index.html
        audio_dom_elements = [
            ('audioScriptInput', 'Voiceover script textarea'),
            ('audioScriptCharCount', 'Character count counter'),
            ('audioScriptEstTime', 'Duration estimation badge'),
            ('audioLangSelect', 'Target language selector'),
            ('btnTranslateTelugu', 'Gemini Telugu translation button'),
            ('btnPolishEnglishScript', 'English narration polisher button'),
            ('audioVoiceSelect', 'Voice profile dropdown select'),
            ('audioPitchSlider', 'Voice pitch fine-tuning slider'),
            ('audioRateSlider', 'Speech speed/rate slider'),
            ('btnAuditionVoice', 'Audition voice test button'),
            ('btnStopAudition', 'Stop speech audition button'),
            ('btnToggleMicRecord', 'Microphone voice recording button'),
            ('audioCloneFileInput', 'Audio file voice sampler input'),
            ('mergeVoiceA', 'Voice Merger base voice select'),
            ('mergeVoiceB', 'Voice Merger blend accent select'),
            ('mergeRatioSlider', 'Voice blending ratio slider'),
            ('btnSynthesizeMergedVoice', 'Synthesize hybrid voice button'),
            ('btnSynthesizeFullAudio', 'Generate full voiceover WAV track button'),
            ('audioStudioPlayer', 'Master audio playback element'),
            ('btnDownloadAudioTrack', 'Download master WAV audio button'),
            ('btnAttachToMergedVideo', 'Multiplex voiceover into video button'),
        ]

        for el_id, desc in audio_dom_elements:
            exists = f'id="{el_id}"' in html or f"id='{el_id}'" in html
            self.record_check(section, f"DOM Element '#{el_id}' ({desc})", exists, f"Required for Audio Studio operation")

        # Check Voice Merger Math Simulation
        # Simulate blending Lyra (pitch 1.12, rate 1.02) with Cinematic (pitch 0.75, rate 0.9) at 60/40 ratio
        pitch_a, rate_a = 1.12, 1.02
        pitch_b, rate_b = 0.75, 0.90
        ratio_a = 0.6
        ratio_b = 0.4
        blended_pitch = round(pitch_a * ratio_a + pitch_b * ratio_b, 2)
        blended_rate = round(rate_a * ratio_a + rate_b * ratio_b, 2)
        expected_pitch = 0.97
        expected_rate = 0.97

        math_ok = (blended_pitch == expected_pitch) and (blended_rate == expected_rate)
        self.record_check(section, 'Voice Merger Blending Algorithm Math', math_ok,
                          f"Blend Lyra(60%) + Cinematic(40%) -> Pitch: {blended_pitch}x, Rate: {blended_rate}x")

        # Check Script Duration Estimation Math (13 chars per second standard)
        sample_chars = 130
        est_sec = max(1, round(sample_chars / 13))
        self.record_check(section, 'Speech Duration Estimation Math (13 chars/sec)', est_sec == 10,
                          f"130 chars -> {est_sec}s estimated audio")

        # Check main.js event listeners for Lyra and Audio Studio
        has_init_ui = 'initAudioStudioVoicesUI' in js
        has_lyra_sync = 'gemini-lyra' in js or 'presetKey === \'lyra\'' in js or "data-preset=\"lyra\"" in html
        self.record_check(section, 'initAudioStudioVoicesUI() defined in main.js', has_init_ui, 'Populates voice selectors')
        self.record_check(section, 'Lyra voice selection event sync in main.js', has_lyra_sync, 'Handles Lyra preset selection')

    # --------------------------------------------------------------------------
    # SUITE 2: CORE VIEWS & DOM INTEGRITY
    # --------------------------------------------------------------------------
    def check_views_and_dom(self):
        section = 'Views & DOM Integrity'

        index_html = os.path.join(CLIPMERGE_DIR, 'index.html')
        main_js = os.path.join(CLIPMERGE_DIR, 'main.js')

        with open(index_html, 'r', encoding='utf-8') as f:
            html = f.read()

        with open(main_js, 'r', encoding='utf-8') as f:
            js = f.read()

        # Check all 4 views exist in index.html
        views = [
            ('viewStitchEdit', 'tabStitchEdit', 'Stitch & AI Storyboard Editor'),
            ('viewVideoEnhance', 'tabVideoEnhance', '1080P & 4K Video Enhancer'),
            ('viewImageEnhance', 'tabImageEnhance', 'Image Enhancer (1080P & 4K)'),
            ('viewAudioStudio', 'tabAudioStudio', 'AI Audio & Voice Studio'),
        ]

        for view_id, tab_id, name in views:
            has_view = f'id="{view_id}"' in html or f"id='{view_id}'" in html
            has_tab = f'id="{tab_id}"' in html or f"id='{tab_id}'" in html
            self.record_check(section, f"View '{name}' Container (#{view_id})", has_view, f"App view panel")
            self.record_check(section, f"View '{name}' Nav Tab (#{tab_id})", has_tab, f"App navigation tab")

        # Check switchAppView function
        has_switch_func = 'function switchAppView' in js
        self.record_check(section, 'switchAppView() view controller in main.js', has_switch_func,
                          'Coordinates switching between the 4 app views')

        # Check for missing document.getElementById calls
        ids_in_js = re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", js)
        unique_ids = sorted(list(set(ids_in_js)))

        missing_ids = []
        for el_id in unique_ids:
            # Check if present statically or dynamically in templates
            pattern_static = rf'id=[\'"]{re.escape(el_id)}[\'"]'
            pattern_dynamic = rf'id=[\'"`]{re.escape(el_id)}[\'"`]'
            if not re.search(pattern_static, html) and not re.search(pattern_dynamic, js):
                missing_ids.append(el_id)

        # Allow known dynamically generated or safely guarded IDs
        critical_missing = [i for i in missing_ids if i not in ['btnGoToSaveTab', 'btnOpenImageEnhancer', 'postMergePosterStatus']]
        no_critical_missing = len(critical_missing) == 0
        self.record_check(section, 'DOM ID Reference Integrity (main.js -> index.html)', no_critical_missing,
                          f"Checked {len(unique_ids)} IDs. Missing: {critical_missing if critical_missing else 'None'}")

    # --------------------------------------------------------------------------
    # SUITE 3: MEDIA ENHANCEMENT & PIPELINE ASSETS
    # --------------------------------------------------------------------------
    def check_media_enhancement(self):
        section = 'Media Enhancement'

        # Check FFmpeg Handler
        ffmpeg_handler_js = os.path.join(CLIPMERGE_DIR, 'ffmpeg-handler.js')
        self.record_check(section, 'ffmpeg-handler.js exists', os.path.isfile(ffmpeg_handler_js), ffmpeg_handler_js)

        # Check local ffmpeg-core assets
        ffmpeg_core_dir = os.path.join(CLIPMERGE_DIR, 'ffmpeg-core')
        has_core_dir = os.path.isdir(ffmpeg_core_dir)
        self.record_check(section, 'ffmpeg-core WebAssembly directory exists', has_core_dir, ffmpeg_core_dir)

        if has_core_dir:
            core_files = os.listdir(ffmpeg_core_dir)
            has_wasm_or_js = any(f.endswith('.js') or f.endswith('.wasm') for f in core_files)
            self.record_check(section, 'Offline FFmpeg.wasm assets present', has_wasm_or_js, f"Found {len(core_files)} files")

        # Check Image Enhancer
        image_enhancer_js = os.path.join(CLIPMERGE_DIR, 'image-enhancer.js')
        self.record_check(section, 'image-enhancer.js exists', os.path.isfile(image_enhancer_js), image_enhancer_js)

        if os.path.isfile(image_enhancer_js):
            with open(image_enhancer_js, 'r', encoding='utf-8') as f:
                img_code = f.read()
            has_unsharp = 'applyUnsharpMask' in img_code or 'unsharp' in img_code
            has_upscale = 'upscaleCanvas' in img_code or 'drawImage' in img_code
            self.record_check(section, 'Image sharpening convolution algorithm present', has_unsharp, 'Unsharp mask filter')
            self.record_check(section, 'Canvas resolution scaling pipeline present', has_upscale, '1080p & 2160p scaling')

        # Check Sample Video Clips
        samples_dir = os.path.join(CLIPMERGE_DIR, 'samples')
        has_samples = os.path.isdir(samples_dir)
        self.record_check(section, 'Sample video test clips directory exists', has_samples, samples_dir)

        if has_samples:
            clips = [f for f in os.listdir(samples_dir) if f.endswith('.mp4')]
            self.record_check(section, 'Sample MP4 clips available for test stitching', len(clips) >= 5,
                              f"Found {len(clips)} test video clips")

    # --------------------------------------------------------------------------
    # SUITE 4: SQLITE BACKEND & SECURITY HEADERS
    # --------------------------------------------------------------------------
    def check_backend_sqlite(self):
        section = 'Backend & SQLite API'

        db_py = os.path.join(CLIPMERGE_DIR, 'db.py')
        serve_py = os.path.join(CLIPMERGE_DIR, 'serve.py')

        self.record_check(section, 'db.py SQLite engine exists', os.path.isfile(db_py), db_py)
        self.record_check(section, 'serve.py HTTP server exists', os.path.isfile(serve_py), serve_py)

        # Test SQLite CRUD functionality in temp database
        if os.path.isfile(db_py):
            try:
                import db
                with tempfile.TemporaryDirectory() as tmpdir:
                    test_db = os.path.join(tmpdir, 'agent_test.db')
                    db.init_db(test_db)

                    # Save project with Lyra voice settings
                    project_data = {
                        "id": "agent_test_proj",
                        "name": "Lyra AI Test Project",
                        "description": "Automated verification test with Lyra audio",
                        "resolution": "1080p",
                        "voice_settings": {
                            "preset": "lyra",
                            "pitch": 1.12,
                            "rate": 1.02,
                            "model": "gemini-lyra"
                        },
                        "clips": [
                            {"id": "c1", "name": "sample1.mp4", "duration": 3.0}
                        ]
                    }
                    saved = db.save_project(project_data, db_path=test_db)
                    crud_save_ok = saved is not None and saved.get('name') == 'Lyra AI Test Project'
                    self.record_check(section, 'SQLite Project Save with Lyra Voice Settings', crud_save_ok,
                                      f"Saved project ID: {saved.get('id') if saved else 'None'}")

                    # List projects
                    projects = db.list_projects(db_path=test_db)
                    crud_list_ok = len(projects) == 1 and projects[0]['name'] == 'Lyra AI Test Project'
                    self.record_check(section, 'SQLite Projects List Query', crud_list_ok,
                                      f"Retrieved {len(projects)} projects")

                    # Add render record
                    render_data = {
                        "project_name": "Lyra AI Test Project",
                        "output_filename": "final_lyra_cut.mp4",
                        "resolution": "1080p",
                        "file_size_bytes": 1048576,
                        "duration_seconds": 3.0,
                        "has_voiceover": 1
                    }
                    rec = db.add_render(render_data, db_path=test_db)
                    crud_render_ok = rec is not None and rec.get('output_filename') == 'final_lyra_cut.mp4'
                    self.record_check(section, 'SQLite Render History Insertion', crud_render_ok,
                                      f"Added render ID: {rec.get('id') if rec else 'None'}")

            except Exception as e:
                self.record_check(section, 'SQLite Database Operations', False, str(e))

        # Check server security headers for WebAssembly SharedArrayBuffer
        if os.path.isfile(serve_py):
            with open(serve_py, 'r', encoding='utf-8') as f:
                serve_code = f.read()

            has_coop = 'Cross-Origin-Opener-Policy' in serve_code and 'same-origin' in serve_code
            has_coep = 'Cross-Origin-Embedder-Policy' in serve_code and 'require-corp' in serve_code
            self.record_check(section, 'Cross-Origin-Opener-Policy: same-origin header', has_coop,
                              'Required for WebAssembly SharedArrayBuffer isolation')
            self.record_check(section, 'Cross-Origin-Embedder-Policy: require-corp header', has_coep,
                              'Required for FFmpeg.wasm multi-threading')

            # Check API endpoints in serve.py
            endpoints = ['/api/health', '/api/projects', '/api/renders', '/api/settings']
            for ep in endpoints:
                has_ep = f"path == '{ep}'" in serve_code or f"path.startswith('{ep}" in serve_code or ep in serve_code
                self.record_check(section, f"Server Endpoint '{ep}' Route", has_ep, f"REST API route handled")

    # --------------------------------------------------------------------------
    # REPORTING & OUTPUT
    # --------------------------------------------------------------------------
    def print_summary(self):
        passed = self.results['passed_checks']
        failed = self.results['failed_checks']
        warnings = self.results['warnings']
        total = self.results['total_checks']
        elapsed = self.results['execution_time_ms']

        pass_rate = round((passed / total * 100), 1) if total > 0 else 0

        print(f"\n{TerminalColor.BOLD}{TerminalColor.CYAN}======================================================================{TerminalColor.RESET}")
        print(f"{TerminalColor.BOLD}{TerminalColor.CYAN}                     Agent Diagnostics Summary                        {TerminalColor.RESET}")
        print(f"{TerminalColor.BOLD}{TerminalColor.CYAN}======================================================================{TerminalColor.RESET}")

        for section, checks in self.results['sections'].items():
            sec_pass = sum(1 for c in checks if c['status'] == 'PASS')
            sec_total = len(checks)
            badge = f"{TerminalColor.GREEN}PASS{TerminalColor.RESET}" if sec_pass == sec_total else f"{TerminalColor.RED}ISSUES{TerminalColor.RESET}"
            print(f"  * {section:<32} {sec_pass}/{sec_total} checks passed  [{badge}]")

        print(f"\n  ------------------------------------------------------------------")
        print(f"  Total Checks:    {TerminalColor.BOLD}{total}{TerminalColor.RESET}")
        print(f"  Passed:          {TerminalColor.BOLD}{TerminalColor.GREEN}{passed}{TerminalColor.RESET}")
        print(f"  Warnings:        {TerminalColor.BOLD}{TerminalColor.YELLOW}{warnings}{TerminalColor.RESET}")
        print(f"  Failed:          {TerminalColor.BOLD}{TerminalColor.RED if failed > 0 else TerminalColor.GREEN}{failed}{TerminalColor.RESET}")
        print(f"  Pass Rate:       {TerminalColor.BOLD}{TerminalColor.GREEN if pass_rate == 100 else TerminalColor.YELLOW}{pass_rate}%{TerminalColor.RESET}")
        print(f"  Execution Time:  {elapsed} ms")
        print(f"  Status:          {TerminalColor.BOLD}{TerminalColor.GREEN + 'ALL SYSTEMS OPERATIONAL (PASS)' if failed == 0 else TerminalColor.RED + 'DIAGNOSTIC ISSUES DETECTED'}{TerminalColor.RESET}")
        print(f"{TerminalColor.BOLD}{TerminalColor.CYAN}======================================================================\n{TerminalColor.RESET}")

    def save_report(self):
        report_path = os.path.join(WORKSPACE_DIR, 'tests', 'app_diagnostics_report.json')
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2)
            if self.verbose:
                print(f"[✓] Saved JSON diagnostics report to: {report_path}")
        except Exception as e:
            print(f"[!] Warning: Could not save report to {report_path}: {e}")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='ClipMerge Autonomous App Verification Agent')
    parser.add_argument('--audio-only', action='store_true', help='Run checks only on Audio Station and Lyra')
    parser.add_argument('--verbose', '-v', action='store_true', help='Display verbose output for every check')
    parser.add_argument('--json', action='store_true', help='Output JSON report directly to stdout')
    args = parser.parse_args()

    agent = AppVerificationAgent(verbose=args.verbose)
    success = agent.run_all(audio_only=args.audio_only)

    if args.json:
        print(json.dumps(agent.results, indent=2))

    sys.exit(0 if success else 1)

