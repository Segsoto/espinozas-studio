import { readFile, writeFile } from "node:fs/promises";
import { business, whatsappUrl } from "../data/business.js";
import { catalog, categories } from "../data/catalog.js";
import { format } from "prettier";
import { bookingDemo, adminDemo } from "./demo-templates.mjs";

const root = new URL("../", import.meta.url);
const icons = await readFile(new URL("./icons.html", import.meta.url), "utf8");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const icon = (id, className = "icon") =>
  `<svg class="${className}" aria-hidden="true"><use href="#icon-${id}" /></svg>`;
const external = 'target="_blank" rel="noopener noreferrer"';
const wa = (
  label = "Consultar mi cita",
  service = "",
  className = "button button-dark",
) =>
  `<a class="${className}" href="${escape(whatsappUrl(service))}" ${external}>${label}${icon("whatsapp")}</a>`;
const assistantButton = (label = "Ayudame a elegir", topic = "Servicios") =>
  `<button class="text-link assistant-trigger" type="button" data-open-assistant data-chat-topic="${escape(topic)}">${label}${icon("chat")}</button>`;

const brand = `<img src="/assets/logo-instagram.jpg" alt="" width="48" height="48" /><span class="brand-name">ESPINOZA’S<span>HAIR & MAKEUP STUDIO</span></span>`;
function header(active) {
  const nav = [
    ["/", "Inicio"],
    ["/servicios", "Servicios"],
    ["/catalogo", "Catálogo"],
    ["/agendar", "Agendar demo"],
  ];
  return `<header class="site-header"><a class="brand" href="/" aria-label="Espinoza’s Studio, inicio">${brand}</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav"><span>Menú</span><span class="menu-lines" aria-hidden="true"></span></button><nav id="main-nav" aria-label="Navegación principal">${nav.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ""}${href === "/agendar" ? ' class="nav-book"' : ""}>${label}</a>`).join("")}</nav><div class="reading-progress" aria-hidden="true"></div></header>`;
}
const footer = `<footer class="site-footer page-width"><div class="footer-top"><a class="brand" href="/" aria-label="Espinoza’s Studio, volver al inicio">${brand}</a><nav class="footer-nav" aria-label="Más información"><a href="/cabello">Cabello</a><a href="/maquillaje">Maquillaje</a><a href="/cuidado-capilar">Cuidado capilar</a><a href="/contacto">Contacto</a><a href="/privacidad">Privacidad</a><a href="/admin">Panel demo</a></nav><a class="social-link" href="${business.instagram}" ${external}>${icon("instagram")}Instagram oficial</a></div><div class="footer-bottom"><p>© <span id="year">2026</span> Espinoza’s Hair & Makeup Studio<br />Alajuela, Costa Rica</p><p>Las imágenes editoriales se identifican como inspiración.<br />Las publicaciones del estudio proceden de su Instagram oficial.</p></div></footer>`;
const assistant = `<div class="contact-dock"><button id="assistant-launcher" class="assistant-launcher" type="button" aria-controls="assistant-panel" aria-expanded="false" hidden>${icon("chat")}<span>¿Te orientamos?</span></button><a class="dock-whatsapp" href="${escape(whatsappUrl())}" ${external} aria-label="Consultar con Espinoza’s por WhatsApp, abre en una pestaña nueva">${icon("whatsapp")}</a></div><section class="assistant-panel" id="assistant-panel" aria-labelledby="assistant-title" hidden><header class="assistant-header"><div><p class="eyebrow">ESPINOZA’S STUDIO</p><h2 id="assistant-title">Conversemos.</h2><p>Asistente guiado · información del estudio</p></div><button class="icon-button" type="button" data-chat-close aria-label="Cerrar asistente">${icon("close")}</button></header><div class="chat-log" data-chat-log role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación con el asistente"></div><div class="chat-options" data-chat-options aria-label="Temas sugeridos"></div><form class="chat-form"><label class="sr-only" for="chat-input">Tu consulta al asistente</label><div class="chat-input-row"><input id="chat-input" name="consulta" type="text" maxlength="240" placeholder="Servicios, horarios, ubicación…" autocomplete="off" required /><button type="submit">Enviar</button></div></form><div class="assistant-footnote"><p>La cita se confirma con el estudio por WhatsApp.</p><button type="button" data-chat-reset>Reiniciar</button><a href="/privacidad">Privacidad</a></div></section>`;

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a>${items.map((item, i) => `<span aria-hidden="true">/</span>${item.href && i < items.length - 1 ? `<a href="${item.href}">${item.label}</a>` : `<span aria-current="page">${item.label}</span>`}`).join("")}</nav>`;
}
function pageHero(eyebrow, title, description, items) {
  return `<section class="page-hero page-width">${breadcrumbs(items)}<div class="page-hero-grid"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div><p class="page-deck">${description}</p></div></section>`;
}
function cta(title = "¿Tu próximo<br /><em>cambio?</em>", service = "") {
  return `<section class="contact section-space"><div class="page-width"><p class="eyebrow" data-reveal>HAGAMOS ESPACIO PARA VOS</p><div class="contact-heading"><h2 data-reveal>${title}</h2><div class="contact-action" data-reveal><p>Contanos qué tenés en mente.<br />El estudio confirma opciones y disponibilidad.</p><a class="button button-dark" href="/agendar">Agendar cita de prueba</a>${wa("Consulta real por WhatsApp", service, "text-link")}<a class="text-link contact-secondary" href="/contacto">Preparar mi consulta</a></div></div><div class="contact-details"><div><h3>Hablemos</h3><a class="contact-phone" href="tel:+50687030236">${business.phoneDisplay}</a></div><div><h3>Visitanos</h3><p>${business.location}</p><a class="text-link" href="${business.waze}" ${external}>Buscar Espinoza’s Hair en Waze</a></div><div><h3>Tu visita</h3><p>${business.days}</p><p class="small-note">Consultá horarios y disponibilidad<br />antes de visitarnos.</p></div></div></div></section>`;
}

function catalogCard(item) {
  const responsive =
    item.small !== item.image
      ? `srcset="${item.small} 600w, ${item.image} ${item.width}w" sizes="(min-width: 761px) 50vw, 90vw"`
      : "";
  return `<article class="catalog-card" data-catalog-card="${item.id}" data-reveal><a class="catalog-image-link" href="${item.href}" data-open-catalog="${item.id}" aria-label="Explorar ${escape(item.title)}"><div class="zoom-frame catalog-image catalog-image--${item.id}" data-zoom><img class="zoom-image" src="${item.image}" ${responsive} alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" /></div><span class="image-expand">${icon("expand")}<span>Explorar imagen</span></span></a><div class="catalog-card-copy"><p class="eyebrow">${item.label}</p><h2><a href="${item.href}">${item.title}</a></h2><p class="catalog-credit">${escape(item.credit)}</p><a class="text-link" href="${escape(whatsappUrl(item.service, item.title))}" ${external}>Consultar esta idea</a></div></article>`;
}
const viewer = `<dialog class="catalog-dialog" id="catalog-dialog" aria-labelledby="viewer-title" aria-describedby="viewer-description"><div class="viewer-top"><p data-viewer-counter aria-live="polite"></p><button class="icon-button" type="button" data-viewer-close aria-label="Cerrar visor de imágenes" autofocus>${icon("close")}</button></div><div class="viewer-layout"><div class="viewer-photo"><div class="viewer-viewport" data-viewer-viewport tabindex="0" role="region" aria-label="Imagen ampliada. Desplazate dentro de este espacio para recorrerla cuando uses zoom."><img data-viewer-image alt="" width="1200" height="1800" /></div><div class="viewer-controls"><div class="zoom-controls" role="group" aria-label="Zoom de imagen"><button type="button" data-zoom-out aria-label="Alejar imagen">−</button><output data-zoom-output aria-live="polite">100 %</output><button type="button" data-zoom-in aria-label="Acercar imagen">+</button><button class="zoom-reset" type="button" data-zoom-reset>Restablecer</button></div><div class="viewer-paging" role="group" aria-label="Recorrer imágenes"><button type="button" data-viewer-prev>Anterior</button><button type="button" data-viewer-next>Siguiente</button></div></div></div><div class="viewer-copy"><p class="eyebrow" data-viewer-category></p><h2 id="viewer-title"></h2><p id="viewer-description" data-viewer-description></p><p class="small-note" data-viewer-note></p><a class="button button-dark" data-viewer-whatsapp href="${escape(whatsappUrl())}" ${external}>Consultar esta idea${icon("whatsapp")}</a><a class="text-link" data-viewer-service href="/servicios">Más sobre el servicio</a><p class="viewer-credit" data-viewer-credit></p></div></div></dialog>`;

