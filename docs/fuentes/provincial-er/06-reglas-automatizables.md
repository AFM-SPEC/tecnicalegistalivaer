# PRODUCTO 6 — Base de reglas para revisión automatizada

Reglas del manual que **pueden verificarse sobre el texto**, sin necesidad de entender su significado.

**Severidad:**
- **error** — incumple una norma de nivel 1 o 2 (Constitución, ley o reglamento). Hay que corregirlo.
- **advertencia** — incumple una regla de nivel 4 o una práctica uniforme, o hay riesgo jurídico probable.
- **recomendación** — mejora de consistencia o estilo.

> Mapeo con la herramienta existente: `error` → `severidad: "alta"` · `advertencia` → `"media"` · `recomendación` → `"baja"`.

---

| ID | Regla | Condición que debe cumplirse | Error detectable | Patrón de detección | Ejemplo incorrecto | Corrección sugerida | Severidad | Fuente |
|---|---|---|---|---|---|---|---|---|
| er-prov-001 | Fórmula de sanción presente | El texto contiene la fórmula del art. 132 | Falta la fórmula de sanción | Ausencia de `/la legislatura de la provincia de entre r[íi]os\s+sanciona/i` | Texto que arranca en `ARTÍCULO 1°.-` | Agregar `LA LEGISLATURA DE LA PROVINCIA DE ENTRE RÍOS SANCIONA CON FUERZA DE LEY:` | **error** | CP ER art. 132 |
| er-prov-002 | No usar la fórmula nacional | No aparece la fórmula del Congreso | Fórmula nacional en proyecto provincial | `/senado y c[áa]mara de diputados de la naci[óo]n|reunidos en congreso/i` | `El Senado y Cámara de Diputados de la Nación Argentina, reunidos en Congreso, sancionan…` | Reemplazar por la fórmula del art. 132 | **error** | CP ER art. 132 |
| er-prov-003 | Verbo de la fórmula en singular | Dice `sanciona`, no `sancionan` | Fórmula en plural | `/entre r[íi]os[^.]{0,40}sancionan con fuerza/i` | `La Legislatura… sancionan con fuerza de ley` | `sanciona` | **error** | CP ER art. 132 |
| er-prov-004 | Articulado sin motivos | Ningún artículo contiene considerandos | Motivación dentro del articulado | `/(art[íi]culo\s*\d+[^.]{0,20}[.:-]\s*)?(visto que|considerando que|atento a que|toda vez que|dado que|en virtud de que|resulta necesario|es menester)/i` dentro del articulado | `ARTÍCULO 1°.- Visto que el problema afecta a los jóvenes, créase…` | Mover la justificación a FUNDAMENTOS | **error** | Regl. Dip. 63; Regl. Sen. 86 |
| er-prov-005 | Verbos en pasiva refleja | Usa `-ase`, no `-ese` | Verbo normativo mal conjugado | `/\b(Cr[ée]ese\|Modif[íi]quese\|Modif[íi]quense\|Der[óo]guese\|Decl[áa]rese\|Autor[íi]cese\|Establ[ée]zcase\|Incorp[óo]rese\|Apru[ée]bese\|Ratif[íi]quese\|Facult[ée]se\|Sustit[úu]yase)\b/` | `Declárese de interés provincial…` | `Declárase` | advertencia | Doctrina; práctica ER 70% |
| er-prov-006 | Artículo de forma presente | El articulado cierra con artículo de forma | Falta el artículo de forma | Ausencia de `/comun[íi]quese/i` | Texto que termina en el artículo sustantivo | Agregar `ARTÍCULO n°.- Comuníquese, regístrese, notifíquese y oportunamente archívese.` | **error** | Práctica 53/53; modelos oficiales |
| er-prov-007 | Artículo de forma de ley, no de decreto | No usa la fórmula de decreto | Fórmula de decreto en un proyecto de ley | `/comun[íi]quese,?\s*publ[íi]quese\s*y\s*arch[íi]vese/i` | `Comuníquese, publíquese y archívese.` | `Comuníquese, regístrese, notifíquese y oportunamente archívese.` | advertencia | Práctica ER |
| er-prov-008 | Derogación expresa | No hay derogaciones genéricas | Derogación genérica | `/(der[óo]g\w+\s+(todas\s+las\|toda)\s+(norma\|disposici[óo]n\|ley)\|(norma\|disposici[óo]n)\w*\s+que\s+se\s+opong\w+)/i` | `Deróganse todas las disposiciones que se opongan a la presente.` | Identificar cada norma derogada con número y artículo | **error** | Digesto art. 19; CP art. 130 |
| er-prov-009 | Cifras en letras y números | Toda cantidad lleva doble expresión | Cifra sola donde corresponde la doble forma | `/\b(?:de\|en\|por\|plazo de|t[ée]rmino de)\s+\d{1,3}\s+(d[íi]as\|meses\|a[ñn]os\|horas)\b/i` sin `/\w+\s*\(\s*\d+\s*\)/` cerca | `dentro de los 90 días` | `dentro de los noventa (90) días` | advertencia | Digesto art. 3 b) |
| er-prov-010 | Siglas sin puntos | Las siglas no llevan puntos intermedios | Sigla con puntos | `/\b(?:[A-ZÁÉÍÓÚ]\.){2,}[A-ZÁÉÍÓÚ]?\b/` | `las O.N.G.` | `las ONG` | recomendación | Manual nacional r. 37 (subsidiaria) |
| er-prov-011 | Grafía uniforme de "ARTÍCULO" | Usa siempre la misma grafía | Mezcla `ARTÍCULO` y `ARTICULO` | Coexistencia de `/ARTÍCULO\s*\d/` y `/ARTICULO\s*\d/` | Ambas formas en el mismo texto | Unificar en `ARTÍCULO` | recomendación | Práctica ER (17% incumple) |
| er-prov-012 | Citas de ley con separador de miles | `Ley Nº 10.746` | Número de ley sin punto de miles | `/ley\s*n?[°º]?\s*\d{5}\b/i` | `Ley N° 10746` | `Ley Nº 10.746` | recomendación | Práctica ER 13/13 |
| er-prov-013 | Cláusula presupuestaria si hay gasto | Si crea gasto, indica imputación | Gasto sin financiamiento previsto | Presencia de `/(erogaci[óo]n\|financiamiento\|subsidio\|beca\|remuneraci[óo]n\|fondo\s+provincial\|aporte\s+econ[óo]mico)/i` sin `/(presupuesto\s+general\s+de\s+gastos\|partidas?\s+presupuestarias?\|adecuaciones\s+presupuestarias)/i` | Programa con becas y sin cláusula de fondos | Agregar cláusula de imputación presupuestaria | advertencia | **CP ER art. 122 inc. 8** |
| er-prov-014 | Fundamentos presentes y separados | El proyecto trae FUNDAMENTOS | Falta el bloque de fundamentos | Ausencia de `/\bFUNDAMENTOS?\b|FUNDAMENTACI[ÓO]N/i` | Proyecto que termina en el artículo de forma | Agregar `FUNDAMENTOS` / `Honorable Cámara:` | advertencia | Regl. Dip. 67; Regl. Sen. 89-90 |
| er-prov-015 | Numeración correlativa | Artículos 1, 2, 3… sin saltos ni repeticiones | Salto o repetición en la numeración | Secuencia de `/art[íi]culo\s+(\d+)/gi` con hueco o duplicado | `ARTÍCULO 3°`, luego `ARTÍCULO 5°` | Renumerar, o usar `bis` para intercalar | **error** | Práctica; Manual nacional r. 9 |
| er-prov-016 | Modificación textual | Toda modificación trae el texto nuevo | Modificación sin texto de reemplazo | `/(modif[íi]c\w+\|sustit[úu]y\w+)[^.]{0,120}(art[íi]culo\|ley)/i` sin `/(quedar[áa]n?\s+redactad\|de\s+la\s+siguiente\s+manera\|["“])/i` en el mismo artículo | `Modifícase el artículo 4º de la Ley Nº 10.479.` | Agregar `…el que quedará redactado de la siguiente manera: "…"` | **error** | CP art. 130; Digesto art. 19 |
| er-prov-017 | Prescripciones citadas, insertadas | Lo que se incorpora de otra ley se transcribe | Remisión a artículo ajeno sin transcribirlo | `/(requisitos\|condiciones\|procedimiento\|r[ée]gimen)[^.]{0,80}establecid\w+\s+en\s+el\s+art[íi]culo\s+\d+[^.]{0,40}ley\s*n?[°º]?\s*[\d.]+/i` sin comillas a continuación | `…los requisitos del artículo 4º de la Ley Nº 10.479.` | Transcribir íntegramente el texto citado | advertencia | **CP ER art. 130** (regla propia de ER) |
| er-prov-018 | El proyecto no lleva número de ley | No se autoasigna número | Número de ley en un proyecto | `/^\s*ley\s*n?[°º]?\s*\d{4,5}/im` junto a `/proyecto de ley/i` | `PROYECTO DE LEY — LEY Nº 11.400` | Quitar el número: lo asigna la promulgación | advertencia | CP ER art. 131 |
| er-prov-019 | Un artículo, una proposición | El artículo no acumula normas | Artículo con varias proposiciones | Artículo de más de 400 caracteres con 3 o más verbos normativos o 3 o más `;` | `ARTÍCULO 2°.- Créase el Registro, la inscripción será requisito, se abonará arancel y el PE designará autoridad.` | Dividir en artículos separados | recomendación | **Regl. Senado art. 87** |
| er-prov-020 | Sin fórmula "y/o" | No se usa `y/o` | Conjunción ambigua | `/\by\s*\/\s*o\b/i` | `documentos y/o comprobantes` | Elegir `y`, `o`, o `uno, otro o ambos` | recomendación | Manual nacional r. 25 (subsidiaria) |
| er-prov-021 | Separador uniforme de artículo | Un solo separador en todo el texto | Mezcla de `.-`, `:` y `–` | Coexistencia de `/ARTÍCULO\s*\d+\s*[°º]?\s*\.-/` con `/ARTÍCULO\s*\d+\s*[°º]?\s*:/` | `ARTÍCULO 1°.-` junto a `Art. 2°:` | Unificar en `.-` | recomendación | Práctica ER 53/53 |
| er-prov-022 | Reglamentación sin delegación esencial | El reglamento no define el núcleo | Delegación de elementos esenciales | `/(reglamentaci[óo]n\|v[íi]a reglamentaria\|reglamentar[áa])[^.]{0,120}(sujetos alcanzados\|conductas sancionad\|monto de las (multas\|sanciones)\|hechos punibles)/i` | `El PE determinará por vía reglamentaria los sujetos alcanzados y el monto de las multas.` | Definir esos elementos en la ley | advertencia | **CP ER art. 141 inc. 2** |
| er-prov-023 | Comillas uniformes | Un solo tipo de comillas | Mezcla de comillas tipográficas y rectas | Coexistencia de `/[“”]/` y `/"/` | `“ARTÍCULO 1°…”` junto a `"ARTÍCULO 2°…"` | Unificar | recomendación | Práctica ER |

