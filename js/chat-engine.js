import { business, normalizeText, whatsappUrl } from "../data/business.js";

const choices = [
  "Servicios",
  "Reservar una cita",
  "Días y horarios",
  "Ubicación",
  "Precios",
];
const services = ["Cabello", "Maquillaje", "Cuidado capilar", "Todavía no sé"];
const whatsapp = (label, service = "") => ({
  label,
  href: whatsappUrl(service),
  external: true,
});
const link = (label, href) => ({ label, href });

export function welcomeReply() {
  return {
    text: "Hola. Soy el asistente guiado de Espinoza’s. Te ayudo a explorar servicios y preparar tu consulta. La disponibilidad y las citas las confirma el estudio por WhatsApp.",
    choices,
  };
}

/** Deterministic local responses. No API, personal-data storage or reservation system. */
export function getReply(input, state = {}) {
  const text = normalizeText(input).slice(0, 240);
  const has = (...words) => words.some((word) => text.includes(word));
  if (!text) return { ...welcomeReply(), state: {} };
  if (has("precio", "costo", "cuanto", "tarifa", "cotiza", "cobran")) {
    return {
      text: "El estudio confirma el precio según el servicio que querés consultar. No tengo una lista de precios publicada. Podés pedir una cotización antes de reservar.",
      actions: [whatsapp("Consultar un precio", state.service)],
      choices: ["Cabello", "Maquillaje", "Cuidado capilar"],
      state,
    };
  }
  if (
    has(
      "horario",
      "abren",
      "cierran",
      "dias",
      "sabado",
      "domingo",
      "lunes",
      "hoy",
      "manana",
    )
  ) {
    return {
      text: `${business.days} es lo que publica el estudio. Consultá la hora y disponibilidad de tu visita por WhatsApp; no tengo acceso a una agenda en tiempo real.`,
      actions: [whatsapp("Consultar disponibilidad", state.service)],
      choices: ["Ubicación", "Servicios"],
      state,
    };
  }
  if (
    has(
      "ubicacion",
      "direccion",
      "donde",
      "llegar",
      "waze",
      "alajuela",
      "parqueo",
    )
  ) {
    return {
      text: "El estudio está en Alajuela, Costa Rica. Su perfil indica buscar “Espinoza’s Hair” en Waze. Confirmá el punto de llegada con el estudio antes de tu visita.",
      actions: [
        { label: "Buscar en Waze", href: business.waze, external: true },
        whatsapp("Confirmar cómo llegar"),
      ],
      choices: ["Días y horarios", "Reservar una cita"],
      state,
    };
  }
  if (
    has("cabello", "babylight", "pelo", "color", "ondas", "peinado") &&
    !has("cuidado", "producto", "rutina", "capilar")
  ) {
    return {
      text: "Podés consultar por diseño de cabello, color y babylights con Nathalie. Compartí la idea que buscás y contá si ya tenés color o tratamientos previos. El estudio confirma las opciones y disponibilidad.",
      actions: [
        link("Ver cabello e inspiración", "/cabello"),
        whatsapp("Consultar mi cita de cabello", "diseño de cabello"),
      ],
      choices: ["Precios", "Días y horarios"],
      state: { service: "diseño de cabello" },
    };
  }
  if (has("maquill", "makeup", "evento", "ocasion")) {
    return {
      text: "Para maquillaje, compartí tu ocasión, la fecha y una referencia del estilo que te gusta. El estudio te confirma qué opciones y horarios tiene disponibles.",
      actions: [
        link("Explorar maquillaje", "/maquillaje"),
        whatsapp("Consultar mi cita de maquillaje", "maquillaje"),
      ],
      choices: ["Precios", "Días y horarios"],
      state: { service: "maquillaje" },
    };
  }
  if (has("cuidado", "producto", "rutina", "capilar")) {
    return {
      text: "Espinoza’s comparte orientación para el cuidado del cabello en casa y los productos según tu tipo de cabello. Consultá la disponibilidad y los precios directamente con el estudio.",
      actions: [
        link("Ver cuidado capilar", "/cuidado-capilar"),
        whatsapp(
          "Consultar por cuidado capilar",
          "cuidado del cabello en casa",
        ),
      ],
      choices: ["Precios", "Servicios"],
      state: { service: "cuidado del cabello en casa" },
    };
  }
  if (
    has("servicio", "ofrecen", "hacen", "opciones", "catalogo", "inspiracion")
  ) {
    return {
      text: "¿Qué te gustaría explorar? Puedo orientarte sobre cabello, maquillaje y cuidado capilar.",
      choices: services,
      actions: [link("Abrir catálogo", "/catalogo")],
      state: {},
    };
  }
  if (has("no se", "todavia", "ayuda", "orienta")) {
    return {
      text: "Podés empezar por el catálogo y elegir una referencia. Si preferís conversar primero, escribile al estudio y contale qué te gustaría cambiar.",
      actions: [
        link("Buscar inspiración", "/catalogo"),
        whatsapp("Conversar con el estudio"),
      ],
      choices,
      state: {},
    };
  }
  if (has("cita", "reserv", "agenda", "whatsapp", "contact", "telefono")) {
    return {
      text: "La reserva se coordina con el estudio por WhatsApp. ¿Qué servicio te interesa? Si ya lo tenés claro, podés abrir una consulta preparada y agregar allí la fecha que preferís.",
      choices: services,
      actions: [whatsapp("Continuar en WhatsApp", state.service)],
      state,
    };
  }
  if (has("hola", "buenas", "buenos", "gracias", "inicio"))
    return { ...welcomeReply(), state: {} };
  return {
    text: "Puedo orientarte sobre servicios, precios a consultar, días de atención y ubicación. Para una pregunta específica, lo mejor es conversar con el estudio.",
    choices,
    actions: [whatsapp("Hacer mi consulta al estudio", state.service)],
    state,
  };
}