const serviceData = [
  {
    id: "cabello",
    label: "CABELLO",
    title: "Diseño de cabello",
    heading: "Cabello con<br /><em>identidad.</em>",
    deck: "Diseño de cabello, color y babylights en Alajuela. Compartí tu inspiración con Nathalie y consultá las opciones para tu próxima visita.",
    image: "/assets/salon-1200.webp",
    width: 1200,
    height: 801,
    alt: catalog[0].alt,
    credit: catalog[0].credit,
    lead: "Una idea que empieza<br />por <em>conversar.</em>",
    paragraphs: [
      "Un cambio de color o una referencia de estilo son el punto de partida. Contale a Nathalie cómo es tu cabello hoy y qué te gustaría explorar.",
      "Consultá por diseño de cabello, color y babylights. Las opciones, el precio y el tiempo de tu visita se confirman directamente con el estudio.",
    ],
    tips: [
      [
        "Tu inspiración",
        "Elegí una imagen del catálogo o llevá una referencia propia para explicar el estilo que buscás.",
      ],
      [
        "Tu cabello hoy",
        "Contá si ya tenés color o tratamientos previos. Esa información ayuda a preparar la conversación.",
      ],
      [
        "Tu próxima visita",
        "Compartí la fecha que preferís y confirmá disponibilidad y precio antes de reservar.",
      ],
    ],
    question: "¿Tenés un color<br /><em>en mente?</em>",
    service: "diseño de cabello",
    category: "cabello",
  },
  {
    id: "maquillaje",
    label: "MAQUILLAJE",
    title: "Maquillaje",
    heading: "Esa ocasión.<br /><em>Muy vos.</em>",
    deck: "Maquillaje en Espinoza’s Hair & Makeup, Alajuela. Compartí tu ocasión y una referencia para consultar las opciones del estudio.",
    image: "/assets/makeup-1000.webp",
    width: 1000,
    height: 1500,
    alt: catalog[2].alt,
    credit: catalog[2].credit,
    lead: "Un punto de partida:<br /><em>tu referencia.</em>",
    paragraphs: [
      "Desde una idea discreta hasta un maquillaje con más presencia: contale al estudio qué tenés en mente para tu ocasión.",
      "Compartí la fecha y una referencia. El estudio confirma los estilos que ofrece, el precio y la disponibilidad; las imágenes del catálogo son inspiración editorial.",
    ],
    tips: [
      [
        "La ocasión",
        "Contá para qué actividad querés el maquillaje y en qué fecha será.",
      ],
      [
        "El estilo",
        "Compartí una imagen de referencia que ayude a expresar lo que te gusta.",
      ],
      [
        "La coordinación",
        "Confirmá las opciones, la hora de atención y el precio directamente por WhatsApp.",
      ],
    ],
    question: "Tu ocasión merece<br /><em>una conversación.</em>",
    service: "maquillaje",
    category: "maquillaje",
  },
  {
    id: "cuidado-capilar",
    label: "CUIDADO CAPILAR",
    title: "Cuidado del cabello en casa",
    heading: "El cuidado<br /><em>continúa.</em>",
    deck: "Orientación sobre cuidado del cabello y productos para tu rutina en casa, desde Espinoza’s Hair & Makeup en Alajuela.",
    image: "/assets/care.webp",
    width: 1080,
    height: 1348,
    alt: catalog[3].alt,
    credit: catalog[3].credit,
    lead: "Más allá de<br /><em>la visita.</em>",
    paragraphs: [
      "El estudio comparte recomendaciones para que el cuidado de tu cabello también forme parte de tu rutina en casa.",
      "Consultá por los productos para tu tipo de cabello y cómo usarlos. El estudio confirma cuáles tiene disponibles, sus indicaciones y precios.",
    ],
    tips: [
      [
        "Tu rutina actual",
        "Contá qué productos usás y qué te gustaría consultar sobre el cuidado de tu cabello.",
      ],
      [
        "Las opciones",
        "Pedí orientación al estudio para conocer los productos que tiene disponibles.",
      ],
      [
        "Antes de comprar",
        "Confirmá el producto, su forma de uso y su precio directamente con Espinoza’s.",
      ],
    ],
    question: "Hablemos de<br /><em>tu rutina.</em>",
    service: "cuidado del cabello en casa",
    category: "cuidado",
  },
];

