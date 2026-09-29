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
    severidad: "alta",
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
    id: "nac-002",
    titulo: "Los artículos no están numerados en orden",
    descripcion:
      'Los artículos deben numerarse seguidos: 1°, 2°, 3°..., sin saltos ni repeticiones. Si se ' +
      'agrega uno nuevo después, se usa "bis" o "ter" en vez de romper la numeración de los demás.',
    sugerencia:
      'Ejemplo correcto: "Artículo 1°...", "Artículo 2°...", "Artículo 3°...". Para insertar uno ' +
      'nuevo entre el 2° y el 3°, usar "Artículo 2° bis".',
    fuente: "Manual de Técnica Legislativa, regla 9, punto 4",
    severidad: "alta",
    check(text, { contexto }) {
      const matches = [...text.matchAll(/art[íi]culo\s+(\d+)\s*(bis|ter|quater|quinquies|sexies|septies)?/gi)];
      const base = matches.filter((m) => !m[2]);
      if (base.length === 0) {
        return { cumple: false, ejemplos: ["No se encontró ningún artículo numerado en el texto."] };
      }
      const problemas = [];
      for (let i = 0; i < base.length; i++) {
        const esperado = i + 1;
        const encontrado = parseInt(base[i][1], 10);
        if (encontrado !== esperado) {
          problemas.push(
            `Se esperaba "Artículo ${esperado}°" pero acá dice: "${contexto(text, base[i].index, 60)}"`
          );
        }
      }
      return { cumple: problemas.length === 0, ejemplos: problemas.slice(0, 5) };
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
    severidad: "media",
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
    id: "nac-004",
    titulo: 'Se mezcla "Art." con "Artículo"',
    descripcion:
      'La palabra "Artículo" no debe abreviarse. No puede usarse "Art." en una parte del texto y ' +
      '"Artículo" completo en otra.',
    sugerencia: 'Usar siempre la palabra completa en todo el documento: "Artículo 5°", nunca "Art. 5°".',
    fuente: "Manual de Técnica Legislativa, regla 9, punto 4",
    severidad: "baja",
    check(text, { contexto }) {
      const abreviado = [...text.matchAll(/\bart\.\s*\d/gi)];
      const completo = [...text.matchAll(/art[íi]culo\s+\d/gi)];
      const cumple = !(abreviado.length > 0 && completo.length > 0);
      if (cumple) return { cumple: true };
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
    id: "nac-005",
    titulo: "Hay un artículo demasiado largo",
    descripcion:
      "Cada artículo debería tratar una sola idea. Si un artículo mezcla varios temas o es muy " +
      "extenso, conviene separarlo en artículos distintos.",
    sugerencia:
      "Dividir el artículo en dos o más artículos cortos, cada uno con una sola idea (por ejemplo, " +
      "uno para la definición, otro para la obligación, otro para la sanción).",
    fuente: "Manual de Técnica Legislativa, regla 9, puntos 2 y 3",
    severidad: "media",
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
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const cumple = /entrar[aá] en vigencia|rige a partir de|vigencia a partir|entrada en vigor/.test(t);
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
    id: "nac-007",
    titulo: "Se cambia otra ley pero no se dice qué queda sin efecto",
    descripcion:
      "Si este texto modifica, reemplaza o corrige una ley anterior, tiene que decir con nombre y " +
      "número exacto qué parte de esa ley anterior queda derogada. No alcanza con darlo por sobreentendido.",
    sugerencia: 'Agregar algo como: "Derógase el artículo 8° de la Ley N° 12.345."',
    fuente: "Manual de Técnica Legislativa, reglas 54.4, 57.1 y 57.3",
    severidad: "media",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const modificaMatch = t.match(/modific|sustituy|reemplaz/);
      if (!modificaMatch) return { cumple: true };
      // No alcanza con la palabra "derógase" suelta: la regla 57.3 dice que la fórmula
      // genérica ("...que se opongan a la presente") no cuenta como derogación explícita.
      // Tiene que nombrar una ley o artículo concreto cerca de la palabra "derógase".
      const derogaExplicita = /(abroga|deroga)(se|nse|do|da)?\b[^.]{0,60}?(articulo|art\.|ley)\s*(n[°ºo]?\.?)?\s*\d/.test(
        t
      );
      if (derogaExplicita) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [`Acá se menciona un cambio pero sin decir qué se deja sin efecto: "${contexto(text, modificaMatch.index, 60)}"`],
      };
    },
  },

  {
    id: "nac-008",
    titulo: "Hay una sigla que nunca se explica",
    descripcion:
      "Cuando el texto usa una abreviatura de letras (una sigla, como AFIP o INCUCAI), la primera " +
      "vez que aparece hay que escribir el nombre completo seguido de la sigla entre paréntesis. " +
      "Después de esa primera vez, ya se puede usar solo la sigla.",
    sugerencia:
      'Ejemplo correcto: la primera vez escribir "el Registro Nacional de Ejemplo (RNE)", y luego, ' +
      'en el resto del texto, usar directamente "el RNE".',
    fuente: "Manual de Técnica Legislativa, regla 36, punto 2",
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const STOPWORDS = new Set([
        "LEY", "ARTICULO", "ARTÍCULO", "TITULO", "TÍTULO", "CAPITULO", "CAPÍTULO",
        "SECCION", "SECCIÓN", "ANEXO", "DECRETO", "PODER", "EJECUTIVO", "NACION",
        "NACIÓN", "REPUBLICA", "REPÚBLICA", "ARGENTINA", "CONGRESO", "SENADO",
        "CAMARA", "CÁMARA", "DIPUTADOS", "BOLETIN", "BOLETÍN", "OFICIAL",
      ]);

      const matches = [...text.matchAll(/\b[A-ZÁÉÍÓÚÑ]{3,}\b/g)];
      const primeraAparicion = new Map();
      const conteo = new Map();
      for (const m of matches) {
        const palabra = m[0];
        if (STOPWORDS.has(palabra)) continue;
        conteo.set(palabra, (conteo.get(palabra) || 0) + 1);
        if (!primeraAparicion.has(palabra)) primeraAparicion.set(palabra, m.index);
      }

      const repetidas = [...conteo.entries()].filter(([, n]) => n >= 2).map(([s]) => s);

      // Si la palabra también aparece en minúscula en OTRA parte del texto, es una
      // palabra común en mayúscula (título, énfasis), no una sigla real. Para
      // comprobarlo hay que sacar primero sus propias apariciones en mayúscula:
      // si no se sacan, el texto normalizado (todo en minúscula) siempre "se
      // encuentra a sí mismo" y la sigla nunca se detecta como tal.
      const posiblesSiglas = repetidas.filter((sigla) => {
        const sinEstaPalabra = text.replace(new RegExp(`\\b${sigla}\\b`, "g"), " ");
        const enMinuscula = new RegExp(`\\b${sigla.toLowerCase()}\\b`).test(normalizar(sinEstaPalabra));
        return !enMinuscula;
      });

      const sinDefinir = posiblesSiglas.filter((sigla) => !new RegExp(`\\(${sigla}\\)`).test(text));

      return {
        cumple: sinDefinir.length === 0,
        ejemplos: sinDefinir
          .slice(0, 5)
          .map((s) => `"${s}" aparece así, sin explicar qué significa: "${contexto(text, primeraAparicion.get(s), 50)}"`),
      };
    },
  },

  {
    id: "nac-009",
    titulo: "Una sigla está escrita con puntos entre letras",
    descripcion:
      "Las siglas (como AFIP, RENAR) se escriben todas juntas y en mayúscula, sin un punto después " +
      "de cada letra.",
    sugerencia: 'Escribir "SADAIC" en vez de "S.A.D.A.I.C."',
    fuente: "Manual de Técnica Legislativa, regla 37, punto 1",
    severidad: "baja",
    check(text) {
      const conPuntos = [...new Set(text.match(/\b(?:[A-ZÁÉÍÓÚÑ]\.){2,}[A-ZÁÉÍÓÚÑ]?\.?\b/g) || [])];
      return {
        cumple: conPuntos.length === 0,
        ejemplos: conPuntos.slice(0, 5).map((s) => `"${s}" debería escribirse "${s.replace(/\./g, "")}".`),
      };
    },
  },

  {
    id: "nac-010",
    titulo: "La derogación es genérica, no dice qué ley se deja sin efecto",
    descripcion:
      'Frases como "quedan derogadas todas las disposiciones que se opongan a la presente" no dicen ' +
      "realmente qué se está eliminando. Hay que nombrar la ley o el artículo exacto que queda sin efecto.",
    sugerencia:
      'En vez de "deróganse todas las disposiciones que se opongan a la presente", escribir por ' +
      'ejemplo: "Derógense los artículos 5° y 8° de la Ley N° 12.345."',
    fuente: "Manual de Técnica Legislativa, reglas 57.1 y 57.3",
    severidad: "media",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const match =
        t.match(/(deroga|abroga)(se|nse)?\s+todas?\s+las?\s+disposicion(es)?\s+(que\s+)?se\s+opong[a-z]*/) ||
        t.match(/toda\s+otra\s+norma\s+que\s+se\s+opong[a-z]*/) ||
        t.match(/dejar\s+sin\s+efecto\s+toda\s+disposicion\s+que\s+se\s+opong[a-z]*/);
      if (!match) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [`Se encontró esta fórmula genérica: "${contexto(text, match.index, 60)}"`],
      };
    },
  },

  {
    id: "nac-011",
    titulo: "Hay una doble negación que puede confundir",
    descripcion:
      'Usar dos negaciones en la misma frase (por ejemplo "no... sin...") hace más difícil entender ' +
      "qué es lo que realmente se permite o se prohíbe.",
    sugerencia:
      'En vez de "no podrán oponerse sin autorización", escribir "necesitan autorización para ' +
      'oponerse" (una sola negación).',
    fuente: "Manual de Técnica Legislativa, regla 23, punto 1",
    severidad: "baja",
    check(text) {
      const oraciones = text.split(/(?<=[.;])\s+/);
      const problemas = [];
      for (const oracion of oraciones) {
        if (/\bno\b/i.test(oracion) && /\b(sin|ni|tampoco|nunca)\b/i.test(oracion)) {
          problemas.push(`"${oracion.trim().slice(0, 140).replace(/\s+/g, " ")}..."`);
        }
      }
      return { cumple: problemas.length === 0, ejemplos: problemas.slice(0, 5) };
    },
  },

  {
    id: "nac-012",
    titulo: 'Se usa "y/o", que puede ser ambiguo',
    descripcion:
      'La expresión "y/o" no queda clara: no se sabe si se refiere a una cosa, a la otra, o a ambas. ' +
      'Conviene usar "o" (que ya incluye la posibilidad de ambas) o explicarlo directamente.',
    sugerencia: 'Reemplazar "los bienes y/o servicios" por "los bienes o servicios".',
    fuente: "Manual de Técnica Legislativa, regla 25, punto 1",
    severidad: "baja",
    check(text, { contexto }) {
      const ocurrencias = [...text.matchAll(/\by\/o\b/gi)];
      return {
        cumple: ocurrencias.length === 0,
        ejemplos: ocurrencias.slice(0, 3).map((m) => `"${contexto(text, m.index, 40)}"`),
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
    severidad: "baja",
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
    severidad: "baja",
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
    id: "nac-015",
    titulo: "El título de la ley no dice de qué trata",
    descripcion:
      'El título no debería ser solo un número o una fecha ("título mudo"); tiene que dar una idea ' +
      "real del contenido de la ley.",
    sugerencia: 'En vez de "Ley 25.089", escribir algo como "Ley de Creación del Registro Nacional de Ejemplo".',
    fuente: "Manual de Técnica Legislativa, regla 3, punto 2",
    severidad: "baja",
    check(text) {
      const primerArticulo = text.search(/art[íi]culo\s+1[°ºo]?\b/i);
      if (primerArticulo <= 0) return { cumple: true };
      const titulo = text.slice(0, primerArticulo).trim();
      if (titulo.length === 0) {
        return { cumple: false, ejemplos: ["No se encontró ningún título antes del Artículo 1°."] };
      }
      const soloNumerico =
        /^[\s\d°ºa-zA-Z.,\-\/]{0,40}$/.test(titulo) && /\d/.test(titulo) && titulo.split(/\s+/).length <= 6;
      return {
        cumple: !soloNumerico,
        ejemplos: soloNumerico
          ? [`El título encontrado es: "${titulo.slice(0, 60)}" — parece solo un número o fecha.`]
          : [],
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    id: "nac-020",
    titulo: "Se usan guiones como viñetas dentro de un artículo",
    descripcion:
      'Para hacer una lista dentro de un artículo no se usan guiones ("-") como viñetas; se usan ' +
      'letras seguidas de paréntesis, como "a)", "b)", "c)".',
    sugerencia: 'En vez de listar con guiones, escribir: "a) primer punto; b) segundo punto; c) tercer punto."',
    fuente: "Manual de Técnica Legislativa, regla 11, punto 3",
    severidad: "baja",
    check(text, { contexto }) {
      const vinetas = [...text.matchAll(/\n\s*-\s+[a-záéíóúñ]/g)];
      return {
        cumple: vinetas.length === 0,
        ejemplos: vinetas.slice(0, 4).map((m) => `"${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-021",
    titulo: "Hay frases que suenan a pedido o discurso, no a norma",
    descripcion:
      "Un artículo tiene que ordenar, permitir o prohibir algo — no debe contener expresiones de " +
      'deseo, pedidos a los legisladores, ni frases como "solicito a mis pares" o "resulta imperioso", ' +
      "que no tienen efecto legal por sí mismas.",
    sugerencia:
      "Sacar esas frases del articulado. Si son la motivación del proyecto, van en los fundamentos, " +
      "no en los artículos.",
    fuente: "Manual de Técnica Legislativa, regla 28, punto 1",
    severidad: "media",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const patrones = [
        /solicito a mis pares/,
        /resulta imperioso/,
        /es de esperar que/,
        /es dable destacar/,
        /vengo a proponer/,
        /por los motivos expuestos/,
        /acompa[ñn]en (la|esta|el) (presente )?(iniciativa|proyecto)/,
      ];
      const encontrados = [];
      for (const patron of patrones) {
        const m = t.match(patron);
        if (m) encontrados.push(m);
      }
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${contexto(text, m.index, 50)}"`),
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
    severidad: "baja",
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
    id: "nac-023",
    titulo: "Hay palabras en otro idioma sin explicar",
    descripcion:
      "El texto usa una palabra extranjera (como del inglés) que todavía no es de uso común en " +
      "español. Si hace falta usarla, conviene definirla la primera vez.",
    sugerencia: 'Agregar una aclaración la primera vez que aparece, por ejemplo: "...el sitio web (\'landing page\')..."',
    fuente: "Manual de Técnica Legislativa, regla 33, punto 1",
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const palabras = [
        "online", "offline", "software", "hardware", "email", "e-mail", "link", "blog",
        "ranking", "feedback", "marketing", "delivery", "smartphone", "hashtag", "streaming",
      ];
      const encontradas = [];
      for (const palabra of palabras) {
        const m = t.match(new RegExp(`\\b${palabra}\\b`));
        if (m) encontradas.push({ palabra, index: m.index });
      }
      return {
        cumple: encontradas.length === 0,
        ejemplos: encontradas.slice(0, 4).map((e) => `"${e.palabra}" en: "${contexto(text, e.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-024",
    titulo: "Una cantidad está solo en números, sin la palabra",
    descripcion:
      'Las cantidades se escriben con la palabra primero y el número entre paréntesis (salvo en ' +
      'tablas), por ejemplo "treinta (30) días" en vez de solamente "30 días".',
    sugerencia: 'Escribir "treinta (30) días" en vez de "30 días".',
    fuente: "Manual de Técnica Legislativa, regla 39, punto 1",
    severidad: "baja",
    check(text, { contexto }) {
      const unidades = "d[íi]as?|a[ñn]os?|meses|semanas|horas|minutos|pesos|kil[óo]metros|metros";
      const patron = new RegExp(`(?<!\\()\\b(\\d+)\\s+(?=(${unidades})\\b)`, "gi");
      const encontrados = [...text.matchAll(patron)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 5).map((m) => `"${contexto(text, m.index, 35)}" — falta la palabra antes del número.`),
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
    severidad: "baja",
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
    severidad: "baja",
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
    id: "nac-027",
    titulo: "Las disposiciones transitorias no están al final",
    descripcion:
      "El orden recomendado es: primero las disposiciones generales, después las principales, y al " +
      "final las de forma, vigencia, derogaciones y las transitorias. Si las disposiciones " +
      "transitorias aparecen antes de la mayoría de los artículos, el orden general está invertido.",
    sugerencia: "Mover el artículo o sección de disposiciones transitorias hacia el final del texto, después de las demás.",
    fuente: "Marco Teórico de Técnica Legislativa — orden temático de las disposiciones (punto A.1)",
    severidad: "baja",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const m = t.match(/disposici(o|ó)n(es)? transitoria/);
      if (!m) return { cumple: true };
      const posicionRelativa = m.index / t.length;
      return {
        cumple: posicionRelativa >= 0.6,
        ejemplos:
          posicionRelativa >= 0.6
            ? []
            : ["Las disposiciones transitorias aparecen antes del último 40% del documento."],
      };
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
    severidad: "baja",
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
    fuente: "Manual de Técnica Legislativa, regla 18 (brevedad) y regla 19 (estilo)",
    severidad: "baja",
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
    id: "nac-030",
    titulo: "Un anexo mencionado pero ningún artículo lo referencia",
    descripcion:
      "Si el texto tiene un Anexo, el artículo relacionado con ese contenido debe mencionarlo " +
      "expresamente (por ejemplo, \"...que como Anexo I forma parte de la presente\").",
    sugerencia: 'Agregar en el artículo correspondiente algo como: "...cuyo detalle consta en el Anexo I de la presente ley."',
    fuente: "Manual de Técnica Legislativa, regla 14, punto 1",
    severidad: "baja",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const tieneAnexo = /\banexo\b/.test(t);
      if (!tieneAnexo) return { cumple: true };
      const primeraAparicion = t.search(/\banexo\b/);
      const antesDelAnexo = t.slice(0, primeraAparicion);
      const referenciado = /\banexo\b/.test(antesDelAnexo);
      return {
        cumple: referenciado,
        ejemplos: referenciado
          ? []
          : ['El documento tiene un "Anexo" pero no se encontró ningún artículo, antes de esa sección, que lo mencione.'],
      };
    },
  },

  {
    id: "nac-031",
    titulo: "Una enumeración termina en \"etc.\" sin aclarar si es completa",
    descripcion:
      "Cuando se hace una lista, hay que dejar en claro si es una lista cerrada (solamente esos " +
      'casos) o de ejemplo (puede haber otros). Terminarla con "etc." no lo aclara y genera dudas.',
    sugerencia:
      'En vez de terminar la lista con "etc.", aclarar expresamente: "..., entre otros" (si es de ' +
      'ejemplo) o simplemente no usar "etc." si la lista es cerrada.',
    fuente: "Manual de Técnica Legislativa, regla 27, punto 1",
    severidad: "baja",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/,?\s*etc\.?\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${contexto(text, m.index, 40)}"`),
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const m =
        t.match(/deroga[a-z]*\s+y\s+sustituy[a-z]*/) || t.match(/sustituy[a-z]*\s+y\s+deroga[a-z]*/);
      if (!m) return { cumple: true };
      return { cumple: false, ejemplos: [`"${contexto(text, m.index, 45)}"`] };
    },
  },

  {
    id: "nac-035",
    titulo: "Se prorroga o suspende algo sin decir exactamente qué",
    descripcion:
      "Si el texto prorroga o suspende un plazo o una norma, tiene que decir con precisión cuál (el " +
      'artículo o la ley), no referirse de manera genérica a "los plazos vigentes" o "las normas actuales".',
    sugerencia: 'En vez de "Prorróganse los plazos vigentes", escribir "Prorrógase el plazo establecido en el artículo 3° de la Ley N° 12.345".',
    fuente: "Manual de Técnica Legislativa, regla 68, punto 4",
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const matches = [...t.matchAll(/\b(prorroga|suspende)(se|nse)?\b/g)];
      if (matches.length === 0) return { cumple: true };
      const sinEspecificar = matches.filter((m) => {
        const alrededor = t.slice(m.index, m.index + 80);
        return !/(articulo|art\.|ley)\s*(n[°ºo]?\.?)?\s*\d/.test(alrededor);
      });
      return {
        cumple: sinEspecificar.length === 0,
        ejemplos: sinEspecificar.slice(0, 3).map((m) => `"${contexto(text, m.index, 50)}"`),
      };
    },
  },

  {
    id: "nac-036",
    titulo: "Un anexo sin título que diga qué contiene",
    descripcion:
      'Cada anexo debe llevar, además de su identificación ("Anexo I"), un título corto que informe ' +
      "de qué trata, para que se sepa qué hay adentro sin tener que leerlo entero.",
    sugerencia: 'Ejemplo correcto: "ANEXO I — Listado de actividades comprendidas (artículo 5°)".',
    fuente: "Manual de Técnica Legislativa, regla 13, punto 1",
    severidad: "baja",
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
    id: "nac-037",
    titulo: "Hay abreviaturas que deberían escribirse completas",
    descripcion:
      'Las palabras no deben abreviarse cortándolas ("Nro.", "Depto.", "Gral.", "c/"), salvo las ' +
      'abreviaturas aceptadas para citar normas (como "Art." o "B.O."). En el texto de la norma va la palabra entera.',
    sugerencia: 'Escribir "Número", "Departamento", "General", "con" en vez de "Nro.", "Depto.", "Gral.", "c/".',
    fuente: "Manual de Técnica Legislativa, regla 36, punto 1",
    severidad: "baja",
    check(text, { contexto }) {
      const patron = /\b(nro\.|depto\.|pcia\.|gral\.|tel\.|ej\.)|(\s[cs]\/\s)/gi;
      const encontrados = [...text.matchAll(patron)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${m[0].trim()}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-038",
    titulo: "Se reemplaza el texto de otra norma pero sin comillas",
    descripcion:
      "Cuando un artículo reemplaza el texto de otra norma, el texto nuevo tiene que ir entre " +
      "comillas, para que quede claro exactamente dónde empieza y dónde termina lo que se incorpora.",
    sugerencia:
      'Ejemplo correcto: Sustitúyese el artículo 5° de la Ley N° 12.345 por el siguiente: "Artículo 5°: ' +
      'El registro funcionará en el ámbito del Ministerio."',
    fuente: "Manual de Técnica Legislativa, regla 41.c",
    severidad: "media",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const introducciones = [...t.matchAll(/por el siguiente|quedar[aá] redactado (de la siguiente manera|as[ií])/g)];
      if (introducciones.length === 0) return { cumple: true };
      const sinComillas = introducciones.filter((m) => {
        const despues = text.slice(m.index, m.index + 200);
        return !/["“”]/.test(despues);
      });
      return {
        cumple: sinComillas.length === 0,
        ejemplos: sinComillas.slice(0, 3).map((m) => `"${contexto(text, m.index, 60)}"`),
      };
    },
  },

  {
    id: "nac-039",
    titulo: "Hay muchos verbos en tiempo futuro",
    descripcion:
      'Las disposiciones se redactan en presente ("el registro funciona...") y no en futuro ("el ' +
      'registro funcionará..."), salvo cuando el futuro es imprescindible. Ojo: esto es una ' +
      "sugerencia de estilo — puede haber usos del futuro que sean correctos, como la cláusula de vigencia.",
    sugerencia: 'En vez de "La autoridad de aplicación establecerá los requisitos", escribir "La autoridad de aplicación establece los requisitos".',
    fuente: "Manual de Técnica Legislativa, regla 20, punto 1",
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      // Verbos en futuro simple (3ª persona), excluyendo los usos habitualmente válidos
      // en cláusulas de vigencia ("entrará en vigencia", "regirá a partir de").
      const futuros = [...t.matchAll(/\b[a-zñ]{3,}(ar[aá]n?|er[aá]n?|ir[aá]n?)\b/g)].filter((m) => {
        const alrededor = t.slice(Math.max(0, m.index - 40), m.index + 60);
        return !/vigencia|regir[aá]|publicaci[oó]n/.test(alrededor);
      });
      if (futuros.length < 5) return { cumple: true };
      return {
        cumple: false,
        ejemplos: [
          `Se encontraron ${futuros.length} verbos en futuro. Por ejemplo: ` +
            futuros
              .slice(0, 3)
              .map((m) => `"${contexto(text, m.index, 30)}"`)
              .join(" · "),
        ],
      };
    },
  },

  {
    id: "nac-040",
    titulo: "No se aclara al principio qué tipo de norma es",
    descripcion:
      'Al comienzo, el documento debe decir qué clase de norma es: "Ley", "Decreto", "Resolución", ' +
      '"Ordenanza" o "Proyecto de ley". Si no lo dice, no queda claro qué se está leyendo.',
    sugerencia: 'Encabezar el documento con su denominación, por ejemplo: "PROYECTO DE LEY" o "LEY N° 12.345".',
    fuente: "Manual de Técnica Legislativa, regla 1, punto 1.a",
    severidad: "media",
    check(text, { normalizar }) {
      const inicio = normalizar(text.slice(0, 300));
      const tieneDenominacion = /\b(ley|decreto|resoluci[oó]n|ordenanza|disposici[oó]n|proyecto)\b/.test(inicio);
      return {
        cumple: tieneDenominacion,
        ejemplos: tieneDenominacion
          ? []
          : [`El documento empieza así: "${text.slice(0, 80).replace(/\s+/g, " ").trim()}..." — ahí no se identifica el tipo de norma.`],
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
    severidad: "baja",
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
    id: "nac-042",
    titulo: 'Hay una "Sección" que no está dentro de ningún "Capítulo"',
    descripcion:
      'Las secciones solo se usan para dividir por dentro a un capítulo. Si el texto tiene ' +
      '"Sección" pero no tiene ningún "Capítulo", la estructura está mal armada.',
    sugerencia: 'Agrupar las secciones dentro de un capítulo, o renombrarlas directamente como "Capítulo".',
    fuente: "Manual de Técnica Legislativa, regla 8, punto 3",
    severidad: "baja",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const m = t.match(/\bseccion\s+([ivxlcdm]+|\d+|[a-z]\b)/);
      if (!m) return { cumple: true };
      const hayCapitulo = /\bcapitulo\b/.test(t);
      return {
        cumple: hayCapitulo,
        ejemplos: hayCapitulo ? [] : [`"${contexto(text, m.index, 45)}" — no hay ningún capítulo en el documento.`],
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
    severidad: "baja",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\bt[íi]tulo\s+\d+\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 3).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 40)}"`),
      };
    },
  },

  {
    id: "nac-044",
    titulo: "La norma no dice cuál es su objeto",
    descripcion:
      "Al principio, una norma debería decir para qué se dicta: cuál es su objeto o finalidad, y a " +
      "quiénes o a qué situaciones se aplica. Si no está, el lector tiene que deducirlo.",
    sugerencia: 'Agregar como primer artículo algo como: "Artículo 1° -Objeto- La presente ley tiene por objeto regular..."',
    fuente: "Manual de Técnica Legislativa, regla 17, punto 1.a — Marco Teórico, disposiciones preliminares",
    severidad: "baja",
    check(text, { normalizar }) {
      const cantidadArticulos = (text.match(/art[íi]culo\s+\d+/gi) || []).length;
      if (cantidadArticulos < 5) return { cumple: true };
      const primerTramo = normalizar(text.slice(0, Math.floor(text.length * 0.35)));
      const declaraObjeto = /\bobjeto\b|\bfinalidad\b|tiene por (objeto|fin)|ambito de aplicacion/.test(primerTramo);
      return {
        cumple: declaraObjeto,
        ejemplos: declaraObjeto
          ? []
          : ["En los primeros artículos no se encontró una declaración de objeto, finalidad o ámbito de aplicación."],
      };
    },
  },

  {
    id: "nac-045",
    titulo: 'Una sigla está escrita en plural con "s"',
    descripcion:
      'Las siglas no cambian en plural: se escribe igual para uno o para varios. Lo que cambia es el ' +
      'artículo que va adelante ("el DNI" / "los DNI"), no la sigla.',
    sugerencia: 'Escribir "los DNI" en vez de "los DNIs".',
    fuente: "Manual de Técnica Legislativa, regla 37, punto 2",
    severidad: "baja",
    check(text, { contexto }) {
      const IGNORAR = new Set([
        "LOS", "LAS", "DOS", "TRES", "SEIS", "MAS", "DIAS", "AÑOS", "ARTS", "LEYES",
        "PAIS", "PAISES", "PUES", "VECES", "MESES", "ANEXOS",
      ]);
      const encontrados = [...text.matchAll(/\b([A-ZÁÉÍÓÚÑ]{3,})s\b/g)].filter(
        (m) => !IGNORAR.has(m[0].toUpperCase())
      );
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados
          .slice(0, 3)
          .map((m) => `"${m[0]}" debería escribirse "${m[1]}": "${contexto(text, m.index, 35)}"`),
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
    severidad: "baja",
    check(text, { contexto }) {
      const encontrados = [...text.matchAll(/\b\d+\s*(km|kg|mts?|lts?|hs|m2|m3)\b/gi)];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${m[0]}" en: "${contexto(text, m.index, 35)}"`),
      };
    },
  },

  {
    id: "nac-047",
    titulo: 'Se remite a un artículo como "el anterior" o "el siguiente"',
    descripcion:
      'Para remitir a otro artículo hay que decir su número exacto, no su posición ("el artículo ' +
      'anterior", "el artículo siguiente"). Si después se agrega o se saca un artículo, esa ' +
      "referencia queda apuntando a otro lado.",
    sugerencia: 'En vez de "lo dispuesto en el artículo anterior", escribir "lo dispuesto en el artículo 3°".',
    fuente: "Manual de Técnica Legislativa, regla 45, punto 8",
    severidad: "media",
    check(text, { normalizar, contexto }) {
      const t = normalizar(text);
      const encontrados = [
        ...t.matchAll(/art[ií]culo\s+(anterior|precedente|siguiente|que antecede|ut supra)/g),
      ];
      return {
        cumple: encontrados.length === 0,
        ejemplos: encontrados.slice(0, 4).map((m) => `"${contexto(text, m.index, 45)}"`),
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    id: "nac-055",
    titulo: "Hay un anexo antes de que terminen los artículos",
    descripcion:
      "Los anexos van todos juntos al final, después del último artículo. No deben quedar " +
      "intercalados en el medio del articulado.",
    sugerencia: "Mover el anexo al final del documento, después del último artículo.",
    fuente: "Manual de Técnica Legislativa, regla 12, punto 2",
    severidad: "media",
    check(text, { normalizar }) {
      const t = normalizar(text);
      const posAnexo = t.search(/\banexo\s+([ivxlcdm]+|[a-z]|\d+)\b/);
      if (posAnexo < 0) return { cumple: true };
      const articulosDespues = [...t.slice(posAnexo).matchAll(/art[ií]culo\s+\d+\s*[°ºo]?\s*[:.\-]/g)];
      return {
        cumple: articulosDespues.length === 0,
        ejemplos:
          articulosDespues.length === 0
            ? []
            : [`Después del anexo todavía aparecen ${articulosDespues.length} artículo(s).`],
      };
    },
  },

  {
    id: "nac-056",
    titulo: "El anexo no indica a qué artículo corresponde",
    descripcion:
      "Junto al título del anexo debe ir, entre paréntesis, el número del artículo que lo manda a " +
      "consultar. Así se sabe de dónde viene ese anexo.",
    sugerencia: 'Escribir: "ANEXO I — Listado de actividades (artículo 5°)".',
    fuente: "Manual de Técnica Legislativa, regla 13, punto 1",
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
    severidad: "baja",
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
];
