# Winamp — Reimagined

A responsive, browser-based music player inspired by the original Winamp. Built with HTML, CSS, ES modules and the Web Audio API, without a build step or runtime dependencies.

## Run locally

```sh
python3 -m http.server 3000 --directory dist
```

Open http://localhost:3000. Serve over HTTP rather than opening `index.html` directly, because the app uses ES modules.

## Features

- Original procedural demo music with eight variations.
- Local audio import, including drag and drop; browser-supported MP3, WAV, OGG, FLAC and other audio formats.
- Play/pause, seek, next/previous, shuffle, repeat track/playlist, volume and mute.
- Ten-band Web Audio equalizer with five presets and custom gain controls.
- Live audio spectrum and waveform, with reduced-motion support.
- Search, favorites, recent listening, custom playlists and playback queue.
- Refined desktop and mobile layouts, touch-friendly transport and seek controls, collapsible equalizer, focus mode, keyboard shortcuts and Media Session controls.
- Seek preview on drag, with playback seeking committed on release.
- Keyboard focus management for track controls, menus, navigation and playback queue.

Favorites, playlist membership, recent listening and settings are stored in browser localStorage. Imported audio files and their metadata are saved locally in IndexedDB and restored without autoplay when the app reopens. Files never leave the device. If browser storage is unavailable or full, imports remain playable for the current session and the app displays a clear notice. Clearing site data removes the stored library; users should retain original files. Duplicate imports reuse the existing track, and removing a stored track requires confirmation. M3U export contains track references, not audio files. Demo references are specific to this app, not downloadable recordings.

All built-in sounds and cover graphics were created for this concept. The demonstration titles are fictional; the app does not stream recordings by commercial artists. This is an independent homage, not an official Winamp product.

## Source

- `dist/index.html`: application layout
- `dist/style.css`: base theme and layouts
- `dist/refinements.css`: refined visual design, responsive controls and accessibility styles
- `dist/app.js`: application state and UI
- `dist/audio-engine.js`: Web Audio playback and offline demo synthesis
- `dist/library-store.js`: browser-local audio storage
- `dist/assets/`: original artwork and favicon
