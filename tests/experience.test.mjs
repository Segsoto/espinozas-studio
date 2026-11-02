import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initAssistant } from "../js/assistant.js";
import { getReply, welcomeReply } from "../js/chat-engine.js";
import { initCatalog } from "../js/catalog.js";
import { buildBookingMessage, initBooking } from "../js/booking.js";
import { filterCatalog } from "../data/catalog.js";
import { business } from "../data/business.js";

async function page(file, route) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  const dom = new JSDOM(html, {
    url: business.origin + route,
    pretendToBeVisual: true,
  });
  return { dom, doc: dom.window.document, window: dom.window };
}

test("guided answers cover actual facts and never invent prices or availability", () => {
  assert.equal(welcomeReply().choices.length, 5);
  const hours = getReply("¿Abren los sábados?");
  assert.match(hours.text, /Lunes a sábado/);
  assert.match(hours.text, /no tengo acceso a una agenda/i);
  assert.match(
    getReply("¿Cuánto cuesta?").text,
    /No tengo una lista de precios/,
  );
  assert.match(
    getReply("¿Dónde están?").actions[0].href,
    /^https:\/\/www\.waze\.com/,
  );
  assert.match(getReply("Productos para el cabello").text, /productos/);
  assert.equal(getReply("Me interesa maquillaje").state.service, "maquillaje");
  const reserved = getReply("Quiero reservar", { service: "maquillaje" });
  assert.match(
    decodeURIComponent(
      reserved.actions.find((action) => action.href.includes("wa.me")).href,
    ),
    /maquillaje/,
  );
  assert.ok(reserved.actions.some((action) => action.href === "/agendar"));
  assert.match(
    getReply("consulta muy específica que no conozco").text,
    /conversar con el estudio/,
  );
});

test("assistant opens, follows choices, safely renders text, resets and restores focus", async () => {
  const { dom, doc, window } = await page("index.html", "/");
  initAssistant(doc);
  const launcher = doc.querySelector("#assistant-launcher");
  const panel = doc.querySelector("#assistant-panel");
  launcher.focus();
  launcher.click();
  assert.equal(panel.hidden, false);
  assert.equal(launcher.getAttribute("aria-expanded"), "true");
  assert.equal(doc.activeElement.id, "chat-input");
  const choice = (label) =>
    [...panel.querySelectorAll("[data-chat-options] button")].find(
      (button) => button.textContent === label,
    );
  choice("Servicios").click();
  choice("Cabello").click();
  assert.ok(panel.querySelector('[href*="wa.me/50687030236"]'));
  assert.equal(panel.querySelectorAll(".chat-message--user").length, 2);
  const input = panel.querySelector("input");
  input.value = '<img src=x onerror="alert(1)">';
  panel
    .querySelector("form")
    .dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
  assert.equal(panel.querySelectorAll("[data-chat-log] img").length, 0);
  assert.match(
    panel.querySelector("[data-chat-log]").textContent,
    /<img src=x/,
  );
  panel.querySelector("[data-chat-reset]").click();
  assert.equal(panel.querySelectorAll(".chat-message").length, 1);
  panel.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert.equal(panel.hidden, true);
  assert.equal(doc.activeElement, launcher);
  dom.window.close();
});

test("catalog filters combine category and accent-insensitive search", () => {
  assert.equal(filterCatalog("cabello").length, 2);
  assert.equal(filterCatalog("todos", "iluminación")[0].id, "color");
  assert.equal(filterCatalog("maquillaje", "cabello").length, 0);
  assert.equal(filterCatalog("todos", "maquillaje ocasion").length, 1);
});

