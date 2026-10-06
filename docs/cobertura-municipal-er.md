# Mapa de cobertura — reglas municipales de Entre Ríos

Este archivo lista las reglas del **Manual de Técnica Legislativa Municipal de
Entre Ríos** (`docs/fuentes/municipal-er/MANUAL_TECNICA_LEGISLATIVA_MUNICIPAL_ER.md`)
que el Manual habilita para el motor, y dice con qué regla automática se
verifica cada una.

Estado posible:

- **CUBIERTA** — hay una regla automática que la detecta (se indica cuál).
- **CUBIERTA POR OTRA** — no tiene regla propia porque otra ya la detecta.
- **NO IMPLEMENTADA** — el Manual la admite, pero no hay un patrón seguro que buscar.

**Alcance:** en lo municipal la herramienta revisa solamente **ordenanzas**. En
todo el sitio se revisan solamente leyes nacionales, leyes provinciales y
ordenanzas: no se revisan resoluciones, decretos, comunicaciones,
declaraciones, minutas ni pedidos de informes. Si el encabezado del documento
dice que es uno de esos instrumentos, el informe lo advierte arriba de todo y
la revisión se hace igual (`BaseNormas.instrumentoNoCubierto`).

Las reglas que no dependen de la jurisdicción (com-xxx) son comunes a los tres
ámbitos: están en `js/rules/comunes.js` y se explican en
[reglas-comunes-y-prioridades.md](reglas-comunes-y-prioridades.md). Las
er-mun-xxx son las propias del ámbito municipal.

Las reglas municipales son **SUBSIDIARIO**, salvo las dos de fórmulas locales
(er-mun-054 y er-mun-055), que son **VERIFICAR LOCALMENTE**, y los avisos de
revisión, que son **REVISIÓN**.

**Prioridad.** Por decisión del proyecto, la prioridad sigue un mismo criterio
en los tres ámbitos (alta si el error puede cambiar qué manda la norma, a quién
o desde cuándo; media si dificulta identificarla, entenderla o citarla; baja si
es de forma o estilo). Se aparta de la sección 19 del Manual, que no dejaba
pasar de media a ninguna regla subsidiaria. Reparto en el ámbito municipal: ver
[reglas-comunes-y-prioridades.md](reglas-comunes-y-prioridades.md).

---

## Automatizables (Manual, sección 15.1)

| Regla del Manual | Estado |
|---|---|
| MUN-013 Falta la cláusula de vigencia | **CUBIERTA** (er-mun-019). No se aplica si el documento dice ser otro instrumento (resolución, decreto…) |
| MUN-022 Título vacío (lista cerrada) | **CUBIERTA** (com-002 título que no informa, er-mun-077 título de más de quince palabras) |
| MUN-026 Fundamentos intercalados | **CUBIERTA** (com-003) |
| MUN-031 Numeración de artículos | **CUBIERTA** (com-004 secuencia, com-005 artículos sin número, com-006 grafía, com-007 separador). Reconoce artículos con cifra ("ARTÍCULO 1°", "Art. 1º"), con palabras ("ARTÍCULO PRIMERO") y el ordinal suelto ("Primero:") |
| MUN-032 Artículos bis y ter | **CUBIERTA** (com-049) |
| MUN-034 Jerarquía de divisiones | **CUBIERTA** (com-010). Cuenta también el primer capítulo, que va antes del Artículo 1° (antes se lo salteaba y avisaba "un solo capítulo" en normas con dos) |
| MUN-035 Denominación de divisiones | **CUBIERTA** parcialmente (er-mun-079) — avisa el capítulo, título o sección sin nombre. La uniformidad entre los nombres no se revisa: al extraer un PDF se pierden los saltos de línea |
| MUN-036 Incisos | **CUBIERTA** (com-046) — salto o repetición de letras |
| MUN-037 Viñetas y guiones | **CUBIERTA** (com-011) |
| MUN-039 Anexo sin mención | **CUBIERTA** (com-013) |
| MUN-049 Futuro dominante | **CUBIERTA** (com-026). Además, por decisión del proyecto, com-058 avisa el subjuntivo ("Créese", "Deróguense"), que el Manual no trasladaba de la práctica provincial |
| MUN-057 Extranjerismos | **CUBIERTA** (com-033) |
| MUN-059 Doble negación | **CUBIERTA** (com-028) |
| MUN-061 "y/o" | **CUBIERTA** (com-027) |
| MUN-064 Días sin hábiles o corridos | **CUBIERTA** (com-031). No se marca si un artículo general fija cómo se computan los plazos |
| MUN-065 Fechas relativas | **CUBIERTA** (com-032) |
| MUN-066 Abreviaturas | **CUBIERTA** (com-037) — sólo en el articulado |
| MUN-067 Sigla sin explicar | **CUBIERTA** (com-034) |
| MUN-069 Letras y número no coinciden | **CUBIERTA** (com-036). Además, por decisión del proyecto, com-057 avisa las cifras escritas sólo en números (el Manual no imponía ese formato en lo municipal) |
| MUN-070 Porcentajes | **CUBIERTA** (er-mun-048) |
| MUN-071 Moneda | **CUBIERTA** (er-mun-049) |
| MUN-072 Unidades de medida | **CUBIERTA** (er-mun-050) |
| MUN-074 Comillas | **CUBIERTA** (com-019 sustitución sin comillas, com-038 mezcla de comillas) |
| MUN-075 Citas de normas | **CUBIERTA** (er-mun-033) — sólo alternancia dentro del documento |
| MUN-076 Citas de artículos | **CUBIERTA** (com-008) |
| MUN-078 Referencias por posición | **CUBIERTA** (com-023) |
| MUN-083 Modificación sin texto | **CUBIERTA** (com-018) |
| MUN-084 Sustitución textual | **CUBIERTA POR OTRA** (com-018 y com-019) |
| MUN-085 Incorporación sin ubicación | **CUBIERTA** (com-050) |
| MUN-086 Derogación sin número | **CUBIERTA** (com-053) |
| MUN-087 Derogación genérica | **CUBIERTA** (com-020) — también la coletilla que acompaña a una derogación expresa |
| MUN-088 Coletilla genérica | **CUBIERTA POR OTRA** (com-020) |
| MUN-089 Modificaciones múltiples | **CUBIERTA** (com-051) |
| MUN-090 Modificación por cuenta | **CUBIERTA** (com-052) |
| MUN-093 Prórroga | **CUBIERTA** (com-021) |
| MUN-104 Vigencia imprecisa | **CUBIERTA** (com-016) |
| MUN-119 Inconsistencias internas | **CUBIERTA** parcialmente (com-045 artículo inexistente, com-048 sigla con dos desarrollos, com-017 vigencia fijada en más de un lugar). Otras fechas contradictorias y las denominaciones divergentes de una norma no tienen un patrón seguro |

