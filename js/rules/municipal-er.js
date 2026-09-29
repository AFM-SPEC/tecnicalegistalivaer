/**
 * Reglas de técnica legislativa — ámbito MUNICIPAL (Entre Ríos).
 *
 * Fuente de las reglas: "Manual de Técnica Legislativa Municipal de Entre
 * Ríos", versión armonizada con el módulo provincial
 * (docs/fuentes/municipal-er/MANUAL_TECNICA_LEGISLATIVA_MUNICIPAL_ER.md).
 * Cada regla cita el punto del Manual (MUN-xxx) en el que se apoya.
 *
 * NIVEL DE AUTORIDAD
 * ------------------
 * Todas las reglas automáticas son SUBSIDIARIO: no existe una norma común que
 * obligue a todos los municipios entrerrianos a redactar de una forma
 * determinada, así que la herramienta sólo puede recomendar. Por eso ninguna
 * pasa de prioridad "media" (Manual, sección 19).
 *
 * Las reglas que dependen de cada Concejo (fórmula de sanción, artículo de
 * cierre, firmas) son VERIFICAR LOCALMENTE y no están acá: sólo se activarán
 * cuando exista la ficha local de un municipio (Manual, sección 21).
 *
 * ARMONIZACIÓN CON EL MÓDULO PROVINCIAL
 * -------------------------------------
 * Cuando el Manual dice "misma detección" que una regla er-prov-xxx, el check
 * reproduce exactamente la lógica provincial, con dos ajustes propios del
 * ámbito: se reconocen las ordenanzas como norma citada, y el preámbulo
 * municipal (VISTO, CONSIDERANDO) queda fuera del articulado.
 *
 * CRITERIO COMÚN (Manual, sección 16 ter)
 * ---------------------------------------
 * La herramienta sólo avisa cuando encuentra una palabra, frase o patrón
 * concreto que siempre es un problema. Si tendría que adivinar, no avisa.
 *
 * IMPORTANTE (igual que en nacional.js y provincial-er.js): `titulo`,
 * `descripcion` y `sugerencia` se insertan como HTML y son texto fijo escrito
 * acá. Lo único que proviene del documento del usuario es `ejemplos`, que
 * app.js escapa aparte. Nunca pongas fragmentos del documento en `sugerencia`
 * ni en `descripcion`.
 */

