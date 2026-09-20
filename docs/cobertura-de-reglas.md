# Mapa de cobertura — Manual de Técnica Legislativa

Este archivo lista **los 71 puntos del Manual** y las secciones del Marco Teórico, indicando
para cada uno si la herramienta lo verifica automáticamente y, si no, por qué.

Estado posible:
- **CUBIERTA** — hay una regla automática que lo detecta (se indica cuál).
- **NO AUTOMATIZABLE** — requiere entender el significado del texto, no su forma.
- **NO DETECTABLE** — el dato no tiene un formato fijo que se pueda buscar.

---

## PARTE PRIMERA — Estructura lógico-sistemática

| # | Regla | Estado |
|---|---|---|
| 1 | Elementos de la disposición (encabezamiento, fórmula, artículos, firmas, anexos) | **CUBIERTA** (nac-040 denominación, nac-001 fórmula de sanción) — *firmas al pie: NO DETECTABLE* |
| 2 | Sumarios en textos extensos | **CUBIERTA** (nac-017) |
| 3 | Título de la disposición (breve, no mudo) | **CUBIERTA** (nac-015, nac-018) |
| 4 | Homogeneidad terminológica título/enunciados | **CUBIERTA** parcialmente (nac-041) |
| 5 | Título de normas que aprueban tratados | **CUBIERTA** (nac-048) |
| 6 | Título de normas que modifican otras | **CUBIERTA** (nac-016) |
| 7 | Título de normas con partes modificatorias | **CUBIERTA** por nac-016 (mismo criterio) |
| 8 | Divisiones superiores al artículo (jerarquía, epígrafe, numeración) | **CUBIERTA** (nac-019, nac-042, nac-043, nac-050, nac-051, nac-052, nac-070 jerarquía título/capítulo) |
| 9 | El artículo (numeración, brevedad, epígrafe, unidad) | **CUBIERTA** (nac-002, nac-004, nac-005, nac-014, nac-053) |
| 10 | Los incisos (numeración, punto y aparte) | **CUBIERTA** parcialmente (nac-063) |
| 11 | Divisiones internas de incisos (letras con paréntesis, sin guiones) | **CUBIERTA** (nac-020, nac-054) |
| 12 | Anexos (van al final del articulado) | **CUBIERTA** (nac-055) |
| 13 | Encabezamiento de los anexos (título + artículo que remite) | **CUBIERTA** (nac-036, nac-056, nac-071 identificación con letra) |
| 14 | Referencia expresa del artículo al anexo | **CUBIERTA** (nac-030) |
| 15 | Divisiones internas de los anexos | **NO AUTOMATIZABLE** — depende del contenido del anexo |
| 16 | Homogeneidad material / normas intrusas | **NO AUTOMATIZABLE** — requiere evaluar si un tema es ajeno al objeto |
| 17 | Secuencia de las disposiciones | **CUBIERTA** parcialmente (nac-027 transitorias, nac-044 objeto) |

## PARTE SEGUNDA — Lenguaje normativo

| # | Regla | Estado |
|---|---|---|
| 18 | Brevedad de las frases | **CUBIERTA** (nac-026) |
| 19 | Estilo (íntegro y unívoco) | **NO AUTOMATIZABLE** — juicio sobre claridad |
| 20 | Verbos en presente, no futuro | **CUBIERTA** (nac-039) |
| 21 | Verbos con funciones ambiguas (deber/poder) | **NO AUTOMATIZABLE** — requiere saber si la disposición es imperativa o facultativa |
| 22 | Claridad: evitar pasiva sin agente | **NO AUTOMATIZABLE** — el propio Manual usa pasiva refleja ("Créase...") como forma correcta |
| 23 | Doble negación | **CUBIERTA** (nac-011) |
| 24 | Significado sintáctico de conjunciones | **NO AUTOMATIZABLE** — requiere interpretar la relación lógica |
| 25 | Conjunciones disyuntivas ("y/o") | **CUBIERTA** (nac-012) |
| 26 | Conjunciones condicionales ("sólo si") | **NO AUTOMATIZABLE** — hay que saber si la consecuencia deriva solo de esa causa |
| 27 | Carácter taxativo o ejemplificativo de enumeraciones | **CUBIERTA** (nac-031) |
| 28 | Enunciados sin significado normativo | **CUBIERTA** (nac-021) |
| 29 | Términos jurídicos o técnicos | **NO AUTOMATIZABLE** — requiere conocer el significado legal del término |
| 30 | Términos con significado distinto al corriente | **NO AUTOMATIZABLE** — ídem |
| 31 | Definiciones | **CUBIERTA** parcialmente (nac-008, nac-057) |
| 32 | Homogeneidad terminológica | **NO AUTOMATIZABLE** — requiere saber si dos palabras nombran el mismo concepto |
| 33 | Términos extranjeros y neologismos | **CUBIERTA** (nac-023) |
| 34 | Repetición de términos (evitar pronombres) | **CUBIERTA** (nac-022) |
| 35 | Remisión a las reglas de la RAE | *No es una regla verificable* |

