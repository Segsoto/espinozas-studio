import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { createDemoStore, DEMO_KEY, costaRicaClock } from "../js/demo-store.js";
import { initDemoAgenda } from "../js/demo-agenda.js";
import { business } from "../data/business.js";

function fixture() {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  let sequence = 0;
  const options = {
    now: () => new Date("2026-11-02T14:30:00Z"),
    id: () => `DEMO-${++sequence}`,
  };
  return { storage, options, store: createDemoStore(storage, options) };
}
const input = {
  name: "Cliente demo",
  service: "cabello",
  date: "2026-11-02",
  time: "09:00",
};
async function page(file, route) {
  const dom = new JSDOM(
    await readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    { url: business.origin + route, pretendToBeVisual: true },
  );
  return { dom, doc: dom.window.document, window: dom.window };
}

test("demo persists a reservation, blocks the same slot across services, and cancellation releases it", () => {
  const { store, storage, options } = fixture();
  const first = store.book(input);
  assert.equal(first.status, "booked");
  assert.throws(
    () => store.book({ ...input, service: "maquillaje" }),
    /ya no está disponible/,
  );
  assert.equal(
    createDemoStore(storage, options).list().length,
    1,
    "data survives creating a new store (reload)",
  );
  store.cancel(first.id);
  assert.equal(store.slots(input.date)[0].available, true);
  store.book({ ...input, name: "Otra prueba" });
  assert.deepEqual(
    store.list().map((item) => item.status),
    ["cancelled", "booked"],
  );
});

test("demo validates dates, hours, service and name using Costa Rica time", () => {
  const { store } = fixture();
  assert.deepEqual(costaRicaClock(new Date("2026-11-03T02:00:00Z")), {
    date: "2026-11-02",
    minutes: 1200,
  });
  for (const change of [
    { date: "2026-11-01" },
    { date: "2026-11-08" },
    { date: "2026-11-31" },
    { date: "2027-01-01" },
    { time: "09:30" },
    { name: " " },
    { service: "__proto__" },
  ])
    assert.throws(() => store.book({ ...input, ...change }));
  const late = createDemoStore(fixture().storage, {
    now: () => new Date("2026-11-02T15:30:00Z"),
  });
  assert.equal(late.slots(input.date)[0].available, false);
  assert.equal(late.slots(input.date)[1].available, true);
});

test("storage failures cannot report success, and corrupted demo data can be explicitly cleared", () => {
  const { storage, store } = fixture();
  storage.setItem(DEMO_KEY, "broken-json");
  assert.throws(() => store.list(), /No se pudieron leer/);
  assert.equal(storage.getItem(DEMO_KEY), "broken-json");
  store.clear();
  assert.deepEqual(store.list(), []);
  const failing = createDemoStore(
    {
      getItem: () => null,
      setItem: () => {
        throw Error("quota");
      },
    },
    { now: () => new Date("2026-11-02T14:30:00Z") },
  );
  assert.throws(() => failing.book(input), /No se pudo guardar/);
  assert.deepEqual(failing.list(), []);
});

test("blocked browser storage leaves a visible explanation and disables saving", async () => {
  const booking = await page("agendar.html", "/agendar");
  Object.defineProperty(booking.window, "localStorage", {
    get() {
      throw new Error("blocked");
    },
  });
  initDemoAgenda(booking.doc);
  assert.equal(booking.doc.querySelector("[data-demo-booking]").hidden, false);
  assert.equal(booking.doc.querySelector("[data-demo-error]").hidden, false);
  assert.equal(booking.doc.querySelector("[data-demo-submit]").disabled, true);
  booking.dom.window.close();
});

