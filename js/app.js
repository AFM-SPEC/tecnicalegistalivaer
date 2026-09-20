(() => {
  const dropzone = document.getElementById("dropzone");
  const dropzoneText = document.getElementById("dropzone-text");
  const fileInput = document.getElementById("file-input");
  const fileInfo = document.getElementById("file-info");
  const btnAnalizar = document.getElementById("btn-analizar");
  const estado = document.getElementById("estado");
  const barraProgresoWrap = document.getElementById("barra-progreso-wrap");
  const barraProgresoRelleno = document.getElementById("barra-progreso-relleno");
  const barraProgresoTexto = document.getElementById("barra-progreso-texto");
  const panelResultados = document.getElementById("panel-resultados");
  const resumenEl = document.getElementById("resumen");
  const listaHallazgosEl = document.getElementById("lista-hallazgos");
  const listaControlEl = document.getElementById("lista-control");
  const fuentesEl = document.getElementById("fuentes");
  const cargaDetalleEl = document.getElementById("carga-detalle");
  const cargaResumenEl = document.getElementById("carga-resumen");
  const cargaResumenArchivoEl = document.getElementById("carga-resumen-archivo");
  const cargaResumenAmbitoEl = document.getElementById("carga-resumen-ambito");
  const btnOtro = document.getElementById("btn-otro");
  const accionesEl = document.getElementById("acciones");
  const btnImprimir = document.getElementById("btn-imprimir");
  const btnCopiar = document.getElementById("btn-copiar");
  const copiarEstadoEl = document.getElementById("copiar-estado");

  let archivoActual = null;
  // Último análisis, para poder imprimirlo o copiarlo sin volver a correrlo.
  let ultimoAnalisis = null;
  let ultimoAmbito = null;

  const EXTENSIONES_VALIDAS = ["pdf", "doc", "docx", "md", "txt", "png", "jpg", "jpeg"];

  function extensionOf(fileName) {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function setArchivo(file) {
    const ext = extensionOf(file.name);
    if (!EXTENSIONES_VALIDAS.includes(ext)) {
      fileInfo.textContent = `Formato no soportado: .${ext}`;
      fileInfo.style.color = "#b3261e";
      archivoActual = null;
      btnAnalizar.disabled = true;
      return;
    }
    archivoActual = file;
    cargaDetalleEl.hidden = false;
    cargaResumenEl.hidden = true;
    fileInfo.style.color = "";
    fileInfo.textContent = `Archivo cargado: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    dropzoneText.textContent = file.name;
    btnAnalizar.disabled = false;
    panelResultados.hidden = true;
  }

  // El clic sobre la zona de carga lo maneja el propio <label>: no hace falta
  // JavaScript, y así el campo de archivo sigue siendo alcanzable con teclado.

  // El área de arrastre funcional cubre toda la pantalla, no solo el recuadro.
  let dragCounter = 0;

  document.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragCounter++;
    dropzone.classList.add("dragover");
  });

  document.addEventListener("dragover", (e) => e.preventDefault());

  document.addEventListener("dragleave", () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      dropzone.classList.remove("dragover");
    }
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) setArchivo(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) setArchivo(fileInput.files[0]);
  });

  function getAmbitoSeleccionado() {
    return document.querySelector('input[name="ambito"]:checked').value;
  }

  const NOMBRE_AMBITO = {
    nacional: "Nacional",
    provincial: "Provincial (Entre Ríos)",
    municipal: "Municipal (Entre Ríos)",
  };

  /**
   * Una vez que hay resultado, el formulario de carga se pliega a una línea.
   * Ocupaba pantalla y media arriba de lo único que se viene a leer.
   */
  function plegarCarga(archivo, ambito) {
    cargaResumenArchivoEl.textContent = archivo.name;
    cargaResumenAmbitoEl.textContent = NOMBRE_AMBITO[ambito] || ambito;
    cargaDetalleEl.hidden = true;
    cargaResumenEl.hidden = false;
  }

  function desplegarCarga() {
    cargaDetalleEl.hidden = false;
    cargaResumenEl.hidden = true;
    panelResultados.hidden = true;
    estado.textContent = "";
    document.getElementById("panel-carga").scrollIntoView({ block: "start" });
  }

  btnOtro.addEventListener("click", desplegarCarga);

  /**
   * Los tres grupos de prioridad, en el orden en que se muestran: primero lo que
   * puede alterar el efecto jurídico de la norma, al final lo ortotipográfico.
   */
  const GRUPOS = [
    {
      clave: "alta",
      titulo: "Prioridad alta",
      pista: "pueden alterar el efecto jurídico, la vigencia o el alcance de la norma",
    },
    {
      clave: "media",
      titulo: "Prioridad media",
      pista: "no invalidan la norma, pero restan claridad y complican modificarla o citarla después",
    },
    {
      clave: "baja",
      titulo: "Prioridad baja",
      pista: "detalles de presentación y ortotipografía, sin efecto sobre el sentido jurídico",
    },
  ];

  /** De dónde salen las reglas de cada ámbito. Se muestra al final del resultado. */
  const FUENTES = {
    nacional: {
      titulo: "De dónde salen estas reglas",
      intro:
        "Las 71 reglas del ámbito nacional se tomaron de los dos textos de referencia en la materia:",
      lista: [
        "<strong>Manual de Técnica Legislativa</strong> — Digesto Jurídico Argentino, publicado por InfoLeg.",
        "<strong>Técnica Legislativa: Marco Teórico</strong> — Grosso, B. M. y Svetaz, M. A.",
      ],
      cierre:
        "Cada corrección indica además el punto exacto del Manual en el que se apoya.",
    },
    provincial: {
      titulo: "De dónde salen estas reglas",
      intro:
        "En Entre Ríos no existe un manual oficial de técnica legislativa. Las 31 reglas se " +
        "reconstruyeron a partir de fuentes de distinto peso, y por eso cada corrección aclara " +
        "cuánto obliga:",
      lista: [
        "<strong>Constitución de la Provincia de Entre Ríos (2008)</strong> — sobre todo los artículos 130, 131 y 132. Es la única fuente que obliga por sí sola.",
        "<strong>Ley Nº 9.971 del Digesto Jurídico</strong> — sus criterios de redacción se aplican a los proyectos por analogía.",
        "<strong>Reglamento de la Cámara de Diputados</strong> (texto ordenado 2021) y <strong>Reglamento de la Cámara de Senadores</strong> (diciembre de 2023).",
        "<strong>Modelos e instructivos oficiales</strong> de ambas cámaras.",
        "<strong>La práctica medida</strong> sobre 53 leyes entrerrianas sancionadas entre 2025 y 2026, según el Boletín Oficial.",
        "<strong>Criterios doctrinarios y del Manual nacional</strong>, sólo donde no hay regla entrerriana que cubra el punto.",
      ],
      cierre:
        "Una práctica uniforme puede fundar una recomendación, pero no se convierte por sí sola en " +
        "obligación jurídica: por eso ninguna corrección basada en la práctica figura como prioridad alta.",
    },
  };

  function renderResultados(analisis, ambito) {
    panelResultados.hidden = false;

    const conteo = { alta: 0, media: 0, baja: 0 };
    for (const h of analisis.hallazgos) conteo[h.severidad]++;
    const total = analisis.hallazgos.length;

    resumenEl.innerHTML = `
      <p class="resumen-total">
        ${total} ${total === 1 ? "corrección sugerida" : "correcciones sugeridas"}
        sobre ${analisis.totalReglas} regla${analisis.totalReglas === 1 ? "" : "s"} evaluada${analisis.totalReglas === 1 ? "" : "s"}
      </p>
      <ul class="resumen-desglose">
        <li class="resumen-item alta">${conteo.alta} de prioridad alta</li>
        <li class="resumen-item media">${conteo.media} de prioridad media</li>
        <li class="resumen-item baja">${conteo.baja} de prioridad baja</li>
      </ul>
      ${
        conteo.alta > 0
          ? `<p class="aviso-alta">Hay ${conteo.alta} correccion${conteo.alta === 1 ? "" : "es"} de prioridad alta sin resolver. Son las que
             pueden afectar el efecto jurídico, la vigencia o el alcance de la norma: conviene
             empezar por esas.</p>`
          : ""
      }
      <p class="disclaimer">Son sugerencias de forma: corregir o no, y cómo, lo decide quien redacta la norma.</p>
    `;

    accionesEl.hidden = total === 0;

    if (analisis.totalReglas === 0) {
      listaControlEl.innerHTML = "";
      fuentesEl.innerHTML = "";
      listaHallazgosEl.innerHTML = `<div class="sin-hallazgos">
        Todavía no se puede revisar este tipo de norma. Están cargadas las reglas
        nacionales y las provinciales de Entre Ríos; las de ordenanzas municipales
        todavía no.
      </div>`;
      return;
    }

    if (total === 0) {
      listaControlEl.innerHTML = "";
      listaHallazgosEl.innerHTML = `<div class="sin-hallazgos">
        No se detectaron incumplimientos con las ${analisis.totalReglas} reglas evaluadas.
      </div>`;
      fuentesEl.innerHTML = renderFuentes(ambito);
      return;
    }

    listaControlEl.innerHTML = renderListaControl(analisis, conteo);
    listaHallazgosEl.innerHTML = renderHallazgos(analisis);
    fuentesEl.innerHTML = renderFuentes(ambito);
  }

  // ---------------------------------------------------------------------------
  // Lista de control
  //
  // Antes de las correcciones desarrolladas va la lista corta de todo lo que hay
  // que tocar: una línea por corrección, con el lugar del documento. Sin esto,
  // saber qué hay que hacer exige leer el resultado entero.
  // ---------------------------------------------------------------------------

  function renderListaControl(analisis, conteo) {
    const orden = { alta: 0, media: 1, baja: 2 };
    const ordenados = [...analisis.hallazgos].sort(
      (a, b) => orden[a.severidad] - orden[b.severidad]
    );
    const total = ordenados.length;

    const fila = (h) => {
      const lugar = h.ubicaciones.length
        ? `<span class="control-lugar">${escapeHtml(h.ubicaciones[0])}${
            h.ubicaciones.length > 1 ? " y otros" : ""
          }</span>`
        : "";
      return `
        <li class="control-item ${h.severidad}">
          <label class="control-marcar">
            <input type="checkbox" class="control-check" data-para="${h.id}" />
            <span class="control-check-label">Marcar como resuelta:</span>
          </label>
          <a class="control-enlace" href="#c-${h.id}">${lugar}<span class="control-texto">${h.titulo}</span></a>
        </li>`;
    };

    // Separadas por prioridad: con veinte líneas seguidas no se ve dónde termina
    // lo urgente y dónde empieza lo que puede esperar.
    const bloques = GRUPOS.map((grupo) => {
      const delGrupo = ordenados.filter((h) => h.severidad === grupo.clave);
      if (!delGrupo.length) return "";
      return `
        <p class="control-grupo ${grupo.clave}">${grupo.titulo} · ${delGrupo.length}</p>
        <ul class="control-lista">${delGrupo.map(fila).join("")}</ul>`;
    }).join("");

    return `
      <h2 class="control-titulo">Qué hay que corregir</h2>
      <p class="control-contador" id="control-contador" role="status" aria-live="polite">
        0 de ${total} marcadas como resueltas
      </p>
      ${bloques}`;
  }

  /**
   * Marca una corrección como resuelta. No se guarda en ningún lado: sirve para
   * no perder el hilo mientras se corrige el documento en una sola sentada.
   */
  function marcarResuelta(id, resuelta) {
    const tarjeta = document.getElementById(`c-${id}`);
    const fila = document.querySelector(`.control-check[data-para="${id}"]`)?.closest(".control-item");
    if (tarjeta) tarjeta.classList.toggle("resuelta", resuelta);
    if (fila) fila.classList.toggle("resuelta", resuelta);

    const checks = [...document.querySelectorAll(".control-check")];
    const hechas = checks.filter((c) => c.checked).length;
    const contador = document.getElementById("control-contador");
    if (!contador) return;
    contador.textContent =
      hechas === checks.length && checks.length > 0
        ? `Listo: marcaste las ${checks.length} correcciones como resueltas`
        : `${hechas} de ${checks.length} marcadas como resueltas`;
  }

  listaControlEl.addEventListener("change", (e) => {
    const check = e.target.closest(".control-check");
    if (check) marcarResuelta(check.dataset.para, check.checked);
  });

  listaControlEl.addEventListener("click", (e) => {
    const enlace = e.target.closest(".control-enlace");
    if (!enlace) return;
    const destino = document.getElementById(enlace.getAttribute("href").slice(1));
    if (!destino) return;
    // Las correcciones de prioridad media y baja viven dentro de un grupo
    // plegado. Sin abrirlo, el enlace lleva a un lugar donde no se ve nada.
    for (let padre = destino.parentElement; padre; padre = padre.parentElement) {
      if (padre.tagName === "DETAILS") padre.open = true;
    }
  });

  // ---------------------------------------------------------------------------
  // Correcciones desarrolladas
  // ---------------------------------------------------------------------------

  function renderHallazgos(analisis) {
    let html = "";
    GRUPOS.forEach((grupo, i) => {
      const delGrupo = analisis.hallazgos.filter((h) => h.severidad === grupo.clave);
      if (delGrupo.length === 0) return;
      const cuerpo = delGrupo.map(renderHallazgo).join("");

      // El grupo más urgente que tenga algo va siempre desplegado. Los de abajo se
      // pliegan, para que una corrección menor no tape una que sí importa.
      const hayAlgoMasUrgente = GRUPOS.slice(0, i).some((g) =>
        analisis.hallazgos.some((h) => h.severidad === g.clave)
      );

      if (!hayAlgoMasUrgente) {
        html += `<h2 class="label">${grupo.titulo} · ${delGrupo.length}</h2>${cuerpo}`;
        return;
      }

      html += `
        <details class="menores">
          <summary class="menores-summary">
            <span class="menores-titulo">Ver ${delGrupo.length} de ${grupo.titulo.toLowerCase()}</span>
            <span class="menores-hint">${grupo.pista}</span>
          </summary>
          <div class="menores-lista">${cuerpo}</div>
        </details>`;
    });
    return html;
  }

  const PRIORIDAD = { alta: "Prioridad alta", media: "Prioridad media", baja: "Prioridad baja" };

  /**
   * Arma la tarjeta de un hallazgo.
   *
   * El orden importa: primero qué hacer, después el fragmento del documento, y
   * recién al final —plegado— por qué. Quien viene a corregir necesita la acción;
   * la explicación la lee quien quiera entender la regla.
   */
  function renderHallazgo(h) {
    // Si el problema está en un solo lugar, ya lo dice la línea de arriba:
    // repetirlo en cada cita sería decir dos veces lo mismo.
    const repetirLugar = h.ubicaciones.length > 1;

    return `
        <article class="hallazgo ${h.severidad}" id="c-${h.id}">
          ${renderMeta(h)}
          <h3 class="hallazgo-titulo">${h.titulo}</h3>
          ${
            h.sugerencia
              ? `<p class="hallazgo-label">Cómo corregirlo</p>
                 <div class="hallazgo-sugerencia">${h.sugerencia}</div>`
              : ""
          }
          ${
            h.ejemplos.length
              ? `<p class="hallazgo-label">En tu texto</p>
                 <div class="hallazgo-ejemplos">${h.ejemplos
                   .map((e) => renderEjemplo(e, repetirLugar))
                   .join("\n")}</div>`
              : ""
          }
          ${
            h.descripcion
              ? `<details class="porque">
                   <summary class="porque-summary">Por qué importa</summary>
                   <div class="hallazgo-desc">${h.descripcion}</div>
                 </details>`
              : ""
          }
          ${renderFundamento(h)}
        </article>`;
  }

  /**
   * Cuánto obliga cada regla.
   *
   * No todas pesan igual, y la herramienta no puede hacerlas pasar por lo
   * mismo: una práctica uniforme de la Legislatura no es una exigencia
   * constitucional, y un criterio de estilo tomado de afuera tampoco. La
   * prioridad dice cuánto urge corregir; esto dice con qué derecho se pide.
   */
  const EXIGENCIA = {
    EXIGE: "Regla obligatoria",
    "CRITERIO LEGAL CONDICIONADO": "Criterio legal de aplicación condicionada",
    RECOMIENDA: "Directriz institucional",
    ACOSTUMBRA: "Práctica uniforme, no obligación",
    SUBSIDIARIO: "Criterio de estilo, no obligación provincial",
  };

  /** Pie de la corrección: cuánto obliga la regla y de dónde sale. */
  function renderFundamento(h) {
    if (!h.autoridad && !h.fuente) return "";
    const nivel = EXIGENCIA[h.autoridad];
    const clase = h.autoridad === "EXIGE" ? "exigencia obliga" : "exigencia";
    const partes = [];
    if (nivel) partes.push(`<span class="${clase}">${nivel}</span>`);
    if (h.fuente) partes.push(escapeHtml(h.fuente));
    return `<p class="hallazgo-fundamento">${partes.join(" · ")}</p>`;
  }

  /**
   * La línea que encabeza cada corrección: qué tan importante es y en qué
   * parte del documento hay que ir. Van juntas, como una sola frase, en vez
   * de una etiqueta con recuadro y un montón de pastillas debajo.
   */
  function renderMeta(h) {
    const prioridad = `<span class="hallazgo-prioridad ${h.severidad}">${PRIORIDAD[h.severidad]}</span>`;
    if (!h.ubicaciones || h.ubicaciones.length === 0) {
      return `<p class="hallazgo-meta">${prioridad}</p>`;
    }

    const visibles = h.ubicaciones.slice(0, 5).map(escapeHtml);
    const restantes = h.ubicaciones.length - visibles.length;
    const lugares = `<span class="hallazgo-ubicacion-texto">${visibles.join(", ")}</span>`;
    const mas =
      restantes > 0
        ? ` <span class="ubicacion-mas">y ${restantes} lugar${restantes === 1 ? "" : "es"} más</span>`
        : "";

    return `<p class="hallazgo-meta">${prioridad} · ${lugares}${mas}</p>`;
  }

  /**
   * Cada cita del documento. El lugar solo se nombra si la corrección afecta
   * a más de uno; si es uno solo ya está dicho arriba.
   */
  function renderEjemplo(ejemplo, repetirLugar) {
    const cuerpo = escapeHtml(ejemplo.texto);
    const lugar =
      repetirLugar && ejemplo.ubicacion
        ? `<span class="ejemplo-ubicacion">${escapeHtml(ejemplo.ubicacion)}</span>`
        : "";
    return `<div class="ejemplo">${lugar}<span class="ejemplo-texto">${cuerpo}</span></div>`;
  }

  /** Al final de todo: qué documentos fundan las reglas de este ámbito. */
  function renderFuentes(ambito) {
    const f = FUENTES[ambito];
    if (!f) return "";
    return `
      <details class="fuentes">
        <summary class="fuentes-summary">${f.titulo}</summary>
        <div class="fuentes-cuerpo">
          <p>${f.intro}</p>
          <ul class="fuentes-lista">${f.lista.map((x) => `<li>${x}</li>`).join("")}</ul>
          <p>${f.cierre}</p>
        </div>
      </details>`;
  }

  // ---------------------------------------------------------------------------
  // Llevarse el resultado: imprimir / guardar en PDF y copiar
  // ---------------------------------------------------------------------------

  /** Pasa a texto plano lo que en pantalla es HTML (las reglas usan <em>, <strong>). */
  function aTextoPlano(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || "").replace(/\s+/g, " ").trim();
  }

  const PRIORIDAD_TEXTO = { alta: "PRIORIDAD ALTA", media: "PRIORIDAD MEDIA", baja: "PRIORIDAD BAJA" };

  /** Arma la lista completa en texto plano, para pegar en un mail o un documento. */
  function analisisATexto(analisis) {
    const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    const total = analisis.hallazgos.length;

    const lineas = [
      "REVISOR DE TÉCNICA LEGISLATIVA",
      archivoActual ? `Documento: ${archivoActual.name}` : "",
      `Ámbito: ${NOMBRE_AMBITO[ultimoAmbito] || ""}`,
      `Fecha del análisis: ${fecha}`,
      `${total} ${total === 1 ? "corrección sugerida" : "correcciones sugeridas"} sobre ${analisis.totalReglas} reglas evaluadas.`,
      "",
      "Son sugerencias de forma: corregir o no, y cómo, lo decide quien redacta la norma.",
      "",
    ].filter((l) => l !== "");

    const orden = { alta: 0, media: 1, baja: 2 };
    const ordenados = [...analisis.hallazgos].sort((a, b) => orden[a.severidad] - orden[b.severidad]);

    // La lista corta primero: qué hay que corregir, de un vistazo.
    if (ordenados.length) {
      lineas.push("".padEnd(60, "-"), "QUÉ HAY QUE CORREGIR", "".padEnd(60, "-"), "");
      for (const h of ordenados) {
        const lugar = h.ubicaciones.length
          ? `${h.ubicaciones[0]}${h.ubicaciones.length > 1 ? " y otros" : ""} — `
          : "";
        lineas.push(`[ ] ${lugar}${aTextoPlano(h.titulo)}`);
      }
      lineas.push("");
    }

    let severidadActual = null;
    let n = 0;
    for (const h of ordenados) {
      if (h.severidad !== severidadActual) {
        severidadActual = h.severidad;
        lineas.push("", "".padEnd(60, "-"), PRIORIDAD_TEXTO[h.severidad], "".padEnd(60, "-"), "");
      }
      n++;
      lineas.push(`${n}. ${aTextoPlano(h.titulo)}`);
      if (h.ubicaciones.length) lineas.push(`   Dónde corregir: ${h.ubicaciones.join(", ")}`);
      lineas.push(`   Qué pasa: ${aTextoPlano(h.descripcion)}`);
      for (const e of h.ejemplos) {
        lineas.push(`   · ${e.ubicacion ? "[" + e.ubicacion + "] " : ""}${e.texto}`);
      }
      if (h.sugerencia) lineas.push(`   Cómo corregirlo: ${aTextoPlano(h.sugerencia)}`);
      if (h.autoridad && EXIGENCIA[h.autoridad]) lineas.push(`   Exigencia: ${EXIGENCIA[h.autoridad]}`);
      if (h.fuente) lineas.push(`   Fuente: ${h.fuente}`);
      lineas.push("");
    }

    const fuentes = FUENTES[ultimoAmbito];
    if (fuentes) {
      lineas.push("".padEnd(60, "-"), fuentes.titulo.toUpperCase(), "".padEnd(60, "-"), "");
      lineas.push(aTextoPlano(fuentes.intro), "");
      for (const item of fuentes.lista) lineas.push(`· ${aTextoPlano(item)}`);
      lineas.push("", aTextoPlano(fuentes.cierre), "");
    }

    const conteo = { alta: 0, media: 0, baja: 0 };
    for (const h of analisis.hallazgos) conteo[h.severidad]++;
    lineas.push(
      "".padEnd(60, "-"),
      "SÍNTESIS",
      "".padEnd(60, "-"),
      `Prioridad alta:  ${conteo.alta}`,
      `Prioridad media: ${conteo.media}`,
      `Prioridad baja:  ${conteo.baja}`,
      `Total: ${total} sobre ${analisis.totalReglas} reglas evaluadas.`,
      `Incumplimientos de prioridad alta pendientes: ${conteo.alta > 0 ? "sí" : "no"}.`,
      ""
    );

    return lineas.join("\n");
  }

  btnImprimir.addEventListener("click", () => window.print());

  // Al imprimir hay que abrir el grupo de sugerencias menores: si queda plegado,
  // el navegador no imprime lo que hay adentro.
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll("#panel-resultados details").forEach((d) => (d.open = true));
  });

  btnCopiar.addEventListener("click", async () => {
    if (!ultimoAnalisis) return;
    const texto = analisisATexto(ultimoAnalisis);
    try {
      await navigator.clipboard.writeText(texto);
      copiarEstadoEl.textContent = "Lista copiada.";
    } catch (err) {
      // El portapapeles puede estar bloqueado (permisos, navegador viejo, http).
      copiarEstadoEl.textContent = 'No se pudo copiar. Usá "Imprimir o guardar en PDF".';
    }
    setTimeout(() => (copiarEstadoEl.textContent = ""), 4000);
  });

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Lleva la pantalla hasta el resultado. Sin esto, en el teléfono el análisis
   * termina y el panel queda abajo, fuera de la vista: parece que no pasó nada.
   */
  function irAlResultado() {
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelResultados.scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth", block: "start" });
    // Además del scroll, mover el foco: es lo que hace que un lector de
    // pantalla empiece a leer el resultado en vez de quedarse en el botón.
    panelResultados.focus({ preventScroll: true });
  }

  function actualizarProgreso(mensaje, fraccion) {
    if (mensaje !== undefined) estado.textContent = mensaje;
    if (fraccion !== undefined) {
      const porcentaje = Math.min(100, Math.max(0, Math.round(fraccion * 100)));
      barraProgresoWrap.hidden = false;
      barraProgresoRelleno.style.width = `${porcentaje}%`;
      barraProgresoTexto.textContent = `${porcentaje}%`;
    }
  }

  function ocultarProgreso() {
    barraProgresoWrap.hidden = true;
    barraProgresoRelleno.style.width = "0%";
    barraProgresoTexto.textContent = "0%";
  }

  btnAnalizar.addEventListener("click", async () => {
    if (!archivoActual) return;
    btnAnalizar.disabled = true;
    panelResultados.hidden = true;
    ocultarProgreso();
    estado.textContent = "Extrayendo texto del documento...";

    try {
      const texto = await Extract.extract(archivoActual, actualizarProgreso);
      ocultarProgreso();

      if (!texto || texto.trim().length < 20) {
        estado.textContent =
          "No se pudo extraer texto suficiente del documento. Si es una imagen o PDF escaneado, " +
          "verificá que se lea con claridad.";
        btnAnalizar.disabled = false;
        return;
      }

      estado.textContent = "Analizando contra reglas de técnica legislativa...";
      const ambito = getAmbitoSeleccionado();
      const analisis = RuleEngine.analyze(texto, ambito);

      estado.textContent = "Análisis completo.";
      ultimoAnalisis = analisis;
      ultimoAmbito = ambito;
      renderResultados(analisis, ambito);
      plegarCarga(archivoActual, ambito);
      irAlResultado();
    } catch (err) {
      ocultarProgreso();
      estado.textContent = `Error: ${err.message}`;
    } finally {
      btnAnalizar.disabled = false;
    }
  });
})();
