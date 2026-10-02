/**
 * Reglas de técnica legislativa — ámbito PROVINCIAL (Entre Ríos).
 *
 * Fuente de las reglas: skill "Control de Técnica Legislativa de Leyes
 * Provinciales de Entre Ríos" (docs/fuentes/provincial-er/), construida sobre
 * la investigación documental de fuentes primarias entrerrianas y un corpus
 * medido de 53 leyes (Nº 11.221 a 11.301, Boletín Oficial 2025-2026).
 *
 * NIVEL DE AUTORIDAD (campo `autoridad`)
 * --------------------------------------
 * No todas las reglas obligan igual, y la herramienta no puede presentarlas
 * como si lo hicieran. Cada regla declara de dónde saca su fuerza:
 *
 *   EXIGE                        Constitución provincial o reglamento de Cámara.
 *   CRITERIO LEGAL CONDICIONADO  Ley Nº 9.971 del Digesto, cuya aplicación a
 *                                proyectos está documentada como analógica.
 *   RECOMIENDA                   Modelo o instructivo oficial de una Cámara.
 *   ACOSTUMBRA                   Práctica legislativa entrerriana observada.
 *   SUBSIDIARIO                  Criterio doctrinario o nacional, incorporado
 *                                sólo para cubrir un vacío local.
 *
 *   REVISIÓN                     Aviso de revisión: el punto exige criterio
 *                                jurídico y sólo se avisa ante una frase concreta.
 *
 * La prioridad de cada aviso no sale de acá sino de prioridades.js, y es la
 * misma en los tres ámbitos: depende de lo que el error afecta, no de cuánto
 * obliga la fuente (decisión del proyecto). La autoridad se sigue mostrando
 * aparte, para que quede claro cuánto obliga cada observación.
 *
 * Acá están sólo las reglas propias de las leyes entrerrianas. Las que valen
 * igual en los tres ámbitos están en comunes.js y se agregan al final con
 * ReglasComunes.para("provincial").
 *
 * FUERA DE ALCANCE
 * ----------------
 * Esta revisión es formal. No evalúa mérito, oportunidad, impacto,
 * constitucionalidad material, competencia de la Legislatura, suficiencia
 * presupuestaria ni si la reglamentación altera el espíritu de la ley.
 *
 * IMPORTANTE (igual que en nacional.js): `titulo`, `descripcion` y `sugerencia`
 * se insertan como HTML y son texto fijo escrito acá. Lo único que proviene del
 * documento del usuario es `ejemplos`, que app.js escapa aparte. Nunca pongas
 * fragmentos del documento en `sugerencia` ni en `descripcion`.
 */

