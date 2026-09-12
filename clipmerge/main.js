/**
 * ClipMerge - Application State & UI Controller
 */

import { FFmpegHandler } from './ffmpeg-handler.js';
import { GeminiService } from './gemini-service.js';
import { FirebaseService } from './firebase-service.js';
import { WorkspaceService } from './workspace-service.js';
import { ImageEnhancer } from './image-enhancer.js';
import { AudioStudio, GOOGLE_VOICE_MODELS } from './audio-studio.js';
import { SQLiteService } from './sqlite-service.js';
import { AudioDSP } from './audio-dsp.js';
import { VideoEditorStation } from './video-editor-station.js';

// Initialize Services
const ffmpegHandler = new FFmpegHandler();
const geminiService = new GeminiService();
const firebaseService = new FirebaseService();
const workspaceService = new WorkspaceService();
const audioStudio = new AudioStudio(geminiService);
const sqliteService = new SQLiteService();
const audioDSP = new AudioDSP();
const videoEditorStation = new VideoEditorStation({ ffmpegHandler, audioDSP });

// Application State
const state = {
  clips: [], // Array of { id, file, probe, thumbUrl }
  compatibility: null,
  isProcessing: false,
  mergedResult: null,
  originalMergedResult: null,
  upscaledMergedResult: null,
  currentPreviewMode: 'original',
  generatedAudioBlob: null,
  generatedAudioUrl: null,
  aiAlignment: null,
  aiMetadata: null,
  currentUser: null,
  googleAccessToken: null,
  currentProjectId: null,
  currentProjectName: 'Untitled Cut',
  characters: [],
  customVoices: [],
};

// DOM Elements: Core App States & Views
const stateEmpty = document.getElementById('stateEmpty');
const stateLoaded = document.getElementById('stateLoaded');
const stateProcessing = document.getElementById('stateProcessing');
const stateDone = document.getElementById('stateDone');

// Top-Level Navigation Tabs & Views
const tabStitchEdit = document.getElementById('tabStitchEdit');
const tabVideoEnhance = document.getElementById('tabVideoEnhance');
const tabImageEnhance = document.getElementById('tabImageEnhance');
const tabAudioStudio = document.getElementById('tabAudioStudio');
const tabVideoEditor = document.getElementById('tabVideoEditor');
const viewStitchEdit = document.getElementById('viewStitchEdit');
const viewVideoEnhance = document.getElementById('viewVideoEnhance');
const viewImageEnhance = document.getElementById('viewImageEnhance');
const viewAudioStudio = document.getElementById('viewAudioStudio');
const viewVideoEditor = document.getElementById('viewVideoEditor');

// Header & Authentication
const btnGoogleAuth = document.getElementById('btnGoogleAuth');
const googleAuthText = document.getElementById('googleAuthText');
const btnOpenSettings = document.getElementById('btnOpenSettings');

// Embedded AI Script & Shot Director
const scriptText = document.getElementById('scriptText');
const btnTplProduct = document.getElementById('btnTplProduct');
const btnTplTutorial = document.getElementById('btnTplTutorial');
const btnTplStory = document.getElementById('btnTplStory');
const btnAlignScript = document.getElementById('btnAlignScript');
const geminiKeyInline = document.getElementById('geminiKeyInline');
const btnSaveGeminiKeyInline = document.getElementById('btnSaveGeminiKeyInline');
const geminiInlineStatus = document.getElementById('geminiInlineStatus');
const autoAlignStatus = document.getElementById('autoAlignStatus');

// Storyboard Timeline
const storyboardDrawer = document.getElementById('storyboardDrawer');
const storyboardStatusBadge = document.getElementById('storyboardStatusBadge');
const storyboardRationale = document.getElementById('storyboardRationale');
const storyboardGrid = document.getElementById('storyboardGrid');

// Core Inputs & Summary
const dropzoneArea = document.getElementById('dropzoneArea');
const fileInput = document.getElementById('fileInput');
const clipsListContainer = document.getElementById('clipsListContainer');

const statClipCount = document.getElementById('statClipCount');
const statTotalSize = document.getElementById('statTotalSize');
const statTotalDuration = document.getElementById('statTotalDuration');

const sortBannerMsg = document.getElementById('sortBannerMsg');
const sortBadge = document.getElementById('sortBadge');
const memoryWarningBanner = document.getElementById('memoryWarningBanner');

const listCountLabel = document.getElementById('listCountLabel');
const btnSortAsc = document.getElementById('btnSortAsc');
const btnSortDesc = document.getElementById('btnSortDesc');
const btnShuffle = document.getElementById('btnShuffle');
const btnToggleCompact = document.getElementById('btnToggleCompact');

const compatCard = document.getElementById('compatCard');
const compatTitle = document.getElementById('compatTitle');
const compatDesc = document.getElementById('compatDesc');

const btnAddMore = document.getElementById('btnAddMore');
const btnClearAll = document.getElementById('btnClearAll');
const btnMerge = document.getElementById('btnMerge');

// Processing Stepper & Progress
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const stageTitle = document.getElementById('stageTitle');
const stageDetail = document.getElementById('stageDetail');
const progressFill = document.getElementById('progressFill');
const progressActionText = document.getElementById('progressActionText');
const progressPercentText = document.getElementById('progressPercentText');

const logDrawerHeader = document.getElementById('logDrawerHeader');
const logTerminal = document.getElementById('logTerminal');
const logToggleIcon = document.getElementById('logToggleIcon');

// Done State: Results & Workspace Actions
const doneVideoTitle = document.getElementById('doneVideoTitle');
const outputVideoPlayer = document.getElementById('outputVideoPlayer');
const resFileSize = document.getElementById('resFileSize');
const resDuration = document.getElementById('resDuration');
const resMethod = document.getElementById('resMethod');
const downloadBtn = document.getElementById('downloadBtn');
const btnStartOver = document.getElementById('btnStartOver');

const btnOpenCalendarModal = document.getElementById('btnOpenCalendarModal');
const btnOpenGmailModal = document.getElementById('btnOpenGmailModal');
const btnSaveFirebase = document.getElementById('btnSaveFirebase');

const aiChaptersCard = document.getElementById('aiChaptersCard');
const chaptersList = document.getElementById('chaptersList');
const btnDownloadVtt = document.getElementById('btnDownloadVtt');

// Comparison Bar & Inspection Elements
const comparisonControlBar = document.getElementById('comparisonControlBar');
const playerActiveLabel = document.getElementById('playerActiveLabel');
const comparisonHint = document.getElementById('comparisonHint');
const btnViewOriginal = document.getElementById('btnViewOriginal');
const btnViewUpscaled = document.getElementById('btnViewUpscaled');

const upscaledPreviewBox = document.getElementById('upscaledPreviewBox');
const upscaledResTag = document.getElementById('upscaledResTag');
const upscaledSizeLabel = document.getElementById('upscaledSizeLabel');
const btnPreviewUpscaledPlayer = document.getElementById('btnPreviewUpscaledPlayer');
const btnToggleCompareMode = document.getElementById('btnToggleCompareMode');
const btnDownloadUpscaledDirect = document.getElementById('btnDownloadUpscaledDirect');

// Audio Studio DOM Elements
const audioScriptInput = document.getElementById('audioScriptInput');
const btnImportScriptFromEditor = document.getElementById('btnImportScriptFromEditor');
const audioScriptCharCount = document.getElementById('audioScriptCharCount');
const audioScriptEstTime = document.getElementById('audioScriptEstTime');
const audioLangSelect = document.getElementById('audioLangSelect');
const btnTranslateTelugu = document.getElementById('btnTranslateTelugu');
const btnPolishEnglishScript = document.getElementById('btnPolishEnglishScript');
const audioScriptAiStatus = document.getElementById('audioScriptAiStatus');

const audioVoiceSelect = document.getElementById('audioVoiceSelect');
const audioPitchSlider = document.getElementById('audioPitchSlider');
const audioRateSlider = document.getElementById('audioRateSlider');
const labelAudioPitch = document.getElementById('labelAudioPitch');
const labelAudioRate = document.getElementById('labelAudioRate');
const btnAuditionVoice = document.getElementById('btnAuditionVoice');
const btnStopAudition = document.getElementById('btnStopAudition');

const btnTabVoiceClone = document.getElementById('btnTabVoiceClone');
const btnTabVoiceMerger = document.getElementById('btnTabVoiceMerger');
const btnTabF5TTS = document.getElementById('btnTabF5TTS');
const panelVoiceClone = document.getElementById('panelVoiceClone');
const panelVoiceMerger = document.getElementById('panelVoiceMerger');
const panelF5TTS = document.getElementById('panelF5TTS');
const btnImportF5TTSWav = document.getElementById('btnImportF5TTSWav');
const f5ttsAudioFileInput = document.getElementById('f5ttsAudioFileInput');
const f5ttsImportStatus = document.getElementById('f5ttsImportStatus');
const btnQuickImportExternalAudio = document.getElementById('btnQuickImportExternalAudio');
const quickImportAudioInput = document.getElementById('quickImportAudioInput');

const cloneRecorderBox = document.getElementById('cloneRecorderBox');
const btnToggleMicRecord = document.getElementById('btnToggleMicRecord');
const micRecordBtnLabel = document.getElementById('micRecordBtnLabel');
const micTimerLabel = document.getElementById('micTimerLabel');
const audioCloneFileInput = document.getElementById('audioCloneFileInput');
const btnUploadCloneAudio = document.getElementById('btnUploadCloneAudio');
const cloneResultCard = document.getElementById('cloneResultCard');
const cloneFreqHz = document.getElementById('cloneFreqHz');
const cloneTimbre = document.getElementById('cloneTimbre');
const clonePitchVal = document.getElementById('clonePitchVal');
const btnApplyClonedVoice = document.getElementById('btnApplyClonedVoice');

const mergeVoiceA = document.getElementById('mergeVoiceA');
const mergeVoiceB = document.getElementById('mergeVoiceB');
const mergeRatioSlider = document.getElementById('mergeRatioSlider');
const labelMergeRatio = document.getElementById('labelMergeRatio');
const btnSynthesizeMergedVoice = document.getElementById('btnSynthesizeMergedVoice');
const mergeVoiceStatus = document.getElementById('mergeVoiceStatus');

const btnSynthesizeFullAudio = document.getElementById('btnSynthesizeFullAudio');
const audioStudioPlayer = document.getElementById('audioStudioPlayer');
const audioPlayerStatus = document.getElementById('audioPlayerStatus');
const btnDownloadAudioTrack = document.getElementById('btnDownloadAudioTrack');
const btnAttachToMergedVideo = document.getElementById('btnAttachToMergedVideo');
const audioAttachResultStatus = document.getElementById('audioAttachResultStatus');

// Audio Studio Sub-Navigation Tabs & Panels
const btnSubTabNarration = document.getElementById('btnSubTabNarration');
const btnSubTabCharacters = document.getElementById('btnSubTabCharacters');
const btnSubTabMerger = document.getElementById('btnSubTabMerger');
const btnSubTabLibrary = document.getElementById('btnSubTabLibrary');
const subViewNarration = document.getElementById('subViewNarration');
const subViewCharacters = document.getElementById('subViewCharacters');
const subViewMerger = document.getElementById('subViewMerger');
const subViewLibrary = document.getElementById('subViewLibrary');
const characterCountBadge = document.getElementById('characterCountBadge');
const totalVoiceCountBadge = document.getElementById('totalVoiceCountBadge');
const btnQuickBrowseLibrary = document.getElementById('btnQuickBrowseLibrary');

// Character Cast & Voice Studio Elements
const charFilterAll = document.getElementById('charFilterAll');
const charFilterMale = document.getElementById('charFilterMale');
const charFilterFemale = document.getElementById('charFilterFemale');
const charSearchInput = document.getElementById('charSearchInput');
const btnOpenAddCharacterModal = document.getElementById('btnOpenAddCharacterModal');
const charactersGrid = document.getElementById('charactersGrid');

const characterModal = document.getElementById('characterModal');
const modalCharacterTitle = document.getElementById('modalCharacterTitle');
const btnCloseCharModal = document.getElementById('btnCloseCharModal');
const btnCancelCharModal = document.getElementById('btnCancelCharModal');
const btnSaveCharacter = document.getElementById('btnSaveCharacter');
const charEditId = document.getElementById('charEditId');
const charNameInput = document.getElementById('charNameInput');
const charRoleInput = document.getElementById('charRoleInput');
const charGenderMale = document.getElementById('charGenderMale');
const charGenderFemale = document.getElementById('charGenderFemale');
const charVoiceSelect = document.getElementById('charVoiceSelect');
const btnAuditionSelectedCharVoice = document.getElementById('btnAuditionSelectedCharVoice');
const labelCharPitch = document.getElementById('labelCharPitch');
const charPitchSlider = document.getElementById('charPitchSlider');
const labelCharRate = document.getElementById('labelCharRate');
const charRateSlider = document.getElementById('charRateSlider');
const charScriptInput = document.getElementById('charScriptInput');
const charAvatarPreview = document.getElementById('charAvatarPreview');
const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
const charAvatarImg = document.getElementById('charAvatarImg');
const btnTabAvatarPresets = document.getElementById('btnTabAvatarPresets');
const btnTabAvatarUpload = document.getElementById('btnTabAvatarUpload');
const presetAvatarsGrid = document.getElementById('presetAvatarsGrid');
const avatarUploadContainer = document.getElementById('avatarUploadContainer');
const charAvatarFileInput = document.getElementById('charAvatarFileInput');
const btnTriggerAvatarUpload = document.getElementById('btnTriggerAvatarUpload');
const charAvatarUrlInput = document.getElementById('charAvatarUrlInput');

// Google Voice Merger Studio Elements
const selectMergerVoiceA = document.getElementById('selectMergerVoiceA');
const selectMergerVoiceB = document.getElementById('selectMergerVoiceB');
const btnAuditionVoiceA = document.getElementById('btnAuditionVoiceA');
const btnAuditionVoiceB = document.getElementById('btnAuditionVoiceB');
const btnAuditionHybridVoice = document.getElementById('btnAuditionHybridVoice');
const mergerRatioSlider = document.getElementById('mergerRatioSlider');
const labelMergerRatioVal = document.getElementById('labelMergerRatioVal');
const visualRatioA = document.getElementById('visualRatioA');
const visualRatioB = document.getElementById('visualRatioB');
const blendMeterFill = document.getElementById('blendMeterFill');
const mergerPitchSlider = document.getElementById('mergerPitchSlider');
const labelMergerPitch = document.getElementById('labelMergerPitch');
const mergerRateSlider = document.getElementById('mergerRateSlider');
const labelMergerRate = document.getElementById('labelMergerRate');
const inputMergedVoiceName = document.getElementById('inputMergedVoiceName');
const selectMergedVoiceGender = document.getElementById('selectMergedVoiceGender');
const inputMergedVoiceDesc = document.getElementById('inputMergedVoiceDesc');
const btnSaveHybridVoiceToLibrary = document.getElementById('btnSaveHybridVoiceToLibrary');
const mergerSaveStatus = document.getElementById('mergerSaveStatus');
const bubbleAName = document.getElementById('bubbleAName');
const bubbleADesc = document.getElementById('bubbleADesc');
const bubbleBName = document.getElementById('bubbleBName');
const bubbleBDesc = document.getElementById('bubbleBDesc');

// Searchable Google Voice Library Explorer Elements
const libFilterAll = document.getElementById('libFilterAll');
const libFilterMale = document.getElementById('libFilterMale');
const libFilterFemale = document.getElementById('libFilterFemale');
const countLibAll = document.getElementById('countLibAll');
const countLibMale = document.getElementById('countLibMale');
const countLibFemale = document.getElementById('countLibFemale');
const libCategorySelect = document.getElementById('libCategorySelect');
const libSearchInput = document.getElementById('libSearchInput');
const voiceLibraryGrid = document.getElementById('voiceLibraryGrid');

// Google Workspace Hub Modal Elements
const workspaceModal = document.getElementById('workspaceModal');
const btnCloseWorkspaceModal = document.getElementById('btnCloseWorkspaceModal');
const btnCloseWorkspaceFooter = document.getElementById('btnCloseWorkspaceFooter');
const workspaceAccountEmail = document.getElementById('workspaceAccountEmail');
const workspaceAuthBadge = document.getElementById('workspaceAuthBadge');
const workspaceAccountDesc = document.getElementById('workspaceAccountDesc');
const btnWorkspaceSignIn = document.getElementById('btnWorkspaceSignIn');
const btnWorkspaceSignOut = document.getElementById('btnWorkspaceSignOut');
const btnHubOpenCalendar = document.getElementById('btnHubOpenCalendar');
const btnHubOpenGmail = document.getElementById('btnHubOpenGmail');

// Modals: Calendar, Gmail, Settings
const calendarModal = document.getElementById('calendarModal');
const btnCloseCalModal = document.getElementById('btnCloseCalModal');
const btnCancelCal = document.getElementById('btnCancelCal');
const btnConfirmCal = document.getElementById('btnConfirmCal');
const calEventTitle = document.getElementById('calEventTitle');
const calEventDate = document.getElementById('calEventDate');
const calEventDesc = document.getElementById('calEventDesc');

const gmailModal = document.getElementById('gmailModal');
const btnCloseGmailModal = document.getElementById('btnCloseGmailModal');
const btnCancelGmail = document.getElementById('btnCancelGmail');
const btnConfirmGmail = document.getElementById('btnConfirmGmail');
const gmailRecipient = document.getElementById('gmailRecipient');
const gmailSubject = document.getElementById('gmailSubject');
const gmailBody = document.getElementById('gmailBody');

const settingsModal = document.getElementById('settingsModal');
const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
const btnCancelSettings = document.getElementById('btnCancelSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
const firebaseConfigInput = document.getElementById('firebaseConfigInput');

// SQLite Backend & Projects Modal Elements
const sqliteStatusBadge = document.getElementById('sqliteStatusBadge');
const sqliteStatusText = document.getElementById('sqliteStatusText');
const btnOpenProjectsModal = document.getElementById('btnOpenProjectsModal');
const btnQuickSaveProject = document.getElementById('btnQuickSaveProject');
const projectsModal = document.getElementById('projectsModal');
const btnCloseProjectsModal = document.getElementById('btnCloseProjectsModal');
const btnCloseProjectsModalFooter = document.getElementById('btnCloseProjectsModalFooter');
const btnTabListProjects = document.getElementById('btnTabListProjects');
const btnTabListRenders = document.getElementById('btnTabListRenders');
const btnTabSaveCurrentProject = document.getElementById('btnTabSaveCurrentProject');
const panelListProjects = document.getElementById('panelListProjects');
const panelListRenders = document.getElementById('panelListRenders');
const panelSaveCurrentProject = document.getElementById('panelSaveCurrentProject');
const projectsListContainer = document.getElementById('projectsListContainer');
const rendersListContainer = document.getElementById('rendersListContainer');
const projectCountBadge = document.getElementById('projectCountBadge');
const renderCountBadge = document.getElementById('renderCountBadge');
const inputSaveProjectName = document.getElementById('inputSaveProjectName');
const inputSaveProjectDesc = document.getElementById('inputSaveProjectDesc');
const btnConfirmSaveProject = document.getElementById('btnConfirmSaveProject');
const saveProjectStatusMsg = document.getElementById('saveProjectStatusMsg');

// Video Resolution & Enhancement Panel
const selectOutputResolution = document.getElementById('selectOutputResolution');
const selectAspectMode = document.getElementById('selectAspectMode');
const chkEnhanceVideo = document.getElementById('chkEnhanceVideo');
const badgeEnhanceStatus = document.getElementById('badgeEnhanceStatus');

// Image & Poster Enhancement Elements
const btnOpenImageEnhancer = document.getElementById('btnOpenImageEnhancer');
const imageEnhanceModal = document.getElementById('imageEnhanceModal');
const btnCloseImageEnhanceModal = document.getElementById('btnCloseImageEnhanceModal');
const btnCancelImageEnhance = document.getElementById('btnCancelImageEnhance');
const btnTabCurrentFrame = document.getElementById('btnTabCurrentFrame');
const btnTabUploadImage = document.getElementById('btnTabUploadImage');
const imageUploadDropzone = document.getElementById('imageUploadDropzone');
const imageFileInput = document.getElementById('imageFileInput');
const imageFileName = document.getElementById('imageFileName');
const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');
const imageEnhanceCanvas = document.getElementById('imageEnhanceCanvas');
const imagePreviewPlaceholder = document.getElementById('imagePreviewPlaceholder');
const selectImageResolution = document.getElementById('selectImageResolution');
const selectImageAspectMode = document.getElementById('selectImageAspectMode');
const chkImageSharpen = document.getElementById('chkImageSharpen');
const btnDownloadEnhancedImage = document.getElementById('btnDownloadEnhancedImage');

// Post-Merge Enhancement Studio Elements
const selectPostMergeRes = document.getElementById('selectPostMergeRes');
const btnPostMergeUpscale = document.getElementById('btnPostMergeUpscale');
const postMergeVideoStatus = document.getElementById('postMergeVideoStatus');
const selectPostMergePosterRes = document.getElementById('selectPostMergePosterRes');
const btnPostMergePoster = document.getElementById('btnPostMergePoster');
const postMergePosterStatus = document.getElementById('postMergePosterStatus');

// Standalone Video Enhancer Elements
const videoEnhanceDropzone = document.getElementById('videoEnhanceDropzone');
const videoEnhanceFileInput = document.getElementById('videoEnhanceFileInput');
const videoEnhanceSelectedName = document.getElementById('videoEnhanceSelectedName');
const selectStandaloneVideoRes = document.getElementById('selectStandaloneVideoRes');
const selectStandaloneVideoAspect = document.getElementById('selectStandaloneVideoAspect');
const chkStandaloneVideoSharpen = document.getElementById('chkStandaloneVideoSharpen');
const btnRunStandaloneVideoEnhance = document.getElementById('btnRunStandaloneVideoEnhance');
const standaloneVideoProgress = document.getElementById('standaloneVideoProgress');
const standaloneVideoProgressFill = document.getElementById('standaloneVideoProgressFill');
const standaloneVideoStatusText = document.getElementById('standaloneVideoStatusText');
const standaloneVideoResultWrapper = document.getElementById('standaloneVideoResultWrapper');
const standaloneVideoResultPlayer = document.getElementById('standaloneVideoResultPlayer');
const btnDownloadStandaloneVideo = document.getElementById('btnDownloadStandaloneVideo');

// Standalone Image Enhancer Elements
const standaloneImageDropzone = document.getElementById('standaloneImageDropzone');
const standaloneImageFileInput = document.getElementById('standaloneImageFileInput');
const standaloneImageFileName = document.getElementById('standaloneImageFileName');
const standaloneImagePreviewWrapper = document.getElementById('standaloneImagePreviewWrapper');
const standaloneImageCanvas = document.getElementById('standaloneImageCanvas');
const standaloneImagePlaceholder = document.getElementById('standaloneImagePlaceholder');
const selectStandaloneImageRes = document.getElementById('selectStandaloneImageRes');
const selectStandaloneImageAspect = document.getElementById('selectStandaloneImageAspect');
const chkStandaloneImageSharpen = document.getElementById('chkStandaloneImageSharpen');
const btnDownloadStandaloneImage = document.getElementById('btnDownloadStandaloneImage');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format bytes into human readable format (MB/GB)
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const mb = bytes / (1024 * 1024);
  if (mb < 1000) {
    return `${mb.toFixed(1)} MB`;
  }
  return `${(mb / 1024).toFixed(2)} GB`;
}

/**
 * Format seconds into mm:ss
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Switch active UI state
 */
