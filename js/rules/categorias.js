/**
 * Categorías temáticas de las reglas.
 *
 * La prioridad (alta/media/baja) dice cuánto urge corregir algo. Esto dice de
 * QUÉ trata: si el problema está en el encabezado, en la estructura, en cómo se
 * cita otra norma, etc. El informe agrupa las observaciones por esta categoría,
 * porque quien corrige trabaja por zonas del documento, no salteado.
 *
 * Es sólo una clasificación de presentación: no cambia ninguna regla ni decide
 * si algo se cumple. Una regla sin categoría cae en "Otras observaciones", así
 * que agregar reglas nuevas nunca hace desaparecer un hallazgo de la pantalla.
 */

window.CategoriasReglas = (() => {
  const orden = [
    {
      clave: "formulas",
      titulo: "Encabezado, título y fórmulas",
      pista: "cómo se abre y se cierra la norma, y qué anuncia su título",
    },
    {
      clave: "estructura",
      titulo: "Estructura y numeración",
      pista: "artículos, capítulos, incisos, anexos y el orden entre ellos",
    },
    {
      clave: "modificaciones",
      titulo: "Modificaciones, derogaciones y vigencia",
      pista: "qué le hace esta norma a las normas que ya existen, y desde cuándo",
    },
    {
      clave: "citas",
      titulo: "Citas y remisiones",
      pista: "cómo se nombra a otra norma o a otro artículo de la misma",
    },
    {
      clave: "redaccion",
      titulo: "Redacción normativa",
      pista: "claridad, ambigüedad y el tono imperativo que la norma necesita",
    },
    {
      clave: "ortotipografia",
      titulo: "Ortotipografía y formato",
      pista: "siglas, cifras, comillas, mayúsculas y abreviaturas",
    },
    {
      clave: "otras",
      titulo: "Otras observaciones",
      pista: "reglas todavía sin clasificar",
    },
  ];

  const de = {
    // ---- Reglas comunes a los tres ámbitos ---------------------------------
    "com-001": "formulas",
    "com-002": "formulas",
    "com-003": "estructura",
    "com-004": "estructura",
    "com-005": "estructura",
    "com-006": "ortotipografia",
    "com-007": "ortotipografia",
    "com-008": "citas",
    "com-009": "estructura",
    "com-010": "estructura",
    "com-011": "estructura",
    "com-012": "estructura",
    "com-013": "estructura",
    "com-014": "estructura",
    "com-015": "formulas",
    "com-016": "modificaciones",
    "com-017": "modificaciones",
    "com-018": "modificaciones",
    "com-019": "modificaciones",
    "com-020": "modificaciones",
    "com-021": "modificaciones",
    "com-022": "modificaciones",
    "com-023": "citas",
    "com-024": "citas",
    "com-025": "redaccion",
    "com-026": "redaccion",
    "com-027": "redaccion",
    "com-028": "redaccion",
    "com-029": "redaccion",
    "com-030": "redaccion",
    "com-031": "redaccion",
    "com-032": "redaccion",
    "com-033": "redaccion",
    "com-034": "ortotipografia",
    "com-035": "ortotipografia",
    "com-036": "ortotipografia",
    "com-037": "ortotipografia",
    "com-038": "ortotipografia",
    "com-039": "redaccion",
    "com-040": "redaccion",
    "com-041": "redaccion",
    "com-042": "redaccion",
    "com-043": "redaccion",
    "com-044": "ortotipografia",
    "com-045": "citas",
    "com-046": "estructura",
    "com-047": "redaccion",
    "com-048": "ortotipografia",
    "com-049": "estructura",
    "com-050": "modificaciones",
    "com-051": "modificaciones",
    "com-052": "modificaciones",
    "com-053": "modificaciones",
    "com-054": "formulas",
    "com-055": "redaccion",
    "com-056": "estructura",
    "com-057": "ortotipografia",
    "com-058": "redaccion",

    // ---- Ámbito nacional ---------------------------------------------------
    "nac-001": "formulas",
    "nac-003": "formulas",
    "nac-005": "redaccion",
    "nac-006": "modificaciones",
    "nac-013": "ortotipografia",
    "nac-014": "estructura",
    "nac-016": "formulas",
    "nac-017": "estructura",
    "nac-018": "formulas",
    "nac-019": "estructura",
    "nac-022": "redaccion",
    "nac-025": "citas",
    "nac-026": "redaccion",
    "nac-028": "citas",
    "nac-029": "redaccion",
    "nac-032": "citas",
    "nac-033": "citas",
    "nac-034": "modificaciones",
    "nac-036": "estructura",
    "nac-041": "formulas",
    "nac-043": "estructura",
    "nac-046": "ortotipografia",
    "nac-048": "formulas",
    "nac-049": "modificaciones",
    "nac-050": "estructura",
    "nac-051": "estructura",
    "nac-052": "estructura",
    "nac-053": "estructura",
    "nac-054": "estructura",
    "nac-056": "estructura",
    "nac-057": "redaccion",
    "nac-058": "redaccion",
    "nac-059": "redaccion",
    "nac-060": "citas",
    "nac-061": "citas",
    "nac-062": "citas",
    "nac-063": "ortotipografia",
    "nac-064": "estructura",
    "nac-065": "ortotipografia",
    "nac-066": "citas",
    "nac-067": "citas",
    "nac-068": "estructura",
    "nac-069": "modificaciones",
    "nac-070": "estructura",
    "nac-071": "estructura",

    // ---- Provincia de Entre Ríos -------------------------------------------
    "er-prov-001": "formulas",
    "er-prov-002": "formulas",
    "er-prov-003": "formulas",
    "er-prov-009": "citas",
    "er-prov-015": "formulas",
    "er-prov-016": "formulas",
    "er-prov-018": "formulas",
    "er-prov-022": "citas",
    "er-prov-030": "ortotipografia",

    // ---- Municipios de Entre Ríos ------------------------------------------
    "er-mun-004": "formulas",
    "er-mun-005": "formulas",
    "er-mun-007": "formulas",
    "er-mun-019": "modificaciones",
    "er-mun-033": "citas",
    "er-mun-048": "ortotipografia",
    "er-mun-049": "ortotipografia",
    "er-mun-050": "ortotipografia",
    "er-mun-054": "formulas",
    "er-mun-055": "formulas",
    "er-mun-056": "redaccion",
  };

  /** Categoría de una regla. Las que no estén en el mapa van al final. */
  function categoriaDe(id) {
    return de[id] || "otras";
  }

  return { orden, de, categoriaDe };
})();
