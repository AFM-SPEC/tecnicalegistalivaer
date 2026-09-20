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
 * La severidad expresa urgencia, no autoridad: sólo una regla EXIGE puede
 * llegar a "alta", y una regla SUBSIDIARIA nunca pasa de "media".
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
      severidad: "alta",
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
      severidad: "alta",
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
      severidad: "alta",
      check(text, { contexto }) {
        if (!/lalegislaturadelaprovinciadeentrerios,?sancionan/.test(pegado(text))) return { cumple: true };
        const m = /sancionan\s+con\s+fuerza/i.exec(text);
        return { cumple: false, ejemplos: [contexto(text, m ? m.index : 0, 80)] };
      },
    },

    {
      id: "er-prov-004",
      titulo: "Los artículos explican en vez de mandar",
      descripcion:
        "Los reglamentos de ambas cámaras exigen que el articulado sea de carácter " +
        "<em>rigurosamente preceptivo</em>: la ley manda, no explica. La justificación va en los " +
        "FUNDAMENTOS, que se publican junto con el proyecto.",
      sugerencia:
        "Mover toda la justificación al bloque FUNDAMENTOS. En el articulado dejar sólo la norma: " +
        '"ARTÍCULO 1°.- Créase el Programa…". Si hace falta enunciar el objeto, usar la forma ' +
        'preceptiva: "ARTÍCULO 1°.- La presente ley tiene por objeto…".',
      autoridad: "EXIGE",
      fuente:
        "Reglamento de la Cámara de Diputados de Entre Ríos (t.o. 2021), art. 63; " +
        "Reglamento de la Cámara de Senadores (dic. 2023), art. 86",
      severidad: "alta",
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const re =
          /\b(visto que|considerando que|atento a que|toda vez que|dado que|en virtud de que|resulta necesario|es menester|habida cuenta de)\b/gi;
        const col = colectorDeEjemplos(4, 140);
        let m;
        while ((m = re.exec(cuerpo)) && !col.lleno()) col.agregar(m.index, contexto(text, m.index, 85));
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "er-prov-005",
      titulo: "Los fundamentos quedaron partidos en medio de los artículos",
      descripcion:
        "Articulado y fundamentos son dos piezas separadas. En Diputados los fundamentos van " +
        "después del articulado; en el Senado, en hoja aparte encabezando el trámite. Lo que " +
        "ninguna de las dos admite es que queden intercalados entre los artículos.",
      sugerencia:
        "Reunir todo el bloque de fundamentos en un solo lugar, antes o después del articulado " +
        "completo, nunca en el medio.",
      autoridad: "EXIGE",
      fuente:
        "Reglamento de Diputados (t.o. 2021), art. 67; Reglamento del Senado (dic. 2023), arts. 89 y 90",
      severidad: "alta",
      check(text, { contexto }) {
        const fund = RE_FUNDAMENTOS.exec(text);
        if (!fund) return { cumple: true };
        const arts = encabezadosDeArticulo(sinComillas(text));
        const antes = arts.filter((a) => a.index < fund.index).length;
        const despues = arts.filter((a) => a.index > fund.index).length;
        // Artículos de los dos lados del bloque de fundamentos: quedó partido al medio.
        if (antes === 0 || despues === 0) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [
            `Hay ${antes} artículo${antes === 1 ? "" : "s"} antes de los fundamentos y ${despues} después: ` +
              `"${contexto(text, fund.index, 70)}"`,
          ],
        };
      },
    },

    {
      id: "er-prov-006",
      titulo: "Se deroga «todo lo que se oponga», sin decir qué",
      descripcion:
        "La derogación debe identificar qué norma se deroga. Una cláusula del tipo " +
        '"deróganse todas las disposiciones que se opongan" no dice nada: traslada al intérprete ' +
        "el trabajo del legislador e impide confeccionar el texto ordenado que manda el artículo " +
        "130 de la Constitución provincial. Suele aparecer como coletilla pegada a una derogación " +
        "correcta: <em>«Derógase la Ley Nº 6.260 y toda otra normativa que se oponga»</em>. La " +
        "primera mitad está bien; la segunda sobra.",
      sugerencia:
        'Identificar cada norma derogada: "ARTÍCULO n°.- Derógase el artículo 12 de la Ley Nº 10.479." ' +
        "Si ya hay una derogación expresa, suprimir la coletilla genérica.",
      autoridad: "EXIGE",
      fuente: "Constitución de Entre Ríos (2008), art. 130; Ley Nº 9.971 del Digesto, art. 19 (concordante)",
      severidad: "alta",
      check(text, { contexto }) {
        const re =
          /(der[óo]g\w+\s+(todas\s+las|toda)\s+(norma|disposici[óo]n|ley)|(norma|disposici[óo]n)\w*\s+(legal|reglamentaria)?\s*que\s+se\s+opong\w+)/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 3) ej.push(contexto(text, m.index, 90));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-007",
      titulo: "Se modifica otra ley sin escribir cómo queda",
      descripcion:
        "Toda modificación debe ser expresa y textual: hay que transcribir cómo queda redactado " +
        "el artículo. Si no hay texto nuevo, es imposible cumplir el artículo 130 de la " +
        "Constitución, que manda publicar íntegra toda ley modificada incorporando las " +
        "modificaciones a su texto.",
      sugerencia:
        'Usar la fórmula habitual: "Sustitúyese el artículo 4º de la Ley Nº 10.479, el que quedará ' +
        'redactado de la siguiente manera: «ARTÍCULO 4º.- …»".',
      autoridad: "EXIGE",
      fuente:
        "Constitución de Entre Ríos (2008), art. 130; Ley Nº 9.971 del Digesto, art. 19 (convergente)",
      severidad: "alta",
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const partes = cuerpo.split(/(?=art[íi]culo\s+\d+\s*[°ºo]?\s*[.:\-–—])/i);
        // Sólo las formas normativas: no "modificaciones presupuestarias" ni "incorporar".
        const verboMod =
          /\b(modif[íi](c|qu)[aeá]n?se|sustit[úu]y[ae]n?se|incorp[óo]r[ae]n?se|der[óo]g[au]n?se\s+el\s+art)/i;
        const refNorma = /\b(art[íi]culos?\s+\d+[^.]{0,60}\b(ley|c[óo]digo)\b|\bley\s*n?[°ºo]?\s*[\d.]{3,7})/i;
        const yaTraeTexto = /(quedar[áa]n?\s+redactad|de\s+la\s+siguiente\s+manera|siguiente\s+texto|["“»])/i;
        const ej = [];
        for (const p of partes) {
          if (!verboMod.test(p)) continue;
          if (!refNorma.test(p)) continue;
          if (yaTraeTexto.test(p)) continue;
          const i = cuerpo.indexOf(p);
          if (i >= 0 && ej.length < 3) ej.push(contexto(text, i, 95));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-008",
      titulo: "Un artículo mete varias decisiones juntas",
      descripcion:
        "El Reglamento del Senado da el mejor test de unidad normativa que existe: el artículo " +
        "debe reducirse a una proposición simple, <em>o tal que no pueda ser admitido en una parte " +
        "y repelido en otra</em>. Dicho simple: si el artículo se puede votar por mitades, está mal " +
        "escrito. La longitud sola no es el problema; lo es que haya decisiones autónomas juntas.",
      sugerencia: "Dividir el artículo en varios, uno por cada norma.",
      autoridad: "EXIGE",
      fuente:
        "Reglamento de la Cámara de Senadores de Entre Ríos (dic. 2023), art. 87 (en Senado es " +
        "exigencia reglamentaria; con origen en Diputados o cámara no determinada, recomendación fuerte)",
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const partes = cuerpo.split(/(?=art[íi]culo\s+\d+\s*[°ºo]?\s*[.:\-–—])/i);
        const verbos =
          /\b(cr[ée]ase|decl[áa]rase|modif[íi]case|der[óo]gase|autor[íi]zase|establ[ée]cese|incorp[óo]rase|apru[ée]base|sustit[úu]yese|fac[úu]ltase|inv[íi]tase|adhi[ée]rese)\b/gi;
        const ej = [];
        for (const p of partes) {
          if (p.length < 400) continue;
          if (/\b[a-z]\)\s/.test(p) || /\b\d+\)\s/.test(p)) continue; // los incisos desarrollan una misma proposición
          const nv = (p.match(verbos) || []).length;
          if (nv >= 3) {
            const i = cuerpo.indexOf(p);
            if (i >= 0 && ej.length < 3) ej.push(contexto(text, i, 110));
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
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
      severidad: "media",
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
    {
      id: "er-prov-010",
      titulo: "Cifra escrita sólo en números",
      descripcion:
        "Las cantidades y los plazos se expresan en letras y en números. La razón es práctica: si " +
        "el número está mal tipeado, el texto en letras salva la ley, porque en caso de error " +
        "prevalece lo expresado en letras. Es el punto de mayor cumplimiento de la legislación " +
        "entrerriana: cero incumplimientos en el corpus medido.",
      sugerencia:
        'Escribir la doble forma: "dentro de los noventa (90) días". No se duplican los números de ' +
        "ley, de artículo, de expediente, de partida ni las fechas.",
      autoridad: "CRITERIO LEGAL CONDICIONADO",
      fuente:
        "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 inc. b) — ley vigente, criterio " +
        "aplicado a proyectos por analogía y confirmado por la práctica",
      severidad: "media",
      check(text, { contexto }) {
        const re = /\b(?:de|en|por|plazo de|t[ée]rmino de)\s+(\d{1,3})\s+(d[íi]as|meses|a[ñn]os|horas)\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 5) {
          const antes = text.slice(Math.max(0, m.index - 30), m.index);
          // Si justo antes hay palabras y un paréntesis, ya cumple: "noventa (90) días".
          if (/[a-záéíóúñ]+\s*\(\s*$/i.test(antes)) continue;
          if (/\(\s*\d+\s*\)/.test(m[0])) continue;
          // Una edad no es un plazo: "mayores de 40 años" no se escribe en letras.
          if (/(mayor|menor)(es)?\s*$|edad\s*$/i.test(antes)) continue;
          ej.push(contexto(text, m.index, 60));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-011",
      titulo: "La cifra en letras no coincide con el número",
      descripcion:
        "El texto escribe una cantidad en letras y otra distinta entre paréntesis. Es un error " +
        "material que genera un conflicto real de interpretación, porque las dos formas tienen " +
        "el mismo valor normativo.",
      sugerencia:
        "Revisión humana: hay que verificar cuál de las dos cifras es la correcta. La herramienta " +
        "no puede decidirlo, porque eso depende de qué quiso disponer quien redactó.",
      autoridad: "CRITERIO LEGAL CONDICIONADO",
      fuente: "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 inc. b) — criterio aplicado por analogía",
      severidad: "media",
      check(text, { contexto }) {
        const re = /\(\s*([\d.]{1,9})\s*\)/g;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) {
          const cifra = Number(m[1].replace(/\./g, ""));
          if (!Number.isFinite(cifra)) continue;
          const letras = letrasAntesDe(text, m.index);
          const valor = valorEnLetras(letras);
          if (valor === null || valor === cifra) continue;
          // Si lo leído empieza por un multiplicador, es probable que antes
          // hubiera una palabra que no está en la tabla ("trescientas mil"):
          // ahí la cuenta quedaría corta y el aviso sería falso.
          if (MULTIPLICADORES.has(letras[0])) continue;
          ej.push(`Dice "${letras.join(" ")}" pero el número es ${cifra}: "${contexto(text, m.index, 60)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-012",
      titulo: "Hay una sigla que nunca se explica",
      descripcion:
        "Cuando el texto usa una sigla, la primera vez que aparece hay que escribir la " +
        "denominación completa seguida de la sigla entre paréntesis. Después ya se puede usar " +
        "sola. Si nunca se explica, la ley obliga a buscar afuera qué dice.",
      sugerencia:
        'La primera vez escribir "el Consejo General de Educación (CGE)"; en el resto del texto, ' +
        'usar directamente "el CGE".',
      autoridad: "CRITERIO LEGAL CONDICIONADO",
      fuente: "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 — criterio aplicado por analogía",
      severidad: "media",
      check(text, { normalizar, contexto }) {
        const IGNORAR = new Set([
          "LEY", "ARTICULO", "ARTÍCULO", "TITULO", "TÍTULO", "CAPITULO", "CAPÍTULO",
          "SECCION", "SECCIÓN", "ANEXO", "DECRETO", "PODER", "EJECUTIVO", "PROVINCIA",
          "PROVINCIAL", "LEGISLATURA", "ENTRE", "RIOS", "RÍOS", "SANCIONA", "FUERZA",
          "FUNDAMENTOS", "HONORABLE", "CAMARA", "CÁMARA", "DIPUTADOS", "SENADORES",
          "SENADO", "SALA", "SESIONES", "PARANA", "PARANÁ", "BOLETIN", "BOLETÍN",
          "OFICIAL", "TANTO", "COMUNIQUESE", "COMUNÍQUESE", "REGISTRESE", "REGÍSTRESE",
          "NOTIFIQUESE", "NOTIFÍQUESE", "ARCHIVESE", "ARCHÍVESE", "PRESENTE", "NACION",
          "NACIÓN", "NACIONAL", "CONSTITUCION", "CONSTITUCIÓN",
        ]);
        // Una sola recorrida de todas las palabras del documento. Antes se hacía
        // un reemplazo sobre el texto entero por cada sigla candidata, y en un
        // PDF largo eso llegaba a tardar varios segundos.
        const primera = new Map();
        const conteo = new Map();
        const enMinuscula = new Set();
        for (const m of text.matchAll(/[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}/g)) {
          const palabra = m[0];
          const llana = normalizar(palabra);
          if (palabra !== palabra.toUpperCase()) {
            enMinuscula.add(llana);
            continue;
          }
          if (palabra.length < 3 || IGNORAR.has(palabra)) continue;
          conteo.set(palabra, (conteo.get(palabra) || 0) + 1);
          if (!primera.has(palabra)) primera.set(palabra, m.index);
        }
        // Si la misma palabra aparece en minúscula en otra parte, es una palabra
        // común escrita en mayúscula (un título, un énfasis), no una sigla.
        const siglas = [...conteo.entries()]
          .filter(([, n]) => n >= 2)
          .map(([s]) => s)
          .filter((sigla) => !enMinuscula.has(normalizar(sigla)));
        const sinDefinir = siglas.filter((s) => !new RegExp(`\\(\\s*${s}\\s*\\)`).test(text));
        if (!sinDefinir.length) return { cumple: true };
        return {
          cumple: false,
          ejemplos: sinDefinir
            .slice(0, 4)
            .map((s) => `"${s}" aparece sin explicar qué significa: "${contexto(text, primera.get(s), 50)}"`),
        };
      },
    },

    {
      id: "er-prov-013",
      titulo: "Hay palabras en otro idioma que tienen equivalente en castellano",
      descripcion:
        "El texto usa un término extranjero que todavía no es de uso corriente en español y que " +
        "tiene un equivalente castellano claro. No aplica a términos técnicos cuya traducción " +
        "cambiaría el significado jurídico o sectorial.",
      sugerencia:
        'Usar el equivalente castellano, o definirlo la primera vez: "…el sitio de destino ' +
        "(<em>landing page</em>)…\".",
      autoridad: "CRITERIO LEGAL CONDICIONADO",
      fuente: "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 — criterio aplicado por analogía",
      severidad: "media",
      check(text, { normalizar, contexto }) {
        const t = normalizar(text);
        const palabras = [
          "online", "offline", "software", "hardware", "email", "e-mail", "link", "blog",
          "ranking", "feedback", "marketing", "delivery", "smartphone", "hashtag", "streaming",
          "performance", "target", "staff", "workshop", "test", "gap",
        ];
        const encontradas = [];
        for (const palabra of palabras) {
          const m = t.match(new RegExp(`\\b${palabra}\\b`));
          if (m) encontradas.push({ palabra, index: m.index });
        }
        if (!encontradas.length) return { cumple: true };
        return {
          cumple: false,
          ejemplos: encontradas
            .slice(0, 4)
            .map((e) => `"${e.palabra}" en: "${contexto(text, e.index, 45)}"`),
        };
      },
    },

    // =========================================================================
    // ACOSTUMBRA — práctica legislativa entrerriana medida
    // =========================================================================
    {
      id: "er-prov-014",
      titulo: "El verbo va en la forma equivocada: «créese» en vez de «créase»",
      descripcion:
        '"Declárase" es pasiva refleja: la ley declara y el enunciado se sostiene solo. ' +
        '"Declárese" es un imperativo que le ordena a alguien que declare, pero no dice a quién. ' +
        "En una ley el mandato no se dirige a un destinatario oculto: la ley <em>es</em> la " +
        "declaración. En el corpus medido, 1 de cada 4 leyes entrerrianas usa la forma imperativa.",
      sugerencia:
        "Usar la terminación <em>-ase</em>: Créase, Declárase, Modifícase, Deróganse, Autorízase, " +
        "Establécese, Incorpórase, Apruébase, Sustitúyese, Facúltase. El artículo de forma es la " +
        'excepción: ahí "Comuníquese" es correcto, porque sí se dirige al Poder Ejecutivo.',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana (37 de 53 leyes usan la forma en pasiva refleja)",
      severidad: "media",
      check(text, { contexto }) {
        const re =
          /\b(Cr[ée]ese|Modif[íi]quese|Modif[íi]quense|Der[óo]guese|Der[óo]guense|Decl[áa]rese|Decl[áa]rense|Autor[íi]cese|Establ[ée]zcase|Establ[ée]zcanse|Incorp[óo]rese|Apru[ée]bese|Ratif[íi]quese|Facult[ée]se|Sustit[úu]yase)\b/gi;
        const col = colectorDeEjemplos(5, 140);
        let m;
        while ((m = re.exec(text)) && !col.lleno()) col.agregar(m.index, contexto(text, m.index, 70));
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

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
      severidad: "media",
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
      severidad: "media",
      check(text, { contexto }) {
        const re = /comun[íi]quese,?\s*publ[íi]quese\s*y\s*arch[íi]vese/i;
        const m = re.exec(text);
        if (!m) return { cumple: true };
        return { cumple: false, ejemplos: [contexto(text, m.index, 70)] };
      },
    },

    {
      id: "er-prov-017",
      titulo: "Los artículos no están numerados en orden",
      descripcion:
        "Los artículos se numeran en forma correlativa, sin saltos ni repeticiones. Para " +
        'intercalar uno nuevo sin renumerar el resto se usa "bis", "ter", etcétera. En Entre Ríos ' +
        "el ordinal se mantiene también después del 9 (ARTÍCULO 12º): eso es correcto acá, aunque " +
        "el criterio nacional diga otra cosa.",
      sugerencia: 'Renumerar en forma correlativa, o usar "ARTÍCULO 2° bis" para intercalar.',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana; criterio subsidiario del Manual nacional",
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const vistos = encabezadosDeArticulo(cuerpo).filter((a) => !a.sufijo);
        if (vistos.length < 2) return { cumple: true };
        const ej = [];
        for (let k = 1; k < vistos.length && ej.length < 3; k++) {
          const esperado = vistos[k - 1].numero + 1;
          if (vistos[k].numero === esperado) continue;
          const aviso =
            vistos[k].numero === vistos[k - 1].numero
              ? `El artículo ${vistos[k].numero} aparece dos veces`
              : `Después del artículo ${vistos[k - 1].numero} viene el ${vistos[k].numero}`;
          ej.push(`${aviso}: "${contexto(text, vistos[k].index, 45)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
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
      severidad: "media",
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
      id: "er-prov-019",
      titulo: "Un anexo que ningún artículo menciona",
      descripcion:
        "Si el texto tiene un anexo, algún artículo del articulado tiene que remitir a él " +
        '("…que como Anexo I forma parte de la presente"). Si no, el anexo queda colgado: no se ' +
        "sabe qué parte de la ley lo pone en juego.",
      sugerencia:
        'Agregar en el artículo correspondiente: "…conforme al detalle que, como Anexo I, forma ' +
        'parte integrante de la presente ley."',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana; criterio subsidiario del Manual nacional, regla 14",
      severidad: "media",
      ubicacionFija: "En el artículo que trate el contenido del anexo",
      check(text) {
        // Un anexo bien armado se nombra al menos dos veces: en el artículo que
        // remite a él y en su propio encabezado. Una sola mención significa que
        // falta una de las dos puntas, y conviene mirar cuál.
        const menciones = (text.match(/anexo/gi) || []).length;
        if (menciones === 0 || menciones >= 2) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [
            'El documento nombra un anexo una sola vez: o ningún artículo remite a él, o se lo ' +
              "menciona pero el anexo no está agregado.",
          ],
        };
      },
    },

    {
      id: "er-prov-020",
      titulo: 'Mezcla "ARTÍCULO" y "ARTICULO" en el mismo texto',
      descripcion:
        "Elegida una grafía, conviene mantenerla en todo el documento. El 17% de las leyes " +
        "entrerrianas medidas mezcla ambas formas.",
      sugerencia: 'Unificar en "ARTÍCULO", con tilde.',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana",
      severidad: "baja",
      check(text) {
        const conTilde = /ARTÍCULO\s*\d/.test(text);
        const sinTilde = /ARTICULO\s*\d/.test(text);
        if (!(conTilde && sinTilde)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: ['El documento usa "ARTÍCULO" en unos lugares y "ARTICULO" en otros.'],
        };
      },
    },

    {
      id: "er-prov-021",
      titulo: "Los artículos no se separan siempre igual",
      descripcion:
        'Las 53 leyes medidas usan siempre el mismo separador: punto y guion ("ARTÍCULO 1°.-"). ' +
        "Mezclar separadores en un mismo texto rompe la uniformidad.",
      sugerencia: 'Unificar en "ARTÍCULO 1°.-".',
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana (53/53 leyes)",
      severidad: "baja",
      check(text) {
        const cuerpo = cuerpoNormativo(text);
        const estilos = [
          /art[íi]culo\s*\d+\s*[°ºo]?\s*\.\s*-/i.test(cuerpo),
          /art[íi]culo\s*\d+\s*[°ºo]?\s*:/i.test(cuerpo),
          /art[íi]culo\s*\d+\s*[°ºo]?\s*[–—]/i.test(cuerpo),
        ].filter(Boolean).length;
        if (estilos < 2) return { cumple: true };
        return {
          cumple: false,
          ejemplos: ["El documento usa más de un separador distinto después del número de artículo."],
        };
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
      severidad: "baja",
      check(text, { contexto }) {
        const re = /ley\s*n?[°ºo]?\s*\d{5}\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 55));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-023",
      titulo: "Mezcla de tipos de comillas",
      descripcion:
        "En los textos modificatorios las comillas delimitan exactamente qué es texto normativo " +
        "nuevo, así que conviene que sean siempre las mismas.",
      sugerencia: "Unificar el tipo de comillas en todo el documento.",
      autoridad: "ACOSTUMBRA",
      fuente: "Práctica legislativa entrerriana",
      severidad: "baja",
      check(text) {
        const tipograficas = /[“”]/.test(text);
        const rectas = /"/.test(text);
        if (!(tipograficas && rectas)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: ['El documento mezcla comillas tipográficas (“ ”) con comillas rectas (").'],
        };
      },
    },

    // =========================================================================
    // SUBSIDIARIO — criterios de estilo, nunca obligación provincial
    // =========================================================================
    {
      id: "er-prov-024",
      titulo: "Las disposiciones transitorias no están al final",
      descripcion:
        "Las disposiciones transitorias se agrupan al final, separadas de las permanentes. Si " +
        "aparecen en el medio del articulado, cuesta distinguir qué rige siempre y qué rige sólo " +
        "durante el paso de un régimen a otro.",
      sugerencia: "Mover las disposiciones transitorias al final, antes del artículo de forma.",
      autoridad: "SUBSIDIARIO",
      fuente: "Criterio doctrinario incorporado para cubrir un vacío local",
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const m = /disposici[óo]n(es)?\s+transitoria/i.exec(cuerpo);
        if (!m) return { cumple: true };
        if (posicionRelativa(cuerpo, m.index) >= 0.6) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [`Las transitorias aparecen en la primera mitad del articulado: "${contexto(text, m.index, 55)}"`],
        };
      },
    },

    {
      id: "er-prov-025",
      titulo: "Los incisos van con guiones y después no se pueden citar",
      descripcion:
        "Los incisos se identifican con letra o número para poder citarlos después " +
        '("el inciso b) del artículo 4º"). Una viñeta o un guion no se pueden citar.',
      sugerencia: 'Usar "a)", "b)", "c)" para un nivel y números para el nivel interno.',
      autoridad: "SUBSIDIARIO",
      fuente: "Criterio doctrinario incorporado para cubrir un vacío local",
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // El guion sólo cuenta como viñeta si viene después de dos puntos o de un
        // punto y coma: suelto en medio de una oración es un inciso tipográfico.
        const re = /[•▪‣·]\s+\S|[:;]\s*[-–—]\s+[a-záéíóúñA-ZÁÉÍÓÚÑ]/g;
        const col = colectorDeEjemplos(3, 110);
        let m;
        while ((m = re.exec(cuerpo)) && !col.lleno()) col.agregar(m.index, contexto(text, m.index, 55));
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "er-prov-026",
      titulo: "Los títulos y capítulos no siguen un orden claro",
      descripcion:
        "Las divisiones van en orden: Libro, Título, Capítulo, Sección. Saltar un nivel, o abrir " +
        "una división única (un solo capítulo en toda la ley), confunde más de lo que ordena.",
      sugerencia:
        "Respetar la jerarquía sin saltos, y no abrir una división si va a quedar sola.",
      autoridad: "SUBSIDIARIO",
      fuente: "Criterio doctrinario incorporado para cubrir un vacío local",
      severidad: "baja",
      check(text) {
        const cuerpo = cuerpoNormativo(text);
        const niveles = [
          { nombre: "Libro", re: /\bLIBRO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Título", re: /\bT[ÍI]TULO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Capítulo", re: /\bCAP[ÍI]TULO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Sección", re: /\bSECCI[ÓO]N\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
        ];
        const conteos = niveles.map((n) => ({ nombre: n.nombre, n: (cuerpo.match(n.re) || []).length }));
        const ej = [];
        for (const c of conteos) {
          if (c.n === 1) ej.push(`Hay un solo "${c.nombre}" en todo el texto: una división única no divide nada.`);
        }
        for (let i = 1; i < conteos.length; i++) {
          const hayInferior = conteos[i].n > 0;
          const faltaIntermedio = conteos[i - 1].n === 0;
          const hayMasAlto = conteos.slice(0, i - 1).some((c) => c.n > 0);
          if (hayInferior && faltaIntermedio && hayMasAlto) {
            ej.push(`El texto usa "${conteos[i].nombre}" sin pasar por "${conteos[i - 1].nombre}".`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej.slice(0, 3) };
      },
    },

    {
      id: "er-prov-027",
      titulo: 'Se usa "y/o", que deja la duda de si son los dos o uno solo',
      descripcion:
        '"Y/o" es ambigua: no queda claro si exige ambos, uno cualquiera o los dos. Como la ' +
        "corrección tiene que mantener exactamente la relación lógica buscada, conviene decidirla " +
        "al escribir y no dejarla librada al intérprete.",
      sugerencia: 'Elegir "y", o "o", o escribir "uno, otro o ambos".',
      autoridad: "SUBSIDIARIO",
      fuente: "Manual de Técnica Legislativa nacional, regla 25 (criterio subsidiario)",
      severidad: "baja",
      check(text, { contexto }) {
        const re = /\by\s*\/\s*o\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 55));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-028",
      titulo: "Hay una doble negación que puede confundir",
      descripcion:
        'Dos negaciones en la misma frase ("no… sin…") obligan a releer para saber qué se permite ' +
        "y qué se prohíbe.",
      sugerencia:
        'En vez de "no podrán inscribirse sin acreditar domicilio", escribir "para inscribirse ' +
        'deben acreditar domicilio".',
      autoridad: "SUBSIDIARIO",
      fuente: "Manual de Técnica Legislativa nacional, regla 23 (criterio subsidiario)",
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /\bno\b[^.;]{0,70}\bsin\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) ej.push(contexto(text, m.index, 80));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-029",
      titulo: "Hay varios verbos en tiempo futuro",
      descripcion:
        'Las disposiciones se redactan en presente ("el registro funciona…") y no en futuro ("el ' +
        'registro funcionará…"): la ley rige desde que está vigente, no después.',
      sugerencia: 'Pasar los verbos a presente: "el organismo dicta", "el registro funciona".',
      autoridad: "SUBSIDIARIO",
      fuente: "Manual de Técnica Legislativa nacional, regla 20 (criterio subsidiario)",
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // "deberá" y "podrá" quedan afuera: son el modo habitual de expresar el
        // mandato y la facultad, no un futuro evitable.
        //
        // El corte de palabra va escrito a mano y no con \b: para el motor de
        // expresiones regulares una vocal acentuada no es letra, así que \b
        // nunca cierra después de "-rá" y la palabra no se encontraría.
        const re = /(^|[^a-záéíóúñ])((?!deber|poder)[a-záéíóúñ]{3,}(?:ar|er|ir)[áa]n?)(?![a-záéíóúñ])/gi;
        const ej = [];
        let m;
        const vistos = new Set();
        while ((m = re.exec(cuerpo))) {
          const palabra = m[2].toLowerCase();
          if (vistos.has(palabra)) continue;
          vistos.add(palabra);
          if (ej.length < 4) ej.push(contexto(text, m.index + m[1].length, 55));
        }
        // El futuro aparece suelto en casi cualquier ley: sólo vale señalarlo
        // cuando es la forma dominante de redactar, no por una o dos apariciones.
        if (vistos.size < 6) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-030",
      titulo: "Hay fechas con el año en dos cifras",
      descripcion: "El año se escribe con cuatro cifras, para que no quede ambiguo de qué siglo se habla.",
      sugerencia: 'Escribir "12/03/2026" o "12 de marzo de 2026", no "12/03/26".',
      autoridad: "SUBSIDIARIO",
      fuente: "Criterio doctrinario incorporado para cubrir un vacío local",
      severidad: "baja",
      check(text, { contexto }) {
        const re = /\b\d{1,2}\/\d{1,2}\/\d{2}\b(?!\d)/g;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 45));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-prov-031",
      titulo: "Siglas con puntos en el medio o con «s» de plural",
      descripcion: "Las siglas se escriben sin puntos y sin marca de plural.",
      sugerencia: 'Escribir "las ONG", no "las O.N.G.s".',
      autoridad: "SUBSIDIARIO",
      fuente: "Manual de Técnica Legislativa nacional, regla 37 (criterio subsidiario)",
      severidad: "baja",
      check(text, { contexto }) {
        const ej = [];
        const conPuntos = /\b(?:[A-ZÁÉÍÓÚÑ]\.){2,}[A-ZÁÉÍÓÚÑ]?\b/g;
        let m;
        while ((m = conPuntos.exec(text)) && ej.length < 3) ej.push(contexto(text, m.index, 50));
        const conPlural = /\b[A-ZÁÉÍÓÚÑ]{2,}s\b/g;
        while ((m = conPlural.exec(text)) && ej.length < 4) ej.push(contexto(text, m.index, 50));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },
  ];
})();
