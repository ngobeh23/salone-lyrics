(function(){
"use strict";
const D = window.SL, P = window.SL_PHOTOS, DIMS = window.SL_DIMS || {};
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IMG = "assets/img/";
const SUBMIT_TO = "ngobehansumana@gmail.com"; // where lyric submissions and edits are sent: change it here
const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const TODAY = (()=>{const d=new Date();d.setHours(0,0,0,0);return d;})();
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_L=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const parse = iso => { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d); };
const fmt = iso => { const d=parse(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const fmtLong = iso => { const d=parse(iso); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS_L[d.getMonth()]} ${d.getFullYear()}`; };
const yr = y => y ? String(y) : "Year to be confirmed";
const artist = s => D.artists.find(a=>a.slug===s);
const song = s => D.songs.find(x=>x.slug===s);
const release = s => D.releases.find(x=>x.slug===s);
const story = s => D.articles.find(x=>x.slug===s);
const event = s => D.events.find(x=>x.slug===s);
const ARTISTS = () => D.artists.filter(a=>!a.hidden&&!a.unlisted);
const SONGS = () => D.songs.filter(s=>!s.demo);
const evStatus = e => (e.status==="upcoming"||e.status==="sold-out") && parse(e.endDate||e.date)<TODAY ? "completed" : e.status;
const evDates = e => e.endDate ? `${fmtLong(e.date)} to ${fmtLong(e.endDate)}` : fmtLong(e.date);
const evTime = e => e.time ? `${e.time}${e.end?"–"+e.end:""}` : "";
const gTags = a => a.genre.split(/,|\band\b| \/ /).map(s=>s.trim().replace(/ influences?$/i,"").replace(/^amapiano-influenced pop$/i,"amapiano").replace(/^melodic /i,"")).filter(s=>s&&s!=="To be confirmed").map(s=>s[0].toUpperCase()+s.slice(1));
const STATUS_LABEL={upcoming:"Upcoming","sold-out":"Sold out",postponed:"Postponed",cancelled:"Cancelled",completed:"Completed"};
const SAMPLE = `<span class="tag tag-example" title="Sample listing for the preview">Sample</span>`;
const ICON = {
  left:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  right:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  arrow:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  star:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"/></svg>'
};
const credSource = k => { const p=P[k]; return p&&p.press ? "Photo source" : p&&p.stand ? "Illustrative image, not the artist. Photo" : "Photo"; };

/* ---------- Images ---------- */
function pic(key,{sizes="(min-width:900px) 45vw, 90vw",cls="cut",eager=false,alt}={}){
  const p=P[key]; if(!p) return "";
  const d=DIMS[key]||{w:900,h:1100};
  const w=Math.min(900,d.w), h=Math.round(w*d.h/d.w);
  const a = alt==null ? p.alt : alt;
  const srcset = ext => [480,900,1400].map(W=>`${IMG}${key}-${W}.${ext} ${Math.min(W,d.w)}w`).join(", ");
  return `<picture><source type="image/avif" srcset="${IMG}${key}-480.avif ${Math.min(480,d.w)}w, ${IMG}${key}-900.avif ${w}w" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img class="${cls}" src="${IMG}${key}-900.webp" width="${w}" height="${h}" alt="${esc(a)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" style="object-position:${p.pos||"50% 20%"}"></picture>`;
}
const initials = n => n.replace(/[^A-Za-z0-9 ]/g,"").split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase()||"SL";
function portrait(a,opts={}){
  if(a.photo) return pic(a.photo,Object.assign({alt:opts.alt!=null?opts.alt:P[a.photo].alt},opts));
  return `<span class="type-portrait" aria-hidden="true">${FACE}<span class="nm">${esc(a.name)}</span><span class="pend">${a.pending?"Profile in progress":"Photo coming soon"}</span></span>`;
}
const FACE='<svg class="face-sil" viewBox="0 0 120 140" aria-hidden="true"><circle cx="60" cy="48" r="30" fill="currentColor"/><path d="M8 140c4-34 26-52 52-52s48 18 52 52z" fill="currentColor"/></svg>';
const credit = () => ""; // photo credits are kept in asset-manifest.csv, not shown on the site
const panelCls = i => ["panel-blue","panel-charcoal","panel-green","panel-paper"][i%4];
function ttile(r){
  const a=artist(r.artist);
  return `<div class="ttile ${r.colour}" aria-hidden="true"><span class="disc"></span><span class="meta">${esc(r.type)}${r.year?" · "+esc(r.year):""}${r.note?" · "+esc(r.note):""}</span><span class="display">${esc(r.title)}</span><span class="meta">${esc(a.name)}</span></div>`;
}

const normT = t => String(t).toLowerCase().replace(/[^a-z0-9]/g,"");
function trackList(rel){
  const rows=rel.tracklist.map(([t,f],i)=>{ const s=SONGS().find(x=>(x.artist===rel.artist||x.featA===rel.artist)&&normT(x.title)===normT(t));
    return `<li><span class="num tnum" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><span class="tt">${s?`<a href="#song.${s.slug}">${esc(t)}</a>`:esc(t)}${f?` <span class="ft">feat. ${esc(f)}</span>`:""}</span>${s?`<a class="go" href="#song.${s.slug}" aria-hidden="true" tabindex="-1">View Lyrics</a>`:""}</li>`; }).join("");
  return `<ol class="tracklist">${rows}</ol>${rel.tracklistSource?`<p class="paid-note">${rel.tracklist.length} tracks. Tracklist from <a class="link" href="${rel.tracklistSource}" target="_blank" rel="noopener">${/deezer/.test(rel.tracklistSource)?"Deezer":"Apple Music"}</a>.</p>`:""}`;
}
function relArt(r,alt=""){
  return r.cover?`<img class="cover" src="${IMG}cover-${r.slug}-500.webp" srcset="${IMG}cover-${r.slug}-500.webp 500w, ${IMG}cover-${r.slug}-1000.webp 1000w" sizes="(min-width:900px) 360px, 45vw" width="500" height="500" alt="${esc(alt)}" loading="lazy" decoding="async">`:ttile(r);
}

/* ---------- State ---------- */
const S = { search:{q:"",lastQ:""}, fromSearch:false, lyr:{q:"",genre:"All",type:"All"}, rel:"All", art:{q:"",genre:"All"}, news:"All",
  ev:{when:"upcoming",town:"All",type:"All",fee:"All",view:"list",month:null}, lsize:19, wiz:{step:1,data:{service:"",files:[],links:""},fail:false} };
try{ const v=localStorage.getItem("sl-lsize"); if(v) S.lsize=+v; }catch(e){}

/* ---------- Toast / copy / share ---------- */
let toastT;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400); }
async function copyText(text,label="Link copied"){
  try{ await navigator.clipboard.writeText(text); toast(label); return true; }
  catch(e){ const ta=document.createElement("textarea"); ta.value=text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); let ok=false; try{ok=document.execCommand("copy");}catch(_){} ta.remove(); toast(ok?label:"Copy not available. Select the text to copy it."); return ok; }
}
const pageUrl = () => location.href.split("#")[0]+location.hash;
async function share(title){ const url=pageUrl(); if(navigator.share){ try{ await navigator.share({title,url}); return; }catch(e){ if(e&&e.name==="AbortError") return; } } copyText(url); }

/* ---------- Motion helpers ---------- */
let io=null;
function reveal(root){
  const els=$$(".reveal",root); if(REDUCED||!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  if(!io) io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }),{rootMargin:"0px 0px -8% 0px",threshold:.08});
  els.forEach((e,i)=>{ e.style.setProperty("--d",(i%4)*70+"ms"); io.observe(e); });
}
function countUp(root){
  $$("[data-count]",root).forEach(el=>{
    const end=+el.dataset.count; if(REDUCED){ el.textContent=end; return; }
    let started=false; const run=()=>{ if(started) return; started=true; const t0=performance.now(), dur=1100; const step=t=>{ const p=Math.min(1,(t-t0)/dur); el.textContent=Math.round(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
    if("IntersectionObserver" in window){ const o=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ run(); o.disconnect(); } }); o.observe(el); } else run();
  });
}
function marquee(items,cls=""){
  const row=items.map(t=>`<span>${esc(t)}</span><span class="mq-star" aria-hidden="true">${ICON.star}</span>`).join("");
  return `<div class="marquee ${cls}" aria-label="${esc(items.join(", "))}" role="img"><div class="mq-track"><div class="mq-row">${row}</div><div class="mq-row" aria-hidden="true">${row}</div></div></div>`;
}
function carousel(root){
  $$("[data-carousel]",root).forEach(c=>{
    const track=$(".cr-track",c), cards=$$(".svc-card",c), prev=$("[data-cprev]",c), next=$("[data-cnext]",c), dots=$(".cr-dots",c), pp=$("[data-cpause]",c);
    let i=0, timer=null, paused=false;
    const per=()=> window.innerWidth>=1100?3: window.innerWidth>=700?2:1;
    const max=()=>Math.max(0,cards.length-per());
    const draw=()=>{ i=Math.min(i,max()); const w=cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||24);
      track.style.transform=`translateX(${-i*w}px)`; cards.forEach((cd,j)=>{ const vis=j>=i&&j<i+per(); cd.setAttribute("aria-hidden",!vis); $$("a,button",cd).forEach(b=>b.tabIndex=vis?0:-1); });
      dots.innerHTML=Array.from({length:max()+1},(_,j)=>`<button type="button" aria-label="Show cards from ${j+1}" aria-current="${j===i}"></button>`).join("");
      $$("button",dots).forEach((b,j)=>b.addEventListener("click",()=>{i=j;draw();restart();})); };
    const go=d=>{ i=i+d; if(i>max()) i=0; if(i<0) i=max(); draw(); };
    const restart=()=>{ clearInterval(timer); if(!paused) timer=setInterval(()=>go(1),3800); };
    prev.addEventListener("click",()=>{go(-1);restart();}); next.addEventListener("click",()=>{go(1);restart();});
    pp.addEventListener("click",()=>{ paused=!paused; pp.setAttribute("aria-pressed",paused); pp.textContent=paused?"Play":"Pause"; restart(); });
    c.addEventListener("mouseenter",()=>clearInterval(timer)); c.addEventListener("mouseleave",restart);
    c.addEventListener("focusin",()=>clearInterval(timer)); c.addEventListener("focusout",restart);
    let x0=null; c.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;},{passive:true}); c.addEventListener("touchend",e=>{ if(x0==null)return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40){go(dx<0?1:-1);restart();} x0=null; });
    const onR=()=>draw(); window.addEventListener("resize",onR); cleanup.push(()=>{clearInterval(timer);window.removeEventListener("resize",onR);});
    draw(); restart();
  });
}

/* ---------- Routing ---------- */
const VIEWS={}; let cleanup=[], renderCount=0;
function route(){ const h=(location.hash||"").replace(/^#/,""); const [name,slug,sub]=h.split("."); return {name:name||"home",slug,sub}; }
function render(){
  cleanup.forEach(f=>{try{f()}catch(e){}}); cleanup=[]; document.body.classList.remove("focus-mode");
  const r=route(); const view=VIEWS[r.name]||VIEWS.notfound; const main=$("#main");
  let out; try{ out=view(r); }catch(e){ console.error(e); out=VIEWS.notfound(r); }
  main.innerHTML=out.html; document.title=out.title?`${out.title} | Salone Lyrics`:"Salone Lyrics";
  const sec={song:"lyrics",release:"lyrics",artist:"artists",story:"stories",news:"stories",event:"events"}[r.name]||r.name;
  $$(".mainnav a").forEach(a=>{ const n=a.getAttribute("href").slice(1); if(n===sec) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  if(out.after) out.after(main);
  if(S.fromSearch && ["song","artist","story","event"].includes(r.name)){ const b=document.createElement("div"); b.className="wrap"; b.style.paddingTop="16px"; b.innerHTML=`<button class="back-results" type="button">${ICON.left} Back to results for “${esc(S.search.lastQ||"suggestions")}”</button>`; main.prepend(b); $(".back-results",b).addEventListener("click",()=>openSearch(S.search.lastQ)); }
  S.fromSearch=false; reveal(main); countUp(main); carousel(main);
  if(!r.sub) window.scrollTo(0,0);
  const h1=$("h1",main); if(h1 && renderCount++>0){ h1.setAttribute("tabindex","-1"); h1.focus({preventScroll:true}); }
}
window.addEventListener("hashchange",render);

/* ---------- Shared bits ---------- */
const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it,i)=> i<items.length-1?`<a href="${it[1]}">${esc(it[0])}</a><span aria-hidden="true">/</span>`:`<span aria-current="page">${esc(it[0])}</span>`).join("")}</nav>`;
function byline(s){ const a=artist(s.artist); return `${esc(a.name)}${s.feat?` feat. ${esc(s.feat)}`:""}`; }
const peekBtn = (slug,label) => { const a=artist(slug); return a&&!a.hidden?`<button type="button" class="peek" data-peek="${a.slug}" aria-haspopup="dialog">${esc(label||a.name)}</button>`:esc(label||""); };
function songRow(s,i){
  const who = s.demo ? "Salone Lyrics demo" : s.lead ? `${esc(s.lead)} feat. ${esc(s.feat).replace(esc(artist(s.artist).name),peekBtn(s.artist))}` : `${peekBtn(s.artist)}${s.feat?` feat. ${s.featA?peekBtn(s.featA,s.feat):esc(s.feat)}`:""}`;
  return `<li class="songrow"><span class="num tnum" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><span class="sr-main"><a class="t stretch" href="#song.${s.slug}">${esc(s.title)}</a><br><span class="a">${who}</span></span><span class="meta">${esc(s.genre)} · ${esc(s.type)} · ${esc(s.year||"—")}</span><span class="go" aria-hidden="true">${s.demo?"Read demo":"View Lyrics"}</span></li>`;
}
function artistCard(a,i,tag="h3"){
  return `<a class="acard reveal" href="#artist.${a.slug}"><div class="portrait panel ${panelCls(i)} grain"><span class="grooves" aria-hidden="true"></span>${portrait(a,{sizes:"(min-width:1200px) 16vw, (min-width:768px) 24vw, 45vw",alt:""})}</div><div class="row"><${tag}>${esc(a.name)}</${tag}></div><p>${esc(a.genre)} · ${esc(a.town)}</p>${a.pending?`<div class="row"><span class="tag tag-example">Profile in progress</span></div>`:""}</a>`;
}
function evRow(e){
  const d=parse(e.date), st=evStatus(e), off=st==="cancelled"||st==="postponed";
  return `<li class="evrow reveal ${off?"is-off":""} ${st==="completed"?"is-past":""}"><div class="evdate" aria-hidden="true"><span class="d tnum">${d.getDate()}</span><span class="m">${MONTHS[d.getMonth()]}</span></div><div class="evinfo"><div class="row-wrap" style="gap:8px"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="tag">${esc(e.type)}</span>${e.paid===false?'<span class="tag tag-green">Free</span>':""}${e.sample?SAMPLE:""}</div><h3><a href="#event.${e.slug}" style="text-decoration:none">${esc(e.title)}</a></h3><p class="where"><span class="sr">Date: ${evDates(e)}. </span>${esc(e.venue)}, ${esc(e.town)}${e.endDate?" · Until "+fmt(e.endDate):""}${e.time?" · "+esc(e.time):""}</p><p class="who">${esc(e.lineup)}</p></div><a class="btn btn-ghost btn-sm ev-cta" href="#event.${e.slug}" aria-label="View event: ${esc(e.title)}">View event</a></li>`;
}
function storyItem(a,i=0){
  return `<li><a class="story-item reveal" href="#story.${a.slug}"><div><span class="cat">${esc(a.cat)}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><p class="date mt-s">${fmt(a.date)}${a.sample?" · Sample":""}</p></div><div class="thumb panel ${panelCls(i+1)}" aria-hidden="true">${pic(a.photo,{sizes:"96px",alt:""})}</div></a></li>`;
}
const ytSearch = v => `https://www.youtube.com/results?search_query=${encodeURIComponent(artist(v.artist).name+" "+v.title+" official video")}`;
function vidCard(v,i){
  const a=v.artist?artist(v.artist):null, who=a?a.name:v.by;
  return `<article class="vid reveal ${v.orient||""}${v.tiktok?" tiktok":""}" data-vid="${v.slug}"><div class="vid-frame"><div class="poster panel ${panelCls(i+1)}"><span class="grooves spin" aria-hidden="true"></span>${v.photo?pic(v.photo,{sizes:"(min-width:1024px) 22vw, 90vw",alt:""}):""}</div><span class="ttl" aria-hidden="true">${esc(v.title)}</span><button class="vid-play" type="button" aria-label="Play: ${esc(v.title)} by ${esc(who)}"><span>${ICON.play}</span></button></div><h3>${esc(v.title)}</h3><p class="meta">${esc(v.kind)} · ${a?peekBtn(a.slug):esc(who)}${v.tiktok?` · <a class="link" href="https://www.tiktok.com/@salonelyrics/video/${v.tiktok}" target="_blank" rel="noopener">TikTok<span class="sr"> (opens in a new tab)</span></a>`:""}</p></article>`;
}
function bindVideos(root){
  let active=null;
  $$(".vid",root).forEach(card=>{
    const frame=$(".vid-frame",card), btn=$(".vid-play",card);
    btn.addEventListener("click",()=>{
      if(active&&active!==card) stopVid(active); active=card;
      const v=D.videos.find(x=>x.slug===card.dataset.vid), a=artist(v.artist);
      const pl=document.createElement("div"); pl.className="vid-player"; pl.setAttribute("role","status"); pl.innerHTML=`<span class="spin" aria-hidden="true"></span><p>Loading player…</p>`;
      frame.appendChild(pl); btn.hidden=true;
      if(v.tiktok){ pl.innerHTML=`<iframe src="https://www.tiktok.com/player/v1/${v.tiktok}?autoplay=1&rel=0&music_info=1&description=0" title="${esc(v.title)}: lyric video on TikTok" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe><button class="vid-close" type="button" aria-label="Close video">×</button>`;
        $(".vid-close",pl).addEventListener("click",()=>{stopVid(card);active=null;btn.focus();}); return; }
      setTimeout(()=>{ if(!pl.isConnected) return;
        pl.innerHTML=`<p><strong>${esc(v.title)} · ${esc(a.name)}</strong></p><p>The official video isn’t linked yet. When it is, the player loads here only after you press play, and any other video stops.</p><div class="row-wrap" style="justify-content:center"><a class="btn btn-green btn-sm" href="${ytSearch(v)}" target="_blank" rel="noopener">Find it on YouTube</a><button class="btn btn-ghost btn-sm" type="button" style="color:#fff">Close</button></div>`;
        $("button",pl).addEventListener("click",()=>{stopVid(card);active=null;btn.focus();}); $("a",pl).focus(); },800);
    });
  });
  function stopVid(card){ const pl=$(".vid-player",card); if(pl) pl.remove(); $(".vid-play",card).hidden=false; }
}
function railControls(root){
  $$(".artist-rail-wrap",root).forEach(w=>{
    const rail=$(".artist-rail",w), prev=$("[data-prev]",w.parentElement), next=$("[data-next]",w.parentElement); if(!prev) return;
    const upd=()=>{ prev.disabled=rail.scrollLeft<4; next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4; };
    prev.addEventListener("click",()=>rail.scrollBy({left:-rail.clientWidth*.8,behavior:REDUCED?"auto":"smooth"}));
    next.addEventListener("click",()=>rail.scrollBy({left:rail.clientWidth*.8,behavior:REDUCED?"auto":"smooth"}));
    rail.addEventListener("scroll",upd,{passive:true}); window.addEventListener("resize",upd); cleanup.push(()=>window.removeEventListener("resize",upd)); setTimeout(upd,60);
  });
}
function weekendRange(){ const d=new Date(TODAY); const day=d.getDay(); const sat=new Date(d); sat.setDate(d.getDate()+(day===0?-1:(6-day))); const sun=new Date(sat); sun.setDate(sat.getDate()+1); return [day===0?d:sat,sun]; }
function inWeekend(e){ const [a,b]=weekendRange(); const d=parse(e.date); return d>=a&&d<=b; }
function svcCarousel(title,intro){
  return `<section class="section svc-sec" aria-labelledby="svc-c-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Promote with us</p><h2 id="svc-c-h" class="display sec-title">${title}</h2></div><p class="muted">${intro}</p></div>
    <div class="cr" data-carousel aria-roledescription="carousel" aria-label="Promotion services">
      <div class="cr-viewport"><div class="cr-track">${D.services.map((s,i)=>`<article class="svc-card" aria-roledescription="slide" aria-label="${i+1} of ${D.services.length}: ${esc(s.name)}"><div class="svc-photo panel panel-charcoal"><span class="grooves spin" aria-hidden="true"></span>${pic(s.photo,{sizes:"(min-width:1100px) 30vw, (min-width:700px) 45vw, 85vw",alt:"",eager:true})}</div><div class="svc-body"><h3>${esc(s.name)}</h3><p class="svc-tag">${esc(s.tag)}</p><p>${esc(s.what)}</p><a class="pill-btn" href="#promote" data-svc="${s.id}">Learn more</a></div></article>`).join("")}</div></div>
      <div class="cr-ctrl"><div class="cr-dots" aria-label="Choose slide"></div><div class="row-wrap" style="gap:8px"><button type="button" class="chip" data-cpause aria-pressed="false">Pause</button><button type="button" class="round-btn" data-cprev aria-label="Previous services">${ICON.left}</button><button type="button" class="round-btn" data-cnext aria-label="Next services">${ICON.right}</button></div></div>
    </div><p class="paid-note">Photos on service cards are illustrative Pexels images.</p></div></section>`;
}
function teamGrid(){
  return `<div class="team-grid">${D.team.map(t=>`<article class="team-card reveal ${t.open?"open":""}"><div class="team-top"><span class="team-av ${t.photo?"has-photo":""}" aria-hidden="true">${t.open?"+":t.photo?pic(t.photo,{sizes:"80px",alt:""}):esc(initials(t.name))}</span><div><h3>${esc(t.name)}</h3><p class="team-role">${esc(t.role)}</p></div></div><p>${esc(t.bio)}</p>${t.open?`<a class="pill-btn" href="#contact">Apply to write</a>`:""}</article>`).join("")}</div>`;
}

/* ================= HOME ================= */
VIEWS.home = () => {
  const SP=currentSpotlight(), spot=SP.a;
  const picks=D.picks.map(song);
  const upcoming=D.events.filter(e=>evStatus(e)!=="completed").sort((a,b)=>a.date.localeCompare(b.date));
  const weekend=upcoming.filter(inWeekend);
  const feat=D.articles[0], rest=D.articles.slice(1,4);
  const spotSongs=SONGS().filter(s=>s.artist===spot.slug).slice(0,3);
  const slides=homeSlides(spot,upcoming,feat);
  return { title:"", html:`
<div class="home">
  <section class="sz" aria-labelledby="hero-h">
    <div class="sz-head">
      <p class="eyebrow">Kushe! Welcome to Salone Lyrics</p>
      <h1 id="hero-h" class="hero-title sz-title"><span class="sr">Salone music. Every word.</span>${heroTitle(["Salone music.","Every word."])}</h1>
    </div>
    <div class="sz-flow" data-sz aria-roledescription="carousel" aria-label="What’s on Salone Lyrics">
      <div class="sz-track">${slides.map((s,i)=>szSlide(s,i,slides.length)).join("")}</div>
      <div class="sz-ctrl"><span class="sz-dots">${slides.map((s,i)=>`<button type="button" data-sz-go="${i}" aria-label="Show ${esc(s.label)}"><span></span></button>`).join("")}</span><button type="button" class="sz-pp" data-sz-pp aria-pressed="false" aria-label="Pause slideshow">Pause</button></div>
    </div>
    <div class="sz-foot">
      <p class="sz-lede">Discover the lyrics, artists and stories shaping Sierra Leone’s sound.</p>
      <form class="hero-search" role="search" data-hero-search><label for="hero-q" class="sr">Search songs, lyrics, artists or events</label><input id="hero-q" type="search" placeholder="Search songs &amp; artists" autocomplete="off"><button type="submit">Search</button></form>
      <div class="hero-actions"><a class="btn btn-primary" href="#lyrics">Explore Lyrics</a><a class="btn btn-ghost" href="#artists">Discover Artists</a></div>
    </div>
  </section>
  <div class="sz-stats">
  <div class="stats wrap" aria-label="On Salone Lyrics">
    <div class="stat"><span class="n tnum" data-count="${ARTISTS().length}">${ARTISTS().length}</span><span class="l">Artists profiled</span></div>
    <div class="stat"><span class="n tnum" data-count="${SONGS().length}">${SONGS().length}</span><span class="l">Songs listed</span></div>
    <div class="stat"><span class="n tnum" data-count="${D.releases.length}">${D.releases.length}</span><span class="l">Releases</span></div>
    <div class="stat"><span class="n tnum" data-count="${D.articles.length}">${D.articles.length}</span><span class="l">Stories</span></div>
  </div></div>

  ${marquee(["Lyrics","Artists","Culture","Salone","Releases","Stories"])}

  <section class="section" aria-labelledby="picks-h"><div class="wrap picks-grid">
    <div class="stack reveal" style="align-content:start">
      <p class="eyebrow muted">Lyrics discovery</p>
      <h2 id="picks-h" class="display sec-title">Editor’s picks</h2>
      <p class="muted" style="max-width:40ch">Songs our editors are playing now. Lyrics are added once each artist approves them.</p>
      <div class="row-wrap"><a class="arrow-link" href="#lyrics">Browse all songs</a><a class="arrow-link" href="#song.lyric-reader-demo">Try the lyric reader</a></div>
    </div>
    <ol class="songlist">${picks.map(songRow).join("")}</ol>
  </div></section>

  <section class="spotlight grain" aria-labelledby="spot-h">
    <div class="spot-art"><span class="grooves spin" aria-hidden="true"></span><div class="floaty">${portrait(spot,{cls:"cut cut-shadow",sizes:"(min-width:900px) 45vw, 90vw"})}</div></div>
    <div class="spot-copy">
      <div class="spot-label"><span class="tag tag-amber">Weekly Spotlight</span></div>
      <h2 id="spot-h" class="display spot-name reveal">${esc(spot.name)}</h2>
      <p class="lede">${esc(spot.intro)}</p>
      <dl class="spot-facts"><div><dt>Genre</dt><dd>${esc(spot.genre)}</dd></div><div><dt>Based in</dt><dd>${esc(spot.town)}</dd></div>${spot.label?`<div><dt>Label</dt><dd>${esc(spot.label)}</dd></div>`:""}</dl>
      <div class="row-wrap"><a class="btn btn-primary" href="#artist.${spot.slug}">Meet the Artist</a></div>
      
    </div>
  </section>

  <section class="section" aria-labelledby="rel-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Albums &amp; EPs</p><h2 id="rel-h" class="display sec-title">Releases</h2></div>
      <div class="chips" role="group" aria-label="Filter releases">${["All","EPs","Albums"].map(f=>`<button type="button" class="chip" data-rel="${f}" aria-pressed="${S.rel===f}">${f}</button>`).join("")}</div></div>
    <div class="rel-grid" id="rel-grid" aria-live="polite"></div>
    <p class="paid-note">Typographic tiles stand in where cover artwork has not been supplied yet.</p>
  </div></section>

  <section class="section" style="background:#fff" aria-labelledby="art-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Directory</p><h2 id="art-h" class="display sec-title">Discover artists</h2></div>
      <div class="row-wrap"><button type="button" class="chip" data-amq-pp aria-pressed="false">Pause</button><a class="arrow-link" href="#artists">All artists</a></div></div>
  </div>
    <div class="amq" data-amq role="region" aria-label="Featured artists, moving list"><div class="amq-track"><div class="amq-row">${ARTISTS().filter(a=>a.photo).map((a,i)=>artistCard(a,i)).join("")}</div><div class="amq-row" aria-hidden="true" inert>${ARTISTS().filter(a=>a.photo).map((a,i)=>artistCard(a,i)).join("")}</div></div></div>
  <div class="wrap">
  </div></section>

  ${marquee(["Afrobeats","Hip-hop","Afropop","R&B","Gumbe","Krio Fusion","Afro-Rudeness","Bubu","Milo Jazz","Afro-soul","Highlife"],"mq-skew")}

  <section class="section" aria-labelledby="ev-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Events</p><h2 id="ev-h" class="display sec-title">Upcoming events</h2></div><a class="btn btn-ghost btn-sm" href="#events">View all events</a></div>
    ${weekend.length?`<div class="notice notice-info reveal" style="margin-bottom:24px"><strong>This weekend</strong><span>${weekend.map(e=>`<a class="link" href="#event.${e.slug}">${esc(e.title)}</a> (${DOW[parse(e.date).getDay()]}, ${esc(e.town)})`).join(" · ")}</span></div>`:""}
    <ul class="evlist">${upcoming.slice(0,4).map(evRow).join("")}</ul>
    <p class="paid-note">Venues, times and ticket links are added as organisers confirm them.</p>
  </div></section>

  <section class="section" style="background:#fff" aria-labelledby="st-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Artist spotlights &amp; features</p><h2 id="st-h" class="display sec-title">Stories</h2></div><div class="row-wrap"><button type="button" class="chip" data-news-pp aria-pressed="false" aria-label="Pause stories">Pause</button><a class="arrow-link" href="#stories">All stories</a></div></div>
    <div class="stories" data-news>
      <a class="story-feature reveal" href="#story.${feat.slug}" data-news-feat>${featBody(feat)}</a>
      <ul class="story-list" data-news-list>${rest.map(storyItem).join("")}</ul>
    </div>
  </div></section>

  <section class="section" aria-labelledby="vid-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Watch</p><h2 id="vid-h" class="display sec-title">Videos</h2></div><a class="arrow-link" href="#videos">All videos</a></div>
    <div class="vid-grid">${D.videos.slice(0,4).map(vidCard).join("")}</div>
  </div></section>

  ${svcCarousel("Grow your audience","Placements across the website, Instagram and TikTok. Every paid placement is labelled Promoted.")}

  <section class="promo grain on-dark" aria-labelledby="promo-h">
    <div class="promo-copy">
      <p class="eyebrow" style="color:var(--green)">For artists, managers &amp; promoters</p>
      <h2 id="promo-h" class="display reveal">Let more people <em>discover</em> your sound.</h2>
      <p>Profiles, featured releases, Weekly Spotlight, event listings and social campaigns across the website, Instagram and TikTok.</p>
      <div class="row-wrap"><a class="btn btn-green" href="#promote">Explore Promotion Options</a></div>
    </div>
    <div class="promo-art panel"><span class="grooves spin" aria-hidden="true"></span><div class="floaty">${pic("p-ansumana",{cls:"cut cut-outline",sizes:"(min-width:900px) 40vw, 90vw"})}</div></div>
  </section>

  <section class="section" aria-labelledby="team-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">The people behind the platform</p><h2 id="team-h" class="display sec-title">Meet the team</h2></div><a class="arrow-link" href="#about">About Salone Lyrics</a></div>
    ${teamGrid()}
  </div></section></div>`,
  after(main){
    const grid=$("#rel-grid",main);
    const draw=()=>{ const map={EPs:"EP",Albums:"Album"}; const list=D.releases.filter(r=>S.rel==="All"||r.type===map[S.rel]).slice(0,8);
      grid.innerHTML=list.map(r=>`<a class="rel" href="#release.${r.slug}">${relArt(r)}<div><h3>${esc(r.title)}</h3><p>${esc(artist(r.artist).name)} · ${esc(r.type)}${r.year?" · "+esc(r.year):""}</p></div></a>`).join(""); };
    draw();
    $$("[data-rel]",main).forEach(b=>b.addEventListener("click",()=>{S.rel=b.dataset.rel; $$("[data-rel]",main).forEach(x=>x.setAttribute("aria-pressed",x===b)); draw();}));
    $("[data-hero-search]",main).addEventListener("submit",e=>{e.preventDefault(); openSearch($("#hero-q").value);});
    railControls(main); bindVideos(main); bindSvcLinks(main); szFlow(main); artistMarquee(main); newsCycle(main);
  }};
};
// Weekly Spotlight: works out this week's artist from D.spotlight (changes every Monday, repeats when the list ends)
function currentSpotlight(){
  const sp=D.spotlight, q=sp?sp.queue.filter(x=>{ const a=artist(x.artist); return a&&a.photo&&!a.hidden; }):[];
  if(!q.length) return {a:D.artists.find(a=>a.spotlight),why:"",week:null};
  const start=parse(sp.start), wk=Math.max(0,Math.floor(Math.round((TODAY-start)/864e5)/7)), e=q[wk%q.length], mon=new Date(start); mon.setDate(start.getDate()+wk*7);
  return {a:artist(e.artist),why:e.why,week:mon};
}
function heroTitle(lines){
  let k=0;
  return lines.map((t,l)=>`<span class="ln${l===lines.length-1?" accent":""}" aria-hidden="true">${t.split(" ").map(w=>`<span class="w">${[...w].map(c=>`<span class="ch" style="--k:${k++}">${esc(c)}</span>`).join("")}</span>`).join(" ")}</span>`).join("");
}
function featBody(f){
  return `<div class="art panel panel-blue grain"><span class="grooves spin" aria-hidden="true"></span>${pic(f.photo,{alt:"",sizes:"(min-width:900px) 35vw, 60vw"})}</div><div class="body"><span class="news-bar" aria-hidden="true"></span><span class="cat">${esc(f.cat)}</span><h3>${esc(f.title)}</h3><p>${esc(f.summary)}</p><p class="date">${fmt(f.date)}${f.sample?" · Sample":""}</p></div>`;
}
function newsCycle(root){
  const box=$("[data-news]",root), pp=$("[data-news-pp]",root); if(!box||!pp) return;
  const feat=$("[data-news-feat]",box), list=$("[data-news-list]",box), all=D.articles, MS=6500;
  let i=0, timer=null, paused=false, held=false;
  const draw=()=>{ const f=all[i];
    feat.href="#story."+f.slug; feat.innerHTML=featBody(f);
    list.innerHTML=[1,2,3].map(k=>storyItem(all[(i+k)%all.length],k-1).replace("story-item reveal","story-item reveal in")).join("");
    box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap"); };
  const start=()=>{ clearInterval(timer); const stop=paused||held; box.classList.toggle("held",stop); if(stop) return;
    const bar=$(".news-bar",feat); if(bar){ bar.style.animation="none"; void bar.offsetWidth; bar.style.animation=""; }
    timer=setInterval(()=>{ i=(i+1)%all.length; draw(); },MS); };
  const hold=v=>()=>{ held=v; start(); };
  box.addEventListener("mouseenter",hold(true)); box.addEventListener("mouseleave",hold(false));
  box.addEventListener("focusin",hold(true)); box.addEventListener("focusout",hold(false));
  pp.addEventListener("click",()=>{ paused=!paused; pp.setAttribute("aria-pressed",paused); pp.textContent=paused?"Play":"Pause"; pp.setAttribute("aria-label",(paused?"Play":"Pause")+" stories"); start(); });
  if(paused){ pp.setAttribute("aria-pressed","true"); pp.textContent="Play"; }
  cleanup.push(()=>clearInterval(timer)); start();
}
// Homepage cover-flow (Shazam style): one card per thing the site offers; the hero and header take the active card's colour
const SZ_TONES=["#1466C8","#2F7D12","#2E3A46","#A35F00"];
function homeSlides(spot,upcoming,feat){
  const fig=(a,i)=>`<span class="sz-art panel ${panelCls(i)}"><span class="grooves" aria-hidden="true"></span>${portrait(a,{sizes:"280px",alt:"",eager:i<2})}</span>`;
  const lyr=SONGS().filter(s=>s.lyrics), fresh=lyr[lyr.length-1], pick=song(D.picks[0]), rel=D.releases.find(r=>r.cover)||D.releases[0], ev=upcoming[0];
  const vid=D.videos.find(v=>v.artist&&artist(v.artist).photo), gap=SONGS().find(s=>!s.lyrics&&!s.lead&&artist(s.artist).photo&&!D.picks.includes(s.slug));
  return [
    fresh&&{label:"Fresh lyrics",sub:"Newly approved by the artists",href:`#song.${fresh.slug}`,a:artist(fresh.artist),title:fresh.title,meta:artist(fresh.artist).name},
    pick&&{label:"Editor’s picks",sub:"Songs our editors are playing",href:`#song.${pick.slug}`,a:artist(pick.artist),title:pick.title,meta:artist(pick.artist).name},
    rel&&{label:"New releases",sub:"Albums and EPs out now",href:`#release.${rel.slug}`,art:`<span class="sz-art">${relArt(rel)}</span>`,title:rel.title,meta:`${artist(rel.artist).name} · ${rel.type}`},
    spot&&{label:"Weekly Spotlight",sub:"One artist, up close",href:`#artist.${spot.slug}`,a:spot,title:spot.name,meta:spot.genre},
    ev&&{label:"Coming up",sub:"Shows and events to catch",href:`#event.${ev.slug}`,art:`<span class="sz-art sz-date"><span class="d">${parse(ev.date).getDate()}</span><span class="m">${MONTHS_L[parse(ev.date).getMonth()]}</span></span>`,title:ev.title,meta:`${ev.venue}, ${ev.town}`},
    feat&&{label:"Stories",sub:"Features on Salone’s artists",href:`#story.${feat.slug}`,art:`<span class="sz-art panel panel-blue"><span class="grooves" aria-hidden="true"></span>${pic(feat.photo,{sizes:"280px",alt:""})}</span>`,title:feat.title,meta:feat.cat},
    vid&&{label:"Lyric videos",sub:"Watch the words come alive",href:"#videos",a:artist(vid.artist),title:vid.title,meta:artist(vid.artist).name},
    gap&&{label:"Add lyrics",sub:"Know the words? Help fill the gaps",href:`#song.${gap.slug}`,a:artist(gap.artist),title:gap.title,meta:"Lyrics wanted"}
  ].filter(Boolean).map((s,i)=>Object.assign(s,{tone:SZ_TONES[i%SZ_TONES.length],art:(s.art||fig(s.a,i)).replace('loading="lazy"','loading="eager"')}));
}
function szSlide(s,i,n){
  return `<div class="sz-slide" data-tone="${s.tone}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${n}: ${esc(s.label)}"><div class="sz-cap"><p class="sz-label">${esc(s.label)}</p><p class="sz-sub">${esc(s.sub)}</p></div><a class="sz-card" href="${s.href}"><span class="sz-pic">${s.art}<span class="sz-go" aria-hidden="true">${ICON.arrow}</span></span><span class="sz-txt"><strong>${esc(s.title)}</strong><small>${esc(s.meta)}</small></span></a></div>`;
}
function szFlow(root){
  const box=$("[data-sz]",root); if(!box) return;
  const hero=box.closest(".sz"), hdr=$(".site-header"), doc=document.documentElement, slides=$$(".sz-slide",box), dots=$$("[data-sz-go]",box), pp=$("[data-sz-pp]",box), n=slides.length;
  let i=0, timer=null, paused=false; const hold={kb:false,hover:false};
  const show=k=>{ i=(k+n)%n;
    slides.forEach((s,j)=>{ let d=j-i; if(d>n/2) d-=n; else if(d<=-n/2) d+=n; const ad=Math.abs(d), on=d===0;
      s.style.setProperty("--d",d); s.style.setProperty("--ad",ad); s.style.zIndex=10-ad;
      s.classList.toggle("on",on); s.classList.toggle("far",ad>2); s.setAttribute("aria-hidden",!on);
      $$("a",s).forEach(x=>x.tabIndex=on?0:-1); });
    dots.forEach((b,j)=>b.setAttribute("aria-current",j===i));
    doc.style.setProperty("--tone",slides[i].dataset.tone); };
  // moves on by itself every 4.5 seconds; it waits while the mouse is over it or a keyboard user is inside it,
  // and keyboard users get a Pause button (it shows when focused)
  const start=()=>{ clearInterval(timer); if(!paused&&!hold.kb&&!hold.hover) timer=setInterval(()=>show(i+1),4500); };
  const go=k=>{ show(k); start(); };
  slides.forEach((s,j)=>s.addEventListener("click",e=>{ if(j!==i){ e.preventDefault(); go(j); } }));
  dots.forEach((b,j)=>b.addEventListener("click",()=>go(j)));
  box.addEventListener("keydown",e=>{ if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ e.preventDefault(); go(i+(e.key==="ArrowRight"?1:-1)); } });
  pp.addEventListener("click",()=>{ paused=!paused; pp.setAttribute("aria-pressed",paused); pp.textContent=paused?"Play":"Pause"; pp.setAttribute("aria-label",(paused?"Play":"Pause")+" slideshow"); start(); });
  box.addEventListener("focusin",e=>{ let kb=false; try{ kb=e.target.matches(":focus-visible"); }catch(_){} if(kb){ hold.kb=true; start(); } });
  box.addEventListener("focusout",e=>{ if(!box.contains(e.relatedTarget)){ hold.kb=false; start(); } });
  if(window.matchMedia&&matchMedia("(hover:hover)").matches){ box.addEventListener("mouseenter",()=>{ hold.hover=true; start(); }); box.addEventListener("mouseleave",()=>{ hold.hover=false; start(); }); }
  const trk=$(".sz-track",box); let x0=null, y0=0;
  trk.addEventListener("touchstart",e=>{ x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
  trk.addEventListener("touchend",e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)) go(i+(dx<0?1:-1)); },{passive:true});
  const vis=()=>{ if(document.hidden) clearInterval(timer); else start(); }; document.addEventListener("visibilitychange",vis);
  // header wears the hero colour until the hero has scrolled away (colour only, so nothing on the page moves)
  hdr.classList.add("on-hero");
  const io2="IntersectionObserver" in window ? new IntersectionObserver(([en])=>hdr.classList.toggle("on-hero",en.isIntersecting),{rootMargin:`-${hdr.offsetHeight+28}px 0px 0px 0px`}) : null;
  if(io2) io2.observe(hero);
  cleanup.push(()=>{ clearInterval(timer); document.removeEventListener("visibilitychange",vis); if(io2) io2.disconnect(); hdr.classList.remove("on-hero"); doc.style.removeProperty("--tone"); });
  show(0); start();
  requestAnimationFrame(()=>requestAnimationFrame(()=>hero.classList.add("ready")));
}
function artistMarquee(root){
  const w=$("[data-amq]",root); if(!w) return; const pp=$("[data-amq-pp]",root);
  if(REDUCED){ w.classList.add("paused"); pp.setAttribute("aria-pressed","true"); pp.textContent="Play"; }
  pp.addEventListener("click",()=>{ const p=w.classList.toggle("paused"); pp.setAttribute("aria-pressed",p); pp.textContent=p?"Play":"Pause"; });
}
function bindSvcLinks(root){ $$("[data-svc]",root).forEach(a=>a.addEventListener("click",()=>{ S.wiz.data.service=a.dataset.svc; S.wiz.step=1; S.jumpEnquiry=true; })); }

/* ================= LYRICS INDEX ================= */
VIEWS.lyrics = () => {
  const genres=["All",...new Set(SONGS().map(s=>s.genre))];
  return { title:"Lyrics", html:`
  <header class="phead grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Lyrics"]])}<h1 class="display">Lyrics</h1><p>Find and read the lyrics to Sierra Leonean songs, with credits and links to listen.</p></div></header>
  <div class="wrap page">
    <div class="notice notice-info reveal" style="margin-bottom:24px"><strong>See how a lyrics page works</strong><span>Real lyrics are added with artist approval. Meanwhile, <a class="link" href="#song.lyric-reader-demo">open the lyric reader demo</a> to try text size, focus mode, auto-scroll and translations.</span></div>
    <div class="filterbar" role="search">
      <div class="field-inline" style="flex:1 1 260px"><label for="lq">Search songs</label><input id="lq" class="input" type="search" placeholder="Song title or artist" value="${esc(S.lyr.q)}"></div>
      <div class="field-inline"><label for="lg">Genre</label><select id="lg" class="select">${genres.map(g=>`<option ${S.lyr.genre===g?"selected":""}>${g}</option>`).join("")}</select></div>
      <div class="field-inline"><label for="lt">Release type</label><select id="lt" class="select">${["All","Single","EP","Album"].map(g=>`<option ${S.lyr.type===g?"selected":""}>${g}</option>`).join("")}</select></div>
    </div>
    <p class="count" id="lcount" aria-live="polite"></p>
    <ol class="songlist mt-s" id="llist"></ol>
    <div class="mt-l"><h2 class="display" style="font-size:clamp(28px,4vw,44px)">Albums &amp; EPs</h2><div class="rel-grid mt-m">${D.releases.map(r=>`<a class="rel reveal" href="#release.${r.slug}">${relArt(r)}<div><h3>${esc(r.title)}</h3><p>${esc(artist(r.artist).name)} · ${esc(r.type)}${r.year?" · "+esc(r.year):""}</p></div></a>`).join("")}</div></div>
  </div>`,
  after(main){
    const draw=()=>{ const q=S.lyr.q.trim().toLowerCase();
      const list=SONGS().filter(s=>(S.lyr.genre==="All"||s.genre===S.lyr.genre)&&(S.lyr.type==="All"||s.type===S.lyr.type)&&(!q||(s.title+" "+artist(s.artist).name+" "+(s.feat||"")).toLowerCase().includes(q)));
      $("#lcount").textContent=`${list.length} song${list.length===1?"":"s"}${q?` matching “${S.lyr.q}”`:""}`;
      $("#llist").innerHTML=list.length?list.map(songRow).join(""):`<li class="empty" style="border-top:0"><p class="display">No songs found</p><p class="muted">Try another spelling or clear the filters.</p><button class="btn btn-ghost btn-sm" type="button" id="lreset">Clear filters</button></li>`;
      const rs=$("#lreset"); if(rs) rs.addEventListener("click",()=>{S.lyr={q:"",genre:"All",type:"All"}; $("#lq").value=""; $("#lg").value="All"; $("#lt").value="All"; draw();}); };
    $("#lq").addEventListener("input",e=>{S.lyr.q=e.target.value;draw();}); $("#lg").addEventListener("change",e=>{S.lyr.genre=e.target.value;draw();}); $("#lt").addEventListener("change",e=>{S.lyr.type=e.target.value;draw();}); draw();
  }};
};

/* ================= SONG ================= */
// ---- Add / edit lyrics: fans submit, the team checks with the artist, contributors get credited
function lyricsMailto(s,a,has){
  const sub=`Salone Lyrics: ${has?"lyrics edit":"new lyrics"} for “${s.title}” by ${s.lead||a.name}`;
  const body=`Song: ${s.title}\nArtist: ${s.lead||a.name}\nPage: ${pageUrl()}\n\n${has?"Line or section:\n\nCorrection:\n":"Lyrics:\n"}\n\nMy name (for the credit):\n\nI typed this myself and agree that Salone Lyrics may publish it after checking with the artist, and credit me.`;
  return `mailto:${SUBMIT_TO}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
}
function contribBlock(s,a){
  const has=!!s.lyrics, what=has?"edit":"lyrics", who=esc(s.lead||a.name);
  return `<section class="contrib" aria-labelledby="contrib-h">
    <h2 id="contrib-h" class="display">${has?"Edit lyrics":"Add lyrics"}</h2>
    <p>${has?`Spotted a mistake in “${esc(s.title)}”? Tell us the line and the correction.`:`Know the words to “${esc(s.title)}”? Type them in for everyone to read.`} We check every ${has?"edit":"submission"} with ${who} or their team before publishing, and credit you by name.</p>
    <div><button class="btn btn-primary btn-sm" type="button" data-contrib-open aria-expanded="false" aria-controls="contrib-form">${has?"Suggest an edit":"Add the lyrics"}</button></div>
    <form id="contrib-form" class="stack contrib-form" novalidate hidden>
      ${has?`<div class="field"><label for="cb-line">Which line or section? <span class="req">*</span></label><input id="cb-line" class="input" placeholder="For example: Chorus, line 2"><p class="err" id="cb-line-e" hidden></p></div>
      <div class="field"><label for="cb-text">Your correction <span class="req">*</span></label><textarea id="cb-text" class="input"></textarea><p class="err" id="cb-text-e" hidden></p></div>`
      :`<div class="field"><label for="cb-text">Lyrics <span class="req">*</span></label><textarea id="cb-text" class="input lyr-input" aria-describedby="cb-text-h"></textarea><p class="hint" id="cb-text-h">Put each line on its own line and leave a blank line between verses. Mark sections like [Chorus] if you can. Krio spellings are welcome.</p><p class="err" id="cb-text-e" hidden></p></div>`}
      <div class="fgrid">
        <div class="field"><label for="cb-name">Your name, for the credit <span class="req">*</span></label><input id="cb-name" class="input" autocomplete="name"><p class="err" id="cb-name-e" hidden></p></div>
        <div class="field"><label for="cb-email">Email (optional)</label><input id="cb-email" class="input" type="email" autocomplete="email" aria-describedby="cb-email-h"><p class="hint" id="cb-email-h">Only used to ask you about this ${has?"edit":"submission"}. Never shown on the site.</p><p class="err" id="cb-email-e" hidden></p></div>
      </div>
      <label class="check"><input type="checkbox" id="cb-own"> ${has?"This correction is my own work":"I typed these lyrics myself and did not copy them from another website"}</label>
      <label class="check"><input type="checkbox" id="cb-ok"> Salone Lyrics may publish my ${what} after checking with the artist, and credit me by the name above</label>
      <p class="err" id="cb-check-e" hidden></p>
      <input type="text" id="cb-honey" class="sr" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="row-wrap"><button class="btn btn-primary" type="submit">Send ${what}</button><a class="link" href="${lyricsMailto(s,a,has)}">Or email us instead</a></div>
      <p class="paid-note">Your ${has?"edit reaches":"lyrics reach"} the Salone Lyrics team by email through FormSubmit, a free form service.</p>
      <div id="cb-msg" aria-live="polite"></div>
    </form>
  </section>`;
}
function bindContrib(root,s,a){
  const box=$(".contrib",root); if(!box) return;
  const has=!!s.lyrics, what=has?"edit":"lyrics", f=$("#contrib-form",box), open=$("[data-contrib-open]",box);
  open.addEventListener("click",()=>{ f.hidden=!f.hidden; open.setAttribute("aria-expanded",!f.hidden); if(!f.hidden) $(has?"#cb-line":"#cb-text",f).focus(); });
  const flag=(id,bad,m)=>{ const el=$("#"+id,f), e=$("#"+id+"-e",f); el.setAttribute("aria-invalid",!!bad); e.hidden=!bad; e.textContent=m; return bad?el:null; };
  f.addEventListener("submit",async ev=>{ ev.preventDefault();
    const em=$("#cb-email",f).value.trim(), checks=$("#cb-own",f).checked&&$("#cb-ok",f).checked;
    const bad=[ has?flag("cb-line",!$("#cb-line",f).value.trim(),"Tell us which line or section."):null,
      flag("cb-text",!$("#cb-text",f).value.trim(),has?"Write your correction.":"Add the lyrics."),
      flag("cb-name",!$("#cb-name",f).value.trim(),"Enter the name we should credit."),
      flag("cb-email",em&&!/^\S+@\S+\.\S+$/.test(em),"Enter an email address like name@example.com, or leave it empty.") ].filter(Boolean);
    const ce=$("#cb-check-e",f); ce.hidden=checks; ce.textContent="Please tick both boxes to send.";
    if(bad.length||!checks){ (bad[0]||$("#cb-own",f)).focus(); return; }
    if($("#cb-honey",f).value) return; // filled in by spam bots only
    const btn=$("button[type=submit]",f), msg=$("#cb-msg",f); btn.disabled=true; btn.textContent="Sending…";
    const data={ _subject:`Salone Lyrics: ${has?"lyrics edit":"new lyrics"} for “${s.title}” by ${s.lead||a.name}`, _template:"box",
      Type:has?"Edit to published lyrics":"New lyrics", Song:s.title, Artist:s.lead||a.name, Page:pageUrl(),
      ...(has?{"Line or section":$("#cb-line",f).value.trim()}:{}), [has?"Correction":"Lyrics"]:$("#cb-text",f).value.trim(),
      "Credit name":$("#cb-name",f).value.trim(), Email:em||"(not given)", "Typed it themselves":"Yes", "Agreed to review and credit":"Yes" };
    try{
      const r=await fetch(`https://formsubmit.co/ajax/${SUBMIT_TO}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)});
      const j=await r.json().catch(()=>({})); if(!r.ok||String(j.success)!=="true") throw new Error(j.message||"Not sent");
      msg.innerHTML=`<div class="notice notice-ok"><strong>Thank you, ${esc(data["Credit name"])}!</strong><span>Your ${what} reached the Salone Lyrics team. We’ll check with ${esc(data.Artist)} or their team and credit you when it’s published.</span></div>`; f.reset();
    }catch(err){
      msg.innerHTML=`<div class="notice notice-warn"><strong>That didn’t send</strong><span>Please try again in a moment, or <a class="link" href="${lyricsMailto(s,a,has)}">email us instead</a>.</span></div>`;
    }
    btn.disabled=false; btn.textContent=`Send ${what}`; });
}
const PLAT=[["youtube","YouTube"],["youtubeMusic","YouTube Music"],["spotify","Spotify"],["appleMusic","Apple Music"],["audiomack","Audiomack"],["boomplay","Boomplay"],["amazonMusic","Amazon Music"],["deezer","Deezer"],["tidal","Tidal"]];
function artistProfiles(a){ const m={}; (a.links||[]).forEach(([l,u])=>{ const [p,rest]=l.split(" — "); const hit=PLAT.find(([,n])=>n===p); if(hit&&rest&&/artist/i.test(rest)&&!m[hit[0]]) m[hit[0]]=u; }); return m; }
// Streaming platforms shown on every song, in this order. A verified song link is used when we have one;
// otherwise the tile opens a search for "artist + title" on that platform.
const LISTEN=[["spotify","Spotify"],["appleMusic","Apple Music"],["youtubeMusic","YouTube Music"],["youtube","YouTube"],["audiomack","Audiomack"],["boomplay","Boomplay"],["deezer","Deezer"],["amazonMusic","Amazon Music"]];
const PSEARCH={spotify:q=>`https://open.spotify.com/search/${encodeURIComponent(q)}`,appleMusic:q=>`https://music.apple.com/search?term=${encodeURIComponent(q)}`,youtubeMusic:q=>`https://music.youtube.com/search?q=${encodeURIComponent(q)}`,youtube:q=>`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,audiomack:q=>`https://audiomack.com/search?q=${encodeURIComponent(q)}`,boomplay:q=>`https://www.boomplay.com/search/default/${encodeURIComponent(q)}`,deezer:q=>`https://www.deezer.com/search/${encodeURIComponent(q)}`,amazonMusic:q=>`https://music.amazon.com/search/${encodeURIComponent(q)}`};
// Platform icons: Simple Icons 16.34.0 brand logos (CC0, simpleicons.org); Lucide icons (ISC, lucide.dev) for Boomplay,
// Amazon Music (not in Simple Icons) and websites. Tile colours are each platform's brand colour.
const PCOLOR={"spotify":"#1ED760","appleMusic":"#FA243C","youtubeMusic":"#FF0000","youtube":"#FF0000","audiomack":"#FFA200","deezer":"#A238FF","soundcloud":"#FF5500","instagram":"#FF0069","tiktok":"#111111","facebook":"#0866FF","x":"#111111","boomplay":"#1E5BFF","amazonMusic":"#232F3E","web":"#3D4A53"};
const PICON={"spotify":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z\"/></svg>","appleMusic":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z\"/></svg>","youtubeMusic":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z\"/></svg>","youtube":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>","audiomack":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M.331 11.378s.5418-.089.765.1439c.2234.2332.077.7156-.2195.7237-.2965.01-.5705.063-.765-.1439-.1946-.2066-.1424-.6218.2195-.7237m5.881 3.2925c-.0522.01-.1075-.018-.164-.059-.3884-.5413-.5287-2.3923-.707-2.5025-.185-.1144-.8545 1.0255-2.1862.903-.5569-.051-1.1236-.4121-1.4573-.662.031-.4206.0364-1.4027.8659-1.0833.5038.1939 1.3667.7266 2.1245-.23.8378-1.0579 1.2999-.7506 1.577-.5206.2771.23.0925 1.4259.5058 1.0916.4133-.3343 2.082-2.4103 2.082-2.4103s1.292-1.303 1.4898.067c.1979 1.3698 1.0403 2.8877 1.2635 2.8445.2234-.043 2.8223-5.3253 3.1945-5.666.3722-.3409 1.6252-.2961 1.5657.5781-.0596.8742-.1871 6.308-.1871 6.308s-.147 1.5311.0924.7128c.0992-.3392.206-.6453.3392-1.0024.6414-2.0534 1.734-5.5613 2.2784-7.3688.1252-.4325.233-.8037.3166-1.0891l.0001-.0008a3.5925 3.5925 0 0 1 .0973-.3305c.0455-.1532.0763-.2546.0858-.2813.0243-.068.0925-.1192.1884-.157.0962-.061.1995-.064.3165-.067.3021-.027.6907.012 1.0401.1119.1018 0 .2125.037.3172.1118v.0001s.0063 0 .0151.01c.0023 0 .0048 0 .0073.01.0219.015.0573.045.0983.095.0012 0 .0025 0 .004.01.017.021.0341.045.0515.073.1952.2863.315.814.1948 1.7498-.2996 2.3354-.5316 7.1397-.5316 7.1397s-.0461.2298.4353-.782c.0167-.035.0383-.066.058-.098.026-.017.0552-.042.0913-.085.2974-.3546 1.0968-.5629 1.6512-.5586.2336.028.4293.087.5462.1609.2188.333.0897 1.562.0897 1.562-.4612.043-1.3403.2908-1.6519.3366-.3118.046-.7852 2.0699-1.4433 1.8629-.6581-.2069-2.1246-1.1268-2.1246-1.2533 0-.1102.1152-1.4546.1453-1.8016.0022-.024.004-.046.0058-.068a.152.152 0 0 1 .0014-.014l-.0002.0003c.0213-.2733.0023-.3927-.1239-.1199-.1086.2346-.581 1.7359-1.1078 3.3709-.0556.1429-1.0511 3.1558-1.1818 3.5231-.156.4261-.287.7523-.3776.921-.1378.1867-.3234.3036-.5826.2252-.6465-.1954-1.4654-1.0889-1.473-1.3106-.0155-1.2503.0608-7.973-.2423-7.4127-.311.5744-2.73 4.5608-2.73 4.5608-.0405.01-.0705.01-.1062.01-.1712-.019-.4366-.074-.51-.2384-.004-.01-.0094-.018-.0129-.028-.0035-.01-.0075-.022-.0135-.04-.0329-.1097-.0463-.2289-.0753-.3265-.1082-.3652-.2813-.8886-.463-1.421-.2784-.9079-.5654-1.8366-.6127-1.9391-.0923-.2007-.2268-.116-.3475-.0002-.54.458-1.6868 2.4793-2.7225 2.5898\"/></svg>","deezer":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M.693 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807C.312 4.41 0 5.666 0 7.217s.312 2.808.693 2.808ZM21.038 1.56c-.364 0-.684.805-.91 2.096C19.765 1.446 19.184 0 18.526 0c-.78 0-1.464 2.036-1.784 5-.312-2.158-.788-3.536-1.325-3.536-.745 0-1.386 2.704-1.62 6.472-.442-1.932-1.083-3.145-1.793-3.145s-1.35 1.213-1.793 3.145c-.242-3.76-.874-6.463-1.628-6.463-.537 0-1.013 1.378-1.325 3.535C6.938 2.036 6.262 0 5.474 0c-.658 0-1.247 1.447-1.602 3.665-.217-1.291-.546-2.105-.91-2.105-.675 0-1.221 2.807-1.221 6.272 0 3.466.546 6.273 1.221 6.273.277 0 .537-.476.736-1.273.32 2.928.996 4.938 1.776 4.938.606 0 1.143-1.204 1.507-3.11.251 3.622.875 6.195 1.602 6.195.46 0 .875-1.023 1.187-2.677C10.142 21.6 11 24 12.004 24c1.005 0 1.863-2.4 2.235-5.822.312 1.654.727 2.677 1.186 2.677.728 0 1.352-2.573 1.603-6.195.364 1.906.9 3.11 1.507 3.11.78 0 1.455-2.01 1.775-4.938.208.797.46 1.273.737 1.273.675 0 1.22-2.807 1.22-6.273-.008-3.457-.553-6.272-1.23-6.272ZM23.307 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807-.381 0-.693 1.256-.693 2.807s.312 2.808.693 2.808Z\"/></svg>","soundcloud":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z\"/></svg>","instagram":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"/></svg>","tiktok":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"/></svg>","facebook":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>","x":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>","boomplay":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/></svg>","amazonMusic":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/></svg>","web":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>"};
// Which platform a web address belongs to (for the icon on official links)
const LINKPLAT=[[/music\.youtube\.com/,"youtubeMusic"],[/spotify\.com/,"spotify"],[/music\.apple\.com/,"appleMusic"],[/youtube\.com|youtu\.be/,"youtube"],[/audiomack\.com/,"audiomack"],[/boomplay/,"boomplay"],[/deezer\.com/,"deezer"],[/music\.amazon|amazon\./,"amazonMusic"],[/soundcloud\.com/,"soundcloud"],[/instagram\.com/,"instagram"],[/tiktok\.com/,"tiktok"],[/facebook\.com|fb\.com/,"facebook"],[/(^|\.)(x|twitter)\.com/,"x"]];
function linkTile(name,url){
  let host=""; try{ host=new URL(url).hostname.replace(/^www\./,""); }catch(e){}
  const hit=LINKPLAT.find(([re])=>re.test(host)), k=hit?hit[1]:"web", [main,rest]=String(name).split(" — ");
  return `<a class="plat" href="${url}" target="_blank" rel="noopener"><span class="plat-ic" style="background:${PCOLOR[k]}">${PICON[k]}</span><span class="plat-t"><strong>${esc(main)}</strong><small>${esc(rest||host)}</small></span><span class="sr"> (opens in a new tab)</span></a>`;
}
function listenBlock(s,a){
  const L=(s.listen&&s.listen.links)||{}, e=s.listen&&s.listen.embed, q=`${s.lead||a.name} ${s.title}`;
  const tiles=LISTEN.map(([k,n])=>({k,n,url:L[k]||PSEARCH[k](q),direct:!!L[k]})).sort((x,y)=>y.direct-x.direct)
    .map(o=>`<a class="plat${o.direct?" is-direct":""}" href="${o.url}" target="_blank" rel="noopener"><span class="plat-ic" style="background:${PCOLOR[o.k]}">${PICON[o.k]}</span><span class="plat-t"><strong>${o.n}</strong><small>${o.direct?"Listen to the song":"Search for it"}</small></span><span class="sr"> (opens in a new tab)</span></a>`).join("");
  const player=e?`<div class="player" data-src="${e.src}" data-h="${e.h}" data-title="${esc(s.title)} on ${esc(e.name)}"><button class="btn btn-primary btn-sm" type="button" data-play-embed>${ICON.play}<span>Play while you read</span></button><span class="player-note">Official recording on ${esc(e.name)}. Without ${/^[aeiou]/i.test(e.name)?"an":"a"} ${esc(e.name)} sign-in, it may play a preview.</span></div>`:"";
  return `<section class="listen-sec" aria-labelledby="listen-h"><h2 id="listen-h" class="display">Listen</h2>${player}<div class="plat-grid">${tiles}</div><p class="paid-note">“Listen to the song” goes straight to the track. “Search for it” opens a search for “${esc(q)}” on that platform. Plays follow each platform’s own rules for counting streams.</p></section>`;
}
function bindPlayer(root){ const p=$(".player",root); if(!p) return; $("[data-play-embed]",p).addEventListener("click",()=>{ p.innerHTML=`<iframe src="${p.dataset.src}" title="${p.dataset.title}" height="${p.dataset.h}" allow="autoplay *; encrypted-media *; clipboard-write; fullscreen" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"></iframe>`; }); }
VIEWS.song = r => {
  const s=song(r.slug); if(!s) return VIEWS.notfound(r);
  const a=artist(s.artist), fa=s.featA?artist(s.featA):null;
  const related=SONGS().filter(x=>x.slug!==s.slug&&(x.artist===s.artist||x.featA===s.artist)).slice(0,5);
  const more=related.length?related:SONGS().filter(x=>x.slug!==s.slug&&x.genre===s.genre).slice(0,5);
  const rel=s.release?release(s.release):null;
  const credits=Object.assign({}, s.credits||{}, s.feat?{"Featuring":s.feat}:{}, s.album?{"Album":s.album}:{}, s.label?{"Label":s.label}:{});
  const lyricBlock = s.lyrics ? `
        <div class="toolbar" role="toolbar" aria-label="Reading tools">
          <div class="grp" role="group" aria-label="Text size"><button type="button" data-size="-1" aria-label="Smaller text">A−</button><button type="button" data-size="1" aria-label="Larger text">A+</button></div>
          <div class="grp"><button type="button" id="focusbtn" aria-pressed="false">Focus mode</button></div>
          <div class="grp"><button type="button" id="scrollbtn" aria-pressed="false">Auto-scroll</button><label for="speed">Speed <input id="speed" type="range" min="1" max="5" value="2"></label></div>
          <div class="grp"><button type="button" id="sharebtn">Share</button></div>
        </div>
        ${s.translation?`<div class="lang-tabs" role="tablist" aria-label="Lyrics language"><button class="chip" role="tab" id="lt-o" aria-selected="true" aria-controls="lyrics">Original (Krio &amp; English)</button><button class="chip" role="tab" id="lt-t" aria-selected="false" aria-controls="lyrics">${esc(s.translation.label)}</button></div>`:""}
        <article class="lyrics" id="lyrics" role="tabpanel" style="--lsize:${S.lsize}px" aria-label="Lyrics"></article>
        ${s.demo?'<p class="paid-note">Demo text written for this preview to show the lyric reader. It is not a real song.</p>':s.contributors&&s.contributors.length?`<p class="paid-note">Lyrics contributed by ${esc(s.contributors.join(", "))}.</p>`:""}`
    : `
        <div class="toolbar" role="toolbar" aria-label="Song tools"><div class="grp"><button type="button" id="sharebtn">Share</button></div></div>
        <div class="lyrics-pending reveal"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><h2 class="display">Lyrics coming soon</h2><p>We publish lyrics only when ${esc(a.name)} or their team has approved them, so every word is right.</p>${s.demo?"":contribBlock(s,a)}</div>
        ${listenBlock(s,a)}`;
  return { title:`${s.title} by ${s.lead||a.name}`, html:`
  <header class="song-head"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">
    <div class="stack">${crumbs([["Home","#"],["Lyrics","#lyrics"],[s.title]])}
      <div class="row-wrap" style="gap:8px"><span class="tag tag-dark">${esc(s.genre)}</span><span class="tag tag-dark">${esc(s.type)}</span>${s.demo?'<span class="tag tag-amber">Demo</span>':""}</div>
      <h1 class="display">${esc(s.title)}</h1>
      <p class="by">${s.demo?"Sample text by Salone Lyrics":s.lead?`By ${esc(s.lead)} feat. ${esc(s.feat).replace(esc(a.name),`<a href="#artist.${a.slug}">${esc(a.name)}</a>`)}`:`By <a href="#artist.${a.slug}">${esc(a.name)}</a>${s.feat?` feat. ${fa?`<a href="#artist.${fa.slug}">${esc(s.feat)}</a>`:esc(s.feat)}`:""}`} · ${esc(yr(s.year))}${rel?` · From <a href="#release.${rel.slug}">${esc(rel.title)}</a>`:""}</p>
    </div>
    ${a.photo?`<div class="portrait panel panel-blue" aria-hidden="true">${pic(a.photo,{sizes:"300px",alt:""})}</div>`:""}
  </div></header>
  <div class="wrap">
    <p class="focus-title display" style="font-size:40px">${esc(s.title)}</p>
    <div class="song-layout"><div style="min-width:0"><div>${lyricBlock}</div>
        ${s.demo||!s.lyrics?"":contribBlock(s,a)}
      </div>
      <aside class="song-aside stack" style="gap:32px;align-content:start">
        <div class="aside-box"><h2>Credits</h2><dl class="credits"><dt>Artist</dt><dd>${esc(s.demo?"Sample":s.lead||a.name)}</dd>${Object.entries(credits).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}<dt>Year</dt><dd>${esc(yr(s.year))}</dd></dl><p class="paid-note">Full writer and producer credits are added with the lyrics.</p></div>
        ${s.demo?"":`${s.lyrics?listenBlock(s,a):""}
        <div class="aside-box"><h2>About the artist</h2><a href="#artist.${a.slug}" class="acard"><div class="portrait panel panel-green" style="aspect-ratio:16/10">${portrait(a,{sizes:"320px",alt:""})}</div><h3>${esc(a.name)}</h3><p>${esc(a.intro)}</p></a><a class="arrow-link" href="#artist.${a.slug}">View ${esc(a.name)}’s profile</a></div>`}
      </aside>
    </div>
    <section class="after-lyrics section" style="padding-bottom:0" aria-labelledby="rel-songs"><h2 id="rel-songs" class="display" style="font-size:clamp(28px,4vw,44px);margin-bottom:24px">${s.demo?"Editor’s picks":related.length?`More from ${esc(a.name)}`:"Related songs"}</h2><ol class="songlist">${(s.demo?D.picks.map(song):more).map(songRow).join("")}</ol></section>
  </div><div style="height:64px"></div>`,
  after(main){
    $("#sharebtn",main).addEventListener("click",()=>share(document.title));
    bindPlayer(main); bindContrib(main,s,a);
    if(!s.lyrics) return;
    const ly=$("#lyrics",main);
    const drawLy=tr=>{ ly.innerHTML=s.lyrics.map(([h,lines])=>`<section>${h?`<h2>${esc(h)}</h2>`:""}${lines.map(l=>`<p>${esc(l)}${tr&&s.translation&&s.translation.lines[l]?`<span class="tr" lang="en">${esc(s.translation.lines[l])}</span>`:""}</p>`).join("")}</section>`).join(""); };
    drawLy(false);
    $$("[data-size]",main).forEach(b=>b.addEventListener("click",()=>{ S.lsize=Math.max(15,Math.min(28,S.lsize+(+b.dataset.size)*2)); ly.style.setProperty("--lsize",S.lsize+"px"); try{localStorage.setItem("sl-lsize",S.lsize)}catch(e){} toast(`Text size ${S.lsize}px`); }));
    const fb=$("#focusbtn",main);
    const setFocus=on=>{ document.body.classList.toggle("focus-mode",on); fb.setAttribute("aria-pressed",on); fb.textContent=on?"Exit focus":"Focus mode"; if(on) ly.scrollIntoView({block:"start"}); };
    fb.addEventListener("click",()=>setFocus(!document.body.classList.contains("focus-mode")));
    const onKey=e=>{ if(e.key==="Escape"&&document.body.classList.contains("focus-mode")&&$("#sdlg").hidden) setFocus(false); };
    document.addEventListener("keydown",onKey); cleanup.push(()=>document.removeEventListener("keydown",onKey));
    // Auto-scroll: steady, time-based speed (the same on every phone), starts at the lyrics, stops at the end of the lyrics,
    // and stops if the reader scrolls or touches the page themselves (taps on the toolbar don't count)
    let raf=null, last=0, pos=0, setY=0; const sb=$("#scrollbtn",main), sp=$("#speed",main), root=document.documentElement;
    const stop=msg=>{ if(raf) cancelAnimationFrame(raf); raf=null; root.style.scrollBehavior=""; sb.setAttribute("aria-pressed","false"); sb.textContent="Auto-scroll"; if(typeof msg==="string") toast(msg); };
    const step=t=>{ const dt=last?Math.min(500,t-last):16; last=t; // catch up with real time, even on a slow or busy phone
      if(Math.abs(window.scrollY-setY)>3) pos=window.scrollY;
      pos+=(+sp.value*14)*dt/1000; setY=Math.round(pos); window.scrollTo(0,setY);
      const ly=$("#lyrics",main);
      if((ly&&ly.getBoundingClientRect().bottom<window.innerHeight*0.55)||window.innerHeight+window.scrollY>=root.scrollHeight-2){ stop("End of lyrics"); return; }
      raf=requestAnimationFrame(step); };
    const start=()=>{ root.style.scrollBehavior="auto"; const ly=$("#lyrics",main);
      if(ly&&ly.getBoundingClientRect().top>window.innerHeight*0.6) window.scrollTo(0,ly.getBoundingClientRect().top+window.scrollY-150);
      pos=setY=window.scrollY; last=0; sb.setAttribute("aria-pressed","true"); sb.textContent="Pause"; raf=requestAnimationFrame(step); };
    sb.addEventListener("click",()=>{ if(raf) stop(); else start(); });
    const userStop=e=>{ if(raf&&!(e.target&&e.target.closest&&e.target.closest(".toolbar"))) stop(); }; window.addEventListener("wheel",userStop,{passive:true}); window.addEventListener("touchstart",userStop,{passive:true});
    cleanup.push(()=>{stop();window.removeEventListener("wheel",userStop);window.removeEventListener("touchstart",userStop);});
    const o=$("#lt-o",main), t=$("#lt-t",main);
    const set=tr=>{ o.setAttribute("aria-selected",!tr); t.setAttribute("aria-selected",tr); drawLy(tr); };
    if(!o||!t) return;
    o.addEventListener("click",()=>set(false)); t.addEventListener("click",()=>set(true));
    [o,t].forEach(b=>b.addEventListener("keydown",e=>{ if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ const n=b===o?t:o; n.focus(); n.click(); } }));
  }};
};

/* ================= RELEASE ================= */
VIEWS.release = r => {
  const rel=release(r.slug); if(!rel) return VIEWS.notfound(r);
  const a=artist(rel.artist); const tracks=SONGS().filter(s=>s.release===rel.slug||rel.tracks.includes(s.slug));
  return { title:`${rel.title} by ${a.name}`, html:`
  <header class="phead charcoal"><div class="wrap">${crumbs([["Home","#"],["Lyrics","#lyrics"],[rel.title]])}
    <div class="about-split" style="gap:32px"><div class="stack"><div class="row-wrap" style="gap:8px"><span class="tag tag-green">${esc(rel.type)}</span>${rel.note?`<span class="tag tag-amber">${esc(rel.note)}</span>`:""}</div><h1 class="display">${esc(rel.title)}</h1><p>By <a class="link" style="color:#fff" href="#artist.${a.slug}">${esc(a.name)}</a>${rel.year?" · "+esc(rel.year):""}</p>${rel.about?`<p class="rel-about">${esc(rel.about)}</p>`:""}<div class="row-wrap">${rel.listen?`<a class="btn btn-green" href="${rel.listen}" target="_blank" rel="noopener">Listen on ${esc(rel.listenOn||"streaming")}<span class="sr"> (opens in a new tab)</span></a>`:""}<button class="btn ${rel.listen?"btn-ghost rel-share":"btn-green"}" type="button" data-share>Share release</button></div></div>
    <div style="max-width:360px;width:100%">${relArt(rel,`Cover of ${rel.title} by ${a.name}`)}<p class="credit" style="color:var(--muted-dark);margin-top:8px">${rel.cover?"Cover artwork.":"Typographic tile. Official artwork will be added when supplied."}</p></div></div>
  </div></header>
  <div class="wrap page"><h2 class="display" style="font-size:36px;margin-bottom:16px">${rel.tracklist?"Tracklist":"Songs on Salone Lyrics"}</h2>${rel.tracklist?trackList(rel):tracks.length?`<ol class="songlist">${tracks.map(songRow).join("")}</ol>`:`<div class="empty"><p class="muted">The tracklist for ${esc(rel.title)} will be added with the artist.</p></div>`}
  ${rel.credits?`<h2 class="display" style="font-size:28px;margin:40px 0 12px">Credits</h2><dl class="rel-credits">${rel.credits.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`:""}
  <div class="mt-l"><a class="arrow-link" href="#artist.${a.slug}.music">More lyrics from ${esc(a.name)}</a></div></div>`,
  after(main){ $("[data-share]",main).addEventListener("click",()=>share(document.title)); }};
};

/* ================= ARTISTS ================= */
VIEWS.artists = () => {
  const genres=["All",...[...new Set(ARTISTS().flatMap(gTags))].sort()];
  return { title:"Artists", html:`
  <header class="phead green grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Artists"]])}<h1 class="display">Artists</h1><p>Profiles of Sierra Leone’s leading voices, from veterans to the newest names on the charts.</p></div></header>
  <div class="wrap page">
    <div class="filterbar"><div class="field-inline" style="flex:1 1 240px"><label for="aq">Search artists</label><input id="aq" class="input" type="search" placeholder="Name, genre or town" value="${esc(S.art.q)}"></div>
      <div class="field-inline"><label for="ag">Genre</label><select id="ag" class="select">${genres.map(g=>`<option ${S.art.genre===g?"selected":""}>${g}</option>`).join("")}</select></div></div>
    <p class="count" id="acount" aria-live="polite"></p>
    <div class="adir mt-m" id="adir"></div>
    <p class="paid-note mt-m">Artist photos are shown in black and white for this design. Photographer credits will be added once confirmed.</p>
  </div>`,
  after(main){
    const draw=()=>{ const q=S.art.q.trim().toLowerCase(); const list=ARTISTS().filter(a=>(S.art.genre==="All"||gTags(a).includes(S.art.genre))&&(!q||(a.name+" "+(a.aka||"")+" "+a.genre+" "+a.town).toLowerCase().includes(q)));
      $("#acount").textContent=`${list.length} artist${list.length===1?"":"s"}`;
      $("#adir").innerHTML=list.length?list.map((a,i)=>artistCard(a,i,"h2")).join(""):`<div class="empty" style="grid-column:1/-1"><p class="display">No artists found</p><p class="muted">Try a different name or genre.</p></div>`; reveal($("#adir")); };
    $("#aq").addEventListener("input",e=>{S.art.q=e.target.value;draw();}); $("#ag").addEventListener("change",e=>{S.art.genre=e.target.value;draw();}); draw();
  }};
};

/* ================= ARTIST ================= */
const TABS=[["overview","Overview"],["music","Lyrics"],["videos","Videos"],["gallery","Gallery"],["events","Events"]];
VIEWS.artist = r => {
  const a=artist(r.slug); if(!a||a.hidden) return VIEWS.notfound(r);
  const tab=TABS.some(t=>t[0]===r.sub)?r.sub:"overview";
  return { title:a.name, html:`
  <header class="a-hero grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">
    <div class="txt stack">${crumbs([["Home","#"],["Artists","#artists"],[a.name]])}
      <div class="facts"><span class="tag tag-dark">${esc(a.genre)}</span><span class="tag tag-dark">${esc(a.town)}</span>${a.pending?'<span class="tag tag-amber">Profile in progress</span>':""}</div>
      <h1 class="display">${esc(a.name)}</h1>${a.aka?`<p class="aka">Also known as ${esc(a.aka)}</p>`:""}<p class="intro">${esc(a.intro)}</p>
      <div class="row-wrap on-dark"><a class="btn btn-green" href="#artist.${a.slug}.music">View Lyrics</a><a class="btn btn-ghost" style="color:#fff" href="#artist.${a.slug}.videos">Watch</a></div>
    </div>
    <div class="art"><div class="floaty">${portrait(a,{cls:"cut",eager:true,sizes:"(min-width:900px) 40vw, 80vw"})}</div></div>
  </div></header>
  <div class="wrap"><div class="tabs" role="tablist" aria-label="${esc(a.name)} sections">${TABS.map(([id,l])=>`<button class="tab" role="tab" id="tab-${id}" aria-controls="panel" aria-selected="${id===tab}" tabindex="${id===tab?0:-1}" data-tab="${id}">${l}</button>`).join("")}</div>
  <div id="panel" class="tabpanel" role="tabpanel" aria-labelledby="tab-${tab}" tabindex="0"></div><div style="height:80px"></div></div>`,
  after(main){
    const panel=$("#panel",main);
    const show=(id,focus)=>{ $$(".tab",main).forEach(t=>{const on=t.dataset.tab===id;t.setAttribute("aria-selected",on);t.tabIndex=on?0:-1; if(on&&focus)t.focus();}); panel.setAttribute("aria-labelledby","tab-"+id); panel.innerHTML=artistPanel(a,id); panel.style.animation="none"; panel.offsetHeight; panel.style.animation="";
      try{history.replaceState(null,"",`#artist.${a.slug}${id==="overview"?"":"."+id}`);}catch(e){} bindVideos(panel); bindGallery(panel); reveal(panel); };
    $$(".tab",main).forEach((t,i,all)=>{ t.addEventListener("click",()=>show(t.dataset.tab));
      t.addEventListener("keydown",e=>{ let j=null; if(e.key==="ArrowRight")j=(i+1)%all.length; if(e.key==="ArrowLeft")j=(i-1+all.length)%all.length; if(e.key==="Home")j=0; if(e.key==="End")j=all.length-1; if(j!=null){e.preventDefault(); show(all[j].dataset.tab,true);} }); });
    show(tab); if(route().sub) setTimeout(()=>$(".tabs",main).scrollIntoView({block:"start"}),30);
  }};
};
function artistPanel(a,id){
  const songs=SONGS().filter(s=>s.artist===a.slug||s.featA===a.slug);
  const rels=D.releases.filter(r=>r.artist===a.slug);
  const vids=D.videos.filter(v=>v.artist===a.slug);
  const news=D.articles.filter(n=>n.artist===a.slug||(n.related||[]).includes(a.slug));
  if(id==="overview") return `<div class="two-col"><div class="prose"><h2 class="display" style="font-size:36px">Biography</h2>${a.bio.map(p=>`<p>${esc(p)}</p>`).join("")}
    ${a.awards.length?`<h3 class="eyebrow mt-s">Recognition</h3><ul class="awards">${a.awards.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
    ${a.sources.length?`<details class="sources"><summary>Sources for this profile</summary><ul>${a.sources.map(s=>{ const [l,u]=Array.isArray(s)?s:[s.replace(/^https?:\/\/(www\.)?/,"").slice(0,70),s]; return u?`<li><a class="link" href="${u}" target="_blank" rel="noopener">${esc(l)}</a></li>`:`<li>${esc(l)}</li>`; }).join("")}</ul></details>`:""}</div>
    <aside class="stack" style="gap:28px;align-content:start"><div class="aside-box"><h2>Details</h2><dl class="credits">${a.details?a.details.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join(""):`<dt>Genre</dt><dd>${esc(a.genre)}</dd><dt>Based in</dt><dd>${esc(a.town)}</dd>${a.label?`<dt>Label</dt><dd>${esc(a.label)}</dd>`:""}${(a.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}`}<dt>Songs here</dt><dd>${songs.length}</dd></dl></div>
    <div class="aside-box"><h2>Official links</h2>${a.links.length?`<div class="plat-grid plat-list">${a.links.map(([n,u])=>linkTile(n,u)).join("")}</div>`:`<p class="muted" style="font-size:14px">Official links will be added after confirmation with the artist.</p>`}</div>
    <div class="aside-box"><h2>Booking</h2><p class="muted" style="font-size:14px">Authorised booking information will be added after confirmation with the artist or management.</p></div>
    
    ${news.length||a.storyIdea?`<div class="aside-box"><h2>Stories</h2>${news.map(n=>`<a class="arrow-link" href="#story.${n.slug}" style="display:flex">${esc(n.title)}</a>`).join("")}${a.storyIdea?`<p class="muted" style="font-size:14px">Coming soon: ${esc(a.storyIdea)}</p>`:""}</div>`:""}</aside></div>`;
  if(id==="music") return `<h2 class="display" style="font-size:36px;margin-bottom:16px">Lyrics</h2>${songs.length?`<ol class="songlist">${songs.map(songRow).join("")}</ol>`:`<div class="empty"><p class="muted">Songs will be added once confirmed with the artist.</p></div>`}
    ${rels.length?`<h2 class="display mt-l" style="font-size:36px;margin-bottom:16px">Albums &amp; EPs</h2><div class="rel-grid">${rels.map(r=>`<a class="rel" href="#release.${r.slug}">${relArt(r)}<div><h3>${esc(r.title)}</h3><p>${esc(r.type)}${r.year?" · "+esc(r.year):""}</p></div></a>`).join("")}</div>`:""}`;
  if(id==="videos") return vids.length?`<div class="vid-grid">${vids.map(vidCard).join("")}</div>`:`<div class="empty"><p class="display">No videos yet</p><p class="muted">Official videos will appear here.</p><a class="btn btn-ghost btn-sm" href="https://www.youtube.com/results?search_query=${encodeURIComponent(a.name+" Sierra Leone")}" target="_blank" rel="noopener">Search YouTube</a></div>`;
  if(id==="gallery") return a.photo?`<div class="gal-grid">${[a.photo,...(a.morePhotos||[])].map((k,i)=>galItem(k,i)).join("")}</div>`:`<div class="empty"><p class="muted">Photos will appear once supplied by the artist.</p></div>`;
  if(id==="events") return `<div class="empty"><p class="display">No confirmed performances</p><p class="muted">${esc(a.name)}’s upcoming shows will be listed here once confirmed by organisers.</p><a class="btn btn-ghost btn-sm" href="#events">All events</a></div>`;
  return "";
}

/* ================= NEWS ================= */
VIEWS.news = () => {
  const cats=["All",...new Set(D.articles.map(a=>a.cat))];
  return { title:"Stories", html:`
  <header class="phead charcoal grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Stories"]])}<h1 class="display">Stories</h1><p>Artist spotlights, career features and the stories behind the songs, with sources on every story.</p><div class="row-wrap" style="margin-top:16px"><button type="button" class="btn btn-green btn-sm" data-notify="Stories"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>Get story alerts</button></div></div></header>
  <div class="wrap page"><div class="chips" role="group" aria-label="Filter stories">${cats.map(c=>`<button class="chip" type="button" data-cat="${c}" aria-pressed="${S.news===c}">${c}</button>`).join("")}</div><div id="newsout" class="mt-m" aria-live="polite"></div></div>`,
  after(main){
    const draw=()=>{ const list=D.articles.filter(a=>S.news==="All"||a.cat===S.news); if(!list.length){ $("#newsout").innerHTML=`<div class="empty"><p class="display">No stories yet</p></div>`; return; }
      const [f,...rest]=list;
      $("#newsout").innerHTML=`<div class="stories"><a class="story-feature" href="#story.${f.slug}"><div class="art panel panel-green grain"><span class="grooves spin" aria-hidden="true"></span>${pic(f.photo,{alt:"",sizes:"(min-width:900px) 35vw, 60vw"})}</div><div class="body"><span class="cat">${esc(f.cat)}</span><h2 style="font:400 clamp(28px,3.6vw,44px)/.95 var(--f-display);text-transform:uppercase">${esc(f.title)}</h2><p>${esc(f.summary)}</p><p class="date">${fmt(f.date)}</p></div></a><ul class="story-list">${rest.map(storyItem).join("")||'<li class="muted">No more stories in this category.</li>'}</ul></div>`; reveal($("#newsout")); };
    $$("[data-cat]",main).forEach(b=>b.addEventListener("click",()=>{S.news=b.dataset.cat;$$("[data-cat]",main).forEach(x=>x.setAttribute("aria-pressed",x===b));draw();})); draw();
  }};
};
VIEWS.stories = r => VIEWS.news(r);
VIEWS.story = r => {
  const n=story(r.slug); if(!n) return VIEWS.notfound(r);
  const a=n.artist?artist(n.artist):null; const more=D.articles.filter(x=>x.slug!==n.slug).slice(0,3);
  const relA=[a,...(n.related||[]).map(artist)].filter(Boolean).slice(0,4);
  return { title:n.title, html:`
  <div class="progress" id="prog" aria-hidden="true"></div>
  <article><header class="art-head"><div class="wrap">${crumbs([["Home","#"],["Stories","#stories"],[n.cat]])}<span class="cat">${esc(n.cat)}</span><h1>${esc(n.title)}</h1><p class="summary">${esc(n.summary)}</p><div class="byline"><span>By ${esc(authorName(n))}</span>${n.sample?'<span class="tag tag-example">Sample article</span>':""}<span>${fmtLong(n.date)}</span></div><div class="share-row"><button class="btn btn-ghost btn-sm" type="button" data-share>Share</button><button class="btn btn-ghost btn-sm" type="button" data-copy>Copy link</button></div></div></header>
  <figure class="art-fig"><div class="art panel panel-blue grain"><span class="grooves spin" aria-hidden="true"></span>${pic(n.photo,{sizes:"(min-width:900px) 40vw, 80vw"})}</div></figure>
  <div class="art-body">${n.body.map(p=>`<p>${linkArtists(p)}</p>`).join("")}
    ${n.sources.length?`<div class="sources-box"><h2 class="eyebrow">Sources</h2><ul>${n.sources.map(u=>`<li><a class="link" href="${u}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/,"").slice(0,80))}</a></li>`).join("")}</ul></div>`:`<p class="paid-note">Sample article written to show the layout. Tap any highlighted artist name to see their card.</p>`}</div></article>
  <section class="section" style="background:#fff" aria-labelledby="relh"><div class="wrap"><h2 id="relh" class="display sec-title" style="margin-bottom:32px">Related</h2>
    <div class="two-col">${n.songs.length?`<div><h3 class="eyebrow muted" style="margin-bottom:12px">Songs in this story</h3><ol class="songlist">${n.songs.map(song).filter(Boolean).map(songRow).join("")}</ol></div>`:""}
    ${relA.length?`<div><h3 class="eyebrow muted" style="margin-bottom:12px">Artists</h3><div class="mini-artists">${relA.map((x,i)=>artistCard(x,i+1,"h4")).join("")}</div></div>`:""}</div>
    <h3 class="eyebrow muted mt-l" style="margin-bottom:12px">More stories</h3><ul class="story-list">${more.map(storyItem).join("")}</ul></div></section>`,
  after(main){
    $("[data-share]",main).addEventListener("click",()=>share(document.title)); $("[data-copy]",main).addEventListener("click",()=>copyText(pageUrl()));
    const bar=$("#prog",main), body=$(".art-body",main);
    const upd=()=>{ const rr=body.getBoundingClientRect(); const p=Math.min(1,Math.max(0,(window.innerHeight-rr.top)/(rr.height+window.innerHeight*.3))); bar.style.width=(p*100)+"%"; };
    window.addEventListener("scroll",upd,{passive:true}); cleanup.push(()=>window.removeEventListener("scroll",upd)); upd();
  }};
};

/* ================= EVENTS ================= */
VIEWS.events = () => {
  const towns=["All",...new Set(D.events.map(e=>e.town))], types=["All",...new Set(D.events.map(e=>e.type))];
  const sel=(id,label,opts,val)=>`<div class="field-inline"><label for="${id}">${label}</label><select id="${id}" class="select">${opts.map(o=>`<option value="${esc(o[0])}" ${val===o[0]?"selected":""}>${esc(o[1])}</option>`).join("")}</select></div>`;
  return { title:"Events", html:`
  <header class="phead grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Events"]])}<h1 class="display">Events</h1><p>Concerts, launches, workshops and listening sessions across Sierra Leone.</p><div class="row-wrap" style="margin-top:16px"><button type="button" class="btn btn-green btn-sm" data-notify="Events"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>Get event alerts</button></div></div></header>
  <div class="wrap page">
    <div class="notice notice-info" style="margin-bottom:24px"><strong>Check before you go</strong><span>Venues, times and ticket links are added as organisers confirm them. Details can change, so check with the organiser before you travel.</span></div>
    <div class="filterbar">
      ${sel("ef-when","Date",[["upcoming","All upcoming"],["weekend","This weekend"],["month","Next 30 days"],["past","Past events"]],S.ev.when)}
      ${sel("ef-town","Location",towns.map(t=>[t,t==="All"?"All locations":t]),S.ev.town)}
      ${sel("ef-type","Event type",types.map(t=>[t,t==="All"?"All types":t]),S.ev.type)}
      ${sel("ef-fee","Free / paid",[["All","Free and paid"],["Free","Free"],["Paid","Paid"]],S.ev.fee)}
      <div style="margin-left:auto" class="view-toggle" role="group" aria-label="View"><button type="button" data-view="list" aria-pressed="${S.ev.view==="list"}">List</button><button type="button" data-view="cal" aria-pressed="${S.ev.view==="cal"}">Calendar</button></div>
    </div>
    <p class="count" id="ecount" aria-live="polite"></p><div id="eout" class="mt-s"></div>
  </div>`,
  after(main){
    const filtered=()=>D.events.filter(e=>{ const st=evStatus(e), d=parse(e.date);
      if(S.ev.when==="past"){ if(st!=="completed") return false; } else if(st==="completed") return false;
      if(S.ev.when==="weekend"&&!inWeekend(e)) return false;
      if(S.ev.when==="month"){ const lim=new Date(TODAY); lim.setDate(lim.getDate()+30); if(d>lim) return false; }
      if(S.ev.town!=="All"&&e.town!==S.ev.town) return false; if(S.ev.type!=="All"&&e.type!==S.ev.type) return false;
      if(S.ev.fee==="Free"&&e.paid!==false) return false; if(S.ev.fee==="Paid"&&e.paid!==true) return false; return true; }).sort((a,b)=>S.ev.when==="past"?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
    const draw=()=>{ const list=filtered(); $("#ecount").textContent=`${list.length} event${list.length===1?"":"s"}`;
      $$("[data-view]",main).forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===S.ev.view));
      if(S.ev.view==="list"){ $("#eout").innerHTML=list.length?`<ul class="evlist">${list.map(evRow).join("")}</ul>`:`<div class="empty"><p class="display">No events match</p><p class="muted">Try a different date range or location.</p><button class="btn btn-ghost btn-sm" type="button" id="ereset">Reset filters</button></div>`; const rs=$("#ereset"); if(rs) rs.addEventListener("click",()=>{Object.assign(S.ev,{when:"upcoming",town:"All",type:"All",fee:"All"}); render();}); reveal($("#eout")); }
      else drawCal(list); };
    const drawCal=list=>{
      if(!S.ev.month){ const f=list[0]?parse(list[0].date):TODAY; S.ev.month=[f.getFullYear(),f.getMonth()]; }
      const [y,m]=S.ev.month; const first=new Date(y,m,1); const start=new Date(first); start.setDate(1-((first.getDay()+6)%7));
      let cells=""; for(let i=0;i<42;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const evs=list.filter(e=>e.date===iso); const out=d.getMonth()!==m; const isT=d.getTime()===TODAY.getTime(); if(i>=35&&out&&d.getDate()>6) break;
        cells+=`<div class="cal-cell ${out?"out":""} ${isT?"today":""}"><span class="n">${d.getDate()}</span>${evs.map(e=>{const st=evStatus(e);return `<a class="cal-ev ${st==="cancelled"||st==="postponed"?"off":""}" href="#event.${e.slug}" title="${esc(e.title)} (${STATUS_LABEL[st]})">${esc(e.title)}</a>`;}).join("")}</div>`; }
      const inMonth=list.filter(e=>{const d=parse(e.date);return d.getMonth()===m&&d.getFullYear()===y;});
      $("#eout").innerHTML=`<div class="table-wrap"><div class="cal" style="min-width:560px"><div class="cal-head"><button class="icon-btn" type="button" data-mo="-1" aria-label="Previous month">${ICON.left}</button><h3 aria-live="polite">${MONTHS_L[m]} ${y}</h3><button class="icon-btn" type="button" data-mo="1" aria-label="Next month">${ICON.right}</button></div><div class="cal-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="dow">${d}</div>`).join("")}${cells}</div></div></div><p class="count mt-s">${inMonth.length} event${inMonth.length===1?"":"s"} in ${MONTHS_L[m]}. Cancelled and postponed events are struck through.</p>`;
      $$("[data-mo]").forEach(b=>b.addEventListener("click",()=>{ let [yy,mm]=S.ev.month; mm+= +b.dataset.mo; if(mm<0){mm=11;yy--;} if(mm>11){mm=0;yy++;} S.ev.month=[yy,mm]; drawCal(filtered()); $("[data-mo='"+b.dataset.mo+"']").focus(); })); };
    [["ef-when","when"],["ef-town","town"],["ef-type","type"],["ef-fee","fee"]].forEach(([id,k])=>$("#"+id).addEventListener("change",e=>{S.ev[k]=e.target.value; S.ev.month=null; draw();}));
    $$("[data-view]",main).forEach(b=>b.addEventListener("click",()=>{S.ev.view=b.dataset.view; draw();})); draw();
  }};
};
function icsFor(e){
  if(!e.time){ const day=iso=>iso.replace(/-/g,""), n=parse(e.endDate||e.date); n.setDate(n.getDate()+1);
    const s=day(e.date), en=`${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
    return {start:s,end:en,text:["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Salone Lyrics//Events//EN","BEGIN:VEVENT",`UID:${e.slug}@salonelyrics`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").split(".")[0]}Z`,`DTSTART;VALUE=DATE:${s}`,`DTEND;VALUE=DATE:${en}`,`SUMMARY:${e.title}`,`LOCATION:${e.venue}, ${e.address}`,`DESCRIPTION:${e.desc}`,"END:VEVENT","END:VCALENDAR"].join("\r\n")}; }
  const dt=(d,t)=>d.replace(/-/g,"")+"T"+t.replace(":","")+"00";
  let endD=e.date; if(e.end<e.time){ const n=parse(e.date); n.setDate(n.getDate()+1); endD=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; }
  return {start:dt(e.date,e.time),end:dt(endD,e.end),text:["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Salone Lyrics//Events//EN","BEGIN:VEVENT",`UID:${e.slug}@salonelyrics`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").split(".")[0]}Z`,`DTSTART;TZID=Africa/Freetown:${dt(e.date,e.time)}`,`DTEND;TZID=Africa/Freetown:${dt(endD,e.end)}`,`SUMMARY:${e.title}`,`LOCATION:${e.venue}, ${e.address}`,`DESCRIPTION:${e.desc}`,"END:VEVENT","END:VCALENDAR"].join("\r\n")};
}
VIEWS.event = r => {
  const e=event(r.slug); if(!e) return VIEWS.notfound(r);
  const st=evStatus(e), d=parse(e.date), ics=icsFor(e);
  const g=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${ics.start}/${ics.end}&ctz=Africa/Freetown&location=${encodeURIComponent(e.venue+", "+e.address)}&details=${encodeURIComponent(e.desc)}`;
  const canAdd=st==="upcoming"||st==="sold-out";
  const notice={postponed:`<div class="notice notice-warn"><strong>Postponed</strong><span>${esc(e.newDate||"A new date will be announced.")} Tickets remain valid unless the organiser says otherwise.</span></div>`,cancelled:`<div class="notice notice-err"><strong>Cancelled</strong><span>This event will not take place. Contact the organiser about refunds.</span></div>`,"sold-out":`<div class="notice notice-info"><strong>Sold out</strong><span>All tickets have been sold.</span></div>`,completed:`<div class="notice notice-info"><strong>This event has ended</strong><span>See upcoming events below.</span></div>`}[st]||"";
  return { title:e.title, html:`
  <header class="ev-head grain ${st==="cancelled"||st==="postponed"?"is-off":""}"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">
    <div class="ev-bigdate" aria-hidden="true"><span class="d tnum">${d.getDate()}</span><span class="my">${MONTHS_L[d.getMonth()]}<br>${d.getFullYear()}</span></div>
    <div class="stack">${crumbs([["Home","#"],["Events","#events"],[e.title]])}<div class="row-wrap" style="gap:8px"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="tag">${esc(e.type)}</span>${e.sample?'<span class="tag tag-amber">Sample listing</span>':""}</div><h1 class="display">${esc(e.title)}</h1><p style="font-size:18px">${evDates(e)}${e.time?" · "+esc(evTime(e)):""} · ${esc(e.town)}</p></div>
  </div></header>
  <div class="wrap page"><div class="two-col"><div class="stack" style="gap:24px">${notice}<div class="prose"><p>${esc(e.desc)}</p></div>
    <dl class="detail-list"><div><dt>Date</dt><dd>${evDates(e)}</dd></div><div><dt>Time</dt><dd>${e.time?`${esc(e.time)}${e.end?" to "+esc(e.end):""} (Freetown time)`:"To be announced"}</dd></div><div><dt>Venue</dt><dd>${esc(e.venue)}<br><span class="muted">${esc(e.address)}</span></dd></div><div><dt>Lineup</dt><dd>${esc(e.lineup)}</dd></div><div><dt>Organiser</dt><dd>${esc(e.organiser)}</dd></div><div><dt>Tickets</dt><dd>${esc(e.paid===false?"Free entry":e.price)}</dd></div></dl></div>
  <aside class="stack" style="align-content:start;gap:16px">
    <div class="aside-box"><h2>Tickets</h2><button class="btn btn-primary" type="button" aria-disabled="true">${st==="cancelled"||st==="completed"?"Tickets unavailable":st==="sold-out"?"Sold out":"Booking link pending"}</button>${st==="upcoming"?'<p class="paid-note">The organiser’s external booking link appears here once supplied.</p>':""}</div>
    <div class="aside-box"><h2>Add to calendar</h2>${canAdd?`<a class="btn btn-ghost btn-sm" href="${g}" target="_blank" rel="noopener">Google Calendar</a><button class="btn btn-ghost btn-sm" type="button" data-ics>Download .ics file</button><p class="paid-note">For Apple Calendar and Outlook. If your browser blocks the download, use Copy details.</p>`:`<p class="muted" style="font-size:14px">Not available for ${STATUS_LABEL[st].toLowerCase()} events.</p>`}<button class="btn btn-ghost btn-sm" type="button" data-copyd>Copy details</button></div>
    <div class="aside-box"><h2>Share</h2><button class="btn btn-ghost btn-sm" type="button" data-share>Share event</button></div>
  </aside></div>
  <section class="section" style="padding-bottom:0"><h2 class="display" style="font-size:36px;margin-bottom:16px">More events</h2><ul class="evlist">${D.events.filter(x=>x.slug!==e.slug&&evStatus(x)==="upcoming").slice(0,3).map(evRow).join("")}</ul></section></div>`,
  after(main){
    const ib=$("[data-ics]",main); if(ib) ib.addEventListener("click",()=>{ try{ const u=URL.createObjectURL(new Blob([ics.text],{type:"text/calendar"})); const a=document.createElement("a"); a.href=u; a.download=e.slug+".ics"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),2000); toast("Calendar file prepared"); }catch(err){ toast("Download blocked. Use Copy details instead."); } });
    $("[data-copyd]",main).addEventListener("click",()=>copyText(`${e.title}\n${evDates(e)}${e.time?", "+evTime(e):""}\n${e.venue}, ${e.address}`,"Event details copied"));
    $("[data-share]",main).addEventListener("click",()=>share(document.title));
  }};
};

/* ================= VIDEOS ================= */
VIEWS.videos = () => ({ title:"Videos", html:`
  <header class="phead charcoal grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Videos"]])}<h1 class="display">Videos</h1><p>Lyric videos created by Salone Lyrics. Each player loads only when you press play.</p></div></header>
  <div class="wrap page"><div class="vid-grid" id="vout">${D.videos.map(vidCard).join("")}</div><p class="paid-note mt-m">Videos play from TikTok. Once you press play, TikTok may set its own cookies. <a class="link" href="https://www.tiktok.com/@salonelyrics" target="_blank" rel="noopener">Follow Salone Lyrics on TikTok</a>.</p></div>`,
  after(main){ bindVideos(main); } });

/* ================= GALLERY ================= */
const GAL_BG=["panel-blue","panel-green","panel-charcoal","panel-paper"];
const galItem=(k,i,col="")=>`<button class="gal-item panel ${GAL_BG[i%4]} grain reveal" type="button" data-photo="${k}" data-col="${col}" aria-label="Open photo: ${esc(P[k].alt)}">${pic(k,{alt:"",sizes:"(min-width:768px) 24vw, 46vw"})}</button>`;
VIEWS.gallery = () => { const list=ARTISTS().filter(a=>a.photo&&SONGS().some(s=>s.artist===a.slug||s.featA===a.slug)); return { title:"Gallery", html:`
  <header class="phead green grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Gallery"]])}<h1 class="display">Gallery</h1><p>Portraits of the artists whose songs are on Salone Lyrics. Choose an artist to see their profile and lyrics.</p></div></header>
  <div class="wrap page"><section aria-labelledby="g-artists"><div class="sec-head" style="margin-bottom:16px"><h2 id="g-artists" class="display" style="font-size:clamp(28px,4vw,44px)">Artists on Salone Lyrics</h2><span class="count">${list.length} artists</span></div>
    <div class="gal-grid">${list.map((a,i)=>`<figure class="gal-card reveal"><a class="gal-item panel ${GAL_BG[i%4]} grain" href="#artist.${a.slug}" aria-label="${esc(a.name)}: artist profile">${pic(a.photo,{alt:"",sizes:"(min-width:768px) 24vw, 46vw"})}</a><figcaption><a class="gal-name" href="#artist.${a.slug}">${esc(a.name)}</a><a class="arrow-link" href="#artist.${a.slug}.music">View lyrics</a></figcaption></figure>`).join("")}</div></section></div>` }; };
function bindGallery(root){ $$(".gal-item",root).forEach(b=>b.addEventListener("click",()=>{ const col=b.dataset.col; const list=col?D.gallery.find(g=>g.slug===col).items:[b.dataset.photo]; openLightbox(list,list.indexOf(b.dataset.photo),b); })); }
let lb={list:[],i:0,opener:null};
function openLightbox(list,i,opener){ lb={list,i,opener}; $("#lightbox").hidden=false; document.body.classList.add("locked"); drawLB(); $("#lb-close").focus(); }
function drawLB(){ const k=lb.list[lb.i], p=P[k];
  $("#lb-fig").innerHTML=`<div class="bg panel ${GAL_BG[lb.i%4]}">${pic(k,{sizes:"80vw",eager:true})}</div>`;
  $("#lb-cap").innerHTML=`<span>${esc(p.alt)}</span>`;
  $("#lb-count").textContent=`${lb.i+1} of ${lb.list.length}`; $$(".lb-nav").forEach(n=>n.hidden=lb.list.length<2); }
function closeLB(){ $("#lightbox").hidden=true; document.body.classList.remove("locked"); if(lb.opener) lb.opener.focus(); }
function lbStep(d){ lb.i=(lb.i+d+lb.list.length)%lb.list.length; drawLB(); }

/* ================= PROMOTE ================= */
VIEWS.promote = () => ({ title:"Promote With Us", html:`
  <section class="promo grain on-dark"><div class="promo-copy">${crumbs([["Home","#"],["Promote With Us"]])}<h1 class="display" style="font-size:clamp(44px,8vw,96px);line-height:.9">Promote <em style="font-style:normal;color:var(--green)">with us</em></h1><p>Put your music, profile or event in front of fans who come to Salone Lyrics to read, watch and discover. Every paid placement is clearly labelled Promoted.</p><div class="row-wrap"><a class="btn btn-green" href="#promote" data-jump="#enquiry">Request a Quote</a><a class="arrow-link" style="color:#fff" href="#promote" data-jump="#services">Compare services</a></div></div>
  <div class="promo-art panel"><span class="grooves spin" aria-hidden="true"></span><div class="floaty">${pic("p-alpha",{cls:"cut cut-shadow",eager:true,sizes:"(min-width:900px) 40vw, 80vw"})}</div></div></section>
  ${marquee(["Profiles","Releases","Spotlight","Events","Social","Campaigns"])}
  <section class="section" aria-labelledby="ours-h"><div class="wrap"><div class="numsvc">
    <div class="stack reveal" style="align-content:start;gap:16px"><span class="side-tag">What we do</span><h2 id="ours-h" class="display sec-title">Our <span class="hl">services</span></h2><p class="muted" style="max-width:44ch">Choose one placement or combine them into a campaign. The team replies with options and timing.</p>
      <ol class="num-list">${D.services.map((s,i)=>`<li><a href="#promote" data-pick="${s.id}"><span class="no tnum">${String(i+1).padStart(2,"0")}</span><span class="nm">${esc(s.name)}</span><span class="ar" aria-hidden="true">${ICON.arrow}</span></a></li>`).join("")}</ol></div>
    <div class="numsvc-art reveal"><div class="panel panel-charcoal grain numsvc-photo"><span class="grooves spin" aria-hidden="true"></span>${pic("p-chernor",{sizes:"(min-width:900px) 40vw, 90vw",alt:""})}</div>
      <div class="numsvc-cards"><a class="mini-card" href="#promote" data-jump="#services"><span>Ever wondered how a feature comes together?</span><strong>See how it works ${ICON.arrow}</strong></a><a class="mini-card green" href="#promote" data-jump="#enquiry"><span>Ready to bring your release to more fans?</span><strong>Talk to the team ${ICON.arrow}</strong></a></div></div>
  </div></div></section>
  ${svcCarousel("Every placement","Swipe or use the arrows. Cards move on their own; hover or focus to pause.")}
  <section class="section" id="services" aria-labelledby="svc-h"><div class="wrap"><div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Compare</p><h2 id="svc-h" class="display sec-title">Side by side</h2></div><p class="muted">Prices depend on timing and scope. Request a quote and the team will reply with options.</p></div>
    <div class="svc-table-wrap" tabindex="0" role="region" aria-label="Promotion services comparison, scrollable"><table class="svc-table"><thead><tr><th scope="col">Service</th><th scope="col">What it is</th><th scope="col">Deliverables</th><th scope="col">Placement duration</th><th scope="col"><span class="sr">Action</span></th></tr></thead><tbody>
    ${D.services.map(s=>`<tr><th scope="row">${esc(s.name)}</th><td>${esc(s.what)}</td><td><ul>${s.gets.map(g=>`<li>${esc(g)}</li>`).join("")}</ul></td><td>${esc(s.duration)}</td><td><button class="btn btn-ghost btn-sm" type="button" data-pick="${s.id}">Request a Quote</button></td></tr>`).join("")}
    </tbody></table></div><p class="paid-note">Durations are proposed defaults and should be confirmed by the Salone Lyrics team before launch.</p></div></section>
  <section class="section" style="background:#fff;padding-top:64px" id="enquiry" aria-labelledby="enq-h"><div class="wrap"><div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Four quick steps</p><h2 id="enq-h" class="display sec-title">Promotion enquiry</h2></div></div><div class="wizard" id="wizard"></div></div></section>`,
  after(main){
    $$("[data-jump]",main).forEach(a=>a.addEventListener("click",e=>{e.preventDefault(); $(a.dataset.jump).scrollIntoView({behavior:REDUCED?"auto":"smooth"});}));
    $$("[data-pick],[data-svc]",main).forEach(b=>b.addEventListener("click",e=>{ e.preventDefault(); S.wiz.data.service=b.dataset.pick||b.dataset.svc; S.wiz.step=1; drawWiz(); $("#enquiry").scrollIntoView({behavior:REDUCED?"auto":"smooth"}); setTimeout(()=>{const r=$(`input[value="${S.wiz.data.service}"]`); if(r) r.focus({preventScroll:true});},400); }));
    drawWiz();
    if(S.jumpEnquiry){ S.jumpEnquiry=false; setTimeout(()=>$("#enquiry").scrollIntoView(),50); }
  }});
const STEP_NAMES=["Service","Details","Links & materials","Review"];
function drawWiz(focusHead){
  const W=S.wiz, d=W.data, el=$("#wizard"); if(!el) return;
  const steps=`<ol class="steps" aria-label="Progress">${STEP_NAMES.map((n,i)=>`<li class="${i+1<W.step?"done":""}" ${i+1===W.step?'aria-current="step"':""}><span class="n">${i+1<W.step?"✓":i+1}</span><span class="l">${n}</span><span class="sr">${i+1<W.step?" (completed)":i+1===W.step?" (current step)":""}</span></li>`).join("")}</ol>`;
  const f=(id,label,{type="text",req=false,hint="",full=false,ac="",ta=false}={})=>`<div class="field ${full?"full":""}"><label for="w-${id}">${label}${req?' <span class="req" aria-hidden="true">*</span><span class="sr">(required)</span>':""}</label>${ta?`<textarea id="w-${id}" class="input" ${req?"required":""} aria-describedby="w-${id}-h w-${id}-e">${esc(d[id]||"")}</textarea>`:`<input id="w-${id}" class="input" type="${type}" ${ac?`autocomplete="${ac}"`:""} ${req?"required":""} value="${esc(d[id]||"")}" aria-describedby="w-${id}-h w-${id}-e">`}<p class="hint" id="w-${id}-h">${hint}</p><p class="err" id="w-${id}-e" hidden></p></div>`;
  let body="";
  if(W.step===1) body=`<fieldset style="border:0;padding:0;margin:0" class="stack"><legend class="sr">Choose a service</legend><h3>Choose a service</h3><p class="muted">Pick the option closest to what you need. You can add notes in the next step.</p><div class="svc-opts">${D.services.map(s=>`<label class="svc-opt"><input type="radio" name="svc" value="${s.id}" ${d.service===s.id?"checked":""}><strong>${esc(s.name)}</strong><span>${esc(s.what)}</span></label>`).join("")}</div><p class="err" id="w-svc-e" hidden role="alert"></p></fieldset>`;
  if(W.step===2){ const isEv=d.service==="event"; body=`<h3>${isEv?"Event":"Artist"} details</h3><div class="fgrid">${f("name",isEv?"Event name":"Artist or stage name",{req:true})}${f("contact","Your name",{req:true,ac:"name"})}${f("email","Email",{type:"email",req:true,ac:"email",hint:"We reply to this address."})}${f("phone","Phone or WhatsApp",{type:"tel",ac:"tel",hint:"Optional. Include the country code, for example +232."})}${isEv?f("evdate","Event date",{type:"date",req:true})+f("venue","Venue and town",{req:true}):f("genre","Genre",{hint:"For example Afrobeats, gospel or hip-hop."})+f("start","Preferred start date",{type:"date",hint:"Optional."})}${f("about",isEv?"About the event":"Tell us about the release or project",{req:true,full:true,ta:true,hint:"Two or three sentences is enough."})}</div>`; }
  if(W.step===3) body=`<h3>Links &amp; materials</h3><div class="fgrid">${f("links","Official links",{req:true,full:true,ta:true,hint:"One per line: streaming, YouTube, Instagram, TikTok or ticket links."})}
    <div class="field full"><span style="font-weight:600;font-size:14px" id="up-l">Photos, artwork or press kit</span><div class="drop" id="drop"><p style="font-size:14px">Drag files here or <label for="w-files" class="link" style="cursor:pointer">choose files</label>.</p><input id="w-files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg" class="sr" aria-labelledby="up-l" aria-describedby="up-h"><p class="hint" id="up-h">JPG, PNG, WebP, PDF or MP3. Up to 5 files, 10 MB each. An editor reviews materials; nothing is published automatically.</p><ul class="files" id="flist"></ul></div><p class="err" id="w-files-e" hidden role="alert"></p></div></div>`;
  if(W.step===4){ const svc=D.services.find(s=>s.id===d.service); const rows=[["Service",svc&&svc.name,1],[d.service==="event"?"Event":"Artist",d.name,2],["Contact",`${d.contact||""}, ${d.email||""}${d.phone?", "+d.phone:""}`,2],...(d.service==="event"?[["Date & venue",`${d.evdate?fmt(d.evdate):""}, ${d.venue||""}`,2]]:[["Genre",d.genre||"Not given",2]]),["About",d.about,2],["Links",(d.links||"").split(/\n+/).filter(Boolean).join(", "),3],["Files",d.files.length?d.files.map(x=>x.name).join(", "):"None",3]];
    body=`<h3>Review and submit</h3><p class="muted">Check your details. Use Edit to change anything.</p><dl class="review">${rows.map(([k,v,s])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd><button type="button" data-goto="${s}" aria-label="Edit ${k}">Edit</button></div>`).join("")}</dl>
    <div class="field"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:400"><input type="checkbox" id="w-consent" ${d.consent?"checked":""} style="width:20px;height:20px;margin-top:3px;accent-color:var(--charcoal)"><span>I confirm I have permission to share these materials and agree that Salone Lyrics may contact me about this enquiry. <span class="req">*</span></span></label><p class="err" id="w-consent-e" hidden role="alert"></p></div>
    <label style="display:flex;gap:10px;align-items:center;font-size:13px;color:var(--muted)"><input type="checkbox" id="w-fail" ${W.fail?"checked":""} style="width:18px;height:18px">Prototype only: simulate a connection failure to preview the error state</label><div id="w-status" aria-live="assertive"></div>`; }
  if(W.step===5){ el.innerHTML=`<div class="wiz-body confirm"><span class="tag tag-green">Enquiry prepared</span><p class="display">Tenki, ${esc(d.contact||"")}!</p><p style="max-width:56ch">Your ${esc(D.services.find(s=>s.id===d.service).name.toLowerCase())} enquiry for <strong>${esc(d.name)}</strong> is complete.</p><div class="refbox">Reference ${W.ref}</div><div class="notice notice-warn" style="max-width:640px"><strong>Prototype notice: this enquiry has not been sent</strong><span>This preview is not connected to the Salone Lyrics inbox, so nobody has received it and no payment has been taken. When the website goes live, the team will reply to ${esc(d.email)}. For now, copy the summary and send it to Salone Lyrics on Instagram or TikTok.</span></div><div class="row-wrap"><button class="btn btn-primary" type="button" id="w-copy">Copy summary</button><a class="btn btn-ghost" href="https://www.instagram.com/salonelyrics/" target="_blank" rel="noopener">Open Instagram</a><button class="btn btn-ghost" type="button" id="w-new">Start a new enquiry</button></div></div>`;
    $("#w-copy").addEventListener("click",()=>copyText(`Salone Lyrics enquiry ${W.ref}\nService: ${D.services.find(s=>s.id===d.service).name}\nName: ${d.name}\nContact: ${d.contact}, ${d.email} ${d.phone||""}\nAbout: ${d.about}\nLinks: ${d.links}`,"Summary copied"));
    $("#w-new").addEventListener("click",()=>{ S.wiz={step:1,data:{service:"",files:[],links:""},fail:false}; drawWiz(true); });
    const h=$(".display",el); h.tabIndex=-1; h.focus(); return; }
  el.innerHTML=steps+`<form class="wiz-body" id="wform" novalidate>${body}</form><div class="wiz-foot">${W.step>1?`<button class="btn btn-ghost" type="button" id="w-back">Back</button>`:"<span></span>"}<button class="btn ${W.step===4?"btn-green":"btn-primary"}" type="button" id="w-next">${W.step===4?"Submit enquiry":"Continue"}</button></div>`;
  const save=()=>{ $$("#wform input.input, #wform textarea").forEach(i=>{ d[i.id.slice(2)]=i.value; }); const r=$("input[name=svc]:checked"); if(r) d.service=r.value; const c=$("#w-consent"); if(c) d.consent=c.checked; const fl=$("#w-fail"); if(fl) W.fail=fl.checked; };
  $$("#wform input, #wform textarea").forEach(i=>i.addEventListener("input",save)); $$("#wform input[type=radio]").forEach(i=>i.addEventListener("change",save));
  if(W.step===3) bindUploads();
  $$("[data-goto]",el).forEach(b=>b.addEventListener("click",()=>{ save(); W.step=+b.dataset.goto; drawWiz(true); }));
  const back=$("#w-back"); if(back) back.addEventListener("click",()=>{ save(); W.step--; drawWiz(true); });
  $("#w-next").addEventListener("click",()=>{ save(); if(!validate()) return; if(W.step<4){ W.step++; drawWiz(true); } else submit(); });
  $("#wform").addEventListener("submit",e=>{e.preventDefault(); $("#w-next").click();});
  if(focusHead){ const h=$("h3",el); h.tabIndex=-1; h.focus({preventScroll:true}); el.scrollIntoView({block:"start",behavior:REDUCED?"auto":"smooth"}); }
}
function validate(){
  const W=S.wiz,d=W.data; let first=null;
  const err=(id,msg,inputId)=>{ const e=$("#w-"+id+"-e"); if(e){e.hidden=!msg; e.textContent=msg||"";} const inp=$("#w-"+(inputId||id)); if(inp) inp.setAttribute("aria-invalid",!!msg); if(msg&&!first) first=inp||$("input[name=svc]"); };
  if(W.step===1){ err("svc",d.service?"":"Choose a service to continue."); if(!d.service){ $("input[name=svc]").focus(); return false; } return true; }
  if(W.step===2){ const req=["name","contact","email","about"].concat(d.service==="event"?["evdate","venue"]:[]);
    const labels={name:d.service==="event"?"the event name":"the artist name",contact:"your name",email:"your email",about:"a short description",evdate:"the event date",venue:"the venue and town"};
    req.forEach(k=>{ if(!(d[k]||"").trim()) err(k,`Enter ${labels[k]}.`); else err(k,""); });
    if(d.email && !/^\S+@\S+\.\S+$/.test(d.email)) err("email","Enter an email address like name@example.com.");
    if(d.phone && !/^[+()\d\s-]{6,}$/.test(d.phone)) err("phone","Use digits, spaces and an optional + only.");
    if(d.service==="event" && d.evdate && parse(d.evdate)<TODAY) err("evdate","Choose a date that has not passed."); }
  if(W.step===3){ const links=(d.links||"").split(/\n+/).map(s=>s.trim()).filter(Boolean);
    if(!links.length) err("links","Add at least one official link.");
    else if(links.some(l=>!/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(l))) err("links","Check each line is a web link, for example https://www.tiktok.com/@yourname.");
    else err("links","");
    if(d.files.some(f=>f.state==="reading")) err("files","Wait for files to finish preparing."); }
  if(W.step===4){ if(!d.consent) err("consent","Tick the box to confirm permission.","consent"); else err("consent","","consent"); }
  if(first){ first.focus(); return false; } return true;
}
function bindUploads(){
  const d=S.wiz.data, list=$("#flist"), input=$("#w-files"), drop=$("#drop"); const MAX=10*1024*1024, OK=/^(image\/(jpeg|png|webp)|application\/pdf|audio\/mpeg)$/;
  const draw=()=>{ list.innerHTML=d.files.map((f,i)=>`<li><span class="name">${esc(f.name)} <span class="muted">(${(f.size/1048576).toFixed(1)} MB)</span></span><button class="rm" type="button" data-rm="${i}" aria-label="Remove ${esc(f.name)}">Remove</button>${f.state==="reading"?`<progress max="100" value="${f.pct}" aria-label="Preparing ${esc(f.name)}">${f.pct}%</progress>`:`<span class="hint" style="grid-column:1/-1">${f.state==="error"?"Could not read this file. Remove it and try again.":"Ready to send with your enquiry"}</span>`}</li>`).join("");
    $$("[data-rm]",list).forEach(b=>b.addEventListener("click",()=>{ d.files.splice(+b.dataset.rm,1); draw(); input.focus(); })); };
  const add=files=>{ const e=$("#w-files-e"); const msgs=[];
    Array.from(files).forEach(file=>{ if(d.files.length>=5){ msgs.push("You can add up to 5 files."); return; } if(!OK.test(file.type)){ msgs.push(`${file.name}: this file type is not accepted.`); return; } if(file.size>MAX){ msgs.push(`${file.name}: larger than 10 MB.`); return; }
      const rec={name:file.name,size:file.size,state:"reading",pct:0}; d.files.push(rec); draw();
      const fr=new FileReader(); fr.onprogress=ev=>{ if(ev.lengthComputable){ rec.pct=Math.round(ev.loaded/ev.total*100); const p=list.children[d.files.indexOf(rec)]; if(p&&$("progress",p)) $("progress",p).value=rec.pct; } };
      fr.onload=()=>{ rec.state="ready"; rec.pct=100; draw(); }; fr.onerror=()=>{ rec.state="error"; draw(); }; fr.readAsArrayBuffer(file); });
    e.hidden=!msgs.length; e.textContent=msgs.join(" "); };
  input.addEventListener("change",()=>{ add(input.files); input.value=""; });
  ["dragenter","dragover"].forEach(t=>drop.addEventListener(t,ev=>{ev.preventDefault();drop.classList.add("over");}));
  ["dragleave","drop"].forEach(t=>drop.addEventListener(t,ev=>{ev.preventDefault();drop.classList.remove("over");}));
  drop.addEventListener("drop",ev=>add(ev.dataTransfer.files)); draw();
}
function submit(){
  const W=S.wiz, btn=$("#w-next"), st=$("#w-status");
  btn.disabled=true; btn.textContent="Submitting…"; st.innerHTML=`<div class="sloading" role="status"><span class="spin" aria-hidden="true"></span>Preparing your enquiry…</div>`;
  setTimeout(()=>{ if(W.fail){ btn.disabled=false; btn.textContent="Try again"; st.innerHTML=`<div class="notice notice-err"><strong>We couldn’t submit your enquiry</strong><span>The connection failed. Your details are still here. Untick the simulation box and press Try again.</span></div>`; const n=st.querySelector(".notice"); n.tabIndex=-1; n.focus(); return; }
    W.ref="SL-"+Date.now().toString(36).slice(-5).toUpperCase(); W.step=5; drawWiz(); },1100);
}