## PARTE TERCERA — Escritura de textos normativos

| # | Regla | Estado |
|---|---|---|
| 36 | Uso de abreviaturas y siglas | **CUBIERTA** (nac-008, nac-037, nac-057) |
| 37 | Escritura de siglas (sin puntos, sin plural) | **CUBIERTA** (nac-009, nac-045) |
| 38 | Uso de letras mayúsculas | **NO DETECTABLE** con fiabilidad — el OCR altera mayúsculas y minúsculas |
| 39 | Escritura de números (letra + cifra) | **CUBIERTA** (nac-024, nac-065 porcentajes) |
| 40 | Fechas (año en cuatro cifras) | **CUBIERTA** (nac-013) |
| 41 | Signos de puntuación (a–m) | **CUBIERTA** (nac-025 suspensivos, nac-038 comillas, nac-049 dos puntos, nac-058 paréntesis, nac-059 barra, nac-065 signo por ciento) |
| 42 | Símbolos de unidad de medida o monetaria | **CUBIERTA** (nac-046) |
| 43 | Símbolos técnicos o científicos | **NO AUTOMATIZABLE** — requiere saber si su uso era imprescindible |
| 44 | Citas de disposiciones normativas | **CUBIERTA** (nac-060 falta el año, nac-067 año en dos cifras) |
| 45 | Reglas particulares de cita | **CUBIERTA** (nac-028 publicación, nac-047 referencias por posición, nac-066 "de la presente ley") |
| 46 | Citas de particiones internas | **CUBIERTA** (nac-032, nac-068 "inciso a)" por "letra a)") |
| 47 | Citas de normas comunitarias o internacionales | **NO AUTOMATIZABLE** — depende de la terminología del texto citado |

## PARTE CUARTA — Referencias

| # | Regla | Estado |
|---|---|---|
| 48 | Referencias internas (evitar cadenas) | **CUBIERTA** (nac-061) |
| 49 | Referencias a divisiones superiores al artículo | **NO AUTOMATIZABLE** — hay que saber si aplica toda la división o solo parte |
| 50 | Referencias al artículo o particiones inferiores | **CUBIERTA** parcialmente (nac-047) |
| 51 | Referencias externas | **NO AUTOMATIZABLE** — distinguir reenvío normativo de simple mención |
| 52 | Referencias a textos modificados | **CUBIERTA** (nac-033) |

## PARTE QUINTA — Modificaciones

| # | Regla | Estado |
|---|---|---|
| 53 | Uso de los términos sustitución/abrogación/derogación/etc. | **NO AUTOMATIZABLE** — requiere saber qué operación se hizo realmente |
| 54 | Modificaciones implícitas y explícitas | **CUBIERTA** (nac-007) |
| 55 | Modificaciones explícitas textuales | **CUBIERTA** (nac-038, nac-049) |
| 56 | Cuándo conviene modificar textualmente | **NO AUTOMATIZABLE** — decisión de técnica legislativa caso por caso |
| 57 | Abrogación expresa vs. innominada | **CUBIERTA** (nac-010, nac-069 derogaciones reunidas en un artículo) |
| 58 | Modificaciones explícitas no textuales | **NO AUTOMATIZABLE** — requiere comparar con la norma anterior |
| 59 | Modificaciones textuales múltiples | **NO AUTOMATIZABLE** — es una recomendación de redacción, no un error detectable |
| 60 | Sistemática de las modificaciones | **NO AUTOMATIZABLE** — requiere comparar con la estructura de la norma modificada |
| 61 | Consolidación | **NO AUTOMATIZABLE** — requiere conocer el historial de modificaciones |
| 62 | Derogación expresa | **CUBIERTA** (nac-007) |
| 63 | Diferencia entre derogación y sustitución | **CUBIERTA** (nac-034) |
| 64 | Derogación expresa y modificaciones no textuales | **NO AUTOMATIZABLE** — ídem 58 |
| 65 | Preferencia por la modificación textual | **NO AUTOMATIZABLE** — decisión caso por caso |
| 66 | Excepción explícita e implícita | **NO AUTOMATIZABLE** — requiere identificar la regla general afectada |
| 67 | Excepción textual | **NO AUTOMATIZABLE** — ídem |
| 68 | Prórrogas y suspensiones | **CUBIERTA** (nac-035) |
| 69 | Revivificación | **NO AUTOMATIZABLE** — requiere saber si hubo intención de hacer revivir una norma |
| 70 | Textos ordenados | **NO AUTOMATIZABLE** — requiere el historial completo de la norma |
| 71 | Documentos normativos (firmas) | **NO DETECTABLE** — las firmas no tienen formato fijo |

