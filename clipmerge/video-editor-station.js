/**
 * ClipMerge - Unified Multi-Track Video & Audio Editing Station
 * Connects video clips from the Video Station and voiceovers/audio from the Audio Station.
 * Provides synchronized multi-track preview playback, real-time audio ducking,
 * timeline scrubbing, mixer channel strips, and master video rendering.
 */

export class VideoEditorStation {
  constructor({ ffmpegHandler, audioDSP }) {
    this.ffmpegHandler = ffmpegHandler;
    this.audioDSP = audioDSP;

    // Timeline State
    this.videoClips = []; // [{ id, file, probe, thumbUrl, duration, startTrim, endTrim, volume, isMuted }]
    this.voiceoverTrack = null; // { blob, blobUrl, name, duration, offsetSeconds, volume, isMuted }
    this.musicTrack = null; // { blob, blobUrl, name, duration, volume, isMuted, loop }

    // Mixing & Export Configuration
    this.duckingEnabled = true;
    this.duckingDepthDb = -14; // -14dB attenuation during dialogue
    this.aspectRatio = '16:9'; // '16:9' | '9:16' | '1:1' | '4:5'
    this.resolution = '1080p'; // 'original' | '1080p' | '2160p'
    this.highpassMaster = true; // 80Hz rumble cut
    this.vocalPresence = true; // +2.5dB at 3.2kHz
    this.normalizeLoudness = true; // -14 LUFS

    // Playback Engine State
    this.currentTime = 0;
    this.totalDuration = 0;
    this.isPlaying = false;
    this.playbackTimer = null;
    this.activeClipIndex = 0;

    // Web Audio Preview Graph
    this.audioContext = null;
    this.voiceGainNode = null;
    this.musicGainNode = null;
    this.videoGainNode = null;
    this.masterGainNode = null;

    // Audio Elements for Preview
    this.previewVideoEl = null;
    this.previewVoiceEl = null;
    this.previewMusicEl = null;

    // DOM Container Elements (set in bindUI)
    this.ui = {};
  }

  /**
   * Bind DOM elements of View 5 (Video Editing Station)
   */
  bindUI(elements) {
    this.ui = elements;
    this.setupAudioGraph();
    this.setupEventListeners();
    this.renderTimeline();
    this.renderMixer();
  }

  /**
   * Initialize Web Audio API preview nodes for dynamic ducking & volume control
   */
  setupAudioGraph() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = 1.0;
      this.masterGainNode.connect(this.audioContext.destination);

      this.videoGainNode = this.audioContext.createGain();
      this.videoGainNode.gain.value = 0.8;
      this.videoGainNode.connect(this.masterGainNode);

