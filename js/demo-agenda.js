import {
  createDemoStore,
  DEMO_KEY,
  demoServices,
  formatDemoDate,
  addDays,
} from "./demo-store.js";

export function initDemoAgenda(root = document, injectedStore) {
  const form = root.querySelector("[data-demo-booking]");
  const admin = root.querySelector("[data-demo-admin]");
  if (!form && !admin) return;
  const view = root.defaultView;
  // Access localStorage only on demo pages, and report failure without pretending to save.
  let store;
  try {
    store = injectedStore || createDemoStore(view.localStorage);
  } catch {
    if (form) {
      form.hidden = false;
      form.querySelector("[data-demo-submit]").disabled = true;
    }
    const error = root.querySelector("[data-demo-error], [data-admin-error]");
    error.textContent =
      "El navegador no permite acceder a la agenda local de prueba.";
    error.hidden = false;
    return;
  }
  if (form) initBookingDemo(root, form, store);
  if (admin) initAdminDemo(root, admin, store);
}

function initBookingDemo(root, form, store) {
  const view = root.defaultView;
  const date = form.elements.fecha;
  const service = form.elements.servicio;
  const slots = form.querySelector("[data-demo-slots]");
  const submit = form.querySelector("[data-demo-submit]");
  const error = form.querySelector("[data-demo-error]");
  const result = root.querySelector("[data-demo-result]");
  const requestedService = new URL(view.location.href).searchParams.get(
    "servicio",
  );
  if (Object.hasOwn(demoServices, requestedService))
    service.value = requestedService;
  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }
  function refresh() {
    const range = store.bounds();
    date.min = range.min;
    date.max = range.max;
    slots.replaceChildren();
    error.hidden = true;
    try {
      const options = store.slots(date.value);
      for (const option of options) {
        const label = root.createElement("label");
        label.className = "demo-slot";
        const input = root.createElement("input");
        input.type = "radio";
        input.name = "horario";
        input.value = option.time;
        input.disabled = !option.available;
        input.required = true;
        const text = root.createElement("span");
        text.textContent = option.time;
        if (!option.available) {
          const reason = root.createElement("small");
          reason.textContent = option.reason;
          text.append(reason);
        }
        label.append(input, text);
        slots.append(label);
      }
      const available = options.filter((option) => option.available).length;
      form.querySelector("[data-demo-slot-status]").textContent = available
        ? `${available} horarios de prueba disponibles.`
        : "No hay turnos de prueba disponibles para esa fecha. Probá otro día de lunes a sábado.";
      submit.disabled = available === 0;
    } catch (problem) {
      showError(problem.message);
      submit.disabled = true;
    }
  }
  date.value = store.bounds().min;
  for (let step = 0; step <= 30; step++) {
    try {
      if (store.slots(date.value).some((option) => option.available)) break;
    } catch {
      break;
    }
    if (step < 30) date.value = addDays(date.value, 1);
  }
  date.addEventListener("change", () => {
    result.hidden = true;
    refresh();
  });
  form.addEventListener("input", () => {
    result.hidden = true;
    error.hidden = true;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const appointment = store.book({
        name: form.elements.nombre.value,
        service: service.value,
        date: date.value,
        time: form.elements.horario?.value || "",
      });
      refresh();
      form.elements.nombre.value = "";
      root.querySelector("[data-demo-confirmation]").textContent =
        `${appointment.name}: ${demoServices[appointment.service]}, ${formatDemoDate(appointment.date)} a las ${appointment.time}. Código ${appointment.id}.`;
      result.hidden = false;
      result.querySelector("h3").focus({ preventScroll: true });
    } catch (problem) {
      refresh();
      showError(problem.message);
    }
  });
  root.querySelector("[data-demo-another]").addEventListener("click", () => {
    result.hidden = true;
    form.elements.nombre.focus();
  });
  view.addEventListener("storage", (event) => {
    if (event.key === DEMO_KEY || event.key === null) {
      result.hidden = true;
      refresh();
    }
  });
  // Recheck availability after returning to this tab or leaving it open overnight.
  view.addEventListener("focus", refresh);
  refresh();
  form.hidden = false;
}

function initAdminDemo(root, admin, store) {
  const view = root.defaultView;
  const rows = admin.querySelector("[data-admin-rows]");
  const date = admin.querySelector("[data-admin-date]");
  const status = admin.querySelector("[data-admin-status]");
  const error = admin.querySelector("[data-admin-error]");
  const message = admin.querySelector("[data-admin-message]");
  const reset = admin.querySelector("[data-admin-reset]");
  const confirmation = admin.querySelector("[data-admin-reset-confirm]");
  function render() {
    rows.replaceChildren();
    error.hidden = true;
    try {
      const all = store.list();
      const visible = all
        .filter(
          (item) =>
            (!date.value || item.date === date.value) &&
            (status.value === "all" || item.status === status.value),
        )
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
        );
      admin.querySelector("[data-admin-summary]").textContent =
        `${all.filter((item) => item.status === "booked").length} apartadas · ${all.filter((item) => item.status === "cancelled").length} canceladas · ${visible.length} en esta vista.`;
      admin.querySelector("[data-admin-empty]").hidden = visible.length > 0;
      for (const item of visible) {
        const row = root.createElement("tr");
        for (const value of [
          item.name,
          demoServices[item.service],
          formatDemoDate(item.date),
          item.time,
          item.status === "booked" ? "Apartada · demo" : "Cancelada",
        ]) {
          const cell = root.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }
        const action = root.createElement("td");
        if (item.status === "booked") {
          const button = root.createElement("button");
          button.type = "button";
          button.className = "demo-cancel";
          button.textContent = "Cancelar";
          button.setAttribute(
            "aria-label",
            `Cancelar cita demo de ${item.name} del ${formatDemoDate(item.date)} a las ${item.time}`,
          );
          button.addEventListener("click", () => {
            try {
              store.cancel(item.id);
              render();
              message.textContent = `Cita demo de ${item.name} cancelada. El horario vuelve a estar disponible.`;
              message.tabIndex = -1;
              message.focus({ preventScroll: true });
            } catch (problem) {
              error.textContent = problem.message;
              error.hidden = false;
            }
          });
          action.append(button);
        } else action.textContent = "—";
        row.append(action);
        rows.append(row);
      }
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
      admin.querySelector("[data-admin-summary]").textContent =
        "Agenda no disponible. Podés reiniciar los datos de prueba.";
    }
  }
  date.addEventListener("change", render);
  status.addEventListener("change", render);
  admin
    .querySelector("[data-admin-filters-reset]")
    .addEventListener("click", () => {
      date.value = "";
      status.value = "all";
      render();
    });
  reset.addEventListener("click", () => {
    confirmation.hidden = false;
    admin.querySelector("[data-admin-keep]").focus();
  });
  admin.querySelector("[data-admin-keep]").addEventListener("click", () => {
    confirmation.hidden = true;
    reset.focus();
  });
  admin.querySelector("[data-admin-clear]").addEventListener("click", () => {
    try {
      store.clear();
      confirmation.hidden = true;
      render();
      message.textContent = "Agenda de prueba vacía.";
      reset.focus();
    } catch (problem) {
      error.textContent = problem.message;
      error.hidden = false;
    }
  });
  view.addEventListener("storage", (event) => {
    if (event.key === DEMO_KEY || event.key === null) render();
  });
  view.addEventListener("focus", render);
  render();
}
