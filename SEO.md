# Preparación para indexación

La versión ampliada publica estas ocho páginas HTML independientes:

- [Inicio](https://espinozas-premium.vercel.app/)
- [Servicios](https://espinozas-premium.vercel.app/servicios)
- [Catálogo](https://espinozas-premium.vercel.app/catalogo)
- [Cabello](https://espinozas-premium.vercel.app/cabello)
- [Maquillaje](https://espinozas-premium.vercel.app/maquillaje)
- [Cuidado capilar](https://espinozas-premium.vercel.app/cuidado-capilar)
- [Contacto](https://espinozas-premium.vercel.app/contacto)
- [Privacidad](https://espinozas-premium.vercel.app/privacidad)

Todas tienen contenido legible sin ejecutar JavaScript, título y descripción únicos, un H1, canonical propio, datos estructurados y enlaces internos. El catálogo no crea copias indexables por cada combinación de filtros: mantiene canonical en `/catalogo`.

## Archivos publicados

- [sitemap.xml](https://espinozas-premium.vercel.app/sitemap.xml): las ocho URL y sus imágenes representativas.
- [robots.txt](https://espinozas-premium.vercel.app/robots.txt): permite rastreo y señala el sitemap.
- `404.html`: página de error con `noindex`, excluida del sitemap.
- `/agendar` y `/admin`: demostraciones locales con `noindex`, excluidas del sitemap; no se presentan como páginas de reserva real.

Los datos estructurados describen el negocio, las páginas, los servicios, el catálogo y las rutas de navegación. No se agregan valoraciones, testimonios, precios ni horarios exactos no verificados.

## Pendiente en Google Search Console

No se dispone de acceso a una propiedad verificada de Search Console en esta sesión. El trabajo entregado prepara el rastreo; no certifica que Google ya haya indexado las páginas.

1. Entrar a [Google Search Console](https://search.google.com/search-console) con la cuenta que administrará el sitio.
2. Añadir y verificar la propiedad del dominio definitivo o el prefijo URL `https://espinozas-premium.vercel.app/`. Si se utiliza un archivo o meta de verificación, añadir únicamente el valor entregado por Search Console a este proyecto y volver a desplegar.
3. En **Sitemaps**, enviar `https://espinozas-premium.vercel.app/sitemap.xml`.
4. Inspeccionar las URL principales, verificar que sean accesibles y solicitar su indexación cuando Search Console lo permita.
5. Revisar los informes de indexación y las posibles exclusiones después del rastreo.

Google explica que [un sitemap ayuda a descubrir URL, pero no garantiza su indexación](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview). [Solicitar un rastreo](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) requiere acceso a la propiedad y tampoco garantiza inclusión inmediata en resultados.

## Al elegir la versión definitiva

Los enlaces de las opciones de $120 y $250 sirven para presentarlas por separado. Cuando el negocio elija su web y dominio finales, actualizar `business.origin` en `data/business.js`, ejecutar `npm run build`, conectar el dominio y enviar su sitemap. Las redirecciones y canonical de los dominios de demostración deben decidirse según esa elección, para consolidar la presencia del negocio en una sola versión definitiva.
