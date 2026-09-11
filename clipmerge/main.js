/**
 * ClipMerge - Application State & UI Controller
 */

import { FFmpegHandler } from './ffmpeg-handler.js';
import { GeminiService } from './gemini-service.js';
import { FirebaseService } from './firebase-service.js';
import { WorkspaceService } from './workspace-service.js';
import { ImageEnhancer } from './image-enhancer.js';
import { AudioStudio } from './audio-studio.js';

// Initialize Services
const ffmpegHandler = new FFmpegHandler();
const geminiService = new GeminiService();
const firebaseService = new FirebaseService();
const workspaceService = new WorkspaceService();
const audioStudio = new AudioStudio(geminiService);

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
const viewStitchEdit = document.getElementById('viewStitchEdit');
const viewVideoEnhance = document.getElementById('viewVideoEnhance');
const viewImageEnhance = document.getElementById('viewImageEnhance');
const viewAudioStudio = document.getElementById('viewAudioStudio');

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
const panelVoiceClone = document.getElementById('panelVoiceClone');
const panelVoiceMerger = document.getElementById('panelVoiceMerger');

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
  [tabStitchEdit, tabVideoEnhance, tabImageEnhance, tabAudioStudio].forEach(t => t && t.classList.remove('active'));
  [viewStitchEdit, viewVideoEnhance, viewImageEnhance, viewAudioStudio].forEach(v => v && v.classList.remove('active'));

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
  }
}

if (tabStitchEdit) tabStitchEdit.addEventListener('click', () => switchAppView('viewStitchEdit'));
if (tabVideoEnhance) tabVideoEnhance.addEventListener('click', () => switchAppView('viewVideoEnhance'));
if (tabImageEnhance) tabImageEnhance.addEventListener('click', () => switchAppView('viewImageEnhance'));
if (tabAudioStudio) tabAudioStudio.addEventListener('click', () => switchAppView('viewAudioStudio'));

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

// Google Auth Sign-In / User State
if (btnGoogleAuth) {
  btnGoogleAuth.addEventListener('click', async () => {
    if (state.currentUser) {
      const confirmSignOut = confirm(`Currently signed in as ${state.currentUser.displayName || state.currentUser.email}. Would you like to sign out?`);
      if (confirmSignOut) {
        await firebaseService.signOut();
        state.currentUser = null;
        state.googleAccessToken = null;
        workspaceService.setAccessToken(null);
        googleAuthText.textContent = 'Google Workspace';
      }
      return;
    }

    try {
      const authResult = await firebaseService.signInWithGoogle();
      if (authResult && authResult.user) {
        state.currentUser = authResult.user;
        state.googleAccessToken = authResult.accessToken;
        workspaceService.setAccessToken(authResult.accessToken);
        googleAuthText.textContent = authResult.user.displayName || authResult.user.email || 'Connected';
        alert(`Signed in as ${authResult.user.displayName || authResult.user.email}! Google Calendar and Gmail are connected.`);
      }
    } catch (err) {
      alert(`Google Sign-In failed: ${err.message}`);
    }
  });
}

// Initialize Auth Listener on Startup
firebaseService.onAuthStateChanged((user) => {
  if (user) {
    state.currentUser = user;
    googleAuthText.textContent = user.displayName || user.email || 'Connected';
  } else {
    state.currentUser = null;
    googleAuthText.textContent = 'Google Workspace';
  }
});

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

function initAudioStudioVoicesUI() {
  if (!audioVoiceSelect) return;
  const categorized = audioStudio.getVoices();
  availableBrowserVoices = categorized.all || [];

  audioVoiceSelect.innerHTML = '';

  // Custom / Cloned / Hybrid Voices group
  if (clonedCustomVoices.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = '🧬 Cloned & Hybrid Voices';
    clonedCustomVoices.forEach((cv, idx) => {
      const opt = document.createElement('option');
      opt.value = `custom_${idx}`;
      opt.textContent = `✨ ${cv.name} (${cv.timbre || 'Custom'})`;
      customGroup.appendChild(opt);
    });
    audioVoiceSelect.appendChild(customGroup);
  }

  // Telugu Voices group
  const teluguGroup = document.createElement('optgroup');
  teluguGroup.label = '🇮🇳 Telugu (తెలుగు) Voices';
  if (categorized.telugu.length > 0) {
    categorized.telugu.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      teluguGroup.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = 'default_telugu';
    opt.textContent = 'Natural Telugu Mode (Gemini Spoken + Tone Pitch)';
    teluguGroup.appendChild(opt);
  }
  audioVoiceSelect.appendChild(teluguGroup);

  // English Voices group
  const englishGroup = document.createElement('optgroup');
  englishGroup.label = '🌐 English Voices';
  categorized.english.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.lang === 'en-IN' || v.name.includes('India')) {
      opt.textContent = `🇮🇳 ${v.name} (Indian Accent)`;
    }
    englishGroup.appendChild(opt);
  });
  audioVoiceSelect.appendChild(englishGroup);

  // Other Voices group
  const otherVoices = availableBrowserVoices.filter(v => 
    !categorized.telugu.includes(v) && !categorized.english.includes(v)
  );
  if (otherVoices.length > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = '🌍 Other Voices';
    otherVoices.slice(0, 15).forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      otherGroup.appendChild(opt);
    });
    audioVoiceSelect.appendChild(otherGroup);
  }
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

  const voices = audioStudio.voices || [];
  return voices.find(v => v.name === val) || null;
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

// Voice Cloning & Merger Tabs
if (btnTabVoiceClone && btnTabVoiceMerger) {
  btnTabVoiceClone.addEventListener('click', () => {
    btnTabVoiceClone.className = 'btn btn-xs btn-primary';
    btnTabVoiceMerger.className = 'btn btn-xs btn-secondary';
    if (panelVoiceClone) panelVoiceClone.style.display = 'block';
    if (panelVoiceMerger) panelVoiceMerger.style.display = 'none';
  });

  btnTabVoiceMerger.addEventListener('click', () => {
    btnTabVoiceMerger.className = 'btn btn-xs btn-primary';
    btnTabVoiceClone.className = 'btn btn-xs btn-secondary';
    if (panelVoiceClone) panelVoiceClone.style.display = 'none';
    if (panelVoiceMerger) panelVoiceMerger.style.display = 'block';
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

    const presetA = audioStudio.TONE_PRESETS[toneA] || { pitch: 1.0, rate: 1.0, label: toneA };
    const presetB = audioStudio.TONE_PRESETS[toneB] || { pitch: 1.0, rate: 1.0, label: toneB };

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

// Initialize Audio Studio voices on load
setTimeout(() => {
  initAudioStudioVoicesUI();
}, 500);

// ====================================================
// STARTUP INITIALIZATION
// ====================================================
updateGeminiInlineStatusUI();
updateEnhanceResolutionBadge();