test("visitor can reserve in the demo and admin can cancel and clear the same local data", async () => {
  const { store } = fixture();
  const booking = await page("agendar.html", "/agendar?servicio=maquillaje");
  initDemoAgenda(booking.doc, store);
  const form = booking.doc.querySelector("[data-demo-booking]");
  assert.equal(form.hidden, false);
  assert.equal(form.elements.servicio.value, "maquillaje");
  form.elements.nombre.value = '<img src=x onerror="alert(1)">';
  form.querySelector('input[name="horario"][value="10:00"]').checked = true;
  form.dispatchEvent(
    new booking.window.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(store.list().length, 1);
  assert.equal(booking.doc.querySelector("[data-demo-result]").hidden, false);
  assert.equal(form.querySelector('input[value="10:00"]').disabled, true);
  assert.equal(booking.doc.querySelector("[data-demo-confirmation] img"), null);
  const admin = await page("admin.html", "/admin");
  initDemoAgenda(admin.doc, store);
  assert.equal(admin.doc.querySelectorAll("[data-admin-rows] tr").length, 1);
  assert.equal(admin.doc.querySelector("[data-admin-rows] img"), null);
  admin.doc.querySelector(".demo-cancel").click();
  assert.equal(store.list()[0].status, "cancelled");
  assert.match(
    admin.doc.querySelector("[data-admin-rows]").textContent,
    /Cancelada/,
  );
  booking.window.dispatchEvent(
    new booking.window.StorageEvent("storage", { key: DEMO_KEY }),
  );
  assert.equal(form.querySelector('input[value="10:00"]').disabled, false);
  admin.doc.querySelector("[data-admin-reset]").click();
  assert.equal(
    admin.doc.querySelector("[data-admin-reset-confirm]").hidden,
    false,
  );
  admin.doc.querySelector("[data-admin-keep]").click();
  assert.equal(store.list().length, 1);
  admin.doc.querySelector("[data-admin-reset]").click();
  admin.doc.querySelector("[data-admin-clear]").click();
  assert.deepEqual(store.list(), []);
  assert.equal(admin.doc.querySelector("[data-admin-empty]").hidden, false);
  booking.dom.window.close();
  admin.dom.window.close();
});

test("a slot taken after rendering is rechecked before saving, and other-tab changes refresh availability", async () => {
  const { store, storage, options } = fixture();
  const booking = await page("agendar.html", "/agendar");
  initDemoAgenda(booking.doc, store);
  const form = booking.doc.querySelector("form[data-demo-booking]");
  form.elements.nombre.value = "Segunda prueba";
  form.elements.servicio.value = "cabello";
  form.querySelector('input[value="09:00"]').checked = true;
  createDemoStore(storage, options).book(input);
  form.dispatchEvent(
    new booking.window.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(store.list().length, 1);
  assert.equal(booking.doc.querySelector("[data-demo-result]").hidden, true);
  assert.match(
    booking.doc.querySelector("[data-demo-error]").textContent,
    /ya no está disponible/,
  );
  store.book({ ...input, time: "11:00" });
  booking.window.dispatchEvent(
    new booking.window.StorageEvent("storage", { key: DEMO_KEY }),
  );
  assert.equal(form.querySelector('input[value="11:00"]').disabled, true);
  booking.dom.window.close();
});

test("admin filters and the demo pages expose no real authentication or indexed agenda", async () => {
  const { store } = fixture();
  store.book(input);
  const second = store.book({ ...input, time: "10:00", date: "2026-11-03" });
  store.cancel(second.id);
  const admin = await page("admin.html", "/admin");
  initDemoAgenda(admin.doc, store);
  const select = admin.doc.querySelector("[data-admin-status]");
  select.value = "cancelled";
  select.dispatchEvent(new admin.window.Event("change"));
  assert.equal(admin.doc.querySelectorAll("[data-admin-rows] tr").length, 1);
  const date = admin.doc.querySelector("[data-admin-date]");
  date.value = "2026-11-02";
  date.dispatchEvent(new admin.window.Event("change"));
  assert.equal(admin.doc.querySelector("[data-admin-empty]").hidden, false);
  admin.doc.querySelector("[data-admin-filters-reset]").click();
  assert.equal(admin.doc.querySelectorAll("[data-admin-rows] tr").length, 2);
  assert.match(
    admin.doc.querySelector('meta[name="robots"]').content,
    /^noindex/,
  );
  assert.match(
    admin.doc.querySelector("main").textContent,
    /sin inicio de sesión/,
  );
  const booking = await page("agendar.html", "/agendar");
  assert.match(
    booking.doc.querySelector('meta[name="robots"]').content,
    /^noindex/,
  );
  const sitemap = await readFile(
    new URL("../sitemap.xml", import.meta.url),
    "utf8",
  );
  assert.equal(/\/(admin|agendar)<\/loc>/.test(sitemap), false);
  admin.dom.window.close();
  booking.dom.window.close();
});
