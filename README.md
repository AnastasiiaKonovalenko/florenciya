# Голоса Флоренции · Voices of Florence

An offline theatrical script and manual audio cue controller. Plain UTF-8 HTML, CSS and JavaScript; no installation, build, server, dependencies, account or Internet connection required.

## Open and perform

1. Keep this entire folder together. Double-click **index.html** in a modern browser.
2. Read Golda’s dialogue and stage directions in chronological order. The first cue is selected initially; a thin gold outline indicates selection.
3. Press **Слушать** to play a recording, **Пауза** to pause, or **Сначала** to restart and play it. Starting another cue stops and rewinds the previous recording. No recording starts automatically.
4. Use **Текст записи** to show a complete spirit response inline. This never changes audio playback.
5. Use **Завершено** to manually mark a cue done, or **Снять отметку** to correct it. Natural audio completion also marks it done; missing audio and pauses do not.

Amber = PLAYING; muted green and checkmark = DONE; neutral = READY (paused recordings also say ПАУЗА). Completed cues remain completed when another cue starts and may be replayed. Browser localStorage retains completion marks when permitted; otherwise marks remain available for the current page session. Browsers may scope file storage differently after moving the folder or changing profiles. **Сбросить все отметки**, inside the keyboard/settings panel, asks for confirmation and stops playback before clearing completion marks.

**Keyboard:** Space plays/pauses the selected cue; Enter plays it; ↑/↓ select the previous/next cue; Escape stops and rewinds the active recording. Native buttons retain Space/Enter activation when focused. Shortcuts do not intercept editable fields. Tab navigates the controls.

Switch to **Режим чтения** for more spacious serif dialogue. Expand/collapse all transcripts from the keyboard/settings panel. Hand the complete folder to the lecturer to preserve audio and scripts together.

## Add recordings

Place your final MP3 recordings in `assets/audio/` using exactly these names:

| Cue | Filename |
|---|---|
| 01 | `01-pazzi-jerusalem.mp3` |
| 02 | `02-pazzi-power.mp3` |
| 03 | `03-pazzi-family.mp3` |
| 04 | `04-pazzi-conspiracy.mp3` |
| 05 | `05-pazzi-revenge.mp3` |
| 06 | `06-pazzi-final.mp3` |

All six supplied final MP3 recordings are included in `assets/audio/`; no placeholder recordings are bundled. Missing/unsupported files produce an inline error; the transcript and manual completion controls still work. After adding a recording, reload the page and press Play. Playback progress and seeking become available when the browser can determine the duration. A seek moves the position without starting a paused cue.

## Content and extension

- `script.md` is the supplied final Russian script, preserved as the source of truth.
- `script-data.js` supplies `window.PERFORMANCE`, loaded as a classic script so no fetch, modules or server are required.
- `app.js` renders the blocks and manages native HTMLAudioElement playback.
- `styles.css` contains the responsive performance and reading themes.

Add entries to `PERFORMANCE.blocks` in their exact performance order:

```js
{ type: 'heading', level: 3, text: 'Новая сцена' },
{ type: 'stageDirection', text: '(Пауза.)' },
{ type: 'dialogue', speaker: 'ИМЯ', text: 'Полная реплика.\n\nСледующий абзац.' },
{ type: 'audioCue', id: 'unique-stable-id', number: '07',
  title: 'Название записи', file: 'assets/audio/07-new-spirit.mp3',
  transcript: '**ДУХ:**\n\nПолный текст записи.' }
```

Any entry may have optional `sources` metadata; it is reserved for future use and is not rendered. Use unique stable cue IDs. Change `PERFORMANCE.id` for a separate performance to give its saved marks a separate namespace. Speakers and cue counts are data-driven. Preserve paragraphs with `\n\n` and line breaks with `\n`; inline `*emphasis*` and `**strong emphasis**` are supported safely without interpreting HTML. When changing the scenario, update both the source script and structured data. The cue titles follow the final script, including its titles for cues 03 and 04.

## Validation

Chromium checks exercised all six cue slots, chronological rendering, hidden transcripts, missing-file errors without false completion, manual marks, persistence, confirmation/reset, storage-unavailable fallback, reading mode, all-transcript controls and a 390px viewport without horizontal overflow. Native audio was exercised with temporary two-second WAV fixtures (removed afterward): pause, single-cue exclusivity, natural completion, replay, stop and keyboard navigation/playback. No JavaScript exceptions occurred.

Networking was disabled during browser checks; the runner supplied local assets directly. **This managed Chromium blocks file:// navigation with ERR_BLOCKED_BY_ADMINISTRATOR**, so direct double-click execution could not be verified here. No managed browser policies were changed. The app uses only relative classic scripts, stylesheet and audio paths, with no network requests or runtime imports.

For final rehearsal on the performance computer: open `index.html` directly with networking off; add the actual six MP3s; verify each recording through natural completion, pause/restart, volume, and replay. All six supplied MP3s passed browser loading, playback, duration, seeking and end-of-file completion checks with networking disabled (seeking near the end rather than listening to each recording in full). No playback or JavaScript errors occurred. Room audio output still requires rehearsal on the performance computer.
