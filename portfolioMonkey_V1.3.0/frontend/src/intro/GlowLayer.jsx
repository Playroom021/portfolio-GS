import { useEffect, useRef } from "react";

// Soft light that follows the cursor (controlled by the GLOW switch)
export default function GlowLayer() {
  const ref = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.background =
          `radial-gradient(420px circle at ${e.clientX}px ${e.clientY}px, rgba(120,150,255,0.13), transparent 70%)`;
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    />
  );
}
