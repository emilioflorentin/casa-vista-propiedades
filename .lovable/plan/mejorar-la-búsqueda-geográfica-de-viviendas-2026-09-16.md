# Mejorar la búsqueda geográfica de viviendas

## Objetivo
Hacer que una calle, barrio o punto marcado en el mapa conserve sus coordenadas y radio, y encuentre viviendas cercanas aunque el texto de la dirección no coincida exactamente.

## Cambios
- La ventana «¿Dónde buscas?» devolverá dirección, latitud, longitud y radio; escribir una dirección también obligará a elegir una sugerencia válida antes de buscar por distancia.
- La navegación conservará esos datos hasta la página de resultados.
- Las viviendas guardarán coordenadas junto a su dirección. Al publicar o editar, la dirección se convertirá en una ubicación verificable.
- Las viviendas existentes recibirán coordenadas a partir de sus direcciones actuales; las direcciones genéricas usarán el centro de su municipio como aproximación.
- La página de resultados calculará la distancia real y aplicará el radio seleccionado, sin depender de coincidencias literales como «calle X» frente a «Granada».
- La búsqueda por referencia seguirá funcionando como búsqueda de texto independiente.

## Experiencia
- Sugerencias más claras, mostrando calle, barrio, municipio y provincia.
- Radio seleccionable también al elegir una sugerencia o usar la ubicación actual.
- Indicador visible del radio aplicado y opción para quitarlo.
- Mensaje útil cuando una vivienda no tiene ubicación suficientemente precisa, sin bloquear el resto de resultados.

## Verificación
- Probar selección de calle, punto en mapa y ubicación actual.
- Confirmar radios de 500 m, 1 km, 2 km, 5 km y 10 km.
- Comprobar en móvil que la ventana bloquea el fondo y que los resultados mantienen la operación Comprar/Alquilar.
