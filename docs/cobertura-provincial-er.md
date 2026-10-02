# Mapa de cobertura — reglas provinciales de Entre Ríos

Este archivo lista **cada regla de la skill de técnica legislativa entrerriana**
(`docs/fuentes/provincial-er/SKILL_TECNICA_LEGISLATIVA_ER.md`) y dice si la
herramienta la verifica automáticamente, con qué regla y por qué, cuando no.

**Alcance:** la herramienta revisa solamente leyes nacionales, leyes provinciales y
ordenanzas. No revisa resoluciones, decretos, comunicaciones, declaraciones, minutas
ni pedidos de informes. Si el encabezado del documento dice que es uno de esos
instrumentos, el informe lo advierte arriba de todo y la revisión se hace igual.

Estado posible:

- **CUBIERTA** — hay una regla automática que la detecta (se indica cuál).
- **NO AUTOMATIZABLE** — requiere entender el significado del texto, no su forma.
- **FUERA DE ALCANCE** — la propia skill prohíbe emitir un hallazgo sobre eso.

La columna *Exigencia* repite el nivel de autoridad que la skill le asigna a la
regla, y se sigue mostrando en cada observación.

**Prioridad.** Por decisión del proyecto, la prioridad ya no depende de la
exigencia sino de lo que el error afecta, con el mismo criterio en los tres
ámbitos (alta si puede cambiar qué manda la norma, a quién o desde cuándo;
media si dificulta identificarla, entenderla o citarla; baja si es de forma o
estilo). Antes sólo una regla `EXIGE` podía llegar a prioridad alta.

**Reglas comunes.** Las reglas com-xxx son comunes a los tres ámbitos (están en
`js/rules/comunes.js`). Además de las que reemplazan reglas provinciales, el
ámbito provincial suma las que antes sólo tenían el nacional o el municipal:
tipo de norma, título, artículos sin número, vigencia imprecisa, remisiones,
sujetos imprecisos, fechas, plazos, avisos de revisión, entre otras. La lista
completa está en [reglas-comunes-y-prioridades.md](reglas-comunes-y-prioridades.md).

---

## Reglas provinciales (ER)

| Regla de la skill | Exigencia | Estado |
|---|---|---|
| ER-01 Fórmula constitucional de sanción | EXIGE | **CUBIERTA** (er-prov-001 ausencia, er-prov-002 fórmula nacional, er-prov-003 "sancionan") |
| ER-02 Carácter rigurosamente preceptivo | EXIGE | **CUBIERTA** (com-025) — detecta los conectores de motivación; una justificación sin conector no se reconoce |
| ER-03 Fundamentos separados del articulado | EXIGE | **CUBIERTA** (com-003) — sólo marca si el bloque quedó intercalado entre artículos. La ausencia de fundamentos no se exige: las fuentes admiten fundamentación verbal |
| ER-04 Unidad normativa del artículo | EXIGE en Senado | **CUBIERTA** parcialmente (com-009) — marca artículos largos con tres o más verbos normativos y sin incisos. La unidad real depende del contenido |
| ER-05 Numeración y encabezados | ACOSTUMBRA | **CUBIERTA** (com-004 secuencia, er-prov-018 número de ley, com-006 grafía, com-007 separador). El ordinal después del 9 **no** se marca como error (CT-04) |
| ER-06 Artículo de forma | ACOSTUMBRA | **CUBIERTA** (er-prov-015 ausencia, er-prov-016 fórmula de decreto). Nunca como prioridad alta (CT-02) |
| ER-07 Verbos normativos en pasiva refleja | ACOSTUMBRA | **CUBIERTA** (com-058) |
| ER-08 Cifras en letras y números | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (com-057 cifra sola, com-036 letras y número que no coinciden) |
| ER-09 Siglas | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (com-034 primer uso sin denominación, com-035 grafía) |
| ER-10 Léxico y extranjerismos | CRITERIO LEGAL CONDICIONADO | **CUBIERTA** (com-033) — lista cerrada de términos con equivalente castellano claro |
| ER-11 Citas de leyes | ACOSTUMBRA | **CUBIERTA** (er-prov-022 separador de miles) |
| ER-12 Inserción íntegra de prescripciones citadas | EXIGE | **CUBIERTA** parcialmente (er-prov-009) — se emite como aviso de revisión humana: distinguir una referencia de una verdadera incorporación exige leer el contenido |
| ER-13 Modificaciones expresas y textuales | EXIGE | **CUBIERTA** (com-018) |
| ER-14 Derogaciones expresas | EXIGE | **CUBIERTA** (com-020). No se evalúa si la lista de normas derogadas está completa |
| ER-15 Coherencia formal de modificaciones | ACOSTUMBRA | **CUBIERTA** parcialmente (com-038 comillas). Los dos puntos antes del texto nuevo se controlan dentro de com-018 |

