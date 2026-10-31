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

test("mobile menu closes with Escape, outside interaction and a desktop breakpoint", () => {
  const dom = new JSDOM(
    '<header class="site-header"><button class="menu-toggle" aria-expanded="false"></button><nav id="main-nav"></nav></header><button id="outside"></button>',
    { pretendToBeVisual: true },
  );
  const { document: doc } = dom.window;
  const media = {
    addEventListener(event, callback) {
      this.change = callback;
    },
  };
  dom.window.matchMedia = () => media;
  initNavigation(doc);
  const toggle = doc.querySelector(".menu-toggle"),
    nav = doc.querySelector("nav");
  toggle.click();
  assert.equal(nav.classList.contains("is-open"), true);
  doc.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(doc.activeElement, toggle);
  toggle.click();
  doc.querySelector("#outside").click();
  assert.equal(nav.classList.contains("is-open"), false);
  toggle.click();
  media.change();
  assert.equal(nav.classList.contains("is-open"), false);
  dom.window.close();
});
