# Plan de vídeo promocional para Roomie Finder

## Situación actual de Roomie Finder

La funcionalidad ya está implementada en producción:

- **Hero introductorio** con animaciones de scroll, explicación de 4 pasos y diferenciales (gastos claros, privacidad, compatibilidad).
- **Swipe tipo Tinder** para descubrir habitaciones: deslizar a derecha (me gusta) o izquierda (paso).
- **Listado tradicional** con filtros por zona, precio máximo, gastos incluidos, mascotas y sin fumadores.
- **Perfil de convivencia** obligatorio con horarios, nivel de socialización, limpieza, mascotas, fumadores.
- **Match mutuo**: el contacto por WhatsApp solo se abre cuando ambas partes aceptan.
- **Publicación por pasos**: fotos obligatorias de la vivienda completa y de la habitación libre, gastos detallados.
- **Métricas de monitorización**: vistas, impresiones, guardados y likes para los anunciantes.
- **App nativa preparada**: Capacitor configurado para Android, con deep links y redirección automática a `/roomie-finder`.

## Propuesta creativa para el vídeo de redes sociales

### Narrativa (60-90 segundos)

1. **Hook (0-5 s)**: ¿Buscando compañero de piso? Que no te la cuelen con gastos ocultos.
2. **Problema (5-15 s)**: Grupos de WhatsApp saturados, anuncios sin fotos reales y compañeros incompatibles.
3. **Solución (15-45 s)**: Roomie Finder by Nazarí Homes — desliza, compara, haz match. Fotos de la vivienda y de la habitación, gastos claros, perfil de convivencia real.
4. **Cómo funciona (45-65 s)**: Publicar habitación → crear perfil → deslizar → match → contacto seguro por WhatsApp.
5. **CTA (65-75 s)**: Entra en nazarihomes.com/roomie-finder y encuentra tu compañero ideal.

### Tonos y estilo visual

- **Estética**: joven, limpio, confiable, con la paleta de Roomie Finder (azul marino/dorado del logo + neutros de piedra).
- **Formatos de salida**: vertical 9:16 para Reels/TikTok/Shorts y cuadrado 1:1 para feed.
- **Música**: ritmo moderno, ligero, con energía pero no agresiva.
- **Elementos visuales**: tarjetas de swipe animadas, fotos de habitaciones, íconos de check (gastos claros), burbuja de WhatsApp con censura antes del match.

## IA recomendada para cada fase del proceso

### 1. Guion y estructura del vídeo

- **Opción A (recomendada para ti)**: ChatGPT / Claude.
  - Le pasas el resumen de la app y el tono deseado; genera guiones de 60, 30 y 15 segundos.
- **Opción B**: Google Gemini, especialmente si ya usas Google Workspace.
- **Opción C**: Jasper o Copy.ai para variantes de copy para anuncios pagados.

### 2. Generación de imagen o mockup visual

- **Opción A (logotipo ya existe)**: Midjourney / DALL-E 3 / Ideogram.
  - Usarlos para generar fondos de habitaciones estilizadas, ilustraciones de compañeros o tarjetas de swipe ficticias.
  - **Consejo**: no generes el logo de Roomie Finder; usa el asset real (`src/assets/roomie-finder-logo.webp`) para mantener consistencia de marca.
- **Opción B**: Canva con IA integrada (Magic Studio) si quieres algo más sencillo y editable.

### 3. Edición / producción del vídeo en movimiento

- **Opción A (máximo control y calidad, yo lo puedo hacer)**: Remotion (React + TypeScript) dentro del propio proyecto.
  - Ventaja: tarjetas de swipe reales, integración exacta con el logo de marca, animaciones sincronizadas con la música, exportación a 9:16 y 1:1.
- **Opción B (rápido y sin código)**: CapCut, Adobe Premiere + AI (Adobe Firefly), Runway ML, HeyGen, InVideo AI o Synthesia.
- **Opción C (híbrido)**: Crear clips animados con Remotion y luego montar en CapCut o Premiere con música y voiceover.

### 4. Voiceover y música

- **Voiceover**: ElevenLabs, Murf.ai o Play.ht para voz en español neutro o joven.
- **Música**: Uppbeat, Artlist, Epidemic Sound o generadores de música con IA (Soundraw, AIVA) si quieres evitar royalties.

### 5. Subtítulos automáticos

- **Opción**: Descript, CapCut auto-captions, o generar SRT con Whisper (OpenAI) y luego quemar los subtítulos en Remotion.

## Qué le puedes pedir a una IA externa para que te haga el vídeo

Le entregas este brief resumido:

> "Necesito un vídeo vertical de 60-90 segundos para promocionar una app llamada Roomie Finder by Nazarí Homes. Es un buscador de compañeros de piso estilo Tinder: los usuarios publican habitaciones con fotos de la vivienda y de la habitación, gastos detallados y un perfil de convivencia; quien busca habitación desliza tarjetas, y solo cuando hay match mutuo se comparte el contacto por WhatsApp. El tono es joven, limpio y confiable. Incluye el logo de Roomie Finder, animaciones de tarjetas de swipe, iconos de privacidad, y un CTA final: entra en nazarihomes.com/roomie-finder. Genera el guion, la estructura de escenas, y sugiere música y estilo visual."

## Alternativa: yo puedo generar el vídeo directamente

Dentro del proyecto ya está todo el código necesario para crear un vídeo profesional con Remotion (React + TypeScript). Si quieres, puedo:

1. Generar las imágenes/ilustraciones de apoyo con IA.
2. Crear un componente `RoomiePromoVideo.tsx` bajo `remotion/` con la animación de swipe, logo y texto.
3. Renderizar el MP4 final en 9:16 y 1:1.
4. Entregarte el archivo listo para subir a Reels, TikTok y Shorts.

## Próximos pasos

1. Decidir si prefieres:
   - **a)** Que una IA externa te prepare el guion y tú edites en Canva/CapCut.
   - **b)** Que una IA externa genere el vídeo completo con prompts.
   - **c)** Que yo genere el vídeo directamente con Remotion usando el diseño de marca real.
2. Confirmar el formato principal: 9:16 (vertical) o 1:1 (feed) o ambos.
3. Confirmar duración objetivo: 60-90 s, 30 s o 15 s.
4. Elegir si se usa voiceover, solo texto animado o música con texto.