function setActiveState(stateName) {
  [stateEmpty, stateLoaded, stateProcessing, stateDone].forEach(el => el.classList.remove('active'));
  if (stateName === 'empty') stateEmpty.classList.add('active');
  if (stateName === 'loaded') stateLoaded.classList.add('active');
  if (stateName === 'processing') stateProcessing.classList.add('active');
  if (stateName === 'done') stateDone.classList.add('active');
}

/**
 * Single-pass safe probe and thumbnail generation to prevent upload hangs/freezes
 * Resolves within 1.2s max with fallback metadata and placeholder thumbnail.
 */
async function safeProbeAndThumbnail(file) {
  return new Promise((resolve) => {
    let resolved = false;
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.onerror = null;
    };

    // Default SVG placeholder thumbnail
    const fallbackThumb = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="0 0 160 90"><rect width="160" height="90" fill="%23121826"/><polygon points="65,30 105,45 65,60" fill="%236366f1"/></svg>`;

    const fallbackTimeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({
        probe: { width: 1280, height: 720, duration: 5, fps: 30, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' },
        thumbUrl: fallbackThumb,
      });
    }, 1200);

    const finishWithThumbnail = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimeout);
      let thumb = fallbackThumb;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 160, 90);
        thumb = canvas.toDataURL('image/jpeg', 0.7);
      } catch (_) {}
      cleanup();
      resolve({
        probe: {
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720,
          duration: (isFinite(video.duration) && video.duration > 0) ? video.duration : 5,
          fps: 30,
          videoCodec: file.name.toLowerCase().endsWith('.mp4') ? 'h264' : 'unknown',
          hasAudio: true,
          audioCodec: 'aac'
        },
        thumbUrl: thumb,
      });
    };

    video.onloadedmetadata = () => {
      const dur = (isFinite(video.duration) && video.duration > 0) ? video.duration : 5;
      if (isFinite(dur) && dur > 0.5) {
        video.currentTime = Math.min(0.5, dur / 2);
      } else {
        finishWithThumbnail();
      }
    };

    video.onseeked = finishWithThumbnail;

    video.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimeout);
      cleanup();
      resolve({
        probe: { width: 1280, height: 720, duration: 5, fps: 30, videoCodec: 'unknown', hasAudio: true, audioCodec: 'aac' },
        thumbUrl: fallbackThumb,
      });
    };

    video.src = url;
  });
}

/**
 * Check if filenames follow pattern clipN (e.g. clip1, clip2, clip10)
 * and sort numerically. If not matching, preserves original upload order.
 */
function sortClipsByFilename(clipsArray) {
  const clipPattern = /clip\D*(\d+)/i;
  const allMatchPattern = clipsArray.every(c => clipPattern.test(c.file.name));

  if (allMatchPattern && clipsArray.length > 1) {
    const sorted = [...clipsArray].sort((a, b) => {
      const matchA = a.file.name.match(clipPattern);
      const matchB = b.file.name.match(clipPattern);
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      return numA - numB;
    });
    return { sorted, wasAutoSorted: true };
  }

  return { sorted: clipsArray, wasAutoSorted: false };
}

/**
 * Handle new incoming files (optimized for bulk 20-30+ clips without freezing)
 */
async function handleFilesUpload(filesList) {
  const files = Array.from(filesList).filter(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    return f.type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
  });

  if (files.length === 0) {
    alert('Please select valid video files (.mp4, .mov, .avi, .mkv).');
    return;
  }

  // Switch to loaded state immediately so user sees responsiveness
  setActiveState('loaded');
  if (sortBannerMsg) {
    sortBannerMsg.textContent = `Processing and importing ${files.length} clips...`;
    sortBadge.textContent = 'Importing...';
  }

  const newClipEntries = [];
  const BATCH_SIZE = 8; // Process in chunks of 8 for high throughput

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE);
    if (files.length > 4 && sortBannerMsg) {
      sortBannerMsg.textContent = `Importing clips: ${Math.min(i + BATCH_SIZE, files.length)} of ${files.length}...`;
    }

    const chunkResults = await Promise.all(
      chunk.map(async (file) => {
        const id = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { probe, thumbUrl } = await safeProbeAndThumbnail(file);

        return {
          id,
          file,
          probe,
          thumbUrl,
        };
      })
    );

    newClipEntries.push(...chunkResults);
  }

  // Combine with existing clips
  const combined = [...state.clips, ...newClipEntries];

  // Auto-sort if applicable
  const { sorted, wasAutoSorted } = sortClipsByFilename(combined);
  state.clips = sorted;

  if (wasAutoSorted) {
    sortBannerMsg.textContent = `Clips automatically sorted numerically by filename (${state.clips.length} clips ready)`;
    sortBadge.textContent = 'Auto-Sorted';
    sortBadge.style.display = 'inline-block';
  } else {
    sortBannerMsg.textContent = `${state.clips.length} clips in timeline sequence (drag to reorder anytime)`;
    sortBadge.textContent = 'Custom Order';
  }

  updateClipsUI();
  setActiveState('loaded');
  triggerAutoGeminiAlignment(300);
}

/**
 * Update UI for the clips list, stats, and compatibility
 */
function updateClipsUI() {
  clipsListContainer.innerHTML = '';

  const totalSize = state.clips.reduce((sum, c) => sum + c.file.size, 0);
  const totalDur = state.clips.reduce((sum, c) => sum + (c.probe.duration || 0), 0);

  statClipCount.textContent = state.clips.length;
  statTotalSize.textContent = formatBytes(totalSize);
  statTotalDuration.textContent = formatDuration(totalDur);
  if (listCountLabel) {
    listCountLabel.textContent = state.clips.length;
  }

  // Large file warning (> 500 MB)
  if (totalSize > 500 * 1024 * 1024) {
    memoryWarningBanner.style.display = 'flex';
  } else {
    memoryWarningBanner.style.display = 'none';
  }

  // Render clip cards
  state.clips.forEach((clip, index) => {
    const card = document.createElement('div');
    card.className = 'clip-item';
    card.draggable = true;
    card.dataset.index = index;

    const ext = clip.file.name.split('.').pop().toUpperCase();
    const resolutionText = clip.probe.width && clip.probe.height ? `${clip.probe.width}×${clip.probe.height}` : 'Video';
    const durationText = formatDuration(clip.probe.duration);
    const sizeText = formatBytes(clip.file.size);

    const matchInfo = (state.sceneMatchMap && state.sceneMatchMap[clip.id]) || null;
    let matchShotNum = index + 1;
    let matchTitle = '';
    let matchPrompt = '';

    if (matchInfo) {
      if (typeof matchInfo === 'object') {
        matchShotNum = matchInfo.sceneNumber || (index + 1);
        matchTitle = matchInfo.title || `Shot ${matchShotNum}`;
        matchPrompt = matchInfo.promptText || matchTitle;
      } else {
        matchTitle = String(matchInfo);
        matchPrompt = matchTitle;
        const numMatch = matchTitle.match(/Shot\s*(\d+)/i);
        if (numMatch) matchShotNum = parseInt(numMatch[1], 10);
      }
    }

    const hasPrompt = !!matchPrompt;
    const displayPrompt = hasPrompt
      ? matchPrompt
      : (scriptText && scriptText.value.trim() ? 'Analyzing prompt cue...' : 'Enter shot prompt in left panel to link story.');

    card.innerHTML = `
      <div class="clip-order-col">
        <div class="clip-grip" title="Drag to reorder">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>
        <div class="clip-num-badge">${index + 1}</div>
      </div>

      <div class="clip-thumb-container">
        ${
          clip.thumbUrl
            ? `<img src="${clip.thumbUrl}" alt="${clip.file.name}">`
            : `<div class="clip-thumb-placeholder">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                   <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                   <line x1="7" y1="2" x2="7" y2="22"></line>
                   <line x1="17" y1="2" x2="17" y2="22"></line>
                 </svg>
               </div>`
        }
        <span class="clip-duration-tag">${durationText}</span>
      </div>

      <div class="clip-info">
        <div class="clip-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
          <div class="clip-title" title="${escapeHtml(clip.file.name)}">${escapeHtml(clip.file.name)}</div>
          <div class="clip-meta-tags">
            <span class="meta-pill">${sizeText}</span>
            <span class="meta-pill">${resolutionText}</span>
            <span class="meta-pill">${ext}</span>
          </div>
        </div>

        <!-- Prompt & Shot Assignment Box (Directly beside video clip) -->
        <div class="clip-assigned-prompt-card">
          <div class="clip-prompt-header-row">
            <span class="clip-prompt-shot-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              🎬 Shot ${matchShotNum}
            </span>
            <div class="clip-reassign-wrap">
              <span class="reassign-label">Correct Shot:</span>
              <select class="clip-shot-reassign-select" data-clip-id="${clip.id}" data-current-index="${index}" title="If this shot assignment is wrong, choose the correct shot to re-order instantly">
                <option value="">Move / Swap...</option>
                ${(state.parsedScenes || []).map(sc => `
                  <option value="${sc.sceneNumber}" ${matchShotNum === sc.sceneNumber ? 'selected' : ''}>
                    Shot ${sc.sceneNumber}: ${(sc.title || '').slice(0, 24)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="clip-prompt-text" title="${escapeHtml(displayPrompt)}">
            <strong style="color: #a5b4fc;">Prompt:</strong> ${escapeHtml(displayPrompt)}
          </div>
        </div>
      </div>

      <div class="clip-actions">
        <button class="btn-icon btn-move-up" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.2;"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <button class="btn-icon btn-move-down" title="Move Down" ${index === state.clips.length - 1 ? 'disabled style="opacity:0.2;"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <button class="btn-icon btn-delete" title="Remove clip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Dropdown for non-editor instant correction
    const shotSelect = card.querySelector('.clip-shot-reassign-select');
    if (shotSelect) {
      shotSelect.addEventListener('change', (e) => {
        const targetShotNum = parseInt(e.target.value, 10);
        if (!isNaN(targetShotNum)) {
          reassignClipToShot(clip.id, index, targetShotNum);
        }
      });
    }

    // Button event listeners
    const btnUp = card.querySelector('.btn-move-up');
    const btnDown = card.querySelector('.btn-move-down');
    const btnDel = card.querySelector('.btn-delete');

    btnUp.addEventListener('click', (e) => {
      e.stopPropagation();
      moveClip(index, index - 1);
    });

    btnDown.addEventListener('click', (e) => {
      e.stopPropagation();
      moveClip(index, index + 1);
    });

    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      removeClip(index);
    });

    // Drag and Drop Event Listeners
    setupDragAndDrop(card, index);

    clipsListContainer.appendChild(card);
  });

  // Evaluate Format Compatibility
  state.compatibility = ffmpegHandler.checkCompatibility(state.clips);
  updateCompatibilityUI(state.compatibility);
}

/**
 * Update Compatibility preview card
 */
function updateCompatibilityUI(compatibility) {
  if (!compatibility) return;

  compatCard.className = `compat-card mode-${compatibility.method}`;

  if (compatibility.method === 'copy') {
    compatTitle.textContent = 'Ultra-Fast Stream Copy Concat';
    compatDesc.textContent = `${compatibility.reason}. Merging will execute in seconds without lossy re-encoding!`;
    compatIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else {
    compatTitle.textContent = 'Smart Transcode Concat';
    compatDesc.textContent = `${compatibility.reason}. Clips will be normalized to ${compatibility.targetResolution.width}×${compatibility.targetResolution.height} @ ${compatibility.targetFps}fps for seamless synchronization.`;
    compatIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
    `;
  }
}

/**
 * Move clip up/down in the array
 */
function moveClip(fromIdx, toIdx) {
  if (toIdx < 0 || toIdx >= state.clips.length) return;
  const item = state.clips.splice(fromIdx, 1)[0];
  state.clips.splice(toIdx, 0, item);
  sortBadge.textContent = 'Manual Order';
  sortBannerMsg.textContent = 'Clips arranged in custom manual order';
  updateClipsUI();
}

/**
 * Reassign clip to a specific shot number (instant correction by non-editor)
 */
function reassignClipToShot(clipId, currentIndex, targetShotNum) {
  const targetIndex = Math.max(0, Math.min(state.clips.length - 1, targetShotNum - 1));
  if (currentIndex === targetIndex) return;

  const [clip] = state.clips.splice(currentIndex, 1);
  state.clips.splice(targetIndex, 0, clip);

  if (!state.sceneMatchMap) state.sceneMatchMap = {};
  if (state.parsedScenes) {
    const scene = state.parsedScenes.find(s => s.sceneNumber === targetShotNum);
    if (scene) {
      state.sceneMatchMap[clipId] = {
        sceneNumber: targetShotNum,
        title: scene.title,
        promptText: scene.narration ? `${scene.title} — ${scene.narration}` : scene.title,
        reason: `Manually corrected by user to Shot ${targetShotNum}`
      };
    }
  }

  sortBadge.textContent = 'Corrected by User';
  sortBannerMsg.textContent = `Clip "${clip.file.name}" moved to Shot ${targetShotNum}`;
  updateClipsUI();
}

/**
 * Remove clip by index
 */
function removeClip(index) {
  state.clips.splice(index, 1);
  if (state.clips.length === 0) {
    setActiveState('empty');
  } else {
    updateClipsUI();
  }
}

/**
 * Drag and drop reordering
 */
let draggedIndex = null;

function setupDragAndDrop(card, index) {
  card.addEventListener('dragstart', (e) => {
    draggedIndex = index;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = card.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    card.classList.remove('drag-over-top', 'drag-over-bottom');
    if (e.clientY < midY) {
      card.classList.add('drag-over-top');
    } else {
      card.classList.add('drag-over-bottom');
    }
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over-top', 'drag-over-bottom');
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over-top', 'drag-over-bottom');
    const fromIndex = draggedIndex;
    const toIndex = parseInt(card.dataset.index, 10);
    if (fromIndex !== null && fromIndex !== toIndex) {
      moveClip(fromIndex, toIndex);
    }
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedIndex = null;
  });
}

/**
 * Set up real-time processing listeners
 */
ffmpegHandler.setCallbacks({
  onLog: (entry) => {
    const line = document.createElement('div');
    line.className = `log-line ${entry.type}`;
    line.textContent = `[${entry.timestamp}] ${entry.message}`;
    logTerminal.appendChild(line);
    logTerminal.scrollTop = logTerminal.scrollHeight;
  },

  onProgress: (percent, actionText) => {
    progressFill.style.width = `${percent}%`;
    progressPercentText.textContent = `${percent}%`;
    if (actionText) {
      progressActionText.textContent = actionText;
    }
  },

  onStage: (stageName, detail) => {
    stageTitle.textContent = stageName;
    stageDetail.textContent = detail;

    // Update Stepper
    [step1, step2, step3, step4].forEach(s => s.classList.remove('active', 'completed'));
    if (stageName.includes('Loading')) {
      step1.classList.add('active');
    } else if (stageName.includes('Compatibility')) {
      step1.classList.add('completed');
      step2.classList.add('active');
    } else if (stageName.includes('Merging')) {
      step1.classList.add('completed');
      step2.classList.add('completed');
      step3.classList.add('active');
    } else if (stageName.includes('Done')) {
      step1.classList.add('completed');
      step2.classList.add('completed');
      step3.classList.add('completed');
      step4.classList.add('active');
    }
  },
});

/**
 * Execute Video Merge Flow
 */
async function startMergeProcess() {
  if (state.clips.length === 0 || state.isProcessing) return;

  state.isProcessing = true;
  setActiveState('processing');

  // Reset progress and log
  progressFill.style.width = '0%';
  progressPercentText.textContent = '0%';
  progressActionText.textContent = 'Starting FFmpeg engine...';
  logTerminal.innerHTML = '<div class="log-line">Initializing ClipMerge engine...</div>';

  try {
    const mergeOptions = {
      resolution: selectOutputResolution ? selectOutputResolution.value : 'original',
      aspectMode: selectAspectMode ? selectAspectMode.value : 'pad',
      enhanceVideo: chkEnhanceVideo ? chkEnhanceVideo.checked : false,
    };

    const result = await ffmpegHandler.mergeClips(state.clips, state.compatibility, mergeOptions);
    state.mergedResult = result;
    state.originalMergedResult = result;
    state.upscaledMergedResult = null;
    state.currentPreviewMode = 'original';

    if (comparisonControlBar) comparisonControlBar.style.display = 'none';
    if (upscaledPreviewBox) upscaledPreviewBox.style.display = 'none';

    // Populate Done State
    outputVideoPlayer.src = result.blobUrl;
    resFileSize.textContent = formatBytes(result.sizeBytes);
    resDuration.textContent = formatDuration(result.duration);

    if (result.methodUsed && result.methodUsed.startsWith('upscale')) {
      resMethod.textContent = `${result.targetResolution || '4K/HD'} Upscaled${result.enhanced ? ' ✨' : ''}`;
      resMethod.style.color = 'var(--accent-primary)';
    } else if (result.methodUsed === 'copy') {
      resMethod.textContent = 'Fast Stream Copy';
      resMethod.style.color = 'var(--success)';
    } else {
      resMethod.textContent = `Smart Transcode${result.enhanced ? ' ✨' : ''}`;
      resMethod.style.color = 'var(--accent-primary)';
    }

    downloadBtn.href = result.blobUrl;
    downloadBtn.download = `clipmerge-result.mp4`;

    // Record render event in SQLite database
    sqliteService.logRender({
      project_id: state.currentProjectId || '',
      project_name: state.currentProjectName || 'Merged Cut',
      output_filename: downloadBtn.download || 'clipmerge-result.mp4',
      resolution: mergeOptions.resolution || 'original',
      file_size_bytes: result.sizeBytes || 0,
      duration_seconds: result.duration || 0,
      has_voiceover: !!state.generatedAudioBlob
    }).then(() => updateSQLiteStatusUI()).catch(e => console.warn('SQLite render log error:', e));

    // Generate AI Video Metadata (Title, Chapters, VTT)
    try {
      const script = scriptText.value.trim();
      const metadata = await geminiService.generateVideoMetadata(script, state.clips, result.duration);
      state.aiMetadata = metadata;

      doneVideoTitle.textContent = metadata.title || 'Your Merged Video is Ready';

      // Render Chapters List
      chaptersList.innerHTML = '';
      if (metadata.chapters && metadata.chapters.length > 0) {
        aiChaptersCard.style.display = 'block';
        metadata.chapters.forEach((ch) => {
          const item = document.createElement('div');
          item.className = 'chapter-item';
          item.innerHTML = `
            <span class="chapter-timestamp">${ch.time}</span>
            <span class="chapter-title">${escapeHtml(ch.title)}</span>
          `;
          chaptersList.appendChild(item);
        });
      } else {
        aiChaptersCard.style.display = 'none';
      }

      // Pre-fill Calendar Modal Fields
      calEventTitle.value = `Premiere: ${metadata.title}`;
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(18, 0, 0, 0);
      calEventDate.value = tomorrow.toISOString().slice(0, 16);
      calEventDesc.value = `Video Release: ${metadata.title}\n\nSummary:\n${metadata.description}\n\nTags:\n${(metadata.tags || []).join(', ')}\n\nChapters:\n${(metadata.chapters || []).map(c => `${c.time} - ${c.title}`).join('\n')}`;

      // Pre-fill Gmail Modal Fields
      gmailSubject.value = `Final Merged Video Ready: ${metadata.title}`;
      gmailBody.value = `Hi team,\n\nThe final merged video "${metadata.title}" has been compiled and is ready for review!\n\nVideo Details:\n• Duration: ${formatDuration(result.duration)}\n• File Size: ${formatBytes(result.sizeBytes)}\n• Clips Stitched: ${state.clips.length}\n• Processing Mode: ${result.methodUsed === 'copy' ? 'Lossless Stream Copy' : 'Smart Transcode'}\n\nOverview:\n${metadata.description}\n\nBest regards,\nClipMerge AI Suite`;

    } catch (metaErr) {
      console.warn('Metadata generation warning:', metaErr);
    }

    setActiveState('done');
  } catch (err) {
    alert(`Merge failed: ${err.message}\n\nPlease check the terminal log below for details.`);
    setActiveState('loaded');
  } finally {
    state.isProcessing = false;
  }
}

/**
 * Reset application to empty state
 */
function resetApplication() {
  if (state.mergedResult && state.mergedResult.blobUrl) {
    URL.revokeObjectURL(state.mergedResult.blobUrl);
  }
  ffmpegHandler.cleanupBlobUrls();

  state.clips = [];
  state.compatibility = null;
  state.isProcessing = false;
  state.mergedResult = null;
  state.originalMergedResult = null;
  state.upscaledMergedResult = null;
  state.currentPreviewMode = 'original';
  state.generatedAudioBlob = null;
  state.generatedAudioUrl = null;
  state.aiAlignment = null;
  state.aiMetadata = null;

  if (comparisonControlBar) comparisonControlBar.style.display = 'none';
  if (upscaledPreviewBox) upscaledPreviewBox.style.display = 'none';

  outputVideoPlayer.pause();
  outputVideoPlayer.removeAttribute('src');
  outputVideoPlayer.load();

  fileInput.value = '';
  storyboardDrawer.style.display = 'none';
  storyboardGrid.innerHTML = '';
  chaptersList.innerHTML = '';
  doneVideoTitle.textContent = 'Your Merged Video is Ready';

  setActiveState('empty');
}

// ----------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------

// Dropzone Drag & Drop
dropzoneArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzoneArea.classList.add('dragover');
});

dropzoneArea.addEventListener('dragleave', () => {
  dropzoneArea.classList.remove('dragover');
});

dropzoneArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzoneArea.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFilesUpload(e.dataTransfer.files);
  }
});

dropzoneArea.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    const files = Array.from(e.target.files);
    fileInput.value = ''; // CRITICAL: Reset value so re-selecting same files triggers change event
    handleFilesUpload(files);
  }
});

// Allow dropping files directly onto the clips list container in the timeline
if (clipsListContainer) {
  clipsListContainer.addEventListener('dragover', (e) => {
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      clipsListContainer.classList.add('dragover-active');
    }
  });
  clipsListContainer.addEventListener('dragleave', () => {
    clipsListContainer.classList.remove('dragover-active');
  });
  clipsListContainer.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      clipsListContainer.classList.remove('dragover-active');
      handleFilesUpload(e.dataTransfer.files);
    }
  });
}

// Buttons
btnAddMore.addEventListener('click', () => {
  fileInput.click();
});

btnClearAll.addEventListener('click', () => {
  if (confirm('Are you sure you want to remove all clips?')) {
    resetApplication();
  }
});

btnMerge.addEventListener('click', () => {
  startMergeProcess();
});

btnStartOver.addEventListener('click', () => {
  resetApplication();
});

// Log Drawer Toggle
logDrawerHeader.addEventListener('click', () => {
  const isOpen = logTerminal.classList.toggle('open');
  logToggleIcon.textContent = isOpen ? '▲' : '▼';
});

// List Toolbar Actions (Bulk Sorting & Density)
if (btnSortAsc) {
  btnSortAsc.addEventListener('click', () => {
    const clipPattern = /clip\D*(\d+)/i;
    state.clips.sort((a, b) => {
      const matchA = a.file.name.match(clipPattern);
      const matchB = b.file.name.match(clipPattern);
      if (matchA && matchB) {
        return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
      }
      return a.file.name.localeCompare(b.file.name, undefined, { numeric: true });
    });
    sortBadge.textContent = '1 → N Sorted';
    sortBannerMsg.textContent = 'Clips sorted in numerical ascending order (1 to N)';
    updateClipsUI();
  });
}

if (btnSortDesc) {
  btnSortDesc.addEventListener('click', () => {
    const clipPattern = /clip\D*(\d+)/i;
    state.clips.sort((a, b) => {
      const matchA = a.file.name.match(clipPattern);
      const matchB = b.file.name.match(clipPattern);
      if (matchA && matchB) {
        return parseInt(matchB[1], 10) - parseInt(matchA[1], 10);
      }
      return b.file.name.localeCompare(a.file.name, undefined, { numeric: true });
    });
    sortBadge.textContent = 'N → 1 Reversed';
    sortBannerMsg.textContent = 'Clips sorted in reverse descending order (N to 1)';
    updateClipsUI();
  });
}

