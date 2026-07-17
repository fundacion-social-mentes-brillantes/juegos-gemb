/* ============================================================================
   EL LIBRO QUE PERDIÓ SUS EMOCIONES — prólogo interactivo
   Experiencia local, sin cuentas ni respuestas correctas/incorrectas.
   ============================================================================ */
(function(){
  "use strict";

  const STORAGE_KEY = "gemb_story_v1";
  const ASSET = "assets/story/";
  const SCENES = {
    cover: ASSET + "story-cover.webp",
    forest: ASSET + "forest-echoes.webp",
    murmullo: ASSET + "murmullo-encounter.webp",
    bridge: ASSET + "bridge-choice.webp",
    awake: ASSET + "lantern-awakens.webp",
    map: ASSET + "story-map.webp"
  };
  const PORTRAITS = {
    chispa: ASSET + "chispa.png",
    lumi: ASSET + "lumi.png",
    aureo: ASSET + "aureo.png",
    murmullo: ASSET + "murmullo.png",
    lantern: ASSET + "lantern.png"
  };
  const companions = {
    chispa: { name:"Chispa", gift:"dar el primer paso", phrase:"Podemos sentir nervios y avanzar poquito a poquito." },
    lumi: { name:"Lumi", gift:"escuchar con calma", phrase:"Cuando bajamos el ritmo, el miedo puede contarnos qué necesita." },
    aureo: { name:"Áureo", gift:"pedir apoyo", phrase:"Hasta los árboles más fuertes crecen acompañados." }
  };
  const bodyLabels = {
    barriga:"un remolino en la barriga",
    pecho:"un tambor en el pecho",
    manos:"cosquillas en las manos",
    nose:"una señal difícil de nombrar"
  };
  const supportLabels = {
    lantern:"una luz para ver el próximo paso",
    stars:"las estrellas para recordar el camino",
    hand:"una mano amiga para no cruzar a solas"
  };

  let root = null;
  let activeAudio = null;
  let timers = [];
  let state = load();

  function fresh(){
    return { step:0, name:"", companion:"", murmur:"", body:"", breaths:0, support:"", reflection:"", completed:false };
  }
  function load(){
    try{
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && typeof value === "object" ? Object.assign(fresh(), value) : fresh();
    }catch(_){ return fresh(); }
  }
  function save(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(_){ /* modo privado */ }
  }
  function esc(value){
    return String(value || "").replace(/[&<>"'`]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"}[c]));
  }
  function clearStoryTimers(){ timers.forEach(clearTimeout); timers=[]; }
  function rememberTimer(fn, delay){ const id=setTimeout(fn,delay); timers.push(id); return id; }
  function progress(step){ return Math.max(0, Math.min(100, ((step-1)/8)*100)); }
  function chosenCompanion(){ return companions[state.companion] || companions.lumi; }

  function frame({ scene, step, eyebrow, title, copy, speaker="Narrador", portrait="", portraitAlt="", choices="", aside="", align="left", extraClass="" }){
    const pct = progress(step);
    return `
      <section class="story-shell ${extraClass}" aria-label="Cuento interactivo: El libro que perdió sus emociones">
        <div class="story-scene" data-align="${align}">
          <img src="${scene}" alt="" aria-hidden="true" />
          <div class="story-vignette" aria-hidden="true"></div>
          <div class="story-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
        <header class="story-top">
          <a href="#portal" class="story-back" aria-label="Volver al inicio">← <span>Salir del cuento</span></a>
          <div class="story-progress" aria-label="Progreso del cuento: ${Math.round(pct)}%"><i style="width:${pct}%"></i></div>
          <span class="story-chapter">PRÓLOGO · BOSQUE DE LOS ECOS</span>
        </header>
        <div class="story-frame story-align-${align}">
          ${portrait ? `<img class="story-portrait" src="${portrait}" alt="${esc(portraitAlt || speaker)}" />` : ""}
          <article class="story-panel" aria-live="polite">
            <div class="story-speaker">${esc(speaker)}</div>
            <div class="story-eyebrow">${eyebrow}</div>
            <h1>${title}</h1>
            <div class="story-copytext">${copy}</div>
            ${aside}
            <div class="story-choices">${choices}</div>
          </article>
        </div>
      </section>`;
  }

  function button(action, label, value="", kind=""){
    return `<button class="story-choice ${kind}" type="button" data-action="${action}"${value ? ` data-value="${value}"` : ""}>${label}<span>→</span></button>`;
  }

  function intro(){
    const hasProgress = state.step > 0;
    const done = state.completed;
    return frame({
      scene:SCENES.cover, step:1, align:"left", extraClass:"story-cover",
      speaker:"El Gran Libro", eyebrow:"UNA AVENTURA PARA SENTIR, ELEGIR Y CRECER",
      title:"El libro que perdió<br><em>sus emociones</em>",
      copy:`<p>Una noche, todas las palabras emocionales desaparecieron. Solo quedó un camino encendido… y está esperando tu decisión.</p><div class="story-meta"><span>✦ 8–10 minutos</span><span>✦ Tus elecciones cuentan</span><span>✦ Sin respuestas malas</span></div>`,
      choices:`<div class="story-song-card">
        <button class="story-song-toggle" type="button" data-action="toggle-song" aria-pressed="false">
          <span class="story-song-icon" aria-hidden="true">▶</span>
          <span><b>Escuchar la canción-guía</b><small>Descubre cómo funciona la aventura</small></span>
          <time class="story-song-time">0:00 / 2:14</time>
        </button>
        <div class="story-song-track" aria-hidden="true"><i></i></div>
        <audio id="storyThemeAudio" src="assets/audio/abre-el-libro-elige-tu.mp3" preload="metadata" playsinline></audio>
      </div>${hasProgress ? button("continue", done ? "Ver mi mapa de valentía" : "Continuar mi aventura", "", "primary") : button("new", "Saltar canción y abrir el libro", "", "primary")}${hasProgress ? button("new", "Empezar de nuevo", "", "quiet") : ""}`
    });
  }

  function askName(){
    return frame({
      scene:SCENES.cover, step:1, align:"left", speaker:"El Gran Libro", eyebrow:"PÁGINA 01 · UNA LUZ NUEVA",
      title:"El libro te<br><em>reconoce</em>",
      copy:`<p>Sus páginas están en blanco, pero una chispa dorada escribe una pregunta solo para ti:</p><blockquote>“¿Cómo se llama quien se atreverá a escuchar lo que siente?”</blockquote>`,
      choices:`<form class="story-name-form"><label for="storyName">Tu nombre o apodo</label><div><input id="storyName" maxlength="24" autocomplete="nickname" value="${esc(state.name)}" placeholder="Escríbelo aquí" required /><button type="submit">Entrar <span>→</span></button></div></form>`
    });
  }

  function chooseCompanion(){
    const name = esc(state.name || "Explorador");
    return frame({
      scene:SCENES.cover, step:2, align:"right", speaker:"El Gran Libro", eyebrow:"PÁGINA 02 · NO TIENES QUE IR A SOLAS",
      title:`${name}, elige tu<br><em>compañía</em>`,
      copy:"<p>Cada guía tiene una manera distinta de atravesar lo desconocido. Ninguna es mejor: elige la que hoy se parezca más a lo que necesitas.</p>",
      choices:`<div class="companion-grid">
        <button type="button" data-action="companion" data-value="chispa"><img src="${PORTRAITS.chispa}" alt="" /><b>Chispa</b><small>Me ayuda a dar el primer paso</small></button>
        <button type="button" data-action="companion" data-value="lumi"><img src="${PORTRAITS.lumi}" alt="" /><b>Lumi</b><small>Me ayuda a escuchar con calma</small></button>
        <button type="button" data-action="companion" data-value="aureo"><img src="${PORTRAITS.aureo}" alt="" /><b>Áureo</b><small>Me ayuda a pedir apoyo</small></button>
      </div>`
    });
  }

  function enterForest(){
    const companion = chosenCompanion();
    return frame({
      scene:SCENES.forest, step:3, align:"left", speaker:companion.name, portrait:PORTRAITS[state.companion] || PORTRAITS.lumi,
      eyebrow:"PÁGINA 03 · EL BOSQUE DE LOS ECOS", title:"Los árboles<br><em>susurran</em>",
      copy:`<p>Las ramas tienen forma de orejas. Repiten bajito: “¿Y si no puedes? ¿Y si algo sale mal?”. Tu cuerpo se pone alerta.</p><blockquote>“${companion.phrase}”</blockquote>`,
      aside:"<div class=\"story-learning\"><span>PISTA</span> El miedo no siempre anuncia peligro. A veces intenta prepararnos o pedir compañía.</div>",
      choices:button("goto", "Seguir el hilo violeta", "4", "primary")
    });
  }

  function meetMurmullo(){
    return frame({
      scene:SCENES.murmullo, step:4, align:"right", speaker:"Murmullo", portrait:PORTRAITS.murmullo,
      eyebrow:"PÁGINA 04 · EL GUARDIÁN ESCONDIDO", title:"“Yo no quería<br><em>asustarte”</em>",
      copy:"<p>Tras una hoja de cristal aparece Murmullo. Abraza un escudo junto a su corazón.</p><blockquote>“Hago ruido para que nadie se acerque al puente. Tengo miedo de que algo les pase.”</blockquote><p>¿Qué le respondes?</p>",
      choices:`${button("murmur", "¿Qué necesitas para sentirte seguro?", "needs")}${button("murmur", "Podemos mirar el puente juntos", "together")}${button("murmur", "Gracias por intentar protegernos", "thanks")}`
    });
  }

  function bodyCheck(){
    const replies = {
      needs:"Murmullo afloja su escudo. “Necesito saber que puedo parar si es demasiado”.",
      together:"Murmullo asoma una patita. “Juntos suena menos enorme”.",
      thanks:"El brillo de su escudo se vuelve cálido. “¿Entonces no soy un problema?”."
    };
    return frame({
      scene:SCENES.murmullo, step:5, align:"left", speaker:"Narrador", portrait:PORTRAITS.murmullo,
      eyebrow:"PÁGINA 05 · EL CUERPO TAMBIÉN HABLA", title:"Primero,<br><em>nota la señal</em>",
      copy:`<p>${replies[state.murmur] || replies.together}</p><p>Antes de cruzar, el bosque te invita a escuchar tu cuerpo. Cuando algo te preocupa, ¿dónde lo notas primero?</p>`,
      choices:`<div class="body-grid"><button data-action="body" data-value="barriga"><span>〰</span><b>Barriga</b></button><button data-action="body" data-value="pecho"><span>♡</span><b>Pecho</b></button><button data-action="body" data-value="manos"><span>✋</span><b>Manos</b></button><button data-action="body" data-value="nose"><span>?</span><b>No lo sé aún</b></button></div>`,
      aside:"<p class=\"story-reassure\">“No lo sé” también es una respuesta válida. Aprender a notarlo toma práctica.</p>"
    });
  }

  function breathe(){
    const lights = [0,1,2].map(i=>`<i class="${i < state.breaths ? "lit" : ""}"></i>`).join("");
    const ready = state.breaths >= 3;
    return frame({
      scene:SCENES.bridge, step:6, align:"right", speaker:"Lumi", portrait:PORTRAITS.lumi,
      eyebrow:"PÁGINA 06 · HACER ESPACIO", title:"Tres luces para<br><em>respirar</em>",
      copy:`<p>Sentir ${bodyLabels[state.body] || "una señal"} no significa que debas huir. Hagamos espacio para decidir: inhala suave cuando la luz crezca y exhala cuando vuelva a casa.</p>`,
      aside:`<div class="breath-game ${ready ? "is-ready" : ""}"><div class="breath-orb"><span>${ready ? "✦" : state.breaths + 1}</span></div><div class="breath-lights">${lights}</div><small>${ready ? "Tu calma está contigo" : "Respira sin forzar. Tú marcas el ritmo."}</small></div>`,
      choices:ready ? button("goto", "Estoy listo para elegir", "7", "primary") : `<button class="story-choice primary breath-start" type="button" data-action="breath">Encender una respiración <span>◎</span></button>${state.breaths ? `<button class="story-choice quiet" type="button" data-action="breath-done">Ya respiré a mi propio ritmo <span>→</span></button>` : ""}`
    });
  }

  function chooseSupport(){
    return frame({
      scene:SCENES.bridge, step:7, align:"left", speaker:"Murmullo", portrait:PORTRAITS.lantern, portraitAlt:"Luciérnaga-linterna",
      eyebrow:"PÁGINA 07 · VALENTÍA CON APOYO", title:"¿Qué llevarás<br><em>al puente?</em>",
      copy:"<p>La niebla no desaparece por completo. Eso está bien: ser valiente no es dejar de sentir miedo, sino elegir cómo avanzar con él.</p>",
      choices:`<div class="support-grid"><button data-action="support" data-value="lantern"><img src="${PORTRAITS.lantern}" alt="" /><span><b>La luciérnaga-linterna</b><small>Ver el siguiente paso</small></span></button><button data-action="support" data-value="stars"><span class="support-icon">✦</span><span><b>El mapa de estrellas</b><small>Recordar lo que ya aprendí</small></span></button><button data-action="support" data-value="hand"><span class="support-icon">🤝</span><span><b>Una mano amiga</b><small>Pedir compañía</small></span></button></div>`
    });
  }

  function resolution(){
    const companion = chosenCompanion();
    return frame({
      scene:SCENES.awake, step:8, align:"right", speaker:"Murmullo", portrait:PORTRAITS.murmullo,
      eyebrow:"PÁGINA 08 · EL MIEDO CAMBIA DE FORMA", title:"El guardián<br><em>abre sus alas</em>",
      copy:`<p>Con ${supportLabels[state.support] || "tu elección"}, cruzan un paso a la vez. Murmullo deja de gritar y empieza a avisar con una luz amable.</p><blockquote>“Puedo proteger sin mandar. Puedo hablar sin detenerte.”</blockquote><p>${companion.name} sonríe: hoy practicaste <strong>${companion.gift}</strong>.</p>`,
      aside:"<div class=\"story-learning gold\"><span>DESCUBRIMIENTO</span> El miedo es un mensajero, no el jefe de tus decisiones.</div>",
      choices:button("ending", "Devolver la emoción al libro", "", "primary")
    });
  }

  function ending(){
    const name = esc(state.name || "Explorador");
    const companion = chosenCompanion();
    return frame({
      scene:SCENES.map, step:9, align:"left", speaker:"El Gran Libro", portrait:PORTRAITS.lantern, portraitAlt:"Luciérnaga-linterna",
      eyebrow:"PRÓLOGO COMPLETADO · TU MAPA DE VALENTÍA", title:`Una página vuelve<br><em>a brillar</em>`,
      copy:`<p>El libro escribe tu nombre y guarda este camino para cuando lo necesites:</p><div class="courage-map"><b>${name}</b><span>NOTÓ</span><strong>${bodyLabels[state.body] || "una señal en su cuerpo"}</strong><span>RESPIRÓ Y ELIGIÓ</span><strong>${supportLabels[state.support] || "un apoyo"}</strong><span>DESCUBRIÓ CON ${companion.name.toUpperCase()}</span><strong>“Puedo escuchar mi miedo sin dejar que decida todo por mí.”</strong></div>`,
      aside:`<label class="story-reflection" for="storyReflection"><span>Una última huella (opcional)</span><textarea id="storyReflection" maxlength="180" placeholder="La próxima vez que sienta miedo, puedo…">${esc(state.reflection)}</textarea></label>`,
      choices:`${button("save-ending", "Guardar mi huella", "", "primary")}${button("restart", "Vivir otra versión", "", "quiet")}${button("home", "Volver a los mundos", "", "quiet")}`
    });
  }

  function render(){
    if(!root) return;
    clearStoryTimers();
    if(activeAudio) activeAudio.pause();
    activeAudio=null;
    const views = [intro, askName, chooseCompanion, enterForest, meetMurmullo, bodyCheck, breathe, chooseSupport, resolution, ending];
    root.innerHTML = (views[state.step] || intro)();
    setupAudio();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function go(step){ state.step=Number(step); save(); render(); }
  function newStory(){ state=fresh(); state.step=1; save(); render(); }
  function startBreathing(buttonEl){
    if(buttonEl.disabled) return;
    buttonEl.disabled=true;
    const orb=root.querySelector(".breath-orb");
    if(orb) orb.classList.add("inhale");
    buttonEl.innerHTML="Inhala suave… <span>◎</span>";
    rememberTimer(()=>{ if(orb){ orb.classList.remove("inhale"); orb.classList.add("exhale"); } buttonEl.innerHTML="Ahora exhala… <span>◎</span>"; },2000);
    rememberTimer(()=>{ state.breaths=Math.min(3,state.breaths+1); save(); render(); },4000);
  }

  function formatTime(seconds){
    if(!Number.isFinite(seconds)) return "0:00";
    const minutes=Math.floor(seconds/60), rest=Math.floor(seconds%60);
    return `${minutes}:${String(rest).padStart(2,"0")}`;
  }
  function setupAudio(){
    activeAudio=root ? root.querySelector("#storyThemeAudio") : null;
    if(!activeAudio) return;
    const card=root.querySelector(".story-song-card");
    const toggle=root.querySelector(".story-song-toggle");
    const icon=root.querySelector(".story-song-icon");
    const label=toggle ? toggle.querySelector("small") : null;
    const time=root.querySelector(".story-song-time");
    const bar=root.querySelector(".story-song-track i");
    const sync=()=>{
      if(time) time.textContent=`${formatTime(activeAudio.currentTime)} / ${formatTime(activeAudio.duration || 134)}`;
      if(bar) bar.style.width=`${activeAudio.duration ? (activeAudio.currentTime/activeAudio.duration)*100 : 0}%`;
    };
    activeAudio.addEventListener("loadedmetadata",sync);
    activeAudio.addEventListener("timeupdate",sync);
    activeAudio.addEventListener("play",()=>{ if(card) card.classList.add("is-playing"); if(toggle) toggle.setAttribute("aria-pressed","true"); if(icon) icon.textContent="Ⅱ"; if(label) label.textContent="Pausar canción"; });
    activeAudio.addEventListener("pause",()=>{ if(card) card.classList.remove("is-playing"); if(toggle) toggle.setAttribute("aria-pressed","false"); if(icon) icon.textContent="▶"; if(label) label.textContent=activeAudio.ended ? "Escuchar otra vez" : "Continuar escuchando"; });
    activeAudio.addEventListener("ended",()=>{ activeAudio.currentTime=0; sync(); if(label) label.textContent="Escuchar otra vez"; });
  }
  function toggleSong(){
    if(!activeAudio) setupAudio();
    if(!activeAudio) return;
    if(activeAudio.paused) activeAudio.play().catch(()=>{});
    else activeAudio.pause();
  }

  function onClick(event){
    const el=event.target.closest("[data-action]");
    if(!el || !root || !root.contains(el)) return;
    const action=el.dataset.action, value=el.dataset.value;
    if(action==="toggle-song") toggleSong();
    else if(action==="new") newStory();
    else if(action==="continue") go(state.completed ? 9 : Math.max(1,state.step));
    else if(action==="goto") go(value);
    else if(action==="companion"){ state.companion=value; go(3); }
    else if(action==="murmur"){ state.murmur=value; go(5); }
    else if(action==="body"){ state.body=value; state.breaths=0; go(6); }
    else if(action==="breath") startBreathing(el);
    else if(action==="breath-done"){ state.breaths=3; go(7); }
    else if(action==="support"){ state.support=value; go(8); }
    else if(action==="ending"){ state.completed=true; go(9); }
    else if(action==="save-ending"){
      const input=root.querySelector("#storyReflection");
      state.reflection=input ? input.value.trim().slice(0,180) : ""; state.completed=true; save();
      el.innerHTML="✦ Huella guardada en este dispositivo"; el.classList.add("saved");
    }
    else if(action==="restart") newStory();
    else if(action==="home") location.hash="#portal";
  }

  function onSubmit(event){
    if(!event.target.matches(".story-name-form")) return;
    event.preventDefault();
    const input=event.target.querySelector("input");
    const value=(input.value || "").trim().slice(0,24);
    if(!value){ input.focus(); return; }
    state.name=value; go(2);
  }

  function preload(){ [SCENES.cover,SCENES.forest].forEach(src=>{ const image=new Image(); image.src=src; }); }
  function mount(container){
    destroy(); root=container; state=load();
    root.addEventListener("click",onClick); root.addEventListener("submit",onSubmit);
    preload(); root.innerHTML=intro(); setupAudio(); window.scrollTo({top:0,behavior:"smooth"});
  }
  function destroy(){
    clearStoryTimers();
    if(activeAudio) activeAudio.pause();
    activeAudio=null;
    if(root){ root.removeEventListener("click",onClick); root.removeEventListener("submit",onSubmit); }
    root=null;
  }

  window.GEMB_STORY={ mount, destroy };
})();