window.ReglasProvincialER = (() => {
  // ---------------------------------------------------------------------------
  // Utilidades comunes
  //
  // Todas devuelven cadenas del MISMO largo que el texto original: lo que se
  // descarta se reemplaza por espacios. Así las posiciones siguen coincidiendo
  // y contexto(text, m.index) cita el lugar correcto del documento.
  // ---------------------------------------------------------------------------

  const blancos = (n) => " ".repeat(Math.max(0, n));

  /**
   * Borra lo que esté entre comillas. En una ley modificatoria el texto nuevo
   * va entrecomillado y trae adentro sus propios "ARTÍCULO n.-", que no son
   * artículos del proyecto sino del texto que se está sustituyendo. Si no se
   * los saca, la revisión los cuenta dos veces.
   */
  function sinComillas(texto) {
    return texto.replace(/[“"«][^”"»]{0,4000}[”"»]/g, (m) => blancos(m.length));
  }

  /** Junta todo sin espacios: reconoce la fórmula aunque el PDF la haya partido. */
  function pegado(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  // Sólo en mayúsculas: así es como se escribe el encabezado del bloque. Si se
  // buscara sin distinguir, la palabra "fundamentos" dentro de una oración
  // cualquiera partiría el documento en dos por error.
  const RE_FUNDAMENTOS = /\bFUNDAMENTOS\b|\bFUNDAMENTACI[ÓO]N\b/;
  const RE_FORMULA_NACIONAL = /el\s+senado\s+y\s+(la\s+)?c[áa]mara\s+de\s+diputados/i;
  const RE_SANCION = /sanciona(?:n)?\s+con\s+fuerza\s+de\s+ley/i;

  /**
   * Deja sólo el articulado, en blanco el resto.
   *
   * Los fundamentos pueden ir después del articulado (práctica de Diputados) o
   * antes (práctica del Senado). Se distingue por dónde cae la fórmula de
   * sanción: lo que está del lado de la fórmula es el articulado.
   */
  function soloArticulado(texto) {
    const fund = RE_FUNDAMENTOS.exec(texto);
    if (!fund) return texto;
    const sancion = RE_SANCION.exec(texto);
    if (sancion && sancion.index > fund.index) {
      return blancos(sancion.index) + texto.slice(sancion.index);
    }
    return texto.slice(0, fund.index) + blancos(texto.length - fund.index);
  }

  /** El cuerpo normativo limpio: sin fundamentos y sin textos citados. */
  const cuerpoNormativo = (texto) => sinComillas(soloArticulado(texto));

  /**
   * ¿Es una ley ya sancionada y no un proyecto? Se reconoce por las marcas de
   * cierre del trámite. A una ley sancionada no se le pueden exigir los
   * fundamentos: quedaron en el expediente parlamentario.
   */
  function esLeySancionada(texto) {
    return /SALA\s+DE\s+SESIONES|POR\s+TANTO\s*:/i.test(texto);
  }

  /**
   * Junta ejemplos evitando citar dos veces la misma frase.
   *
   * Cuando dos defectos caen muy cerca ("Visto que… y considerando que…"), los
   * fragmentos que se citan se solapan y en pantalla parece que la herramienta
   * repite tres veces el mismo hallazgo. Se queda con el primero de cada grupo.
   */
  function colectorDeEjemplos(maximo = 4, separacion = 120) {
    const ejemplos = [];
    let ultimo = -Infinity;
    return {
      ejemplos,
      lleno: () => ejemplos.length >= maximo,
      agregar(index, texto) {
        if (ejemplos.length >= maximo || index - ultimo < separacion) return;
        ultimo = index;
        ejemplos.push(texto);
      },
    };
  }

  /** Posición relativa (0 a 1) dentro de la parte del texto que tiene contenido. */
  function posicionRelativa(cuerpo, index) {
    const inicio = cuerpo.search(/\S/);
    const fin = cuerpo.replace(/\s+$/, "").length;
    if (inicio < 0 || fin <= inicio) return 0;
    return (index - inicio) / (fin - inicio);
  }

  /**
   * Encabezados de artículo del articulado, descartando las citas a otras normas.
   *
   * No sirve pedir que el encabezado abra línea: al extraer el texto de un PDF,
   * cada página entera queda en un solo renglón. Lo que distingue una cita es
   * la palabra que la engancha a la oración ("previsto por el artículo 145") o
   * la norma que la sigue ("el artículo 4º de la Ley Nº 10.479").
   */
  function encabezadosDeArticulo(cuerpo) {
    // El separador va como opcional: en el Boletín entrerriano conviven
    // "ARTÍCULO 1º.-", "ARTICULO 2º:" y "ARTICULO 4º " sin nada detrás.
    const re = /art[íi]culo\s+(\d+)\s*[°ºo]?\s*(bis|ter|quater|quinquies)?\s*[.:\-–—]?/gi;
    const CONECTORES =
      /\b(el|del|al|la|las|los|un|una|en|de|por|para|este|esta|dicho|dicha|presente|mismo|misma|cada|seg[úu]n|conforme|previsto|prevista|previstos|previstas|establecido|establecida|citado|citada|referido|referida|mencionado|mencionada|siguiente|anterior|y|o)\s+$/i;
    const lista = [];
    let m;
    while ((m = re.exec(cuerpo))) {
      if (CONECTORES.test(cuerpo.slice(Math.max(0, m.index - 24), m.index))) continue;
      const despues = cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 30);
      if (/^\s*de\s+(la|el|los|las)\s+(ley|constituci[óo]n|decreto|norma|c[óo]digo)/i.test(despues)) continue;
      lista.push({ numero: Number(m[1]), sufijo: m[2] || "", index: m.index });
    }
    return lista;
  }

  // Números escritos en letras, para cotejarlos con la cifra entre paréntesis.
  const NUMEROS = {
    cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
    siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
    quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20,
    veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23,
    veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28,
    veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70,
    ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300,
    cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700,
    ochocientos: 800, novecientos: 900,
    doscientas: 200, trescientas: 300, cuatrocientas: 400, quinientas: 500,
    seiscientas: 600, setecientas: 700, ochocientas: 800, novecientas: 900,
    mil: 1000, millon: 1000000, millones: 1000000,
  };

  /** Las palabras que multiplican lo anterior en lugar de sumarse. */
  const MULTIPLICADORES = new Set(["mil", "millon", "millones"]);

  /** Convierte "noventa y seis" en 96. Devuelve null si no es un número escrito. */
  function valorEnLetras(palabras) {
    if (!palabras.length) return null;
    let total = 0;
    let parcial = 0;
    for (const p of palabras) {
      if (p === "y") continue;
      const v = NUMEROS[p];
      if (v === undefined) return null;
      if (MULTIPLICADORES.has(p)) {
        total += (parcial || 1) * v;
        parcial = 0;
      } else {
        parcial += v;
      }
    }
    return total + parcial;
  }

  /** Las palabras-número que vienen pegadas antes de un "(" con una cifra adentro. */
  function letrasAntesDe(cuerpo, index) {
    const previo = cuerpo
      .slice(Math.max(0, index - 60), index)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .split(/\s+/);
    const tomadas = [];
    for (let i = previo.length - 1; i >= 0; i--) {
      // Un token puede venir pegado a lo anterior por un signo (":TREINTA"):
      // de cada token se toma el último tramo de letras seguidas.
      const p = (previo[i].split(/[^a-zñ]+/).filter(Boolean).pop() || "");
      if (p === "y" || NUMEROS[p] !== undefined) tomadas.unshift(p);
      else break;
    }
    while (tomadas.length && tomadas[0] === "y") tomadas.shift();
    return tomadas;
  }

  return [
    // =========================================================================
    // EXIGE — Constitución provincial y reglamentos de Cámara
    // =========================================================================
    {
      id: "er-prov-001",
      titulo: "Falta la frase con la que la Legislatura sanciona la ley",
      descripcion:
        "Antes del primer artículo, todo proyecto de ley entrerriano debe llevar la fórmula que " +
        "fija la Constitución provincial. No es opcional ni admite otra redacción.",
      sugerencia:
        'Agregar al principio: "LA LEGISLATURA DE LA PROVINCIA DE ENTRE RÍOS SANCIONA CON FUERZA DE LEY:"',
      autoridad: "EXIGE",
      fuente: "Constitución de Entre Ríos (2008), art. 132; Reglamento de Diputados (t.o. 2021), art. 60",
      ubicacionFija: "Al inicio, antes del Artículo 1°",
      check(text, { contexto }) {
        // Se compara sin espacios: los PDF suelen partir palabras ("LEGISLATUR A").
        if (/lalegislaturadelaprovinciadeentrerios,?sanciona/.test(pegado(text))) return { cumple: true };
        // Si lo que hay es la fórmula nacional, el hallazgo lo da la regla que
        // sigue: decir además que "falta la fórmula" sería contar dos veces lo mismo.
        if (RE_FORMULA_NACIONAL.test(text)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [`El documento empieza así: "${contexto(text, 0, 70)}" — ahí falta la fórmula del art. 132.`],
        };
      },
    },

    {
      id: "er-prov-002",
      titulo: "La frase de sanción es la del Congreso, no la de Entre Ríos",
      descripcion:
        "El texto lleva la fórmula del Congreso de la Nación. Entre Ríos tiene la suya propia, " +
        "fijada por el artículo 132 de la Constitución provincial. Es el error más frecuente de " +
        "quien viene de trabajar con proyectos nacionales.",
      sugerencia:
        'Reemplazar por: "LA LEGISLATURA DE LA PROVINCIA DE ENTRE RÍOS SANCIONA CON FUERZA DE LEY:"',
      autoridad: "EXIGE",
      fuente: "Constitución de Entre Ríos (2008), art. 132",
      ubicacionFija: "Al inicio, antes del Artículo 1°",
      check(text, { contexto }) {
        const m = RE_FORMULA_NACIONAL.exec(text);
        if (!m) return { cumple: true };
        return { cumple: false, ejemplos: [contexto(text, m.index, 80)] };
      },
    },

    {
      id: "er-prov-003",
      titulo: 'La frase de sanción dice "sancionan", en plural',
      descripcion:
        "La Legislatura entrerriana sanciona en singular: es un solo cuerpo. El plural " +
        '"sancionan" corresponde al Congreso de la Nación, donde son dos cámaras las que actúan.',
      sugerencia: 'Escribir "SANCIONA CON FUERZA DE LEY:", en singular.',
      autoridad: "EXIGE",
      fuente: "Constitución de Entre Ríos (2008), art. 132",
      check(text, { contexto }) {
        if (!/lalegislaturadelaprovinciadeentrerios,?sancionan/.test(pegado(text))) return { cumple: true };
        const m = /sancionan\s+con\s+fuerza/i.exec(text);
        return { cumple: false, ejemplos: [contexto(text, m ? m.index : 0, 80)] };
      },
    },

    {
      id: "er-prov-009",
      titulo: "Se aplican reglas de otra ley sin copiarlas acá",
      descripcion:
        "Regla propia de Entre Ríos y poco conocida: cuando una ley cita o incorpora " +
        "prescripciones de otra, las partes citadas deben insertarse íntegramente en el texto. " +
        "El constituyente quiso que la ley se entienda leyéndola sola. " +
        "<strong>Atención:</strong> esta regla va en sentido contrario al criterio nacional, que " +
        "recomienda remitir. En Entre Ríos prevalece la Constitución provincial.",
      sugerencia:
        "Requiere lectura humana: si la remisión es sólo referencial (identificar una norma marco), " +
        "está bien así. Si el contenido citado pasa a integrar esta regulación, hay que transcribirlo: " +
        '"…los requisitos del artículo 4º de la Ley Nº 10.479, que se transcribe: «ARTÍCULO 4º.- …»".',
      autoridad: "EXIGE",
      fuente: "Constitución de Entre Ríos (2008), art. 130, segunda parte",
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const re =
          /(requisitos|condiciones|procedimiento|r[ée]gimen|pautas|obligaciones)[^.]{0,90}(establecid\w+|previst\w+|dispuest\w+)\s+en\s+el\s+art[íi]culo\s+\d+[^.]{0,50}ley\s*n?[°ºo]?\s*[\d.]+/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const despues = cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 60);
          if (/["“»]/.test(despues)) continue; // ya viene la transcripción
          ej.push(contexto(text, m.index, 100));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // CRITERIO LEGAL CONDICIONADO — Ley Nº 9.971 del Digesto
    // =========================================================================
    // =========================================================================
    // ACOSTUMBRA — práctica legislativa entrerriana medida
    // =========================================================================
    {
      id: "er-prov-015",
      titulo: "Falta el artículo final de cierre",
      descripcion:
        "El articulado suele cerrar con un artículo de forma. En las 53 leyes entrerrianas " +
        "sancionadas en 2025-2026 aparece siempre. No es un requisito constitucional: su ausencia " +
        "no invalida nada, pero se aparta de la práctica uniforme.",
      sugerencia:
        'Agregar como último artículo: "ARTÍCULO n°.- Comuníquese, regístrese, notifíquese y ' +
        'oportunamente archívese." También están documentadas "De forma." (Diputados) y ' +
        '"Comuníquese, etcétera." (instructivo histórico del Senado).',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana (53/53 leyes, Boletín Oficial 2025-2026)",
      ubicacionFija: "Al final del articulado",
      check(text) {
        const cuerpo = soloArticulado(text);
        if (/comun[íi]quese|de\s+forma\s*[.\-]/i.test(cuerpo)) return { cumple: true };
        return { cumple: false, ejemplos: ["El articulado termina sin un artículo de forma."] };
      },
    },

    {
      id: "er-prov-016",
      titulo: "El artículo de cierre es el de un decreto, no el de una ley",
      descripcion:
        '"Comuníquese, publíquese y archívese" es la fórmula con que cierran los <em>decretos</em> ' +
        "del Poder Ejecutivo. Las leyes entrerrianas usan otra. Encontrarla en un proyecto de ley " +
        "suele indicar que el texto se copió de un decreto.",
      sugerencia: 'Reemplazar por: "Comuníquese, regístrese, notifíquese y oportunamente archívese."',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana (53/53 leyes)",
      check(text, { contexto }) {
        const re = /comun[íi]quese,?\s*publ[íi]quese\s*y\s*arch[íi]vese/i;
        const m = re.exec(text);
        if (!m) return { cumple: true };
        return { cumple: false, ejemplos: [contexto(text, m.index, 70)] };
      },
    },

    {
      id: "er-prov-018",
      titulo: "El proyecto lleva número de ley",
      descripcion:
        "El número de ley no lo pone quien redacta: se asigna al promulgarse, en forma correlativa " +
        "según la fecha de promulgación. Un proyecto se identifica por número de expediente.",
      sugerencia: "Quitar el número de ley del encabezado del proyecto.",
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana; Constitución de Entre Ríos (2008), art. 131 (concordante)",
      check(text, { contexto }) {
        // Una ley ya sancionada sí lleva número: se lo asignó la promulgación.
        if (esLeySancionada(text)) return { cumple: true };
        if (!/proyecto\s+de\s+ley/i.test(text)) return { cumple: true };
        const re = /^\s*ley\s*n?[°ºo]?\s*[\d.]{4,7}\s*$/im;
        const m = re.exec(text);
        if (!m) return { cumple: true };
        return { cumple: false, ejemplos: [contexto(text, m.index, 50)] };
      },
    },

    {
      id: "er-prov-022",
      titulo: "Falta el punto de los miles al citar una ley",
      descripcion:
        "Las 13 leyes del corpus que citan otras leyes lo hacen siempre con punto separador de " +
        "miles. Conviene además agregar la materia de la ley citada.",
      sugerencia: 'Escribir "Ley Nº 10.746", y si ayuda: "Ley Nº 10.746 de Juicio por Jurados".',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana (13/13 citas)",
      check(text, { contexto }) {
        const re = /ley\s*n?[°ºo]?\s*\d{5}\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 55));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // SUBSIDIARIO — criterios de estilo, nunca obligación provincial
    // =========================================================================
    {
      id: "er-prov-030",
      titulo: "Hay fechas con el año en dos cifras",
      descripcion: "El año se escribe con cuatro cifras, para que no quede ambiguo de qué siglo se habla.",
      sugerencia: 'Escribir "12/03/2026" o "12 de marzo de 2026", no "12/03/26".',
      autoridad: "SUBSIDIARIO",
      fuente: "Criterio doctrinario incorporado para cubrir un vacío local",
      check(text, { contexto }) {
        const re = /\b\d{1,2}\/\d{1,2}\/\d{2}\b(?!\d)/g;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 45));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },


    // Las reglas que valen igual en los tres ámbitos.
    ...window.ReglasComunes.para("provincial"),
  ];
})();
