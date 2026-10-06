# Reglas comunes y prioridades

Este archivo explica dos decisiones del proyecto que valen para los tres
ámbitos (nacional, provincial y municipal):

1. **Un mismo error se detecta igual en los tres ámbitos.** Las reglas que no
   dependen de la jurisdicción ("y/o", derogaciones genéricas, vigencia,
   numeración, siglas…) están una sola vez, en `js/rules/comunes.js`. Cada
   ámbito las suma a sus reglas propias y sólo cambia la fuente que se cita.
2. **Un mismo error tiene la misma prioridad en los tres ámbitos.** La
   prioridad sale de `js/rules/prioridades.js` y depende de lo que el error
   afecta, no de cuánto obliga la fuente.

> Este archivo se genera a partir del código. Si se cambia una regla o una
> prioridad, conviene regenerarlo en lugar de editarlo a mano.

## Por qué se hizo

Antes, cada ámbito se había armado con su propio manual y con su propio
criterio de prioridad. El resultado era que el mismo error se marcaba distinto
según la jurisdicción elegida: "y/o" era de prioridad **alta** en el ámbito
nacional y **baja** en los otros dos; una derogación genérica se detectaba en
Entre Ríos pero no en el ámbito nacional, porque cada uno buscaba una frase
distinta. Y varios patrones eran tan estrechos que un proyecto lleno de errores
(`docs/ejemplo-mal-redactado.txt`) recibía 8, 5 o 4 observaciones según el ámbito.

## Criterio de prioridad

| Prioridad | Cuándo |
|---|---|
| **Alta** | El error puede cambiar qué manda la norma, a quién o desde cuándo. |
| **Media** | Dificulta identificar, entender, citar o aplicar la norma. |
| **Baja** | Forma y estilo: no cambia el sentido. |

Cuánto obliga cada regla (Constitución, reglamento, práctica, criterio de
estilo) se sigue mostrando aparte, en la etiqueta de cada observación.

**Se aparta de los manuales.** El Manual municipal (sección 19) decía que
ninguna regla subsidiaria pasa de prioridad media, y el criterio provincial
reservaba la prioridad alta a las reglas que exige la Constitución o un
reglamento. Los dos ataban la prioridad a la autoridad de la fuente.

### Reparto

| Ámbito | Reglas | Alta | Media | Baja |
|---|---|---|---|---|
| Nacional | 103 | 15 | 46 | 42 |
| Provincial | 67 | 14 | 34 | 19 |
| Municipal | 93 | 19 | 45 | 29 |

### Tabla de prioridades

