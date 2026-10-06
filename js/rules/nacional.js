/**
 * Reglas de técnica legislativa — ámbito NACIONAL.
 *
 * Basadas en:
 *  - "Manual de Técnica Legislativa" (Digesto Jurídico Argentino / infoleg.gob.ar)
 *    -> docs/fuentes/nacional/MANUAL DE TÉCNICA LEGISLATIVA.pdf
 *  - "Técnica Legislativa: Marco Teórico" (Grosso, B. M. y Svetaz, M. A.)
 *    -> docs/fuentes/nacional/TECNICA LEGISLATIVA. MARCO TEÓRICO (1).pdf
 *
 * Cada regla tiene: una descripción en lenguaje simple, la cita exacta de la
 * fuente (para quien quiera verificarla), y un ejemplo concreto de cómo
 * debería quedar el texto. Son heurísticas: pueden fallar en casos límite y
 * no reemplazan la lectura humana.
 *
 * Acá están sólo las reglas propias del ámbito nacional. Las que valen igual en
 * los tres ámbitos están en comunes.js y se agregan al final con
 * ReglasComunes.para("nacional"). La prioridad de cada aviso sale de
 * prioridades.js y es la misma en los tres ámbitos.
 *
 * IMPORTANTE: `titulo`, `descripcion` y `sugerencia` se insertan como HTML
 * (así se puede usar <em> para mostrar bastardilla, etc.). Son texto fijo
 * escrito acá, nunca texto del documento del usuario. Lo que sí viene del
 * documento subido es `ejemplos` (dentro de check()), y eso se escapa aparte
 * en app.js — nunca pongas fragmentos del documento en `sugerencia` o
 * `descripcion` sin pasarlos por esa misma protección.
 */

