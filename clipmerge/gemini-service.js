/**
 * ClipMerge - Google Gemini AI Service
 * Analyzes scripts, aligns raw video clips to script storyline beats ("keeps them in a line"),
 * generates YouTube/Social metadata, timestamps, and smart chapter markers.
 */

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Safely parse JSON even if enclosed in Markdown code blocks or with extra text
 */
function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;
    let isObject = false;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      isObject = true;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      isObject = false;
    }

    if (startIdx !== -1) {
      const endChar = isObject ? '}' : ']';
      const lastIdx = cleaned.lastIndexOf(endChar);
      if (lastIdx > startIdx) {
        try {
          return JSON.parse(cleaned.slice(startIdx, lastIdx + 1));
        } catch (_) {}
      }
    }
    return null;
  }
}

export class GeminiService {
  constructor() {
    const saved = localStorage.getItem('clipmerge_gemini_api_key');
    const envKey = (typeof window !== 'undefined' && window.ENV_GEMINI_API_KEY) ? window.ENV_GEMINI_API_KEY : '';
    this.apiKey = (saved || envKey || '').trim();
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem('clipmerge_gemini_api_key', this.apiKey);
    } else {
      localStorage.removeItem('clipmerge_gemini_api_key');
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  /**
   * Robust Gemini API caller with automatic multi-model fallback and safe JSON parsing
   */
  async callGeminiApi(prompt, isJson = true) {
    if (!this.hasApiKey()) return null;
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
        };
        if (isJson) {
          body.generationConfig = { responseMimeType: 'application/json', temperature: 0.1 };
        }
        const res = await fetch(`${API_BASE}/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = isJson ? safeJsonParse(text) : text;
            if (parsed !== null) return parsed;
          }
        }
      } catch (err) {
        console.warn(`Gemini API error with model ${model}:`, err.message);
      }
    }
    return null;
  }

  /**
   * Parse a raw text script into structured scene beats
   * @param {string} scriptText - Raw text or markdown script
   * @returns {Promise<Array>} Array of { sceneNumber, title, narration, visualCue, estimatedDuration }
   */
  async parseScript(scriptText) {
    if (!scriptText || !scriptText.trim()) return [];

    if (this.hasApiKey()) {
      try {
        const prompt = `
You are an expert video producer and director. Analyze this video production script and break it down into structured sequential scene beats.
Return a JSON array of scene objects with this exact schema:
[
  {
    "sceneNumber": 1,
    "title": "Short descriptive scene title",
    "narration": "Key spoken dialogue, narration, or audio cue for this scene",
    "visualCue": "Key visual action, camera shot, or subject description",
    "estimatedDuration": 5
  }
]

Script:
"""
${scriptText}
"""
`;

        const parsed = await this.callGeminiApi(prompt, true);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn('Gemini script parsing failed or key invalid, using heuristic parser:', err.message);
      }
    }

    // Heuristic Fallback Parser: parses lines, paragraphs, or Scene headers
    return this.heuristicParseScript(scriptText);
  }

  /**
   * Heuristic script parser when API key is not yet set
   */
  heuristicParseScript(scriptText) {
    const rawLines = scriptText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const scenes = [];
    let currentScene = null;
    let sceneCounter = 1;

    for (const line of rawLines) {
      const sceneMatch = line.match(/^(?:scene|beat|part|act|shot)\s*(\d+)?:?\s*(.*)$/i);
      if (sceneMatch || !currentScene || (currentScene.narration && line.length > 50)) {
        if (currentScene) scenes.push(currentScene);
        currentScene = {
          sceneNumber: sceneCounter++,
          title: sceneMatch ? (sceneMatch[2] || `Scene ${sceneCounter - 1}`) : `Scene ${sceneCounter - 1}: ${line.slice(0, 30)}...`,
          narration: sceneMatch ? '' : line,
          visualCue: 'Standard camera angle matching narration',
          estimatedDuration: 3,
        };
      } else {
        currentScene.narration += (currentScene.narration ? ' ' : '') + line;
      }
    }

    if (currentScene) scenes.push(currentScene);

    // If script was very short or single paragraph, split into 3-4 natural beats
    if (scenes.length === 1 && rawLines.length >= 3) {
      return rawLines.slice(0, 10).map((line, idx) => ({
        sceneNumber: idx + 1,
        title: `Scene ${idx + 1}: ${line.slice(0, 35)}...`,
        narration: line,
        visualCue: `Visual beat for scene ${idx + 1}`,
        estimatedDuration: 3,
      }));
    }

    return scenes.length > 0 ? scenes : [
      { sceneNumber: 1, title: 'Introduction', narration: scriptText.slice(0, 100), visualCue: 'Opening Hook', estimatedDuration: 5 }
    ];
  }

  /**
   * Match and align raw uploaded clips to script scene beats ("keep them in a line")
   * Disentangles mixed or differently arranged clip numbers and aligns to shot prompts.
   * @param {Array} clips - Array of { id, file, probe, thumbUrl }
   * @param {Array} scriptScenes - Array of parsed scene objects
   * @returns {Promise<Object>} { alignedClips, storyboard, rationale }
   */
  async alignClipsToScript(clips, scriptScenes) {
    if (!clips || clips.length === 0) {
      return { alignedClips: [], storyboard: [], rationale: 'No video clips available to align.' };
    }

    if (!scriptScenes || scriptScenes.length === 0) {
      return { alignedClips: clips, storyboard: [], rationale: 'No script scenes available.' };
    }

    // Attempt Gemini AI multimodal/semantic alignment if API key exists
    if (this.hasApiKey()) {
      try {
        const clipSummaries = clips.map((c, i) => ({
          clipId: c.id,
          filename: c.file.name,
          duration: c.probe.duration || 1,
          resolution: `${c.probe.width}x${c.probe.height}`,
          originalIndex: i,
        }));

        const prompt = `
You are an expert film and video director and editor.
The user provides a video production script with shot numbers and prompt beats (e.g., "Shot 1: intro", "Shot 2: product demo", "Shot 3: speed test", etc.).
The user has also uploaded raw video clips whose filenames or numbers may be arranged differently, out of order, or have mixed naming (e.g. clip3, broll, shot_1, take2, final_outro, IMG_2042).

Your task:
1. Examine each shot/scene prompt and its number in the script.
2. Inspect every video clip: its filename, any numbers inside the filename (e.g., '1', '2', '01'), keywords (intro, demo, test, hook, broll, outro, conclusion), and duration.
3. Disentangle and separate the clips: find which clip belongs to which shot/scene prompt, and arrange them in the exact right chronological sequence ("keep them in a line").
4. If there are extra clips without direct scene matches, sequence them logically into adjacent transitions or at the end.

Script Scenes / Shot Prompts:
${JSON.stringify(scriptScenes, null, 2)}

Available Raw Video Clips:
${JSON.stringify(clipSummaries, null, 2)}

Return a JSON object with this exact structure:
{
  "orderedClipIds": ["id_for_shot_1", "id_for_shot_2", "id_for_shot_3"],
  "storyboard": [
    {
      "sceneNumber": 1,
      "sceneTitle": "Shot 1: Title",
      "clipId": "matched_clip_id",
      "filename": "matched_file.mp4",
      "matchConfidence": "98%",
      "reason": "Matched shot 1 cue and filename identifier"
    }
  ],
  "summaryRationale": "Short explanation of how clips were separated, re-arranged, and kept in a line."
}
`;

        const result = await this.callGeminiApi(prompt, true);
        if (result && Array.isArray(result.orderedClipIds) && result.orderedClipIds.length > 0) {
          const clipMap = new Map(clips.map(c => [c.id, c]));
          const orderedClips = [];
          for (const id of result.orderedClipIds) {
            if (clipMap.has(id)) {
              orderedClips.push(clipMap.get(id));
              clipMap.delete(id);
            }
          }
          for (const leftover of clipMap.values()) {
            orderedClips.push(leftover);
          }

          const scenesMap = new Map(scriptScenes.map(s => [s.sceneNumber, s]));
          const enrichedStoryboard = (result.storyboard || []).map(item => {
            const sc = scenesMap.get(item.sceneNumber) || {};
            const prompt = sc.narration ? `${sc.title || item.sceneTitle} — ${sc.narration}` : (sc.title || item.sceneTitle || `Shot ${item.sceneNumber}`);
            return {
              ...item,
              narration: sc.narration || '',
              visualCue: sc.visualCue || '',
              promptText: prompt || item.sceneTitle || `Shot ${item.sceneNumber}`,
            };
          });

          return {
            alignedClips: orderedClips,
            storyboard: enrichedStoryboard,
            rationale: result.summaryRationale || 'Clips separated and aligned along script shots by Gemini Intelligence.',
          };
        }
      } catch (err) {
        console.warn('Gemini AI alignment fallback:', err.message);
      }
    }

    // Heuristic Alignment: Intelligently separates and sorts shot/scene/clip numbers
    return this.heuristicAlignClips(clips, scriptScenes);
  }

  /**
   * Extract shot or clip number from filename (handles shot1, clip2, s03, take4, scene5, _1., etc.)
   */
  extractNumberFromFilename(name) {
    // Patterns in priority:
    // 1. Explicit shot/scene/clip/take prefixes
    const explicitMatch = name.match(/(?:shot|scene|clip|take|part|beat|s|sc)[_\-\s]*(\d+)/i);
    if (explicitMatch) return parseInt(explicitMatch[1], 10);

    // 2. Leading number: 01_intro.mp4, 1-intro.mp4 (ignore years >= 1000)
    const leadingMatch = name.match(/^(\d+)[_\-\s.]/);
    if (leadingMatch) {
      const n = parseInt(leadingMatch[1], 10);
      if (n < 1000) return n;
    }

    // 3. Trailing number before extension: intro_1.mp4, video(2).mp4
    const trailingMatch = name.match(/[_\-\s(](\d+)\)?\.[a-z0-9]+$/i);
    if (trailingMatch) {
      const n = parseInt(trailingMatch[1], 10);
      // Ignore common video resolutions (480, 720, 1080, 2160)
      if (n < 1000 && n !== 480 && n !== 720 && n !== 1080 && n !== 2160) return n;
    }

    // 4. Any first number in filename (must be small plausible shot number 1-99)
    const anyNumMatch = name.match(/(\d+)/);
    if (anyNumMatch) {
      const n = parseInt(anyNumMatch[1], 10);
      if (n > 0 && n < 100) return n;
    }

    return null;
  }

  /**
   * Heuristic alignment matching clips to scenes by shot number, index, and keywords
   */
  heuristicAlignClips(clips, scriptScenes) {
    // Map script scenes by their shot/scene number
    const availableClips = [...clips];
    const orderedClips = [];
    const storyboard = [];

    // Match scenes to clips
    scriptScenes.forEach((scene, sceneIdx) => {
      const targetNum = scene.sceneNumber || (sceneIdx + 1);
      let bestClipIdx = -1;
      let matchReason = '';

      // 1. Look for explicit number match in filename
      for (let i = 0; i < availableClips.length; i++) {
        const clipNum = this.extractNumberFromFilename(availableClips[i].file.name);
        if (clipNum !== null && clipNum === targetNum) {
          bestClipIdx = i;
          matchReason = `Matched shot #${targetNum} directly to filename index in "${availableClips[i].file.name}"`;
          break;
        }
      }