function servicePage(service) {
  return (
    pageHero(service.label, service.heading, service.deck, [
      { label: "Servicios", href: "/servicios" },
      { label: service.title },
    ]) +
    `<section class="service-editorial section-space page-width"><figure class="editorial-figure" data-reveal><div class="zoom-frame" data-zoom><img class="zoom-image" src="${service.image}" alt="${escape(service.alt)}" width="${service.width}" height="${service.height}" fetchpriority="high" /></div><figcaption>${escape(service.credit)}</figcaption></figure><div class="service-editorial-copy" data-reveal><h2>${service.lead}</h2>${service.paragraphs.map((text) => `<p>${text}</p>`).join("")}${wa("Consultar este servicio", service.service)}<a class="text-link" href="/catalogo?categoria=${service.category}">Explorar referencias del catálogo</a></div></section><section class="prepare-section section-space" id="color"><div class="page-width"><div class="section-heading"><p class="eyebrow">PARA TU CONVERSACIÓN</p><h2>Tu idea,<br /><em>mejor explicada.</em></h2></div><div class="prepare-grid">${service.tips.map(([title, text]) => `<div data-reveal><h3>${title}</h3><p>${text}</p></div>`).join("")}</div>${assistantButton("Consultar al asistente", service.title)}</div></section>` +
    cta(service.question, service.service)
  );
}

