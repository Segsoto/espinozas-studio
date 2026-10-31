# Espinoza’s Studio — opción de $250

Versión ampliada para Espinoza’s Hair & Makeup, en Alajuela. Conserva la identidad del sitio base y añade un catálogo filtrable, visor de imágenes con zoom, asistente guiado local, preparador de consulta para WhatsApp y ocho páginas HTML con SEO técnico.

## Las dos opciones

| Opción           | Rama          | Web                                                                   |
| ---------------- | ------------- | --------------------------------------------------------------------- |
| Base de $120     | `main`        | [espinozas-studio.vercel.app](https://espinozas-studio.vercel.app/)   |
| Ampliada de $250 | `premium-250` | [espinozas-premium.vercel.app](https://espinozas-premium.vercel.app/) |

Código de esta versión: [rama premium-250](https://github.com/Segsoto/espinozas-studio/tree/premium-250). La rama `main` y su publicación base se conservan.

## Desarrollo

El sitio publicado utiliza exclusivamente HTML, CSS y JavaScript, sin frameworks ni dependencias de ejecución. Las dependencias de desarrollo son Prettier y jsdom para formato y pruebas de DOM.

```sh
npm ci
npm run build
npm test
```

Serví esta carpeta con cualquier servidor HTTP estático para abrirla localmente. Las rutas limpias de Vercel corresponden a archivos HTML: `/catalogo` → `catalogo.html`. En un servidor que no resuelva rutas limpias, utilizá esa equivalencia o configurá el servidor.

`npm run build` genera las ocho páginas, la página 404, `sitemap.xml` y `robots.txt`. El HTML generado se incluye en Git, así que el despliegue no requiere instalar paquetes ni ejecutar un build en Vercel.

## Organización

- `scripts/build-pages.mjs`: fuente compartida de layouts y contenido de páginas; evita mantener ocho headers y footers a mano.
- `scripts/icons.html`: símbolos SVG funcionales compartidos.
- `data/business.js`: datos del negocio, dominio canónico y enlaces de WhatsApp.
- `data/catalog.js`: propuestas, categorías, imágenes, créditos y enlaces de consulta.
- `js/main.js`: inicializa funciones independientes.
- `js/catalog.js`: filtros, búsqueda, visor nativo `dialog`, navegación y zoom de 100 a 250 %.
- `js/assistant.js` y `js/chat-engine.js`: conversación guiada y respuestas locales verificadas.
- `js/booking.js`: validación y preparación de un mensaje revisable para WhatsApp.
- `js/motion.js`: zoom suave limitado al 9 %, revelados de sección y progreso de lectura, con scroll natural.
- `styles.css`: sistema visual de la base. `premium.css`: composiciones y componentes de esta versión.
- `tests/`: pruebas de flujos y estructura con Node y jsdom.
- `SEO.md`: alcance del SEO y pasos pendientes de Search Console.
- `SOURCES.md`: información verificada y créditos.

Para cambiar el dominio o el teléfono, editar `data/business.js` y regenerar. Para modificar contenido de una página, editar el generador y ejecutar `npm run build`; no editar los HTML generados de forma aislada.

## Alcance funcional

El asistente es guiado y determinista: no requiere claves, suscripciones ni API de IA. Orienta sobre servicios, días publicados, ubicación, precios a consultar y reservas por WhatsApp. No consulta una agenda en tiempo real. Las conversaciones son transitorias, se procesan en el navegador y no se guardan en almacenamiento persistente.

El formulario prepara una consulta y permite revisarla antes de abrir WhatsApp. El visitante envía el mensaje desde WhatsApp y el estudio confirma la reserva. No se integran pagos ni un sistema de agenda.

El catálogo es de servicios e inspiración, según lo solicitado. Las imágenes editoriales se distinguen de las publicaciones oficiales del estudio. No se inventan precios, credenciales, resultados ni testimonios. El logo original del perfil se muestra a 40–48 px desde su archivo de 150 × 150 px.

## Accesibilidad y verificación

HTML semántico, enlaces reales entre páginas, saltos al contenido, foco visible, menús operables con teclado y elementos nativos `details` y `dialog`. El visor restaura el foco al cerrar; el catálogo ofrece enlaces de servicio como alternativa si no hay soporte de `dialog`. Sin JavaScript, el contenido y la navegación siguen disponibles y se conserva el acceso directo a WhatsApp.

El movimiento reducido desactiva zoom, entradas y transiciones, incluso al cambiar la preferencia durante la visita. Las imágenes fuera de portada cargan de forma diferida y las fuentes están alojadas localmente.

Las pruebas automatizadas cubren flujos del asistente, escape de texto, catálogo, búsqueda, estados vacíos, zoom, preparación de mensajes, metadatos y enlaces. Las pruebas de DOM no sustituyen una revisión renderizada, el teclado real ni un lector de pantalla. El acceso al navegador local está deshabilitado en la sesión de desarrollo; esa revisión visual queda pendiente.