/* ================= ABOUT / CONTACT / CREDITS ================= */
VIEWS.about = () => ({ title:"About", html:`
  <header class="phead paper"><div class="wrap">${crumbs([["Home","#"],["About"]])}<h1 class="display">About Salone Lyrics</h1><p>A home for Sierra Leonean music discovery. Aw di bodi? Welcome.</p></div></header>
  <div class="wrap page">
    <div class="ideas"><div class="stack reveal" style="align-content:start"><h2 class="display sec-title">Turning words into culture</h2></div><p class="muted reveal" style="max-width:52ch">Salone Lyrics publishes the words to Sierra Leonean songs and introduces the artists who write them. What started on Facebook, Instagram and TikTok now has a home where fans read lyrics, explore biographies, find events and watch videos in one place.</p></div>
    <div class="ideas-art"><div class="ia-1 panel panel-blue grain reveal"><span class="grooves spin" aria-hidden="true"></span>${pic("r-incredible-jj",{sizes:"(min-width:900px) 55vw, 90vw",alt:""})}<span class="ia-tag">A Salone music platform</span></div><div class="ia-2 panel panel-green grain reveal">${pic("r-boii",{sizes:"(min-width:900px) 35vw, 90vw",alt:""})}</div></div>
    <div class="about-split mt-l"><div class="prose reveal"><h2 class="display" style="font-size:32px">How we check lyrics</h2><p>Lyrics and credits are confirmed with the artist or their team before publication.</p></div><div class="prose reveal"><h2 class="display" style="font-size:32px">Promoted content</h2><p>Paid placements are always labelled Promoted. Promotion never appears inside lyric text.</p></div></div>
    <section class="mt-l" aria-labelledby="team-a"><div class="sec-head"><h2 id="team-a" class="display sec-title">Meet the team</h2></div>${teamGrid()}</section>
    
  </div>` });
