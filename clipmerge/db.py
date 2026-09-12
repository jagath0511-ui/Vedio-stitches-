import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clipmerge.db')

def get_connection(db_path=None):
    path = db_path or DEFAULT_DB_PATH
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path=None):
    """Initialize SQLite schema if tables do not exist."""
    conn = get_connection(db_path)
    try:
        with conn:
            conn.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                resolution TEXT DEFAULT 'original',
                script_text TEXT DEFAULT '',
                language TEXT DEFAULT 'en-US',
                voice_settings TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS project_clips (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                shot_number INTEGER DEFAULT 0,
                order_index INTEGER DEFAULT 0,
                duration REAL DEFAULT 0.0,
                resolution TEXT DEFAULT '',
                prompt_text TEXT DEFAULT '',
                ai_metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS voiceovers (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT DEFAULT '',
                language TEXT DEFAULT 'en-US',
                script_content TEXT DEFAULT '',
                voice_profile_name TEXT DEFAULT '',
                pitch REAL DEFAULT 1.0,
                rate REAL DEFAULT 1.0,
                source_engine TEXT DEFAULT 'browser',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS render_history (
                id TEXT PRIMARY KEY,
                project_id TEXT DEFAULT '',
                project_name TEXT DEFAULT 'Untitled Cut',
                output_filename TEXT NOT NULL,
                resolution TEXT DEFAULT 'original',
                file_size_bytes INTEGER DEFAULT 0,
                duration_seconds REAL DEFAULT 0.0,
                has_voiceover INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS characters (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT DEFAULT '',
                avatar_url TEXT DEFAULT '',
                gender TEXT DEFAULT 'female',
                voice_id TEXT DEFAULT '',
                voice_settings TEXT DEFAULT '{}',
                script_text TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS custom_voices (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                gender TEXT DEFAULT 'female',
                base_voice_a TEXT DEFAULT '',
                blend_voice_b TEXT DEFAULT '',
                ratio_a REAL DEFAULT 0.5,
                pitch REAL DEFAULT 1.0,
                rate REAL DEFAULT 1.0,
                timbre TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_clips_project_id ON project_clips(project_id);
            CREATE INDEX IF NOT EXISTS idx_renders_created_at ON render_history(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_characters_updated_at ON characters(updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_custom_voices_created ON custom_voices(created_at DESC);
            """)
    finally:
        conn.close()

def list_projects(db_path=None):
    """Retrieve all projects with total clip count and formatted timestamps."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.resolution, 
                p.script_text, 
                p.language, 
                p.voice_settings, 
                p.created_at, 
                p.updated_at,
                COUNT(c.id) AS clip_count
            FROM projects p
            LEFT JOIN project_clips c ON p.id = c.project_id
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        """)
        rows = cur.fetchall()
        projects = []
        for r in rows:
            p_dict = dict(r)
            try:
                p_dict['voice_settings'] = json.loads(p_dict.get('voice_settings') or '{}')
            except Exception:
                p_dict['voice_settings'] = {}
            projects.append(p_dict)
        return projects
    finally:
        conn.close()

def get_project(project_id, db_path=None):
    """Retrieve full project details with ordered clips and voiceovers."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        p_row = cur.fetchone()
        if not p_row:
            return None
        
        project = dict(p_row)
        try:
            project['voice_settings'] = json.loads(project.get('voice_settings') or '{}')
        except Exception:
            project['voice_settings'] = {}

        # Fetch clips ordered by storyboard sequence
        cur.execute("""
            SELECT * FROM project_clips 
            WHERE project_id = ? 
            ORDER BY order_index ASC, shot_number ASC
        """, (project_id,))
        clips = []
        for c in cur.fetchall():
            c_dict = dict(c)
            try:
                c_dict['ai_metadata'] = json.loads(c_dict.get('ai_metadata') or '{}')
            except Exception:
                c_dict['ai_metadata'] = {}
            clips.append(c_dict)
        project['clips'] = clips

        # Fetch voiceover metadata
        cur.execute("SELECT * FROM voiceovers WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
        project['voiceovers'] = [dict(v) for v in cur.fetchall()]

        return project
    finally:
        conn.close()

def save_project(data, db_path=None):
    """Create or update a project and its clip sequence."""
    conn = get_connection(db_path)
    project_id = data.get('id') or f"proj_{uuid.uuid4().hex[:12]}"
    name = data.get('name') or f"Project {datetime.now().strftime('%b %d, %H:%M')}"
    description = data.get('description', '')
    resolution = data.get('resolution', 'original')
    script_text = data.get('script_text', '')
    language = data.get('language', 'en-US')
    
    voice_settings = data.get('voice_settings', {})
    if isinstance(voice_settings, dict):
        voice_settings_str = json.dumps(voice_settings)
    else:
        voice_settings_str = str(voice_settings)

    clips = data.get('clips', [])
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    try:
        with conn:
            # Upsert project
            conn.execute("""
                INSERT INTO projects (id, name, description, resolution, script_text, language, voice_settings, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    description = excluded.description,
                    resolution = excluded.resolution,
                    script_text = excluded.script_text,
                    language = excluded.language,
                    voice_settings = excluded.voice_settings,
                    updated_at = excluded.updated_at
            """, (project_id, name, description, resolution, script_text, language, voice_settings_str, now, now))

            # Replace clips
            conn.execute("DELETE FROM project_clips WHERE project_id = ?", (project_id,))
            for idx, c in enumerate(clips):
                c_id = c.get('id') or f"clip_{uuid.uuid4().hex[:8]}"
                c_name = c.get('name', f"Clip {idx + 1}")
                shot_num = c.get('shot_number', idx + 1)
                order_idx = c.get('order_index', idx)
                duration = float(c.get('duration', 0.0))
                c_res = c.get('resolution', '')
                prompt_text = c.get('prompt_text', '')
                ai_meta = c.get('ai_metadata', {})
                ai_meta_str = json.dumps(ai_meta) if isinstance(ai_meta, dict) else str(ai_meta)

                conn.execute("""
                    INSERT INTO project_clips (id, project_id, name, shot_number, order_index, duration, resolution, prompt_text, ai_metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (c_id, project_id, c_name, shot_num, order_idx, duration, c_res, prompt_text, ai_meta_str, now))

        return get_project(project_id, db_path=db_path)
    finally:
        conn.close()

def delete_project(project_id, db_path=None):
    """Delete a project and its associated clips."""
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

def list_renders(limit=50, db_path=None):
    """List recent video exports/renders."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM render_history 
            ORDER BY created_at DESC 
            LIMIT ?
        """, (limit,))
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def add_render(data, db_path=None):
    """Record an export or render event into SQLite."""
    conn = get_connection(db_path)
    render_id = data.get('id') or f"render_{uuid.uuid4().hex[:10]}"
    project_id = data.get('project_id', '')
    project_name = data.get('project_name', 'Merged Sequence')
    output_filename = data.get('output_filename', 'clipmerge-stitched.mp4')
    resolution = data.get('resolution', 'original')
    file_size_bytes = int(data.get('file_size_bytes', 0))
    duration_seconds = float(data.get('duration_seconds', 0.0))
    has_voiceover = 1 if data.get('has_voiceover') else 0
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    try:
        with conn:
            conn.execute("""
                INSERT INTO render_history (id, project_id, project_name, output_filename, resolution, file_size_bytes, duration_seconds, has_voiceover, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (render_id, project_id, project_name, output_filename, resolution, file_size_bytes, duration_seconds, has_voiceover, now))
        
        cur = conn.cursor()
        cur.execute("SELECT * FROM render_history WHERE id = ?", (render_id,))
        return dict(cur.fetchone())
    finally:
        conn.close()

def get_settings(db_path=None):
    """Retrieve all key-value settings."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT key, value FROM settings")
        return {r['key']: r['value'] for r in cur.fetchall()}
    finally:
        conn.close()

def set_setting(key, value, db_path=None):
    """Save or update a key-value setting."""
    conn = get_connection(db_path)
    try:
        with conn:
            conn.execute("""
                INSERT INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_at = excluded.updated_at
            """, (key, str(value)))
        return True
    finally:
        conn.close()

# ====================================================
# CHARACTERS & VOICE ASSIGNMENT
# ====================================================

def list_characters(db_path=None):
    """Retrieve all characters ordered by recent update."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM characters ORDER BY updated_at DESC")
        chars = []
        for r in cur.fetchall():
            c = dict(r)
            try:
                c['voice_settings'] = json.loads(c.get('voice_settings') or '{}')
            except Exception:
                c['voice_settings'] = {}
            chars.append(c)
        return chars
    finally:
        conn.close()

def get_character(char_id, db_path=None):
    """Retrieve a single character by ID."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM characters WHERE id = ?", (char_id,))
        r = cur.fetchone()
        if not r:
            return None
        c = dict(r)
        try:
            c['voice_settings'] = json.loads(c.get('voice_settings') or '{}')
        except Exception:
            c['voice_settings'] = {}
        return c
    finally:
        conn.close()

def save_character(data, db_path=None):
    """Create or update a character profile."""
    conn = get_connection(db_path)
    char_id = data.get('id') or f"char_{uuid.uuid4().hex[:10]}"
    name = (data.get('name') or 'Unnamed Character').strip()
    role = (data.get('role') or '').strip()
    avatar_url = data.get('avatar_url', '')
    gender = (data.get('gender') or 'female').strip().lower()
    voice_id = data.get('voice_id', '')
    script_text = data.get('script_text', '')

    voice_settings = data.get('voice_settings', {})
    if isinstance(voice_settings, dict):
        voice_settings_str = json.dumps(voice_settings)
    else:
        voice_settings_str = str(voice_settings)

    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    try:
        with conn:
            conn.execute("""
                INSERT INTO characters (id, name, role, avatar_url, gender, voice_id, voice_settings, script_text, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    role = excluded.role,
                    avatar_url = excluded.avatar_url,
                    gender = excluded.gender,
                    voice_id = excluded.voice_id,
                    voice_settings = excluded.voice_settings,
                    script_text = excluded.script_text,
                    updated_at = excluded.updated_at
            """, (char_id, name, role, avatar_url, gender, voice_id, voice_settings_str, script_text, now, now))
        return get_character(char_id, db_path=db_path)
    finally:
        conn.close()

def delete_character(char_id, db_path=None):
    """Delete a character from SQLite."""
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM characters WHERE id = ?", (char_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

# ====================================================
# CUSTOM / HYBRID MERGED VOICES
# ====================================================

def list_custom_voices(db_path=None):
    """Retrieve all custom/hybrid voices."""
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM custom_voices ORDER BY created_at DESC")
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def save_custom_voice(data, db_path=None):
    """Save or update a custom merged voice."""
    conn = get_connection(db_path)
    voice_id = data.get('id') or f"cvoice_{uuid.uuid4().hex[:10]}"
    name = (data.get('name') or 'Custom Voice').strip()
    description = (data.get('description') or '').strip()
    gender = (data.get('gender') or 'female').strip().lower()
    base_voice_a = data.get('base_voice_a', '')
    blend_voice_b = data.get('blend_voice_b', '')
    ratio_a = float(data.get('ratio_a', 0.5))
    pitch = float(data.get('pitch', 1.0))
    rate = float(data.get('rate', 1.0))
    timbre = data.get('timbre', '')
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    try:
        with conn:
            conn.execute("""
                INSERT INTO custom_voices (id, name, description, gender, base_voice_a, blend_voice_b, ratio_a, pitch, rate, timbre, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    description = excluded.description,
                    gender = excluded.gender,
                    base_voice_a = excluded.base_voice_a,
                    blend_voice_b = excluded.blend_voice_b,
                    ratio_a = excluded.ratio_a,
                    pitch = excluded.pitch,
                    rate = excluded.rate,
                    timbre = excluded.timbre
            """, (voice_id, name, description, gender, base_voice_a, blend_voice_b, ratio_a, pitch, rate, timbre, now))
        
        cur = conn.cursor()
        cur.execute("SELECT * FROM custom_voices WHERE id = ?", (voice_id,))
        return dict(cur.fetchone())
    finally:
        conn.close()

def delete_custom_voice(voice_id, db_path=None):
    """Delete a custom voice from SQLite."""
    conn = get_connection(db_path)
    try:
        with conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM custom_voices WHERE id = ?", (voice_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    print("SQLite database initialized successfully at:", DEFAULT_DB_PATH)
