export const DEMO_KEY = "espinozas.agenda-demo.v1";
export const demoServices = Object.freeze({
  cabello: "Diseño de cabello",
  maquillaje: "Maquillaje",
  cuidado: "Cuidado capilar",
});
export const demoTimes = Object.freeze([
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
]);

export function costaRicaClock(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Costa_Rica",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function addDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function formatDemoDate(date) {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "UTC",
    dateStyle: "medium",
  }).format(new Date(`${date}T12:00:00Z`));
}

/** A local demonstration, not a shared booking database or authenticated admin. */
export function createDemoStore(
  storage,
  {
    now = () => new Date(),
    id = () =>
      `DEMO-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  } = {},
) {
  function read() {
    let raw;
    try {
      raw = storage.getItem(DEMO_KEY);
    } catch {
      throw new Error(
        "El navegador no permite guardar la agenda de prueba. Habilitá el almacenamiento local para probarla.",
      );
    }
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (
        data.version !== 1 ||
        !Array.isArray(data.appointments) ||
        !data.appointments.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            Object.hasOwn(demoServices, item.service) &&
            validDate(item.date) &&
            demoTimes.includes(item.time) &&
            ["booked", "cancelled"].includes(item.status),
        )
      )
        throw new Error();
      return data.appointments;
    } catch {
      throw new Error(
        "No se pudieron leer los datos de prueba. Podés vaciar la agenda desde el panel demo.",
      );
    }
  }
  function write(appointments) {
    try {
      storage.setItem(DEMO_KEY, JSON.stringify({ version: 1, appointments }));
    } catch {
      throw new Error(
        "No se pudo guardar el cambio. Revisá el almacenamiento del navegador e intentá de nuevo.",
      );
    }
  }
  function bounds() {
    const clock = costaRicaClock(now());
    return { min: clock.date, max: addDays(clock.date, 30) };
  }
  function dateAllowed(date) {
    const range = bounds();
    return (
      validDate(date) &&
      date >= range.min &&
      date <= range.max &&
      new Date(`${date}T12:00:00Z`).getUTCDay() !== 0
    );
  }
  function slots(date) {
    if (!dateAllowed(date)) return [];
    const clock = costaRicaClock(now());
    const appointments = read();
    return demoTimes.map((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const past = date === clock.date && hour * 60 + minute <= clock.minutes;
      const booked = appointments.some(
        (item) =>
          item.status === "booked" && item.date === date && item.time === time,
      );
      return {
        time,
        available: !past && !booked,
        reason: past ? "Ya pasó" : booked ? "Apartado" : "Disponible",
      };
    });
  }
  function book({ name, service, date, time }) {
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 60
    )
      throw new Error("Ingresá un nombre de prueba de 2 a 60 caracteres.");
    if (!Object.hasOwn(demoServices, service))
      throw new Error("Elegí un servicio para la demo.");
    if (!dateAllowed(date))
      throw new Error(
        "Elegí una fecha de lunes a sábado dentro de los próximos 30 días.",
      );
    if (!slots(date).some((slot) => slot.time === time && slot.available))
      throw new Error(
        "Ese horario ya no está disponible. Elegí otro turno de prueba.",
      );
    const appointments = read();
    const appointment = {
      id: id(),
      name: name.trim(),
      service,
      date,
      time,
      status: "booked",
      createdAt: now().toISOString(),
    };
    write([...appointments, appointment]);
    return appointment;
  }
  function cancel(appointmentId) {
    const appointments = read();
    const item = appointments.find(
      (appointment) => appointment.id === appointmentId,
    );
    if (!item) throw new Error("Esa cita de prueba ya no existe.");
    item.status = "cancelled";
    write(appointments);
    return item;
  }
  function clear() {
    try {
      storage.removeItem(DEMO_KEY);
    } catch {
      throw new Error("No se pudo vaciar la agenda de prueba.");
    }
  }
  return { list: read, bounds, slots, book, cancel, clear };
}