| Prioridad | Tema | Reglas |
|---|---|---|
| Alta | Vigencia imprecisa, contradictoria o anterior a la norma | com-016, com-017, er-mun-057 |
| Alta | Derogaciones que no dicen qué derogan o desde cuándo | com-020, com-053, nac-034, er-mun-061 |
| Alta | Modificaciones que no dicen cómo queda la norma | com-018, com-019, com-051, com-052, er-mun-058, er-mun-059, er-mun-060 |
| Alta | Prórrogas y suspensiones sin identificar | com-021, com-022 |
| Alta | Cifras que no coinciden | com-036 |
| Alta | Remisiones a artículos o normas que no existen | com-045, er-mun-062 |
| Alta | Contenido que no se sabe si integra la norma | er-prov-009, nac-064, com-013 |
| Media | Identificación de la norma | com-001, com-002, nac-016, nac-048, er-prov-018 |
| Media | Fórmula de sanción | nac-001, er-prov-001, er-prov-002, er-prov-003, er-mun-054 |
| Media | Falta la cláusula de vigencia | nac-006, er-mun-019 |
| Media | Numeración y estructura | com-003, com-004, com-005, com-009, com-010, com-011, com-012, com-014, com-046, com-049, com-054, com-056, nac-005, nac-052, nac-070, er-mun-004, er-mun-005, er-mun-007 |
| Media | Modificaciones y derogaciones mal armadas | com-050, nac-069, er-mun-064 |
| Media | Citas y remisiones imprecisas | com-023, com-024, nac-025, nac-032, nac-033, nac-060, nac-061, nac-062 |
| Media | Redacción ambigua | com-025, com-026, com-027, com-028, com-030, com-031, com-032, com-048, com-055, nac-022, nac-059, er-mun-056, er-mun-066 |
| Media | Avisos de revisión (requieren criterio jurídico) | com-039, com-040, com-041, com-042, er-mun-065, er-mun-067, er-mun-068, er-mun-069, er-mun-070, er-mun-071, er-mun-076 |
| Baja | Fórmula de cierre | nac-003, er-prov-015, er-prov-016, er-mun-055 |
| Baja | Presentación de títulos, divisiones y anexos | com-015, nac-014, nac-017, nac-018, nac-019, nac-036, nac-041, nac-043, nac-050, nac-051, nac-054, nac-056, nac-063, nac-068, nac-071, er-mun-075, er-mun-077, er-mun-078, er-mun-079 |
| Baja | Formato de los artículos | com-006, com-007, com-008, nac-053 |
| Baja | Formato de las citas | er-prov-022, er-mun-033, nac-028, nac-049, nac-066 |
| Baja | Ortotipografía | com-033, com-034, com-035, com-037, com-038, com-044, com-057, er-prov-030, nac-013, nac-046, nac-065, nac-067, er-mun-048, er-mun-049, er-mun-050 |
| Baja | Estilo | com-029, com-043, com-047, com-058, nac-026, nac-029, nac-057, nac-058, er-mun-063, er-mun-072, er-mun-073, er-mun-074, er-mun-080 |

## Las 58 reglas comunes

La columna *Reemplaza a* indica qué reglas de cada ámbito pasaron a la regla
común. «— (nueva)» quiere decir que ningún ámbito tenía esa regla: ahora la
tienen los tres.

