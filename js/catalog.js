import { catalog, filterCatalog } from "../data/catalog.js";
import { whatsappUrl } from "../data/business.js";

export function initCatalog(root = document) {
  const container = root.querySelector("[data-catalog]");
  const dialog = root.querySelector("#catalog-dialog");
  if (!container || !dialog || typeof dialog.showModal !== "function") return;
  const doc = container.ownerDocument;
  const view = doc.defaultView;
  const filterButtons = [...container.querySelectorAll("[data-filter]")];
  const cards = [...container.querySelectorAll("[data-catalog-card]")];
  const search = container.querySelector("[data-catalog-search]");
  const status = container.querySelector("[data-catalog-status]");
  const empty = container.querySelector("[data-catalog-empty]");
  const image = dialog.querySelector("[data-viewer-image]");
  const viewport = dialog.querySelector("[data-viewer-viewport]");
  const zoomOutput = dialog.querySelector("[data-zoom-output]");
  const zoomIn = dialog.querySelector("[data-zoom-in]");
  const zoomOut = dialog.querySelector("[data-zoom-out]");
  const params = new URL(view.location.href).searchParams;
  let category = filterButtons.some(
    (button) => button.dataset.filter === params.get("categoria"),
  )
    ? params.get("categoria")
    : "todos";
  let query = params.get("buscar")?.slice(0, 100) || "";
  let visible = catalog;
  let currentIndex = 0;
  let scale = 1;
  let trigger;

  function applyFilters(updateUrl = true) {
    visible = filterCatalog(category, query);
    container.dataset.resultCount = String(visible.length);
    const ids = new Set(visible.map((item) => item.id));
    for (const card of cards) card.hidden = !ids.has(card.dataset.catalogCard);
    for (const button of filterButtons)
      button.setAttribute(
        "aria-pressed",
        String(category === button.dataset.filter),
      );
    status.textContent = `${visible.length} ${visible.length === 1 ? "propuesta" : "propuestas"}${query ? ` para “${query}”` : " para explorar"}.`;
    empty.hidden = visible.length !== 0;
    container.classList.toggle("is-filtered", category !== "todos" || !!query);
    if (updateUrl) {
      const url = new URL(view.location.href);
      category === "todos"
        ? url.searchParams.delete("categoria")
        : url.searchParams.set("categoria", category);
      query
        ? url.searchParams.set("buscar", query)
        : url.searchParams.delete("buscar");
      view.history.replaceState(null, "", url);
    }
  }

  function setZoom(value) {
    scale = Math.max(1, Math.min(2.5, Math.round(value * 100) / 100));
    image.style.width = `${scale * 100}%`;
    image.style.height = `${scale * 100}%`;
    zoomOutput.textContent = `${Math.round(scale * 100)} %`;
    zoomIn.disabled = scale >= 2.5;
    zoomOut.disabled = scale <= 1;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }

  function showItem(index) {
    if (!visible.length) return;
    currentIndex = (index + visible.length) % visible.length;
    const item = visible[currentIndex];
    image.src = item.image;
    image.alt = item.alt;
    image.width = item.width;
    image.height = item.height;
    dialog.querySelector("#viewer-title").textContent = item.title;
    dialog.querySelector("[data-viewer-category]").textContent = item.label;
    dialog.querySelector("[data-viewer-description]").textContent =
      item.description;
    dialog.querySelector("[data-viewer-note]").textContent = item.note;
    dialog.querySelector("[data-viewer-credit]").textContent = item.credit;
    dialog.querySelector("[data-viewer-counter]").textContent =
      `${currentIndex + 1} de ${visible.length}`;
    dialog.querySelector("[data-viewer-whatsapp]").href = whatsappUrl(
      item.service,
      item.title,
    );
    dialog.querySelector("[data-viewer-service]").href = item.href;
    dialog
      .querySelectorAll("[data-viewer-prev], [data-viewer-next]")
      .forEach((button) => (button.disabled = visible.length <= 1));
    setZoom(1);
  }

  container.querySelectorAll("[data-open-catalog]").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      // Preserve open-in-new-tab behavior and the crawlable HTML fallback link.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const index = visible.findIndex(
        (item) => item.id === anchor.dataset.openCatalog,
      );
      if (index < 0) return;
      event.preventDefault();
      trigger = anchor;
      showItem(index);
      dialog.showModal();
      doc.documentElement.classList.add("dialog-open");
    });
  });
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.filter;
      applyFilters();
    }),
  );
  search.value = query;
  search.addEventListener("input", () => {
    query = search.value.trim().slice(0, 100);
    applyFilters();
  });
  container
    .querySelector("[data-catalog-reset]")
    .addEventListener("click", () => {
      category = "todos";
      query = "";
      search.value = "";
      applyFilters();
      search.focus();
    });
  const close = () => dialog.close();
  dialog.querySelector("[data-viewer-close]").addEventListener("click", close);
  dialog.addEventListener("close", () => {
    doc.documentElement.classList.remove("dialog-open");
    trigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      close();
  });
  dialog
    .querySelector("[data-viewer-prev]")
    .addEventListener("click", () => showItem(currentIndex - 1));
  dialog
    .querySelector("[data-viewer-next]")
    .addEventListener("click", () => showItem(currentIndex + 1));
  zoomIn.addEventListener("click", () => setZoom(scale + 0.25));
  zoomOut.addEventListener("click", () => setZoom(scale - 0.25));
  dialog
    .querySelector("[data-zoom-reset]")
    .addEventListener("click", () => setZoom(1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && scale === 1) {
      event.preventDefault();
      showItem(currentIndex - 1);
    }
    if (event.key === "ArrowRight" && scale === 1) {
      event.preventDefault();
      showItem(currentIndex + 1);
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(scale + 0.25);
    }
    if (event.key === "-") {
      event.preventDefault();
      setZoom(scale - 0.25);
    }
  });
  applyFilters(false);
  container.querySelector("[data-catalog-tools]").hidden = false;
}
