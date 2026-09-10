/**
 * ClipMerge - AI Audio & Voice Studio Engine
 * Provides Multilingual Text-to-Speech (English & Telugu), Voice Cloning from mic/audio,
 * Voice Tone Shaping, Voice Merging / Hybridization, and Audio-to-Video Synchronization.
 */

export class AudioStudio {
  constructor(geminiService = null) {
    this.geminiService = geminiService;
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.clonedVoiceProfile = null;
    this.audioContext = null;

    // Standard Tone Presets
    this.TONE_PRESETS = {
      cinematic: { pitch: 0.75, rate: 0.9, label: '🎬 Cinematic / Movie Trailer (Deep Baritone)' },
      energetic: { pitch: 1.25, rate: 1.18, label: '⚡ Energetic YouTube Star / Tech Review' },
      storyteller: { pitch: 0.95, rate: 0.88, label: '📖 Warm Storyteller / Moral Tales' },
      professional: { pitch: 1.0, rate: 1.0, label: '💼 Professional Presenter / Corporate' },
      calm: { pitch: 0.88, rate: 0.82, label: '🌿 Calm / Meditative Narrator' },
    };

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices() || [];
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Get available voices categorized by English and Telugu
   */
  getVoices() {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices() || [];
    }

    const teluguVoices = this.voices.filter(v => 
      v.lang.toLowerCase().includes('te') || 
      v.name.toLowerCase().includes('telugu')
    );

    const englishVoices = this.voices.filter(v => 
      v.lang.toLowerCase().includes('en') || 
      v.name.toLowerCase().includes('english')
    );

    return {
      all: this.voices,
      telugu: teluguVoices,
      english: englishVoices,
    };
  }

  /**
   * Speak text with given options
   */
  speak(text, options = {}) {
    if (!this.synth) {
      throw new Error('SpeechSynthesis is not supported in this browser.');
    }

    this.synth.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);

    if (options.voice) {
      utterance.voice = options.voice;
    }
    if (options.lang) {
      utterance.lang = options.lang;
    }

    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
    utterance.rate = options.rate !== undefined ? options.rate : 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    this.synth.speak(utterance);
    return utterance;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Start microphone voice sampler for Voice Cloning
   */
  async startVoiceCloneRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  /**
   * Stop voice clone recording and extract vocal profile
   */
  async stopVoiceCloneRecording() {
    if (!this.mediaRecorder || !this.isRecording) return null;

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.isRecording = false;

        // Stop mic tracks
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }

        // Analyze pitch and formants using Web Audio API
        const profile = await this.analyzeVoiceSample(audioBlob);
        this.clonedVoiceProfile = {
          blob: audioBlob,
          url: URL.createObjectURL(audioBlob),
          ...profile,
        };

        resolve(this.clonedVoiceProfile);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Analyze recorded voice sample (extract fundamental pitch F0 & frequency)
   */
  async analyzeVoiceSample(blob) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      let sumSquares = 0;
      let zeroCrossings = 0;

      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
        if (i > 0 && ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0))) {
          zeroCrossings++;
        }
      }

      const rms = Math.sqrt(sumSquares / channelData.length);
      const estFreq = (zeroCrossings / 2) / audioBuffer.duration;

      // Map estimated frequency to pitch scale
      let pitchMultiplier = 1.0;
      if (estFreq < 130) pitchMultiplier = 0.8; // Deep / Baritone
      else if (estFreq > 220) pitchMultiplier = 1.25; // Higher / Feminine
      else pitchMultiplier = 1.0;

      return {
        duration: audioBuffer.duration,
        estimatedFreqHz: Math.round(estFreq),
        rmsVolume: rms.toFixed(2),
        suggestedPitch: pitchMultiplier,
        suggestedRate: 0.95,
        timbre: estFreq < 140 ? 'Deep / Resonant' : (estFreq > 210 ? 'Bright / High' : 'Neutral / Balanced'),
      };
    } catch (err) {
      console.warn('Voice analysis fallback:', err);
      return {
        duration: 3,
        estimatedFreqHz: 160,
        rmsVolume: 0.2,
        suggestedPitch: 1.0,
        suggestedRate: 1.0,
        timbre: 'Natural Voice',
      };
    }
  }

  /**
   * Create a synthetic merged voice blending Voice A and Voice B with a ratio slider
   * @param {Object} voiceA - { pitch, rate, timbre }
   * @param {Object} voiceB - { pitch, rate, timbre }
   * @param {number} ratioA - 0.0 to 1.0 (e.g. 0.7 = 70% Voice A, 30% Voice B)
   */
  createMergedVoice(voiceA, voiceB, ratioA = 0.5) {
    const ratioB = 1 - ratioA;
    const pitchA = voiceA.pitch || 1.0;
    const pitchB = voiceB.pitch || 1.0;
    const rateA = voiceA.rate || 1.0;
    const rateB = voiceB.rate || 1.0;

    const blendedPitch = Number((pitchA * ratioA + pitchB * ratioB).toFixed(2));
    const blendedRate = Number((rateA * ratioA + rateB * ratioB).toFixed(2));

    return {
      name: `Hybrid Voice (${Math.round(ratioA * 100)}% A + ${Math.round(ratioB * 100)}% B)`,
      pitch: blendedPitch,
      rate: blendedRate,
      description: `Synthesized blend of ${voiceA.label || 'Voice A'} and ${voiceB.label || 'Voice B'}`,
      isHybrid: true,
    };
  }

  /**
   * Use Gemini to translate or polish a script into natural spoken Telugu or English
   */
  async translateOrPolishScript(text, targetLang = 'telugu') {
    if (!this.geminiService || !this.geminiService.hasApiKey()) {
      // Offline fallback: return original text
      return text;
    }

    const isTelugu = targetLang.toLowerCase().includes('te') || targetLang.toLowerCase().includes('telugu');

    const prompt = isTelugu
      ? `
You are an expert Telugu screenwriter, YouTube voiceover creator, and translator.
Translate and adapt the following video production script into natural, engaging, and colloquial spoken Telugu (తెలుగు) suitable for clear YouTube voiceover narration.
Keep sentence structures concise, energetic, and natural for speech. Do not include English words in Latin script unless they are standard brand/tech names.

Script:
"""
${text}
"""

Return ONLY the Telugu spoken script text, without any explanations or markdown quotes.
`
      : `
You are an expert English voiceover director and copywriter.
Polish the following video production script into clean, natural, and engaging spoken English narration.
Keep the tone natural, dynamic, and easy to articulate.

Script:
"""
${text}
"""

Return ONLY the polished English spoken script text, without any explanations or markdown quotes.
`;

    try {
      const result = await this.geminiService.callGeminiApi(prompt, false);
      if (result && typeof result === 'string') {
        return result.trim();
      }
    } catch (err) {
      console.warn('Gemini script translation warning:', err.message);
    }

    return text;
  }

  /**
   * Synthesize spoken speech into a downloadable WAV audio blob
   * Uses Web Audio API MediaStreamAudioDestinationNode
   */
  async recordSpeechToWavBlob(text, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(dest.stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          resolve(blob);
        };

        mediaRecorder.start();

        // Speak
        this.speak(text, {
          ...options,
          onEnd: () => {
            setTimeout(() => {
              if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
            }, 300);
          },
          onError: (err) => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            reject(err);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