if (btnShuffle) {
  btnShuffle.addEventListener('click', () => {
    for (let i = state.clips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.clips[i], state.clips[j]] = [state.clips[j], state.clips[i]];
    }
    sortBadge.textContent = 'Shuffled';
    sortBannerMsg.textContent = 'Clips shuffled in custom random order';
    updateClipsUI();
  });
}

if (btnToggleCompact) {
  btnToggleCompact.addEventListener('click', () => {
    const isCompact = clipsListContainer.classList.toggle('compact');
    btnToggleCompact.textContent = isCompact ? '☰ Normal View' : '☰ Compact View';
  });
}

// Demo Sample Buttons
const btnLoadMatchingDemo = document.getElementById('btnLoadMatchingDemo');
const btnLoad25Demo = document.getElementById('btnLoad25Demo');
const btnLoad30Demo = document.getElementById('btnLoad30Demo');
const btnLoadMismatchDemo = document.getElementById('btnLoadMismatchDemo');

async function loadSampleFiles(filenames) {
  try {
    const files = [];
    for (const name of filenames) {
      const res = await fetch(`./samples/${name}`);
      if (!res.ok) throw new Error(`Could not load sample file ${name} (status ${res.status})`);
      const blob = await res.blob();
      files.push(new File([blob], name, { type: 'video/mp4' }));
    }
    await handleFilesUpload(files);
  } catch (err) {
    alert(`Could not load sample clips: ${err.message}`);
  }
}

if (btnLoadMatchingDemo) {
  btnLoadMatchingDemo.addEventListener('click', () => {
    // Shuffled 3 clips
    loadSampleFiles(['clip2.mp4', 'clip1.mp4', 'clip3.mp4']);
  });
}

if (btnLoad25Demo) {
  btnLoad25Demo.addEventListener('click', () => {
    // Generate 25 clip filenames in deliberately shuffled order to test auto-sort
    const indices = Array.from({ length: 25 }, (_, i) => i + 1);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffledNames = indices.map(i => `clip${i}.mp4`);
    loadSampleFiles(shuffledNames);
  });
}

if (btnLoad30Demo) {
  btnLoad30Demo.addEventListener('click', () => {
    // Generate all 30 clip filenames in shuffled order
    const indices = Array.from({ length: 30 }, (_, i) => i + 1);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffledNames = indices.map(i => `clip${i}.mp4`);
    loadSampleFiles(shuffledNames);
  });
}

if (btnLoadMismatchDemo) {
  btnLoadMismatchDemo.addEventListener('click', () => {
    loadSampleFiles(['clip1.mp4', 'clip_mismatch.mp4']);
  });
}

// ====================================================
// TOP NAVIGATION TABS & APP VIEWS SWITCHER
// ====================================================

function switchAppView(viewId) {
  [tabStitchEdit, tabVideoEnhance, tabImageEnhance, tabAudioStudio, tabVideoEditor].forEach(t => t && t.classList.remove('active'));
  [viewStitchEdit, viewVideoEnhance, viewImageEnhance, viewAudioStudio, viewVideoEditor].forEach(v => v && v.classList.remove('active'));

  if (viewId === 'viewStitchEdit') {
    if (tabStitchEdit) tabStitchEdit.classList.add('active');
    if (viewStitchEdit) viewStitchEdit.classList.add('active');
  } else if (viewId === 'viewVideoEnhance') {
    if (tabVideoEnhance) tabVideoEnhance.classList.add('active');
    if (viewVideoEnhance) viewVideoEnhance.classList.add('active');
  } else if (viewId === 'viewImageEnhance') {
    if (tabImageEnhance) tabImageEnhance.classList.add('active');
    if (viewImageEnhance) viewImageEnhance.classList.add('active');
    renderStandaloneImagePreview();
  } else if (viewId === 'viewAudioStudio') {
    if (tabAudioStudio) tabAudioStudio.classList.add('active');
    if (viewAudioStudio) viewAudioStudio.classList.add('active');
    initAudioStudioVoicesUI();
  } else if (viewId === 'viewVideoEditor') {
    if (tabVideoEditor) tabVideoEditor.classList.add('active');
    if (viewVideoEditor) viewVideoEditor.classList.add('active');

    // Auto-sync clips and voiceover if not yet loaded
    if (videoEditorStation.videoClips.length === 0 && state.clips.length > 0) {
      videoEditorStation.importClipsFromVideoStation(state.clips);
      const emptyOverlay = document.getElementById('editorEmptyOverlay');
      if (emptyOverlay) emptyOverlay.style.display = 'none';
    }
    if (!videoEditorStation.voiceoverTrack && state.generatedAudioBlob) {
      videoEditorStation.importVoiceoverTrack(state.generatedAudioBlob, 'AI Voiceover');
    }
    videoEditorStation.renderTimeline();
    videoEditorStation.renderMixer();
  }
}

if (tabStitchEdit) tabStitchEdit.addEventListener('click', () => switchAppView('viewStitchEdit'));
if (tabVideoEnhance) tabVideoEnhance.addEventListener('click', () => switchAppView('viewVideoEnhance'));
if (tabImageEnhance) tabImageEnhance.addEventListener('click', () => switchAppView('viewImageEnhance'));
if (tabAudioStudio) tabAudioStudio.addEventListener('click', () => switchAppView('viewAudioStudio'));
if (tabVideoEditor) tabVideoEditor.addEventListener('click', () => switchAppView('viewVideoEditor'));

// ====================================================
// EMBEDDED AI SCRIPT & SHOT DIRECTOR (IN EDITING PHASE)
// ====================================================

function updateGeminiInlineStatusUI() {
  if (geminiService.hasApiKey()) {
    if (geminiInlineStatus) {
      geminiInlineStatus.textContent = '✨ Gemini AI Connected';
      geminiInlineStatus.style.background = 'rgba(99, 102, 241, 0.2)';
      geminiInlineStatus.style.color = '#a5b4fc';
    }
    if (geminiKeyInline) {
      geminiKeyInline.value = geminiService.getApiKey();
    }
  } else {
    if (geminiInlineStatus) {
      geminiInlineStatus.textContent = 'Smart Local Matcher';
      geminiInlineStatus.style.background = 'rgba(16, 185, 129, 0.15)';
      geminiInlineStatus.style.color = 'var(--success)';
    }
  }
}

if (btnSaveGeminiKeyInline) {
  btnSaveGeminiKeyInline.addEventListener('click', () => {
    const key = geminiKeyInline ? geminiKeyInline.value.trim() : '';
    geminiService.setApiKey(key);
    updateGeminiInlineStatusUI();
    if (key) {
      alert('Gemini API key saved! Automatic shot & clip intelligence is now powered by Gemini AI.');
    } else {
      alert('Key cleared. App will use smart local shot matcher.');
    }
    triggerAutoGeminiAlignment(100);
  });
}

// Automatic Debounced Gemini Script & Shot Alignment
let alignDebounceTimer = null;

function triggerAutoGeminiAlignment(debounceMs = 600) {
  if (alignDebounceTimer) clearTimeout(alignDebounceTimer);
  alignDebounceTimer = setTimeout(async () => {
    await runAutoGeminiAlignment();
  }, debounceMs);
}

async function runAutoGeminiAlignment() {
  const script = scriptText ? scriptText.value.trim() : '';
  if (!script || state.clips.length === 0) {
    if (autoAlignStatus) autoAlignStatus.innerHTML = `<span>⚡ Ready (Type shots to align)</span>`;
    return;
  }

  if (autoAlignStatus) {
    autoAlignStatus.innerHTML = `<span>⚡ Aligning clips to shots...</span>`;
  }

  try {
    const scenes = await geminiService.parseScript(script);
    const result = await geminiService.alignClipsToScript(state.clips, scenes);
    state.aiAlignment = result;

    if (result.alignedClips && result.alignedClips.length > 0) {
      state.clips = result.alignedClips;
    }

    state.parsedScenes = scenes;

    // Build map of clipId -> scene details for inline badges on clips
    const sceneMatchMap = {};
    if (result.storyboard) {
      result.storyboard.forEach(item => {
        if (item.clipId) {
          sceneMatchMap[item.clipId] = {
            sceneNumber: item.sceneNumber,
            title: item.sceneTitle || `Shot ${item.sceneNumber}`,
            promptText: item.promptText || item.sceneTitle || `Shot ${item.sceneNumber}`,
            reason: item.reason || ''
          };
        }
      });
    }
    state.sceneMatchMap = sceneMatchMap;

    // Detect if script has shots that don't have clips yet (useful for non-editors)
    let missingShotNotice = '';
    if (scenes.length > state.clips.length) {
      const assignedNums = new Set((result.storyboard || []).map(s => s.sceneNumber));
      const missing = scenes
        .filter(sc => !assignedNums.has(sc.sceneNumber))
        .map(sc => `Shot ${sc.sceneNumber}`);
      if (missing.length > 0) {
        missingShotNotice = ` (⚠️ ${missing.length} unassigned shots in script: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''})`;
      }
    }

    if (sortBadge) sortBadge.textContent = '✨ AI Aligned';
    if (sortBannerMsg) sortBannerMsg.textContent = `${result.storyboard ? result.storyboard.length : 0} shots aligned along story line!${missingShotNotice}`;
    if (autoAlignStatus) autoAlignStatus.innerHTML = `<span style="color:#10b981;">✨ Aligned to ${scenes.length} shots</span>`;

    // Render Storyboard Drawer
    if (storyboardDrawer) {
      storyboardDrawer.style.display = 'block';
      if (storyboardRationale) {
        storyboardRationale.textContent = result.rationale || 'Clips aligned to script shot prompts.';
      }
      if (storyboardGrid) {
        storyboardGrid.innerHTML = '';
        (result.storyboard || []).forEach(item => {
          const card = document.createElement('div');
          card.className = 'storyboard-card';
          card.innerHTML = `
            <div class="storyboard-card-body">
              <span class="storyboard-scene-badge">Shot ${item.sceneNumber}: ${escapeHtml(item.sceneTitle || '')}</span>
              <div class="storyboard-card-title">${escapeHtml(item.filename || 'Clip')}</div>
              <p class="storyboard-card-beat">${escapeHtml(item.reason || '')}</p>
              <div class="storyboard-card-meta">
                <span>Confidence: ${item.matchConfidence || 'High'}</span>
              </div>
            </div>
          `;
          storyboardGrid.appendChild(card);
        });
      }
    }

    updateClipsUI();
  } catch (err) {
    console.warn('Auto alignment note:', err);
    if (autoAlignStatus) autoAlignStatus.innerHTML = `<span>⚡ Ready</span>`;
  }
}

// Live typing debounce
if (scriptText) {
  scriptText.addEventListener('input', () => {
    triggerAutoGeminiAlignment(600);
  });
}

// Script Templates
const SCRIPT_TEMPLATES = {
  product: `Shot 1: Hook - Pain point introduction and dynamic product reveal.
Shot 2: Feature Walkthrough - Close-up demonstration of the user interface.
Shot 3: Speed Benchmark - Real-time client-side performance demonstration.
Shot 4: Customer Impact - Benchmark tests and creator productivity.
Shot 5: Call to Action - Outro with download link and closing title card.`,

  tutorial: `Shot 1: Introduction - Welcome viewers and review project goals.
Shot 2: Setup - Downloading assets and testing local environment.
Shot 3: Core Implementation - Editing clips, syncing prompts, and assembling video.
Shot 4: Export & Upscale - Testing 1080P and 4K ultra-high resolution export.
Shot 5: Summary - Final recap, documentation links, and closing remarks.`,

  story: `Shot 1: The Morning Departure - Establishing view and setting the itinerary.
Shot 2: The Journey - Atmospheric b-roll travelling through scenic landscapes.
Shot 3: The Peak Discovery - Highlight moment exploring new horizons.
Shot 4: Reflections - Twilight discussion of lessons and memorable moments.
Shot 5: Signing Off - Concluding farewell to viewers and outro.`
};

if (btnTplProduct) {
  btnTplProduct.addEventListener('click', () => {
    scriptText.value = SCRIPT_TEMPLATES.product;
    scriptText.focus();
    triggerAutoGeminiAlignment(100);
  });
}
if (btnTplTutorial) {
  btnTplTutorial.addEventListener('click', () => {
    scriptText.value = SCRIPT_TEMPLATES.tutorial;
    scriptText.focus();
    triggerAutoGeminiAlignment(100);
  });
}
if (btnTplStory) {
  btnTplStory.addEventListener('click', () => {
    scriptText.value = SCRIPT_TEMPLATES.story;
    scriptText.focus();
    triggerAutoGeminiAlignment(100);
  });
}

// Manual force re-align button
if (btnAlignScript) {
  btnAlignScript.addEventListener('click', async () => {
    const script = scriptText.value.trim();
    if (!script) {
      alert('Please enter shot prompts or select a template first.');
      scriptText.focus();
      return;
    }

    if (state.clips.length === 0) {
      const loadDemo = confirm('No video clips are currently loaded. Would you like to load 3 sample demo clips to test script alignment?');
      if (loadDemo) {
        await loadSampleFiles(['clip2.mp4', 'clip1.mp4', 'clip3.mp4']);
      } else {
        return;
      }
    }

    await runAutoGeminiAlignment();
    if (storyboardDrawer) {
      storyboardDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// Download WebVTT Subtitles
if (btnDownloadVtt) {
  btnDownloadVtt.addEventListener('click', () => {
    if (!state.aiMetadata || !state.aiMetadata.vttContent) {
      alert('No subtitles or chapter metadata generated yet.');
      return;
    }
    const blob = new Blob([state.aiMetadata.vttContent], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.aiMetadata.title || 'video').toLowerCase().replace(/\s+/g, '_')}_chapters.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ====================================================
// GOOGLE WORKSPACE MODALS & INTEGRATION
// ====================================================

// Calendar Modal
if (btnOpenCalendarModal) {
  btnOpenCalendarModal.addEventListener('click', () => {
    calendarModal.style.display = 'flex';
  });
}

if (btnCloseCalModal) {
  btnCloseCalModal.addEventListener('click', () => {
    calendarModal.style.display = 'none';
  });
}
if (btnCancelCal) {
  btnCancelCal.addEventListener('click', () => {
    calendarModal.style.display = 'none';
  });
}

if (btnConfirmCal) {
  btnConfirmCal.addEventListener('click', async () => {
    const title = calEventTitle.value.trim() || 'Video Premiere: Final Cut';
    const dateVal = calEventDate.value;
    const desc = calEventDesc.value.trim();

    const startTime = dateVal ? new Date(dateVal).toISOString() : new Date(Date.now() + 86400000).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString();

    try {
      const res = await workspaceService.scheduleEvent({
        title,
        description: desc,
        startTime,
        endTime
      });
      calendarModal.style.display = 'none';
      if (res && res.method === 'web_intent') {
        // Handled via Web Intent tab
      } else {
        alert('Event successfully created in Google Calendar!');
      }
    } catch (err) {
      alert(`Calendar error: ${err.message}`);
    }
  });
}

// Gmail Modal
if (btnOpenGmailModal) {
  btnOpenGmailModal.addEventListener('click', () => {
    gmailModal.style.display = 'flex';
  });
}

if (btnCloseGmailModal) {
  btnCloseGmailModal.addEventListener('click', () => {
    gmailModal.style.display = 'none';
  });
}
if (btnCancelGmail) {
  btnCancelGmail.addEventListener('click', () => {
    gmailModal.style.display = 'none';
  });
}

if (btnConfirmGmail) {
  btnConfirmGmail.addEventListener('click', async () => {
    const to = gmailRecipient.value.trim();
    const subject = gmailSubject.value.trim() || 'Your Merged Video is Ready';
    const body = gmailBody.value.trim();

    try {
      const res = await workspaceService.sendOrDraftEmail({
        to,
        subject,
        body
      });
      gmailModal.style.display = 'none';
      if (res && res.method === 'web_intent') {
        // Handled via Web Compose tab
      } else {
        alert('Email successfully sent via Gmail!');
      }
    } catch (err) {
      alert(`Gmail error: ${err.message}`);
    }
  });
}

// Firebase Cloud Project Save
if (btnSaveFirebase) {
  btnSaveFirebase.addEventListener('click', async () => {
    if (!state.mergedResult) {
      alert('Please merge clips before saving project to Firebase.');
      return;
    }

    const originalText = btnSaveFirebase.innerHTML;
    btnSaveFirebase.disabled = true;
    btnSaveFirebase.textContent = 'Saving...';

    try {
      const projectPayload = {
        title: (state.aiMetadata && state.aiMetadata.title) || 'Merged Video Project',
        clipCount: state.clips.length,
        clipNames: state.clips.map(c => c.file.name),
        script: scriptText.value.trim(),
        chapters: (state.aiMetadata && state.aiMetadata.chapters) || [],
        duration: state.mergedResult.duration,
        fileSize: state.mergedResult.sizeBytes,
        methodUsed: state.mergedResult.methodUsed,
        createdAt: new Date().toISOString()
      };

      const saveRes = await firebaseService.saveProject(projectPayload);
      alert(`Project successfully saved to ${saveRes.storage === 'firestore' ? 'Firebase Cloud Firestore' : 'Local Browser Storage'}!`);
    } catch (err) {
      alert(`Failed to save project: ${err.message}`);
    } finally {
      btnSaveFirebase.disabled = false;
      btnSaveFirebase.innerHTML = originalText;
    }
  });
}

// ====================================================
// SETTINGS MODAL & GOOGLE AUTHENTICATION
// ====================================================

if (btnOpenSettings) {
  btnOpenSettings.addEventListener('click', () => {
    geminiApiKeyInput.value = geminiService.getApiKey() || '';
    const storedConfig = localStorage.getItem('clipmerge_firebase_config');
    if (storedConfig) {
      firebaseConfigInput.value = storedConfig;
    }
    settingsModal.style.display = 'flex';
  });
}

if (btnCloseSettingsModal) {
  btnCloseSettingsModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });
}
if (btnCancelSettings) {
  btnCancelSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });
}

if (btnSaveSettings) {
  btnSaveSettings.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    geminiService.setApiKey(key);

    const configStr = firebaseConfigInput.value.trim();
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        firebaseService.init(config);
      } catch (err) {
        alert('Invalid Firebase configuration JSON: ' + err.message);
        return;
      }
    }

    settingsModal.style.display = 'none';
    alert('Settings saved successfully!');
  });
}

// ====================================================
// GOOGLE WORKSPACE HUB (CALENDAR, GMAIL & AUTH)
// ====================================================

function updateGoogleWorkspaceUI() {
  const account = state.currentUser?.displayName || state.currentUser?.email || workspaceService.connectedAccount;
  const isConnected = !!account;

  if (googleAuthText) {
    googleAuthText.textContent = isConnected ? account : 'Google Workspace';
  }

  if (workspaceAccountEmail) {
    workspaceAccountEmail.textContent = isConnected ? `Connected: ${account}` : 'Not Signed In';
  }

  if (workspaceAuthBadge) {
    if (state.googleAccessToken) {
      workspaceAuthBadge.textContent = 'OAuth Direct API';
      workspaceAuthBadge.className = 'badge-enhance-mode mode-upscale';
    } else if (isConnected) {
      workspaceAuthBadge.textContent = 'Account Linked';
      workspaceAuthBadge.className = 'badge-enhance-mode';
    } else {
      workspaceAuthBadge.textContent = '1-Click Web Ready';
      workspaceAuthBadge.className = 'badge-enhance-mode';
    }
  }

  if (workspaceAccountDesc) {
    workspaceAccountDesc.textContent = isConnected
      ? `Signed in as ${account}. Google Calendar events and Gmail drafts are synced directly.`
      : 'Connect your Google Workspace account for calendar releases and Gmail composition, or use instant 1-Click web intents.';
  }

  if (btnWorkspaceSignIn && btnWorkspaceSignOut) {
    if (isConnected) {
      btnWorkspaceSignIn.style.display = 'none';
      btnWorkspaceSignOut.style.display = 'inline-flex';
    } else {
      btnWorkspaceSignIn.style.display = 'inline-flex';
      btnWorkspaceSignOut.style.display = 'none';
    }
  }
}

// Open Workspace Hub Modal from header
if (btnGoogleAuth) {
  btnGoogleAuth.addEventListener('click', () => {
    updateGoogleWorkspaceUI();
    if (workspaceModal) workspaceModal.style.display = 'flex';
  });
}

if (btnCloseWorkspaceModal) {
  btnCloseWorkspaceModal.addEventListener('click', () => {
    if (workspaceModal) workspaceModal.style.display = 'none';
  });
}
if (btnCloseWorkspaceFooter) {
  btnCloseWorkspaceFooter.addEventListener('click', () => {
    if (workspaceModal) workspaceModal.style.display = 'none';
  });
}

// Sign In via Workspace Hub
if (btnWorkspaceSignIn) {
  btnWorkspaceSignIn.addEventListener('click', async () => {
    try {
      const authResult = await firebaseService.signInWithGoogle();
      if (authResult && authResult.user) {
        state.currentUser = authResult.user;
        state.googleAccessToken = authResult.accessToken;
        workspaceService.setAccessToken(authResult.accessToken, authResult.user.email || authResult.user.displayName);
        updateGoogleWorkspaceUI();
        alert(`🎉 Signed in successfully as ${authResult.user.displayName || authResult.user.email}!\nGoogle Calendar & Gmail integrations are now active.`);
      }
    } catch (err) {
      alert(`Google Workspace sign-in note: ${err.message}\n(Web Intents remain 100% active for 1-click Calendar & Gmail!)`);
    }
  });
}

// Sign Out via Workspace Hub
if (btnWorkspaceSignOut) {
  btnWorkspaceSignOut.addEventListener('click', async () => {
    if (confirm('Disconnect Google Workspace account?')) {
      await firebaseService.signOut();
      state.currentUser = null;
      state.googleAccessToken = null;
      workspaceService.setAccessToken(null);
      updateGoogleWorkspaceUI();
    }
  });
}

// Hub Shortcuts to Calendar & Gmail
if (btnHubOpenCalendar) {
  btnHubOpenCalendar.addEventListener('click', () => {
    if (workspaceModal) workspaceModal.style.display = 'none';
    if (calEventTitle) {
      calEventTitle.value = state.aiMetadata?.title || `Video Release: ${state.currentProjectName || 'ClipMerge Production'}`;
    }
    if (calEventDesc) {
      calEventDesc.value = `${scriptText ? scriptText.value : ''}\n\nStitched from ${state.clips.length} clips with ClipMerge.`;
    }
    if (calendarModal) calendarModal.style.display = 'flex';
  });
}

if (btnHubOpenGmail) {
  btnHubOpenGmail.addEventListener('click', () => {
    if (workspaceModal) workspaceModal.style.display = 'none';
    if (gmailSubject) {
      gmailSubject.value = `Video Ready: ${state.aiMetadata?.title || state.currentProjectName || 'ClipMerge Production'}`;
    }
    if (gmailBody) {
      const durationStr = state.mergedResult ? formatDuration(state.mergedResult.duration) : '0s';
      gmailBody.value = `Hi team,\n\nThe stitched video production is completed!\n\nProject: ${state.currentProjectName}\nDuration: ${durationStr}\nClips: ${state.clips.length}\n\nSummary:\n${state.aiMetadata?.description || (scriptText ? scriptText.value.slice(0, 300) : '')}\n\nGenerated with ClipMerge AI Studio.`;
    }
    if (gmailModal) gmailModal.style.display = 'flex';
  });
}

