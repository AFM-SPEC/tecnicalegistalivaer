/**
 * Extracción de texto desde distintos formatos de archivo.
 * Todo corre en el navegador (sin backend).
 */

const Extract = (() => {
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  }

  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, "utf-8");
    });
  }

  function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * onProgress(mensaje, fraccion):
   *  - `mensaje` (string u undefined): si viene, reemplaza el texto de estado.
   *    Si es undefined, se deja el texto de estado como está (solo se actualiza la barra).
   *  - `fraccion` (0 a 1, u undefined): si viene, actualiza la barra de progreso.
   */
  async function fromPdf(file, onProgress) {
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const paginas = new Array(pdf.numPages).fill("");
    const paginasOcr = [];

    const emitir = (mensaje, fraccion) => {
      if (onProgress) onProgress(mensaje, fraccion);
    };

    // Primera pasada: leer el texto ya seleccionable de cada página (instantáneo).
    // Se anotan aparte las páginas sin texto (escaneadas) para procesarlas después.
    // No se muestra barra de progreso acá: solo aparece si hace falta OCR.
    emitir("Leyendo el documento...", undefined);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      if (pageText.trim().length < 20) {
        paginasOcr.push(i);
      } else {
        paginas[i - 1] = pageText;
      }
    }

    if (paginasOcr.length > 0) {
      // Varias páginas en paralelo (hasta 4, según núcleos disponibles) para no
      // procesarlas de a una. Cada "lector" (worker) toma la siguiente página libre.
      const numWorkers = Math.max(
        1,
        Math.min(4, (navigator.hardwareConcurrency || 2) - 1, paginasOcr.length)
      );
      emitir(
        `Como el documento que cargaste no tiene letras reconocibles en ${paginasOcr.length} de ` +
          `${pdf.numPages} página(s), vamos a leerlas con reconocimiento óptico de caracteres ` +
          `(${numWorkers} en simultáneo). Esto puede demorar varios minutos.`,
        0
      );

      const progresoPorPagina = new Map(paginasOcr.map((n) => [n, 0]));
      const actualizarBarra = () => {
        let suma = 0;
        for (const v of progresoPorPagina.values()) suma += v;
        emitir(undefined, suma / paginasOcr.length);
      };

      const estadosWorkers = Array.from({ length: numWorkers }, () => ({ paginaActual: null }));
      const workers = await Promise.all(
        estadosWorkers.map((estado) =>
          Tesseract.createWorker("spa", 1, {
            logger: (m) => {
              if (m.status === "recognizing text" && estado.paginaActual != null) {
                progresoPorPagina.set(estado.paginaActual, m.progress);
                actualizarBarra();
              }
            },
          })
        )
      );

      let siguienteIndice = 0;
      async function procesarConWorker(worker, estado) {
        while (siguienteIndice < paginasOcr.length) {
          const numeroPagina = paginasOcr[siguienteIndice++];
          estado.paginaActual = numeroPagina;

          const page = await pdf.getPage(numeroPagina);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          const { data } = await worker.recognize(canvas);
          paginas[numeroPagina - 1] = data.text;
          progresoPorPagina.set(numeroPagina, 1);
          actualizarBarra();
        }
      }

      try {
        await Promise.all(workers.map((w, idx) => procesarConWorker(w, estadosWorkers[idx])));
      } finally {
        await Promise.all(workers.map((w) => w.terminate()));
      }
    }

    return paginas.join("\n\n");
  }

  async function fromDocx(file) {
    const buffer = await readAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  async function fromImage(file, onProgress) {
    let anunciado = false;
    const result = await Tesseract.recognize(file, "spa", {
      logger: (m) => {
        if (!onProgress) return;
        if (!anunciado) {
          anunciado = true;
          onProgress("Leyendo el texto de la imagen con reconocimiento óptico de caracteres...", 0);
        }
        if (m.status === "recognizing text") {
          onProgress(undefined, m.progress);
        }
      },
    });
    return result.data.text;
  }

  function extensionOf(fileName) {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  /**
   * Extrae texto según la extensión del archivo.
   * onProgress(mensaje) es opcional, para feedback en la UI.
   */
  async function extract(file, onProgress) {
    const ext = extensionOf(file.name);

    switch (ext) {
      case "txt":
      case "md":
        return readAsText(file);

      case "pdf":
        return fromPdf(file, onProgress);

      case "docx":
        return fromDocx(file);

      case "doc":
        throw new Error(
          "El formato .doc (Word 97-2003) no se puede leer de forma confiable " +
            "en el navegador. Convertí el archivo a .docx o .pdf y volvé a subirlo."
        );

      case "png":
      case "jpg":
      case "jpeg":
        return fromImage(file, onProgress);

      default:
        throw new Error(`Formato de archivo no soportado: .${ext}`);
    }
  }

  return { extract };
})();

window.Extract = Extract;