---

## Lo que **no** se puede automatizar

| Punto | Por qué no |
|---|---|
| Elección del instrumento (ley / declaración) | Requiere entender la finalidad del proyecto. |
| Legitimación del autor | Es un dato externo al texto. |
| Competencia de la Legislatura | Requiere calificar jurídicamente la materia. |
| Si el "objeto" es en realidad un motivo | Frontera semántica entre disponer y explicar. |
| Homogeneidad terminológica | Exige saber si dos palabras nombran el mismo concepto. |
| Si una definición es necesaria | Juicio técnico. |
| Si la derogación expresa está completa | Exige conocer todo el derecho vigente sobre la materia. |
| Encuadramiento por materia (Digesto art. 5) | Clasificación temática, no formal. |
| Si la reglamentación altera el espíritu | Sólo detectable por señales gruesas (er-prov-022); el juicio es jurídico. |

---

## Nota técnica para la integración

El archivo **`reglas-provincial-er.js`** implementa estas reglas en el formato exacto que espera la herramienta existente (`js/rules/engine.js`): objetos `{ id, titulo, descripcion, sugerencia, fuente, severidad, check(text, { normalizar, contexto, ordinal }) }`.

⚠️ **Un detalle a tener en cuenta.** El helper `ordinal()` del motor devuelve cardinal a partir de 10 (`ordinal(12) → "12"`), siguiendo el criterio del manual nacional. En Entre Ríos la práctica **mantiene el ordinal sin límite** (`ARTÍCULO 12º`, `Art. 333º` — ver CT-05). Las reglas provinciales de este archivo **no usan `ordinal()`** para no generar sugerencias contrarias a la práctica entrerriana. Si en el futuro se quiere que el motor sugiera formatos entrerrianos, habría que parametrizar ese helper por ámbito.

