# MANUAL DE TÉCNICA LEGISLATIVA MUNICIPAL DE ENTRE RÍOS

## Versión normalizada para el Revisor de Técnica Legislativa

**Ámbito:** Municipios de la Provincia de Entre Ríos  
**Objeto:** revisión formal de proyectos sometidos a Concejos Deliberantes  
**Versión:** 29 de septiembre de 2026 — armonizada con el módulo provincial

> **Cambios de armonización (29/09/2026)**
>
> 1. Las etiquetas de autoridad pasan a ser las del módulo provincial (EXIGE, ACOSTUMBRA, SUBSIDIARIO), más una propia del ámbito municipal: VERIFICAR LOCALMENTE (sección 4).
> 2. Cada regla que puede llegar al motor indica **Equivale a:** su par provincial (`er-prov-…`) o nacional (`nac-…`), o si es **exclusiva municipal**. Cuando el problema es el mismo, la detección debe ser la misma.
> 3. Criterio común de automatización: la herramienta sólo avisa cuando encuentra una palabra, frase o patrón concreto que siempre es un problema. Por eso MUN-033, MUN-046, MUN-063 y MUN-079 pasan a revisión humana, MUN-022 se limita a una lista cerrada y MUN-054 a términos definidos que no vuelven a usarse.
> 4. Lo propio del municipio se reúne en la sección 16 bis.
> 5. Se corrigen contradicciones internas: MUN-002, MUN-019 y MUN-101 no llegan al motor; MUN-027 queda sólo como regla local; MUN-015 y MUN-030 se integran en MUN-029; MUN-104 deja de repetir a MUN-013; MUN-121 pasa a ser metodológica.
> 6. La coletilla `y toda norma que se oponga` deja de tolerarse: MUN-087 la marca aunque acompañe a una derogación expresa, igual que `er-prov-006`.
> 7. MUN-068 (mayúsculas) y MUN-106 (publicación y registro) pasan a revisión humana por el mismo criterio común.

---

# 1. FINALIDAD DEL MANUAL

Este Manual establece un estándar genérico de técnica legislativa municipal para Entre Ríos y, al mismo tiempo, define qué aspectos pueden ser utilizados por una herramienta automática de revisión formal.

La herramienta para la cual se normaliza este Manual:

- recibe un archivo o texto normativo;
- extrae su contenido textual;
- identifica estructuras y patrones de redacción;
- detecta posibles defectos formales;
- señala el fragmento observado cuando es posible;
- explica la regla aplicable;
- recomienda una revisión o una alternativa de redacción;
- informa la fuente y el nivel de autoridad de la regla;
- permite al usuario decidir si adopta o no la recomendación.

La herramienta **no modifica el documento**. Tampoco reemplaza la revisión legal humana.

---

# 2. LÍMITE CENTRAL DE LA REVISIÓN

El análisis se limita a la **técnica legislativa formal**.

Puede revisar, entre otros aspectos:

- estructura del proyecto;
- identificación del tipo de instrumento cuando resulte formalmente visible;
- numeración y organización del articulado;
- divisiones internas;
- títulos y epígrafes;
- anexos;
- redacción normativa;
- uso de verbos;
- siglas;
- cifras;
- fechas;
- puntuación;
- citas;
- remisiones;
- modificaciones textuales;
- incorporaciones;
- derogaciones expresas;
- cláusulas de vigencia;
- consistencia formal interna.

La herramienta no debe evaluar ni emitir recomendaciones que dependan de resolver:

1. constitucionalidad material;
2. competencia material del municipio;
3. legalidad sustantiva de la política pública;
4. mérito, oportunidad o conveniencia;
5. suficiencia presupuestaria;
6. razonabilidad de obligaciones, sanciones, beneficios o prohibiciones;
7. legitimación jurídica o política del autor;
8. cumplimiento real del procedimiento parlamentario;
9. mayoría efectivamente obtenida;
10. promulgación, veto, publicación o registración efectivamente realizados;
11. vigencia real de normas externas no incorporadas al archivo;
12. compatibilidad material con otras normas;
13. veracidad de hechos expuestos en VISTOS, CONSIDERANDOS o fundamentos;
14. intención del autor cuando no pueda inferirse de una regla formal;
15. si una norma superior permite, exige o impide materialmente determinada regulación.

Cuando una cuestión sólo pueda resolverse mediante alguno de esos juicios, **no debe formularse un hallazgo automático**.

---

# 3. REGLA DE PRESERVACIÓN DEL TEXTO DEL USUARIO

La herramienta trabaja sobre una copia de lectura del documento y nunca debe alterar el archivo original.

Toda salida debe adoptar la forma:

**Detecta -> explica -> cita la regla -> recomienda.**

Nunca:

**Detecta -> decide jurídicamente -> modifica.**

Una recomendación puede proponer un ejemplo de redacción, pero debe presentarlo como alternativa y no como reemplazo automático.

Si existen dos o más correcciones formalmente posibles y elegir una puede alterar el alcance de la norma, la herramienta debe limitarse a recomendar revisión humana.

---

# 4. FUENTES Y ALCANCE TERRITORIAL

Este Manual distingue cuatro niveles de autoridad. Las etiquetas son las mismas que usa el módulo provincial, para que una misma palabra signifique lo mismo en toda la herramienta. La única etiqueta nueva es VERIFICAR LOCALMENTE, que no tiene equivalente provincial.

| Etiqueta | Alcance en el ámbito municipal | Equivalente provincial |
|---|---|---|
| **EXIGE** | Regla común fundada en la Constitución de Entre Ríos, Ley Orgánica de Municipios Nº 10.027 u otra norma provincial directamente aplicable al aspecto formal analizado | EXIGE |
| **VERIFICAR LOCALMENTE** | Regla que depende del Reglamento Interno, ordenanza, decreto, digesto, protocolo o práctica formal de un municipio determinado | Sin equivalente: exclusiva municipal |
| **ACOSTUMBRA** | Uso observado en municipios entrerrianos que no constituye por sí solo una obligación general. A diferencia del ámbito provincial, esta práctica todavía no se midió sobre un corpus de ordenanzas | ACOSTUMBRA (en lo provincial, medida sobre 53 leyes) |
| **SUBSIDIARIO** | Criterio de técnica legislativa tomado del Manual de Técnica Legislativa de InfoLEG o de doctrina especializada, para cubrir un vacío local | SUBSIDIARIO |

Las etiquetas provinciales CRITERIO LEGAL CONDICIONADO (Ley Nº 9.971 del Digesto) y RECOMIENDA (modelo o instructivo oficial de una Cámara) no se usan en el ámbito municipal, porque sus fuentes son propias de la Legislatura.

Cuando una regla lleva dos etiquetas separadas por una barra, la que corresponde depende del caso concreto.

Ninguna regla VERIFICAR LOCALMENTE, ACOSTUMBRA o SUBSIDIARIO debe presentarse al usuario como obligación general de todos los municipios entrerrianos.

Este Manual está concebido para municipios regidos por la Ley Nº 10.027. Las comunas regidas por la Ley Nº 10.644 requieren un módulo propio.

---

# 5. ESTADOS OPERATIVOS PARA LA HERRAMIENTA

Cada regla debe llevar uno de estos estados.

| Código | Estado | Uso en el sitio |
|---|---|---|
| **AUTO** | Automatizable | El texto del archivo contiene información suficiente para detectar el patrón con razonable confiabilidad |
| **HEUR** | Heurística | El sistema puede detectar indicios y recomendar revisión, pero no afirmar el defecto con certeza |
| **LOCAL** | Requiere configuración local | Sólo puede aplicarse si el usuario selecciona un municipio o se carga una regla local verificable |
| **HUM** | Revisión humana | Es técnica legislativa válida, pero requiere comprender el sentido jurídico o comparar información externa |
| **FUERA** | Fuera del alcance | No debe generar hallazgos porque corresponde a constitucionalidad, competencia, legalidad material, procedimiento real u otra cuestión excluida |

