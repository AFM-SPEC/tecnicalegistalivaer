/**
 * Prioridad de cada regla: un solo criterio para los tres ámbitos.
 *
 * La prioridad dice cuánto conviene atender una observación, según lo que el
 * error AFECTA. No depende de cuánto obliga la fuente: eso lo muestra aparte
 * la etiqueta de autoridad ("Regla obligatoria", "Criterio de estilo"…).
 * Así, el mismo error tiene la misma prioridad en una ley nacional, en una ley
 * entrerriana y en una ordenanza.
 *
 *   ALTA   Puede cambiar qué manda la norma, a quién o desde cuándo.
 *   MEDIA  Dificulta identificar, entender, citar o aplicar la norma.
 *   BAJA   Forma y estilo: no cambia el sentido.
 *
 * Este criterio es una decisión del proyecto. Se aparta del Manual municipal
 * (sección 19: ninguna regla subsidiaria pasa de media) y del criterio
 * provincial (sólo una regla EXIGE llega a alta), que ataban la prioridad a la
 * autoridad de la fuente.
 *
 * Cada regla tiene que figurar en un solo grupo. Una regla que no figure acá
 * se muestra con prioridad media y deja un aviso en la consola.
 */

window.PrioridadesReglas = (() => {
  const GRUPOS = [
    // ===================================================================== ALTA
    {
      prioridad: "alta",
      tema: "Vigencia imprecisa, contradictoria o anterior a la norma",
      reglas: ["com-016", "com-017", "er-mun-057"],
    },
    {
      prioridad: "alta",
      tema: "Derogaciones que no dicen qué derogan o desde cuándo",
      reglas: ["com-020", "com-053", "nac-034", "er-mun-061"],
    },
    {
      prioridad: "alta",
      tema: "Modificaciones que no dicen cómo queda la norma",
      reglas: ["com-018", "com-019", "com-051", "com-052", "er-mun-058", "er-mun-059", "er-mun-060"],
    },
    { prioridad: "alta", tema: "Prórrogas y suspensiones sin identificar", reglas: ["com-021", "com-022"] },
    { prioridad: "alta", tema: "Cifras que no coinciden", reglas: ["com-036"] },
    { prioridad: "alta", tema: "Remisiones a artículos o normas que no existen", reglas: ["com-045", "er-mun-062"] },
    {
      prioridad: "alta",
      tema: "Contenido que no se sabe si integra la norma",
      reglas: ["er-prov-009", "nac-064", "com-013"],
    },

    // ==================================================================== MEDIA
    {
      prioridad: "media",
      tema: "Identificación de la norma",
      reglas: ["com-001", "com-002", "nac-016", "nac-048", "er-prov-018"],
    },
    {
      prioridad: "media",
      tema: "Fórmula de sanción",
      reglas: ["nac-001", "er-prov-001", "er-prov-002", "er-prov-003", "er-mun-054"],
    },
    { prioridad: "media", tema: "Falta la cláusula de vigencia", reglas: ["nac-006", "er-mun-019"] },
    {
      prioridad: "media",
      tema: "Numeración y estructura",
      reglas: [
        "com-003", "com-004", "com-005", "com-009", "com-010", "com-011", "com-012", "com-014",
        "com-046", "com-049", "com-054", "com-056", "nac-005", "nac-052", "nac-070",
        "er-mun-004", "er-mun-005", "er-mun-007",
      ],
    },
    { prioridad: "media", tema: "Modificaciones y derogaciones mal armadas", reglas: ["com-050", "nac-069", "er-mun-064"] },
    {
      prioridad: "media",
      tema: "Citas y remisiones imprecisas",
      reglas: ["com-023", "com-024", "nac-025", "nac-032", "nac-033", "nac-060", "nac-061", "nac-062"],
    },
    {
      prioridad: "media",
      tema: "Redacción ambigua",
      reglas: [
        "com-025", "com-026", "com-027", "com-028", "com-030", "com-031", "com-032", "com-048",
        "com-055", "nac-022", "nac-059", "er-mun-056", "er-mun-066",
      ],
    },
    {
      prioridad: "media",
      tema: "Avisos de revisión (requieren criterio jurídico)",
      reglas: [
        "com-039", "com-040", "com-041", "com-042", "er-mun-065", "er-mun-067", "er-mun-068",
        "er-mun-069", "er-mun-070", "er-mun-071", "er-mun-076",
      ],
    },

    // ===================================================================== BAJA
    { prioridad: "baja", tema: "Fórmula de cierre", reglas: ["nac-003", "er-prov-015", "er-prov-016", "er-mun-055"] },
    {
      prioridad: "baja",
      tema: "Presentación de títulos, divisiones y anexos",
      reglas: [
        "com-015", "nac-014", "nac-017", "nac-018", "nac-019", "nac-036", "nac-041", "nac-043",
        "nac-050", "nac-051", "nac-054", "nac-056", "nac-063", "nac-068", "nac-071", "er-mun-075",
        "er-mun-077", "er-mun-078", "er-mun-079",
      ],
    },
    { prioridad: "baja", tema: "Formato de los artículos", reglas: ["com-006", "com-007", "com-008", "nac-053"] },
    {
      prioridad: "baja",
      tema: "Formato de las citas",
      reglas: ["er-prov-022", "er-mun-033", "nac-028", "nac-049", "nac-066"],
    },
    {
      prioridad: "baja",
      tema: "Ortotipografía",
      reglas: [
        "com-033", "com-034", "com-035", "com-037", "com-038", "com-044", "com-057", "er-prov-030",
        "nac-013", "nac-046", "nac-065", "nac-067", "er-mun-048", "er-mun-049", "er-mun-050",
      ],
    },
    {
      prioridad: "baja",
      tema: "Estilo",
      reglas: [
        "com-029", "com-043", "com-047", "com-058", "nac-026", "nac-029", "nac-057", "nac-058",
        "er-mun-063", "er-mun-072", "er-mun-073", "er-mun-074", "er-mun-080",
      ],
    },
  ];

  const porId = new Map();
  for (const g of GRUPOS) for (const id of g.reglas) porId.set(id, g.prioridad);

  const avisadas = new Set();
  function de(id) {
    const prioridad = porId.get(id);
    if (!prioridad && !avisadas.has(id)) {
      avisadas.add(id);
      console.warn(`La regla ${id} no tiene prioridad asignada en prioridades.js`);
    }
    return prioridad || "media";
  }

  return { de, grupos: GRUPOS };
})();
