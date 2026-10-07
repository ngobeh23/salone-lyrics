(function(){
"use strict";
const D = window.SL, P = window.SL_PHOTOS, DIMS = window.SL_DIMS || {};
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IMG = "assets/img/";
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
const ARTISTS = () => D.artists.filter(a=>!a.hidden);
const SONGS = () => D.songs.filter(s=>!s.demo);
const evStatus = e => (e.status==="upcoming"||e.status==="sold-out") && parse(e.date)<TODAY ? "completed" : e.status;
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
const credit = (key,pre="") => { const p=P[key]; return p?`<p class="credit">${pre}${credSource(key)}: <a href="${p.page}" target="_blank" rel="noopener">${esc(p.by)}</a></p>`:""; };
const panelCls = i => ["panel-blue","panel-charcoal","panel-green","panel-paper"][i%4];
function ttile(r){
  const a=artist(r.artist);
  return `<div class="ttile ${r.colour}" aria-hidden="true"><span class="disc"></span><span class="meta">${esc(r.type)} · ${esc(r.year||"")}${r.note?" · "+esc(r.note):""}</span><span class="display">${esc(r.title)}</span><span class="meta">${esc(a.name)}</span></div>`;
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
    let i=0, timer=null, paused=REDUCED;
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
    if(REDUCED){ pp.setAttribute("aria-pressed","true"); pp.textContent="Play"; }
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
  const sec={song:"lyrics",release:"lyrics",artist:"artists",story:"news",event:"events"}[r.name]||r.name;
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
  const who = s.demo ? "Salone Lyrics demo" : `${peekBtn(s.artist)}${s.feat?` feat. ${s.featA?peekBtn(s.featA,s.feat):esc(s.feat)}`:""}`;
  return `<li class="songrow"><span class="num tnum" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><span class="sr-main"><a class="t stretch" href="#song.${s.slug}">${esc(s.title)}</a><br><span class="a">${who}</span></span><span class="meta">${esc(s.genre)} · ${esc(s.type)} · ${esc(s.year||"—")}</span><span class="go" aria-hidden="true">${s.demo?"Read demo":"View song"}</span></li>`;
}
function artistCard(a,i,tag="h3"){
  return `<a class="acard reveal" href="#artist.${a.slug}"><div class="portrait panel ${panelCls(i)} grain"><span class="grooves" aria-hidden="true"></span>${portrait(a,{sizes:"(min-width:1200px) 16vw, (min-width:768px) 24vw, 45vw",alt:""})}</div><div class="row"><${tag}>${esc(a.name)}</${tag}></div><p>${esc(a.genre)} · ${esc(a.town)}</p>${a.hot?`<div class="row"><span class="tag tag-hot">#${a.hot} Hottest 2025</span></div>`:a.pending?`<div class="row"><span class="tag tag-example">Profile in progress</span></div>`:""}</a>`;
}
function evRow(e){
  const d=parse(e.date), st=evStatus(e), off=st==="cancelled"||st==="postponed";
  return `<li class="evrow reveal ${off?"is-off":""} ${st==="completed"?"is-past":""}"><div class="evdate" aria-hidden="true"><span class="d tnum">${d.getDate()}</span><span class="m">${MONTHS[d.getMonth()]}</span></div><div class="evinfo"><div class="row-wrap" style="gap:8px"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="tag">${esc(e.type)}</span>${e.paid?"":'<span class="tag tag-green">Free</span>'}${SAMPLE}</div><h3><a href="#event.${e.slug}" style="text-decoration:none">${esc(e.title)}</a></h3><p class="where"><span class="sr">Date: ${fmtLong(e.date)}. </span>${esc(e.venue)}, ${esc(e.town)} · ${esc(e.time)}</p><p class="who">${esc(e.lineup)}</p></div><a class="btn btn-ghost btn-sm ev-cta" href="#event.${e.slug}" aria-label="View event: ${esc(e.title)}">View event</a></li>`;
}
function storyItem(a,i=0){
  return `<li><a class="story-item reveal" href="#story.${a.slug}"><div><span class="cat">${esc(a.cat)}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><p class="date mt-s">${fmt(a.date)}${a.sample?" · Sample":""}</p></div><div class="thumb panel ${panelCls(i+1)}" aria-hidden="true">${pic(a.photo,{sizes:"96px",alt:""})}</div></a></li>`;
}
const ytSearch = v => `https://www.youtube.com/results?search_query=${encodeURIComponent(artist(v.artist).name+" "+v.title+" official video")}`;
function vidCard(v,i){
  const a=artist(v.artist);
  return `<article class="vid reveal ${v.orient}" data-vid="${v.slug}"><div class="vid-frame"><div class="poster panel ${panelCls(i+1)}"><span class="grooves spin" aria-hidden="true"></span>${pic(v.photo,{sizes:"(min-width:1024px) 30vw, 90vw",alt:""})}</div><span class="ttl" aria-hidden="true">${esc(v.title)}</span><button class="vid-play" type="button" aria-label="Play: ${esc(v.title)} by ${esc(a.name)}"><span>${ICON.play}</span></button></div><h3>${esc(v.title)}</h3><p class="meta">${esc(v.kind)} · ${peekBtn(a.slug)}${v.orient==="portrait"?" · Vertical":""}</p></article>`;
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
  return `<div class="team-grid">${D.team.map(t=>`<article class="team-card reveal ${t.open?"open":""}"><div class="team-top"><span class="team-av ${t.photo?"has-photo":""}" aria-hidden="true">${t.open?"+":t.photo?pic(t.photo,{sizes:"64px",alt:""}):esc(initials(t.name))}</span><div><h3>${esc(t.name)}</h3><p class="team-role">${esc(t.role)}</p></div></div><p>${esc(t.bio)}</p>${t.photo?'<p class="ph-note">Placeholder photo</p>':""}${t.open?`<a class="pill-btn" href="#contact">Apply to write</a>`:""}</article>`).join("")}</div>`;
}

/* ================= HOME ================= */
VIEWS.home = () => {
  const heroes=["kracktwist","drizilik","boii","kao-denero","apreel","incredible-jj","emmerson","bakitenno"].map(artist), hero=heroes[0], spot=D.artists.find(a=>a.spotlight);
  const picks=D.picks.map(song);
  const upcoming=D.events.filter(e=>evStatus(e)!=="completed").sort((a,b)=>a.date.localeCompare(b.date));
  const weekend=upcoming.filter(inWeekend);
  const feat=D.articles[0], rest=D.articles.slice(1,4);
  const spotSongs=SONGS().filter(s=>s.artist===spot.slug).slice(0,3);
  return { title:"", html:`
  <section class="hero-shell" aria-labelledby="hero-h"><div class="hero">
    <div class="hero-copy">
      <p class="eyebrow" style="color:var(--blue-deep)">Kushe! Welcome to Salone Lyrics</p>
      <h1 id="hero-h" class="display"><span>Salone</span><span>music.</span><span class="accent">Every word.</span></h1>
      <p class="hero-lede">Discover the lyrics, artists and stories shaping Sierra Leone’s sound.</p>
      <form class="hero-search" role="search" data-hero-search><label for="hero-q" class="sr">Search songs, lyrics, artists or events</label><input id="hero-q" type="search" placeholder="Search songs, lyrics, artists or events…" autocomplete="off"><button type="submit">Search</button></form>
      <div class="hero-actions"><a class="btn btn-primary" href="#lyrics">Explore Lyrics</a><a class="btn btn-ghost" href="#artists">Discover Artists</a></div>
    </div>
    <div class="hero-art panel grain" data-hero data-c="0" aria-roledescription="carousel" aria-label="Featured artists">
      <span class="grooves spin" aria-hidden="true"></span>
      <div class="hero-stack floaty">${heroes.map((a,i)=>`<div class="hero-slide ${i===0?"on":""}" aria-hidden="${i!==0}">${portrait(a,{eager:i<2,cls:"cut cut-shadow",sizes:"(min-width:900px) 45vw, 80vw",alt:a.name})}</div>`).join("")}</div>
      <a class="hero-chip" href="#artist.${hero.slug}" data-hero-chip><span class="dot" aria-hidden="true"></span><span data-hero-name>${esc(hero.name)} · #${hero.hot} Hottest 2025</span></a>
      <div class="hero-ctrl"><button type="button" class="hero-pp" data-hero-pp aria-pressed="false" aria-label="Pause artist slideshow">Pause</button><span class="hero-dots">${heroes.map((a,i)=>`<button type="button" data-hero-go="${i}" aria-label="Show ${esc(a.name)}" aria-current="${i===0}"></button>`).join("")}</span></div>
      <p class="credit" data-hero-credit>${credSource(hero.photo)}: <a href="${P[hero.photo].page}" target="_blank" rel="noopener">${esc(P[hero.photo].by)}</a></p>
    </div>
  </div>
  <div class="stats wrap" aria-label="On Salone Lyrics">
    <div class="stat"><span class="n tnum" data-count="${ARTISTS().length}">${ARTISTS().length}</span><span class="l">Artists profiled</span></div>
    <div class="stat"><span class="n tnum" data-count="${SONGS().length}">${SONGS().length}</span><span class="l">Songs listed</span></div>
    <div class="stat"><span class="n tnum" data-count="${D.releases.length}">${D.releases.length}</span><span class="l">Releases</span></div>
    <div class="stat"><span class="n tnum" data-count="${D.articles.length}">${D.articles.length}</span><span class="l">Stories</span></div>
  </div></section>

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
      <dl class="spot-facts"><div><dt>Genre</dt><dd>${esc(spot.genre)}</dd></div><div><dt>Based in</dt><dd>${esc(spot.town)}</dd></div><div><dt>Label</dt><dd>${esc(spot.label||"")}</dd></div></dl>
      <div class="row-wrap"><a class="btn btn-primary" href="#artist.${spot.slug}">Meet the Artist</a>${spotSongs[0]?`<a class="arrow-link" href="#song.${spotSongs[0].slug}">“${esc(spotSongs[0].title)}”</a>`:""}</div>
      ${credit(spot.photo).replace('class="credit"','class="credit" style="color:var(--charcoal)"')}
    </div>
  </section>

  <section class="section" aria-labelledby="rel-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Music</p><h2 id="rel-h" class="display sec-title">Releases</h2></div>
      <div class="chips" role="group" aria-label="Filter releases">${["All","EPs","Albums"].map(f=>`<button type="button" class="chip" data-rel="${f}" aria-pressed="${S.rel===f}">${f}</button>`).join("")}</div></div>
    <div class="rel-grid" id="rel-grid" aria-live="polite"></div>
    <p class="paid-note">Release tiles are typographic. Official artwork appears once supplied by the artist.</p>
  </div></section>

  <section class="section" style="background:#fff" aria-labelledby="art-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Directory</p><h2 id="art-h" class="display sec-title">Discover artists</h2></div>
      <div class="row-wrap"><button type="button" class="chip" data-amq-pp aria-pressed="false">Pause</button><a class="arrow-link" href="#artists">All artists</a></div></div>
  </div>
    <div class="amq" data-amq role="region" aria-label="Featured artists, moving list"><div class="amq-track"><div class="amq-row">${ARTISTS().filter(a=>a.photo).map((a,i)=>artistCard(a,i)).join("")}</div><div class="amq-row" aria-hidden="true" inert>${ARTISTS().filter(a=>a.photo).map((a,i)=>artistCard(a,i)).join("")}</div></div></div>
  <div class="wrap">
  </div></section>

  ${marquee(["Afrobeats","Hip-hop","Afropop","R&B","Gumbe","Afro-soul","Highlife"],"mq-skew")}

  <section class="section" aria-labelledby="ev-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Events</p><h2 id="ev-h" class="display sec-title">Upcoming events</h2></div><a class="btn btn-ghost btn-sm" href="#events">View all events</a></div>
    ${weekend.length?`<div class="notice notice-info reveal" style="margin-bottom:24px"><strong>This weekend</strong><span>${weekend.map(e=>`<a class="link" href="#event.${e.slug}">${esc(e.title)}</a> (${DOW[parse(e.date).getDay()]}, ${esc(e.town)})`).join(" · ")}</span></div>`:""}
    <ul class="evlist">${upcoming.slice(0,4).map(evRow).join("")}</ul>
    <p class="paid-note">Event listings in this preview are samples showing each status. Confirmed shows replace them at launch.</p>
  </div></section>

  <section class="section" style="background:#fff" aria-labelledby="st-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Stories &amp; interviews</p><h2 id="st-h" class="display sec-title">From the newsroom</h2></div><a class="arrow-link" href="#news">All stories</a></div>
    <div class="stories">
      <a class="story-feature reveal" href="#story.${feat.slug}"><div class="art panel panel-blue grain"><span class="grooves spin" aria-hidden="true"></span>${pic(feat.photo,{alt:"",sizes:"(min-width:900px) 35vw, 60vw"})}</div><div class="body"><span class="cat">${esc(feat.cat)}</span><h3>${esc(feat.title)}</h3><p>${esc(feat.summary)}</p><p class="date">${fmt(feat.date)}</p></div></a>
      <ul class="story-list">${rest.map(storyItem).join("")}</ul>
    </div>
  </div></section>

  <section class="section" aria-labelledby="vid-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">Watch</p><h2 id="vid-h" class="display sec-title">Videos</h2></div><a class="arrow-link" href="#videos">All videos</a></div>
    <div class="vid-grid">${D.videos.slice(0,3).map(vidCard).join("")}</div>
  </div></section>

  ${svcCarousel("Grow your audience","Placements across the website, Instagram and TikTok. Every paid placement is labelled Promoted.")}

  <section class="promo grain on-dark" aria-labelledby="promo-h">
    <div class="promo-copy">
      <p class="eyebrow" style="color:var(--green)">For artists, managers &amp; promoters</p>
      <h2 id="promo-h" class="display reveal">Let more people <em>discover</em> your sound.</h2>
      <p>Profiles, featured releases, Weekly Spotlight, event listings and social campaigns across the website, Instagram and TikTok.</p>
      <div class="row-wrap"><a class="btn btn-green" href="#promote">Explore Promotion Options</a></div>
    </div>
    <div class="promo-art panel"><span class="grooves spin" aria-hidden="true"></span><div class="floaty">${pic("singer-hat",{cls:"cut cut-outline",sizes:"(min-width:900px) 40vw, 90vw"})}</div><div class="promo-cred">${credit("singer-hat","Illustrative image. ")}</div></div>
  </section>

  <section class="section" aria-labelledby="team-h"><div class="wrap">
    <div class="sec-head"><div class="stack" style="gap:8px"><p class="eyebrow muted">The people behind the platform</p><h2 id="team-h" class="display sec-title">Meet the team</h2></div><a class="arrow-link" href="#about">About Salone Lyrics</a></div>
    ${teamGrid()}
  </div></section>`,
  after(main){
    const grid=$("#rel-grid",main);
    const draw=()=>{ const map={EPs:"EP",Albums:"Album"}; const list=D.releases.filter(r=>S.rel==="All"||r.type===map[S.rel]).slice(0,8);
      grid.innerHTML=list.map(r=>`<a class="rel" href="#release.${r.slug}">${ttile(r)}<div><h3>${esc(r.title)}</h3><p>${esc(artist(r.artist).name)} · ${esc(r.type)} · ${esc(r.year)}</p></div></a>`).join(""); };
    draw();
    $$("[data-rel]",main).forEach(b=>b.addEventListener("click",()=>{S.rel=b.dataset.rel; $$("[data-rel]",main).forEach(x=>x.setAttribute("aria-pressed",x===b)); draw();}));
    $("[data-hero-search]",main).addEventListener("submit",e=>{e.preventDefault(); openSearch($("#hero-q").value);});
    railControls(main); bindVideos(main); bindSvcLinks(main); heroCycle(main, heroes); artistMarquee(main);
  }};
};
function heroCycle(root, heroes){
  const box=$("[data-hero]",root); if(!box) return;
  const slides=$$(".hero-slide",box), dots=$$("[data-hero-go]",box), pp=$("[data-hero-pp]",box), chip=$("[data-hero-chip]",box), nm=$("[data-hero-name]",box), cr=$("[data-hero-credit]",box);
  let i=0, timer=null, paused=REDUCED;
  const show=n=>{ i=(n+slides.length)%slides.length; const a=heroes[i];
    slides.forEach((s,k)=>{ s.classList.toggle("on",k===i); s.setAttribute("aria-hidden",k!==i); });
    dots.forEach((d,k)=>d.setAttribute("aria-current",k===i));
    box.dataset.c=i%4; chip.href="#artist."+a.slug; nm.textContent=`${a.name}${a.hot?" · #"+a.hot+" Hottest 2025":""}`;
    cr.innerHTML=`${credSource(a.photo)}: <a href="${P[a.photo].page}" target="_blank" rel="noopener">${esc(P[a.photo].by)}</a>`; };
  const start=()=>{ clearInterval(timer); if(!paused) timer=setInterval(()=>show(i+1),4200); };
  dots.forEach((d,k)=>d.addEventListener("click",()=>{ show(k); start(); }));
  pp.addEventListener("click",()=>{ paused=!paused; pp.setAttribute("aria-pressed",paused); pp.textContent=paused?"Play":"Pause"; pp.setAttribute("aria-label",(paused?"Play":"Pause")+" artist slideshow"); start(); });
  if(paused){ pp.setAttribute("aria-pressed","true"); pp.textContent="Play"; }
  box.addEventListener("focusin",()=>clearInterval(timer)); box.addEventListener("focusout",start);
  cleanup.push(()=>clearInterval(timer)); start();
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
  return { title:"Lyrics & Music", html:`
  <header class="phead grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Lyrics & Music"]])}<h1 class="display">Lyrics &amp; music</h1><p>Songs from Sierra Leone’s artists, with credits and links. Lyrics appear once each artist approves them.</p></div></header>
  <div class="wrap page">
    <div class="notice notice-info reveal" style="margin-bottom:24px"><strong>See how a lyrics page works</strong><span>Real lyrics are added with artist approval. Meanwhile, <a class="link" href="#song.lyric-reader-demo">open the lyric reader demo</a> to try text size, focus mode, auto-scroll and translations.</span></div>
    <div class="filterbar" role="search">
      <div class="field-inline" style="flex:1 1 260px"><label for="lq">Search songs</label><input id="lq" class="input" type="search" placeholder="Song title or artist" value="${esc(S.lyr.q)}"></div>
      <div class="field-inline"><label for="lg">Genre</label><select id="lg" class="select">${genres.map(g=>`<option ${S.lyr.genre===g?"selected":""}>${g}</option>`).join("")}</select></div>
      <div class="field-inline"><label for="lt">Release type</label><select id="lt" class="select">${["All","Single","EP","Album"].map(g=>`<option ${S.lyr.type===g?"selected":""}>${g}</option>`).join("")}</select></div>
    </div>
    <p class="count" id="lcount" aria-live="polite"></p>
    <ol class="songlist mt-s" id="llist"></ol>
    <div class="mt-l"><h2 class="display" style="font-size:clamp(28px,4vw,44px)">Albums &amp; EPs</h2><div class="rel-grid mt-m">${D.releases.map(r=>`<a class="rel reveal" href="#release.${r.slug}">${ttile(r)}<div><h3>${esc(r.title)}</h3><p>${esc(artist(r.artist).name)} · ${esc(r.type)} · ${esc(r.year)}</p></div></a>`).join("")}</div></div>
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
VIEWS.song = r => {
  const s=song(r.slug); if(!s) return VIEWS.notfound(r);
  const a=artist(s.artist), fa=s.featA?artist(s.featA):null;
  const related=SONGS().filter(x=>x.slug!==s.slug&&(x.artist===s.artist||x.featA===s.artist)).slice(0,5);
  const more=related.length?related:SONGS().filter(x=>x.slug!==s.slug&&x.genre===s.genre).slice(0,5);
  const rel=s.release?release(s.release):null;
  const credits=Object.assign({}, s.credits||{}, s.feat?{"Featuring":s.feat}:{}, s.label?{"Label":s.label}:{});
  const ytq=`https://www.youtube.com/results?search_query=${encodeURIComponent((s.demo?"":a.name+" ")+s.title)}`;
  const amq=`https://audiomack.com/search?q=${encodeURIComponent(a.name+" "+s.title)}`;
  const lyricBlock = s.demo ? `
        <div class="toolbar" role="toolbar" aria-label="Reading tools">
          <div class="grp" role="group" aria-label="Text size"><button type="button" data-size="-1" aria-label="Smaller text">A−</button><button type="button" data-size="1" aria-label="Larger text">A+</button></div>
          <div class="grp"><button type="button" id="focusbtn" aria-pressed="false">Focus mode</button></div>
          <div class="grp"><button type="button" id="scrollbtn" aria-pressed="false">Auto-scroll</button><label for="speed">Speed <input id="speed" type="range" min="1" max="5" value="2"></label></div>
          <div class="grp"><button type="button" id="sharebtn">Share</button></div>
        </div>
        <div class="lang-tabs" role="tablist" aria-label="Lyrics language"><button class="chip" role="tab" id="lt-o" aria-selected="true" aria-controls="lyrics">Original (Krio &amp; English)</button><button class="chip" role="tab" id="lt-t" aria-selected="false" aria-controls="lyrics">${esc(s.translation.label)}</button></div>
        <article class="lyrics" id="lyrics" role="tabpanel" style="--lsize:${S.lsize}px" aria-label="Lyrics"></article>
        <p class="paid-note">Demo text written for this preview to show the lyric reader. It is not a real song.</p>`
    : `
        <div class="toolbar" role="toolbar" aria-label="Song tools"><div class="grp"><button type="button" id="sharebtn">Share</button></div></div>
        <div class="lyrics-pending reveal"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><h2 class="display">Lyrics coming soon</h2><p>We publish lyrics only when ${esc(a.name)} or their team has approved them, so every word is right. Want to see how this page will read? <a class="link" href="#song.lyric-reader-demo">Open the lyric reader demo</a>.</p><div class="row-wrap"><a class="btn btn-primary btn-sm" href="#song.${s.slug}" data-open-submit>Submit official lyrics</a></div></div>`;
  return { title:`${s.title} by ${a.name}`, html:`
  <header class="song-head"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">
    <div class="stack">${crumbs([["Home","#"],["Lyrics","#lyrics"],[s.title]])}
      <div class="row-wrap" style="gap:8px"><span class="tag tag-dark">${esc(s.genre)}</span><span class="tag tag-dark">${esc(s.type)}</span>${s.demo?'<span class="tag tag-amber">Demo</span>':""}</div>
      <h1 class="display">${esc(s.title)}</h1>
      <p class="by">${s.demo?"Sample text by Salone Lyrics":`By <a href="#artist.${a.slug}">${esc(a.name)}</a>${s.feat?` feat. ${fa?`<a href="#artist.${fa.slug}">${esc(s.feat)}</a>`:esc(s.feat)}`:""}`} · ${esc(yr(s.year))}${rel?` · From <a href="#release.${rel.slug}">${esc(rel.title)}</a>`:""}</p>
    </div>
    ${a.photo?`<div class="portrait panel panel-blue" aria-hidden="true">${pic(a.photo,{sizes:"300px",alt:""})}</div>`:""}
  </div></header>
  <div class="wrap">
    <p class="focus-title display" style="font-size:40px">${esc(s.title)}</p>
    <div class="song-layout"><div style="min-width:0">${lyricBlock}
        <div class="after-lyrics stack mt-l">
          <details class="correction" id="submit-box"><summary style="cursor:pointer;font-weight:600;min-height:32px">${s.demo?"Spotted a mistake? Suggest a correction":"Are you the artist or their team? Submit official lyrics"}</summary>
            <form id="corr" class="stack mt-s" novalidate>
              <div class="field"><label for="c-role">You are <span class="req">*</span></label><select id="c-role" class="select" required><option value="">Choose one</option><option>The artist</option><option>Management or label</option><option>A fan</option></select><p class="err" id="c-role-e" hidden></p></div>
              <div class="field"><label for="c-txt">${s.demo?"Correct wording":"Lyrics"} <span class="req">*</span></label><textarea id="c-txt" class="input" required aria-describedby="c-txt-h"></textarea><p class="hint" id="c-txt-h">An editor checks every submission with the artist before the page changes.</p><p class="err" id="c-txt-e" hidden></p></div>
              <div class="field"><label for="c-em">Your email <span class="req">*</span></label><input id="c-em" class="input" type="email" autocomplete="email" required><p class="err" id="c-em-e" hidden></p></div>
              <div><button class="btn btn-primary btn-sm" type="submit">Send</button></div><div id="c-msg" aria-live="polite"></div>
            </form></details>
        </div>
      </div>
      <aside class="song-aside stack" style="gap:32px;align-content:start">
        <div class="aside-box"><h2>Credits</h2><dl class="credits"><dt>Artist</dt><dd>${esc(s.demo?"Sample":a.name)}</dd>${Object.entries(credits).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}<dt>Year</dt><dd>${esc(yr(s.year))}</dd></dl><p class="paid-note">Full writer and producer credits are added with the lyrics.</p></div>
        ${s.demo?"":`<div class="aside-box"><h2>Listen</h2><div class="listen"><a class="btn btn-ghost btn-sm" href="${amq}" target="_blank" rel="noopener">Audiomack<span class="muted" style="font-size:12px">Search</span></a><a class="btn btn-ghost btn-sm" href="${ytq}" target="_blank" rel="noopener">YouTube<span class="muted" style="font-size:12px">Search</span></a></div><p class="paid-note">Opens a search on each platform until the artist’s official links are added.</p></div>
        <div class="aside-box"><h2>About the artist</h2><a href="#artist.${a.slug}" class="acard"><div class="portrait panel panel-green" style="aspect-ratio:16/10">${portrait(a,{sizes:"320px",alt:""})}</div><h3>${esc(a.name)}</h3><p>${esc(a.intro)}</p></a><a class="arrow-link" href="#artist.${a.slug}">View ${esc(a.name)}’s profile</a></div>`}
      </aside>
    </div>
    <section class="after-lyrics section" style="padding-bottom:0" aria-labelledby="rel-songs"><h2 id="rel-songs" class="display" style="font-size:clamp(28px,4vw,44px);margin-bottom:24px">${s.demo?"Editor’s picks":related.length?`More from ${esc(a.name)}`:"Related songs"}</h2><ol class="songlist">${(s.demo?D.picks.map(song):more).map(songRow).join("")}</ol></section>
  </div><div style="height:64px"></div>`,
  after(main){
    $("#sharebtn",main).addEventListener("click",()=>share(document.title));
    const os=$("[data-open-submit]",main); if(os) os.addEventListener("click",e=>{e.preventDefault(); const d=$("#submit-box"); d.open=true; d.scrollIntoView({behavior:REDUCED?"auto":"smooth",block:"center"}); setTimeout(()=>$("#c-role").focus(),300); });
    $("#corr",main).addEventListener("submit",e=>{ e.preventDefault(); let first=null;
      [["c-role","Choose who you are."],["c-txt","Add the lyrics or correction."],["c-em","Enter your email so the editor can confirm."]].forEach(([id,m])=>{ const el=$("#"+id); let bad=!el.value.trim(); if(id==="c-em"&&!bad&&!/^\S+@\S+\.\S+$/.test(el.value)){bad=true;m="Enter an email address like name@example.com.";} el.setAttribute("aria-invalid",bad); $("#"+id+"-e").hidden=!bad; $("#"+id+"-e").textContent=m; if(bad&&!first) first=el; });
      if(first){ first.focus(); return; }
      $("#c-msg").innerHTML=`<div class="notice notice-info"><strong>Submission prepared</strong><span>This preview is not connected to the editorial inbox yet, so nothing has been sent. When connected, an editor confirms with the artist before publishing.</span></div>`; });
    if(!s.demo) return;
    const ly=$("#lyrics",main);
    const drawLy=tr=>{ ly.innerHTML=s.lyrics.map(([h,lines])=>`<section><h2>${esc(h)}</h2>${lines.map(l=>`<p>${esc(l)}${tr&&s.translation.lines[l]?`<span class="tr" lang="en">${esc(s.translation.lines[l])}</span>`:""}</p>`).join("")}</section>`).join(""); };
    drawLy(false);
    $$("[data-size]",main).forEach(b=>b.addEventListener("click",()=>{ S.lsize=Math.max(15,Math.min(28,S.lsize+(+b.dataset.size)*2)); ly.style.setProperty("--lsize",S.lsize+"px"); try{localStorage.setItem("sl-lsize",S.lsize)}catch(e){} toast(`Text size ${S.lsize}px`); }));
    const fb=$("#focusbtn",main);
    const setFocus=on=>{ document.body.classList.toggle("focus-mode",on); fb.setAttribute("aria-pressed",on); fb.textContent=on?"Exit focus":"Focus mode"; if(on) ly.scrollIntoView({block:"start"}); };
    fb.addEventListener("click",()=>setFocus(!document.body.classList.contains("focus-mode")));
    const onKey=e=>{ if(e.key==="Escape"&&document.body.classList.contains("focus-mode")&&$("#sdlg").hidden) setFocus(false); };
    document.addEventListener("keydown",onKey); cleanup.push(()=>document.removeEventListener("keydown",onKey));
    let raf=null,acc=0; const sb=$("#scrollbtn",main), sp=$("#speed",main);
    const stop=()=>{ if(raf) cancelAnimationFrame(raf); raf=null; sb.setAttribute("aria-pressed","false"); sb.textContent="Auto-scroll"; };
    const step=()=>{ acc+= +sp.value*0.35; if(acc>=1){ window.scrollBy(0,Math.floor(acc)); acc-=Math.floor(acc);} if(window.innerHeight+window.scrollY>=document.body.scrollHeight-2){stop();toast("End of lyrics");return;} raf=requestAnimationFrame(step); };
    sb.addEventListener("click",()=>{ if(raf) stop(); else { sb.setAttribute("aria-pressed","true"); sb.textContent="Pause"; raf=requestAnimationFrame(step);} });
    const userStop=()=>{ if(raf) stop(); }; window.addEventListener("wheel",userStop,{passive:true}); window.addEventListener("touchstart",userStop,{passive:true});
    cleanup.push(()=>{stop();window.removeEventListener("wheel",userStop);window.removeEventListener("touchstart",userStop);});
    const o=$("#lt-o",main), t=$("#lt-t",main);
    const set=tr=>{ o.setAttribute("aria-selected",!tr); t.setAttribute("aria-selected",tr); drawLy(tr); };
    o.addEventListener("click",()=>set(false)); t.addEventListener("click",()=>set(true));
    [o,t].forEach(b=>b.addEventListener("keydown",e=>{ if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ const n=b===o?t:o; n.focus(); n.click(); } }));
  }};
};

/* ================= RELEASE ================= */
VIEWS.release = r => {
  const rel=release(r.slug); if(!rel) return VIEWS.notfound(r);
  const a=artist(rel.artist); const tracks=SONGS().filter(s=>s.release===rel.slug||rel.tracks.includes(s.slug));
  return { title:`${rel.title} by ${a.name}`, html:`
  <header class="phead charcoal"><div class="wrap">${crumbs([["Home","#"],["Lyrics & Music","#lyrics"],[rel.title]])}
    <div class="about-split" style="gap:32px"><div class="stack"><div class="row-wrap" style="gap:8px"><span class="tag tag-green">${esc(rel.type)}</span>${rel.note?`<span class="tag tag-amber">${esc(rel.note)}</span>`:""}</div><h1 class="display">${esc(rel.title)}</h1><p>By <a class="link" style="color:#fff" href="#artist.${a.slug}">${esc(a.name)}</a> · ${esc(rel.year)}</p><div class="row-wrap"><button class="btn btn-green" type="button" data-share>Share release</button></div></div>
    <div style="max-width:360px;width:100%">${ttile(rel)}<p class="credit" style="color:var(--muted-dark);margin-top:8px">Typographic tile. Official artwork will be added when supplied.</p></div></div>
  </div></header>
  <div class="wrap page"><h2 class="display" style="font-size:36px;margin-bottom:16px">Songs on Salone Lyrics</h2>${tracks.length?`<ol class="songlist">${tracks.map(songRow).join("")}</ol>`:`<div class="empty"><p class="muted">The tracklist for ${esc(rel.title)} will be added with the artist.</p></div>`}
  <div class="mt-l"><a class="arrow-link" href="#artist.${a.slug}.music">More music from ${esc(a.name)}</a></div></div>`,
  after(main){ $("[data-share]",main).addEventListener("click",()=>share(document.title)); }};
};

/* ================= ARTISTS ================= */
VIEWS.artists = () => {
  const genres=["All",...new Set(ARTISTS().map(a=>a.genre))];
  return { title:"Artists", html:`
  <header class="phead green grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Artists"]])}<h1 class="display">Artists</h1><p>Profiles of Sierra Leone’s leading voices, from veterans to the newest names on the charts.</p></div></header>
  <div class="wrap page">
    <div class="filterbar"><div class="field-inline" style="flex:1 1 240px"><label for="aq">Search artists</label><input id="aq" class="input" type="search" placeholder="Name, genre or town" value="${esc(S.art.q)}"></div>
      <div class="field-inline"><label for="ag">Genre</label><select id="ag" class="select">${genres.map(g=>`<option ${S.art.genre===g?"selected":""}>${g}</option>`).join("")}</select></div></div>
    <p class="count" id="acount" aria-live="polite"></p>
    <div class="adir mt-m" id="adir"></div>
    <p class="paid-note mt-m">Artist photos are taken from press and profile images (sources on each profile) for this private preview. Official photos and approval will be requested before launch.</p>
  </div>`,
  after(main){
    const draw=()=>{ const q=S.art.q.trim().toLowerCase(); const list=ARTISTS().filter(a=>(S.art.genre==="All"||a.genre===S.art.genre)&&(!q||(a.name+" "+(a.aka||"")+" "+a.genre+" "+a.town).toLowerCase().includes(q)));
      $("#acount").textContent=`${list.length} artist${list.length===1?"":"s"}`;
      $("#adir").innerHTML=list.length?list.map((a,i)=>artistCard(a,i,"h2")).join(""):`<div class="empty" style="grid-column:1/-1"><p class="display">No artists found</p><p class="muted">Try a different name or genre.</p></div>`; reveal($("#adir")); };
    $("#aq").addEventListener("input",e=>{S.art.q=e.target.value;draw();}); $("#ag").addEventListener("change",e=>{S.art.genre=e.target.value;draw();}); draw();
  }};
};

/* ================= ARTIST ================= */
const TABS=[["overview","Overview"],["music","Music"],["videos","Videos"],["gallery","Gallery"],["events","Events"]];
VIEWS.artist = r => {
  const a=artist(r.slug); if(!a||a.hidden) return VIEWS.notfound(r);
  const tab=TABS.some(t=>t[0]===r.sub)?r.sub:"overview";
  return { title:a.name, html:`
  <header class="a-hero grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">
    <div class="txt stack">${crumbs([["Home","#"],["Artists","#artists"],[a.name]])}
      <div class="facts">${a.hot?`<span class="tag tag-hot">#${a.hot} Hottest 2025</span>`:""}<span class="tag tag-dark">${esc(a.genre)}</span><span class="tag tag-dark">${esc(a.town)}</span>${a.pending?'<span class="tag tag-amber">Profile in progress</span>':""}</div>
      <h1 class="display">${esc(a.name)}</h1>${a.aka?`<p class="aka">Also known as ${esc(a.aka)}</p>`:""}<p class="intro">${esc(a.intro)}</p>
      <div class="row-wrap on-dark"><a class="btn btn-green" href="#artist.${a.slug}.music">Songs</a><a class="btn btn-ghost" style="color:#fff" href="#artist.${a.slug}.videos">Watch</a></div>
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
    ${a.sources.length?`<details class="sources"><summary>Sources for this profile</summary><ul>${a.sources.map(u=>`<li><a class="link" href="${u}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/,"").slice(0,70))}</a></li>`).join("")}</ul></details>`:""}</div>
    <aside class="stack" style="gap:28px;align-content:start"><div class="aside-box"><h2>Details</h2><dl class="credits"><dt>Genre</dt><dd>${esc(a.genre)}</dd><dt>Based in</dt><dd>${esc(a.town)}</dd>${a.label?`<dt>Label</dt><dd>${esc(a.label)}</dd>`:""}${(a.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}<dt>Songs here</dt><dd>${songs.length}</dd></dl></div>
    <div class="aside-box"><h2>Official links</h2>${a.links.length?`<div class="listen">${a.links.map(([n,u])=>`<a class="btn btn-ghost btn-sm" href="${u}" target="_blank" rel="noopener">${esc(n)}<span aria-hidden="true">↗</span></a>`).join("")}</div>`:`<p class="muted" style="font-size:14px">Official links will be added after confirmation with the artist.</p>`}</div>
    <div class="aside-box"><h2>Booking</h2><p class="muted" style="font-size:14px">Authorised booking contact to be supplied by the artist’s management.</p></div>
    ${a.photo?`<div class="aside-box"><h2>Photo</h2>${credit(a.photo)}</div>`:""}
    ${news.length?`<div class="aside-box"><h2>Stories</h2>${news.map(n=>`<a class="arrow-link" href="#story.${n.slug}" style="display:flex">${esc(n.title)}</a>`).join("")}</div>`:""}</aside></div>`;
  if(id==="music") return `<h2 class="display" style="font-size:36px;margin-bottom:16px">Songs</h2>${songs.length?`<ol class="songlist">${songs.map(songRow).join("")}</ol>`:`<div class="empty"><p class="muted">Songs will be added once confirmed with the artist.</p></div>`}
    ${rels.length?`<h2 class="display mt-l" style="font-size:36px;margin-bottom:16px">Albums &amp; EPs</h2><div class="rel-grid">${rels.map(r=>`<a class="rel" href="#release.${r.slug}">${ttile(r)}<div><h3>${esc(r.title)}</h3><p>${esc(r.type)} · ${esc(r.year)}</p></div></a>`).join("")}</div>`:""}`;
  if(id==="videos") return vids.length?`<div class="vid-grid">${vids.map(vidCard).join("")}</div>`:`<div class="empty"><p class="display">No videos yet</p><p class="muted">Official videos will appear here.</p><a class="btn btn-ghost btn-sm" href="https://www.youtube.com/results?search_query=${encodeURIComponent(a.name+" Sierra Leone")}" target="_blank" rel="noopener">Search YouTube</a></div>`;
  if(id==="gallery") return a.photo?`<div class="gal-grid">${galItem(a.photo,0)}</div><div class="mt-m">${credit(a.photo)}</div>`:`<div class="empty"><p class="muted">Photos will appear once supplied by the artist.</p></div>`;
  if(id==="events") return `<div class="empty"><p class="display">No confirmed performances</p><p class="muted">${esc(a.name)}’s upcoming shows will be listed here once confirmed by organisers.</p><a class="btn btn-ghost btn-sm" href="#events">All events</a></div>`;
  return "";
}

/* ================= NEWS ================= */
VIEWS.news = () => {
  const cats=["All","Releases","Industry","Culture","Guides","Features"];
  return { title:"News", html:`
  <header class="phead charcoal grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["News"]])}<h1 class="display">News &amp; stories</h1><p>Release news, industry milestones and culture from Sierra Leone’s music scene, with sources on every story.</p></div></header>
  <div class="wrap page"><div class="chips" role="group" aria-label="Filter stories">${cats.map(c=>`<button class="chip" type="button" data-cat="${c}" aria-pressed="${S.news===c}">${c}</button>`).join("")}</div><div id="newsout" class="mt-m" aria-live="polite"></div></div>`,
  after(main){
    const draw=()=>{ const list=D.articles.filter(a=>S.news==="All"||a.cat===S.news); if(!list.length){ $("#newsout").innerHTML=`<div class="empty"><p class="display">No stories yet</p></div>`; return; }
      const [f,...rest]=list;
      $("#newsout").innerHTML=`<div class="stories"><a class="story-feature" href="#story.${f.slug}"><div class="art panel panel-green grain"><span class="grooves spin" aria-hidden="true"></span>${pic(f.photo,{alt:"",sizes:"(min-width:900px) 35vw, 60vw"})}</div><div class="body"><span class="cat">${esc(f.cat)}</span><h2 style="font:400 clamp(28px,3.6vw,44px)/.95 var(--f-display);text-transform:uppercase">${esc(f.title)}</h2><p>${esc(f.summary)}</p><p class="date">${fmt(f.date)}</p></div></a><ul class="story-list">${rest.map(storyItem).join("")||'<li class="muted">No more stories in this category.</li>'}</ul></div>`; reveal($("#newsout")); };
    $$("[data-cat]",main).forEach(b=>b.addEventListener("click",()=>{S.news=b.dataset.cat;$$("[data-cat]",main).forEach(x=>x.setAttribute("aria-pressed",x===b));draw();})); draw();
  }};
};
VIEWS.story = r => {
  const n=story(r.slug); if(!n) return VIEWS.notfound(r);
  const a=n.artist?artist(n.artist):null; const more=D.articles.filter(x=>x.slug!==n.slug).slice(0,3);
  const relA=[a,...(n.related||[]).map(artist)].filter(Boolean).slice(0,4);
  return { title:n.title, html:`
  <div class="progress" id="prog" aria-hidden="true"></div>
  <article><header class="art-head"><div class="wrap">${crumbs([["Home","#"],["News","#news"],[n.cat]])}<span class="cat">${esc(n.cat)}</span><h1>${esc(n.title)}</h1><p class="summary">${esc(n.summary)}</p><div class="byline"><span>By ${esc(authorName(n))}</span>${n.sample?'<span class="tag tag-example">Sample article</span>':""}<span>${fmtLong(n.date)}</span></div><div class="share-row"><button class="btn btn-ghost btn-sm" type="button" data-share>Share</button><button class="btn btn-ghost btn-sm" type="button" data-copy>Copy link</button></div></div></header>
  <figure class="art-fig"><div class="art panel panel-blue grain"><span class="grooves spin" aria-hidden="true"></span>${pic(n.photo,{sizes:"(min-width:900px) 40vw, 80vw"})}</div><figcaption>${credit(n.photo)}</figcaption></figure>
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
  <header class="phead grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Events"]])}<h1 class="display">Events</h1><p>Concerts, launches, workshops and listening sessions across Sierra Leone.</p></div></header>
  <div class="wrap page">
    <div class="notice notice-warn" style="margin-bottom:24px"><strong>Sample listings</strong><span>These events show how listings, filters and statuses work. Confirmed shows with real lineups replace them at launch.</span></div>
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
      if(S.ev.fee==="Free"&&e.paid) return false; if(S.ev.fee==="Paid"&&!e.paid) return false; return true; }).sort((a,b)=>S.ev.when==="past"?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
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
    <div class="stack">${crumbs([["Home","#"],["Events","#events"],[e.title]])}<div class="row-wrap" style="gap:8px"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="tag">${esc(e.type)}</span><span class="tag tag-amber">Sample listing</span></div><h1 class="display">${esc(e.title)}</h1><p style="font-size:18px">${fmtLong(e.date)} · ${esc(e.time)}–${esc(e.end)} · ${esc(e.town)}</p></div>
  </div></header>
  <div class="wrap page"><div class="two-col"><div class="stack" style="gap:24px">${notice}<div class="prose"><p>${esc(e.desc)}</p></div>
    <dl class="detail-list"><div><dt>Date</dt><dd>${fmtLong(e.date)}</dd></div><div><dt>Time</dt><dd>${esc(e.time)} to ${esc(e.end)} (Freetown time)</dd></div><div><dt>Venue</dt><dd>${esc(e.venue)}<br><span class="muted">${esc(e.address)}</span></dd></div><div><dt>Lineup</dt><dd>${esc(e.lineup)}</dd></div><div><dt>Organiser</dt><dd>${esc(e.organiser)}</dd></div><div><dt>Tickets</dt><dd>${esc(e.paid?e.price:"Free entry")}</dd></div></dl></div>
  <aside class="stack" style="align-content:start;gap:16px">
    <div class="aside-box"><h2>Tickets</h2><button class="btn btn-primary" type="button" aria-disabled="true">${st==="cancelled"||st==="completed"?"Tickets unavailable":st==="sold-out"?"Sold out":"Booking link pending"}</button>${st==="upcoming"?'<p class="paid-note">The organiser’s external booking link appears here once supplied.</p>':""}</div>
    <div class="aside-box"><h2>Add to calendar</h2>${canAdd?`<a class="btn btn-ghost btn-sm" href="${g}" target="_blank" rel="noopener">Google Calendar</a><button class="btn btn-ghost btn-sm" type="button" data-ics>Download .ics file</button><p class="paid-note">For Apple Calendar and Outlook. If your browser blocks the download, use Copy details.</p>`:`<p class="muted" style="font-size:14px">Not available for ${STATUS_LABEL[st].toLowerCase()} events.</p>`}<button class="btn btn-ghost btn-sm" type="button" data-copyd>Copy details</button></div>
    <div class="aside-box"><h2>Share</h2><button class="btn btn-ghost btn-sm" type="button" data-share>Share event</button></div>
  </aside></div>
  <section class="section" style="padding-bottom:0"><h2 class="display" style="font-size:36px;margin-bottom:16px">More events</h2><ul class="evlist">${D.events.filter(x=>x.slug!==e.slug&&evStatus(x)==="upcoming").slice(0,3).map(evRow).join("")}</ul></section></div>`,
  after(main){
    const ib=$("[data-ics]",main); if(ib) ib.addEventListener("click",()=>{ try{ const u=URL.createObjectURL(new Blob([ics.text],{type:"text/calendar"})); const a=document.createElement("a"); a.href=u; a.download=e.slug+".ics"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),2000); toast("Calendar file prepared"); }catch(err){ toast("Download blocked. Use Copy details instead."); } });
    $("[data-copyd]",main).addEventListener("click",()=>copyText(`${e.title}\n${fmtLong(e.date)}, ${e.time}–${e.end}\n${e.venue}, ${e.address}`,"Event details copied"));
    $("[data-share]",main).addEventListener("click",()=>share(document.title));
  }};
};

/* ================= VIDEOS ================= */
VIEWS.videos = () => ({ title:"Videos", html:`
  <header class="phead charcoal grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Videos"]])}<h1 class="display">Videos</h1><p>Music videos from Sierra Leone’s artists. Players load only when you press play and never start with sound on their own.</p></div></header>
  <div class="wrap page"><div class="vid-grid" id="vout">${D.videos.map(vidCard).join("")}</div><p class="paid-note mt-m">Official video links will be embedded once confirmed. Until then, each card opens a YouTube search.</p></div>`,
  after(main){ bindVideos(main); } });

/* ================= GALLERY ================= */
const GAL_BG=["panel-blue","panel-green","panel-charcoal","panel-paper"];
const galItem=(k,i,col="")=>`<button class="gal-item panel ${GAL_BG[i%4]} grain reveal" type="button" data-photo="${k}" data-col="${col}" aria-label="Open photo: ${esc(P[k].alt)}">${pic(k,{alt:"",sizes:"(min-width:768px) 24vw, 46vw"})}</button>`;
VIEWS.gallery = () => ({ title:"Gallery", html:`
  <header class="phead green grain"><span class="grooves spin" aria-hidden="true"></span><div class="wrap">${crumbs([["Home","#"],["Gallery"]])}<h1 class="display">Gallery</h1><p>Monochrome portraits of Salone’s artists, plus illustrative studio and stage photography.</p></div></header>
  <div class="wrap page stack" style="gap:56px">${D.gallery.map(c=>`<section aria-labelledby="g-${c.slug}"><div class="sec-head" style="margin-bottom:16px"><h2 id="g-${c.slug}" class="display" style="font-size:clamp(28px,4vw,44px)">${esc(c.title)}</h2><span class="count">${c.items.length} photos</span></div><div class="gal-grid">${c.items.map((k,i)=>galItem(k,i,c.slug)).join("")}</div></section>`).join("")}</div>`,
  after(main){ bindGallery(main); } });
function bindGallery(root){ $$(".gal-item",root).forEach(b=>b.addEventListener("click",()=>{ const col=b.dataset.col; const list=col?D.gallery.find(g=>g.slug===col).items:[b.dataset.photo]; openLightbox(list,list.indexOf(b.dataset.photo),b); })); }
let lb={list:[],i:0,opener:null};
function openLightbox(list,i,opener){ lb={list,i,opener}; $("#lightbox").hidden=false; document.body.classList.add("locked"); drawLB(); $("#lb-close").focus(); }
function drawLB(){ const k=lb.list[lb.i], p=P[k];
  $("#lb-fig").innerHTML=`<div class="bg panel ${GAL_BG[lb.i%4]}">${pic(k,{sizes:"80vw",eager:true})}</div>`;
  $("#lb-cap").innerHTML=`<span>${esc(p.alt)}</span><span class="credit">${credSource(k)}: <a href="${p.page}" target="_blank" rel="noopener" style="color:#fff">${esc(p.by)}</a></span>`;
  $("#lb-count").textContent=`${lb.i+1} of ${lb.list.length}`; $$(".lb-nav").forEach(n=>n.hidden=lb.list.length<2); }
function closeLB(){ $("#lightbox").hidden=true; document.body.classList.remove("locked"); if(lb.opener) lb.opener.focus(); }
function lbStep(d){ lb.i=(lb.i+d+lb.list.length)%lb.list.length; drawLB(); }

/* ================= PROMOTE ================= */
VIEWS.promote = () => ({ title:"Promote With Us", html:`
  <section class="promo grain on-dark"><div class="promo-copy">${crumbs([["Home","#"],["Promote With Us"]])}<h1 class="display" style="font-size:clamp(44px,8vw,96px);line-height:.9">Promote <em style="font-style:normal;color:var(--green)">with us</em></h1><p>Put your music, profile or event in front of fans who come to Salone Lyrics to read, watch and discover. Every paid placement is clearly labelled Promoted.</p><div class="row-wrap"><a class="btn btn-green" href="#promote" data-jump="#enquiry">Request a Quote</a><a class="arrow-link" style="color:#fff" href="#promote" data-jump="#services">Compare services</a></div></div>
  <div class="promo-art panel"><span class="grooves spin" aria-hidden="true"></span><div class="floaty">${pic("seated-studio",{cls:"cut cut-shadow",eager:true,sizes:"(min-width:900px) 40vw, 80vw"})}</div><div class="promo-cred">${credit("seated-studio","Illustrative image. ")}</div></div></section>
  ${marquee(["Profiles","Releases","Spotlight","Events","Social","Campaigns"])}
  <section class="section" aria-labelledby="ours-h"><div class="wrap"><div class="numsvc">
    <div class="stack reveal" style="align-content:start;gap:16px"><span class="side-tag">What we do</span><h2 id="ours-h" class="display sec-title">Our <span class="hl">services</span></h2><p class="muted" style="max-width:44ch">Choose one placement or combine them into a campaign. The team replies with options and timing.</p>
      <ol class="num-list">${D.services.map((s,i)=>`<li><a href="#promote" data-pick="${s.id}"><span class="no tnum">${String(i+1).padStart(2,"0")}</span><span class="nm">${esc(s.name)}</span><span class="ar" aria-hidden="true">${ICON.arrow}</span></a></li>`).join("")}</ol></div>
    <div class="numsvc-art reveal"><div class="panel panel-charcoal grain numsvc-photo"><span class="grooves spin" aria-hidden="true"></span>${pic("vocalist-studio",{sizes:"(min-width:900px) 40vw, 90vw",alt:""})}</div>
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
    <div class="about-split mt-l"><div class="prose reveal"><h2 class="display" style="font-size:32px">How we check lyrics</h2><p>Lyrics and credits are confirmed with the artist or their team before publication. Readers can suggest corrections from any song page, and an editor reviews each one.</p></div><div class="prose reveal"><h2 class="display" style="font-size:32px">Promoted content</h2><p>Paid placements are always labelled Promoted. Promotion never appears inside lyric text.</p></div></div>
    <section class="mt-l" aria-labelledby="team-a"><div class="sec-head"><h2 id="team-a" class="display sec-title">Meet the team</h2></div>${teamGrid()}</section>
    <p class="mt-m"><a class="link" href="#credits">Photo credits and sources</a></p>
  </div>` });
VIEWS.contact = () => ({ title:"Contact", html:`
  <header class="phead charcoal"><div class="wrap">${crumbs([["Home","#"],["Contact"]])}<h1 class="display">Contact</h1><p>Questions, corrections, partnerships, press or writing for Salone Lyrics. For paid placements, use the promotion enquiry.</p></div></header>
  <div class="wrap page"><div class="two-col"><form id="cform" class="stack" novalidate style="max-width:640px">
    <div class="fgrid"><div class="field"><label for="cf-n">Name <span class="req">*</span></label><input id="cf-n" class="input" autocomplete="name" required><p class="err" id="cf-n-e" hidden></p></div><div class="field"><label for="cf-e">Email <span class="req">*</span></label><input id="cf-e" class="input" type="email" autocomplete="email" required><p class="err" id="cf-e-e" hidden></p></div>
    <div class="field full"><label for="cf-t">Topic</label><select id="cf-t" class="select"><option>General question</option><option>Lyrics submission or correction</option><option>Write for Salone Lyrics</option><option>Press and interviews</option><option>Partnership</option></select></div>
    <div class="field full"><label for="cf-m">Message <span class="req">*</span></label><textarea id="cf-m" class="input" required></textarea><p class="err" id="cf-m-e" hidden></p></div></div>
    <div><button class="btn btn-primary" type="submit">Send message</button></div><div id="cf-msg" aria-live="polite"></div></form>
    <aside class="stack" style="align-content:start"><div class="aside-box"><h2>Follow Salone Lyrics</h2><a class="arrow-link" href="https://www.instagram.com/salonelyrics/" target="_blank" rel="noopener">Instagram @salonelyrics</a><a class="arrow-link" href="https://www.tiktok.com/@salonelyrics" target="_blank" rel="noopener">TikTok @salonelyrics</a></div><div class="aside-box"><h2>Promote your music</h2><a class="btn btn-green" href="#promote">Promote With Us</a></div></aside></div></div>`,
  after(main){ $("#cform",main).addEventListener("submit",e=>{ e.preventDefault(); let first=null;
    [["cf-n","Enter your name."],["cf-e","Enter your email."],["cf-m","Write a short message."]].forEach(([id,m])=>{ const el=$("#"+id); let bad=!el.value.trim(); if(id==="cf-e"&&!bad&&!/^\S+@\S+\.\S+$/.test(el.value)){bad=true;m="Enter an email address like name@example.com.";} el.setAttribute("aria-invalid",bad); $("#"+id+"-e").hidden=!bad; $("#"+id+"-e").textContent=m; if(bad&&!first) first=el; });
    if(first){first.focus();return;}
    $("#cf-msg").innerHTML=`<div class="notice notice-info"><strong>Message ready</strong><span>This preview isn’t connected to an inbox yet, so your message has not been sent. Please reach Salone Lyrics on Instagram or TikTok for now.</span></div>`; }); } });
VIEWS.credits = () => ({ title:"Photo credits", html:`
  <header class="phead paper"><div class="wrap">${crumbs([["Home","#"],["About","#about"],["Photo credits"]])}<h1 class="display">Photo credits</h1><p>Artist photos come from press and profile images, and illustrative photos come from Pexels. Every image was cut out and converted to black and white for this design.</p></div></header>
  <div class="wrap page"><div class="notice notice-warn" style="margin-bottom:24px"><strong>Permission needed before launch</strong><span>Artist photos are used for this private preview only. Salone Lyrics should obtain approval or official photos from each artist or photographer before the site is public.</span></div>
  <div class="table-wrap"><table class="creds-table"><thead><tr><th>Image</th><th>Description</th><th>Source</th><th>Type</th><th>Link</th></tr></thead><tbody>${Object.entries(P).map(([k,p])=>`<tr><td><div class="th">${pic(k,{sizes:"56px",alt:""})}</div></td><td>${esc(p.alt)}</td><td>${esc(p.by)}</td><td>${p.press?"Artist press/profile image":"Pexels (illustrative)"}</td><td><a class="link" href="${p.page}" target="_blank" rel="noopener">View source</a></td></tr>`).join("")}</tbody></table></div></div>` });
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
    if(s.lyrics){ for(const [,lines] of s.lyrics){ const l=lines.find(hit); if(l){ out.Songs.push({score:1,kind:"song",slug:s.slug,t:s.title+" (demo)",s:`“${l}”`,photo:a.photo,an:a}); break; } } } });
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
function openSearch(q){ const dlg=$("#sdlg"), inp=$("#sq"); sOpener=document.activeElement; dlg.hidden=false; document.body.classList.add("locked"); inp.value=q!=null?q:S.search.q; S.search.q=inp.value; runSearch(true); setTimeout(()=>{inp.focus(); inp.select();},10); }
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
function bindNewsletter(){ $("#nl").addEventListener("submit",e=>{ e.preventDefault(); const i=$("#nl-e"), m=$("#nl-msg");
  if(!/^\S+@\S+\.\S+$/.test(i.value)){ i.setAttribute("aria-invalid","true"); m.className="form-msg err"; m.textContent="Enter an email address like name@example.com."; i.focus(); return; }
  i.setAttribute("aria-invalid","false"); m.className="form-msg ok"; m.textContent="Tenki! This preview has no mailing list connected, so you have not been subscribed yet."; }); }
document.addEventListener("click",e=>{ const c=e.target.closest("[data-copytext]"); if(c) copyText(c.dataset.copytext,"Copied"); const s=e.target.closest("[data-open-search-btn]"); if(s) openSearch(); });
/* Artist peek card */
let peekOpener=null;
function openPeek(slug,btn){
  const a=artist(slug), pk=$("#peek"); if(!a) return; peekOpener=btn;
  const songs=SONGS().filter(s=>s.artist===a.slug).slice(0,3);
  $("#peek-body").innerHTML=`<div class="peek-img panel ${panelCls(D.artists.indexOf(a))}"><span class="grooves spin" aria-hidden="true"></span>${portrait(a,{sizes:"280px",eager:true})}</div>
    <div class="peek-txt"><div class="row-wrap" style="gap:6px">${a.hot?`<span class="tag tag-hot">#${a.hot} Hottest 2025</span>`:""}<span class="tag">${esc(a.genre)}</span></div>
    <h2 id="peek-title" class="display">${esc(a.name)}</h2><p>${esc(a.intro)}</p>
    ${songs.length?`<p class="peek-songs"><strong>Songs:</strong> ${songs.map(s=>`<a class="link" href="#song.${s.slug}">${esc(s.title)}</a>`).join(", ")}</p>`:""}
    <div class="row-wrap"><a class="btn btn-primary btn-sm" href="#artist.${a.slug}">View profile</a></div>${a.photo?credit(a.photo):""}</div>`;
  pk.hidden=false;
  const r=btn.getBoundingClientRect(), box=$(".peek-box",pk);
  if(window.innerWidth>=700){ const w=box.offsetWidth, h=box.offsetHeight; let x=Math.min(Math.max(12,r.left),window.innerWidth-w-12); let y=r.bottom+10; if(y+h>window.innerHeight-12) y=Math.max(12,r.top-h-10); box.style.left=x+"px"; box.style.top=y+"px"; }
  else { box.style.left=""; box.style.top=""; }
  $("#peek-close").focus();
}
document.addEventListener("DOMContentLoaded",()=>{ const c=$("#peek-close"); if(c) c.addEventListener("click",()=>closePeek()); });
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