Las reglas `HUM` y `FUERA` pueden permanecer en el Manual como contexto para el redactor, pero **no deben transformarse en reglas de `municipal-er.js`**.

---

# 6. NIVELES DE CONFIANZA

Cuando el sistema emita una observación, debe distinguir entre:

- **Alta confianza:** patrón formal inequívoco, por ejemplo numeración duplicada o aparición literal de `y/o`.
- **Confianza media:** patrón fuerte, pero admite excepciones, por ejemplo artículo muy largo con múltiples verbos normativos.
- **Baja confianza:** extracción deficiente, OCR dudoso o patrón dependiente de contexto.

La baja confianza debe mostrarse expresamente. Un posible error de OCR no debe presentarse como incumplimiento seguro.

---

# 7. REGLAS GENERALES DEL RÉGIMEN MUNICIPAL

## MUN-001 - Competencia municipal

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

Antes de presentar un proyecto debe existir competencia municipal para regular la materia. Sin embargo, determinarla requiere interpretación constitucional y legal sustantiva.

**Regla para el sitio:** no evaluar ni recomendar sobre competencia material.

---

## MUN-002 - Elección del instrumento según su efecto jurídico

**Autoridad:** EXIGE  
**Estado operativo:** HUM

La Ley Nº 10.027 distingue ordenanzas, decretos del Concejo, resoluciones y comunicaciones según su función.

La herramienta puede reconocer la denominación que aparece en el texto, pero no debe afirmar que el instrumento elegido es incorrecto si para ello necesita interpretar sus efectos materiales.

Esta regla no pasa al motor, ni siquiera como advertencia: sugerir otro tipo de instrumento exige juzgar el efecto jurídico del proyecto, que es una cuestión excluida por la sección 2. Queda en el Manual como orientación para quien redacta.

---

## MUN-003 - Categorías locales adicionales

**Autoridad:** VERIFICAR LOCALMENTE  
**Estado operativo:** LOCAL  
**Equivale a:** exclusiva municipal (capa local).

Declaraciones, minutas, pedidos de informes u otras categorías pueden existir por Reglamento Interno o práctica local.

No deben marcarse como incorrectas sin identificar el municipio y su regulación.

---

## MUN-004 - Iniciativa del proyecto

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

La legitimación del autor y las materias de iniciativa reservada no pueden verificarse sólo con la redacción del proyecto.

---

## MUN-005 - Iniciativa popular formalmente articulada

**Autoridad:** EXIGE  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

Si el documento se identifica expresamente como proyecto de iniciativa popular, puede controlarse si contiene articulado y fundamentos reconocibles.

No deben verificarse automáticamente firmas, porcentajes, certificaciones o materias excluidas.

---

## MUN-006 - Requisitos del Reglamento Interno

**Autoridad:** VERIFICAR LOCALMENTE  
**Estado operativo:** LOCAL  
**Equivale a:** exclusiva municipal (capa local).

Forma de presentación, apoyos, firmas, anticipación, correo, expediente, comisiones y otros requisitos dependen del municipio.

---

## MUN-007 - Plazos de tratamiento

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

Los plazos legales de tratamiento pertenecen al procedimiento parlamentario real y no son verificables a partir del proyecto aislado.

---

## MUN-008 - Tratamiento sobre tablas y mayorías

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No corresponde al análisis formal del texto.

---

## MUN-009 - Autorización del Secretario

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

La herramienta no debe inferir validez o invalidez por ausencia de una firma en un proyecto digital o documento incompleto.

---

## MUN-010 - Firma institucional

**Autoridad:** EXIGE / VERIFICAR LOCALMENTE  
**Estado operativo:** LOCAL  
**Equivale a:** exclusiva municipal (capa local).

La presencia y modalidad de firmas puede depender de la etapa del trámite y de la regulación local. No debe exigirse en todo proyecto cargado.

---

## MUN-011 - Registro

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

La registración efectiva es un hecho externo al texto.

---

## MUN-012 - Publicación

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

La publicación efectiva es un hecho posterior y externo al proyecto.

---

## MUN-013 - Cláusula de vigencia

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-006`. El módulo provincial no tiene regla de vigencia.

Cuando el proyecto no contiene una cláusula reconocible de entrada en vigencia, la herramienta puede recomendar que el redactor defina expresamente desde cuándo producirá efectos.

**No debe afirmar** cuál es la fecha jurídicamente correcta.

La precisión de una cláusula que sí existe se controla en MUN-104.

**Recomendación modelo:** “No se detectó una cláusula expresa de vigencia. Conviene indicar desde cuándo comenzará a aplicarse la ordenanza.”

---

## MUN-014 - Promulgación y veto

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No corresponde al control textual del proyecto.

---

## MUN-015 - Unidad normativa frente al veto parcial

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR

Puede utilizarse como fundamento adicional de la regla general de unidad normativa del artículo. No corresponde evaluar la validez de un eventual veto parcial.

No genera un hallazgo propio: se evalúa dentro de MUN-029.

---

## MUN-016 - Insistencia frente al veto

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

Es una cuestión procedimental y de interpretación legal externa.

---

## MUN-017 - Nulidad

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

La herramienta no declara nulidad ni validez jurídica.

---

## MUN-018 - Ordenanzas que generan gasto

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No evaluar suficiencia presupuestaria, disponibilidad de recursos ni validez material de una imputación.

Una cláusula formalmente incompleta sólo puede ser señalada si existe una regla textual objetiva y directamente aplicable, sin afirmar insuficiencia económica.

---

## MUN-019 - Contenidos mínimos legales por materia

**Autoridad:** EXIGE  
**Estado operativo:** HUM

Queda en el Manual como orientación para quien redacta. No pasa al motor: decidir si un proyecto de empréstito, presupuesto, concesión u otra materia contiene todos los requisitos legales exige revisión humana.

---

## MUN-020 - Mayorías especiales

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No corresponde a la revisión del texto.

---

# 8. ESTRUCTURA DEL PROYECTO

## MUN-021 - Elementos reconocibles del proyecto

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-040`, en parte. VISTO y CONSIDERANDO son exclusivos municipales.

El sistema puede identificar si el archivo contiene, cuando correspondan:

- denominación del proyecto;
- título;
- VISTO;
- CONSIDERANDO o fundamentos;
- fórmula de sanción;
- articulado;
- anexos.

La ausencia de VISTO o CONSIDERANDO no debe marcarse por sí sola como error general.

---

## MUN-022 - Título informativo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-015`, limitada a la lista cerrada. En lo provincial, SUB-01 no se automatiza.

El título debería identificar el objeto de la norma y evitar rótulos puramente genéricos.

La herramienta sólo avisa cuando el título coincide con una lista cerrada de títulos mudos, por ejemplo:

- `Disposiciones varias`;
- `Disposiciones generales` (como título de toda la norma);
- `Modificaciones`;
- `Modificación de ordenanza` sin número de la norma modificada.

Si el título es cualquier otro, no avisa: juzgar si describe bien el contenido exige leer y entender la norma.

---

## MUN-023 - Homogeneidad entre título y articulado

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si dos expresiones denominan el mismo instituto requiere comprensión semántica. No convertir en regla automática general.

---

## MUN-024 - VISTO

**Autoridad:** ACOSTUMBRA / SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

El VISTO no es obligatorio para todos los municipios.

Cuando exista, el sitio puede detectar:

- extensión desproporcionada;
- presencia de mandatos típicamente normativos;
- mezcla evidente con el articulado.

No debe marcar su ausencia como defecto general.

---

## MUN-025 - CONSIDERANDO

