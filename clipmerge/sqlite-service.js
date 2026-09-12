/**
 * ClipMerge - SQLite Client Service
 * Connects frontend state with backend SQLite database via /api/* endpoints.
 */

export class SQLiteService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
  }

  /**
   * Check connection status to the local SQLite backend
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.isConnected = (data.status === 'ok' && data.database === 'sqlite3');
      return { isConnected: this.isConnected, info: data };
    } catch (err) {
      this.isConnected = false;
      return { isConnected: false, error: err.message };
    }
  }

  /**
   * List all saved projects with summary metadata
   */
  async getProjects() {
    const res = await fetch(`${this.baseUrl}/api/projects`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load projects: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Fetch a single project with its full clip storyboard and voice settings
   */
  async getProject(projectId) {
    const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load project: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Save or update a project and its clip sequence in SQLite
   */
  async saveProject(projectData) {
    const res = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to save project: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Delete a project from SQLite
   */
  async deleteProject(projectId) {
    const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Retrieve video export / render history
   */
  async getRenderHistory() {
    const res = await fetch(`${this.baseUrl}/api/renders`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load render history: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Record a completed video export into SQLite render history
   */
  async logRender(renderData) {
    const res = await fetch(`${this.baseUrl}/api/renders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(renderData)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to record render: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Retrieve application settings
   */
  async getSettings() {
    const res = await fetch(`${this.baseUrl}/api/settings`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load settings: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Update an application setting
   */
  async setSetting(key, value) {
    const res = await fetch(`${this.baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (!res.ok) throw new Error(`Failed to save setting: ${res.statusText}`);
    return await res.json();
  }

  // ====================================================
  // CHARACTERS
  // ====================================================

  /**
   * Fetch all characters from SQLite
   */
  async getCharacters() {
    const res = await fetch(`${this.baseUrl}/api/characters`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load characters: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Save or update a character in SQLite
   */
  async saveCharacter(characterData) {
    const res = await fetch(`${this.baseUrl}/api/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(characterData)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to save character: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Delete a character from SQLite
   */
  async deleteCharacter(charId) {
    const res = await fetch(`${this.baseUrl}/api/characters/${encodeURIComponent(charId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete character: ${res.statusText}`);
    return await res.json();
  }

  // ====================================================
  // CUSTOM MERGED VOICES
  // ====================================================

  /**
   * Fetch all custom merged voices from SQLite
   */
  async getCustomVoices() {
    const res = await fetch(`${this.baseUrl}/api/voices`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load custom voices: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Save a custom merged voice in SQLite
   */
  async saveCustomVoice(voiceData) {
    const res = await fetch(`${this.baseUrl}/api/voices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voiceData)
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to save custom voice: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Delete a custom merged voice from SQLite
   */
  async deleteCustomVoice(voiceId) {
    const res = await fetch(`${this.baseUrl}/api/voices/${encodeURIComponent(voiceId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete custom voice: ${res.statusText}`);
    return await res.json();
  }
}


