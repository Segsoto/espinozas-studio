import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { initMotion } from "../js/motion.js";
import { initNavigation } from "../js/navigation.js";

function motionContext(reduced) {
  const dom = new JSDOM(
    '<div class="reading-progress"></div><div data-zoom></div><h2 data-reveal id="near">Texto visible</h2><h2 data-reveal id="far">Texto posterior</h2>',
    { pretendToBeVisual: true },
  );
  const { window } = dom;
  const doc = window.document;
  const callbacks = [];
  const preference = {
    matches: reduced,
    addEventListener(event, callback) {
      this.change = callback;
    },
  };
  window.matchMedia = () => preference;
  window.IntersectionObserver = class {
    constructor(callback) {
      callbacks.push(callback);
    }
    observe() {}
    unobserve() {}
  };
  window.innerHeight = 800;
  Object.defineProperty(doc.documentElement, "scrollHeight", { value: 2000 });
  const photo = doc.querySelector("[data-zoom]");
  photo.getBoundingClientRect = () => ({ top: -200, height: 700 });
  doc.querySelector("#near").getBoundingClientRect = () => ({ top: 100 });
  doc.querySelector("#far").getBoundingClientRect = () => ({ top: 1400 });
  let nextId = 0;
  const queue = new Map();
  window.requestAnimationFrame = (callback) => {
    queue.set(++nextId, callback);
    return nextId;
  };
  window.cancelAnimationFrame = (id) => queue.delete(id);
  initMotion(doc);
  return {
    dom,
    doc,
    window,
    photo,
    preference,
    callbacks,
    queue,
    settle() {
      let iterations = 0;
      while (queue.size && iterations++ < 300) {
        const [[id, callback]] = queue.entries();
        queue.delete(id);
        callback(iterations * 16);
      }
      assert.ok(iterations < 300, "animation must stop when settled");
    },
  };
}

test("motion animates visible images, settles, and stops immediately when preference changes", () => {
  const state = motionContext(false);
  assert.equal(
    state.doc.querySelector("#near").classList.contains("will-reveal"),
    false,
  );
  assert.equal(
    state.doc.querySelector("#far").classList.contains("will-reveal"),
    true,
  );
  state.callbacks[0]([{ target: state.photo, isIntersecting: true }]);
  state.settle();
  const zoom = Number(state.photo.style.getPropertyValue("--zoom"));
  assert.ok(zoom > 1 && zoom <= 1.09);
  state.window.scrollY = 600;
  state.window.dispatchEvent(new state.window.Event("scroll"));
  state.settle();
  assert.equal(
    state.doc.querySelector(".reading-progress").style.transform,
    "scaleX(0.5)",
  );
  state.preference.matches = true;
  state.preference.change();
  assert.equal(state.photo.style.getPropertyValue("--zoom"), "");
  assert.equal(
    state.doc.querySelector("#far").classList.contains("will-reveal"),
    false,
  );
  state.window.dispatchEvent(new state.window.Event("scroll"));
  assert.equal(state.queue.size, 0);
  state.dom.window.close();
});

test("initial reduced-motion preference keeps all content visible and does not schedule motion", () => {
  const state = motionContext(true);
  state.callbacks[0]([{ target: state.photo, isIntersecting: true }]);
  assert.equal(state.doc.querySelectorAll(".will-reveal").length, 0);
  assert.equal(state.queue.size, 0);
  state.dom.window.close();
});

function navigationContext(reduced = true) {
  const dom = new JSDOM(
    '<header><button class="menu-toggle" aria-expanded="false" hidden>Explorar</button></header><nav class="navigation-fallback"><a href="/servicios">Servicios</a></nav><dialog id="main-nav"><button data-menu-close>Cerrar</button><nav><a href="#destination">Servicios</a></nav></dialog><main id="destination"></main>',
    { pretendToBeVisual: true },
  );
  const { document: doc } = dom.window;
  const preference = {
    matches: reduced,
    addEventListener(event, callback) {
      this.change = callback;
    },
  };
  dom.window.matchMedia = () => preference;
  const menu = doc.querySelector("dialog");
  // jsdom has no modal dialog implementation; mimic native open/close events.
  menu.showModal = () => menu.setAttribute("open", "");
  menu.close = () => {
    menu.removeAttribute("open");
    menu.dispatchEvent(new dom.window.Event("close"));
  };
  doc.documentElement.style.overflow = "auto";
  initNavigation(doc);
  return {
    dom,
    doc,
    menu,
    toggle: doc.querySelector(".menu-toggle"),
    preference,
  };
}

test("studio menu restores focus and scroll after native Escape, close button and navigation", () => {
  const { dom, doc, menu, toggle } = navigationContext();
  assert.equal(toggle.hidden, false);
  assert.equal(
    doc.documentElement.classList.contains("navigation-ready"),
    true,
  );
  toggle.click();
  assert.equal(menu.open, true);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(doc.documentElement.style.overflow, "hidden");
  assert.equal(doc.activeElement, menu.querySelector("button"));
  const cancel = new dom.window.Event("cancel", { cancelable: true });
  menu.dispatchEvent(cancel);
  assert.equal(cancel.defaultPrevented, true);
  assert.equal(menu.open, false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(doc.documentElement.style.overflow, "auto");
  assert.equal(doc.activeElement, toggle);
  toggle.click();
  menu.querySelector("button").click();
  assert.equal(menu.open, false);
  toggle.click();
  menu.querySelector("a").click();
  assert.equal(menu.open, false);
  assert.equal(doc.documentElement.style.overflow, "auto");
  dom.window.close();
});

test("studio menu completes its exit and responds immediately to reduced motion", async () => {
  const { dom, doc, menu, toggle, preference } = navigationContext(false);
  toggle.click();
  menu.querySelector("button").click();
  assert.equal(menu.open, true);
  assert.equal(menu.classList.contains("is-closing"), true);
  await new Promise((resolve) => setTimeout(resolve, 260));
  assert.equal(menu.open, false);
  assert.equal(doc.documentElement.style.overflow, "auto");
  toggle.click();
  menu.querySelector("button").click();
  preference.matches = true;
  preference.change();
  assert.equal(menu.open, false);
  assert.equal(menu.classList.contains("is-closing"), false);
  assert.equal(doc.activeElement, toggle);
  dom.window.close();
});

test("ordinary navigation remains available if modal dialogs are unsupported", () => {
  const dom = new JSDOM(
    '<button class="menu-toggle" hidden></button><nav class="navigation-fallback"><a href="/servicios">Servicios</a></nav><dialog id="main-nav"></dialog>',
  );
  initNavigation(dom.window.document);
  assert.equal(dom.window.document.querySelector(".menu-toggle").hidden, true);
  assert.equal(
    dom.window.document.documentElement.classList.contains("navigation-ready"),
    false,
  );
  assert.equal(
    dom.window.document
      .querySelector(".navigation-fallback a")
      .getAttribute("href"),
    "/servicios",
  );
  dom.window.close();
});