---

## Validación de las reglas

Las 23 reglas se probaron en tres escenarios antes de darlas por buenas.

**1. Proyecto con errores deliberados** (fórmula nacional, considerandos, artículo acumulativo, derogación genérica, verbos mal conjugados, cifra sin letras, sigla con puntos, delegación reglamentaria, etc.): **19 de 23 reglas se activaron correctamente**. Ninguna falló en silencio.

**2. Proyecto bien redactado** (fórmula del art. 132, artículos separados, cifras en letras y números, cláusula presupuestaria, artículo de forma correcto, fundamentos presentes): **cero falsos positivos**. Ninguna regla se activó.

**3. Corpus real de 64 textos de leyes sancionadas** (Boletín Oficial 2025-2026):

| Regla | Se activa en | Lectura |
|---|---|---|
| er-prov-001, 002, 003 (fórmula de sanción) | 0% | Correcto: ninguna ley sancionada tiene mal la fórmula |
| er-prov-004 (motivos en el articulado) | 0% | Correcto: la regla del art. 63/86 se cumple |
| er-prov-006, 007 (artículo de forma) | 0% | Correcto |
| er-prov-009 (cifras) | 0% | Coincide con la medición: cumplimiento total |
| er-prov-012 (separador de miles) | 0% | Coincide con la medición |
| er-prov-016 (modificación sin texto) | 0% | Correcto tras los ajustes de precisión |
| er-prov-017, 018, 022 | 0% | Sin casos en el corpus |
| **er-prov-005** (verbos `-ese`) | **22%** | **Hallazgo real**, coincide con el 26% medido por otra vía |
| **er-prov-011** (mezcla ARTÍCULO/ARTICULO) | **23%** | Hallazgo real |
| **er-prov-020** (`y/o`) | **13%** | Hallazgo real |
| **er-prov-013** (gasto sin financiamiento) | **9%** | Hallazgo real, coherente con el 2% de cláusulas presupuestarias |
| er-prov-019 (artículo acumulativo) | 5% | Hallazgo real |
| er-prov-023 (comillas mezcladas) | 5% | Hallazgo real |
| er-prov-008 (derogación genérica) | 3% | **Hallazgo real**: coletilla "y toda otra norma que se oponga" |
| er-prov-021 (separador no uniforme) | 3% | Hallazgo real |
| er-prov-010 (sigla con puntos) | 2% | Hallazgo real |
| er-prov-015 (numeración) | 6% | **Falsos positivos por extracción de PDF**: ver abajo |