VIEWS.contact = () => ({ title:"Contact", html:`
  <header class="phead charcoal"><div class="wrap">${crumbs([["Home","#"],["Contact"]])}<h1 class="display">Contact</h1><p>Questions, corrections, partnerships, press or writing for Salone Lyrics. For paid placements, use the promotion enquiry.</p></div></header>
  <div class="wrap page"><div class="two-col"><form id="cform" class="stack" novalidate style="max-width:640px">
    <div class="fgrid"><div class="field"><label for="cf-n">Name <span class="req">*</span></label><input id="cf-n" class="input" autocomplete="name" required><p class="err" id="cf-n-e" hidden></p></div><div class="field"><label for="cf-e">Email <span class="req">*</span></label><input id="cf-e" class="input" type="email" autocomplete="email" required><p class="err" id="cf-e-e" hidden></p></div>
    <div class="field full"><label for="cf-t">Topic</label><select id="cf-t" class="select"><option>General question</option><option>Lyrics submission or correction</option><option>Write for Salone Lyrics</option><option>Press and interviews</option><option>Partnership</option></select></div>
    <div class="field full"><label for="cf-m">Message <span class="req">*</span></label><textarea id="cf-m" class="input" required></textarea><p class="err" id="cf-m-e" hidden></p></div></div>
    <div><button class="btn btn-primary" type="submit">Send message</button></div><div id="cf-msg" aria-live="polite"></div></form>
    <aside class="stack" style="align-content:start"><div class="aside-box"><h2>Follow Salone Lyrics</h2><a class="arrow-link" href="https://www.facebook.com/Vibesalone/" target="_blank" rel="noopener">Facebook</a><a class="arrow-link" href="https://www.instagram.com/salonelyrics/" target="_blank" rel="noopener">Instagram @salonelyrics</a><a class="arrow-link" href="https://www.tiktok.com/@salonelyrics" target="_blank" rel="noopener">TikTok @salonelyrics</a></div><div class="aside-box"><h2>Promote your music</h2><a class="btn btn-green" href="#promote">Promote With Us</a></div></aside></div></div>`,
  after(main){ $("#cform",main).addEventListener("submit",e=>{ e.preventDefault(); let first=null;
    [["cf-n","Enter your name."],["cf-e","Enter your email."],["cf-m","Write a short message."]].forEach(([id,m])=>{ const el=$("#"+id); let bad=!el.value.trim(); if(id==="cf-e"&&!bad&&!/^\S+@\S+\.\S+$/.test(el.value)){bad=true;m="Enter an email address like name@example.com.";} el.setAttribute("aria-invalid",bad); $("#"+id+"-e").hidden=!bad; $("#"+id+"-e").textContent=m; if(bad&&!first) first=el; });
    if(first){first.focus();return;}
    $("#cf-msg").innerHTML=`<div class="notice notice-info"><strong>Message ready</strong><span>This preview isn’t connected to an inbox yet, so your message has not been sent. Please reach Salone Lyrics on Facebook, Instagram or TikTok for now.</span></div>`; }); } });
