"use strict";

document.documentElement.classList.replace("no-js", "js");

/** Mobile navigation uses native links; Escape closes it and restores focus. */
function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");
  if (!toggle || !nav) return;
  const desktop = window.matchMedia("(min-width: 761px)");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setOpen(false);
  });
  desktop.addEventListener("change", () => setOpen(false));
}

/** Scale visible photographs as they pass through the viewport. No scroll hijacking. */
function initImageZoom() {
  const frames = [...document.querySelectorAll("[data-zoom]")];
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!frames.length || !("IntersectionObserver" in window)) return;
  const visible = new Set();
  let animationFrame = 0;

  function render() {
    animationFrame = 0;
    if (preference.matches) return;
    const viewport = window.innerHeight;
    // Read geometry before writing styles to avoid alternating layout work.
    const scales = [...visible].map((frame) => {
      const rect = frame.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (viewport - rect.top) / (viewport + rect.height)),
      );
      return [frame, 1 + progress * 0.075];
    });
    for (const [frame, scale] of scales)
      frame.style.setProperty("--zoom", scale.toFixed(4));
  }
  function schedule() {
    if (!preference.matches && !animationFrame)
      animationFrame = window.requestAnimationFrame(render);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      schedule();
    },
    { rootMargin: "80px 0px" },
  );
  frames.forEach((frame) => observer.observe(frame));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  preference.addEventListener("change", () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (preference.matches)
      frames.forEach((frame) => frame.style.removeProperty("--zoom"));
    else schedule();
  });
}

initNavigation();
initImageZoom();
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
