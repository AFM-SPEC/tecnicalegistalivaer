/**
 * Reglas comunes a los tres ámbitos (nacional, provincial y municipal).
 *
 * Un mismo error se detecta igual sea cual sea el ámbito elegido: el mismo
 * patrón, el mismo texto del aviso y la misma prioridad (prioridades.js). Lo
 * único que cambia es la fuente que se cita y, en Entre Ríos, cuánto obliga
 * esa fuente (`autoridad`). Cada ámbito agrega estas reglas a las suyas con
 * ReglasComunes.para(ambito).
 *
 * Por decisión del proyecto, algunas reglas avisan cosas que los manuales
 * dejan a la revisión humana (criterios indeterminados, enumeraciones
 * abiertas, facultades para modificar la norma). Sólo avisan cuando aparece
 * una frase concreta, y lo hacen con autoridad "REVISIÓN" y un tono prudente:
 * "Conviene revisar…", nunca "es inválido".
 *
 * IMPORTANTE (igual que en los demás archivos de reglas): `titulo`,
 * `descripcion` y `sugerencia` se insertan como HTML y son texto fijo escrito
 * acá. Lo único que proviene del documento del usuario es `ejemplos`, que
 * app.js escapa aparte.
 */

window.ReglasComunes = (() => {
  const {
    normalizar,
    sinComillas,
    RE_FUNDAMENTOS,
    encabezadosDeArticulo,
    encabezadosSinNumero,
    inicioDelArticulado,
    cabecerasDeAnexo,
    soloArticulado,
    cuerpoNormativo,
    textoPropio,
    colectorDeEjemplos,
    citarCoincidencias,
    oracionDesde,
    oraciones,
    posicionRelativa,
    tramosPorArticulo,
    RE_VERBO_NORMATIVO,
    valorEnLetras,
    letrasAntesDe,
    ORDEN_SUFIJO,
    NORMA,
  } = window.BaseNormas;

  // ---------------------------------------------------------------------------
  // Fuentes de cada ámbito
  // ---------------------------------------------------------------------------

  const NAC = (regla) => `Manual de Técnica Legislativa, ${regla}`;
  const MT = (punto) => `Marco Teórico de Técnica Legislativa — ${punto}`;
  const SUB = (regla) => `Manual de Técnica Legislativa nacional, ${regla} (criterio subsidiario)`;
  const MUN = (punto, extra) =>
    `Manual de Técnica Legislativa Municipal de Entre Ríos, ${punto}${extra ? ` — ${extra}` : ""}`;
  const REVISION = "aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana";

  /** Las tres fuentes de una regla. `prov` toma la nacional como subsidiaria si no se indica. */
  const fuentes = (nac, mun, prov) => ({
    nacional: nac,
    provincial:
      prov ||
      (nac.startsWith("Manual de Técnica Legislativa, ")
        ? SUB(nac.slice("Manual de Técnica Legislativa, ".length))
        : `${nac} (criterio subsidiario)`),
    municipal: mun,
  });

  const ALCANCE_TEXTO =
    "Esta herramienta revisa solamente leyes nacionales, leyes provinciales y ordenanzas: no " +
    "revisa resoluciones, decretos, comunicaciones, declaraciones, minutas ni pedidos de informes.";

  // Para las reglas que miran una oración entera.
  function oracionDe(texto, index) {
    const antes = texto.slice(0, index);
    const ini = Math.max(antes.lastIndexOf(". "), antes.lastIndexOf(";"), antes.lastIndexOf("\n")) + 1;
    return { index: ini, texto: oracionDesde(texto, ini, 600) };
  }

  /** Busca todas las coincidencias de una lista de patrones y cita cada una. */
  function citarPatron(text, cuerpo, re, contexto, opciones, descartar) {
    const col = colectorDeEjemplos(opciones?.maximo || 4, opciones?.separacion || 110);
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(cuerpo)) && !col.lleno()) {
      if (descartar && descartar(m, cuerpo)) continue;
      col.agregar(m.index, contexto(text, m.index, opciones?.radio || 60));
    }
    if (!col.ejemplos.length) return { cumple: true };
    return { cumple: false, ejemplos: col.ejemplos };
  }

  // ---------------------------------------------------------------------------
  // Las reglas
  // ---------------------------------------------------------------------------

  const REGLAS = [
    // =========================================================================
    // ENCABEZADO
    // =========================================================================
    {
      id: "com-001",
      titulo: "No se aclara qué tipo de norma es",
      descripcion: {
        nacional:
          'Al comienzo, el documento debe decir qué clase de norma es: "Proyecto de ley" o "Ley". ' +
          `Si no lo dice, no queda claro qué se está leyendo. ${ALCANCE_TEXTO}`,
        provincial:
          'Al comienzo, el documento debe decir qué clase de norma es: "Proyecto de ley" o "Ley". ' +
          `Si no lo dice, no queda claro qué se está leyendo. ${ALCANCE_TEXTO}`,
        municipal:
          "Antes del articulado conviene que el documento diga que es un proyecto de ordenanza. " +
          `${ALCANCE_TEXTO}`,
      },
      sugerencia: {
        nacional: 'Encabezar el documento con su denominación: "PROYECTO DE LEY".',
        provincial: 'Encabezar el documento con su denominación: "PROYECTO DE LEY".',
        municipal: 'Encabezar el documento con su denominación: "PROYECTO DE ORDENANZA".',
      },
      fuentes: fuentes(NAC("regla 1, punto 1.a"), MUN("MUN-021")),
      ubicacionFija: "Al inicio del documento",
      check(text, { contexto }) {
        const inicio = inicioDelArticulado(text);
        if (inicio < 0) return { cumple: true };
        const pre = text.slice(0, inicio);
        const fin = Math.min(300, ...[pre.search(/\bVISTO\b|\bvisto\s*(:|que)|\bCONSIDERANDO\b|\bconsiderando\b/i)].filter((i) => i >= 0));
        const encabezado = pre.slice(0, fin);
        if (/\b(ley|ordenanza|resoluci[óo]n|decreto|comunicaci[óo]n|declaraci[óo]n|minuta|pedido\s+de\s+informes?)\b/i.test(encabezado)) {
          return { cumple: true };
        }
        if (/fuerza\s+de\s*:?\s*(l\s*e\s*y|ordenanza)|siguiente\s+(ley|ordenanza)/i.test(pre)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [`El documento empieza así: "${contexto(text, 0, 70)}" — ahí no se dice qué tipo de norma es.`],
        };
      },
    },

    {
      id: "com-002",
      titulo: "El título no dice de qué trata la norma",
      descripcion:
        "El título tiene que anunciar el contenido de la norma, para poder identificarla y " +
        'buscarla. Títulos como "Disposiciones varias", "Cosas que hay que hacer" o un número ' +
        "suelto no dicen nada sobre lo que la norma regula.",
      sugerencia:
        'Escribir un título que nombre la materia: "Régimen de protección del arbolado público".',
      fuentes: fuentes(NAC("regla 3, punto 2"), MUN("MUN-022")),
      ubicacionFija: "En el título, antes del Artículo 1°",
      check(text, { contexto }) {
        const inicio = inicioDelArticulado(text);
        if (inicio < 0) return { cumple: true };
        const pre = text.slice(0, inicio);
        if (!pre.trim()) {
          return { cumple: false, ejemplos: ["No se encontró ningún título antes del primer artículo."] };
        }
        const cortes = [
          /\bVISTO\b|\bvisto\s*(:|que)/i,
          /\bCONSIDERANDO\b|\bconsiderando\b/i,
          /\bCAP[ÍI]TULO\b|\bT[ÍI]TULO\s+[IVX\d]|\bSECCI[ÓO]N\b/,
          /\bsanciona|\bORDENA\b|\bRESUELVE\b|\bDECRETA\b|\bDISPONE\b/i,
        ]
          .map((re) => pre.search(re))
          .filter((i) => i >= 0);
        const encabezado = pre.slice(0, Math.min(250, ...cortes));
        const vacio =
          /\bcosas\s+que\b|\b(otras|varias|algunas|muchas)\s+cosas\b|\b(asuntos|temas)\s+varios\b|\b(otras|varias|diversas)\s+cuestiones\b|\bcuestiones\s+(varias|importantes|generales|diversas)\b|\bdisposiciones\s+(varias|generales)\b|\botras\s+disposiciones\b/i;
        const m = vacio.exec(encabezado);
        if (m) return { cumple: false, ejemplos: [`"${contexto(text, m.index, 60)}"`] };
        // Un título que es sólo un número o una fecha.
        const titulo = encabezado
          .replace(/proyecto\s+de\s+(ley|ordenanza)|municipalidad\s+de\s+\S+|municipalidad/gi, "")
          .trim();
        const soloNumero =
          titulo && /^[\s\d°ºa-zA-Z.,\-\/]{0,40}$/.test(titulo) && /\d/.test(titulo) && titulo.split(/\s+/).length <= 6;
        if (soloNumero) {
          return { cumple: false, ejemplos: [`El título encontrado es: "${titulo.slice(0, 60)}" — parece sólo un número o una fecha.`] };
        }
        return { cumple: true };
      },
    },

    // =========================================================================
    // ESTRUCTURA Y NUMERACIÓN
    // =========================================================================
    {
      id: "com-003",
      titulo: "Los fundamentos quedaron partidos en medio de los artículos",
      descripcion:
        "Articulado y fundamentos son dos piezas separadas. Los fundamentos pueden ir antes o " +
        "después del articulado según la práctica de cada cuerpo, pero no intercalados entre los " +
        "artículos. No tener fundamentos escritos no es un error.",
      sugerencia:
        "Reunir todo el bloque de fundamentos en un solo lugar, antes o después del articulado " +
        "completo, nunca en el medio.",
      fuentes: fuentes(
        NAC("regla 1, punto 1"),
        MUN("MUN-026"),
        "Reglamento de Diputados (t.o. 2021), art. 67; Reglamento del Senado (dic. 2023), arts. 89 y 90"
      ),
      autoridad: { provincial: "EXIGE" },
      check(text, { contexto }) {
        const fund = RE_FUNDAMENTOS.exec(text);
        if (!fund) return { cumple: true };
        const arts = encabezadosDeArticulo(sinComillas(text));
        const antes = arts.filter((a) => a.index < fund.index).length;
        const despues = arts.filter((a) => a.index > fund.index).length;
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
      id: "com-004",
      titulo: "Los artículos no están numerados en orden",
      descripcion:
        "Los artículos se numeran en forma correlativa desde el 1, sin saltos ni repeticiones. " +
        'Para intercalar uno nuevo sin renumerar el resto se usa "bis", "ter", etcétera.',
      sugerencia:
        'Renumerar en forma correlativa, o usar "ARTÍCULO 2° bis" para intercalar. La herramienta ' +
        "no renumera: no puede saber si falta un artículo o si sobra un número.",
      fuentes: fuentes(
        NAC("regla 9, punto 4"),
        MUN("MUN-031"),
        "Práctica legislativa entrerriana; criterio subsidiario del Manual nacional"
      ),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text, { contexto }) {
        const vistos = encabezadosDeArticulo(cuerpoNormativo(text)).filter((a) => !a.sufijo);
        if (!vistos.length) return { cumple: true };
        const ej = [];
        if (vistos[0].numero !== 1) {
          ej.push(`El articulado empieza en el artículo ${vistos[0].numero}: "${contexto(text, vistos[0].index, 45)}"`);
        }
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
      id: "com-005",
      titulo: "Hay artículos sin número",
      descripcion:
        'Cada artículo se encabeza con la palabra "Artículo" y un número propio, para poder citarlo. ' +
        'Encabezados como "Primero:", "Artículo siguiente" o "Artículo 8 o el que corresponda" no ' +
        "permiten saber con certeza qué artículo es.",
      sugerencia: 'Numerar todos los artículos en forma correlativa: "ARTÍCULO 1°.-", "ARTÍCULO 2°.-"…',
      fuentes: fuentes(
        NAC("regla 9, punto 4"),
        MUN("MUN-031"),
        "Práctica legislativa entrerriana; criterio subsidiario del Manual nacional"
      ),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text, { contexto }) {
        const limpio = sinComillas(text);
        const lugares = [
          ...encabezadosDeArticulo(limpio).filter((a) => a.forma === "suelto"),
          ...encabezadosSinNumero(limpio),
        ].sort((a, b) => a.index - b.index);
        if (!lugares.length) return { cumple: true };
        return { cumple: false, ejemplos: lugares.slice(0, 4).map((a) => `"${contexto(text, a.index, 45)}"`) };
      },
    },

    {
      id: "com-006",
      titulo: 'Mezcla "ARTÍCULO" y "ARTICULO" en el mismo texto',
      descripcion: "Elegida una grafía para el encabezado de los artículos, conviene mantenerla en todo el documento.",
      sugerencia: 'Unificar en "ARTÍCULO", con tilde.',
      fuentes: fuentes(NAC("regla 9, punto 4"), MUN("MUN-031"), "Práctica legislativa entrerriana"),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text) {
        const conTilde = /ARTÍCULO\s*\d/.test(text);
        const sinTilde = /ARTICULO\s*\d/.test(text);
        if (!(conTilde && sinTilde)) return { cumple: true };
        return { cumple: false, ejemplos: ['El documento usa "ARTÍCULO" en unos lugares y "ARTICULO" en otros.'] };
      },
    },

    {
      id: "com-007",
      titulo: "Los artículos no se separan siempre igual",
      descripcion:
        'Después del número de artículo conviene usar siempre el mismo separador ("ARTÍCULO 1°.-", ' +
        '"ARTÍCULO 1°:"). La herramienta no impone ninguno: sólo avisa si el documento mezcla varios.',
      sugerencia: "Elegir un separador y usarlo en todos los artículos.",
      fuentes: fuentes(NAC("regla 9, punto 4"), MUN("MUN-031"), "Práctica legislativa entrerriana (53/53 leyes)"),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text) {
        const cuerpo = cuerpoNormativo(text);
        const estilos = [
          /art[íi]culo\s*\d+\s*[°ºo]?\s*\.\s*-/i.test(cuerpo),
          /art[íi]culo\s*\d+\s*[°ºo]?\s*:/i.test(cuerpo),
          /art[íi]culo\s*\d+\s*[°ºo]?\s*[–—]/i.test(cuerpo),
        ].filter(Boolean).length;
        if (estilos < 2) return { cumple: true };
        return { cumple: false, ejemplos: ["El documento usa más de un separador distinto después del número de artículo."] };
      },
    },

    {
      id: "com-008",
      titulo: 'Se mezcla "Art." con "Artículo"',
      descripcion:
        'El documento escribe "artículo" de dos maneras: abreviado ("Art. 5") y completo ' +
        '("artículo 5"). Conviene elegir una y usarla siempre, preferentemente la completa.',
      sugerencia: 'Escribir siempre "artículo", sin abreviar.',
      fuentes: fuentes(NAC("regla 9, punto 4"), MUN("MUN-076")),
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const abreviado = [...propio.matchAll(/\bart\.\s*\d/gi)];
        const completo = [...propio.matchAll(/art[íi]culo\s+\d/gi)];
        if (!(abreviado.length && completo.length)) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [
            `Forma abreviada: "${contexto(text, abreviado[0].index, 40)}"`,
            `Forma completa: "${contexto(text, completo[0].index, 40)}"`,
          ],
        };
      },
    },

    {
      id: "com-009",
      titulo: "Un artículo podría reunir varias decisiones",
      descripcion:
        "Cada artículo trata una sola cuestión. Un artículo largo con varias oraciones que " +
        "disponen cosas distintas cuesta citarlo, modificarlo o vetarlo en parte. Los incisos no " +
        "cuentan: desarrollan una misma proposición.",
      sugerencia: "Revisar si conviene dividir el artículo en varios, uno por decisión.",
      fuentes: fuentes(
        NAC("regla 9, puntos 2 y 3"),
        MUN("MUN-029", "incluye MUN-015 y MUN-030"),
        "Reglamento de la Cámara de Senadores de Entre Ríos (dic. 2023), art. 87"
      ),
      autoridad: { provincial: "EXIGE" },
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const DISPONE = new RegExp(
          `${RE_VERBO_NORMATIVO.source}|\\b(deber[áa]n?|deben?|tendr[áa]n?\\s+que|podr[áa]n?|queda(n)?\\s+prohibid[oa]s?|exceptu[áa]n?se|except[úu]a(n)?se)(?![a-záéíóúñ])|\\bse\\s+[a-záéíóúñ]+(?:ar|er|ir)[áÁ]n?(?![a-záéíóúñ])`,
          "i"
        );
        const ej = [];
        for (const t of tramosPorArticulo(cuerpo)) {
          const p = cuerpo.slice(t.index, t.fin);
          if (p.length < 300) continue;
          if (/\b[a-z]\)\s/.test(p) || /\b\d+\)\s/.test(p)) continue;
          const verbos = (p.match(new RegExp(RE_VERBO_NORMATIVO.source, "gi")) || []).length;
          const decisiones = oraciones(p).filter((o) => DISPONE.test(o.texto)).length;
          if ((p.length >= 400 && verbos >= 3) || decisiones >= 3) {
            if (ej.length < 3) ej.push(contexto(text, t.index, 110));
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-010",
      titulo: "Los títulos y capítulos no siguen un orden claro",
      descripcion:
        "Las divisiones van en orden: Libro, Título, Capítulo, Sección. Saltar un nivel, o abrir una " +
        "división única (un solo capítulo en toda la norma), confunde más de lo que ordena.",
      sugerencia: "Respetar la jerarquía sin saltos, y no abrir una división si va a quedar sola.",
      fuentes: fuentes(
        NAC("regla 8, puntos 2 y 3"),
        MUN("MUN-034"),
        "Criterio doctrinario incorporado para cubrir un vacío local"
      ),
      check(text) {
        // Se cuenta en todo el texto propio salvo los anexos, que pueden tener
        // su propia división. No alcanza con el articulado: el primer capítulo
        // se escribe justo antes del Artículo 1°.
        const arts = encabezadosDeArticulo(sinComillas(text));
        const inicio = inicioDelArticulado(text);
        let propio = textoPropio(text);
        for (const a of cabecerasDeAnexo(text).filter((i) => i > inicio)) {
          const previos = arts.filter((x) => x.index < a);
          const ultimo = previos.length ? Math.max(...previos.map((x) => x.numero)) : 0;
          const sigue = arts.find((x) => x.index > a && x.numero > ultimo);
          const hasta = sigue ? sigue.index : text.length;
          propio = propio.slice(0, a) + " ".repeat(hasta - a) + propio.slice(hasta);
        }
        const niveles = [
          { nombre: "Libro", re: /\bLIBRO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Título", re: /\bT[ÍI]TULO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Capítulo", re: /\bCAP[ÍI]TULO\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
          { nombre: "Sección", re: /\bSECCI[ÓO]N\s+([IVXLC]+|\d+|[ÚU]NICO)\b/g },
        ];
        const conteos = niveles.map((n) => ({ nombre: n.nombre, n: (propio.match(n.re) || []).length }));
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
      id: "com-011",
      titulo: "Los incisos van con guiones y después no se pueden citar",
      descripcion:
        "Los incisos se identifican con letra o número para poder citarlos después " +
        '("el inciso b) del artículo 4°"). Una viñeta o un guion no se pueden citar.',
      sugerencia: 'Usar "a)", "b)", "c)" para un nivel y números para el nivel interno.',
      fuentes: fuentes(
        NAC("regla 11, punto 3"),
        MUN("MUN-037"),
        "Criterio doctrinario incorporado para cubrir un vacío local"
      ),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /[•▪‣·]\s+\S|[:;]\s*[-–—]\s+[a-záéíóúñA-ZÁÉÍÓÚÑ]|\n\s*-\s+[a-záéíóúñ]/g;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "com-012",
      titulo: "Las disposiciones transitorias no están al final",
      descripcion:
        "Las disposiciones transitorias se agrupan al final, separadas de las permanentes. Si " +
        "aparecen en el medio del articulado, cuesta distinguir qué rige siempre y qué rige sólo " +
        "durante el paso de un régimen a otro.",
      sugerencia: "Mover las disposiciones transitorias al final, antes de la vigencia y del artículo de forma.",
      fuentes: fuentes(
        MT("orden temático de las disposiciones (punto A.1)"),
        MUN("MUN-045", "cubre también MUN-041"),
        "Criterio doctrinario incorporado para cubrir un vacío local"
      ),
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
      id: "com-013",
      titulo: "Un anexo que ningún artículo menciona",
      descripcion:
        "Si el texto tiene un anexo, algún artículo tiene que remitir a él (\"…que como Anexo I " +
        "forma parte de la presente\"). Si no, el anexo queda colgado: no se sabe qué parte de la " +
        "norma lo pone en juego.",
      sugerencia:
        'Agregar en el artículo correspondiente: "…conforme al detalle que, como Anexo I, forma ' +
        'parte integrante de la presente."',
      fuentes: fuentes(
        NAC("regla 14, punto 1"),
        MUN("MUN-039"),
        "Práctica legislativa entrerriana; criterio subsidiario del Manual nacional, regla 14"
      ),
      autoridad: { provincial: "ACOSTUMBRA" },
      ubicacionFija: "En el artículo que trate el contenido del anexo",
      check(text) {
        // Un anexo bien armado se nombra al menos dos veces: en el artículo que
        // remite a él y en su propio encabezado.
        const menciones = (text.match(/anexo/gi) || []).length;
        if (menciones === 0 || menciones >= 2) return { cumple: true };
        return {
          cumple: false,
          ejemplos: [
            "El documento nombra un anexo una sola vez: o ningún artículo remite a él, o se lo " +
              "menciona pero el anexo no está agregado.",
          ],
        };
      },
    },

    {
      id: "com-014",
      titulo: "Posible anexo intercalado entre los artículos",
      descripcion:
        "Los anexos van después del articulado, separados de él. Si después de un anexo siguen " +
        "apareciendo artículos que continúan la numeración, el anexo quedó intercalado. No se " +
        "marca el caso de un anexo que tiene su propio articulado desde el artículo 1.",
      sugerencia:
        "Mover el anexo al final, después del último artículo, y dejar en el articulado sólo el " +
        "artículo que remite a él.",
      fuentes: fuentes(NAC("regla 12, punto 2"), MUN("MUN-038")),
      check(text, { contexto }) {
        const arts = encabezadosDeArticulo(sinComillas(text));
        if (arts.length < 2) return { cumple: true };
        for (const anexo of cabecerasDeAnexo(text)) {
          const previos = arts.filter((a) => a.index < anexo);
          if (!previos.length) continue;
          const ultimo = Math.max(...previos.map((a) => a.numero));
          const siguiente = arts.find((a) => a.index > anexo);
          // Un anexo con reglamento propio arranca de nuevo en el artículo 1:
          // eso no es intercalar, es su propio articulado.
          if (siguiente && siguiente.numero === ultimo + 1) {
            return {
              cumple: false,
              ejemplos: [
                `El anexo aparece después del artículo ${ultimo} y el articulado sigue con el ` +
                  `${siguiente.numero}: "${contexto(text, anexo, 60)}"`,
              ],
            };
          }
        }
        return { cumple: true };
      },
    },

    {
      id: "com-015",
      titulo: "Conviene evaluar un artículo de objeto",
      descripcion:
        "En normas extensas, un primer artículo que diga cuál es su objeto o finalidad ayuda a " +
        "interpretar el resto. No es obligatorio: es una sugerencia para normas de ocho artículos " +
        "o más que no declaran su objeto al principio.",
      sugerencia:
        'Considerar un artículo inicial: "ARTÍCULO 1°.- Objeto. La presente tiene por objeto…".',
      fuentes: fuentes(NAC("regla 17, punto 1.a — Marco Teórico, disposiciones preliminares"), MUN("MUN-042")),
      check(text) {
        const cuerpo = cuerpoNormativo(text);
        const arts = encabezadosDeArticulo(cuerpo);
        if (arts.length < 8) return { cumple: true };
        const inicio = arts[0].index;
        const tramo = cuerpo.slice(inicio, inicio + Math.floor((cuerpo.length - inicio) * 0.35));
        if (/\bobjeto\b|\bfinalidad\b|tiene\s+por\s+(objeto|fin)|[áa]mbito\s+de\s+aplicaci[óo]n/i.test(tramo)) {
          return { cumple: true };
        }
        return {
          cumple: false,
          ejemplos: ["En los primeros artículos no se encontró una declaración de objeto, finalidad o ámbito."],
        };
      },
    },

    // =========================================================================
    // VIGENCIA, MODIFICACIONES Y DEROGACIONES
    // =========================================================================
    {
      id: "com-016",
      titulo: "La vigencia depende de algo impreciso",
      descripcion:
        "La cláusula de vigencia existe, pero la hace depender de algo que no se puede verificar " +
        '("oportunamente", "cuando corresponda") o de varios hechos alternativos ("a partir de su ' +
        'aprobación, publicación o reglamentación"). Así no se puede saber con certeza desde qué día rige.',
      sugerencia:
        "Usar una fecha, un plazo contado desde un único hecho cierto (por ejemplo, la publicación) " +
        "o una condición que se pueda comprobar.",
      fuentes: fuentes(
        "Código Civil y Comercial de la Nación, art. 5° — " + MT("vigencia"),
        MUN("MUN-104"),
        "Código Civil y Comercial de la Nación, art. 5° (criterio subsidiario)"
      ),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const VIGENCIA = /\b(vigencia|vigor|regir[áa]n?|rige)(?![a-záéíóúñ])/gi;
        const VAGO =
          /\b(oportunamente|cuando\s+corresponda|en\s+su\s+oportunidad|en\s+su\s+momento|cuando\s+sea\s+posible|una\s+vez\s+que\s+sea\s+posible|seg[úu]n\s+(las\s+)?circunstancias|cuando\s+(lo\s+)?(determine|disponga|considere)n?)\b/i;
        const HECHO = /\b(aprobaci[óo]n|sanci[óo]n|promulgaci[óo]n|publicaci[óo]n|reglamentaci[óo]n)\b/gi;
        const col = colectorDeEjemplos(2, 150);
        const vistas = new Set();
        let m;
        while ((m = VIGENCIA.exec(cuerpo)) && !col.lleno()) {
          const o = oracionDe(cuerpo, m.index);
          if (vistas.has(o.index)) continue;
          vistas.add(o.index);
          const hechos = new Set((o.texto.match(HECHO) || []).map((h) => normalizar(h)));
          const alternativos = hechos.size >= 3 || (hechos.size === 2 && /\bo\s+(su|la|el|cuando|desde|a\s+partir)\b/i.test(o.texto));
          const inmediato = /\binmediatamente\b/i.test(o.texto) && hechos.size >= 1;
          // Se cita desde el principio de la oración, no lo que viene antes.
          const inicio = o.index + (o.texto.length - o.texto.trimStart().length);
          if (VAGO.test(o.texto) || alternativos || inmediato) col.agregar(o.index, contexto(text, inicio + 100, 110));
        }
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "com-017",
      titulo: "La vigencia se fija en más de un lugar",
      descripcion:
        "La norma dice desde cuándo rige en más de un artículo. Si las dos indicaciones no " +
        "coinciden, no se sabe cuál vale. Puede ser intencional (una parte rige antes que otra): " +
        "conviene verificar que no se contradigan.",
      sugerencia:
        "Reunir la vigencia en un solo artículo. Si alguna parte rige en otra fecha, decirlo ahí " +
        'mismo: "…con excepción del artículo 5°, que rige a partir de…".',
      fuentes: fuentes(MT("coherencia y seguridad jurídica"), MUN("MUN-119", "fechas contradictorias")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\bentr[a-záéíóú]*\s+en\s+vigencia|\bentrada\s+en\s+vigor|\bcomenzar[áa]n?\s+a\s+regir|\brige\s+(a\s+partir|desde)|\bregir[áa]n?\s+(a\s+partir|desde)|\btendr[áa]n?\s+vigencia|\bdesde\s+ahora\b/gi;
        const lugares = [];
        let m;
        while ((m = re.exec(cuerpo))) {
          if (!lugares.length || m.index - lugares[lugares.length - 1] > 200) lugares.push(m.index);
        }
        if (lugares.length < 2) return { cumple: true };
        return { cumple: false, ejemplos: lugares.slice(0, 3).map((i) => `"${contexto(text, i, 70)}"`) };
      },
    },

    {
      id: "com-018",
      titulo: "Se modifica otra norma sin escribir cómo queda",
      descripcion:
        "Cuando el proyecto modifica, sustituye o incorpora un artículo de otra norma, conviene " +
        "transcribir cómo queda redactado. Si no, para saber qué dice la norma vigente hay que " +
        "reconstruirla de memoria.",
      sugerencia:
        'Usar la fórmula: "Sustitúyese el artículo 5° de la Ley Nº 1.234, el que quedará ' +
        'redactado de la siguiente manera: «ARTÍCULO 5°.- …»".',
      fuentes: fuentes(
        NAC("reglas 54.4 y 55"),
        MUN("MUN-083 y MUN-084"),
        "Constitución de Entre Ríos (2008), art. 130; Ley Nº 9.971 del Digesto, art. 19 (convergente)"
      ),
      autoridad: { provincial: "EXIGE" },
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const partes = cuerpo.split(/(?=art[íi]culo\s+\d+\s*[°ºo]?\s*[.:\-–—])/i);
        // Una derogación no necesita texto nuevo: por eso no está en la lista.
        // También la modificación implícita: "la presente se dicta para modificar la Ley 20.000".
        const verboMod =
          /\b(modif[íi](c|qu)[aeá]n?se|sustit[úu]y[ae]n?se|incorp[óo]r[ae]n?se|para\s+modificar|se\s+modifica\s+(la|el|los|las)|modifica\s+(la|el|los|las)\s+(ley|ordenanza|decreto|art[íi]culo))/i;
        const refNorma = new RegExp(
          `\\b(art[íi]culos?\\s+\\d+[^.]{0,60}\\b${NORMA}|\\b(ley|ordenanza|decreto|resoluci[óo]n)\\s*n?[°ºo]?\\.?\\s*[\\d.]{2,7})`,
          "i"
        );
        const yaTraeTexto = /(quedar[áa]n?\s+redactad|de\s+la\s+siguiente\s+manera|siguiente\s+texto|el\s+siguiente|la\s+siguiente|como\s+sigue|["“«»])/i;
        const ej = [];
        let desde = 0;
        for (const p of partes) {
          const i = cuerpo.indexOf(p, desde);
          desde = i + p.length;
          if (!p.trim() || !verboMod.test(p) || !refNorma.test(p) || yaTraeTexto.test(p)) continue;
          if (ej.length < 3) ej.push(contexto(text, i, 95));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-019",
      titulo: "Se reemplaza el texto de otra norma pero sin comillas",
      descripcion:
        "Cuando se transcribe el texto nuevo de una disposición, tiene que quedar claro dónde " +
        "empieza y dónde termina. Sin comillas, no se sabe qué parte es el texto que se incorpora " +
        "y qué parte es el artículo del proyecto.",
      sugerencia: 'Encerrar el texto nuevo entre comillas: "…quedará redactado de la siguiente manera: «…»".',
      fuentes: fuentes(NAC("regla 41.c"), MUN("MUN-074 y MUN-084")),
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const re = /por\s+el\s+siguiente|quedar[áa]n?\s+redactad[oa]s?\s+(de\s+la\s+siguiente\s+manera|as[íi]|como\s+sigue)/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const despues = cuerpo.slice(m.index, m.index + 200);
          if (!/["“”«»]/.test(despues)) ej.push(contexto(text, m.index, 60));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-020",
      titulo: "Se deroga «todo lo que se oponga», sin decir qué",
      descripcion:
        'Fórmulas como "derógase toda norma que se oponga a la presente" no dicen qué queda ' +
        "derogado: obligan a quien aplica la norma a decidirlo por su cuenta. Las derogaciones " +
        "tienen que nombrar la norma o el artículo que se deja sin efecto.",
      sugerencia:
        'Nombrar lo que se deroga: "Derógase la Ley Nº 1.234 y el artículo 5° de la Ley Nº 5.678."',
      fuentes: fuentes(
        NAC("reglas 57.1 y 57.3"),
        MUN("MUN-087 y MUN-088"),
        "Constitución de Entre Ríos (2008), art. 130; Ley Nº 9.971 del Digesto, art. 19 (concordante)"
      ),
      autoridad: { provincial: "EXIGE" },
      check(text, { contexto }) {
        const cuerpo = textoPropio(text);
        const re =
          /der[óo]g\w*\s+(?:todas?\s+las?|toda)\s+(?:otras?\s+)?(?:normas?|disposicion(?:es)?|leyes?|ordenanzas?|decretos?|normativas?)|\b(?:normas?|disposici[óo]n(?:es)?|ordenanzas?|leyes?|normativas?)\s+(?:(?:legal(?:es)?|reglamentarias?|municipal(?:es)?)\s+(?:[oy]\s+)?)*que\s+se\s+opong\w+|\b(?:disposiciones|normas)\s+(?:que\s+resulten\s+)?contrarias|\btodo\s+lo\s+que\s+se\s+oponga|\baquell[ao]s?\s+que\s+resulten?\s+(?:inconvenientes?|innecesari[ao]s?|antigu[ao]s?|obsolet[ao]s?|contradictori[ao]s?)|\bdeja(?:r|se)?\s+sin\s+efecto\s+toda\s+disposici[óo]n\s+que\s+se\s+opong\w+/gi;
        return citarPatron(text, cuerpo, re, contexto, { maximo: 3, radio: 90, separacion: 150 });
      },
    },

    {
      id: "com-021",
      titulo: "Una prórroga no identifica la norma o el nuevo término",
      descripcion:
        "Una prórroga tiene que decir qué norma o plazo se prorroga y hasta cuándo. Sin esos dos " +
        "datos no se puede saber qué sigue vigente ni por cuánto tiempo.",
      sugerencia:
        'Escribir ambos datos: "Prorrógase hasta el 31 de diciembre de 2027 el plazo previsto en el ' +
        'artículo 3° de la Ley Nº 1.234."',
      fuentes: fuentes(NAC("regla 68, punto 4"), MUN("MUN-093")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /\bprorr[óo]ga(n)?se\b/gi;
        const identifica = /(art[íi]culo|ordenanza|ley|decreto|resoluci[óo]n|convenio|contrato)/i;
        const termino =
          /(hasta\s+(el|la)?|por\s+(el|un)\s+(t[ée]rmino|plazo|per[íi]odo)|d[íi]as|meses|a[ñn]os?\b|\b\d{4}\b|\d{1,2}\/\d{1,2}\/\d{2,4})/i;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const ventana = oracionDesde(cuerpo, m.index, 240);
          const faltan = [];
          if (!identifica.test(ventana)) faltan.push("la norma o el artículo que se prorroga");
          if (!termino.test(ventana)) faltan.push("el nuevo término");
          if (faltan.length) ej.push(`Falta ${faltan.join(" y ")}: "${contexto(text, m.index, 70)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-022",
      titulo: "Verificar qué se suspende y por cuánto tiempo",
      descripcion:
        "Una suspensión tiene que decir qué norma o artículo se suspende y por cuánto tiempo. Sin " +
        "esos datos no se sabe qué deja de aplicarse ni cuándo vuelve a regir.",
      sugerencia:
        'Escribir ambos datos: "Suspéndese por el término de noventa (90) días la aplicación del ' +
        'artículo 12 de la Ley Nº 1.234."',
      fuentes: fuentes(NAC("regla 68, punto 4"), MUN("MUN-094")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /\bsusp[ée]nde(n)?se\b/gi;
        const identifica = /(art[íi]culo|ordenanza|ley|decreto|resoluci[óo]n|convenio|contrato|inciso)/i;
        const duracion =
          /(hasta|por\s+(el|un)\s+(t[ée]rmino|plazo|per[íi]odo)|durante|d[íi]as|meses|a[ñn]os?\b|mientras|\d{1,2}\/\d{1,2}\/\d{2,4})/i;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const ventana = oracionDesde(cuerpo, m.index, 240);
          const faltan = [];
          if (!identifica.test(ventana)) faltan.push("la norma o el artículo que se suspende");
          if (!duracion.test(ventana)) faltan.push("la duración");
          if (faltan.length) ej.push(`Falta ${faltan.join(" y ")}: "${contexto(text, m.index, 70)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-050",
      titulo: "Se incorpora una disposición sin decir dónde va",
      descripcion:
        "Una incorporación tiene que indicar en qué lugar de la otra norma se agrega el texto " +
        '("como artículo 5° bis", "como inciso f) del artículo 3°"). Si no, al ordenar la norma ' +
        "no se sabe dónde ubicarlo.",
      sugerencia: 'Usar la fórmula: "Incorpórase como artículo 5° bis de la Ley Nº 1.234 el siguiente: «…»".',
      fuentes: fuentes(NAC("regla 55"), MUN("MUN-085")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // El punto de "Nº 1.234" no corta la frase: sólo el que no va seguido de un dígito.
        const re = /\bincorp[óo]r[ae]n?se\b(?:[^.]|\.(?=\d)){0,200}/gi;
        const refNorma = /\b(ley|ordenanza|decreto|resoluci[óo]n)\s*n?[°ºo]?\.?\s*[\d.\/]{2,9}/i;
        const ubica =
          /\bcomo\s+(nuevo\s+|nueva\s+|el\s+|la\s+)?(art[íi]culo|inciso|apartado|p[áa]rrafo|punto|cap[íi]tulo|t[íi]tulo|secci[óo]n|anexo)|\b(al|el|en\s+el|del)\s+(art[íi]culo|inciso|apartado|cap[íi]tulo)\s+\d/i;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          if (!refNorma.test(m[0]) || ubica.test(m[0])) continue;
          ej.push(contexto(text, m.index, 90));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-051",
      titulo: "Varios artículos se sustituyen juntos sin separar el texto de cada uno",
      descripcion:
        "Cuando una misma disposición sustituye o modifica varios artículos, el texto nuevo de " +
        "cada uno tiene que quedar identificado. Si se anuncian tres artículos y el texto " +
        "transcripto trae menos encabezados, no se sabe qué redacción corresponde a cuál.",
      sugerencia:
        "Transcribir cada artículo con su propio encabezado dentro de las comillas, o hacer una " +
        "sustitución por artículo.",
      fuentes: fuentes(NAC("regla 59"), MUN("MUN-089")),
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const limpio = sinComillas(cuerpo);
        const tramos = tramosPorArticulo(limpio);
        const re = /\b(sustit[úu]y|modif[íi]c)[a-záéíóú]*nse\s+los\s+art[íi]culos\s+([\d°º\s,ybistercuq]+)/gi;
        const ej = [];
        let m;
        while ((m = re.exec(limpio)) && ej.length < 3) {
          const anunciados = (m[2].match(/\d+/g) || []).length;
          if (anunciados < 2) continue;
          const tramo = tramos.find((t) => t.index <= m.index && m.index < t.fin);
          const fin = tramo ? tramo.fin : cuerpo.length;
          const segmento = cuerpo.slice(m.index, fin);
          const citado = (segmento.match(/[“"«][^”"»]{0,4000}[”"»]/g) || []).join(" ");
          if (!citado) continue; // sin comillas lo marca com-019
          const transcriptos = (citado.match(/art[íi]culo\s+\d+/gi) || []).length;
          if (transcriptos < anunciados) {
            ej.push(
              `Se anuncian ${anunciados} artículos y el texto nuevo trae ${transcriptos} ` +
                `encabezado${transcriptos === 1 ? "" : "s"}: "${contexto(text, m.index, 70)}"`
            );
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-052",
      titulo: "Se cambia un monto o un plazo con una cuenta en vez de escribir el valor",
      descripcion:
        'Disposiciones como "auméntase un 20% el monto previsto en el artículo 4°" obligan a hacer ' +
        "la cuenta para saber cuál es el valor vigente. Conviene escribir directamente el nuevo valor.",
      sugerencia:
        'Sustituir el texto con el valor final: "…el monto de pesos doce mil ($ 12.000)…".',
      fuentes: fuentes(NAC("regla 58"), MUN("MUN-090")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(aum[ée]nta|increm[ée]nta|red[úu]ce|dismin[úu]ye|actual[íi]za)n?se\b[^.]{0,120}?(%|por\s+ciento)[^.]{0,120}?(previst|establecid|fijad|dispuest|art[íi]culo|ordenanza|ley)/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 90 });
      },
    },

    {
      id: "com-053",
      titulo: "Se deroga una norma sin decir cuál",
      descripcion:
        "Una derogación expresa tiene que identificar la norma con su número (y el artículo, si es " +
        'parcial). "Derógase la ordenanza que regula el tránsito" obliga a buscar cuál es.',
      sugerencia: 'Escribir el número: "Derógase la Ordenanza Nº 1.234."',
      fuentes: fuentes(NAC("reglas 57.1 y 62"), MUN("MUN-086")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /\bder[óo]ga(n)?se\b(?:[^.]|\.(?=\d)){0,140}/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          // Sólo interesa lo que se deroga en concreto: la coletilla genérica
          // ("y toda norma que se oponga") la marca com-020.
          const concreto = m[0]
            .split(/,?\s+y\s+(?:toda|todas|dem[áa]s)\b|\s+(?:toda|todas)\s+(?:las?\s+)?(?:otras?\s+)?(?:norma|disposici|ordenanza|ley)/i)[0]
            .replace(/^\S+\s*/, "");
          if (/\d/.test(concreto)) continue; // nombra un número
          if (/que\s+se\s+opong|contrari/i.test(concreto)) continue; // es genérica: la marca com-020
          if (concreto.trim().split(/\s+/).length < 3) continue; // sólo había fórmula genérica
          ej.push(contexto(text, m.index, 80));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // CITAS Y REMISIONES
    // =========================================================================
    {
      id: "com-023",
      titulo: 'Se remite a un artículo como "el anterior" o "el siguiente"',
      descripcion:
        'Las remisiones por posición ("el artículo anterior", "lo anterior", "el inciso siguiente") ' +
        "dejan de ser correctas apenas se agrega o se quita un artículo, y obligan a contar para " +
        "saber de cuál se habla.",
      sugerencia: 'Citar por número: "lo dispuesto en el artículo 4°".',
      fuentes: fuentes(NAC("regla 45, punto 8"), MUN("MUN-078")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(art[íi]culos?|incisos?|p[áa]rrafos?|apartados?)\s+(anterior(es)?|precedentes?|siguientes?|que\s+antecede[n]?|ut\s+supra)\b(?!\s*[:\-–—])|\blo\s+(dispuesto|establecido|expuesto)\s+(anteriormente|precedentemente|m[áa]s\s+arriba|ut\s+supra)\b|\b(de|a|en|con)\s+lo\s+anterior\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { radio: 50 });
      },
    },

    {
      id: "com-024",
      titulo: 'Se remite a "la normativa vigente" sin decir cuál',
      descripcion:
        'Remisiones como "conforme la normativa vigente" o "las leyes nacionales, provinciales y ' +
        'todas las demás que correspondan" no dicen qué norma se aplica: quien lee tiene que ' +
        "adivinarlo.",
      sugerencia: 'Nombrar la norma: "conforme la Ley Nº 10.027".',
      fuentes: fuentes(NAC("regla 51"), MUN("MUN-080")),
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const re =
          /\b(la\s+)?(normativa|legislaci[óo]n|reglamentaci[óo]n)\s+(vigente|aplicable|correspondiente|pertinente|en\s+la\s+materia|que\s+corresponda)\b|\blas\s+normas\s+(vigentes|aplicables|pertinentes)\b|\bla\s+ley\s+de\s+la\s+materia\b|\b(y|o)\s+(todas\s+)?las\s+dem[áa]s\s+(normas\s+|leyes\s+|disposiciones\s+)?que\s+correspond\w+|\bleyes\s+nacionales,?\s+provinciales,?\s+(y\s+)?municipales\b/gi;
        return citarCoincidencias(text, propio, re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "com-045",
      titulo: "Se remite a un artículo de esta misma norma que no existe",
      descripcion:
        "El texto cita un artículo propio con un número mayor que el del último artículo. Puede " +
        "ser un error de numeración o una remisión que quedó vieja después de reordenar.",
      sugerencia: "Revisar el número citado y corregirlo por el del artículo al que se quiere remitir.",
      fuentes: fuentes(NAC("regla 48"), MUN("MUN-119")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const arts = encabezadosDeArticulo(cuerpo);
        if (!arts.length) return { cumple: true };
        const maximo = Math.max(...arts.map((a) => a.numero));
        const re =
          /\bart[íi]culos?\s+(\d+)\s*[°º]?\s*(?:,\s*)?(?:de\s+(?:la\s+presente|esta)(?:\s+(?:ley|ordenanza|resoluci[óo]n|norma|decreto))?|de\s+la\s+presente)\b/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const n = Number(m[1]);
          if (n > maximo) {
            ej.push(`Se cita el artículo ${n}, pero el último artículo es el ${maximo}: "${contexto(text, m.index, 55)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // REDACCIÓN NORMATIVA
    // =========================================================================
    {
      id: "com-025",
      titulo: "Posible justificación dentro del articulado",
      descripcion:
        "El articulado dispone; la justificación va en el VISTO, el CONSIDERANDO o los " +
        'fundamentos. Expresiones como "considerando que", "resulta necesario" o "solicito a mis ' +
        'pares" dentro de un artículo suelen indicar que se coló una explicación.',
      sugerencia:
        "Mover la justificación a los considerandos o a los fundamentos, y dejar en el artículo " +
        'sólo la norma: "ARTÍCULO 1°.- Créase el Programa…".',
      fuentes: fuentes(
        NAC("regla 28, punto 1"),
        MUN("MUN-048"),
        "Reglamento de la Cámara de Diputados de Entre Ríos (t.o. 2021), art. 63; Reglamento de la Cámara de Senadores (dic. 2023), art. 86"
      ),
      autoridad: { provincial: "EXIGE" },
      check(text, { contexto }) {
        // Sólo el articulado: en el CONSIDERANDO estas frases son correctas.
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(visto\s+que|considerando\s+que|atento\s+a\s+que|toda\s+vez\s+que|dado\s+que|en\s+virtud\s+de\s+que|resulta\s+necesario|resulta\s+imperioso|es\s+menester|habida\s+cuenta\s+de|solicito\s+a\s+mis\s+pares|es\s+de\s+esperar\s+que|es\s+dable\s+destacar|vengo\s+a\s+proponer|por\s+los\s+motivos\s+expuestos)\b/gi;
        const col = colectorDeEjemplos(4, 140);
        // Un artículo que empieza con "Que…" está escrito como un considerando.
        for (const t of tramosPorArticulo(cuerpo)) {
          const m = /[:.\-–—]\s*(Que\s+[a-záéíóúñ])/.exec(cuerpo.slice(t.index, t.index + 45));
          if (m) col.agregar(t.index + m.index, contexto(text, t.index + m.index + 20, 85));
        }
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(cuerpo)) && !col.lleno()) col.agregar(m.index, contexto(text, m.index, 85));
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "com-026",
      titulo: "Hay varios verbos en tiempo futuro",
      descripcion:
        'La norma manda en presente: "El Registro funciona en…", no "funcionará". El futuro hace ' +
        'dudar de si la disposición ya rige o regirá más adelante. "Deberá" y "podrá" no se ' +
        "cuentan: son la forma habitual de expresar el mandato y la facultad.",
      sugerencia: 'Pasar los verbos a presente: "tendrán" → "tienen", "será" → "es".',
      fuentes: fuentes(NAC("regla 20, punto 1"), MUN("MUN-049")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // Futuro regular (-ará, -erá, -irá) e irregular (tendrá, hará, dirá,
        // habrá, pondrá, saldrá, vendrá, será). El regular exige la "á" con
        // tilde: sin ella, "primera", "manera" o "cámara" parecerían verbos. El
        // irregular se acepta también sin tilde, porque esas raíces no forman
        // sustantivos. El corte de palabra va escrito a mano porque \b no
        // reconoce las vocales acentuadas como letras.
        const re =
          /(^|[^a-záéíóúñ])((?!deber|poder|podr)(?:(?:[a-záéíóúñ]{3,}(?:ar|er|ir)|ser|har|dir)[áÁ]n?|[a-záéíóúñ]*(?:tendr|pondr|saldr|vendr|valdr|habr|sabr|cabr|querr)[áaÁA]n?))(?![a-záéíóúñ])/gi;
        const ej = [];
        const vistos = new Set();
        let m;
        while ((m = re.exec(cuerpo))) {
          const palabra = m[2].toLowerCase();
          if (vistos.has(palabra)) continue;
          // La cláusula de vigencia usa el futuro con naturalidad ("entrará en vigencia").
          const alrededor = cuerpo.slice(Math.max(0, m.index - 30), m.index + 50);
          if (/vigencia|vigor|regir/i.test(alrededor)) continue;
          // "…quedará redactado de la siguiente manera" es la fórmula de las modificaciones.
          if (/^quedar[áa]n?$/i.test(palabra) && /^\s*redactad/i.test(cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 15))) continue;
          vistos.add(palabra);
          if (ej.length < 4) ej.push(contexto(text, m.index + m[1].length, 55));
        }
        if (vistos.size < 3) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-027",
      titulo: 'Se usa "y/o", que deja la duda de si son los dos o uno solo',
      descripcion:
        '"Y/o" no dice si se exigen las dos condiciones, una de ellas o cualquiera. En una norma ' +
        'esa duda se traslada a quien la aplica. "O" ya incluye el caso de los dos, salvo que se ' +
        "diga lo contrario.",
      sugerencia: 'Elegir "y" (las dos) u "o" (cualquiera, o ambas). Si hace falta, decirlo: "una o ambas".',
      fuentes: fuentes(NAC("regla 25, punto 1"), MUN("MUN-061")),
      check(text, { contexto }) {
        return citarCoincidencias(text, textoPropio(text), /\by\s*\/\s*o\b/gi, contexto, { radio: 55 });
      },
    },

    {
      id: "com-028",
      titulo: "Hay una doble negación que puede confundir",
      descripcion:
        'Dos negaciones en la misma frase ("no podrá hacerlo sin autorización") obligan a ' +
        "pensar dos veces qué se permite y qué se prohíbe.",
      sugerencia: 'Reformular en positivo: "sólo podrá hacerlo con autorización".',
      fuentes: fuentes(NAC("regla 23, punto 1"), MUN("MUN-059")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        return citarCoincidencias(text, cuerpo, /\bno\b[^.;]{0,70}\b(sin|ni|tampoco|nunca)\b/gi, contexto, { maximo: 3, radio: 80 });
      },
    },

    {
      id: "com-029",
      titulo: 'Conviene usar el verbo directo en lugar de "procédase a"',
      descripcion:
        'Rodeos como "procédase a notificar" dicen lo mismo que "notifíquese" con más palabras.',
      sugerencia: 'Usar el verbo directo: "Notifícase…", "El Departamento Ejecutivo notifica…".',
      fuentes: fuentes(MT("estilo: concisión"), MUN("MUN-050")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(proc[ée]dase\s+a|disp[óo]nese\s+que\s+se\s+proceda|se\s+deber[áa]\s+proceder\s+a|deber[áa]\s+procederse\s+a|se\s+proceder[áa]\s+a)/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "com-030",
      titulo: 'Verificar quién es "la autoridad competente" o "quien corresponda"',
      descripcion:
        'Sujetos como "la autoridad competente", "quien corresponda" o "todos", o una obligación ' +
        'sin sujeto ("se deberá mejorar…"), no dicen a quién obliga o faculta la norma. Si la ' +
        "autoridad está designada en otro artículo, conviene nombrarla igual en todo el texto.",
      sugerencia:
        'Nombrar al sujeto: "la Secretaría de Ambiente", "los titulares de los puestos". Si hay una ' +
        'autoridad de aplicación, designarla en un artículo y usar siempre ese nombre.',
      fuentes: fuentes(NAC("regla 19 (estilo íntegro y unívoco)"), MUN("MUN-052")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const designa =
          /autoridad\s+de\s+aplicaci[óo]n[^.]{0,60}\b(es|ser[áa]|a\s+la|al|la\s+secretar|el\s+departamento)|des[íi]gnase\s+(como\s+)?autoridad\s+de\s+aplicaci[óo]n|ser[áa]\s+autoridad\s+de\s+aplicaci[óo]n/i.test(
            cuerpo
          );
        const re =
          /\b(la\s+autoridad\s+(competente|que\s+corresponda)|el\s+organismo\s+(correspondiente|competente|pertinente|que\s+corresponda)|el\s+[áa]rea\s+(correspondiente|competente|pertinente)|la\s+(dependencia|repartici[óo]n|secretar[íi]a)\s+(correspondiente|competente|pertinente)|quien(es)?\s+corresponda|todos\s+(los\s+que|deber[áa]n|tendr[áa]n|podr[áa]n)|los\s+que\s+(tengan\s+que|corresponda)|las\s+autoridades\s+que\s+correspondan|autorizaci[óo]n\s+correspondiente|(?<=(?:^|[.:;]\s*)(?:(?:tambi[ée]n|asimismo|adem[áa]s),?\s+)?)se\s+deber[áa]n?\s+(?!entender|tener|considerar|computar)[a-záéíóúñ]+(?:ar|er|ir))\b/gi;
        const col = colectorDeEjemplos(3, 110);
        let m;
        while ((m = re.exec(cuerpo)) && !col.lleno()) {
          if (designa && /^la\s+autoridad/i.test(m[0])) continue;
          col.agregar(m.index, contexto(text, m.index, 55));
        }
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "com-031",
      titulo: 'Un plazo en "días" no aclara si son hábiles o corridos',
      descripcion:
        'Un plazo de "diez días" puede contarse de dos maneras, y la diferencia puede ser de ' +
        "varias semanas. Conviene decirlo en cada plazo o en un artículo general sobre el cómputo.",
      sugerencia: 'Escribir "diez (10) días hábiles" o "diez (10) días corridos".',
      fuentes: fuentes(
        "Código Civil y Comercial de la Nación, art. 6° — " + MT("precisión"),
        MUN("MUN-064"),
        "Código Civil y Comercial de la Nación, art. 6° (criterio subsidiario)"
      ),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // Una cláusula general sobre el cómputo resuelve todos los plazos.
        if (/plazos?[^.]{0,120}(d[íi]as\s+)?(h[áa]biles|corridos)/i.test(cuerpo)) return { cumple: true };
        const re =
          /\b\d{1,3}\s*\)?\s*d[íi]as\b(?!\s+(h[áa]biles|corridos|naturales|calendario|administrativos|laborables))/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 55 });
      },
    },

    {
      id: "com-032",
      titulo: "Hay una fecha o un momento imprecisos",
      descripcion:
        'Expresiones como "a la brevedad", "desde ahora", "en algún momento" o "el corriente año" ' +
        "no permiten saber con certeza cuándo. En una norma, conviene una fecha o un plazo contado " +
        "desde un hecho cierto.",
      sugerencia: 'Escribir la fecha ("el 1° de marzo de 2027") o el plazo ("dentro de los treinta (30) días hábiles de…").',
      fuentes: fuentes(NAC("regla 19 (estilo íntegro y unívoco)"), MUN("MUN-065")),
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const re =
          /\ba\s+la\s+(mayor\s+)?brevedad\b|\ben\s+breve\b|\bpr[óo]ximamente\b|\b(del|el|al|este)\s+(corriente|presente)\s+(a[ñn]o|mes)\b|\b(del|el|al)\s+(pr[óo]ximo\s+(a[ñn]o|mes)|(a[ñn]o|mes)\s+pr[óo]ximo|a[ñn]o\s+en\s+curso)\b|\beste\s+(a[ñn]o|mes)\b|\bdesde\s+ahora\b|\bdesde\s+cuando\s+sea\s+posible\b|\ben\s+alg[úu]n\s+momento\b|\bdel?\s+mes\s+que\s+corresponda\b|(?<![a-záéíóúñ])[úu]ltimamente\b/gi;
        return citarCoincidencias(text, propio, re, contexto, { maximo: 4, radio: 55 });
      },
    },

    {
      id: "com-039",
      titulo: "Una enumeración queda abierta",
      descripcion:
        'Expresiones como "y cualquier otra cuestión", "u otras medidas" o "etc." dejan la lista ' +
        "abierta sin decir hasta dónde llega. Conviene revisar si la lista es cerrada o sólo da " +
        'ejemplos; si da ejemplos, decirlo de forma expresa ("entre otros").',
      sugerencia:
        'Cerrar la lista, o aclarar que es ejemplificativa: "…tales como a), b) y c), entre otros".',
      fuentes: fuentes(NAC("regla 27, punto 1"), MUN("MUN-063", REVISION)),
      revision: true,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /,?\s*\betc(?:\.|[ée]tera\b)|\b(?:y|o|u)\s+(?:de\s+)?(?:cualquier|toda)\s+otr[ao]s?\b|\b(?:y|u|o)\s+otr[ao]s\s+(?:medidas|sanciones|cuestiones|temas|asuntos|casos|conceptos)\b|\by\s+dem[áa]s\s+(?:cuestiones|temas|asuntos|aspectos)\b/gi;
        return citarPatron(text, cuerpo, re, contexto, { maximo: 4, radio: 55 }, (m, c) => {
          // "Comuníquese, etcétera." es el cierre tradicional del Senado entrerriano.
          if (/comun[íi]quese\s*$/i.test(c.slice(Math.max(0, m.index - 20), m.index))) return true;
          // "y toda otra norma que se oponga" es una derogación genérica: la marca com-020.
          return /^\s*(norma|disposici|normativa|ley|ordenanza)/i.test(c.slice(m.index + m[0].length, m.index + m[0].length + 20));
        });
      },
    },

    {
      id: "com-040",
      titulo: "Hay criterios que la norma no define",
      descripcion:
        'Expresiones como "motivos suficientes", "lo que se considere razonable", "si corresponde" ' +
        'o "en la medida de lo posible" dejan librado a quien aplica la norma algo que la norma ' +
        "debería precisar. La herramienta no puede saber si es intencional: conviene revisarlo.",
      sugerencia:
        "Reemplazar el criterio abierto por el dato concreto: el monto, el caso, la condición o el " +
        "órgano que decide y con qué límites.",
      fuentes: fuentes(NAC("regla 19 (estilo íntegro y unívoco)"), MUN("MUN-051 y MUN-062", REVISION)),
      revision: true,
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const re =
          /\bque\s+(?:se\s+|(?:el|la|los|las)\s+[^.,;]{1,40}?\s+)?consideren?\s+(?:razonable|necesari[oa]|importante|conveniente|oportun[oa]|pertinente)\b|\ben\s+caso\s+de\s+incumplimiento\b(?!\s+(?:de|a|del|al|por)\b)|\b(?:otras\s+)?sanciones\s+que\s+correspond\w+|\bcuando\s+(?:lo|se)\s+considere\s+(?:necesario|conveniente|oportuno|pertinente)\b|\bmotivos\s+suficientes\b|\bcasos\s+especiales\b|\bsituaciones\s+particulares\b|\ben\s+la\s+medida\s+de\s+lo\s+posible\b|\bsi\s+corresponde\b|\bcuando\s+resulte\s+necesario\b|\bcomportarse\s+bien\b|\bcumplir\s+correctamente\b|\blas\s+cosas\s+que\s+correspond\w+|\ben\s+alg[úu]n\s+lugar\b|\bfuera\s+del\s+mismo\b/gi;
        return citarCoincidencias(text, propio, re, contexto, { maximo: 15, radio: 50, separacion: 25 });
      },
    },

    {
      id: "com-041",
      titulo: "La norma deja para más adelante lo que debería definir",
      descripcion:
        'Disposiciones como "cuyos objetivos, integrantes y presupuesto serán determinados ' +
        'posteriormente" crean algo sin decir cómo funciona. Delegar en la reglamentación es ' +
        "habitual; dejar todo para un momento indeterminado, no.",
      sugerencia:
        "Definir en la norma los elementos esenciales, o encomendar expresamente su reglamentación " +
        'a un órgano y en un plazo: "El Departamento Ejecutivo reglamenta…dentro de los noventa (90) días".',
      fuentes: fuentes(NAC("regla 19 (estilo íntegro y unívoco)"), MUN("MUN-047", REVISION)),
      revision: true,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(?:determinad|establecid|fijad|definid)[oa]s?\s+(?:posteriormente|oportunamente|m[áa]s\s+adelante|en\s+el\s+futuro)\b|\b(?:determinar|establecer|fijar|definir)[áa]n?\s+(?:posteriormente|oportunamente|m[áa]s\s+adelante|en\s+el\s+futuro)\b|\ba\s+determinar(?=\s*[.,;)]|\s+(?:posteriormente|oportunamente|por\s+la\s+reglamentaci))|\boportunamente\s+se\s+(?:fije|determine|establezca|defina)n?\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 80 });
      },
    },

    {
      id: "com-042",
      titulo: "Se faculta a otro órgano a modificar o dejar sin efecto esta norma",
      descripcion:
        "La norma permite que otro órgano la modifique, la suspenda o la deje sin efecto. En " +
        "general eso corresponde a quien la dicta. Si lo que se busca es que la reglamente o " +
        "actualice valores, conviene decir sólo eso. Conviene revisarlo con criterio jurídico.",
      sugerencia:
        'Limitar la facultad a lo necesario: "El Departamento Ejecutivo reglamenta la presente" o ' +
        '"…actualiza los montos del artículo 4° según el índice…".',
      fuentes: fuentes(MT("seguridad jurídica"), MUN("MUN-097", REVISION)),
      revision: true,
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\bpodr[áa]n?(?![a-záéíóúñ])[^.]{0,150}?\b(?:modificar|ampliar|reducir|suspender|derogar|dejar\s+sin\s+efecto)\b[^.]{0,150}?\b(?:la\s+presente|est[ae]\s+(?:norma|ordenanza|ley|r[ée]gimen))\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 2, radio: 100 });
      },
    },

    {
      id: "com-043",
      titulo: "Hay expresiones coloquiales",
      descripcion:
        'Expresiones como "estaría bueno", "un poco" o "las cosas" son propias de la conversación, ' +
        "no de una norma: no dicen con precisión qué se dispone.",
      sugerencia: "Reemplazarlas por términos precisos que nombren lo que se regula.",
      fuentes: fuentes(NAC("regla 19 (estilo íntegro y unívoco)"), MUN("MUN-053", REVISION)),
      revision: true,
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const re =
          /\b(?:estar[íi]a\s+(?:bueno|bien)|est[áa]\s+bueno|un\s+poco|(?:las|muchas|otras|algunas)\s+cosas|cosas\s+que|pasan\s+muchas|todo\s+eso|nom[áa]s)\b/gi;
        return citarCoincidencias(text, propio, re, contexto, { maximo: 4, radio: 50, separacion: 80 });
      },
    },

    {
      id: "com-047",
      titulo: "Un término definido parece no volver a usarse",
      descripcion:
        "Se define un término que después no aparece en el resto del texto. Una definición sólo " +
        "tiene sentido si el término se usa; si no, sobra o el texto usa otro nombre para lo mismo.",
      sugerencia: "Usar el término definido en el articulado, o quitar la definición.",
      fuentes: fuentes(NAC("regla 31"), MUN("MUN-054")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const plano = normalizar(cuerpo);
        const re =
          /entiende(?:r[áa])?n?\s+por\s+["“«]?([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,4}?)["”»]?\s*(?::|,|\ba\b|\bal\b|\bla\b|\blas\b|\bel\b|\blos\b|\btodo\b|\btoda\b)/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          const palabras = normalizar(m[1]).split(/\s+/).filter(Boolean);
          if (!palabras.length) continue;
          // Tolera plural y singular: "vehículo abandonado" / "vehículos abandonados".
          const patron = palabras.map((p) => p.replace(/(es|s)$/, "") + "(es|s)?").join("\\s+");
          const usos = (plano.match(new RegExp(`\\b${patron}\\b`, "g")) || []).length;
          if (usos <= 1) ej.push(`"${m[1]}" se define y no vuelve a usarse: "${contexto(text, m.index, 60)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    // =========================================================================
    // ESCRITURA Y ORTOTIPOGRAFÍA
    // =========================================================================
    {
      id: "com-033",
      titulo: "Hay palabras en otro idioma que tienen equivalente en castellano",
      descripcion:
        'Palabras como "online", "e-mail" o "delivery" tienen equivalente castellano ("en línea", ' +
        '"correo electrónico", "envío a domicilio"). Si no hay equivalente, conviene escribirlas en bastardilla.',
      sugerencia: "Usar la palabra castellana.",
      fuentes: fuentes(
        NAC("regla 33, punto 1"),
        MUN("MUN-057"),
        "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 — criterio aplicado por analogía"
      ),
      autoridad: { provincial: "CRITERIO LEGAL CONDICIONADO" },
      check(text, { contexto }) {
        const t = normalizar(textoPropio(text));
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
          ejemplos: encontradas.slice(0, 4).map((e) => `"${e.palabra}" en: "${contexto(text, e.index, 45)}"`),
        };
      },
    },

    {
      id: "com-034",
      titulo: "Hay una sigla que nunca se explica",
      descripcion:
        "La primera vez que aparece una sigla hay que escribir su nombre completo y la sigla entre " +
        'paréntesis: "Registro Municipal de Puestos Móviles (RMPM)". Después alcanza con la sigla.',
      sugerencia: "Desarrollar la sigla la primera vez que aparece, con la sigla entre paréntesis.",
      fuentes: fuentes(
        NAC("regla 36, punto 2"),
        MUN("MUN-067"),
        "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 — criterio aplicado por analogía"
      ),
      autoridad: { provincial: "CRITERIO LEGAL CONDICIONADO" },
      check(text, { contexto }) {
        const IGNORAR = new Set([
          "LEY", "LEYES", "ARTICULO", "ARTÍCULO", "TITULO", "TÍTULO", "CAPITULO", "CAPÍTULO",
          "SECCION", "SECCIÓN", "ANEXO", "DECRETO", "ORDENANZA", "RESOLUCION", "RESOLUCIÓN",
          "COMUNICACION", "COMUNICACIÓN", "DECLARACION", "DECLARACIÓN", "PROYECTO", "VISTO",
          "CONSIDERANDO", "POR", "ELLO", "TODO", "TANTO", "CONCEJO", "DELIBERANTE", "HONORABLE",
          "MUNICIPALIDAD", "MUNICIPIO", "MUNICIPAL", "CIUDAD", "DEPARTAMENTO", "EJECUTIVO", "PODER",
          "PROVINCIA", "PROVINCIAL", "LEGISLATURA", "ENTRE", "RIOS", "RÍOS", "SANCIONA",
          "SANCIONAN", "ORDENA", "RESUELVE", "DECRETA", "FUERZA", "FUNDAMENTOS", "SALA", "SESIONES",
          "CAMARA", "CÁMARA", "DIPUTADOS", "SENADORES", "SENADO", "CONGRESO", "BOLETIN", "BOLETÍN",
          "OFICIAL", "COMUNIQUESE", "COMUNÍQUESE", "REGISTRESE", "REGÍSTRESE", "PUBLIQUESE",
          "PUBLÍQUESE", "NOTIFIQUESE", "NOTIFÍQUESE", "ARCHIVESE", "ARCHÍVESE", "PRESENTE", "NACION",
          "NACIÓN", "NACIONAL", "REPUBLICA", "REPÚBLICA", "ARGENTINA", "CONSTITUCION",
          "CONSTITUCIÓN", "SIGUIENTE", "DISPOSICIONES", "TRANSITORIAS", "GENERALES", "UNICO",
          "ÚNICO", "PARANA", "PARANÁ", "CONCORDIA", "GUALEGUAYCHU", "GUALEGUAYCHÚ", "URUGUAY",
          "CONCEPCION", "CONCEPCIÓN",
        ]);
        const propio = textoPropio(text);
        const primera = new Map();
        const conteo = new Map();
        const enMinuscula = new Set();
        for (const m of propio.matchAll(/[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}/g)) {
          const palabra = m[0];
          if (palabra !== palabra.toUpperCase()) {
            enMinuscula.add(normalizar(palabra));
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
      id: "com-048",
      titulo: "Una misma sigla se explica de dos maneras",
      descripcion:
        "La misma sigla aparece desarrollada con dos nombres distintos. Quien lee no sabe si son " +
        "dos organismos o uno solo con el nombre mal escrito.",
      sugerencia: "Usar siempre el mismo nombre completo para cada sigla.",
      fuentes: fuentes(NAC("regla 36, punto 2"), MUN("MUN-119")),
      check(text, { contexto }) {
        const re =
          /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|del|la|las|los|el|y|para|en)?\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,8})\s*\(\s*([A-ZÁÉÍÓÚÑ]{2,})\s*\)/g;
        const desarrollos = new Map();
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 3) {
          const sigla = m[2];
          const denominacion = normalizar(m[1]).replace(/\s+/g, " ");
          if (!desarrollos.has(sigla)) {
            desarrollos.set(sigla, denominacion);
            continue;
          }
          const previa = desarrollos.get(sigla);
          // Puede haber palabras de más delante ("Créase el Consejo…"): se
          // compara la cola, que es la denominación propiamente dicha.
          if (previa.endsWith(denominacion) || denominacion.endsWith(previa)) continue;
          ej.push(`"${sigla}" se desarrolla de otra manera en: "${contexto(text, m.index, 60)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-035",
      titulo: "Siglas con puntos en el medio o con «s» de plural",
      descripcion:
        'Las siglas se escriben sin puntos ("ONG", no "O.N.G.") y no llevan "s" en plural ' +
        '("las ONG", no "las ONGs").',
      sugerencia: 'Escribir la sigla sin puntos y sin "s": "las ONG".',
      fuentes: fuentes(NAC("regla 37, puntos 1 y 2"), MUN("MUN-067")),
      check(text, { contexto }) {
        const propio = textoPropio(text);
        const ej = [];
        const conPuntos = /\b(?:[A-ZÁÉÍÓÚÑ]\.){2,}[A-ZÁÉÍÓÚÑ]?\b/g;
        let m;
        while ((m = conPuntos.exec(propio)) && ej.length < 3) ej.push(contexto(text, m.index, 50));
        const conPlural = /\b[A-ZÁÉÍÓÚÑ]{2,}s\b/g;
        while ((m = conPlural.exec(propio)) && ej.length < 4) ej.push(contexto(text, m.index, 50));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-036",
      titulo: "La cifra en letras no coincide con el número",
      descripcion:
        'Cuando un número se escribe en letras y en cifras ("treinta (30) días"), las dos tienen ' +
        "que decir lo mismo. Si no coinciden, no se sabe cuál vale.",
      sugerencia: "Corregir la que esté mal. La herramienta no sabe cuál de las dos es la correcta.",
      fuentes: fuentes(
        NAC("regla 39, punto 1"),
        MUN("MUN-069"),
        "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 inc. b) — criterio aplicado por analogía"
      ),
      autoridad: { provincial: "CRITERIO LEGAL CONDICIONADO" },
      check(text, { contexto }) {
        const MULTIPLICA = new Set(["mil", "millon", "millones"]);
        const re = /\(\s*([\d.]{1,9})\s*\)/g;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 4) {
          const cifra = Number(m[1].replace(/\./g, ""));
          if (!Number.isFinite(cifra)) continue;
          const letras = letrasAntesDe(text, m.index);
          const valor = valorEnLetras(letras);
          if (valor === null || valor === cifra) continue;
          if (MULTIPLICA.has(letras[0])) continue;
          ej.push(`Dice "${letras.join(" ")}" pero el número es ${cifra}: "${contexto(text, m.index, 60)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-037",
      titulo: "Hay abreviaturas que conviene escribir completas",
      descripcion:
        'En el articulado conviene evitar abreviaturas como "Nro.", "Gral.", "Sr." o "Expte.": se ' +
        "escriben completas para que no haya dudas al leer ni al citar.",
      sugerencia: 'Escribir la palabra completa: "número", "general", "expediente".',
      fuentes: fuentes(NAC("regla 36, punto 1"), MUN("MUN-066")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(nro|depto|dpto|pcia|gral|tel|ej|expte|sr|sra|dr|dra|ing|arq|prof)\.(?=\s)|\s[cs]\/\s/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 40, separacion: 60 });
      },
    },

    {
      id: "com-038",
      titulo: "Mezcla de tipos de comillas",
      descripcion:
        "En los textos que sustituyen o incorporan disposiciones, las comillas delimitan " +
        "exactamente qué es texto nuevo, así que conviene que sean siempre las mismas.",
      sugerencia: "Unificar el tipo de comillas en todo el documento.",
      fuentes: fuentes(NAC("regla 41.c"), MUN("MUN-074"), "Práctica legislativa entrerriana"),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text) {
        const tipograficas = /[“”]/.test(text);
        const rectas = /"/.test(text);
        if (!(tipograficas && rectas)) return { cumple: true };
        return { cumple: false, ejemplos: ['El documento mezcla comillas tipográficas (“ ”) con comillas rectas (").'] };
      },
    },

    {
      id: "com-044",
      titulo: "Posibles signos de puntuación repetidos",
      descripcion:
        'Signos duplicados como ",,", "::" o ";;" suelen ser errores de tipeo. Las líneas de ' +
        'puntos para completar ("Nº ....") no se marcan.',
      sugerencia: "Revisar y dejar un solo signo.",
      fuentes: fuentes(NAC("regla 41"), MUN("MUN-073")),
      check(text, { contexto }) {
        // Sin borrar las comillas: con dos citas seguidas borradas, "”; “" parecería ";;".
        const cuerpo = soloArticulado(text);
        const re = /,\s*,|;\s*;|:\s*:|\?{2,}|!{2,}/g;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 35, separacion: 60 });
      },
    },

    {
      id: "com-046",
      titulo: "Los incisos saltan una letra o la repiten",
      descripcion:
        'Los incisos siguen una secuencia sin huecos: a), b), c). Un salto ("a", "b", "d") o una ' +
        "letra repetida hacen dudar de si falta un inciso y complican citarlos después.",
      sugerencia:
        "Revisar la secuencia de incisos. La herramienta no la corrige: no puede saber si falta un " +
        "inciso o si la letra está mal puesta.",
      fuentes: fuentes(NAC("regla 11, punto 2"), MUN("MUN-036")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const ej = [];
        // Una letra citada ("el inciso b) del artículo 4°") no abre un inciso.
        const CITA = /\b(inciso|incisos|inc\.|apartado|apartados|letra|letras|punto|puntos|y|o|e|u)\s*$/i;
        // "i)", "v)" y "x)" también son numerales romanos de un nivel interno.
        const ROMANOS = { i: "h", v: "u", x: "w" };
        for (const t of tramosPorArticulo(cuerpo)) {
          const tramo = cuerpo.slice(t.index, t.fin);
          const re = /(^|[\s:;.,])([a-z])\)\s/g;
          let previa = null;
          let m;
          while ((m = re.exec(tramo)) && ej.length < 3) {
            const pos = m.index + m[1].length;
            if (CITA.test(tramo.slice(Math.max(0, pos - 14), pos))) continue;
            const letra = m[2];
            if (ROMANOS[letra] && previa !== ROMANOS[letra]) continue;
            if (letra === "a") {
              previa = "a";
              continue;
            }
            if (previa === null) continue; // no empezó en a): no es una enumeración reconocible
            const esperada = String.fromCharCode(previa.charCodeAt(0) + 1);
            if (letra !== esperada) {
              const aviso = letra === previa ? `El inciso ${letra}) aparece dos veces` : `Después del inciso ${previa}) viene el ${letra})`;
              ej.push(`${aviso}: "${contexto(text, t.index + pos, 45)}"`);
            }
            previa = letra;
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-049",
      titulo: "Los artículos bis y ter están repetidos o fuera de orden",
      descripcion:
        'Los artículos intercalados siguen un orden fijo: "bis", "ter", "quater". Un "ter" sin ' +
        '"bis" antes, o dos "bis" del mismo número, dejan dudas sobre cuál es cuál al citarlos.',
      sugerencia: 'Revisar la secuencia: después del "ARTÍCULO 5°" va el "5° bis", luego el "5° ter".',
      fuentes: fuentes(NAC("regla 9, punto 4"), MUN("MUN-032")),
      check(text, { contexto }) {
        const arts = encabezadosDeArticulo(cuerpoNormativo(text));
        const porNumero = new Map();
        for (const a of arts) {
          if (!porNumero.has(a.numero)) porNumero.set(a.numero, []);
          porNumero.get(a.numero).push(a);
        }
        const ej = [];
        for (const [numero, lista] of porNumero) {
          if (!lista.some((a) => a.sufijo)) continue;
          let previo = 0;
          const vistos = new Set();
          for (const a of lista) {
            const orden = ORDEN_SUFIJO[a.sufijo] || 0;
            const nombre = `${numero}${a.sufijo ? " " + a.sufijo : ""}`;
            if (vistos.has(a.sufijo) && a.sufijo) {
              ej.push(`El artículo ${nombre} aparece dos veces: "${contexto(text, a.index, 40)}"`);
            } else if (orden < previo) {
              ej.push(`El artículo ${nombre} aparece después de uno posterior: "${contexto(text, a.index, 40)}"`);
            } else if (a.sufijo && orden > previo + 1 && previo >= 1) {
              ej.push(`El artículo ${nombre} aparece sin el intermedio anterior: "${contexto(text, a.index, 40)}"`);
            }
            vistos.add(a.sufijo);
            previo = Math.max(previo, orden);
            if (ej.length >= 3) break;
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej.slice(0, 3) };
      },
    },

    // =========================================================================
    // AGREGADAS AL REVISAR UN PROYECTO MAL REDACTADO A PROPÓSITO
    // =========================================================================
    {
      id: "com-054",
      titulo: "El VISTO no identifica un antecedente",
      descripcion:
        "El VISTO nombra el antecedente concreto que motiva el proyecto: el expediente, la nota, " +
        'la norma. "Visto que…" seguido de una explicación mezcla el VISTO con el CONSIDERANDO y no ' +
        "dice cuál es el antecedente.",
      sugerencia:
        'Escribir el antecedente: "VISTO: El Expediente Nº 1.234/2026 y la nota de vecinos del barrio ' +
        'Norte; y CONSIDERANDO: Que…".',
      fuentes: fuentes(MT("estructura del texto normativo"), MUN("MUN-024")),
      check(text, { contexto }) {
        const inicio = inicioDelArticulado(text);
        const pre = inicio >= 0 ? text.slice(0, inicio) : text.slice(0, 1500);
        const visto = /\bvisto\b\s*(:|que\b)?/i.exec(pre);
        if (!visto) return { cumple: true };
        if (visto[1] && /que/i.test(visto[1])) {
          return { cumple: false, ejemplos: [`"${contexto(text, visto.index, 70)}"`] };
        }
        const fin = pre.slice(visto.index).search(/\bconsiderando\b|\bsanciona|\bORDENA\b|\bRESUELVE\b|\bpor\s+ello\b/i);
        const bloque = pre.slice(visto.index, visto.index + (fin > 0 ? fin : 400));
        const ANTECEDENTE =
          /expediente|expte|\bnota\b|\bley\b|ordenanza|decreto|resoluci[óo]n|proyecto|presentaci[óo]n|solicitud|convenio|\bacta\b|pedido|n[°ºo]\.?\s*\d/i;
        if (ANTECEDENTE.test(bloque)) return { cumple: true };
        return { cumple: false, ejemplos: [`"${contexto(text, visto.index, 70)}"`] };
      },
    },

    {
      id: "com-055",
      titulo: "Un verbo que recomienda no manda",
      descripcion:
        'Una norma dispone: ordena, prohíbe, autoriza. "Recomienda", "se sugiere" o "se aconseja" ' +
        "no obligan a nadie. Si se busca un mandato, conviene decirlo como tal; si es sólo una " +
        "sugerencia, no es materia de la norma.",
      sugerencia: 'Usar el verbo que dispone: "ORDENA", "Establécese…", "Prohíbese…".',
      fuentes: fuentes(NAC("regla 28, punto 1"), MUN("MUN-048")),
      check(text, { contexto }) {
        const re =
          /\bRECOMIENDA\b|\brecomi[ée]ndase\b|\bse\s+recomienda\b|\bsugi[ée]rese\b|\bse\s+sugiere\b|\bse\s+aconseja\b|\bACONSEJA\b/g;
        return citarCoincidencias(text, textoPropio(text), re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "com-056",
      titulo: "La derogación, la vigencia y el cierre están en un mismo artículo",
      descripcion:
        "La derogación, la vigencia y la fórmula de cierre (comuníquese, publíquese…) son " +
        "disposiciones distintas y van en artículos separados, en ese orden, al final del " +
        "articulado. Juntas en un mismo artículo cuesta citarlas y modificarlas por separado.",
      sugerencia:
        'Separarlas: "ARTÍCULO 8°.- Derógase…", "ARTÍCULO 9°.- La presente entra en vigencia…", ' +
        '"ARTÍCULO 10.- Comuníquese…".',
      fuentes: fuentes(NAC("regla 9, punto 3 — Marco Teórico, orden temático de las disposiciones"), MUN("MUN-041 y MUN-029")),
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const TIPOS = [
          ["la derogación", /\bder[óo]g\w*se\b|\bd[ée]ja(n)?se\s+sin\s+efecto\b/i],
          ["la vigencia", /\bentr[a-záéíóú]*\s+en\s+vigencia|\bentrada\s+en\s+vigor|\bvigencia\s+a\s+partir|\brige\s+(a\s+partir|desde)|\bregir[áa]n?\s+(a\s+partir|desde)/i],
          ["el cierre", /\b(comun[íi]quese|publ[íi]quese|reg[íi]strese|arch[íi]vese|notif[íi]quese|c[úu]mplase)\b|\bde\s+forma\s*[.\-]/i],
        ];
        const ej = [];
        for (const t of tramosPorArticulo(cuerpo)) {
          const p = cuerpo.slice(t.index, t.fin);
          const juntos = TIPOS.filter(([, re]) => re.test(p)).map(([nombre]) => nombre);
          if (juntos.length >= 2 && ej.length < 2) {
            ej.push(`Juntos ${juntos.join(", ").replace(/, ([^,]*)$/, " y $1")}: "${contexto(text, t.index + 40, 70)}"`);
          }
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "com-057",
      titulo: "Una cifra está escrita sólo en números",
      descripcion:
        "Las cantidades que fijan plazos, montos o medidas se escriben en letras y en números " +
        '("treinta (30) días", "pesos mil ($ 1.000)"), para que un error de tipeo no cambie su ' +
        "valor.",
      sugerencia: 'Escribir la cantidad en letras y, entre paréntesis, en números: "pesos diez mil ($ 10.000)".',
      fuentes: fuentes(
        NAC("regla 39, punto 1"),
        MUN("MUN-069", "decisión del proyecto: el Manual no impone este formato en lo municipal"),
        "Ley Nº 9.971 del Digesto Jurídico de Entre Ríos, art. 3 inc. b) — ley vigente, criterio aplicado a proyectos por analogía y confirmado por la práctica"
      ),
      autoridad: { provincial: "CRITERIO LEGAL CONDICIONADO" },
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const col = colectorDeEjemplos(5, 60);
        // Cantidades con su unidad: "30 días", "100 metros". No cuenta "(30) días".
        const unidad =
          /(?<![(\d.,])\b(\d{1,3}(?:\.\d{3})+|\d+)\s+(d[íi]as?|a[ñn]os?|meses|semanas|horas|minutos|pesos|kil[óo]metros|metros)\b/gi;
        let m;
        while ((m = unidad.exec(cuerpo)) && !col.lleno()) {
          const antes = cuerpo.slice(Math.max(0, m.index - 30), m.index);
          // Una edad no es un plazo: "mayores de 40 años" no se escribe en letras.
          if (/(mayor|menor)(es)?\s+de\s*$|edad\s+de\s*$/i.test(antes)) continue;
          // Las mensuras ("rumbo N67°58'O de 2900 metros") se escriben en números.
          if (/metros|kil/i.test(m[2]) && /°|rumbo|v[ée]rtice|lado|tramo/i.test(cuerpo.slice(Math.max(0, m.index - 60), m.index))) continue;
          col.agregar(m.index, contexto(text, m.index, 50));
        }
        // Montos: "$1.000". No cuenta "pesos mil ($ 1.000)" ni "$ 100 (cien pesos)".
        const monto = /(?<!\(\s*)\$\s*\d[\d.,]*/g;
        while ((m = monto.exec(cuerpo)) && !col.lleno()) {
          const despues = cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 4);
          if (/^\s*\)/.test(despues) || /^\s*\(\s*[a-záéíóúñ]/i.test(despues)) continue;
          col.agregar(m.index, contexto(text, m.index, 50));
        }
        if (!col.ejemplos.length) return { cumple: true };
        return { cumple: false, ejemplos: col.ejemplos };
      },
    },

    {
      id: "com-058",
      titulo: "El verbo va en subjuntivo: «créese» en vez de «créase»",
      descripcion: {
        nacional:
          '"Declárase" es pasiva refleja: la norma declara y el enunciado se sostiene solo. ' +
          '"Declárese" es un imperativo que le ordena a alguien que declare, pero no dice a quién. ' +
          "En una norma el mandato no se dirige a un destinatario oculto: la norma <em>es</em> la declaración.",
        provincial:
          '"Declárase" es pasiva refleja: la ley declara y el enunciado se sostiene solo. ' +
          '"Declárese" es un imperativo que le ordena a alguien que declare, pero no dice a quién. ' +
          "En una ley el mandato no se dirige a un destinatario oculto: la ley <em>es</em> la " +
          "declaración. En el corpus medido, 1 de cada 4 leyes entrerrianas usa la forma imperativa.",
        municipal:
          '"Declárase" es pasiva refleja: la ordenanza declara y el enunciado se sostiene solo. ' +
          '"Declárese" es un imperativo que le ordena a alguien que declare, pero no dice a quién. ' +
          "En una norma el mandato no se dirige a un destinatario oculto: la norma <em>es</em> la declaración.",
      },
      sugerencia:
        "Usar la terminación <em>-ase</em>: Créase, Declárase, Modifícase, Deróganse, Autorízase, " +
        "Establécese, Incorpórase, Apruébase, Sustitúyese, Facúltase. El artículo de forma es la " +
        'excepción: ahí "Comuníquese" es correcto, porque sí se dirige a alguien.',
      fuentes: fuentes(
        NAC("regla 20, punto 1"),
        MUN("MUN-049", "decisión del proyecto: el Manual no trasladaba esta práctica provincial"),
        "Práctica legislativa entrerriana (37 de 53 leyes usan la forma en pasiva refleja)"
      ),
      autoridad: { provincial: "ACOSTUMBRA" },
      check(text, { contexto }) {
        const re =
          /\b(Cr[ée]ese|Modif[íi]quese|Modif[íi]quense|Der[óo]guese|Der[óo]guense|Decl[áa]rese|Decl[áa]rense|Autor[íi]cese|Establ[ée]zcase|Establ[ée]zcanse|Incorp[óo]rese|Apru[ée]bese|Ratif[íi]quese|Facult[ée]se|Sustit[úu]yase)\b/gi;
        return citarCoincidencias(text, textoPropio(text), re, contexto, { maximo: 5, radio: 70, separacion: 140 });
      },
    },
  ];

  /** Un texto puede ser uno solo o uno por ámbito. */
  const porAmbito = (valor, ambito) => (valor && typeof valor === "object" ? valor[ambito] : valor);

  /** Las reglas comunes, con la fuente y la autoridad del ámbito pedido. */
  function para(ambito) {
    return REGLAS.map((r) => ({
      id: r.id,
      titulo: porAmbito(r.titulo, ambito),
      descripcion: porAmbito(r.descripcion, ambito),
      sugerencia: porAmbito(r.sugerencia, ambito),
      fuente: r.fuentes[ambito],
      autoridad: r.revision ? "REVISIÓN" : (r.autoridad && r.autoridad[ambito]) || (ambito === "nacional" ? undefined : "SUBSIDIARIO"),
      ubicacionFija: r.ubicacionFija,
      check: (text, util) => r.check(text, { ...util, ambito }),
    }));
  }

  return { para, ids: REGLAS.map((r) => r.id) };
})();
