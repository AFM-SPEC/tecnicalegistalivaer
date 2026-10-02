/**
 * Reglas de técnica legislativa — ámbito MUNICIPAL (Entre Ríos).
 *
 * Fuente de las reglas: "Manual de Técnica Legislativa Municipal de Entre
 * Ríos" (docs/fuentes/municipal-er/MANUAL_TECNICA_LEGISLATIVA_MUNICIPAL_ER.md).
 * Cada regla cita el punto del Manual (MUN-xxx) en el que se apoya.
 *
 * Acá están sólo las reglas propias del ámbito municipal. Las que valen igual
 * para leyes y ordenanzas (numeración, derogaciones, "y/o", siglas…) están en
 * comunes.js y se agregan al final con ReglasComunes.para("municipal").
 *
 * PRIORIDAD Y AUTORIDAD
 * ---------------------
 * La prioridad de cada aviso sale de prioridades.js y es la misma en los tres
 * ámbitos: depende de lo que el error afecta, no de cuánto obliga la fuente.
 * Eso último lo dice `autoridad`: casi todas las reglas municipales son
 * SUBSIDIARIO, porque no hay una norma común que obligue a todos los
 * municipios entrerrianos a redactar de una forma determinada.
 *
 * La fórmula de sanción y el artículo de cierre dependen de cada Concejo
 * (VERIFICAR LOCALMENTE). Por decisión del proyecto se controla sólo que estén
 * (er-mun-054 y er-mun-055), con un modelo orientativo. Las firmas y los
 * requisitos de presentación no están acá: sólo se activarán cuando exista la
 * ficha local de un municipio (Manual, sección 21).
 *
 * ALCANCE: en lo municipal se revisan solamente ordenanzas. Las resoluciones,
 * decretos, comunicaciones, declaraciones, minutas y pedidos de informes no se
 * revisan (ver BaseNormas.ALCANCE). Las reglas propias de las ordenanzas no se
 * aplican si el documento dice ser uno de esos instrumentos.
 *
 * IMPORTANTE (igual que en nacional.js y provincial-er.js): `titulo`,
 * `descripcion` y `sugerencia` se insertan como HTML y son texto fijo escrito
 * acá. Lo único que proviene del documento del usuario es `ejemplos`, que
 * app.js escapa aparte. Nunca pongas fragmentos del documento en `sugerencia`
 * ni en `descripcion`.
 */

