export function initNavigation(root = document) {
  const toggle = root.querySelector(".menu-toggle");
  const nav = root.querySelector("#main-nav");
  if (!toggle || !nav) return;
  const desktop = root.defaultView.matchMedia("(min-width: 761px)");
  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  root.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    ) {
      setOpen(false);
      toggle.focus();
    }
  });
  root.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setOpen(false);
  });
  desktop.addEventListener("change", () => setOpen(false));
}