| Regla | Qué detecta | Prioridad | Reemplaza a | Fuente municipal |
|---|---|---|---|---|
| com-001 | No se aclara qué tipo de norma es | Media | nac-040, er-mun-006 | MUN-021 |
| com-002 | El título no dice de qué trata la norma | Media | nac-015, er-mun-008 | MUN-022 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 30 |
| com-003 | Los fundamentos quedaron partidos en medio de los artículos | Media | er-prov-005, er-mun-001 | MUN-026 |
| com-004 | Los artículos no están numerados en orden | Media | nac-002, er-prov-017, er-mun-011 | MUN-031 |
| com-005 | Hay artículos sin número | Media | — (nueva) | MUN-031 |
| com-006 | Mezcla "ARTÍCULO" y "ARTICULO" en el mismo texto | Baja | er-prov-020, er-mun-013 | MUN-031 |
| com-007 | Los artículos no se separan siempre igual | Baja | er-prov-021, er-mun-014 | MUN-031 |
| com-008 | Se mezcla "Art." con "Artículo" | Baja | nac-004, er-mun-034 | MUN-076 |
| com-009 | Un artículo podría reunir varias decisiones | Media | er-prov-008, er-mun-010 | MUN-029 — incluye MUN-015 y MUN-030 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 32-33 |
| com-010 | Los títulos y capítulos no siguen un orden claro | Media | nac-042, er-prov-026, er-mun-015 | MUN-034 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 31 |
| com-011 | Los incisos van con guiones y después no se pueden citar | Media | nac-020, er-prov-025, er-mun-017 | MUN-037 |
| com-012 | Las disposiciones transitorias no están al final | Media | nac-027, er-prov-024, er-mun-018 | MUN-045 — cubre también MUN-041 |
| com-013 | Un anexo que ningún artículo menciona | Alta | nac-030, er-prov-019, er-mun-003 | MUN-039 |
| com-014 | Posible anexo intercalado entre los artículos | Media | nac-055, er-mun-002 | MUN-038 |
| com-015 | Conviene evaluar un artículo de objeto | Baja | nac-044, er-mun-009 | MUN-042 |
| com-016 | La vigencia depende de algo impreciso | Alta | er-mun-020 | MUN-104 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 48-49 |
| com-017 | La vigencia se fija en más de un lugar | Alta | — (nueva) | MUN-119 — fechas contradictorias |
| com-018 | Se modifica otra norma sin escribir cómo queda | Alta | nac-007, er-prov-007, er-mun-021 | MUN-083 y MUN-084 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 51 |
| com-019 | Se reemplaza el texto de otra norma pero sin comillas | Alta | nac-038, er-mun-022 | MUN-074 y MUN-084 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 51 |
| com-020 | Se deroga «todo lo que se oponga», sin decir qué | Alta | nac-010, er-prov-006, er-mun-026 | MUN-087 y MUN-088 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 54 |
| com-021 | Una prórroga no identifica la norma o el nuevo término | Alta | nac-035, er-mun-028 | MUN-093 |
| com-022 | Verificar qué se suspende y por cuánto tiempo | Alta | nac-035, er-mun-029 | MUN-094 |
| com-050 | Se incorpora una disposición sin decir dónde va | Media | er-mun-023 | MUN-085 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 51-52 |
| com-051 | Varios artículos se sustituyen juntos sin separar el texto de cada uno | Alta | er-mun-024 | MUN-089 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 51-53 |
| com-052 | Se cambia un monto o un plazo con una cuenta en vez de escribir el valor | Alta | er-mun-025 | MUN-090 |
| com-053 | Se deroga una norma sin decir cuál | Alta | er-mun-027 | MUN-086 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 54 |
| com-023 | Se remite a un artículo como "el anterior" o "el siguiente" | Media | nac-047, er-mun-030 | MUN-078 |
| com-024 | Se remite a "la normativa vigente" sin decir cuál | Media | er-mun-032 | MUN-080 |
| com-045 | Se remite a un artículo de esta misma norma que no existe | Alta | er-mun-031 | MUN-119 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 56 |
| com-025 | Posible justificación dentro del articulado | Media | nac-021, er-prov-004, er-mun-035 | MUN-048 |
| com-026 | Hay varios verbos en tiempo futuro | Media | nac-039, er-prov-029, er-mun-036 | MUN-049 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 44-45 |
| com-027 | Se usa "y/o", que deja la duda de si son los dos o uno solo | Media | nac-012, er-prov-027, er-mun-037 | MUN-061 |
| com-028 | Hay una doble negación que puede confundir | Media | nac-011, er-prov-028, er-mun-038 | MUN-059 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), p. 41 |
| com-029 | Conviene usar el verbo directo en lugar de "procédase a" | Baja | er-mun-039 | MUN-050 |
| com-030 | Verificar quién es "la autoridad competente" o "quien corresponda" | Media | er-mun-040 | MUN-052 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 25-26 |
| com-031 | Un plazo en "días" no aclara si son hábiles o corridos | Media | er-mun-042 | MUN-064 |
| com-032 | Hay una fecha o un momento imprecisos | Media | er-mun-043 | MUN-065 |
| com-039 | Una enumeración queda abierta *(aviso de revisión)* | Media | nac-031 | MUN-063 — aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana |
| com-040 | Hay criterios que la norma no define *(aviso de revisión)* | Media | — (nueva) | MUN-051 y MUN-062 — aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana |
| com-041 | La norma deja para más adelante lo que debería definir *(aviso de revisión)* | Media | — (nueva) | MUN-047 — aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana |
| com-042 | Se faculta a otro órgano a modificar o dejar sin efecto esta norma *(aviso de revisión)* | Media | — (nueva) | MUN-097 — aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana |
| com-043 | Hay expresiones coloquiales *(aviso de revisión)* | Baja | — (nueva) | MUN-053 — aviso de revisión por decisión del proyecto: el Manual deja este punto a la revisión humana |
| com-047 | Un término definido parece no volver a usarse | Baja | er-mun-041 | MUN-054 |
| com-033 | Hay palabras en otro idioma que tienen equivalente en castellano | Baja | nac-023, er-prov-013, er-mun-044 | MUN-057 |
| com-034 | Hay una sigla que nunca se explica | Baja | nac-008, er-prov-012, er-mun-045 | MUN-067 |
| com-048 | Una misma sigla se explica de dos maneras | Media | er-mun-046 | MUN-119 |
| com-035 | Siglas con puntos en el medio o con «s» de plural | Baja | nac-009, nac-045, er-prov-031 | MUN-067 |
| com-036 | La cifra en letras no coincide con el número | Alta | er-prov-011, er-mun-047 | MUN-069 |
| com-037 | Hay abreviaturas que conviene escribir completas | Baja | nac-037, er-mun-051 | MUN-066 |
| com-038 | Mezcla de tipos de comillas | Baja | er-prov-023, er-mun-053 | MUN-074 |
| com-044 | Posibles signos de puntuación repetidos | Baja | er-mun-052 | MUN-073 · Pérez Bourbon, Técnica legislativa municipal (KAS–CIMA, 2024), pp. 38-40 |
| com-046 | Los incisos saltan una letra o la repiten | Media | er-mun-016 | MUN-036 |
| com-049 | Los artículos bis y ter están repetidos o fuera de orden | Media | er-mun-012 | MUN-032 |
| com-054 | El VISTO no identifica un antecedente | Media | — (nueva) | MUN-024 |
| com-055 | Un verbo que recomienda no manda | Media | — (nueva) | MUN-048 |
| com-056 | La derogación, la vigencia y el cierre están en un mismo artículo | Media | — (nueva) | MUN-041 y MUN-029 |
| com-057 | Una cifra está escrita sólo en números | Baja | nac-024, er-prov-010 | MUN-069 — decisión del proyecto: el Manual no impone este formato en lo municipal |
| com-058 | El verbo va en subjuntivo: «créese» en vez de «créase» | Baja | er-prov-014 | MUN-049 — decisión del proyecto: el Manual no trasladaba esta práctica provincial |