// Initialize Auth Listener on Startup
firebaseService.onAuthStateChanged((user) => {
  if (user) {
    state.currentUser = user;
    workspaceService.setAccessToken(workspaceService.getAccessToken(), user.email || user.displayName);
  } else {
    state.currentUser = null;
  }
  updateGoogleWorkspaceUI();
});

// ====================================================
// SQLITE BACKEND & PROJECTS / RENDER HISTORY CONTROLLER
// ====================================================

async function updateSQLiteStatusUI() {
  try {
    const health = await sqliteService.checkHealth();
    if (health.isConnected) {
      if (sqliteStatusBadge) {
        sqliteStatusBadge.className = 'sqlite-status-badge connected';
        sqliteStatusBadge.title = 'SQLite Local Database Connected';
      }
      if (sqliteStatusText) sqliteStatusText.textContent = 'SQLite Active';
      if (modalSqliteStatus) {
        modalSqliteStatus.className = 'sqlite-status-badge connected';
        modalSqliteStatus.innerHTML = '<span class="sqlite-dot"></span> SQLite Connected';
      }

      // Refresh counts
      try {
        const [projects, renders] = await Promise.all([
          sqliteService.getProjects(),
          sqliteService.getRenderHistory()
        ]);
        if (projectCountBadge) projectCountBadge.textContent = projects.length;
        if (renderCountBadge) renderCountBadge.textContent = renders.length;
      } catch (e) {
        console.warn('SQLite counts fetch error:', e);
      }
    } else {
      if (sqliteStatusBadge) {
        sqliteStatusBadge.className = 'sqlite-status-badge';
        sqliteStatusBadge.title = 'SQLite Local Backend Offline (Start serve.py to connect)';
      }
      if (sqliteStatusText) sqliteStatusText.textContent = 'SQLite Offline';
      if (modalSqliteStatus) {
        modalSqliteStatus.className = 'sqlite-status-badge';
        modalSqliteStatus.innerHTML = '<span class="sqlite-dot"></span> SQLite Offline';
      }
    }
  } catch (err) {
    console.warn('SQLite status check failed:', err);
  }
}

function switchProjectsModalTab(tab) {
  if (btnTabListProjects) btnTabListProjects.className = tab === 'projects' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
  if (btnTabListRenders) btnTabListRenders.className = tab === 'renders' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
  if (btnTabSaveCurrentProject) btnTabSaveCurrentProject.className = tab === 'save' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';

  if (panelListProjects) panelListProjects.style.display = tab === 'projects' ? 'block' : 'none';
  if (panelListRenders) panelListRenders.style.display = tab === 'renders' ? 'block' : 'none';
  if (panelSaveCurrentProject) panelSaveCurrentProject.style.display = tab === 'save' ? 'block' : 'none';

  if (tab === 'projects') loadProjectsListUI();
  if (tab === 'renders') loadRendersListUI();
}

if (btnTabListProjects) btnTabListProjects.addEventListener('click', () => switchProjectsModalTab('projects'));
if (btnTabListRenders) btnTabListRenders.addEventListener('click', () => switchProjectsModalTab('renders'));
if (btnTabSaveCurrentProject) btnTabSaveCurrentProject.addEventListener('click', () => switchProjectsModalTab('save'));

async function loadProjectsListUI() {
  if (!projectsListContainer) return;
  projectsListContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading projects from SQLite...</div>';

  try {
    const projects = await sqliteService.getProjects();
    if (projectCountBadge) projectCountBadge.textContent = projects.length;

    if (!projects || projects.length === 0) {
      projectsListContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem 1rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          <p style="font-size: 1.05rem; margin-bottom: 0.5rem;">📁 No Saved Projects in SQLite Yet</p>
          <p style="font-size: 0.85rem; margin-bottom: 1rem;">Save your current timeline, storyboard clips, and voiceover settings permanently.</p>
          <button class="btn btn-sm btn-primary" id="btnGoToSaveTab">
            💾 Save Current Timeline
          </button>
        </div>
      `;
      const btnGoTo = document.getElementById('btnGoToSaveTab');
      if (btnGoTo) btnGoTo.addEventListener('click', () => switchProjectsModalTab('save'));
      return;
    }

    projectsListContainer.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      const updatedDate = new Date(p.updated_at).toLocaleString();

      card.innerHTML = `
        <div>
          <div class="project-card-title">${escapeHtml(p.name)}</div>
          <div class="project-card-desc">${escapeHtml(p.description || 'No description entered.')}</div>
          <div class="project-card-meta">
            <span class="project-card-badge">🎬 ${p.clip_count} clips</span>
            <span class="project-card-badge">✨ ${p.resolution ? p.resolution.toUpperCase() : 'ORIGINAL'}</span>
            <span class="project-card-badge">🌐 ${escapeHtml(p.language || 'en-US')}</span>
            <span style="opacity: 0.7; margin-left: auto;">${updatedDate}</span>
          </div>
        </div>
        <div class="project-card-actions">
          <button class="btn btn-xs btn-danger btn-delete-project" data-id="${p.id}" title="Delete project from SQLite">
            🗑️ Delete
          </button>
          <button class="btn btn-xs btn-primary btn-load-project" data-id="${p.id}" title="Load project into editor">
            📂 Load Project
          </button>
        </div>
      `;

      card.querySelector('.btn-delete-project').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Delete project "${p.name}" from SQLite?`)) {
          await sqliteService.deleteProject(p.id);
          loadProjectsListUI();
          updateSQLiteStatusUI();
        }
      });

      card.querySelector('.btn-load-project').addEventListener('click', async (e) => {
        e.stopPropagation();
        await loadProjectFromSQLite(p.id);
      });

      projectsListContainer.appendChild(card);
    });
  } catch (err) {
    projectsListContainer.innerHTML = `<div style="grid-column: 1 / -1; color: var(--danger); text-align: center; padding: 1.5rem;">Error loading projects: ${err.message}</div>`;
  }
}

async function loadRendersListUI() {
  if (!rendersListContainer) return;
  rendersListContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading export history from SQLite...</div>';

  try {
    const renders = await sqliteService.getRenderHistory();
    if (renderCountBadge) renderCountBadge.textContent = renders.length;

    if (!renders || renders.length === 0) {
      rendersListContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 1rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          <p style="font-size: 1rem; margin-bottom: 0.3rem;">🎬 No Video Exports Logged Yet</p>
          <p style="font-size: 0.8rem;">Whenever you merge a video, its export details will be permanently archived here in SQLite.</p>
        </div>
      `;
      return;
    }

    rendersListContainer.innerHTML = '';
    renders.forEach(r => {
      const item = document.createElement('div');
      item.className = 'render-history-item';
      const createdDate = new Date(r.created_at).toLocaleString();

      item.innerHTML = `
        <div class="render-item-info">
          <div class="render-item-title">
            📹 ${escapeHtml(r.output_filename)}
            <span style="font-size: 0.7rem; background: var(--bg-tertiary); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); margin-left: 0.4rem;">
              ${r.resolution ? r.resolution.toUpperCase() : 'ORIGINAL'}
            </span>
            ${r.has_voiceover ? '<span style="font-size: 0.7rem; color: #34d399; margin-left: 0.3rem;">🎙️ Voiceover</span>' : ''}
          </div>
          <div class="render-item-meta">
            Project: <strong>${escapeHtml(r.project_name || 'Merged Cut')}</strong> • 
            Size: ${formatBytes(r.file_size_bytes)} • 
            Duration: ${formatDuration(r.duration_seconds)} • 
            ${createdDate}
          </div>
        </div>
      `;
      rendersListContainer.appendChild(item);
    });
  } catch (err) {
    rendersListContainer.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 1.5rem;">Error loading render logs: ${err.message}</div>`;
  }
}

async function loadProjectFromSQLite(projectId) {
  try {
    const project = await sqliteService.getProject(projectId);
    if (!project) throw new Error('Project not found in SQLite.');

    state.currentProjectId = project.id;
    state.currentProjectName = project.name;

    // Restore script text
    if (project.script_text) {
      if (scriptText) scriptText.value = project.script_text;
      if (audioScriptInput) audioScriptInput.value = project.script_text;
      if (typeof updateAudioScriptStats === 'function') updateAudioScriptStats();
    }

    // Restore language & voice settings
    if (project.language && audioLangSelect) {
      audioLangSelect.value = project.language;
    }
    if (project.voice_settings) {
      const vs = project.voice_settings;
      if (vs.pitch && audioPitchSlider) {
        audioPitchSlider.value = vs.pitch;
        if (labelAudioPitch) labelAudioPitch.textContent = `${parseFloat(vs.pitch).toFixed(2)}x`;
      }
      if (vs.rate && audioRateSlider) {
        audioRateSlider.value = vs.rate;
        if (labelAudioRate) labelAudioRate.textContent = `${parseFloat(vs.rate).toFixed(2)}x`;
      }
    }

    // Restore resolution
    if (project.resolution && selectOutputResolution) {
      selectOutputResolution.value = project.resolution;
      updateEnhanceResolutionBadge();
    }

    if (projectsModal) projectsModal.style.display = 'none';

    alert(`🎉 Project "${project.name}" successfully loaded from SQLite!\n\n${project.clips ? project.clips.length : 0} storyboard clips & narration restored.`);
    switchAppView('viewStitchEdit');
  } catch (err) {
    alert(`Failed to load project: ${err.message}`);
  }
}

// Open / Close Projects Modal
if (btnOpenProjectsModal) {
  btnOpenProjectsModal.addEventListener('click', () => {
    switchProjectsModalTab('projects');
    if (projectsModal) projectsModal.style.display = 'flex';
  });
}

if (btnQuickSaveProject) {
  btnQuickSaveProject.addEventListener('click', () => {
    if (inputSaveProjectName) {
      inputSaveProjectName.value = state.currentProjectName || `Project Cut ${new Date().toLocaleDateString()}`;
    }
    switchProjectsModalTab('save');
    if (projectsModal) projectsModal.style.display = 'flex';
  });
}

if (btnCloseProjectsModal) {
  btnCloseProjectsModal.addEventListener('click', () => {
    if (projectsModal) projectsModal.style.display = 'none';
  });
}
if (btnCloseProjectsModalFooter) {
  btnCloseProjectsModalFooter.addEventListener('click', () => {
    if (projectsModal) projectsModal.style.display = 'none';
  });
}

// Commit Save Project to SQLite
if (btnConfirmSaveProject) {
  btnConfirmSaveProject.addEventListener('click', async () => {
    const name = inputSaveProjectName ? inputSaveProjectName.value.trim() : '';
    if (!name) {
      alert('Please enter a project title.');
      if (inputSaveProjectName) inputSaveProjectName.focus();
      return;
    }
    const description = inputSaveProjectDesc ? inputSaveProjectDesc.value.trim() : '';

    btnConfirmSaveProject.disabled = true;
    if (saveProjectStatusMsg) {
      saveProjectStatusMsg.style.display = 'block';
      saveProjectStatusMsg.innerHTML = '<span style="color: var(--accent-primary);">💾 Saving project to SQLite...</span>';
    }

    try {
      const payload = {
        id: state.currentProjectId || undefined,
        name: name,
        description: description,
        resolution: selectOutputResolution ? selectOutputResolution.value : 'original',
        script_text: (audioScriptInput ? audioScriptInput.value : '') || (scriptText ? scriptText.value : ''),
        language: audioLangSelect ? audioLangSelect.value : 'en-US',
        voice_settings: {
          pitch: audioPitchSlider ? parseFloat(audioPitchSlider.value) : 1.0,
          rate: audioRateSlider ? parseFloat(audioRateSlider.value) : 1.0,
        },
        clips: state.clips.map((c, idx) => ({
          name: c.file ? c.file.name : `Clip_${idx + 1}`,
          duration: c.probe ? c.probe.duration : 0,
          resolution: c.probe ? `${c.probe.width}x${c.probe.height}` : '',
          shot_number: idx + 1,
          order_index: idx,
          prompt_text: (state.sceneMatchMap && state.sceneMatchMap[c.id] && state.sceneMatchMap[c.id].promptText) || ''
        }))
      };

      const saved = await sqliteService.saveProject(payload);
      state.currentProjectId = saved.id;
      state.currentProjectName = saved.name;

      if (saveProjectStatusMsg) {
        saveProjectStatusMsg.innerHTML = '<span style="color: var(--success); font-weight: 600;">✅ Project saved to SQLite successfully!</span>';
      }

      await updateSQLiteStatusUI();
      setTimeout(() => {
        if (saveProjectStatusMsg) saveProjectStatusMsg.style.display = 'none';
        switchProjectsModalTab('projects');
      }, 700);
    } catch (err) {
      if (saveProjectStatusMsg) {
        saveProjectStatusMsg.innerHTML = `<span style="color: var(--danger);">Error: ${err.message}</span>`;
      }
    } finally {
      btnConfirmSaveProject.disabled = false;
    }
  });
}

// ====================================================
// VIDEO RESOLUTION & IMAGE ENHANCEMENT LOGIC
// ====================================================

function updateEnhanceResolutionBadge() {
  if (!selectOutputResolution || !badgeEnhanceStatus) return;
  const val = selectOutputResolution.value;
  const isEnhanced = chkEnhanceVideo && chkEnhanceVideo.checked;

  if (val === '1080p') {
    badgeEnhanceStatus.textContent = '1080P Full HD' + (isEnhanced ? ' ✨' : '');
    badgeEnhanceStatus.className = 'badge-enhance-mode mode-upscale';
  } else if (val === '2160p') {
    badgeEnhanceStatus.textContent = '2160P 4K UHD' + (isEnhanced ? ' ✨' : '');
    badgeEnhanceStatus.className = 'badge-enhance-mode mode-upscale';
  } else {
    badgeEnhanceStatus.textContent = isEnhanced ? 'Original + Enhanced ✨' : 'Original Speed';
    badgeEnhanceStatus.className = isEnhanced ? 'badge-enhance-mode mode-upscale' : 'badge-enhance-mode';
  }
}

if (selectOutputResolution) {
  selectOutputResolution.addEventListener('change', updateEnhanceResolutionBadge);
}
if (chkEnhanceVideo) {
  chkEnhanceVideo.addEventListener('change', updateEnhanceResolutionBadge);
}

let imageEnhancerSourceType = 'frame'; // 'frame' | 'upload'
let uploadedImageElement = null;

async function renderImageEnhancerPreview() {
  if (!imageEnhanceCanvas) return;
  const targetRes = selectImageResolution ? selectImageResolution.value : '1080p';
  const mode = selectImageAspectMode ? selectImageAspectMode.value : 'pad';
  const enhance = chkImageSharpen ? chkImageSharpen.checked : true;

  try {
    if (imageEnhancerSourceType === 'frame') {
      if (outputVideoPlayer && outputVideoPlayer.videoWidth > 0) {
        if (imagePreviewPlaceholder) imagePreviewPlaceholder.style.display = 'none';
        imageEnhanceCanvas.style.display = 'block';

        const result = await ImageEnhancer.captureVideoFrame(outputVideoPlayer, targetRes, { mode, enhance });
        const img = await ImageEnhancer.loadImage(result.dataUrl);
        imageEnhanceCanvas.width = img.naturalWidth || img.width;
        imageEnhanceCanvas.height = img.naturalHeight || img.height;
        const ctx = imageEnhanceCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      } else {
        imageEnhanceCanvas.style.display = 'none';
        if (imagePreviewPlaceholder) {
          imagePreviewPlaceholder.style.display = 'block';
          imagePreviewPlaceholder.textContent = 'Merge or play a video to capture frame stills, or switch to "Upload Custom Image".';
        }
      }
    } else if (imageEnhancerSourceType === 'upload') {
      if (uploadedImageElement) {
        if (imagePreviewPlaceholder) imagePreviewPlaceholder.style.display = 'none';
        imageEnhanceCanvas.style.display = 'block';

        const result = await ImageEnhancer.upscaleImage(uploadedImageElement, targetRes, { mode, enhance });
        const img = await ImageEnhancer.loadImage(result.dataUrl);
        imageEnhanceCanvas.width = img.naturalWidth || img.width;
        imageEnhanceCanvas.height = img.naturalHeight || img.height;
        const ctx = imageEnhanceCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      } else {
        imageEnhanceCanvas.style.display = 'none';
        if (imagePreviewPlaceholder) {
          imagePreviewPlaceholder.style.display = 'block';
          imagePreviewPlaceholder.textContent = 'Upload or drop an image above to preview.';
        }
      }
    }
  } catch (err) {
    console.warn('Image enhancer preview note:', err);
  }
}

if (btnOpenImageEnhancer) {
  btnOpenImageEnhancer.addEventListener('click', () => {
    imageEnhancerSourceType = 'frame';
    if (btnTabCurrentFrame) btnTabCurrentFrame.className = 'btn btn-sm btn-primary';
    if (btnTabUploadImage) btnTabUploadImage.className = 'btn btn-sm btn-secondary';
    if (imageUploadDropzone) imageUploadDropzone.style.display = 'none';
    if (imageEnhanceModal) imageEnhanceModal.style.display = 'flex';
    renderImageEnhancerPreview();
  });
}

if (btnCloseImageEnhanceModal) {
  btnCloseImageEnhanceModal.addEventListener('click', () => {
    imageEnhanceModal.style.display = 'none';
  });
}
if (btnCancelImageEnhance) {
  btnCancelImageEnhance.addEventListener('click', () => {
    imageEnhanceModal.style.display = 'none';
  });
}

if (btnTabCurrentFrame) {
  btnTabCurrentFrame.addEventListener('click', () => {
    imageEnhancerSourceType = 'frame';
    btnTabCurrentFrame.className = 'btn btn-sm btn-primary';
    btnTabUploadImage.className = 'btn btn-sm btn-secondary';
    if (imageUploadDropzone) imageUploadDropzone.style.display = 'none';
    renderImageEnhancerPreview();
  });
}

if (btnTabUploadImage) {
  btnTabUploadImage.addEventListener('click', () => {
    imageEnhancerSourceType = 'upload';
    btnTabCurrentFrame.className = 'btn btn-sm btn-secondary';
    btnTabUploadImage.className = 'btn btn-sm btn-primary';
    if (imageUploadDropzone) imageUploadDropzone.style.display = 'block';
    renderImageEnhancerPreview();
  });
}

if (imageUploadDropzone) {
  imageUploadDropzone.addEventListener('click', () => {
    if (imageFileInput) imageFileInput.click();
  });

  imageUploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadDropzone.style.borderColor = 'var(--accent-primary)';
  });
  imageUploadDropzone.addEventListener('dragleave', () => {
    imageUploadDropzone.style.borderColor = 'var(--border-color)';
  });
  imageUploadDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    imageUploadDropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (imageFileName) imageFileName.textContent = `Selected: ${file.name}`;
        uploadedImageElement = await ImageEnhancer.loadImage(file);
        renderImageEnhancerPreview();
      }
    }
  });
}

if (imageFileInput) {
  imageFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (imageFileName) imageFileName.textContent = `Selected: ${file.name}`;
      uploadedImageElement = await ImageEnhancer.loadImage(file);
      renderImageEnhancerPreview();
    }
  });
}

if (selectImageResolution) {
  selectImageResolution.addEventListener('change', renderImageEnhancerPreview);
}
if (selectImageAspectMode) {
  selectImageAspectMode.addEventListener('change', renderImageEnhancerPreview);
}
if (chkImageSharpen) {
  chkImageSharpen.addEventListener('change', renderImageEnhancerPreview);
}

if (btnDownloadEnhancedImage) {
  btnDownloadEnhancedImage.addEventListener('click', async () => {
    const targetRes = selectImageResolution ? selectImageResolution.value : '1080p';
    const mode = selectImageAspectMode ? selectImageAspectMode.value : 'pad';
    const enhance = chkImageSharpen ? chkImageSharpen.checked : true;

    try {
      let result = null;
      let filename = `enhanced_${targetRes}.png`;

      if (imageEnhancerSourceType === 'frame') {
        if (!outputVideoPlayer || outputVideoPlayer.videoWidth === 0) {
          alert('No video frame is currently loaded to enhance.');
          return;
        }
        result = await ImageEnhancer.captureVideoFrame(outputVideoPlayer, targetRes, { mode, enhance });
        filename = `poster_frame_${targetRes}_${Date.now()}.png`;
      } else {
        if (!uploadedImageElement) {
          alert('Please upload an image first.');
          return;
        }
        result = await ImageEnhancer.upscaleImage(uploadedImageElement, targetRes, { mode, enhance });
        filename = `upscaled_image_${targetRes}_${Date.now()}.png`;
      }

      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Image enhancement failed: ${err.message}`);
    }
  });
}

// ====================================================
// POST-MERGE ENHANCEMENT STUDIO (1080P & 4K UPSCALE / POSTER FRAME)
// ====================================================

if (btnPostMergeUpscale) {
  btnPostMergeUpscale.addEventListener('click', async () => {
    if (!state.mergedResult || !state.mergedResult.blob) {
      alert('Please perform a merge first before upscaling.');
      return;
    }

    const res = selectPostMergeRes ? selectPostMergeRes.value : '1080p';
    if (postMergeVideoStatus) {
      postMergeVideoStatus.style.display = 'block';
      postMergeVideoStatus.textContent = `🚀 Starting ${res.toUpperCase()} upscale with Lanczos filter...`;
    }
    btnPostMergeUpscale.disabled = true;

    try {
      const upscaled = await ffmpegHandler.enhanceStandaloneVideo(state.mergedResult.blob, {
        resolution: res,
        aspectMode: 'pad',
        sharpen: true,
        onProgress: (pct) => {
          if (postMergeVideoStatus) {
            postMergeVideoStatus.textContent = `⚡ Upscaling video to ${res.toUpperCase()}... ${pct}%`;
          }
        },
      });

      if (upscaled && upscaled.blobUrl) {
        state.upscaledMergedResult = upscaled;
        state.currentPreviewMode = 'upscaled';

        outputVideoPlayer.src = upscaled.blobUrl;
        outputVideoPlayer.load();

        downloadBtn.href = upscaled.blobUrl;
        downloadBtn.download = `clipmerge-enhanced-${res}.mp4`;

        if (resFileSize) resFileSize.textContent = formatBytes(upscaled.sizeBytes);
        if (resMethod) {
          resMethod.textContent = `${res.toUpperCase()} Upscaled ✨`;
          resMethod.style.color = 'var(--accent-primary)';
        }

        // Show interactive Before / After comparison bar above video player
        if (comparisonControlBar) {
          comparisonControlBar.style.display = 'flex';
        }
        if (playerActiveLabel) {
          playerActiveLabel.textContent = `✨ Viewing: ${res.toUpperCase()} Upscaled`;
          playerActiveLabel.style.color = '#a5b4fc';
        }
        if (btnViewOriginal) btnViewOriginal.classList.remove('active');
        if (btnViewUpscaled) {
          btnViewUpscaled.classList.add('active');
          btnViewUpscaled.textContent = `✨ View ${res.toUpperCase()} Result`;
        }

        // Show dedicated upscaled preview inspection box inside post-merge card
        if (upscaledPreviewBox) {
          upscaledPreviewBox.style.display = 'block';
          if (upscaledResTag) {
            upscaledResTag.textContent = res === '2160p' ? '✨ 2160P 4K Ultra HD' : '✨ 1080P Full HD';
          }
          if (upscaledSizeLabel) {
            upscaledSizeLabel.textContent = formatBytes(upscaled.sizeBytes);
          }
          if (btnDownloadUpscaledDirect) {
            btnDownloadUpscaledDirect.href = upscaled.blobUrl;
            btnDownloadUpscaledDirect.download = `clipmerge-enhanced-${res}.mp4`;
          }
        }

        if (postMergeVideoStatus) {
          postMergeVideoStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">✅ Video successfully enhanced to ${res.toUpperCase()}! Inspect in player above before downloading.</span>`;
        }
      }
    } catch (err) {
      alert(`Upscaling failed: ${err.message}`);
      if (postMergeVideoStatus) {
        postMergeVideoStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      btnPostMergeUpscale.disabled = false;
    }
  });
}

