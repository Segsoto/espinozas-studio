import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { format } from "prettier";
import { bookingDemo, adminDemo } from "./demo-templates.mjs";

const root = new URL("../", import.meta.url);
const origin = "https://espinozas-studio.vercel.app";
const dom = new JSDOM(await readFile(new URL("index.html", root), "utf8"));
const document = dom.window.document;
const nav = document.querySelector(".nav-book");
nav.href = "/agendar";
nav.textContent = "Agendar demo";
const hero = document.querySelector(".hero .button");
hero.href = "/agendar";
hero.removeAttribute("target");
hero.removeAttribute("rel");
hero.textContent = "Agendar cita demo";
if (!document.querySelector('link[href="/demo-base.css"]')) {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/demo-base.css";
  document.head.append(css);
}
if (!document.querySelector("[data-demo-admin-link]")) {
  const anchor = document.createElement("a");
  anchor.href = "/admin";
  anchor.className = "social-link";
  anchor.textContent = "Panel demo";
  anchor.dataset.demoAdminLink = "";
  document.querySelector(".footer-top").append(anchor);
}
if (!document.querySelector(".demo-home-link")) {
  const anchor = document.createElement("a");
  anchor.href = "/agendar";
  anchor.className = "text-link demo-home-link";
  anchor.textContent = "Probar la agenda de citas";
  document.querySelector(".contact-action").append(anchor);
}
await writeFile(
  new URL("index.html", root),
  await format(dom.serialize(), { parser: "html" }),
);

function fragment(selector) {
  const clone = document.querySelector(selector).cloneNode(true);
  for (const link of clone.querySelectorAll('a[href^="#"]'))
    link.setAttribute("href", "/" + link.getAttribute("href"));
  return clone.outerHTML;
}
const icons = document.querySelector("svg.icon-library").outerHTML;
const header = fragment(".site-header"),
  footer = fragment(".site-footer"),
  whatsapp = document.querySelector(".whatsapp-float").outerHTML;
for (const [name, title, content] of [
  ["agendar", "Agenda de prueba", bookingDemo],
  ["admin", "Panel de agenda demo", adminDemo],
]) {
  const html = `<!doctype html><html lang="es-CR" class="no-js"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#f7f4ef"/><title>${title} | Espinoza’s Studio</title><meta name="description" content="Agenda local de demostración. Solo datos ficticios de este navegador; no crea citas reales con el estudio."/><meta name="robots" content="noindex,follow"/><link rel="canonical" href="${origin}/${name}"/><link rel="icon" href="/assets/logo-instagram.jpg" type="image/jpeg"/><link rel="stylesheet" href="/styles.css"/><link rel="stylesheet" href="/demo-base.css"/><link rel="stylesheet" href="/demo.css"/><script src="/script.js" defer></script><script type="module" src="/js/demo-init.js"></script></head><body><a class="skip-link" href="#contenido">Saltar al contenido</a>${icons}${header}<main id="contenido">${content.replaceAll('href="/contacto"', 'href="/#contacto"')}</main>${footer}${whatsapp}</body></html>`;
  await writeFile(
    new URL(`${name}.html`, root),
    await format(html, { parser: "html" }),
  );
}
dom.window.close();
console.log(
  "Updated basic homepage and generated /agendar and /admin with the shared local demo logic.",
);
