/**
 * ClipMerge - FFmpeg.wasm Engine Handler
 * Isolates all FFmpeg.wasm v0.12+ video processing, format probing,
 * fast stream-copy concat, filter_complex transcode concat, and progress tracking.
 */

// Core endpoints: Local bundle first (offline/instant), CDN fallbacks
const LOCAL_CORE_BASE = './ffmpeg-core';
const PRIMARY_CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
const SECONDARY_CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';

/**
 * Fallback toBlobURL implementation if @ffmpeg/util is not globally available
 */
async function createBlobURLFromRemote(url, mimeType) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

export class FFmpegHandler {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.logs = [];
    this.onLogCallback = null;
    this.onProgressCallback = null;
    this.onStageCallback = null;
    this.createdBlobUrls = new Set();
  }

  /**
   * Set callback handlers
   */
  setCallbacks({ onLog, onProgress, onStage }) {
    this.onLogCallback = onLog || null;
    this.onProgressCallback = onProgress || null;
    this.onStageCallback = onStage || null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, message, type };
    this.logs.push(entry);
    if (this.onLogCallback) {
      this.onLogCallback(entry);
    }
  }

  setStage(stageName, detail = '') {
    if (this.onStageCallback) {
      this.onStageCallback(stageName, detail);
    }
  }

  setProgress(ratio, text = '') {
    const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));
    if (this.onProgressCallback) {
      this.onProgressCallback(percent, text);
    }
  }

  /**
   * Helper to retrieve FFmpeg constructor from window or dynamic import
   */
  async getFFmpegConstructor() {
    if (window.FFmpegWASM && window.FFmpegWASM.FFmpeg) {
      return window.FFmpegWASM.FFmpeg;
    }
    try {
      const mod = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      return mod.FFmpeg;
    } catch (err) {
      this.log(`Failed to import from unpkg, trying jsdelivr: ${err.message}`, 'warn');
      const mod = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
      return mod.FFmpeg;
    }
  }

  /**
   * Helper to retrieve toBlobURL from window.FFmpegUtil or fallback
   */
  async getToBlobURL() {
    if (window.FFmpegUtil && typeof window.FFmpegUtil.toBlobURL === 'function') {
      return window.FFmpegUtil.toBlobURL;
    }
    try {
      const mod = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
      if (typeof mod.toBlobURL === 'function') return mod.toBlobURL;
    } catch (e) {
      // ignore
    }
    return createBlobURLFromRemote;
  }

  /**
   * Helper to convert File/Blob to Uint8Array
   */
  async fileToUint8Array(file) {
    if (window.FFmpegUtil && typeof window.FFmpegUtil.fetchFile === 'function') {
      return await window.FFmpegUtil.fetchFile(file);
    }
    const arrayBuffer = await file.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Initialize and load the FFmpeg WebAssembly core
   */
  async loadCore() {
    if (this.isLoaded && this.ffmpeg) return;
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((res) => setTimeout(res, 100));
      }
      return;
    }

    this.isLoading = true;
    this.setStage('Loading FFmpeg Engine', 'Downloading and compiling WebAssembly core...');
    this.setProgress(0.1, 'Initializing WebAssembly engine...');
    this.log('Loading FFmpeg.wasm v0.12+ engine...');

    try {
      const FFmpegClass = await this.getFFmpegConstructor();
      const toBlob = await this.getToBlobURL();
      this.ffmpeg = new FFmpegClass();

      // Hook into raw FFmpeg engine logs
      this.ffmpeg.on('log', ({ message }) => {
        if (!message) return;
        this.log(`[FFmpeg] ${message}`, 'ffmpeg');
      });

      // Attempt loading from local bundle first (offline), then CDN fallbacks
      let loadedSuccessfully = false;
      const cdnBases = [LOCAL_CORE_BASE, PRIMARY_CORE_BASE, SECONDARY_CORE_BASE];

      for (const baseURL of cdnBases) {
        try {
          this.log(`Fetching core assets from: ${baseURL}`);
          const coreURL = await toBlob(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
          const wasmURL = await toBlob(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
          this.createdBlobUrls.add(coreURL);
          this.createdBlobUrls.add(wasmURL);

          this.setProgress(0.3, 'Compiling WebAssembly core...');
          await this.ffmpeg.load({ coreURL, wasmURL });
          loadedSuccessfully = true;
          this.log('FFmpeg.wasm core successfully compiled and initialized.');
          break;
        } catch (loadErr) {
          this.log(`Failed loading from ${baseURL}: ${loadErr.message}`, 'warn');
        }
      }

      if (!loadedSuccessfully) {
        throw new Error('Could not load FFmpeg.wasm core from any CDN. Please check your internet connection.');
      }

      this.isLoaded = true;
      this.setProgress(1.0, 'FFmpeg Ready');
    } catch (error) {
      this.log(`Initialization error: ${error.message}`, 'error');
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Probe video metadata using HTML5 Video element (fast client-side check)
   */
  async probeWithHtml5Video(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const blobUrl = URL.createObjectURL(file);
      this.createdBlobUrls.add(blobUrl);

      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      const timeout = setTimeout(() => {
        cleanup();
        // Resolve with fallback values if browser can't decode container directly (e.g. MKV/AVI)
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          browserPlayable: false,
          hasAudioEstimate: true,
        });
      }, 5000);

      video.onloadedmetadata = () => {
        cleanup();
        clearTimeout(timeout);
        const width = video.videoWidth || 0;
        const height = video.videoHeight || 0;
        const duration = video.duration || 0;
        resolve({
          width,
          height,
          duration,
          browserPlayable: true,
          hasAudioEstimate: true,
        });
      };

      video.onerror = () => {
        cleanup();
        clearTimeout(timeout);
        // Video format might not be supported natively by browser decoder (e.g. AVI, MKV)
        // but can still be processed by FFmpeg.wasm
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          browserPlayable: false,
          hasAudioEstimate: true,
        });
      };

      video.src = blobUrl;
    });
  }

  /**
   * Probe video metadata using FFmpeg virtual execution
   * Reads exact stream codecs, resolution, framerate, and audio layout from stderr
   */
  async probeWithFFmpeg(file, virtualName = 'probe_temp') {
    await this.loadCore();

    const ext = file.name.split('.').pop() || 'mp4';
    const tempFileName = `${virtualName}.${ext}`;
    const fileBytes = await this.fileToUint8Array(file);

    await this.ffmpeg.writeFile(tempFileName, fileBytes);

    let probeLogs = [];
    const logListener = ({ message }) => {
      if (message) probeLogs.push(message);
    };

    this.ffmpeg.on('log', logListener);

    try {
      // Running -i on an input without output prints metadata and exits with return code != 0
      await this.ffmpeg.exec(['-i', tempFileName]);
    } catch (e) {
      // Expected exit because no output file was specified
    } finally {
      this.ffmpeg.off('log', logListener);
      try {
        await this.ffmpeg.deleteFile(tempFileName);
      } catch (_) {}
    }

    const fullLog = probeLogs.join('\n');

    // Parse Video Stream
    // e.g.: Stream #0:0[0x1](und): Video: h264 (High), yuv420p, 1920x1080 [SAR 1:1 DAR 16:9], 30 fps, ...
    let videoCodec = 'unknown';
    let width = 0;
    let height = 0;
    let fps = 30;

    const videoMatch = fullLog.match(/Stream #\d+:\d+.*?: Video: ([^,\s]+).*?,.*?(\d{2,5})x(\d{2,5}).*?,.*?([\d.]+)\s+fps/i) ||
                       fullLog.match(/Stream #\d+:\d+.*?: Video: ([^,\s]+).*?,.*?(\d{2,5})x(\d{2,5})/i);

    if (videoMatch) {
      videoCodec = videoMatch[1].toLowerCase();
      width = parseInt(videoMatch[2], 10);
      height = parseInt(videoMatch[3], 10);
      if (videoMatch[4]) {
        fps = parseFloat(videoMatch[4]);
      }
    }

    // Parse Audio Stream
    // e.g.: Stream #0:1[0x2](und): Audio: aac (LC), 44100 Hz, stereo, fltp, 128 kb/s
    const audioMatch = fullLog.match(/Stream #\d+:\d+.*?: Audio: ([^,\s]+)/i);
    const hasAudio = !!audioMatch;
    const audioCodec = audioMatch ? audioMatch[1].toLowerCase() : null;

    // Parse Duration
    // Duration: 00:00:15.34
    let duration = 0;
    const durMatch = fullLog.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/i);
    if (durMatch) {
      const hours = parseFloat(durMatch[1]);
      const minutes = parseFloat(durMatch[2]);
      const seconds = parseFloat(durMatch[3]);
      duration = hours * 3600 + minutes * 60 + seconds;
    }

    return {
      videoCodec,
      width,
      height,
      fps: Math.round(fps * 100) / 100,
      hasAudio,
      audioCodec,
      duration: Math.round(duration * 100) / 100,
    };
  }

  /**
   * Check format compatibility across all clips
   * Determines whether fast stream copy (-c copy) is safe or if filter_complex transcode is required
   */
  checkCompatibility(clips) {
    if (!clips || clips.length === 0) {
      return {
        canFastConcat: false,
        method: 'copy',
        reason: 'No clips provided',
        details: [],
      };
    }

    if (clips.length === 1) {
      return {
        canFastConcat: true,
        method: 'copy',
        reason: 'Single clip — direct stream copy',
        details: ['Single clip stream copy'],
        targetResolution: { width: clips[0].probe.width, height: clips[0].probe.height },
        targetFps: clips[0].probe.fps || 30,
      };
    }

    const first = clips[0].probe;
    const reasons = [];
    let isCompatible = true;

    // Check containers & extensions
    const firstExt = clips[0].file.name.split('.').pop().toLowerCase();
    const mismatchedExtensions = clips.some(c => c.file.name.split('.').pop().toLowerCase() !== firstExt);
    if (mismatchedExtensions) {
      isCompatible = false;
      reasons.push('Clips have different container file formats (e.g. MP4 vs MOV/MKV)');
    }

    // Check Video Codecs
    const mismatchedVideoCodec = clips.some(c => c.probe.videoCodec !== first.videoCodec || c.probe.videoCodec === 'unknown');
    if (mismatchedVideoCodec) {
      isCompatible = false;
      reasons.push('Clips have different video codecs (e.g. H.264 vs HEVC/VP9)');
    }

    // Check Resolutions
    const mismatchedResolution = clips.some(c => c.probe.width !== first.width || c.probe.height !== first.height || c.probe.width === 0);
    if (mismatchedResolution) {
      isCompatible = false;
      const resList = clips.map((c, i) => `#${i + 1}: ${c.probe.width}x${c.probe.height}`).join(', ');
      reasons.push(`Clips have different resolutions (${resList})`);
    }

    // Check Framerates (allow small 1 fps deviation for tolerance)
    const mismatchedFps = clips.some(c => Math.abs((c.probe.fps || 30) - (first.fps || 30)) > 1.0);
    if (mismatchedFps) {
      isCompatible = false;
      reasons.push('Clips have different frame rates');
    }

    // Check Audio presence & codec
    const allHaveAudio = clips.every(c => c.probe.hasAudio);
    const noneHaveAudio = clips.every(c => !c.probe.hasAudio);
    if (!allHaveAudio && !noneHaveAudio) {
      isCompatible = false;
      reasons.push('Some clips contain audio tracks while others are silent');
    } else if (allHaveAudio) {
      const mismatchedAudioCodec = clips.some(c => c.probe.audioCodec !== first.audioCodec);
      if (mismatchedAudioCodec) {
        isCompatible = false;
        reasons.push('Clips use different audio codecs');
      }
    }

    // Determine target resolution and framerate for transcode
    const maxWidth = Math.max(...clips.map(c => c.probe.width || 1280));
    const maxHeight = Math.max(...clips.map(c => c.probe.height || 720));
    // Standardize to even dimensions for H.264 macroblocks
    const targetWidth = maxWidth % 2 === 0 ? maxWidth : maxWidth + 1;
    const targetHeight = maxHeight % 2 === 0 ? maxHeight : maxHeight + 1;
    const targetFps = Math.max(...clips.map(c => c.probe.fps || 30));

    if (isCompatible) {
      return {
        canFastConcat: true,
        method: 'copy',
        reason: 'All clips share identical codec, resolution, framerate, and audio configuration',
        targetResolution: { width: first.width, height: first.height },
        targetFps: first.fps || 30,
        details: [
          `Resolution: ${first.width}x${first.height}`,
          `Video Codec: ${first.videoCodec.toUpperCase()}`,
          `Frame Rate: ${first.fps} fps`,
          `Audio: ${first.hasAudio ? (first.audioCodec || 'AAC').toUpperCase() : 'None'}`,
        ],
      };
    } else {
      return {
        canFastConcat: false,
        method: 'transcode',
        reason: reasons.join('. '),
        targetResolution: { width: targetWidth, height: targetHeight },
        targetFps,
        details: reasons,
      };
    }
  }

  /**
   * Execute video merge
   * @param {Array} orderedClips - Array of { id, file, probe } in the intended merge order
   * @param {Object} compatibility - Result from checkCompatibility()
   * @param {Object} [options] - Optional enhancement & resolution settings
   * @param {string} [options.resolution='original'] - 'original' | '1080p' | '2160p'
   * @param {string} [options.aspectMode='pad'] - 'pad' | 'fit' | 'crop' | 'stretch'
   * @param {boolean} [options.enhanceVideo=false] - Apply Lanczos upscaling + unsharp filter + vibrance boost
   * @returns {Promise<Object>} { blobUrl, sizeBytes, duration, methodUsed, targetResolution, enhanced }
   */
  async mergeClips(orderedClips, compatibility, options = {}) {
    await this.loadCore();

    const targetResOption = options.resolution || 'original'; // 'original' | '1080p' | '2160p'
    const aspectMode = options.aspectMode || 'pad'; // 'pad' | 'fit' | 'crop' | 'stretch'
    const enhanceVideo = Boolean(options.enhanceVideo);

    // Determine target resolution dimensions
    let targetW = compatibility.targetResolution?.width || 1280;
    let targetH = compatibility.targetResolution?.height || 720;
    let isUpscaleRequested = false;

    if (targetResOption === '1080p') {
      targetW = 1920;
      targetH = 1080;
      isUpscaleRequested = true;
    } else if (targetResOption === '2160p') {
      targetW = 3840;
      targetH = 2160;
      isUpscaleRequested = true;
    }

    this.log(`Starting merge process with ${orderedClips.length} clips... Target: ${targetResOption.toUpperCase()} (${targetW}x${targetH}), Mode: ${aspectMode}, Enhanced: ${enhanceVideo}`);
    this.setProgress(0.05, 'Preparing virtual files...');

    const virtualFiles = [];
    const outputFilename = 'output.mp4';

    try {
      // STAGE 1: Loading clips into virtual filesystem
      this.setStage('Loading Clips', 'Writing uploaded clips into FFmpeg memory...');
      for (let i = 0; i < orderedClips.length; i++) {
        const clip = orderedClips[i];
        const ext = clip.file.name.split('.').pop() || 'mp4';
        const vName = `clip_${i}.${ext}`;
        virtualFiles.push(vName);

        this.setProgress(
          0.05 + (i / orderedClips.length) * 0.2,
          `Loading clip ${i + 1} of ${orderedClips.length}: ${clip.file.name}`
        );

        this.log(`Writing ${clip.file.name} -> virtual ${vName} (${(clip.file.size / (1024 * 1024)).toFixed(2)} MB)`);
        const bytes = await this.fileToUint8Array(clip.file);
        await this.ffmpeg.writeFile(vName, bytes);
      }

      // STAGE 2: Checking compatibility
      // If user specifically requested 1080p or 2160p or enhancement, force transcode
      const mustTranscode = isUpscaleRequested || enhanceVideo || compatibility.method === 'transcode';
      const initialMethod = mustTranscode ? 'transcode' : compatibility.method;

      this.setStage('Checking Compatibility', initialMethod === 'copy' ? 'Stream copy eligible' : 'Smart enhancement / re-encoding active');
      this.setProgress(0.3, mustTranscode && isUpscaleRequested ? `Upscaling to ${targetResOption.toUpperCase()} (${targetW}x${targetH})` : compatibility.reason);

      // Track progress
      const progressHandler = ({ progress, time }) => {
        if (typeof progress === 'number' && !isNaN(progress) && progress >= 0 && progress <= 1) {
          const scaled = 0.35 + progress * 0.55;
          this.setProgress(scaled, `Encoding video: ${Math.round(progress * 100)}%`);
        } else if (typeof time === 'number' && time > 0) {
          const totalDuration = orderedClips.reduce((sum, c) => sum + (c.probe.duration || 1), 0);
          const ratio = Math.min(1.0, (time / 1000000) / totalDuration);
          const scaled = 0.35 + ratio * 0.55;
          this.setProgress(scaled, `Processing frames: ${Math.round(ratio * 100)}%`);
        }
      };

      this.ffmpeg.on('progress', progressHandler);

      // STAGE 3: Merging
      let mergeMethodUsed = initialMethod;
      this.setStage('Merging Video', mergeMethodUsed === 'copy' ? 'Concatenating streams (instant copy)...' : `Enhancing & encoding streams to ${targetW}x${targetH}...`);

      let mergeSuccess = false;

      // ATTEMPT 1: Fast Concat (Stream Copy) only if not upscaling/enhancing and eligible
      if (mergeMethodUsed === 'copy') {
        try {
          this.log('Executing Fast Concat (stream copy mode)...');
          const concatListContent = virtualFiles.map(f => `file '${f}'`).join('\n');
          await this.ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatListContent));

          const args = [
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat_list.txt',
            '-c', 'copy',
            '-movflags', '+faststart',
            outputFilename,
          ];

          this.log(`Command: ffmpeg ${args.join(' ')}`);
          const exitCode = await this.ffmpeg.exec(args);

          if (exitCode === 0) {
            mergeSuccess = true;
            this.log('Fast Concat completed successfully!');
          } else {
            this.log(`Fast Concat returned non-zero code (${exitCode}). Falling back to filter_complex transcode...`, 'warn');
          }
        } catch (copyErr) {
          this.log(`Fast copy encountered error: ${copyErr.message}. Retrying with filter_complex transcode...`, 'warn');
        }
      }

      // ATTEMPT 2: Filter Complex Transcode (for 1080p, 2160p, video enhancement, or mismatched clips)
      if (!mergeSuccess) {
        mergeMethodUsed = isUpscaleRequested ? `upscale_${targetResOption}` : 'transcode';
        this.setStage('Merging Video', `Rendering ${targetResOption.toUpperCase()} video with ${aspectMode} mode...`);
        this.log(`Executing filter_complex transcode with target dimensions ${targetW}x${targetH}...`);

        const targetFps = compatibility.targetFps || 30;

        // Build inputs array
        const args = [];
        for (const vFile of virtualFiles) {
          args.push('-i', vFile);
        }

        const filterParts = [];
        const hasAnyAudio = orderedClips.some(c => c.probe.hasAudio);

        const scaleFlags = enhanceVideo ? ':flags=lanczos' : ':flags=bicubic';
        const enhanceFilter = enhanceVideo ? ',unsharp=5:5:0.8:5:5:0.0,eq=contrast=1.04:brightness=0.01:saturation=1.12' : '';

        for (let i = 0; i < orderedClips.length; i++) {
          const clip = orderedClips[i];
          let vFilter = '';

          if (aspectMode === 'stretch') {
            vFilter = `scale=${targetW}:${targetH}${scaleFlags},setsar=1,fps=${targetFps}${enhanceFilter}`;
          } else if (aspectMode === 'crop') {
            vFilter = `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase${scaleFlags},crop=${targetW}:${targetH},setsar=1,fps=${targetFps}${enhanceFilter}`;
          } else if (aspectMode === 'fit') {
            vFilter = `scale='min(${targetW},iw*min(${targetW}/iw\\,${targetH}/ih))':'min(${targetH},ih*min(${targetW}/iw\\,${targetH}/ih))':force_original_aspect_ratio=decrease${scaleFlags},pad='ceil(iw/2)*2':'ceil(ih/2)*2':0:0,setsar=1,fps=${targetFps}${enhanceFilter}`;
          } else {
            // Default: 'pad' (preserve aspect ratio with letterbox/pillarbox)
            vFilter = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease${scaleFlags},pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${targetFps}${enhanceFilter}`;
          }

          filterParts.push(`[${i}:v]${vFilter}[v${i}]`);

          // Audio normalization
          if (hasAnyAudio) {
            if (clip.probe.hasAudio) {
              filterParts.push(`[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
            } else {
              const dur = Math.max(0.5, clip.probe.duration || 5.0);
              filterParts.push(`anullsrc=r=44100:cl=stereo,atrim=0:${dur}[a${i}]`);
            }
          }
        }

        // Concat filter
        let concatStreams = '';
        for (let i = 0; i < orderedClips.length; i++) {
          concatStreams += `[v${i}]`;
          if (hasAnyAudio) {
            concatStreams += `[a${i}]`;
          }
        }

        if (hasAnyAudio) {
          filterParts.push(`${concatStreams}concat=n=${orderedClips.length}:v=1:a=1[outv][outa]`);
        } else {
          filterParts.push(`${concatStreams}concat=n=${orderedClips.length}:v=1:a=0[outv]`);
        }

        const filterComplexStr = filterParts.join(';');

        args.push(
          '-filter_complex', filterComplexStr,
          '-map', '[outv]'
        );

        if (hasAnyAudio) {
          args.push(
            '-map', '[outa]',
            '-c:a', 'aac',
            '-b:a', '192k'
          );
        }

        // WebAssembly performance tuning:
        // For 4K (2160p), use ultrafast preset & crf 24 to preserve memory
        // For 1080p, use veryfast & crf 20
        const preset = targetResOption === '2160p' ? 'ultrafast' : 'veryfast';
        const crf = targetResOption === '2160p' ? '24' : (enhanceVideo ? '20' : '22');

        args.push(
          '-c:v', 'libx264',
          '-preset', preset,
          '-crf', crf,
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          outputFilename
        );

        this.log(`Filter complex command prepared (${targetW}x${targetH} @ crf ${crf}, preset ${preset}).`);
        const exitCode = await this.ffmpeg.exec(args);

        if (exitCode !== 0) {
          throw new Error(`FFmpeg transcoding failed with exit code ${exitCode}. Check logs for details.`);
        }
        mergeSuccess = true;
      }

      this.ffmpeg.off('progress', progressHandler);

      // STAGE 4: Reading output
      this.setStage('Done', 'Packaging merged video...');
      this.setProgress(0.95, 'Reading output file...');

      const outputData = await this.ffmpeg.readFile(outputFilename);
      const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(outputBlob);
      this.createdBlobUrls.add(blobUrl);

      const totalDuration = orderedClips.reduce((sum, c) => sum + (c.probe.duration || 0), 0);

      this.setProgress(1.0, 'Merge Complete!');
      this.log(`Merged video successfully created: ${(outputBlob.size / (1024 * 1024)).toFixed(2)} MB, ~${totalDuration.toFixed(1)}s`);

      return {
        blobUrl,
        blob: outputBlob,
        sizeBytes: outputBlob.size,
        duration: totalDuration,
        methodUsed: mergeMethodUsed,
        targetResolution: `${targetW}x${targetH}`,
        enhanced: enhanceVideo,
      };
    } finally {
      // Memory cleanup: delete virtual files from FFmpeg memory
      for (const vFile of virtualFiles) {
        try {
          await this.ffmpeg.deleteFile(vFile);
        } catch (_) {}
      }
      try {
        await this.ffmpeg.deleteFile('concat_list.txt');
      } catch (_) {}
      try {
        await this.ffmpeg.deleteFile(outputFilename);
      } catch (_) {}
    }
  }

  /**
   * Enhance and upscale a single video (1080P or 2160P 4K)
   * Used for standalone video enhancement and post-merge upscaling.
   */
  async enhanceStandaloneVideo(fileOrBlob, options = {}) {
    await this.loadCore();

    const targetRes = options.resolution || '1080p';
    const targetW = targetRes === '2160p' ? 3840 : 1920;
    const targetH = targetRes === '2160p' ? 2160 : 1080;
    const aspectMode = options.aspectMode || 'pad';
    const sharpen = options.sharpen !== false;
    const onProgress = options.onProgress || null;

    const inputName = 'input_enhance.mp4';
    const outputName = 'output_enhanced.mp4';

    try {
      this.log(`Loading video for ${targetRes.toUpperCase()} enhancement...`);
      const uint8 = await this.fileToUint8Array(fileOrBlob);
      await this.ffmpeg.writeFile(inputName, uint8);

      // Build video filter
      let filterChain = '';
      if (aspectMode === 'crop') {
        filterChain = `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${targetW}:${targetH}`;
      } else if (aspectMode === 'stretch') {
        filterChain = `scale=${targetW}:${targetH}:flags=lanczos`;
      } else if (aspectMode === 'fit') {
        filterChain = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease:flags=lanczos`;
      } else {
        // 'pad' (default letterbox)
        filterChain = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:black`;
      }

      if (sharpen) {
        filterChain += `,unsharp=5:5:0.8:5:5:0.0,eq=contrast=1.04:brightness=0.01:saturation=1.12`;
      }

      const preset = targetRes === '2160p' ? 'ultrafast' : 'veryfast';
      const crf = targetRes === '2160p' ? '24' : '20';

      const args = [
        '-i', inputName,
        '-vf', filterChain,
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', crf,
        '-pix_fmt', 'yuv420p',
        '-c:a', 'copy',
        '-movflags', '+faststart',
        outputName,
      ];

      const progressHandler = ({ progress }) => {
        if (onProgress) onProgress(progress);
      };
      this.ffmpeg.on('progress', progressHandler);

      this.log(`Running video enhancement (${targetW}x${targetH})...`);
      const exitCode = await this.ffmpeg.exec(args);
      this.ffmpeg.off('progress', progressHandler);

      if (exitCode !== 0) {
        throw new Error(`Video enhancement failed with exit code ${exitCode}`);
      }

      const outputData = await this.ffmpeg.readFile(outputName);
      const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(outputBlob);
      this.createdBlobUrls.add(blobUrl);

      return {
        blobUrl,
        blob: outputBlob,
        sizeBytes: outputBlob.size,
        resolution: `${targetW}x${targetH}`,
      };
    } finally {
      try { await this.ffmpeg.deleteFile(inputName); } catch (_) {}
      try { await this.ffmpeg.deleteFile(outputName); } catch (_) {}
    }
  }

  /**
   * Combine an audio track (e.g. generated voiceover or cloned audio) with a video.
   * Replaces or mixes audio into the video.
   */
  async attachAudioToVideo(videoBlob, audioBlob, options = {}) {
    await this.loadCore();

    const inputVideoName = 'video_input.mp4';
    const inputAudioName = 'audio_input.wav';
    const outputName = 'video_with_audio.mp4';

    try {
      this.log('Loading video and audio for soundtrack merging...');
      const videoUint8 = await this.fileToUint8Array(videoBlob);
      const audioUint8 = await this.fileToUint8Array(audioBlob);

      await this.ffmpeg.writeFile(inputVideoName, videoUint8);
      await this.ffmpeg.writeFile(inputAudioName, audioUint8);

      const mode = options.mode || 'replace';
      let args = [];

      if (mode === 'replace') {
        args = [
          '-i', inputVideoName,
          '-i', inputAudioName,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-shortest',
          '-movflags', '+faststart',
          outputName,
        ];
      } else {
        // Mix audio tracks: video audio + voiceover
        args = [
          '-i', inputVideoName,
          '-i', inputAudioName,
          '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=first[aout]',
          '-map', '0:v:0',
          '-map', '[aout]',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-movflags', '+faststart',
          outputName,
        ];
      }

      this.log('Multiplexing video with AI audio track...');
      const exitCode = await this.ffmpeg.exec(args);
      if (exitCode !== 0) {
        // Fallback to simple replace
        const fallbackArgs = [
          '-i', inputVideoName,
          '-i', inputAudioName,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-map', '0:v:0',
          '-map', '1:a:0',
          outputName,
        ];
        const fbCode = await this.ffmpeg.exec(fallbackArgs);
        if (fbCode !== 0) {
          throw new Error(`Audio-video multiplexing failed with exit code ${fbCode}`);
        }
      }

      const outputData = await this.ffmpeg.readFile(outputName);
      const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(outputBlob);
      this.createdBlobUrls.add(blobUrl);

      this.log(`AI audio voiceover successfully merged with video! Size: ${(outputBlob.size / (1024 * 1024)).toFixed(2)} MB`);

      return {
        blobUrl,
        blob: outputBlob,
        sizeBytes: outputBlob.size,
      };
    } finally {
      try { await this.ffmpeg.deleteFile(inputVideoName); } catch (_) {}
      try { await this.ffmpeg.deleteFile(inputAudioName); } catch (_) {}
      try { await this.ffmpeg.deleteFile(outputName); } catch (_) {}
    }
  }

  /**
   * Revoke all generated Blob URLs to free browser memory
   */
  cleanupBlobUrls() {
    for (const url of this.createdBlobUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
    this.createdBlobUrls.clear();
  }
}


