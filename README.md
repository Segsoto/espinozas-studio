# Espinoza’s Hair & Makeup Studio

Sitio estático para Espinoza’s Hair & Makeup, en Alajuela, Costa Rica. Implementado exclusivamente con HTML, CSS y JavaScript, sin frameworks, dependencias de ejecución ni compilación.

## Desarrollo local

Serví esta carpeta con cualquier servidor HTTP estático. Por ejemplo, con Python instalado:

```sh
python -m http.server 8080
```

Abrí `http://localhost:8080`. La navegación, los servicios desplegables y los enlaces funcionan con HTML nativo; JavaScript controla el menú móvil, el año y el zoom de las imágenes.

## Archivos

- `index.html`: contenido, metadatos, datos estructurados y símbolos SVG de redes.
- `styles.css`: tokens de color, tipografía, espaciado, composición y adaptaciones responsivas.
- `script.js`: navegación móvil accesible y zoom progresivo con `requestAnimationFrame` e `IntersectionObserver`.
- `assets/`: imágenes WebP, logo original de Instagram, fuentes WOFF2 locales y licencias.
- `SOURCES.md`: fuentes de información, créditos de imágenes y límites de verificación.
- `vercel.json`: publicación estática sin instalación ni build.

## Contenido y mantenimiento

El teléfono publicado es **+506 8703-0236**. Las consultas de cita abren WhatsApp con un texto prellenado; la web no envía mensajes ni confirma reservas automáticamente. El enlace de Waze busca el nombre comercial; no representa un pin geográfico verificado.

No se publican precios, horarios exactos, testimonios ni credenciales. Los días de atención se tomaron de una publicación oficial. Confirmar periódicamente esta información con el negocio.

Las fotografías de portada y servicios son editoriales de referencia y están identificadas como tales. Las tres publicaciones de la sección Instagram proceden del perfil oficial. No se emplean imágenes generadas. El logo se conserva como el archivo original descargado del avatar oficial, a 150 × 150 px, mostrado a 40–48 px para mantener nitidez y proporciones.

## Accesibilidad y rendimiento

- HTML semántico, enlace de salto, foco visible y controles nativos `details`/`summary`.
- Menú móvil con `aria-expanded`, cierre con Escape y al cambiar a escritorio.
- Desplazamiento natural; zoom limitado al 7,5 %, sin bibliotecas de animación.
- La preferencia `prefers-reduced-motion` desactiva el zoom y las transiciones, también si cambia durante la visita.
- Fuentes locales con `font-display: swap`, imágenes responsivas y carga diferida fuera de la portada.
- Se publican solo los canales sociales cuya identidad pudo comprobarse.

## Publicación

Repositorio: [Segsoto/espinozas-studio](https://github.com/Segsoto/espinozas-studio).

Destino: proyecto `espinozas-studio`, producción en Vercel, [espinozas-studio.vercel.app](https://espinozas-studio.vercel.app/). Si cambia el dominio, actualizar canonical, Open Graph y la URL del JSON-LD en `index.html`.

## Verificación

Se comprueban sintaxis de JavaScript, estructura HTML, referencias locales, IDs y anclas, datos estructurados, contraste de las combinaciones de color, tamaños de recursos y respuestas HTTP de la publicación. El navegador local está deshabilitado en la sesión de entrega; no se afirma haber completado una revisión visual en navegador, pruebas con lectores de pantalla ni una auditoría WCAG completa.