## Reglas subsidiarias (SUB)

Todas se muestran como criterio de estilo, no como obligación provincial. Su
prioridad sigue el criterio común (ver arriba).

| Regla de la skill | Estado |
|---|---|
| SUB-01 Título breve y no mudo | **CUBIERTA** parcialmente (com-002) — sólo títulos de una lista cerrada ("disposiciones varias", "cosas que…") o que son sólo un número. Juzgar otros títulos exige compararlos con el contenido |
| SUB-02 Título de una norma modificatoria | **NO AUTOMATIZABLE** — depende de identificar cuál es el objeto principal |
| SUB-03 Secuencia general de las disposiciones | **CUBIERTA** parcialmente (com-012 transitorias) |
| SUB-04 Epígrafes | **NO AUTOMATIZABLE** — no hay umbral formal de "texto extenso" en las fuentes entrerrianas |
| SUB-05 Divisiones superiores | **CUBIERTA** (com-010 saltos de nivel y divisiones únicas) |
| SUB-06 Incisos y enumeraciones | **CUBIERTA** (com-011 viñetas gráficas, com-046 letras salteadas o repetidas) |
| SUB-07 Enumeraciones taxativas o ejemplificativas | **AVISO DE REVISIÓN** (com-039) — sólo ante una frase concreta ("y cualquier otra", "u otras medidas", "etc."). Decidir si la lista es taxativa sigue requiriendo inferir la intención |
| SUB-08 Brevedad de frases | **NO AUTOMATIZABLE** en el ámbito provincial: la longitud sola no distingue complejidad jurídica de defecto de redacción |
| SUB-09 Tiempo verbal | **CUBIERTA** (com-026) — sólo cuando el futuro es la forma dominante |
| SUB-10 Doble negación y "y/o" | **CUBIERTA** (com-027, com-028) |
| SUB-11 Definiciones | **CUBIERTA** parcialmente (com-047) — término definido que no vuelve a usarse. Saber si un término se usa con sentido especial no es automatizable |
| SUB-12 Escritura de siglas | **CUBIERTA** (com-035) |
| SUB-13 Fechas | **CUBIERTA** (er-prov-030) |
| SUB-14 Puntuación | **CUBIERTA** parcialmente (com-038 comillas, com-044 signos repetidos) |
| SUB-15 Cadenas de remisiones | **NO AUTOMATIZABLE** — hay que seguir la cadena para saber si reconstruye una misma regla |
| SUB-16 Derogaciones agrupadas | **NO AUTOMATIZABLE** — depende de si las normas derogadas se relacionan entre sí |
| SUB-17 Disposiciones transitorias | **CUBIERTA** (com-012) |
| SUB-18 Anexos | **CUBIERTA** parcialmente (com-013 anexo nombrado una sola vez, com-014 anexo intercalado) |
| SUB-19 Modificaciones implícitas | **NO AUTOMATIZABLE** en general — exige comparar el proyecto con legislación externa. Sí se marca cuando el texto dice que modifica una ley sin transcribir cómo queda (com-018) |

## Contradicciones documentadas y cómo las resuelve la herramienta

| Contradicción | Resolución aplicada |
|---|---|
| CT-01 Remisión nacional vs. art. 130 de Entre Ríos | Prevalece el art. 130: er-prov-009 pide insertar el contenido incorporado, al revés del criterio nacional |
| CT-02 Artículo de forma | er-prov-015 y er-prov-016 son de prioridad baja (forma) y se presentan como práctica, nunca como vicio jurídico |
| CT-03 Ubicación de los fundamentos | com-003 no corrige la posición relativa: acepta los fundamentos antes (Senado) o después (Diputados) del articulado, y sólo marca si quedaron intercalados |
| CT-04 Ordinal desde el artículo 10 | El motor escribe los artículos entrerrianos con ordinal también después del 9 ("Artículo 12°") y ninguna regla marca esa forma como error |
| CT-05 Encabezado de artículo | com-006 y com-007 sólo marcan inconsistencias internas, no una forma concreta |
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