const home =
  `<section class="hero" id="inicio" aria-labelledby="hero-title"><div class="hero-media zoom-frame" data-zoom><img class="zoom-image" src="/assets/hero-1600.webp" srcset="/assets/hero-800.webp 800w, /assets/hero-1600.webp 1600w, /assets/hero-2000.webp 2000w" sizes="100vw" alt="Retrato editorial con cabello oscuro en movimiento" width="2000" height="3000" fetchpriority="high" /></div><div class="hero-shade"></div><div class="hero-content page-width"><p class="eyebrow hero-enter">HAIR & MAKEUP · ALAJUELA, COSTA RICA</p><h1 id="hero-title" class="hero-enter">Un estilo<br />muy <em>tuyo.</em></h1><div class="hero-bottom hero-enter"><div><p>Diseño de cabello y maquillaje.<br />Con Nathalie Espinoza.</p><div class="hero-actions"><a class="button button-pink" href="/agendar">Probar agenda demo</a><a class="hero-catalog-link" href="/catalogo">Encontrar inspiración</a></div></div><a class="hero-discover" href="#estudio">Conocé el estudio<span class="scroll-line" aria-hidden="true"></span></a></div></div><span class="hero-photo-note">Fotografía editorial de inspiración</span></section>
<section class="studio-story page-width section-space" id="estudio"><figure class="studio-story-photo" data-reveal><div class="zoom-frame" data-zoom><img class="zoom-image" src="/assets/natural-1200.webp" srcset="/assets/natural-600.webp 600w, /assets/natural-1200.webp 1200w" sizes="(min-width: 761px) 38vw, 90vw" width="1200" height="1800" alt="Inspiración editorial: cabello suelto con ondas suaves" loading="lazy" decoding="async" /></div><figcaption>Tu estilo empieza con una idea.<span>Imagen editorial de inspiración.</span></figcaption></figure><div class="studio-story-copy" data-reveal><p class="eyebrow">EL ESTUDIO</p><h2>Tu esencia.<br /><em>Tu decisión.</em></h2><p>Espinoza’s Hair & Makeup es el estudio de Nathalie Espinoza, diseñadora de cabello en Alajuela.</p><p>Explorá una nueva idea para tu cabello, el maquillaje para esa ocasión o el cuidado que continúa en casa. Elegí una referencia y conversemos sobre tu próxima visita.</p><div class="inline-actions"><a class="text-link" href="/servicios">Conocer los servicios</a>${assistantButton()}</div></div></section>
<section class="service-menu-section section-space"><div class="page-width"><div class="section-heading section-heading-split" data-reveal><div><p class="eyebrow">SERVICIOS</p><h2>Una idea.<br /><em>Muchas formas.</em></h2></div><p class="section-deck">Elegí por dónde empezar.<br />Los detalles los conversamos con vos.</p></div><div class="service-menu">${serviceData.map((service) => `<a class="service-menu-row" href="/${service.id}" data-reveal><h3>${service.title}</h3><p>${service.category === "cabello" ? "Diseño, color y babylights." : service.category === "maquillaje" ? "Una referencia para tu ocasión." : "Orientación para tu rutina en casa."}</p><span>Explorar</span></a>`).join("")}</div></div></section>
<section class="catalog-preview section-space"><div class="page-width"><div class="section-heading section-heading-split" data-reveal><div><p class="eyebrow">EL CATÁLOGO</p><h2>El principio<br /><em>de tu próxima idea.</em></h2></div><a class="text-link" href="/catalogo">Explorar el catálogo completo</a></div><div class="preview-grid">${catalog
    .slice(0, 3)
    .map(
      (item) =>
        `<a class="preview-item" href="/catalogo?categoria=${item.category}" data-reveal><div class="zoom-frame" data-zoom><img class="zoom-image" src="${item.small}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" /></div><div><p class="eyebrow">${item.label}</p><h3>${item.title}</h3><span>Inspiración editorial</span></div></a>`,
    )
    .join("")}</div></div></section>
<section class="studio-journal page-width section-space"><div class="section-heading section-heading-split" data-reveal><div><p class="eyebrow">DESDE NUESTRO INSTAGRAM</p><h2>Esto sí es<br /><em>nuestro día a día.</em></h2></div><a class="text-link" href="${business.instagram}" ${external}>Seguir al estudio${icon("instagram")}</a></div><div class="studio-journal-grid"><a href="https://www.instagram.com/reel/De4U-8LodWx/" ${external}><img src="/assets/studio.webp" alt="Nathalie trabajando con una clienta, publicación oficial del estudio" width="720" height="1280" loading="lazy" /><span>En manos de Nathalie.</span></a><a href="https://www.instagram.com/p/DemcOSgFo-Y/" ${external}><img src="/assets/care.webp" alt="Publicación oficial sobre el cuidado capilar en casa" width="1080" height="1348" loading="lazy" /><span>El cuidado sigue en casa.</span></a><a href="https://www.instagram.com/reel/De0Bi-foSx-/" ${external}><img src="/assets/visit.webp" alt="Entrada del estudio en una publicación de su Instagram oficial" width="720" height="1280" loading="lazy" /><span>Nos vemos en Alajuela.</span></a></div></section>` +
  cta();

