# ClipMerge AI Suite 🎬✨

**ClipMerge AI Suite** is a modern, high-performance, 100% client-side video stitching, script alignment, and media enhancement web application built with vanilla HTML5, CSS3, JavaScript, **FFmpeg.wasm v0.12+**, and **Google Gemini AI**.

Users can upload raw video clips (from a few clips up to 30+ clips), paste an optional narrative production script, let **Google Gemini AI** align clips into an intelligent storyboard sequence ("keep them in a line"), enhance/upscale videos to **1080P Full HD** or **2160P 4K UHD**, capture and upscale image posters, schedule release dates on **Google Calendar**, share summaries via **Gmail**, and sync projects with **Firebase Cloud Firestore**.

---

## ✨ Key Features

### 1. 🤖 Gemini AI Script-to-Video Storyboard Alignment
- Paste your production narrative, voiceover beats, or select from built-in templates (*Product Launch*, *Tech Tutorial*, *Vlog / Story*).
- Google Gemini analyzes the storyline and automatically orders raw clips into a sequence matching each scene beat ("keep them in a line").
- Interactive **AI Storyboard Timeline** visualizer with scene badges, match confidence, and narrative beat breakdowns.
- Post-merge AI metadata: Generates video titles, outlines, chapter markers, and downloadable .vtt subtitles!

### 2. ⚡ 1080P & 2160P (4K) Video Enhancement & Upscaling
- **Target Resolutions**: Select between *Original*, *1080P Full HD (1920 × 1080)*, and *2160P 4K Ultra HD (3840 × 2160)*.
- **Aspect Ratio Modes**: *Pad (Letterbox/Pillarbox)*, *Crop (16:9 Fill)*, *Fit (Boundary Fit)*, or *Stretch*.
- **AI/Lanczos Video Enhancement**: Applies high-fidelity Lanczos scaling, unsharp edge sharpening (unsharp=5:5:0.8:5:5:0.0), and color vibrance/contrast tuning.
- **Fast Stream Copy**: If clips already share identical specs and original resolution is kept, concatenation executes with zero re-encoding in seconds.

### 3. 🖼️ Client-Side Image & Poster Enhancement Studio
- **Video Frame Snapshot**: 1-click capture of any frame from the merged video or clip thumbnails, enhanced and upscaled to 1080P or 2160P (4K).
- **Custom Image Upscaler**: Drag and drop any image (PNG, JPG, WebP), select 1080P or 2160P, choose aspect ratio mode, apply unsharp convolution, and download high-res posters.
- 100% client-side HTML5 Canvas processing with zero server dependencies.

### 4. 📅 Google Workspace Integration (Calendar & Gmail)
- **Google Calendar Scheduling**: Pre-populates video release premiere date, title, description, and chapter breakdown. Creates events directly via Google Calendar API or 1-click Web Intent.
- **Gmail Sharing**: Pre-fills video metadata, file size, duration, and review notes into Gmail compose for team review or client sign-off.

### 5. ☁️ Firebase Cloud Sync & Authentication
- Google Sign-In with Calendar and Gmail scopes.
- Cloud Firestore project history saving project titles, durations, clip listings, and scripts (with local storage offline fallback).

### 6. 🌐 Zero-Config Vercel Deployment
- Includes ercel.json preconfigured with required WebAssembly isolation headers:
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Embedder-Policy: require-corp
  - .wasm MIME type and static caching headers.
- Ready to deploy with a single command: ercel deploy.

---

## 📁 Project Structure

`
Vedio-stitches-/
├── vercel.json                 # Vercel deployment & WebAssembly headers
├── upscale.py                  # Python CLI upscaler entrypoint
├── upscaler/                   # Python media upscaling package (FFmpeg & Pillow)
└── clipmerge/                  # 100% Client-Side Web Application
    ├── index.html              # Modern dark-theme UI
    ├── style.css               # Responsive design, modals, script studio, storyboard
    ├── main.js                 # Application state controller & event coordinator
    ├── ffmpeg-handler.js       # FFmpeg.wasm v0.12+ engine with 1080p/4K upscaler
    ├── image-enhancer.js       # Canvas-based 1080p/2160p image & frame enhancer
    ├── gemini-service.js       # Google Gemini script alignment & metadata engine
    ├── workspace-service.js    # Google Calendar & Gmail scheduling and composing
    ├── firebase-service.js     # Firebase Authentication & Firestore cloud sync
    ├── ffmpeg-core/            # Local offline WebAssembly core suite
    └── samples/                # 30 pre-generated sample test clips
`

---

## 🚀 Deployment & Running

### Option 1: Deploy to Vercel (1-Click)

1. Push this repository to GitHub.
2. In Vercel, click **"Add New Project"** and import the repository.
3. Keep default settings (the included ercel.json automatically configures routes and WebAssembly headers).
4. Click **Deploy**!

Or from your terminal:
`ash
npx vercel
`

### Option 2: Run Locally (Zero Setup)

`ash
# Start a local HTTP server
python -m http.server 8080 --directory clipmerge
`

Open your browser at:  
👉 **http://localhost:8080**

---

## 🔒 Privacy & Performance Guarantee

- **100% Client-Side Video Stitching**: Clips never leave your computer. WebAssembly processes pixels directly inside your browser memory.
- **Offline Capable**: All FFmpeg WebAssembly core assets are bundled locally in ./ffmpeg-core/ for instant loading without CDN dependencies.