## Heurísticas (Manual, sección 15.2)

| Regla del Manual | Estado |
|---|---|
| MUN-005 Iniciativa popular | **CUBIERTA** (er-mun-007) |
| MUN-021 Tipo de instrumento | **CUBIERTA** (com-001) — sólo su ausencia, nunca si el tipo es correcto. Si el documento se presenta como un instrumento fuera de alcance, lo advierte el informe, no esta regla |
| MUN-024 VISTO con mandatos | **CUBIERTA** (er-mun-004), como "posible mandato". Además, com-054 avisa si el VISTO no identifica un antecedente ("Visto que…") |
| MUN-025 CONSIDERANDO con mandatos | **CUBIERTA** (er-mun-005), como "posible mandato" |
| MUN-028 Bloques normativos fuera del articulado | **NO IMPLEMENTADA** — fuera del VISTO y el CONSIDERANDO (ya cubiertos) no hay un lugar reconocible donde buscar |
| MUN-029 Unidad del artículo | **CUBIERTA** (com-009), que absorbe MUN-015 y MUN-030 |
| MUN-038 Anexo intercalado | **CUBIERTA** (com-014). No marca un anexo con articulado propio desde el artículo 1 |
| MUN-041 Secuencia de las disposiciones | **CUBIERTA** (com-012 transitorias; com-056 derogación, vigencia y cierre en un mismo artículo) |
| MUN-042 Artículo de objeto | **CUBIERTA** (com-015) — sólo ordenanzas de ocho artículos o más |
| MUN-045 Transitorias al final | **CUBIERTA** (com-012) |
| MUN-048 Artículos que explican | **CUBIERTA** (com-025, también el artículo que empieza con "Que…"; com-055 verbos que recomiendan en vez de mandar) |
| MUN-050 Perífrasis | **CUBIERTA** (com-029) — lista cerrada |
| MUN-052 Sujetos imprecisos | **CUBIERTA** (com-030) — incluye "quien corresponda", "todos deberán", "los que tengan que", "autorización correspondiente" y la obligación sin sujeto ("También se deberá mejorar…") |
| MUN-054 Definiciones | **CUBIERTA** (com-047) — término definido que no vuelve a usarse |
| MUN-073 Puntuación | **CUBIERTA** (com-044) — signos repetidos |
| MUN-080 Referencias externas | **CUBIERTA** (com-024) — remisión a "la normativa vigente" |
| MUN-094 Suspensión | **CUBIERTA** (com-022) |

## Avisos de revisión (decisión del proyecto)

El Manual deja estas reglas a la revisión humana (sección 17 y criterio común
de la sección 16 ter). Por decisión del proyecto, la herramienta avisa cuando
aparece una frase concreta, con tono prudente y la etiqueta *Aviso de
revisión: requiere criterio jurídico*.