const services =
  pageHero(
    "SERVICIOS EN ALAJUELA",
    "Tu estilo,<br /><em>en detalle.</em>",
    "Cabello, maquillaje y cuidado capilar. Conocé las opciones del estudio y llevá tu idea a una conversación con Nathalie.",
    [{ label: "Servicios" }],
  ) +
  `<section class="service-index page-width"><div class="service-index-grid">${serviceData.map((service) => `<article class="service-index-item" data-reveal><a class="zoom-frame" data-zoom href="/${service.id}"><img class="zoom-image" src="${service.image}" alt="${escape(service.alt)}" width="${service.width}" height="${service.height}" loading="lazy" /></a><p class="eyebrow">${service.label}</p><h2><a href="/${service.id}">${service.title}</a></h2><p>${service.paragraphs[1]}</p><a class="text-link" href="/${service.id}">Ver el servicio</a><p class="catalog-credit">${service.credit}</p></article>`).join("")}</div></section><section class="guidance-band page-width section-space" data-reveal><h2>¿Todavía estás<br /><em>explorando?</em></h2><div><p>Encontrá una referencia en el catálogo o consultá al asistente guiado para saber por dónde empezar.</p><a class="button button-dark" href="/catalogo">Encontrar inspiración</a>${assistantButton()}</div></section>` +
  cta();

const catalogPage =
  pageHero(
    "CATÁLOGO DE SERVICIOS E INSPIRACIÓN",
    "Miralo de cerca.<br /><em>Hacelo tuyo.</em>",
    "Explorá por categoría, ampliá cada imagen y llevá tu referencia a WhatsApp. Las fotografías editoriales inspiran; las opciones se confirman con el estudio.",
    [{ label: "Catálogo" }],
  ) +
  `<section class="catalog-section page-width" data-catalog aria-label="Catálogo de servicios e inspiración"><div class="catalog-toolbar" data-catalog-tools hidden><div class="catalog-filters" role="group" aria-label="Filtrar por categoría">${categories.map((category) => `<button type="button" data-filter="${category.id}" aria-pressed="${category.id === "todos"}">${category.label}</button>`).join("")}</div><div class="catalog-search"><label for="catalog-search">Buscar una idea</label><input id="catalog-search" data-catalog-search type="search" placeholder="Color, ondas, maquillaje…" maxlength="100" /></div></div><p class="catalog-status" data-catalog-status role="status" aria-live="polite">4 propuestas para explorar.</p><div class="catalog-grid">${catalog.map(catalogCard).join("")}</div><div class="catalog-empty" data-catalog-empty hidden><h2>Probemos con<br /><em>otra idea.</em></h2><p>No encontramos coincidencias con esa búsqueda.</p><button class="button button-dark" type="button" data-catalog-reset>Ver todas las propuestas</button></div><div class="catalog-source-note"><p>Las imágenes editoriales no representan trabajos del estudio. La pieza de cuidado capilar procede de su Instagram oficial.</p><a class="text-link" href="${business.instagram}" ${external}>Ver las publicaciones del estudio${icon("instagram")}</a></div></section>` +
  viewer +
  cta("¿Una idea<br /><em>que te gustó?</em>");

