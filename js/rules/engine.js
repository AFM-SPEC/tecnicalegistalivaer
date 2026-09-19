/**
 * Motor de reglas: corre cada regla del ámbito elegido contra el texto
 * extraído y devuelve solo los hallazgos (reglas que NO se cumplen).
 *
 * Cada regla tiene la forma:
 * {
 *   id: 'nac-001',
 *   titulo: 'Fórmula de sanción presente',
 *   descripcion: 'Explicación de la regla y por qué importa.',
 *   severidad: 'alta' | 'media' | 'baja',
 *   sugerencia: 'Ejemplo concreto de cómo debería quedar el texto.',
 *   ubicacionFija: 'Al inicio, antes del Artículo 1°',  // opcional, ver abajo
 *   check(text, { normalizar, contexto, ordinal }) => { cumple: boolean, ejemplos?: string[] }
 * }
 *
 * UBICACIÓN DE CADA HALLAZGO
 * --------------------------
 * El motor le agrega a cada ejemplo el lugar del documento donde está el
 * problema ("Artículo 8°", "Anexo I", "Encabezado"), para que quien corrige
 * sepa exactamente dónde ir. Lo deduce así:
 *
 *  1. Si la regla define `ubicacionFija`, se usa ese texto. Sirve para las
 *     reglas que señalan algo que FALTA (no hay fragmento que citar): ahí la
 *     ubicación no es dónde está el error sino dónde hay que agregar el texto.
 *  2. Si no, busca en qué parte del documento cae el fragmento citado.
 *
 * Las reglas no necesitan hacer nada especial: alcanza con que citen el texto
 * usando el helper `contexto()`, como ya lo hacen.
 */

