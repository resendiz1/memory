# Memoria de colores

Juego de memoria tipo Simon Says, hecho con HTML, CSS y JavaScript vanilla. La interfaz usa el estilo de consola de instrumentos de JuanPancho's: oro sobre grafito, tipografías Archivo y JetBrains Mono alojadas localmente y lámparas luminosas.

## Ejecutar

Abre `index.html` en un navegador moderno. No necesita instalación, servidor ni conexión a internet.

## Características

- Cuatro botones de colores con luces y tonos generados mediante Web Audio API.
- Tres dificultades: fácil, normal y difícil.
- Secuencias progresivas y puntuación.
- Récord, partidas jugadas y mejor ronda guardados en `localStorage`.
- Control para activar/desactivar sonido.
- Diseño adaptable a móviles y escritorio, con movimiento reducido cuando el sistema lo pide.
- Pie de contacto con WhatsApp, teléfonos, Instagram y Facebook de JuanPancho's, y botón flotante de WhatsApp.

## Archivos

- `index.html`: estructura de la aplicación.
- `css/styles.css`: estilos y diseño responsive.
- `js/game.js`: lógica de juego.
- `js/audio.js`: sonidos sintetizados.
- `js/storage.js`: persistencia local.
- `assets/favicon.svg`: icono.
- `assets/fonts/`: fuentes Archivo y JetBrains Mono autoalojadas (con sus licencias OFL).
- Pie de página: contacto de JuanPancho's (WhatsApp 238 150 1369, 238 127 1940 y 221 195 9921; teléfonos 238 150 1369 y 221 195 9921; Instagram `@juanpanchos_tehuacan` y Facebook "JuanPancho's").

Los datos se guardan en el navegador y dispositivo donde se juega. Borrar los datos del sitio también borra las estadísticas.

## Desarrollo

No hay dependencias que instalar. Con Node.js disponible:

- `npm test`: ejecuta las pruebas de persistencia.
- `npm run lint`: comprueba la sintaxis de los archivos JavaScript.