**Autoridad:** ACOSTUMBRA / SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal. Usa los mismos conectores de motivación que `er-prov-004`.

Cuando exista, el CONSIDERANDO debe cumplir función justificativa y no contener disposiciones operativas que claramente correspondan al articulado.

El sistema puede buscar verbos normativos y fórmulas imperativas como indicio, pero debe presentar el hallazgo como recomendación de revisión.

---

## MUN-026 - Fundamentos separados del articulado

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-005`. Misma detección: sólo marca el bloque intercalado entre artículos.

Si se detecta un bloque titulado `FUNDAMENTOS` o `FUNDAMENTACIÓN` intercalado entre artículos, puede recomendarse separarlo del articulado.

La ausencia de fundamentos escritos no constituye por sí sola un error general.

---

## MUN-027 - Fórmula de sanción

**Autoridad:** VERIFICAR LOCALMENTE / ACOSTUMBRA  
**Estado operativo:** LOCAL  
**Equivale a:** `er-prov-001` a `er-prov-003`, pero sólo con configuración local.

No existe una fórmula textual única general para todos los municipios entrerrianos.

Sin identificación del municipio, el sistema no debe exigir una fórmula exacta.

Sin configuración local tampoco debe avisar que la fórmula falta, porque algunos municipios pueden no utilizarla o ubicarla fuera del texto cargado. Sólo con una ficha local (sección 21) puede controlarse su presencia y su redacción.

Las reglas provinciales de fórmula de sanción (`er-prov-001`, `er-prov-002` y `er-prov-003`) no se aplican al ámbito municipal: se fundan en la Constitución provincial para las leyes de la Legislatura.

---

## MUN-028 - Articulado como sede del contenido normativo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

El contenido normativo principal debe estar estructurado en artículos.

El sistema puede advertir cuando encuentra extensos bloques aparentemente normativos antes o después del articulado, sin afirmar que necesariamente sean inválidos.

---

## MUN-029 - Unidad normativa del artículo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `er-prov-008`. Misma detección.

Cada artículo debería contener una regla o conjunto estrechamente relacionado.

Indicadores automáticos posibles:

- extensión muy alta;
- numerosos verbos normativos independientes;
- varias oraciones extensas sin incisos;
- acumulación de obligaciones heterogéneas.

La longitud nunca debe ser el único fundamento para afirmar un defecto.

Esta regla absorbe MUN-015 (veto parcial) y MUN-030 (brevedad): la herramienta emite un solo aviso por artículo. Se usa la misma prueba que `er-prov-008`: un artículo extenso, con tres o más verbos normativos y sin incisos.

---

## MUN-030 - Brevedad del artículo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR

Los artículos excesivamente extensos pueden generar una recomendación de división. El umbral debe usarse como señal y no como prohibición absoluta.

No genera un hallazgo propio: la longitud sola no alcanza (MUN-029), así que la extensión se evalúa dentro de MUN-029.

---

## MUN-031 - Numeración progresiva

**Autoridad:** SUBSIDIARIO / VERIFICAR LOCALMENTE  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-017` (secuencia), `er-prov-020` (grafía de ARTÍCULO) y `er-prov-021` (separador). Misma detección.

Los artículos deben mantener una secuencia uniforme y correlativa dentro del proyecto.

El sistema puede detectar:

- saltos;
- repeticiones;
- retrocesos;
- mezcla inconsistente de formatos.

No debe confundir referencias a artículos de otras normas con encabezados del proyecto.

---

## MUN-032 - Artículos bis, ter y sucesivos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Cuando se inserte una disposición dentro de una norma vigente sin renumerar todo el texto, puede utilizarse `bis`, `ter` y sucesivos conforme a una secuencia consistente.

El sistema puede detectar sufijos duplicados o secuencias formalmente anómalas.

---

## MUN-033 - Epígrafes

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Si se utilizan epígrafes, conviene mantenerlos de forma homogénea.

Queda como consejo para quien redacta. La herramienta no avisa: distinguir un epígrafe de la primera frase del artículo no tiene un patrón seguro, y decidir si un texto es lo bastante extenso para necesitarlos exige leerlo.

---

## MUN-034 - Divisiones superiores al artículo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-026`. Misma detección.

TÍTULOS, CAPÍTULOS, SECCIONES u otras divisiones deben mantener jerarquía y numeración coherentes.

Puede detectarse:

- salto de nivel;
- duplicación de números;
- capítulo único innecesariamente numerado dentro de una estructura simple;
- alternancia inconsistente entre números romanos y arábigos.

---

## MUN-035 - Epígrafes de divisiones superiores

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-019`.

Las divisiones superiores deben tener denominaciones consistentes cuando el documento utiliza ese sistema.

---

## MUN-036 - Incisos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-054` y `nac-063`, en parte. Sólo marca inconsistencias internas, no un formato concreto.

Los incisos deben seguir una forma uniforme y una secuencia reconocible.

Puede revisarse:

- duplicación;
- salto;
- mezcla de `1.`, `1)`, `a)` y viñetas dentro de la misma enumeración;
- ausencia de separación cuando la estructura se vuelve confusa.

---

## MUN-037 - Apartados y enumeraciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-025`. Misma detección.

Las subdivisiones internas deben conservar jerarquía y formato homogéneos.

Evitar guiones o viñetas gráficas cuando dificultan la cita normativa posterior.

---

## MUN-038 - Anexos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-055` y `nac-036`.

Los anexos deben ubicarse separadamente del articulado y tener identificación suficiente.

El sistema puede detectar anexos sin rótulo o anexos insertados en medio del articulado.

---

## MUN-039 - Remisión expresa al anexo

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-019` y `nac-030`. Misma detección que `er-prov-019`.

Si existe un anexo, conviene que al menos un artículo lo identifique y establezca su relación con la norma.

El sistema puede advertir cuando aparece `ANEXO` pero no encuentra una remisión reconocible desde el articulado.

---

## MUN-040 - Homogeneidad material

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si una disposición es ajena al objeto de la norma exige interpretar el contenido. No automatizar como defecto.

---

## MUN-041 - Secuencia general de las disposiciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `er-prov-024`, en parte.

Como pauta general, conviene ordenar:

1. objeto y ámbito;
2. definiciones;
3. reglas sustantivas;
4. autoridades y procedimientos;
5. aspectos complementarios;
6. modificaciones o derogaciones;
7. disposiciones transitorias;
8. vigencia y cierre.

La herramienta sólo debe marcar anomalías formales evidentes, por ejemplo disposiciones transitorias ubicadas antes del régimen general, y siempre como recomendación.

---

## MUN-042 - Artículo de objeto

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-044`.

Un artículo inicial de objeto puede mejorar la identificación de la finalidad normativa. Su ausencia no debe ser un error automático en normas breves cuyo objeto resulte evidente.

---

## MUN-043 - Ámbito de aplicación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

La necesidad de delimitar sujetos, territorio o situaciones depende del contenido. No exigir automáticamente.

---

## MUN-044 - Autoridad de aplicación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si una norma necesita autoridad de aplicación es una cuestión sustantiva. No automatizar su ausencia.

---

## MUN-045 - Disposiciones transitorias

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `er-prov-024`. Misma detección.

Si existen cláusulas expresamente transitorias, deben ubicarse hacia el final del articulado y distinguirse del régimen permanente.

---

# 9. LENGUAJE NORMATIVO

## MUN-046 - Frases razonablemente breves

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Las oraciones muy extensas pueden dificultar la comprensión.

Queda como consejo para quien redacta. La herramienta no avisa: la longitud sola no distingue una oración mal escrita de una que es larga porque el tema es complejo.

---

## MUN-047 - Integridad de la proposición normativa

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

La regla debe ser completa, pero determinar qué elemento jurídico falta exige comprender el contenido. No automatizar de forma general.

