/* Técnico de Plantas Satélite de GNL · Práctica de examen Sedigas
   Formato según PG-D-01 (ed. 8) y PG-D-02 (ed. 6), mayo 2024.
   Funciona sin servidor: abre index.html o publícalo en GitHub Pages. */
const App = (() => {
  const P = window.PREGUNTAS || [];
  // Composición del examen teórico (PG-D-02, tablas 1 y 2): preguntas por tema y tiempo en minutos.
  const TEORICO = {
    A: { nombre: 'Tipo A', min: 120, temas: { T1: 4, T2: 4, T4: 10, T5: 2, T6: 2, T7: 6, T8: 6, T9: 5, T10: 4, T11: 5, T12: 2 } },
    B: { nombre: 'Tipo B', min: 90, temas: { T1: 3, T4: 9, T7: 2, T8: 7, T9: 3, T10: 4, T11: 5, T12: 1 } }
  };
  // Examen de destreza visual (PG-D-01 5.6.5.5 y PG-D-02 4.5): 6 preguntas, 1 hora, aprobado con 7.
  const VISUAL = { fotos: 6, porFoto: 4, min: 60 };
  const APROBADO = 7; // nota mínima sobre 10 en los dos exámenes desde el 23-05-2024
  const TEMAS = {
    T1: 'Tema 1 · Las PS y el GNL', T2: 'Tema 2 · Reglamentación', T4: 'Tema 4 · Composición y funcionamiento',
    T5: 'Tema 5 · Montaje y pruebas', T6: 'Tema 6 · Documentación', T7: 'Tema 7 · Operación',
    T8: 'Tema 8 · Mantenimiento', T9: 'Tema 9 · Incidencias', T10: 'Tema 10 · Seguridad y emergencias',
    T11: 'Tema 11 · Transporte', T12: 'Tema 12 · Medioambiente', VIS: 'Visual'
  };
  const KEY = 'sedigas_gnl_v1';
  const $app = document.getElementById('app');
  const TEO = P.filter(q => q.bloque !== 'VIS'), VIS = P.filter(q => q.bloque === 'VIS');
  // Fotos del examen visual: agrupa las preguntas visuales por imagen.
  const FOTOS = [];
  VIS.forEach(q => {
    let f = FOTOS.find(x => x.img === q.img);
    if (!f) { f = { img: q.img, titulo: q.pregunta.includes(':') ? q.pregunta.split(':')[0] : 'Identifica el elemento señalado', items: [] }; FOTOS.push(f); }
    const m = q.pregunta.match(/número (\d+)/);
    f.items.push({ q, num: m ? m[1] : '→' });
  });
  FOTOS.forEach(f => { f.labels = [...new Set(f.items.map(i => i.q.correcta).concat(f.items.flatMap(i => i.q.opciones)))].sort((a, b) => a.localeCompare(b, 'es')); });

  let est = {};
  try { est = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { est = {}; }
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch (e) {} };
  const marcar = (id, ok) => {
    const s = est[id] || { ok: 0, mal: 0 };
    ok ? s.ok++ : s.mal++; s.ultima = ok ? 'ok' : 'mal'; est[id] = s; guardar(); progreso();
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mezclar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const preparar = (qs, cuatro) => qs.map(q => {
    let ops = q.opciones;
    if (cuatro && ops.length > 4) ops = [q.correcta].concat(mezclar(ops.filter(o => o !== q.correcta)).slice(0, 3));
    return Object.assign({}, q, { opciones: mezclar(ops) });
  });
  const fallada = q => est[q.id] && est[q.id].ultima === 'mal';
  const nota10 = x => (Math.round(x * 100) / 100).toLocaleString('es-ES', { maximumFractionDigits: 2 });
  const ICO = {
    libro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M8 7h8M8 11h6"/></svg>',
    ojo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    mezcla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    repaso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    lista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/></svg>',
    papelera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>'
  };
  let ses = null, reloj = null;

  function progreso() {
    const vistas = P.filter(q => est[q.id]).length;
    const fallos = P.filter(fallada).length;
    document.getElementById('progreso').textContent = `${vistas}/${P.length} vistas · ${fallos} por repasar`;
  }

  /* ---------- Cronómetro de los simulacros ---------- */
  function arrancarReloj(min) {
    pararReloj();
    ses.fin = Date.now() + min * 60000;
    reloj = setInterval(() => {
      const el = document.getElementById('reloj');
      const s = Math.max(0, Math.round((ses.fin - Date.now()) / 1000));
      if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      if (!s) { pararReloj(); alert('Se ha acabado el tiempo. Se corrige lo que hayas contestado.'); ses.tipo === 'visual' ? terminarVisual(true) : terminar(true); }
    }, 1000);
  }
  function pararReloj() { if (reloj) clearInterval(reloj); reloj = null; }
  const textoReloj = () => { const s = Math.max(0, Math.round((ses.fin - Date.now()) / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  function home() {
    pararReloj(); ses = null;
    const ok = Object.values(est).reduce((a, s) => a + s.ok, 0), mal = Object.values(est).reduce((a, s) => a + s.mal, 0);
    const pct = ok + mal ? Math.round(100 * ok / (ok + mal)) : 0;
    const fT = TEO.filter(fallada).length, fV = VIS.filter(fallada).length;
    const tarjeta = (onclick, color, ico, titulo, texto, dis) => `<button class="card ${color}" onclick="${onclick}" ${dis ? 'disabled' : ''}><span class="ico">${ico}</span><b>${titulo}</b><small>${texto}</small></button>`;
    const chips = Object.keys(TEMAS).filter(t => t !== 'VIS').map(t => `<button class="chip" onclick="App.practica('${t}')">${esc(TEMAS[t])} · ${TEO.filter(q => q.bloque === t).length}</button>`).join('');
    $app.innerHTML = `
      <section class="hero">
        <span class="kicker">Certificación Sedigas · Técnico de Plantas Satélite de GNL</span>
        <h1>Practica los dos exámenes</h1>
        <p class="sub">Simulacros con el formato oficial: test de 50 preguntas (tipo A) o 34 (tipo B) y examen visual de 6 preguntas. Se aprueba cada uno con un 7.</p>
        <div class="stats">
          <div class="stat"><strong>${ok}</strong>aciertos</div>
          <div class="stat"><strong>${mal}</strong>fallos</div>
          <div class="stat"><strong>${pct}%</strong>acierto</div>
        </div>
        <div class="acciones">
          <button class="btn" onclick="App.examen('A')">Test tipo A · 50 preg. · 2 h</button>
          <button class="btn" onclick="App.examen('B')">Test tipo B · 34 preg. · 1 h 30</button>
          <button class="btn" onclick="App.examenVisual()">Visual · 6 fotos · 1 h</button>
        </div>
      </section>
      <h2>Examen teórico (tipo test)</h2>
      <div class="grid">
        ${tarjeta("App.practica('teorico')", '', ICO.mezcla, 'Todas las teóricas', TEO.length + ' preguntas mezcladas')}
        ${tarjeta("App.practica('fallosT')", 'c-rosa', ICO.repaso, 'Repasar mis fallos', fT ? fT + ' que fallaste la última vez' : 'Aún no hay fallos', !fT)}
      </div>
      <p class="sub" style="margin:14px 0 8px">O practica un tema:</p>
      <div class="filtros">${chips}</div>
      <h2>Examen visual (fotos)</h2>
      <div class="grid">
        ${tarjeta("App.practica('VIS')", 'c-verde', ICO.ojo, 'Todas las fotos', VIS.length + ' elementos para nombrar, uno a uno')}
        ${tarjeta("App.practica('fallosV')", 'c-rosa', ICO.repaso, 'Repasar mis fallos', fV ? fV + ' que fallaste la última vez' : 'Aún no hay fallos', !fV)}
      </div>
      <h2>Estudio y consulta</h2>
      <div class="grid">
        <a class="card c-naranja" href="guia/"><span class="ico">${ICO.libro}</span><b>Guía de estudio</b><small>Cómo es el examen, resumen de los 13 temas, chuleta de cifras y fotos con sus nombres</small></a>
        ${tarjeta('App.lista()', 'c-violeta', ICO.lista, 'Todas con su solución', 'Para repasar con calma')}
        ${tarjeta('App.borrar()', 'c-gris', ICO.papelera, 'Borrar mi progreso', 'Se guarda solo en este navegador')}
      </div>
      <p class="aviso"><b>Cómo se corrige el test:</b> nota = (aciertos − 0,25 × fallos) × 10 / preguntas. Las preguntas en blanco no restan. Con 4 opciones, en cuanto descartas una compensa contestar. En el simulacro cada pregunta tiene 4 opciones, como en el examen; pulsa otra vez una respuesta para dejarla en blanco. En la recertificación solo se hace el test. El progreso se guarda en este navegador. Las fotos proceden de material de Sedigas: úsalas solo para estudio personal.</p>`;
    progreso(); scrollTo(0, 0);
  }

  /* ---------- Simulacro teórico (tipo A o B) ---------- */
  function examen(tipo) {
    const cfg = TEORICO[tipo];
    let sel = [];
    Object.entries(cfg.temas).forEach(([t, n]) => {
      const del = TEO.filter(q => q.bloque === t);
      // El tipo B saca primero las preguntas de su propio banco (Tipo B) y completa con el resto del tema.
      const pref = tipo === 'B' ? mezclar(del.filter(q => String(q.banco).includes('B'))).concat(mezclar(del.filter(q => !String(q.banco).includes('B')))) : mezclar(del);
      sel = sel.concat(pref.slice(0, n));
    });
    ses = { modo: 'examen', tipo, qs: preparar(mezclar(sel), true), i: 0, resp: {} };
    arrancarReloj(cfg.min);
    pregunta();
  }

  function practica(f) {
    const qs = f === 'teorico' ? TEO : f === 'fallosT' ? TEO.filter(fallada) : f === 'fallosV' ? VIS.filter(fallada) : P.filter(q => q.bloque === f);
    if (!qs.length) return home();
    ses = { modo: 'practica', qs: preparar(mezclar(qs)), i: 0, resp: {}, aciertos: 0 };
    pregunta();
  }

  function pregunta() {
    const q = ses.qs[ses.i], n = ses.qs.length, r = ses.resp[q.id];
    const corregir = ses.modo === 'practica' && r !== undefined;
    const ops = '<div class="ops">' + q.opciones.map((o, k) => {
      let cls = '';
      if (corregir) { if (o === q.correcta) cls = 'ok'; else if (o === r) cls = 'mal'; }
      else if (ses.modo === 'examen' && r === o) cls = 'ok';
      return `<button class="op ${cls}" ${corregir ? 'disabled' : ''} onclick="App.responder(${k})"><b>${'abcde'[k]})</b> ${esc(o)}</button>`;
    }).join('') + '</div>';
    let sol = '';
    if (corregir) {
      const ok = r === q.correcta;
      sol = `<div class="sol ${ok ? '' : 'mal'}"><b>${ok ? '¡Correcto!' : 'Respuesta correcta: ' + esc(q.correcta)}</b>${esc(q.solucion || '')}</div>`;
    }
    let acciones;
    if (ses.modo === 'practica') acciones = r !== undefined ? `<button class="btn" onclick="App.siguiente()">${ses.i + 1 < n ? 'Siguiente' : 'Ver resumen'}</button>` : '';
    else acciones = `<button class="btn sec" onclick="App.mover(-1)" ${ses.i ? '' : 'disabled'}>Anterior</button>` +
      (ses.i + 1 < n ? `<button class="btn" onclick="App.mover(1)">Siguiente</button>` : '') + `<button class="btn ok" onclick="App.terminar()">Terminar y corregir</button>`;
    const contestadas = Object.keys(ses.resp).length;
    const etiqueta = TEMAS[q.bloque] || q.bloque;
    $app.innerHTML = `
      <div class="barra"><i style="width:${100 * (ses.i + (corregir ? 1 : 0)) / n}%"></i></div>
      <div class="q ${q.img ? '' : 'sinimg'}">
        ${q.img ? `<div class="foto" onclick="App.zoom('${q.img}')"><img src="${q.img}" alt="Foto del caso"></div>` : ''}
        <div>
          <div class="meta"><span class="tag">${esc(etiqueta)}</span><span class="num">${ses.i + 1} / ${n}${ses.modo === 'examen' ? ` · ${contestadas} contestadas · <b id="reloj">${textoReloj()}</b>` : ''}</span></div>
          <p class="enunciado">${esc(q.pregunta)}</p>
          ${ops}
          ${sol}
          <div class="acciones">${acciones}<button class="btn sec" onclick="App.salir()">Salir</button></div>
        </div>
      </div>`;
    scrollTo(0, 0);
  }

  function responder(k) {
    const q = ses.qs[ses.i];
    if (ses.modo === 'practica') {
      if (ses.resp[q.id] !== undefined) return;
      ses.resp[q.id] = q.opciones[k];
      const ok = q.opciones[k] === q.correcta; marcar(q.id, ok); if (ok) ses.aciertos++;
    } else if (ses.resp[q.id] === q.opciones[k]) delete ses.resp[q.id]; // pulsar otra vez = en blanco
    else ses.resp[q.id] = q.opciones[k];
    pregunta();
  }
  function siguiente() { if (ses.i + 1 < ses.qs.length) { ses.i++; pregunta(); } else resumen(); }
  function mover(d) { ses.i = Math.max(0, Math.min(ses.qs.length - 1, ses.i + d)); pregunta(); }
  function salir() { if (!ses || !['examen', 'visual'].includes(ses.modo) || confirm('¿Salir del simulacro? Se perderán las respuestas.')) home(); }

  function terminar(forzado) {
    const qs = ses.qs, blancas = qs.filter(q => ses.resp[q.id] === undefined).length;
    if (!forzado && blancas && !confirm(`Tienes ${blancas} en blanco (no restan). ¿Corregir ya?`)) return;
    pararReloj();
    const c = qs.filter(q => ses.resp[q.id] === q.correcta).length;
    const e = qs.length - c - blancas;
    qs.forEach(q => { if (ses.resp[q.id] !== undefined) marcar(q.id, ses.resp[q.id] === q.correcta); });
    const nota = Math.max(0, (c - 0.25 * e) * 10 / qs.length), apto = nota >= APROBADO;
    $app.innerHTML = `
      <div class="resultado ${apto ? 'aprobado' : 'suspenso'}">
        <div class="nota">${nota10(nota)}</div>
        <p><b>${apto ? 'Aprobado' : 'Suspenso'}</b> (se aprueba con 7) · ${TEORICO[ses.tipo].nombre}: ${c} aciertos, ${e} fallos, ${blancas} en blanco de ${qs.length}.<br>Nota = (${c} − 0,25 × ${e}) × 10 / ${qs.length}</p>
        <div class="acciones" style="justify-content:center"><button class="btn" onclick="App.examen('${ses.tipo}')">Otro simulacro</button><button class="btn sec" onclick="App.home()">Inicio</button></div>
      </div>
      <h2>Corrección</h2>
      <ul class="lista">${qs.map((q, k) => {
        const r = ses.resp[q.id], ok = r === q.correcta, est = r === undefined ? 'En blanco' : ok ? 'Bien' : 'Mal';
        return `<li><div><b>${k + 1}. [${esc(TEMAS[q.bloque] || q.bloque)}]</b> ${esc(q.pregunta)}<div><span class="r ${ok ? 'ok' : 'mal'}">${est}</span>${r === undefined ? '' : ' · Tu respuesta: ' + esc(r)}${ok ? '' : ' · Correcta: <b>' + esc(q.correcta) + '</b>'}</div>${q.solucion ? `<div class="sol" style="margin-top:6px">${esc(q.solucion)}</div>` : ''}</div></li>`;
      }).join('')}</ul>`;
    ses.modo = 'revision';
    scrollTo(0, 0);
  }

  /* ---------- Simulacro visual: 6 fotos, varios elementos por foto, puntuación proporcional ---------- */
  function examenVisual() {
    const fotos = mezclar(FOTOS.filter(f => f.items.length > 1)).slice(0, VISUAL.fotos);
    ses = {
      modo: 'visual', tipo: 'visual', i: 0, resp: {},
      fotos: fotos.map(f => ({ f, items: mezclar(f.items).slice(0, VISUAL.porFoto).sort((a, b) => a.num - b.num) }))
    };
    arrancarReloj(VISUAL.min);
    fotoVisual();
  }

  function fotoVisual() {
    const p = ses.fotos[ses.i], n = ses.fotos.length;
    const filas = p.items.map(it => {
      const v = ses.resp[it.q.id] || '';
      return `<label class="fila-vis"><span class="numv">${it.num}</span><select onchange="App.respVisual('${it.q.id}', this.value)"><option value="">— elige —</option>${p.f.labels.map(l => `<option ${l === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    }).join('');
    $app.innerHTML = `
      <div class="barra"><i style="width:${100 * ses.i / n}%"></i></div>
      <div class="q">
        <div class="foto" onclick="App.zoom('${p.f.img}')"><img src="${p.f.img}" alt="Foto"></div>
        <div>
          <div class="meta"><span class="tag">Examen visual</span><span class="num">Pregunta ${ses.i + 1} / ${n} · <b id="reloj">${textoReloj()}</b></span></div>
          <p class="enunciado">${esc(p.f.titulo)}: indica qué es cada elemento numerado. (${p.items.length} respuestas; cada una vale 1/${p.items.length} de punto)</p>
          ${filas}
          <div class="acciones">
            <button class="btn sec" onclick="App.moverVisual(-1)" ${ses.i ? '' : 'disabled'}>Anterior</button>
            ${ses.i + 1 < n ? `<button class="btn" onclick="App.moverVisual(1)">Siguiente</button>` : ''}
            <button class="btn ok" onclick="App.terminarVisual()">Terminar y corregir</button>
            <button class="btn sec" onclick="App.salir()">Salir</button>
          </div>
        </div>
      </div>`;
    scrollTo(0, 0);
  }
  function respVisual(id, v) { if (v) ses.resp[id] = v; else delete ses.resp[id]; }
  function moverVisual(d) { ses.i = Math.max(0, Math.min(ses.fotos.length - 1, ses.i + d)); fotoVisual(); }

  function terminarVisual(forzado) {
    const total = ses.fotos.reduce((a, p) => a + p.items.length, 0), dadas = Object.keys(ses.resp).length;
    if (!forzado && dadas < total && !confirm(`Te faltan ${total - dadas} elementos por contestar. ¿Corregir ya?`)) return;
    pararReloj();
    let puntos = 0;
    const det = ses.fotos.map((p, k) => {
      const ok = p.items.filter(it => ses.resp[it.q.id] === it.q.correcta).length;
      puntos += ok / p.items.length;
      p.items.forEach(it => { if (ses.resp[it.q.id]) marcar(it.q.id, ses.resp[it.q.id] === it.q.correcta); });
      return `<li><img src="${p.f.img}" alt="" onclick="App.zoom('${p.f.img}')"><div><b>${k + 1}. ${esc(p.f.titulo)}</b> · ${nota10(ok / p.items.length)} de 1 punto
        <div>${p.items.map(it => { const r = ses.resp[it.q.id], b = r === it.q.correcta; return `<div><span class="r ${b ? 'ok' : 'mal'}">${it.num}</span> ${b ? esc(r) : (r ? '<s>' + esc(r) + '</s> → ' : 'en blanco → ') + '<b>' + esc(it.q.correcta) + '</b>'}</div>`; }).join('')}</div></div></li>`;
    });
    const nota = puntos * 10 / ses.fotos.length, apto = nota >= APROBADO;
    $app.innerHTML = `
      <div class="resultado ${apto ? 'aprobado' : 'suspenso'}">
        <div class="nota">${nota10(nota)}</div>
        <p><b>${apto ? 'Aprobado' : 'Suspenso'}</b> (se aprueba con 7) · ${nota10(puntos)} de ${ses.fotos.length} puntos, pasados a nota sobre 10.</p>
        <div class="acciones" style="justify-content:center"><button class="btn" onclick="App.examenVisual()">Otro simulacro visual</button><button class="btn sec" onclick="App.home()">Inicio</button></div>
      </div>
      <h2>Corrección</h2><ul class="lista">${det.join('')}</ul>`;
    ses.modo = 'revision';
    scrollTo(0, 0);
  }

  function resumen() {
    const n = ses.qs.length;
    $app.innerHTML = `<div class="resultado ${ses.aciertos / n >= 0.7 ? 'aprobado' : 'suspenso'}">
      <div class="nota">${ses.aciertos} / ${n}</div><p>${Math.round(100 * ses.aciertos / n)} % de acierto.</p>
      <div class="acciones" style="justify-content:center"><button class="btn sec" onclick="App.home()">Inicio</button></div></div>`;
  }

  function lista(filtro) {
    filtro = filtro || 'todas';
    const qs = filtro === 'todas' ? P : P.filter(q => q.bloque === filtro);
    const chips = ['todas', ...Object.keys(TEMAS)].map(f => `<button class="chip ${f === filtro ? 'on' : ''}" onclick="App.lista('${f}')">${f === 'todas' ? 'Todas' : esc(TEMAS[f])}</button>`).join('');
    $app.innerHTML = `<h1>Todas las preguntas</h1><div class="filtros">${chips}</div>
      <ul class="lista">${qs.map(q => `<li>${q.img ? `<img src="${q.img}" alt="" onclick="App.zoom('${q.img}')">` : ''}<div><span class="tag">${esc(TEMAS[q.bloque] || q.bloque)}</span> <b>${esc(q.pregunta)}</b><div class="r ok">${esc(q.correcta)}</div>${q.solucion ? `<div>${esc(q.solucion)}</div>` : ''}</div></li>`).join('')}</ul>
      <div class="acciones"><button class="btn sec" onclick="App.home()">Inicio</button></div>`;
    scrollTo(0, 0);
  }

  function borrar() { if (confirm('¿Borrar todo tu progreso guardado en este navegador?')) { est = {}; guardar(); home(); } }
  function zoom(src) { const z = document.getElementById('zoom'); z.querySelector('img').src = src; z.classList.add('on'); }

  document.addEventListener('keydown', e => {
    if (!ses || ses.modo === 'revision' || ses.modo === 'visual') return;
    const q = ses.qs[ses.i];
    if (q && /^[1-9]$/.test(e.key) && +e.key <= q.opciones.length) responder(+e.key - 1);
    else if (e.key === 'Enter' && ses.modo === 'practica' && ses.resp[q.id] !== undefined) siguiente();
  });

  home();
  return { home, examen, examenVisual, practica, responder, siguiente, mover, salir, terminar, lista, borrar, zoom, respVisual, moverVisual, terminarVisual };
})();
