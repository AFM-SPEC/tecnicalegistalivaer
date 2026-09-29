# Mapa de cobertura — reglas provinciales de Entre Ríos

Este archivo lista **cada regla de la skill de técnica legislativa entrerriana**
(`docs/fuentes/provincial-er/SKILL_TECNICA_LEGISLATIVA_ER.md`) y dice si la
herramienta la verifica automáticamente, con qué regla y por qué, cuando no.

Estado posible:

- **CUBIERTA** — hay una regla automática que la detecta (se indica cuál).
- **NO AUTOMATIZABLE** — requiere entender el significado del texto, no su forma.
- **FUERA DE ALCANCE** — la propia skill prohíbe emitir un hallazgo sobre eso.

La columna *Exigencia* repite el nivel de autoridad que la skill le asigna a la
regla, porque de él depende la severidad máxima que puede tener un hallazgo:
sólo `EXIGE` puede llegar a prioridad alta.

---

## Reglas provinciales (ER)

| Regla de la skill | Exigencia | Estado |
|---|---|---|
| ER-01 Fórmula constitucional de sanción | EXIGE | **CUBIERTA** (er-prov-001 ausencia, er-prov-002 fórmula nacional, er-prov-003 "sancionan") |
| ER-02 Carácter rigurosamente preceptivo | EXIGE | **CUBIERTA** (er-prov-004) — detecta los conectores de motivación; una justificación sin conector no se reconoce |
| ER-03 Fundamentos separados del articulado | EXIGE | **CUBIERTA** (er-prov-005) — sólo marca si el bloque quedó intercalado entre artículos. La ausencia de fundamentos no se exige: las fuentes admiten fundamentación verbal |
| ER-04 Unidad normativa del artículo | EXIGE en Senado | **CUBIERTA** parcialmente (er-prov-008) — marca artículos largos con tres o más verbos normativos y sin incisos. La unidad real depende del contenido |
| ER-05 Numeración y encabezados | ACOSTUMBRA | **CUBIERTA** (er-prov-017 secuencia, er-prov-018 número de ley, er-prov-020 grafía, er-prov-021 separador). El ordinal después del 9 **no** se marca como error (CT-04) |
| ER-06 Artículo de forma | ACOSTUMBRA | **CUBIERTA** (er-prov-015 ausencia, er-prov-016 fórmula de decreto). Nunca como prioridad alta (CT-02) |
| ER-07 Verbos normativos en pasiva refleja | ACOSTUMBRA | **CUBIERTA** (er-prov-014) |
| ER-08 Cifras en letras y números | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (er-prov-010 cifra sola, er-prov-011 letras y número que no coinciden) |
| ER-09 Siglas | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (er-prov-012 primer uso sin denominación, er-prov-031 grafía) |
| ER-10 Léxico y extranjerismos | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (er-prov-013) — lista cerrada de términos con equivalente castellano claro |
| ER-11 Citas de leyes | ACOSTUMBRA | **CUBIERTA** (er-prov-022 separador de miles) |
| ER-12 Inserción íntegra de prescripciones citadas | EXIGE | **CUBIERTA** parcialmente (er-prov-009) — se emite como aviso de revisión humana: distinguir una referencia de una verdadera incorporación exige leer el contenido |
| ER-13 Modificaciones expresas y textuales | EXIGE | **CUBIERTA** (er-prov-007) |
| ER-14 Derogaciones expresas | EXIGE | **CUBIERTA** (er-prov-006). No se evalúa si la lista de normas derogadas está completa |
| ER-15 Coherencia formal de modificaciones | ACOSTUMBRA | **CUBIERTA** parcialmente (er-prov-023 comillas). Los dos puntos antes del texto nuevo se controlan dentro de er-prov-007 |

## Reglas subsidiarias (SUB)

Ninguna puede pasar de prioridad media, y todas se muestran como criterio de
estilo, no como obligación provincial.