test("catalog filter, empty state, modal navigation and bounded zoom work together", async () => {
  const { dom, doc, window } = await page(
    "catalogo.html",
    "/catalogo?categoria=cabello",
  );
  const dialog = doc.querySelector("#catalog-dialog");
  dialog.showModal = function () {
    this.open = true;
  };
  dialog.close = function () {
    this.open = false;
    this.dispatchEvent(new window.Event("close"));
  };
  initCatalog(doc);
  const visibleCards = () =>
    [...doc.querySelectorAll("[data-catalog-card]")].filter(
      (card) => !card.hidden,
    );
  assert.equal(visibleCards().length, 2);
  assert.equal(
    doc.querySelector('[data-filter="cabello"]').getAttribute("aria-pressed"),
    "true",
  );
  const trigger = visibleCards()[0].querySelector("[data-open-catalog]");
  trigger.focus();
  trigger.click();
  assert.equal(dialog.open, true);
  assert.equal(
    doc.querySelector("#viewer-title").textContent,
    "Color & babylights",
  );
  for (let i = 0; i < 10; i++) dialog.querySelector("[data-zoom-in]").click();
  assert.equal(dialog.querySelector("[data-zoom-output]").textContent, "250 %");
  assert.equal(dialog.querySelector("[data-zoom-in]").disabled, true);
  dialog.querySelector("[data-viewer-next]").click();
  assert.equal(dialog.querySelector("[data-zoom-output]").textContent, "100 %");
  assert.equal(
    doc.querySelector("#viewer-title").textContent,
    "Textura & movimiento",
  );
  dialog.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
  );
  assert.equal(
    doc.querySelector("#viewer-title").textContent,
    "Color & babylights",
  );
  dialog.querySelector("[data-viewer-close]").click();
  assert.equal(dialog.open, false);
  assert.equal(doc.documentElement.classList.contains("dialog-open"), false);
  assert.equal(doc.activeElement, trigger);
  const search = doc.querySelector("[data-catalog-search]");
  search.value = "sin-coincidencias";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.equal(visibleCards().length, 0);
  assert.equal(doc.querySelector("[data-catalog-empty]").hidden, false);
  doc.querySelector("[data-catalog-reset]").click();
  assert.equal(visibleCards().length, 4);
  assert.equal(new URL(window.location.href).search, "");
  dom.window.close();
});

test("catalog retains real links when a native dialog is unavailable", async () => {
  const { dom, doc } = await page("catalogo.html", "/catalogo");
  doc.querySelector("#catalog-dialog").showModal = undefined;
  initCatalog(doc);
  assert.equal(doc.querySelector("[data-catalog-tools]").hidden, true);
  assert.equal(doc.querySelectorAll("[data-open-catalog][href]").length, 4);
  dom.window.close();
});

test("booking helper validates data and only prepares a visitor-reviewed message", async () => {
  assert.throws(() => buildBookingMessage({ service: "inventado" }));
  assert.throws(() =>
    buildBookingMessage({ service: "cabello", date: "2027-02-30" }),
  );
  const { dom, doc, window } = await page("contacto.html", "/contacto");
  window.HTMLElement.prototype.scrollIntoView = function () {};
  initBooking(doc);
  const form = doc.querySelector("[data-booking-form]");
  const result = doc.querySelector("[data-booking-result]");
  assert.equal(form.hidden, false);
  form.dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(result.hidden, true);
  form.elements.servicio.value = "maquillaje";
  form.elements.fecha.value = "2027-12-10";
  form.elements.idea.value =
    '<script>alert("x")</script> Un maquillaje para mi ocasión.';
  form.dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(result.hidden, false);
  const link = new URL(result.querySelector("[data-booking-link]").href);
  assert.equal(link.hostname, "wa.me");
  assert.equal(link.pathname, "/50687030236");
  assert.match(link.searchParams.get("text"), /10\/12\/2027/);
  assert.match(link.searchParams.get("text"), /maquillaje/);
  assert.equal(result.querySelectorAll("script").length, 0);
  form.elements.idea.value = "Otra consulta";
  form.elements.idea.dispatchEvent(
    new window.Event("input", { bubbles: true }),
  );
  assert.equal(
    result.hidden,
    true,
    "editing must invalidate the previous prepared message",
  );
  dom.window.close();
});
