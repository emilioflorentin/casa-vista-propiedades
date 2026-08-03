## Métricas para quien publica (Nazarí Homes + Roomie Finder)

Panel de estadísticas para el propietario/anunciante: cuántas veces se ha visto su anuncio, cuánta gente lo ha guardado en favoritos, y en Roomie Finder también los likes y matches.

### Qué verá el usuario

**Nazarí Homes — en /account, pestaña "Estadísticas"**
- Tarjeta por cada propiedad publicada con:
  - Visitas totales al detalle del anuncio
  - Visitantes únicos (aproximado, por dispositivo)
  - Veces guardado en favoritos (y guardados activos actuales)
  - Visitas de los últimos 7 y 30 días
- Gráfica simple de visitas por día (últimos 30 días)
- Totales agregados arriba: visitas totales de todos sus anuncios y guardados totales

**Roomie Finder — en /roomie-finder/matches (nueva pestaña "Estadísticas") **
- Por cada anuncio de habitación: visitas al detalle, veces mostrado en el swipe, likes recibidos, matches y ratio de like
- Misma gráfica de visitas por día

### Privacidad
Se muestran números agregados, nunca quién concretamente ha visto o guardado un anuncio (salvo lo que ya existe hoy: los perfiles que dan like en Roomie Finder, que ya se ven en la pantalla de matches).

### Notas técnicas

Base de datos (nuevas tablas con RLS y GRANTs):
- `listing_events` — tabla única de eventos: `entity_type` ('property' | 'roomie_listing'), `entity_id`, `owner_id`, `event_type` ('view' | 'impression' | 'favorite_add' | 'favorite_remove'), `visitor_hash` (hash anónimo ya usado por `src/utils/userIdentification.ts`), `created_at`.
  - Inserción permitida a `anon` y `authenticated` (solo INSERT, sin lectura directa).
  - Lectura solo por el dueño, a través de funciones agregadas.
- Funciones security definer:
  - `get_listing_stats(p_entity_type, p_owner)` — devuelve totales por anuncio (vistas, únicos, guardados, likes, matches).
  - `get_listing_daily_views(p_entity_type, p_entity_id, p_days)` — serie diaria para la gráfica; valida que el llamante sea el dueño.
- Índices por `(entity_type, entity_id, created_at)` y `(owner_id)`.

Instrumentación en el frontend:
- `src/pages/PropertyDetail.tsx` y `src/pages/RoomieListingDetail.tsx`: registrar un evento `view` al montar, con anti-duplicado por sesión (una vista por anuncio cada 30 min usando sessionStorage).
- `src/contexts/FavoritesContext.tsx`: los favoritos son locales (cookies); al alternar un favorito se enviará además un evento `favorite_add` / `favorite_remove` para poder contarlos. Solo se registra si el usuario ha aceptado cookies, como ahora.
- `src/components/roomie/RoomieSwipeDeck.tsx`: registrar `impression` cuando una tarjeta se muestra en la pila.
- Nuevo helper `src/utils/analyticsEvents.ts` con la función de registro (fire-and-forget, sin bloquear la UI).

Interfaz:
- Nuevo componente `src/components/stats/ListingStatsPanel.tsx` reutilizable por ambas secciones, con los estilos de cada una (Nazarí Homes en tonos stone/amber, Roomie Finder con su paleta azul/dorado).
- Gráfica con `recharts` (ya disponible en el proyecto vía shadcn chart).

Datos previos: las métricas empiezan a contar desde el despliegue; no hay histórico anterior.