### Correcciones de precisión aplicadas durante la validación

Cuatro reglas daban falsos positivos en la primera versión y se corrigieron:

1. **er-prov-001** no reconocía la fórmula cuando el PDF partía una palabra (`LA LEGISLATUR A DE LA PROVINCIA…`). Ahora la comparación se hace sobre el texto sin espacios. **De 3% a 0%.**
2. **er-prov-014** marcaba la falta de fundamentos en leyes **ya sancionadas**, que por definición no los llevan (quedan en el expediente). Ahora la regla se desactiva si detecta `SALA DE SESIONES` o `POR TANTO:`. **De 100% a 0%** sobre textos sancionados, conservando la detección en proyectos.
3. **er-prov-015 y er-prov-016** contaban como artículos del proyecto los `ARTÍCULO n.-` que aparecen **dentro del texto entrecomillado** de una ley que se está modificando, y confundían citas (`conforme al artículo 3º`) con encabezados. Se agregó un helper `sinComillas()` y un filtro de citas. **016 de 17% a 0%; 015 de 11% a 6%.**
4. **er-prov-016** además confundía *"modificaciones presupuestarias"* e *"incorporar al calendario escolar"* con modificaciones normativas. Ahora sólo reconoce las formas verbales normativas (`modifícase`, `sustitúyese`, `incorpórase`…) y exige una referencia real a otra norma.

### Limitación conocida

El 6% residual de **er-prov-015** se debe a la extracción de PDF, no a defectos de las leyes: algunos encabezados de artículo se pierden cuando el PDF los compone en negrita (el texto sale como `ARRTTÍÍCCUULLOO`). Sobre texto limpio la regla es exacta. **Conviene advertir al usuario** que, si carga un PDF escaneado, las alertas de numeración pueden deberse a la conversión y no al documento.
