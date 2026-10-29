'use strict';
(() => {
 const data=window.PERFORMANCE, root=document.querySelector('#script');
 const key='voices-of-florence:'+data.id+':done';
 let saved=[];try{const v=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(v))saved=v;}catch{}
 const done=new Set(saved), cues=[];let selected=0,active=null;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 // Only emphasis is interpreted; script text never becomes HTML.
 function rich(node,text){text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).forEach(t=>{if(t.startsWith('**'))node.append(el('strong','',t.slice(2,-2)));else if(t.startsWith('*'))node.append(el('em','',t.slice(1,-1)));else node.append(document.createTextNode(t));});}
 function persist(){try{localStorage.setItem(key,JSON.stringify([...done]));}catch{}updateSummary();}
 function updateSummary(){document.querySelector('#summary').textContent=`${cues.filter(c=>done.has(c.block.id)).length} / ${cues.length} завершено`;}
 function select(i){selected=Math.max(0,Math.min(cues.length-1,i));cues.forEach((c,j)=>c.card.classList.toggle('selected',j===selected));}
 const time=n=>Number.isFinite(n)?`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`:'—:—';
 function paint(c){const playing=!c.audio.paused&&!c.audio.ended;c.card.classList.toggle('playing',playing);c.card.classList.toggle('done',!playing&&done.has(c.block.id));c.status.textContent=playing?'▶ PLAYING · ВОСПРОИЗВЕДЕНИЕ':done.has(c.block.id)?'✓ DONE · ЗАВЕРШЕНО':c.audio.currentTime>0?'Ⅱ READY · ПАУЗА':'READY · ГОТОВО';c.play.textContent=playing?'Ⅱ Пауза':'▶ Слушать';c.play.setAttribute('aria-label',`${playing?'Пауза':'Воспроизвести'}: ${c.block.title}`);c.mark.textContent=done.has(c.block.id)?'Снять отметку':'✓ Завершено';c.mark.setAttribute('aria-pressed',String(done.has(c.block.id)));}
 function stop(c){if(!c)return;c.request++;c.audio.pause();c.audio.currentTime=0;paint(c);if(active===c)active=null;}
 function fail(c){c.error.textContent=`Не удалось воспроизвести ${c.block.file}. Добавьте MP3 в папку assets/audio или проверьте формат файла и повторите запуск. Текст записи доступен ниже.`;paint(c);}
 async function play(c,restart=false){select(cues.indexOf(c));if(active&&active!==c)stop(active);if(restart)c.audio.currentTime=0;active=c;c.error.textContent='';const request=++c.request;try{await c.audio.play();if(request!==c.request)return;c.card.scrollIntoView({behavior:'instant',block:'nearest'});}catch{if(request===c.request)fail(c);}}
 function toggle(c){if(c.audio.paused)play(c);else{c.request++;c.audio.pause();paint(c);}}
 function expand(c,value){c.transcript.hidden=!value;c.transcriptButton.setAttribute('aria-expanded',String(value));}
 const chapterJump=document.querySelector('#chapter-jump');
 let chapterIndex=0;
 const chapterNames=['Паццо ди Раньери','Джироламо Савонарола','Лоренцо Медичи','Данте Алигьери'];
 data.blocks.forEach(block=>{
  if(block.type==='heading'){
   const isChapter=block.level===2&&(block.text.includes('Сеанс первый')||chapterNames.slice(1).some(name=>block.text.includes(name)));
   if(isChapter){
    const i=chapterIndex++;
    const section=el('section','chapter');section.id='chapter-'+(i+1);
    const ornament=el('div','chapter-ornament');ornament.setAttribute('aria-hidden','true');ornament.append(el('span','','❦  ❧  ❦'));section.append(ornament);
    const card=el('div','chapter-heading');card.append(el('div','chapter-kicker','Сеанс '+String(i+1).padStart(2,'0')+' · Интервью с духом'));
    card.append(el('h2','chapter-name',chapterNames[i]||block.text));
    card.append(el('p','chapter-footnote',i===0?'Пацци, или Покой нам только снится':'Голоса Флоренции · спиритический сеанс'));
    section.append(card);root.append(section);
    const option=el('option','',String(i+1).padStart(2,'0')+' — '+(chapterNames[i]||block.text));option.value=section.id;chapterJump.append(option);
   }else root.append(el('h'+Math.max(2,Math.min(block.level,3)),'',block.text));
   return;
  }
  if(block.type==='stageDirection'){root.append(el('p','stage',block.text));return;}
  if(block.type==='dialogue'){const p=el('div','dialogue');p.append(el('span','speaker',block.speaker));rich(p,block.text);root.append(p);return;}
  if(block.type!=='audioCue')return;
  const card=el('section','cue');card.id=block.id;card.setAttribute('aria-label',`Аудио ${block.number}: ${block.title}`);
  const title=el('div','cue-title');title.append(el('span','cue-number',block.number),el('h4','',block.title));card.append(title);
  const status=el('div','status');status.setAttribute('aria-live','polite');card.append(status);
  const controls=el('div','controls');const button=text=>{const b=el('button','',text);b.type='button';controls.append(b);return b;};
  const playButton=button('▶ Слушать');playButton.className='play';const restart=button('↺ Сначала'),transcriptButton=button('▤ Текст записи'),mark=button('✓ Завершено');
  const timeline=el('div','timeline'),range=el('input');range.type='range';range.min=0;range.max=100;range.value=0;range.disabled=true;range.setAttribute('aria-label',`Позиция записи ${block.number}`);const clock=el('span','','0:00 / —:—');timeline.append(range,clock);
  const error=el('p','error');error.setAttribute('role','status');const transcript=el('div','transcript');transcript.id=block.id+'-text';transcript.hidden=true;rich(transcript,block.transcript);transcriptButton.setAttribute('aria-controls',transcript.id);transcriptButton.setAttribute('aria-expanded','false');
  card.append(controls,timeline,error,transcript);root.append(card);
  const audio=new Audio();audio.preload='none';audio.src=block.file;
  const c={block,card,status,play:playButton,mark,range,clock,error,transcript,transcriptButton,audio,request:0};cues.push(c);
  playButton.onclick=()=>toggle(c);restart.onclick=()=>play(c,true);transcriptButton.onclick=()=>expand(c,transcript.hidden);mark.onclick=()=>{done.has(block.id)?done.delete(block.id):done.add(block.id);persist();paint(c);};
  card.addEventListener('pointerdown',()=>select(cues.indexOf(c)));card.addEventListener('focusin',()=>select(cues.indexOf(c)));
  function progress(){const valid=Number.isFinite(audio.duration)&&audio.duration>0;range.disabled=!valid;range.value=valid?100*audio.currentTime/audio.duration:0;clock.textContent=`${time(audio.currentTime)} / ${time(audio.duration)}`;}
  range.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*range.value/100;};
  ['loadedmetadata','durationchange','timeupdate','emptied'].forEach(event=>audio.addEventListener(event,progress));
  ['play','pause'].forEach(event=>audio.addEventListener(event,()=>paint(c)));
  audio.addEventListener('ended',()=>{done.add(block.id);persist();paint(c);if(active===c)active=null;});audio.addEventListener('error',()=>fail(c));paint(c);
 });
 window.addEventListener('florence:audio-loaded', event => {
  for (const c of cues) {
   const replacement=event.detail.get(c.block.file);
   if (!replacement) continue;
   if (active===c)stop(c);
   c.audio.src=replacement;
   c.audio.load();
   c.error.textContent='';
   paint(c);
  }
 });
 chapterJump.addEventListener('change',()=>{if(!chapterJump.value)return;document.getElementById(chapterJump.value)?.scrollIntoView({behavior:'smooth',block:'start'});});
 select(0);updateSummary();
 document.querySelector('#stop').onclick=()=>stop(active);
 document.querySelector('#expand').onclick=()=>cues.forEach(c=>expand(c,true));document.querySelector('#collapse').onclick=()=>cues.forEach(c=>expand(c,false));
 document.querySelector('#reset').onclick=()=>{if(confirm('Сбросить все отметки завершения? Воспроизведение будет остановлено.')){stop(active);done.clear();persist();cues.forEach(paint);}};
 ['performance','reading'].forEach(mode=>document.querySelector('#'+mode).onclick=()=>{document.body.classList.toggle('reading',mode==='reading');['performance','reading'].forEach(m=>document.querySelector('#'+m).setAttribute('aria-pressed',String(mode===m)));});
 document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;if(e.key==='Escape'){e.preventDefault();stop(active);return;}if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();select(selected+(e.key==='ArrowDown'?1:-1));cues[selected]?.card.scrollIntoView({block:'nearest'});}else if((e.code==='Space'||e.key==='Enter')&&!e.target.closest('button,summary,a')){e.preventDefault();const c=cues[selected];if(c)e.key==='Enter'?play(c):toggle(c);}});
})();
