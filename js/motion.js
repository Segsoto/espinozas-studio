export function initMotion(root = document) {
  const view = root.defaultView;
  const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in view)) return;
  const frames = [...root.querySelectorAll("[data-zoom]")];
  const visible = new Set();
  const values = new Map(
    frames.map((frame) => [frame, { current: 1, target: 1 }]),
  );
  const reveals = [...root.querySelectorAll("[data-reveal]")];
  const progress = root.querySelector(".reading-progress");
  let frameId = 0;
  let measure = true;
  let lastTime = 0;

  function render(time) {
    frameId = 0;
    if (preference.matches) return;
    if (measure) {
      for (const frame of visible) {
        const rect = frame.getBoundingClientRect();
        const position = Math.max(
          0,
          Math.min(
            1,
            (view.innerHeight - rect.top) / (view.innerHeight + rect.height),
          ),
        );
        values.get(frame).target = 1 + position * 0.09;
      }
      const range = root.documentElement.scrollHeight - view.innerHeight;
      if (progress)
        progress.style.transform = `scaleX(${range > 0 ? Math.max(0, Math.min(1, view.scrollY / range)) : 0})`;
      measure = false;
    }
    const elapsed = lastTime ? Math.min(50, time - lastTime) : 16;
    const alpha = 1 - Math.exp(-elapsed / 85);
    lastTime = time;
    let moving = false;
    for (const frame of visible) {
      const value = values.get(frame);
      value.current += (value.target - value.current) * alpha;
      if (Math.abs(value.target - value.current) > 0.0001) moving = true;
      else value.current = value.target;
      frame.style.setProperty("--zoom", value.current.toFixed(4));
    }
    if (moving) frameId = view.requestAnimationFrame(render);
    else lastTime = 0;
  }
  function schedule() {
    if (!preference.matches && !frameId)
      frameId = view.requestAnimationFrame(render);
  }
  const imageObserver = new view.IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        entry.isIntersecting
          ? visible.add(entry.target)
          : visible.delete(entry.target);
      measure = true;
      schedule();
    },
    { rootMargin: "60px 0px" },
  );
  frames.forEach((frame) => imageObserver.observe(frame));
  const revealObserver = new view.IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.classList.remove("will-reveal");
          revealObserver.unobserve(entry.target);
        }
    },
    { threshold: 0.08 },
  );
  // Never hide text that is already in view or when reduced motion is requested.
  for (const element of reveals) {
    if (
      !preference.matches &&
      element.getBoundingClientRect().top > view.innerHeight
    )
      element.classList.add("will-reveal");
    revealObserver.observe(element);
  }
  const onScroll = () => {
    measure = true;
    schedule();
  };
  view.addEventListener("scroll", onScroll, { passive: true });
  view.addEventListener("resize", onScroll, { passive: true });
  preference.addEventListener("change", () => {
    if (frameId) view.cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
    reveals.forEach((element) => element.classList.remove("will-reveal"));
    if (preference.matches) {
      frames.forEach((frame) => {
        frame.style.removeProperty("--zoom");
        values.set(frame, { current: 1, target: 1 });
      });
      if (progress) progress.style.transform = "scaleX(0)";
    } else onScroll();
  });
  schedule();
}
