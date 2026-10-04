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
- Desktop and mobile layouts, focus mode, keyboard shortcuts and Media Session controls.

Favorites, playlist membership for built-in demo tracks, and settings are stored in browser localStorage. Imported audio stays on the device and is held in memory for the current tab session; it must be reimported after a refresh. M3U export contains track references, not audio files. Demo references are specific to this app, not downloadable recordings.

All built-in sounds and cover graphics were created for this concept. The demonstration titles are fictional; the app does not stream recordings by commercial artists. This is an independent homage, not an official Winamp product.

## Source

- `dist/index.html`: application layout
- `dist/style.css`: theme and responsive layouts
- `dist/app.js`: application state and UI
- `dist/audio-engine.js`: Web Audio playback and offline demo synthesis
- `dist/assets/`: original artwork and favicon