const RuleEngine = (() => {
  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  /**
   * Fragmentos citados por `contexto()` mientras corre la regla actual, con la
   * posición exacta de donde salieron. Se vacía antes de cada regla.
   */
  let citas = [];

  /** Devuelve un fragmento de texto alrededor de `index`, para citar dónde aparece algo. */
  function contexto(texto, index, radio = 60) {
    const inicio = Math.max(0, index - radio);
    const fin = Math.min(texto.length, index + radio);
    let frag = texto.slice(inicio, fin).replace(/\s+/g, " ").trim();
    if (inicio > 0) frag = "…" + frag;
    if (fin < texto.length) frag = frag + "…";
    citas.push({ frag, index });
    return frag;
  }

  // ---------------------------------------------------------------------------
  // Ubicación dentro del documento
  // ---------------------------------------------------------------------------

  function escaparRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Escribe el número de un artículo como corresponde: con signo de ordinal
   * del 1° al 9°, y sin él del 10 en adelante ("Artículo 10", no "Artículo 10°").
   *
   * Está acá y se le pasa a las reglas en check() para que haya una sola
   * versión de este criterio en todo el proyecto.
   */
  function ordinal(numero) {
    return numero <= 9 ? `${numero}°` : `${numero}`;
  }

  /**
   * ¿Esta mención a un artículo es una cita y no el encabezado de un artículo?
   *
   * Dentro de un artículo puede decir "conforme al Art. 20 de la Constitución
   * Nacional": eso no abre un artículo nuevo. Se distingue por lo que lo rodea.
   * Un encabezado arranca después de un punto o de un salto de línea; una cita
   * viene enganchada a un conector ("en el", "del", "conforme al") o está
   * seguida de la norma a la que pertenece ("de la Ley 22.000").
   */
  function esCitaDeArticulo(texto, m) {
    const antes = normalizar(texto.slice(Math.max(0, m.index - 24), m.index));
    const CONECTORES =
      /\b(el|del|al|la|las|los|un|una|en|por|este|esta|dicho|dicha|presente|mismo|misma|cada|segun|conforme|previsto|prevista|citado|citada|referido|referida|siguiente|anterior|y|o)\s+$/;
    if (CONECTORES.test(antes)) return true;

    const despues = normalizar(texto.slice(m.index + m[0].length, m.index + m[0].length + 30));
    return /^[\s°ºo.,]*de\s+(la|el|los|las)\s+(ley|constitucion|decreto|norma|codigo|presente)/.test(despues);
  }

  /**
   * Arma la lista de "hitos" del documento (artículos y anexos) con su posición.
   *
   * Descarta las menciones que son citas, y además exige que los encabezados
   * vayan en orden creciente: una mención a un número ya pasado tampoco abre un
   * artículo nuevo.
   */
  function hitos(texto) {
    const crudos = [];

    const reArticulo =
      /\bart(?:[íi]culo|\.)\s*(\d+)\s*[°ºo]?\s*(bis|ter|quater|quinquies|sexies|septies)?/gi;
    for (const m of texto.matchAll(reArticulo)) {
      if (esCitaDeArticulo(texto, m)) continue;
      crudos.push({
        index: m.index,
        tipo: "articulo",
        numero: parseInt(m[1], 10),
        sufijo: m[2] ? " " + m[2].toLowerCase() : "",
      });
    }

    const reAnexo = /\banexo\s*([IVXLCDM]+|\d+)?\b/gi;
    for (const m of texto.matchAll(reAnexo)) {
      crudos.push({ index: m.index, tipo: "anexo", etiquetaAnexo: m[1] ? m[1].toUpperCase() : "" });
    }

    crudos.sort((a, b) => a.index - b.index);

    const lista = [];
    let ultimoNumero = 0;
    for (const h of crudos) {
      if (h.tipo === "anexo") {
        lista.push({ index: h.index, etiqueta: h.etiquetaAnexo ? `Anexo ${h.etiquetaAnexo}` : "Anexo" });
        continue;
      }
      const esEncabezado = h.numero > ultimoNumero || (h.numero === ultimoNumero && h.sufijo);
      if (!esEncabezado) continue;
      ultimoNumero = h.numero;
      lista.push({ index: h.index, etiqueta: `Artículo ${ordinal(h.numero)}${h.sufijo}` });
    }

    return lista;
  }

  /** Traduce una posición del texto a un lugar reconocible del documento. */
  function ubicacionDe(index, listaHitos) {
    if (index === undefined || index === null || index < 0) return "";
    let actual = null;
    for (const h of listaHitos) {
      if (h.index <= index) actual = h;
      else break;
    }
    return actual ? actual.etiqueta : "Encabezado (antes del Artículo 1°)";
  }

  /**
   * Busca un fragmento dentro del texto original y devuelve su posición.
   *
   * Tiene que tolerar tres cosas, porque las reglas citan el texto de maneras
   * distintas: que los espacios no coincidan (al citar, los saltos de línea se
   * reemplazan por espacios), que la cita venga recortada con puntos al final,
   * y que la cita venga en minúsculas y sin acentos (varias reglas trabajan
   * sobre el texto normalizado).
   */
  function buscarFragmento(texto, fragmento) {
    const limpio = fragmento
      .replace(/^[…\.]+/, "")
      .replace(/[…\.]+$/, "")
      .trim();
    if (limpio.length < 5) return -1;

    const directo = texto.indexOf(limpio);

    // Una sola palabra ("30", "online") puede aparecer en cualquier lado, así que
    // solo la ubicamos si en todo el documento aparece una única vez. Si aparece
    // varias, señalar una sería adivinar.
    if (limpio.split(/\s+/).length < 2) {
      if (directo === -1) return -1;
      return texto.indexOf(limpio, directo + 1) === -1 ? directo : -1;
    }

    if (directo !== -1) return directo;

    try {
      const patron = limpio.split(/\s+/).map(escaparRegex).join("\\s+");
      const m = texto.match(new RegExp(patron));
      if (m) return m.index;

      // Último intento: comparar sin acentos ni mayúsculas. Solo sirve si
      // normalizar() no cambió el largo del texto; si lo cambió, las posiciones
      // ya no se corresponden y preferimos no mostrar una ubicación a mostrar
      // una equivocada.
      const plano = normalizar(texto);
      if (plano.length !== texto.length) return -1;
      const mPlano = plano.match(new RegExp(normalizar(limpio).split(/\s+/).map(escaparRegex).join("\\s+")));
      return mPlano ? mPlano.index : -1;
    } catch (err) {
      return -1;
    }
  }

  /** Decide la ubicación de un ejemplo concreto. */
  function ubicarEjemplo(texto, ejemplo, citasDeLaRegla, listaHitos) {
    // 1) El ejemplo incluye un fragmento citado con contexto(): sabemos su posición exacta.
    for (const c of citasDeLaRegla) {
      if (c.frag && ejemplo.includes(c.frag)) return ubicacionDe(c.index, listaHitos);
    }
    // 2) El ejemplo trae texto entrecomillado: lo buscamos en el documento.
    for (const m of ejemplo.matchAll(/"([^"]{5,})"/g)) {
      const i = buscarFragmento(texto, m[1]);
      if (i !== -1) return ubicacionDe(i, listaHitos);
    }
    return "";
  }

  function getRulesFor(ambito) {
    const sets = {
      nacional: window.ReglasNacional || [],
      provincial: window.ReglasProvincialER || [],
      municipal: window.ReglasMunicipalER || [],
    };
    return sets[ambito] || [];
  }

  function analyze(text, ambito) {
    const rules = getRulesFor(ambito);
    const listaHitos = hitos(text);
    const hallazgos = [];

    for (const rule of rules) {
      let resultado;
      citas = [];
      try {
        resultado = rule.check(text, { normalizar, contexto, ordinal });
      } catch (err) {
        resultado = {
          cumple: false,
          ejemplos: [`No se pudo evaluar esta regla automáticamente (${err.message}). Revisar manualmente.`],
        };
      }
      const citasDeLaRegla = citas;

      if (resultado && resultado.cumple === false) {
        const ejemplos = (resultado.ejemplos || []).map((e) => {
          const texto = String(e);
          return {
            texto,
            ubicacion: rule.ubicacionFija || ubicarEjemplo(text, texto, citasDeLaRegla, listaHitos),
          };
        });

        // Lugares distintos donde aparece este problema, para mostrarlos juntos
        // arriba del hallazgo.
        const ubicaciones = [];
        for (const e of ejemplos) {
          if (e.ubicacion && !ubicaciones.includes(e.ubicacion)) ubicaciones.push(e.ubicacion);
        }
        if (ubicaciones.length === 0 && rule.ubicacionFija) ubicaciones.push(rule.ubicacionFija);

        hallazgos.push({
          id: rule.id,
          titulo: rule.titulo,
          descripcion: rule.descripcion,
          sugerencia: rule.sugerencia || "",
          fuente: rule.fuente || "",
          severidad: rule.severidad,
          ejemplos,
          ubicaciones,
        });
      }
    }

    return {
      totalReglas: rules.length,
      hallazgos,
    };
  }

  return { analyze, normalizar };
})();

window.RuleEngine = RuleEngine;
