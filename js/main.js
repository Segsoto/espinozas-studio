import { initNavigation } from "./navigation.js";
import { initMotion } from "./motion.js";
import { initCatalog } from "./catalog.js";
import { initAssistant } from "./assistant.js";
import { initBooking } from "./booking.js";
import { initDemoAgenda } from "./demo-agenda.js";
import { initLookbook } from "./lookbook.js";

document.documentElement.classList.replace("no-js", "js");

// Each feature is independent: a failure must not disable other controls.
for (const initialize of [
  initNavigation,
  initMotion,
  initCatalog,
  initAssistant,
  initBooking,
  initDemoAgenda,
  initLookbook,
]) {
  try {
    initialize();
  } catch (error) {
    console.error("No se pudo iniciar una función del sitio.", error);
  }
}
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