---

## MUN-048 - Carácter normativo del articulado

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `er-prov-004`. Misma lista de conectores de motivación.

El articulado debe contener prescripciones y no fundamentos políticos, diagnósticos o explicaciones narrativas.

El sistema puede detectar expresiones típicamente justificativas como `considerando que`, `dado que`, `toda vez que`, `resulta necesario` o equivalentes dentro de artículos y recomendar su revisión.

---

## MUN-049 - Tiempo verbal

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-029`. Misma detección: sólo cuando el futuro es la forma dominante.

Como criterio general de redacción normativa, preferir presente del indicativo frente al futuro normativo.

El sistema puede advertir uso predominante de formas como `será`, `deberá`, `podrá`, `tendrá`, cuando una formulación presente resulte normalmente más directa.

No debe marcar automáticamente todo uso futuro, porque puede describir un hecho temporal genuino.

---

## MUN-050 - Verbos normativos directos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

Preferir verbos que expresen con claridad la operación jurídica: crear, establecer, disponer, prohibir, autorizar, designar, modificar, sustituir, incorporar, derogar.

La herramienta sólo puede señalar perífrasis de una lista cerrada, como `procédase a`, `dispónese que se proceda a` o `se deberá proceder a`, sin determinar cuál verbo expresa mejor la decisión sustantiva.

---

## MUN-051 - Sujeto, conducta y condición

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

La completitud lógica de una obligación requiere interpretación semántica. No convertir en regla binaria.

---

## MUN-052 - Sujetos imprecisos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

Expresiones como `la autoridad competente`, `el organismo correspondiente`, `quien corresponda` o similares pueden ser ambiguas.

El sistema puede señalarlas para revisión cuando no exista una definición visible en el mismo texto.

---

## MUN-053 - Términos jurídicos y técnicos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

No evaluar automáticamente la corrección conceptual de terminología especializada.

---

## MUN-054 - Definiciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-057`, en parte. En lo provincial, SUB-11 no se automatiza.

Si el proyecto contiene una sección de definiciones, la herramienta sólo avisa cuando un término definido nunca vuelve a aparecer en el resto del texto. Las definiciones circulares u otros problemas de contenido quedan para revisión humana.

No debe decidir si una definición material es jurídicamente correcta.

---

## MUN-055 - Consistencia terminológica

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si dos palabras designan la misma institución exige análisis semántico. Sólo pueden automatizarse casos previamente definidos en listas cerradas.

---

## MUN-056 - Evitar sinónimos estilísticos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

No debe tratarse como detector general porque requiere conocer si los términos son equivalentes en ese contexto.

---

## MUN-057 - Extranjerismos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-013`. Misma lista cerrada.

Puede utilizarse una lista cerrada de extranjerismos frecuentes con equivalente castellano claro.

Las palabras técnicas internacionalmente consolidadas no deben marcarse por defecto.

---

## MUN-058 - Neologismos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

No automatizar salvo listas específicas previamente documentadas.

---

## MUN-059 - Negaciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-028`. Misma detección.

Evitar dobles o múltiples negaciones que dificulten la lectura.

El sistema puede detectar combinaciones como `no ... salvo que no`, `no será ... excepto cuando no` y estructuras equivalentes.

---

## MUN-060 - Conjunciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

El significado de `y` u `o` depende de la relación lógica. No corresponde juzgar automáticamente su corrección general.

---

## MUN-061 - Evitar “y/o”

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-027`. Misma detección.

La expresión `y/o` debe evitarse cuando pueda sustituirse por una conjunción precisa.

**Recomendación:** revisar si corresponde `y`, `o` o una fórmula explícita que contemple ambas posibilidades.

---

## MUN-062 - Condiciones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

No corresponde decidir automáticamente si una condición es necesaria, suficiente o ambas.

---

## MUN-063 - Enumeraciones taxativas o ejemplificativas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Quien redacta puede usar expresiones como `entre otros`, `tales como`, `incluye`, `especialmente` o `exclusivamente` para dejar claro si una lista es completa o sólo de ejemplo.

La herramienta no avisa: decidir si una lista debía ser abierta o cerrada exige conocer la intención del legislador.

---

## MUN-064 - Plazos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Los plazos deben expresarse de forma precisa.

Puede recomendarse especificar si se trata de días hábiles o corridos cuando el texto sólo dice `días` y esa precisión no surge del propio documento.

No debe decidir cuál clase de días corresponde jurídicamente.

---

## MUN-065 - Fechas ciertas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Evitar referencias temporales ambiguas como `el próximo mes`, `este año`, `a la brevedad`, `en breve` o `próximamente` dentro de disposiciones normativas.

Preferir fecha, plazo o condición objetivamente verificable.

---

# 10. ESCRITURA Y ORTOTIPOGRAFÍA

## MUN-066 - Abreviaturas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-037`.

Evitar abreviaturas innecesarias en el articulado y mantener un uso homogéneo.

---

## MUN-067 - Siglas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-012`. Misma detección del primer uso sin denominación.

En la primera aparición, conviene escribir la denominación completa seguida de la sigla entre paréntesis. Luego puede utilizarse la sigla de manera uniforme.

El sistema puede detectar siglas en mayúsculas que aparecen por primera vez sin una expansión cercana.

---

## MUN-068 - Mayúsculas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM  
**Equivale a:** ninguna. El módulo nacional la declaró no detectable.

Conviene usar las mayúsculas de forma homogénea, por ejemplo escribir siempre `Departamento Ejecutivo` y no alternarlo con `departamento ejecutivo`.

Queda como consejo para quien redacta. La herramienta no avisa: el OCR altera mayúsculas y minúsculas, y no puede distinguir un descuido del redactor de un error de extracción (criterio común de la sección 16 ter).

---

## MUN-069 - Números

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-011`. Misma detección. No se traslada `er-prov-010` (cifra escrita sólo en números): en lo municipal no se impone ese formato.

Cuando el estilo adoptado utilice cifras en letras y números, debe mantenerse consistencia y coincidencia entre ambas formas.

El sistema puede detectar pares como `treinta (20)` y advertir la discrepancia.

No debe imponer este formato como obligación jurídica general si la fuente sólo lo recomienda.

---

## MUN-070 - Porcentajes

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-065`, en parte. Sólo marca inconsistencias internas.

Mantener una convención homogénea para porcentajes y evitar inconsistencias entre texto y cifra.

---

## MUN-071 - Moneda

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Mantener una forma homogénea para designar monedas y montos. No modificar automáticamente cifras ni interpretar su valor.

---

## MUN-072 - Unidades de medida

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-046`, en parte.

Utilizar símbolos y unidades de forma consistente y evitar pluralizaciones incorrectas de símbolos.

---

## MUN-073 - Puntuación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-025` y `nac-049`, en parte.

Sólo automatizar patrones objetivos, por ejemplo puntos suspensivos innecesarios, dos puntos duplicados, signos repetidos o separadores inconsistentes.

No utilizar un corrector gramatical general para reescribir el articulado.

---

## MUN-074 - Comillas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-023` y `nac-038`.

Los textos que sustituyen o incorporan literalmente disposiciones deben delimitar con claridad dónde comienza y termina el nuevo texto.

El sistema puede detectar comillas abiertas sin cierre o una fórmula de sustitución seguida de texto no delimitado.

---

## MUN-075 - Cita de normas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-022`, en parte. En lo municipal sólo se marca la alternancia de formatos dentro del mismo documento; no se exige el punto de los miles.

Las citas deben identificar suficientemente la norma y mantener formato homogéneo.

Puede detectarse:

- alternancia injustificada entre `Ley 10027`, `Ley Nº 10.027` y otras formas;
- números de ley con separadores inconsistentes;
- referencias claramente incompletas dentro de un mismo patrón documental.

