/* ============================================================================
   JUEGOS GEMB — App principal (login Google + Firestore + 4 juegos)
   Gimnasio Emocional Mentes Brillantes
   ============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---- Configuración de TU Firebase (proyecto juegos-gemb) ---- */
const firebaseConfig = {
  apiKey: "AIzaSyDL_QIvibmcBpcIDzoR-uRnQW6U9ah7Tzo",
  authDomain: "juegos-gemb.firebaseapp.com",
  projectId: "juegos-gemb",
  storageBucket: "juegos-gemb.firebasestorage.app",
  messagingSenderId: "788311540557",
  appId: "1:788311540557:web:9051b2e214eedaf0c16d04"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

const C = window.GEMB_CONTENT || {};
const $ = s => document.querySelector(s);
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => String(s).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
/* solo mostramos fotos servidas por Google (evita rastreadores/URLs maliciosas) */
const safeImg = u => (typeof u === "string" && /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(u)) ? esc(u) : "";
const MAX_SCORE = 100000, MAX_NAME = 60;

let currentUser = null;
let timers = [];
const clearTimers = () => { timers.forEach(t=>clearInterval(t)); timers=[]; };

/* =========================== AUTENTICACIÓN =========================== */
async function signIn(){
  try { await signInWithPopup(auth, provider); }
  catch(e){ console.warn(e); alert("No se pudo iniciar sesión con Google. Intenta de nuevo."); }
}
const signOutUser = () => signOut(auth);

onAuthStateChanged(auth, async u=>{
  currentUser = u;
  renderTop();
  if(u){
    try{
      await setDoc(doc(db,"users",u.uid),
        { name:(u.displayName||"Anónimo").slice(0,MAX_NAME), photo:safeImg(u.photoURL), lastSeen:serverTimestamp() },
        { merge:true });
    }catch(e){ console.warn("perfil:", e.code||e); }
  }
  route(); // re-render vista actual (algunas dependen de sesión)
});

function renderTop(){
  const box = $("#userbox");
  if(currentUser){
    const ph = safeImg(currentUser.photoURL);
    box.innerHTML = `
      ${ph?`<img src="${ph}" alt="" referrerpolicy="no-referrer"/>`:''}
      <span class="nm">${esc(currentUser.displayName||'Tú')}</span>
      <button class="btn ghost small" id="logoutBtn">Salir</button>`;
    $("#logoutBtn").onclick = signOutUser;
  }else{
    box.innerHTML = `<button class="btn google small" id="loginBtn"><span class="g">G</span> Entrar con Google</button>`;
    $("#loginBtn").onclick = signIn;
  }
}

/* =========================== DATOS (Firestore) =========================== */
async function saveScore(game, score){
  if(!currentUser) return null;
  score = Math.max(0, Math.min(MAX_SCORE, Math.round(Number(score)||0)));
  try{
    const ref = doc(db,"leaderboard",game,"entries",currentUser.uid);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data().score||0) : 0;
    if(score > prev){
      await setDoc(ref,{ uid:currentUser.uid, name:(currentUser.displayName||"Anónimo").slice(0,MAX_NAME),
        photo:safeImg(currentUser.photoURL), score, updatedAt:serverTimestamp() });
    }
    return Math.max(prev, score);
  }catch(e){ console.warn("saveScore:", e.code||e); return null; }
}
async function loadLeaderboard(game){
  try{
    const q = query(collection(db,"leaderboard",game,"entries"), orderBy("score","desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d=>d.data());
  }catch(e){ console.warn("leaderboard:", e.code||e); return null; }
}
async function saveReflection(prompt, texto){
  if(!currentUser) return false;
  try{
    await addDoc(collection(db,"users",currentUser.uid,"reflexiones"),
      { prompt, texto, createdAt:serverTimestamp() });
    return true;
  }catch(e){ console.warn("reflexion:", e.code||e); return false; }
}
async function loadReflections(){
  if(!currentUser) return [];
  try{
    const q = query(collection(db,"users",currentUser.uid,"reflexiones"), orderBy("createdAt","desc"), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d=>d.data());
  }catch(e){ console.warn("reflexiones:", e.code||e); return []; }
}

/* =========================== HELPERS UI =========================== */
const app$ = () => $("#app");
function mount(html){
  clearTimers();
  if(window.GEMB_STORY) window.GEMB_STORY.destroy();
  app$().innerHTML = html;
  window.scrollTo({top:0,behavior:"smooth"});
}
function loginNeeded(){ return `<p class="locked-msg">Para guardar tu progreso y aparecer en el ranking, <b>entra con Google</b> arriba a la derecha. También puedes jugar en modo práctica.</p>`; }
function backBtn(){ return `<div class="center back"><a class="btn ghost" href="#portal">← Volver al inicio</a></div>`; }
function rankHTML(list, myScore){
  if(list===null) return `<p class="locked-msg">El ranking se activará cuando se publiquen las reglas de Firestore.</p>`;
  if(!list.length) return `<p class="locked-msg">Aún nadie tiene puntaje. ¡Sé el primero!</p>`;
  return `<ul>${list.map((r,i)=>{
    const ph = safeImg(r.photo);
    return `
    <li class="${currentUser&&r.uid===currentUser.uid?'me':''}">
      <span class="pos">${i+1}</span>
      ${ph?`<img src="${ph}" referrerpolicy="no-referrer" alt=""/>`:''}
      <span class="nm">${esc(String(r.name||'Anónimo').slice(0,MAX_NAME))}</span>
      <span class="pt">${Math.min(MAX_SCORE,Number(r.score)||0).toLocaleString('es')}</span>
    </li>`;}).join("")}</ul>`;
}
function popPoints(txt){ const p=document.createElement("div"); p.className="pop-pts"; p.textContent=txt; document.body.appendChild(p); setTimeout(()=>p.remove(),1000); }

/* =========================== PORTAL =========================== */
const GAMES = [
  { id:"contrarreloj", emoji:"⏱", code:"01", color:"var(--gold)", kicker:"Velocidad + intuición", nombre:"Pulso Emocional", desc:"Dos minutos. Muchas emociones. Confía en lo que sabes y responde antes de que se apague la estrella." },
  { id:"empareja", emoji:"✦", code:"02", color:"var(--teal)", kicker:"Conecta + descubre", nombre:"Constelación de Emociones", desc:"Traza puentes entre cada emoción y el mensaje que trae para ti." },
  { id:"memoria", emoji:"◉", code:"03", color:"var(--rose)", kicker:"Memoria + atención", nombre:"Ecos de la Memoria", desc:"Encuentra parejas escondidas en un jardín de símbolos emocionales." },
  { id:"reflexion", emoji:"❋", code:"04", color:"var(--violet)", kicker:"Pausa + escritura", nombre:"Oráculo Interior", desc:"Una pregunta inesperada abre la puerta a tu diario personal y privado." }
];
function renderPortal(){
  mount(`
    <section class="hero" id="inicio">
      <div class="hero-copy">
        <div class="eyebrow"><i></i> Tu aventura empieza por dentro</div>
        <h1>Enciende tu mente.<br><em>Escucha lo que sientes.</em></h1>
        <p class="sub">Un universo de juegos para reconocer tus emociones, crear nuevas historias y descubrir todo lo brillante que ya vive en ti.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#portales">Entrar al universo <span>↗</span></a>
          <button class="btn btn-whisper" id="breatheBtn" type="button"><span class="breath-dot"></span> Respira conmigo</button>
        </div>
        <div class="micro-proof"><span>✦ Sin presión</span><span>✦ A tu ritmo</span><span>✦ Hecho para sentir</span></div>
      </div>
      <div class="hero-being" aria-label="La nueva mascota de Mentes Brillantes">
        <div class="logo-rings"><i></i><i></i><i></i></div>
        <img src="assets/logo-640.webp" alt="Árbol y cerebros sonrientes sobre un libro, símbolo de Mentes Brillantes" />
        <span class="float-note n1">curiosidad</span><span class="float-note n2">calma</span><span class="float-note n3">valor</span>
      </div>
      <div class="scroll-signal"><span>DESLIZA PARA EXPLORAR</span><i></i></div>
    </section>
    <section class="portal-intro" id="portales">
      <div><span class="section-no">01 — TUS MUNDOS</span><h2>¿Qué quieres entrenar hoy?</h2></div>
      <p>No hay respuestas perfectas aquí. Solo caminos distintos para conocerte mejor.</p>
    </section>
    <div class="grid world-grid">
      ${GAMES.map(g=>`
        <div class="game" data-go="${g.id}">
          <div class="game-number">${g.code}</div>
          <span class="accent" style="--accent:${g.color}"></span>
          <div class="game-orb" style="--accent:${g.color}"><span>${g.emoji}</span><i></i></div>
          <div class="game-kicker">${g.kicker}</div>
          <h3>${g.nombre}</h3>
          <p>${g.desc}</p>
          <div class="go">Abrir portal <span>↗</span></div>
        </div>`).join("")}
    </div>
    <section class="story-teaser story-is-live">
      <div class="story-stars" aria-hidden="true">✦ <i>✦</i> <b>✦</b></div>
      <div class="story-copy"><span class="section-no">02 — CUENTO INTERACTIVO · YA DISPONIBLE</span><h2>El libro que perdió<br>sus emociones.</h2><p>Entra al Bosque de los Ecos, conoce a Murmullo y descubre que sentir miedo no te hace menos valiente. Tus decisiones transforman la historia.</p><button class="btn btn-story" type="button" id="storyBtn">Comenzar el prólogo <span>→</span></button></div>
      <div class="story-preview"><img src="assets/story/story-cover.webp" alt="Un libro mágico abre caminos de colores hacia mundos emocionales" loading="lazy" /><span>8–10 min · guarda tu avance</span></div>
    </section>
    <p class="disclaimer">${esc(C.aviso||"")}</p>
    <footer><img src="assets/logo-160.webp" alt="" /><span><b>Mentes Brillantes</b><small>Juega · siente · crece</small></span><em>Hecho con emoción en Colombia ✦</em></footer>
  `);
  app$().querySelectorAll("[data-go]").forEach(c=> c.onclick=()=> location.hash="#"+c.dataset.go );
  const breathe=$("#breatheBtn");
  if(breathe) breathe.onclick=()=>{
    breathe.classList.add("is-breathing");
    breathe.innerHTML='<span class="breath-dot"></span> Inhala…';
    setTimeout(()=>breathe.innerHTML='<span class="breath-dot"></span> Exhala…',3200);
    setTimeout(()=>{breathe.classList.remove("is-breathing");breathe.innerHTML='<span class="breath-dot"></span> Respira conmigo';},6400);
  };
  const story=$("#storyBtn");
  if(story) story.onclick=()=>{ location.hash="#cuento"; };
  initPortalMotion();
}

function initPortalMotion(){
  const hero=app$().querySelector(".hero");
  const being=app$().querySelector(".hero-being");
  if(!hero||!being||matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.onpointermove=e=>{
    const r=hero.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    being.style.setProperty("--mx",`${x*18}px`); being.style.setProperty("--my",`${y*14}px`);
  };
  app$().querySelectorAll(".game").forEach(card=> card.onpointermove=e=>{
    const r=card.getBoundingClientRect(); card.style.setProperty("--x",`${e.clientX-r.left}px`); card.style.setProperty("--y",`${e.clientY-r.top}px`);
  });
}

/* =========================== JUEGO 1: CONTRARRELOJ =========================== */
const GAME_SECONDS=120, Q_WINDOW=15, BASE_PTS=500, SPEED_PTS=500;
let cr = {};
function renderContrarreloj(){
  mount(`
    <div class="panel">
      <h2>⏱️ Contrarreloj Emocional</h2>
      <p class="lead">Responde la mayor cantidad de preguntas <b>bien</b> y <b>rápido</b>. Acertar suma; entre más veloz, más bono. Fallar no suma.</p>
      <div class="center"><button class="btn" id="crStart">Empezar ▶</button></div>
      ${currentUser?'':loginNeeded()}
      ${backBtn()}
    </div>`);
  $("#crStart").onclick = crCountdown;
}
function crCountdown(){
  mount(`<div class="panel center"><p class="lead">¡Prepárate!</p><div style="font-size:6rem;font-weight:900;color:var(--gold-soft)" id="crNum">3</div></div>`);
  let n=3;
  const iv=setInterval(()=>{ n--; if(n<=0){clearInterval(iv);crBegin();return;} $("#crNum").textContent=n; },800);
  timers.push(iv);
}
function crBegin(){
  cr={ pool:shuffle(C.eq||[]), idx:0, score:0, hits:0, answers:0, timeLeft:GAME_SECONDS, qStart:0, locked:false };
  mount(`
    <div class="hud">
      <div class="stat"><div class="k">Tiempo</div><div class="v" id="crTime">2:00</div></div>
      <div class="stat"><div class="k">Aciertos</div><div class="v" id="crHits">0</div></div>
      <div class="stat"><div class="k">Puntos</div><div class="v" id="crScore">0</div></div>
    </div>
    <div class="timebar"><i id="crBar"></i></div>
    <div class="qcard">
      <div class="qnum" id="crQn">Pregunta 1</div>
      <div class="qtext" id="crQt">—</div>
      <div class="opts" id="crOpts"></div>
      <div class="feedback" id="crFb"></div>
    </div>`);
  const iv=setInterval(()=>{ cr.timeLeft--; crHud(); if(cr.timeLeft<=0) crEnd(); },1000);
  timers.push(iv);
  crHud(); crNext();
}
function crHud(){
  const m=Math.floor(cr.timeLeft/60), s=cr.timeLeft%60;
  $("#crTime").textContent=m+":"+String(s).padStart(2,"0");
  $("#crHits").textContent=cr.hits;
  $("#crScore").textContent=cr.score.toLocaleString('es');
  $("#crBar").style.width=(cr.timeLeft/GAME_SECONDS*100)+"%";
}
function crNext(){
  if(cr.timeLeft<=0) return;
  if(!cr.pool.length){ $("#crQt").textContent="No hay preguntas cargadas."; return; }
  if(cr.idx>=cr.pool.length){ cr.pool=shuffle(C.eq); cr.idx=0; }
  const it=cr.pool[cr.idx]; cr.locked=false; cr.qStart=Date.now();
  $("#crQn").textContent="Pregunta "+(cr.answers+1);
  $("#crQt").textContent=it.q; $("#crFb").textContent="";
  const box=$("#crOpts"); box.innerHTML=""; const L=["A","B","C","D","E"];
  it.op.forEach((op,i)=>{ const b=document.createElement("button"); b.className="opt";
    b.innerHTML=`<span class="letter">${L[i]}</span><span>${esc(op)}</span>`;
    b.onclick=()=>crAnswer(i,it,b); box.appendChild(b); });
}
function crAnswer(i,it,btn){
  if(cr.locked) return; cr.locked=true; cr.answers++;
  const opts=[...document.querySelectorAll("#crOpts .opt")];
  opts.forEach(o=>o.classList.add("disabled"));
  if(i===it.correcta){
    const secs=(Date.now()-cr.qStart)/1000;
    const pts=BASE_PTS+Math.round(SPEED_PTS*Math.max(0,(Q_WINDOW-secs)/Q_WINDOW));
    cr.score+=pts; cr.hits++; btn.classList.add("correct"); popPoints("+"+pts);
  }else{ btn.classList.add("wrong"); opts[it.correcta].classList.add("correct"); }
  if(it.nota) $("#crFb").textContent="💡 "+it.nota;
  crHud();
  const t=setTimeout(()=>{ cr.idx++; crNext(); }, it.nota?1600:700);
  timers.push(t);
}
async function crEnd(){
  clearTimers();
  mount(`<div class="panel center">
      <h2>¡Terminó! 🎉</h2>
      <p class="lead">Tu puntaje</p>
      <div style="font-size:3.4rem;font-weight:900;color:var(--gold-soft)">${cr.score.toLocaleString('es')}</div>
      <p class="lead">${cr.hits} aciertos</p>
      <div class="rank" id="crRank"><h4>🏆 Ranking — Contrarreloj</h4><p class="locked-msg">Cargando…</p></div>
      <div class="row"><button class="btn" id="crAgain">Jugar otra vez 🔁</button><a class="btn ghost" href="#portal">← Inicio</a></div>
      ${currentUser?'':loginNeeded()}
    </div>`);
  $("#crAgain").onclick=renderContrarreloj;
  const best = await saveScore("contrarreloj", cr.score);
  const list = await loadLeaderboard("contrarreloj");
  const rank=$("#crRank"); if(rank) rank.innerHTML=`<h4>🏆 Ranking — Contrarreloj</h4>`+rankHTML(list,best);
}

/* =========================== JUEGO 2: EMPAREJA =========================== */
let em={};
function renderEmpareja(){
  const data=shuffle(C.pares||[]).slice(0,6);
  em={ pairs:data, sel:null, done:0, errors:0, start:Date.now() };
  mount(`
    <div class="panel">
      <h2>🧩 Empareja Emociones</h2>
      <p class="lead">Toca una emoción y luego para qué nos sirve. Forma las 6 parejas.</p>
      <div class="hud"><div class="stat"><div class="k">Parejas</div><div class="v" id="emDone">0/${data.length}</div></div>
        <div class="stat"><div class="k">Errores</div><div class="v" id="emErr">0</div></div></div>
      <div class="match-cols">
        <div class="match-col" id="emL">${data.map((p,i)=>`<div class="chip" data-side="L" data-i="${i}">${esc(p.emocion)}</div>`).join("")}</div>
        <div class="match-col" id="emR">${shuffle(data.map((p,i)=>({i,t:p.definicion}))).map(o=>`<div class="chip" data-side="R" data-i="${o.i}">${esc(o.t)}</div>`).join("")}</div>
      </div>
      <div class="feedback" id="emFb"></div>
      ${currentUser?'':loginNeeded()}
      ${backBtn()}
    </div>`);
  app$().querySelectorAll(".chip").forEach(ch=> ch.onclick=()=>emPick(ch));
}
function emPick(ch){
  if(ch.classList.contains("done")) return;
  if(!em.sel){ em.sel=ch; ch.classList.add("sel"); return; }
  if(em.sel===ch){ ch.classList.remove("sel"); em.sel=null; return; }
  if(em.sel.dataset.side===ch.dataset.side){ em.sel.classList.remove("sel"); em.sel=ch; ch.classList.add("sel"); return; }
  // comparar
  if(em.sel.dataset.i===ch.dataset.i){
    em.sel.classList.remove("sel"); em.sel.classList.add("done"); ch.classList.add("done");
    em.done++; $("#emDone").textContent=em.done+"/"+em.pairs.length; em.sel=null;
    if(em.done===em.pairs.length) emEnd();
  }else{
    const a=em.sel, b=ch; a.classList.add("err"); b.classList.add("err"); em.errors++; $("#emErr").textContent=em.errors;
    setTimeout(()=>{ a.classList.remove("err","sel"); b.classList.remove("err"); },350); em.sel=null;
  }
}
async function emEnd(){
  const secs=Math.round((Date.now()-em.start)/1000);
  const score=Math.max(0, em.pairs.length*200 + Math.max(0,600-secs*5) - em.errors*25);
  const fb=$("#emFb"); if(fb) fb.innerHTML=`✅ ¡Completado en ${secs}s con ${em.errors} errores! · <b>${score} pts</b>`;
  const best=await saveScore("empareja",score); const list=await loadLeaderboard("empareja");
  const panel=app$().querySelector(".panel");
  panel.insertAdjacentHTML("beforeend",`<div class="rank"><h4>🏆 Ranking — Empareja</h4>${rankHTML(list,best)}</div>
     <div class="row"><button class="btn" id="emAgain">Jugar otra vez 🔁</button><a class="btn ghost" href="#portal">← Inicio</a></div>`);
  $("#emAgain").onclick=renderEmpareja;
}

/* =========================== JUEGO 3: MEMORIA =========================== */
let mm={};
function renderMemoria(){
  const base=shuffle(C.memoria||[]).slice(0,8);
  const cards=shuffle(base.flatMap((p,i)=>[{pid:i,face:p.icono},{pid:i,face:p.palabra}]));
  mm={ cards, flipped:[], matched:0, moves:0, lock:false, start:Date.now(), total:base.length };
  mount(`
    <div class="panel">
      <h2>🃏 Memoria Emocional</h2>
      <p class="lead">Encuentra las ${base.length} parejas (emoji ↔ emoción).</p>
      <div class="hud"><div class="stat"><div class="k">Parejas</div><div class="v" id="mmM">0/${base.length}</div></div>
        <div class="stat"><div class="k">Intentos</div><div class="v" id="mmMv">0</div></div></div>
      <div class="mem-grid" id="mmGrid">
        ${cards.map((c,i)=>`<div class="mcard" data-i="${i}"><span class="in">${esc(c.face)}</span></div>`).join("")}
      </div>
      <div class="feedback" id="mmFb"></div>
      ${currentUser?'':loginNeeded()}
      ${backBtn()}
    </div>`);
  app$().querySelectorAll(".mcard").forEach(cd=> cd.onclick=()=>mmFlip(cd));
}
function mmFlip(cd){
  if(mm.lock||cd.classList.contains("flip")||cd.classList.contains("done")) return;
  cd.classList.add("flip"); mm.flipped.push(cd);
  if(mm.flipped.length===2){
    mm.moves++; $("#mmMv").textContent=mm.moves; mm.lock=true;
    const [a,b]=mm.flipped;
    if(mm.cards[a.dataset.i].pid===mm.cards[b.dataset.i].pid){
      setTimeout(()=>{ a.classList.add("done"); b.classList.add("done"); mm.flipped=[]; mm.lock=false;
        mm.matched++; $("#mmM").textContent=mm.matched+"/"+mm.total; if(mm.matched===mm.total) mmEnd(); },380);
    }else{
      setTimeout(()=>{ a.classList.remove("flip"); b.classList.remove("flip"); mm.flipped=[]; mm.lock=false; },800);
    }
  }
}
async function mmEnd(){
  const secs=Math.round((Date.now()-mm.start)/1000);
  const score=Math.max(0, mm.total*150 + Math.max(0,800-mm.moves*20-secs*3));
  const fb=$("#mmFb"); if(fb) fb.innerHTML=`✅ ¡Listo en ${mm.moves} intentos y ${secs}s! · <b>${score} pts</b>`;
  const best=await saveScore("memoria",score); const list=await loadLeaderboard("memoria");
  app$().querySelector(".panel").insertAdjacentHTML("beforeend",
    `<div class="rank"><h4>🏆 Ranking — Memoria</h4>${rankHTML(list,best)}</div>
     <div class="row"><button class="btn" id="mmAgain">Jugar otra vez 🔁</button><a class="btn ghost" href="#portal">← Inicio</a></div>`);
  $("#mmAgain").onclick=renderMemoria;
}

/* =========================== JUEGO 4: REFLEXIÓN =========================== */
let rf={};
function pickReflexion(){ const arr=C.reflexiones||["Respira y observa cómo te sientes."]; return arr[(Math.random()*arr.length)|0]; }
async function renderReflexion(){
  rf.prompt = pickReflexion();
  mount(`
    <div class="panel">
      <h2>🌱 Rueda de la Reflexión</h2>
      <p class="lead">Una pausa para ti. Lee, respira y escribe lo que surja. Es tu espacio privado.</p>
      <div class="reflect-prompt" id="rfPrompt">${esc(rf.prompt)}</div>
      <div class="field" style="margin-top:18px">
        <label for="rfText">Tu reflexión</label>
        <textarea id="rfText" placeholder="Escribe con calma, sin juzgarte…"></textarea>
      </div>
      <div class="row">
        <button class="btn" id="rfSave">Guardar reflexión 💾</button>
        <button class="btn ghost" id="rfOther">Otra pregunta 🔄</button>
      </div>
      <div class="feedback" id="rfFb"></div>
      ${currentUser?'':loginNeeded()}
      <div class="journal" id="rfJournal"></div>
      ${backBtn()}
    </div>`);
  $("#rfOther").onclick=renderReflexion;
  $("#rfSave").onclick=rfSave;
  rfRenderJournal();
}
async function rfSave(){
  const t=$("#rfText").value.trim();
  if(!t){ $("#rfFb").textContent="Escribe algo antes de guardar 🙂"; return; }
  if(!currentUser){ $("#rfFb").innerHTML="Entra con Google para guardar tus reflexiones. 💛"; return; }
  const ok=await saveReflection(rf.prompt,t);
  $("#rfFb").textContent = ok ? "✨ Reflexión guardada en tu diario." : "No se pudo guardar (revisa las reglas de Firestore).";
  if(ok){ $("#rfText").value=""; rfRenderJournal(); }
}
async function rfRenderJournal(){
  const box=$("#rfJournal"); if(!box) return;
  if(!currentUser){ box.innerHTML=""; return; }
  const list=await loadReflections();
  if(!list.length){ box.innerHTML=`<p class="locked-msg">Aún no tienes reflexiones guardadas.</p>`; return; }
  box.innerHTML=`<h4 style="color:var(--ink-dim);font-size:.85rem;text-transform:uppercase;letter-spacing:.5px;margin-top:10px">📓 Tu diario</h4>`+
    list.map(r=>`<div class="entry"><div class="p">${esc(r.prompt||"")}</div><div>${esc(r.texto||"")}</div>
      <div class="d">${r.createdAt&&r.createdAt.toDate?r.createdAt.toDate().toLocaleString('es'):''}</div></div>`).join("");
}

/* =========================== ROUTER =========================== */
function route(){
  const h=(location.hash||"#portal").slice(1);
  switch(h){
    case "contrarreloj": renderContrarreloj(); break;
    case "empareja":     renderEmpareja(); break;
    case "memoria":      renderMemoria(); break;
    case "reflexion":    renderReflexion(); break;
    case "cuento":       window.GEMB_STORY ? window.GEMB_STORY.mount(app$()) : renderPortal(); break;
    default:             renderPortal();
  }
}
window.addEventListener("hashchange", route);
$("#brand").onclick=()=> location.hash="#portal";

/* motas */
(function(){ const c=$("#motes"); for(let i=0;i<24;i++){ const m=document.createElement("div"); m.className="mote";
  const s=3+Math.random()*5; m.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${7+Math.random()*9}s;animation-delay:${-Math.random()*12}s`; c.appendChild(m);} })();

const cursorAura=$("#cursorAura");
if(cursorAura && matchMedia("(pointer:fine)").matches) window.addEventListener("pointermove",e=>{
  cursorAura.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
},{passive:true});

/* ===================== PWA: service worker + instalación ===================== */
if("serviceWorker" in navigator){
  window.addEventListener("load",()=> navigator.serviceWorker.register("/sw.js").catch(e=>console.warn("sw:",e)) );
}
const installBtn=$("#installBtn"), iosSheet=$("#iosSheet");
const isStandalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone===true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); deferredPrompt=e;
  if(!isStandalone && installBtn) installBtn.hidden=false;   // Android/Chrome: instalación con un toque
});
if(isIOS && !isStandalone && installBtn) installBtn.hidden=false;  // iPhone: guía paso a paso
if(installBtn) installBtn.onclick=async()=>{
  if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.hidden=true; }
  else if(iosSheet){ iosSheet.hidden=false; }
};
const iosClose=$("#iosClose");
if(iosClose) iosClose.onclick=()=> iosSheet.hidden=true;
window.addEventListener("appinstalled",()=>{ if(installBtn) installBtn.hidden=true; });

renderTop();
route();
