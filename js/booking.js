import { business } from "../data/business.js";

const serviceNames = Object.freeze({
  cabello: "diseño de cabello, color o babylights",
  maquillaje: "maquillaje",
  cuidado: "cuidado capilar y productos",
  orientacion: "orientación del estudio",
});

export function buildBookingMessage({ service, date = "", idea = "" }) {
  if (!Object.hasOwn(serviceNames, service))
    throw new Error("Elegí un servicio válido.");
  let text = `Hola, quiero consultar por ${serviceNames[service]} en Espinoza’s Studio.`;
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new Error("Elegí una fecha válida.");
    const parsed = new Date(`${date}T12:00:00Z`);
    if (
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    )
      throw new Error("Elegí una fecha válida.");
    const [year, month, day] = date.split("-");
    text += ` Mi fecha preferida es ${day}/${month}/${year}.`;
  }
  if (idea.trim()) text += ` Mi idea: ${idea.trim().slice(0, 400)}`;
  text += " Quisiera confirmar las opciones, el precio y la disponibilidad.";
  return text;
}

export function initBooking(root = document) {
  const form = root.querySelector("[data-booking-form]");
  if (!form) return;
  const result = root.querySelector("[data-booking-result]");
  const dateInput = form.querySelector('[name="fecha"]');
  const now = new Date();
  form.addEventListener("input", () => {
    result.hidden = true;
  });
  dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const text = buildBookingMessage({
      service: form.elements.servicio.value,
      date: dateInput.value,
      idea: form.elements.idea.value,
    });
    result.querySelector("[data-booking-message]").textContent = text;
    result.querySelector("[data-booking-link]").href =
      `https://wa.me/${business.phone}?text=${encodeURIComponent(text)}`;
    result.hidden = false;
    const heading = result.querySelector("h3");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: "auto", block: "nearest" });
  });
  form.hidden = false;
}