| Regla de la skill | Estado |
|---|---|
| SUB-01 Título breve y no mudo | **NO AUTOMATIZABLE** — juzgar si un título es "mudo" exige compararlo con el contenido |
| SUB-02 Título de una norma modificatoria | **NO AUTOMATIZABLE** — depende de identificar cuál es el objeto principal |
| SUB-03 Secuencia general de las disposiciones | **CUBIERTA** parcialmente (er-prov-024 transitorias) |
| SUB-04 Epígrafes | **NO AUTOMATIZABLE** — no hay umbral formal de "texto extenso" en las fuentes entrerrianas |
| SUB-05 Divisiones superiores | **CUBIERTA** (er-prov-026 saltos de nivel y divisiones únicas) |
| SUB-06 Incisos y enumeraciones | **CUBIERTA** (er-prov-025 viñetas gráficas) |
| SUB-07 Enumeraciones taxativas o ejemplificativas | **NO AUTOMATIZABLE** — requiere inferir la intención material |
| SUB-08 Brevedad de frases | **NO AUTOMATIZABLE** en el ámbito provincial: la longitud sola no distingue complejidad jurídica de defecto de redacción |
| SUB-09 Tiempo verbal | **CUBIERTA** (er-prov-029) — sólo cuando el futuro es la forma dominante |
| SUB-10 Doble negación y "y/o" | **CUBIERTA** (er-prov-027, er-prov-028) |
| SUB-11 Definiciones | **NO AUTOMATIZABLE** — exige saber si un término se usa con sentido especial |
| SUB-12 Escritura de siglas | **CUBIERTA** (er-prov-031) |
| SUB-13 Fechas | **CUBIERTA** (er-prov-030) |
| SUB-14 Puntuación | **CUBIERTA** parcialmente (er-prov-023 comillas) |
| SUB-15 Cadenas de remisiones | **NO AUTOMATIZABLE** — hay que seguir la cadena para saber si reconstruye una misma regla |
| SUB-16 Derogaciones agrupadas | **NO AUTOMATIZABLE** — depende de si las normas derogadas se relacionan entre sí |
| SUB-17 Disposiciones transitorias | **CUBIERTA** (er-prov-024) |
| SUB-18 Anexos | **CUBIERTA** parcialmente (er-prov-019 anexo nombrado una sola vez) |
| SUB-19 Modificaciones implícitas | **NO AUTOMATIZABLE** — exige comparar el proyecto con legislación externa que no está en el archivo |

## Contradicciones documentadas y cómo las resuelve la herramienta

| Contradicción | Resolución aplicada |
|---|---|
| CT-01 Remisión nacional vs. art. 130 de Entre Ríos | Prevalece el art. 130: er-prov-009 pide insertar el contenido incorporado, al revés del criterio nacional |
| CT-02 Artículo de forma | er-prov-015 y er-prov-016 son de prioridad media y se presentan como práctica, nunca como vicio jurídico |
| CT-03 Ubicación de los fundamentos | er-prov-005 no corrige la posición relativa: acepta los fundamentos antes (Senado) o después (Diputados) del articulado, y sólo marca si quedaron intercalados |
| CT-04 Ordinal desde el artículo 10 | El motor escribe los artículos entrerrianos con ordinal también después del 9 ("Artículo 12°") y ninguna regla marca esa forma como error |
| CT-05 Encabezado de artículo | er-prov-020 y er-prov-021 sólo marcan inconsistencias internas, no una forma concreta |
| CT-06 Instructivo del Senado | La fórmula de sanción se cita por el art. 132 de la Constitución, no por el 123. El límite de tres autores no se controla |

## Lo que la herramienta no revisa por decisión de la skill

No se emite ningún hallazgo sobre mérito, oportunidad, impacto, calidad de la
política pública, constitucionalidad material, competencia de la Legislatura,
legitimación del autor, autonomía municipal, suficiencia de recursos o
financiamiento, validez de una cláusula presupuestaria, ni sobre si la
reglamentación altera el espíritu de la ley.

Dos reglas que existían en el borrador de investigación se retiraron por esto:

- *el proyecto genera gasto y no prevé el financiamiento* — exige evaluar
  suficiencia presupuestaria (skill, punto 11);
- *la reglamentación define elementos esenciales de la ley* — exige juzgar si el
  reglamento altera el espíritu de la ley (skill, punto 3.13).

## Límites conocidos de la detección automática

- **Textos extraídos de PDF.** Cada página queda en un solo renglón, así que
  ninguna regla puede apoyarse en dónde empieza una línea. Los encabezados se
  reconocen por lo que los rodea, no por su posición.
- **Documentos compuestos.** Si el archivo es un ejemplar entero del Boletín
  Oficial en lugar de una sola norma, la numeración de artículos aparecerá como
  desordenada: son varias normas seguidas, cada una con su artículo 1°.
- **Errores de extracción.** Una palabra partida por el PDF ("LEGISLATUR A") puede
  producir un hallazgo que en el original no existe. La fórmula de sanción ya se
  reconoce aunque venga partida; el resto de las reglas no.