## Marco Teórico (Grosso / Svetaz)

| Sección | Estado |
|---|---|
| Estructura: título general abarcativo | **CUBIERTA** (nac-015, nac-041, nac-044) |
| Estructura: definiciones al inicio | **CUBIERTA** parcialmente (nac-044) |
| Estructura: remisiones a artículos anteriores | **CUBIERTA** (nac-062) |
| Estructura: todas las partes con denominación propia | **CUBIERTA** (nac-019, nac-036) |
| Estructura: artículos epigrafiados | **CUBIERTA** (nac-014) |
| Estructura: citar expresamente lo que se deroga | **CUBIERTA** (nac-007, nac-010) |
| Orden temático (preliminares → transitorias) | **CUBIERTA** parcialmente (nac-027) |
| El artículo: una sola norma por artículo | **CUBIERTA** (nac-005) |
| Incisos: comienzan en minúscula | **CUBIERTA** (nac-063) |
| Artículo de forma | **CUBIERTA** (nac-003) |
| Anexos: aclarar si forman parte de la ley | **CUBIERTA** (nac-064) |
| Vigencia: indicar fecha de entrada en vigor | **CUBIERTA** (nac-006) |
| Requisitos: integralidad, irreducibilidad, coherencia, correspondencia, realismo | **NO AUTOMATIZABLE** — son criterios de evaluación global del texto |
| Estilo: concisión, precisión, claridad | **CUBIERTA** parcialmente (nac-026, nac-029) |

---

## Resumen

## Prioridad de cada regla

Cada una de las 71 reglas del Manual tiene asignada una prioridad de cumplimiento —**alta**,
**media** o **baja**— que no cambia el contenido de la regla: indica qué tan grave es
incumplirla y en qué orden conviene corregir.

- **Alta** (41 reglas del Manual): el incumplimiento puede alterar el efecto jurídico, la
  validez, la vigencia o el alcance de la norma.
- **Media** (26 reglas): no invalida la norma, pero resta claridad y complica citarla,
  modificarla o consolidarla después.
- **Baja** (4 reglas: 2, 35, 37 y 38): ortotipografía y presentación, sin efecto sobre el
  sentido jurídico.

Cada regla automática hereda la prioridad de la regla del Manual que aplica. Las que se
apoyan en el Marco Teórico toman la prioridad de la regla del Manual más cercana.

Dos reglas se **escalaron** por contexto, algo que el Manual permite hacer (nunca a la
inversa):

| Regla | Base | Queda en | Motivo |
|---|---|---|---|
| nac-038 (sustitución sin comillas) | media (regla 41) | **alta** | sin comillas no se sabe dónde empieza y termina el texto que se incorpora: queda incierto el alcance |
| nac-064 (anexo sin "forma parte") | media (regla 12) | **alta** | impide determinar qué contenido integra normativamente la norma |

Reparto resultante de las 71 reglas automáticas: **33 de prioridad alta, 35 media y 3 baja**.

---

- **Reglas automáticas implementadas: 71** (33 alta, 35 media, 3 baja)
- **Puntos del Manual cubiertos total o parcialmente: 40 de 71**
- **Puntos que requieren criterio humano (no automatizables): 28**
- **Puntos sin formato detectable: 3**

Los 28 puntos no automatizables tienen todos la misma característica: para verificarlos hay que
**entender qué dice la norma**, no cómo está escrita. Por ejemplo, para saber si se usó bien la
palabra "derogación" en vez de "abrogación" hay que saber si la norma anterior quedó eliminada
del todo o solo en parte — eso no se ve en el texto, se deduce comparando normas.
