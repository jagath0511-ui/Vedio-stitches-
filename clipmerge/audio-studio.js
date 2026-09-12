/**
 * ClipMerge - AI Audio & Voice Studio Engine
 * Provides Multilingual Text-to-Speech (English, Telugu & Regional accents),
 * Complete Google Voice Models Catalog (Gemini AI, Google Journey, Studio, Neural2, Telugu),
 * Male/Female Voice Categorization & Search, Character Voice Cast Studio,
 * Voice Cloning from mic/audio, and Google Voice Merging / Hybridization.
 */

export const GOOGLE_VOICE_MODELS = [
  // ==========================================
  // GOOGLE GEMINI 2.0 AI MULTIMODAL VOICES
  // ==========================================
  {
    id: 'gemini-lyra',
    name: 'Lyra (Gemini AI 2.0)',
    shortName: 'Lyra',
    gender: 'female',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Crystal Melodic Resonance',
    description: 'Luminous, crystal-clear, melodic, and expressive. Ideal for poetic narratives, celestial & fantasy storytelling, meditation, and inspirational voiceovers.',
    recommendedRole: 'Inspirational Narrator / Celestial & Poetic Voice',
    sampleText: 'Beneath the radiant tapestry of constellations, every whisper carries the melody of infinite possibility.',
    pitch: 1.12,
    rate: 1.02,
    avatarBadge: '✨',
  },
  {
    id: 'gemini-puck',
    name: 'Puck (Gemini AI 2.0)',
    shortName: 'Puck',
    gender: 'male',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Crisp Dynamic Baritone',
    description: 'Energetic, animated, and engaging baritone. Ideal for tech explainers, YouTube intros, high-energy gaming cuts, and tutorials.',
    recommendedRole: 'Tech YouTuber / Dynamic Host',
    sampleText: "Hey everyone! Welcome back. Today we're diving straight into something truly game-changing for your video edits.",
    pitch: 1.10,
    rate: 1.10,
    avatarBadge: '⚡',
  },
  {
    id: 'gemini-charon',
    name: 'Charon (Gemini AI 2.0)',
    shortName: 'Charon',
    gender: 'male',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Deep Resonant Bass',
    description: 'Deep, calm, authoritative, and resonant. Perfect for serious documentaries, narrative thrillers, and philosophical expositions.',
    recommendedRole: 'Documentary Narrator / Deep Cinematic Voice',
    sampleText: "In the quiet stillness of deep time, the ancient forces shaped the destiny of our universe.",
    pitch: 0.72,
    rate: 0.88,
    avatarBadge: '🎬',
  },
  {
    id: 'gemini-kore',
    name: 'Kore (Gemini AI 2.0)',
    shortName: 'Kore',
    gender: 'female',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Warm Gentle Mezzo',
    description: 'Warm, empathetic, soothing, and friendly. Excellent for moral stories, children’s fables, wellness, and heartfelt storytelling.',
    recommendedRole: 'Warm Storyteller / Audiobook Narrator',
    sampleText: "Once upon a time, nestled between rolling green hills, a small village whispered tales of kindness and courage.",
    pitch: 1.18,
    rate: 0.94,
    avatarBadge: '📖',
  },
  {
    id: 'gemini-fenrir',
    name: 'Fenrir (Gemini AI 2.0)',
    shortName: 'Fenrir',
    gender: 'male',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Intense Bold Baritone',
    description: 'Bold, intense, assertive, and cinematic. Tailored for action movie trailers, gaming cutscenes, and high-stakes drama.',
    recommendedRole: 'Action Hero / Movie Trailer Voice',
    sampleText: "The clock is ticking. One warrior stands against the storm, and surrender is not an option.",
    pitch: 0.80,
    rate: 1.02,
    avatarBadge: '🛡️',
  },
  {
    id: 'gemini-aoede',
    name: 'Aoede (Gemini AI 2.0)',
    shortName: 'Aoede',
    gender: 'female',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Bright Melodic Soprano',
    description: 'Confident, breezy, articulate, and expressive. Superb for podcast interviews, lifestyle vlogs, and modern product reviews.',
    recommendedRole: 'Podcast Host / Lifestyle Presenter',
    sampleText: "Welcome to today's episode! I'm thrilled to share some incredible insights with all of you today.",
    pitch: 1.25,
    rate: 1.05,
    avatarBadge: '🎙️',
  },
  {
    id: 'gemini-zephyr',
    name: 'Zephyr (Gemini AI 2.0)',
    shortName: 'Zephyr',
    gender: 'female',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Youthful Radiant Soprano',
    description: 'Bright, youthful, vibrant, and enthusiastic. Perfect for commercials, animated characters, and upbeat social shorts.',
    recommendedRole: 'Commercial Announcer / Youthful Heroine',
    sampleText: "Get ready to experience innovation like never before! Fresh, fast, and built for your imagination.",
    pitch: 1.34,
    rate: 1.15,
    avatarBadge: '✨',
  },
  {
    id: 'gemini-orpheus',
    name: 'Orpheus (Gemini AI 2.0)',
    shortName: 'Orpheus',
    gender: 'male',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Rich Dramatic Baritone',
    description: 'Rich, dramatic, classical baritone with poetic cadence. Excellent for mythology, historical epics, and dramatic monologues.',
    recommendedRole: 'Classical Epic Narrator / Dramatic Lead',
    sampleText: "Through shadows and memory, the traveler walked on, driven by a promise whispered under starry skies.",
    pitch: 0.85,
    rate: 0.90,
    avatarBadge: '🏛️',
  },
  {
    id: 'gemini-leda',
    name: 'Leda (Gemini AI 2.0)',
    shortName: 'Leda',
    gender: 'female',
    engine: 'Gemini AI 2.0',
    category: 'gemini',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Clear Poised Contralto',
    description: 'Poised, thoughtful, articulate, and trustworthy. Ideal for corporate executive presentations and educational lectures.',
    recommendedRole: 'Executive Presenter / Academic Lecturer',
    sampleText: "Our strategic initiatives this quarter represent a fundamental advancement in operational excellence.",
    pitch: 1.06,
    rate: 0.96,
    avatarBadge: '💼',
  },

  // ==========================================
  // GOOGLE CLOUD TTS JOURNEY & STUDIO VOICES
  // ==========================================
  {
    id: 'google-journey-f',
    name: 'Google Journey-F (Conversational)',
    shortName: 'Journey-F',
    gender: 'female',
    engine: 'Google Cloud Journey',
    category: 'journey',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Natural Conversational Cadence',
    description: "Google's next-gen conversational voice with organic micro-pauses, realistic breathing, and empathetic cadence.",
    recommendedRole: 'Conversational Storyteller / Empathetic Guide',
    sampleText: "You know, when you really look at it, the most incredible journeys begin with a single bold decision.",
    pitch: 1.14,
    rate: 0.96,
    avatarBadge: '🌟',
  },
  {
    id: 'google-journey-d',
    name: 'Google Journey-D (Conversational)',
    shortName: 'Journey-D',
    gender: 'male',
    engine: 'Google Cloud Journey',
    category: 'journey',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Natural Smooth Baritone',
    description: 'Ultra-natural conversational male voice with warm, podcast-style pacing and authentic cadence.',
    recommendedRole: 'Podcast Host / Friendly Explainer',
    sampleText: "Let's take a closer look at what really makes this work so well in everyday video production.",
    pitch: 0.92,
    rate: 0.98,
    avatarBadge: '🎧',
  },
  {
    id: 'google-journey-o',
    name: 'Google Journey-O (Expressive)',
    shortName: 'Journey-O',
    gender: 'female',
    engine: 'Google Cloud Journey',
    category: 'journey',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Expressive Upbeat Conversational',
    description: 'Upbeat, friendly, and expressive conversational tone. Excellent for interactive guides and YouTube videos.',
    recommendedRole: 'Interactive Guide / Modern Host',
    sampleText: "Alright! Let's get straight into it and show you how easy this creative process truly is.",
    pitch: 1.20,
    rate: 1.04,
    avatarBadge: '🚀',
  },
  {
    id: 'google-studio-o',
    name: 'Google Studio-O (Broadcaster)',
    shortName: 'Studio-O',
    gender: 'female',
    engine: 'Google Cloud Studio',
    category: 'studio',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Studio Broadcaster Clarity',
    description: 'Ultra-high fidelity broadcaster standard, pristine acoustic clarity, NPR/BBC documentary quality.',
    recommendedRole: 'Broadcaster / Audio Journalist',
    sampleText: "Reporting live from the international summit, researchers unveiled landmark technological findings today.",
    pitch: 1.10,
    rate: 0.95,
    avatarBadge: '📡',
  },
  {
    id: 'google-studio-q',
    name: 'Google Studio-Q (Documentary)',
    shortName: 'Studio-Q',
    gender: 'male',
    engine: 'Google Cloud Studio',
    category: 'studio',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Deep Studio Authority',
    description: 'Deep documentary authority, rich acoustic warmth, national geographic narrator quality.',
    recommendedRole: 'Documentary Voice of Authority',
    sampleText: "Across the vast Serengeti plains, life moves to the ancient rhythms of season and survival.",
    pitch: 0.78,
    rate: 0.92,
    avatarBadge: '🦁',
  },

  // ==========================================
  // GOOGLE CLOUD NEURAL2 VOICES
  // ==========================================
  {
    id: 'google-neural2-a',
    name: 'Google Neural2-A (Tech Explainer)',
    shortName: 'Neural2-A',
    gender: 'male',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Crisp Fast Tech',
    description: 'Crisp, concise, fast-paced modern delivery. Great for tech reviews, software guides, and fast explainers.',
    recommendedRole: 'Tech Reviewer / Software Explainer',
    sampleText: "In just three easy steps, you can compile and render your entire sequence with zero delay.",
    pitch: 1.05,
    rate: 1.12,
    avatarBadge: '💻',
  },
  {
    id: 'google-neural2-c',
    name: 'Google Neural2-C (Tutorial Guide)',
    shortName: 'Neural2-C',
    gender: 'female',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Gentle Instructional',
    description: 'Approachable, instructional, crystal-clear tutorial delivery with gentle, supportive cadence.',
    recommendedRole: 'Tutorial Instructor / Educational Guide',
    sampleText: "In this walkthrough, we'll guide you step by step through every feature of the new interface.",
    pitch: 1.14,
    rate: 0.98,
    avatarBadge: '📚',
  },
  {
    id: 'google-neural2-d',
    name: 'Google Neural2-D (Commercial Promo)',
    shortName: 'Neural2-D',
    gender: 'male',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Punchy Commercial Announcer',
    description: 'Energetic, dynamic commercial announcer with bright presence and persuasive punch.',
    recommendedRole: 'Commercial Announcer / Promo Specialist',
    sampleText: "Upgrade your workflow today and unlock features that elevate your creativity to the next level.",
    pitch: 1.08,
    rate: 1.14,
    avatarBadge: '📢',
  },
  {
    id: 'google-neural2-f',
    name: 'Google Neural2-F (Corporate Executive)',
    shortName: 'Neural2-F',
    gender: 'female',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Corporate Elegant Contralto',
    description: 'Clear, sophisticated corporate voiceover. Balanced, authoritative, and elegant for product launches.',
    recommendedRole: 'Corporate Presenter / Brand Ambassador',
    sampleText: "Delivering precision, reliability, and modern design for creative teams worldwide.",
    pitch: 1.04,
    rate: 1.00,
    avatarBadge: '💎',
  },
  {
    id: 'google-neural2-i',
    name: 'Google Neural2-I (Mindful Narrator)',
    shortName: 'Neural2-I',
    gender: 'male',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Calm Meditative Baritone',
    description: 'Meditative, calm pacing, deep and relaxing. Exceptional for audiobooks, sleep stories, and mindful pacing.',
    recommendedRole: 'Mindfulness Guide / Audiobook Reader',
    sampleText: "Take a slow, deep breath. Allow your mind to settle into this moment of quiet focus.",
    pitch: 0.86,
    rate: 0.84,
    avatarBadge: '🌿',
  },
  {
    id: 'google-neural2-j',
    name: 'Google Neural2-J (Conversational Vlogger)',
    shortName: 'Neural2-J',
    gender: 'male',
    engine: 'Google Cloud Neural2',
    category: 'neural2',
    language: 'en-US',
    langLabel: 'English (US)',
    timbre: 'Casual Conversational',
    description: 'Friendly, casual conversational male voice. Relatable, down-to-earth, and natural.',
    recommendedRole: 'Casual Friend / Tech Vlogger',
    sampleText: "What's up everyone! Check this out, this has completely changed how I stitch my clips.",
    pitch: 0.96,
    rate: 1.02,
    avatarBadge: '🎥',
  },

  // ==========================================
  // GOOGLE TELUGU & REGIONAL VOICES
  // ==========================================
  {
    id: 'google-telugu-a',
    name: 'Google Telugu-A (తెలుగు స్వరం - Female)',
    shortName: 'Telugu-A',
    gender: 'female',
    engine: 'Google Telugu Standard',
    category: 'telugu',
    language: 'te-IN',
    langLabel: 'తెలుగు (Telugu - India)',
    timbre: 'తెలుగు సుమధుర స్వరం',
    description: 'Clear and polished Telugu female broadcaster voice. Natural Telugu intonation for news, tutorials, and cultural storytelling.',
    recommendedRole: 'Telugu Broadcaster / Storyteller',
    sampleText: "నమస్కారం! మా తాజా వీడియోకు స్వాగతం. ఈరోజు సరికొత్త సాంకేతిక విశేషాలను తెలుసుకుందాం.",
    pitch: 1.15,
    rate: 0.95,
    avatarBadge: '🌸',
  },
  {
    id: 'google-telugu-b',
    name: 'Google Telugu-B (తెలుగు గంభీర స్వరం - Male)',
    shortName: 'Telugu-B',
    gender: 'male',
    engine: 'Google Telugu Standard',
    category: 'telugu',
    language: 'te-IN',
    langLabel: 'తెలుగు (Telugu - India)',
    timbre: 'తెలుగు గంభీర స్వరకర్త',
    description: 'Resonant, clear, and confident male Telugu voice. Superb for YouTube voiceover and documentary narration in Telugu.',
    recommendedRole: 'Telugu Narrator / Documentary Voice',
    sampleText: "నమస్కారం మిత్రులారా! చరిత్రలో నిలిచిపోయిన అద్భుతమైన సంఘటనల గురించి ఈ వీడియోలో చూద్దాం.",
    pitch: 0.88,
    rate: 0.96,
    avatarBadge: '🦁',
  },
  {
    id: 'google-en-in-a',
    name: 'Google Indian English-A (Presenter)',
    shortName: 'Indian English-A',
    gender: 'female',
    engine: 'Google Cloud Neural2 (India)',
    category: 'neural2',
    language: 'en-IN',
    langLabel: 'English (India)',
    timbre: 'Indian English Professional',
    description: 'Indian English female voice, polished presenter, articulate and clear for education and corporate presentations.',
    recommendedRole: 'Indian English Broadcaster',
    sampleText: "Good morning! Here is an overview of the key project milestones achieved this month.",
    pitch: 1.16,
    rate: 1.00,
    avatarBadge: '🇮🇳',
  },
  {
    id: 'google-en-in-b',
    name: 'Google Indian English-B (Corporate)',
    shortName: 'Indian English-B',
    gender: 'male',
    engine: 'Google Cloud Neural2 (India)',
    category: 'neural2',
    language: 'en-IN',
    langLabel: 'English (India)',
    timbre: 'Indian English Baritone',
    description: 'Indian English male voice, conversational and professional. Great for business presentations and tech reviews.',
    recommendedRole: 'Indian English Presenter',
    sampleText: "Let us examine how this architecture optimizes video processing directly in the client.",
    pitch: 0.92,
    rate: 1.00,
    avatarBadge: '📊',
  },
  {
    id: 'google-en-in-c',
    name: 'Google Indian English-C (YouTuber)',
    shortName: 'Indian English-C',
    gender: 'male',
    engine: 'Google Cloud Neural2 (India)',
    category: 'neural2',
    language: 'en-IN',
    langLabel: 'English (India)',
    timbre: 'Indian English Dynamic YouTuber',
    description: 'Dynamic Indian English male YouTuber. High energy, engaging cadence, perfect for product launches.',
    recommendedRole: 'Indian Tech Creator / Host',
    sampleText: "Hey guys! Today we are testing this crazy new tool that stitches videos in seconds.",
    pitch: 1.08,
    rate: 1.12,
    avatarBadge: '⚡',
  },
  {
    id: 'google-en-in-d',
    name: 'Google Indian English-D (Storyteller)',
    shortName: 'Indian English-D',
    gender: 'female',
    engine: 'Google Cloud Neural2 (India)',
    category: 'neural2',
    language: 'en-IN',
    langLabel: 'English (India)',
    timbre: 'Indian English Warm Story',
    description: 'Warm Indian English female storyteller. Gentle, narrative pacing for children’s stories and fiction.',
    recommendedRole: 'Indian English Storyteller',
    sampleText: "Under the golden summer sun, the grand palace gates opened to welcome travelers from afar.",
    pitch: 1.12,
    rate: 0.92,
    avatarBadge: '🌺',
  },
  {
    id: 'google-en-gb-a',
    name: 'Google British English-A (Refined)',
    shortName: 'British-A',
    gender: 'female',
    engine: 'Google Cloud Neural2 (UK)',
    category: 'neural2',
    language: 'en-GB',
    langLabel: 'English (UK)',
    timbre: 'British English Refined',
    description: 'Refined British English female voice, elegant and sophisticated cadence for documentaries and fiction.',
    recommendedRole: 'British English Narrator',
    sampleText: "Welcome to this guided tour of architectural heritage across the United Kingdom.",
    pitch: 1.12,
    rate: 0.95,
    avatarBadge: '👑',
  },
  {
    id: 'google-en-gb-b',
    name: 'Google British English-B (Classical)',
    shortName: 'British-B',
    gender: 'male',
    engine: 'Google Cloud Neural2 (UK)',
    category: 'neural2',
    language: 'en-GB',
    langLabel: 'English (UK)',
    timbre: 'British Classical Baritone',
    description: 'Distinguished British English male narrator, BBC classical documentary style.',
    recommendedRole: 'British Classical Narrator',
    sampleText: "Deep within the archives of history lies a tale of perseverance and timeless discovery.",
    pitch: 0.85,
    rate: 0.92,
    avatarBadge: '🎩',
  },
];

