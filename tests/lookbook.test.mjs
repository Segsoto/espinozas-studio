import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { initLookbook } from "../js/lookbook.js";

test("lookbook navigates a native scroll region, keeps links usable and respects reduced motion", async () => {
  const dom = new JSDOM(
    await readFile(new URL("../index.html", import.meta.url), "utf8"),
    { url: "https://espinozas-premium.vercel.app/", pretendToBeVisual: true },
  );
  const doc = dom.window.document;
  const track = doc.querySelector("[data-lookbook]");
  const controls = doc.querySelector("[data-lookbook-controls]");
  assert.equal(
    controls.hidden,
    true,
    "native track and links remain usable before JS initializes",
  );
  assert.equal(track.querySelectorAll('a[href^="/catalogo"]').length, 4);
  const media = {
    matches: false,
    addEventListener(name, callback) {
      this.change = callback;
    },
  };
  dom.window.matchMedia = () => media;
  Object.defineProperty(track, "clientWidth", { value: 1000 });
  Object.defineProperty(track, "scrollWidth", { value: 4000 });
  const movements = [];
  track.scrollBy = (options) => {
    movements.push(options);
    track.scrollLeft = Math.max(
      0,
      Math.min(3000, track.scrollLeft + options.left),
    );
    track.dispatchEvent(new dom.window.Event("scroll"));
  };
  initLookbook(doc);
  const prev = controls.querySelector("[data-lookbook-prev]"),
    next = controls.querySelector("[data-lookbook-next]");
  assert.equal(controls.hidden, false);
  assert.equal(prev.disabled, true);
  assert.equal(next.disabled, false);
  next.click();
  assert.equal(track.scrollLeft, 800);
  assert.equal(movements.at(-1).behavior, "smooth");
  assert.equal(prev.disabled, false);
  prev.click();
  assert.equal(track.scrollLeft, 0);
  media.matches = true;
  media.change();
  assert.deepEqual(movements.at(-1), { left: 0, behavior: "auto" });
  next.click();
  assert.equal(movements.at(-1).behavior, "auto");
  track.scrollLeft = 3000;
  track.dispatchEvent(new dom.window.Event("scroll"));
  assert.equal(next.disabled, true);
  dom.window.close();
});
