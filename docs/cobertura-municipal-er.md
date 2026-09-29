# Mapa de cobertura — reglas municipales de Entre Ríos

Este archivo lista las reglas del **Manual de Técnica Legislativa Municipal de
Entre Ríos** (`docs/fuentes/municipal-er/MANUAL_TECNICA_LEGISLATIVA_MUNICIPAL_ER.md`)
que el Manual habilita para el motor, y dice con qué regla automática se
verifica cada una.

Estado posible:

- **CUBIERTA** — hay una regla automática que la detecta (se indica cuál).
- **CUBIERTA POR OTRA** — no tiene regla propia porque otra ya la detecta.
- **NO IMPLEMENTADA** — el Manual la admite, pero no hay un patrón seguro que buscar.

Todas las reglas municipales son **SUBSIDIARIO**: ninguna pasa de prioridad
media (Manual, sección 19). Reparto: 29 de prioridad media y 24 baja.

---

## Automatizables (Manual, sección 15.1)

| Regla del Manual | Estado |
|---|---|
| MUN-013 Falta la cláusula de vigencia | **CUBIERTA** (er-mun-019). Sólo en documentos que se presentan como ordenanza |
| MUN-022 Título vacío (lista cerrada) | **CUBIERTA** (er-mun-008) |
| MUN-026 Fundamentos intercalados | **CUBIERTA** (er-mun-001) |
| MUN-031 Numeración de artículos | **CUBIERTA** (er-mun-011 secuencia, er-mun-013 grafía, er-mun-014 separador) |
| MUN-032 Artículos bis y ter | **CUBIERTA** (er-mun-012) |
| MUN-034 Jerarquía de divisiones | **CUBIERTA** (er-mun-015) |
| MUN-035 Denominación de divisiones | **NO IMPLEMENTADA** — al extraer un PDF se pierden los saltos de línea, y sin ellos no se distingue el nombre del capítulo del texto que sigue |
| MUN-036 Incisos | **CUBIERTA** (er-mun-016) — salto o repetición de letras |
| MUN-037 Viñetas y guiones | **CUBIERTA** (er-mun-017) |
| MUN-039 Anexo sin mención | **CUBIERTA** (er-mun-003) |
| MUN-049 Futuro dominante | **CUBIERTA** (er-mun-036) |
| MUN-057 Extranjerismos | **CUBIERTA** (er-mun-044) |
| MUN-059 Doble negación | **CUBIERTA** (er-mun-038) |
| MUN-061 "y/o" | **CUBIERTA** (er-mun-037) |
| MUN-064 Días sin hábiles o corridos | **CUBIERTA** (er-mun-042). No se marca si un artículo general fija cómo se computan los plazos |
| MUN-065 Fechas relativas | **CUBIERTA** (er-mun-043) |
| MUN-066 Abreviaturas | **CUBIERTA** (er-mun-051) — sólo en el articulado |
| MUN-067 Sigla sin explicar | **CUBIERTA** (er-mun-045) |
| MUN-069 Letras y número no coinciden | **CUBIERTA** (er-mun-047) |
| MUN-070 Porcentajes | **CUBIERTA** (er-mun-048) |
| MUN-071 Moneda | **CUBIERTA** (er-mun-049) |
| MUN-072 Unidades de medida | **CUBIERTA** (er-mun-050) |
| MUN-074 Comillas | **CUBIERTA** (er-mun-022 sustitución sin comillas, er-mun-053 mezcla de comillas) |
| MUN-075 Citas de normas | **CUBIERTA** (er-mun-033) — sólo alternancia dentro del documento |
| MUN-076 Citas de artículos | **CUBIERTA** (er-mun-034) |
| MUN-078 Referencias por posición | **CUBIERTA** (er-mun-030) |
| MUN-083 Modificación sin texto | **CUBIERTA** (er-mun-021) |
| MUN-084 Sustitución textual | **CUBIERTA POR OTRA** (er-mun-021 y er-mun-022) |
| MUN-085 Incorporación sin ubicación | **CUBIERTA** (er-mun-023) |
| MUN-086 Derogación sin número | **CUBIERTA** (er-mun-027) |
| MUN-087 Derogación genérica | **CUBIERTA** (er-mun-026) — también la coletilla que acompaña a una derogación expresa |
| MUN-088 Coletilla genérica | **CUBIERTA POR OTRA** (er-mun-026) |
| MUN-089 Modificaciones múltiples | **CUBIERTA** (er-mun-024) |
| MUN-090 Modificación por cuenta | **CUBIERTA** (er-mun-025) |
| MUN-093 Prórroga | **CUBIERTA** (er-mun-028) |
| MUN-104 Vigencia imprecisa | **CUBIERTA** (er-mun-020) |
| MUN-119 Inconsistencias internas | **CUBIERTA** parcialmente (er-mun-031 artículo inexistente, er-mun-046 sigla con dos desarrollos). Fechas contradictorias y denominaciones divergentes de una norma no tienen un patrón seguro |

