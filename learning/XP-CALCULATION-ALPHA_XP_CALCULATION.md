# XP Calculation (rama `alpha_xp_calculation`)

## Objetivo
Implementar un cálculo de XP basado en:
- Diferencia de marcador (`userScore - opponentScore`)
- Modo de juego (`LOCAL` vs `AI`)
- Dificultad de IA (`EASY`, `MID`, `HARD`)
- Sin penalización negativa por derrota

También se buscó mantener `xp` como entero en base de datos, evitando `float` en Prisma.

## Regla funcional
Base:
- `scoreDiff = max(userScore - opponentScore, 0)`

Multiplicadores deseados:
- `LOCAL` (Friend PvP): `1.0`
- `AI HARD`: `0.8`
- `AI MID`: `0.5`
- `AI EASY`: `0.2`

Cálculo visible (XP real):
- `xpVisible = scoreDiff * multiplier`

## Diseño técnico elegido (Int con escala)
Para no perder decimales y no cambiar el esquema `Int` de `profile.xp`, se usa escala interna:
- `XP_SCALE = 10`
- Se guarda en DB `xpUnits` (entero)
- Conversión: `xpVisible = xpUnits / XP_SCALE`

Mapeo de multiplicadores a unidades:
- `LOCAL`: `10`
- `AI HARD`: `8`
- `AI MID`: `5`
- `AI EASY`: `2`

Fórmula interna final:
- `xpUnitsGained = max(userScore - opponentScore, 0) * multiplierUnits`

## Ejemplos
Con `winPoints = 5`:
- Victoria `5:0` en `LOCAL`: `5 * 10 = 50` units -> `5.0 XP`
- Victoria `5:0` en `AI HARD`: `5 * 8 = 40` units -> `4.0 XP`
- Victoria `5:0` en `AI MID`: `5 * 5 = 25` units -> `2.5 XP`
- Victoria `5:0` en `AI EASY`: `5 * 2 = 10` units -> `1.0 XP`
- Victoria `5:4` en `AI HARD`: `1 * 8 = 8` units -> `0.8 XP`
- Derrota `4:5`: `max(4-5, 0) = 0` -> `0 XP`

## Qué se cambió y dónde
Los cambios están en la rama `alpha_xp_calculation` (commit `229f383`).

### 1) Servicio de XP
Archivo: `server/src/services/xp.ts`

Se añadió:
- `XP_SCALE = 10`
- Multiplicadores en unidades
- `calculateXp(...)` usando `playMode` y `aiLevel`
- `displayXpFromUnits(...)` para convertir units a XP visible

### 2) Cierre de partida y nivel
Archivo: `server/src/routes/matches.ts`

Se modificó:
- Llamada a `calculateXp` pasando también `match.playMode` y `match.aiLevel`
- Cálculo de nivel con umbrales en units (`threshold * XP_SCALE`)
- Respuesta del endpoint de cierre devolviendo `profile.xp` en valor visible (`/10`)

### 3) Respuestas de perfil
Archivo: `server/src/routes/profile.ts`

Se actualizó para devolver `xp` visible (`/10`) en:
- `GET /api/v1/profile/me`
- `PATCH /api/v1/profile/upload`
- `PATCH /api/v1/profile/me`

## Compatibilidad y trade-offs
Ventajas:
- Sin migración de `Int` a `Float`
- Sin errores de precisión binaria de `float`
- Se respetan valores fraccionales esperados (`0.8`, `2.5`, etc.)

Trade-off:
- El valor persistido en DB ya no es XP visible, sino units internas.
- Cualquier endpoint nuevo que exponga XP debe convertir `units -> visible`.

## Checklist para futuros cambios
Si se toca XP, revisar:
- `server/src/services/xp.ts`
- `server/src/routes/matches.ts`
- `server/src/routes/profile.ts`
- Cualquier endpoint que serialice `profile.xp`

Si en el futuro se decide mostrar siempre entero en UI:
- Mantener units en DB
- Redondear/formatear solo en frontend
