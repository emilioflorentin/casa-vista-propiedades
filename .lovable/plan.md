## Roomie Finder

Nueva sección para encontrar compañeros de piso, con anuncios de habitación y un sistema de swipe con match mutuo. Contacto por WhatsApp solo cuando hay match.

### Cómo funciona

1. **Anunciante** (tiene piso y una habitación libre): crea el anuncio desde su cuenta.
2. **Buscador**: crea un perfil de roomie (quién es, horarios, hábitos).
3. **Swipe**: el buscador pasa tarjetas de anuncios; el anunciante ve los perfiles a los que ha gustado su anuncio y decide.
4. **Match**: si ambos dan like, se desbloquea el botón de WhatsApp.

Los anuncios se pueden **ver sin cuenta** (listado + detalle). Para publicar, dar like o hacer match hace falta iniciar sesión.

### Campos del anuncio (obligatorios salvo indicado)

**Vivienda**
- Título, dirección/zona, municipio, provincia
- Tipo de vivienda, habitaciones totales, baños, m² totales
- Fotos de la vivienda completa (mínimo 3)

**Habitación libre**
- m² de la habitación, si tiene baño privado, amueblada, ventana exterior
- Fotos de la habitación (mínimo 2)
- Fecha de disponibilidad

**Gastos** (obligatorio, tal como pediste)
- Alquiler mensual de la habitación
- Fianza
- Gastos incluidos o no: agua, luz, gas, internet, comunidad
- Importe estimado de gastos mensuales si no van incluidos

**Convivencia — quién vive en la vivienda**
- Número de convivientes actuales, rango de edad, mezcla de géneros
- Ocupación de los convivientes: trabajan / estudian / ambos
- Horarios predominantes: mañana, tarde, noche, turnos
- Nivel de socialización: muy sociable / equilibrado / tranquilo y reservado
- Fumadores sí/no, mascotas sí/no, se admiten mascotas sí/no
- Limpieza: relajada / normal / muy ordenada
- Se admiten visitas/parejas: sí / puntualmente / no
- Idiomas hablados en casa
- Descripción libre del ambiente de la casa

**Preferencias del compañero buscado** (opcional pero recomendado)
- Rango de edad, género preferido (o indiferente), estudiante/trabajador, fumador sí/no, mascotas sí/no, estancia mínima

### Perfil del buscador

Mismo esquema de convivencia para que el match tenga sentido: nombre, edad, género, ocupación (trabaja/estudia), horarios, socialización, fumador, mascotas, limpieza, idiomas, presupuesto máximo, zona deseada, fecha de entrada, bio corta y foto. Teléfono para el WhatsApp tras el match.

### Pantallas

- `/roomie-finder` — Descubrir: pila de tarjetas con swipe (foto habitación, precio, gastos, zona, badges de convivencia). Botones descartar / me gusta. Vista alternativa en cuadrícula con filtros de precio, zona, gastos incluidos, fumadores y mascotas.
- `/roomie-finder/:id` — Detalle del anuncio: galería vivienda + galería habitación, desglose de gastos, ficha de convivencia, preferencias.
- `/roomie-finder/publicar` — Formulario del anuncio por pasos (Vivienda → Habitación → Gastos → Convivencia → Preferencias → Fotos), con validación de mínimos de fotos.
- `/roomie-finder/mi-perfil` — Perfil de buscador.
- `/roomie-finder/matches` — Likes recibidos (para el anunciante, con aceptar/descartar) y matches confirmados con botón de WhatsApp.
- Enlace en el Header y en el Footer.

### Notas técnicas

- **Base de datos** (Supabase, nuevas tablas con RLS y GRANTs):
  - `roomie_listings` — anuncio: vivienda, habitación, gastos (columnas numéricas + booleanos de incluidos), convivencia, preferencias, arrays de URLs de fotos, `user_id`, `is_active`. Lectura pública de anuncios activos; escritura solo del dueño.
  - `roomie_profiles` — perfil de buscador, 1 por usuario. Lectura solo por el propio usuario y por dueños de anuncios que hayan recibido su like (mediante función security definer, para no exponer teléfonos).
  - `roomie_likes` — quién da like a qué (`listing_id`, `user_id`, `direction`: buscador→anuncio o anunciante→buscador). Único por par.
  - `roomie_matches` — creado por trigger cuando existen los dos likes; desbloquea el contacto.
  - Los teléfonos solo se devuelven vía función security definer que comprueba que exista match.
- **Fotos**: nuevo bucket público `roomie-images`, con la misma compresión cliente ya usada en el proyecto (1920px, JPEG 82%).
- **Swipe**: gestos táctiles con `framer-motion` (drag + umbral) y botones para escritorio.
- **WhatsApp**: mismo patrón que incidencias (`api.whatsapp.com/send`, prefijo +34 automático) con mensaje prerrellenado referenciando el anuncio.
- **SEO**: título y meta propios en la sección, listado indexable.

### Fuera de alcance en esta primera versión

Chat interno, notificaciones por email/push, verificación de identidad y pagos.