window.ReglasMunicipalER = (() => {
  // ---------------------------------------------------------------------------
  // Utilidades comunes
  //
  // Igual que en provincial-er.js: todas devuelven cadenas del MISMO largo que
  // el texto original, con lo descartado reemplazado por espacios. Así las
  // posiciones siguen coincidiendo y contexto(text, m.index) cita bien.
  // ---------------------------------------------------------------------------

  const blancos = (n) => " ".repeat(Math.max(0, n));

  const MANUAL = "Manual de Técnica Legislativa Municipal de Entre Ríos";
  const fuente = (mun, extra) => `${MANUAL}, ${mun}${extra ? ` — ${extra}` : ""}`;

  /** Borra lo que esté entre comillas: el texto que se sustituye no es articulado propio. */
  function sinComillas(texto) {
    return texto.replace(/[“"«][^”"»]{0,4000}[”"»]/g, (m) => blancos(m.length));
  }

  // Sólo en mayúsculas: así se escribe el encabezado del bloque.
  const RE_FUNDAMENTOS = /\bFUNDAMENTOS\b|\bFUNDAMENTACI[ÓO]N\b/;

  // Normas que un proyecto municipal cita con frecuencia.
  const NORMA = "(?:ley|ordenanza|decreto|resoluci[óo]n|c[óo]digo|carta\\s+org[áa]nica|constituci[óo]n)";

  /**
   * Encabezados de artículo, descartando las citas a otras normas. Es la misma
   * lógica que provincial-er.js, con las ordenanzas y resoluciones agregadas a
   * las normas que delatan una cita ("el artículo 5º de la Ordenanza Nº 123").
   */
  function encabezadosDeArticulo(cuerpo) {
    const re = /art[íi]culo\s+(\d+)\s*[°ºo]?\s*(bis|ter|quater|quinquies|sexies)?\s*[.:\-–—]?/gi;
    const CONECTORES =
      /\b(el|del|al|la|las|los|un|una|en|de|por|para|este|esta|dicho|dicha|presente|mismo|misma|cada|seg[úu]n|conforme|previsto|prevista|previstos|previstas|establecido|establecida|citado|citada|referido|referida|mencionado|mencionada|siguiente|anterior|y|o)\s+$/i;
    const DE_NORMA = new RegExp(`^\\s*de\\s+(la|el|los|las)\\s+${NORMA}`, "i");
    const lista = [];
    let m;
    while ((m = re.exec(cuerpo))) {
      if (CONECTORES.test(cuerpo.slice(Math.max(0, m.index - 24), m.index))) continue;
      const despues = cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 40);
      if (DE_NORMA.test(despues)) continue;
      lista.push({
        numero: Number(m[1]),
        sufijo: m[2] ? m[2].toLowerCase() : "",
        index: m.index,
      });
    }
    return lista;
  }

  /**
   * Encabezados de anexo: "ANEXO I", "ANEXO ÚNICO". Sólo en mayúsculas y sin un
   * conector delante, para no confundirlos con la mención dentro de un
   * artículo ("…que como Anexo I forma parte de la presente").
   */
  function cabecerasDeAnexo(texto) {
    const re = /\bANEXO(?:\s+(?:[IVXLC]+|\d+|[A-Z]|[ÚU]NICO))?\b/g;
    const CONECTORES = /\b(como|el|del|al|en|seg[úu]n|conforme|y|e|los|las|la|su)\s+$/i;
    const lista = [];
    let m;
    while ((m = re.exec(texto))) {
      if (CONECTORES.test(texto.slice(Math.max(0, m.index - 20), m.index))) continue;
      lista.push(m.index);
    }
    return lista;
  }

  /**
   * Deja sólo el articulado, en blanco el resto.
   *
   * El articulado empieza en el primer encabezado de artículo: todo lo anterior
   * (título, VISTO, CONSIDERANDO, fórmula de sanción) es preámbulo. Los
   * FUNDAMENTOS y los anexos se borran desde su rótulo hasta el siguiente
   * artículo que continúe la numeración; si no hay ninguno, hasta el final.
   * Así, un bloque intercalado por error (lo marcan er-mun-001 y er-mun-002) no
   * esconde los artículos que vienen después.
   */
  function soloArticulado(texto) {
    const arts = encabezadosDeArticulo(sinComillas(texto));
    if (!arts.length) return blancos(texto.length);
    const inicio = arts[0].index;
    const rotulos = [...cabecerasDeAnexo(texto)];
    const reFund = new RegExp(RE_FUNDAMENTOS.source, "g");
    let f;
    while ((f = reFund.exec(texto))) rotulos.push(f.index);
    const tapar = [];
    for (const r of rotulos.filter((i) => i > inicio).sort((a, b) => a - b)) {
      const previos = arts.filter((a) => a.index < r);
      const ultimo = previos.length ? Math.max(...previos.map((a) => a.numero)) : 0;
      // Un anexo con reglamento propio arranca en el artículo 1: esos artículos
      // son del anexo, no del proyecto, y quedan tapados con él.
      const sigue = arts.find((a) => a.index > r && a.numero > ultimo);
      tapar.push([r, sigue ? sigue.index : texto.length]);
    }
    let salida = blancos(inicio) + texto.slice(inicio);
    for (const [desde, hasta] of tapar) {
      salida = salida.slice(0, desde) + blancos(hasta - desde) + salida.slice(hasta);
    }
    return salida;
  }

  /** El cuerpo normativo limpio: sin preámbulo, sin fundamentos y sin textos citados. */
  const cuerpoNormativo = (texto) => sinComillas(soloArticulado(texto));

  /** Todo lo que está antes del primer artículo: título, VISTO, CONSIDERANDO. */
  function preambulo(texto) {
    const arts = encabezadosDeArticulo(sinComillas(texto));
    return arts.length ? texto.slice(0, arts[0].index) : texto;
  }

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
    return blancos(desde) + texto.slice(desde, hasta) + blancos(texto.length - hasta);
  }

  /** ¿El documento se presenta como ordenanza? Sólo mira el preámbulo y la fórmula. */
  function esOrdenanza(texto) {
    return /ordenanza/i.test(preambulo(texto));
  }

  /** Junta ejemplos evitando citar dos veces la misma frase (igual que en provincial-er.js). */
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

  /** Recorre todas las coincidencias de `re` en `cuerpo` y cita cada una en `text`. */
  function citarCoincidencias(text, cuerpo, re, contexto, { maximo = 4, radio = 60, separacion = 110 } = {}) {
    const col = colectorDeEjemplos(maximo, separacion);
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(cuerpo)) && !col.lleno()) col.agregar(m.index, contexto(text, m.index, radio));
    if (!col.ejemplos.length) return { cumple: true };
    return { cumple: false, ejemplos: col.ejemplos };
  }

  /**
   * La oración que empieza en `index`, hasta el primer punto que no sea el de
   * un número ("Nº 1.234"). Sirve para no leer el artículo siguiente.
   */
  function oracionDesde(texto, index, maximo) {
    const tramo = texto.slice(index, index + maximo);
    const fin = tramo.search(/\.(?!\d)/);
    return fin >= 0 ? tramo.slice(0, fin) : tramo;
  }

  /** Posición relativa (0 a 1) dentro de la parte del texto que tiene contenido. */
  function posicionRelativa(cuerpo, index) {
    const inicio = cuerpo.search(/\S/);
    const fin = cuerpo.replace(/\s+$/, "").length;
    if (inicio < 0 || fin <= inicio) return 0;
    return (index - inicio) / (fin - inicio);
  }

  /** Divide el cuerpo en tramos, uno por artículo, con su posición. */
  function tramosPorArticulo(cuerpo) {
    const arts = encabezadosDeArticulo(cuerpo);
    return arts.map((a, k) => ({
      ...a,
      fin: k + 1 < arts.length ? arts[k + 1].index : cuerpo.replace(/\s+$/, "").length,
    }));
  }

  // Verbos con los que un texto dispone algo. Se usan para reconocer mandatos
  // fuera del articulado y artículos que reúnen varias decisiones.
  const RE_VERBO_NORMATIVO =
    /\b(cr[ée]a(n)?se|decl[áa]ra(n)?se|modif[íi]ca(n)?se|der[óo]ga(n)?se|autor[íi]za(n)?se|establ[ée]ce(n)?se|incorp[óo]ra(n)?se|apru[ée]ba(n)?se|sustit[úu]ye(n)?se|fac[úu]lta(n)?se|disp[óo]ne(n)?se|proh[íi]be(n)?se|des[íi]gna(n)?se|instit[úu]ye(n)?se|encomi[ée]nda(n)?se)\b/gi;

  // Números escritos en letras, para cotejarlos con la cifra entre paréntesis.
  // Misma tabla que provincial-er.js.
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
  const MULTIPLICADORES = new Set(["mil", "millon", "millones"]);

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
      const p = previo[i].split(/[^a-zñ]+/).filter(Boolean).pop() || "";
      if (p === "y" || NUMEROS[p] !== undefined) tomadas.unshift(p);
      else break;
    }
    while (tomadas.length && tomadas[0] === "y") tomadas.shift();
    return tomadas;
  }

  const ORDEN_SUFIJO = { "": 1, bis: 2, ter: 3, quater: 4, quinquies: 5, sexies: 6 };

  return [
    // =========================================================================
    // ESTRUCTURA DEL PROYECTO
    // =========================================================================
    {
      id: "er-mun-001",
      titulo: "Los fundamentos quedaron partidos en medio de los artículos",
      descripcion:
        "Articulado y fundamentos son dos piezas separadas. Los fundamentos pueden ir antes o " +
        "después del articulado según la práctica de cada Concejo, pero no intercalados entre " +
        "los artículos. No tener fundamentos escritos no es un error.",
      sugerencia:
        "Reunir todo el bloque de fundamentos en un solo lugar, antes o después del articulado " +
        "completo, nunca en el medio.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-026", "misma detección que la regla provincial"),
      severidad: "media",
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
      id: "er-mun-002",
      titulo: "Hay un anexo metido en medio de los artículos",
      descripcion:
        "Los anexos van después del articulado, separados de él. Si después de un anexo siguen " +
        "apareciendo artículos que continúan la numeración, el anexo quedó intercalado. No se " +
        "marca el caso de un anexo que tiene su propio articulado desde el artículo 1.",
      sugerencia:
        "Mover el anexo al final, después del último artículo, y dejar en el articulado sólo el " +
        "artículo que remite a él.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-038"),
      severidad: "media",
      check(text, { contexto }) {
        const limpio = sinComillas(text);
        const arts = encabezadosDeArticulo(limpio);
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
      id: "er-mun-003",
      titulo: "Un anexo que ningún artículo menciona",
      descripcion:
        "Si el texto tiene un anexo, algún artículo tiene que remitir a él (\"…que como Anexo I " +
        "forma parte de la presente\"). Si no, el anexo queda colgado: no se sabe qué parte de la " +
        "norma lo pone en juego.",
      sugerencia:
        'Agregar en el artículo correspondiente: "…conforme al detalle que, como Anexo I, forma ' +
        'parte integrante de la presente ordenanza."',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-039", "misma detección que la regla provincial"),
      severidad: "media",
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
      id: "er-mun-004",
      titulo: "El VISTO contiene mandatos que van en el articulado",
      descripcion:
        "El VISTO identifica antecedentes: el expediente, la nota o la norma que motivan el " +
        "proyecto. Si contiene verbos que disponen (\"créase\", \"autorízase\"), ese mandato no " +
        "tiene fuerza normativa ahí. Usar o no el VISTO depende de cada Concejo: su ausencia no " +
        "se marca.",
      sugerencia:
        "Pasar el mandato a un artículo y dejar en el VISTO sólo la referencia al antecedente.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-024"),
      severidad: "media",
      check(text, { contexto }) {
        const bloque = bloqueDelPreambulo(text, RE_VISTO, RE_CONSIDERANDO);
        if (!bloque) return { cumple: true };
        return citarCoincidencias(text, bloque, RE_VERBO_NORMATIVO, contexto, { maximo: 3 });
      },
    },

    {
      id: "er-mun-005",
      titulo: "El CONSIDERANDO contiene mandatos que van en el articulado",
      descripcion:
        "El CONSIDERANDO explica por qué se dicta la norma; no dispone nada. Un verbo que manda " +
        "(\"créase\", \"establécese\") dentro del considerando no tiene fuerza normativa. Usar o no " +
        "el CONSIDERANDO depende de cada Concejo: su ausencia no se marca.",
      sugerencia:
        "Pasar el mandato a un artículo. En el considerando, si hace falta, explicar por qué " +
        'conviene: "Que resulta necesario crear…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-025"),
      severidad: "media",
      check(text, { contexto }) {
        const bloque = bloqueDelPreambulo(text, RE_CONSIDERANDO, null);
        if (!bloque) return { cumple: true };
        return citarCoincidencias(text, bloque, RE_VERBO_NORMATIVO, contexto, { maximo: 3 });
      },
    },

    {
      id: "er-mun-006",
      titulo: "No se aclara qué tipo de instrumento es",
      descripcion:
        "Antes del articulado conviene que el documento diga si es un proyecto de ordenanza, " +
        "resolución, decreto, comunicación u otra categoría. La herramienta no juzga si el tipo " +
        "elegido es el correcto: sólo avisa cuando no encuentra ninguno.",
      sugerencia:
        'Encabezar el documento con su denominación, por ejemplo "PROYECTO DE ORDENANZA".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-021"),
      severidad: "baja",
      ubicacionFija: "Al inicio del documento",
      check(text) {
        const arts = encabezadosDeArticulo(sinComillas(text));
        if (!arts.length) return { cumple: true };
        const pre = preambulo(text);
        if (
          /ordenanza|resoluci[óo]n|decreto|comunicaci[óo]n|declaraci[óo]n|minuta|pedido\s+de\s+informe|\bley\b/i.test(pre)
        ) {
          return { cumple: true };
        }
        return {
          cumple: false,
          ejemplos: ["Antes del primer artículo no aparece la denominación del instrumento."],
        };
      },
    },

    {
      id: "er-mun-007",
      titulo: "El proyecto de iniciativa popular no tiene articulado o fundamentos",
      descripcion:
        "Un proyecto de iniciativa popular tiene que presentarse redactado como norma, con " +
        "artículos, y con sus fundamentos. La herramienta no controla firmas, porcentajes ni " +
        "materias excluidas.",
      sugerencia:
        "Redactar la propuesta en artículos numerados y agregar un bloque de fundamentos o " +
        "considerandos que explique por qué se la propone.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-005"),
      severidad: "media",
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

    {
      id: "er-mun-008",
      titulo: "El título no dice de qué trata la norma",
      descripcion:
        "El título tiene que identificar el objeto de la norma. \"Disposiciones varias\" o " +
        "\"Modificaciones\" no dicen nada. La herramienta sólo avisa con estos títulos vacíos " +
        "conocidos: si el título es otro, juzgar si describe bien el contenido exige leer la norma.",
      sugerencia:
        'Nombrar el objeto: "Régimen de habilitación de food trucks" o "Modificación de la ' +
        'Ordenanza Nº 1.234 de Tránsito".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-022", "sólo lista cerrada de títulos vacíos"),
      severidad: "baja",
      check(text, { contexto }) {
        // El encabezado termina en el VISTO, el CONSIDERANDO, la fórmula de
        // sanción, la primera división o el primer artículo: después de eso,
        // "DISPOSICIONES GENERALES" es el nombre de un capítulo, no el título.
        const pre = preambulo(text);
        const cortes = [RE_VISTO, RE_CONSIDERANDO, /\bCAP[ÍI]TULO\b|\bT[ÍI]TULO\s+[IVX\d]|\bSECCI[ÓO]N\b/]
          .map((re) => pre.search(re))
          .filter((i) => i >= 0);
        RE_CIERRE_PREAMBULO.lastIndex = 0;
        const sancion = RE_CIERRE_PREAMBULO.exec(pre);
        if (sancion) cortes.push(sancion.index);
        const fin = cortes.length ? Math.min(...cortes) : pre.length;
        const re =
          /^[ \t]*(disposiciones\s+varias|disposiciones\s+generales|otras\s+disposiciones|modificaciones|modificaci[óo]n|modificaci[óo]n\s+de\s+(la\s+)?ordenanza|varios)[ \t]*\.?[ \t]*$/gim;
        const m = re.exec(pre.slice(0, fin));
        if (!m) return { cumple: true };
        return { cumple: false, ejemplos: [`"${contexto(text, m.index, 40)}"`] };
      },
    },

    {
      id: "er-mun-009",
      titulo: "La norma no dice cuál es su objeto",
      descripcion:
        "En una ordenanza extensa, un artículo inicial de objeto ayuda a entender para qué existe. " +
        "Sólo se revisa en ordenanzas de ocho artículos o más: en una norma breve el objeto suele " +
        "ser evidente.",
      sugerencia:
        'Agregar al comienzo: "ARTÍCULO 1°.- Objeto. La presente ordenanza tiene por objeto…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-042"),
      severidad: "baja",
      ubicacionFija: "En los primeros artículos",
      check(text) {
        if (!esOrdenanza(text)) return { cumple: true };
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

    {
      id: "er-mun-010",
      titulo: "Un artículo mete varias decisiones juntas",
      descripcion:
        "Cada artículo debería contener una sola regla. La prueba práctica: si el artículo se " +
        "puede votar por mitades, o el Ejecutivo podría vetar una parte y promulgar la otra, está " +
        "mal dividido. La longitud sola no es el problema; lo es que haya decisiones autónomas " +
        "juntas.",
      sugerencia: "Dividir el artículo en varios, uno por cada decisión.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-029", "incluye MUN-015 y MUN-030; misma detección que la regla provincial"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const ej = [];
        for (const t of tramosPorArticulo(cuerpo)) {
          const p = cuerpo.slice(t.index, t.fin);
          if (p.length < 400) continue;
          if (/\b[a-z]\)\s/.test(p) || /\b\d+\)\s/.test(p)) continue; // los incisos desarrollan una misma proposición
          const nv = (p.match(RE_VERBO_NORMATIVO) || []).length;
          if (nv >= 3 && ej.length < 3) ej.push(contexto(text, t.index, 110));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-011",
      titulo: "Los artículos no están numerados en orden",
      descripcion:
        "Los artículos se numeran en forma correlativa, sin saltos ni repeticiones. Para " +
        'intercalar uno nuevo sin renumerar el resto se usa "bis", "ter", etcétera.',
      sugerencia:
        'Renumerar en forma correlativa, o usar "ARTÍCULO 2° bis" para intercalar. La herramienta ' +
        "no renumera: no puede saber si falta un artículo o si sobra un número.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-031", "misma detección que la regla provincial"),
      severidad: "media",
      check(text, { contexto }) {
        const vistos = encabezadosDeArticulo(cuerpoNormativo(text)).filter((a) => !a.sufijo);
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
      id: "er-mun-012",
      titulo: "Los artículos bis y ter están repetidos o fuera de orden",
      descripcion:
        'Los artículos intercalados siguen un orden fijo: "bis", "ter", "quater". Un "ter" sin ' +
        '"bis" antes, o dos "bis" del mismo número, dejan dudas sobre cuál es cuál al citarlos.',
      sugerencia:
        'Revisar la secuencia: después del "ARTÍCULO 5°" va el "5° bis", luego el "5° ter".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-032"),
      severidad: "media",
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

    {
      id: "er-mun-013",
      titulo: 'Mezcla "ARTÍCULO" y "ARTICULO" en el mismo texto',
      descripcion: "Elegida una grafía para el encabezado de los artículos, conviene mantenerla en todo el documento.",
      sugerencia: 'Unificar en "ARTÍCULO", con tilde.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-031", "misma detección que la regla provincial"),
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
      id: "er-mun-014",
      titulo: "Los artículos no se separan siempre igual",
      descripcion:
        'Después del número de artículo conviene usar siempre el mismo separador ("ARTÍCULO 1°.-", ' +
        '"ARTÍCULO 1°:"). La herramienta no impone ninguno: sólo avisa si el documento mezcla varios.',
      sugerencia: "Elegir un separador y usarlo en todos los artículos.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-031", "misma detección que la regla provincial"),
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
      id: "er-mun-015",
      titulo: "Los títulos y capítulos no siguen un orden claro",
      descripcion:
        "Las divisiones van en orden: Título, Capítulo, Sección. Saltar un nivel, o abrir una " +
        "división única (un solo capítulo en toda la norma), confunde más de lo que ordena.",
      sugerencia: "Respetar la jerarquía sin saltos, y no abrir una división si va a quedar sola.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-034", "misma detección que la regla provincial"),
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
      id: "er-mun-016",
      titulo: "Los incisos saltan una letra o la repiten",
      descripcion:
        'Los incisos siguen una secuencia sin huecos: a), b), c). Un salto ("a", "b", "d") o una ' +
        "letra repetida hacen dudar de si falta un inciso y complican citarlos después.",
      sugerencia:
        "Revisar la secuencia de incisos. La herramienta no la corrige: no puede saber si falta un " +
        "inciso o si la letra está mal puesta.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-036"),
      severidad: "media",
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
      id: "er-mun-017",
      titulo: "Los incisos van con guiones y después no se pueden citar",
      descripcion:
        "Los incisos se identifican con letra o número para poder citarlos después " +
        '("el inciso b) del artículo 4°"). Una viñeta o un guion no se pueden citar.',
      sugerencia: 'Usar "a)", "b)", "c)" para un nivel y números para el nivel interno.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-037", "misma detección que la regla provincial"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /[•▪‣·]\s+\S|[:;]\s*[-–—]\s+[a-záéíóúñA-ZÁÉÍÓÚÑ]/g;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "er-mun-018",
      titulo: "Las disposiciones transitorias no están al final",
      descripcion:
        "Las disposiciones transitorias se agrupan al final, separadas de las permanentes. Si " +
        "aparecen en el medio del articulado, cuesta distinguir qué rige siempre y qué rige sólo " +
        "durante el paso de un régimen a otro.",
      sugerencia: "Mover las disposiciones transitorias al final, antes de la vigencia y del artículo de forma.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-045", "misma detección que la regla provincial; cubre también MUN-041"),
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
      severidad: "media",
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

    {
      id: "er-mun-020",
      titulo: "La vigencia depende de una condición que no se puede verificar",
      descripcion:
        "La cláusula de vigencia existe, pero la hace depender de algo impreciso " +
        '("oportunamente", "cuando corresponda"). Así no se puede saber con certeza desde qué día ' +
        "rige la ordenanza.",
      sugerencia:
        "Usar una fecha, un plazo contado desde un hecho cierto (la promulgación, la publicación) " +
        "o una condición que se pueda comprobar.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-104"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /(vigencia|vigor|regir)[^.]{0,80}?\b(oportunamente|cuando\s+corresponda|en\s+su\s+oportunidad|en\s+su\s+momento|cuando\s+sea\s+posible|una\s+vez\s+que\s+sea\s+posible)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 2, radio: 80 });
      },
    },

    {
      id: "er-mun-021",
      titulo: "Se modifica otra norma sin escribir cómo queda",
      descripcion:
        "Cuando el proyecto modifica, sustituye o incorpora un artículo de otra norma, conviene " +
        "transcribir cómo queda redactado. Si no, para saber qué dice la norma vigente hay que " +
        "reconstruirla de memoria.",
      sugerencia:
        'Usar la fórmula: "Sustitúyese el artículo 5° de la Ordenanza Nº 1.234, el que quedará ' +
        'redactado de la siguiente manera: «ARTÍCULO 5°.- …»".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-083 y MUN-084", "misma detección que la regla provincial"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = soloArticulado(text);
        const partes = cuerpo.split(/(?=art[íi]culo\s+\d+\s*[°ºo]?\s*[.:\-–—])/i);
        // Una derogación no necesita texto nuevo: por eso no está en la lista.
        const verboMod = /\b(modif[íi](c|qu)[aeá]n?se|sustit[úu]y[ae]n?se|incorp[óo]r[ae]n?se)/i;
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
      id: "er-mun-022",
      titulo: "Se reemplaza el texto de otra norma pero sin comillas",
      descripcion:
        "Cuando se transcribe el texto nuevo de una disposición, tiene que quedar claro dónde " +
        "empieza y dónde termina. Sin comillas, no se sabe qué parte es el texto que se incorpora " +
        "y qué parte es el artículo del proyecto.",
      sugerencia: 'Encerrar el texto nuevo entre comillas: "…quedará redactado de la siguiente manera: «…»".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-074 y MUN-084"),
      severidad: "media",
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
      id: "er-mun-023",
      titulo: "Se incorpora una disposición sin decir dónde va",
      descripcion:
        "Una incorporación tiene que indicar en qué lugar de la otra norma se agrega el texto " +
        '("como artículo 5° bis", "como inciso f) del artículo 3°"). Si no, al ordenar la norma ' +
        "no se sabe dónde ubicarlo.",
      sugerencia:
        'Usar la fórmula: "Incorpórase como artículo 5° bis de la Ordenanza Nº 1.234 el siguiente: «…»".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-085"),
      severidad: "media",
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
      id: "er-mun-024",
      titulo: "Varios artículos se sustituyen juntos sin separar el texto de cada uno",
      descripcion:
        "Cuando una misma disposición sustituye o modifica varios artículos, el texto nuevo de " +
        "cada uno tiene que quedar identificado. Si se anuncian tres artículos y el texto " +
        "transcripto trae menos encabezados, no se sabe qué redacción corresponde a cuál.",
      sugerencia:
        "Transcribir cada artículo con su propio encabezado dentro de las comillas, o hacer una " +
        "sustitución por artículo.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-089"),
      severidad: "media",
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
          if (!citado) continue; // sin comillas lo marca er-mun-022
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
      id: "er-mun-025",
      titulo: "Se cambia un monto o un plazo con una cuenta en vez de escribir el valor",
      descripcion:
        'Fórmulas como "auméntase en un 20 % el monto previsto en…" obligan a hacer la cuenta ' +
        "para saber cuál es el valor vigente. Si la intención es dejar un texto permanente, " +
        "conviene escribir directamente el nuevo valor.",
      sugerencia:
        "Sustituir el artículo que fija el monto y transcribirlo con el valor nuevo. La " +
        "herramienta no calcula ese valor.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-090"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(aum[ée]nta|increm[ée]nta|red[úu]ce|dismin[úu]ye|actual[íi]za)n?se\b[^.]{0,120}?(%|por\s+ciento)[^.]{0,120}?(previst|establecid|fijad|dispuest|art[íi]culo|ordenanza)/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 90 });
      },
    },

    {
      id: "er-mun-026",
      titulo: "Se deroga «todo lo que se oponga», sin decir qué",
      descripcion:
        "La derogación debe identificar qué norma se deroga. Una cláusula del tipo " +
        '"deróganse todas las disposiciones que se opongan" no dice nada: traslada al intérprete ' +
        "el trabajo de quien redacta. Se marca siempre, también cuando va pegada a una derogación " +
        'correcta: en <em>«Derógase la Ordenanza Nº 1.234 y toda norma que se oponga»</em> la ' +
        "primera mitad está bien y la segunda sobra. La herramienta no afirma que la cláusula " +
        "carezca de efectos.",
      sugerencia:
        'Identificar cada norma derogada: "ARTÍCULO n°.- Derógase el artículo 8° de la Ordenanza ' +
        'Nº 1.234." Si ya hay una derogación expresa, suprimir la coletilla genérica.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-087 y MUN-088", "misma detección que la regla provincial"),
      severidad: "media",
      check(text, { contexto }) {
        const re =
          /(der[óo]g\w+\s+(todas\s+las|toda)\s+(otras?\s+)?(norma|disposici[óo]n|ley|ordenanza)|(norma|disposici[óo]n|ordenanza)\w*\s+(legal|reglamentaria|municipal)?\s*que\s+se\s+opong\w+|(disposiciones|normas)\s+(que\s+resulten\s+)?contrarias)/gi;
        const ej = [];
        let m;
        while ((m = re.exec(text)) && ej.length < 3) ej.push(contexto(text, m.index, 90));
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-027",
      titulo: "Se deroga una norma sin decir cuál",
      descripcion:
        "La derogación nombra la norma o la disposición derogada por su número. Una derogación " +
        'que la describe ("derógase la ordenanza que regulaba…") obliga a buscar de qué norma se ' +
        "trata.",
      sugerencia: 'Escribir el número: "Derógase el artículo 8° de la Ordenanza Nº 1.234."',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-086"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /\bder[óo]ga(n)?se\b(?:[^.]|\.(?=\d)){0,140}/gi;
        const ej = [];
        let m;
        while ((m = re.exec(cuerpo)) && ej.length < 3) {
          // Sólo interesa lo que se deroga en concreto: la coletilla genérica
          // ("y toda norma que se oponga") la marca er-mun-026.
          const concreto = m[0]
            .split(/,?\s+y\s+(?:toda|todas|dem[áa]s)\b|\s+(?:toda|todas)\s+(?:las?\s+)?(?:otras?\s+)?(?:norma|disposici|ordenanza|ley)/i)[0]
            .replace(/^\S+\s*/, "");
          if (/\d/.test(concreto)) continue; // nombra un número
          if (concreto.trim().split(/\s+/).length < 3) continue; // sólo había fórmula genérica
          ej.push(contexto(text, m.index, 80));
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-028",
      titulo: "Una prórroga no identifica la norma o el nuevo término",
      descripcion:
        "Una prórroga tiene que identificar la norma, la disposición o el plazo que se prorroga, y " +
        "el nuevo término. Si falta uno de los dos, no se sabe qué sigue vigente ni hasta cuándo.",
      sugerencia:
        'Escribir ambos datos: "Prorrógase hasta el 31 de diciembre de 2027 el plazo previsto en el ' +
        'artículo 4° de la Ordenanza Nº 1.234."',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-093"),
      severidad: "media",
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
      id: "er-mun-029",
      titulo: "Una suspensión no identifica la norma o su duración",
      descripcion:
        "Una suspensión tiene que identificar la disposición suspendida y su duración o la " +
        "condición que la termina. La herramienta no juzga si la suspensión es procedente.",
      sugerencia:
        'Escribir ambos datos: "Suspéndese por el término de noventa (90) días la aplicación del ' +
        'artículo 12 de la Ordenanza Nº 1.234."',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-094"),
      severidad: "media",
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

    // =========================================================================
    // CITAS Y REMISIONES
    // =========================================================================
    {
      id: "er-mun-030",
      titulo: 'Se remite a un artículo como "el anterior" o "el siguiente"',
      descripcion:
        'Fórmulas como "el artículo precedente" o "lo dispuesto anteriormente" dejan de funcionar ' +
        "en cuanto se agrega o se quita un artículo. Conviene citar el número.",
      sugerencia: 'Escribir "lo dispuesto en el artículo 4°" en lugar de "lo dispuesto en el artículo anterior".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-078"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(art[íi]culos?|incisos?)\s+(anterior(es)?|precedentes?|siguientes?|que\s+antecede[n]?|ut\s+supra)\b|\blo\s+(dispuesto|establecido|expuesto)\s+(anteriormente|precedentemente|m[áa]s\s+arriba|ut\s+supra)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { radio: 50 });
      },
    },

    {
      id: "er-mun-031",
      titulo: "Se remite a un artículo de esta misma norma que no existe",
      descripcion:
        'El texto cita "el artículo N de la presente" pero la norma no tiene tantos artículos. ' +
        "Suele pasar cuando se agregan o se quitan artículos y no se actualizan las remisiones.",
      sugerencia:
        "Revisar a qué artículo se quiso remitir y corregir el número. La herramienta no lo " +
        "corrige: no puede saber cuál era.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-119"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const arts = encabezadosDeArticulo(cuerpo);
        if (!arts.length) return { cumple: true };
        const maximo = Math.max(...arts.map((a) => a.numero));
        const re =
          /\bart[íi]culos?\s+(\d+)\s*[°º]?\s*(?:,\s*)?(?:de\s+(?:la\s+presente|esta)(?:\s+(?:ordenanza|resoluci[óo]n|norma|decreto))?|de\s+la\s+presente)\b/gi;
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

    {
      id: "er-mun-032",
      titulo: 'Se remite a "la normativa vigente" sin decir cuál',
      descripcion:
        'Una remisión a "la normativa vigente" o "la legislación aplicable" no identifica ninguna ' +
        "norma. La herramienta no comprueba qué normas rigen: sólo avisa que la cita no las nombra.",
      sugerencia: 'Nombrar la norma: "…conforme a la Ordenanza Nº 1.234 de Habilitaciones Comerciales".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-080"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(la\s+)?(normativa|legislaci[óo]n|reglamentaci[óo]n)\s+(vigente|aplicable|correspondiente|pertinente|en\s+la\s+materia)\b|\blas\s+normas\s+(vigentes|aplicables|pertinentes)\b|\bla\s+ley\s+de\s+la\s+materia\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 55 });
      },
    },

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
      severidad: "baja",
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

    {
      id: "er-mun-034",
      titulo: 'Se mezcla "Art." con "Artículo" al citar',
      descripcion:
        'El documento cita artículos de dos maneras: abreviado ("Art. 5") y completo ("artículo 5"). ' +
        "Conviene elegir una sola forma.",
      sugerencia: 'Escribir siempre "artículo" completo al citar.',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-076"),
      severidad: "baja",
      check(text, { contexto }) {
        const abreviado = [...text.matchAll(/\bart\.\s*\d/gi)];
        const completo = [...text.matchAll(/art[íi]culo\s+\d/gi)];
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

    // =========================================================================
    // REDACCIÓN NORMATIVA
    // =========================================================================
    {
      id: "er-mun-035",
      titulo: "Los artículos explican en vez de mandar",
      descripcion:
        "El articulado dispone; la justificación va en el VISTO, el CONSIDERANDO o los " +
        'fundamentos. Expresiones como "considerando que" o "resulta necesario" dentro de un ' +
        "artículo suelen indicar que se coló una explicación.",
      sugerencia:
        "Mover la justificación a los considerandos o a los fundamentos, y dejar en el artículo " +
        'sólo la norma: "ARTÍCULO 1°.- Créase el Programa…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-048", "misma lista de conectores que la regla provincial"),
      severidad: "media",
      check(text, { contexto }) {
        // Sólo el articulado: en el CONSIDERANDO estas frases son correctas.
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(visto que|considerando que|atento a que|toda vez que|dado que|en virtud de que|resulta necesario|es menester|habida cuenta de)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { radio: 85, separacion: 140 });
      },
    },

    {
      id: "er-mun-036",
      titulo: "Hay varios verbos en tiempo futuro",
      descripcion:
        'Las disposiciones se redactan en presente ("el registro funciona…") y no en futuro ("el ' +
        'registro funcionará…"). Sólo se marca cuando el futuro es la forma dominante: una o dos ' +
        "apariciones pueden describir un hecho temporal genuino.",
      sugerencia: 'Pasar los verbos a presente: "el organismo dicta", "el registro funciona".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-049", "misma detección que la regla provincial"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        // "deberá" y "podrá" quedan afuera: son el modo habitual de expresar el
        // mandato y la facultad. El corte de palabra va escrito a mano porque
        // \b no reconoce las vocales acentuadas como letras.
        const re = /(^|[^a-záéíóúñ])((?!deber|poder)[a-záéíóúñ]{3,}(?:ar|er|ir)[áa]n?)(?![a-záéíóúñ])/gi;
        const ej = [];
        const vistos = new Set();
        let m;
        while ((m = re.exec(cuerpo))) {
          const palabra = m[2].toLowerCase();
          if (vistos.has(palabra)) continue;
          vistos.add(palabra);
          if (ej.length < 4) ej.push(contexto(text, m.index + m[1].length, 55));
        }
        if (vistos.size < 6) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

    {
      id: "er-mun-037",
      titulo: 'Se usa "y/o", que deja la duda de si son los dos o uno solo',
      descripcion:
        '"Y/o" es ambigua: no queda claro si exige ambos, uno cualquiera o los dos. Conviene ' +
        "decidirlo al escribir y no dejarlo librado a quien interprete.",
      sugerencia: 'Elegir "y", o "o", o escribir "uno, otro o ambos".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-061", "misma detección que la regla provincial"),
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
      id: "er-mun-038",
      titulo: "Hay una doble negación que puede confundir",
      descripcion:
        'Dos negaciones en la misma frase ("no… sin…") obligan a releer para saber qué se permite ' +
        "y qué se prohíbe.",
      sugerencia:
        'En vez de "no podrán habilitarse sin presentar el certificado", escribir "para ' +
        'habilitarse deben presentar el certificado".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-059", "misma detección que la regla provincial"),
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
      id: "er-mun-039",
      titulo: 'Hay rodeos como "procédase a" en lugar del verbo directo',
      descripcion:
        'Fórmulas como "procédase a crear" o "dispónese que se proceda a" alargan la frase sin ' +
        "agregar nada. La herramienta sólo marca estos rodeos conocidos; no decide qué verbo " +
        "expresa mejor la decisión.",
      sugerencia: 'Usar el verbo directo: "Créase…" en lugar de "Procédase a crear…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-050", "sólo lista cerrada de perífrasis"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(proc[ée]dase\s+a|disp[óo]nese\s+que\s+se\s+proceda|se\s+deber[áa]\s+proceder\s+a|deber[áa]\s+procederse\s+a)/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 3, radio: 55 });
      },
    },

    {
      id: "er-mun-040",
      titulo: 'Se nombra a "la autoridad competente" sin decir cuál es',
      descripcion:
        'Expresiones como "la autoridad competente", "el área correspondiente" o "quien ' +
        'corresponda" no dicen qué organismo tiene que actuar. Si la ordenanza designa una ' +
        '"autoridad de aplicación", la mención a "la autoridad competente" no se marca.',
      sugerencia:
        'Nombrar el organismo ("la Secretaría de Ambiente") o designar una autoridad de aplicación ' +
        "en un artículo y remitir a ella.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-052"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const designa =
          /autoridad\s+de\s+aplicaci[óo]n[^.]{0,60}\b(es|ser[áa]|a\s+la|al|la\s+secretar|el\s+departamento)|des[íi]gnase\s+(como\s+)?autoridad\s+de\s+aplicaci[óo]n|ser[áa]\s+autoridad\s+de\s+aplicaci[óo]n/i.test(
            cuerpo
          );
        const re =
          /\b(la\s+autoridad\s+(competente|que\s+corresponda)|el\s+organismo\s+(correspondiente|competente|pertinente|que\s+corresponda)|el\s+[áa]rea\s+(correspondiente|competente|pertinente)|la\s+(dependencia|repartici[óo]n|secretar[íi]a)\s+(correspondiente|competente|pertinente)|quien\s+corresponda)\b/gi;
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
      id: "er-mun-041",
      titulo: "Se define un término que después no se usa",
      descripcion:
        "La norma define un término (\"se entiende por…\") que no vuelve a aparecer en el resto del " +
        "texto. O la definición sobra, o el articulado usa otra palabra para lo mismo. La " +
        "herramienta no evalúa si la definición es correcta.",
      sugerencia: "Quitar la definición, o usar el término definido en los artículos que corresponda.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-054", "sólo términos definidos que no vuelven a usarse"),
      severidad: "baja",
      check(text, { normalizar, contexto }) {
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

    {
      id: "er-mun-042",
      titulo: 'Un plazo en "días" no aclara si son hábiles o corridos',
      descripcion:
        'Un plazo expresado sólo en "días" puede leerse como hábiles o como corridos, y la ' +
        "diferencia cambia la fecha de vencimiento. La herramienta no decide cuál corresponde: " +
        "sólo avisa que el texto no lo dice.",
      sugerencia:
        'Aclarar el tipo de días: "dentro de los treinta (30) días hábiles", o agregar un artículo ' +
        'general: "Los plazos de la presente ordenanza se computan en días hábiles administrativos".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-064"),
      severidad: "media",
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
      id: "er-mun-043",
      titulo: 'Hay una fecha imprecisa como "a la brevedad" o "el corriente año"',
      descripcion:
        'Expresiones como "a la brevedad", "próximamente" o "el corriente año" dependen de cuándo ' +
        "se lea la norma. Dentro de una disposición conviene una fecha, un plazo o una condición " +
        "que se pueda verificar.",
      sugerencia:
        'Escribir la fecha ("el 31 de diciembre de 2026") o un plazo contado desde un hecho cierto ' +
        '("dentro de los sesenta (60) días de la promulgación").',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-065"),
      severidad: "media",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\ba\s+la\s+brevedad\b|\ben\s+breve\b|\bpr[óo]ximamente\b|\b(del|el|al|este)\s+(corriente|presente)\s+(a[ñn]o|mes)\b|\b(del|el|al)\s+(pr[óo]ximo\s+(a[ñn]o|mes)|(a[ñn]o|mes)\s+pr[óo]ximo|a[ñn]o\s+en\s+curso)\b|\beste\s+(a[ñn]o|mes)\b/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 55 });
      },
    },

    {
      id: "er-mun-044",
      titulo: "Hay palabras en otro idioma que tienen equivalente en castellano",
      descripcion:
        "El texto usa un término extranjero que tiene un equivalente castellano claro. No aplica " +
        "a términos técnicos cuya traducción cambiaría el significado.",
      sugerencia: 'Usar el equivalente castellano, o definirlo la primera vez: "…el sitio de destino (<em>landing page</em>)…".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-057", "misma lista cerrada que la regla provincial"),
      severidad: "baja",
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
          ejemplos: encontradas.slice(0, 4).map((e) => `"${e.palabra}" en: "${contexto(text, e.index, 45)}"`),
        };
      },
    },

    // =========================================================================
    // ORTOTIPOGRAFÍA Y FORMATO
    // =========================================================================
    {
      id: "er-mun-045",
      titulo: "Hay una sigla que nunca se explica",
      descripcion:
        "La primera vez que aparece una sigla conviene escribir la denominación completa seguida " +
        "de la sigla entre paréntesis. Después ya se puede usar sola.",
      sugerencia:
        'La primera vez escribir "el Departamento Ejecutivo Municipal (DEM)"; en el resto del ' +
        'texto, "el DEM".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-067", "misma detección que la regla provincial"),
      severidad: "baja",
      check(text, { normalizar, contexto }) {
        const IGNORAR = new Set([
          "LEY", "ARTICULO", "ARTÍCULO", "TITULO", "TÍTULO", "CAPITULO", "CAPÍTULO",
          "SECCION", "SECCIÓN", "ANEXO", "DECRETO", "ORDENANZA", "RESOLUCION", "RESOLUCIÓN",
          "COMUNICACION", "COMUNICACIÓN", "DECLARACION", "DECLARACIÓN", "PROYECTO",
          "VISTO", "CONSIDERANDO", "POR", "ELLO", "TODO", "TANTO", "CONCEJO", "DELIBERANTE",
          "HONORABLE", "MUNICIPALIDAD", "MUNICIPIO", "MUNICIPAL", "CIUDAD", "DEPARTAMENTO",
          "EJECUTIVO", "PODER", "PROVINCIA", "PROVINCIAL", "ENTRE", "RIOS", "RÍOS", "SANCIONA",
          "SANCIONAN", "ORDENA", "RESUELVE", "DECRETA", "FUERZA", "FUNDAMENTOS", "SALA",
          "SESIONES", "COMUNIQUESE", "COMUNÍQUESE", "REGISTRESE", "REGÍSTRESE", "PUBLIQUESE",
          "PUBLÍQUESE", "ARCHIVESE", "ARCHÍVESE", "PRESENTE", "NACION", "NACIÓN", "NACIONAL",
          "CONSTITUCION", "CONSTITUCIÓN", "SIGUIENTE", "DISPOSICIONES", "TRANSITORIAS",
          "GENERALES", "UNICO", "ÚNICO", "PARANA", "PARANÁ", "CONCORDIA", "GUALEGUAYCHU",
          "GUALEGUAYCHÚ", "URUGUAY", "CONCEPCION", "CONCEPCIÓN",
        ]);
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
      id: "er-mun-046",
      titulo: "Una misma sigla se explica de dos maneras",
      descripcion:
        "La misma sigla aparece desarrollada con dos denominaciones distintas. Quien lee no sabe " +
        "si se trata del mismo organismo o de dos diferentes.",
      sugerencia: "Unificar la denominación completa y usarla una sola vez, en la primera aparición.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-119"),
      severidad: "media",
      check(text, { normalizar, contexto }) {
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
      id: "er-mun-047",
      titulo: "La cifra en letras no coincide con el número",
      descripcion:
        "El texto escribe una cantidad en letras y otra distinta entre paréntesis. Las dos formas " +
        "tienen el mismo valor, así que la diferencia genera un conflicto real de interpretación.",
      sugerencia:
        "Revisión humana: hay que verificar cuál de las dos cifras es la correcta. La herramienta " +
        "no puede decidirlo, porque depende de qué quiso disponer quien redactó.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-069", "misma detección que la regla provincial"),
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
          if (MULTIPLICADORES.has(letras[0])) continue;
          ej.push(`Dice "${letras.join(" ")}" pero el número es ${cifra}: "${contexto(text, m.index, 60)}"`);
        }
        if (!ej.length) return { cumple: true };
        return { cumple: false, ejemplos: ej };
      },
    },

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
      severidad: "baja",
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
      severidad: "baja",
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
      severidad: "baja",
      check(text, { contexto }) {
        const re = /\b\d+(?:[.,]\d+)?\s*(kms|kgs|mts|mt|lts|lt|hs|hrs|hr|grs|cms|km\.|kg\.)(?![a-záéíóúñ])/gi;
        return citarCoincidencias(text, text, re, contexto, { maximo: 4, radio: 35, separacion: 60 });
      },
    },

    {
      id: "er-mun-051",
      titulo: "Hay abreviaturas que conviene escribir completas",
      descripcion:
        'En el articulado conviene evitar abreviaturas como "Nro.", "Gral.", "Sr." o "Expte.": se ' +
        "leen peor y no siempre se usan igual en todo el texto.",
      sugerencia: 'Escribir la palabra completa: "número", "General", "señor", "expediente".',
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-066"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re =
          /\b(nro|depto|dpto|pcia|gral|tel|ej|expte|sr|sra|dr|dra|ing|arq|prof)\.(?=\s)|\s[cs]\/\s/gi;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 40, separacion: 60 });
      },
    },

    {
      id: "er-mun-052",
      titulo: "Hay signos de puntuación repetidos",
      descripcion:
        'Signos duplicados como ",,", "::" o ";;" son errores de tipeo que conviene corregir. En ' +
        "textos escaneados pueden venir del reconocimiento de caracteres: comparar con el original.",
      sugerencia: "Dejar un solo signo.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-073"),
      severidad: "baja",
      check(text, { contexto }) {
        const cuerpo = cuerpoNormativo(text);
        const re = /,\s*,|;\s*;|:\s*:|\.{4,}|\?{2,}|!{2,}/g;
        return citarCoincidencias(text, cuerpo, re, contexto, { maximo: 4, radio: 35, separacion: 60 });
      },
    },

    {
      id: "er-mun-053",
      titulo: "Mezcla de tipos de comillas",
      descripcion:
        "En los textos que sustituyen o incorporan disposiciones, las comillas delimitan " +
        "exactamente qué es texto nuevo, así que conviene que sean siempre las mismas.",
      sugerencia: "Unificar el tipo de comillas en todo el documento.",
      autoridad: "SUBSIDIARIO",
      fuente: fuente("MUN-074", "misma detección que la regla provincial"),
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
  ];
})();
