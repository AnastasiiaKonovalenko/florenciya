/* Preserve the original Pazzi episode and append the approved acts. */
(() => {
  const performance = window.PERFORMANCE;
  if (!performance || !window.EXTRA_SEANCES) return;
  const base = performance.blocks;
  let previousSpeaker = null;
  for (const [chapterIndex, chapter] of window.EXTRA_SEANCES.entries()) {
    const [title, lines] = chapter;
    base.push({ type: 'heading', level: 2, text: title });
    previousSpeaker = null;
    for (const [kind, a, b] of lines) {
      if (kind === 'stage') {
        base.push({ type: 'stageDirection', text: a });
      } else if (kind === 'cue') {
        const file = a;
        base.push({
          type: 'audioCue',
          id: 'cue-' + (chapterIndex + 2) + '-' + file.replace(/[^a-z0-9]+/gi, '-'),
          number: file.slice(0,2),
          title: window.EXTRA_TITLES[file] || 'РЕПЛИКА ДУХА',
          file: 'assets/audio/' + file,
          transcript: '**ДУХ ' + (chapterIndex === 0 ? 'САВОНАРОЛЫ' : chapterIndex === 1 ? 'ЛОРЕНЦО' : 'ДАНТЕ') + ':**\\n\\n' + b
        });
        previousSpeaker = null;
      } else {
        const speaker = a;
        base.push({ type: 'dialogue', speaker: speaker === 'ФРЕЯ' && previousSpeaker === speaker ? '' : speaker, text: b });
        previousSpeaker = speaker;
      }
    }
  }
  performance.id = 'florence-complete-session';
})();