      this.voiceGainNode = this.audioContext.createGain();
      this.voiceGainNode.gain.value = 1.0;
      this.voiceGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.gain.value = 0.35;
      this.musicGainNode.connect(this.masterGainNode);
    } catch (e) {
      console.warn('Web Audio graph setup warning:', e);
    }
  }

  /**
   * Attach video and audio preview elements
   */
  setMediaElements({ videoEl, voiceEl, musicEl }) {
    this.previewVideoEl = videoEl;
    this.previewVoiceEl = voiceEl;
    this.previewMusicEl = musicEl;

    if (this.previewVideoEl) {
      this.previewVideoEl.addEventListener('ended', () => {
        this.onVideoClipEnded();
      });
      this.previewVideoEl.addEventListener('timeupdate', () => {
        this.onVideoTimeUpdate();
      });
    }
  }

  /**
   * Import clips from the Video Stitcher Station
   */
  importClipsFromVideoStation(clips) {
    if (!clips || clips.length === 0) return 0;

    this.videoClips = clips.map((c, index) => {
      const dur = c.probe?.duration || 5;
      return {
        id: c.id || `clip_${Date.now()}_${index}`,
        file: c.file,
        probe: c.probe || { width: 1280, height: 720, duration: dur },
        thumbUrl: c.thumbUrl || '',
        duration: dur,
        startTrim: 0,
        endTrim: dur,
        volume: 0.8,
        isMuted: false,
      };
    });

    this.computeTotalDuration();
    this.renderTimeline();
    this.renderMixer();
    this.loadClipAtCurrentTime();
    return this.videoClips.length;
  }

  /**
   * Import voiceover audio track from the Audio Studio
   */
  importVoiceoverTrack(audioBlob, name = 'AI Voiceover', duration = 0) {
    if (!audioBlob) return;

    if (this.voiceoverTrack?.blobUrl) {
      URL.revokeObjectURL(this.voiceoverTrack.blobUrl);
    }

    const blobUrl = URL.createObjectURL(audioBlob);

    this.voiceoverTrack = {
      blob: audioBlob,
      blobUrl: blobUrl,
      name: name,
      duration: duration || 10,
      offsetSeconds: 0,
      volume: 1.0,
      isMuted: false,
    };

    if (this.previewVoiceEl) {
      this.previewVoiceEl.src = blobUrl;
      this.previewVoiceEl.load();
      // Read precise duration if available
      this.previewVoiceEl.onloadedmetadata = () => {
        if (isFinite(this.previewVoiceEl.duration) && this.previewVoiceEl.duration > 0) {
          this.voiceoverTrack.duration = this.previewVoiceEl.duration;
          this.renderTimeline();
        }
      };
    }

    this.renderTimeline();
    this.renderMixer();
  }

  /**
   * Import background music audio track
   */
  importMusicTrack(audioBlob, name = 'Background Music') {
    if (!audioBlob) return;

    if (this.musicTrack?.blobUrl) {
      URL.revokeObjectURL(this.musicTrack.blobUrl);
    }

    const blobUrl = URL.createObjectURL(audioBlob);

    this.musicTrack = {
      blob: audioBlob,
      blobUrl: blobUrl,
      name: name,
      duration: 30,
      volume: 0.35,
      isMuted: false,
      loop: true,
    };

    if (this.previewMusicEl) {
      this.previewMusicEl.src = blobUrl;
      this.previewMusicEl.loop = true;
      this.previewMusicEl.load();
      this.previewMusicEl.onloadedmetadata = () => {
        if (isFinite(this.previewMusicEl.duration) && this.previewMusicEl.duration > 0) {
          this.musicTrack.duration = this.previewMusicEl.duration;
          this.renderTimeline();
        }
      };
    }

    this.renderTimeline();
    this.renderMixer();
  }

  /**
   * Calculate total duration of the timeline based on trimmed clips
   */
  computeTotalDuration() {
    this.totalDuration = this.videoClips.reduce((sum, c) => {
      const clipEffectiveDur = Math.max(0.1, (c.endTrim || c.duration) - (c.startTrim || 0));
      return sum + clipEffectiveDur;
    }, 0);

    // If voiceover is longer than video, timeline extends to voiceover end
    if (this.voiceoverTrack) {
      const voiceEnd = (this.voiceoverTrack.offsetSeconds || 0) + (this.voiceoverTrack.duration || 0);
      if (voiceEnd > this.totalDuration) {
        this.totalDuration = voiceEnd;
      }
    }

    if (this.ui.timelineTotalTime) {
      this.ui.timelineTotalTime.textContent = this.formatTimecode(this.totalDuration);
    }
    return this.totalDuration;
  }

  /**
   * Format seconds to mm:ss.ms
   */
  formatTimecode(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00.0';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${tenths}`;
  }

  /**
   * Find which video clip is playing at a specific global timeline timestamp
   */
  getClipAtTime(timestamp) {
    let accumulated = 0;
    for (let i = 0; i < this.videoClips.length; i++) {
      const clip = this.videoClips[i];
      const clipDur = Math.max(0.1, (clip.endTrim || clip.duration) - (clip.startTrim || 0));
      if (timestamp >= accumulated && timestamp < accumulated + clipDur) {
        return {
          clipIndex: i,
          clip: clip,
          localTime: (clip.startTrim || 0) + (timestamp - accumulated),
          accumulatedStart: accumulated,
        };
      }
      accumulated += clipDur;
    }

    // If past all clips, return last clip
    if (this.videoClips.length > 0) {
      const lastIndex = this.videoClips.length - 1;
      const lastClip = this.videoClips[lastIndex];
      return {
        clipIndex: lastIndex,
        clip: lastClip,
        localTime: lastClip.endTrim || lastClip.duration,
        accumulatedStart: accumulated,
      };
    }

    return null;
  }

  /**
   * Load appropriate video clip into preview player at currentTime
   */
  loadClipAtCurrentTime(playImmediately = false) {
    if (!this.previewVideoEl || this.videoClips.length === 0) return;

    const info = this.getClipAtTime(this.currentTime);
    if (!info) return;

    this.activeClipIndex = info.clipIndex;
    const clip = info.clip;

    if (!clip.blobUrl && clip.file) {
      clip.blobUrl = URL.createObjectURL(clip.file);
    }

    if (this.previewVideoEl.src !== clip.blobUrl) {
      this.previewVideoEl.src = clip.blobUrl;
      this.previewVideoEl.load();
    }

    this.previewVideoEl.currentTime = info.localTime;
    this.previewVideoEl.volume = clip.isMuted ? 0 : (clip.volume || 0.8);

    if (playImmediately && this.isPlaying) {
      this.previewVideoEl.play().catch(() => {});
    }
  }

  /**
   * Play / Pause toggle for synchronized multi-track playback
   */
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.totalDuration <= 0) return;
    if (this.currentTime >= this.totalDuration - 0.1) {
      this.seekTo(0);
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    if (this.ui.btnPlayPause) {
      this.ui.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1"></rect>
        </svg>
        <span>Pause</span>
      `;
    }

    this.loadClipAtCurrentTime(true);

    // Sync Background Music
    if (this.previewMusicEl && this.musicTrack) {
      this.previewMusicEl.volume = this.musicTrack.isMuted ? 0 : this.computeDuckedMusicVolume();
      this.previewMusicEl.currentTime = this.currentTime % (this.musicTrack.duration || 30);
      this.previewMusicEl.play().catch(() => {});
    }

    // Sync Voiceover Audio
    if (this.previewVoiceEl && this.voiceoverTrack) {
      const vOffset = this.voiceoverTrack.offsetSeconds || 0;
      const vEnd = vOffset + (this.voiceoverTrack.duration || 0);

      if (this.currentTime >= vOffset && this.currentTime < vEnd) {
        this.previewVoiceEl.volume = this.voiceoverTrack.isMuted ? 0 : (this.voiceoverTrack.volume || 1.0);
        this.previewVoiceEl.currentTime = this.currentTime - vOffset;
        this.previewVoiceEl.play().catch(() => {});
      } else {
        this.previewVoiceEl.pause();
      }
    }

    // High frequency ticker to update playhead position and handle ducking
    this.playbackTimer = setInterval(() => {
      this.onPlaybackTick();
    }, 50);
  }

  pause() {
    this.isPlaying = false;
    if (this.ui.btnPlayPause) {
      this.ui.btnPlayPause.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Play Preview</span>
      `;
    }

    clearInterval(this.playbackTimer);

    if (this.previewVideoEl) this.previewVideoEl.pause();
    if (this.previewVoiceEl) this.previewVoiceEl.pause();
    if (this.previewMusicEl) this.previewMusicEl.pause();
  }

  /**
   * Seek to specific timeline timestamp
   */
  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, seconds));
    this.updatePlayheadPosition();

    if (this.ui.timelineCurrentTime) {
      this.ui.timelineCurrentTime.textContent = this.formatTimecode(this.currentTime);
    }

    this.loadClipAtCurrentTime(this.isPlaying);

    // Sync Voice
    if (this.previewVoiceEl && this.voiceoverTrack) {
      const vOffset = this.voiceoverTrack.offsetSeconds || 0;
      const vEnd = vOffset + (this.voiceoverTrack.duration || 0);
      if (this.currentTime >= vOffset && this.currentTime < vEnd) {
        this.previewVoiceEl.currentTime = this.currentTime - vOffset;
        if (this.isPlaying) this.previewVoiceEl.play().catch(() => {});
      } else {
        this.previewVoiceEl.pause();
      }
    }

    // Sync BGM
    if (this.previewMusicEl && this.musicTrack) {
      this.previewMusicEl.currentTime = this.currentTime % (this.musicTrack.duration || 30);
      this.previewMusicEl.volume = this.computeDuckedMusicVolume();
    }
  }

  /**
   * Called every 50ms during playback to advance playhead and calculate auto-ducking
   */
  onPlaybackTick() {
    if (!this.isPlaying) return;

    this.currentTime += 0.05;

    if (this.currentTime >= this.totalDuration) {
      this.pause();
      this.seekTo(0);
      return;
    }

    this.updatePlayheadPosition();
    if (this.ui.timelineCurrentTime) {
      this.ui.timelineCurrentTime.textContent = this.formatTimecode(this.currentTime);
    }

    // Check if voiceover should start or stop
    if (this.previewVoiceEl && this.voiceoverTrack) {
      const vOffset = this.voiceoverTrack.offsetSeconds || 0;
      const vEnd = vOffset + (this.voiceoverTrack.duration || 0);

      if (this.currentTime >= vOffset && this.currentTime < vEnd) {
        if (this.previewVoiceEl.paused) {
          this.previewVoiceEl.currentTime = this.currentTime - vOffset;
          this.previewVoiceEl.volume = this.voiceoverTrack.isMuted ? 0 : (this.voiceoverTrack.volume || 1.0);
          this.previewVoiceEl.play().catch(() => {});
        }
      } else {
        if (!this.previewVoiceEl.paused) {
          this.previewVoiceEl.pause();
        }
      }
    }

    // Dynamic auto-ducking update for background music
    if (this.previewMusicEl && this.musicTrack) {
      const duckedVol = this.computeDuckedMusicVolume();
      this.previewMusicEl.volume = duckedVol;

      if (this.ui.duckingIndicator) {
        const isDucking = this.isVoiceoverActiveAt(this.currentTime) && this.duckingEnabled;
        this.ui.duckingIndicator.className = isDucking ? 'ducking-indicator active' : 'ducking-indicator';
        this.ui.duckingIndicator.title = isDucking ? 'Auto-Ducking: BGM lowered by -14dB for voiceover' : 'Ducking Idle';
      }
    }
  }

  /**
   * Check if voiceover is currently speaking at timestamp
   */
  isVoiceoverActiveAt(timestamp) {
    if (!this.voiceoverTrack) return false;
    const vOffset = this.voiceoverTrack.offsetSeconds || 0;
    const vEnd = vOffset + (this.voiceoverTrack.duration || 0);
    return timestamp >= vOffset && timestamp < vEnd;
  }

  /**
   * Compute volume of background music with auto-ducking applied
   */
  computeDuckedMusicVolume() {
    if (!this.musicTrack || this.musicTrack.isMuted) return 0;
    const baseVol = this.musicTrack.volume !== undefined ? this.musicTrack.volume : 0.35;

    if (this.duckingEnabled && this.isVoiceoverActiveAt(this.currentTime)) {
      // Attenuate BGM by ducking depth (e.g. -14dB = ~0.2x of base volume)
      const factor = Math.pow(10, this.duckingDepthDb / 20);
      return Math.max(0.02, baseVol * factor);
    }

    return baseVol;
  }

  onVideoClipEnded() {
    if (!this.isPlaying) return;
    // Advance to next clip
    const nextIndex = this.activeClipIndex + 1;
    if (nextIndex < this.videoClips.length) {
      this.loadClipAtCurrentTime(true);
    }
  }

  onVideoTimeUpdate() {
    // Keep preview in sync
  }

  updatePlayheadPosition() {
    if (!this.ui.timelineScrubber || this.totalDuration <= 0) return;
    const pct = Math.min(100, Math.max(0, (this.currentTime / this.totalDuration) * 100));
    this.ui.timelineScrubber.style.left = `${pct}%`;

    if (this.ui.playheadLine) {
      this.ui.playheadLine.style.left = `${pct}%`;
    }
  }

  /**
   * Render Multi-Track Timeline Visualizer
   */
  renderTimeline() {
    this.computeTotalDuration();

    if (!this.ui.trackVideoClips) return;

    // 1. Render Video Track Clips
    this.ui.trackVideoClips.innerHTML = '';
    if (this.videoClips.length === 0) {
      this.ui.trackVideoClips.innerHTML = `
        <div class="timeline-empty-hint">
          <span>🎞️ No clips added yet. Click <strong>"Import Clips from Video Station"</strong> above.</span>
        </div>
      `;
    } else {
      this.videoClips.forEach((clip, index) => {
        const clipDur = Math.max(0.1, (clip.endTrim || clip.duration) - (clip.startTrim || 0));
        const widthPct = this.totalDuration > 0 ? (clipDur / this.totalDuration) * 100 : 25;

        const block = document.createElement('div');
        block.className = 'timeline-clip-block';
        block.style.width = `${Math.max(10, widthPct)}%`;
        block.title = `${clip.file?.name || `Clip ${index + 1}`} (${clipDur.toFixed(1)}s)`;

        block.innerHTML = `
          <div class="clip-block-thumb" style="background-image: url('${clip.thumbUrl || ''}')"></div>
          <div class="clip-block-info">
            <span class="clip-block-name">#${index + 1} ${clip.file?.name || 'Clip'}</span>
            <span class="clip-block-duration">${clipDur.toFixed(1)}s</span>
          </div>
          <div class="clip-block-actions">
            <button type="button" class="btn-clip-trim" data-idx="${index}" title="Trim Clip">✂️</button>
            <button type="button" class="btn-clip-mute" data-idx="${index}" title="Mute/Unmute">
              ${clip.isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        `;

        block.querySelector('.btn-clip-trim').addEventListener('click', (e) => {
          e.stopPropagation();
          this.promptTrimClip(index);
        });

        block.querySelector('.btn-clip-mute').addEventListener('click', (e) => {
          e.stopPropagation();
          clip.isMuted = !clip.isMuted;
          this.renderTimeline();
          this.renderMixer();
        });

        this.ui.trackVideoClips.appendChild(block);
      });
    }

    // 2. Render Voiceover Track
    if (this.ui.trackVoiceover) {
      this.ui.trackVoiceover.innerHTML = '';
      if (!this.voiceoverTrack) {
        this.ui.trackVoiceover.innerHTML = `
          <div class="timeline-empty-hint">
            <span>🎙️ No voiceover track. Generate speech in <strong>"Audio Studio"</strong> or click <strong>"Import Voiceover"</strong>.</span>
          </div>
        `;
      } else {
        const vDur = this.voiceoverTrack.duration || 10;
        const vOffset = this.voiceoverTrack.offsetSeconds || 0;
        const widthPct = this.totalDuration > 0 ? (vDur / this.totalDuration) * 100 : 40;
        const leftPct = this.totalDuration > 0 ? (vOffset / this.totalDuration) * 100 : 0;

        const vBlock = document.createElement('div');
        vBlock.className = 'timeline-audio-block voice-block';
        vBlock.style.width = `${Math.max(12, widthPct)}%`;
        vBlock.style.left = `${leftPct}%`;

        vBlock.innerHTML = `
          <span class="audio-block-icon">🎙️</span>
          <div class="audio-block-details">
            <span class="audio-block-title">${this.voiceoverTrack.name || 'Voiceover Narration'}</span>
            <span class="audio-block-meta">${vDur.toFixed(1)}s (Offset: ${vOffset.toFixed(1)}s)</span>
          </div>
          <div class="audio-block-wave-art"></div>
          <button type="button" class="btn-track-action btn-adjust-offset" title="Adjust Start Offset">⏱️ Shift</button>
        `;

        vBlock.querySelector('.btn-adjust-offset').addEventListener('click', (e) => {
          e.stopPropagation();
          const newOffset = prompt('Enter start time offset in seconds (e.g. 0.0, 1.5, 3.0):', vOffset);
          if (newOffset !== null) {
            const parsed = parseFloat(newOffset);
            if (!isNaN(parsed) && parsed >= 0) {
              this.voiceoverTrack.offsetSeconds = parsed;
              this.renderTimeline();
            }
          }
        });

        this.ui.trackVoiceover.appendChild(vBlock);
      }
    }

    // 3. Render Background Music Track
    if (this.ui.trackMusic) {
      this.ui.trackMusic.innerHTML = '';
      if (!this.musicTrack) {
        this.ui.trackMusic.innerHTML = `
          <div class="timeline-empty-hint">
            <span>🎵 No background music. Click <strong>"Add Background Music"</strong> to add an acoustic soundtrack.</span>
          </div>
        `;
      } else {
        const mDur = this.musicTrack.duration || 30;
        const widthPct = this.totalDuration > 0 ? Math.min(100, (mDur / this.totalDuration) * 100) : 100;

        const mBlock = document.createElement('div');
        mBlock.className = 'timeline-audio-block music-block';
        mBlock.style.width = this.musicTrack.loop ? '100%' : `${Math.max(15, widthPct)}%`;

        mBlock.innerHTML = `
          <span class="audio-block-icon">🎵</span>
          <div class="audio-block-details">
            <span class="audio-block-title">${this.musicTrack.name || 'Background Score'}</span>
            <span class="audio-block-meta">${mDur.toFixed(1)}s ${this.musicTrack.loop ? '• 🔁 Seamless Loop' : ''}</span>
          </div>
          <div class="audio-block-wave-art music-art"></div>
          <span class="badge-ducking-state">${this.duckingEnabled ? '⚡ Auto-Ducked' : 'Standard'}</span>
        `;

        this.ui.trackMusic.appendChild(mBlock);
      }
    }

    this.updatePlayheadPosition();
  }

  promptTrimClip(index) {
    const clip = this.videoClips[index];
    if (!clip) return;

    const start = prompt(`Enter Start Trim time in seconds (0.0 to ${clip.duration.toFixed(1)}):`, clip.startTrim || 0);
    if (start === null) return;
    const end = prompt(`Enter End Trim time in seconds (${start} to ${clip.duration.toFixed(1)}):`, clip.endTrim || clip.duration);
    if (end === null) return;

    const pStart = parseFloat(start);
    const pEnd = parseFloat(end);

    if (!isNaN(pStart) && !isNaN(pEnd) && pStart >= 0 && pEnd > pStart && pEnd <= clip.duration + 0.1) {
      clip.startTrim = pStart;
      clip.endTrim = pEnd;
      this.renderTimeline();
    } else {
      alert('Invalid trim values entered. Trim cancelled.');
    }
  }

  /**
   * Render Mixer Channel Strips
   */
  renderMixer() {
    if (this.ui.voiceVolumeSlider && this.voiceoverTrack) {
      this.ui.voiceVolumeSlider.value = this.voiceoverTrack.volume !== undefined ? this.voiceoverTrack.volume : 1.0;
      if (this.ui.voiceVolumeLabel) {
        this.ui.voiceVolumeLabel.textContent = `${Math.round((this.voiceoverTrack.volume || 1.0) * 100)}%`;
      }
    }

    if (this.ui.musicVolumeSlider && this.musicTrack) {
      this.ui.musicVolumeSlider.value = this.musicTrack.volume !== undefined ? this.musicTrack.volume : 0.35;
      if (this.ui.musicVolumeLabel) {
        this.ui.musicVolumeLabel.textContent = `${Math.round((this.musicTrack.volume || 0.35) * 100)}%`;
      }
    }

    if (this.ui.chkAutoDucking) {
      this.ui.chkAutoDucking.checked = this.duckingEnabled;
    }
  }

  setupEventListeners() {
    // Play/Pause
    if (this.ui.btnPlayPause) {
      this.ui.btnPlayPause.addEventListener('click', () => this.togglePlay());
    }

    // Rewind to start
    if (this.ui.btnRewind) {
      this.ui.btnRewind.addEventListener('click', () => {
        this.seekTo(0);
      });
    }

    // Timeline Scrubber Click
    if (this.ui.timelineRulerArea) {
      this.ui.timelineRulerArea.addEventListener('click', (e) => {
        const rect = this.ui.timelineRulerArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        this.seekTo(pct * this.totalDuration);
      });
    }

    // Voice Volume Slider
    if (this.ui.voiceVolumeSlider) {
      this.ui.voiceVolumeSlider.addEventListener('input', () => {
        const val = parseFloat(this.ui.voiceVolumeSlider.value);
        if (this.voiceoverTrack) this.voiceoverTrack.volume = val;
        if (this.ui.voiceVolumeLabel) this.ui.voiceVolumeLabel.textContent = `${Math.round(val * 100)}%`;
        if (this.previewVoiceEl) this.previewVoiceEl.volume = val;
      });
    }

    // Music Volume Slider
    if (this.ui.musicVolumeSlider) {
      this.ui.musicVolumeSlider.addEventListener('input', () => {
        const val = parseFloat(this.ui.musicVolumeSlider.value);
        if (this.musicTrack) this.musicTrack.volume = val;
        if (this.ui.musicVolumeLabel) this.ui.musicVolumeLabel.textContent = `${Math.round(val * 100)}%`;
        if (this.previewMusicEl) this.previewMusicEl.volume = this.computeDuckedMusicVolume();
      });
    }

    // Auto-Ducking Checkbox
    if (this.ui.chkAutoDucking) {
      this.ui.chkAutoDucking.addEventListener('change', () => {
        this.duckingEnabled = this.ui.chkAutoDucking.checked;
        this.renderTimeline();
        if (this.previewMusicEl) this.previewMusicEl.volume = this.computeDuckedMusicVolume();
      });
    }

    // Aspect Ratio Selector
    if (this.ui.selectAspectRatio) {
      this.ui.selectAspectRatio.addEventListener('change', () => {
        this.aspectRatio = this.ui.selectAspectRatio.value;
        this.updatePreviewAspectClass();
      });
    }

    // Resolution Selector
    if (this.ui.selectEditorResolution) {
      this.ui.selectEditorResolution.addEventListener('change', () => {
        this.resolution = this.ui.selectEditorResolution.value;
      });
    }

    // Render Master Video Action
    if (this.ui.btnRenderMasterVideo) {
      this.ui.btnRenderMasterVideo.addEventListener('click', () => {
        this.renderMasterVideo();
      });
    }
  }

  updatePreviewAspectClass() {
    if (!this.ui.previewMonitorContainer) return;
    this.ui.previewMonitorContainer.classList.remove('aspect-16-9', 'aspect-9-16', 'aspect-1-1', 'aspect-4-5');

    if (this.aspectRatio === '9:16') {
      this.ui.previewMonitorContainer.classList.add('aspect-9-16');
    } else if (this.aspectRatio === '1:1') {
      this.ui.previewMonitorContainer.classList.add('aspect-1-1');
    } else if (this.aspectRatio === '4:5') {
      this.ui.previewMonitorContainer.classList.add('aspect-4-5');
    } else {
      this.ui.previewMonitorContainer.classList.add('aspect-16-9');
    }
  }

  /**
   * Execute Master Composite Video Render via FFmpeg.wasm
   */
  async renderMasterVideo() {
    if (this.videoClips.length === 0) {
      alert('Please import at least one video clip into the editing station before rendering.');
      return;
    }

    this.pause();

    if (this.ui.renderModal) {
      this.ui.renderModal.style.display = 'flex';
      if (this.ui.renderProgressFill) this.ui.renderProgressFill.style.width = '0%';
      if (this.ui.renderStatusText) {
        this.ui.renderStatusText.textContent = '🚀 Preparing multi-track compositing pipeline in FFmpeg.wasm...';
      }
      if (this.ui.renderResultArea) this.ui.renderResultArea.style.display = 'none';
    }

    if (this.ui.btnRenderMasterVideo) {
      this.ui.btnRenderMasterVideo.disabled = true;
    }

    try {
      const renderConfig = {
        videoClips: this.videoClips,
        voiceoverTrack: this.voiceoverTrack,
        musicTrack: this.musicTrack,
        duckingEnabled: this.duckingEnabled,
        duckingDepthDb: this.duckingDepthDb,
        aspectRatio: this.aspectRatio,
        resolution: this.resolution,
        highpassMaster: this.highpassMaster,
        vocalPresence: this.vocalPresence,
        normalizeLoudness: this.normalizeLoudness,
        onProgress: (pct, stage) => {
          if (this.ui.renderProgressFill) {
            this.ui.renderProgressFill.style.width = `${pct}%`;
          }
          if (this.ui.renderStatusText) {
            this.ui.renderStatusText.textContent = `⚡ [${pct}%] ${stage}`;
          }
        }
      };

      const result = await this.ffmpegHandler.renderCompositeProject(renderConfig);

      if (this.ui.renderProgressFill) this.ui.renderProgressFill.style.width = '100%';
      if (this.ui.renderStatusText) {
        this.ui.renderStatusText.innerHTML = `<span style="color: var(--success); font-weight: 700;">🎉 Master Video Render Complete! (${(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB)</span>`;
      }

      if (this.ui.renderResultArea) {
        this.ui.renderResultArea.style.display = 'block';
        if (this.ui.renderResultPlayer) {
          this.ui.renderResultPlayer.src = result.blobUrl;
          this.ui.renderResultPlayer.load();
        }
        if (this.ui.btnDownloadRenderedMaster) {
          this.ui.btnDownloadRenderedMaster.href = result.blobUrl;
          this.ui.btnDownloadRenderedMaster.download = `clipmerge-master-${this.resolution}-${Date.now()}.mp4`;
        }
      }
    } catch (err) {
      console.error('Master render error:', err);
      alert(`Master video render failed: ${err.message}`);
      if (this.ui.renderStatusText) {
        this.ui.renderStatusText.textContent = `Error: ${err.message}`;
      }
    } finally {
      if (this.ui.btnRenderMasterVideo) {
        this.ui.btnRenderMasterVideo.disabled = false;
      }
    }
  }
}