## Avisos de revisión

Por decisión del proyecto, cuatro reglas comunes avisan cosas que los manuales
dejan a la revisión humana, porque para juzgarlas hace falta criterio jurídico:

- **com-039** — Una enumeración queda abierta
- **com-040** — Hay criterios que la norma no define
- **com-041** — La norma deja para más adelante lo que debería definir
- **com-042** — Se faculta a otro órgano a modificar o dejar sin efecto esta norma
- **com-043** — Hay expresiones coloquiales

Sólo avisan cuando aparece una frase concreta ("o cualquier otro monto", "serán
determinados posteriormente", "podrá… dejar sin efecto… esta norma"), con un
tono prudente ("Conviene revisar…") y con la etiqueta *Aviso de revisión:
requiere criterio jurídico*. No dicen nunca que algo sea inválido o ilegal. Se
apartan del criterio común de los manuales (sección 16 ter del Manual
municipal: avisar sólo lo que siempre es un problema).

## Reglas propias de cada ámbito

Quedaron en cada archivo las reglas que dependen de la jurisdicción:

**Nacional** (45): nac-001 Falta la fórmula de sanción al inicio; nac-003 Falta la frase final que cierra la ley; nac-005 Hay un artículo demasiado largo; nac-006 No queda claro desde cuándo se aplica la ley; nac-013 Hay una fecha con el año escrito con solo dos números; nac-014 Faltan los subtítulos de los artículos; nac-016 El título no avisa que esta norma modifica otra ley; nac-017 Un texto largo sin sumario al principio; nac-018 El título es demasiado largo; nac-019 Un capítulo, título o sección sin subtítulo; nac-022 Se usa "el mismo/éste" para referirse a algo ya nombrado; nac-025 Hay puntos suspensivos en una cita; nac-026 Hay una frase demasiado larga; nac-028 Se cita una ley externa sin decir dónde se publicó; nac-029 Se abusa de "y/o" y otras muletillas jurídicas; nac-032 Se cita un inciso como "el último" o "el penúltimo"; nac-033 Se cita una ley "y sus modificatorias" sin nombrarlas; nac-034 Se usan juntas las palabras "deroga" y "sustituye"; nac-036 Un anexo sin título que diga qué contiene; nac-041 El título usa palabras que después no aparecen en el texto; nac-043 Un título de sección está numerado con números comunes; nac-046 Hay unidades de medida o dinero abreviadas; nac-048 Se aprueba un tratado pero el título no lo menciona; nac-049 Falta el signo de dos puntos antes del texto que se incorpora; nac-050 Una sección está numerada con números romanos; nac-051 Un capítulo está numerado con números comunes; nac-052 Los capítulos no están numerados en orden; nac-053 Los números de artículo no usan el formato correcto; nac-054 Las letras de una lista no llevan paréntesis; nac-056 El anexo no indica a qué artículo corresponde; nac-057 Se repite muchas veces una expresión larga sin abreviarla; nac-058 Hay paréntesis que deberían evitarse; nac-059 Se usa la barra "/" entre palabras; nac-060 Se cita un decreto sin indicar el año; nac-061 Hay remisiones encadenadas entre artículos; nac-062 Un artículo remite a otro que viene después; nac-063 Un punto de la lista empieza con mayúscula; nac-064 No se aclara si el anexo forma parte de la ley; nac-065 Un porcentaje está escrito solo con la cifra; nac-066 Una cita interna dice "de la presente ley" en vez del número; nac-067 Se cita un decreto con el año en dos cifras; nac-068 Se llama "inciso" a lo que es una letra; nac-069 Las derogaciones están repartidas en varios artículos; nac-070 Los capítulos y los títulos están al revés; nac-071 Un anexo está identificado con número en vez de letra.

**Provincial** (9): er-prov-001 Falta la frase con la que la Legislatura sanciona la ley; er-prov-002 La frase de sanción es la del Congreso, no la de Entre Ríos; er-prov-003 La frase de sanción dice "sancionan", en plural; er-prov-009 Se aplican reglas de otra ley sin copiarlas acá; er-prov-015 Falta el artículo final de cierre; er-prov-016 El artículo de cierre es el de un decreto, no el de una ley; er-prov-018 El proyecto lleva número de ley; er-prov-022 Falta el punto de los miles al citar una ley; er-prov-030 Hay fechas con el año en dos cifras.

**Municipal** (35): er-mun-004 Posible mandato dentro del VISTO; er-mun-005 Posible mandato dentro del CONSIDERANDO; er-mun-007 Verificar el articulado y los fundamentos de la iniciativa popular; er-mun-019 No queda claro desde cuándo se aplica la ordenanza; er-mun-033 La misma norma se cita de formas distintas; er-mun-048 Los porcentajes se escriben de formas distintas; er-mun-049 Los montos en pesos usan separadores distintos; er-mun-050 Unidades de medida mal abreviadas ("mts", "kms", "hs"); er-mun-054 La fórmula de sanción falta o no dice quién sanciona; er-mun-055 No se encontró el artículo de cierre; er-mun-056 Verificar el nombre del órgano ejecutivo; er-mun-057 La ordenanza no puede regir antes de existir; er-mun-058 Se modifica una norma sin decir cuál; er-mun-059 Se modifica un párrafo o una frase suelta, no el artículo completo; er-mun-060 Se modifica una norma modificatoria en lugar de la original; er-mun-061 La derogación depende de un hecho futuro; er-mun-062 Se cita el Código Civil o el de Comercio, derogados en 2015; er-mun-063 El verbo va en singular y lo que modifica, en plural; er-mun-064 La misma norma se deroga dos veces; er-mun-065 "Por esta única vez": no queda claro qué rige después; er-mun-066 La misma disposición se repite en dos artículos; er-mun-067 Verificar el sentido de "progenitores" o "conviviente"; er-mun-068 Dos palabras distintas para lo que podría ser lo mismo; er-mun-069 "Requerir" puede significar pedir o necesitar; er-mun-070 Una oración subordinada agrega otra norma; er-mun-071 Verificar quién reglamenta y en qué plazo; er-mun-072 Hay palabras innecesarias; er-mun-073 Hay palabras rebuscadas que tienen una forma simple; er-mun-074 "Deberá" y "podrá" conviene escribirlos en presente; er-mun-075 Conviene definir el ámbito de aplicación; er-mun-076 Verificar si corresponde una ordenanza; er-mun-077 El título es demasiado largo; er-mun-078 Los artículos no tienen epígrafe; er-mun-079 Un capítulo, título o sección no tiene nombre; er-mun-080 Hay una oración demasiado larga.

## Cómo se probó

Cantidad de observaciones en cada ejemplo:

| Documento | Ámbito | Observaciones |
|---|---|---|
| `docs/ejemplo-perez-bourbon.txt` (sólo local, ver abajo) | municipal | 23 |
| `docs/ejemplo-mal-redactado.txt` | nacional | 28 |
| `docs/ejemplo-mal-redactado.txt` | provincial | 26 |
| `docs/ejemplo-mal-redactado.txt` | municipal | 30 |
| `docs/ejemplo-de-prueba-municipal-er.txt` | municipal | 40 |
| `docs/ejemplo-limpio-municipal-er.txt` | municipal | 0 |
| `docs/ejemplo-de-prueba-provincial-er.txt` | provincial | 24 |
| `docs/ejemplo-de-prueba-nacional.txt` | nacional | 21 |
| `docs/ejemplo-de-prueba-nacional-2.txt` | nacional | 26 |
| `docs/ejemplo-rompe-todo-nacional.txt` | nacional | 103 de 103 |
| `docs/ejemplo-rompe-todo-provincial-er.txt` | provincial | 65 de 67 |
| `docs/ejemplo-rompe-todo-municipal-er.txt` | municipal | 91 de 93 |

- `ejemplo-mal-redactado.txt` es el texto que la herramienta extrae de un PDF
  escrito con errores a propósito (una sola línea, como queda al leer un PDF).
  Tiene que dar las mismas reglas comunes en los tres ámbitos; la versión Word
  del mismo documento da exactamente las mismas observaciones.
- `ejemplo-limpio-municipal-er.txt` tiene que seguir dando **0**: sirve para
  detectar falsos positivos.
- Los `ejemplo-rompe-todo-*.txt` incumplen todas las reglas de su ámbito que
  pueden fallar juntas. Las que faltan se excluyen por lógica: no puede faltar
  la fórmula de sanción (er-prov-001) y a la vez estar mal escrita (er-prov-002
  y 003), ni faltar el cierre (er-prov-015) y a la vez ser el de un decreto
  (er-prov-016), ni faltar el CONSIDERANDO de una iniciativa popular
  (er-mun-007) y a la vez tener un mandato adentro (er-mun-005), ni faltar la
  cláusula de vigencia (er-mun-019) y a la vez ser imprecisa (com-016). Si
  uno de estos ejemplos baja de esos números, una regla dejó de detectar algo.
- `ejemplo-perez-bourbon.txt` no está en el repositorio: reúne pasajes del
  cuadernillo de Pérez Bourbon, que prohíbe su reproducción, y el repositorio es
  público. Se conserva sólo en el disco (está en `.gitignore`).
- Además, las reglas comunes se pasaron por 78 leyes entrerrianas sancionadas,
  extraídas de los Boletines Oficiales de `manual-tecnica-legislativa-er/fuentes/leyes`,
  para revisar a mano cada aviso nuevo y descartar los falsos (firmas tomadas
  como abreviaturas, "primera" tomada como verbo en futuro, "quedará redactado"
  marcado como futuro, entre otros).

## Lo que todavía no se detecta

- **Errores que sólo se ven entendiendo el contenido**: competencia, proporción
  de una sanción, si una delegación es válida, contradicciones que no están en
  la letra. Los avisos de revisión cubren sólo los casos con una frase concreta.
- **Lo que el texto no dice de forma reconocible**: por ejemplo, una
  obligación sin sujeto escrita de otra manera que "se deberá…", o una
  enumeración abierta que no use "y cualquier otra", "u otras" ni "etc.".
- **Verbos en futuro en textos sin tildes**: "implementara" puede ser futuro o
  subjuntivo, y "primera" no es un verbo. Sin la tilde no se puede distinguir,
  así que la regla com-026 sólo cuenta los futuros con "á".
