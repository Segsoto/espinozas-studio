export const categories = [
  { id: "todos", label: "Todo" },
  { id: "cabello", label: "Cabello" },
  { id: "maquillaje", label: "Maquillaje" },
  { id: "cuidado", label: "Cuidado capilar" },
];

export const catalog = [
  {
    id: "color",
    title: "Color & babylights",
    category: "cabello",
    label: "CABELLO",
    image: "/assets/salon-1200.webp",
    small: "/assets/salon-600.webp",
    width: 1200,
    height: 801,
    alt: "Inspiración editorial: cabello rubio liso durante una sesión de peinado",
    credit: "Fotografía editorial de inspiración · Adam Winger / Unsplash",
    description:
      "Una referencia para conversar sobre el color y el acabado que buscás. Consultá por color y babylights; el estudio te orienta según tu cabello y su estado actual.",
    note: "Esta imagen es una referencia editorial, no un trabajo del estudio ni una promesa de resultado.",
    service: "color y babylights",
    href: "/cabello#color",
    tags: "color rubio babylights cabello iluminacion liso",
  },
  {
    id: "movimiento",
    title: "Textura & movimiento",
    category: "cabello",
    label: "INSPIRACIÓN DE CABELLO",
    image: "/assets/natural-1200.webp",
    small: "/assets/natural-600.webp",
    width: 1200,
    height: 1800,
    alt: "Retrato editorial de una mujer con cabello suelto y ondas suaves",
    credit: "Fotografía editorial de inspiración · Unsplash",
    description:
      "Guardá la idea de un cabello con movimiento para tu conversación con Nathalie. Compartí el estilo que te gusta y consultá las opciones del estudio.",
    note: "Esta imagen es una referencia editorial. Las opciones y el acabado se conversan con el estudio.",
    service: "diseño de cabello",
    href: "/cabello",
    tags: "cabello ondas textura movimiento estilo natural peinado",
  },
  {
    id: "maquillaje",
    title: "Tu ocasión, tu maquillaje",
    category: "maquillaje",
    label: "MAQUILLAJE",
    image: "/assets/makeup-1000.webp",
    small: "/assets/makeup-600.webp",
    width: 1000,
    height: 1500,
    alt: "Inspiración editorial: aplicación de maquillaje con una brocha",
    credit: "Fotografía editorial de inspiración · Alexander Mass / Unsplash",
    description:
      "Compartí una referencia del maquillaje que tenés en mente, tu ocasión y la fecha. El estudio confirma las opciones y la disponibilidad para tu visita.",
    note: "Imagen editorial de referencia; no representa una clienta ni un trabajo realizado por el estudio.",
    service: "maquillaje",
    href: "/maquillaje",
    tags: "maquillaje evento ocasion rostro belleza makeup",
  },
  {
    id: "cuidado",
    title: "El cuidado sigue en casa",
    category: "cuidado",
    label: "DESDE EL ESTUDIO",
    image: "/assets/care.webp",
    small: "/assets/care.webp",
    width: 1080,
    height: 1348,
    alt: "Publicación oficial de Espinoza’s sobre el cuidado del cabello en casa",
    credit: "Publicación del Instagram oficial de Espinoza’s Studio",
    description:
      "El estudio comparte orientación sobre productos para tu tipo de cabello y el cuidado después de la visita. Consultá cuáles opciones tienen disponibles.",
    note: "Publicación oficial del estudio. La disponibilidad y los precios de los productos se confirman directamente.",
    service: "cuidado del cabello en casa",
    href: "/cuidado-capilar",
    source: "https://www.instagram.com/p/DemcOSgFo-Y/",
    tags: "cuidado capilar casa productos rutina cabello",
  },
];

export function filterCatalog(category = "todos", query = "") {
  const normal = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const words = normal(query).trim().split(/\s+/).filter(Boolean);
  return catalog.filter(
    (item) =>
      (category === "todos" || item.category === category) &&
      words.every((word) =>
        normal(`${item.title} ${item.tags}`).includes(word),
      ),
  );
}