const contact =
  pageHero(
    "CONTACTO Y CONSULTAS",
    "La próxima cita<br /><em>empieza acá.</em>",
    "Elegí el servicio, agregá tu idea y prepará una consulta para WhatsApp. El estudio confirma disponibilidad, precio y reserva.",
    [{ label: "Contacto" }],
  ) +
  `<section class="booking-layout page-width section-space"><div class="booking-editorial" data-reveal><p class="eyebrow">CON NATHALIE ESPINOZA</p><h2>Hablemos de<br /><em>lo que querés.</em></h2><p>Podés escribir directamente o preparar tu consulta con unos pocos detalles.</p>${wa("Escribir directamente")}<div class="booking-business"><h3>Espinoza’s Hair & Makeup</h3><p>${business.location}<br />${business.days}</p><a class="text-link" href="${business.waze}" ${external}>Buscar el estudio en Waze</a><p class="small-note">Confirmá la hora y el punto de llegada antes de visitar el estudio.</p><a class="text-link" href="tel:+50687030236">${business.phoneDisplay}</a></div></div><div class="booking-panel"><form data-booking-form hidden><h2>Prepará tu consulta</h2><p class="small-note">Estos datos se procesan en tu navegador. Revisás el mensaje antes de abrir WhatsApp.</p><label for="booking-service">¿Qué te interesa?</label><select id="booking-service" name="servicio" required><option value="">Elegí una opción</option><option value="cabello">Diseño de cabello, color o babylights</option><option value="maquillaje">Maquillaje</option><option value="cuidado">Cuidado capilar y productos</option><option value="orientacion">Quiero orientación del estudio</option></select><label for="booking-date">Fecha preferida <span>(opcional)</span></label><input id="booking-date" name="fecha" type="date" /><p class="field-hint">Es una preferencia; el estudio confirma disponibilidad.</p><label for="booking-idea">Contanos tu idea <span>(opcional)</span></label><textarea id="booking-idea" name="idea" rows="4" maxlength="400" placeholder="Por ejemplo, quiero consultar un cambio de color y tengo una referencia."></textarea><button class="button button-dark" type="submit">Preparar mi consulta</button></form><noscript><h2>Hablemos por WhatsApp</h2><p>Compartí el servicio que te interesa y la fecha que preferís directamente con el estudio.</p>${wa("Consultar mi cita")}</noscript><section class="booking-result" data-booking-result aria-labelledby="booking-result-title" hidden><h3 id="booking-result-title">Tu consulta está lista.</h3><p>Revisá el mensaje y continuá en WhatsApp.</p><p class="booking-message" data-booking-message></p><a class="button button-dark" data-booking-link href="${escape(whatsappUrl())}" ${external}>Abrir WhatsApp${icon("whatsapp")}</a><p class="small-note">La cita se confirma directamente con el estudio.</p></section></div></section><section class="faq-section page-width section-space"><div><p class="eyebrow">ANTES DE ESCRIBIR</p><h2>Algunas<br /><em>respuestas.</em></h2>${assistantButton("Hablar con el asistente")}</div><div class="service-list"><details><summary>¿Cómo se confirma mi cita?<span class="plus" aria-hidden="true"></span></summary><div class="service-detail"><p>El estudio confirma el servicio, la disponibilidad y la reserva por WhatsApp. Preparar el mensaje en esta web no ocupa una hora en su agenda.</p></div></details><details><summary>¿Qué días atienden?<span class="plus" aria-hidden="true"></span></summary><div class="service-detail"><p>El perfil oficial publica atención de lunes a sábado. Consultá la hora y disponibilidad para tu visita.</p></div></details><details><summary>¿Dónde puedo consultar los precios?<span class="plus" aria-hidden="true"></span></summary><div class="service-detail"><p>Pedí una cotización al estudio según el servicio que te interese. No hay una lista de precios verificada publicada en esta web.</p></div></details><details><summary>¿Las fotos del catálogo son trabajos del estudio?<span class="plus" aria-hidden="true"></span></summary><div class="service-detail"><p>Las fotografías editoriales son referencias de inspiración y están identificadas. La sección del Instagram muestra publicaciones del estudio y enlaza sus originales.</p></div></details></div></section>`;

