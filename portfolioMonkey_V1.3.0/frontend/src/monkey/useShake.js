import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Optional shake-to-drop-the-battery. Nothing is requested automatically:
 * the visitor has to press the "Enable shake" button in the control board.
 */
export default function useShake(onShake) {
  const [enabled, setEnabled] = useState(false);
  const cb = useRef(onShake);

  useEffect(() => {
    cb.current = onShake;
  });

  const supported =
    typeof window !== "undefined" &&
    "DeviceMotionEvent" in window &&
    window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (!enabled) return undefined;
    let lastFire = 0;
    let hits = 0;
    let lastHit = 0;

    const handler = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const magnitude = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
      const now = Date.now();
      if (Math.abs(magnitude - 9.8) > 14) {
        hits = now - lastHit < 700 ? hits + 1 : 1;
        lastHit = now;
        if (hits >= 3 && now - lastFire > 4000) {
          lastFire = now;
          hits = 0;
          cb.current?.();
        }
      }
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [enabled]);

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    try {
      const D = window.DeviceMotionEvent;
      if (typeof D?.requestPermission === "function") {
        const result = await D.requestPermission();
        if (result !== "granted") return;
      }
      setEnabled(true);
    } catch {
      /* permission denied or unsupported - the latch still works */
    }
  }, [enabled]);

  return { supported, enabled, toggle };
}
