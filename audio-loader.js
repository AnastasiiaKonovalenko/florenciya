/* ZIP_STORED MP3 override. The supplied audio bundle works without unpacking. */
(() => {
  const input = document.querySelector('#audio-bundle');
  const status = document.querySelector('#audio-bundle-status');
  if (!input) return;
  const encoder = new TextDecoder();
  const urls = [];
  input.addEventListener('change', async () => {
    for (const url of urls) URL.revokeObjectURL(url);
    urls.length = 0;
    try {
      const file = input.files?.[0];
      if (!file) return;
      const bytes = await file.arrayBuffer();
      const view = new DataView(bytes);
      const overrides = new Map();
      let offset = 0;
      while (offset + 30 <= bytes.byteLength && view.getUint32(offset,true) === 0x04034b50) {
        const flags=view.getUint16(offset+6,true);
        const compression=view.getUint16(offset+8,true);
        const size=view.getUint32(offset+18,true);
        const nameLength=view.getUint16(offset+26,true);
        const extraLength=view.getUint16(offset+28,true);
        const filename=encoder.decode(new Uint8Array(bytes,offset+30,nameLength));
        const start=offset+30+nameLength+extraLength;
        if (flags & 8) throw new Error('ZIP с data descriptor не поддерживается — используйте приложенный ZIP.');
        if (compression !== 0) throw new Error('Нужен ZIP без сжатия (ZIP_STORED).');
        if (start+size > bytes.byteLength) throw new Error('Повреждён ZIP.');
        if (filename.endsWith('.mp3')) {
          const blob=new Blob([bytes.slice(start,start+size)],{type:'audio/mpeg'});
          const url=URL.createObjectURL(blob);
          urls.push(url);
          overrides.set('assets/audio/'+filename.split('/').pop(),url);
        }
        offset=start+size;
      }
      if (!overrides.size) throw new Error('В ZIP нет MP3.');
      window.dispatchEvent(new CustomEvent('florence:audio-loaded',{detail:overrides}));
      status.textContent='Подключено '+overrides.size+' записей. Можно запускать аудио.';
    } catch (error) {
      status.textContent='Не удалось загрузить аудио: '+error.message;
    }
  });
})();