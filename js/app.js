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

  let archivoActual = null;

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

  dropzone.addEventListener("click", () => fileInput.click());

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

    resumenEl.innerHTML = `
      <span class="resumen-item alta">${conteo.alta} alta${conteo.alta === 1 ? "" : "s"}</span>
      <span class="resumen-item media">${conteo.media} media${conteo.media === 1 ? "" : "s"}</span>
      <span class="resumen-item baja">${conteo.baja} baja${conteo.baja === 1 ? "" : "s"}</span>
    `;

    if (analisis.totalReglas === 0) {
      listaHallazgosEl.innerHTML = `<div class="sin-hallazgos">
        Todavía no hay reglas cargadas para el ámbito "${ambito}". Sumá el documento de
        técnica legislativa correspondiente y completá <code>js/rules/${ambito === "nacional" ? "nacional" : ambito === "provincial" ? "provincial-er" : "municipal-er"}.js</code>.
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
    return `
        <article class="hallazgo ${h.severidad}">
          <span class="hallazgo-prioridad ${h.severidad}">${PRIORIDAD[h.severidad]}</span>
          <div class="hallazgo-titulo">${h.titulo}</div>
          ${renderUbicaciones(h.ubicaciones)}
          <div class="hallazgo-desc">${h.descripcion}</div>
          ${
            h.ejemplos.length
              ? `<p class="hallazgo-label">Dónde aparece en tu texto:</p>
                 <div class="hallazgo-ejemplos">${h.ejemplos.map(renderEjemplo).join("\n")}</div>`
              : ""
          }
          ${
            h.sugerencia
              ? `<p class="hallazgo-label">Cómo corregirlo:</p>
                 <div class="hallazgo-sugerencia">${h.sugerencia}</div>`
              : ""
          }
        </article>`;
  }

  /**
   * Muestra en qué parte del documento hay que hacer la corrección.
   * Si el mismo problema aparece en varios lugares, los lista todos.
   */
  function renderUbicaciones(ubicaciones) {
    if (!ubicaciones || ubicaciones.length === 0) return "";
    const visibles = ubicaciones.slice(0, 6).map(escapeHtml);
    const restantes = ubicaciones.length - visibles.length;
    const chips = visibles.map((u) => `<span class="ubicacion-chip">${u}</span>`).join("");
    const mas = restantes > 0 ? `<span class="ubicacion-mas">y ${restantes} lugar${restantes === 1 ? "" : "es"} más</span>` : "";
    return `<div class="hallazgo-ubicaciones">
      <span class="hallazgo-ubicaciones-label">Dónde corregir:</span>${chips}${mas}
    </div>`;
  }

  /** Cada cita del documento, con la etiqueta del lugar donde está. */
  function renderEjemplo(ejemplo) {
    const cuerpo = escapeHtml(ejemplo.texto);
    const lugar = ejemplo.ubicacion
      ? `<span class="ejemplo-ubicacion">${escapeHtml(ejemplo.ubicacion)}</span>`
      : "";
    return `<div class="ejemplo">${lugar}<span class="ejemplo-texto">${cuerpo}</span></div>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      renderResultados(analisis, ambito);
    } catch (err) {
      ocultarProgreso();
      estado.textContent = `Error: ${err.message}`;
    } finally {
      btnAnalizar.disabled = false;
    }
  });
})();
