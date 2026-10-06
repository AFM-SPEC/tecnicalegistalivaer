/**
 * Revisor de Técnica Legislativa — interfaz.
 *
 * Tres pantallas, una sola página:
 *   carga    → documento, jurisdicción y botón.
 *   proceso  → las cuatro etapas del análisis, con el documento todavía a la vista.
 *   revisión → el informe: el documento a la izquierda, las observaciones a la derecha.
 *
 * SEGURIDAD DEL TEXTO
 * -------------------
 * `titulo`, `descripcion` y `sugerencia` de cada regla son HTML escrito a mano
 * en js/rules/*.js: se insertan tal cual para poder usar <em> o <strong>. Todo
 * lo que viene del documento subido (los `ejemplos`, el nombre del archivo, el
 * texto del documento) pasa siempre por escaparHtml(). Si algún día una regla
 * arma su `sugerencia` con texto del usuario, hay que escaparlo ahí.
 */

(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Elementos
  // ---------------------------------------------------------------------------

  const cuerpoPagina = document.body;

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const dropzoneTitulo = document.getElementById("dropzone-titulo");
  const dropzoneAccion = document.getElementById("dropzone-accion");
  const documentoMensaje = document.getElementById("documento-mensaje");
  const btnQuitar = document.getElementById("btn-quitar");
  const btnAnalizar = document.getElementById("btn-analizar");

  const etapasEl = document.getElementById("etapas");
  const procesoDetalle = document.getElementById("proceso-detalle");
  const procesoMensaje = document.getElementById("proceso-mensaje");
  const procesoBarra = document.getElementById("proceso-barra");
  const procesoBarraRelleno = document.getElementById("proceso-barra-relleno");
  const procesoPorcentaje = document.getElementById("proceso-porcentaje");
  const procesoFalla = document.getElementById("proceso-falla");
  const procesoFallaTexto = document.getElementById("proceso-falla-texto");
  const btnReintentar = document.getElementById("btn-reintentar");

  const revisionArchivo = document.getElementById("revision-archivo");
  const revisionDatos = document.getElementById("revision-datos");
  const btnCopiar = document.getElementById("btn-copiar");
  const btnImprimir = document.getElementById("btn-imprimir");
  const btnOtro = document.getElementById("btn-otro");
  const copiarEstado = document.getElementById("copiar-estado");

  const revisionCuerpo = document.querySelector(".revision-cuerpo");
  const pestanas = [...document.querySelectorAll(".pestana")];
  const pestanaCuenta = document.getElementById("pestana-cuenta");
  const panelDocumento = document.getElementById("panel-documento");
  const panelObservaciones = document.getElementById("panel-observaciones");

  const hojaRotulo = document.getElementById("hoja-rotulo");
  const hojaTexto = document.getElementById("hoja-texto");
  const informeCabecera = document.getElementById("informe-cabecera");
  const informeIntro = document.getElementById("informe-intro");
  const informeCambio = document.getElementById("informe-cambio");
  const btnMenu = document.getElementById("btn-menu");
  const accionesEl = document.getElementById("revision-acciones");
  const volverEl = document.getElementById("volver");
  const volverLugar = document.getElementById("volver-lugar");
  const btnVolver = document.getElementById("btn-volver");
  const informeLista = document.getElementById("informe-lista");
  const informeFuentes = document.getElementById("informe-fuentes");

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------

  let archivoActual = null;
  let ultimoAnalisis = null;
  let ultimoAmbito = null;
  let ultimoTexto = "";
  let etapaEnCurso = null;
  let filtroPrioridad = "todas";
  let filtroEstado = "todas";
  const gruposCerrados = new Set();
  let seleccion = null;
  const resueltas = new Set();

  const EXTENSIONES_VALIDAS = ["pdf", "doc", "docx", "md", "txt", "png", "jpg", "jpeg"];

  const NOMBRE_AMBITO = {
    nacional: "Congreso de la Nación",
    provincial: "Legislatura de Entre Ríos",
    municipal: "Concejo Deliberante de Entre Ríos",
  };

  const PRIORIDAD_CORTA = { alta: "Alta", media: "Media", baja: "Baja" };

  /**
   * Cuánto obliga cada regla. No todas pesan igual: una práctica uniforme de la
   * Legislatura no es una exigencia constitucional. La prioridad dice cuánto
   * urge corregir; esto dice con qué derecho se pide.
   */
  const EXIGENCIA = {
    EXIGE: "Regla obligatoria",
    "CRITERIO LEGAL CONDICIONADO": "Criterio legal de aplicación condicionada",
    RECOMIENDA: "Directriz institucional",
    ACOSTUMBRA: "Práctica uniforme, no obligación",
    SUBSIDIARIO: "Criterio de estilo, no obligación provincial",
    "REVISIÓN": "Aviso de revisión: requiere criterio jurídico",
  };

  /**
   * En los municipios casi ninguna regla de redacción tiene una norma común que
   * la imponga: la mayoría son criterios de estilo, y lo que depende de cada
   * Concejo se aclara como tal.
   */
  const EXIGENCIA_MUNICIPAL = {
    ...EXIGENCIA,
    ACOSTUMBRA: "Práctica frecuente, no obligación",
    SUBSIDIARIO: "Criterio de estilo, no obligación municipal",
    "VERIFICAR LOCALMENTE": "Depende del reglamento de cada Concejo",
  };

  function exigenciaDe(autoridad) {
    return (ultimoAmbito === "municipal" ? EXIGENCIA_MUNICIPAL : EXIGENCIA)[autoridad];
  }

  /** De dónde salen las reglas de cada ámbito. Se muestra al final del informe. */
  const FUENTES = {
    nacional: {
      titulo: "De dónde salen estas reglas",
      intro:
        `Las ${(window.ReglasNacional || []).length} reglas del ámbito nacional se tomaron de los dos ` +
        "textos de referencia en la materia:",
      lista: [
        '<strong>Manual de Técnica Legislativa</strong> — Digesto Jurídico Argentino, publicado por ' +
          'InfoLeg, publicado en <a class="enlace-fuente" href="https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html" ' +
          'target="_blank" rel="noopener">https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html</a>',
        "<strong>Técnica Legislativa: Marco Teórico</strong> — Grosso, B. M. y Svetaz, M. A.",
      ],
      cierre:
        "Cada observación indica además el punto exacto del Manual en el que se apoya.",
    },
    provincial: {
      titulo: "De dónde salen estas reglas",
      intro:
        `Las ${(window.ReglasProvincialER || []).length} reglas se reconstruyeron a partir de fuentes ` +
        "de distinto peso, y por eso cada " +
        "observación aclara cuánto obliga:",
      lista: [
        "<strong>Constitución de la Provincia de Entre Ríos (2008)</strong> — sobre todo los artículos 130, 131 y 132. Es la única fuente que obliga por sí sola.",
        "<strong>Ley Nº 9.971 del Digesto Jurídico</strong> — sus criterios de redacción se aplican a los proyectos por analogía.",
        "<strong>Reglamento de la Cámara de Diputados</strong> (texto ordenado 2021) y <strong>Reglamento de la Cámara de Senadores</strong> (diciembre de 2023).",
        "<strong>Modelos e instructivos oficiales</strong> de ambas cámaras.",
        "<strong>La práctica medida</strong> sobre 53 leyes entrerrianas sancionadas entre 2025 y 2026, según el Boletín Oficial.",
        '<strong>Criterios doctrinarios y del Manual de Técnica Legislativa</strong> — Digesto Jurídico ' +
          'Argentino, publicado por InfoLeg, publicado en ' +
          '<a class="enlace-fuente" href="https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html" ' +
          'target="_blank" rel="noopener">https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html</a>, ' +
          'sólo donde no hay regla entrerriana que cubra el punto.',
      ],
      cierre: "",
    },
    municipal: {
      titulo: "De dónde salen estas reglas",
      intro:
        `Las ${(window.ReglasMunicipalER || []).length} reglas salen del <strong>Manual de Técnica ` +
        "Legislativa Municipal de Entre Ríos</strong>, que ordena estas fuentes:",
      lista: [
        "<strong>Constitución de la Provincia de Entre Ríos</strong> y <strong>Ley Orgánica de " +
          "Municipios Nº 10.027</strong> — el marco del régimen municipal. La herramienta no controla " +
          "competencia, trámite, mayorías, promulgación ni publicación.",
        '<strong>Manual de Técnica Legislativa</strong> — Digesto Jurídico Argentino, publicado por ' +
          'InfoLeg en <a class="enlace-fuente" href="https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html" ' +
          'target="_blank" rel="noopener">https://www.infoleg.gob.ar/basehome/manualdetecnicalegislativa.html</a>, ' +
          "y doctrina especializada — criterio subsidiario, del que salen casi todas las reglas automáticas.",
        "<strong>Técnica legislativa municipal. Cómo escribir correctamente una ordenanza municipal</strong> — " +
          "Héctor Pérez Bourbon, Konrad Adenauer Stiftung y CIMA (2024). Doctrina, criterio subsidiario: de " +
          "ahí salen las reglas sobre vigencia, modificaciones, derogaciones, epígrafes, palabras innecesarias " +
          "y tiempos verbales. Donde choca con el Manual municipal, se sigue este cuadernillo.",
        "<strong>Reglamento Interno de cada Concejo Deliberante</strong> — todavía no se aplica. De la " +
          "fórmula de sanción y del artículo de cierre sólo se revisa que estén: Entre Ríos tiene más de " +
          "80 municipios y cada Concejo usa su propia fórmula, así que no se puede sugerir una única. " +
          "Las firmas no se revisan.",
      ],
      cierre:
        "Ninguna observación es una obligación general de todos los municipios: son recomendaciones " +
        "de estilo, salvo donde la etiqueta de cada una diga otra cosa.",
      // Lo que la herramienta no puede revisar: el decálogo de Pérez Bourbon
      // (Técnica legislativa municipal, pp. 67-68) y los requisitos de calidad
      // del contenido (pp. 19-24). Se muestra al final del informe.
      revisar: {
        titulo: "Antes de presentar el proyecto",
        intro:
          "Esto la herramienta no lo puede revisar: hace falta criterio jurídico o conocer el resto de " +
          "las normas. Lo resume el decálogo de Pérez Bourbon (<em>Técnica legislativa municipal</em>, pp. 67-68).",
        lista: [
          "La decisión política que transmite la ordenanza está claramente definida, y es viable y oportuna.",
          "El tema es competencia del municipio y no está ya regulado por otra norma.",
          "El contenido respeta las normas de rango superior: Constitución, Ley Nº 10.027 y, si existe, la Carta Orgánica.",
          "Corresponde una ordenanza y no una resolución, un decreto del Concejo, una comunicación o una declaración.",
          "Está definido a qué personas alcanza la ordenanza y en qué territorio se aplica.",
          "Incorporar la ordenanza no deja lagunas, redundancias ni contradicciones con otras normas.",
          "Las normas que otras normas citan y que esta deroga o modifica siguen teniendo a dónde remitir.",
          "Lo leyó alguien que no participó en la redacción, y lo entendió como se quiso escribir.",
        ],
      },
    },
  };

  /** Se muestra en las fuentes de los tres ámbitos: es el mismo criterio para todos. */
  const CRITERIO_PRIORIDAD =
    "La prioridad sigue el mismo criterio en los tres ámbitos: alta si el error puede cambiar qué " +
    "manda la norma, a quién o desde cuándo; media si dificulta identificarla, entenderla o citarla; " +
    "baja si es de forma o estilo. Cuánto obliga cada regla se indica aparte, en cada observación.";

  const CATEGORIAS = (window.CategoriasReglas && window.CategoriasReglas.orden) || [];

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  function escaparHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escaparAtributo(str) {
    return escaparHtml(str).replace(/"/g, "&quot;");
  }

  function numero(n) {
    return n.toLocaleString("es-AR");
  }

  function plural(n, singular, pluralTexto) {
    return n === 1 ? singular : pluralTexto;
  }

  function extensionDe(nombre) {
    const partes = String(nombre).toLowerCase().split(".");
    return partes.length > 1 ? partes.pop() : "";
  }

  const sinMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pantallaAngosta = () => window.matchMedia("(max-width: 1023px)").matches;

  /** Le da al navegador una vuelta para pintar antes de seguir con la etapa siguiente. */
  function respirar(ms = 200) {
    return new Promise((resolver) =>
      requestAnimationFrame(() => setTimeout(resolver, sinMovimiento() ? 0 : ms))
    );
  }

  const pantallaProceso = document.getElementById("pantalla-proceso");
  const pantallaRevision = document.getElementById("pantalla-revision");

  function fase(nombre) {
    cuerpoPagina.dataset.fase = nombre;
    pantallaProceso.hidden = nombre !== "proceso";
    pantallaRevision.hidden = nombre !== "revision";
  }

  // ---------------------------------------------------------------------------
  // 01 · Carga del documento y sus estados
  //
  // inicial · arrastre · cargado · invalido · leyendo · procesando
  // ---------------------------------------------------------------------------

  const TEXTOS_CARGA = {
    inicial: {
      titulo: "Arrastrá el proyecto acá",
      accion: "o hacé clic para elegir un archivo",
    },
    arrastre: {
      titulo: "Soltá el archivo",
      accion: "se carga apenas lo sueltes",
    },
    invalido: {
      titulo: "Ese archivo no se puede leer",
      accion: "Elegí otro, o convertilo a PDF",
    },
  };

  function estadoCarga(estado, extra = {}) {
    const base = TEXTOS_CARGA[estado] || {};
    dropzone.dataset.estado = estado;
    dropzoneTitulo.textContent = extra.titulo || base.titulo || "";
    dropzoneAccion.textContent = extra.accion || base.accion || "";

    documentoMensaje.textContent = extra.mensaje || "";
    if (extra.tono) documentoMensaje.dataset.tono = extra.tono;
    else delete documentoMensaje.dataset.tono;
  }

  function descripcionArchivo(file) {
    const ext = extensionDe(file.name).toUpperCase();
    const kb = file.size / 1024;
    const peso = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
    return `${ext} · ${peso}`;
  }

  function tomarArchivo(file) {
    const ext = extensionDe(file.name);

    if (!EXTENSIONES_VALIDAS.includes(ext)) {
      archivoActual = null;
      fileInput.value = "";
      btnAnalizar.disabled = true;
      btnQuitar.hidden = true;
      estadoCarga("invalido", {
        mensaje: `El formato .${ext || "sin extensión"} no está entre los admitidos: PDF, DOCX, TXT, MD, PNG o JPG.`,
        tono: "error",
      });
      return;
    }

    archivoActual = file;
    btnAnalizar.disabled = false;
    btnQuitar.hidden = false;
    estadoCarga("cargado", {
      titulo: file.name,
      accion: `${descripcionArchivo(file)} · listo para analizar`,
    });
  }

  function quitarArchivo() {
    archivoActual = null;
    fileInput.value = "";
    btnAnalizar.disabled = true;
    btnQuitar.hidden = true;
    estadoCarga("inicial");
    fileInput.focus();
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) tomarArchivo(fileInput.files[0]);
  });

  btnQuitar.addEventListener("click", quitarArchivo);

  // El área de arrastre cubre toda la ventana, no sólo el recuadro: soltar un
  // archivo en cualquier parte de la pantalla de carga lo toma igual.
  let arrastres = 0;
  let estadoAntesDelArrastre = "inicial";

  function enCarga() {
    return cuerpoPagina.dataset.fase === "carga";
  }

  document.addEventListener("dragenter", (e) => {
    if (!enCarga()) return;
    e.preventDefault();
    if (arrastres === 0) estadoAntesDelArrastre = dropzone.dataset.estado;
    arrastres++;
    estadoCarga("arrastre");
  });

  document.addEventListener("dragover", (e) => {
    if (enCarga()) e.preventDefault();
  });

  document.addEventListener("dragleave", () => {
    if (!enCarga()) return;
    arrastres--;
    if (arrastres <= 0) {
      arrastres = 0;
      restaurarDespuesDelArrastre();
    }
  });

  document.addEventListener("drop", (e) => {
    if (!enCarga()) return;
    e.preventDefault();
    arrastres = 0;
    if (e.dataTransfer.files.length > 0) tomarArchivo(e.dataTransfer.files[0]);
    else restaurarDespuesDelArrastre();
  });

  function restaurarDespuesDelArrastre() {
    if (archivoActual) {
      estadoCarga("cargado", {
        titulo: archivoActual.name,
        accion: `${descripcionArchivo(archivoActual)} · listo para analizar`,
      });
    } else if (estadoAntesDelArrastre === "invalido") {
      dropzone.dataset.estado = "invalido";
      estadoCarga("invalido", {
        mensaje: documentoMensaje.textContent,
        tono: "error",
      });
    } else {
      estadoCarga("inicial");
    }
  }

  function ambitoElegido() {
    return document.querySelector('input[name="ambito"]:checked').value;
  }

  // ---------------------------------------------------------------------------
  // 03 · Las cuatro etapas del análisis
  // ---------------------------------------------------------------------------

  function etapa(clave, estado, nota) {
    const fila = etapasEl.querySelector(`[data-etapa="${clave}"]`);
    if (!fila) return;
    fila.dataset.estado = estado;
    if (nota !== undefined) fila.querySelector(".etapa-nota").textContent = nota;
    if (estado === "activo") etapaEnCurso = clave;
  }

  function reiniciarEtapas() {
    etapasEl.querySelectorAll(".etapa").forEach((fila) => {
      fila.dataset.estado = "pendiente";
      fila.querySelector(".etapa-nota").textContent = "";
    });
    etapaEnCurso = null;
    procesoFalla.hidden = true;
    ocultarDetalle();
  }

  function ocultarDetalle() {
    procesoDetalle.hidden = true;
    procesoBarra.hidden = true;
    procesoPorcentaje.hidden = true;
    procesoBarraRelleno.style.width = "0%";
  }

  /**
   * Lo que informa la extracción: un mensaje (por ejemplo, que hay que leer el
   * PDF con reconocimiento óptico) y, cuando la espera es larga de verdad, el
   * porcentaje real de ese reconocimiento.
   */
  function avanceExtraccion(mensaje, fraccion) {
    procesoDetalle.hidden = false;
    if (mensaje !== undefined) procesoMensaje.textContent = mensaje;
    if (fraccion !== undefined) {
      const porcentaje = Math.min(100, Math.max(0, Math.round(fraccion * 100)));
      procesoBarra.hidden = false;
      procesoPorcentaje.hidden = false;
      procesoBarraRelleno.style.width = `${porcentaje}%`;
      procesoPorcentaje.textContent = `${porcentaje}%`;
    }
  }

  function fallar(texto) {
    if (etapaEnCurso) etapa(etapaEnCurso, "fallo");
    ocultarDetalle();
    procesoFallaTexto.textContent = texto;
    procesoFalla.hidden = false;
    if (archivoActual) {
      estadoCarga("cargado", {
        titulo: archivoActual.name,
        accion: descripcionArchivo(archivoActual),
      });
    }
  }

  btnReintentar.addEventListener("click", volverACarga);

  function volverACarga() {
    fase("carga");
    reiniciarEtapas();
    quitarArchivo();
    seleccion = null;
    filtroPrioridad = "todas";
    filtroEstado = "todas";
    gruposCerrados.clear();
    resueltas.clear();
    copiarEstado.textContent = "";
    abrirMenu(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  btnOtro.addEventListener("click", volverACarga);

  // ---------------------------------------------------------------------------
  // El análisis
  // ---------------------------------------------------------------------------

  btnAnalizar.addEventListener("click", async () => {
    if (!archivoActual) return;

    const ambito = ambitoElegido();
    const archivo = archivoActual;

    fase("proceso");
    reiniciarEtapas();
    btnQuitar.hidden = true;
    estadoCarga("leyendo", { titulo: archivo.name, accion: "Leyendo el archivo…" });
    etapa("extraccion", "activo");

    try {
      const texto = await Extract.extract(archivo, avanceExtraccion);
      ocultarDetalle();

      if (!texto || texto.trim().length < 20) {
        fallar(
          "No se pudo extraer texto suficiente del documento. Si es una imagen o un PDF " +
            "escaneado, verificá que el texto se lea con claridad."
        );
        return;
      }

      const palabras = (texto.trim().match(/\S+/g) || []).length;
      etapa("extraccion", "hecho", `${numero(palabras)} palabras`);

      estadoCarga("procesando", {
        titulo: archivo.name,
        accion: "Revisando la técnica legislativa…",
      });

      etapa("estructura", "activo");
      await respirar();
      const estructura = RuleEngine.estructura(texto, ambito);
      const articulos = estructura.filter((h) => h.etiqueta.startsWith("Artículo")).length;
      etapa(
        "estructura",
        "hecho",
        articulos
          ? `${articulos} ${plural(articulos, "artículo", "artículos")}`
          : "sin artículos numerados"
      );

      etapa("reglas", "activo");
      await respirar();
      const analisis = RuleEngine.analyze(texto, ambito);
      etapa(
        "reglas",
        "hecho",
        `${analisis.totalReglas} ${plural(analisis.totalReglas, "regla evaluada", "reglas evaluadas")}`
      );

      etapa("informe", "activo");
      await respirar();

      ultimoAnalisis = analisis;
      ultimoAmbito = ambito;
      ultimoTexto = texto;
      resueltas.clear();
      seleccion = null;

      const total = analisis.hallazgos.length;
      armarRevision(analisis, ambito, texto, archivo);
      etapa("informe", "hecho", `${total} ${plural(total, "observación", "observaciones")}`);

      await respirar(260);
      fase("revision");
      panelObservaciones.scrollTop = 0;
      panelDocumento.scrollTop = 0;
      panelObservaciones.focus({ preventScroll: true });
      if (!tutorialVisto("revision")) setTimeout(() => abrirTutorial("revision"), 450);
    } catch (err) {
      fallar(`No se pudo analizar el documento. ${err.message}`);
    }
  });

  // ---------------------------------------------------------------------------
  // El documento, con los fragmentos señalados
  //
  // El texto se dibuja entero, tal como se extrajo, y encima se marcan dos
  // cosas: los encabezados de artículo (para poder leerlo) y los fragmentos que
  // originaron una observación (para poder saltar a ellos). Como dos marcas
  // pueden pisarse, el texto se corta en tramos y cada tramo sabe a qué
  // observaciones pertenece.
  // ---------------------------------------------------------------------------

  function documentoHtml(texto, analisis) {
    const largo = texto.length;
    const tramos = [];

    analisis.hallazgos.forEach((h) => {
      h.ejemplos.forEach((e) => {
        if (!e.rango) return;
        const inicio = Math.max(0, Math.min(largo, e.rango.inicio));
        const fin = Math.max(inicio, Math.min(largo, e.rango.fin));
        if (fin > inicio) tramos.push({ inicio, fin, tipo: "marca", id: h.id });
      });
    });

    (analisis.estructura || []).forEach((hito) => {
      const inicio = Math.max(0, Math.min(largo, hito.index));
      const fin = Math.max(inicio, Math.min(largo, hito.index + (hito.largo || 0)));
      if (fin > inicio) tramos.push({ inicio, fin, tipo: "hito", etiqueta: hito.etiqueta });
    });

    const cortes = new Set([0, largo]);
    tramos.forEach((t) => {
      cortes.add(t.inicio);
      cortes.add(t.fin);
    });
    const puntos = [...cortes].sort((a, b) => a - b);

    const hitosUbicados = new Set();
    let html = "";

    for (let i = 0; i < puntos.length - 1; i++) {
      const desde = puntos[i];
      const hasta = puntos[i + 1];
      const trozo = escaparHtml(texto.slice(desde, hasta));
      const encima = tramos.filter((t) => t.inicio <= desde && t.fin >= hasta);

      const ids = [...new Set(encima.filter((t) => t.tipo === "marca").map((t) => t.id))];
      const hito = encima.find((t) => t.tipo === "hito");

      let atributos = "";
      const clases = [];

      if (hito) {
        clases.push("hoja-hito");
        if (!hitosUbicados.has(hito.etiqueta)) {
          hitosUbicados.add(hito.etiqueta);
          atributos += ` data-hito="${escaparAtributo(hito.etiqueta)}"`;
        }
      }

      if (ids.length) {
        clases.push("marca");
        atributos += ` data-obs="${escaparAtributo(ids.join(" "))}"`;
        html += `<mark class="${clases.join(" ")}"${atributos}>${trozo}</mark>`;
      } else if (hito) {
        html += `<span class="${clases.join(" ")}"${atributos}>${trozo}</span>`;
      } else {
        html += trozo;
      }
    }

    return html;
  }

  // ---------------------------------------------------------------------------
  // El informe
  //
  // Estado de la revisión (se reinicia con cada análisis):
  //   filtroPrioridad  todas · alta · media · baja
  //   filtroEstado     todas · pendientes · resueltas
  //   seleccion        la observación abierta y activa (una sola a la vez)
  //   gruposCerrados   categorías plegadas
  //   resueltas        observaciones marcadas como corregidas
  // ---------------------------------------------------------------------------

  const CLAVE_PISTA = "neeti.pistaResuelta";

  /** La explicación de cómo marcar una observación se muestra hasta la primera vez que se usa. */
  function pistaYaVista() {
    try {
      return localStorage.getItem(CLAVE_PISTA) === "1";
    } catch (err) {
      return false;
    }
  }

  function recordarPista() {
    try {
      localStorage.setItem(CLAVE_PISTA, "1");
    } catch (err) {
      // Sin almacenamiento disponible la pista vuelve a aparecer: no pasa nada más.
    }
  }

  function conteoPorSeveridad(hallazgos) {
    const conteo = { alta: 0, media: 0, baja: 0 };
    hallazgos.forEach((h) => conteo[h.severidad]++);
    return conteo;
  }

  function hallazgoPorId(id) {
    if (!id || !ultimoAnalisis) return null;
    return ultimoAnalisis.hallazgos.find((h) => h.id === id) || null;
  }

  function pasaFiltros(h) {
    if (filtroPrioridad !== "todas" && h.severidad !== filtroPrioridad) return false;
    if (filtroEstado === "pendientes" && resueltas.has(h.id)) return false;
    if (filtroEstado === "resueltas" && !resueltas.has(h.id)) return false;
    return true;
  }

  function armarRevision(analisis, ambito, texto, archivo) {
    const total = analisis.hallazgos.length;
    const articulos = (analisis.estructura || []).filter((h) =>
      h.etiqueta.startsWith("Artículo")
    ).length;

    // La jurisdicción va aparte del resto de los datos: en el celular es lo
    // único que se muestra junto al nombre del archivo.
    const extra =
      `${articulos ? ` · ${articulos} ${plural(articulos, "artículo", "artículos")}` : ""}` +
      ` · ${analisis.totalReglas} ${plural(analisis.totalReglas, "regla evaluada", "reglas evaluadas")}`;
    revisionArchivo.textContent = archivo.name;
    revisionDatos.innerHTML =
      `<span class="dato-ambito">${escaparHtml(NOMBRE_AMBITO[ambito])}</span>` +
      `<span class="dato-extra">${escaparHtml(extra)}</span>`;

    // Sólo se ve en papel: un informe impreso sin fecha no sirve como antecedente.
    document.getElementById("revision-fecha").textContent = `Analizado el ${new Date().toLocaleDateString(
      "es-AR",
      { day: "numeric", month: "long", year: "numeric" }
    )}`;

    hojaRotulo.textContent = `Texto analizado · ${NOMBRE_AMBITO[ambito]}`;
    hojaTexto.innerHTML = documentoHtml(texto, analisis);

    pestanaCuenta.textContent = total ? String(total) : "";

    filtroPrioridad = "todas";
    filtroEstado = "todas";
    seleccion = null;
    gruposCerrados.clear();

    // En tablet vertical y celular las categorías arrancan plegadas, salvo la
    // primera: se ve el mapa completo del informe sin un muro de observaciones.
    if (pantallaAngosta()) {
      let primera = true;
      CATEGORIAS.forEach((c) => {
        if (!analisis.hallazgos.some((h) => (h.categoria || "otras") === c.clave)) return;
        if (primera) primera = false;
        else gruposCerrados.add(c.clave);
      });
    }

    informeCambio.hidden = true;
    informeCambio.textContent = "";
    informeCabecera.innerHTML = cabeceraHtml(analisis);
    informeIntro.innerHTML = introHtml(analisis);
    informeFuentes.innerHTML = fuentesHtml(ambito, analisis);
    renderLista();

    abrirMenu(false);
    verVista("observaciones");
  }

  /** La parte fija del informe: título, totales y los dos filtros. */
  function cabeceraHtml(analisis) {
    const total = analisis.hallazgos.length;
    const reglas = `${analisis.totalReglas} ${plural(analisis.totalReglas, "regla evaluada", "reglas evaluadas")}`;
    const titulo = `<div class="informe-resumen"><h2 class="informe-titulo">Informe de revisión</h2>`;

    if (analisis.totalReglas === 0) {
      return `${titulo}</div><p class="informe-total">Sin reglas cargadas para esta jurisdicción</p>`;
    }

    if (total === 0) {
      return `${titulo}</div><p class="informe-total">Ninguna observación sobre ${reglas}</p>`;
    }

    const conteo = conteoPorSeveridad(analisis.hallazgos);

    const opcion = (grupo, valor, etiqueta, cantidad) => `
      <button type="button" class="filtro-opcion" data-grupo="${grupo}" data-valor="${valor}"
              aria-pressed="false"${grupo === "prioridad" && cantidad === 0 ? " disabled" : ""}>
        ${
          grupo === "prioridad" && valor !== "todas"
            ? `<span class="filtro-cuadro ${valor}" aria-hidden="true"></span>`
            : ""
        }
        <span>${etiqueta}</span>
        <span class="filtro-cuenta" data-cuenta="${grupo}-${valor}">${cantidad}</span>
      </button>`;

    return `
      ${titulo}
        <p class="informe-resueltas" id="contador-resueltas" aria-live="polite"></p>
      </div>
      <p class="informe-total">
        ${total} ${plural(total, "observación", "observaciones")} sobre ${reglas}
      </p>
      <div class="informe-filtros">
        <div class="filtro-fila">
          <span class="filtro-rotulo" id="rotulo-prioridad">Prioridad</span>
          <div class="filtro" role="group" aria-labelledby="rotulo-prioridad">
            ${opcion("prioridad", "todas", "Todas", total)}
            ${opcion("prioridad", "alta", "Alta", conteo.alta)}
            ${opcion("prioridad", "media", "Media", conteo.media)}
            ${opcion("prioridad", "baja", "Baja", conteo.baja)}
          </div>
        </div>
        <div class="filtro-fila">
          <span class="filtro-rotulo" id="rotulo-estado">Estado</span>
          <div class="filtro" role="group" aria-labelledby="rotulo-estado">
            ${opcion("estado", "todas", "Todas", total)}
            ${opcion("estado", "pendientes", "Pendientes", total)}
            ${opcion("estado", "resueltas", "Resueltas", 0)}
          </div>
        </div>
      </div>`;
  }

  /**
   * Cuando el documento se presenta como un instrumento que la herramienta no
   * revisa (resolución, decreto…). La revisión se hace igual: la detección del
   * tipo puede fallar, y quien redacta decide qué le sirve.
   */
  function avisoInstrumento(analisis) {
    return (
      `Este documento parece ser ${analisis.instrumentoNoCubierto}. ${RuleEngine.ALCANCE} ` +
      "La revisión se hizo igual, pero algunas observaciones pueden no corresponder a este tipo de instrumento."
    );
  }

  /** Lo que se lee antes de empezar: el alcance, cómo marcar y el aviso de prioridad alta. */
  function introHtml(analisis) {
    if (analisis.totalReglas === 0) return "";
    const total = analisis.hallazgos.length;
    const conteo = conteoPorSeveridad(analisis.hallazgos);

    return `
      ${
        analisis.instrumentoNoCubierto
          ? `<p class="informe-aviso informe-aviso--alcance">${escaparHtml(avisoInstrumento(analisis))}</p>`
          : ""
      }
      <p class="informe-nota">
        Son sugerencias de forma: corregir o no, y cómo, lo decide quien redacta la norma.
      </p>
      ${
        total > 0 && !pistaYaVista()
          ? `<p class="informe-pista" id="pista-resuelta">
               <span class="informe-pista-marca" aria-hidden="true"></span>
               Marcá una observación cuando la hayas corregido.
             </p>`
          : ""
      }
      ${
        conteo.alta > 0
          ? `<p class="informe-aviso">
               ${conteo.alta} ${plural(conteo.alta, "observación", "observaciones")} de prioridad alta:
               ${plural(conteo.alta, "puede", "pueden")} afectar el efecto jurídico, la vigencia o el
               alcance de la norma. Conviene empezar por ahí.
             </p>`
          : ""
      }`;
  }

  function renderLista() {
    if (!ultimoAnalisis) return;
    informeLista.innerHTML = listaHtml(ultimoAnalisis);
    actualizarFiltros();
    actualizarContadorResueltas();
    actualizarMarcas();
  }

  /** Las observaciones, agrupadas por categoría y ordenadas por prioridad. */
  function listaHtml(analisis) {
    if (analisis.totalReglas === 0) {
      return `
        <div class="informe-vacio">
          <span class="informe-vacio-titulo">Todavía no</span>
          Este tipo de norma no se puede revisar por ahora. Están cargadas las reglas
          del Congreso de la Nación y las de la Legislatura de Entre Ríos; las de los
          concejos deliberantes todavía no.
        </div>`;
    }

    if (analisis.hallazgos.length === 0) {
      return `
        <div class="informe-vacio">
          <span class="informe-vacio-titulo">Sin observaciones</span>
          El proyecto cumple con las ${analisis.totalReglas} reglas evaluadas. Esto revisa la
          técnica de redacción: no dice nada sobre el contenido de la norma.
        </div>`;
    }

    const visibles = analisis.hallazgos.filter(pasaFiltros);

    if (visibles.length === 0) {
      return `
        <div class="informe-vacio">
          <span class="informe-vacio-titulo">Nada con estos filtros</span>
          No hay observaciones que cumplan los filtros elegidos.
          <button type="button" class="informe-limpiar" data-accion="limpiar-filtros">
            Ver todas las observaciones
          </button>
        </div>`;
    }

    // La numeración es la del informe completo, no la del filtro: "03" tiene
    // que seguir siendo la misma categoría aunque se filtre por prioridad.
    const numeros = {};
    let n = 0;
    CATEGORIAS.forEach((c) => {
      if (analisis.hallazgos.some((h) => (h.categoria || "otras") === c.clave)) {
        numeros[c.clave] = String(++n).padStart(2, "0");
      }
    });

    const orden = { alta: 0, media: 1, baja: 2 };

    return CATEGORIAS.map((c) => {
      const delGrupo = visibles
        .filter((h) => (h.categoria || "otras") === c.clave)
        .sort((a, b) => orden[a.severidad] - orden[b.severidad]);
      if (delGrupo.length === 0) return "";

      return `
        <details class="grupo" data-grupo="${c.clave}"${gruposCerrados.has(c.clave) ? "" : " open"}>
          <summary class="grupo-cabecera">
            <span class="grupo-numero" aria-hidden="true">${numeros[c.clave]}</span>
            <span class="grupo-titulo">${c.titulo}</span>
            <span class="grupo-cuenta">${delGrupo.length}</span>
            <svg class="grupo-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
              <path d="M1 1.5 6 6.5l5-5" />
            </svg>
            <span class="grupo-pista">${c.pista}</span>
          </summary>
          <ul class="obs-lista">${delGrupo.map(observacionHtml).join("")}</ul>
        </details>`;
    }).join("");
  }

  /**
   * Una observación. Plegada: la marca de resuelta, prioridad, lugar y título.
   * Desplegada, en la misma pieza: el texto detectado, el problema, la
   * recomendación y la regla que lo sostiene.
   */
  function observacionHtml(h) {
    const ubicaciones = h.ubicaciones || [];
    const visibles = ubicaciones.slice(0, 2).map(escaparHtml);
    const restantes = ubicaciones.length - visibles.length;
    const lugar = visibles.length
      ? `<span class="obs-ubicacion">${visibles.join(", ")}${
          restantes > 0 ? ` y ${restantes} ${plural(restantes, "lugar más", "lugares más")}` : ""
        }</span>`
      : "";

    const repetirLugar = ubicaciones.length > 1;
    const citas = h.ejemplos
      .map((e) => {
        const lugarCita =
          repetirLugar && e.ubicacion
            ? `<span class="obs-cita-lugar">${escaparHtml(e.ubicacion)}</span>`
            : "";
        return `<div class="obs-cita">${lugarCita}${escaparHtml(e.texto)}</div>`;
      })
      .join("");

    const nivel = exigenciaDe(h.autoridad);
    const partesRegla = [];
    if (nivel) {
      partesRegla.push(
        `<span class="obs-exigencia${h.autoridad === "EXIGE" ? " obliga" : ""}">${nivel}</span>`
      );
    }
    if (h.fuente) partesRegla.push(escaparHtml(h.fuente));

    const resuelta = resueltas.has(h.id);
    const abierta = seleccion === h.id;
    const id = escaparAtributo(h.id);
    const tieneFragmento = h.ejemplos.some((e) => e.rango) || ubicaciones.length > 0;
    const accionMarcar = resuelta ? "Marcar como pendiente" : "Marcar como resuelta";

    return `
      <li class="obs${resuelta ? " resuelta" : ""}${abierta ? " abierta" : ""}"
          data-id="${id}" data-severidad="${h.severidad}">
        <label class="obs-resolver" title="${accionMarcar}">
          <input type="checkbox" class="obs-check" data-para="${id}"${resuelta ? " checked" : ""}
                 aria-label="${resuelta ? "Resuelta. Marcar como pendiente" : "Marcar como resuelta"}"
                 aria-describedby="t-${id}" />
        </label>
        <details class="obs-det"${abierta ? " open" : ""}>
          <summary class="obs-cabecera">
            <span class="obs-meta">
              <span class="obs-prioridad">${PRIORIDAD_CORTA[h.severidad]}</span>
              ${lugar}
              <span class="obs-estado">${resuelta ? "Resuelta" : ""}</span>
            </span>
            <span class="obs-titulo" id="t-${id}">${h.titulo}</span>
            <svg class="obs-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
              <path d="M1 1.5 6 6.5l5-5" />
            </svg>
          </summary>
          <div class="obs-cuerpo">
            ${citas ? `<p class="obs-rotulo">Texto detectado</p>${citas}` : ""}
            ${
              h.descripcion
                ? `<p class="obs-rotulo">Problema</p><div class="obs-texto">${h.descripcion}</div>`
                : ""
            }
            ${
              h.sugerencia
                ? `<p class="obs-rotulo">Recomendación</p><div class="obs-texto">${h.sugerencia}</div>`
                : ""
            }
            ${
              partesRegla.length
                ? `<p class="obs-rotulo">Regla aplicable</p>
                   <p class="obs-regla">${partesRegla.join(" · ")}</p>`
                : ""
            }
            <div class="obs-acciones">
              <button type="button" class="obs-marcar" data-para="${id}">${accionMarcar}</button>
              ${
                tieneFragmento
                  ? `<button type="button" class="obs-ir" data-para="${id}">Ver en el documento</button>`
                  : ""
              }
            </div>
          </div>
        </details>
      </li>`;
  }

  function fuentesHtml(ambito, analisis) {
    const f = FUENTES[ambito];
    if (!f || analisis.totalReglas === 0) return "";
    const revisar = f.revisar
      ? `
      <details class="fuentes">
        <summary class="fuentes-summary">${f.revisar.titulo}</summary>
        <div class="fuentes-cuerpo">
          <p>${f.revisar.intro}</p>
          <ul class="fuentes-lista">${f.revisar.lista.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
      </details>`
      : "";
    return `${revisar}
      <details class="fuentes">
        <summary class="fuentes-summary">${f.titulo}</summary>
        <div class="fuentes-cuerpo">
          <p class="fuentes-alcance">${RuleEngine.ALCANCE}</p>
          <p class="fuentes-alcance">${CRITERIO_PRIORIDAD}</p>
          <p>${f.intro}</p>
          <ul class="fuentes-lista">${f.lista.map((x) => `<li>${x}</li>`).join("")}</ul>
          ${f.cierre ? `<p class="fuentes-cierre">${f.cierre}</p>` : ""}
        </div>
      </details>`;
  }

  // ---------------------------------------------------------------------------
  // Filtros y contador
  // ---------------------------------------------------------------------------

  function actualizarFiltros() {
    informeCabecera.querySelectorAll(".filtro-opcion").forEach((b) => {
      const actual = b.dataset.grupo === "prioridad" ? filtroPrioridad : filtroEstado;
      b.setAttribute("aria-pressed", String(actual === b.dataset.valor));
    });
    if (!ultimoAnalisis) return;
    const total = ultimoAnalisis.hallazgos.length;
    const poner = (clave, n) => {
      const el = informeCabecera.querySelector(`[data-cuenta="${clave}"]`);
      if (el) el.textContent = n;
    };
    poner("estado-pendientes", total - resueltas.size);
    poner("estado-resueltas", resueltas.size);
  }

  function actualizarContadorResueltas() {
    const contador = document.getElementById("contador-resueltas");
    if (!contador || !ultimoAnalisis) return;
    const total = ultimoAnalisis.hallazgos.length;
    const hechas = resueltas.size;
    contador.textContent =
      total > 0 && hechas === total
        ? `Listo: ${hechas} de ${total} ${plural(total, "resuelta", "resueltas")}`
        : `${hechas} de ${total} ${plural(total, "resuelta", "resueltas")}`;
    contador.classList.toggle("completo", total > 0 && hechas === total);
  }

  informeCabecera.addEventListener("click", (e) => {
    const boton = e.target.closest(".filtro-opcion");
    if (!boton || boton.disabled || !ultimoAnalisis) return;
    if (boton.dataset.grupo === "prioridad") filtroPrioridad = boton.dataset.valor;
    else filtroEstado = boton.dataset.valor;
    // Si la observación abierta queda afuera del filtro, deja de estar activa.
    const activa = hallazgoPorId(seleccion);
    if (activa && !pasaFiltros(activa)) seleccion = null;
    renderLista();
    panelObservaciones.scrollTop = 0;
  });

  // ---------------------------------------------------------------------------
  // Documento ↔ observación
  //
  // Informe → documento: abrir una observación la activa, la deja abierta y
  //   lleva el documento hasta su fragmento (en tablet vertical y celular,
  //   además, cambia a la vista del documento y ofrece volver).
  // Documento → informe: tocar un fragmento abre su observación, la activa y
  //   lleva el informe hasta ella.
  // Los desplazamientos sólo ocurren si el destino no está ya a la vista.
  // ---------------------------------------------------------------------------

  function marcasDe(id) {
    const escapado = window.CSS && CSS.escape ? CSS.escape(id) : id;
    return [...hojaTexto.querySelectorAll(`[data-obs~="${escapado}"]`)];
  }

  /** Para las observaciones que señalan algo que falta: al menos, el artículo. */
  function hitoDe(id) {
    const hallazgo = hallazgoPorId(id);
    const etiqueta = hallazgo && hallazgo.ubicaciones && hallazgo.ubicaciones[0];
    if (!etiqueta) return null;
    return [...hojaTexto.querySelectorAll("[data-hito]")].find(
      (el) => el.dataset.hito === etiqueta
    );
  }

  function referenciaDe(id) {
    return marcasDe(id)[0] || hitoDe(id) || null;
  }

  function liDe(id) {
    const escapado = window.CSS && CSS.escape ? CSS.escape(id) : id;
    return informeLista.querySelector(`.obs[data-id="${escapado}"]`);
  }

  /**
   * El estado de cada fragmento del documento: tenue si su observación está
   * pendiente, casi invisible si ya se resolvió, sin marca si el filtro la
   * dejó afuera, y amarillo si es la observación activa.
   */
  function actualizarMarcas() {
    if (!ultimoAnalisis) return;
    const visibles = new Set(ultimoAnalisis.hallazgos.filter(pasaFiltros).map((h) => h.id));
    const yaAlcanzables = new Set();

    hojaTexto.querySelectorAll("mark.marca").forEach((m) => {
      const ids = m.dataset.obs.split(" ");
      const enFiltro = ids.filter((id) => visibles.has(id));
      const pendientes = enFiltro.filter((id) => !resueltas.has(id));
      m.classList.toggle("marca--fuera", enFiltro.length === 0);
      m.classList.toggle("marca--resuelta", enFiltro.length > 0 && pendientes.length === 0);
      m.classList.toggle("activa", !!seleccion && visibles.has(seleccion) && ids.includes(seleccion));

      // Con el teclado se llega al primer fragmento de cada observación; los
      // demás quedan fuera del recorrido para no multiplicar las paradas.
      const primero = enFiltro.some((id) => !yaAlcanzables.has(id));
      enFiltro.forEach((id) => yaAlcanzables.add(id));
      if (primero) {
        m.setAttribute("tabindex", "0");
        m.setAttribute("role", "button");
        m.setAttribute("title", "Ver la observación de este fragmento");
      } else {
        m.removeAttribute("tabindex");
        m.removeAttribute("role");
        m.removeAttribute("title");
      }
    });
  }

  /** Un destello corto sobre el fragmento, para que el ojo lo encuentre. */
  function destacar(id) {
    marcasDe(id).forEach((m) => {
      m.classList.remove("destello");
      void m.offsetWidth; // reinicia la animación si ya estaba corriendo
      m.classList.add("destello");
    });
  }

  function llevarAlDocumento(id) {
    const destino = referenciaDe(id);
    if (!destino) return false;
    const panel = panelDocumento.getBoundingClientRect();
    const r = destino.getBoundingClientRect();
    const aLaVista = r.top >= panel.top + 24 && r.bottom <= panel.bottom - 80;
    if (!aLaVista) {
      destino.scrollIntoView({ block: "center", behavior: sinMovimiento() ? "auto" : "smooth" });
    }
    destacar(id);
    return true;
  }

  function asegurarVisibleEnInforme(el) {
    const panel = panelObservaciones.getBoundingClientRect();
    const fijo = informeCabecera.getBoundingClientRect().height;
    const r = el.getBoundingClientRect();
    const arriba = panel.top + fijo + 8;
    const abajo = panel.bottom - 8;
    if (r.top >= arriba && r.top + Math.min(r.height, 160) <= abajo) return;
    panelObservaciones.scrollBy({
      top: r.top - arriba,
      behavior: sinMovimiento() ? "auto" : "smooth",
    });
  }

  function mostrarEnDocumento(id) {
    verVista("documento");
    requestAnimationFrame(() => llevarAlDocumento(id));
  }

  function abrirObservacion(id, { origen }) {
    const li = liDe(id);
    if (!li) return;
    seleccion = id;

    informeLista.querySelectorAll(".obs").forEach((otro) => {
      const esta = otro === li;
      otro.classList.toggle("abierta", esta);
      const det = otro.querySelector(".obs-det");
      if (det.open !== esta) det.open = esta;
    });

    const grupo = li.closest(".grupo");
    if (grupo && !grupo.open) {
      grupo.open = true;
      gruposCerrados.delete(grupo.dataset.grupo);
    }

    actualizarMarcas();

    if (origen === "informe") {
      if (pantallaAngosta()) {
        if (referenciaDe(id)) mostrarEnDocumento(id);
      } else {
        llevarAlDocumento(id);
      }
    } else if (origen === "documento") {
      requestAnimationFrame(() => {
        asegurarVisibleEnInforme(li);
        li.querySelector(".obs-cabecera").focus({ preventScroll: true });
      });
    }
  }

  function cerrarObservacion(id) {
    const li = liDe(id);
    if (li) {
      li.classList.remove("abierta");
      li.querySelector(".obs-det").open = false;
    }
    if (seleccion === id) seleccion = null;
    actualizarMarcas();
  }

  informeLista.addEventListener("click", (e) => {
    // Toda la cabecera de la observación la abre o la cierra. El comportamiento
    // nativo de <details> se reemplaza para poder sincronizar el documento.
    const cabecera = e.target.closest(".obs-cabecera");
    if (cabecera) {
      e.preventDefault();
      const id = cabecera.closest(".obs").dataset.id;
      if (cabecera.parentElement.open) cerrarObservacion(id);
      else abrirObservacion(id, { origen: "informe" });
      return;
    }

    const marcar = e.target.closest(".obs-marcar");
    if (marcar) {
      const check = liDe(marcar.dataset.para)?.querySelector(".obs-check");
      if (check) check.click();
      return;
    }

    const ir = e.target.closest(".obs-ir");
    if (ir) {
      if (pantallaAngosta()) mostrarEnDocumento(ir.dataset.para);
      else llevarAlDocumento(ir.dataset.para);
      return;
    }

    if (e.target.closest('[data-accion="limpiar-filtros"]')) {
      filtroPrioridad = "todas";
      filtroEstado = "todas";
      renderLista();
      panelObservaciones.scrollTop = 0;
    }
  });

  // Marcar como resuelta.
  informeLista.addEventListener("change", (e) => {
    const check = e.target.closest(".obs-check");
    if (!check) return;
    const id = check.dataset.para;
    const hecha = check.checked;
    if (hecha) resueltas.add(id);
    else resueltas.delete(id);

    const li = check.closest(".obs");
    if (li) {
      const accion = hecha ? "Marcar como pendiente" : "Marcar como resuelta";
      li.classList.toggle("resuelta", hecha);
      li.querySelector(".obs-estado").textContent = hecha ? "Resuelta" : "";
      li.querySelector(".obs-marcar").textContent = accion;
      li.querySelector(".obs-resolver").title = accion;
      check.setAttribute("aria-label", hecha ? "Resuelta. Marcar como pendiente" : "Marcar como resuelta");
    }

    if (hecha && !pistaYaVista()) {
      recordarPista();
      document.getElementById("pista-resuelta")?.remove();
    }

    if (filtroEstado !== "todas") {
      // Con un filtro de estado, la observación cambia de grupo y desaparece de
      // la lista. Se avisa adónde fue, y se redibuja sin mover el informe.
      avisarCambioDeFiltro(hecha);
      const activa = hallazgoPorId(seleccion);
      if (activa && !pasaFiltros(activa)) seleccion = null;
      const posicion = panelObservaciones.scrollTop;
      renderLista();
      panelObservaciones.scrollTop = posicion;
    } else {
      actualizarFiltros();
      actualizarContadorResueltas();
      actualizarMarcas();
    }
  });

  /**
   * Una observación que cambia de estado deja de cumplir el filtro y sale de la
   * lista. En vez de que se esfume sin explicación, se dice adónde fue y se
   * ofrece ir a verla.
   */
  let cambioTemporizador = null;

  function avisarCambioDeFiltro(resuelta) {
    const destino = resuelta ? "resueltas" : "pendientes";
    informeCambio.innerHTML =
      `${resuelta ? "Marcada como resuelta" : "Marcada como pendiente"}: salió del filtro ` +
      `«${filtroEstado === "pendientes" ? "Pendientes" : "Resueltas"}».` +
      ` <button type="button" class="informe-limpiar" data-accion="ver-estado" data-valor="${destino}">` +
      `Ver ${destino}</button>`;
    informeCambio.hidden = false;
    clearTimeout(cambioTemporizador);
    cambioTemporizador = setTimeout(() => {
      informeCambio.hidden = true;
      informeCambio.textContent = "";
    }, 7000);
  }

  informeCambio.addEventListener("click", (e) => {
    const boton = e.target.closest('[data-accion="ver-estado"]');
    if (!boton) return;
    filtroEstado = boton.dataset.valor;
    informeCambio.hidden = true;
    informeCambio.textContent = "";
    renderLista();
    panelObservaciones.scrollTop = 0;
  });

  // Recordar qué categorías quedaron plegadas, para que un filtro no las vuelva a abrir.
  informeLista.addEventListener(
    "toggle",
    (e) => {
      const grupo = e.target;
      if (!grupo.classList || !grupo.classList.contains("grupo")) return;
      if (grupo.open) gruposCerrados.delete(grupo.dataset.grupo);
      else gruposCerrados.add(grupo.dataset.grupo);
    },
    true
  );

  // Al revés: tocar un fragmento marcado en el documento abre su observación.
  // Si el fragmento pertenece a varias, cada toque pasa a la siguiente.
  function activarMarca(marca) {
    if (!marca || !ultimoAnalisis) return;
    const ids = marca.dataset.obs.split(" ").filter((id) => {
      const h = hallazgoPorId(id);
      return h && pasaFiltros(h);
    });
    if (!ids.length) return;
    const actual = ids.indexOf(seleccion);
    const id = actual === -1 ? ids[0] : ids[(actual + 1) % ids.length];
    if (pantallaAngosta()) verVista("observaciones");
    requestAnimationFrame(() => abrirObservacion(id, { origen: "documento" }));
  }

  hojaTexto.addEventListener("click", (e) => activarMarca(e.target.closest("mark[data-obs]")));

  hojaTexto.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const marca = e.target.closest("mark[data-obs][tabindex]");
    if (!marca) return;
    e.preventDefault();
    activarMarca(marca);
  });

  btnVolver.addEventListener("click", () => {
    verVista("observaciones");
    const li = seleccion && liDe(seleccion);
    if (!li) return;
    requestAnimationFrame(() => {
      asegurarVisibleEnInforme(li);
      li.querySelector(".obs-cabecera").focus({ preventScroll: true });
    });
  });

  // ---------------------------------------------------------------------------
  // Vistas (tablet vertical y celular)
  //
  // Los dos paneles comparten el mismo lugar y el que no se ve sólo se oculta
  // (no se desmonta), así que cada uno conserva su posición de lectura.
  // ---------------------------------------------------------------------------

  function verVista(vista) {
    revisionCuerpo.dataset.vista = vista;
    pestanas.forEach((p) => p.setAttribute("aria-selected", String(p.dataset.vista === vista)));

    const activa = hallazgoPorId(seleccion);
    const mostrar =
      vista === "documento" && !!activa && pantallaAngosta() && !!referenciaDe(activa.id);
    volverEl.hidden = !mostrar;
    if (mostrar) volverLugar.textContent = (activa.ubicaciones && activa.ubicaciones[0]) || "";
  }

  pestanas.forEach((p) => {
    p.addEventListener("click", () => verVista(p.dataset.vista));
  });

  // ---------------------------------------------------------------------------
  // Menú de acciones (celular)
  // ---------------------------------------------------------------------------

  function menuAbierto() {
    return btnMenu.getAttribute("aria-expanded") === "true";
  }

  function abrirMenu(abrir) {
    accionesEl.classList.toggle("abierto", abrir);
    btnMenu.setAttribute("aria-expanded", String(abrir));
  }

  btnMenu.addEventListener("click", () => {
    const abrir = !menuAbierto();
    abrirMenu(abrir);
    if (abrir) accionesEl.querySelector(".accion").focus();
  });

  document.addEventListener("click", (e) => {
    if (!menuAbierto() || e.target.closest("#btn-menu")) return;
    // Elegir una acción o tocar fuera del menú lo cierra.
    if (e.target.closest("#revision-acciones .accion") || !e.target.closest("#revision-acciones")) {
      abrirMenu(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuAbierto()) {
      abrirMenu(false);
      btnMenu.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // Llevarse el informe: imprimir o copiar
  // ---------------------------------------------------------------------------

  /** Pasa a texto plano lo que en pantalla es HTML (las reglas usan <em>, <strong>). */
  function aTextoPlano(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || "").replace(/\s+/g, " ").trim();
  }

  const PRIORIDAD_TEXTO = { alta: "PRIORIDAD ALTA", media: "PRIORIDAD MEDIA", baja: "PRIORIDAD BAJA" };

  /** El informe completo en texto plano, para pegar en un mail o un documento. */
  function informeATexto(analisis) {
    const fecha = new Date().toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const total = analisis.hallazgos.length;
    const conteo = conteoPorSeveridad(analisis.hallazgos);

    const lineas = [
      "INFORME DE REVISIÓN DE TÉCNICA LEGISLATIVA",
      archivoActual ? `Documento: ${archivoActual.name}` : "",
      `Jurisdicción: ${NOMBRE_AMBITO[ultimoAmbito] || ""}`,
      `Fecha del análisis: ${fecha}`,
      `${total} ${plural(total, "observación", "observaciones")} sobre ${analisis.totalReglas} reglas evaluadas.`,
      "",
      analisis.instrumentoNoCubierto ? `ATENCIÓN: ${avisoInstrumento(analisis)}` : "",
      "Son sugerencias de forma: corregir o no, y cómo, lo decide quien redacta la norma.",
      "",
    ].filter((l) => l !== "");

    const orden = { alta: 0, media: 1, baja: 2 };
    const ordenados = [...analisis.hallazgos].sort(
      (a, b) => orden[a.severidad] - orden[b.severidad]
    );

    // Primero la lista corta: qué hay que corregir, de un vistazo.
    if (ordenados.length) {
      lineas.push("".padEnd(60, "-"), "QUÉ HAY QUE CORREGIR", "".padEnd(60, "-"), "");
      for (const h of ordenados) {
        const lugar = h.ubicaciones.length
          ? `${h.ubicaciones[0]}${h.ubicaciones.length > 1 ? " y otros" : ""} — `
          : "";
        lineas.push(`[${resueltas.has(h.id) ? "x" : " "}] ${lugar}${aTextoPlano(h.titulo)}`);
      }
      lineas.push("");
    }

    // Después, el desarrollo agrupado igual que en pantalla: por categoría.
    let n = 0;
    for (const categoria of CATEGORIAS) {
      const delGrupo = analisis.hallazgos
        .filter((h) => (h.categoria || "otras") === categoria.clave)
        .sort((a, b) => orden[a.severidad] - orden[b.severidad]);
      if (!delGrupo.length) continue;

      n++;
      lineas.push(
        "".padEnd(60, "-"),
        `${String(n).padStart(2, "0")} · ${categoria.titulo.toUpperCase()} (${delGrupo.length})`,
        "".padEnd(60, "-"),
        ""
      );

      for (const h of delGrupo) {
        lineas.push(`${aTextoPlano(h.titulo)} [${PRIORIDAD_TEXTO[h.severidad]}]`);
        if (h.ubicaciones.length) lineas.push(`   Dónde corregir: ${h.ubicaciones.join(", ")}`);
        for (const e of h.ejemplos) {
          lineas.push(`   Texto detectado: ${e.ubicacion ? "[" + e.ubicacion + "] " : ""}${e.texto}`);
        }
        if (h.descripcion) lineas.push(`   Problema: ${aTextoPlano(h.descripcion)}`);
        if (h.sugerencia) lineas.push(`   Recomendación: ${aTextoPlano(h.sugerencia)}`);
        if (h.autoridad && exigenciaDe(h.autoridad)) {
          lineas.push(`   Exigencia: ${exigenciaDe(h.autoridad)}`);
        }
        if (h.fuente) lineas.push(`   Regla aplicable: ${h.fuente}`);
        lineas.push("");
      }
    }

    const fuentes = FUENTES[ultimoAmbito];
    if (fuentes && fuentes.revisar) {
      lineas.push("".padEnd(60, "-"), fuentes.revisar.titulo.toUpperCase(), "".padEnd(60, "-"), "");
      lineas.push(aTextoPlano(fuentes.revisar.intro), "");
      for (const item of fuentes.revisar.lista) lineas.push(`[ ] ${item}`);
      lineas.push("");
    }
    if (fuentes) {
      lineas.push("".padEnd(60, "-"), fuentes.titulo.toUpperCase(), "".padEnd(60, "-"), "");
      lineas.push(aTextoPlano(fuentes.intro), "");
      for (const item of fuentes.lista) lineas.push(`· ${aTextoPlano(item)}`);
      if (fuentes.cierre) lineas.push("", aTextoPlano(fuentes.cierre));
      lineas.push("");
    }

    lineas.push(
      "".padEnd(60, "-"),
      "SÍNTESIS",
      "".padEnd(60, "-"),
      `Prioridad alta:  ${conteo.alta}`,
      `Prioridad media: ${conteo.media}`,
      `Prioridad baja:  ${conteo.baja}`,
      `Total: ${total} sobre ${analisis.totalReglas} reglas evaluadas.`,
      `Observaciones de prioridad alta pendientes: ${conteo.alta > resueltas.size ? "sí" : "revisar"}.`,
      ""
    );

    return lineas.join("\n");
  }

  btnImprimir.addEventListener("click", () => window.print());

  // Al imprimir hay que abrir todo lo plegado: el navegador no imprime lo que
  // está adentro de un <details> cerrado. Después se vuelve a como estaba.
  let plegadasAntesDeImprimir = null;

  window.addEventListener("beforeprint", () => {
    if (!ultimoAnalisis) return;
    plegadasAntesDeImprimir = new Set(gruposCerrados);
    document.querySelectorAll("#pantalla-revision details").forEach((d) => (d.open = true));
  });

  window.addEventListener("afterprint", () => {
    if (!plegadasAntesDeImprimir) return;
    gruposCerrados.clear();
    plegadasAntesDeImprimir.forEach((g) => gruposCerrados.add(g));
    plegadasAntesDeImprimir = null;
    const fuentes = document.querySelector("#informe-fuentes details");
    if (fuentes) fuentes.open = false;
    renderLista();
  });

  let avisoTemporizador = null;

  /** Aviso breve en la barra del expediente (texto fijo, nunca del usuario). */
  function avisar(html) {
    copiarEstado.innerHTML = html;
    clearTimeout(avisoTemporizador);
    avisoTemporizador = setTimeout(() => (copiarEstado.textContent = ""), 3200);
  }

  btnCopiar.addEventListener("click", async () => {
    if (!ultimoAnalisis) return;
    const texto = informeATexto(ultimoAnalisis);
    try {
      await navigator.clipboard.writeText(texto);
      avisar(
        '<svg class="aviso-ok" viewBox="0 0 12 10" aria-hidden="true" focusable="false">' +
          '<path d="M1 5.5 4.3 8.5 11 1.5" /></svg>Informe copiado'
      );
    } catch (err) {
      // El portapapeles puede estar bloqueado (permisos, navegador viejo, http).
      avisar('No se pudo copiar. Usá "Imprimir o guardar en PDF".');
    }
  });

  // ---------------------------------------------------------------------------
  // Tutorial breve
  //
  // Tres pasos por pantalla. Se abre solo la primera vez que se usa cada una y
  // siempre se puede saltar; después queda a mano en "Cómo funciona", que
  // muestra el tutorial de la pantalla en la que se está.
  // ---------------------------------------------------------------------------

  const TUTORIALES = {
    carga: [
      {
        objetivo: "#dropzone",
        titulo: "Subí el proyecto",
        texto:
          "Arrastrá el archivo a la caja o tocá para elegirlo. Sirve un PDF, un Word, " +
          "un texto o una foto: si es un escaneo, igual leemos las letras.",
      },
      {
        objetivo: ".jurisdicciones",
        titulo: "Elegí dónde se presenta",
        texto:
          "Cada cuerpo legislativo tiene sus propias reglas de redacción, así que el " +
          "informe cambia según lo que elijas. Se revisan solamente leyes nacionales, " +
          "leyes provinciales y ordenanzas.",
      },
      {
        objetivo: "#bloque-cta",
        titulo: "Analizá",
        texto:
          "En unos segundos tenés el informe. El archivo se lee dentro de tu navegador: " +
          "no se envía a ningún servidor.",
      },
    ],
    revision: [
      {
        objetivo: ".revision-cuerpo",
        titulo: "Dos caras de lo mismo",
        texto:
          "De un lado, el proyecto tal como lo subiste; del otro, las observaciones. " +
          "En pantallas chicas se alternan con las pestañas Documento e Informe.",
      },
      {
        objetivo: ".obs",
        titulo: "Tocá una observación",
        texto:
          "Se abre con el texto detectado, el problema y la recomendación, y el documento " +
          "salta hasta ese fragmento y lo pinta de amarillo. También funciona al revés: " +
          "tocá un fragmento subrayado y se abre su observación.",
      },
      {
        objetivo: ".informe-filtros",
        titulo: "Ordená el trabajo",
        texto:
          "Filtrá por prioridad o por estado, y marcá el círculo de una observación cuando " +
          "la hayas corregido. Arriba podés copiar el informe o guardarlo en PDF.",
      },
    ],
  };

  const dialogoTutorial = document.getElementById("tutorial");
  const tutorialNumero = document.getElementById("tutorial-numero");
  const tutorialTitulo = document.getElementById("tutorial-titulo");
  const tutorialTexto = document.getElementById("tutorial-texto");
  const tutorialContador = document.getElementById("tutorial-contador");
  const btnTutorialSaltar = document.getElementById("tutorial-saltar");
  const btnTutorialAtras = document.getElementById("tutorial-atras");
  const btnTutorialSiguiente = document.getElementById("tutorial-siguiente");
  const btnVerTutorial = document.getElementById("ver-tutorial");
  const tutorialFoco = document.getElementById("tutorial-foco");
  const tutorialPico = document.getElementById("tutorial-pico");

  let tutorialActual = null;
  let tutorialPaso = 0;

  function tutorialVisto(clave) {
    try {
      return localStorage.getItem(`neeti.tutorial.${clave}`) === "1";
    } catch (err) {
      return false;
    }
  }

  function recordarTutorial(clave) {
    try {
      localStorage.setItem(`neeti.tutorial.${clave}`, "1");
    } catch (err) {
      // Sin almacenamiento el tutorial vuelve a aparecer: se puede saltar igual.
    }
  }

  function pintarTutorial() {
    const pasos = TUTORIALES[tutorialActual];
    const paso = pasos[tutorialPaso];
    tutorialNumero.textContent = String(tutorialPaso + 1).padStart(2, "0");
    tutorialTitulo.textContent = paso.titulo;
    tutorialTexto.textContent = paso.texto;
    tutorialContador.textContent = `${tutorialPaso + 1} de ${pasos.length}`;
    btnTutorialAtras.hidden = tutorialPaso === 0;
    btnTutorialSiguiente.textContent =
      tutorialPaso === pasos.length - 1 ? "Empezar" : "Siguiente";
    requestAnimationFrame(ubicarTutorial);
  }

  /**
   * Coloca el cartel al lado del elemento del que habla el paso y lo ilumina:
   * el recuadro del foco lleva una sombra enorme que oscurece todo lo demás,
   * así que el elemento señalado es lo único que queda a plena luz.
   * Si el elemento no está a la vista, el cartel se centra sin foco.
   */
  function ubicarTutorial() {
    if (!tutorialActual || !dialogoTutorial.open) return;

    const paso = TUTORIALES[tutorialActual][tutorialPaso];
    const objetivo = paso.objetivo ? document.querySelector(paso.objetivo) : null;
    const alto = dialogoTutorial.offsetHeight;
    const ancho = dialogoTutorial.offsetWidth;
    const margen = 16;
    const borde = 12;

    const centrar = () => {
      dialogoTutorial.dataset.lado = "centro";
      dialogoTutorial.style.top = `${Math.max(borde, (window.innerHeight - alto) / 2)}px`;
      dialogoTutorial.style.left = `${Math.max(borde, (window.innerWidth - ancho) / 2)}px`;
    };

    if (!objetivo || !objetivo.getClientRects().length) {
      tutorialFoco.hidden = true;
      dialogoTutorial.classList.add("tutorial--sin-foco");
      centrar();
      return;
    }

    const r = objetivo.getBoundingClientRect();
    tutorialFoco.hidden = false;
    dialogoTutorial.classList.remove("tutorial--sin-foco");

    const holgura = 6;
    tutorialFoco.style.top = `${r.top - holgura}px`;
    tutorialFoco.style.left = `${r.left - holgura}px`;
    tutorialFoco.style.width = `${r.width + holgura * 2}px`;
    tutorialFoco.style.height = `${r.height + holgura * 2}px`;

    let lado = "abajo";
    let top;
    if (window.innerHeight - r.bottom >= alto + margen + borde) {
      top = r.bottom + margen;
    } else if (r.top >= alto + margen + borde) {
      lado = "arriba";
      top = r.top - alto - margen;
    } else {
      centrar();
      return;
    }

    const left = Math.min(
      Math.max(borde, r.left + r.width / 2 - ancho / 2),
      Math.max(borde, window.innerWidth - ancho - borde)
    );

    dialogoTutorial.dataset.lado = lado;
    dialogoTutorial.style.top = `${top}px`;
    dialogoTutorial.style.left = `${left}px`;

    // El pico apunta al centro del elemento, sin salirse del cartel.
    const centroObjetivo = r.left + r.width / 2 - left;
    tutorialPico.style.left = `${Math.min(Math.max(centroObjetivo, 24), ancho - 24) - 6}px`;
  }

  window.addEventListener("resize", ubicarTutorial);
  window.addEventListener("scroll", ubicarTutorial, true);

  function abrirTutorial(clave) {
    if (!TUTORIALES[clave]) return;
    tutorialActual = clave;
    tutorialPaso = 0;
    if (!dialogoTutorial.open) dialogoTutorial.showModal();
    pintarTutorial();
  }

  /** El tutorial de la pantalla en la que se está. */
  function tutorialDeLaFase() {
    return cuerpoPagina.dataset.fase === "revision" ? "revision" : "carga";
  }

  dialogoTutorial.addEventListener("close", () => {
    if (tutorialActual) recordarTutorial(tutorialActual);
    tutorialActual = null;
  });

  btnTutorialSaltar.addEventListener("click", () => dialogoTutorial.close());

  btnTutorialAtras.addEventListener("click", () => {
    if (tutorialPaso > 0) tutorialPaso--;
    pintarTutorial();
  });

  btnTutorialSiguiente.addEventListener("click", () => {
    const pasos = TUTORIALES[tutorialActual] || [];
    if (tutorialPaso >= pasos.length - 1) {
      dialogoTutorial.close();
      return;
    }
    tutorialPaso++;
    pintarTutorial();
  });

  btnVerTutorial.addEventListener("click", () => abrirTutorial(tutorialDeLaFase()));

  // ---------------------------------------------------------------------------
  // Arranque
  // ---------------------------------------------------------------------------

  estadoCarga("inicial");

  // La cantidad de reglas de cada jurisdicción se calcula: así no queda vieja
  // cuando se agregan o se quitan reglas.
  const REGLAS_POR_AMBITO = {
    nacional: window.ReglasNacional,
    provincial: window.ReglasProvincialER,
    municipal: window.ReglasMunicipalER,
  };
  document.querySelectorAll('input[name="ambito"]').forEach((input) => {
    const detalle = input.closest(".jurisdiccion")?.querySelector(".jurisdiccion-detalle");
    const reglas = REGLAS_POR_AMBITO[input.value];
    if (detalle && reglas) detalle.innerHTML = detalle.innerHTML.replace(/\d+(&nbsp;|\u00a0)reglas/, `${reglas.length}&nbsp;reglas`);
  });

  if (!tutorialVisto("carga")) {
    // Después del primer pintado, para que se vea la pantalla detrás.
    setTimeout(() => abrirTutorial("carga"), 450);
  }
})();