      // 2. If not matched, look for semantic keyword match using dynamic words from scene prompt
      if (bestClipIdx === -1 && scene.title) {
        const fullSceneText = `${scene.title} ${scene.narration || ''} ${scene.visualCue || ''}`.toLowerCase();
        const keywords = fullSceneText
          .split(/[^a-z0-9]+/)
          .filter(w => w.length >= 4 && !['this', 'that', 'with', 'from', 'have', 'show', 'video', 'clip', 'scene', 'shot', 'part', 'beat'].includes(w));

        for (let i = 0; i < availableClips.length; i++) {
          const name = availableClips[i].file.name.toLowerCase();
          const matchedKw = keywords.find(kw => name.includes(kw));
          if (matchedKw) {
            bestClipIdx = i;
            matchReason = `Matched scene cue "${matchedKw}" with "${availableClips[i].file.name}"`;
            break;
          }
        }
      }

      // 3. Fallback: take next available clip in sequence
      if (bestClipIdx === -1 && availableClips.length > 0) {
        bestClipIdx = 0;
        matchReason = `Sequenced chronologically to Scene ${targetNum}`;
      }

      if (bestClipIdx !== -1) {
        const [matchedClip] = availableClips.splice(bestClipIdx, 1);
        orderedClips.push(matchedClip);
        const promptText = scene.narration ? `${scene.title} — ${scene.narration}` : (scene.title || `Shot ${targetNum}`);
        storyboard.push({
          sceneNumber: targetNum,
          sceneTitle: scene.title,
          narration: scene.narration || '',
          visualCue: scene.visualCue || '',
          promptText: promptText,
          clipId: matchedClip.id,
          filename: matchedClip.file.name,
          matchConfidence: matchReason.includes('directly') ? '98%' : '85%',
          reason: matchReason,
        });
      }
    });

    // Append any leftover clips
    while (availableClips.length > 0) {
      const leftover = availableClips.shift();
      orderedClips.push(leftover);
      const extraNum = orderedClips.length;
      storyboard.push({
        sceneNumber: extraNum,
        sceneTitle: `Additional Beat ${extraNum}`,
        narration: '',
        visualCue: '',
        promptText: `Additional Beat ${extraNum}`,
        clipId: leftover.id,
        filename: leftover.file.name,
        matchConfidence: '80%',
        reason: 'Appended in continuity line',
      });
    }

    return {
      alignedClips: orderedClips,
      storyboard,
      rationale: 'Clips separated and arranged into a line matching each shot prompt.',
    };
  }

  /**
   * Generate video metadata, chapters, and YouTube-ready descriptions from the script
   */
  async generateVideoMetadata(scriptText, clips) {
    const totalSeconds = clips.reduce((sum, c) => sum + ((c.probe && c.probe.duration) ? c.probe.duration : 1), 0);

    // Compute timestamp chapters and WebVTT subtitle tracks based on clip durations
    let currentSec = 0;
    const chapters = [];
    let vtt = 'WEBVTT\n\n';

    for (let i = 0; i < clips.length; i++) {
      const dur = (clips[i].probe && clips[i].probe.duration) ? clips[i].probe.duration : 2.0;
      const startSec = currentSec;
      const endSec = currentSec + dur;
      const mins = Math.floor(startSec / 60).toString().padStart(2, '0');
      const secs = Math.floor(startSec % 60).toString().padStart(2, '0');
      const cleanName = clips[i].file.name.replace(/\.[^/.]+$/, '');
      const chapterTitle = `Scene ${i + 1}: ${cleanName}`;

      chapters.push({
        time: `${mins}:${secs}`,
        title: chapterTitle,
        startSec,
        endSec,
      });

      vtt += `${i + 1}\n`;
      vtt += `${this.formatVttTime(startSec)} --> ${this.formatVttTime(endSec)}\n`;
      vtt += `${chapterTitle}\n\n`;

      currentSec = endSec;
    }

    const chapterStrings = chapters.map(c => `${c.time} - ${c.title}`);

    if (this.hasApiKey()) {
      try {
        const prompt = `
Based on this video production script and ${clips.length} video clips (${totalSeconds.toFixed(1)}s total):
Script:
"""
${scriptText}
"""

Generate:
1. 3 catchy video title suggestions (YouTube & Social friendly)
2. A compelling video description with a 2-sentence summary and call-to-action
3. 5 relevant video hashtags

Return JSON with keys: "titles" (array of 3 strings), "description" (string), "hashtags" (array of 5 strings).
`;

        const aiMeta = await this.callGeminiApi(prompt, true);
        if (aiMeta) {
          const titles = Array.isArray(aiMeta.titles) ? aiMeta.titles : ['Merged Video Project'];
          const mainTitle = titles[0] || 'Merged Video Project';
          return {
            title: mainTitle,
            titles,
            description: aiMeta.description || `Complete merged video sequence with ${clips.length} clips.\n\nTimestamps:\n${chapterStrings.join('\n')}`,
            hashtags: aiMeta.hashtags || ['#video', '#clipmerge'],
            chapters,
            vttContent: vtt,
            totalDurationFormatted: `${Math.floor(totalSeconds / 60)}m ${Math.floor(totalSeconds % 60)}s`,
          };
        }
      } catch (err) {
        console.warn('Gemini metadata generation fallback:', err.message);
      }
    }

    // Heuristic Fallback
    const firstLine = scriptText.split('\n').map(s => s.trim()).filter(Boolean)[0] || 'ClipMerge Production';
    const cleanTitle = firstLine.length > 50 ? firstLine.slice(0, 47) + '...' : firstLine;
    return {
      title: cleanTitle,
      titles: [
        cleanTitle,
        'Final Cut: ' + (firstLine.slice(0, 35) || 'Full Video Story'),
        'Complete Video Sequence (HD)',
      ],
      description: `Complete merged video sequence stitched from ${clips.length} clips based on the original narrative script.\n\nTimestamps:\n${chapterStrings.join('\n')}`,
      hashtags: ['#ClipMerge', '#VideoStitching', '#CreativeCut', '#ContentCreation', '#Storytelling'],
      chapters,
      vttContent: vtt,
      totalDurationFormatted: `${Math.floor(totalSeconds / 60)}m ${Math.floor(totalSeconds % 60)}s`,
    };
  }

  /**
   * Generate WebVTT subtitle track synced to script beats and clip durations
   */
  generateWebVTT(storyboard, clips) {
    let vtt = 'WEBVTT\n\n';
    let currentSec = 0;

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const scene = storyboard[i] || { narration: `Scene ${i + 1}` };
      const dur = clip.probe.duration || 2.0;

      const start = this.formatVttTime(currentSec);
      const end = this.formatVttTime(currentSec + dur);

      vtt += `${i + 1}\n`;
      vtt += `${start} --> ${end}\n`;
      vtt += `${scene.narration || scene.sceneTitle || clip.file.name}\n\n`;

      currentSec += dur;
    }

    return vtt;
  }

  formatVttTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((totalSeconds % 1) * 1000).toString().padStart(3, '0');
    return `${hours}:${mins}:${secs}.${ms}`;
  }
}