/**
 * Switch video player preview between Original cut and Upscaled 1080P/4K version
 */
function setPreviewVideoMode(mode) {
  if (!outputVideoPlayer) return;
  const currentTime = outputVideoPlayer.currentTime || 0;
  const wasPlaying = !outputVideoPlayer.paused;

  if (mode === 'original' && state.originalMergedResult) {
    state.currentPreviewMode = 'original';
    outputVideoPlayer.src = state.originalMergedResult.blobUrl;
    outputVideoPlayer.currentTime = currentTime;
    if (wasPlaying) outputVideoPlayer.play();

    if (playerActiveLabel) {
      playerActiveLabel.textContent = '📹 Viewing: Original Stitched Cut';
      playerActiveLabel.style.color = '#94a3b8';
    }
    if (btnViewOriginal) btnViewOriginal.classList.add('active');
    if (btnViewUpscaled) btnViewUpscaled.classList.remove('active');
    if (resFileSize) resFileSize.textContent = formatBytes(state.originalMergedResult.sizeBytes);
    if (resMethod) {
      resMethod.textContent = state.originalMergedResult.methodUsed === 'copy' ? 'Fast Stream Copy' : 'Smart Transcode';
      resMethod.style.color = 'var(--success)';
    }
  } else if (mode === 'upscaled' && state.upscaledMergedResult) {
    state.currentPreviewMode = 'upscaled';
    outputVideoPlayer.src = state.upscaledMergedResult.blobUrl;
    outputVideoPlayer.currentTime = currentTime;
    if (wasPlaying) outputVideoPlayer.play();

    const resLabel = state.upscaledMergedResult.resolution || '1080P/4K';
    if (playerActiveLabel) {
      playerActiveLabel.textContent = `✨ Viewing: ${resLabel} Upscaled`;
      playerActiveLabel.style.color = '#a5b4fc';
    }
    if (btnViewOriginal) btnViewOriginal.classList.remove('active');
    if (btnViewUpscaled) btnViewUpscaled.classList.add('active');
    if (resFileSize) resFileSize.textContent = formatBytes(state.upscaledMergedResult.sizeBytes);
    if (resMethod) {
      resMethod.textContent = `${resLabel} Upscaled ✨`;
      resMethod.style.color = 'var(--accent-primary)';
    }
  }
}

if (btnViewOriginal) {
  btnViewOriginal.addEventListener('click', () => setPreviewVideoMode('original'));
}
if (btnViewUpscaled) {
  btnViewUpscaled.addEventListener('click', () => setPreviewVideoMode('upscaled'));
}
if (btnPreviewUpscaledPlayer) {
  btnPreviewUpscaledPlayer.addEventListener('click', () => {
    setPreviewVideoMode('upscaled');
    outputVideoPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    outputVideoPlayer.play();
  });
}
if (btnToggleCompareMode) {
  btnToggleCompareMode.addEventListener('click', () => {
    const nextMode = state.currentPreviewMode === 'upscaled' ? 'original' : 'upscaled';
    setPreviewVideoMode(nextMode);
  });
}

if (btnPostMergePoster) {
  btnPostMergePoster.addEventListener('click', async () => {
    if (!outputVideoPlayer || outputVideoPlayer.videoWidth === 0) {
      alert('No video is currently loaded in the player to capture.');
      return;
    }

    const posterRes = selectPostMergePosterRes ? selectPostMergePosterRes.value : '2160p';
    if (postMergePosterStatus) {
      postMergePosterStatus.style.display = 'block';
      postMergePosterStatus.textContent = `🖼️ Capturing & upscaling poster frame to ${posterRes.toUpperCase()}...`;
    }
    btnPostMergePoster.disabled = true;

    try {
      const result = await ImageEnhancer.captureVideoFrame(outputVideoPlayer, posterRes, { mode: 'pad', enhance: true });
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poster_frame_${posterRes}_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        if (postMergePosterStatus) {
          postMergePosterStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">✅ Captured & enhanced ${result.width}×${result.height} poster frame! (Downloaded)</span>`;
        }
      }
    } catch (err) {
      alert(`Poster capture failed: ${err.message}`);
      if (postMergePosterStatus) {
        postMergePosterStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      btnPostMergePoster.disabled = false;
    }
  });
}

// ====================================================
// STANDALONE VIDEO ENHANCER (1080P & 2160P 4K)
// ====================================================

let selectedStandaloneVideoFile = null;

if (videoEnhanceDropzone) {
  videoEnhanceDropzone.addEventListener('click', () => {
    if (videoEnhanceFileInput) videoEnhanceFileInput.click();
  });

  videoEnhanceDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoEnhanceDropzone.style.borderColor = 'var(--accent-primary)';
  });
  videoEnhanceDropzone.addEventListener('dragleave', () => {
    videoEnhanceDropzone.style.borderColor = 'var(--border-color)';
  });
  videoEnhanceDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    videoEnhanceDropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.name.split('.').pop().toLowerCase())) {
        selectedStandaloneVideoFile = file;
        if (videoEnhanceSelectedName) {
          videoEnhanceSelectedName.textContent = `Selected: ${file.name} (${formatBytes(file.size)})`;
        }
      } else {
        alert('Please drop a valid video file.');
      }
    }
  });
}

if (videoEnhanceFileInput) {
  videoEnhanceFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      selectedStandaloneVideoFile = file;
      if (videoEnhanceSelectedName) {
        videoEnhanceSelectedName.textContent = `Selected: ${file.name} (${formatBytes(file.size)})`;
      }
    }
  });
}

if (btnRunStandaloneVideoEnhance) {
  btnRunStandaloneVideoEnhance.addEventListener('click', async () => {
    if (!selectedStandaloneVideoFile) {
      alert('Please select or drop a video file first.');
      return;
    }

    const res = selectStandaloneVideoRes ? selectStandaloneVideoRes.value : '1080p';
    const aspect = selectStandaloneVideoAspect ? selectStandaloneVideoAspect.value : 'pad';
    const sharpen = chkStandaloneVideoSharpen ? chkStandaloneVideoSharpen.checked : true;

    btnRunStandaloneVideoEnhance.disabled = true;
    if (standaloneVideoProgress) standaloneVideoProgress.style.display = 'block';
    if (standaloneVideoResultWrapper) standaloneVideoResultWrapper.style.display = 'none';

    if (standaloneVideoProgressFill) standaloneVideoProgressFill.style.width = '0%';
    if (standaloneVideoStatusText) {
      standaloneVideoStatusText.textContent = `Preparing WebAssembly engine for ${res.toUpperCase()} video upscaling...`;
    }

    try {
      const enhanced = await ffmpegHandler.enhanceStandaloneVideo(selectedStandaloneVideoFile, {
        resolution: res,
        aspectMode: aspect,
        sharpen: sharpen,
        onProgress: (pct) => {
          if (standaloneVideoProgressFill) standaloneVideoProgressFill.style.width = `${pct}%`;
          if (standaloneVideoStatusText) {
            standaloneVideoStatusText.textContent = `Upscaling & sharpening video to ${res.toUpperCase()}... ${pct}%`;
          }
        },
      });

      if (standaloneVideoProgress) standaloneVideoProgress.style.display = 'none';
      if (standaloneVideoResultWrapper) standaloneVideoResultWrapper.style.display = 'block';

      if (standaloneVideoResultPlayer) {
        standaloneVideoResultPlayer.src = enhanced.blobUrl;
        standaloneVideoResultPlayer.load();
      }

      if (btnDownloadStandaloneVideo) {
        btnDownloadStandaloneVideo.href = enhanced.blobUrl;
        btnDownloadStandaloneVideo.download = `enhanced_${res}_${selectedStandaloneVideoFile.name}`;
      }
    } catch (err) {
      alert(`Video enhancement failed: ${err.message}`);
      if (standaloneVideoStatusText) {
        standaloneVideoStatusText.textContent = `Error: ${err.message}`;
      }
    } finally {
      btnRunStandaloneVideoEnhance.disabled = false;
    }
  });
}

// ====================================================
// STANDALONE IMAGE ENHANCER (1080P & 2160P 4K)
// ====================================================

let standaloneLoadedImage = null;

async function renderStandaloneImagePreview() {
  if (!standaloneImageCanvas) return;
  const res = selectStandaloneImageRes ? selectStandaloneImageRes.value : '2160p';
  const aspect = selectStandaloneImageAspect ? selectStandaloneImageAspect.value : 'pad';
  const sharpen = chkStandaloneImageSharpen ? chkStandaloneImageSharpen.checked : true;

  if (!standaloneLoadedImage) {
    standaloneImageCanvas.style.display = 'none';
    if (standaloneImagePlaceholder) standaloneImagePlaceholder.style.display = 'block';
    return;
  }

  try {
    standaloneImageCanvas.style.display = 'block';
    if (standaloneImagePlaceholder) standaloneImagePlaceholder.style.display = 'none';

    const result = await ImageEnhancer.upscaleImage(standaloneLoadedImage, res, { mode: aspect, enhance: sharpen });
    const img = await ImageEnhancer.loadImage(result.dataUrl);
    standaloneImageCanvas.width = img.naturalWidth || img.width;
    standaloneImageCanvas.height = img.naturalHeight || img.height;
    const ctx = standaloneImageCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  } catch (err) {
    console.warn('Standalone image preview warning:', err);
  }
}

if (standaloneImageDropzone) {
  standaloneImageDropzone.addEventListener('click', () => {
    if (standaloneImageFileInput) standaloneImageFileInput.click();
  });

  standaloneImageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    standaloneImageDropzone.style.borderColor = 'var(--accent-primary)';
  });
  standaloneImageDropzone.addEventListener('dragleave', () => {
    standaloneImageDropzone.style.borderColor = 'var(--border-color)';
  });
  standaloneImageDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    standaloneImageDropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (standaloneImageFileName) {
          standaloneImageFileName.textContent = `Selected: ${file.name} (${formatBytes(file.size)})`;
        }
        standaloneLoadedImage = await ImageEnhancer.loadImage(file);
        renderStandaloneImagePreview();
      } else {
        alert('Please drop a valid image file.');
      }
    }
  });
}

if (standaloneImageFileInput) {
  standaloneImageFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (standaloneImageFileName) {
        standaloneImageFileName.textContent = `Selected: ${file.name} (${formatBytes(file.size)})`;
      }
      standaloneLoadedImage = await ImageEnhancer.loadImage(file);
      renderStandaloneImagePreview();
    }
  });
}

if (selectStandaloneImageRes) {
  selectStandaloneImageRes.addEventListener('change', renderStandaloneImagePreview);
}
if (selectStandaloneImageAspect) {
  selectStandaloneImageAspect.addEventListener('change', renderStandaloneImagePreview);
}
if (chkStandaloneImageSharpen) {
  chkStandaloneImageSharpen.addEventListener('change', renderStandaloneImagePreview);
}

if (btnDownloadStandaloneImage) {
  btnDownloadStandaloneImage.addEventListener('click', async () => {
    if (!standaloneLoadedImage) {
      alert('Please select or drop an image first.');
      return;
    }

    const res = selectStandaloneImageRes ? selectStandaloneImageRes.value : '2160p';
    const aspect = selectStandaloneImageAspect ? selectStandaloneImageAspect.value : 'pad';
    const sharpen = chkStandaloneImageSharpen ? chkStandaloneImageSharpen.checked : true;

    try {
      const result = await ImageEnhancer.upscaleImage(standaloneLoadedImage, res, { mode: aspect, enhance: sharpen });
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced_image_${res}_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Image enhancement failed: ${err.message}`);
    }
  });
}

// ====================================================
// AI AUDIO & VOICE CREATION STUDIO
// ====================================================

let availableBrowserVoices = [];
let clonedCustomVoices = [];

function populateVoiceSelectOptions(selectEl, { includeCustom = true, includeBrowser = false, defaultVal = '' } = {}) {
  if (!selectEl) return;
  const currentVal = selectEl.value || defaultVal;
  selectEl.innerHTML = '';

  // 1. Custom / Hybrid Merged Voices group
  if (includeCustom && state.customVoices && state.customVoices.length > 0) {
    const hybridGroup = document.createElement('optgroup');
    hybridGroup.label = '🧬 Custom & Hybrid Merged Voices';
    state.customVoices.forEach(cv => {
      const opt = document.createElement('option');
      opt.value = cv.id;
      const genderIcon = cv.gender === 'male' ? '👨' : '👩';
      opt.textContent = `✨ ${cv.name} (${genderIcon} - ${cv.timbre || 'Hybrid'})`;
      hybridGroup.appendChild(opt);
    });
    selectEl.appendChild(hybridGroup);
  }

  // Cloned mic voices if any
  if (includeCustom && clonedCustomVoices.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = '🎙️ Cloned Mic Samples';
    clonedCustomVoices.forEach((cv, idx) => {
      const opt = document.createElement('option');
      opt.value = `custom_${idx}`;
      opt.textContent = `🎙️ ${cv.name} (${cv.timbre || 'Cloned'})`;
      customGroup.appendChild(opt);
    });
    selectEl.appendChild(customGroup);
  }

  // 2. Google Gemini 2.0 AI Multimodal Voices
  const geminiModels = GOOGLE_VOICE_MODELS.filter(m => m.category === 'gemini');
  if (geminiModels.length > 0) {
    const geminiGroup = document.createElement('optgroup');
    geminiGroup.label = '✨ Google Gemini 2.0 AI Multimodal Voices';
    geminiModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = `google_${m.id}`;
      const genderIcon = m.gender === 'male' ? '👨' : '👩';
      opt.textContent = `${m.avatarBadge || '✨'} ${m.name} (${genderIcon} - ${m.timbre})`;
      geminiGroup.appendChild(opt);
    });
    selectEl.appendChild(geminiGroup);
  }

  // 3. Google Cloud Journey & Studio Voices
  const jsModels = GOOGLE_VOICE_MODELS.filter(m => m.category === 'journey' || m.category === 'studio');
  if (jsModels.length > 0) {
    const jsGroup = document.createElement('optgroup');
    jsGroup.label = '🌟 Google Journey & Studio Voices';
    jsModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = `google_${m.id}`;
      const genderIcon = m.gender === 'male' ? '👨' : '👩';
      opt.textContent = `${m.avatarBadge || '🌟'} ${m.name} (${genderIcon} - ${m.timbre})`;
      jsGroup.appendChild(opt);
    });
    selectEl.appendChild(jsGroup);
  }

  // 4. Google Cloud Neural2 Voices
  const n2Models = GOOGLE_VOICE_MODELS.filter(m => m.category === 'neural2');
  if (n2Models.length > 0) {
    const n2Group = document.createElement('optgroup');
    n2Group.label = '⚡ Google Cloud Neural2 Voices';
    n2Models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = `google_${m.id}`;
      const genderIcon = m.gender === 'male' ? '👨' : '👩';
      opt.textContent = `${m.avatarBadge || '⚡'} ${m.name} (${genderIcon} - ${m.timbre})`;
      n2Group.appendChild(opt);
    });
    selectEl.appendChild(n2Group);
  }

  // 5. Google Telugu Models
  const teModels = GOOGLE_VOICE_MODELS.filter(m => m.category === 'telugu');
  if (teModels.length > 0) {
    const teGroup = document.createElement('optgroup');
    teGroup.label = '🌸 Google Telugu (తెలుగు) Models';
    teModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = `google_${m.id}`;
      const genderIcon = m.gender === 'male' ? '👨' : '👩';
      opt.textContent = `${m.avatarBadge || '🌸'} ${m.name} (${genderIcon} - ${m.timbre})`;
      teGroup.appendChild(opt);
    });
    selectEl.appendChild(teGroup);
  }

  // 6. Native Browser Voices (for Narration dropdown)
  if (includeBrowser) {
    const categorized = audioStudio.getVoices();
    availableBrowserVoices = categorized.all || [];

    if (categorized.telugu.length > 0) {
      const teNativeGroup = document.createElement('optgroup');
      teNativeGroup.label = '🇮🇳 Native Browser Telugu Voices';
      categorized.telugu.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        teNativeGroup.appendChild(opt);
      });
      selectEl.appendChild(teNativeGroup);
    }

    if (categorized.english.length > 0) {
      const enNativeGroup = document.createElement('optgroup');
      enNativeGroup.label = '🌐 Native Browser English Voices';
      categorized.english.slice(0, 15).forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        enNativeGroup.appendChild(opt);
      });
      selectEl.appendChild(enNativeGroup);
    }
  }

  // Preserve previous selection if available, else use default
  if (currentVal && selectEl.querySelector(`option[value="${currentVal}"]`)) {
    selectEl.value = currentVal;
  } else if (defaultVal && selectEl.querySelector(`option[value="${defaultVal}"]`)) {
    selectEl.value = defaultVal;
  }
}

function resolveVoiceModel(val) {
  if (!val) return null;
  const cleanId = val.startsWith('google_') ? val.replace('google_', '') : val;
  const googleModel = audioStudio.getGoogleVoiceById(cleanId);
  if (googleModel) return googleModel;

  const customVoice = state.customVoices.find(v => v.id === val || v.id === cleanId);
  if (customVoice) return customVoice;

  if (val.startsWith('custom_')) {
    const idx = parseInt(val.replace('custom_', ''), 10);
    return clonedCustomVoices[idx] || null;
  }

  const voices = audioStudio.voices || [];
  const bv = voices.find(v => v.name === val);
  if (bv) {
    return { name: bv.name, language: bv.lang, gender: 'female', pitch: 1.0, rate: 1.0, timbre: 'Browser Voice' };
  }

  return null;
}

function initAllVoiceSelects() {
  populateVoiceSelectOptions(audioVoiceSelect, { includeCustom: true, includeBrowser: true, defaultVal: 'google_gemini-lyra' });
  populateVoiceSelectOptions(charVoiceSelect, { includeCustom: true, includeBrowser: false, defaultVal: 'google_gemini-puck' });
  populateVoiceSelectOptions(selectMergerVoiceA, { includeCustom: true, includeBrowser: false, defaultVal: 'google_gemini-puck' });
  populateVoiceSelectOptions(selectMergerVoiceB, { includeCustom: true, includeBrowser: false, defaultVal: 'google_gemini-lyra' });
  updateMergerPreviewBubbles();
}

function initAudioStudioVoicesUI() {
  initAllVoiceSelects();
}

// Update script character and time estimate
function updateAudioScriptStats() {
  if (!audioScriptInput) return;
  const text = audioScriptInput.value.trim();
  const chars = text.length;
  if (audioScriptCharCount) {
    audioScriptCharCount.textContent = `${chars} characters`;
  }
  const estSec = Math.max(1, Math.round(chars / 13));
  if (audioScriptEstTime) {
    audioScriptEstTime.textContent = chars > 0 ? `~${estSec}s estimated audio` : '~0s estimated audio';
  }
}

if (audioScriptInput) {
  audioScriptInput.addEventListener('input', updateAudioScriptStats);
}

if (btnImportScriptFromEditor) {
  btnImportScriptFromEditor.addEventListener('click', () => {
    if (scriptText && scriptText.value.trim()) {
      audioScriptInput.value = scriptText.value.trim();
      updateAudioScriptStats();
      if (audioScriptAiStatus) {
        audioScriptAiStatus.style.display = 'block';
        audioScriptAiStatus.innerHTML = '<span style="color: var(--success);">✅ Script imported from video editor.</span>';
        setTimeout(() => { if (audioScriptAiStatus) audioScriptAiStatus.style.display = 'none'; }, 3000);
      }
    } else {
      alert('No script entered in the video editor yet. Type a script in the editor first!');
    }
  });
}

// Translate script into natural colloquial spoken Telugu with Gemini
if (btnTranslateTelugu) {
  btnTranslateTelugu.addEventListener('click', async () => {
    const text = audioScriptInput ? audioScriptInput.value.trim() : '';
    if (!text) {
      alert('Please enter a script or click "Import from Video Editor" first.');
      return;
    }

    if (audioScriptAiStatus) {
      audioScriptAiStatus.style.display = 'block';
      audioScriptAiStatus.textContent = '✨ Translating and adapting into natural spoken Telugu (తెలుగు) via Gemini AI...';
    }
    btnTranslateTelugu.disabled = true;

    try {
      const teluguScript = await audioStudio.translateOrPolishScript(text, 'telugu');
      if (audioScriptInput) {
        audioScriptInput.value = teluguScript;
        updateAudioScriptStats();
      }
      if (audioLangSelect) audioLangSelect.value = 'te-IN';
      if (audioScriptAiStatus) {
        audioScriptAiStatus.innerHTML = '<span style="color: var(--success); font-weight: 600;">✅ Script successfully translated to spoken Telugu! Ready to voice.</span>';
      }
    } catch (err) {
      alert(`Telugu translation failed: ${err.message}`);
      if (audioScriptAiStatus) audioScriptAiStatus.textContent = `Error: ${err.message}`;
    } finally {
      btnTranslateTelugu.disabled = false;
    }
  });
}

// Polish English script
if (btnPolishEnglishScript) {
  btnPolishEnglishScript.addEventListener('click', async () => {
    const text = audioScriptInput ? audioScriptInput.value.trim() : '';
    if (!text) {
      alert('Please enter a script first.');
      return;
    }

    if (audioScriptAiStatus) {
      audioScriptAiStatus.style.display = 'block';
      audioScriptAiStatus.textContent = '🪄 Polishing script for natural voiceover delivery...';
    }
    btnPolishEnglishScript.disabled = true;

    try {
      const polished = await audioStudio.translateOrPolishScript(text, 'english');
      if (audioScriptInput) {
        audioScriptInput.value = polished;
        updateAudioScriptStats();
      }
      if (audioScriptAiStatus) {
        audioScriptAiStatus.innerHTML = '<span style="color: var(--success); font-weight: 600;">✅ English narration polished for smooth pacing and diction!</span>';
      }
    } catch (err) {
      alert(`Polishing failed: ${err.message}`);
      if (audioScriptAiStatus) audioScriptAiStatus.textContent = `Error: ${err.message}`;
    } finally {
      btnPolishEnglishScript.disabled = false;
    }
  });
}

// Tone Preset Buttons
const tonePresetButtons = document.querySelectorAll('.tone-preset-btn');
tonePresetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tonePresetButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const presetKey = btn.dataset.preset;
    const preset = audioStudio.TONE_PRESETS[presetKey];
    if (preset) {
      if (audioPitchSlider) {
        audioPitchSlider.value = preset.pitch;
        if (labelAudioPitch) labelAudioPitch.textContent = `${preset.pitch.toFixed(2)}x`;
      }
      if (audioRateSlider) {
        audioRateSlider.value = preset.rate;
        if (labelAudioRate) labelAudioRate.textContent = `${preset.rate.toFixed(2)}x`;
      }
      if (presetKey === 'lyra' && audioVoiceSelect) {
        const lyraOpt = audioVoiceSelect.querySelector('option[value="google_gemini-lyra"]');
        if (lyraOpt) audioVoiceSelect.value = 'google_gemini-lyra';
      }
    }
  });
});

// Slider updates
if (audioPitchSlider && labelAudioPitch) {
  audioPitchSlider.addEventListener('input', () => {
    labelAudioPitch.textContent = `${parseFloat(audioPitchSlider.value).toFixed(2)}x`;
  });
}
if (audioRateSlider && labelAudioRate) {
  audioRateSlider.addEventListener('input', () => {
    labelAudioRate.textContent = `${parseFloat(audioRateSlider.value).toFixed(2)}x`;
  });
}

// Audition Voice
function getSelectedVoiceObject() {
  if (!audioVoiceSelect) return null;
  const val = audioVoiceSelect.value;
  if (!val) return null;

  if (val.startsWith('custom_')) {
    const idx = parseInt(val.replace('custom_', ''), 10);
    return clonedCustomVoices[idx] || null;
  }

  const model = resolveVoiceModel(val);
  if (model) {
    const browserVoice = audioStudio.findBestBrowserVoiceForModel(model);
    return browserVoice || { name: model.name, lang: model.language || 'en-US' };
  }

  const voices = audioStudio.voices || [];
  return voices.find(v => v.name === val) || null;
}

if (audioVoiceSelect) {
  audioVoiceSelect.addEventListener('change', () => {
    const val = audioVoiceSelect.value;
    const model = resolveVoiceModel(val);
    if (model) {
      if (audioPitchSlider) {
        audioPitchSlider.value = model.pitch;
        if (labelAudioPitch) labelAudioPitch.textContent = `${Number(model.pitch).toFixed(2)}x`;
      }
      if (audioRateSlider) {
        audioRateSlider.value = model.rate;
        if (labelAudioRate) labelAudioRate.textContent = `${Number(model.rate).toFixed(2)}x`;
      }
      if (val === 'google_gemini-lyra' || val === 'gemini-lyra') {
        tonePresetButtons.forEach(b => {
          if (b.dataset.preset === 'lyra') b.classList.add('active');
          else b.classList.remove('active');
        });
      }
    }
  });
}

if (btnAuditionVoice) {
  btnAuditionVoice.addEventListener('click', () => {
    const text = audioScriptInput ? audioScriptInput.value.trim() : '';
    if (!text) {
      alert('Please enter text in the script studio to audition.');
      return;
    }

    const voiceObj = getSelectedVoiceObject();
    const pitch = audioPitchSlider ? parseFloat(audioPitchSlider.value) : 1.0;
    const rate = audioRateSlider ? parseFloat(audioRateSlider.value) : 1.0;
    const lang = audioLangSelect ? audioLangSelect.value : 'te-IN';

    btnAuditionVoice.disabled = true;
    btnAuditionVoice.textContent = '🔊 Auditioning...';

    try {
      audioStudio.speak(text.slice(0, 180), {
        voice: voiceObj && voiceObj.name ? voiceObj : undefined,
        lang,
        pitch,
        rate,
        onEnd: () => {
          btnAuditionVoice.disabled = false;
          btnAuditionVoice.textContent = '▶️ Audition Voice';
        },
        onError: (err) => {
          btnAuditionVoice.disabled = false;
          btnAuditionVoice.textContent = '▶️ Audition Voice';
          console.warn('Audition error:', err);
        }
      });
    } catch (err) {
      btnAuditionVoice.disabled = false;
      btnAuditionVoice.textContent = '▶️ Audition Voice';
      alert(`Audition error: ${err.message}`);
    }
  });
}

if (btnStopAudition) {
  btnStopAudition.addEventListener('click', () => {
    audioStudio.stop();
    if (btnAuditionVoice) {
      btnAuditionVoice.disabled = false;
      btnAuditionVoice.textContent = '▶️ Audition Voice';
    }
  });
}

// Voice Cloning, Merger, and F5-TTS Tabs
function switchVoiceSubTab(activeTab) {
  if (btnTabVoiceClone) btnTabVoiceClone.className = activeTab === 'clone' ? 'btn btn-xs btn-primary' : 'btn btn-xs btn-secondary';
  if (btnTabVoiceMerger) btnTabVoiceMerger.className = activeTab === 'merger' ? 'btn btn-xs btn-primary' : 'btn btn-xs btn-secondary';
  if (btnTabF5TTS) btnTabF5TTS.className = activeTab === 'f5tts' ? 'btn btn-xs btn-primary' : 'btn btn-xs btn-secondary';

  if (panelVoiceClone) panelVoiceClone.style.display = activeTab === 'clone' ? 'block' : 'none';
  if (panelVoiceMerger) panelVoiceMerger.style.display = activeTab === 'merger' ? 'block' : 'none';
  if (panelF5TTS) panelF5TTS.style.display = activeTab === 'f5tts' ? 'block' : 'none';
}

if (btnTabVoiceClone) btnTabVoiceClone.addEventListener('click', () => switchVoiceSubTab('clone'));
if (btnTabVoiceMerger) btnTabVoiceMerger.addEventListener('click', () => switchVoiceSubTab('merger'));
if (btnTabF5TTS) btnTabF5TTS.addEventListener('click', () => switchVoiceSubTab('f5tts'));

// Helper to load any imported audio file (F5-TTS WAV / MP3) into the Studio Master player
function loadMasterAudioTrack(file, sourceLabel = 'F5-TTS') {
  if (!file) return;
  state.generatedAudioBlob = file;
  if (state.generatedAudioUrl) {
    URL.revokeObjectURL(state.generatedAudioUrl);
  }
  state.generatedAudioUrl = URL.createObjectURL(file);

  if (audioStudioPlayer) {
    audioStudioPlayer.src = state.generatedAudioUrl;
    audioStudioPlayer.style.display = 'block';
    audioStudioPlayer.load();
  }

  if (btnDownloadAudioTrack) {
    btnDownloadAudioTrack.href = state.generatedAudioUrl;
    btnDownloadAudioTrack.download = file.name || `audio_track_${Date.now()}.wav`;
    btnDownloadAudioTrack.style.pointerEvents = 'auto';
    btnDownloadAudioTrack.style.opacity = '1';
  }

  if (btnAttachToMergedVideo) {
    btnAttachToMergedVideo.disabled = false;
  }

  const btnMasterAudioWithDSP = document.getElementById('btnMasterAudioWithDSP');
  const btnSendVoiceToEditor = document.getElementById('btnSendVoiceToEditor');
  if (btnMasterAudioWithDSP) btnMasterAudioWithDSP.style.display = 'inline-flex';
  if (btnSendVoiceToEditor) btnSendVoiceToEditor.style.display = 'inline-flex';

  if (audioPlayerStatus) {
    audioPlayerStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">✅ ${sourceLabel} audio loaded (${(file.size / 1024).toFixed(1)} KB)! Ready to attach to video.</span>`;
  }
}

// F5-TTS Audio File Import
if (btnImportF5TTSWav && f5ttsAudioFileInput) {
  btnImportF5TTSWav.addEventListener('click', () => {
    f5ttsAudioFileInput.click();
  });

  f5ttsAudioFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      loadMasterAudioTrack(file, 'F5-TTS Neural Clone');
      if (f5ttsImportStatus) {
        f5ttsImportStatus.style.display = 'block';
        f5ttsImportStatus.textContent = `✅ Loaded "${file.name}" into Master Output!`;
      }
    }
  });
}

