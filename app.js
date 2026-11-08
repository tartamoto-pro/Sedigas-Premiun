/* Destreza visual · Recertificación Sedigas Premium
   Funciona sin servidor: abre index.html o publícalo en GitHub Pages. */
const App = (() => {
  const P = window.PREGUNTAS || [];
  const EXAMEN = { 'PAD-1': 6, 'PAD-2': 6, 'OD': 3, 'AU': 5 }; // reparto real Premium: 20 casos, aprueba con 16
  const KEY = 'sedigas_destreza_v1';
  const $app = document.getElementById('app');
  let est = {};
  try { est = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { est = {}; }
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch (e) {} };
  const marcar = (id, ok) => {
    const s = est[id] || { ok: 0, mal: 0 };
    ok ? s.ok++ : s.mal++; s.ultima = ok ? 'ok' : 'mal'; est[id] = s; guardar(); progreso();
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mezclar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const abierta = q => !q.opciones;
  let ses = null; // sesión actual

  function progreso() {
    const vistas = Object.keys(est).length;
    const fallos = Object.values(est).filter(s => s.ultima === 'mal').length;
    document.getElementById('progreso').textContent = `${vistas}/${P.length} vistas · ${fallos} por repasar`;
  }

  function home() {
    ses = null;
    const por = b => P.filter(q => q.bloque === b).length;
    const fallos = P.filter(q => est[q.id] && est[q.id].ultima === 'mal').length;
    const nuevas = P.filter(q => q.nueva).length;
    const ok = Object.values(est).reduce((a, s) => a + s.ok, 0), mal = Object.values(est).reduce((a, s) => a + s.mal, 0);
    $app.innerHTML = `
      <h1>Practica la destreza visual</h1>
      <p class="sub">${P.length} casos con dibujo de PAD-1, PAD-2, OD y AU, ${nuevas} de ellos nuevos. Corregidos con las especificaciones Sedigas de 2025 y los cambios de la UNE 60670:2023.</p>
      <div class="stats">
        <div class="stat"><strong>${ok}</strong>aciertos</div>
        <div class="stat"><strong>${mal}</strong>fallos</div>
        <div class="stat"><strong>${ok + mal ? Math.round(100 * ok / (ok + mal)) : 0}%</strong>acierto</div>
      </div>
      <h2>Examen</h2>
      <div class="grid">
        <button class="card" onclick="App.examen()"><b>Simulacro Premium</b><small>20 casos al azar (6 PAD-1, 6 PAD-2, 3 OD, 5 AU). Ves la nota al final; se aprueba con 16.</small></button>
      </div>
      <h2>Práctica con corrección inmediata</h2>
      <div class="grid">
        <button class="card" onclick="App.practica('PAD-1')"><b>PAD-1 · Altas</b><small>${por('PAD-1')} casos</small></button>
        <button class="card" onclick="App.practica('PAD-2')"><b>PAD-2 · Inspección periódica</b><small>${por('PAD-2')} casos</small></button>
        <button class="card" onclick="App.practica('OD')"><b>OD · Operaciones domiciliarias</b><small>${por('OD')} casos</small></button>
        <button class="card" onclick="App.practica('AU')"><b>AU · Urgencias</b><small>${por('AU')} casos</small></button>
        <button class="card" onclick="App.practica('nuevas')"><b>Solo preguntas nuevas</b><small>${nuevas} casos</small></button>
        <button class="card" onclick="App.practica('todas')"><b>Todas mezcladas</b><small>${P.length} casos</small></button>
        <button class="card" onclick="App.practica('fallos')" ${fallos ? '' : 'disabled'}><b>Repasar mis fallos</b><small>${fallos ? fallos + ' casos que fallaste la última vez' : 'Aún no hay fallos'}</small></button>
      </div>
      <h2>Consulta</h2>
      <div class="grid">
        <button class="card" onclick="App.lista()"><b>Ver todas con su solución</b><small>Para repasar con calma</small></button>
        <button class="card" onclick="App.borrar()"><b>Borrar mi progreso</b><small>Se guarda solo en este navegador</small></button>
      </div>
      <p class="aviso">El progreso se guarda en este navegador. Las imágenes proceden de material de Sedigas: úsalas solo para estudio personal.</p>`;
    progreso(); scrollTo(0, 0);
  }

  function examen() {
    let sel = [];
    for (const [b, n] of Object.entries(EXAMEN)) sel = sel.concat(mezclar(P.filter(q => q.bloque === b)).slice(0, n));
    ses = { modo: 'examen', qs: sel, i: 0, resp: {} };
    pregunta();
  }

  function practica(f) {
    let qs = f === 'todas' ? P : f === 'nuevas' ? P.filter(q => q.nueva) : f === 'fallos' ? P.filter(q => est[q.id] && est[q.id].ultima === 'mal') : P.filter(q => q.bloque === f);
    if (!qs.length) return home();
    ses = { modo: 'practica', qs: mezclar(qs), i: 0, resp: {}, aciertos: 0 };
    pregunta();
  }

  function pregunta() {
    const q = ses.qs[ses.i], n = ses.qs.length, r = ses.resp[q.id];
    const corregir = ses.modo === 'practica' && r !== undefined;
    let ops = '';
    if (!abierta(q)) {
      ops = '<div class="ops">' + q.opciones.map((o, k) => {
        let cls = '';
        if (corregir) { if (o === q.correcta) cls = 'ok'; else if (o === r) cls = 'mal'; }
        else if (ses.modo === 'examen' && r === o) cls = 'ok';
        return `<button class="op ${cls}" ${corregir ? 'disabled' : ''} onclick="App.responder(${k})">${esc(o)}</button>`;
      }).join('') + '</div>';
    } else {
      ops = `<textarea id="txt" placeholder="Escribe tu respuesta (explicación y actuación)…">${esc(ses.txt?.[q.id] || '')}</textarea>`;
    }
    const lineas = abierta(q) ? '' : `<textarea id="txt" placeholder="Opcional: explica el defecto o la actuación, como en el examen…">${esc(ses.txt?.[q.id] || '')}</textarea>`;
    let sol = '';
    if (corregir) {
      const ok = r === true || r === q.correcta;
      sol = `<div class="sol ${ok ? '' : 'mal'}"><b>${abierta(q) ? 'Solución' : ok ? '¡Correcto!' : 'Respuesta correcta: ' + esc(q.correcta)}</b>${esc(q.solucion)}</div>`;
    }
    let acciones = '';
    if (ses.modo === 'practica') {
      if (abierta(q) && r === undefined && !ses.verSol) acciones = `<button class="btn" onclick="App.verSolucion()">Ver solución</button>`;
      else if (abierta(q) && r === undefined && ses.verSol) {
        sol = `<div class="sol"><b>Solución</b>${esc(q.solucion)}</div>`;
        acciones = `<button class="btn ok" onclick="App.autoeval(true)">La acerté</button><button class="btn mal" onclick="App.autoeval(false)">La fallé</button>`;
      } else if (r !== undefined) acciones = `<button class="btn" onclick="App.siguiente()">${ses.i + 1 < n ? 'Siguiente' : 'Ver resumen'}</button>`;
    } else {
      acciones = `<button class="btn sec" onclick="App.mover(-1)" ${ses.i ? '' : 'disabled'}>Anterior</button>` +
        (ses.i + 1 < n ? `<button class="btn" onclick="App.mover(1)">Siguiente</button>` : `<button class="btn ok" onclick="App.terminar()">Terminar y corregir</button>`);
    }
    $app.innerHTML = `
      <div class="barra"><i style="width:${100 * (ses.i + (ses.modo === 'practica' && r !== undefined ? 1 : 0)) / n}%"></i></div>
      <div class="q ${q.img ? '' : 'sinimg'}">
        ${q.img ? `<div class="foto" onclick="App.zoom('${q.img}')"><img src="${q.img}" alt="Dibujo del caso"></div>` : ''}
        <div>
          <div class="meta"><span class="tag">${esc(q.etiqueta)}</span>${q.nueva ? '<span class="tag nueva">Nueva</span>' : ''}<span class="num">${ses.i + 1} / ${n}${ses.modo === 'examen' ? ' · simulacro' : ''}</span></div>
          <p class="enunciado">${esc(q.pregunta)}</p>
          ${ops}
          ${!abierta(q) && ses.modo === 'examen' ? lineas : ''}
          ${sol}
          <div class="acciones">${acciones}<button class="btn sec" onclick="App.salir()">Salir</button></div>
        </div>
      </div>`;
    scrollTo(0, 0);
  }

  function guardarTxt() { const t = document.getElementById('txt'); if (t && ses) { ses.txt = ses.txt || {}; ses.txt[ses.qs[ses.i].id] = t.value; } }

  function responder(k) {
    const q = ses.qs[ses.i];
    guardarTxt();
    ses.resp[q.id] = q.opciones[k];
    if (ses.modo === 'practica') { const ok = q.opciones[k] === q.correcta; marcar(q.id, ok); if (ok) ses.aciertos++; }
    pregunta();
  }
  function verSolucion() { guardarTxt(); ses.verSol = true; pregunta(); }
  function autoeval(ok) { const q = ses.qs[ses.i]; ses.resp[q.id] = ok; ses.verSol = false; marcar(q.id, ok); if (ok) ses.aciertos++; pregunta(); }
  function siguiente() { ses.verSol = false; if (ses.i + 1 < ses.qs.length) { ses.i++; pregunta(); } else resumen(); }
  function mover(d) { guardarTxt(); ses.i += d; pregunta(); }
  function salir() { if (!ses || ses.modo === 'practica' || confirm('¿Salir del simulacro? Se perderán las respuestas.')) home(); }

  function terminar() {
    guardarTxt();
    const sinResp = ses.qs.filter(q => !abierta(q) && ses.resp[q.id] === undefined).length;
    if (sinResp && !confirm(`Te quedan ${sinResp} sin contestar y contarán como fallo. ¿Corregir igualmente?`)) return;
    ses.qs.forEach(q => { if (!abierta(q)) marcar(q.id, ses.resp[q.id] === q.correcta); });
    ses.modo = 'revision';
    resultadoExamen();
  }

  function resultadoExamen() {
    const qs = ses.qs;
    const pend = qs.filter(q => abierta(q) && ses.resp[q.id] === undefined);
    const nota = qs.filter(q => abierta(q) ? ses.resp[q.id] === true : ses.resp[q.id] === q.correcta).length;
    const apto = nota >= 16;
    $app.innerHTML = `
      <div class="resultado ${pend.length ? '' : apto ? 'aprobado' : 'suspenso'}">
        <div class="nota">${nota} / ${qs.length}</div>
        <p>${pend.length ? `Faltan ${pend.length} preguntas abiertas por autoevaluar (abajo).` : apto ? '¡Aprobado! (16 o más)' : 'Suspenso: hacen falta 16.'}</p>
        <div class="acciones" style="justify-content:center"><button class="btn" onclick="App.examen()">Otro simulacro</button><button class="btn sec" onclick="App.home()">Inicio</button></div>
      </div>
      <h2>Corrección</h2>
      <ul class="lista">${qs.map((q, k) => {
        const r = ses.resp[q.id];
        let estado;
        if (abierta(q)) estado = r === undefined ? `<span class="r">Autoevalúa:</span> <button class="btn ok" onclick="App.autoExamen('${q.id}',true)">La acerté</button> <button class="btn mal" onclick="App.autoExamen('${q.id}',false)">La fallé</button>` : `<span class="r ${r ? 'ok' : 'mal'}">${r ? 'Acertada' : 'Fallada'}</span>`;
        else { const ok = r === q.correcta; estado = `<span class="r ${ok ? 'ok' : 'mal'}">${ok ? 'Bien' : 'Mal'}</span> · Tu respuesta: ${esc(r || 'en blanco')}${ok ? '' : ' · Correcta: <b>' + esc(q.correcta) + '</b>'}`; }
        const txt = ses.txt?.[q.id] ? `<div><i>Tu explicación:</i> ${esc(ses.txt[q.id])}</div>` : '';
        return `<li>${q.img ? `<img src="${q.img}" alt="" onclick="App.zoom('${q.img}')">` : ''}<div><b>${k + 1}. [${esc(q.etiqueta)}]</b> ${esc(q.pregunta)}<div>${estado}</div>${txt}<div class="sol" style="margin-top:6px">${esc(q.solucion)}</div></div></li>`;
      }).join('')}</ul>`;
    scrollTo(0, 0);
  }
  function autoExamen(id, ok) { ses.resp[id] = ok; marcar(id, ok); const y = scrollY; resultadoExamen(); scrollTo(0, y); }

  function resumen() {
    const n = ses.qs.length;
    $app.innerHTML = `<div class="resultado ${ses.aciertos / n >= .8 ? 'aprobado' : 'suspenso'}">
      <div class="nota">${ses.aciertos} / ${n}</div><p>${Math.round(100 * ses.aciertos / n)} % de acierto (en el examen hace falta un 80 %).</p>
      <div class="acciones" style="justify-content:center"><button class="btn" onclick="App.practica('fallos')">Repasar fallos</button><button class="btn sec" onclick="App.home()">Inicio</button></div></div>`;
  }

  function lista(filtro) {
    filtro = filtro || 'todas';
    const qs = filtro === 'todas' ? P : filtro === 'nuevas' ? P.filter(q => q.nueva) : P.filter(q => q.bloque === filtro);
    const chips = ['todas', 'PAD-1', 'PAD-2', 'OD', 'AU', 'nuevas'].map(f => `<button class="chip ${f === filtro ? 'on' : ''}" onclick="App.lista('${f}')">${f === 'todas' ? 'Todas' : f === 'nuevas' ? 'Nuevas' : f}</button>`).join('');
    $app.innerHTML = `<h1>Todas las preguntas</h1><div class="filtros">${chips}</div>
      <ul class="lista">${qs.map(q => `<li>${q.img ? `<img src="${q.img}" alt="" onclick="App.zoom('${q.img}')">` : ''}<div><span class="tag">${esc(q.etiqueta)}</span> ${q.nueva ? '<span class="tag nueva">Nueva</span>' : ''} <b>${esc(q.pregunta)}</b>${q.correcta ? `<div class="r ok">${esc(q.correcta)}</div>` : ''}<div>${esc(q.solucion)}</div></div></li>`).join('')}</ul>
      <div class="acciones"><button class="btn sec" onclick="App.home()">Inicio</button></div>`;
    scrollTo(0, 0);
  }

  function borrar() { if (confirm('¿Borrar todo tu progreso guardado en este navegador?')) { est = {}; guardar(); home(); } }
  function zoom(src) { const z = document.getElementById('zoom'); z.querySelector('img').src = src; z.classList.add('on'); }

  document.addEventListener('keydown', e => {
    if (!ses || document.activeElement?.tagName === 'TEXTAREA') return;
    const q = ses.qs[ses.i];
    if (q && q.opciones && /^[1-9]$/.test(e.key) && +e.key <= q.opciones.length && (ses.modo === 'examen' || ses.resp[q.id] === undefined)) responder(+e.key - 1);
    else if (e.key === 'Enter' && ses.modo === 'practica' && ses.resp[q.id] !== undefined) siguiente();
  });

  home();
  return { home, examen, practica, responder, verSolucion, autoeval, siguiente, mover, salir, terminar, autoExamen, lista, borrar, zoom };
})();
