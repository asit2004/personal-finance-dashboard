"use client";

import { useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

// Returns a ref (not state) so consumers can read latest values inside
// animation loops without triggering React re-renders on every mousemove.
export function useMousePosition() {
  const ref = useRef<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      ref.current = {
        x: e.clientX,
        y: e.clientY,
        normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
        normalizedY: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return ref;
}
