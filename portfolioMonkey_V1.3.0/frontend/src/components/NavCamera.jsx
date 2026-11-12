import { useEffect, useRef } from "react";

/**
 * Decorative security camera mounted on the edge of the navigation bar.
 * Its head eases towards the latest pointer / touch position (clamped to +-40deg).
 * Purely visual: it never touches the real camera, never stores or sends
 * pointer data, and ignores pointer events itself so it can't block any link.
 */
const LIMIT = 40;

export default function NavCamera() {
  const root = useRef(null);
  const head = useRef(null);
  const pupil = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = { target: 0, cur: 0, px: 0, py: 0, ox: 0, oy: 0, raf: 0, queued: false };

    const frame = () => {
      s.raf = 0;
      const k = reduce ? 1 : 0.14;
      s.cur += (s.target - s.cur) * k;
      if (head.current) head.current.style.transform = `rotate(${s.cur.toFixed(2)}deg)`;
      if (pupil.current) pupil.current.style.transform = `translate(${s.ox}px, ${s.oy}px)`;
      if (Math.abs(s.target - s.cur) > 0.05) s.raf = requestAnimationFrame(frame);
    };

    const update = () => {
      s.queued = false;
      const r = root.current?.getBoundingClientRect();
      if (!r || r.width === 0) return; // hidden on small screens
      const cx = r.left + r.width * 0.25;
      const cy = r.top + r.height / 2;
      const dx = s.px - cx;
      const dy = s.py - cy;
      const deg = (Math.atan2(dy, Math.abs(dx) < 1 ? 1 : dx) * 180) / Math.PI;
      s.target = Math.max(-LIMIT, Math.min(LIMIT, dx < 0 ? Math.sign(dy || 1) * LIMIT : deg));
      s.ox = Math.max(-1.5, Math.min(1.5, dx / 200));
      s.oy = Math.max(-1.5, Math.min(1.5, dy / 200));
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    // one rAF-throttled listener; mouse, pen and touch all arrive as pointer events
    const onPointer = (e) => {
      s.px = e.clientX;
      s.py = e.clientY;
      if (!s.queued) {
        s.queued = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      cancelAnimationFrame(s.raf);
    };
  }, []);

  return (
    <div
      ref={root}
      className="nav-camera hidden md:block"
      aria-hidden="true"
      title=""
    >
      <svg viewBox="0 0 60 48" width="60" height="48" focusable="false">
        <defs>
          <linearGradient id="cam-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a4a4a" />
            <stop offset="1" stopColor="#242424" />
          </linearGradient>
          <radialGradient id="cam-glass" cx="35%" cy="35%" r="75%">
            <stop offset="0" stopColor="#5b7cff" />
            <stop offset="0.45" stopColor="#14214d" />
            <stop offset="1" stopColor="#05070f" />
          </radialGradient>
        </defs>

        {/* wall plate + arm */}
        <rect x="0" y="8" width="7" height="32" rx="2" fill="#2b2b2b" stroke="#4a4a4a" strokeWidth="1" />
        <circle cx="3.5" cy="14" r="1.1" fill="#777" />
        <circle cx="3.5" cy="34" r="1.1" fill="#777" />
        <rect x="6" y="21" width="9" height="6" rx="2" fill="#333" stroke="#4a4a4a" strokeWidth="0.8" />

        {/* head (rotates around the arm joint) */}
        <g ref={head} className="nav-camera-head">
          <g className="nav-camera-sway">
            <rect x="13" y="13" width="34" height="22" rx="6" fill="url(#cam-body)" stroke="#5a5a5a" strokeWidth="1" />
            <rect x="15" y="15" width="24" height="3" rx="1.5" fill="#fff" opacity="0.08" />
            {/* lens hood + lens */}
            <rect x="42" y="16" width="10" height="16" rx="3" fill="#1d1d1d" stroke="#505050" strokeWidth="1" />
            <circle cx="47" cy="24" r="6.4" fill="#0a0a0a" stroke="#6a6a6a" strokeWidth="1" />
            <circle cx="47" cy="24" r="4.6" fill="url(#cam-glass)" />
            <circle ref={pupil} cx="46" cy="23" r="1.2" fill="#cfe0ff" opacity="0.9" />
            {/* indicator light */}
            <circle className="nav-camera-led" cx="21" cy="19.5" r="1.8" fill="#ff4d4d" />
          </g>
        </g>
      </svg>
    </div>
  );
}
