# Vite React Electron Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the small Electron YouTube downloader to Vite + React with a secure preload bridge and main-process downloader IPC.

**Architecture:** Electron main creates the BrowserWindow and owns all Node/downloader work. Preload exposes a minimal `window.downloader` API. React renders the desktop utility UI and receives progress events through the bridge.

**Tech Stack:** Electron 41, Vite, React, React DOM, `@vitejs/plugin-react`, `youtube-dl-exec`, plain CSS.

---

## File Structure

- Create `src/main/main.js`: Electron lifecycle, BrowserWindow setup, IPC handlers.
- Create `src/main/downloader.js`: metadata lookup, download process, progress parsing.
- Create `src/preload/preload.js`: safe context bridge API.
- Create `src/renderer/main.jsx`: React entrypoint.
- Create `src/renderer/App.jsx`: app state and UI composition.
- Create `src/renderer/app.css`: compact utility styling.
- Create `src/renderer/index.html`: Vite renderer HTML entry.
- Create `vite.config.js`: Vite React configuration.
- Modify `package.json`: point Electron to `src/main/main.js`, add scripts, add Vite/React dependencies, remove legacy UI dependencies.
- Delete legacy root `index.html`, `renderer.js`, `main.js`, vendored Bootstrap/jQuery/MDL assets after the new app builds.

### Task 1: Install Tooling And Configure Entrypoints

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `src/renderer/index.html`

- [ ] **Step 1: Install Vite and React dependencies**

Run:

```bash
npm install react@latest react-dom@latest @vitejs/plugin-react@latest vite@latest
```

Expected: npm installs packages and updates `package-lock.json`.

- [ ] **Step 2: Update `package.json`**

Set `main` to `src/main/main.js`, add scripts:

```json
{
  "main": "src/main/main.js",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "start": "electron .",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1"
  }
}
```

Remove `jquery` and `material-design-lite` from dependencies.

- [ ] **Step 3: Add Vite config**

Create `vite.config.js`:

```js
const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true
  }
})
```

- [ ] **Step 4: Add renderer HTML shell**

Create `src/renderer/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>YouTube Downloader</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Verify config loads**

Run:

```bash
npm run build
```

Expected: build fails only because `src/renderer/main.jsx` does not exist yet.

### Task 2: Create Main Process And Downloader Module

**Files:**
- Create: `src/main/main.js`
- Create: `src/main/downloader.js`

- [ ] **Step 1: Add downloader module**

Create `src/main/downloader.js` with `getInfo(url)` and `downloadVideo({ url, outputDirectory, onProgress })`. Use `youtube-dl-exec` with `dumpSingleJson` for metadata and `youtubedl.exec` for downloads. Parse progress from stderr with `/\[download\]\s+(\d+(?:\.\d+)?)%/`.

- [ ] **Step 2: Add Electron main process**

Create `src/main/main.js` to:

- Create a BrowserWindow with `contextIsolation: true`, `nodeIntegration: false`, and `preload` pointing to `src/preload/preload.js`.
- Load `process.env.ELECTRON_RENDERER_URL` when set, otherwise load `dist/renderer/index.html`.
- Register `downloader:get-info` and `downloader:download` IPC handlers.
- Send progress events to the requesting webContents on `downloader:progress`.

- [ ] **Step 3: Verify syntax**

Run:

```bash
node --check src/main/main.js
node --check src/main/downloader.js
```

Expected: both commands exit 0.

### Task 3: Add Preload Bridge

**Files:**
- Create: `src/preload/preload.js`

- [ ] **Step 1: Expose downloader API**

Create `src/preload/preload.js`:

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('downloader', {
  getInfo: url => ipcRenderer.invoke('downloader:get-info', url),
  download: options => ipcRenderer.invoke('downloader:download', options),
  onProgress: callback => {
    const listener = (_event, progress) => callback(progress)
    ipcRenderer.on('downloader:progress', listener)
    return () => ipcRenderer.removeListener('downloader:progress', listener)
  }
})
```

- [ ] **Step 2: Verify syntax**

Run:

```bash
node --check src/preload/preload.js
```

Expected: command exits 0.

### Task 4: Build React UI

**Files:**
- Create: `src/renderer/main.jsx`
- Create: `src/renderer/App.jsx`
- Create: `src/renderer/app.css`

- [ ] **Step 1: Add React entrypoint**

Create `src/renderer/main.jsx` to mount `<App />` into `#root`.

- [ ] **Step 2: Add App component**

Create `src/renderer/App.jsx` with state for `url`, `status`, `video`, `progress`, `message`, and `error`. Implement `handleSearch`, `handleDownload`, progress subscription cleanup, and UI rendering.

- [ ] **Step 3: Add CSS**

Create `src/renderer/app.css` for a compact utility layout: fixed top form, result preview, progress bar, and status panel. Use plain CSS and responsive constraints.

- [ ] **Step 4: Build renderer**

Run:

```bash
npm run build
```

Expected: Vite production build exits 0 and writes `dist/renderer`.

### Task 5: Remove Legacy Assets

**Files:**
- Delete: `index.html`
- Delete: `renderer.js`
- Delete: `main.js`
- Delete: `js/`
- Delete: `css/`
- Delete: `fonts/`

- [ ] **Step 1: Remove legacy files after successful build**

Run:

```bash
rm -rf index.html renderer.js main.js js css fonts
```

Expected: only the new Vite/Electron source remains.

- [ ] **Step 2: Verify app still builds**

Run:

```bash
npm run build
```

Expected: build exits 0.

### Task 6: Final Verification

**Files:**
- Verify: all changed files

- [ ] **Step 1: Run syntax checks**

Run:

```bash
node --check src/main/main.js
node --check src/main/downloader.js
node --check src/preload/preload.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 3: Run audit**

Run:

```bash
npm audit --audit-level=moderate
```

Expected: `found 0 vulnerabilities`.

- [ ] **Step 4: Verify latest dependencies**

Run:

```bash
npm outdated --json
```

Expected: `{}`.