## Heurísticas (Manual, sección 15.2)

| Regla del Manual | Estado |
|---|---|
| MUN-005 Iniciativa popular | **CUBIERTA** (er-mun-007) |
| MUN-021 Tipo de instrumento | **CUBIERTA** (er-mun-006) — sólo su ausencia, nunca si el tipo es correcto |
| MUN-024 VISTO con mandatos | **CUBIERTA** (er-mun-004) |
| MUN-025 CONSIDERANDO con mandatos | **CUBIERTA** (er-mun-005) |
| MUN-028 Bloques normativos fuera del articulado | **NO IMPLEMENTADA** — fuera del VISTO y el CONSIDERANDO (ya cubiertos) no hay un lugar reconocible donde buscar |
| MUN-029 Unidad del artículo | **CUBIERTA** (er-mun-010), que absorbe MUN-015 y MUN-030 |
| MUN-038 Anexo intercalado | **CUBIERTA** (er-mun-002). No marca un anexo con articulado propio desde el artículo 1 |
| MUN-041 Secuencia de las disposiciones | **CUBIERTA POR OTRA** (er-mun-018) — la única anomalía evidente que el Manual menciona son las transitorias |
| MUN-042 Artículo de objeto | **CUBIERTA** (er-mun-009) — sólo ordenanzas de ocho artículos o más |
| MUN-045 Transitorias al final | **CUBIERTA** (er-mun-018) |
| MUN-048 Artículos que explican | **CUBIERTA** (er-mun-035) |
| MUN-050 Perífrasis | **CUBIERTA** (er-mun-039) — lista cerrada |
| MUN-052 Sujetos imprecisos | **CUBIERTA** (er-mun-040) |
| MUN-054 Definiciones | **CUBIERTA** (er-mun-041) — término definido que no vuelve a usarse |
| MUN-073 Puntuación | **CUBIERTA** (er-mun-052) — signos repetidos |
| MUN-080 Referencias externas | **CUBIERTA** (er-mun-032) — remisión a "la normativa vigente" |
| MUN-094 Suspensión | **CUBIERTA** (er-mun-029) |

## Lo que la herramienta no revisa

- **Reglas locales** (MUN-003, 006, 010, 027, 105, 108): fórmula de sanción,
  artículo de cierre, firmas y requisitos de presentación dependen de cada
  Concejo. Se activarán cuando exista la ficha local de un municipio.
- **Revisión humana** (sección 17 del Manual): competencia, trámite,
  mayorías, presupuesto, contenido material y las reglas que obligarían a
  adivinar (MUN-033, 046, 063, 068, 079, 106).
- **Nivel de confianza** (secciones 6 y 24 del Manual): el motor todavía no
  tiene un campo para indicar confianza alta, media o baja en cada aviso.

## Cómo se probó

- `docs/ejemplo-de-prueba-municipal-er.txt`: proyecto con errores a propósito.
  Produce 35 avisos.
- `docs/ejemplo-limpio-municipal-er.txt`: ordenanza bien redactada. Produce
  0 avisos: sirve para detectar falsos positivos cuando se toque una regla.