window.ReglasNacional = [
  {
    id: "nac-001",
    titulo: "Falta la fórmula de sanción al inicio",
    descripcion:
      "Antes del primer artículo, toda ley debe tener una frase fija que indica quién la está " +
      "aprobando. Es el encabezado oficial de la ley.",
    sugerencia:
      'Agregar al principio, antes del "Artículo 1°": "El Senado y Cámara de Diputados de la Nación ' +
      'Argentina, reunidos en Congreso, sancionan con fuerza de Ley:"',
    fuente: "Manual de Técnica Legislativa, regla 41.d — Constitución Nacional, art. 84",
    ubicacionFija: "Al inicio, antes del Artículo 1°",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const cumple = /sancionan con fuerza de ley|decretan con fuerza de ley/.test(t);
      if (cumple) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [`El documento empieza así: "${contexto(text, 0, 70)}" — ahí falta esa frase.`],
      };
    },
  },

  {
    id: "nac-003",
    titulo: "Falta la frase final que cierra la ley",
    descripcion:
      "Después del último artículo con contenido, debe haber una frase que indique que la ley " +
      "terminó y pasa al Poder Ejecutivo para publicarse.",
    sugerencia:
      'Agregar como último artículo algo como: "Artículo 10.- Comuníquese al Poder Ejecutivo." ' +
      'También es válido titular ese último artículo "De forma" seguido de la fórmula que corresponda.',
    fuente: 'Manual de Técnica Legislativa, regla 17.1.c — "artículo de forma"',
    ubicacionFija: "Al final, después del último artículo",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const cumple =
        /comuniquese al poder ejecutivo/.test(t) ||
        /art[íi]culo\s+\d+[°ºo]?\.?\s*-?\s*de\s+forma\s*-?\.?/i.test(text);
      if (cumple) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [`El documento termina así: "${contexto(text, text.length - 1, 80)}" — ahí falta esa frase.`],
      };
    },
  },

  {
    id: "nac-005",
    titulo: "Hay un artículo demasiado largo",
    descripcion:
      "Cada artículo debería tratar una sola idea. Si un artículo mezcla varios temas o es muy " +
      "extenso, conviene separarlo en artículos distintos.",
    sugerencia:
      "Dividir el artículo en dos o más artículos cortos, cada uno con una sola idea (por ejemplo, " +
      "uno para la definición, otro para la obligación, otro para la sanción).",
    fuente: "Manual de Técnica Legislativa, regla 9, puntos 2 y 3",
    check(text) {
      const bloques = text
        .split(/(?=art[íi]culo\s+\d+\s*(?:bis|ter|quater)?\b|anexo\b)/gi)
        .filter((b) => /^art[íi]culo/i.test(b.trim()));
      const largos = [];
      for (const bloque of bloques) {
        const palabras = bloque.trim().split(/\s+/).length;
        if (palabras > 250) {
          const encabezado = bloque.trim().slice(0, 60).replace(/\s+/g, " ");
          largos.push(`"${encabezado}..." tiene ~${palabras} palabras.`);
        }
      }
      return { cumple: largos.length === 0, ejemplos: largos.slice(0, 5) };
    },
  },

  {
    id: "nac-006",
    titulo: "No queda claro desde cuándo se aplica la ley",
    descripcion:
      "Si el texto no dice explícitamente cuándo empieza a tener efecto, no queda un vacío: se " +
      "aplica automáticamente el artículo 5° del Código Civil y Comercial, que establece que la ley " +
      "entra en vigencia a los ocho (8) días de su publicación oficial, salvo que la propia ley " +
      "indique otra cosa. Conviene decidir a propósito si eso es lo que se quiere, o poner una fecha distinta.",
    sugerencia:
      'Si el plazo de ocho días no es lo que se busca, agregar una frase como: "Esta ley entra en ' +
      'vigencia a partir de su publicación en el Boletín Oficial" (o la fecha/condición que corresponda). ' +
      "Si el plazo general sí es lo que se quiere, se puede dejar así sin problema.",
    fuente: "Código Civil y Comercial de la Nación, art. 5°",
    ubicacionFija: "Al final, junto a las disposiciones finales",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      // En cualquier tiempo y número: "entra en vigencia", "entrarán en vigor",
      // "rigen desde", "comienza a regir". Una cláusula que no fija el momento
      // ("regirá oportunamente") no cuenta: ahí rige el plazo general del art. 5°.
      const cumple =
        /\bentra(n|ra|ran)?\s+en\s+(vigencia|vigor)|\bentrada\s+en\s+(vigencia|vigor)|\bvigencia\s+a\s+partir|\b(rige|rigen|regira|regiran)\s+(a\s+partir|desde)|\b(comienza|comenzara|empieza|empezara)n?\s+a\s+regir|\btendran?\s+vigencia\s+(a\s+partir|desde)/.test(
          t
        );
      if (cumple) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [
          `El documento termina así: "${contexto(text, text.length - 1, 80)}" — no se aclara la vigencia, ` +
            "por lo que regirá el plazo general de ocho días desde la publicación (Código Civil y Comercial, art. 5°).",
        ],
      };
    },
  },

  {
    id: "nac-013",
    titulo: "Hay una fecha con el año escrito con solo dos números",
    descripcion:
      "Las fechas deben escribirse con el año completo, de cuatro cifras, para que no haya dudas " +
      "sobre a qué año se refieren.",
    sugerencia: 'Escribir "12/6/1987" en vez de "12/6/87".',
    fuente: "Manual de Técnica Legislativa, regla 40, punto 1",
    check(text) {
      const fechasCortas = text.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b(?!\d)/g) || [];
      return {
        cumple: fechasCortas.length === 0,
        ejemplos: fechasCortas.slice(0, 5).map((f) => `"${f}" — falta completar el año a cuatro cifras.`),
      };
    },
  },

  {
    id: "nac-014",
    titulo: "Faltan los subtítulos de los artículos",
    descripcion:
      "Cada artículo debería tener un subtítulo muy corto, entre guiones y en cursiva (bastardilla), " +
      "justo después del número, que resuma de qué trata. Esto ayuda a encontrar rápido cada tema.",
    sugerencia: 'Ejemplo correcto (el epígrafe va en cursiva): "Artículo 3° -<em>Vigencia</em>- Esta ley entra en vigencia..."',
    fuente: "Manual de Técnica Legislativa, regla 9, punto 5",
    check(text, { contexto }) {
      const articulos = [...text.matchAll(/art[íi]culo\s+\d+[°ºo]?/gi)];
      if (articulos.length === 0) return { cumple: true };
      const sinEpigrafe = [];
      for (const m of articulos) {
        const despues = text.slice(m.index + m[0].length, m.index + m[0].length + 80);
        if (!/^\s*-[^-]{2,60}-/.test(despues)) {
          sinEpigrafe.push(m);
        }
      }
      const proporcion = (articulos.length - sinEpigrafe.length) / articulos.length;
      if (proporcion >= 0.5) return { cumple: true };
      return {
        cumple: false,
        ejemplos: sinEpigrafe
          .slice(0, 5)
          .map((m) => `Sin subtítulo: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-016",
    titulo: "El título no avisa que esta norma modifica otra ley",
    descripcion:
      "Si el texto principalmente modifica, sustituye o deroga una ley anterior, el título debería " +
      "decirlo y nombrar esa ley. Así, quien lee el título ya sabe de qué se trata sin tener que leer todo.",
    sugerencia: 'En vez de un título genérico, escribir algo como: "Ley N° 25.087. Modificación de la Ley N° 20.429."',
    fuente: "Manual de Técnica Legislativa, regla 6, punto 1",
    ubicacionFija: "En el título de la norma",
    check(text, { normalizar }) {
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      if (primerArticulo <= 0) return { cumple: true };
      const cuerpo = normalizar(text.slice(primerArticulo));
      const modificaCuerpo = /\b(modific|sustituy|deroga|abroga)/.test(cuerpo);
      if (!modificaCuerpo) return { cumple: true };
      const titulo = normalizar(text.slice(0, primerArticulo));
      const tituloAvisa = /\b(modific|sustituy|deroga|abroga)/.test(titulo);
      return {
        cumple: tituloAvisa,
        ejemplos: tituloAvisa
          ? []
          : [`El título es: "${text.slice(0, primerArticulo).trim().slice(0, 80)}" — no menciona que modifica otra norma.`],
      };
    },
  },

  {
    id: "nac-017",
    titulo: "Un texto largo sin sumario al principio",
    descripcion:
      "Cuando la norma tiene muchos artículos, conviene poner antes de ellos una lista corta " +
      "(sumario) con el subtítulo de cada uno, para ubicarse rápido.",
    sugerencia: 'Agregar antes del Artículo 1° una lista tipo: "Artículo 1°. Objeto. — Artículo 2°. Definiciones. — ..."',
    fuente: "Manual de Técnica Legislativa, regla 2, punto 1",
    ubicacionFija: "Al inicio, antes del Artículo 1°",
    check(text, { normalizar }) {
      const cantidadArticulos = (text.match(/art[íi]culo\s+\d+/gi) || []).length;
      if (cantidadArticulos < 15) return { cumple: true };
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      const antes = primerArticulo > 0 ? normalizar(text.slice(0, primerArticulo)) : "";
      const tieneSumario = /\bsumario\b|\bindice\b/.test(antes);
      return {
        cumple: tieneSumario,
        ejemplos: tieneSumario
          ? []
          : [`El documento tiene ${cantidadArticulos} artículos y no se encontró un sumario o índice antes del Artículo 1°.`],
      };
    },
  },

  {
    id: "nac-018",
    titulo: "El título es demasiado largo",
    descripcion: "El título de la norma debería ser breve — una frase corta, no un párrafo.",
    sugerencia: 'Acortar el título a una frase breve, por ejemplo: "Ley de Creación del Registro Nacional de Ejemplo".',
    fuente: "Manual de Técnica Legislativa, regla 3, punto 1",
    ubicacionFija: "En el título de la norma",
    check(text) {
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      if (primerArticulo <= 0) return { cumple: true };
      // El título termina antes de la fórmula de sanción (si existe); si no, antes del Artículo 1°.
      let limite = primerArticulo;
      const formula = text.slice(0, primerArticulo).search(/sancionan con fuerza de ley|decretan con fuerza de ley/i);
      if (formula >= 0) limite = formula;
      const titulo = text.slice(0, limite).trim();
      const palabras = titulo.split(/\s+/).filter(Boolean).length;
      return {
        cumple: palabras <= 25,
        ejemplos: palabras > 25 ? [`El título tiene ${palabras} palabras: "${titulo.slice(0, 90)}..."`] : [],
      };
    },
  },

  {
    id: "nac-019",
    titulo: "Un capítulo, título o sección sin subtítulo",
    descripcion:
      'Las divisiones más grandes que el artículo (como "Capítulo", "Título" o "Sección") también ' +
      "necesitan un subtítulo corto que diga de qué tratan, igual que los artículos.",
    sugerencia: 'Ejemplo correcto: "CAPÍTULO I — Disposiciones generales"',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 4",
    check(text, { contexto }) {
      const divisiones = [...text.matchAll(/\b(cap[íi]tulo|t[íi]tulo|secci[óo]n)\s+([ivxlcdm]+|\d+|[a-z]\b)/gi)];
      if (divisiones.length === 0) return { cumple: true };
      const sinSubtitulo = [];
      for (const m of divisiones) {
        const despues = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
        // Se considera que tiene subtítulo si a continuación, en la MISMA línea, hay texto corto.
        const primeraLinea = despues.split(/\n/)[0].trim();
        if (primeraLinea.length < 3 || primeraLinea.length > 80) {
          sinSubtitulo.push(m);
        }
      }
      const proporcion = (divisiones.length - sinSubtitulo.length) / divisiones.length;
      return {
        cumple: proporcion >= 0.5,
        ejemplos: sinSubtitulo.slice(0, 5).map((m) => `Sin subtítulo claro: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-022",
    titulo: 'Se usa "el mismo/éste" para referirse a algo ya nombrado',
    descripcion:
      'En vez de repetir el nombre exacto de lo que se está regulando, el texto usa palabras como ' +
      '"el mismo", "la misma", "éste", "ésta" o "dicho/dicha" para referirse hacia atrás. Esto genera ' +
      "dudas sobre a qué se refiere exactamente, sobre todo si la ley se modifica después.",
    sugerencia:
      'En vez de "...y el mismo deberá presentarse...", repetir el término: "...y el Registro deberá presentarse..."',
    fuente: "Manual de Técnica Legislativa, regla 34, punto 1",
    check(text, { contexto }) {
      const patron = /\b(el mismo|la misma|los mismos|las mismas|éste|ésta|dicho|dicha)\b/gi;
      const encontrados = [...text.matchAll(patron)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${contexto(text, m.index, 45)}"`),
      };
    },
  },

  {
    id: "nac-025",
    titulo: "Hay puntos suspensivos en una cita",
    descripcion:
      "Dentro de una cita textual (entre comillas) o al modificar el texto de otra ley, deben " +
      "evitarse los puntos suspensivos.",
    sugerencia: "Transcribir la cita completa, o cortarla de otra forma que no use puntos suspensivos.",
    fuente: "Manual de Técnica Legislativa, regla 41.d",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/"[^"]{0,200}\.\.\.[^"]{0,200}"/g)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-026",
    titulo: "Hay una frase demasiado larga",
    descripcion:
      "Las frases deben ser breves y simples. Una frase muy larga, con muchas ideas encadenadas, es " +
      "más difícil de entender y de aplicar correctamente.",
    sugerencia: "Cortar la frase en dos o más oraciones más cortas, cada una con una sola idea.",
    fuente: "Manual de Técnica Legislativa, regla 18, punto 1",
    check(text) {
      const frases = text.split(/(?<=[.;])\s+/);
      const largas = [];
      for (const frase of frases) {
        const palabras = frase.trim().split(/\s+/).length;
        if (palabras > 90) {
          largas.push(`"${frase.trim().slice(0, 70).replace(/\s+/g, " ")}..." tiene ~${palabras} palabras.`);
        }
      }
      return { cumple: largas.length === 0, ejemplos: largas.slice(0, 4) };
    },
  },

  {
    id: "nac-028",
    titulo: "Se cita una ley externa sin decir dónde se publicó",
    descripcion:
      "La primera vez que se nombra una ley distinta de esta (por número), conviene indicar entre " +
      "paréntesis dónde y cuándo se publicó (Boletín Oficial), para poder verificarla.",
    sugerencia: 'Agregar la referencia completa la primera vez: "Ley N° 24.240 (B.O. 15/10/93)".',
    fuente: "Manual de Técnica Legislativa, regla 45, punto 2",
    check(text, { contexto }) {
      // Solo se consideran citas a OTRAS leyes: las que aparecen en el articulado.
      // El número de la propia norma, en el encabezado, no es una cita externa.
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      const desde = primerArticulo > 0 ? primerArticulo : 0;
      const cuerpo = text.slice(desde);
      const citas = [...cuerpo.matchAll(/\bley\s+n?[°ºo]?\.?\s*\d{1,3}(?:[.,]\d{3})*\b/gi)];
      if (citas.length === 0) return { cumple: true };
      const sinPublicacion = citas
        .map((m) => ({ ...m, index: m.index + desde }))
        .filter((m) => {
          const alrededor = text.slice(m.index, m.index + 60);
          return !/b\.?\s*o\.?/i.test(alrededor);
        });
      return {
        cumple: sinPublicacion.length === 0,
        ejemplos: sinPublicacion.slice(0, 4).map((m) => `"${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-029",
    titulo: 'Se abusa de "y/o" y otras muletillas jurídicas',
    descripcion:
      'Frases como "sin perjuicio de lo cual" o "en lo que respecta a" repetidas muchas veces ' +
      "alargan el texto sin necesidad. Conviene ir directo a la disposición.",
    sugerencia: "Reformular la frase de manera más directa, sacando la muletilla.",
    fuente: "Manual de Técnica Legislativa, regla 18, punto 1 (brevedad)",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const patrones = [/sin perjuicio de lo cual/g, /en lo que respecta a/g, /a los efectos de lo dispuesto/g];
      const encontrados = [];
      for (const patron of patrones) {
        for (const m of t.matchAll(patron)) encontrados.push(m);
      }
      return {
        cumple: encontrados.length < 3,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-032",
    titulo: 'Se cita un inciso como "el último" o "el penúltimo"',
    descripcion:
      'Para referirse a un inciso hay que decir su número exacto, no su posición relativa ("el ' +
      'último inciso", "el penúltimo"): si después se agrega o saca un inciso, esa referencia deja ' +
      "de tener sentido.",
    sugerencia: 'En vez de "conforme al último inciso del artículo 5°", escribir "conforme al inciso 4° del artículo 5°".',
    fuente: "Manual de Técnica Legislativa, regla 46, punto 1",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const encontrados = [...t.matchAll(/\b(ultimo|penultimo|ultimos? dos)\s+incisos?\b/g)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${contexto(text, m.index, 45)}"`),
      };
    },
  },

  {
    id: "nac-033",
    titulo: 'Se cita una ley "y sus modificatorias" sin nombrarlas',
    descripcion:
      "Cuando se menciona una ley que fue modificada varias veces, conviene nombrar esas " +
      'modificaciones (al menos la primera vez), en vez de solamente decir "y sus modificatorias".',
    sugerencia: 'En vez de "la Ley 24.240 y sus modificatorias", escribir "la Ley 24.240, modificada por las Leyes 26.361 y 26.993".',
    fuente: "Manual de Técnica Legislativa, regla 52, punto 1",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const encontrados = [...t.matchAll(/y\s+sus\s+modificatorias/g)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${contexto(text, m.index, 45)}"`),
      };
    },
  },

  {
    id: "nac-034",
    titulo: 'Se usan juntas las palabras "deroga" y "sustituye"',
    descripcion:
      "Cuando un artículo reemplaza el texto de otro (lo sustituye), no hace falta —y puede " +
      'confundir— decir además que lo "deroga". Sustituir ya implica que el texto anterior deja de regir.',
    sugerencia: 'Usar solamente "sustitúyese": "Sustitúyese el artículo 5° de la Ley X por el siguiente: ..." sin agregar "derógase" para lo mismo.',
    fuente: "Manual de Técnica Legislativa, regla 63, punto 1",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const m =
        t.match(/deroga[a-z]*\s+y\s+sustituy[a-z]*/) || t.match(/sustituy[a-z]*\s+y\s+deroga[a-z]*/);
      if (!m) return { cumple: true };
      return { cumple: false, ejemplos: [`"${contexto(text, m.index, 45)}"`] };
    },
  },

  {
    id: "nac-036",
    titulo: "Un anexo sin título que diga qué contiene",
    descripcion:
      'Cada anexo debe llevar, además de su identificación ("Anexo I"), un título corto que informe ' +
      "de qué trata, para que se sepa qué hay adentro sin tener que leerlo entero.",
    sugerencia: 'Ejemplo correcto: "ANEXO A — Listado de actividades comprendidas (artículo 5°)".',
    fuente: "Manual de Técnica Legislativa, regla 13, punto 1",
    check(text, { contexto }) {
      const anexos = [...text.matchAll(/\banexo\s+([ivxlcdm]+|[a-z]|\d+)\b/gi)];
      if (anexos.length === 0) return { cumple: true };
      const sinTitulo = anexos.filter((m) => {
        const despues = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
        const primeraLinea = despues.split(/\n/)[0].trim().replace(/^[—\-:.]+\s*/, "");
        return primeraLinea.length < 3;
      });
      return {
        cumple: sinTitulo.length === 0,
        ejemplos: sinTitulo.slice(0, 3).map((m) => `Sin título: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-041",
    titulo: "El título usa palabras que después no aparecen en el texto",
    descripcion:
      "Las palabras del título deben ser las mismas que se usan en los artículos para referirse a " +
      "lo mismo. Si el título habla de algo que después el texto nombra de otra forma, confunde.",
    sugerencia: 'Si el título dice "Registro Nacional de Ejemplo", los artículos deben llamarlo igual, no "el padrón" o "la base de datos".',
    fuente: "Manual de Técnica Legislativa, regla 4, punto 1",
    ubicacionFija: "En el título de la norma",
    check(text, { normalizar }) {
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      if (primerArticulo <= 0) return { cumple: true };
      const titulo = normalizar(text.slice(0, primerArticulo));
      const cuerpo = normalizar(text.slice(primerArticulo));
      const IGNORAR = new Set([
        "ley", "leyes", "decreto", "proyecto", "nacional", "nacionales", "presente",
        "sobre", "para", "entre", "desde", "hasta", "segun", "contra", "senado",
        "camara", "diputados", "congreso", "argentina", "nacion", "republica", "articulo",
      ]);
      const palabrasTitulo = [...new Set((titulo.match(/\b[a-zñ]{6,}\b/g) || []))].filter((p) => !IGNORAR.has(p));
      if (palabrasTitulo.length === 0) return { cumple: true };
      const aparecen = palabrasTitulo.filter((p) => new RegExp(`\\b${p}`).test(cuerpo));
      return {
        cumple: aparecen.length > 0,
        ejemplos:
          aparecen.length > 0
            ? []
            : [`Ninguna palabra clave del título (${palabrasTitulo.slice(0, 4).join(", ")}) aparece en el texto de los artículos.`],
      };
    },
  },

  {
    id: "nac-043",
    titulo: "Un título de sección está numerado con números comunes",
    descripcion:
      'Las divisiones llamadas "Título" se numeran con números romanos (I, II, III), no con números ' +
      "comunes (1, 2, 3).",
    sugerencia: 'Escribir "TÍTULO II" en vez de "TÍTULO 2".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 5",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\bt[íi]tulo\s+\d+\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-046",
    titulo: "Hay unidades de medida o dinero abreviadas",
    descripcion:
      'Las unidades de medida y de dinero se escriben completas en el texto ("kilómetros", "pesos"), ' +
      "no con símbolos o abreviaturas. Los símbolos se reservan para tablas y listados.",
    sugerencia: 'Escribir "cincuenta (50) kilómetros" en vez de "50 km", y "pesos cincuenta mil ($ 50.000)" indicando la moneda completa.',
    fuente: "Manual de Técnica Legislativa, regla 42, punto 1",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\b\d+\s*(km|kg|mts?|lts?|hs|m2|m3)\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-048",
    titulo: "Se aprueba un tratado pero el título no lo menciona",
    descripcion:
      "Cuando una ley aprueba un tratado, convenio o acuerdo internacional, el título debe decirlo y " +
      "nombrarlo, para que se identifique sin leer el articulado.",
    sugerencia: 'Titular la norma, por ejemplo: "Aprobación del Tratado de Asunción para la constitución del MERCOSUR".',
    fuente: "Manual de Técnica Legislativa, regla 5, punto 1",
    ubicacionFija: "En el título de la norma",
    check(text, { normalizar }) {
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      if (primerArticulo <= 0) return { cumple: true };
      const cuerpo = normalizar(text.slice(primerArticulo));
      const apruebaTratado = /apru[ée]base\s+(el|la)\s+(tratado|convenio|convenci[oó]n|protocolo|acuerdo)/.test(cuerpo);
      if (!apruebaTratado) return { cumple: true };
      const titulo = normalizar(text.slice(0, primerArticulo));
      const tituloLoMenciona = /(tratado|convenio|convenci[oó]n|protocolo|acuerdo)/.test(titulo);
      return {
        cumple: tituloLoMenciona,
        ejemplos: tituloLoMenciona
          ? []
          : ["El texto aprueba un tratado o convenio, pero el título no lo menciona."],
      };
    },
  },

  {
    id: "nac-049",
    titulo: "Falta el signo de dos puntos antes del texto que se incorpora",
    descripcion:
      'Cuando se reemplaza el texto de otra norma, la frase que lo introduce ("...por el siguiente") ' +
      "termina con dos puntos, y recién ahí va el texto nuevo.",
    sugerencia: 'Escribir "...por el siguiente:" y después el texto entre comillas.',
    fuente: "Manual de Técnica Legislativa, regla 41.b",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const encontrados = [...t.matchAll(/por el siguiente/g)].filter((m) => {
        const despues = t.slice(m.index + m[0].length, m.index + m[0].length + 12);
        return !/^\s*:/.test(despues);
      });
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${contexto(text, m.index, 50)}"`),
      };
    },
  },

  {
    id: "nac-050",
    titulo: "Una sección está numerada con números romanos",
    descripcion:
      'Las secciones se numeran con ordinales abreviados (1ª, 2ª, 3ª), no con números romanos ni ' +
      "con números comunes.",
    sugerencia: 'Escribir "Sección 1ª" en vez de "Sección I" o "Sección 1".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 5",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\bsecci[óo]n\s+([ivxlcdm]+|\d+)(?![ªa°])\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-051",
    titulo: "Un capítulo está numerado con números comunes",
    descripcion:
      "Los capítulos se numeran con números romanos (I, II, III) o con ordinales escritos en letras " +
      '("capítulo primero"), no con números comunes.',
    sugerencia: 'Escribir "CAPÍTULO II" en vez de "CAPÍTULO 2".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 5",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\bcap[íi]tulo\s+\d+\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-052",
    titulo: "Los capítulos no están numerados en orden",
    descripcion:
      "Igual que los artículos, las divisiones del mismo nivel (capítulos, títulos) tienen que ir " +
      "numeradas en forma continua, sin saltos ni repeticiones.",
    sugerencia: 'Corregir la numeración para que sea continua: "CAPÍTULO I", "CAPÍTULO II", "CAPÍTULO III".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 5",
    check(text) {
      const ROMANOS = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
      const encontrados = [...text.matchAll(/\bcap[íi]tulo\s+([ivx]+)\b/gi)];
      if (encontrados.length < 2) return { cumple: true };
      const numeros = encontrados.map((m) => ROMANOS[m[1].toLowerCase()]).filter((n) => n !== undefined);
      const problemas = [];
      for (let i = 0; i < numeros.length; i++) {
        if (numeros[i] !== i + 1) {
          problemas.push(`Se esperaba el capítulo ${i + 1} pero se encontró "${encontrados[i][0]}".`);
        }
      }
      return { cumple: problemas.length === 0, ejemplos: problemas.slice(0, 4) };
    },
  },

  {
    id: "nac-053",
    titulo: "Los números de artículo no usan el formato correcto",
    descripcion:
      'Del artículo 1 al 9 se escribe con el signo de ordinal ("Artículo 1°", "Artículo 9°"), y del ' +
      '10 en adelante sin ese signo ("Artículo 10", "Artículo 25").',
    sugerencia: 'Escribir "Artículo 3°" (del 1 al 9) y "Artículo 12" (del 10 en adelante).',
    fuente: "Manual de Técnica Legislativa, regla 9, punto 4",
    check(text, { contexto }) {
      const problemas = [];
      for (const m of text.matchAll(/art[íi]culo\s+(\d+)\s*([°ºo])?/gi)) {
        const numero = parseInt(m[1], 10);
        const tieneOrdinal = Boolean(m[2]);
        if (numero <= 9 && !tieneOrdinal) {
          problemas.push(`"${m[0].trim()}" debería escribirse "Artículo ${numero}°".`);
        } else if (numero >= 10 && tieneOrdinal) {
          problemas.push(`"${m[0].trim()}" debería escribirse "Artículo ${numero}" (sin el signo de ordinal).`);
        }
      }
      return { cumple: problemas.length === 0, ejemplos: [...new Set(problemas)].slice(0, 4) };
    },
  },

  {
    id: "nac-054",
    titulo: "Las letras de una lista no llevan paréntesis",
    descripcion:
      'Dentro de un artículo, los puntos de una lista se señalan con una letra seguida de paréntesis ' +
      '("a)", "b)", "c)"), no con punto ni con guión.',
    sugerencia: 'Escribir "a) primer punto;" en vez de "a. primer punto;".',
    fuente: "Manual de Técnica Legislativa, regla 11, punto 2",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\n\s*([a-hj-z])[.\-]\s+[a-záéíóúñ]/g)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 3)
          .map((m) => `"${m[1]}." debería ser "${m[1]})": "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-056",
    titulo: "El anexo no indica a qué artículo corresponde",
    descripcion:
      "Junto al título del anexo debe ir, entre paréntesis, el número del artículo que lo manda a " +
      "consultar. Así se sabe de dónde viene ese anexo.",
    sugerencia: 'Escribir: "ANEXO A — Listado de actividades (artículo 5°)".',
    fuente: "Manual de Técnica Legislativa, regla 13, punto 1",
    check(text, { contexto }) {
      const anexos = [...text.matchAll(/\banexo\s+([ivxlcdm]+|[a-z]|\d+)\b/gi)];
      if (anexos.length === 0) return { cumple: true };
      const sinReferencia = anexos.filter((m) => {
        const despues = text.slice(m.index, m.index + 120);
        return !/\(\s*art/i.test(despues);
      });
      return {
        cumple: sinReferencia.length === 0,
        ejemplos: sinReferencia.slice(0, 3).map((m) => `"${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-057",
    titulo: "Se repite muchas veces una expresión larga sin abreviarla",
    descripcion:
      "Cuando una expresión larga se repite muchas veces, conviene darle un nombre corto la primera " +
      'vez ("en adelante denominado...") y después usar ese nombre corto.',
    sugerencia:
      'La primera vez escribir: "el Registro Nacional de Actividades Productivas (en adelante, ' +
      '\'el Registro\')", y después usar solamente "el Registro".',
    fuente: "Manual de Técnica Legislativa, regla 36, punto 3",
    check(text, { normalizar }) {
      const t = normalizar(text);
      if (/en adelante/.test(t)) return { cumple: true };
      const palabras = t.replace(/[^a-zñ\s]/g, " ").split(/\s+/).filter(Boolean);
      const conteo = new Map();
      const VENTANA = 5;
      for (let i = 0; i + VENTANA <= palabras.length; i++) {
        const frase = palabras.slice(i, i + VENTANA).join(" ");
        if (frase.length < 30) continue;
        conteo.set(frase, (conteo.get(frase) || 0) + 1);
      }
      const repetidas = [...conteo.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]);
      return {
        cumple: repetidas.length === 0,
        ejemplos: repetidas.slice(0, 2).map(([frase, n]) => `"${frase}..." se repite ${n} veces.`),
      };
    },
  },

  {
    id: "nac-058",
    titulo: "Hay paréntesis que deberían evitarse",
    descripcion:
      "Los paréntesis solo se usan para casos puntuales: encerrar una sigla, un número en cifras, un " +
      "término extranjero o el título de una norma citada. Para aclaraciones dentro del texto, " +
      "conviene reescribir la frase en vez de usar paréntesis.",
    sugerencia: "Reescribir la aclaración como parte de la oración, o como un inciso aparte.",
    fuente: "Manual de Técnica Legislativa, regla 41.h",
    check(text, { contexto }) {
      const sospechosos = [...text.matchAll(/\(([^)]{15,120})\)/g)].filter((m) => {
        const contenido = m[1].trim();
        if (/^\d/.test(contenido)) return false; // números en cifras
        if (/^[A-ZÁÉÍÓÚÑ\s.]+$/.test(contenido)) return false; // siglas
        if (/\b(b\.?\s*o\.?|ley|decreto|art)/i.test(contenido)) return false; // citas de normas
        if (/en adelante/i.test(contenido)) return false; // denominación abreviada
        return contenido.split(/\s+/).length >= 3;
      });
      return {
        cumple: sospechosos.length === 0,
        ejemplos: sospechosos.slice(0, 3).map((m) => `"(${m[1].slice(0, 50)}...)"`),
      };
    },
  },

  {
    id: "nac-059",
    titulo: 'Se usa la barra "/" entre palabras',
    descripcion:
      'La barra ("/") debe evitarse en el texto: solo se admite en lenguaje técnico y al citar ' +
      "normas o fechas. Entre palabras, conviene escribir la opción completa.",
    sugerencia: 'En vez de "el/la solicitante", escribir "la persona solicitante" o "el solicitante o la solicitante".',
    fuente: "Manual de Técnica Legislativa, regla 41.l",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/[a-záéíóúñ]{2,}\/[a-záéíóúñ]{2,}/gi)].filter(
        (m) => !/^y\/o$/i.test(m[0])
      );
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-060",
    titulo: "Se cita un decreto sin indicar el año",
    descripcion:
      "Los decretos y reglamentos se citan con su número y el año, porque la numeración vuelve a " +
      "empezar cada año y sin el año el dato es ambiguo.",
    sugerencia: 'Escribir "Decreto N° 1344/1998" en vez de "Decreto N° 1344".',
    fuente: "Manual de Técnica Legislativa, regla 44, punto 1.d",
    check(text, { contexto }) {
      // Se toma el número del decreto y se mira si inmediatamente después viene "/año".
      // Ojo: el punto final de la oración NO debe confundirse con el separador de miles.
      const encontrados = [...text.matchAll(/\bdecreto\s+n?[°ºo]?\.?\s*(\d+(?:\.\d{3})*)/gi)].filter((m) => {
        const despues = text.slice(m.index + m[0].length, m.index + m[0].length + 3);
        return !/^\s*\//.test(despues);
      });
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0].trim()}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-061",
    titulo: "Hay remisiones encadenadas entre artículos",
    descripcion:
      "Un artículo remite a otro, y ese otro remite a un tercero. Para entender una sola disposición " +
      "hay que saltar por varios artículos, lo que dificulta la lectura.",
    sugerencia: "Escribir la disposición completa en el artículo, o remitir directamente al artículo que tiene el contenido final.",
    fuente: "Manual de Técnica Legislativa, regla 48, punto 3",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const bloques = [...t.matchAll(/art[ií]culo\s+(\d+)\s*[°ºo]?\s*[:.\-]/g)];
      if (bloques.length < 3) return { cumple: true };
      const remisiones = new Map();
      for (let i = 0; i < bloques.length; i++) {
        const desde = parseInt(bloques[i][1], 10);
        const fin = i + 1 < bloques.length ? bloques[i + 1].index : t.length;
        const cuerpo = t.slice(bloques[i].index + bloques[i][0].length, fin);
        const destinos = [...cuerpo.matchAll(/art[ií]culo\s+(\d+)/g)]
          .map((m) => parseInt(m[1], 10))
          .filter((n) => n !== desde);
        if (destinos.length > 0) remisiones.set(desde, destinos);
      }
      const cadenas = [];
      for (const [desde, destinos] of remisiones) {
        for (const medio of destinos) {
          const siguientes = remisiones.get(medio);
          if (siguientes && siguientes.some((fin) => fin !== desde)) {
            const fin = siguientes.find((f) => f !== desde);
            cadenas.push(`El artículo ${desde} remite al ${medio}, y el ${medio} remite al ${fin}.`);
          }
        }
      }
      return { cumple: cadenas.length === 0, ejemplos: [...new Set(cadenas)].slice(0, 3) };
    },
  },

  {
    id: "nac-062",
    titulo: "Un artículo remite a otro que viene después",
    descripcion:
      "Conviene que las remisiones internas apunten a artículos anteriores, que el lector ya leyó. " +
      "Remitir a un artículo posterior obliga a saltar adelante y volver.",
    sugerencia: "Reordenar los artículos para que lo referenciado venga antes, o escribir el contenido directamente.",
    fuente: "Marco Teórico de Técnica Legislativa — estructura del texto normativo, punto (e)",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const bloques = [...t.matchAll(/art[ií]culo\s+(\d+)\s*[°ºo]?\s*[:.\-]/g)];
      if (bloques.length < 2) return { cumple: true };
      const adelantadas = [];
      for (let i = 0; i < bloques.length; i++) {
        const desde = parseInt(bloques[i][1], 10);
        const fin = i + 1 < bloques.length ? bloques[i + 1].index : t.length;
        const cuerpo = t.slice(bloques[i].index + bloques[i][0].length, fin);
        for (const m of cuerpo.matchAll(/art[ií]culo\s+(\d+)/g)) {
          const destino = parseInt(m[1], 10);
          if (destino > desde) {
            adelantadas.push(`El artículo ${desde} remite al artículo ${destino}, que viene después.`);
          }
        }
      }
      return { cumple: adelantadas.length === 0, ejemplos: [...new Set(adelantadas)].slice(0, 3) };
    },
  },

  {
    id: "nac-063",
    titulo: "Un punto de la lista empieza con mayúscula",
    descripcion:
      'Los puntos de una lista dentro de un artículo ("a)", "b)", "1.", "2.") son continuación de la ' +
      "frase que los introduce, así que empiezan en minúscula.",
    sugerencia: 'Escribir "a) los organismos nacionales;" en vez de "a) Los organismos nacionales;".',
    fuente: "Marco Teórico de Técnica Legislativa — el artículo y sus incisos",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\n\s*(?:[a-z]\)|\d+\.)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})/g)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[1]}..." debería empezar en minúscula: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-064",
    titulo: "No se aclara si el anexo forma parte de la ley",
    descripcion:
      "El cuerpo de la norma debe decir expresamente si el anexo forma parte de ella. Esto importa " +
      "porque, si forma parte, debe publicarse con la ley y solo puede cambiarse modificando la ley.",
    sugerencia: 'Agregar en el artículo que lo menciona: "...que como Anexo I forma parte integrante de la presente ley."',
    fuente: "Marco Teórico de Técnica Legislativa — seguridad jurídica, punto 2.f",
    ubicacionFija: "En el artículo que menciona el Anexo",
    check(text, { normalizar }) {
      const t = normalizar(text);
      if (!/\banexo\b/.test(t)) return { cumple: true };
      const aclara = /(forma|forman)\s+parte\s+(integrante\s+)?(de|del)/.test(t) || /integra\s+(la|el)\s+presente/.test(t);
      return {
        cumple: aclara,
        ejemplos: aclara
          ? []
          : ['El documento tiene un anexo pero no dice si "forma parte integrante" de la norma.'],
      };
    },
  },
  {
    id: "nac-065",
    titulo: "Un porcentaje está escrito solo con la cifra",
    descripcion:
      "Igual que el resto de las cantidades, los porcentajes se escriben primero con palabras y " +
      "después con la cifra entre paréntesis. El símbolo suelto se reserva para tablas y listados.",
    sugerencia: 'Escribir "el cincuenta por ciento (50%)" en vez de "el 50%".',
    fuente: "Manual de Técnica Legislativa, regla 39, punto 1 — regla 41 (signo por ciento)",
    check(text, { contexto }) {
      // "cincuenta por ciento (50%)" es la forma correcta: la cifra va entre paréntesis
      // después de las letras. Por eso no se marca lo que ya está dentro de un paréntesis.
      const encontrados = [...text.matchAll(/(?<![(\d,.])\b\d+(?:[.,]\d+)?\s*(?:%|por\s+ciento\b)/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 4)
          .map((m) => `"${m[0].trim()}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-066",
    titulo: 'Una cita interna dice "de la presente ley" en vez del número',
    descripcion:
      'Para remitir a otra parte del mismo texto alcanza con el número ("el artículo 5°"). Agregar ' +
      '"de la presente ley" o "del presente artículo" sobra, salvo que sin eso quede alguna duda ' +
      "sobre a qué norma se refiere.",
    sugerencia: 'Escribir "lo previsto en el artículo 5°" en vez de "lo previsto en el artículo 5° de la presente ley".',
    fuente: "Manual de Técnica Legislativa, regla 45, punto 8",
    check(text, { contexto }) {
      const patrones = [
        /\b(art[íi]culo|inciso|cap[íi]tulo|t[íi]tulo|secci[óo]n|anexo)\s+[\dA-Za-z°ºª]+\s*,?\s+de\s+la\s+presente(\s+(ley|norma|ordenanza|resoluci[óo]n))?\b/gi,
        /\b(inciso|apartado|p[áa]rrafo|letra)\s+[\dA-Za-z°ºª)]+\s+del\s+presente\s+art[íi]culo\b/gi,
      ];
      const encontrados = [];
      for (const patron of patrones) {
        for (const m of text.matchAll(patron)) encontrados.push(m);
      }
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${contexto(text, m.index, 45)}"`),
      };
    },
  },

  {
    id: "nac-067",
    titulo: "Se cita un decreto con el año en dos cifras",
    descripcion:
      "Al citar un decreto o una resolución, el año va completo, con cuatro cifras. Con dos cifras " +
      "queda ambiguo a qué año corresponde.",
    sugerencia: 'Escribir "Decreto N° 1344/1998" en vez de "Decreto N° 1344/98".',
    fuente: "Manual de Técnica Legislativa, regla 44, punto 1.d",
    check(text, { contexto }) {
      const encontrados = [
        ...text.matchAll(
          /\b(decreto|resoluci[óo]n|disposici[óo]n)\s+n?[°ºo]?\.?\s*\d+(?:\.\d{3})*\s*\/\s*\d{2}(?!\d)/gi
        ),
      ];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 4)
          .map((m) => `"${m[0].trim()}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-068",
    titulo: 'Se llama "inciso" a lo que es una letra',
    descripcion:
      'Los incisos van numerados ("1°.", "2°."). Las divisiones que van adentro de un inciso se ' +
      'señalan con letra y paréntesis, y al citarlas se las nombra "letra a)", no "inciso a)".',
    sugerencia: 'Escribir "la letra a) del artículo 5°" en vez de "el inciso a) del artículo 5°".',
    fuente: "Manual de Técnica Legislativa, regla 46, punto 2",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\binciso\s+([a-z])\s*\)/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 4)
          .map((m) => `"${m[0].trim()}" debería decir "letra ${m[1]})": "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-069",
    titulo: "Las derogaciones están repartidas en varios artículos",
    descripcion:
      "Todo lo que la norma deja sin efecto debe ir reunido en un solo artículo, entre las " +
      "disposiciones finales. Si las derogaciones aparecen desparramadas, cuesta saber qué quedó " +
      "eliminado en total.",
    sugerencia:
      'Juntar todas las derogaciones en un único artículo al final: "Deróganse el artículo 5° de la ' +
      'Ley N° 12.345 y el artículo 2° de la Ley N° 20.000."',
    fuente: "Manual de Técnica Legislativa, regla 57, punto 2",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const bloques = [...t.matchAll(/art[ií]culo\s+(\d+)\s*[°ºo]?\s*[:.\-]/g)];
      if (bloques.length < 2) return { cumple: true };
      const conDerogacion = [];
      for (let i = 0; i < bloques.length; i++) {
        const numero = parseInt(bloques[i][1], 10);
        const fin = i + 1 < bloques.length ? bloques[i + 1].index : t.length;
        const cuerpo = t.slice(bloques[i].index, fin);
        // Solo cuentan las derogaciones que nombran algo concreto, igual que en nac-007.
        if (/\b(deroga|abroga)[a-z]*\b[^.]{0,80}?(articulo|art\.|ley)\s*(n[°ºo]?\.?)?\s*\d/.test(cuerpo)) {
          conDerogacion.push(numero);
        }
      }
      const unicos = [...new Set(conDerogacion)];
      return {
        cumple: unicos.length <= 1,
        ejemplos:
          unicos.length <= 1
            ? []
            : [
                `Hay derogaciones en los artículos ${unicos.join(", ")}. Conviene reunirlas en uno solo, ` +
                  "entre las disposiciones finales.",
              ],
      };
    },
  },

  {
    id: "nac-070",
    titulo: "Los capítulos y los títulos están al revés",
    descripcion:
      'En la jerarquía del Manual, el "Título" es más grande que el "Capítulo": un título agrupa ' +
      "capítulos, no al revés. Si el primer capítulo aparece antes del primer título, la estructura " +
      "está invertida.",
    sugerencia: 'Reordenar las divisiones así: "TÍTULO I" y, adentro, "CAPÍTULO I", "CAPÍTULO II".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 2",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const primerTitulo = t.search(/\btitulo\s+([ivxlcdm]+|\d+)\b/);
      const primerCapitulo = t.search(/\bcapitulo\s+([ivxlcdm]+|\d+)\b/);
      if (primerTitulo < 0 || primerCapitulo < 0) return { cumple: true };
      if (primerTitulo < primerCapitulo) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [
          `El primer capítulo aparece antes del primer título: "${contexto(text, primerCapitulo, 45)}"`,
        ],
      };
    },
  },

  {
    id: "nac-071",
    titulo: "Un anexo está identificado con número en vez de letra",
    descripcion:
      'El Manual pide identificar cada anexo con una letra mayúscula ("Anexo A", "Anexo B"), no con ' +
      "número romano ni con número común. Ojo: es una regla muy poco seguida en la práctica, así que " +
      "revisá si en tu ámbito se acostumbra de otra forma.",
    sugerencia: 'Escribir "ANEXO A" en vez de "ANEXO II" o "ANEXO 2".',
    fuente: "Manual de Técnica Legislativa, regla 13, punto 2",
    check(text, { contexto }) {
      // Un solo carácter no se marca: "Anexo A" es correcto, y en "Anexo I" no se puede
      // distinguir el número romano uno de la letra I. Solo se señala lo inequívoco.
      const encontrados = [...text.matchAll(/\banexo\s+(\d+|[IVXLCDM]{2,})\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 4)
          .map((m) => `"${m[0].trim()}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  // Las reglas que valen igual en los tres ámbitos.
  ...window.ReglasComunes.para("nacional"),
];