---

## MUN-076 - Cita de artículos e incisos

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-004`.

Mantener una forma homogénea para `artículo`, `inciso`, `apartado`, letras y números.

Puede señalarse la mezcla de `Art.`, `Artículo`, `inc.`, `inciso` cuando el propio documento utiliza formas divergentes para el mismo nivel de cita.

---

# 11. REFERENCIAS

## MUN-077 - Referencias internas necesarias

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si una remisión es necesaria depende de la arquitectura normativa. No automatizar la necesidad misma.

---

## MUN-078 - Referencias internas precisas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-047`.

Evitar fórmulas indeterminadas como `lo dispuesto anteriormente`, `el artículo precedente`, `los artículos siguientes` cuando pueda identificarse una referencia concreta.

El sistema puede recomendar citar el número específico.

---

## MUN-079 - Cadenas de remisiones

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Conviene evitar que una disposición remita a otra que, a su vez, remite a una tercera.

La herramienta no avisa: para saber si la cadena es un problema hay que seguirla y entender si reconstruye una misma regla.

---

## MUN-080 - Referencias externas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-028`, en parte.

El sistema puede controlar forma y precisión de la cita, pero no comprobar automáticamente el contenido ni la vigencia de la norma externa.

---

## MUN-081 - Referencias dinámicas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si una remisión debe alcanzar futuras modificaciones exige una decisión normativa. No automatizar.

---

## MUN-082 - Normas nacionales y provinciales

**Autoridad:** EXIGE / SUBSIDIARIO  
**Estado operativo:** HUM

No decidir automáticamente si corresponde adhesión, remisión, incorporación material o aplicación supletoria.

El sistema puede únicamente controlar la forma de la cita.

---

# 12. MODIFICACIONES, INCORPORACIONES Y DEROGACIONES

## MUN-083 - Modificaciones explícitas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-007`. Misma detección.

Evitar modificaciones implícitas cuando el proyecto manifiesta que altera una norma determinada.

El sistema puede detectar fórmulas vagas como `modifícase en lo pertinente` o `adécuase lo necesario` y recomendar individualizar la disposición afectada.

---

## MUN-084 - Sustitución textual

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-007` y `er-prov-023`.

La sustitución debe identificar la disposición y reproducir el texto nuevo de forma delimitada.

Modelo:

`ARTÍCULO X.- Sustitúyese el artículo 5° de la Ordenanza Nº 0000, el que quedará redactado de la siguiente manera: “...”`.

El sitio puede verificar presencia de norma afectada, artículo y texto sustitutorio delimitado.

---

## MUN-085 - Incorporación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-007`, en parte.

La incorporación debe identificar con precisión dónde se agrega la nueva disposición.

Modelo:

`ARTÍCULO X.- Incorpórase como artículo 5° bis de la Ordenanza Nº 0000 el siguiente: “...”`.

---

## MUN-086 - Derogación expresa

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-007` y `nac-010`.

Preferir la individualización de la norma o disposición que se deroga.

Modelo:

`ARTÍCULO X.- Derógase el artículo 8° de la Ordenanza Nº 0000.`

---

## MUN-087 - Evitar derogaciones genéricas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `er-prov-006`. Misma detección.

El sistema puede detectar fórmulas como:

- `Derógase toda norma que se oponga a la presente`;
- `Quedan derogadas todas las disposiciones contrarias`;
- `y toda norma que se oponga a la presente`, agregada al final de una derogación expresa.

La cláusula genérica se marca siempre, sea la única derogación del proyecto o una coletilla que acompaña a una derogación expresa (ver MUN-088).

Debe recomendar individualizar las normas afectadas cuando sea posible y, si ya existe una derogación expresa, suprimir la coletilla genérica.

No debe afirmar que la cláusula genérica carece de efectos jurídicos.

---

## MUN-088 - Cláusula genérica complementaria

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO (se controla dentro de MUN-087)  
**Equivale a:** `er-prov-006`. Mismo criterio.

No se tolera una cláusula genérica residual, como `y toda norma que se oponga a la presente`, aunque siga a una lista expresa de derogaciones. La parte expresa está bien; la coletilla genérica sobra, porque no identifica ninguna norma.

No genera un hallazgo propio: la detecta MUN-087, que recomienda suprimir la coletilla.

---

## MUN-089 - Modificaciones múltiples

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Cuando un mismo proyecto modifica varios artículos, conviene que cada operación sea identificable y mantenga un orden reconocible.

Puede advertirse si una misma disposición pretende sustituir múltiples artículos sin delimitación clara.

---

## MUN-090 - Modificaciones implícitas o matemáticas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** exclusiva municipal.

Evitar instrucciones como `auméntase en un 20 % el monto previsto en...` cuando la finalidad sea dejar un texto normativo permanente cuyo nuevo valor puede expresarse directamente.

El sitio puede recomendar una modificación textual explícita, sin calcular ni sustituir automáticamente el monto.

---

## MUN-091 - Coordinación con normas relacionadas

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Requiere consultar legislación externa. No automatizar.

---

## MUN-092 - Texto ordenado

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si corresponde consolidar una norma exige conocer su historial completo.

---

## MUN-093 - Prórroga

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-035`.

La prórroga debe identificar la norma, disposición o plazo afectado y expresar el nuevo término de manera precisa.

---

## MUN-094 - Suspensión

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** `nac-035`.

La suspensión debe identificar la disposición afectada y su duración o condición de finalización.

El sitio puede controlar esos elementos formales, pero no juzgar la legitimidad material de la suspensión.

---

## MUN-095 - Revivificación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Determinar si la derogación de una norma hace revivir otra requiere análisis jurídico e histórico. No automatizar.

---

# 13. CLÁUSULAS ESPECÍFICAS

## MUN-096 - Adhesión

**Autoridad:** EXIGE / SUBSIDIARIO  
**Estado operativo:** HUM

El sistema no debe decidir si una ley nacional o provincial admite o requiere adhesión municipal.

Sólo puede controlar la estructura formal de una cláusula que el redactor ya haya decidido incluir.

---

## MUN-097 - Reglamentación

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HUM

Puede detectarse una cláusula de reglamentación, pero no corresponde evaluar si delega elementos esenciales o altera el espíritu de la norma.

---

## MUN-098 - Régimen sancionatorio

**Autoridad:** EXIGE / SUBSIDIARIO (según la materia)  
**Estado operativo:** HUM

El sitio puede controlar estructura y numeración, pero no proporcionalidad, legalidad ni competencia sancionatoria.

---

## MUN-099 - Ordenanzas tributarias

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No evaluar validez tributaria, hecho imponible, base, alícuota, sujeto, exenciones ni competencia fiscal como cuestiones materiales.

---

## MUN-100 - Gastos y financiamiento

**Autoridad:** EXIGE  
**Estado operativo:** FUERA

No evaluar suficiencia de recursos ni corrección presupuestaria material.

---

## MUN-101 - Concesiones, empréstitos y bienes municipales

**Autoridad:** EXIGE  
**Estado operativo:** HUM

La Ley Nº 10.027 puede exigir contenidos o mayorías especiales. Su control integral requiere revisión humana y documental externa. No pasa al motor.

---

## MUN-102 - Presupuesto

**Autoridad:** EXIGE  
**Estado operativo:** HUM

No debe automatizarse el control material de equilibrio, partidas, recursos o modificaciones presupuestarias.

---

## MUN-103 - Ordenamiento territorial

**Autoridad:** EXIGE / SUBSIDIARIO  
**Estado operativo:** HUM

La herramienta no evalúa zonificación, competencia técnica, cartografía o adecuación material del régimen territorial.

---

## MUN-104 - Cláusula de vigencia

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** AUTO  
**Equivale a:** `nac-006`.