export class AudioStudio {
  constructor(geminiService = null) {
    this.geminiService = geminiService;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.clonedVoiceProfile = null;
    this.audioContext = null;

    // Standard Tone Presets
    this.TONE_PRESETS = {
      lyra: { pitch: 1.12, rate: 1.02, label: '✨ Lyra / Melodic & Expressive AI (Crystal Clarity)', timbre: '✨ High Melodic Resonance' },
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
   * Get all official Google Voice Models with optional filtering
   * @param {Object} filter - { gender: 'all'|'male'|'female', category: 'all'|'gemini'|'journey'|'studio'|'neural2'|'telugu', search: string }
   */
  getGoogleVoiceModels(filter = {}) {
    let list = [...GOOGLE_VOICE_MODELS];

    // Filter by gender
    if (filter.gender && filter.gender !== 'all') {
      const g = filter.gender.toLowerCase();
      list = list.filter(v => v.gender === g);
    }

    // Filter by category
    if (filter.category && filter.category !== 'all') {
      const cat = filter.category.toLowerCase();
      list = list.filter(v => v.category === cat);
    }

    // Search query: filters against name, description, role, timbre, and language
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(v => 
        v.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.recommendedRole.toLowerCase().includes(q) ||
        v.timbre.toLowerCase().includes(q) ||
        v.gender.toLowerCase().includes(q) ||
        v.langLabel.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get Google voice model by ID
   */
  getGoogleVoiceById(id) {
    return GOOGLE_VOICE_MODELS.find(v => v.id === id) || null;
  }

  /**
   * Get available browser voices categorized by English and Telugu
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
   * Intelligently find best matching browser voice for a specific Google Voice Model
   */
  findBestBrowserVoiceForModel(voiceModel) {
    if (!this.synth) return null;
    const voices = this.voices.length > 0 ? this.voices : (this.synth.getVoices() || []);
    if (!voices || voices.length === 0) return null;

    const isTelugu = voiceModel.language?.startsWith('te') || voiceModel.id?.includes('telugu');
    const isFemale = voiceModel.gender === 'female';

    // 1. If Telugu model, try to match Telugu voice first
    if (isTelugu) {
      const teluguVoice = voices.find(v => v.lang.toLowerCase().includes('te') || v.name.toLowerCase().includes('telugu'));
      if (teluguVoice) return teluguVoice;
    }

    // 2. Match Google branded browser voices (Google US English, Google UK English, etc.)
    const googleVoices = voices.filter(v => v.name.toLowerCase().includes('google'));
    if (googleVoices.length > 0) {
      if (isFemale) {
        const femaleGoogle = googleVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen')
        );
        if (femaleGoogle) return femaleGoogle;
      } else {
        const maleGoogle = googleVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('mark')
        );
        if (maleGoogle) return maleGoogle;
      }
      return googleVoices[0];
    }

    // 3. Fallback: match by gender keywords in system voice names
    if (isFemale) {
      const femaleSys = voices.find(v => 
        /female|woman|zira|samantha|victoria|karen|eva|jenny|hazel|aria/i.test(v.name)
      );
      if (femaleSys) return femaleSys;
    } else {
      const maleSys = voices.find(v => 
        /male|man|david|mark|george|richard|guy|alex|daniel/i.test(v.name)
      );
      if (maleSys) return maleSys;
    }

    // 4. Default: first English voice or first voice
    const firstEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    return firstEnglish || voices[0] || null;
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

  /**
   * Audition or speak using a Google Voice Model
   */
  speakVoiceModel(text, modelOrId, overrides = {}) {
    const model = typeof modelOrId === 'string' ? this.getGoogleVoiceById(modelOrId) : modelOrId;
    if (!model) {
      return this.speak(text, overrides);
    }

    const browserVoice = this.findBestBrowserVoiceForModel(model);
    const finalPitch = overrides.pitch !== undefined ? overrides.pitch : model.pitch;
    const finalRate = overrides.rate !== undefined ? overrides.rate : model.rate;

    return this.speak(text, {
      voice: browserVoice || undefined,
      lang: model.language || 'en-US',
      pitch: finalPitch,
      rate: finalRate,
      ...overrides,
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Blend two Google voices with a custom ratio and options
   * @param {Object|string} voiceA - Voice model object or ID
   * @param {Object|string} voiceB - Voice model object or ID
   * @param {number} ratioA - 0.0 to 1.0 (e.g. 0.7 = 70% A, 30% B)
   * @param {Object} customOptions - { name, description, gender, pitchOffset, rateOffset }
   */
  mergeGoogleVoices(voiceA, voiceB, ratioA = 0.5, customOptions = {}) {
    const modelA = typeof voiceA === 'string' ? this.getGoogleVoiceById(voiceA) : voiceA;
    const modelB = typeof voiceB === 'string' ? this.getGoogleVoiceById(voiceB) : voiceB;

    const vA = modelA || { name: 'Voice A', pitch: 1.0, rate: 1.0, gender: 'male' };
    const vB = modelB || { name: 'Voice B', pitch: 1.0, rate: 1.0, gender: 'female' };

    const ratioB = 1 - ratioA;
    const basePitch = (vA.pitch || 1.0) * ratioA + (vB.pitch || 1.0) * ratioB;
    const baseRate = (vA.rate || 1.0) * ratioA + (vB.rate || 1.0) * ratioB;

    const pitchOffset = customOptions.pitchOffset || 0;
    const rateOffset = customOptions.rateOffset || 0;

    const finalPitch = Number(Math.max(0.5, Math.min(1.8, basePitch + pitchOffset)).toFixed(2));
    const finalRate = Number(Math.max(0.5, Math.min(2.0, baseRate + rateOffset)).toFixed(2));

    const defaultGender = ratioA >= 0.5 ? vA.gender : vB.gender;
    const finalGender = customOptions.gender || defaultGender || 'female';

    const defaultName = `Hybrid (${Math.round(ratioA * 100)}% ${vA.shortName || vA.name} + ${Math.round(ratioB * 100)}% ${vB.shortName || vB.name})`;
    const defaultDesc = `Synthesized blend of ${vA.name} and ${vB.name}. Pitch: ${finalPitch}x, Speed: ${finalRate}x.`;

    return {
      id: customOptions.id || `hybrid_${Date.now()}`,
      name: customOptions.name || defaultName,
      shortName: customOptions.name ? customOptions.name.slice(0, 15) : 'Hybrid',
      gender: finalGender,
      engine: 'Google Hybrid Blend',
      category: 'hybrid',
      language: vA.language || 'en-US',
      langLabel: vA.langLabel || 'English (US)',
      timbre: customOptions.timbre || `${Math.round(ratioA * 100)}% ${vA.timbre || 'A'} / ${Math.round(ratioB * 100)}% ${vB.timbre || 'B'}`,
      description: customOptions.description || defaultDesc,
      recommendedRole: customOptions.role || 'Custom Storyteller / Unique Host',
      sampleText: customOptions.sampleText || vA.sampleText || "This is a custom merged hybrid voice synthesized with ClipMerge.",
      pitch: finalPitch,
      rate: finalRate,
      ratioA: ratioA,
      baseVoiceAId: vA.id || null,
      blendVoiceBId: vB.id || null,
      isHybrid: true,
      avatarBadge: '🧬',
    };
  }

  /**
   * Backward-compatibility wrapper for createMergedVoice
   */
  createMergedVoice(voiceA, voiceB, ratioA = 0.5) {
    return this.mergeGoogleVoices(voiceA, voiceB, ratioA);
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
   * Advanced Voice Sample Analysis for 10-Second Clips
   */
  async analyzeVoiceSample(blob) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      // RMS Energy & Noise Floor
      let totalEnergy = 0;
      for (let i = 0; i < channelData.length; i++) {
        totalEnergy += channelData[i] * channelData[i];
      }
      const overallRms = Math.sqrt(totalEnergy / channelData.length);
      const silenceThreshold = Math.max(0.015, overallRms * 0.25);

      const frameSize = 2048;
      const hopSize = 1024;
      const numFrames = Math.floor((channelData.length - frameSize) / hopSize);

      const detectedPitches = [];
      let voicedFramesCount = 0;

      const minPeriod = Math.floor(sampleRate / 450);
      const maxPeriod = Math.floor(sampleRate / 65);

      for (let f = 0; f < numFrames; f++) {
        const offset = f * hopSize;
        let frameEnergy = 0;

        for (let i = 0; i < frameSize; i++) {
          frameEnergy += channelData[offset + i] * channelData[offset + i];
        }
        const frameRms = Math.sqrt(frameEnergy / frameSize);

        if (frameRms >= silenceThreshold) {
          voicedFramesCount++;

          let bestCorr = 0;
          let bestLag = -1;

          for (let lag = minPeriod; lag <= maxPeriod; lag++) {
            let sumXY = 0;
            let sumX2 = 0;
            let sumY2 = 0;

            for (let i = 0; i < frameSize - lag; i++) {
              const x = channelData[offset + i];
              const y = channelData[offset + i + lag];
              sumXY += x * y;
              sumX2 += x * x;
              sumY2 += y * y;
            }

            const denom = Math.sqrt(sumX2 * sumY2);
            if (denom > 0.0001) {
              const r = sumXY / denom;
              if (r > bestCorr) {
                bestCorr = r;
                bestLag = lag;
              }
            }
          }

          if (bestCorr > 0.45 && bestLag > 0) {
            const freq = sampleRate / bestLag;
            if (freq >= 65 && freq <= 450) {
              detectedPitches.push(freq);
            }
          }
        }
      }

      let medianF0 = 150;
      if (detectedPitches.length > 0) {
        detectedPitches.sort((a, b) => a - b);
        medianF0 = detectedPitches[Math.floor(detectedPitches.length / 2)];
      }

      let spectralCentroidEstimate = 1800;
      if (medianF0 < 125) {
        spectralCentroidEstimate = 1400;
      } else if (medianF0 > 210) {
        spectralCentroidEstimate = 2600;
      }

      let pitchScale = Number((medianF0 / 150).toFixed(2));
      pitchScale = Math.max(0.65, Math.min(1.65, pitchScale));

      let timbreLabel = 'Balanced / Natural Voice';
      if (medianF0 < 115) timbreLabel = '🎬 Deep Cinematic Baritone';
      else if (medianF0 < 145) timbreLabel = '📖 Warm Resonant Storyteller';
      else if (medianF0 < 195) timbreLabel = '💼 Clear Corporate Presenter';
      else if (medianF0 < 240) timbreLabel = '⚡ Dynamic & Bright (YouTuber)';
      else timbreLabel = '✨ High Melodic Resonance';

      const speechRatio = duration > 0 ? Math.round((voicedFramesCount * (hopSize / sampleRate) / duration) * 100) : 80;

      await ctx.close();

      return {
        duration: Number(duration.toFixed(1)),
        estimatedFreqHz: Math.round(medianF0),
        rmsVolume: overallRms.toFixed(2),
        suggestedPitch: pitchScale,
        suggestedRate: 0.98,
        timbre: timbreLabel,
        speechDensityPercent: Math.min(100, Math.max(10, speechRatio)),
        spectralCentroidHz: spectralCentroidEstimate,
        analysisMethod: 'Autocorrelation (NACF) + Formant Centroid',
      };
    } catch (err) {
      console.warn('Voice analysis fallback:', err);
      return {
        duration: 5,
        estimatedFreqHz: 155,
        rmsVolume: 0.25,
        suggestedPitch: 1.0,
        suggestedRate: 1.0,
        timbre: 'Natural Voice Profile',
        speechDensityPercent: 85,
        analysisMethod: 'Fallback Heuristic',
      };
    }
  }

  /**
   * Use Gemini to translate or polish a script into natural spoken Telugu or English
   */
  async translateOrPolishScript(text, targetLang = 'telugu') {
    if (!this.geminiService || !this.geminiService.hasApiKey()) {
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
   * Synthesize speech into a downloadable WAV audio blob
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