const privacy =
  pageHero(
    "INFORMACIÓN DEL SITIO",
    "Tu consulta,<br /><em>con claridad.</em>",
    "Cómo funcionan el asistente y el formulario para preparar tu mensaje en esta web.",
    [{ label: "Privacidad" }],
  ) +
  `<section class="prose page-width section-space"><h2>Asistente guiado</h2><p>El asistente utiliza respuestas preparadas a partir de la información publicada por el estudio. Funciona en tu navegador, no usa una API de inteligencia artificial y no consulta una agenda en tiempo real.</p><p>La conversación se mantiene temporalmente en la página abierta. Esta web no la guarda en almacenamiento persistente ni la envía a un servidor de conversación. Al recargar o salir de la página, se reinicia.</p><h2>Consulta para WhatsApp</h2><p>El formulario prepara un mensaje en tu navegador. Cuando elegís “Abrir WhatsApp”, el contenido de ese mensaje se incluye en el enlace de WhatsApp para que puedas revisarlo y enviarlo allí.</p><p>La reserva la confirma el estudio directamente. La web no recopila pagos ni confirma una cita de forma automática.</p><h2>Agenda y panel de demostración</h2><p>La agenda de prueba guarda el nombre ficticio, el servicio, la fecha y el horario en localStorage de este navegador. Se conservan al recargar y se comparten entre las pestañas del mismo sitio. No se sincronizan entre dispositivos ni se envían al estudio.</p><p>El panel demo no tiene autenticación y solo permite revisar, cancelar y borrar esos datos locales. Podés eliminarlos con “Vaciar agenda de prueba” o borrando los datos del sitio en el navegador. No ingresés información personal real para esta prueba.</p><h2>Enlaces externos</h2><p>WhatsApp, Instagram y Waze son servicios externos y aplican sus propias políticas cuando los visitás. Las imágenes y las fuentes de esta web se alojan localmente; no se incluyen widgets de Instagram ni herramientas de analítica añadidas en el código del sitio.</p><h2>Consultas al estudio</h2><p>Para consultar sobre los servicios o cómo el negocio gestiona tus mensajes, escribí a Espinoza’s al número publicado en su perfil oficial.</p>${wa("Contactar al estudio")}</section>`;

const pages = [
  {
    file: "index.html",
    path: "/",
    active: "/",
    title: "Espinoza’s Hair & Makeup Studio | Alajuela",
    description:
      "Diseño de cabello, maquillaje e inspiración en Alajuela con Nathalie Espinoza. Explorá el catálogo interactivo y consultá tu próxima cita por WhatsApp.",
    content: home,
    home: true,
    image: "/assets/hero-1600.webp",
  },
  {
    file: "servicios.html",
    path: "/servicios",
    active: "/servicios",
    title: "Servicios de cabello y maquillaje en Alajuela | Espinoza’s",
    description:
      "Conocé los servicios de diseño de cabello, color, babylights, maquillaje y cuidado capilar de Espinoza’s Hair & Makeup en Alajuela.",
    content: services,
    breadcrumb: ["Servicios"],
  },
  {
    file: "catalogo.html",
    path: "/catalogo",
    active: "/catalogo",
    title: "Catálogo de servicios e inspiración | Espinoza’s Studio",
    description:
      "Explorá inspiración de cabello, color y maquillaje. Filtrá las propuestas, ampliá las imágenes con zoom y consultá tu idea con Espinoza’s en Alajuela.",
    content: catalogPage,
    breadcrumb: ["Catálogo"],
    collection: true,
  },
  ...serviceData.map((service) => ({
    file: `${service.id}.html`,
    path: `/${service.id}`,
    active: "/servicios",
    title: `${service.title} en Alajuela | Espinoza’s Studio`,
    description: service.deck,
    content: servicePage(service),
    breadcrumb: ["Servicios", service.title],
    service,
    image: service.image,
  })),
  {
    file: "contacto.html",
    path: "/contacto",
    active: "/contacto",
    title: "Contacto y citas por WhatsApp | Espinoza’s Alajuela",
    description:
      "Contactá a Espinoza’s Hair & Makeup en Alajuela al +506 8703-0236. Prepará tu consulta y confirmá disponibilidad de lunes a sábado con el estudio.",
    content: contact,
    breadcrumb: ["Contacto"],
  },
  {
    file: "agendar.html",
    path: "/agendar",
    active: "/agendar",
    title: "Agenda de prueba | Espinoza’s Studio",
    description:
      "Demostración local para apartar horarios ficticios, sin crear citas reales con el estudio.",
    content: bookingDemo,
    noindex: true,
  },
  {
    file: "admin.html",
    path: "/admin",
    title: "Panel de agenda demo | Espinoza’s Studio",
    description:
      "Panel básico de demostración para ver y cancelar citas de prueba de este navegador.",
    content: adminDemo,
    noindex: true,
  },
  {
    file: "privacidad.html",
    path: "/privacidad",
    title: "Cómo funcionan tus consultas | Espinoza’s Studio",
    description:
      "Conocé cómo el asistente guiado y el formulario preparan tu consulta en el navegador y cómo continuás la conversación en WhatsApp.",
    content: privacy,
    breadcrumb: ["Privacidad"],
  },
];