Cuando se incluya, debe utilizar una fecha, plazo o hecho objetivamente determinable.

El sistema puede advertir fórmulas ambiguas, siempre como recomendación formal. La ausencia de cláusula se controla en MUN-013.

---

## MUN-105 - Cláusula final

**Autoridad:** VERIFICAR LOCALMENTE / ACOSTUMBRA  
**Estado operativo:** LOCAL  
**Equivale a:** `er-prov-015` y `er-prov-016`, pero sólo con configuración local.

Fórmulas como `Comuníquese, publíquese, regístrese y archívese` son frecuentes, pero su redacción concreta depende del municipio y del tipo de instrumento.

Sin configuración local, la herramienta no debe imponer una fórmula exacta.

---

## MUN-106 - Publicación y registro como conceptos distintos

**Autoridad:** EXIGE / SUBSIDIARIO  
**Estado operativo:** HUM  
**Equivale a:** ninguna.

Si una cláusula final utiliza ambos conceptos, conviene que no se presenten como sinónimos.

Queda como consejo para quien redacta. La herramienta no avisa: no hay una frase concreta que buscar, y detectar la confusión exige entender la cláusula (criterio común de la sección 16 ter).

No comprobará si los actos fueron efectivamente cumplidos.

---

## MUN-107 - Boletín o gaceta digital

**Autoridad:** EXIGE / VERIFICAR LOCALMENTE  
**Estado operativo:** FUERA

La existencia, validez y funcionamiento del medio de publicación es información externa al archivo.

---

## MUN-108 - Firma digital y expediente electrónico

**Autoridad:** VERIFICAR LOCALMENTE  
**Estado operativo:** LOCAL  
**Equivale a:** exclusiva municipal (capa local).

Sólo debe controlarse si existe una regla local previamente configurada. El sitio no debe inferir invalidez por la apariencia gráfica de una firma.

---

# 14. REGLAS DE NORMALIZACIÓN DEL SISTEMA

## MUN-109 - Prioridad de fuentes

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

Orden de control:

1. Constitución de Entre Ríos;
2. Carta Orgánica municipal, si existiera y fuera aplicable;
3. Ley Nº 10.027 y otras leyes provinciales aplicables;
4. normas locales verificadas;
5. práctica local documentada;
6. criterios subsidiarios de este Manual, InfoLEG y doctrina.

---

## MUN-110 - No generalizar prácticas locales

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

Una práctica de Paraná, Concordia, Gualeguaychú, Concepción del Uruguay, Chajarí, Victoria u otro municipio no se transforma automáticamente en regla común provincial.

---

## MUN-111 - VISTO y CONSIDERANDO

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

No son requisitos generales obligatorios para todos los municipios. Su ausencia no debe generar un error automático genérico.

---

## MUN-112 - Fórmula de sanción

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

No existe una fórmula textual municipal única para toda la provincia. Una fórmula sólo puede exigirse como exacta mediante configuración local.

---

## MUN-113 - Numeración

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

El sistema puede controlar consistencia interna, pero no imponer un modelo provincial único de ordinales, separadores o numeración de ordenanzas si no existe base común suficiente.

---

## MUN-114 - Decreto del Concejo

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

No debe confundirse el decreto del Concejo previsto por la Ley Nº 10.027 con actos administrativos unipersonales que una Presidencia pueda emitir por regulación local.

---

## MUN-115 - Resoluciones y promulgación

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

Ante ambigüedades normativas sobre trámite de resoluciones, el sitio no debe resolver la cuestión interpretativamente.

---

## MUN-116 - Archivo local y plazo legal

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

No corresponde al análisis textual del proyecto.

---

## MUN-117 - No trasladar automáticamente reglas provinciales de leyes

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

Las reglas de la Legislatura provincial sólo se aplican al ámbito municipal cuando exista fundamento específico o se utilicen como criterio subsidiario claramente identificado.

---

## MUN-118 - InfoLEG como estándar subsidiario

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** Metodológica

El Manual de Técnica Legislativa de InfoLEG puede utilizarse para cubrir vacíos de estilo y estructura, pero no convierte sus reglas en obligaciones jurídicas municipales.

---

## MUN-119 - Coherencia formal interna

**Autoridad:** SUBSIDIARIO  
**Estado operativo:** HEUR  
**Equivale a:** exclusiva municipal.

El sistema puede controlar inconsistencias objetivamente observables dentro del mismo archivo, por ejemplo:

- una misma sigla desarrollada de dos maneras;
- numeración incompatible;
- denominaciones formales divergentes de una misma norma cuando la identidad sea textual;
- fechas contradictorias explícitas;
- dos importes en letras y cifras que no coinciden;
- referencias a artículos inexistentes dentro del propio proyecto.

No debe utilizar esta regla para decidir contradicciones jurídicas sustantivas.

---

## MUN-120 - Integración con el ordenamiento

**Autoridad:** EXIGE / SUBSIDIARIO  
**Estado operativo:** HUM

Comparar el proyecto con legislación municipal, provincial o nacional externa excede al motor de análisis del archivo aislado.

---

## MUN-121 - Control formal final

**Autoridad:** Metodológica  
**Estado operativo:** NO ES REGLA DE HALLAZGO

Antes de cerrar el informe, el sistema puede ejecutar una revisión transversal de:

- numeración del articulado;
- jerarquía de divisiones;
- incisos y apartados;
- anexos y remisiones a anexos;
- siglas;
- cifras y equivalencias;
- fechas;
- citas formales;
- remisiones internas;
- modificaciones textuales;
- derogaciones genéricas;
- vigencia;
- uniformidad ortotipográfica;
- presencia de patrones de redacción potencialmente ambiguos.

Cada punto de esta lista ya tiene su propia regla. MUN-121 describe el recorrido completo y no genera avisos por sí misma.

Este control no autoriza a emitir juicios sobre constitucionalidad, competencia, legalidad material o conveniencia.

---

# 15. REGLAS QUE PUEDEN PASAR AL MOTOR AUTOMÁTICO

La siguiente lista constituye el núcleo inicial recomendado para `municipal-er.js`.

## 15.1. Automatizables directas

- MUN-013: ausencia de cláusula de vigencia.
- MUN-026: fundamentos intercalados en el articulado.
- MUN-031: numeración de artículos.
- MUN-032: uso y secuencia de bis, ter y equivalentes.
- MUN-034: jerarquía de divisiones superiores.
- MUN-035: consistencia de títulos y capítulos.
- MUN-036: incisos.
- MUN-037: apartados y enumeraciones.
- MUN-039: anexo sin remisión reconocible.
- MUN-049: uso dominante de futuro normativo, con cautela.
- MUN-057: extranjerismos de lista cerrada.
- MUN-059: dobles negaciones.
- MUN-061: `y/o`.
- MUN-064: plazos expresados sólo como `días` cuando conviene precisar.
- MUN-065: fechas relativas ambiguas.
- MUN-066: abreviaturas inconsistentes.
- MUN-067: siglas sin desarrollo inicial.
- MUN-069: números en letras y cifras que no coinciden.
- MUN-070: porcentajes inconsistentes.
- MUN-071: moneda y montos con formato inconsistente.
- MUN-072: unidades de medida.
- MUN-074: delimitación de textos sustitutorios.
- MUN-075: formato de citas normativas.
- MUN-076: formato de citas de artículos e incisos.
- MUN-078: referencias internas imprecisas.
- MUN-083: modificación explícita insuficientemente identificada.
- MUN-084: sustitución textual.
- MUN-085: incorporación.
- MUN-086: derogación expresa.
- MUN-087: derogación exclusivamente genérica.
- MUN-089: modificaciones múltiples sin delimitación clara.
- MUN-090: modificación implícita o por operación matemática.
- MUN-093: prórroga sin identificación suficiente.
- MUN-022: título de la lista cerrada de títulos mudos.
- MUN-104: precisión de la vigencia.
- MUN-119: inconsistencias formales internas objetivas.

