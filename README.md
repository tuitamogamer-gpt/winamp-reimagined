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
- Three persistent color skins: Original Lime, Amber and Arctic, including matching visualizers.
- Embedded title, artist, album, genre, year and cover art from ID3-tagged MP3 and native FLAC files; filename fallbacks for other formats.
- Editable playlist names and descriptions, with playlist deletion that preserves the library and current playback.
- An editable upcoming queue with play next, move up/down, remove and clear controls. Shuffle follows the visible queue and remembers its setting.
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
- `dist/audio-metadata.js`: bounded, offline ID3 and FLAC metadata parsing
- `dist/skins.js` and `dist/skins.css`: persistent themes and the accessible skin picker
- `dist/library-controls.css`: imported artwork and playback queue styles
- `dist/assets/`: original artwork and favicon

## Vercel deployment

The repository root contains `vercel.json` for a static deployment. Vercel serves `dist/` with no install or build step. Link the repository to Vercel using the project root and framework preset **Other**; pushes to the production branch deploy automatically.

For an authenticated, linked Vercel CLI checkout, run `vercel deploy --prod` from the repository root. The `.vercel/` local project link is intentionally ignored by Git.

Browser-local libraries are scoped to each domain. A new deployment domain starts with an empty uploaded library; original audio files can be imported there.