function structuredData(page) {
  const salon = {
    "@type": "BeautySalon",
    "@id": `${business.origin}/#estudio`,
    name: business.name,
    url: `${business.origin}/`,
    telephone: `+${business.phone}`,
    image: `${business.origin}/assets/logo-instagram.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alajuela",
      addressCountry: "CR",
    },
    sameAs: [business.instagram],
  };
  const webPage = {
    "@type": page.collection ? "CollectionPage" : "WebPage",
    "@id": business.origin + page.path,
    url: business.origin + page.path,
    name: page.title,
    description: page.description,
    inLanguage: "es-CR",
    isPartOf: { "@id": `${business.origin}/#website` },
    about: { "@id": salon["@id"] },
  };
  const graph = [
    salon,
    {
      "@type": "WebSite",
      "@id": `${business.origin}/#website`,
      url: `${business.origin}/`,
      name: business.name,
      inLanguage: "es-CR",
    },
    webPage,
  ];
  if (page.breadcrumb)
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: `${business.origin}/`,
        },
        ...page.breadcrumb.map((name, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name,
          item:
            i === 0 && page.service
              ? `${business.origin}/servicios`
              : business.origin + page.path,
        })),
      ],
    });
  if (page.service)
    graph.push({
      "@type": "Service",
      name: page.service.title,
      description: page.description,
      provider: { "@id": salon["@id"] },
      areaServed: "Alajuela, Costa Rica",
      url: business.origin + page.path,
    });
  if (page.collection)
    graph.push({
      "@type": "ItemList",
      itemListElement: catalog.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.title,
        url: business.origin + item.href,
      })),
    });
  return JSON.stringify(
    { "@context": "https://schema.org", "@graph": graph },
    null,
    2,
  ).replace(/</g, "\\u003c");
}

function documentHtml(page) {
  const url = business.origin + page.path;
  return `<!doctype html><html lang="es-CR" class="no-js"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#f7f4ef" /><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}" /><meta name="robots" content="${page.notFound || page.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}" /><meta property="og:type" content="website" /><meta property="og:locale" content="es_CR" /><meta property="og:title" content="${escape(page.title)}" /><meta property="og:description" content="${escape(page.description)}" /><meta property="og:image" content="${business.origin}/assets/social.jpg" /><meta property="og:url" content="${url}" /><meta name="twitter:card" content="summary_large_image" /><link rel="canonical" href="${url}" /><link rel="icon" href="/assets/logo-instagram.jpg" type="image/jpeg" /><link rel="preload" href="/assets/dm-sans.woff2" as="font" type="font/woff2" crossorigin /><link rel="preload" href="/assets/bodoni.woff2" as="font" type="font/woff2" crossorigin />${page.home ? '<link rel="preload" as="image" href="/assets/hero-1600.webp" imagesrcset="/assets/hero-800.webp 800w, /assets/hero-1600.webp 1600w, /assets/hero-2000.webp 2000w" imagesizes="100vw" />' : ""}<link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/premium.css" />${page.noindex ? '<link rel="stylesheet" href="/demo.css" />' : ""}<script type="module" src="/js/main.js"></script><script type="application/ld+json">${structuredData(page)}</script></head><body class="${page.home ? "home-page" : "inner-page"}"><a class="skip-link" href="#contenido">Saltar al contenido</a>${icons}${header(page.active)}<main id="contenido">${page.content}</main>${footer}${assistant}</body></html>`;
}

async function writePage(file, page) {
  await writeFile(
    new URL(file, root),
    await format(documentHtml(page), { parser: "html" }),
  );
}
for (const page of pages) await writePage(page.file, page);
await writePage("404.html", {
  file: "404.html",
  path: "/404",
  title: "Página no encontrada | Espinoza’s Studio",
  description:
    "Volvé al inicio o encontrá el catálogo y los servicios de Espinoza’s Studio.",
  notFound: true,
  content: `<section class="page-hero page-width error-page"><p class="eyebrow">PÁGINA NO ENCONTRADA</p><h1>Volvamos a<br /><em>encontrarnos.</em></h1><p>Ese enlace no está disponible. Encontrá tu próxima idea en el catálogo.</p><div class="inline-actions"><a class="button button-dark" href="/">Volver al inicio</a><a class="text-link" href="/catalogo">Explorar catálogo</a></div></section>`,
});
const lastmod = new Date().toISOString().slice(0, 10);
await writeFile(
  new URL("sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${pages
    .filter((page) => !page.noindex)
    .map(
      (page) =>
        `<url><loc>${business.origin}${page.path}</loc><lastmod>${lastmod}</lastmod>${page.image ? `<image:image><image:loc>${business.origin}${page.image}</image:loc></image:image>` : ""}</url>`,
    )
    .join("\n")}\n</urlset>\n`,
);
await writeFile(
  new URL("robots.txt", root),
  `User-agent: *\nAllow: /\n\nSitemap: ${business.origin}/sitemap.xml\n`,
);
console.log(
  `Generated ${pages.filter((page) => !page.noindex).length} crawlable pages and two local demo pages, a 404 page, sitemap.xml and robots.txt.`,
);
