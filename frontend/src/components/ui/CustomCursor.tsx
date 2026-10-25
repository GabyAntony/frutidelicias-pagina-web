"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState("¡Probar!");
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const ringX = useSpring(mx, { stiffness: 170, damping: 22, mass: 0.6 });
  const ringY = useSpring(my, { stiffness: 170, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    function onPointerMove(event: PointerEvent) {
      mx.set(event.clientX);
      my.set(event.clientY);
    }

    function onPointerOver(event: PointerEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      if (target) {
        setActive(true);
        setLabel(target.getAttribute("data-cursor-label") || "¡Probar!");
      } else {
        setActive(false);
      }
    }

    function onLeave() {
      setActive(false);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my, reduce]);

  return (
    <div
      aria-hidden
      className="custom-cursor-root pointer-events-none fixed inset-0 z-[120]"
    >
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <AnimatePresence>
          {active ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] items-center justify-center rounded-full border border-chocolate/20 bg-amarillo text-center font-sans text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-chocolate shadow-warm"
            >
              {label}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
