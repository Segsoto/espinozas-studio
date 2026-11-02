/** A native, keyboard-accessible horizontal gallery; no autoplay or scroll interception. */
export function initLookbook(root = document) {
  const track = root.querySelector("[data-lookbook]");
  const controls = root.querySelector("[data-lookbook-controls]");
  if (!track || !controls) return;
  const view = root.defaultView;
  const previous = controls.querySelector("[data-lookbook-prev]");
  const next = controls.querySelector("[data-lookbook-next]");
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  function update() {
    const range = track.scrollWidth - track.clientWidth;
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= range - 1;
  }
  function move(direction) {
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduced.matches ? "auto" : "smooth",
    });
  }
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("scroll", update, { passive: true });
  view.addEventListener("resize", update, { passive: true });
  reduced.addEventListener("change", () => {
    if (reduced.matches) track.scrollBy({ left: 0, behavior: "auto" });
  });
  track
    .querySelectorAll("img")
    .forEach((image) => image.addEventListener("load", update));
  controls.hidden = false;
  update();
}
