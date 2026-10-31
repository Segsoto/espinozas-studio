import { getReply, welcomeReply } from "./chat-engine.js";

export function initAssistant(root = document) {
  const panel = root.querySelector("#assistant-panel");
  const launcher = root.querySelector("#assistant-launcher");
  if (!panel || !launcher) return;
  const log = panel.querySelector("[data-chat-log]");
  const options = panel.querySelector("[data-chat-options]");
  const form = panel.querySelector("form");
  const input = form.querySelector("input");
  const doc = panel.ownerDocument;
  let initialized = false;
  let state = {};
  let previousFocus;

  function message(text, type) {
    const item = doc.createElement("div");
    item.className = `chat-message chat-message--${type}`;
    const label = doc.createElement("span");
    label.className = "chat-message__label";
    label.textContent = type === "user" ? "Vos" : "Asistente del estudio";
    const paragraph = doc.createElement("p");
    paragraph.textContent = text;
    item.append(label, paragraph);
    log.append(item);
    // Keep this transient conversation bounded and out of persistent storage.
    while (log.children.length > 30) log.firstElementChild.remove();
    return item;
  }

  function reply(response) {
    const item = message(response.text, "bot");
    if (response.actions?.length) {
      const actions = doc.createElement("div");
      actions.className = "chat-actions";
      for (const action of response.actions) {
        const anchor = doc.createElement("a");
        anchor.textContent = action.label;
        anchor.href = action.href;
        if (action.external) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }
        actions.append(anchor);
      }
      item.append(actions);
    }
    options.replaceChildren();
    for (const choice of response.choices || []) {
      const button = doc.createElement("button");
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", (event) => {
        ask(choice);
        if (event.detail === 0)
          (options.querySelector("button") || input).focus({
            preventScroll: true,
          });
      });
      options.append(button);
    }
    state = response.state || {};
    log.scrollTop = log.scrollHeight;
  }

  function ask(text) {
    const query = text.trim().slice(0, 240);
    if (!query) return;
    message(query, "user");
    reply(getReply(query, state));
    input.value = "";
  }

  function open(topic = "") {
    previousFocus = doc.activeElement;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!initialized) {
      reply(welcomeReply());
      initialized = true;
    }
    if (topic) ask(topic);
    input.focus({ preventScroll: true });
  }

  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    else launcher.focus({ preventScroll: true });
  }

  launcher.addEventListener("click", () => (panel.hidden ? open() : close()));
  panel.querySelector("[data-chat-close]").addEventListener("click", close);
  panel.querySelector("[data-chat-reset]").addEventListener("click", () => {
    log.replaceChildren();
    reply(welcomeReply());
    input.focus({ preventScroll: true });
  });
  root.querySelectorAll("[data-open-assistant]").forEach((button) => {
    button.addEventListener("click", () =>
      open(button.dataset.chatTopic || ""),
    );
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });
  // An explicit link remains available when JavaScript cannot initialize.
  launcher.hidden = false;
  return { open, close };
}
