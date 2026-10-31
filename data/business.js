export const business = Object.freeze({
  name: "Espinoza’s Hair & Makeup Studio",
  owner: "Nathalie Espinoza",
  phone: "50687030236",
  phoneDisplay: "+506 8703-0236",
  location: "Alajuela, Costa Rica",
  days: "Lunes a sábado",
  instagram: "https://www.instagram.com/espinozas_hairandmakeup_studio/",
  waze: "https://www.waze.com/ul?q=Espinoza%27s%20Hair%20Alajuela",
  origin: "https://espinozas-premium.vercel.app",
});

export function whatsappUrl(service = "", detail = "") {
  let message = "Hola, quiero consultar una cita en Espinoza’s Studio.";
  if (service) message += ` Me interesa ${service}.`;
  if (detail) message += ` Mi referencia es: ${detail}.`;
  return `https://wa.me/${business.phone}?text=${encodeURIComponent(message)}`;
}

export function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