// Quick Audio Import in Master Output Strip
if (btnQuickImportExternalAudio && quickImportAudioInput) {
  btnQuickImportExternalAudio.addEventListener('click', () => {
    quickImportAudioInput.click();
  });

  quickImportAudioInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      loadMasterAudioTrack(file, 'External Audio Track');
    }
  });
}

// Microphone Voice Recording for Cloning
let micRecordingTimer = null;
let micSecondsLeft = 5;

if (btnToggleMicRecord) {
  btnToggleMicRecord.addEventListener('click', async () => {
    if (!audioStudio.isRecording) {
      try {
        await audioStudio.startVoiceCloneRecording();
        if (cloneRecorderBox) cloneRecorderBox.classList.add('recording');
        if (micRecordBtnLabel) micRecordBtnLabel.textContent = 'Stop Recording';
        micSecondsLeft = 5;
        if (micTimerLabel) micTimerLabel.textContent = `🔴 Sampling audio... 5s remaining`;

        micRecordingTimer = setInterval(async () => {
          micSecondsLeft--;
          if (micSecondsLeft > 0) {
            if (micTimerLabel) micTimerLabel.textContent = `🔴 Sampling audio... ${micSecondsLeft}s remaining`;
          } else {
            clearInterval(micRecordingTimer);
            await finishMicClone();
          }
        }, 1000);
      } catch (err) {
        alert(`Microphone error: ${err.message}`);
      }
    } else {
      if (micRecordingTimer) clearInterval(micRecordingTimer);
      await finishMicClone();
    }
  });
}

async function finishMicClone() {
  if (cloneRecorderBox) cloneRecorderBox.classList.remove('recording');
  if (micRecordBtnLabel) micRecordBtnLabel.textContent = 'Record Voice (Mic)';
  if (micTimerLabel) micTimerLabel.textContent = 'Processing vocal profile...';

  try {
    const profile = await audioStudio.stopVoiceCloneRecording();
    if (profile) {
      showCloneProfileResults(profile, 'Mic Voice Sample');
    }
  } catch (err) {
    alert(`Voice profile extraction failed: ${err.message}`);
  }
}

// Audio File Upload for Voice Cloning
if (btnUploadCloneAudio && audioCloneFileInput) {
  btnUploadCloneAudio.addEventListener('click', () => {
    audioCloneFileInput.click();
  });

  audioCloneFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const profile = await audioStudio.analyzeVoiceSample(file);
        showCloneProfileResults({ ...profile, blob: file }, file.name);
      } catch (err) {
        alert(`Voice analysis failed: ${err.message}`);
      }
    }
  });
}

let latestExtractedProfile = null;

function showCloneProfileResults(profile, nameLabel) {
  latestExtractedProfile = profile;
  const cloneSpeechDensity = document.getElementById('cloneSpeechDensity');
  const cloneAlgorithm = document.getElementById('cloneAlgorithm');

  if (cloneResultCard) cloneResultCard.style.display = 'block';
  if (cloneFreqHz) cloneFreqHz.textContent = `${profile.estimatedFreqHz} Hz (Fundamental F0)`;
  if (cloneTimbre) cloneTimbre.textContent = profile.timbre || 'Natural Voice';
  if (clonePitchVal) clonePitchVal.textContent = `${profile.suggestedPitch}x`;
  if (cloneSpeechDensity && profile.speechDensityPercent) {
    cloneSpeechDensity.textContent = `${profile.speechDensityPercent}% active phonemes`;
  }
  if (cloneAlgorithm && profile.analysisMethod) {
    cloneAlgorithm.textContent = profile.analysisMethod;
  }
  if (micTimerLabel) micTimerLabel.textContent = `✅ 10s voice profile analyzed from ${nameLabel}!`;
}

if (btnApplyClonedVoice) {
  btnApplyClonedVoice.addEventListener('click', () => {
    if (!latestExtractedProfile) return;
    const customVoice = {
      name: `Cloned Voice (${latestExtractedProfile.timbre}, ${latestExtractedProfile.estimatedFreqHz}Hz)`,
      pitch: latestExtractedProfile.suggestedPitch,
      rate: latestExtractedProfile.suggestedRate || 1.0,
      timbre: latestExtractedProfile.timbre,
    };
    clonedCustomVoices.push(customVoice);
    initAudioStudioVoicesUI();

    if (audioPitchSlider) {
      audioPitchSlider.value = customVoice.pitch;
      if (labelAudioPitch) labelAudioPitch.textContent = `${customVoice.pitch}x`;
    }
    if (audioVoiceSelect) {
      audioVoiceSelect.value = `custom_${clonedCustomVoices.length - 1}`;
    }
    alert('Cloned voice applied! You can now audition or synthesize with this profile.');
  });
}

// Voice Merger / Hybrid Voice Creation
if (mergeRatioSlider && labelMergeRatio) {
  mergeRatioSlider.addEventListener('input', () => {
    const val = parseInt(mergeRatioSlider.value, 10);
    labelMergeRatio.textContent = `${val}% A / ${100 - val}% B`;
  });
}

if (btnSynthesizeMergedVoice) {
  btnSynthesizeMergedVoice.addEventListener('click', () => {
    const toneA = mergeVoiceA ? mergeVoiceA.value : 'storyteller';
    const toneB = mergeVoiceB ? mergeVoiceB.value : 'energetic';
    const ratioA = mergeRatioSlider ? parseInt(mergeRatioSlider.value, 10) / 100 : 0.5;

    let presetA = audioStudio.TONE_PRESETS[toneA];
    if (!presetA && typeof audioStudio.getGoogleVoiceById === 'function') {
      const model = audioStudio.getGoogleVoiceById(toneA);
      if (model) presetA = { pitch: model.pitch, rate: model.rate, label: model.name };
    }
    if (!presetA) presetA = { pitch: 1.0, rate: 1.0, label: toneA };

    let presetB = audioStudio.TONE_PRESETS[toneB];
    if (!presetB && typeof audioStudio.getGoogleVoiceById === 'function') {
      const model = audioStudio.getGoogleVoiceById(toneB);
      if (model) presetB = { pitch: model.pitch, rate: model.rate, label: model.name };
    }
    if (!presetB) presetB = { pitch: 1.0, rate: 1.0, label: toneB };

    const hybrid = audioStudio.createMergedVoice(presetA, presetB, ratioA);
    clonedCustomVoices.push({
      name: hybrid.name,
      pitch: hybrid.pitch,
      rate: hybrid.rate,
      timbre: `${Math.round(ratioA * 100)}% ${toneA} + ${Math.round((1 - ratioA) * 100)}% ${toneB}`,
    });

    initAudioStudioVoicesUI();
    if (audioVoiceSelect) {
      audioVoiceSelect.value = `custom_${clonedCustomVoices.length - 1}`;
    }
    if (audioPitchSlider) {
      audioPitchSlider.value = hybrid.pitch;
      if (labelAudioPitch) labelAudioPitch.textContent = `${hybrid.pitch.toFixed(2)}x`;
    }
    if (audioRateSlider) {
      audioRateSlider.value = hybrid.rate;
      if (labelAudioRate) labelAudioRate.textContent = `${hybrid.rate.toFixed(2)}x`;
    }

    if (mergeVoiceStatus) {
      mergeVoiceStatus.style.display = 'block';
      mergeVoiceStatus.textContent = `🧬 Synthesized ${hybrid.name} (Pitch: ${hybrid.pitch}x, Rate: ${hybrid.rate}x)! Added to voice selector.`;
    }
  });
}

// Synthesize Full Voiceover Audio Track (WAV)
if (btnSynthesizeFullAudio) {
  btnSynthesizeFullAudio.addEventListener('click', async () => {
    const text = audioScriptInput ? audioScriptInput.value.trim() : '';
    if (!text) {
      alert('Please enter a script to generate your audio track.');
      return;
    }

    const voiceObj = getSelectedVoiceObject();
    const pitch = audioPitchSlider ? parseFloat(audioPitchSlider.value) : 1.0;
    const rate = audioRateSlider ? parseFloat(audioRateSlider.value) : 1.0;
    const lang = audioLangSelect ? audioLangSelect.value : 'te-IN';

    btnSynthesizeFullAudio.disabled = true;
    if (audioPlayerStatus) {
      audioPlayerStatus.textContent = '⏳ Rendering full voiceover audio track to WAV...';
      audioPlayerStatus.style.color = 'var(--accent-primary)';
    }

    try {
      const wavBlob = await audioStudio.recordSpeechToWavBlob(text, {
        voice: voiceObj && voiceObj.name ? voiceObj : undefined,
        lang,
        pitch,
        rate,
      });

      state.generatedAudioBlob = wavBlob;
      state.generatedAudioUrl = URL.createObjectURL(wavBlob);

      if (audioStudioPlayer) {
        audioStudioPlayer.src = state.generatedAudioUrl;
        audioStudioPlayer.style.display = 'block';
        audioStudioPlayer.load();
      }

      if (btnDownloadAudioTrack) {
        btnDownloadAudioTrack.href = state.generatedAudioUrl;
        btnDownloadAudioTrack.download = `voiceover_${lang}_${Date.now()}.wav`;
        btnDownloadAudioTrack.style.pointerEvents = 'auto';
        btnDownloadAudioTrack.style.opacity = '1';
      }

      if (btnAttachToMergedVideo) {
        btnAttachToMergedVideo.disabled = false;
      }

      const btnMasterAudioWithDSP = document.getElementById('btnMasterAudioWithDSP');
      const btnSendVoiceToEditor = document.getElementById('btnSendVoiceToEditor');
      if (btnMasterAudioWithDSP) btnMasterAudioWithDSP.style.display = 'inline-flex';
      if (btnSendVoiceToEditor) btnSendVoiceToEditor.style.display = 'inline-flex';

      if (audioPlayerStatus) {
        audioPlayerStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">✅ Voiceover ready! ${(wavBlob.size / 1024).toFixed(1)} KB rendered. Play below or attach to video.</span>`;
      }
    } catch (err) {
      alert(`Audio synthesis failed: ${err.message}`);
      if (audioPlayerStatus) audioPlayerStatus.textContent = `Error: ${err.message}`;
    } finally {
      btnSynthesizeFullAudio.disabled = false;
    }
  });
}

// Attach Voiceover to Merged Video
if (btnAttachToMergedVideo) {
  btnAttachToMergedVideo.addEventListener('click', async () => {
    const videoSource = state.upscaledMergedResult?.blob || state.mergedResult?.blob;
    if (!videoSource) {
      alert('No merged video found! Please merge your video clips in the Stitch & AI Editor tab first.');
      return;
    }

    if (!state.generatedAudioBlob) {
      alert('Please generate the voiceover audio track first.');
      return;
    }

    btnAttachToMergedVideo.disabled = true;
    if (audioAttachResultStatus) {
      audioAttachResultStatus.style.display = 'block';
      audioAttachResultStatus.textContent = '🎬 Multiplexing audio soundtrack into video using FFmpeg.wasm...';
    }

    try {
      const mergedWithAudio = await ffmpegHandler.attachAudioToVideo(videoSource, state.generatedAudioBlob, { mode: 'replace' });

      outputVideoPlayer.src = mergedWithAudio.blobUrl;
      outputVideoPlayer.load();

      downloadBtn.href = mergedWithAudio.blobUrl;
      downloadBtn.download = `clipmerge-final-voiceover.mp4`;

      if (audioAttachResultStatus) {
        audioAttachResultStatus.innerHTML = `<span style="color: var(--success); font-weight: 600;">🎉 Voiceover successfully attached to your video! Switch to "Stitch & AI Editor" tab to watch and download final cut.</span>`;
      }
      alert('Voiceover attached! Returning to Stitch & AI Editor to preview your completed video.');
      switchAppView('viewStitchEdit');
    } catch (err) {
      alert(`Multiplexing failed: ${err.message}`);
      if (audioAttachResultStatus) {
        audioAttachResultStatus.textContent = `Error: ${err.message}`;
      }
    } finally {
      btnAttachToMergedVideo.disabled = false;
    }
  });
}

// ====================================================
// AUDIO STUDIO SUB-NAVIGATION CONTROLLER
// ====================================================
function switchAudioSubTab(tabName) {
  const tabs = [
    { name: 'narration', btn: btnSubTabNarration, panel: subViewNarration },
    { name: 'characters', btn: btnSubTabCharacters, panel: subViewCharacters },
    { name: 'merger', btn: btnSubTabMerger, panel: subViewMerger },
    { name: 'library', btn: btnSubTabLibrary, panel: subViewLibrary },
  ];

  tabs.forEach(t => {
    const isActive = t.name === tabName;
    if (t.btn) {
      if (isActive) t.btn.classList.add('active');
      else t.btn.classList.remove('active');
    }
    if (t.panel) {
      t.panel.style.display = isActive ? 'block' : 'none';
    }
  });

  if (tabName === 'characters') {
    renderCharactersUI();
  } else if (tabName === 'merger') {
    updateMergerPreviewBubbles();
  } else if (tabName === 'library') {
    renderVoiceLibraryUI();
  }
}

if (btnSubTabNarration) btnSubTabNarration.addEventListener('click', () => switchAudioSubTab('narration'));
if (btnSubTabCharacters) btnSubTabCharacters.addEventListener('click', () => switchAudioSubTab('characters'));
if (btnSubTabMerger) btnSubTabMerger.addEventListener('click', () => switchAudioSubTab('merger'));
if (btnSubTabLibrary) btnSubTabLibrary.addEventListener('click', () => switchAudioSubTab('library'));
if (btnQuickBrowseLibrary) btnQuickBrowseLibrary.addEventListener('click', () => switchAudioSubTab('library'));

// ====================================================
// CHARACTER CAST & VOICE STUDIO CONTROLLER
// ====================================================
const AVATAR_PRESETS = [
  { id: 'hero', name: 'Hero', emoji: '🦸‍♂️', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', gender: 'male' },
  { id: 'detective', name: 'Detective', emoji: '🕵️‍♀️', bg: 'linear-gradient(135deg, #6366f1, #4338ca)', gender: 'female' },
  { id: 'elder', name: 'Elder', emoji: '🧙‍♂️', bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', gender: 'male' },
  { id: 'hacker', name: 'Cyber Hacker', emoji: '👩‍💻', bg: 'linear-gradient(135deg, #10b981, #047857)', gender: 'female' },
  { id: 'queen', name: 'Queen', emoji: '👑', bg: 'linear-gradient(135deg, #ec4899, #be185d)', gender: 'female' },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', bg: 'linear-gradient(135deg, #f59e0b, #b45309)', gender: 'male' },
  { id: 'robot', name: 'Android', emoji: '🤖', bg: 'linear-gradient(135deg, #06b6d4, #0e7490)', gender: 'male' },
  { id: 'anchor', name: 'News Anchor', emoji: '🎙️', bg: 'linear-gradient(135deg, #3b82f6, #1e40af)', gender: 'female' },
  { id: 'creator', name: 'Tech Creator', emoji: '⚡', bg: 'linear-gradient(135deg, #f97316, #c2410c)', gender: 'male' },
  { id: 'storyteller', name: 'Storyteller', emoji: '📖', bg: 'linear-gradient(135deg, #a855f7, #7e22ce)', gender: 'female' },
  { id: 'telugu_hero', name: 'Telugu Hero', emoji: '🦁', bg: 'linear-gradient(135deg, #ef4444, #b91c1c)', gender: 'male' },
  { id: 'telugu_host', name: 'Telugu Hostess', emoji: '🌺', bg: 'linear-gradient(135deg, #f43f5e, #be123c)', gender: 'female' },
];

let selectedAvatarType = 'preset';
let selectedAvatarPresetId = 'hero';
let uploadedAvatarDataUrl = '';
let activeCharGenderFilter = 'all';

function renderPresetAvatarsGrid() {
  if (!presetAvatarsGrid) return;
  presetAvatarsGrid.innerHTML = '';
  AVATAR_PRESETS.forEach(p => {
    const div = document.createElement('div');
    div.className = `preset-avatar-chip ${selectedAvatarPresetId === p.id && selectedAvatarType === 'preset' ? 'active' : ''}`;
    div.style.background = p.bg;
    div.title = `${p.name} (${p.gender})`;
    div.innerHTML = `<span>${p.emoji}</span>`;
    div.addEventListener('click', () => {
      selectedAvatarType = 'preset';
      selectedAvatarPresetId = p.id;
      uploadedAvatarDataUrl = '';
      document.querySelectorAll('.preset-avatar-chip').forEach(c => c.classList.remove('active'));
      div.classList.add('active');
      updateAvatarPreviewDisplay();
    });
    presetAvatarsGrid.appendChild(div);
  });
}

function updateAvatarPreviewDisplay() {
  if (!charAvatarPreview) return;
  if (selectedAvatarType === 'upload' && uploadedAvatarDataUrl) {
    if (charAvatarImg) {
      charAvatarImg.src = uploadedAvatarDataUrl;
      charAvatarImg.style.display = 'block';
    }
    if (charAvatarPlaceholder) charAvatarPlaceholder.style.display = 'none';
    charAvatarPreview.style.background = 'var(--bg-tertiary)';
  } else {
    const preset = AVATAR_PRESETS.find(p => p.id === selectedAvatarPresetId) || AVATAR_PRESETS[0];
    if (charAvatarImg) charAvatarImg.style.display = 'none';
    if (charAvatarPlaceholder) {
      charAvatarPlaceholder.style.display = 'block';
      charAvatarPlaceholder.textContent = preset.emoji;
    }
    charAvatarPreview.style.background = preset.bg;
  }
}

if (btnTabAvatarPresets) {
  btnTabAvatarPresets.addEventListener('click', () => {
    btnTabAvatarPresets.className = 'btn btn-xs btn-primary';
    if (btnTabAvatarUpload) btnTabAvatarUpload.className = 'btn btn-xs btn-secondary';
    if (presetAvatarsGrid) presetAvatarsGrid.style.display = 'grid';
    if (avatarUploadContainer) avatarUploadContainer.style.display = 'none';
  });
}

if (btnTabAvatarUpload) {
  btnTabAvatarUpload.addEventListener('click', () => {
    btnTabAvatarUpload.className = 'btn btn-xs btn-primary';
    if (btnTabAvatarPresets) btnTabAvatarPresets.className = 'btn btn-xs btn-secondary';
    if (presetAvatarsGrid) presetAvatarsGrid.style.display = 'none';
    if (avatarUploadContainer) avatarUploadContainer.style.display = 'block';
  });
}

if (btnTriggerAvatarUpload && charAvatarFileInput) {
  btnTriggerAvatarUpload.addEventListener('click', () => {
    charAvatarFileInput.click();
  });
  charAvatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedAvatarDataUrl = evt.target.result;
        selectedAvatarType = 'upload';
        updateAvatarPreviewDisplay();
      };
      reader.readAsDataURL(file);
    }
  });
}

