export async function createHomeMotion(root, isActive) {
  const noop = { dispose() {}, pause() {} };
  if (!root || !isActive()) return noop;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  if (!isActive()) return noop;
  gsap.registerPlugin(ScrollTrigger);
  let ambient,
    paused = false,
    inView = true;
  const media = gsap.matchMedia();
  const sync = () => ambient?.paused(paused || document.hidden || !inView);
  media.add("(prefers-reduced-motion: no-preference)", () => {
    root.dataset.motion = "gsap";
    const context = gsap.context(() => {
      // Animate geometry only: essential copy never waits for opacity or scroll.
      gsap.from(".rn-focus-preview", {
        y: 26,
        rotation: -2,
        duration: 0.85,
        ease: "power3.out",
        clearProps: "all",
      });
      gsap.from(".rn-preview-task", {
        x: 18,
        duration: 0.55,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "all",
      });
      ambient = gsap
        .timeline({
          repeat: -1,
          yoyo: true,
          defaults: { duration: 4.5, ease: "sine.inOut" },
        })
        .to(".rn-lead-sculpture", { y: -20, rotation: 3, scale: 1.025 }, 0)
        .to(".rn-lead-draft", { y: -9 }, 0);
      ScrollTrigger.create({
        trigger: ".rn-lead-hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          sync();
        },
      });
      root.querySelectorAll(".rn-story-step").forEach((step, index) => {
        gsap.from(step.querySelector(".rn-closeup"), {
          y: 42,
          rotation: index === 1 ? -1 : 1,
          scale: 0.97,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: "top 96%",
            end: "top 55%",
            scrub: 0.6,
          },
        });
        gsap.from(step.querySelector(".rn-step-index > span:last-child"), {
          scaleX: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: "top 95%",
            end: "top 60%",
            scrub: 0.6,
          },
        });
      });
      sync();
    }, root);
    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  });
  media.add(
    "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    () => {
      const context = gsap.context(() => {
        gsap.to(".rn-focus-preview", {
          y: -16,
          rotation: 0.8,
          ease: "none",
          scrollTrigger: {
            trigger: ".rn-lead-hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        gsap.fromTo(
          ".rn-final-art",
          { y: 14 },
          {
            y: -8,
            ease: "none",
            scrollTrigger: {
              trigger: ".rn-final-cta",
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          },
        );
      }, root);
      return () => context.revert();
    },
  );
  const refresh = () => {
    if (isActive()) ScrollTrigger.refresh();
  };
  root
    .querySelectorAll("img")
    .forEach((img) => img.addEventListener("load", refresh));
  document.fonts.ready.then(refresh);
  document.addEventListener("visibilitychange", sync);
  root.addEventListener("toggle", refresh, true);
  return {
    pause(value) {
      paused = value;
      sync();
    },
    dispose() {
      root
        .querySelectorAll("img")
        .forEach((img) => img.removeEventListener("load", refresh));
      document.removeEventListener("visibilitychange", sync);
      root.removeEventListener("toggle", refresh, true);
      media.revert();
    },
  };
}
