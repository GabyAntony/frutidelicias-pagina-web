/**
 * GestionCodigos
 * --------------
 * Emite códigos ÚNICOS: un código emitido jamás puede volver a emitirse.
 * El historial se persiste en localStorage para que sobreviva a recargas
 * y para que varias pestañas compartan el mismo registro.
 */
(function () {
  'use strict';

  // Sin caracteres ambiguos (I, O, 0, 1) para evitar confusiones al dictar.
  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const KEY_CODIGOS = 'ruleta.v1.codigos';
  const KEY_ITEMS = 'ruleta.v1.items.usados';      // formato viejo (solo label)
  const KEY_ITEMS_V2 = 'ruleta.v1.items.usados.v2'; // formato nuevo (clave del item)

  class GestionCodigos {
    constructor(key = KEY_CODIGOS) {
      this.key = key;
      this.registro = new Map(); // codigo -> { codigo, item, descripcion, fecha }
      this.cargar();
    }

    /* ---------- persistencia ---------- */

    cargar() {
      try {
        const raw = localStorage.getItem(this.key);
        if (!raw) return;
        const datos = JSON.parse(raw);
        if (Array.isArray(datos)) {
          datos.forEach((e) => {
            if (e && e.codigo) this.registro.set(e.codigo, e);
          });
        }
      } catch (err) {
        console.warn('[codigos] no se pudo leer el registro:', err);
      }
    }

    guardar() {
      try {
        localStorage.setItem(this.key, JSON.stringify(Array.from(this.registro.values())));
      } catch (err) {
        console.warn('[codigos] no se pudo guardar el registro:', err);
      }
    }

    /* ---------- consultas ---------- */

    existe(codigo) {
      return this.registro.has(codigo);
    }

    total() {
      return this.registro.size;
    }

    listar() {
      return Array.from(this.registro.values()).sort((a, b) =>
        String(b.fecha).localeCompare(String(a.fecha))
      );
    }

    /* ---------- emisión ---------- */

    /**
     * Genera un código que no exista en el registro.
     * @param {string} prefijo Prefijo legible (ej. "CAF")
     * @param {number} longitud Longitud de la parte aleatoria
     */
    generar(prefijo = '', longitud = 6) {
      const pre = String(prefijo || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8);

      for (let intento = 0; intento < 5000; intento++) {
        const largo = longitud + Math.floor(intento / 500);
        const codigo = this.componer(pre, largo);
        if (!this.existe(codigo)) return codigo;
      }

      // Fallback extremo: hash incremental con marca de tiempo.
      let n = 2;
      let codigo = this.componer(pre, longitud + 4);
      while (this.existe(codigo)) {
        codigo = this.componer(pre, longitud + 4) + '-' + n++;
      }
      return codigo;
    }

    componer(pre, longitud) {
      let cuerpo = '';
      for (let i = 0; i < longitud; i++) {
        cuerpo += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
      }
      return pre ? `${pre}-${cuerpo}` : cuerpo;
    }

    /**
     * Registra un código como emitido. Si por lo que sea ya existiera,
     * se genera otro para garantizar unicidad.
     */
    registrar(codigoBase, item, descripcion) {
      let codigo = codigoBase;
      if (!codigo || this.existe(codigo)) {
        codigo = this.generar(item && item.codigo ? item.codigo : '');
      }
      const entrada = {
        codigo,
        item: item ? item.label : '',
        descripcion: descripcion || (item ? item.descripcion : '') || '',
        fecha: new Date().toISOString()
      };
      this.registro.set(codigo, entrada);
      this.guardar();
      return entrada;
    }

    /* ---------- mantenimiento ---------- */

    limpiar() {
      this.registro.clear();
      this.guardar();
    }

    toCSV() {
      const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
      const filas = [['codigo', 'item', 'descripcion', 'fecha'].join(',')];
      this.listar().forEach((e) => {
        filas.push([esc(e.codigo), esc(e.item), esc(e.descripcion), esc(e.fecha)].join(','));
      });
      return filas.join('\n');
    }
  }

  /* ---------- items de un solo uso ---------- */

  const ItemsUsados = {
    // Claves de los items ya gastados (formato actual: "indice::label").
    cargar() {
      try {
        return new Set(JSON.parse(localStorage.getItem(KEY_ITEMS_V2) || '[]'));
      } catch (err) {
        return new Set();
      }
    },
    // Formato antiguo: solo guardaba el label. Sirve para migrar.
    cargarLegacy() {
      try {
        return new Set(JSON.parse(localStorage.getItem(KEY_ITEMS) || '[]'));
      } catch (err) {
        return new Set();
      }
    },
    guardar(set) {
      try {
        localStorage.setItem(KEY_ITEMS_V2, JSON.stringify(Array.from(set)));
      } catch (err) {
        console.warn('[items] no se pudo guardar:', err);
      }
    },
    marcar(item) {
      const set = this.cargar();
      set.add(item.clave || item.label);
      this.guardar(set);
    },
    reiniciar() {
      this.guardar(new Set());
      try {
        localStorage.removeItem(KEY_ITEMS);
      } catch (err) {
        /* sin acceso a localStorage: se ignora */
      }
    }
  };

  window.GestionCodigos = GestionCodigos;
  window.ItemsUsados = ItemsUsados;
})();
