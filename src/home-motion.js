export async function createHomeMotion(root, isActive) {
  const noop = { dispose() {}, pause() {} };
  if (
    !root ||
    !isActive() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return noop;
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
      gsap.from(".rn-hero-copy > :not(.rn-sr-only)", {
        y: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all",
      });
      gsap.from(".rn-tablet-wrap", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out",
        clearProps: "all",
      });
      ambient = gsap
        .timeline({
          repeat: -1,
          yoyo: true,
          defaults: { duration: 5, ease: "sine.inOut" },
        })
        .to(".rn-ribbon-motion", { y: -12, rotation: 0.8, scale: 1.015 }, 0)
        .to(".rn-floating-followup", { y: -10 }, 0);
      ScrollTrigger.create({
        trigger: ".rn-hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          sync();
        },
      });
      root.querySelectorAll(".rn-reveal").forEach((element) => {
        gsap.from(element, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: element, start: "top 94%", once: true },
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
        // Animate each frame as a whole without cropping or pinning a partial dashboard.
        gsap.to(".rn-device", {
          rotation: 0.5,
          y: -12,
          ease: "none",
          scrollTrigger: {
            trigger: ".rn-hero-scene",
            start: "top 75%",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.fromTo(
          ".rn-dark-console",
          { rotateX: 9, rotateY: -6, rotateZ: 2, y: 22 },
          {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".rn-dark-stage",
              start: "top 95%",
              end: "center 45%",
              scrub: 1,
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
      media.revert();
    },
  };
}
