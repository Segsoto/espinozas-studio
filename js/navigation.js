export function initNavigation(root = document) {
  const toggle = root.querySelector(".menu-toggle");
  const menu = root.querySelector("#main-nav");
  if (!toggle || !menu || typeof menu.showModal !== "function") return;

  const view = root.defaultView;
  const reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)");
  const closeButton = menu.querySelector("[data-menu-close]");
  let closingTimer;
  let previousOverflow = "";

  function finishClose() {
    view.clearTimeout(closingTimer);
    closingTimer = undefined;
    if (!menu.open) return;
    menu.close();
  }

  function closeMenu(immediate = false) {
    if (!menu.open) return;
    if (immediate || reducedMotion.matches) {
      finishClose();
    } else if (!menu.classList.contains("is-closing")) {
      menu.classList.add("is-closing");
      closingTimer = view.setTimeout(finishClose, 220);
    }
  }

  toggle.addEventListener("click", () => {
    if (menu.open) {
      closeMenu();
      return;
    }
    previousOverflow = root.documentElement.style.overflow;
    menu.classList.remove("is-closing");
    menu.showModal();
    root.documentElement.style.overflow = "hidden";
    toggle.setAttribute("aria-expanded", "true");
    closeButton?.focus({ preventScroll: true });
  });

  closeButton?.addEventListener("click", () => closeMenu());
  menu.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(true);
    else if (event.target === menu) closeMenu();
  });
  // Restore state even if another control closes the native dialog.
  menu.addEventListener("close", () => {
    view.clearTimeout(closingTimer);
    closingTimer = undefined;
    menu.classList.remove("is-closing");
    root.documentElement.style.overflow = previousOverflow;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus({ preventScroll: true });
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches && menu.classList.contains("is-closing"))
      finishClose();
  });

  // Native dialog contains focus and makes the page behind it inert.
  // Ordinary navigation remains available if JS or dialog is unavailable.
  toggle.hidden = false;
  root.documentElement.classList.add("navigation-ready");
}
