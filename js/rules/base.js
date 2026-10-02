/**
 * Lectura de la estructura de una norma, compartida por los tres ámbitos.
 *
 * Reconoce el articulado, el preámbulo, los fundamentos, los anexos y los
 * textos citados entre comillas. La usan las reglas comunes (comunes.js) y las
 * propias de cada ámbito, para que un mismo texto se lea igual en todos.
 *
 * Todas las funciones que "borran" una parte del texto devuelven una cadena
 * del MISMO largo que el original, con lo descartado reemplazado por espacios.
 * Así las posiciones siguen coincidiendo y contexto(text, m.index) cita bien.
 */

window.BaseNormas = (() => {
  const blancos = (n) => " ".repeat(Math.max(0, n));

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  /** Borra lo que esté entre comillas: el texto que se sustituye no es articulado propio. */
  function sinComillas(texto) {
    return texto.replace(/[“"«][^”"»]{0,4000}[”"»]/g, (m) => blancos(m.length));
  }

  // Sólo en mayúsculas: así se escribe el encabezado del bloque.
  const RE_FUNDAMENTOS = /\bFUNDAMENTOS\b|\bFUNDAMENTACI[ÓO]N\b/;

  // Normas que un proyecto cita con frecuencia.
  const NORMA = "(?:ley|ordenanza|decreto|resoluci[óo]n|c[óo]digo|carta\\s+org[áa]nica|constituci[óo]n)";

  // ---------------------------------------------------------------------------
  // Encabezados de artículo
  // ---------------------------------------------------------------------------

  // Ordinales escritos en palabras: "ARTÍCULO PRIMERO", "ARTÍCULO DÉCIMO SEGUNDO".
  const UNIDADES = {
    primero: 1, primer: 1, segundo: 2, tercero: 3, tercer: 3, cuarto: 4, quinto: 5,
    sexto: 6, septimo: 7, setimo: 7, octavo: 8, noveno: 9,
  };
  const DECENAS = {
    decimo: 10, undecimo: 11, duodecimo: 12, vigesimo: 20, trigesimo: 30,
    cuadragesimo: 40, quincuagesimo: 50,
  };
  const ORDINAL_PALABRAS =
    "(?:(?:d[ée]cimo|und[ée]cimo|duod[ée]cimo|vig[ée]simo|trig[ée]simo|cuadrag[ée]simo|quincuag[ée]simo)" +
    "(?:\\s*(?:primero|segundo|tercero|cuarto|quinto|sexto|s[ée]ptimo|octavo|noveno))?" +
    "|primero|segundo|tercero|cuarto|quinto|sexto|s[ée]ptimo|octavo|noveno)";

  function valorOrdinal(palabras) {
    const plano = normalizar(palabras).replace(/\s+/g, "");
    for (const [decena, valor] of Object.entries(DECENAS)) {
      if (plano.startsWith(decena)) {
        const resto = plano.slice(decena.length);
        return resto ? valor + (UNIDADES[resto] || 0) : valor;
      }
    }
    return UNIDADES[plano] || null;
  }

  /**
   * Encabezados de artículo, descartando las citas a otras normas ("el
   * artículo 5º de la Ordenanza Nº 123"). Reconoce tres formas:
   *
   *  - con cifra: "ARTÍCULO 1°.-", "Art. 1º -";
   *  - con palabras: "ARTÍCULO PRIMERO.-", "ARTÍCULO ÚNICO.-";
   *  - el ordinal suelto, sin la palabra "artículo" ("Primero:"), sólo si
   *    aparece antes que cualquier otro encabezado: así se escriben algunos
   *    proyectos, pero más adelante podría ser una enumeración de los fundamentos.
   *
   * Devuelve { numero, sufijo, index, forma } ordenados por posición.
   */
  function encabezadosDeArticulo(cuerpo) {
    const CONECTORES =
      /\b(el|del|al|la|las|los|un|una|en|de|por|para|este|esta|dicho|dicha|presente|mismo|misma|cada|seg[úu]n|conforme|previsto|prevista|previstos|previstas|establecido|establecida|citado|citada|referido|referida|mencionado|mencionada|siguiente|anterior|y|o)\s+$/i;
    const DE_NORMA = new RegExp(`^\\s*de\\s+(la|el|los|las)\\s+${NORMA}`, "i");
    const esCita = (m) =>
      CONECTORES.test(cuerpo.slice(Math.max(0, m.index - 24), m.index)) ||
      DE_NORMA.test(cuerpo.slice(m.index + m[0].length, m.index + m[0].length + 40));

    const lista = [];
    const conCifra = /\bart(?:[íi]culo|\.)\s*(\d+)\s*[°ºo]?\s*(bis|ter|quater|quinquies|sexies)?\s*[.:\-–—]?/gi;
    for (const m of cuerpo.matchAll(conCifra)) {
      if (esCita(m)) continue;
      lista.push({ numero: Number(m[1]), sufijo: m[2] ? m[2].toLowerCase() : "", index: m.index, forma: "cifra" });
    }
    const conPalabras = new RegExp(
      `art[íi]culo\\s+(${ORDINAL_PALABRAS}|[úu]nico)\\s*(bis|ter|quater)?\\s*[.:\\-–—]`,
      "gi"
    );
    for (const m of cuerpo.matchAll(conPalabras)) {
      if (esCita(m)) continue;
      const numero = /^[úu]nico$/i.test(m[1]) ? 1 : valorOrdinal(m[1]);
      if (!numero) continue;
      lista.push({ numero, sufijo: m[2] ? m[2].toLowerCase() : "", index: m.index, forma: "palabras" });
    }
    const primero = lista.length ? Math.min(...lista.map((a) => a.index)) : Infinity;
    // Después de un punto, dos puntos o salto de línea, o de un tramo borrado
    // (el preámbulo queda en blanco y se lleva consigo los dos puntos de la fórmula).
    const suelto = new RegExp(`(^\\s*|[\\n.:;]\\s*|\\s{2,})(${ORDINAL_PALABRAS})\\s*[:.\\-–—]`, "gi");
    for (const m of cuerpo.matchAll(suelto)) {
      const index = m.index + m[1].length;
      if (index >= primero) break;
      const numero = valorOrdinal(m[2]);
      if (numero) lista.push({ numero, sufijo: "", index, forma: "suelto" });
    }
    return lista.sort((a, b) => a.index - b.index);
  }

  /**
   * Encabezados que no dan un número que se pueda citar: "Artículo siguiente:",
   * "Artículo nuevo:", "Artículo 8 o el que corresponda:".
   */
  function encabezadosSinNumero(cuerpo) {
    // Tiene que estar donde empieza un artículo (después de un punto, de dos
    // puntos, de un salto de línea o de un tramo borrado) y llevar el separador
    // de un encabezado. "…lo dispuesto en el artículo anterior." es una remisión.
    const re =
      /(^\s*|[\n.:;]\s*|\s{2,})(art[íi]culo\s+(?:siguiente|anterior|nuevo|[úu]ltimo|que\s+corresponda)\s*(?::|\.?\s*[-–—])|art[íi]culo\s+\d+\s*[°ºo]?\s+o\s+el\s+que\s+corresponda)/gi;
    return [...cuerpo.matchAll(re)].map((m) => ({ index: m.index + m[1].length, texto: m[2] }));
  }

  /** Dónde empieza el articulado: el primer encabezado de artículo, tenga o no número. */
  function inicioDelArticulado(texto) {
    const limpio = sinComillas(texto);
    const posiciones = [...encabezadosDeArticulo(limpio), ...encabezadosSinNumero(limpio)].map((a) => a.index);
    return posiciones.length ? Math.min(...posiciones) : -1;
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
   * Tramos a borrar desde un rótulo (FUNDAMENTOS, ANEXO) hasta el siguiente
   * artículo que continúe la numeración; si no hay ninguno, hasta el final.
   * Así, un bloque intercalado por error no esconde los artículos que vienen
   * después. Un anexo con reglamento propio arranca en el artículo 1: esos
   * artículos son del anexo, no del proyecto, y quedan tapados con él.
   */
  function tramosDesdeRotulos(texto, rotulos, arts) {
    return rotulos
      .sort((a, b) => a - b)
      .map((r) => {
        const previos = arts.filter((a) => a.index < r);
        const ultimo = previos.length ? Math.max(...previos.map((a) => a.numero)) : 0;
        const sigue = arts.find((a) => a.index > r && a.numero > ultimo);
        return [r, sigue ? sigue.index : texto.length];
      });
  }

  function tapar(texto, tramos) {
    let salida = texto;
    for (const [desde, hasta] of tramos) {
      salida = salida.slice(0, desde) + blancos(hasta - desde) + salida.slice(hasta);
    }
    return salida;
  }

  function rotulosDeFundamentos(texto) {
    return [...texto.matchAll(new RegExp(RE_FUNDAMENTOS.source, "g"))].map((f) => f.index);
  }

  /**
   * Deja sólo el articulado, en blanco el resto: el preámbulo (título, VISTO,
   * CONSIDERANDO, fórmula de sanción), los fundamentos y los anexos.
   */
  function soloArticulado(texto) {
    const inicio = inicioDelArticulado(texto);
    if (inicio < 0) return blancos(texto.length);
    const arts = encabezadosDeArticulo(sinComillas(texto));
    const rotulos = [...cabecerasDeAnexo(texto), ...rotulosDeFundamentos(texto)].filter((i) => i > inicio);
    const tramos = tramosDesdeRotulos(texto, rotulos, arts);
    // Las firmas de una ley ya sancionada ("SALA DE SESIONES… Dr. …") tampoco.
    const firmas = texto.slice(inicio).search(/\bSALA\s+DE\s+SESIONES\b|\bSala\s+de\s+Sesiones\b/);
    if (firmas >= 0) tramos.push([inicio + firmas, texto.length]);
    return tapar(blancos(inicio) + texto.slice(inicio), tramos);
  }

  /** El cuerpo normativo limpio: sin preámbulo, sin fundamentos y sin textos citados. */
  const cuerpoNormativo = (texto) => sinComillas(soloArticulado(texto));

  /** Todo lo que está antes del primer artículo: título, VISTO, CONSIDERANDO, fórmula. */
  function preambulo(texto) {
    const inicio = inicioDelArticulado(texto);
    return inicio >= 0 ? texto.slice(0, inicio) : texto;
  }

  /**
   * Todo el texto escrito por quien redacta, menos los fundamentos y lo que
   * está entre comillas: el encabezado, la fórmula, el articulado y los
   * anexos. Para las reglas de escritura ("y/o", siglas, comillas), que valen
   * también fuera de los artículos.
   */
  function textoPropio(texto) {
    const inicio = inicioDelArticulado(texto);
    const arts = encabezadosDeArticulo(sinComillas(texto));
    const fund = rotulosDeFundamentos(texto);
    // Fundamentos antes del articulado (práctica del Senado entrerriano): van
    // desde su rótulo hasta el primer artículo.
    const antes = fund.filter((i) => inicio >= 0 && i < inicio).map((i) => [i, inicio]);
    const despues = tramosDesdeRotulos(texto, fund.filter((i) => inicio < 0 || i > inicio), arts);
    return sinComillas(tapar(texto, [...antes, ...despues]));
  }

  // ---------------------------------------------------------------------------
  // Recorrer coincidencias y citarlas
  // ---------------------------------------------------------------------------

  /** Junta ejemplos evitando citar dos veces la misma frase. */
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

  /** Las oraciones de un texto, con su posición. El punto de "Nº 1.234" no corta. */
  function oraciones(texto) {
    const lista = [];
    const re = /[^.;\n]*(?:\.(?=\d)[^.;\n]*)*[.;\n]?/g;
    let m;
    while ((m = re.exec(texto))) {
      if (!m[0]) {
        re.lastIndex++;
        continue;
      }
      if (m[0].trim()) lista.push({ index: m.index, texto: m[0] });
    }
    return lista;
  }

  /** Posición relativa (0 a 1) dentro de la parte del texto que tiene contenido. */
  function posicionRelativa(cuerpo, index) {
    const inicio = cuerpo.search(/\S/);
    const fin = cuerpo.replace(/\s+$/, "").length;
    if (inicio < 0 || fin <= inicio) return 0;
    return (index - inicio) / (fin - inicio);
  }

  /**
   * Divide el cuerpo en tramos, uno por artículo, con su posición. Los
   * artículos sin número ("Artículo siguiente:") también abren un tramo, con
   * `numero` en null.
   */
  function tramosPorArticulo(cuerpo) {
    const todos = [
      ...encabezadosDeArticulo(cuerpo),
      ...encabezadosSinNumero(cuerpo).map((a) => ({ numero: null, sufijo: "", index: a.index, forma: "sinNumero" })),
    ].sort((a, b) => a.index - b.index);
    // "Artículo 8 o el que corresponda" está en las dos listas: queda una vez.
    const arts = todos.filter((a, k) => k === 0 || a.index !== todos[k - 1].index);
    return arts.map((a, k) => ({
      ...a,
      fin: k + 1 < arts.length ? arts[k + 1].index : cuerpo.replace(/\s+$/, "").length,
    }));
  }

  // Verbos con los que un texto dispone algo. Se usan para reconocer mandatos
  // fuera del articulado y artículos que reúnen varias decisiones.
  const RE_VERBO_NORMATIVO =
    /\b(cr[ée]a(n)?se|decl[áa]ra(n)?se|modif[íi]ca(n)?se|der[óo]ga(n)?se|autor[íi]za(n)?se|establ[ée]ce(n)?se|incorp[óo]ra(n)?se|apru[ée]ba(n)?se|sustit[úu]ye(n)?se|fac[úu]lta(n)?se|disp[óo]ne(n)?se|proh[íi]be(n)?se|des[íi]gna(n)?se|instit[úu]ye(n)?se|encomi[ée]nda(n)?se)\b/gi;

  // ---------------------------------------------------------------------------
  // Números escritos en letras, para cotejarlos con la cifra entre paréntesis
  // ---------------------------------------------------------------------------

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
    const previo = normalizar(cuerpo.slice(Math.max(0, index - 60), index))
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

  // ---------------------------------------------------------------------------
  // Alcance: qué tipos de instrumento revisa la herramienta
  // ---------------------------------------------------------------------------

  /** El mismo texto en todos los lugares donde se advierte el alcance. */
  const ALCANCE =
    "Esta herramienta revisa solamente leyes nacionales, leyes provinciales y ordenanzas. " +
    "No revisa resoluciones, decretos, comunicaciones, declaraciones, minutas ni pedidos de informes.";

  const NOMBRE_INSTRUMENTO = {
    resolucion: "una resolución",
    resuelve: "una resolución",
    decreto: "un decreto",
    decreta: "un decreto",
    comunicacion: "una comunicación",
    comunica: "una comunicación",
    declaracion: "una declaración",
    declara: "una declaración",
    minuta: "una minuta",
    "pedido de informe": "un pedido de informes",
    "pedido de informes": "un pedido de informes",
  };

  /**
   * ¿El documento se presenta como un instrumento que la herramienta no revisa?
   * Devuelve su nombre ("una resolución") o null.
   *
   * Sólo mira la denominación del encabezado: "PROYECTO DE RESOLUCIÓN" o la
   * palabra en mayúsculas ("DECRETO Nº 45"). Una cita en minúsculas dentro del
   * VISTO ("la Resolución Nº 12") no cuenta, y si lo primero que aparece es
   * "ley" u "ordenanza", el documento está cubierto. Si no hay denominación,
   * busca la fórmula ("RESUELVE:", "DECRETA:") antes del primer artículo.
   */
  function instrumentoNoCubierto(texto) {
    const inicio = texto.slice(0, 400);
    const candidatos = [];
    for (const re of [
      /proyecto\s+de\s+(ley|ordenanza|resoluci[óo]n|decreto|comunicaci[óo]n|declaraci[óo]n|minuta|pedido\s+de\s+informes?)/gi,
      /\b(LEY|ORDENANZA|RESOLUCI[ÓO]N|DECRETO|COMUNICACI[ÓO]N|DECLARACI[ÓO]N|MINUTA|PEDIDO\s+DE\s+INFORMES?)\b/g,
    ]) {
      for (const m of inicio.matchAll(re)) candidatos.push({ index: m.index, tipo: m[1] });
    }

    if (!candidatos.length) {
      const art1 = texto.search(/\bart[íi]culo\s*1\s*[°ºo]?\s*[.:\-–—]/i);
      const encabezado = texto.slice(0, art1 >= 0 ? art1 : 1500);
      const formula = /\b(RESUELVE|DECRETA|DECLARA|COMUNICA)\s*:/.exec(encabezado);
      if (formula) candidatos.push({ index: formula.index, tipo: formula[1] });
    }
    if (!candidatos.length) return null;

    candidatos.sort((a, b) => a.index - b.index);
    const clave = normalizar(candidatos[0].tipo).replace(/\s+/g, " ");
    return NOMBRE_INSTRUMENTO[clave] || null;
  }

  return {
    blancos,
    normalizar,
    sinComillas,
    RE_FUNDAMENTOS,
    NORMA,
    encabezadosDeArticulo,
    encabezadosSinNumero,
    inicioDelArticulado,
    cabecerasDeAnexo,
    soloArticulado,
    cuerpoNormativo,
    preambulo,
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
    ALCANCE,
    instrumentoNoCubierto,
  };
})();
