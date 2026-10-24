/**
 * Ruleta de la Senna — lógica principal (vanilla JS, sin dependencias).
 *
 * - El peso de cada item se define con `porcentaje`.
 * - El sorteo se hace por peso (no por ángulos al azar) y la animación
 *   se calcula para que la aguja caiga exactamente en el sector ganador.
 * - Cada sorteo emite un código ÚNICO (nunca repetido, persistido).
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
   * Utilidades
   * ------------------------------------------------------------- */
  const TAU = Math.PI * 2;
  const norm = (a) => ((a % TAU) + TAU) % TAU;
  const $ = (sel) => document.querySelector(sel);

  const PALETA = [
    '#e63946', '#f1faee', '#457b9d', '#1d3557', '#f4a261',
    '#2a9d8f', '#e76f51', '#8d99ae', '#ffd166', '#06d6a0',
    '#ef476f', '#118ab2', '#073b4c', '#ff9f1c', '#c1121f'
  ];

  /* ---------------------------------------------------------------
   * Estado
   * ------------------------------------------------------------- */
  const estado = {
    items: [],          // items normalizados y con ángulos calculados
    rotacion: 0,       // rotación actual de la ruleta (rad)
    girando: false,
    ultimoSector: -1,
    usados: new Set(),  // items de un solo uso ya gastados (cache en memoria)
    config: null
  };

  const gestor = new window.GestionCodigos();

  const canvas = $('#ruleta');
  const ctx = canvas.getContext('2d');
  let tamano = 600;
  let audioCtx = null;

  /* ---------------------------------------------------------------
   * Configuración -> items normalizados
   * ------------------------------------------------------------- */
  function normalizarConfig(cfg) {
    const crudos = Array.isArray(cfg && cfg.items) ? cfg.items : [];
    const items = crudos
      .map((it, i) => ({
        label: String((it && it.label) || '').trim(),
        descripcion: String((it && it.descripcion) || '').trim(),
        porcentaje: Number(it && it.porcentaje),
        codigo: String((it && it.codigo) || '').trim().toUpperCase(),
        unico: !!(it && it.unico),
        color: PALETA[i % PALETA.length],
        indice: i
      }))
      .filter((it) => it.label.length > 0);

    // Peso: el porcentaje si es un número válido (0 = nunca sale).
    // Si no se indica porcentaje, todos los items pesan igual.
    items.forEach((it) => {
      it.peso = Number.isFinite(it.porcentaje) ? Math.max(0, it.porcentaje) : 1;
      // Clave única por item: dos premios con el mismo nombre no se pisan.
      it.clave = `${it.indice}::${it.label}`;
    });

    let sumaPesos = items.reduce((a, b) => a + b.peso, 0);
    if (sumaPesos <= 0) {
      // Todos a cero o sin datos: reparto equiprobable.
      items.forEach((it) => { it.peso = 1; });
      sumaPesos = items.length;
    }
    const totalPct = items.reduce((a, b) => a + (Number.isFinite(b.porcentaje) ? Math.max(0, b.porcentaje) : 0), 0);

    let acumulado = 0;
    items.forEach((it) => {
      it.fraccion = sumaPesos > 0 ? it.peso / sumaPesos : 0;
      it.pctMostrado = sumaPesos > 0 ? (it.fraccion * 100) : 0;
      it.anguloInicio = acumulado;              // 0 = arriba, sentido horario
      it.anguloFin = acumulado + it.fraccion;    // en vueltas
      acumulado = it.fraccion;
    });

    return {
      titulo: (cfg && cfg.titulo) || 'Ruleta',
      prefijoCodigo: (cfg && cfg.prefijoCodigo) || '',
      items,
      sumaPesos,
      totalPctDeclarado: totalPct
    };
  }

  function cargarConfig(cfg) {
    estado.config = normalizarConfig(cfg);
    estado.items = estado.config.items;
    estado.rotacion = 0;
    estado.ultimoSector = -1;

    // Items de un solo uso ya gastados. Se migra el formato viejo (guardaba
    // solo el label) para que ningún premio ya entregado vuelva a salir.
    const usados = window.ItemsUsados.cargar();
    const legacy = window.ItemsUsados.cargarLegacy();
    if (legacy.size) {
      estado.items.forEach((it) => {
        if (legacy.has(it.label)) usados.add(it.clave);
      });
      window.ItemsUsados.guardar(usados);
    }
    estado.usados = usados;

    $('#titulo-app').textContent = estado.config.titulo;
    document.title = estado.config.titulo;

    redimensionar();
    dibujar();
  }

  /* ---------------------------------------------------------------
   * Canvas
   * ------------------------------------------------------------- */
  function redimensionar() {
    const caja = canvas.parentElement;
    const lado = Math.max(280, Math.min(caja.clientWidth || 600, 640));
    const dpr = window.devicePixelRatio || 1;
    tamano = lado;
    canvas.style.width = lado + 'px';
    canvas.style.height = lado + 'px';
    canvas.width = Math.round(lado * dpr);
    canvas.height = Math.round(lado * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujar();
  }

  function sectorBajoAguja() {
    // Ángulo local (0 = arriba) que está bajo la aguja con la rotación actual.
    const local = norm(-estado.rotacion);
    const vueltas = local / TAU;
    return vueltas;
  }

  function dibujar() {
    if (!ctx) return;
    const c = tamano / 2;
    const r = tamano / 2 - 6;
    ctx.clearRect(0, 0, tamano, tamano);

    const usados = estado.usados;

    if (!estado.items.length) {
      ctx.beginPath();
      ctx.arc(c, c, r, 0, TAU);
      ctx.fillStyle = '#333';
      ctx.fill();
      return;
    }

    estado.items.forEach((it) => {
      if (it.fraccion <= 0) return; // item con peso 0: no se dibuja
      const inicio = -Math.PI / 2 + it.anguloInicio * TAU + estado.rotacion;
      const span = it.fraccion * TAU;

      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, r, inicio, inicio + span);
      ctx.closePath();
      ctx.fillStyle = it.color;
      ctx.fill();

      if (usados.has(it.clave) && it.unico) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fill();
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.stroke();

      dibujarEtiqueta(it, inicio + span / 2, c, r);
    });

    // Cubo central
    ctx.beginPath();
    ctx.arc(c, c, tamano * 0.075, 0, TAU);
    ctx.fillStyle = '#1b1b1b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /* ---------------------------------------------------------------
   * Legibilidad del texto dentro de los sectores
   * ------------------------------------------------------------- */

  // Luminancia relativa de un color "#rrggbb" (0 = negro, 1 = blanco).
  function luminancia(hex) {
    const h = String(hex || '').replace('#', '');
    if (h.length < 6) return 0;
    const canal = (v) => {
      const s = parseInt(v, 16) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const r = canal(h.slice(0, 2));
    const g = canal(h.slice(2, 4));
    const b = canal(h.slice(4, 6));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Tinta legible sobre un color de fondo (oscuro -> blanco, claro -> negro).
  function tintaPara(color) {
    return luminancia(color) > 0.42 ? '#101216' : '#ffffff';
  }

  // Mezcla un color con negro (0 = negro, 1 = sin cambios).
  function oscurecer(hex, factor) {
    const h = String(hex || '').replace('#', '');
    if (h.length < 6) return hex;
    const p = (v) => Math.round(parseInt(v, 16) * factor).toString(16).padStart(2, '0');
    return `#${p(h.slice(0, 2))}${p(h.slice(2, 4))}${p(h.slice(4, 6))}`;
  }

  // Recorta el texto con "…" hasta que entra en el ancho disponible.
  function recortar(texto, anchoMax) {
    const t = String(texto || '');
    if (!t) return '';
    if (ctx.measureText(t).width <= anchoMax) return t;
    let s = t;
    while (s.length > 1 && ctx.measureText(s + '…').width > anchoMax) {
      s = s.slice(0, -1);
    }
    return s + '…';
  }

  /**
   * Dibuja la etiqueta de un sector.
   *
   * El texto va a lo largo del radio (no tangencial) y se voltea 180° cuando
   * cae en la mitad izquierda de la ruleta, para que nunca quede del revés.
   * `angulo` es el ángulo de canvas (rad) del centro del sector.
   */
  function dibujarEtiqueta(it, angulo, c, r) {
    if (it.fraccion <= 0) return;

    const tam = Math.max(12, Math.min(18, r * 0.055 * Math.max(1, it.fraccion * 3)));
    const gastado = it.unico && estado.usados.has(it.clave);
    const fondo = gastado ? oscurecer(it.color, 0.45) : it.color;

    ctx.save();
    ctx.translate(c, c);
    const voltear = Math.cos(angulo) < 0;
    ctx.rotate(voltear ? angulo + Math.PI : angulo);
    ctx.textAlign = voltear ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${tam}px system-ui, sans-serif`;
    ctx.fillStyle = tintaPara(fondo);

    const radio = r * 0.88;
    const anchoMax = radio - (tamano * 0.075 + 14);
    ctx.fillText(recortar(it.label, anchoMax), voltear ? -radio : radio, 0);
    ctx.restore();
  }

  /* ---------------------------------------------------------------
   * Sorteo
   * ------------------------------------------------------------- */
  function disponibles() {
    return estado.items.filter((it) => it.peso > 0 && !(it.unico && estado.usados.has(it.clave)));
  }

  function elegirPorPeso(lista) {
    const suma = lista.reduce((a, b) => a + b.peso, 0);
    if (suma <= 0) return lista[Math.floor(Math.random() * lista.length)];
    let r = Math.random() * suma;
    for (const it of lista) {
      r -= it.peso;
      if (r < 0) return it;
    }
    return lista[lista.length - 1];
  }

  function girar() {
    if (estado.girando) return;
    const lista = disponibles();
    if (!lista.length) {
      mostrarSinPremios();
      return;
    }

    const ganador = elegirPorPeso(lista);

    // Ángulo local del centro del sector ganador (0 = arriba, sentido horario).
    const medio = (ganador.anguloInicio + ganador.fraccion / 2) * TAU;

    // Rotación necesaria para que ese sector quede bajo la aguja (arriba).
    const actual = norm(estado.rotacion);
    let destino = norm(-medio);
    let delta = destino - actual;
    if (delta < 0) delta += TAU;
    const vueltas = 4 + Math.floor(Math.random() * 3);
    const rotFinal = estado.rotacion + vueltas * TAU + delta;

    estado.girando = true;
    $('#btn-girar').disabled = true;
    $('#resultado').innerHTML = '<p class="resultado-vacio">Girando…</p>';

    const duracion = 5200;
    const t0 = performance.now();
    const rotInicial = estado.rotacion;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function paso(ahora) {
      const t = Math.min(1, (ahora - t0) / duracion);
      estado.rotacion = rotInicial + (rotFinal - rotInicial) * easeOutQuart(t);
      detectarSector();
      dibujar();
      if (t < 1) {
        requestAnimationFrame(paso);
      } else {
        estado.girando = false;
        $('#btn-girar').disabled = false;
        estado.rotacion = norm(estado.rotacion); // evita deriva numérica
        finalizar(ganador);
      }
    }
    requestAnimationFrame(paso);
  }

  function detectarSector() {
    const vueltas = sectorBajoAguja();
    let acumulado = 0;
    let idxSector = -1;
    for (let i = 0; i < estado.items.length; i++) {
      acumulado += estado.items[i].fraccion;
      if (vueltas < acumulado) { idxSector = i; break; }
    }
    if (idxSector !== -1 && idxSector !== estado.ultimoSector) {
      estado.ultimoSector = idxSector;
      tic();
    }
  }

  function tic() {
    if (!$('#chk-sonido').checked) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 900;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (err) {
      /* audio no disponible: se ignora */
    }
  }

  function finalizar(ganador) {
    // 1) Emitir código único (nunca repetido).
    const prefijo = ganador.codigo || estado.config.prefijoCodigo || '';
    const codigo = gestor.generar(prefijo);
    const entrada = gestor.registrar(codigo, ganador, ganador.descripcion);

    // 2) Si el item es de un solo uso, marcarlo como gastado.
    if (ganador.unico) {
      window.ItemsUsados.marcar(ganador);
      estado.usados.add(ganador.clave);
    }

    // 3) Mostrar resultado.
    const caja = $('#resultado');
    caja.innerHTML = `
      <p class="resultado-etiqueta">Has ganado</p>
      <p class="resultado-item">${escapar(ganador.label)}</p>
      ${ganador.descripcion ? `<p class="resultado-desc">${escapar(ganador.descripcion)}</p>` : ''}
      <p class="resultado-codigo-label">Tu código único</p>
      <p class="resultado-codigo">${escapar(entrada.codigo)}</p>
      <p class="resultado-nota">Este código no volverá a emitirse.</p>
      <div class="acciones">
        <button id="btn-copiar" class="btn btn-primario">Copiar código</button>
      </div>
    `;
    $('#btn-copiar').addEventListener('click', () => {
      const btn = $('#btn-copiar');
      const txt = entrada.codigo;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(
          () => { btn.textContent = '¡Copiado!'; setTimeout(() => (btn.textContent = 'Copiar código'), 1500); },
          () => fallbackCopiar(txt, btn)
        );
      } else {
        fallbackCopiar(txt, btn);
      }
    });

    dibujar();
  }

  function fallbackCopiar(texto, btn) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); btn.textContent = '¡Copiado!'; }
    catch (e) { btn.textContent = texto; }
    document.body.removeChild(ta);
    setTimeout(() => (btn.textContent = 'Copiar código'), 1500);
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* ---------------------------------------------------------------
   * Sin premios disponibles
   * ------------------------------------------------------------- */
  function mostrarSinPremios() {
    const caja = $('#resultado');
    caja.innerHTML = `
      <p class="resultado-vacio">No quedan premios disponibles.</p>
      <div class="acciones">
        <button id="btn-reiniciar-sorteos" class="btn">Reiniciar sorteos</button>
      </div>
    `;
    $('#btn-reiniciar-sorteos').addEventListener('click', () => {
      window.ItemsUsados.reiniciar();
      estado.usados = new Set();
      estado.ultimoSector = -1;
      dibujar();
      caja.innerHTML = '<p class="resultado-vacio">Pulsa "Girar la ruleta" para sortear.</p>';
      mostrarMensaje('Sorteos reiniciados: todos los premios vuelven a estar disponibles.', false);
    });
  }

  /* ---------------------------------------------------------------
   * Eventos
   * ------------------------------------------------------------- */
  function init() {
    const porDefecto = window.CONFIG_RULETA;
    cargarConfig(porDefecto);

    $('#btn-girar').addEventListener('click', girar);

    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      // Los botones y campos manejan Enter/Espacio por su cuenta.
      if (tag === 'textarea' || tag === 'input' || tag === 'button') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        girar();
      }
    });

    window.addEventListener('resize', redimensionar);
  }

  function mostrarMensaje(texto, error) {
    const msg = $('#mensaje');
    if (!msg) return;
    msg.className = 'mensaje ' + (error ? 'error' : 'ok');
    msg.textContent = texto;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