## 15.2. Reglas heurísticas

Pueden implementarse, pero el lenguaje de la observación debe ser prudente. Sólo se implementan cuando la regla tiene una palabra, frase o patrón concreto que buscar (criterio común de la sección 16 ter):

- MUN-005;
- MUN-021;
- MUN-024;
- MUN-025;
- MUN-028;
- MUN-029;
- MUN-038;
- MUN-041;
- MUN-042;
- MUN-045;
- MUN-048;
- MUN-050;
- MUN-052;
- MUN-054;
- MUN-073;
- MUN-080;
- MUN-094.

Las observaciones deben utilizar expresiones como:

- `Conviene revisar...`
- `Se detectó un posible...`
- `Este patrón puede dificultar...`
- `Verificar si...`

Y evitar:

- `Es inválido...`
- `Es inconstitucional...`
- `No tiene competencia...`
- `Debe anularse...`
- `La ordenanza es ilegal...`

---

# 16. REGLAS QUE NO DEBEN PASAR AL MOTOR SIN CONFIGURACIÓN LOCAL

- MUN-003;
- MUN-006;
- MUN-010;
- MUN-027;
- MUN-105;
- MUN-108.

Una futura versión del sitio podría habilitarlas mediante un segundo selector:

`Municipio: [Paraná / Concordia / Gualeguaychú / ...]`

Sólo entonces podrían cargarse fórmulas, numeraciones, reglas de presentación o cláusulas finales específicas verificadas para ese municipio.

---

# 16 bis. LO PROPIO DEL ÁMBITO MUNICIPAL

Estas reglas y mecanismos no tienen equivalente en el módulo provincial. La armonización no los modifica.

## Reglas exclusivas

| Regla | Qué controla |
|---|---|
| MUN-005 | Proyecto de iniciativa popular sin articulado o fundamentos reconocibles |
| MUN-024 | VISTO con mandatos normativos o mezclado con el articulado |
| MUN-025 | CONSIDERANDO con disposiciones operativas |
| MUN-028 | Bloques normativos fuera del articulado |
| MUN-032 | Artículos bis, ter y sucesivos repetidos o fuera de orden |
| MUN-050 | Perífrasis verbales de lista cerrada |
| MUN-052 | Sujetos imprecisos sin definición visible |
| MUN-064 | Plazos en `días` sin aclarar si son hábiles o corridos |
| MUN-065 | Fechas relativas ambiguas (`a la brevedad`, `el próximo mes`) |
| MUN-071 | Moneda y montos con formato inconsistente |
| MUN-089 | Varias modificaciones sin delimitación clara |
| MUN-090 | Modificaciones por operación matemática |
| MUN-119 | Remisiones a artículos inexistentes y otras inconsistencias internas objetivas |

## Tipos de instrumento

Ordenanzas, decretos del Concejo, resoluciones y comunicaciones (Ley Nº 10.027), más las categorías que agregue cada Reglamento Interno (MUN-003). La herramienta reconoce la denominación, pero no juzga si el instrumento elegido es el correcto (MUN-002).

## Capa local

Las reglas VERIFICAR LOCALMENTE de la sección 16 y la ficha local de la sección 21. No tienen equivalente provincial: en la provincia hay una sola Legislatura, y en los municipios cada Concejo tiene su propio reglamento.

## Nivel de confianza y OCR

Las secciones 6 y 24 piden que cada observación indique si su confianza es alta, media o baja, y que se extreme la prudencia con textos escaneados. El módulo provincial no lo exige.

## Reglas provinciales que no se trasladan

Se fundan en la Constitución provincial o en los reglamentos de las Cámaras, y no tienen base común municipal:

| Regla provincial | Motivo |
|---|---|
| `er-prov-001`, `er-prov-002`, `er-prov-003` (fórmula de sanción) | Cada municipio tiene la suya. Sólo con configuración local (MUN-027) |
| `er-prov-009` (inserción íntegra, art. 130) | Regla constitucional para las leyes provinciales |
| `er-prov-010` (cifra escrita sólo en números) | En lo municipal no se impone ese formato (MUN-069) |
| `er-prov-014` (pasiva refleja: «créese» por «créase») | Práctica provincial medida; en lo municipal no hay medición |
| `er-prov-015`, `er-prov-016` (artículo de cierre) | Depende de cada municipio. Sólo con configuración local (MUN-105) |
| `er-prov-018` (número de ley en el proyecto) | Propia de las leyes provinciales |
| `er-prov-030` (año en dos cifras) | No figura en este Manual |

---

# 16 ter. CRITERIO COMÚN DE AUTOMATIZACIÓN

La herramienta sólo avisa cuando está segura: cuando encuentra una palabra, frase o patrón concreto que siempre es un problema. Si para avisar tendría que adivinar lo que el texto quiere decir, no avisa y la regla queda como consejo para quien redacta.

Es el mismo criterio que usa el módulo provincial. Aplicado a las reglas en las que ambos módulos diferían:

| Regla | ¿Avisa? |
|---|---|
| MUN-022 Título mudo | Sólo si el título es uno de la lista cerrada |
| MUN-054 Definiciones | Sólo si un término definido nunca vuelve a usarse |
| MUN-046 Frases largas | No |
| MUN-033 Epígrafes | No |
| MUN-063 Listas abiertas o cerradas | No |
| MUN-079 Cadenas de remisiones | No |
| MUN-068 Mayúsculas | No |
| MUN-106 Publicación y registro como sinónimos | No |

---

# 17. REGLAS QUE NO DEBEN GENERAR HALLAZGOS AUTOMÁTICOS

Por requerir análisis jurídico, información externa o evaluación material:

- MUN-001;
- MUN-004;
- MUN-007;
- MUN-008;
- MUN-009;
- MUN-011;
- MUN-012;
- MUN-014;
- MUN-016;
- MUN-017;
- MUN-018;
- MUN-020;
- MUN-040;
- MUN-043;
- MUN-044;
- MUN-047;
- MUN-051;
- MUN-053;
- MUN-055;
- MUN-056;
- MUN-058;
- MUN-060;
- MUN-062;
- MUN-077;
- MUN-081;
- MUN-082;
- MUN-091;
- MUN-092;
- MUN-095;
- MUN-096;
- MUN-097;
- MUN-098;
- MUN-099;
- MUN-100;
- MUN-102;
- MUN-103;
- MUN-107;
- MUN-120.

Tampoco generan hallazgos, porque pasaron a revisión humana por el criterio común de la sección 16 ter:

- MUN-033;
- MUN-046;
- MUN-063;
- MUN-068;
- MUN-079;
- MUN-106.

MUN-002, MUN-019 y MUN-101 quedan en el Manual como orientación para quien redacta. No pasan al motor, ni siquiera como advertencia.

MUN-015 y MUN-030 no generan hallazgos propios: se evalúan dentro de MUN-029. MUN-088 tampoco: la coletilla genérica la detecta MUN-087. MUN-121 describe el recorrido completo del control y tampoco genera avisos.

---

# 18. MODELO DE OBSERVACIÓN DEL SITIO

Cada regla implementada debe devolver, como mínimo:

- `id`;
- `titulo`;
- `descripcion`;
- `sugerencia`;
- `fuente`;
- `autoridad`;
- `severidad`;
- `check(text)`;
- fragmentos o ubicaciones cuando existan.

## Ejemplo