if (charAvatarUrlInput) {
  charAvatarUrlInput.addEventListener('input', () => {
    const url = charAvatarUrlInput.value.trim();
    if (url) {
      uploadedAvatarDataUrl = url;
      selectedAvatarType = 'upload';
      updateAvatarPreviewDisplay();
    }
  });
}

function updateCharSlidersFromVoice(voiceVal) {
  const model = resolveVoiceModel(voiceVal);
  if (model) {
    if (charPitchSlider && labelCharPitch) {
      charPitchSlider.value = model.pitch || 1.0;
      labelCharPitch.textContent = `${Number(model.pitch || 1.0).toFixed(2)}x`;
    }
    if (charRateSlider && labelCharRate) {
      charRateSlider.value = model.rate || 1.0;
      labelCharRate.textContent = `${Number(model.rate || 1.0).toFixed(2)}x`;
    }
  }
}

if (charVoiceSelect) {
  charVoiceSelect.addEventListener('change', () => {
    updateCharSlidersFromVoice(charVoiceSelect.value);
  });
}

if (charGenderMale) {
  charGenderMale.addEventListener('change', () => {
    if (charGenderMale.checked && charVoiceSelect) {
      const current = charVoiceSelect.value;
      const model = resolveVoiceModel(current);
      if (!model || model.gender === 'female') {
        charVoiceSelect.value = 'google_gemini-puck';
        updateCharSlidersFromVoice('google_gemini-puck');
      }
    }
  });
}

if (charGenderFemale) {
  charGenderFemale.addEventListener('change', () => {
    if (charGenderFemale.checked && charVoiceSelect) {
      const current = charVoiceSelect.value;
      const model = resolveVoiceModel(current);
      if (!model || model.gender === 'male') {
        charVoiceSelect.value = 'google_gemini-lyra';
        updateCharSlidersFromVoice('google_gemini-lyra');
      }
    }
  });
}

if (charPitchSlider && labelCharPitch) {
  charPitchSlider.addEventListener('input', () => {
    labelCharPitch.textContent = `${parseFloat(charPitchSlider.value).toFixed(2)}x`;
  });
}

if (charRateSlider && labelCharRate) {
  charRateSlider.addEventListener('input', () => {
    labelCharRate.textContent = `${parseFloat(charRateSlider.value).toFixed(2)}x`;
  });
}

if (btnAuditionSelectedCharVoice) {
  btnAuditionSelectedCharVoice.addEventListener('click', () => {
    const text = (charScriptInput && charScriptInput.value.trim()) || `Hello, my name is ${charNameInput?.value.trim() || 'this character'}. I am ready for action in your video production.`;
    const voiceVal = charVoiceSelect ? charVoiceSelect.value : 'google_gemini-lyra';
    const pitch = charPitchSlider ? parseFloat(charPitchSlider.value) : 1.0;
    const rate = charRateSlider ? parseFloat(charRateSlider.value) : 1.0;

    const model = resolveVoiceModel(voiceVal);
    btnAuditionSelectedCharVoice.disabled = true;
    btnAuditionSelectedCharVoice.textContent = '🔊 Speaking...';

    audioStudio.speakVoiceModel(text, model || voiceVal, {
      pitch,
      rate,
      onEnd: () => {
        btnAuditionSelectedCharVoice.disabled = false;
        btnAuditionSelectedCharVoice.textContent = '▶️ Audition Voice';
      },
      onError: () => {
        btnAuditionSelectedCharVoice.disabled = false;
        btnAuditionSelectedCharVoice.textContent = '▶️ Audition Voice';
      }
    });
  });
}

function setupCharacterFilters() {
  const pills = [
    { btn: charFilterAll, gender: 'all' },
    { btn: charFilterMale, gender: 'male' },
    { btn: charFilterFemale, gender: 'female' },
  ];

  pills.forEach(p => {
    if (p.btn) {
      p.btn.addEventListener('click', () => {
        activeCharGenderFilter = p.gender;
        pills.forEach(x => {
          if (x.btn) x.btn.classList.toggle('active', x.gender === p.gender);
        });
        renderCharactersUI();
      });
    }
  });

  if (charSearchInput) {
    charSearchInput.addEventListener('input', () => {
      renderCharactersUI();
    });
  }
}

function renderCharactersUI() {
  if (!charactersGrid) return;
  const q = charSearchInput ? charSearchInput.value.trim().toLowerCase() : '';

  let list = [...state.characters];

  // Gender filter
  if (activeCharGenderFilter !== 'all') {
    list = list.filter(c => (c.gender || 'male').toLowerCase() === activeCharGenderFilter);
  }

  // Search filter
  if (q) {
    list = list.filter(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      (c.script_text || '').toLowerCase().includes(q)
    );
  }

  if (characterCountBadge) characterCountBadge.textContent = state.characters.length;

  if (list.length === 0) {
    charactersGrid.innerHTML = `
      <div class="empty-characters-box">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎭</div>
        <h4>No Characters Found</h4>
        <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 380px; margin: 0 auto 1rem;">
          ${q ? 'No characters match your search filter. Try clearing your search.' : 'Create character personalities with specific Google voices, custom avatars, and dialogue lines.'}
        </p>
        <button type="button" class="btn btn-primary btn-sm" id="btnEmptyAddChar">
          ➕ Create Character
        </button>
      </div>
    `;
    const btnEmptyAddChar = document.getElementById('btnEmptyAddChar');
    if (btnEmptyAddChar) btnEmptyAddChar.addEventListener('click', () => openCharacterModal());
    return;
  }

  charactersGrid.innerHTML = '';
  list.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card';

    const voiceModel = resolveVoiceModel(char.voice_id);
    const voiceName = voiceModel ? voiceModel.name : (char.voice_id || 'Gemini AI Voice');
    const voiceTimbre = voiceModel ? voiceModel.timbre : 'Expressive';
    const voiceBadge = voiceModel?.avatarBadge || '✨';

    let avatarHtml = '';
    if (char.avatar_url) {
      avatarHtml = `<img src="${escapeHtml(char.avatar_url)}" alt="${escapeHtml(char.name)}" class="char-card-avatar-img">`;
    } else {
      const preset = AVATAR_PRESETS.find(p => p.id === char.avatar_preset) || AVATAR_PRESETS[0];
      avatarHtml = `<div class="char-card-avatar-preset" style="background: ${preset.bg};">${preset.emoji}</div>`;
    }

    const isMale = (char.gender || 'male').toLowerCase() === 'male';
    const genderClass = isMale ? 'pill-male' : 'pill-female';
    const genderLabel = isMale ? '👨 Male' : '👩 Female';
    const pitch = char.voice_settings?.pitch || 1.0;
    const rate = char.voice_settings?.rate || 1.0;

    card.innerHTML = `
      <div class="char-card-header">
        ${avatarHtml}
        <div class="char-card-info">
          <div class="char-card-title-row">
            <h4 class="char-card-name">${escapeHtml(char.name)}</h4>
            <span class="gender-pill ${genderClass} gender-pill-sm">${genderLabel}</span>
          </div>
          <div class="char-card-role">${escapeHtml(char.role || 'Production Character')}</div>
        </div>
      </div>

      <div class="char-card-voice-badge">
        <span style="font-size: 1rem;">${voiceBadge}</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(voiceName)}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">
            ${escapeHtml(voiceTimbre)} • Pitch: ${Number(pitch).toFixed(2)}x, Speed: ${Number(rate).toFixed(2)}x
          </div>
        </div>
      </div>

      <div class="char-card-script-box">
        <div class="char-script-tag">Dialogue Script</div>
        <p class="char-script-text">${escapeHtml(char.script_text || 'No dialogue script added yet. Click edit to write lines.')}</p>
      </div>

      <div class="char-card-actions">
        <button type="button" class="btn btn-xs btn-primary btn-char-speak" data-id="${char.id}" title="Audition Dialogue">
          🔊 Audition
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-char-export-wav" data-id="${char.id}" title="Export dialogue audio track (WAV)">
          ⬇️ Export Audio
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-char-insert-script" data-id="${char.id}" title="Append dialogue to video script">
          ➕ Add to Script
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-char-edit" data-id="${char.id}" title="Edit character">
          ✏️ Edit
        </button>
        <button type="button" class="btn btn-xs btn-danger btn-char-delete" data-id="${char.id}" title="Delete character">
          🗑️
        </button>
      </div>
    `;

    charactersGrid.appendChild(card);
  });

  attachCharacterCardListeners();
}

function attachCharacterCardListeners() {
  document.querySelectorAll('.btn-char-speak').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const char = state.characters.find(c => c.id === id);
      if (!char) return;
      const text = char.script_text || `Hi, I am ${char.name}.`;
      const model = resolveVoiceModel(char.voice_id);
      const pitch = char.voice_settings?.pitch || 1.0;
      const rate = char.voice_settings?.rate || 1.0;

      btn.disabled = true;
      const origText = btn.innerHTML;
      btn.innerHTML = '🔊 Speaking...';

      audioStudio.speakVoiceModel(text, model || char.voice_id, {
        pitch,
        rate,
        onEnd: () => {
          btn.disabled = false;
          btn.innerHTML = origText;
        },
        onError: () => {
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      });
    });
  });

  document.querySelectorAll('.btn-char-export-wav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const char = state.characters.find(c => c.id === id);
      if (!char) return;
      const text = char.script_text || `Hello, this is ${char.name}.`;
      const model = resolveVoiceModel(char.voice_id);
      const pitch = char.voice_settings?.pitch || 1.0;
      const rate = char.voice_settings?.rate || 1.0;

      btn.disabled = true;
      const origText = btn.innerHTML;
      btn.innerHTML = '⏳ Rendering...';

      try {
        const wavBlob = await audioStudio.recordSpeechToWavBlob(text, {
          voice: model ? audioStudio.findBestBrowserVoiceForModel(model) : undefined,
          lang: model?.language || 'en-US',
          pitch,
          rate,
        });

        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${char.name.toLowerCase().replace(/\s+/g, '_')}_dialogue.wav`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert(`Export failed: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });
  });

  document.querySelectorAll('.btn-char-insert-script').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const char = state.characters.find(c => c.id === id);
      if (!char) return;
      const line = `[${char.name}]: ${char.script_text || ''}\n\n`;
      if (audioScriptInput) {
        audioScriptInput.value += (audioScriptInput.value ? '\n' : '') + line;
        updateAudioScriptStats();
      }
      if (scriptText) {
        scriptText.value += (scriptText.value ? '\n' : '') + line;
      }
      alert(`Added ${char.name}'s lines to Master Script!`);
    });
  });

  document.querySelectorAll('.btn-char-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openCharacterModal(id);
    });
  });

  document.querySelectorAll('.btn-char-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const char = state.characters.find(c => c.id === id);
      if (!char) return;
      if (confirm(`Delete character "${char.name}"?`)) {
        state.characters = state.characters.filter(c => c.id !== id);
        localStorage.setItem('clipmerge_characters', JSON.stringify(state.characters));
        try {
          await sqliteService.deleteCharacter(id);
        } catch (err) {
          console.warn('SQLite delete character error:', err);
        }
        renderCharactersUI();
      }
    });
  });
}

function openCharacterModal(charId = null) {
  renderPresetAvatarsGrid();
  if (charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    if (modalCharacterTitle) modalCharacterTitle.textContent = `✏️ Edit Character: ${char.name}`;
    if (charEditId) charEditId.value = char.id;
    if (charNameInput) charNameInput.value = char.name;
    if (charRoleInput) charRoleInput.value = char.role || '';
    if (char.gender === 'female') {
      if (charGenderFemale) charGenderFemale.checked = true;
    } else {
      if (charGenderMale) charGenderMale.checked = true;
    }
    if (charVoiceSelect && char.voice_id) charVoiceSelect.value = char.voice_id;
    if (charPitchSlider) {
      charPitchSlider.value = char.voice_settings?.pitch || 1.0;
      if (labelCharPitch) labelCharPitch.textContent = `${Number(charPitchSlider.value).toFixed(2)}x`;
    }
    if (charRateSlider) {
      charRateSlider.value = char.voice_settings?.rate || 1.0;
      if (labelCharRate) labelCharRate.textContent = `${Number(charRateSlider.value).toFixed(2)}x`;
    }
    if (charScriptInput) charScriptInput.value = char.script_text || '';

    if (char.avatar_url) {
      selectedAvatarType = 'upload';
      uploadedAvatarDataUrl = char.avatar_url;
      if (charAvatarUrlInput) charAvatarUrlInput.value = char.avatar_url;
      if (btnTabAvatarUpload) btnTabAvatarUpload.click();
    } else {
      selectedAvatarType = 'preset';
      selectedAvatarPresetId = char.avatar_preset || 'hero';
      if (btnTabAvatarPresets) btnTabAvatarPresets.click();
    }
    updateAvatarPreviewDisplay();
  } else {
    if (modalCharacterTitle) modalCharacterTitle.textContent = '👤 Add New Character';
    if (charEditId) charEditId.value = '';
    if (charNameInput) charNameInput.value = '';
    if (charRoleInput) charRoleInput.value = '';
    if (charGenderMale) charGenderMale.checked = true;
    if (charVoiceSelect) charVoiceSelect.value = 'google_gemini-puck';
    if (charPitchSlider) {
      charPitchSlider.value = 1.0;
      if (labelCharPitch) labelCharPitch.textContent = '1.00x';
    }
    if (charRateSlider) {
      charRateSlider.value = 1.0;
      if (labelCharRate) labelCharRate.textContent = '1.00x';
    }
    if (charScriptInput) charScriptInput.value = '';
    selectedAvatarType = 'preset';
    selectedAvatarPresetId = 'hero';
    uploadedAvatarDataUrl = '';
    if (charAvatarUrlInput) charAvatarUrlInput.value = '';
    if (btnTabAvatarPresets) btnTabAvatarPresets.click();
    updateAvatarPreviewDisplay();
  }

  if (characterModal) characterModal.style.display = 'flex';
}

if (btnOpenAddCharacterModal) {
  btnOpenAddCharacterModal.addEventListener('click', () => openCharacterModal());
}
if (btnCloseCharModal) {
  btnCloseCharModal.addEventListener('click', () => {
    if (characterModal) characterModal.style.display = 'none';
  });
}
if (btnCancelCharModal) {
  btnCancelCharModal.addEventListener('click', () => {
    if (characterModal) characterModal.style.display = 'none';
  });
}

