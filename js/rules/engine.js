/**
 * Motor de reglas: corre cada regla del ámbito elegido contra el texto
 * extraído y devuelve solo los hallazgos (reglas que NO se cumplen).
 *
 * Cada regla tiene la forma:
 * {
 *   id: 'nac-001',
 *   titulo: 'Fórmula de sanción presente',
 *   descripcion: 'Explicación de la regla y por qué importa.',
 *   severidad: 'alta' | 'media' | 'baja',
 *   sugerencia: 'Ejemplo concreto de cómo debería quedar el texto.',
 *   check(text) => { cumple: boolean, ejemplos?: string[] }
 * }
 */

const RuleEngine = (() => {
  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  /** Devuelve un fragmento de texto alrededor de `index`, para citar dónde aparece algo. */
  function contexto(texto, index, radio = 60) {
    const inicio = Math.max(0, index - radio);
    const fin = Math.min(texto.length, index + radio);
    let frag = texto.slice(inicio, fin).replace(/\s+/g, " ").trim();
    if (inicio > 0) frag = "…" + frag;
    if (fin < texto.length) frag = frag + "…";
    return frag;
  }

  function getRulesFor(ambito) {
    const sets = {
      nacional: window.ReglasNacional || [],
      provincial: window.ReglasProvincialER || [],
      municipal: window.ReglasMunicipalER || [],
    };
    return sets[ambito] || [];
  }

  function analyze(text, ambito) {
    const rules = getRulesFor(ambito);
    const hallazgos = [];

    for (const rule of rules) {
      let resultado;
      try {
        resultado = rule.check(text, { normalizar, contexto });
      } catch (err) {
        resultado = {
          cumple: false,
          ejemplos: [`No se pudo evaluar esta regla automáticamente (${err.message}). Revisar manualmente.`],
        };
      }

      if (resultado && resultado.cumple === false) {
        hallazgos.push({
          id: rule.id,
          titulo: rule.titulo,
          descripcion: rule.descripcion,
          sugerencia: rule.sugerencia || "",
          fuente: rule.fuente || "",
          severidad: rule.severidad,
          ejemplos: resultado.ejemplos || [],
        });
      }
    }

    return {
      totalReglas: rules.length,
      hallazgos,
    };
  }

  return { analyze, normalizar };
})();

window.RuleEngine = RuleEngine;
