# Espinoza’s Studio — opción de $250

Versión ampliada para Espinoza’s Hair & Makeup, en Alajuela. Conserva la identidad del sitio base y añade un catálogo filtrable, visor de imágenes con zoom, asistente guiado local, preparador de consulta para WhatsApp y ocho páginas HTML con SEO técnico.

La dirección visual de la premium es independiente: portada fotográfica asimétrica sobre carbón, titulares sans serif de gran escala, acentos rosa, servicios con una columna editorial y un lookbook horizontal de desplazamiento natural. Las páginas interiores, el asistente, la agenda y el panel reciben el mismo sistema visual. La versión básica conserva su composición anterior.

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

`npm run build` genera las ocho páginas públicas, las dos páginas de agenda demo, la página 404, `sitemap.xml` y `robots.txt`. El HTML generado se incluye en Git, así que el despliegue no requiere instalar paquetes ni ejecutar un build en Vercel.

## Organización

- `scripts/build-pages.mjs`: fuente compartida de layouts y contenido de páginas; evita mantener ocho headers y footers a mano.
- `scripts/atelier-home.mjs`: composición exclusiva de la portada premium.
- `atelier.css`: dirección de arte premium aplicada después de los estilos de componentes.
- `js/lookbook.js`: galería horizontal nativa, controles de navegación y preferencia de movimiento reducido; sin autoplay.
- `scripts/icons.html`: símbolos SVG funcionales compartidos.
- `data/business.js`: datos del negocio, dominio canónico y enlaces de WhatsApp.
- `data/catalog.js`: propuestas, categorías, imágenes, créditos y enlaces de consulta.
- `js/main.js`: inicializa funciones independientes.
- `js/catalog.js`: filtros, búsqueda, visor nativo `dialog`, navegación y zoom de 100 a 250 %.
- `js/assistant.js` y `js/chat-engine.js`: conversación guiada y respuestas locales verificadas.
- `js/booking.js`: validación y preparación de un mensaje revisable para WhatsApp.
- `js/demo-store.js` y `js/demo-agenda.js`: apartados locales de prueba y panel admin básico.
- `scripts/demo-templates.mjs` y `demo.css`: vistas de la agenda y del panel de demostración.
- `js/motion.js`: zoom suave limitado al 9 %, revelados de sección y progreso de lectura, con scroll natural.
- `styles.css`: sistema visual de la base. `premium.css`: composiciones y componentes de esta versión.
- `tests/`: pruebas de flujos y estructura con Node y jsdom.
- `SEO.md`: alcance del SEO y pasos pendientes de Search Console.
- `SOURCES.md`: información verificada y créditos.

Para cambiar el dominio o el teléfono, editar `data/business.js` y regenerar. Para modificar contenido de una página, editar el generador y ejecutar `npm run build`; no editar los HTML generados de forma aislada.

## Alcance funcional

El asistente es guiado y determinista: no requiere claves, suscripciones ni API de IA. Orienta sobre servicios, días publicados, ubicación, precios a consultar y reservas por WhatsApp. No consulta una agenda en tiempo real. Las conversaciones son transitorias, se procesan en el navegador y no se guardan en almacenamiento persistente.

El formulario de contacto prepara una consulta para WhatsApp. Las reservas reales se coordinan con el estudio por ese canal. No se integran pagos ni un sistema de agenda real.

## Agenda y panel demo

- [Agendar una cita de prueba](https://espinozas-premium.vercel.app/agendar).
- [Panel admin básico](https://espinozas-premium.vercel.app/admin).

Se puede elegir servicio, fecha y horario y guardar un apartado ficticio con un nombre de prueba. El panel lista las citas, filtra por fecha y estado, permite cancelarlas y vaciar los datos de ejemplo. La cancelación libera el turno.

Los datos persisten en `localStorage`, bajo `espinozas.agenda-demo.v1`, y se comparten entre pestañas del mismo origen y navegador. No se sincronizan entre dispositivos, no se envían al negocio y no existe autenticación ni una base de datos compartida. Usar nombres ficticios. Las vistas indican expresamente su carácter de demostración y llevan `noindex`; no se incluyen en el sitemap.

Los turnos de 60 minutos, de 09:00 a 16:00, son ilustrativos. Se pueden probar fechas de lunes a sábado dentro de los próximos 30 días; se descartan horarios ya pasados según la hora de Costa Rica. No son horarios ni duraciones confirmados del negocio. La disponibilidad se vuelve a comprobar al guardar y se actualiza ante cambios de almacenamiento en otras pestañas. Es una simulación local, sin garantías de concurrencia de un servidor real.

Para probar: crear una cita en `/agendar`, abrir `/admin` en otra pestaña del mismo sitio, cancelar la cita y volver a la agenda para comprobar que el turno queda disponible. El botón para vaciar datos pide una confirmación dentro del panel y solo elimina la clave de esta demo.

El catálogo es de servicios e inspiración, según lo solicitado. Las imágenes editoriales se distinguen de las publicaciones oficiales del estudio. No se inventan precios, credenciales, resultados ni testimonios. El logo original del perfil se muestra a 40–48 px desde su archivo de 150 × 150 px.

## Accesibilidad y verificación

HTML semántico, enlaces reales entre páginas, saltos al contenido, foco visible, menús operables con teclado y elementos nativos `details` y `dialog`. El visor restaura el foco al cerrar; el catálogo ofrece enlaces de servicio como alternativa si no hay soporte de `dialog`. Sin JavaScript, el contenido y la navegación siguen disponibles y se conserva el acceso directo a WhatsApp.

El movimiento reducido desactiva zoom, entradas y transiciones, incluso al cambiar la preferencia durante la visita. Las imágenes fuera de portada cargan de forma diferida y las fuentes están alojadas localmente.

Las pruebas automatizadas cubren flujos del asistente, escape de texto, catálogo, búsqueda, estados vacíos, zoom, preparación de mensajes, metadatos y enlaces. Las pruebas de DOM no sustituyen una revisión renderizada, el teclado real ni un lector de pantalla. El acceso al navegador local está deshabilitado en la sesión de desarrollo; esa revisión visual queda pendiente.
