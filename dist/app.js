import { AudioEngine } from './audio-engine.js';
import { libraryStore, fileSignature } from './library-store.js';

const icons = {
'disc':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M7 12a5 5 0 0 1 5-5m0 10a5 5 0 0 0 5-5"/>',
'library':'<path d="M4 4v16M9 4v16M14 4v16m4-16 3 16"/>',
'heart':'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
'history':'<path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7m2-5v6l4 2"/>',
'plus':'<path d="M12 5v14M5 12h14"/>',
'folder':'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>',
'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
'sliders':'<path d="M5 3v5m0 4v9m7-18v11m0 4v3m7-18v2m0 4v12M2 8h6m1 6h6m1-9h6"/>',
'keyboard':'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
'more':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
'reset':'<path d="M3 10a9 9 0 1 1 1.8 8M3 4v6h6"/>',
'chevron-down':'<path d="m6 9 6 6 6-6"/>',
'moon':'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
'headphones':'<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
'shuffle':'<path d="m18 3 3 3-3 3m0 6 3 3-3 3M3 6h3c5 0 7 12 12 12h3M3 18h3c2 0 4-2 5-4m2-4c1-2 3-4 5-4h3"/>',
'skip-back':'<path d="M5 4v16m14-15L7 12l12 7Z"/>',
'skip-forward':'<path d="M19 4v16M5 5l12 7-12 7Z"/>',
'play':'<path d="m7 4 13 8-13 8Z"/>',
'pause':'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
'repeat':'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-3v5a2 2 0 0 1-2 2H3"/>',
'volume':'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
'muted':'<path d="m11 4-6 5H2v6h3l6 5Zm5 5 5 6m0-6-5 6"/>',
'queue':'<path d="M3 5h16M3 10h16M3 15h8m4-1 6 4-6 4Z"/>',
'expand':'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
'minimize':'<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>',
'upload':'<path d="M12 16V3m-5 5 5-5 5 5M3 15v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>',
'x':'<path d="m6 6 12 12M6 18 18 6"/>',
'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
'check':'<path d="m5 12 4 4L19 6"/>',
'download':'<path d="M12 3v13m-5-5 5 5 5-5M3 16v5h18v-5"/>',
'music':'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',
'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
'list':'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
'delete':'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'
};
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" data-name="${name}">${icons[name] || icons.music}</svg>`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fillIcons(root = document) { root.querySelectorAll('i[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon)); }
fillIcons();
const formatTime = s => `${Math.floor((s || 0)/60)}:${String(Math.floor((s || 0)%60)).padStart(2,'0')}`;
const loadStored = (key, fallback) => { try { const val=localStorage.getItem(`winamp-${key}`); return val ? JSON.parse(val) : fallback; } catch { return fallback; } };
const save = (key,val) => { try { localStorage.setItem(`winamp-${key}`,JSON.stringify(val)); } catch {} };
const demoTracks = [
{id:'demo-1',title:'Midnight City',artist:'Neon Collective',album:'After Hours',genre:'Electronic',duration:222,art:'afterhours',seed:1},
{id:'demo-2',title:'Weightless',artist:'Low Tide',album:'Slow Mornings',genre:'Ambient',duration:256,art:'slowmornings',seed:2},
{id:'demo-3',title:'Lunar Drift',artist:'Neon Collective',album:'Moonwalk',genre:'Downtempo',duration:238,art:'moonwalk',seed:3},
{id:'demo-4',title:'Somewhere, Somehow',artist:'Coastal',album:'Blue Hour',genre:'Indie',duration:203,art:'bluehour',seed:4},
{id:'demo-5',title:'Soft Focus',artist:'Sunday Service',album:'Warmth',genre:'Lo-fi',duration:187,art:'warmth',seed:5},
{id:'demo-6',title:'Into the Quiet',artist:'Low Tide',album:'Slow Mornings',genre:'Ambient',duration:271,art:'slowmornings',seed:6},
{id:'demo-7',title:'Analog Dreams',artist:'Tape Theory',album:'Static & Soul',genre:'Electronic',duration:246,art:'static',seed:7},
{id:'demo-8',title:'The Last Light',artist:'Coastal',album:'Blue Hour',genre:'Downtempo',duration:294,art:'bluehour',seed:8}
];
let tracks = [...demoTracks];
const defaultPlaylists = [{id:'afterhours',name:'After Hours',color:'#b9d687',description:'Za one koji ne gledaju na sat.',ids:demoTracks.map(t=>t.id)},{id:'slowmornings',name:'Slow Mornings',color:'#d3b78c',description:'Polako. Dan tek počinje.',ids:['demo-2','demo-5','demo-6']},{id:'deepfocus',name:'Deep Focus',color:'#a0a8cc',description:'Pronađi svoj fokus.',ids:['demo-3','demo-6','demo-7']},{id:'onrepeat',name:'On Repeat',color:'#c09288',description:'Još jednom, od početka.',ids:['demo-1','demo-4','demo-8']}];
let playlists = loadStored('playlists',defaultPlaylists);
if (!Array.isArray(playlists) || !playlists.length) playlists=defaultPlaylists;
let favorites = new Set(loadStored('favorites',['demo-1','demo-3','demo-5']));
let recent = loadStored('recent',[]);
let activePlaylist='afterhours',view='player',currentId='demo-1',playing=false,shuffle=false,repeat=0,playQueue=demoTracks.map(t=>t.id),queuePosition=0;
let volume=Number(loadStored('volume',0.7)),lastVolume=volume || 0.7,eqEnabled=loadStored('eqEnabled',true),visualMode=loadStored('visualMode','spectrum');
let settings = {...{animations:true,autoNext:true},...loadStored('settings',{})};
let importTarget=null,toastTimer,dragDepth=0,loadVersion=0,focusMode=false;
let scrubbing=false,pendingSeek=0,menuTrigger=null,queueTrigger=null,dialogTrigger=null;
const presets={chill:[4,3,1,-1,-2,-1,1,3,2,1],flat:[0,0,0,0,0,0,0,0,0,0],bass:[9,7,5,2,0,0,1,2,1,0],rock:[5,4,2,-1,-2,1,3,5,5,4],vocal:[-3,-2,0,3,5,5,3,1,-1,-2]};
let eqGains=loadStored('eqGains',presets.chill);
if (!Array.isArray(eqGains)||eqGains.length!==10)eqGains=[...presets.chill];
let currentPreset=loadStored('eqPreset','chill');
const engine=new AudioEngine({
 onTime: (time,duration)=>updateTime(time,duration),
 onState: state=>{playing=state;syncPlaybackControls();renderTracks();},
 onEnded: ()=>{if(repeat===2){engine.seek(0);engine.play().catch(showError);}else if(settings.autoNext) nextTrack(true);},
 onError: error=>{toast(error.message.includes('format')?'Format datoteke nije podržan u ovom pregledniku.':'Datoteku nije moguće reproducirati. Pokušaj s MP3 ili WAV datotekom.');}
});
function showError(error){console.error(error);toast('Reprodukcija nije uspjela. Pokušaj ponovno.');}
engine.setVolume(volume);engine.setEq(eqGains);engine.setEqEnabled(eqEnabled);
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function trackById(id){return tracks.find(t=>t.id===id);}
function currentTrack(){return trackById(currentId)||tracks[0];}
function currentList(){if(view==='library')return tracks;if(view==='favorites')return tracks.filter(t=>favorites.has(t.id));if(view==='recent')return recent.map(trackById).filter(Boolean);return (playlists.find(p=>p.id===activePlaylist)?.ids||[]).map(trackById).filter(Boolean);}
function filteredList(){const q=$('#search').value.trim().toLocaleLowerCase();return currentList().filter(t=>`${t.title} ${t.artist} ${t.album} ${t.genre}`.toLocaleLowerCase().includes(q));}
function thumb(t,className='track-thumb'){return `<div class="${className}" data-art="${esc(t.art)}" data-label="${esc(t.album.toUpperCase())}"><div class="cover-art"></div></div>`;}
function persistPlaylists(){save('playlists',playlists);}
function persistLibraryReferences(){persistPlaylists();save('favorites',[...favorites]);save('recent',recent);}
async function restoreLibrary(){
 try{
  const stored=await libraryStore.list();
  for(const record of stored){
   const {file,...metadata}=record;
   if(typeof metadata.id!=='string'||!metadata.id.startsWith('local-')||!(file instanceof Blob)||!file.size||!Number.isFinite(metadata.duration)||metadata.duration<=0||typeof metadata.title!=='string')continue;
   tracks.push({...metadata,artist:typeof metadata.artist==='string'?metadata.artist:'S tvog uređaja',album:typeof metadata.album==='string'?metadata.album:'Moja muzika',genre:'Local',art:'local',src:URL.createObjectURL(file),persisted:true});
  }
  const known=new Set(tracks.map(t=>t.id));
  playlists.forEach(p=>p.ids=p.ids.filter(id=>known.has(id)));
  favorites=new Set([...favorites].filter(id=>known.has(id)));
  recent=recent.filter(id=>known.has(id));
  persistLibraryReferences();renderHeading();renderTracks();renderQueue();
 }catch{toast('Lokalna pohrana nije dostupna. Nove pjesme ostaju samo do osvježavanja stranice.');}
}
function renderSidebar(){
 $('#sidebar-playlists').innerHTML=playlists.map(p=>`<button class="playlist-nav ${activePlaylist===p.id&&view==='player'?'active':''}" data-playlist="${esc(p.id)}"><span class="playlist-dot" style="--dot-color:${/^#[\da-f]{6}$/i.test(p.color)?p.color:'#b9d687'}"></span>${esc(p.name)}</button>`).join('');
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 $('#library-count').textContent=tracks.length;
}
function renderHeading(){
 const p=playlists.find(p=>p.id===activePlaylist)||playlists[0];const list=currentList();const minutes=Math.round(list.reduce((s,t)=>s+t.duration,0)/60);
 const title=view==='library'?'Tvoja biblioteka':view==='favorites'?'Tvoji favoriti':view==='recent'?'Nedavno slušano':p.name;
 $('#page-title').innerHTML=view==='player'?'Tvoj zvuk. Bez granica<span>.</span>':`${esc(title)}<span>.</span>`;
 $('#page-description').textContent=view==='player'?'Pritisni play. Isključi ostatak svijeta.':view==='library'?'Sva tvoja muzika, na jednom mjestu.':view==='favorites'?'Pjesme kojima se uvijek vraćaš.':'Svaki dobar ritam ostavlja trag.';
 $('#breadcrumb-current').textContent=view==='player'?'Player':title;
 $('#playlist-title').textContent=title;
 $('#playlist-type').textContent=view==='player'?'PLAYLISTA':'BIBLIOTEKA';
 $('#playlist-summary').innerHTML=`${list.length} ${list.length===1?'pjesma':'pjesama'} <span>·</span> ${minutes} min${view==='player'?` <span>·</span> ${esc(p.description||'Tvoj osobni soundtrack.')}`:''}`;
 $('#player-grid').hidden=view!=='player';
 $('#demo-note').textContent=list.some(t=>!t.src)?'Originalni generirani demo zvukovi. Dodaj muziku za svoj vlastiti miks.':'Lokalne datoteke ostaju na tvom uređaju.';
 renderSidebar();
}
function renderTracks(){
 const active=document.activeElement,activeRow=active?.closest('.track-row');
 const focused=activeRow?{id:activeRow.dataset.id,index:[...activeRow.parentNode.children].indexOf(activeRow),action:active.classList.contains('track-like')?'track-like':active.classList.contains('track-menu')?'track-menu':active.classList.contains('row-play')?'row-play':null}:null;
 const list=filteredList();
 if(!list.length){const isSearch=!!$('#search').value;$('#track-list').innerHTML=`<div class="empty-state">${icon(isSearch?'search':view==='favorites'?'heart':'music')}<h3>${isSearch?'Nema pronađenih pjesama':view==='favorites'?'Za muziku koju voliš':view==='recent'?'Tvoj ritam tek počinje':'Playlista čeka svoj prvi zvuk'}</h3><p>${isSearch?'Pokušaj s drugim naslovom, izvođačem ili albumom.':view==='favorites'?'Dodirni srce uz pjesmu i pronađi je ovdje.':view==='recent'?'Pokreni pjesmu i ona će se pojaviti ovdje.':'Dodaj pjesme sa svog uređaja ili iz biblioteke.'}</p>${!isSearch&&view==='player'?'<button class="primary-button" data-empty-add>Dodaj iz biblioteke</button>':''}</div>`;if(focused)$('#search').focus({preventScroll:true});return;}
 $('#track-list').innerHTML=list.map((t,i)=>`<div class="track-row ${t.id===currentId?'current':''}" data-id="${esc(t.id)}" tabindex="0" role="group" aria-label="${esc(t.title+' — '+t.artist)}"><div class="track-num"><span class="track-number">${t.id===currentId?'<span class="equal-bars"><b></b><b></b><b></b></span>':String(i+1).padStart(2,'0')}</span><button class="row-play" aria-label="${t.id===currentId&&playing?'Pauziraj':'Reproduciraj'} ${esc(t.title)}">${icon(t.id===currentId&&playing?'pause':'play')}</button></div><div class="track-title-cell">${thumb(t)}<div class="track-meta"><strong>${esc(t.title)}</strong><span>${esc(t.artist)}</span></div></div><div class="album-cell">${esc(t.album)}</div><div class="genre-cell"><span class="genre-tag">${esc(t.genre)}</span></div><button class="icon-button track-like ${favorites.has(t.id)?'liked':''}" aria-label="${favorites.has(t.id)?'Ukloni iz favorita':'Dodaj u favorite'}: ${esc(t.title)}" aria-pressed="${favorites.has(t.id)}">${icon('heart')}</button><div class="track-duration">${formatTime(t.duration)}</div><button class="icon-button track-menu" aria-label="Opcije: ${esc(t.title)}" aria-haspopup="menu">${icon('more')}</button></div>`).join('');
 if(focused){const rows=$$('#track-list .track-row'),row=rows.find(r=>r.dataset.id===focused.id)||rows[Math.min(focused.index,rows.length-1)];if(row){row.focus({preventScroll:true});if(focused.action)row.querySelector('.'+focused.action)?.focus({preventScroll:true});}}
}
function renderCurrent(){
 const t=currentTrack();$('#now-title').textContent=t.title;$('#now-artist').textContent=t.artist;$('#now-album').innerHTML=`${esc(t.album)} <span>·</span> ${t.src?'Lokalna datoteka':'2026'}`;$('#track-genre').textContent=t.src?'TVOJA LOKALNA MUZIKA':`${t.genre.toUpperCase()} · WINAMP ORIGINALS`;
 $('#main-cover').dataset.art=t.art;$('#mini-cover').dataset.art=t.art;$('#main-cover .cover-title').innerHTML=esc(t.album.toUpperCase()).replace(' ','<br>')+'<span>THE SOUND IS YOURS.</span>';
 $('#mini-title').textContent=t.title;$('#mini-artist').textContent=t.artist;$('#quality-tag').textContent=t.src?(t.format||'LOCAL AUDIO'):'DEMO AUDIO';$('#signal-text').textContent=t.src?'LOCAL AUDIO':'ORIGINAL DEMO';
 $$('.like-current').forEach(b=>{b.classList.toggle('liked',favorites.has(t.id));b.setAttribute('aria-label',favorites.has(t.id)?'Ukloni iz favorita':'Dodaj u favorite');b.setAttribute('aria-pressed',favorites.has(t.id));});
 updateTime(engine.currentTime||0,t.duration);renderTracks();renderQueue();document.title=`${t.title} — Winamp`;
 if('mediaSession' in navigator && 'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:t.album});
}
function syncPlaybackControls(){
 document.body.classList.toggle('playing',playing);
 const label=playing?'Pauziraj reprodukciju':'Pokreni reprodukciju';
 $('#play').innerHTML=icon(playing?'pause':'play');$('#play').setAttribute('aria-label',label);
 $('#hero-play').innerHTML=icon(playing?'pause':'play')+`<span>${playing?'Pauziraj':'Pokreni'}</span>`;$('#hero-play').setAttribute('aria-label',label);
 $('#playback-state').textContent=playing?'REPRODUKCIJA':'SPREMNO';
}
function updateTime(time,duration,preview=false){
 if(scrubbing&&!preview)return;
 duration=Number.isFinite(duration)&&duration>0?duration:currentTrack().duration;
 $('#current-time').textContent=formatTime(time);$('#duration').textContent=formatTime(duration);
 $('#wave-current').textContent=formatTime(time).padStart(5,'0');$('#wave-duration').textContent=formatTime(duration).padStart(5,'0');
 for(const input of [$('#seek'),$('#wave-seek')]){input.max=duration;input.value=time;input.style.setProperty('--progress',`${(time/duration)*100||0}%`);input.setAttribute('aria-valuetext',`${formatTime(time)} od ${formatTime(duration)}`);}
}
async function selectTrack(id,autoplay=true,newQueue=null,position=null){
 const t=trackById(id);if(!t)return;
 scrubbing=false;const version=++loadVersion;if(newQueue?.length)playQueue=[...newQueue];queuePosition=position??Math.max(0,playQueue.indexOf(id));currentId=id;renderCurrent();
 try{await engine.load(t);if(version!==loadVersion)return;renderCurrent();if(autoplay){await engine.play();addRecent(id);}}catch(err){if(version===loadVersion)showError(err);}
}
function addRecent(id){recent=[id,...recent.filter(x=>x!==id)].slice(0,100);save('recent',recent);if(view==='recent'){renderHeading();renderTracks();}}
async function togglePlay(){try{if(playing)engine.pause();else{await engine.play();addRecent(currentId);}}catch(err){showError(err);}}
function nextTrack(ended=false){
 const queue=playQueue.filter(trackById);if(!queue.length)return;
 let index=queuePosition,nextPosition;
 if(shuffle){const options=queue.map((id,i)=>i).filter(i=>i!==index);nextPosition=options[Math.floor(Math.random()*options.length)]??0;}
 else {if(ended&&index===queue.length-1&&repeat===0){engine.seek(0);return;}nextPosition=(index+1)%queue.length;}
 selectTrack(queue[nextPosition],true,null,nextPosition);
}
function previousTrack(){if(engine.currentTime>3){engine.seek(0);return;}const q=playQueue.filter(trackById);if(q.length){const pos=(queuePosition-1+q.length)%q.length;selectTrack(q[pos],true,null,pos);}}
function toggleFavorite(id){if(favorites.has(id))favorites.delete(id);else favorites.add(id);save('favorites',[...favorites]);renderCurrent();if(view==='favorites')renderHeading();}
function setView(next,playlist){view=next;if(playlist)activePlaylist=playlist;$('#search').value='';renderHeading();renderTracks();setSidebar(false);setSearchOpen(false);}
function renderQueue(){const q=playQueue.filter(trackById);const index=queuePosition;const upcoming=q.slice(index+1);$('#queue-description').textContent=shuffle?'Nasumična reprodukcija je uključena.':`${upcoming.length} ${upcoming.length===1?'pjesma':'pjesama'} čeka svoj trenutak.`;$('#queue-list').innerHTML=upcoming.length?upcoming.map((id,i)=>{const t=trackById(id);return `<button class="queue-item" data-queue-id="${esc(id)}" data-queue-position="${index+1+i}">${thumb(t)}<span class="track-meta"><strong>${esc(t.title)}</strong><span>${esc(t.artist)}</span></span><span class="track-duration">${formatTime(t.duration)}</span></button>`;}).join(''):'<div class="empty-state"><h3>To je to za sada.</h3><p>Dodaj još pjesama u red.</p></div>';}
function syncOverlayState(){document.body.style.overflow=(!$('#queue-drawer').hidden||$('#sidebar').classList.contains('open'))?'hidden':'';}
function toggleQueue(force){
 const open=force??$('#queue-drawer').hidden,wasOpen=!$('#queue-drawer').hidden;
 if(open&&!wasOpen)queueTrigger=document.activeElement;
 $('#queue-drawer').hidden=!open;$('#queue-backdrop').hidden=!open;
 $('#queue-toggle').classList.toggle('active',open);$('#queue-toggle').setAttribute('aria-expanded',open);$('#wave-queue').setAttribute('aria-expanded',open);
 if(open){renderQueue();$('#queue-close').focus({preventScroll:true});}else if(wasOpen&&queueTrigger?.isConnected){queueTrigger.focus({preventScroll:true});}
 syncOverlayState();
}
function setSidebar(open,restore=true){
 const wasOpen=$('#sidebar').classList.contains('open');
 $('#sidebar').classList.toggle('open',open);$('#nav-backdrop').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',open);
 if(open)$('#sidebar .nav-item.active')?.focus({preventScroll:true});else if(wasOpen&&restore)$('#menu-toggle').focus({preventScroll:true});
 syncOverlayState();
}
function trapFocus(e,container){
 if(e.key!=='Tab')return;
 const items=[...container.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 if(!items.length)return;
 const first=items[0],last=items[items.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
}
function setVolume(value){volume=Math.min(1,Math.max(0,value));if(volume>0)lastVolume=volume;engine.setVolume(volume);$('#volume').value=volume;$('#volume').style.setProperty('--progress',`${volume*100}%`);$('#mute').innerHTML=icon(volume===0?'muted':'volume');$('#mute').setAttribute('aria-label',volume===0?'Uključi zvuk':'Isključi zvuk');$('#volume').setAttribute('aria-valuetext',`${Math.round(volume*100)}%`);if($('#quick-volume')){$('#quick-volume').value=volume;$('#quick-volume').style.setProperty('--progress',`${volume*100}%`);$('#quick-volume').setAttribute('aria-valuetext',`${Math.round(volume*100)}%`);$('#quick-volume-value').textContent=`${Math.round(volume*100)}%`;$('#quick-mute').innerHTML=icon(volume?'volume':'muted');$('#quick-mute').setAttribute('aria-label',volume?'Isključi zvuk':'Uključi zvuk');}save('volume',volume);}
function renderEq(){const labels=['32','64','125','250','500','1K','2K','4K','8K','16K'];$('#eq-sliders').innerHTML=labels.map((l,i)=>`<div class="eq-band"><input id="eq-${i}" data-band="${i}" type="range" min="-12" max="12" step="1" value="${eqGains[i]}" aria-label="Ekvilizator ${l} Hz" aria-valuetext="${eqGains[i]} dB" ${!eqEnabled?'disabled':''}><label for="eq-${i}">${l}</label></div>`).join('');$('#eq-preset').value=currentPreset;$('#eq-toggle').classList.toggle('on',eqEnabled);$('#eq-toggle').setAttribute('aria-checked',eqEnabled);$('.eq-card').classList.toggle('eq-disabled',!eqEnabled);}
function saveEq(){engine.setEq(eqGains);save('eqGains',eqGains);save('eqPreset',currentPreset);}
function openDialog(title,body){if(innerWidth<=760&&$('#sidebar').classList.contains('open'))setSidebar(false);dialogTrigger=document.activeElement;$('#dialog-content').innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-close aria-label="Zatvori">${icon('x')}</button></div>${body}`;$('#dialog').showModal();$('#dialog [data-close]').onclick=()=>$('#dialog').close();}
function newPlaylistDialog(){openDialog('Nova playlista',`<p class="dialog-description">Svaki dobar miks počinje s imenom.</p><form class="dialog-form" id="playlist-form"><label for="playlist-name">Ime playliste</label><input id="playlist-name" placeholder="Moj savršeni miks" maxlength="50" required autofocus><label for="playlist-description">Kratki opis (opcionalno)</label><input id="playlist-description" placeholder="Za neke posebne trenutke..." maxlength="100"><button class="primary-button" type="submit">Kreiraj playlistu ${icon('plus')}</button></form>`);$('#playlist-form').onsubmit=e=>{e.preventDefault();const name=$('#playlist-name').value.trim();if(!name)return;const p={id:crypto.randomUUID(),name,description:$('#playlist-description').value.trim(),color:'#b9d687',ids:[]};playlists.push(p);persistPlaylists();$('#dialog').close();setView('player',p.id);toast('Playlista je spremna za tvoj zvuk.');};}
function addLibraryDialog(){const p=playlists.find(p=>p.id===activePlaylist);openDialog('Dodaj u playlistu',`<p class="dialog-description">Odaberi pjesme za ${esc(p.name)}.</p><form id="library-add-form" class="dialog-form"><div style="max-height:310px;overflow:auto">${tracks.map(t=>`<label class="setting-row"><span><strong>${esc(t.title)}</strong><p>${esc(t.artist)}</p></span><input type="checkbox" value="${esc(t.id)}" ${p.ids.includes(t.id)?'checked disabled':''} style="width:16px"></label>`).join('')}</div><button class="primary-button" type="submit">Dodaj odabrane pjesme</button><button type="button" class="text-button" id="dialog-import" style="padding:10px">Dodaj datoteke s uređaja ${icon('upload')}</button></form>`);$('#library-add-form').onsubmit=e=>{e.preventDefault();const ids=[...$('#library-add-form').querySelectorAll('input:checked')].map(i=>i.value);p.ids=[...new Set([...p.ids,...ids])];persistPlaylists();$('#dialog').close();renderHeading();renderTracks();toast('Playlista je ažurirana.');};$('#dialog-import').onclick=()=>{$('#dialog').close();pickFiles(activePlaylist);};}
function pickFiles(target=null){importTarget=target;$('#file-input').click();}
let importChain=Promise.resolve();
function importFiles(files,target=importTarget){
 const batch=[...files],playlistId=target||activePlaylist;
 $('#file-input').value='';importTarget=null;
 importChain=importChain.then(()=>importBatch(batch,playlistId)).catch(()=>toast('Uvoz nije uspio. Pokušaj ponovno.'));
 return importChain;
}
function readDuration(src){
 return new Promise(resolve=>{
  const meta=new Audio();meta.preload='metadata';
  const finish=duration=>{clearTimeout(timer);meta.onloadedmetadata=meta.onerror=null;meta.removeAttribute('src');meta.load();resolve(duration);};
  const timer=setTimeout(()=>finish(0),4000);
  meta.onloadedmetadata=()=>finish(Number.isFinite(meta.duration)?meta.duration:0);
  meta.onerror=()=>finish(0);meta.src=src;
 });
}
async function importBatch(files,playlistId){
 await libraryReady;
 const valid=files.filter(f=>f.type.startsWith('audio/')||/\.(mp3|wav|ogg|flac|m4a|aac|opus|aiff|webm)$/i.test(f.name));
 if(!valid.length){toast('Odaberi audio datoteke, npr. MP3, WAV ili FLAC.');return;}
 const added=[];let imported=0,duplicates=0,sessionOnly=0,unreadable=0;
 for(const file of valid){
  const signature=fileSignature(file),existing=tracks.find(t=>t.signature===signature);
  if(existing){added.push(existing.id);duplicates++;continue;}
  const src=URL.createObjectURL(file),duration=await readDuration(src);
  if(!duration){URL.revokeObjectURL(src);unreadable++;continue;}
  const name=file.name.replace(/\.[^.]+$/,''),parts=name.split(' - ');
  const t={id:`local-${crypto.randomUUID()}`,title:parts.length>1?parts.slice(1).join(' - '):name,artist:parts.length>1?parts[0]:'S tvog uređaja',album:'Moja muzika',genre:'Local',duration,art:'local',src,signature,format:file.name.split('.').pop().toUpperCase(),persisted:false};
  try{await libraryStore.save(t,file);t.persisted=true;}catch{sessionOnly++;}
  tracks.push(t);added.push(t.id);imported++;
 }
 if(added.length){
  const p=playlists.find(p=>p.id===playlistId);if(p)p.ids=[...new Set([...p.ids,...added])];
  persistPlaylists();renderHeading();renderTracks();
  if(view!=='player'&&view!=='library')setView('library');
 }
 if(sessionOnly)toast(`${sessionOnly} ${sessionOnly===1?'pjesma je dostupna':'pjesama je dostupno'} samo sada. Preglednik nije uspio spremiti audio.`);
 else if(unreadable)toast(`${imported?`${imported} dodano. `:''}${unreadable} ${unreadable===1?'datoteku nije moguće pročitati':'datoteka nije moguće pročitati'}.`);
 else if(imported)toast(`${imported} ${imported===1?'pjesma spremljena':'pjesama spremljeno'} u ovom pregledniku.${duplicates?' Duplikati su preskočeni.':''}`);
 else if(duplicates)toast('Pjesme su već u biblioteci. Playlista je ažurirana.');
}
function removeLocalTrackDialog(id){
 const t=trackById(id);if(!t?.src)return;
 openDialog('Ukloni iz biblioteke',`<p class="dialog-description">Ukloniti <strong>${esc(t.title)}</strong> — ${esc(t.artist)}?</p><p class="dialog-description">Pjesma će se ukloniti iz ovog preglednika, svih playlista, favorita i reda reprodukcije. Izvorna datoteka na uređaju ostaje sačuvana.</p><div class="dialog-form"><button class="primary-button" id="confirm-track-remove">Ukloni pjesmu ${icon('delete')}</button><button class="text-button" id="cancel-track-remove" style="padding:10px">Odustani</button></div>`);
 $('#cancel-track-remove').onclick=()=>$('#dialog').close();
 $('#confirm-track-remove').onclick=async e=>{
  const button=e.currentTarget;button.disabled=true;button.textContent='Uklanjanje…';
  try{if(t.persisted)await libraryStore.remove(id);}catch{button.disabled=false;button.textContent='Pokušaj ponovno';toast('Pjesma nije uklonjena. Lokalna pohrana nije dostupna.');return;}
  const wasCurrent=currentId===id,wasPlaying=playing,oldPosition=queuePosition;
  const nextId=playQueue.slice(oldPosition+1).find(next=>next!==id&&trackById(next));
  const removedBefore=playQueue.slice(0,oldPosition).filter(next=>next===id).length;
  if(wasCurrent)engine.pause();
  tracks=tracks.filter(track=>track.id!==id);
  playlists.forEach(p=>p.ids=p.ids.filter(trackId=>trackId!==id));
  favorites.delete(id);recent=recent.filter(trackId=>trackId!==id);playQueue=playQueue.filter(trackId=>trackId!==id);
  queuePosition=Math.max(0,oldPosition-removedBefore);
  persistLibraryReferences();$('#dialog').close();
  if(wasCurrent){
   const replacement=nextId||playQueue[Math.min(queuePosition,playQueue.length-1)]||tracks[0].id;
   if(!playQueue.length)playQueue=tracks.map(track=>track.id);
   await selectTrack(replacement,wasPlaying,null,Math.max(0,playQueue.indexOf(replacement)));
  }
  URL.revokeObjectURL(t.src);renderHeading();renderTracks();renderQueue();
  toast(`„${t.title}” je uklonjena iz biblioteke.`);
 };
}
function closeMenu(restore=true){
 const wasOpen=!$('#context-menu').hidden;$('#context-menu').hidden=true;
 menuTrigger?.setAttribute('aria-expanded','false');
 if(wasOpen&&restore&&menuTrigger?.isConnected)menuTrigger.focus({preventScroll:true});
}
function openMenu(anchor,items){
 closeMenu(false);menuTrigger=anchor;anchor.setAttribute('aria-expanded','true');anchor.setAttribute('aria-haspopup','menu');
 const menu=$('#context-menu');menu.innerHTML=items.map((item,i)=>`<button role="menuitem" tabindex="-1" data-menu-index="${i}">${icon(item.icon||'music')}${esc(item.label)}</button>`).join('');menu.hidden=false;
 const r=anchor.getBoundingClientRect(),width=menu.offsetWidth,height=menu.offsetHeight;
 menu.style.left=Math.max(8,Math.min(r.right-width,innerWidth-width-8))+'px';menu.style.top=Math.max(8,Math.min(r.bottom+5,innerHeight-height-118))+'px';
 menu.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{closeMenu();items[i].action();});menu.querySelector('button')?.focus({preventScroll:true});
}
function trackMenu(id,anchor){const t=trackById(id);const items=[{icon:'queue',label:'Dodaj u red reprodukcije',action:()=>{playQueue.push(id);renderQueue();toast('Pjesma je dodana u red.');}},{icon:'plus',label:'Dodaj u playlistu',action:()=>{openDialog('Dodaj u playlistu',`<div class="dialog-form">${playlists.map(p=>`<button class="queue-item" data-add-playlist="${esc(p.id)}">${icon('list')}${esc(p.name)}${p.ids.includes(id)?' ✓':''}</button>`).join('')}</div>`);$$('[data-add-playlist]').forEach(b=>b.onclick=()=>{const p=playlists.find(p=>p.id===b.dataset.addPlaylist);if(!p.ids.includes(id))p.ids.push(id);persistPlaylists();$('#dialog').close();renderHeading();renderTracks();toast(`Dodano u ${p.name}.`);});}},{icon:'heart',label:favorites.has(id)?'Ukloni iz favorita':'Dodaj u favorite',action:()=>toggleFavorite(id)}];if(view==='player')items.push({icon:'delete',label:'Ukloni iz ove playliste',action:()=>{const p=playlists.find(p=>p.id===activePlaylist);p.ids=p.ids.filter(x=>x!==id);persistPlaylists();renderHeading();renderTracks();toast('Pjesma je uklonjena iz playliste.');}});if(t.src)items.push({icon:'delete',label:'Ukloni iz biblioteke',action:()=>removeLocalTrackDialog(id)});openMenu(anchor,items);}
function exportPlaylist(){const list=currentList();const text='#EXTM3U\n'+list.map(t=>`#EXTINF:${Math.round(t.duration)},${t.artist} - ${t.title}\n${t.src?t.title+'.'+t.format.toLowerCase():'winamp-demo:'+t.id}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'audio/x-mpegurl'}));a.download=`${playlists.find(p=>p.id===activePlaylist)?.name||'Winamp'}.m3u`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('M3U popis je preuzet. Audio datoteke nisu uključene.');}
function settingsDialog(){openDialog('Tvoj player, tvoja pravila.',`<div class="setting-row"><div><strong>Animacije i vizualizacija</strong><p>Živi spektar prati ritam tvoje muzike.</p></div><input type="checkbox" id="animations-setting" aria-label="Animacije i vizualizacija" ${settings.animations?'checked':''}></div><div class="setting-row"><div><strong>Automatski sljedeća pjesma</strong><p>Neka muzika nastavi teći.</p></div><input type="checkbox" id="autonext-setting" aria-label="Automatski sljedeća pjesma" ${settings.autoNext?'checked':''}></div><p class="dialog-description" style="margin-top:20px;margin-bottom:0">Pjesme, favoriti, playliste i postavke spremaju se lokalno u ovom pregledniku. Audio se ne šalje na internet. Brisanjem podataka stranice briše se i spremljena biblioteka; sačuvaj izvorne datoteke. Ako pohrana nije dostupna ili je puna, nove pjesme traju samo do osvježavanja stranice.</p>`);$('#animations-setting').onchange=e=>{settings.animations=e.target.checked;document.body.classList.toggle('animations-off',!settings.animations);save('settings',settings);};$('#autonext-setting').onchange=e=>{settings.autoNext=e.target.checked;save('settings',settings);};}
function shortcutsDialog(){openDialog('Sve pod prstima.',[['Play / pauza','Space'],['Sljedeća pjesma','→'],['Prethodna pjesma','←'],['Glasnije / tiše','↑ / ↓'],['Isključi zvuk','M'],['Pretraži pjesme','/'],['Proširi player','F'],['Zatvori prozor','Esc']].map(([label,key])=>`<div class="shortcut-row"><span>${label}</span><kbd>${key}</kbd></div>`).join(''));}
function quickSoundDialog(){
 openDialog('Tvoj zvuk.',`<div class="sound-options"><div class="sound-volume"><button class="icon-button" id="quick-mute" aria-label="Isključi zvuk">${icon(volume?'volume':'muted')}</button><input id="quick-volume" type="range" min="0" max="1" step="0.01" value="${volume}" aria-label="Glasnoća" style="--progress:${volume*100}%"><output id="quick-volume-value">${Math.round(volume*100)}%</output></div><div class="sound-actions"><button id="quick-queue">${icon('queue')}Red reprodukcije</button><button id="quick-focus">${icon('expand')}Fokus</button></div></div>`);
 $('#quick-volume').oninput=e=>setVolume(Number(e.target.value));$('#quick-mute').onclick=()=>setVolume(volume?0:lastVolume);$('#quick-queue').onclick=()=>{$('#dialog').close();$('#quick-sound').focus({preventScroll:true});toggleQueue(true);};$('#quick-focus').onclick=()=>{$('#dialog').close();setFocus();};setVolume(volume);
}
function setFocus(){focusMode=!focusMode;document.body.classList.toggle('focus-mode',focusMode);$('#focus-toggle').classList.toggle('active',focusMode);$('#focus-toggle').setAttribute('aria-pressed',focusMode);$('#focus-toggle').setAttribute('aria-label',focusMode?'Smanji player':'Proširi player');$('#focus-toggle').innerHTML=icon(focusMode?'minimize':'expand');if(focusMode){setView('player');toast('Samo ti i muzika.');requestAnimationFrame(()=>$('#hero-play').focus({preventScroll:true}));}else requestAnimationFrame(()=>$('#mini-cover').focus({preventScroll:true}));}
$('#play').onclick=togglePlay;$('#hero-play').onclick=togglePlay;$('#next').onclick=()=>nextTrack();$('#previous').onclick=previousTrack;
for(const input of [$('#seek'),$('#wave-seek')]){input.oninput=e=>{scrubbing=true;pendingSeek=Number(e.target.value);updateTime(pendingSeek,engine.duration,true);};input.onchange=()=>{scrubbing=false;engine.seek(pendingSeek);updateTime(engine.currentTime,engine.duration);};input.onpointercancel=()=>{scrubbing=false;updateTime(engine.currentTime,engine.duration);};input.onkeydown=e=>{if(e.key==='Escape'){scrubbing=false;updateTime(engine.currentTime,engine.duration);}};}
$('#volume').oninput=e=>setVolume(Number(e.target.value));$('#mute').onclick=()=>setVolume(volume?0:lastVolume);
$('#shuffle').onclick=()=>{shuffle=!shuffle;$('#shuffle').classList.toggle('active',shuffle);$('#shuffle').setAttribute('aria-pressed',shuffle);renderQueue();toast(shuffle?'Nasumična reprodukcija uključena.':'Nasumična reprodukcija isključena.');};
$('#repeat').onclick=()=>{repeat=(repeat+1)%3;$('#repeat').classList.toggle('active',repeat>0);$('#repeat').setAttribute('aria-pressed',repeat>0);$('#repeat-one').hidden=repeat!==2;const label=['Ponavljanje isključeno','Ponavljanje playliste','Ponavljanje pjesme'][repeat];$('#repeat').setAttribute('aria-label',label);toast(label+'.');};
$$('.like-current').forEach(b=>b.onclick=()=>toggleFavorite(currentId));
$$('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#sidebar-playlists').onclick=e=>{const b=e.target.closest('[data-playlist]');if(b)setView('player',b.dataset.playlist);};
$('#new-playlist').onclick=newPlaylistDialog;$('#create-playlist').onclick=newPlaylistDialog;
$('#search').oninput=renderTracks;
$('#track-list').onclick=e=>{const row=e.target.closest('.track-row');if(e.target.closest('[data-empty-add]')){addLibraryDialog();return;}if(!row)return;const id=row.dataset.id;if(e.target.closest('.track-like'))toggleFavorite(id);else if(e.target.closest('.track-menu'))trackMenu(id,e.target.closest('.track-menu'));else if(id===currentId)togglePlay();else selectTrack(id,true,currentList().map(t=>t.id));};
$('#track-list').onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('track-row')){e.preventDefault();e.stopPropagation();e.target.click();}};
$('#track-more').onclick=e=>trackMenu(currentId,e.currentTarget);
$('#playlist-more').onclick=e=>openMenu(e.currentTarget,[{icon:'play',label:'Pokreni sve',action:()=>{const list=currentList();if(list.length)selectTrack(list[0].id,true,list.map(t=>t.id));else toast('Dodaj pjesme u playlistu.');}},{icon:'plus',label:'Dodaj iz biblioteke',action:addLibraryDialog},{icon:'download',label:'Preuzmi M3U popis',action:exportPlaylist}]);
$('#add-to-playlist').onclick=()=>view==='player'?addLibraryDialog():pickFiles();
$('#add-music').onclick=()=>pickFiles(view==='player'?activePlaylist:null);$('#sidebar-import').onclick=()=>pickFiles();$('#file-input').onchange=e=>importFiles(e.target.files);
$('#eq-sliders').oninput=e=>{if(e.target.dataset.band===undefined)return;eqGains[Number(e.target.dataset.band)]=Number(e.target.value);e.target.setAttribute('aria-valuetext',`${e.target.value} dB`);currentPreset='custom';$('#eq-preset').value='custom';$('#eq-description').textContent='Tvoj zvuk, baš po tvom.';saveEq();};
$('#eq-preset').onchange=e=>{currentPreset=e.target.value;eqGains=[...presets[currentPreset]];saveEq();renderEq();$('#eq-description').textContent={chill:'Malo topline za kasne sate.',flat:'Zvuk baš kako je snimljen.',bass:'Osjeti svaki niski ton.',rock:'Energija u svakom tonu.',vocal:'Svaka riječ dolazi do izražaja.'}[currentPreset];};
$('#eq-reset').onclick=()=>{currentPreset='flat';eqGains=[...presets.flat];saveEq();renderEq();$('#eq-description').textContent='Zvuk baš kako je snimljen.';};
$('#eq-toggle').onclick=()=>{eqEnabled=!eqEnabled;engine.setEqEnabled(eqEnabled);save('eqEnabled',eqEnabled);renderEq();};
$('#visualizer-mode').onclick=()=>{visualMode=visualMode==='spectrum'?'wave':'spectrum';save('visualMode',visualMode);$('#visualizer-mode').innerHTML=(visualMode==='spectrum'?'Spectrum':'Waveform')+icon('chevron-down');};
$('#queue-toggle').onclick=()=>toggleQueue();$('#wave-queue').onclick=()=>toggleQueue();$('#queue-backdrop').onclick=()=>toggleQueue(false);$('#queue-close').onclick=()=>toggleQueue(false);$('#queue-list').onclick=e=>{const el=e.target.closest('[data-queue-id]');if(el){selectTrack(el.dataset.queueId,true,null,Number(el.dataset.queuePosition));$('#queue-close').focus({preventScroll:true});}};
$('#focus-toggle').onclick=setFocus;$('#settings-open').onclick=settingsDialog;$('#shortcuts-open').onclick=shortcutsDialog;
$('#profile-open').onclick=()=>openDialog('Winamp. Reimagined.',`<p class="dialog-description">Isti duh, novi ritam. Moderni player inspiriran klasikom koji je obilježio generaciju.</p><p class="dialog-description">Dodaj svoje datoteke, složi playlistu i pronađi svoj zvuk kroz 10-pojasni ekvilizator. Muzika se reproducira lokalno, u tvom pregledniku.</p><p class="dialog-description" style="margin:0">Ugrađene pjesme su originalni, proceduralno generirani demo zvukovi. Ovo je neovisni koncept, bez povezanosti sa službenim Winampom.</p>`);
$('#menu-toggle').onclick=()=>setSidebar(!$('#sidebar').classList.contains('open'));$('#nav-backdrop').onclick=()=>setSidebar(false);$('.brand').onclick=e=>{e.preventDefault();setView('player','afterhours');};
document.addEventListener('click',e=>{if(!e.target.closest('.context-menu,.track-menu,#track-more,#playlist-more'))closeMenu(false);if(innerWidth<=760&&!e.target.closest('.sidebar,#menu-toggle'))setSidebar(false,false);});
$('#dialog').onclick=e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#dialog').close();}};
document.addEventListener('keydown',e=>{if(e.defaultPrevented)return;if((e.ctrlKey||e.metaKey)&&e.key===','){e.preventDefault();if(!$('#dialog').open)settingsDialog();return;}if(e.key==='Escape'){if(!$('#context-menu').hidden){e.preventDefault();closeMenu();return;}if(!$('#queue-drawer').hidden){e.preventDefault();toggleQueue(false);return;}if($('#sidebar').classList.contains('open')){e.preventDefault();setSidebar(false);return;}if($('#dialog').open)return;if(focusMode)setFocus();return;}if(!$('#queue-drawer').hidden){trapFocus(e,$('#queue-drawer'));if(e.key!==' ')return;}if($('#sidebar').classList.contains('open')){trapFocus(e,$('#sidebar'));return;}if(!$('#context-menu').hidden)return;if(e.target.matches('input,textarea,select')||$('#dialog').open||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key===' '){if(e.target.closest('button,a'))return;e.preventDefault();togglePlay();}else if(e.key==='ArrowRight'){e.preventDefault();nextTrack();}else if(e.key==='ArrowLeft'){e.preventDefault();previousTrack();}else if(e.key==='ArrowUp'){e.preventDefault();setVolume(volume+.05);}else if(e.key==='ArrowDown'){e.preventDefault();setVolume(volume-.05);}else if(e.key.toLowerCase()==='m')setVolume(volume?0:lastVolume);else if(e.key==='/'){e.preventDefault();if(focusMode)setFocus();setSearchOpen(true);$('#search').focus();$('#search').scrollIntoView({block:'center',behavior:'smooth'});}else if(e.key.toLowerCase()==='f')setFocus();});
document.addEventListener('dragenter',e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();dragDepth++;$('#drop-overlay').hidden=false;}});document.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault();});document.addEventListener('dragleave',e=>{if(e.dataTransfer.types.includes('Files')){dragDepth--;if(dragDepth<=0)$('#drop-overlay').hidden=true;}});document.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;$('#drop-overlay').hidden=true;if(e.dataTransfer.files.length)importFiles(e.dataTransfer.files,view==='player'?activePlaylist:null);});
if('mediaSession'in navigator){for(const [action,fn]of Object.entries({play:()=>{engine.play().catch(showError);addRecent(currentId);},pause:()=>engine.pause(),nexttrack:()=>nextTrack(),previoustrack:previousTrack,seekto:d=>engine.seek(d.seekTime)})){try{navigator.mediaSession.setActionHandler(action,fn);}catch{}}}
let visualFrame=0;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fitCanvas(canvas){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}return [canvas.getContext('2d'),r.width,r.height,dpr];}
function draw(){requestAnimationFrame(draw);visualFrame++;if(visualFrame%2!==0||document.hidden||$('#player-grid').hidden)return;const moving=playing&&settings.animations&&!reducedMotion;const data=moving?engine.getFrequencyData():null;
 const [ctx,w,h,dpr]=fitCanvas($('#waveform'));if(w){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const count=Math.floor(w/4);const progress=(scrubbing?pendingSeek:(engine.currentTime||0))/(engine.duration||222);for(let i=0;i<count;i++){const shape=(Math.sin(i*.29)*Math.sin(i*.71)+1.1)*.35+.08;const magnitude=data?.length?data[Math.floor(i/count*Math.min(data.length,220))]/255:shape;const bar=Math.max(2,(moving?magnitude:shape)*h*.87);ctx.fillStyle=i/count<progress?'#c4ee83':moving?'#789556':'#4d623b';ctx.globalAlpha=moving?.65+Math.min(magnitude,.35):.7;ctx.fillRect(i*4,(h-bar)/2,2,bar);}ctx.globalAlpha=1;}
 const [vctx,vw,vh,vdpr]=fitCanvas($('#visualizer'));if(vw){vctx.setTransform(vdpr,0,0,vdpr,0,0);vctx.clearRect(0,0,vw,vh);if(visualMode==='spectrum'){const n=Math.floor(vw/5);for(let i=0;i<n;i++){const base=(Math.sin(i*.17)+1)*.18+Math.abs(Math.sin(i*.46))*.13;const val=data?.length?data[Math.floor(i/n*Math.min(data.length,150))]/255:base;const bh=Math.max(2,val*(vh-6));const grad=vctx.createLinearGradient(0,vh,0,0);grad.addColorStop(0,'#596d3b');grad.addColorStop(1,'#c4ee83');vctx.fillStyle=grad;vctx.globalAlpha=.55+val*.4;vctx.fillRect(i*5+2,vh-bh,3,bh);}}else{vctx.strokeStyle='#b0d37b';vctx.lineWidth=1;vctx.beginPath();for(let i=0;i<vw;i++){const amp=data?.length?data[Math.floor(i/vw*100)]/255:.35;const y=vh/2+Math.sin(i*.055+(moving?visualFrame*.05:0))*amp*vh*.4; i?vctx.lineTo(i,y):vctx.moveTo(i,y);}vctx.stroke();}vctx.globalAlpha=1;}
}