**Título:** Numeración no correlativa de artículos  
**Problema:** Se detectó un salto en la secuencia del articulado.  
**Texto detectado:** `Artículo 4° ... Artículo 6° ...`  
**Recomendación:** Revisar si falta un artículo 5° o si corresponde renumerar alguno de los artículos. La herramienta no modifica la numeración porque no puede saber cuál de las dos situaciones ocurrió.  
**Autoridad:** SUBSIDIARIO  
**Fuente:** Manual Genérico de Técnica Legislativa Municipal de Entre Ríos, MUN-031.  
**Prioridad:** Media.

---

# 19. SEVERIDAD

La prioridad expresa cuánto conviene atender la observación dentro de una revisión formal. No equivale a validez o invalidez jurídica.

## Alta

Reservar para incumplimientos formales objetivos de una regla EXIGE que puedan afectar seriamente la identificación, inteligibilidad o funcionamiento formal del texto.

Igual que en el módulo provincial, sólo una regla EXIGE puede llegar a prioridad alta, y una regla SUBSIDIARIO nunca pasa de media. Como todas las reglas automatizables de este Manual son SUBSIDIARIO, ningún aviso municipal pasa de prioridad media.

Una observación no puede ser `alta` si para sostenerla es necesario resolver constitucionalidad, competencia o legalidad material.

## Media

Usar para:

- defectos estructurales relevantes;
- modificaciones imprecisas;
- referencias deficientes;
- inconsistencias que compliquen interpretación, cita o aplicación;
- apartamientos de recomendaciones técnicas fuertes.

## Baja

Usar para:

- ortotipografía;
- convenciones editoriales;
- preferencias estilísticas;
- uniformidad de presentación.

---

# 20. MODELO GENÉRICO SUBSIDIARIO DE PROYECTO DE ORDENANZA

Este modelo es únicamente orientativo y debe adaptarse a la práctica del municipio correspondiente.

```text
PROYECTO DE ORDENANZA

[TÍTULO INFORMATIVO]

VISTO:
[Antecedente, expediente o norma, si corresponde]

CONSIDERANDO:
[Fundamentos, si se utiliza esta arquitectura]

POR ELLO:

EL HONORABLE CONCEJO DELIBERANTE DE [MUNICIPIO]
SANCIONA LA SIGUIENTE ORDENANZA:

ARTÍCULO 1°.- Objeto. [Regla de objeto, cuando corresponda].

ARTÍCULO 2°.- Ámbito de aplicación. [Cuando corresponda].

ARTÍCULO 3°.- [Contenido normativo].

ARTÍCULO 4°.- [Contenido normativo].

ARTÍCULO X°.- [Modificaciones o derogaciones expresas, si corresponden].

ARTÍCULO X°.- Vigencia. La presente ordenanza entrará en vigencia [fecha, plazo o condición].

ARTÍCULO X°.- [Fórmula final según práctica local].
```

La herramienta no debe exigir automáticamente VISTO, CONSIDERANDO, artículo de objeto, ámbito de aplicación o fórmula final exacta si no existe una regla local configurada.

---

# 21. FICHA LOCAL PARA UNA FUTURA AMPLIACIÓN DEL SITIO

Para habilitar controles específicos de un municipio deberán documentarse previamente:

1. municipio;
2. Reglamento Interno vigente;
3. tipos de proyectos admitidos;
4. fórmula de sanción;
5. formato de artículos;
6. ordinales y separadores;
7. numeración de ordenanzas;
8. tratamiento de VISTO y CONSIDERANDO;
9. fundamentos;
10. requisitos de presentación;
11. apoyos o firmas;
12. comisiones;
13. archivo o caducidad;
14. reconsideración;
15. boletín o gaceta;
16. digesto;
17. firma digital;
18. expediente electrónico;
19. fórmula final;
20. cualquier otra regla formal local con fuente verificable.

Hasta que exista esa ficha, el sitio debe limitarse al núcleo común y a recomendaciones subsidiarias claramente identificadas.

---

# 22. REGLAS DE REDACCIÓN DE LAS RECOMENDACIONES

Las observaciones del sistema deben describir lo que realmente puede comprobarse.

## Usar

- `No se detectó...`
- `Se encontró...`
- `La numeración presenta...`
- `Conviene revisar...`
- `Se recomienda...`
- `Verificar si...`
- `Este patrón puede dificultar...`
- `La práctica local puede exigir...`

## Evitar

- `La norma es inválida.`
- `La ordenanza es inconstitucional.`
- `El municipio carece de competencia.`
- `El Concejo no puede aprobar esto.`
- `Este gasto no tiene financiamiento suficiente.`
- `La sanción es desproporcionada.`
- `La política pública es inconveniente.`
- `La norma contradice otra ordenanza.` cuando la otra norma no forma parte del análisis.

---

# 23. REGLA DE NO FALSO POSITIVO

Ante duda razonable, la herramienta debe preferir:

1. no emitir un hallazgo; o
2. emitir una recomendación de revisión con nivel de confianza explícito.

No debe transformar una preferencia estilística en incumplimiento obligatorio.

No debe generalizar una práctica local.

No debe inferir datos que no aparecen en el documento.

No debe completar cifras, fechas, nombres de organismos, artículos o normas faltantes.

---

# 24. CONTROL DE DOCUMENTOS EXTRAÍDOS POR OCR

Cuando el archivo provenga de imagen o PDF escaneado:

- considerar posibles errores en acentos, signos ordinales, mayúsculas y separación de palabras;
- no emitir hallazgos severos basados únicamente en diferencias ortográficas dudosas;
- evitar interpretar un salto de línea perdido como defecto del proyecto;
- marcar como baja confianza los casos sensibles a OCR;
- distinguir texto citado de encabezados de artículos cuando sea posible.

---

# 25. RESULTADO ESPERADO DEL REVISOR

El informe municipal debe responder exclusivamente:

**¿Qué aspectos formales del proyecto conviene revisar según las reglas de técnica legislativa aplicables o subsidiarias?**

No debe responder:

**¿Es válida, constitucional, conveniente o jurídicamente correcta la decisión normativa?**

El usuario conserva siempre la decisión sobre:

- si corrige;
- cómo corrige;
- qué redacción adopta;
- si necesita revisión jurídica humana adicional.

---

# 26. SÍNTESIS OPERATIVA

El módulo municipal debe construirse en cuatro capas:

1. **Núcleo común automatizable:** patrones formales verificables sólo con el texto.
2. **Heurísticas:** indicios que generan recomendaciones prudentes, no conclusiones categóricas.
3. **Reglas locales:** sólo se activan si existe configuración documental específica del municipio.
4. **Exclusiones:** competencia, constitucionalidad, legalidad material, procedimiento real y cualquier cuestión que requiera información externa.

El Manual funciona como fuente metodológica y documental. El motor automático sólo debe implementar las reglas compatibles con esa arquitectura.

---

# 27. FUENTES BASE

Para la construcción y futura actualización del módulo deben priorizarse:

1. Constitución de la Provincia de Entre Ríos, régimen municipal.
2. Ley Orgánica de Municipios Nº 10.027 y sus modificaciones vigentes.
3. Normas provinciales específicamente aplicables a actos municipales.
4. Reglamentos Internos y normativa formal de cada Concejo Deliberante, cuando se implemente configuración local.
5. Práctica municipal documentada, siempre identificada como tal.
6. Manual de Técnica Legislativa publicado por InfoLEG, únicamente como criterio subsidiario cuando no exista regla municipal o provincial específica.
7. Doctrina especializada, con el mismo carácter subsidiario.

---

# 28. ADVERTENCIA FINAL

Este Manual no crea obligaciones jurídicas nuevas ni sustituye las fuentes normativas vigentes.

Su finalidad es ordenar criterios de técnica legislativa y delimitar cuáles pueden alimentar un revisor automático que **detecta, explica y recomienda**, pero **no modifica el proyecto ni juzga su contenido, constitucionalidad o conveniencia**.
