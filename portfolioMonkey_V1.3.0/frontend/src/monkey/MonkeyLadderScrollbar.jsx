import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { clamp } from "./helpers";
import { isScrollLocked } from "./scrollLock";

// Section ids are the existing anchors used by the sidebar.
const SECTIONS = [
  ["home", "Home"],
  ["projects", "Projects"],
  ["achievements", "Achievements"],
  ["about", "About me"],
  ["reviews", "Reviews"],
];

/**
 * Right-edge ladder that mirrors the real page scroll position.
 * - The monkey itself is the shared MonkeyActor; this component reports the
 *   point on the ladder where it should be (onSync / getPoint).
 * - Mouse/touch: press or drag on the ladder to scroll.
 * - Keyboard: focus the ladder, then Arrow/Page/Home/End keys.
 * - The small ticks are real links to the page sections.
 */
const MonkeyLadderScrollbar = forwardRef(function MonkeyLadderScrollbar(
  { metrics, onSync, inert = false },
  ref
) {
  const [ticks, setTicks] = useState([]);
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const live = useRef({ moving: false, timer: 0, raf: 0, dragging: false });
  const metricsRef = useRef(metrics);
  const onSyncRef = useRef(onSync);

  useEffect(() => {
    metricsRef.current = metrics;
    onSyncRef.current = onSync;
  });

  const geometry = useCallback(() => {
    const m = metricsRef.current;
    const half = m.size / 2;
    return {
      y0: m.railTop + half,
      y1: window.innerHeight - m.railBottom - half,
      x: window.innerWidth - m.railRight - m.railWidth / 2,
    };
  }, []);

  const maxScroll = () =>
    Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const getPoint = useCallback(() => {
    const g = geometry();
    const p = clamp(window.scrollY / maxScroll());
    return { x: g.x, y: g.y0 + p * (g.y1 - g.y0), progress: p, moving: live.current.moving };
  }, [geometry]);

  useImperativeHandle(ref, () => ({ getPoint }), [getPoint]);

  const emit = useCallback(() => {
    const pt = getPoint();
    if (fillRef.current) fillRef.current.style.transform = `scaleY(${pt.progress})`;
    if (railRef.current) {
      railRef.current.setAttribute("aria-valuenow", String(Math.round(pt.progress * 100)));
    }
    onSyncRef.current?.(pt);
  }, [getPoint]);

  const computeTicks = useCallback(() => {
    const g = geometry();
    const max = maxScroll();
    const next = [];
    for (const [id, label] of SECTIONS) {
      const node = document.getElementById(id);
      if (!node) continue;
      const top = node.getBoundingClientRect().top + window.scrollY;
      next.push({ id, label, y: g.y0 + clamp(top / max) * (g.y1 - g.y0) });
    }
    setTicks(next);
  }, [geometry]);

  useEffect(() => {
    const state = live.current;
    const onScroll = () => {
      state.moving = true;
      clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        state.moving = false;
        emit();
      }, 150);
      if (!state.raf) {
        state.raf = requestAnimationFrame(() => {
          state.raf = 0;
          emit();
        });
      }
    };
    const onResize = () => {
      computeTicks();
      emit();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize); // page height changes (fonts, images)
    ro.observe(document.body);
    emit();
    computeTicks();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(state.raf);
      clearTimeout(state.timer);
      state.raf = 0;
    };
  }, [emit, computeTicks]);

  useEffect(() => {
    computeTicks();
    emit();
  }, [metrics, computeTicks, emit]);

  const seek = (clientY) => {
    if (isScrollLocked()) return; // mandatory events own the scroll position
    const g = geometry();
    const ratio = clamp((clientY - g.y0) / (g.y1 - g.y0));
    window.scrollTo({ top: ratio * maxScroll(), behavior: "instant" });
  };

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    live.current.dragging = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    seek(e.clientY);
  };
  const onPointerMove = (e) => {
    if (live.current.dragging) seek(e.clientY);
  };
  const endDrag = (e) => {
    live.current.dragging = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e) => {
    if (isScrollLocked()) return;
    const page = window.innerHeight * 0.9;
    const map = {
      ArrowUp: () => window.scrollBy({ top: -80, behavior: "instant" }),
      ArrowDown: () => window.scrollBy({ top: 80, behavior: "instant" }),
      PageUp: () => window.scrollBy({ top: -page, behavior: "instant" }),
      PageDown: () => window.scrollBy({ top: page, behavior: "instant" }),
      Home: () => window.scrollTo({ top: 0, behavior: "instant" }),
      End: () => window.scrollTo({ top: maxScroll(), behavior: "instant" }),
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]();
    }
  };

  return (
    <nav className="ladder" aria-label="Page ladder" inert={inert}>
      <div
        ref={railRef}
        className="ladder-rail"
        role="scrollbar"
        aria-orientation="vertical"
        aria-controls="gs-main"
        aria-label="Page position ladder. Use arrow keys, Page Up, Page Down, Home or End to scroll."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        tabIndex={0}
        style={{
          right: metrics.railRight,
          top: metrics.railTop,
          bottom: metrics.railBottom,
          width: metrics.railWidth,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <span ref={fillRef} className="ladder-fill" />
      </div>

      {ticks.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className="ladder-tick"
          style={{ top: t.y, right: metrics.railRight + metrics.railWidth + 6 }}
          aria-label={`Jump to ${t.label}`}
        >
          <span className="ladder-tick-label">{t.label}</span>
          <span className="ladder-tick-dot" />
        </a>
      ))}
    </nav>
  );
});

export default MonkeyLadderScrollbar;
