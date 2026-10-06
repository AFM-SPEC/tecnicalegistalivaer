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
    normalizar,
    sinComillas,
    encabezadosDeArticulo,
    inicioDelArticulado,
    soloArticulado,
    cuerpoNormativo,
    preambulo,
    textoPropio,
    colectorDeEjemplos,
    citarCoincidencias,
    oracionDesde,
    oraciones,
    tramosPorArticulo,
    RE_VERBO_NORMATIVO,
    instrumentoNoCubierto,
  } = window.BaseNormas;

  const MANUAL = "Manual de Técnica Legislativa Municipal de Entre Ríos";
  const fuente = (mun, extra) => `${MANUAL}, ${mun}${extra ? ` — ${extra}` : ""}`;
  // Pérez Bourbon, H. (2024). Técnica legislativa municipal. Cómo escribir
  // correctamente una ordenanza municipal. Konrad Adenauer Stiftung – CIMA.
  const PB = (paginas) => `Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), ${paginas}`;

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

    // =========================================================================
    // TÉCNICA LEGISLATIVA MUNICIPAL (Pérez Bourbon, KAS–CIMA, 2024)
    //
    // Reglas tomadas del cuadernillo "Técnica legislativa municipal. Cómo
    // escribir correctamente una ordenanza municipal". Es doctrina: criterio
    // subsidiario, igual que el Manual de InfoLeg. Donde choca con el Manual
    // municipal entrerriano (epígrafes, "deberá", sinónimos, tipo de
    // instrumento), por decisión del proyecto se sigue a Pérez Bourbon.
    // =========================================================================

    // ---- Vigencia, modificaciones y derogaciones ---------------------------
    {
      id: "er-mun-057",
      titulo: "La ordenanza no puede regir antes de existir",
      descripcion:
        "La ordenanza recién existe cuando el Departamento Ejecutivo la promulga (o vence el plazo " +
        "para vetarla). Si se dice que rige desde su sanción o su aprobación por el Concejo, se le " +
        "da vigencia antes de que exista.",
      sugerencia:
        'Contar la vigencia desde la publicación o desde una fecha posterior: "La presente ordenanza ' +
        'entra en vigencia a partir de su publicación."',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-104")} · ${PB("pp. 48-49")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(?:vigencia|vigor|rige|regir[áa]n?)(?![a-záéíóúñ])[^.]{0,80}?\b(?:a\s+partir\s+de|desde)\s+(?:la\s+fecha\s+de\s+)?(?:su|la)\s+(?:sanci[óo]n|aprobaci[óo]n)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 2, radio: 80 });
      },
    },

    {
      id: "er-mun-058",
      titulo: "Se modifica una norma sin decir cuál",
      descripcion:
        'Una modificación tiene que identificar la norma que modifica, con su número: "Modifícase ' +
        'el artículo 5° de la Ordenanza Nº 1.234". Si sólo dice "Modifícanse las Disposiciones ' +
        'Transitorias", no se sabe de qué norma.',
      sugerencia: 'Nombrar la norma y el artículo: "Sustitúyese el artículo 5° de la Ordenanza Nº 1.234…".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-083")} · ${PB("p. 51")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(?:modif[íi](?:c|qu)[ae]n?se|sustit[úu]y[ae]n?se|incorp[óo]r[ae]n?se|incl[úu]y[ae]n?se|agr[ée]gu?[ae]n?se|supr[íi]m[ae]n?se|reempl[áa]z[ae]n?se)\b/gi;
        const IDENTIFICA =
          /\b(?:ley|ordenanza|decreto|resoluci[óo]n)(?:es|s)?\s*(?:n[°ºo.]*|nro\.?|n[úu]mero)?\s*[\d.\/]{2,}|\bc[óo]digo\s+[A-ZÁÉÍÓÚ]|\bcarta\s+org[áa]nica|\bde\s+la\s+presente|\bde\s+esta\s+(?:ordenanza|norma)/i;
        const col = colectorDeEjemplos(3, 120);
        let m;
        while ((m = re.exec(cuerpo)) && !col.lleno()) {
          if (!IDENTIFICA.test(oracionDesde(cuerpo, m.index, 300))) col.agregar(m.index, contexto(text, m.index, 80));
        }
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "er-mun-059",
      titulo: "Se modifica un párrafo o una frase suelta, no el artículo completo",
      descripcion:
        'Agregar un párrafo o suprimir una frase ("Agrégase el siguiente párrafo al inciso f)…", ' +
        '"Suprímese del texto del artículo 72 la frase…") obliga a quien lee a armar el artículo ' +
        "por su cuenta. La modificación tiene que abarcar al menos un artículo (o un inciso) completo.",
      sugerencia:
        'Sustituir el artículo entero con su texto final: "Sustitúyese el artículo 72 de la Ordenanza ' +
        'Nº 4.106, el que queda redactado de la siguiente manera: «…»".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-084")} · ${PB("pp. 52 y 54")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(?:agr[ée]gu?[ae]n?se|a[ñn][áa]d[ae]n?se|incorp[óo]r[ae]n?se|supr[íi]m[ae]n?se|elim[íi]n[ae]n?se|sustit[úu]y[ae]n?se|reempl[áa]z[ae]n?se|intercal[ae]n?se)\b(?:[^.]|\.(?=\d)){0,80}?\b(?:p[áa]rrafo|frase|expresi[óo]n|palabras?|t[ée]rminos?|oraci[óo]n|vocablos?)\b|\bsupr[íi]m[ae]n?se\s+del\s+texto\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 80 });
      },
    },

    {
      id: "er-mun-060",
      titulo: "Se modifica una norma modificatoria en lugar de la original",
      descripcion:
        "El texto nuevo que se transcribe es, a su vez, una modificación de otra norma " +
        '("…quedará redactado así: «Incorpórase a la Ordenanza Nº 11.922…»"). La modificación ' +
        "tiene que hacerse directamente sobre la norma original, no sobre la que la modificó antes.",
      sugerencia:
        'Modificar la norma original: "Incorpórase como artículo 168 bis de la Ordenanza Nº 11.922 el siguiente: «…»".',
      autoridad: "SUBSIDIARIO",
      fuente: PB("pp. 52-53"),
      check(text, { contexto }) {
        const articulado = soloArticulado(text);
        const MODIFICA =
          /^\s*(?:ART[ÍI]CULO\s+\S+\s*[.:\-–—]+\s*)?(?:Modif[íi]can?se|Sustit[úu]y[ae]n?se|Incorp[óo]ran?se|Der[óo]gan?se|Agr[ée]gu?an?se|Incl[úu]y[ae]n?se)\b/i;
        const col = colectorDeEjemplos(2, 120);
        for (const m of articulado.matchAll(/[“"«]([^”"»]{0,4000})[”"»]/g)) {
          if (MODIFICA.test(m[1])) col.agregar(m.index, contexto(text, m.index, 80));
        }
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "er-mun-061",
      titulo: "La derogación depende de un hecho futuro",
      descripcion:
        "La derogación queda sujeta a algo que puede no ocurrir nunca o cuya fecha no se conoce " +
        '("a partir de la entrada en vigencia de la reglamentación"). Mientras tanto no se sabe si ' +
        "la norma derogada sigue rigiendo.",
      sugerencia:
        "Derogar con una fecha cierta, o derogar en la misma norma que pone en marcha el nuevo régimen.",
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-086")} · ${PB("p. 55")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\bder[óo]g\w*se\b(?:[^.]|\.(?=\d)){0,250}?\b(?:a\s+partir\s+de\s+(?:la\s+)?(?:entrada\s+en\s+vigencia|vigencia|puesta\s+en\s+(?:marcha|funcionamiento)|implementaci[óo]n|reglamentaci[óo]n|aprobaci[óo]n|creaci[óo]n)\s+de|cuando\s+(?:se\s+)?(?:dicte|reglamente|implemente|apruebe|ponga\s+en\s+funcionamiento))/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 2, radio: 90 });
      },
    },

    {
      id: "er-mun-062",
      titulo: "Se cita el Código Civil o el de Comercio, derogados en 2015",
      descripcion:
        "El Código Civil y el Código de Comercio fueron reemplazados por el Código Civil y Comercial " +
        "de la Nación (Ley Nº 26.994). Una remisión al código viejo ya no lleva a ninguna parte: sus " +
        "artículos no tienen equivalente directo en el nuevo.",
      sugerencia: "Citar el artículo correspondiente del Código Civil y Comercial de la Nación.",
      autoridad: "SUBSIDIARIO",
      fuente: PB("p. 56"),
      check(text, { contexto }) {
        const re = /\bc[óo]digo\s+civil\b(?!\s+y\s+comercial)|\bc[óo]digo\s+de\s+comercio\b/gi;
        return citarCoincidencias(text, textoPropio(text), re, contexto, { maximo: 3, radio: 60 });
      },
    },

    {
      id: "er-mun-063",
      titulo: "El verbo va en singular y lo que modifica, en plural",
      descripcion:
        '"Modifícase las Disposiciones…" o "Derógase los artículos…" no concuerdan: con un objeto en ' +
        'plural el verbo también va en plural ("Modifícanse", "Deróganse").',
      sugerencia: 'Escribir el verbo en plural: "Modifícanse las…", "Deróganse los…", "Apruébanse los…".',
      autoridad: "SUBSIDIARIO",
      fuente: PB("p. 51"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(?:Modif[íi]c|Der[óo]g|Sustit[úu]y|Incorp[óo]r|Apru[ée]b|Cr[ée]|Autor[íi]z|Establ[ée]c|Decl[áa]r|Des[íi]gn|Prorr[óo]g|Susp[ée]nd|Except[úu]|Incl[úu]y|Agr[ée]gu?|Supr[íi]m|Ratif[íi]c|Otorg)[ae]se\s+(?:los|las)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 50 });
      },
    },

    {
      id: "er-mun-064",
      titulo: "La misma norma se deroga dos veces",
      descripcion:
        "En la lista de normas derogadas, un mismo número aparece más de una vez. Puede ser un error " +
        "de tipeo que deja sin derogar la norma que se quería nombrar.",
      sugerencia: "Revisar la lista y dejar cada número una sola vez.",
      autoridad: "SUBSIDIARIO",
      fuente: PB("p. 55"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const ej = [];
        for (const m of cuerpo.matchAll(/\bder[óo]g\w*se\b(?:[^.]|\.(?=\d)){0,500}/gi)) {
          const vistos = new Set();
          for (const n of m[0].matchAll(/\b\d{1,3}(?:\.\d{3})+(?:\/\d{2,4})?\b|\b\d{3,6}(?:\/\d{2,4})?\b/g)) {
            const numero = n[0].replace(/\./g, "");
            if (vistos.has(numero) && ej.length < 2) {
              ej.push(`El número ${n[0]} aparece dos veces: "${contexto(text, m.index + n.index, 70)}"`);
            }
            vistos.add(numero);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-065",
      titulo: '"Por esta única vez": no queda claro qué rige después',
      descripcion:
        'Una regla que se aplica "por esta única vez" no dice qué pasa la próxima: si vuelve a regir ' +
        "la norma anterior o si queda derogada. Conviene revisarlo.",
      sugerencia: "Decir expresamente qué rige después, o fijar un plazo o un caso concreto.",
      autoridad: "REVISIÓN",
      fuente: PB("p. 54"),
      check(text, { contexto }) {
        const re = /\bpor\s+(?:esta\s+)?[úu]nica\s+vez\b/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 2, radio: 70 });
      },
    },

    // ---- Lógica del sistema -----------------------------------------------
    {
      id: "er-mun-066",
      titulo: "La misma disposición se repite en dos artículos",
      descripcion:
        "Una misma regla o condición aparece escrita en más de un artículo. Es una redundancia: si " +
        "después se modifica uno solo, los dos dicen cosas distintas.",
      sugerencia: "Dejar la regla en un solo artículo y, si hace falta, remitir a él por su número.",
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-119")} · ${PB("p. 62")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const plano = normalizar(cuerpo);
        const tramos = tramosPorArticulo(cuerpo);
        const MARCA = /^(que|no|siempre|salvo|excepto|cuando|si|sin|solo|sólo)$/;
        const primero = new Map();
        for (let k = 0; k < tramos.length; k++) {
          const palabras = [...plano.slice(tramos[k].index, tramos[k].fin).matchAll(/[a-zñ]+/g)];
          for (let i = 0; i + 9 <= palabras.length; i++) {
            const grupo = palabras.slice(i, i + 9).map((p) => p[0]);
            if (grupo.filter((p) => p.length >= 5).length < 4 || !grupo.some((p) => MARCA.test(p))) continue;
            const clave = grupo.join(" ");
            if (!primero.has(clave)) {
              primero.set(clave, k);
            } else if (primero.get(clave) !== k) {
              const index = tramos[k].index + palabras[i].index;
              return { cumple: false, ejemplos: [`"${grupo.join(" ")}" ya figura en otro artículo: "${contexto(text, index, 70)}"`] };
            }
          }
        }
        return { cumple: true };
      },
    },

    // ---- Redacción ---------------------------------------------------------
    {
      id: "er-mun-067",
      titulo: 'Verificar el sentido de "progenitores" o "conviviente"',
      descripcion:
        'Según el diccionario, "progenitores" son todos los ascendientes (padres, abuelos, ' +
        'bisabuelos) y "conviviente" es cualquier persona con la que se vive. Si se quiere decir ' +
        '"padre y madre" o "pareja", la palabra dice más de lo que se quiere.',
      sugerencia:
        'Usar la palabra exacta: "padre y madre", "pareja conviviente" o "integrante de la unión convivencial".',
      autoridad: "REVISIÓN",
      fuente: `${fuente("MUN-053")} · ${PB("pp. 43-44")}`,
      check(text, { contexto }) {
        const re = /\b(?:progenitor(?:es|a|as)?|convivientes?)\b/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 3, radio: 50 });
      },
    },

    {
      id: "er-mun-068",
      titulo: "Dos palabras distintas para lo que podría ser lo mismo",
      descripcion:
        'Los sinónimos nunca significan exactamente lo mismo. Si un artículo dice "parto" y otro ' +
        '"alumbramiento", queda la duda de si se quiso decir lo mismo o algo distinto.',
      sugerencia: "Usar siempre la misma palabra; si son cosas distintas, definir en qué se diferencian.",
      autoridad: "REVISIÓN",
      fuente: `${fuente("MUN-056")} · ${PB("pp. 36-37")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const PARES = [
          [/\bpartos?\b/i, /\balumbramientos?\b/i],
          [/\bveh[íi]culos?\b/i, /\brodados?\b/i],
          [/\bperros?\b/i, /\b(?:canes|c[áa]nidos?)\b/i],
          [/\b[áa]rbol(?:es)?\b/i, /\b(?:especies?\s+arb[óo]reas?|ejemplar(?:es)?\s+arb[óo]reos?)\b/i],
          [/\binmuebles?\b/i, /\bpredios?\b/i],
        ];
        const ej = [];
        for (const [a, b] of PARES) {
          const ma = a.exec(cuerpo);
          const mb = b.exec(cuerpo);
          if (ma && mb && ej.length < 3) {
            ej.push(`"${ma[0]}" y "${mb[0]}": "${contexto(text, mb.index, 50)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-069",
      titulo: '"Requerir" puede significar pedir o necesitar',
      descripcion:
        '"Quien requiere la designación de un tutor" puede ser quien la pide o quien la necesita. ' +
        "Una palabra con dos significados deja la norma abierta a dos lecturas.",
      sugerencia: 'Usar la palabra precisa: "quien solicita…" o "quien necesita…".',
      autoridad: "REVISIÓN",
      fuente: PB("pp. 37-38"),
      check(text, { contexto }) {
        const re = /\bquien(?:es)?\s+requier[ae]n?\b|\b(?:el|la|los|las)\s+que\s+requier[ae]n?\b/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "er-mun-070",
      titulo: "Una oración subordinada agrega otra norma",
      descripcion:
        '"El Comité tiene a su cargo el despacho del Consejo, que puede delegar en…": con la ' +
        'subordinada no queda claro quién puede delegar ni en quién. Una oración simple (sujeto, ' +
        "verbo y complemento) por cada regla evita la duda.",
      sugerencia:
        'Separar en dos oraciones y repetir el sujeto: "El Comité despacha… El Comité puede delegar ese despacho en…".',
      autoridad: "REVISIÓN",
      fuente: PB("pp. 40-41"),
      check(text, { contexto }) {
        const re = /,\s+que\s+(?:puede|pueden|podr[áa]n?|debe|deben|deber[áa]n?|tiene|tienen)(?![a-záéíóúñ])/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 3, radio: 70 });
      },
    },

    {
      id: "er-mun-071",
      titulo: "Verificar quién reglamenta y en qué plazo",
      descripcion:
        "Una ordenanza puede existir y estar vigente pero no poder aplicarse hasta que se reglamente " +
        "(un registro necesita lugar, formularios, horarios). Si la norma crea algo y no dice quién lo " +
        "reglamenta, o lo encomienda sin plazo, puede quedar sin aplicarse.",
      sugerencia:
        'Agregar: "El Departamento Ejecutivo debe reglamentar la presente dentro de los sesenta (60) días de su promulgación."',
      autoridad: "REVISIÓN",
      fuente: `${fuente("MUN-097")} · ${PB("pp. 45 y 50")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const ej = [];
        const crea =
          /\bcr[ée]a(?:n)?se\s+(?:el|la|los|las|un|una)\s+(?:registro|programa|consejo|comisi[óo]n|fondo|sistema|r[ée]gimen|observatorio|[áa]rea|oficina|servicio|plan|centro|mesa|red|banco|padr[óo]n)\b/i.exec(
            cuerpo
          );
        if (crea && !/reglament/i.test(cuerpo)) {
          ej.push(`Se crea algo y la norma no dice quién lo reglamenta: "${contexto(text, crea.index, 60)}"`);
        }
        const re =
          /\b(?:reglamentar[áa]|debe\s+reglamentar|reglamenta\s+la\s+presente|dictar[áa]\s+la\s+reglamentaci[óo]n|ser[áa]\s+reglamentad)/gi;
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const frase = oracionDesde(cuerpo, m.index, 300);
          if (!/dentro\s+de|en\s+(?:el|un)\s+plazo|d[íi]as|meses|antes\s+del?/i.test(frase)) {
            ej.push(`La reglamentación no tiene plazo: "${contexto(text, m.index, 60)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-072",
      titulo: "Hay palabras innecesarias",
      descripcion:
        '"Queda expresamente prohibido": no hay prohibiciones que no sean expresas. "Debe cumplirse ' +
        'con las disposiciones de esta ordenanza": no hace falta que la norma diga que hay que ' +
        "cumplirla. Cada palabra de más agrega una posible interpretación distinta.",
      sugerencia: 'Quitarlas: "Queda prohibido el uso de…".',
      autoridad: "SUBSIDIARIO",
      fuente: PB("p. 42"),
      check(text, { contexto }) {
        const re =
          /\bqueda(?:n)?\s+expresamente\b|\bterminantemente\s+prohibid[oa]s?\b|\btotal\s+y\s+absolutamente\b|\bdeben?\s+cumplirse\s+con\s+(?:las\s+disposiciones\s+de\s+)?(?:esta|la\s+presente)\b/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "er-mun-073",
      titulo: "Hay palabras rebuscadas que tienen una forma simple",
      descripcion:
        'La ordenanza tiene que entenderla cualquier persona. Si se habla de perros, se dice "perros", ' +
        'no "cánidos"; si de árboles, "árbol", no "especie arbórea".',
      sugerencia: "Usar la palabra común.",
      autoridad: "SUBSIDIARIO",
      fuente: PB("p. 26"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const LISTA = [
          [/\bc[áa]nidos?\b/i, "perros"],
          [/\bcanes\b/i, "perros"],
          [/\bespecies?\s+arb[óo]reas?\b/i, "árboles"],
          [/\bejemplar(?:es)?\s+arb[óo]reos?\b/i, "árboles"],
          [/\ben\s+orden\s+a\b/i, "para"],
          [/\befectiviz/i, "hacer efectivo, pagar"],
          [/\bel\s+accionar\b/i, "la actuación"],
        ];
        const ej = [];
        for (const [re, simple] of LISTA) {
          const m = re.exec(cuerpo);
          if (m && ej.length < 4) ej.push(`"${m[0]}" → "${simple}": "${contexto(text, m.index, 45)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-074",
      titulo: '"Deberá" y "podrá" conviene escribirlos en presente',
      descripcion:
        'La ordenanza obliga desde que rige, no más adelante: "el deudor <em>debe</em> pagar", no ' +
        '"deberá pagar". Al pasar a presente se mantiene el mandato con "debe" y la facultad con "puede".',
      sugerencia: 'Cambiar "deberá" por "debe" y "podrá" por "puede".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-049", "decisión del proyecto: el Manual aceptaba «deberá»")} · ${PB("pp. 44-45")}`,
      check(text, { contexto }) {
        const re = /(?<![a-záéíóúñ])(?:deber[áa]n?|podr[áa]n?)(?![a-záéíóúñ])/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 4, radio: 45, separacion: 60 });
      },
    },

    // ---- Estructura --------------------------------------------------------
    {
      id: "er-mun-075",
      titulo: "Conviene definir el ámbito de aplicación",
      descripcion:
        "La ordenanza tendría que decir a qué personas alcanza y en qué territorio se aplica. Es una " +
        "sugerencia para normas de cinco artículos o más que no lo dicen.",
      sugerencia:
        'Considerar un artículo: "ARTÍCULO 2°.- Ámbito de aplicación. La presente se aplica a… en todo el ejido de…".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-043")} · ${PB("decálogo, punto 5, p. 67")}`,
      ubicacionFija: "En los primeros artículos",
      check(text) {
        if (instrumentoNoCubierto(text)) return { cumple: true };
        const cuerpo = cuerpoNormativo(text);
        if (encabezadosDeArticulo(cuerpo).length < 5) return { cumple: true };
        const AMBITO =
          /[áa]mbito\s+de\s+aplicaci[óo]n|\balcanza\s+a\b|\bcomprende\s+a\b|est[áa]n\s+comprendid|\bse\s+aplica\s+(?:a|en)\b|\brige\s+en\b|\ben\s+todo\s+el\s+(?:ejido|territorio|municipio)|\bsujetos?\s+obligad/i;
        if (AMBITO.test(cuerpo)) return { cumple: true };
        return { cumple: false, ejemplos: ["No se encontró a qué personas alcanza la norma ni en qué territorio se aplica."] };
      },
    },

    {
      id: "er-mun-076",
      titulo: "Verificar si corresponde una ordenanza",
      descripcion:
        "Hay decisiones que no van por ordenanza: las propias del Concejo (rechazar una rendición de " +
        "cuentas, otorgar licencia a un concejal), los pedidos al Departamento Ejecutivo o las " +
        "declaraciones de interés suelen hacerse por decreto del Concejo, resolución, comunicación o " +
        "declaración, según el reglamento. Una ordenanza necesita la promulgación y puede ser vetada.",
      sugerencia:
        "Revisar en el Reglamento Interno qué instrumento corresponde. Si es otro, tené en cuenta que " +
        "esta herramienta revisa solamente leyes y ordenanzas.",
      autoridad: "REVISIÓN",
      fuente: `${fuente("MUN-002", "decisión del proyecto: el Manual pedía no juzgar el instrumento")} · ${PB("pp. 23-24 y decálogo, punto 4")}`,
      check(text, { contexto }) {
        if (instrumentoNoCubierto(text)) return { cumple: true };
        const re =
          /\b(?:rech[áa]za(?:n)?se|apru[ée]ba(?:n)?se)\s+la\s+(?:rendici[óo]n\s+de\s+cuentas|cuenta\s+de\s+inversi[óo]n)|\bdecl[áa]ra(?:n)?se\s+de\s+inter[ée]s\b|\bexpr[ée]sa(?:n)?se\s+(?:el\s+|su\s+)?(?:benepl[áa]cito|repudio|preocupaci[óo]n|reconocimiento|adhesi[óo]n)|\bsolic[íi]ta(?:n)?se\s+al\s+(?:Departamento|Poder)\s+Ejecutivo|\bconv[óo]ca(?:n)?se\s+a\s+(?:sesi[óo]n|los\s+concejales)|\botorg[áa](?:n)?se\s+licencia\s+al?\s+concejal/gi;
        return citarCoincidencias(text, cuerpoNormativo(text), re, contexto, { maximo: 3, radio: 60 });
      },
    },

    {
      id: "er-mun-077",
      titulo: "El título es demasiado largo",
      descripcion:
        'El nombre de la ordenanza tiene que ser breve y fácil de recordar: "Iniciativa popular" ' +
        "dice lo mismo que un título de veinte palabras, y la gente va a usarlo.",
      sugerencia: 'Acortar el título a pocas palabras que nombren el tema: "Iniciativa popular".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-022")} · ${PB("p. 30")}`,
      ubicacionFija: "En el título",
      check(text) {
        const inicio = inicioDelArticulado(text);
        if (inicio < 0) return { cumple: true };
        const pre = text.slice(0, Math.min(inicio, 600));
        // El título termina donde empieza el VISTO, el CONSIDERANDO, los
        // fundamentos o la fórmula de sanción ("EL HONORABLE CONCEJO…").
        const fin = pre.search(
          /\bVISTO\b|\bvisto\s*(?::|que)|\bCONSIDERANDO\b|\bconsiderando\b|\bFUNDAMENTOS\b|\bFUNDAMENTACI[ÓO]N\b|\b(?:EL|LA)\s+(?:HONORABLE\s+)?(?:CONCEJO|LEGISLATURA|C[ÁA]MARA|SENADO)\b|\bsanciona|\bORDENA\b|\bPOR\s+ELLO\b/i
        );
        // Lo que no es parte del nombre: la denominación, el número y el municipio.
        const titulo = pre
          .slice(0, fin >= 0 ? fin : pre.length)
          .replace(/proyecto\s+de\s+ordenanza/gi, " ")
          .replace(/\b(?:ordenanza|ley|decreto)\s*n?[°º.ro]*\s*[\d.\/]+/gi, " ")
          .replace(/municipalidad(?:\s+de\s+[A-ZÁÉÍÓÚ][\wáéíóúñ]*(?:\s+[A-ZÁÉÍÓÚ][\wáéíóúñ]*)*)?/gi, " ")
          .trim();
        const palabras = titulo.split(/\s+/).filter(Boolean).length;
        if (palabras <= 15) return { cumple: true };
        return { cumple: false, ejemplos: [`El título tiene ${palabras} palabras: "${titulo.slice(0, 100)}…"`] };
      },
    },

    {
      id: "er-mun-078",
      titulo: "Los artículos no tienen epígrafe",
      descripcion:
        "Cada artículo lleva un nombre breve que indica su contenido, después del número " +
        '("ARTÍCULO 3°.- Vigencia. La presente…"). Con epígrafes se puede armar un índice y encontrar ' +
        "rápido cada norma.",
      sugerencia: 'Agregar el epígrafe después del número: "ARTÍCULO 1°.- Creación. Créase el Registro…".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-033", "decisión del proyecto: el Manual no lo exigía")} · ${PB("pp. 31-32")}`,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const tramos = tramosPorArticulo(cuerpo).filter((t) => t.numero !== null);
        if (tramos.length < 2) return { cumple: true };
        const VERBO = /\b[a-záéíóúñ]+(?:a|e)n?se\b|\b(?:es|son|debe|deben|puede|pueden|tiene|tienen|rige|entra|comuníquese)\b/i;
        const sinEpigrafe = tramos.filter((t) => {
          const resto = cuerpo
            .slice(t.index, t.fin)
            .replace(/^\s*(?:art(?:[íi]culo|\.)\s*\S+(?:\s+(?:bis|ter|quater))?|[a-záéíóúñ]+)\s*[°º]?\s*[)\-–—.:]*\s*/i, "");
          if (/^-[^-]{2,60}-/.test(resto)) return false; // "-Vigencia-"
          const primera = oracionDesde(resto, 0, 120).trim();
          const palabras = primera.split(/\s+/).filter(Boolean).length;
          const esEpigrafe = palabras >= 1 && palabras <= 6 && !VERBO.test(primera) && resto.length > primera.length + 5;
          return !esEpigrafe;
        });
        if (sinEpigrafe.length * 2 < tramos.length) return { cumple: true };
        return {
          cumple: false,
          ejemplos: sinEpigrafe.slice(0, 4).map((t) => `Sin epígrafe: "${contexto(text, t.index + 25, 40)}"`),
        };
      },
    },

    {
      id: "er-mun-079",
      titulo: "Un capítulo, título o sección no tiene nombre",
      descripcion:
        "Las normas se agrupan por tema y cada grupo lleva un nombre que diga de qué trata " +
        '("CAPÍTULO II - Tramitación"). Un "CAPÍTULO II" a secas no ayuda a encontrar nada.',
      sugerencia: 'Agregar el nombre: "CAPÍTULO I - Disposiciones generales".',
      autoridad: "SUBSIDIARIO",
      fuente: `${fuente("MUN-035")} · ${PB("p. 31")}`,
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const ej = [];
        for (const m of propio.matchAll(/\b(?:CAP[ÍI]TULO|T[ÍI]TULO|SECCI[ÓO]N)\s+(?:[IVXLC]+|\d+|[ÚU]NICO)\b/g)) {
          const despues = propio.slice(m.index + m[0].length, m.index + m[0].length + 120);
          const hastaArticulo = despues.split(/\bart[íi]culo\s+\d|\bart\.\s*\d|\bART[ÍI]CULO\b/i)[0];
          const nombre = hastaArticulo.replace(/^[\s\-–—.:°º]+/, "").trim();
          if (nombre.replace(/[^a-záéíóúñ]/gi, "").length < 3 && ej.length < 3) {
            ej.push(`Sin nombre: "${contexto(text, m.index, 40)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-080",
      titulo: "Hay una oración demasiado larga",
      descripcion:
        "Las oraciones del articulado tienen que ser simples: sujeto, verbo y complemento. Una " +
        "oración muy larga, con varias subordinadas, se presta a más de una interpretación.",
      sugerencia: "Dividirla en oraciones más cortas, una idea por oración.",
      autoridad: "SUBSIDIARIO",
      fuente: PB("pp. 40-41"),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const ej = [];
        for (const o of oraciones(cuerpo)) {
          const palabras = o.texto.trim().split(/\s+/).length;
          if (palabras > 70 && ej.length < 3) {
            ej.push(`Una oración de ${palabras} palabras: "${contexto(text, o.index + 60, 60)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // Las reglas que valen igual para leyes y ordenanzas.
    ...window.ReglasComunes.para("municipal"),
  ];
})();