window.ReglasMunicipalER = (() => {
  const {
    sinComillas,
    encabezadosDeArticulo,
    soloArticulado,
    cuerpoNormativo,
    preambulo,
    citarCoincidencias,
    RE_VERBO_NORMATIVO,
    instrumentoNoCubierto,
  } = window.BaseNormas;

  const MANUAL = "Manual de Técnica Legislativa Municipal de Entre Ríos";
  const fuente = (mun, extra) => `${MANUAL}, ${mun}${extra ? ` — ${extra}` : ""}`;

  // Marcas que cierran el preámbulo municipal y abren la parte dispositiva.
  // Las de mayúsculas se buscan sin /i: "Que este Honorable Concejo…" dentro
  // de un considerando no cierra nada.
  const RE_CIERRE_PREAMBULO =
    /\bpor\s+(todo\s+)?ello\b|\bPOR\s+TANTO\b|\bEL\s+(HONORABLE\s+)?CONCEJO\s+DELIBERANTE\b|\bSANCIONA\b|\bORDENA\s*:|\bRESUELVE\s*:|\bDECRETA\s*:/g;
  const RE_VISTO = /\bVISTO\b|\bvisto\s*:/;
  const RE_CONSIDERANDO = /\bCONSIDERANDO\b|\bconsiderando\s*:/;

  /**
   * Un bloque del preámbulo (VISTO o CONSIDERANDO), desde su rótulo hasta el
   * siguiente rótulo, la fórmula de sanción o el primer artículo. Devuelve el
   * texto completo con todo lo demás en blanco, o null si no existe.
   */
  function bloqueDelPreambulo(texto, reInicio, reFinExtra) {
    const pre = preambulo(texto);
    const m = reInicio.exec(pre);
    if (!m) return null;
    const desde = m.index + m[0].length;
    let hasta = pre.length;
    const candidatos = [];
    if (reFinExtra) {
      const f = reFinExtra.exec(pre.slice(desde));
      if (f) candidatos.push(desde + f.index);
    }
    RE_CIERRE_PREAMBULO.lastIndex = 0;
    let c;
    while ((c = RE_CIERRE_PREAMBULO.exec(pre))) {
      if (c.index >= desde) {
        candidatos.push(c.index);
        break;
      }
    }
    if (candidatos.length) hasta = Math.min(...candidatos);
    const blancos = (n) => " ".repeat(Math.max(0, n));
    return blancos(desde) + texto.slice(desde, hasta) + blancos(texto.length - hasta);
  }

  /**
   * ¿Se le aplican las reglas propias de las ordenanzas? Sí, salvo que el
   * documento diga ser otro instrumento (resolución, decreto…). Antes se pedía
   * que dijera "ordenanza", y un proyecto sin denominación quedaba sin revisar.
   */
  const esOrdenanza = (texto) => !instrumentoNoCubierto(texto);

  return [
    // =========================================================================
    // ESTRUCTURA DEL PROYECTO
    // =========================================================================
    {
      id: "er-mun-004",
      titulo: "Posible mandato dentro del VISTO",
      descripcion:
        "El VISTO identifica antecedentes: el expediente, la nota o la norma que motivan el " +
        "proyecto. Si contiene verbos que disponen (\"créase\", \"autorízase\"), ese mandato no " +
        "tiene fuerza normativa ahí. Usar o no el VISTO depende de cada Concejo: su ausencia no " +
        "se marca.",
      sugerencia:
        "Pasar el mandato a un artículo y dejar en el VISTO sólo la referencia al antecedente.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-024"),
      check(text, { contexto }) {
        const bloque = bloqueDelPreambulo(text, RE_VISTO, RE_CONSIDERANDO);
        if (!bloque) return { cumple: true };
        return citarCoincidencias(text, bloque, RE_VERBO_NORMATIVO, contexto, { maximo: 3 });
      },
    },

    {
      id: "er-mun-005",
      titulo: "Posible mandato dentro del CONSIDERANDO",
      descripcion:
        "El CONSIDERANDO explica por qué se dicta la norma; no dispone nada. Un verbo que manda " +
        "(\"créase\", \"establécese\") dentro del considerando no tiene fuerza normativa. Usar o no " +
        "el CONSIDERANDO depende de cada Concejo: su ausencia no se marca.",
      sugerencia:
        "Pasar el mandato a un artículo. En el considerando, si hace falta, explicar por qué " +
        'conviene: "Que resulta necesario crear…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-025"),
      check(text, { contexto }) {
        const bloque = bloqueDelPreambulo(text, RE_CONSIDERANDO, null);
        if (!bloque) return { cumple: true };
        return citarCoincidencias(text, bloque, RE_VERBO_NORMATIVO, contexto, { maximo: 3 });
      },
    },

    {
      id: "er-mun-007",
      titulo: "Verificar el articulado y los fundamentos de la iniciativa popular",
      descripcion:
        "Un proyecto de iniciativa popular tiene que presentarse redactado como norma, con " +
        "artículos, y con sus fundamentos. La herramienta no controla firmas, porcentajes ni " +
        "materias excluidas.",
      sugerencia:
        "Redactar la propuesta en artículos numerados y agregar un bloque de fundamentos o " +
        "considerandos que explique por qué se la propone.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-005"),
      ubicacionFija: "En todo el documento",
      check(text) {
        const inicio = text.slice(0, Math.max(600, Math.floor(text.length * 0.2)));
        if (!/iniciativa\s+popular/i.test(inicio)) return { cumple: true };
        const ej = [];
        if (!encabezadosDeArticulo(sinComillas(text)).length) {
          ej.push("No se encontraron artículos numerados.");
        }
        if (!/fundamento|considerando|exposici[óo]n\s+de\s+motivos/i.test(text)) {
          ej.push("No se encontró un bloque de fundamentos ni de considerandos.");
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // MODIFICACIONES, DEROGACIONES Y VIGENCIA
    // =========================================================================
    {
      id: "er-mun-019",
      titulo: "No queda claro desde cuándo se aplica la ordenanza",
      descripcion:
        "No se encontró una cláusula que diga desde cuándo rige la ordenanza. Conviene decirlo " +
        "expresamente. La herramienta no indica cuál es la fecha correcta: eso lo decide quien " +
        "redacta.",
      sugerencia:
        'Agregar antes del artículo final: "ARTÍCULO n°.- Vigencia. La presente ordenanza entra en ' +
        'vigencia a partir de…" y completar con una fecha, un plazo o un hecho verificable.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-013"),
      ubicacionFija: "Antes del artículo final",
      check(text) {
        if (!esOrdenanza(text)) return { cumple: true };
        const cuerpo = soloArticulado(text);
        if (!cuerpo.trim()) return { cumple: true };
        const vigencia =
          /vigencia|entrada\s+en\s+vigor|entrar[áa]\s+en\s+vigor|(comenzar[áa]|comienza|empezar[áa])\s+a\s+regir|\brige\s+(a\s+partir|desde)|regir[áa]\s+(a\s+partir|desde)|surt(e|ir[áa])\s+efecto|a\s+partir\s+de\s+(la\s+fecha\s+de\s+)?su\s+(promulgaci[óo]n|publicaci[óo]n|sanci[óo]n)/i;
        if (vigencia.test(cuerpo)) return { cumple: true };
        return { cumple: false, ejemplos: ["El articulado no contiene una cláusula de vigencia reconocible."] };
      },
    },

    // =========================================================================
    // CITAS Y REMISIONES
    // =========================================================================
    {
      id: "er-mun-033",
      titulo: "La misma norma se cita de formas distintas",
      descripcion:
        'El documento cita leyes u ordenanzas con formatos que se alternan: "Ley 10027" en un lugar ' +
        'y "Ley Nº 10.027" en otro. La herramienta no impone un formato: sólo avisa si el propio ' +
        "documento no es uniforme.",
      sugerencia: 'Elegir un formato y usarlo en todo el texto, por ejemplo "Ley Nº 10.027".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-075", "no exige el punto de los miles: sólo marca la alternancia"),
      check(text, { contexto }) {
        const re = /\b(ley|ordenanza|decreto)\s*(n[°ºo]\.?|nro\.?|n[úu]mero)?\s*(\d{1,3}(?:\.\d{3})+|\d{4,})\b/gi;
        const porTipo = new Map();
        let m;
        while ((m = re.exec(text))) {
          const tipo = m[1].toLowerCase();
          if (!porTipo.has(tipo)) porTipo.set(tipo, { conPunto: null, sinPunto: null, conN: null, sinN: null });
          const r = porTipo.get(tipo);
          const conPunto = m[3].includes(".");
          if (conPunto) r.conPunto ??= m.index;
          else r.sinPunto ??= m.index;
          if (m[2]) r.conN ??= m.index;
          else r.sinN ??= m.index;
        }
        const ej = [];
        for (const [tipo, r] of porTipo) {
          if (r.conPunto !== null && r.sinPunto !== null) {
            ej.push(
              `Número de ${tipo} con punto: "${contexto(text, r.conPunto, 30)}" y sin punto: "${contexto(text, r.sinPunto, 30)}"`
            );
          } else if (r.conN !== null && r.sinN !== null) {
            ej.push(`Cita de ${tipo} con "Nº": "${contexto(text, r.conN, 30)}" y sin él: "${contexto(text, r.sinN, 30)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej.slice(0, 3) };
      },
    },

    // =========================================================================
    // ORTOTIPOGRAFÍA Y FORMATO
    // =========================================================================
    {
      id: "er-mun-048",
      titulo: "Los porcentajes se escriben de formas distintas",
      descripcion:
        'El documento alterna maneras de escribir porcentajes: "veinte por ciento (20 %)" en un ' +
        'lugar y "20 %" solo en otro. La herramienta no impone una forma: sólo avisa si el propio ' +
        "documento no es uniforme.",
      sugerencia: 'Elegir una convención, por ejemplo "veinte por ciento (20 %)", y usarla siempre.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-070"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const conLetras = /\(\s*\d+(?:[.,]\d+)?\s*(%|por\s+ciento)\s*\)/i.exec(cuerpo);
        const soloCifra = /(?<![(\d.,])\b\d+(?:[.,]\d+)?\s*(%|por\s+ciento\b)(?!\s*\))/i.exec(cuerpo);
        if (!(conLetras && soloCifra)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [
            `Con letras y cifra: "${contexto(text, conLetras.index, 40)}"`,
            `Sólo con cifra: "${contexto(text, soloCifra.index, 40)}"`,
          ],
        };
      },
    },

    {
      id: "er-mun-049",
      titulo: "Los montos en pesos usan separadores distintos",
      descripcion:
        'El documento escribe montos con separadores que no coinciden: "$ 1.500.000" en un lugar ' +
        'y "$ 1500000" o "$ 1,500,000" en otro. La herramienta no modifica ni interpreta las cifras.',
      sugerencia: 'Elegir un formato y usarlo en todos los montos, por ejemplo "$ 1.500.000".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-071"),
      check(text, { contexto }) {
        const re = /\$\s*(\d[\d.,]*\d)/g;
        const estilos = new Map();
        let m;
        while ((m = re.exec(text))) {
          const n = m[1];
          let estilo = null;
          if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(n)) estilo = "con punto";
          else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(n)) estilo = "con coma";
          else if (/^\d{5,}([.,]\d{1,2})?$/.test(n)) estilo = "sin separador";
          if (estilo && !estilos.has(estilo)) estilos.set(estilo, m.index);
        }
        if (estilos.size < 2) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [...estilos].map(([estilo, i]) => `Monto ${estilo}: "${contexto(text, i, 35)}"`),
        };
      },
    },

    {
      id: "er-mun-050",
      titulo: 'Unidades de medida mal abreviadas ("mts", "kms", "hs")',
      descripcion:
        'Los símbolos de las unidades no llevan plural ni punto: se escribe "m", "km", "kg", "h", ' +
        'no "mts", "kms", "kgs" o "hs".',
      sugerencia: 'Escribir "100 m" en lugar de "100 mts", o la unidad completa: "100 metros".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-072"),
      check(text, { contexto }) {
        const re = /\b\d+(?:[.,]\d+)?\s*(kms|kgs|mts|mt|lts|lt|hs|hrs|hr|grs|cms|km\.|kg\.)(?![a-záéíóúñ])/gi;
        return citarCoincidencias(text, text, re, contexto, { maximo: 4, radio: 35, separacion: 60 });
      },
    },

    // =========================================================================
    // FÓRMULAS QUE DEPENDEN DE CADA CONCEJO
    //
    // El Manual (MUN-027 y MUN-105) pide no controlarlas sin la ficha local del
    // municipio. Por decisión del proyecto se controla sólo que estén, nunca
    // cómo están redactadas, y cada aviso aclara que el modelo es orientativo:
    // con más de 80 municipios no hay una fórmula única que sugerir.
    // =========================================================================
    {
      id: "er-mun-054",
      titulo: "La fórmula de sanción falta o no dice quién sanciona",
      descripcion:
        "Antes del primer artículo, la ordenanza suele llevar la fórmula con la que el Concejo la " +
        "sanciona, y esa fórmula nombra al Concejo. Entre Ríos tiene más de 80 municipios y cada Concejo usa su propia fórmula, así " +
        "que no se puede sugerir una única: la del ejemplo es sólo orientativa. La herramienta " +
        "revisa que la fórmula esté, no cómo está redactada. Si el Concejo no la usa o la ubica " +
        "fuera del texto del proyecto, no hace falta agregarla.",
      sugerencia:
        'Agregar antes del ARTÍCULO 1°, por ejemplo: "EL HONORABLE CONCEJO DELIBERANTE DE ' +
        '[MUNICIPIO] SANCIONA LA SIGUIENTE ORDENANZA:". Es sólo un modelo: usar la fórmula del ' +
        "Concejo donde se presenta el proyecto.",
      autoridad: "VERIFICAR LOCALMENTE",
      fuente: fuente("MUN-027", "sólo se controla que esté; la redacción depende de cada Concejo"),
      ubicacionFija: "Antes del Artículo 1°",
      check(text, { contexto }) {
        if (!encabezadosDeArticulo(sinComillas(text)).length || !esOrdenanza(text)) {
          return { cumple: true };
        }
        const pre = preambulo(text);
        // Las de mayúsculas se buscan sin /i: "que ordena el tránsito" dentro de
        // un considerando no es una fórmula.
        const formula =
          /\bsanciona\b|fuerza\s+de\s+ordenanza/i.exec(pre) || /\b(ORDENA|RESUELVE|DECRETA|DISPONE|ESTABLECE)\b/.exec(pre);
        if (!formula) {
          return { cumple: false, ejemplos: ["Antes del primer artículo no aparece una fórmula de sanción."] };
        }
        // La fórmula nombra al órgano que sanciona: "El Honorable Concejo Deliberante…".
        const alrededor = pre.slice(Math.max(0, formula.index - 250), formula.index + 60);
        if (/concejo|deliberante|\bcuerpo\b/i.test(alrededor)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [`La fórmula no dice qué órgano sanciona: "${contexto(text, formula.index, 60)}"`],
        };
      },
    },

    {
      id: "er-mun-055",
      titulo: "No se encontró el artículo de cierre",
      descripcion:
        "La ordenanza suele terminar con un artículo de forma que ordena comunicarla, publicarla, " +
        "registrarla y archivarla. Entre Ríos tiene más de 80 municipios y cada Concejo usa su " +
        "propia fórmula, así que no se puede sugerir una única: las del ejemplo son sólo " +
        "orientativas. La herramienta revisa que el artículo de cierre esté, no cómo está redactado.",
      sugerencia:
        'Agregar como último artículo "ARTÍCULO X°.- Comuníquese, publíquese, regístrese y ' +
        'archívese." o "ARTÍCULO X°.- De forma." Son sólo modelos: usar la fórmula del Concejo ' +
        "donde se presenta el proyecto.",
      autoridad: "VERIFICAR LOCALMENTE",
      fuente: fuente("MUN-105", "sólo se controla que esté; la redacción depende de cada Concejo"),
      ubicacionFija: "Al final del articulado",
      check(text) {
        if (!esOrdenanza(text)) return { cumple: true };
        const cuerpo = cuerpoNormativo(text);
        if (!encabezadosDeArticulo(cuerpo).length) return { cumple: true };
        // Mismo criterio que er-prov-015. "Publíquese" y "regístrese" solos no
        // alcanzan: pueden aparecer en un artículo que ordena otra cosa.
        if (/comun[íi]quese|arch[íi]vese|\bde\s+forma\s*[.\-]/i.test(cuerpo)) return { cumple: true };
        return { cumple: false, ejemplos: ["El articulado termina sin un artículo de cierre."] };
      },
    },

    // =========================================================================
    // ÓRGANOS DEL MUNICIPIO
    // =========================================================================
    {
      id: "er-mun-056",
      titulo: "Verificar el nombre del órgano ejecutivo",
      descripcion:
        "Según la Ley Nº 10.027, en los municipios entrerrianos el órgano ejecutivo es el " +
        "Departamento Ejecutivo, a cargo del Presidente Municipal. Nombres como \"Poder Ejecutivo\" " +
        "(que suele referirse al provincial o al nacional) o \"Intendente\" pueden hacer dudar de " +
        "a qué órgano se refiere la norma.",
      sugerencia: 'Usar la denominación de la ley: "el Departamento Ejecutivo Municipal".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-055", "consistencia terminológica; Ley Nº 10.027"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\bPoder\s+Ejecutivo\b(?!\s+(?:Provincial|Nacional|de\s+la\s+(?:Provincia|Naci[óo]n)))|\bIntendente\b|\bIntendencia\b/g;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 50 });
      },
    },

    // Las reglas que valen igual para leyes y ordenanzas.
    ...window.ReglasComunes.para("municipal"),
  ];
})();