| Regla del Manual | Estado |
|---|---|
| MUN-063 Enumeraciones taxativas o ejemplificativas | **AVISO DE REVISIÓN** (com-039) — "y cualquier otra", "u otras medidas", "etc." |
| MUN-051 y MUN-062 Sujeto, conducta y condición | **AVISO DE REVISIÓN** (com-040) — "motivos suficientes", "lo que se considere razonable", "si corresponde" |
| MUN-047 Integridad de la proposición normativa | **AVISO DE REVISIÓN** (com-041) — "serán determinados posteriormente" |
| MUN-097 Reglamentación | **AVISO DE REVISIÓN** (com-042) — facultad para modificar o dejar sin efecto la propia norma |
| MUN-053 Términos jurídicos y técnicos | **AVISO DE REVISIÓN** (com-043) — expresiones coloquiales de lista cerrada |
| MUN-055 Consistencia terminológica | **CUBIERTA** parcialmente (er-mun-056) — "Poder Ejecutivo" o "Intendente" en lugar de Departamento Ejecutivo |

## Técnica legislativa municipal (Pérez Bourbon, 2024)

Reglas tomadas de *Técnica legislativa municipal. Cómo escribir correctamente
una ordenanza municipal*, de Héctor Pérez Bourbon (Konrad Adenauer Stiftung y
CIMA, 2024). Es doctrina: criterio subsidiario, igual que el Manual de InfoLeg.
Ficha de la fuente: [fuentes/municipal-er/PEREZ_BOURBON_2024.md](fuentes/municipal-er/PEREZ_BOURBON_2024.md).

**Decisión del proyecto.** Donde el cuadernillo choca con el Manual municipal
entrerriano, se sigue el cuadernillo:

| Tema | Manual municipal ER | Ahora |
|---|---|---|
| Epígrafes | No avisar (MUN-033, sección 16 ter) | er-mun-078 avisa si la mayoría de los artículos no tiene epígrafe (prioridad baja) |
| "Deberá" | Forma habitual del mandato (MUN-049) | er-mun-074 sugiere "debe" y "puede" (prioridad baja) |
| Sinónimos | Revisión humana (MUN-056) | er-mun-068, aviso de revisión con una lista cerrada de pares |
| Tipo de instrumento | No juzgarlo (MUN-002) | er-mun-076, aviso de revisión ante frases concretas |
| Frases largas | No avisar (MUN-046, sección 16 ter) | er-mun-080 avisa oraciones de más de setenta palabras (prioridad baja) |

| Regla | Qué detecta | Páginas |
|---|---|---|
| er-mun-057 | Vigencia desde la sanción o la aprobación, antes de que la ordenanza exista | 48-49 |
| er-mun-058 | Modificación que no dice qué norma modifica | 51 |
| er-mun-059 | Modificación de un párrafo o una frase suelta, no del artículo completo | 52, 54 |
| er-mun-060 | Modificación de una norma modificatoria en lugar de la original | 52-53 |
| er-mun-061 | Derogación que depende de un hecho futuro | 55 |
| er-mun-062 | Cita del Código Civil o del Código de Comercio, derogados en 2015 | 56 |
| er-mun-063 | Verbo en singular con objeto en plural ("Modifícase las…") | 51 |
| er-mun-064 | La misma norma derogada dos veces en una lista | 55 |
| er-mun-065 | "Por esta única vez" (aviso de revisión) | 54 |
| er-mun-066 | La misma disposición repetida en dos artículos (redundancia) | 62 |
| er-mun-067 | "Progenitores" y "conviviente" (aviso de revisión) | 43-44 |
| er-mun-068 | Sinónimos para lo mismo (aviso de revisión) | 36-37 |
| er-mun-069 | "Requerir": pedir o necesitar (aviso de revisión) | 37-38 |
| er-mun-070 | Oración subordinada que agrega otra norma (aviso de revisión) | 40-41 |
| er-mun-071 | Una norma que crea algo sin reglamentación, o reglamentación sin plazo (aviso de revisión) | 45, 50 |
| er-mun-072 | Palabras innecesarias ("queda expresamente prohibido") | 42 |
| er-mun-073 | Palabras rebuscadas ("cánidos", "especie arbórea") | 26 |
| er-mun-074 | "Deberá" y "podrá" en lugar de "debe" y "puede" | 44-45 |
| er-mun-075 | Ámbito de aplicación no definido (normas de cinco artículos o más) | 67 (decálogo, punto 5) |
| er-mun-076 | Decisiones que suelen ir por otro instrumento (aviso de revisión) | 23-24, 67 (decálogo, punto 4) |
| er-mun-077 | Título de más de quince palabras | 30 |
| er-mun-078 | Artículos sin epígrafe | 31-32 |
| er-mun-079 | Capítulo, título o sección sin nombre | 31 |
| er-mun-080 | Oración de más de setenta palabras | 40-41 |