if (btnSaveCharacter) {
  btnSaveCharacter.addEventListener('click', async () => {
    const name = charNameInput ? charNameInput.value.trim() : '';
    if (!name) {
      alert('Please enter a character name.');
      if (charNameInput) charNameInput.focus();
      return;
    }

    const editId = charEditId ? charEditId.value : '';
    const id = editId || `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const gender = (charGenderFemale && charGenderFemale.checked) ? 'female' : 'male';
    const role = charRoleInput ? charRoleInput.value.trim() : '';
    const voiceId = charVoiceSelect ? charVoiceSelect.value : 'google_gemini-lyra';
    const pitch = charPitchSlider ? parseFloat(charPitchSlider.value) : 1.0;
    const rate = charRateSlider ? parseFloat(charRateSlider.value) : 1.0;
    const script = charScriptInput ? charScriptInput.value.trim() : '';

    const charData = {
      id,
      name,
      role,
      gender,
      voice_id: voiceId,
      voice_settings: { pitch, rate },
      script_text: script,
      avatar_preset: selectedAvatarType === 'preset' ? selectedAvatarPresetId : '',
      avatar_url: selectedAvatarType === 'upload' ? uploadedAvatarDataUrl : '',
    };

    const existingIdx = state.characters.findIndex(c => c.id === id);
    if (existingIdx >= 0) {
      state.characters[existingIdx] = charData;
    } else {
      state.characters.unshift(charData);
    }

    localStorage.setItem('clipmerge_characters', JSON.stringify(state.characters));

    try {
      await sqliteService.saveCharacter(charData);
    } catch (err) {
      console.warn('SQLite character save warning:', err);
    }

    if (characterModal) characterModal.style.display = 'none';
    renderCharactersUI();
  });
}

// ====================================================
// GOOGLE VOICE MERGER STUDIO CONTROLLER
// ====================================================
function updateMergerPreviewBubbles() {
  const valA = selectMergerVoiceA ? selectMergerVoiceA.value : 'google_gemini-puck';
  const valB = selectMergerVoiceB ? selectMergerVoiceB.value : 'google_gemini-lyra';

  const modelA = resolveVoiceModel(valA);
  const modelB = resolveVoiceModel(valB);

  if (bubbleAName) bubbleAName.textContent = modelA ? modelA.name : valA;
  if (bubbleADesc) bubbleADesc.textContent = modelA ? `${(modelA.gender || 'male').toLowerCase() === 'male' ? '👨 Male' : '👩 Female'} • ${modelA.timbre}` : 'Voice A';

  if (bubbleBName) bubbleBName.textContent = modelB ? modelB.name : valB;
  if (bubbleBDesc) bubbleBDesc.textContent = modelB ? `${(modelB.gender || 'female').toLowerCase() === 'female' ? '👩 Female' : '👨 Male'} • ${modelB.timbre}` : 'Voice B';
}

if (selectMergerVoiceA) selectMergerVoiceA.addEventListener('change', updateMergerPreviewBubbles);
if (selectMergerVoiceB) selectMergerVoiceB.addEventListener('change', updateMergerPreviewBubbles);

if (mergerRatioSlider) {
  mergerRatioSlider.addEventListener('input', () => {
    const val = parseInt(mergerRatioSlider.value, 10);
    if (labelMergerRatioVal) labelMergerRatioVal.textContent = `${val}% A / ${100 - val}% B`;
    if (visualRatioA) visualRatioA.textContent = `${val}%`;
    if (visualRatioB) visualRatioB.textContent = `${100 - val}%`;
    if (blendMeterFill) blendMeterFill.style.width = `${val}%`;
  });
}

if (mergerPitchSlider && labelMergerPitch) {
  mergerPitchSlider.addEventListener('input', () => {
    labelMergerPitch.textContent = `${parseFloat(mergerPitchSlider.value).toFixed(2)}x`;
  });
}

if (mergerRateSlider && labelMergerRate) {
  mergerRateSlider.addEventListener('input', () => {
    labelMergerRate.textContent = `${parseFloat(mergerRateSlider.value).toFixed(2)}x`;
  });
}

if (btnAuditionVoiceA) {
  btnAuditionVoiceA.addEventListener('click', () => {
    const valA = selectMergerVoiceA ? selectMergerVoiceA.value : 'google_gemini-puck';
    const modelA = resolveVoiceModel(valA);
    const text = modelA?.sampleText || "This is Voice A in the Google Voice Merger.";
    btnAuditionVoiceA.disabled = true;
    audioStudio.speakVoiceModel(text, modelA || valA, {
      onEnd: () => { btnAuditionVoiceA.disabled = false; },
      onError: () => { btnAuditionVoiceA.disabled = false; },
    });
  });
}

if (btnAuditionVoiceB) {
  btnAuditionVoiceB.addEventListener('click', () => {
    const valB = selectMergerVoiceB ? selectMergerVoiceB.value : 'google_gemini-lyra';
    const modelB = resolveVoiceModel(valB);
    const text = modelB?.sampleText || "This is Voice B in the Google Voice Merger.";
    btnAuditionVoiceB.disabled = true;
    audioStudio.speakVoiceModel(text, modelB || valB, {
      onEnd: () => { btnAuditionVoiceB.disabled = false; },
      onError: () => { btnAuditionVoiceB.disabled = false; },
    });
  });
}

if (btnAuditionHybridVoice) {
  btnAuditionHybridVoice.addEventListener('click', () => {
    const valA = selectMergerVoiceA ? selectMergerVoiceA.value : 'google_gemini-puck';
    const valB = selectMergerVoiceB ? selectMergerVoiceB.value : 'google_gemini-lyra';
    const modelA = resolveVoiceModel(valA);
    const modelB = resolveVoiceModel(valB);
    const ratioA = mergerRatioSlider ? parseInt(mergerRatioSlider.value, 10) / 100 : 0.5;

    const pOffset = mergerPitchSlider ? (parseFloat(mergerPitchSlider.value) - 1.0) : 0;
    const rOffset = mergerRateSlider ? (parseFloat(mergerRateSlider.value) - 1.0) : 0;
    const gender = selectMergedVoiceGender ? selectMergedVoiceGender.value : 'female';

    const hybrid = audioStudio.mergeGoogleVoices(modelA || valA, modelB || valB, ratioA, {
      pitchOffset: pOffset,
      rateOffset: rOffset,
      gender,
    });

    const text = inputMergedVoiceDesc?.value.trim() || `Welcome! You are listening to the newly blended hybrid voice with ${Math.round(ratioA * 100)}% ${modelA?.shortName || 'A'} and ${Math.round((1 - ratioA) * 100)}% ${modelB?.shortName || 'B'}.`;

    btnAuditionHybridVoice.disabled = true;
    btnAuditionHybridVoice.textContent = '🔊 Auditioning Hybrid...';

    audioStudio.speakVoiceModel(text, hybrid, {
      onEnd: () => {
        btnAuditionHybridVoice.disabled = false;
        btnAuditionHybridVoice.textContent = '▶️ Audition Hybrid Voice';
      },
      onError: () => {
        btnAuditionHybridVoice.disabled = false;
        btnAuditionHybridVoice.textContent = '▶️ Audition Hybrid Voice';
      }
    });
  });
}

if (btnSaveHybridVoiceToLibrary) {
  btnSaveHybridVoiceToLibrary.addEventListener('click', async () => {
    const name = inputMergedVoiceName ? inputMergedVoiceName.value.trim() : '';
    if (!name) {
      alert('Please enter a name for your custom hybrid voice.');
      if (inputMergedVoiceName) inputMergedVoiceName.focus();
      return;
    }

    const valA = selectMergerVoiceA ? selectMergerVoiceA.value : 'google_gemini-puck';
    const valB = selectMergerVoiceB ? selectMergerVoiceB.value : 'google_gemini-lyra';
    const modelA = resolveVoiceModel(valA);
    const modelB = resolveVoiceModel(valB);
    const ratioA = mergerRatioSlider ? parseInt(mergerRatioSlider.value, 10) / 100 : 0.5;
    const gender = selectMergedVoiceGender ? selectMergedVoiceGender.value : 'female';
    const desc = inputMergedVoiceDesc ? inputMergedVoiceDesc.value.trim() : '';

    const pOffset = mergerPitchSlider ? (parseFloat(mergerPitchSlider.value) - 1.0) : 0;
    const rOffset = mergerRateSlider ? (parseFloat(mergerRateSlider.value) - 1.0) : 0;

    const hybrid = audioStudio.mergeGoogleVoices(modelA || valA, modelB || valB, ratioA, {
      id: `cvoice_${Date.now()}`,
      name,
      description: desc || `Custom merged blend of ${modelA?.name || 'A'} and ${modelB?.name || 'B'}.`,
      gender,
      pitchOffset: pOffset,
      rateOffset: rOffset,
    });

    state.customVoices.unshift(hybrid);
    localStorage.setItem('clipmerge_custom_voices', JSON.stringify(state.customVoices));

    try {
      await sqliteService.saveCustomVoice({
        id: hybrid.id,
        name: hybrid.name,
        description: hybrid.description,
        gender: hybrid.gender,
        base_voice_a: valA,
        blend_voice_b: valB,
        ratio_a: ratioA,
        pitch: hybrid.pitch,
        rate: hybrid.rate,
        timbre: hybrid.timbre,
      });
    } catch (err) {
      console.warn('SQLite save custom voice warning:', err);
    }

    initAllVoiceSelects();
    renderVoiceLibraryUI();

    if (mergerSaveStatus) {
      mergerSaveStatus.style.display = 'block';
      mergerSaveStatus.innerHTML = `🎉 Successfully saved <strong>"${escapeHtml(name)}"</strong> to your Google Voice Library!`;
      setTimeout(() => { if (mergerSaveStatus) mergerSaveStatus.style.display = 'none'; }, 4500);
    }

    alert(`🎉 "${name}" saved to your Voice Library! You can now assign it to characters or use it for master narration.`);
  });
}

// ====================================================
// SEARCHABLE GOOGLE VOICE LIBRARY EXPLORER CONTROLLER
// ====================================================
let activeLibGenderFilter = 'all';

function setupVoiceLibraryFilters() {
  const pills = [
    { btn: libFilterAll, gender: 'all' },
    { btn: libFilterMale, gender: 'male' },
    { btn: libFilterFemale, gender: 'female' },
  ];

  pills.forEach(p => {
    if (p.btn) {
      p.btn.addEventListener('click', () => {
        activeLibGenderFilter = p.gender;
        pills.forEach(x => {
          if (x.btn) x.btn.classList.toggle('active', x.gender === p.gender);
        });
        renderVoiceLibraryUI();
      });
    }
  });

  if (libCategorySelect) {
    libCategorySelect.addEventListener('change', () => {
      renderVoiceLibraryUI();
    });
  }

  if (libSearchInput) {
    libSearchInput.addEventListener('input', () => {
      renderVoiceLibraryUI();
    });
  }
}

function renderVoiceLibraryUI() {
  if (!voiceLibraryGrid) return;
  const q = libSearchInput ? libSearchInput.value.trim().toLowerCase() : '';
  const cat = libCategorySelect ? libCategorySelect.value : 'all';

  const allVoices = [
    ...GOOGLE_VOICE_MODELS,
    ...state.customVoices.map(cv => ({
      ...cv,
      isCustom: true,
      category: 'hybrid',
      engine: cv.engine || 'Google Hybrid Blend',
      avatarBadge: cv.avatarBadge || '🧬',
      langLabel: cv.langLabel || 'English (US)',
      recommendedRole: cv.recommendedRole || 'Custom Merged Persona',
      sampleText: cv.sampleText || `This is a custom merged hybrid voice named ${cv.name}.`,
    })),
  ];

  const countAll = allVoices.length;
  const countMale = allVoices.filter(v => (v.gender || '').toLowerCase() === 'male').length;
  const countFemale = allVoices.filter(v => (v.gender || '').toLowerCase() === 'female').length;

  if (countLibAll) countLibAll.textContent = countAll;
  if (countLibMale) countLibMale.textContent = countMale;
  if (countLibFemale) countLibFemale.textContent = countFemale;
  if (totalVoiceCountBadge) totalVoiceCountBadge.textContent = countAll;

  let filtered = allVoices;
  if (activeLibGenderFilter !== 'all') {
    filtered = filtered.filter(v => (v.gender || '').toLowerCase() === activeLibGenderFilter);
  }

  if (cat !== 'all') {
    filtered = filtered.filter(v => {
      if (cat === 'hybrid') return v.isCustom || v.category === 'hybrid';
      return v.category === cat;
    });
  }

  if (q) {
    filtered = filtered.filter(v => 
      (v.name || '').toLowerCase().includes(q) ||
      (v.description || '').toLowerCase().includes(q) ||
      (v.recommendedRole || '').toLowerCase().includes(q) ||
      (v.timbre || '').toLowerCase().includes(q) ||
      (v.engine || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    voiceLibraryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h4>No Voices Found</h4>
        <p style="font-size: 0.85rem;">Try adjusting your gender, category, or search keywords.</p>
      </div>
    `;
    return;
  }

  voiceLibraryGrid.innerHTML = '';
  filtered.forEach(v => {
    const card = document.createElement('div');
    card.className = `voice-card ${v.isCustom ? 'voice-card-custom' : ''}`;

    const isMale = (v.gender || '').toLowerCase() === 'male';
    const genderClass = isMale ? 'pill-male' : 'pill-female';
    const genderLabel = isMale ? '👨 Male' : '👩 Female';

    card.innerHTML = `
      <div class="voice-card-top">
        <div class="voice-card-badge">${v.avatarBadge || '✨'}</div>
        <div class="voice-card-meta">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
            <h4 class="voice-card-title">${escapeHtml(v.name)}</h4>
            <span class="gender-pill ${genderClass} gender-pill-sm">${genderLabel}</span>
          </div>
          <span class="voice-engine-badge">${escapeHtml(v.engine || 'Google Cloud')} • ${escapeHtml(v.langLabel || 'English')}</span>
        </div>
      </div>

      <p class="voice-card-desc">${escapeHtml(v.description || '')}</p>

      <div class="voice-timbre-tag">
        <strong>Acoustic Timbre:</strong> ${escapeHtml(v.timbre || 'Natural')} (Pitch: ${Number(v.pitch || 1.0).toFixed(2)}x, Speed: ${Number(v.rate || 1.0).toFixed(2)}x)
      </div>

      <div class="voice-role-tag">
        <strong>Ideal Role:</strong> ${escapeHtml(v.recommendedRole || 'Narration / Dialogue')}
      </div>

      <div class="voice-card-sample">
        <em>"${escapeHtml(v.sampleText || 'Listen to this voice.')}"</em>
      </div>

      <div class="voice-card-actions">
        <button type="button" class="btn btn-xs btn-primary btn-lib-audition" data-id="${v.id}" title="Audition Voice Sample">
          🔊 Audition
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-lib-blend" data-id="${v.id}" title="Use in Voice Merger">
          🧬 Blend in Merger
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-lib-assign-char" data-id="${v.id}" title="Assign to Character">
          🎭 Cast Character
        </button>
        <button type="button" class="btn btn-xs btn-secondary btn-lib-use-master" data-id="${v.id}" title="Set as Master Voiceover Voice">
          🎬 Master Voice
        </button>
      </div>
    `;

    voiceLibraryGrid.appendChild(card);
  });

  attachVoiceLibraryListeners();
}

function attachVoiceLibraryListeners() {
  document.querySelectorAll('.btn-lib-audition').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const model = resolveVoiceModel(id);
      if (!model) return;
      const text = model.sampleText || `Hello! This is ${model.name}.`;

      btn.disabled = true;
      const orig = btn.innerHTML;
      btn.innerHTML = '🔊 Speaking...';

      audioStudio.speakVoiceModel(text, model, {
        onEnd: () => { btn.disabled = false; btn.innerHTML = orig; },
        onError: () => { btn.disabled = false; btn.innerHTML = orig; },
      });
    });
  });

  document.querySelectorAll('.btn-lib-blend').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      switchAudioSubTab('merger');
      if (selectMergerVoiceA) {
        const optionVal = id.startsWith('cvoice_') || id.startsWith('hybrid_') ? id : `google_${id}`;
        if (selectMergerVoiceA.querySelector(`option[value="${optionVal}"]`)) {
          selectMergerVoiceA.value = optionVal;
        } else {
          selectMergerVoiceA.value = id;
        }
        updateMergerPreviewBubbles();
      }
    });
  });

  document.querySelectorAll('.btn-lib-assign-char').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openCharacterModal();
      if (charVoiceSelect) {
        const optionVal = id.startsWith('cvoice_') || id.startsWith('hybrid_') ? id : `google_${id}`;
        if (charVoiceSelect.querySelector(`option[value="${optionVal}"]`)) {
          charVoiceSelect.value = optionVal;
        } else {
          charVoiceSelect.value = id;
        }
        updateCharSlidersFromVoice(charVoiceSelect.value);
      }
    });
  });

  document.querySelectorAll('.btn-lib-use-master').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      switchAudioSubTab('narration');
      if (audioVoiceSelect) {
        const optionVal = id.startsWith('cvoice_') || id.startsWith('hybrid_') ? id : `google_${id}`;
        if (audioVoiceSelect.querySelector(`option[value="${optionVal}"]`)) {
          audioVoiceSelect.value = optionVal;
        } else {
          audioVoiceSelect.value = id;
        }
        const model = resolveVoiceModel(id);
        if (model) {
          if (audioPitchSlider) {
            audioPitchSlider.value = model.pitch || 1.0;
            if (labelAudioPitch) labelAudioPitch.textContent = `${Number(model.pitch || 1.0).toFixed(2)}x`;
          }
          if (audioRateSlider) {
            audioRateSlider.value = model.rate || 1.0;
            if (labelAudioRate) labelAudioRate.textContent = `${Number(model.rate || 1.0).toFixed(2)}x`;
          }
        }
      }
      alert(`Master voice set to ${resolveVoiceModel(id)?.name || id}!`);
    });
  });
}

// ====================================================
// BACKEND DATA LOADERS (SQLITE + LOCALSTORAGE)
// ====================================================
async function loadCharactersFromBackend() {
  try {
    const chars = await sqliteService.getCharacters();
    if (Array.isArray(chars) && chars.length > 0) {
      state.characters = chars;
      localStorage.setItem('clipmerge_characters', JSON.stringify(chars));
    } else {
      const cached = localStorage.getItem('clipmerge_characters');
      if (cached) state.characters = JSON.parse(cached);
    }
  } catch (err) {
    console.warn('SQLite load characters warning:', err);
    const cached = localStorage.getItem('clipmerge_characters');
    if (cached) state.characters = JSON.parse(cached);
  }

  if (!state.characters || state.characters.length === 0) {
    state.characters = [
      {
        id: 'char_demo_vikram',
        name: 'Vikram',
        role: 'Tech Host & Video Lead',
        avatar_preset: 'creator',
        avatar_url: '',
        gender: 'male',
        voice_id: 'google_gemini-puck',
        voice_settings: { pitch: 1.10, rate: 1.10 },
        script_text: 'Welcome back to ClipMerge AI! Today we are stitching our video clips seamlessly with intelligent character voiceovers.'
      },
      {
        id: 'char_demo_maya',
        name: 'Maya',
        role: 'Creative Director',
        avatar_preset: 'queen',
        avatar_url: '',
        gender: 'female',
        voice_id: 'google_gemini-lyra',
        voice_settings: { pitch: 1.12, rate: 1.02 },
        script_text: 'Every single frame tells a story, and the voice brings that story to life with pure crystal resonance.'
      }
    ];
    localStorage.setItem('clipmerge_characters', JSON.stringify(state.characters));
  }

  if (characterCountBadge) characterCountBadge.textContent = state.characters.length;
  renderCharactersUI();
}

async function loadCustomVoicesFromBackend() {
  try {
    const voices = await sqliteService.getCustomVoices();
    if (Array.isArray(voices) && voices.length > 0) {
      state.customVoices = voices;
      localStorage.setItem('clipmerge_custom_voices', JSON.stringify(voices));
    } else {
      const cached = localStorage.getItem('clipmerge_custom_voices');
      if (cached) state.customVoices = JSON.parse(cached);
    }
  } catch (err) {
    console.warn('SQLite custom voices fetch warning:', err);
    const cached = localStorage.getItem('clipmerge_custom_voices');
    if (cached) state.customVoices = JSON.parse(cached);
  }
}

// ====================================================
// STARTUP INITIALIZATION
// ====================================================
updateGeminiInlineStatusUI();
updateEnhanceResolutionBadge();
updateSQLiteStatusUI();

// Initialize all voices and custom library
loadCustomVoicesFromBackend().then(() => {
  initAllVoiceSelects();
  renderVoiceLibraryUI();
  setupVoiceLibraryFilters();
});

// Load characters and setup filters
loadCharactersFromBackend().then(() => {
  setupCharacterFilters();
});

// ====================================================
// VIDEO EDITING STATION & AUDIO DSP CONTROLLER
// ====================================================

// Initialize Video Editing Station
videoEditorStation.bindUI({
  previewMonitorContainer: document.getElementById('previewMonitorContainer'),
  selectAspectRatio: document.getElementById('selectEditorAspect'),
  selectEditorResolution: document.getElementById('selectEditorResolution'),
  btnPlayPause: document.getElementById('btnEditorPlayPause'),
  btnRewind: document.getElementById('btnEditorRewind'),
  timelineCurrentTime: document.getElementById('timelineCurrentTime'),
  timelineTotalTime: document.getElementById('timelineTotalTime'),
  duckingIndicator: document.getElementById('duckingIndicator'),
  voiceVolumeSlider: document.getElementById('mixerVoiceVol'),
  voiceVolumeLabel: document.getElementById('labelMixerVoiceVol'),
  musicVolumeSlider: document.getElementById('mixerMusicVol'),
  musicVolumeLabel: document.getElementById('labelMixerMusicVol'),
  chkAutoDucking: document.getElementById('chkAutoDucking'),
  timelineRulerArea: document.getElementById('timelineRulerArea'),
  timelineScrubber: document.getElementById('timelineScrubber'),
  playheadLine: document.getElementById('playheadLine'),
  trackVideoClips: document.getElementById('trackVideoClips'),
  trackVoiceover: document.getElementById('trackVoiceover'),
  trackMusic: document.getElementById('trackMusic'),
  btnRenderMasterVideo: document.getElementById('btnRenderMasterVideo'),
  renderModal: document.getElementById('renderMasterModal'),
  renderProgressFill: document.getElementById('renderMasterProgressFill'),
  renderStatusText: document.getElementById('renderMasterStatusText'),
  renderResultArea: document.getElementById('renderMasterResultArea'),
  renderResultPlayer: document.getElementById('renderMasterResultPlayer'),
  btnDownloadRenderedMaster: document.getElementById('btnDownloadRenderedMaster'),
});

videoEditorStation.setMediaElements({
  videoEl: document.getElementById('editorPreviewVideo'),
  voiceEl: document.getElementById('editorVoiceAudio'),
  musicEl: document.getElementById('editorMusicAudio'),
});

// Send Clips from Video Station to Video Editing Station
const btnSendClipsToEditor = document.getElementById('btnSendClipsToEditor');
if (btnSendClipsToEditor) {
  btnSendClipsToEditor.addEventListener('click', () => {
    if (state.clips.length === 0) {
      alert('Please upload some video clips first in the Stitch & AI Editor tab.');
      return;
    }
    videoEditorStation.importClipsFromVideoStation(state.clips);
    const emptyOverlay = document.getElementById('editorEmptyOverlay');
    if (emptyOverlay) emptyOverlay.style.display = 'none';
    switchAppView('viewVideoEditor');
  });
}

// Send Voiceover from Audio Studio to Video Editing Station
const btnSendVoiceToEditor = document.getElementById('btnSendVoiceToEditor');
if (btnSendVoiceToEditor) {
  btnSendVoiceToEditor.addEventListener('click', () => {
    if (!state.generatedAudioBlob) {
      alert('Please generate or load a voiceover track first.');
      return;
    }
    videoEditorStation.importVoiceoverTrack(state.generatedAudioBlob, 'Voiceover Narration');
    switchAppView('viewVideoEditor');
  });
}

// 48kHz Studio DSP Audio Enhancer & Visualizer
const btnMasterAudioWithDSP = document.getElementById('btnMasterAudioWithDSP');
const audioDspVisualizerCanvas = document.getElementById('audioDspVisualizerCanvas');

if (btnMasterAudioWithDSP) {
  btnMasterAudioWithDSP.addEventListener('click', async () => {
    if (!state.generatedAudioBlob) {
      alert('No audio track is currently loaded to master.');
      return;
    }

    btnMasterAudioWithDSP.disabled = true;
    btnMasterAudioWithDSP.textContent = '⏳ Processing 48kHz DSP...';

    try {
      const mastered = await audioDSP.masterAudio(state.generatedAudioBlob, {
        highpassFreq: 80,
        deMudGain: -1.8,
        presenceGain: 2.5,
        airGain: 1.5,
        threshold: -22,
        ratio: 3.2,
      });

      state.generatedAudioBlob = mastered.blob;
      if (state.generatedAudioUrl) URL.revokeObjectURL(state.generatedAudioUrl);
      state.generatedAudioUrl = URL.createObjectURL(mastered.blob);

      if (audioStudioPlayer) {
        audioStudioPlayer.src = state.generatedAudioUrl;
        audioStudioPlayer.style.display = 'block';
        audioStudioPlayer.load();

        if (audioDspVisualizerCanvas) {
          audioDspVisualizerCanvas.style.display = 'block';
          audioDSP.attachVisualizer(audioDspVisualizerCanvas, audioStudioPlayer);
        }
      }

      if (btnDownloadAudioTrack) {
        btnDownloadAudioTrack.href = state.generatedAudioUrl;
        btnDownloadAudioTrack.download = `voiceover_mastered_48k_${Date.now()}.wav`;
      }

      if (audioPlayerStatus) {
        audioPlayerStatus.innerHTML = `<span style="color: var(--success); font-weight: 700;">✨ Mastered at 48 kHz (High-Pass 80Hz + Vocal Presence + Normalization)! Ready to edit or download.</span>`;
      }
    } catch (err) {
      alert(`Mastering failed: ${err.message}`);
    } finally {
      btnMasterAudioWithDSP.disabled = false;
      btnMasterAudioWithDSP.textContent = '✨ Master Audio (48kHz DSP)';
    }
  });
}

// Editing Station Header Import Buttons
const btnEditorImportClips = document.getElementById('btnEditorImportClips');
if (btnEditorImportClips) {
  btnEditorImportClips.addEventListener('click', () => {
    if (state.clips.length > 0) {
      const count = videoEditorStation.importClipsFromVideoStation(state.clips);
      const emptyOverlay = document.getElementById('editorEmptyOverlay');
      if (emptyOverlay) emptyOverlay.style.display = 'none';
      alert(`✅ Imported ${count} video clips into Track 1!`);
    } else {
      alert('No clips found in the Stitch & AI Editor tab yet. Upload video clips in the first tab to import them here.');
    }
  });
}

const btnEditorImportVoice = document.getElementById('btnEditorImportVoice');
if (btnEditorImportVoice) {
  btnEditorImportVoice.addEventListener('click', () => {
    if (state.generatedAudioBlob) {
      videoEditorStation.importVoiceoverTrack(state.generatedAudioBlob, 'Voiceover Narration');
      alert('✅ Voiceover track imported into Track 2!');
    } else {
      alert('No voiceover track generated yet. Create speech in the "AI Audio & Voice Studio" tab first.');
    }
  });
}

const btnEditorImportMusic = document.getElementById('btnEditorImportMusic');
const editorMusicFileInput = document.getElementById('editorMusicFileInput');
if (btnEditorImportMusic && editorMusicFileInput) {
  btnEditorImportMusic.addEventListener('click', () => {
    editorMusicFileInput.click();
  });

  editorMusicFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      videoEditorStation.importMusicTrack(file, file.name);
      alert(`✅ Background score "${file.name}" loaded into Track 3!`);
    }
  });
}

const btnCloseRenderMasterModal = document.getElementById('btnCloseRenderMasterModal');
if (btnCloseRenderMasterModal) {
  btnCloseRenderMasterModal.addEventListener('click', () => {
    const modal = document.getElementById('renderMasterModal');
    if (modal) modal.style.display = 'none';
  });
}

// ====================================================
// IN-APP AUTONOMOUS DIAGNOSTICS RUNNER
// ====================================================
window.checkAudioStation = function() {
  const issues = [];
  const checks = [];

  const add = (name, passed, detail = '') => {
    checks.push({ name, passed, detail });
    if (!passed) issues.push(`${name}: ${detail}`);
  };

  add('AudioStudio engine instantiated', !!audioStudio, 'AudioStudio class initialized');
  add('SpeechSynthesis available', 'speechSynthesis' in window, 'Browser speech synthesis API');
  add('Web Audio API available', 'AudioContext' in window || 'webkitAudioContext' in window, 'AudioContext support');
  add('AudioDSP engine instantiated', !!audioDSP, 'AudioDSP mastering engine initialized');
  add('VideoEditorStation instantiated', !!videoEditorStation, 'VideoEditorStation multi-track initialized');
  add('Lyra tone preset exists', !!(audioStudio && audioStudio.TONE_PRESETS && audioStudio.TONE_PRESETS.lyra), 'TONE_PRESETS.lyra configured');
  add('Google voice models loaded (20+ models)', !!(GOOGLE_VOICE_MODELS && GOOGLE_VOICE_MODELS.length >= 20), `${GOOGLE_VOICE_MODELS.length} Google voices`);
  add('Character Cast grid exists', !!document.getElementById('charactersGrid'), 'Character studio grid element');
  add('Character modal exists', !!document.getElementById('characterModal'), 'Character add/edit modal');
  add('Voice Merger selects exist', !!document.getElementById('selectMergerVoiceA') && !!document.getElementById('selectMergerVoiceB'), 'Voice merger select dropdowns');
  add('Voice Library grid exists', !!document.getElementById('voiceLibraryGrid'), 'Voice library explorer grid element');
  add('Master audio player exists', !!document.getElementById('audioStudioPlayer'), 'Audio player element in DOM');
  add('Video Editing Station view exists', !!document.getElementById('viewVideoEditor'), 'viewVideoEditor in DOM');

  console.group('🎙️ Audio & Video Stations Diagnostic Agent');
  console.table(checks);
  if (issues.length === 0) {
    console.log('%c✅ Audio Station, DSP Engine & Video Editing Station: ALL CHECKS PASSED!', 'color: #34d399; font-weight: bold; font-size: 1.1em;');
  } else {
    console.warn('⚠️ Diagnostic Issues:', issues);
  }
  console.groupEnd();
  return { status: issues.length === 0 ? 'PASS' : 'FAIL', total: checks.length, passed: checks.length - issues.length, issues };
};

window.runAppDiagnostics = function() {
  console.log('%c🤖 Running Complete ClipMerge App Verification Agent...', 'color: #818cf8; font-weight: bold;');
  const audioResults = window.checkAudioStation();
  
  const views = ['viewStitchEdit', 'viewVideoEnhance', 'viewImageEnhance', 'viewAudioStudio', 'viewVideoEditor'];
  const viewChecks = views.map(id => ({ view: id, present: !!document.getElementById(id) }));
  
  console.group('📱 Core App Views Check');
  console.table(viewChecks);
  console.groupEnd();

  return { audio: audioResults, views: viewChecks };
};



