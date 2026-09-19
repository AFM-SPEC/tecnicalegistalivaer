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
  const accionesEl = document.getElementById("acciones");
  const btnImprimir = document.getElementById("btn-imprimir");
  const btnCopiar = document.getElementById("btn-copiar");
  const copiarEstadoEl = document.getElementById("copiar-estado");

  let archivoActual = null;
  // Último análisis, para poder imprimirlo o copiarlo sin volver a correrlo.
  let ultimoAnalisis = null;

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
        <li class="resumen-item baja">${conteo.baja} menor${conteo.baja === 1 ? "" : "es"}</li>
      </ul>
    `;

    accionesEl.hidden = total === 0;

    if (analisis.totalReglas === 0) {
      listaHallazgosEl.innerHTML = `<div class="sin-hallazgos">
        Todavía no se puede revisar este tipo de norma. Por ahora la herramienta solo
        analiza normas de ámbito nacional; los manuales de técnica legislativa de Entre
        Ríos aún no están cargados.
      </div>`;
      return;
    }

    if (analisis.hallazgos.length === 0) {
      listaHallazgosEl.innerHTML = `<div class="sin-hallazgos">
        No se detectaron incumplimientos con las ${analisis.totalReglas} reglas evaluadas.
      </div>`;
      return;
    }

    const orden = { alta: 0, media: 1, baja: 2 };
    const ordenados = [...analisis.hallazgos].sort((a, b) => orden[a.severidad] - orden[b.severidad]);

    // Las de prioridad baja son muchas y, mezcladas con el resto, tapan lo
    // importante. Se muestran aparte, plegadas, para que primero se vea lo que
    // hay que mirar sí o sí.
    const principales = ordenados.filter((h) => h.severidad !== "baja");
    const menores = ordenados.filter((h) => h.severidad === "baja");

    let html = principales.map(renderHallazgo).join("");

    if (principales.length === 0) {
      html = `<div class="sin-principales">
        No se detectaron problemas de prioridad alta ni media.
      </div>`;
    }

    if (menores.length > 0) {
      const plural = menores.length === 1;
      // Si no hay nada más importante que mostrar, no tiene sentido esconderlas.
      const abierto = principales.length === 0 ? " open" : "";
      html += `
        <details class="menores"${abierto}>
          <summary class="menores-summary">
            <span class="menores-titulo">Ver ${menores.length} sugerencia${plural ? "" : "s"} menor${plural ? "" : "es"}</span>
            <span class="menores-hint">detalles de forma: puntuación, siglas, abreviaturas, redacción</span>
          </summary>
          <div class="menores-lista">${menores.map(renderHallazgo).join("")}</div>
        </details>`;
    }

    listaHallazgosEl.innerHTML = html;
  }

  const PRIORIDAD = { alta: "Prioridad alta", media: "Prioridad media", baja: "Prioridad baja" };

  /** Arma la tarjeta de un hallazgo. */
  function renderHallazgo(h) {
    // Si el problema está en un solo lugar, ya lo dice la línea de arriba:
    // repetirlo en cada cita sería decir dos veces lo mismo.
    const repetirLugar = h.ubicaciones.length > 1;

    return `
        <article class="hallazgo ${h.severidad}">
          ${renderMeta(h)}
          <div class="hallazgo-titulo">${h.titulo}</div>
          <div class="hallazgo-desc">${h.descripcion}</div>
          ${
            h.ejemplos.length
              ? `<p class="hallazgo-label">En tu texto</p>
                 <div class="hallazgo-ejemplos">${h.ejemplos
                   .map((e) => renderEjemplo(e, repetirLugar))
                   .join("\n")}</div>`
              : ""
          }
          ${
            h.sugerencia
              ? `<p class="hallazgo-label">Cómo corregirlo</p>
                 <div class="hallazgo-sugerencia">${h.sugerencia}</div>`
              : ""
          }
        </article>`;
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

  // ---------------------------------------------------------------------------
  // Llevarse el resultado: imprimir / guardar en PDF y copiar
  // ---------------------------------------------------------------------------

  /** Pasa a texto plano lo que en pantalla es HTML (las reglas usan <em>, <strong>). */
  function aTextoPlano(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || "").replace(/\s+/g, " ").trim();
  }

  const PRIORIDAD_TEXTO = { alta: "PRIORIDAD ALTA", media: "PRIORIDAD MEDIA", baja: "SUGERENCIAS MENORES" };

  /** Arma la lista completa en texto plano, para pegar en un mail o un documento. */
  function analisisATexto(analisis) {
    const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
    const total = analisis.hallazgos.length;

    const lineas = [
      "REVISOR DE TÉCNICA LEGISLATIVA",
      archivoActual ? `Documento: ${archivoActual.name}` : "",
      `Fecha del análisis: ${fecha}`,
      `${total} ${total === 1 ? "corrección sugerida" : "correcciones sugeridas"} sobre ${analisis.totalReglas} reglas evaluadas.`,
      "",
      "Estas son sugerencias orientativas de forma. La decisión de corregir, y cómo",
      "hacerlo, queda a criterio de quien redacta la norma.",
      "",
    ].filter((l) => l !== "");

    const orden = { alta: 0, media: 1, baja: 2 };
    const ordenados = [...analisis.hallazgos].sort((a, b) => orden[a.severidad] - orden[b.severidad]);

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
      if (h.fuente) lineas.push(`   Fuente: ${h.fuente}`);
      lineas.push("");
    }

    return lineas.join("\n");
  }

  btnImprimir.addEventListener("click", () => window.print());

  // Al imprimir hay que abrir el grupo de sugerencias menores: si queda plegado,
  // el navegador no imprime lo que hay adentro.
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll("#lista-hallazgos details").forEach((d) => (d.open = true));
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
      renderResultados(analisis, ambito);
      irAlResultado();
    } catch (err) {
      ocultarProgreso();
      estado.textContent = `Error: ${err.message}`;
    } finally {
      btnAnalizar.disabled = false;
    }
  });
})();
