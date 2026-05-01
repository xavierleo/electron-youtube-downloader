# Vite React Electron Modernization Design

## Goal

Modernize the YouTube downloader into a small Vite + React Electron app while keeping the code easy to inspect and avoiding unnecessary framework sprawl.

## Architecture

The app will use Electron's modern three-part structure:

- `src/main/` owns the desktop shell, window creation, and downloader IPC handlers.
- `src/preload/` exposes a narrow `window.downloader` bridge to the renderer.
- `src/renderer/` contains the React UI and plain CSS only.

The renderer will not receive direct Node.js access. It will call the preload bridge for metadata lookup and downloads. The main process will run `youtube-dl-exec`, parse progress output, and send progress events back to the renderer.

## UI

The first screen is the working tool, not a landing page. It contains:

- URL input and search button.
- Result preview with title, thumbnail, duration and source details when available.
- Download button.
- Progress bar and compact status log.
- Clear empty, loading, success, and error states.

Styling stays as plain CSS. Bootstrap, jQuery, and Material Design Lite are removed.

## Downloader Behavior

Metadata lookup uses `yt-dlp --dump-single-json`. If a playlist returns entries, the UI shows the first useful entry and keeps the requested URL as the download target.

Downloads default to the user's Downloads folder using a safe `%(title)s.%(ext)s` output template. Progress is parsed from `yt-dlp` stderr and delivered to React through an IPC progress subscription.

## Dependency And Scripts

Add Vite, React, React DOM, and the Vite React plugin. Keep Electron and `youtube-dl-exec`.

Scripts:

- `dev`: run the Vite renderer dev server.
- `start`: run Electron against the built renderer.
- `build`: create the renderer production build.
- `preview`: preview the built renderer through Vite.

## Verification

The migration is considered ready when:

- `npm run build` succeeds.
- `node --check` succeeds for main and preload code.
- `npm audit --audit-level=moderate` reports no vulnerabilities.
- `npm outdated --json` reports no outdated direct dependencies.