VIEWS.notfound = () => ({ title:"Page not found", html:`<div class="wrap page"><div class="empty" style="margin-block:64px"><h1 class="display" style="font-size:48px">Page not found</h1><p class="muted">The page may have moved. Try searching for a song or artist.</p><div class="row-wrap" style="justify-content:center"><button class="btn btn-primary" type="button" data-open-search-btn>Search</button><a class="btn btn-ghost" href="#">Go home</a></div></div></div>` });

/* ================= SEARCH ================= */
function authorName(n){ const t=D.team.find(x=>x.id===n.author); return n.sample&&t?`${t.sampleName} (sample byline)`:"Salone Lyrics Editorial"; }
function linkArtists(text){
  let out=esc(text); const done=new Set();
  ARTISTS().filter(a=>a.photo).sort((x,y)=>y.name.length-x.name.length).forEach(a=>{ const re=new RegExp("(^|[^\\w>])("+a.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")(?![\\w<])"); if(!done.has(a.slug)&&re.test(out)){ out=out.replace(re,`$1<button type="button" class="peek" data-peek="${a.slug}" aria-haspopup="dialog">$2</button>`); done.add(a.slug);} });
  return out;
}
const SUGGEST=[["song","crush"],["artist","drizilik"],["story","hottest-2025"],["artist","boii"]];
function searchIndex(q){
  q=q.trim().toLowerCase(); const out={Songs:[],Artists:[],Stories:[],Events:[]}; if(!q) return out;
  const hit=s=>(s||"").toLowerCase().includes(q);
  D.songs.forEach(s=>{ const a=artist(s.artist); const score=hit(s.title)?3:(hit(a.name)||hit(s.feat))?2:0;
    if(score){ out.Songs.push({score,kind:"song",slug:s.slug,t:s.title+(s.demo?" (demo)":""),s:`${s.demo?"Lyric reader demo":a.name+(s.feat?" feat. "+s.feat:"")} · ${s.genre}`,photo:a.photo,an:a}); return; }
    if(s.lyrics){ for(const [,lines] of s.lyrics){ const l=lines.find(hit); if(l){ out.Songs.push({score:1,kind:"song",slug:s.slug,t:s.title+(s.demo?" (demo)":""),s:`“${l}”`,photo:a.photo,an:a}); break; } } } });
  ARTISTS().forEach(a=>{ if(hit(a.name)||hit(a.aka)||hit(a.genre)||hit(a.town)) out.Artists.push({score:hit(a.name)?3:1,kind:"artist",slug:a.slug,t:a.name,s:`${a.genre} · ${a.town}`,photo:a.photo,an:a}); });
  D.articles.forEach(n=>{ if(hit(n.title)||hit(n.summary)||hit(n.cat)) out.Stories.push({score:hit(n.title)?2:1,kind:"story",slug:n.slug,t:n.title,s:`${n.cat} · ${fmt(n.date)}`,photo:n.photo}); });
  D.events.forEach(e=>{ if(hit(e.title)||hit(e.town)||hit(e.type)) out.Events.push({score:hit(e.title)?2:1,kind:"event",slug:e.slug,t:e.title,s:`${fmt(e.date)} · ${e.town} · ${STATUS_LABEL[evStatus(e)]}`,date:e.date}); });
  Object.values(out).forEach(a=>a.sort((x,y)=>y.score-x.score)); return out;
}
function hl(text,q){ if(!q) return esc(text); const i=text.toLowerCase().indexOf(q.toLowerCase()); if(i<0) return esc(text); return esc(text.slice(0,i))+"<mark>"+esc(text.slice(i,i+q.length))+"</mark>"+esc(text.slice(i+q.length)); }
function sItem(it,q,idx){
  const th = it.kind==="event" ? `<span class="th type" style="background:var(--blue-deep)">${parse(it.date).getDate()}</span>` : it.photo ? `<span class="th panel ${panelCls(idx)}">${pic(it.photo,{sizes:"48px",alt:""})}</span>` : `<span class="th type" style="background:var(--charcoal)">${esc(initials(it.an?it.an.name:it.t))}</span>`;
  return `<a class="sitem" role="option" id="opt-${it.kind}-${it.slug}" href="#${it.kind}.${it.slug}" aria-selected="false" tabindex="-1">${th}<span style="min-width:0"><span class="t">${hl(it.t,q)}</span><br><span class="s">${hl(it.s,q)}</span></span><span class="k">${it.kind==="story"?"Story":it.kind[0].toUpperCase()+it.kind.slice(1)}</span></a>`;
}
let sTimer,sSel=-1,sOpener=null;
function openSearch(q){ const dlg=$("#sdlg"), inp=$("#sq"); sOpener=document.activeElement; dlg.hidden=false; document.body.classList.add("locked"); inp.value=q!=null?q:S.search.q; S.search.q=inp.value; runSearch(true); inp.focus({preventScroll:true}); inp.select(); setTimeout(()=>{ if(document.activeElement!==inp){ inp.focus(); inp.select(); } },30); }
window.SLsearch=()=>openSearch();
function closeSearch(restore=true){ $("#sdlg").hidden=true; document.body.classList.remove("locked"); if(restore&&sOpener&&sOpener.focus) sOpener.focus(); }
function runSearch(immediate){
  const q=$("#sq").value, res=$("#sres"); $("#sclear").hidden=!q; S.search.q=q; sSel=-1; $("#sq").setAttribute("aria-activedescendant",""); clearTimeout(sTimer);
  if(!q.trim()){ res.innerHTML=`<div class="sgroup" role="group" aria-label="Editor suggestions"><h3>Editor suggestions</h3>${SUGGEST.map(([k,s],i)=>{ const o=k==="song"?song(s):k==="artist"?artist(s):story(s); const a=k==="song"?artist(o.artist):k==="artist"?o:null;
      return sItem({kind:k,slug:s,t:o.title||o.name,s:k==="song"?a.name:k==="artist"?o.genre:o.cat,photo:k==="song"?a.photo:o.photo,an:a},"",i); }).join("")}</div>`; return; }
  res.innerHTML=`<div class="sloading" role="status"><span class="spin" aria-hidden="true"></span>Searching…</div>`;
  sTimer=setTimeout(()=>{ const out=searchIndex(q); const total=Object.values(out).reduce((n,a)=>n+a.length,0);
    $("#s-live").textContent=total?`${total} result${total===1?"":"s"} for ${q}`:`No results for ${q}`;
    if(!total){ res.innerHTML=`<div class="snone"><p class="display">No matches for “${esc(q)}”</p><p class="muted">Check the spelling or search by artist name. Krio spellings vary, so try another spelling too.</p><div class="row-wrap"><a class="btn btn-ghost btn-sm" href="#lyrics" data-close>Browse songs</a><a class="btn btn-ghost btn-sm" href="#artists" data-close>Browse artists</a></div></div>`; $$("[data-close]",res).forEach(a=>a.addEventListener("click",()=>closeSearch(false))); return; }
    let i=0; res.innerHTML=Object.entries(out).filter(([,a])=>a.length).map(([g,a])=>`<div class="sgroup" role="group" aria-label="${g}"><h3>${g} <span class="tnum">(${a.length})</span></h3>${a.slice(0,5).map(it=>sItem(it,q,i++)).join("")}</div>`).join(""); }, immediate?0:260);
}
function bindSearchUI(){
  const inp=$("#sq"); inp.addEventListener("input",()=>runSearch(false));
  $("#sclear").addEventListener("click",()=>{ inp.value=""; runSearch(true); inp.focus(); });
  $("#sdlg .scrim").addEventListener("click",()=>closeSearch()); $("#sclose").addEventListener("click",()=>closeSearch());
  $("#sres").addEventListener("click",e=>{ const a=e.target.closest(".sitem"); if(a){ S.search.lastQ=$("#sq").value; S.fromSearch=true; closeSearch(false); } });
  $("#sdlg").addEventListener("keydown",e=>{ const items=$$(".sitem",$("#sres"));
    if(e.key==="Escape"){ e.preventDefault(); closeSearch(); return; }
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){ if(!items.length) return; e.preventDefault(); sSel=e.key==="ArrowDown"?(sSel+1)%items.length:(sSel-1+items.length)%items.length; items.forEach((it,j)=>it.setAttribute("aria-selected",j===sSel)); items[sSel].scrollIntoView({block:"nearest"}); inp.setAttribute("aria-activedescendant",items[sSel].id); return; }
    if(e.key==="Enter"&&document.activeElement===inp){ e.preventDefault(); const t=items[sSel>=0?sSel:0]; if(t){ t.click(); location.hash=t.getAttribute("href"); } return; }
    if(e.key==="Tab"){ const f=$$("button:not([hidden]), input, a.sitem, a.btn",$("#sdlg .sbox")).filter(x=>!x.hidden&&x.offsetParent!==null); const first=f[0], last=f[f.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} } });
  document.addEventListener("keydown",e=>{ if((e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName))||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k")){ if($("#sdlg").hidden){ e.preventDefault(); openSearch(); } } });
  $$("[data-open-search]").forEach(b=>b.addEventListener("click",()=>openSearch()));
}

/* ================= DRAWER / LIGHTBOX / NEWSLETTER / HEADER ================= */
function bindDrawer(){
  const dr=$("#drawer"), btn=$("#menu-btn");
  const open=()=>{ dr.hidden=false; btn.setAttribute("aria-expanded","true"); document.body.classList.add("locked"); $(".drawer-panel .icon-btn",dr).focus(); };
  const close=(restore=true)=>{ dr.hidden=true; btn.setAttribute("aria-expanded","false"); document.body.classList.remove("locked"); if(restore) btn.focus(); };
  btn.addEventListener("click",open); $("#drawer-close").addEventListener("click",()=>close()); $(".drawer-scrim",dr).addEventListener("click",()=>close());
  $$("a",dr).forEach(a=>a.addEventListener("click",()=>close(false))); $("#drawer-search").addEventListener("click",()=>{ close(false); openSearch(); });
  dr.addEventListener("keydown",e=>{ if(e.key==="Escape"){ close(); return; } if(e.key==="Tab"){ const f=$$("a,button",$(".drawer-panel",dr)); if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus();} else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus();} } });
}
function bindLightbox(){
  const el=$("#lightbox"); $("#lb-close").addEventListener("click",closeLB); $("#lb-prev").addEventListener("click",()=>lbStep(-1)); $("#lb-next").addEventListener("click",()=>lbStep(1));
  el.addEventListener("keydown",e=>{ if(e.key==="Escape") closeLB(); if(e.key==="ArrowRight") lbStep(1); if(e.key==="ArrowLeft") lbStep(-1);
    if(e.key==="Tab"){ const f=$$("button:not([hidden]),a",el); if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus();} else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus();} } });
  let x0=null; el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;},{passive:true}); el.addEventListener("touchend",e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>50) lbStep(dx<0?1:-1); x0=null; });
}
function bindNewsletter(){ const f=$("#nl"); if(!f) return;
  const SAY={"New lyrics & releases":"new lyrics","Events":"events","Stories & news":"stories"};
  f.addEventListener("submit",async e=>{ e.preventDefault();
    const i=$("#nl-e"), m=$("#nl-msg"), c=$("#nl-c"), btn=$("button[type=submit]",f), topics=$$('input[name="topic"]:checked',f).map(x=>x.value);
    const fail=(msg,el)=>{ m.className="form-msg err"; m.textContent=msg; if(el) el.focus(); };
    if(!/^\S+@\S+\.\S+$/.test(i.value.trim())){ i.setAttribute("aria-invalid","true"); return fail("Enter an email address like name@example.com.",i); }
    i.setAttribute("aria-invalid","false");
    if(!topics.length) return fail("Pick at least one thing to hear about.",$('input[name="topic"]',f));
    if(!c.checked) return fail("Please tick the box to agree to emails from us.",c);
    if($("#nl-h").value) return; // filled in by spam bots only
    btn.disabled=true; btn.textContent="Sending…"; m.className="form-msg"; m.textContent="";
    try{
      const r=await fetch(`https://formsubmit.co/ajax/${SUBMIT_TO}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:"Salone Lyrics: new notification sign-up",_template:"box",Email:i.value.trim(),"Wants updates about":topics.join(", "),"Agreed to emails":"Yes",Page:pageUrl()})});
      const j=await r.json().catch(()=>({})); if(!r.ok||String(j.success)!=="true") throw new Error("Not sent");
      m.className="form-msg ok"; m.textContent=`Tenki! You’re on the list. We’ll email you when we post ${topics.map(t=>SAY[t]||t).join(", ")}.`; f.reset();
    }catch(_){ fail("That didn’t send. Please try again in a moment."); }
    btn.disabled=false; btn.textContent="Notify me"; });
}
// "Get … alerts" buttons jump to the sign-up with that topic picked
document.addEventListener("click",e=>{ const b=e.target.closest("[data-notify]"); if(!b) return; const f=$("#nl"), box=$("#notify"); if(!f||!box) return;
  $$('input[name="topic"]',f).forEach(x=>x.checked=x.value.startsWith(b.dataset.notify)); box.scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"center"}); setTimeout(()=>$("#nl-e").focus({preventScroll:true}),REDUCED?0:600); });
document.addEventListener("click",e=>{ const c=e.target.closest("[data-copytext]"); if(c) copyText(c.dataset.copytext,"Copied"); const s=e.target.closest("[data-open-search-btn]"); if(s) openSearch(); });
/* Artist peek card */
let peekOpener=null, peekY=0;
function openPeek(slug,btn){
  const a=artist(slug), pk=$("#peek"); if(!a) return; peekOpener=btn;
  const songs=SONGS().filter(s=>s.artist===a.slug).slice(0,3);
  $("#peek-body").innerHTML=`<div class="peek-img panel ${panelCls(D.artists.indexOf(a))}"><span class="grooves spin" aria-hidden="true"></span>${portrait(a,{sizes:"280px",eager:true})}</div>
    <div class="peek-txt"><div class="row-wrap" style="gap:6px"><span class="tag">${esc(a.genre)}</span></div>
    <h2 id="peek-title" class="display">${esc(a.name)}</h2><p>${esc(a.intro)}</p>
    ${songs.length?`<p class="peek-songs"><strong>Lyrics:</strong> ${songs.map(s=>`<a class="link" href="#song.${s.slug}">${esc(s.title)}</a>`).join(", ")}</p>`:""}
    <div class="row-wrap"><a class="btn btn-primary btn-sm" href="#artist.${a.slug}">View profile</a></div></div>`;
  pk.hidden=false; peekY=window.scrollY;
  const r=btn.getBoundingClientRect(), box=$(".peek-box",pk);
  if(window.innerWidth>=700){ const w=box.offsetWidth, h=box.offsetHeight; let x=Math.min(Math.max(12,r.left),window.innerWidth-w-12); let y=r.bottom+10; if(y+h>window.innerHeight-12) y=Math.max(12,r.top-h-10); box.style.left=x+"px"; box.style.top=y+"px"; }
  else { box.style.left=""; box.style.top=""; }
  $("#peek-close").focus();
}
document.addEventListener("DOMContentLoaded",()=>{ const c=$("#peek-close"); if(c) c.addEventListener("click",()=>closePeek());
  const pk=$("#peek"); if(pk) pk.addEventListener("touchmove",e=>{ if(!e.target.closest(".peek-box")) closePeek(false); },{passive:true}); });
window.addEventListener("scroll",()=>{ const pk=$("#peek"); if(pk&&!pk.hidden&&Math.abs(window.scrollY-peekY)>40) closePeek(false); },{passive:true});
function closePeek(restore=true){ const pk=$("#peek"); if(pk.hidden) return; pk.hidden=true; if(restore&&peekOpener) peekOpener.focus(); }
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-peek]"); if(b){ e.preventDefault(); e.stopPropagation(); openPeek(b.dataset.peek,b); return; }
  const pk=$("#peek"); if(pk&&!pk.hidden){ if(e.target.closest("#peek a")){ closePeek(false); return; } if(!e.target.closest(".peek-box")) closePeek(false); }
});
document.addEventListener("keydown",e=>{ const pk=$("#peek"); if(!pk||pk.hidden) return; if(e.key==="Escape"){ e.stopPropagation(); closePeek(); } if(e.key==="Tab"){ const f=$$("a,button",pk); if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus();} else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus();} } },true);
window.addEventListener("hashchange",()=>closePeek(false));
function bindHeader(){ const h=$(".site-header"); const on=()=>h.classList.toggle("scrolled",window.scrollY>24); window.addEventListener("scroll",on,{passive:true}); on(); }
document.addEventListener("DOMContentLoaded",()=>{ bindHeader(); bindDrawer(); bindSearchUI(); bindLightbox(); bindNewsletter(); $("#yr").textContent=new Date().getFullYear(); render(); });
})();