function setSearchOpen(open){$('#playlist-section').classList.toggle('search-open',open);$('#mobile-search-toggle').setAttribute('aria-expanded',open);$('#mobile-search-toggle').setAttribute('aria-label',open?'Zatvori pretragu':'Pretraži playlistu');$('#mobile-search-toggle').innerHTML=icon(open?'x':'search');if(open&&innerWidth<=500)$('#search').focus();}
$('#mobile-search-toggle').onclick=()=>{const open=!$('#playlist-section').classList.contains('search-open');setSearchOpen(open);if(!open){$('#search').value='';renderTracks();}};
$('#playlist-play').onclick=()=>{const list=filteredList();if(list.length)selectTrack(list[0].id,true,list.map(t=>t.id));else toast('Dodaj pjesme u playlistu.');};
$('#eq-expand').onclick=()=>{const expanded=$('.eq-card').classList.toggle('eq-open');$('#eq-expand').setAttribute('aria-expanded',expanded);$('#eq-expand span').textContent=expanded?'Sakrij kontrole':'Prilagodi zvuk';};
$('#quick-sound').onclick=quickSoundDialog;
$('#mini-cover').onclick=setFocus;
$('#mini-cover').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();setFocus();}};
$('#focus-exit').onclick=()=>{if(focusMode)setFocus();};
$('#context-menu').onkeydown=e=>{
 const items=[...$('#context-menu').querySelectorAll('button')],index=items.indexOf(document.activeElement);
 if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus();}
 else if(e.key==='Escape'){e.preventDefault();closeMenu();}else if(e.key==='Tab'){closeMenu();}
};
$('#dialog').addEventListener('close',()=>{if(!$('#queue-drawer').hidden)return;if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});});
window.addEventListener('resize',()=>{closeMenu(false);if(innerWidth>760)setSidebar(false,false);});
$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-controls','sidebar');
$('#wave-queue').setAttribute('aria-expanded','false');$('#wave-queue').setAttribute('aria-controls','queue-drawer');
$('#queue-drawer').setAttribute('aria-modal','true');
document.body.classList.toggle('animations-off',!settings.animations);
syncPlaybackControls();

renderEq();setVolume(volume);renderHeading();renderTracks();renderCurrent();
$('#visualizer-mode').innerHTML=(visualMode==='spectrum'?'Spectrum':'Waveform')+icon('chevron-down');
selectTrack(currentId,false);draw();
const libraryReady=restoreLibrary();
window.addEventListener('beforeunload',()=>{tracks.filter(t=>t.src?.startsWith('blob:')).forEach(t=>URL.revokeObjectURL(t.src));engine.destroy();});