Además, el cuadernillo cambió reglas comunes (en todos los ámbitos):

- **com-009** (varias decisiones en un artículo) cuenta también los verbos en
  presente y avisa los artículos con tres oraciones completas (p. 32).
- **com-026** (futuro) sugiere "debe reglamentar" en lugar de "reglamenta",
  porque el presente solo describe (p. 45).
- **com-050** (incorporación sin ubicación) reconoce "Inclúyese" y "Agrégase" y
  las incorporaciones a un código o a una carta orgánica (pp. 51-52).

Y dejó a la vista cuatro errores, ya corregidos: "la entrada en vigencia de la
reglamentación" se tomaba como la vigencia de la norma (com-017 y com-056); una
mención a las disposiciones transitorias de otra norma se tomaba como las
propias (com-012); y un artículo citado entre comillas desplazaba la ubicación
de todos los avisos siguientes.

En el ámbito municipal, las reglas comunes que el cuadernillo respalda citan
también la página correspondiente.

## Fórmulas que dependen de cada Concejo (decisión del proyecto)

El Manual pide no controlar estas dos reglas sin la ficha local del municipio
(MUN-027, MUN-105 y sección 16). Por decisión del proyecto se controla sólo que
estén, nunca cómo están redactadas. Cada aviso trae un
modelo orientativo y advierte que, como Entre Ríos tiene más de 80 municipios y
cada Concejo usa su propia fórmula, no se puede sugerir una única.

| Regla del Manual | Estado |
|---|---|
| MUN-027 Fórmula de sanción | **CUBIERTA** (er-mun-054) — su ausencia antes del Artículo 1°, o una fórmula que no nombra al Concejo. No se aplica si el documento dice ser otro instrumento. Modelo: "EL HONORABLE CONCEJO DELIBERANTE DE [MUNICIPIO] SANCIONA LA SIGUIENTE ORDENANZA:" |
| MUN-105 Cláusula final | **CUBIERTA** (er-mun-055) — sólo su ausencia en el articulado (busca "comuníquese", "archívese" o "de forma", mismo criterio que er-prov-015). Modelos: "Comuníquese, publíquese, regístrese y archívese." o "De forma." |

## Lo que la herramienta no revisa

- **Otros tipos de instrumento**: resoluciones, decretos, comunicaciones,
  declaraciones, minutas y pedidos de informes (ver *Alcance*, arriba).
- **Reglas locales** (MUN-003, 006, 010, 108): categorías locales, firmas,
  requisitos de presentación y firma digital dependen de cada Concejo. Se
  activarán cuando exista la ficha local de un municipio. De MUN-027 y MUN-105
  sólo se revisa que la fórmula esté (ver la sección anterior).
- **Revisión humana** (sección 17 del Manual): competencia, trámite,
  mayorías, presupuesto, contenido material y las reglas que obligarían a
  adivinar sin una frase concreta (MUN-068, 079, 106). Los casos con una frase
  reconocible tienen un aviso de revisión (ver las secciones anteriores). Al
  final del informe municipal, la lista "Antes de presentar el proyecto"
  recuerda lo que hay que revisar a mano (decálogo de Pérez Bourbon).
- **Nivel de confianza** (secciones 6 y 24 del Manual): el motor todavía no
  tiene un campo para indicar confianza alta, media o baja en cada aviso.

## Cómo se probó

- `docs/ejemplo-de-prueba-municipal-er.txt`: proyecto con errores a propósito.
  Produce 40 avisos.
- `docs/ejemplo-perez-bourbon.txt`: los ejemplos de errores del cuadernillo de
  Pérez Bourbon, armados como una ordenanza. Produce 23 avisos, cada uno en el
  artículo donde está el error.
- `docs/ejemplo-mal-redactado.txt`: texto extraído de un PDF con errores a
  propósito, sin numeración ni estructura reconocible. Produce 30 avisos en el
  ámbito municipal (y las mismas reglas comunes en los otros dos ámbitos).
- `docs/ejemplo-limpio-municipal-er.txt`: ordenanza bien redactada, que cumple
  también lo que pide Pérez Bourbon (epígrafes, ámbito de aplicación,
  reglamentación con plazo). Produce 0 avisos: sirve para detectar falsos
  positivos cuando se toque una regla.
- Los dos ejemplos tienen fórmula de sanción y artículo de cierre, así que
  er-mun-054 y er-mun-055 no avisan en ellos. Para probarlas, borrar una de
  las dos fórmulas del ejemplo limpio: tiene que aparecer exactamente ese aviso.
