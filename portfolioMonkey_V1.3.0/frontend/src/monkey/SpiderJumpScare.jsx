import { useEffect, useMemo, useRef } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

/* Spider drawn top-down (head up). Eight jointed legs, eight glossy eyes, fangs. */
const LEGS = [
  // [name, proximal path, distal path, joint x, joint y]
  ["l1", "M89 72 L58 44", "M58 44 L30 20 L8 26", 89, 72],
  ["l2", "M85 82 L50 68", "M50 68 L20 56 L3 68", 85, 82],
  ["l3", "M85 94 L48 104", "M48 104 L18 110 L4 134", 85, 94],
  ["l4", "M89 106 L58 132", "M58 132 L36 158 L28 192", 89, 106],
];

export function SpiderSvg({ still = false }) {
  const legs = LEGS.flatMap(([name, prox, dist, ox, oy]) => [
    { key: `${name}-L`, side: "L", name, prox, dist, ox, oy },
    { key: `${name}-R`, side: "R", name, prox, dist, ox: 200 - ox, oy },
  ]);
  return (
    <svg
      className={`sp-svg ${still ? "is-still" : ""}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sp-abd" cx="42%" cy="35%" r="75%">
          <stop offset="0" stopColor="#3b3029" />
          <stop offset="0.55" stopColor="#15110e" />
          <stop offset="1" stopColor="#050403" />
        </radialGradient>
        <radialGradient id="sp-ceph" cx="42%" cy="30%" r="80%">
          <stop offset="0" stopColor="#40342b" />
          <stop offset="1" stopColor="#0b0907" />
        </radialGradient>
      </defs>

      {legs.map((l) => (
        <g
          key={l.key}
          className={`sp-leg sp-${l.name} sp-side-${l.side}`}
          style={{ transformOrigin: `${l.ox}px ${l.oy}px` }}
          transform={l.side === "R" ? "translate(200 0) scale(-1 1)" : undefined}
        >
          <path d={l.prox} fill="none" stroke="#0a0806" strokeWidth="6.5" strokeLinecap="round" />
          <path d={l.dist} fill="none" stroke="#0a0806" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d={l.prox} fill="none" stroke="#4a3b30" strokeWidth="1" strokeLinecap="round" opacity="0.7" transform="translate(-1 -1)" />
        </g>
      ))}

      {/* abdomen with a faint marking */}
      <ellipse cx="100" cy="132" rx="31" ry="42" fill="url(#sp-abd)" />
      <path d="M100 108 L108 128 L100 152 L92 128 Z" fill="#5a1010" opacity="0.55" />
      <ellipse cx="90" cy="116" rx="9" ry="15" fill="#fff" opacity="0.07" />

      {/* cephalothorax */}
      <ellipse cx="100" cy="82" rx="21" ry="25" fill="url(#sp-ceph)" />

      {/* pedipalps + fangs */}
      <path d="M88 60 Q80 48 86 42" fill="none" stroke="#0a0806" strokeWidth="4" strokeLinecap="round" />
      <path d="M112 60 Q120 48 114 42" fill="none" stroke="#0a0806" strokeWidth="4" strokeLinecap="round" />
      <path d="M93 60 Q90 70 95 74" fill="none" stroke="#7a1a1a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M107 60 Q110 70 105 74" fill="none" stroke="#7a1a1a" strokeWidth="3.4" strokeLinecap="round" />

      {/* eight eyes */}
      {[
        [92, 66, 2.6], [108, 66, 2.6], [86, 70, 1.8], [114, 70, 1.8],
        [96, 62, 1.7], [104, 62, 1.7], [90, 62, 1.4], [110, 62, 1.4],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#060403" stroke="#2a211b" strokeWidth="0.5" />
          <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.32} fill="#fff" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Fast, dramatic spider event. One run, ~3.3 s:
 *  hole opens -> spider scuttles out and rushes at the viewer -> fills a big
 *  part of the screen -> scurries off.
 * Skippable (button / Esc), no flashing, never blocks scrolling, and a calm
 * static version is used for reduced motion. Sound only if enabled/allowed.
 */
export default function SpiderJumpScare({ active, reduced, play, soundOn, onToggleSound, onFinish }) {
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  // random hole position each time (kept stable while the event plays)
  const hole = useMemo(
    () => ({
      x: (Math.random() < 0.5 ? -1 : 1) * (22 + Math.random() * 14),
      y: 14 + Math.random() * 16,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active]
  );

  useEffect(() => {
    if (!active) return undefined;
    const timers = [];
    if (reduced) {
      timers.push(setTimeout(() => finish.current(), 3400));
    } else {
      timers.push(setTimeout(() => play("spider"), 450));
      timers.push(setTimeout(() => finish.current(), 3500));
    }
    const onKey = (e) => {
      if (e.key === "Escape") finish.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, reduced, play]);

  if (!active) return null;

  const style = { "--hx": `${hole.x}vw`, "--hy": `${hole.y}vh` };

  return (
    <div className={`sp ${reduced ? "sp-reduced" : ""}`} style={style}>
      <span className="sp-sr" role="status">
        A spider appears. Press Escape to skip.
      </span>

      {reduced ? (
        <div className="sp-calm">
          <div className="sp-calm-spider">
            <SpiderSvg still />
          </div>
          <p>A spider crawled by... it&apos;s gone now.</p>
        </div>
      ) : (
        <>
          <div className="sp-dim" />
          <div className="sp-hole" />
          <div className="sp-rush">
            <SpiderSvg />
          </div>
        </>
      )}

      <div className="sp-controls">
        <button type="button" onClick={onToggleSound} aria-pressed={!soundOn}>
          {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundOn ? "Mute" : "Unmute"}
        </button>
        <button type="button" onClick={() => finish.current()}>
          <X size={14} /> Skip
        </button>
      </div>
    </div>
  );
}
