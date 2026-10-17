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
    inView = true,
    refreshFrame = 0;
  const media = gsap.matchMedia();
  const sync = () => ambient?.paused(paused || document.hidden || !inView);
  const refresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      if (isActive()) ScrollTrigger.refresh();
    });
  };
  media.add("(prefers-reduced-motion: no-preference)", () => {
    root.dataset.motion = "gsap";
    const context = gsap.context(() => {}, root);
    const disposers = [];
    context.add(() => {
      // Defaults stay visible. Short, partial fades are applied only after GSAP loads.
      const intro = gsap.timeline({
        defaults: { duration: 0.45, ease: "power2.out" },
      });
      intro
        .from(
          ".rn-title-line",
          { y: 14, stagger: 0.07, clearProps: "transform" },
          0,
        )
        .from(
          ".rn-lead-description",
          { y: 10, opacity: 0.75, clearProps: "transform,opacity" },
          0.08,
        )
        .from(
          ".rn-lead-actions > *, .rn-lead-note",
          {
            y: 8,
            opacity: 0.75,
            stagger: 0.05,
            clearProps: "transform,opacity",
          },
          0.14,
        )
        .from(
          ".rn-focus-preview",
          {
            y: 18,
            opacity: 0.85,
            rotation: -1,
            duration: 0.6,
            clearProps: "transform,opacity",
          },
          0.06,
        )
        .from(
          ".rn-lead-draft",
          {
            y: 12,
            opacity: 0.7,
            clearProps: "transform,opacity",
          },
          0.48,
        );

      ambient = gsap
        .timeline({
          repeat: -1,
          yoyo: true,
          defaults: { duration: 5, ease: "sine.inOut" },
        })
        .to(".rn-lead-sculpture", { y: -8, rotation: 1.2, scale: 1.015 });
      ScrollTrigger.create({
        trigger: ".rn-lead-hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          sync();
        },
      });

      // Enter callbacks avoid pre-hiding content farther down the page.
      const reveal = (trigger, targets, stagger = 0.08) => {
        if (!trigger || !targets.length) return;
        ScrollTrigger.create({
          trigger,
          start: "top 96%",
          once: true,
          onEnter: () =>
            context.add(() =>
              gsap.from(targets, {
                y: 18,
                opacity: 0.8,
                duration: 0.45,
                stagger,
                ease: "power2.out",
                clearProps: "transform,opacity",
              }),
            ),
        });
      };
      const nodes = (selector) => [...root.querySelectorAll(selector)];
      reveal(
        root.querySelector(".rn-story-heading"),
        nodes(".rn-story-heading > *"),
      );
      reveal(root.querySelector(".rn-story-grid"), nodes(".rn-closeup"));
      gsap.from(".rn-step-index > span:last-child", {
        scaleX: 0.12,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".rn-story-grid",
          start: "top 92%",
          once: true,
        },
      });
      reveal(
        root.querySelector(".rn-solutions-head"),
        nodes(".rn-solutions-head > *"),
      );
      reveal(
        root.querySelector(".rn-industry-grid"),
        nodes(".rn-industry-card"),
      );
      reveal(
        root.querySelector(".rn-pricing-heading"),
        nodes(".rn-pricing-heading > *"),
        0.04,
      );
      reveal(
        root.querySelector(".rn-home-pricing .plans"),
        nodes(".rn-home-pricing .plan"),
      );
      reveal(
        root.querySelector(".rn-faq-intro"),
        nodes(".rn-faq-intro > *"),
        0.04,
      );
      reveal(
        root.querySelector(".rn-final-copy"),
        nodes(".rn-final-copy > *"),
        0.04,
      );

      const industryChange = () =>
        context.add(() => {
          gsap.from(root.querySelectorAll(".rn-industry-card"), {
            y: 12,
            opacity: 0.8,
            duration: 0.35,
            stagger: 0.06,
            clearProps: "transform,opacity",
            onComplete: refresh,
          });
        });
      root.addEventListener("relaynest:industry-change", industryChange);
      disposers.push(() =>
        root.removeEventListener("relaynest:industry-change", industryChange),
      );

      // Native details are the no-JS/reduced-motion fallback; JS adds interruptible transitions.
      const faqStates = new Map();
      const faqClick = (event) => {
        const summary = event.target.closest?.(".rn-faq-list summary");
        if (!summary || !root.contains(summary)) return;
        event.preventDefault();
        const details = summary.parentElement;
        const answer = details.querySelector(":scope > div");
        const opening = !(faqStates.get(details) ?? details.open);
        faqStates.set(details, opening);
        context.add(() => {
          const height = details.getBoundingClientRect().height;
          gsap.killTweensOf([details, answer]);
          details.open = true;
          gsap.set(details, { height: "auto" });
          const targetHeight = opening
            ? details.getBoundingClientRect().height
            : summary.getBoundingClientRect().height +
              parseFloat(getComputedStyle(details).borderTopWidth) +
              parseFloat(getComputedStyle(details).borderBottomWidth);
          gsap.set(details, { height, overflow: "hidden" });
          gsap.to(answer, { opacity: opening ? 1 : 0.35, duration: 0.18 });
          gsap.to(details, {
            height: targetHeight,
            duration: 0.28,
            ease: "power2.inOut",
            onComplete: () => {
              details.open = opening;
              faqStates.delete(details);
              gsap.set(details, { clearProps: "height,overflow" });
              gsap.set(answer, { clearProps: "opacity" });
              refresh();
            },
          });
        });
      };
      root.addEventListener("click", faqClick);
      disposers.push(() => {
        root.removeEventListener("click", faqClick);
        faqStates.forEach((open, details) => {
          details.open = open;
        });
      });
      sync();
    });
    return () => {
      disposers.forEach((dispose) => dispose());
      context.revert();
      delete root.dataset.motion;
    };
  });
  media.add(
    "(min-width: 761px) and (prefers-reduced-motion: no-preference)",
    () => {
      const context = gsap.context(() => {
        gsap.to(".rn-lead-sculpture", {
          x: -12,
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
          { y: 12 },
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
      cancelAnimationFrame(refreshFrame);
      media.revert();
    },
  };
}
