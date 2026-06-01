/**
 * useReveal — scroll-reveal hook using IntersectionObserver.
 *
 * Returns a ref to attach to any element. When the element enters the
 * viewport, it gets a CSS class that triggers the reveal animation.
 *
 * Usage:
 *   import useReveal from "../lib/useReveal";
 *   const ref = useReveal();
 *   <div ref={ref} className="reveal">...</div>
 *
 * CSS (injected once by RevealStyles):
 *   .reveal { opacity: 0; transform: translateY(24px); transition: ... }
 *   .reveal.visible { opacity: 1; transform: translateY(0); }
 */

import React, { useEffect, useRef } from "react";

export default function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * <Reveal> wrapper — wraps any children with scroll-reveal.
 * Usage: <Reveal><section>...</section></Reveal>
 * Or:    <Reveal type="left"><div>...</div></Reveal>
 * Types: "up" (default), "left", "right", "scale"
 * Delay: <Reveal delay={200}>...</Reveal> (ms)
 */
export function Reveal({ children, type = "up", delay = 0, style = {} }) {
  const ref = useReveal();
  const cls = type === "up" ? "reveal" : type === "left" ? "reveal-left" : type === "right" ? "reveal-right" : "reveal-scale";
  return (
    <div ref={ref} className={cls} style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}>
      {children}
    </div>
  );
}

/**
 * RevealStyles — inject the CSS once. Drop this in App or main.
 */
export function RevealStyles() {
  return (
    <style>{`
      .reveal {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .reveal-left {
        opacity: 0;
        transform: translateX(-30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .reveal-left.visible {
        opacity: 1;
        transform: translateX(0);
      }
      .reveal-right {
        opacity: 0;
        transform: translateX(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .reveal-right.visible {
        opacity: 1;
        transform: translateX(0);
      }
      .reveal-scale {
        opacity: 0;
        transform: scale(0.95);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .reveal-scale.visible {
        opacity: 1;
        transform: scale(1);
      }
    `}</style>
  );
}
