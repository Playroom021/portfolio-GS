import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * One monkey, many poses. The pose is a data attribute; monkey.css animates
 * the limbs for each state:
 * idle | running | chasing | jumping | eating | catchingBug | climbing |
 * eyesClosed | repairingBattery | celebrating | reviewSurprise
 */
export function MonkeyCharacter({
  pose = "idle",
  eyesClosed = false,
  paused = false,
  className = "",
}) {
  return (
    <svg
      className={`mk ${className}`}
      viewBox="0 0 100 100"
      data-pose={pose}
      data-eyes={eyesClosed ? "closed" : "open"}
      data-paused={paused ? "true" : "false"}
      aria-hidden="true"
      focusable="false"
    >
      <g className="mk-all">
        {/* tail */}
        <path
          className="mk-tail"
          d="M60 78 C 88 82, 94 54, 78 44"
          fill="none"
          stroke="#6e4320"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* legs */}
        <g className="mk-leg mk-leg-l">
          <rect x="35" y="70" width="13" height="20" rx="6.5" fill="#7a4a22" />
          <ellipse cx="41.5" cy="91" rx="8.5" ry="4.5" fill="#f3d9b4" />
        </g>
        <g className="mk-leg mk-leg-r">
          <rect x="52" y="70" width="13" height="20" rx="6.5" fill="#7a4a22" />
          <ellipse cx="58.5" cy="91" rx="8.5" ry="4.5" fill="#f3d9b4" />
        </g>

        {/* body */}
        <ellipse cx="50" cy="62" rx="20" ry="22" fill="#8b5a2b" />
        <ellipse cx="50" cy="66" rx="12" ry="15" fill="#f3d9b4" />

        {/* head */}
        <g className="mk-head">
          <circle cx="26" cy="28" r="8.5" fill="#8b5a2b" />
          <circle cx="26" cy="28" r="4.8" fill="#f3d9b4" />
          <circle cx="74" cy="28" r="8.5" fill="#8b5a2b" />
          <circle cx="74" cy="28" r="4.8" fill="#f3d9b4" />
          <circle cx="50" cy="30" r="22" fill="#8b5a2b" />

          {/* heart-shaped face */}
          <circle cx="42" cy="29" r="10" fill="#f3d9b4" />
          <circle cx="58" cy="29" r="10" fill="#f3d9b4" />
          <ellipse cx="50" cy="38" rx="15" ry="11" fill="#f3d9b4" />

          {/* cheeks (puff while eating) */}
          <g className="mk-cheeks">
            <circle cx="35" cy="40" r="5.5" fill="#f3d9b4" />
            <circle cx="65" cy="40" r="5.5" fill="#f3d9b4" />
          </g>

          {/* eyes */}
          <g className="mk-eyes-open">
            <g className="mk-eye mk-eye-l">
              <circle cx="43" cy="30" r="4.4" fill="#fff" />
              <circle cx="44" cy="30.6" r="2.3" fill="#2a170a" />
            </g>
            <g className="mk-eye mk-eye-r">
              <circle cx="57" cy="30" r="4.4" fill="#fff" />
              <circle cx="56" cy="30.6" r="2.3" fill="#2a170a" />
            </g>
          </g>
          <g
            className="mk-eyes-closed"
            fill="none"
            stroke="#2a170a"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M38.5 31 Q43 35.5 47.5 31" />
            <path d="M52.5 31 Q57 35.5 61.5 31" />
          </g>

          {/* brows (surprise) */}
          <path
            className="mk-brows"
            d="M37 22 Q43 17.5 48.5 22 M51.5 22 Q57 17.5 63 22"
            fill="none"
            stroke="#3b2412"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* nose */}
          <circle cx="48.2" cy="37.5" r="0.9" fill="#3b2412" />
          <circle cx="51.8" cy="37.5" r="0.9" fill="#3b2412" />

          {/* mouths - one is shown per pose */}
          <path
            className="mk-m mk-m-smile"
            d="M43 42 Q50 48 57 42"
            fill="none"
            stroke="#3b2412"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="mk-m mk-m-open"
            d="M43 41 Q50 54 57 41 Z"
            fill="#5a1d1d"
            stroke="#3b2412"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <ellipse className="mk-m mk-m-o" cx="50" cy="43.5" rx="2.6" ry="3" fill="#5a1d1d" />
          <ellipse className="mk-m mk-m-chew" cx="50" cy="43" rx="4" ry="2.4" fill="#5a1d1d" />
          <ellipse className="mk-tongue" cx="54" cy="45.6" rx="2.6" ry="2" fill="#f07a8a" />
        </g>

        {/* arms (drawn after the head so raised hands stay visible) */}
        <g className="mk-arm mk-arm-l">
          <rect x="25.5" y="51" width="11" height="26" rx="5.5" fill="#8b5a2b" />
          <circle cx="31" cy="77" r="6" fill="#f3d9b4" />
        </g>
        <g className="mk-arm mk-arm-r">
          <rect x="63.5" y="51" width="11" height="26" rx="5.5" fill="#8b5a2b" />
          <circle cx="69" cy="77" r="6" fill="#f3d9b4" />
        </g>

        {/* banana in hand while eating */}
        <g className="mk-hold-banana">
          <path
            d="M37 47 Q50 54 64 38"
            fill="none"
            stroke="#f5c518"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M38 45.5 Q50 51.5 62.5 37.5"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="36.5" cy="47.5" r="2" fill="#5b3a12" />
          <circle cx="65" cy="37" r="1.8" fill="#5b3a12" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The single on-screen monkey. It is positioned in viewport pixels (its centre)
 * and driven imperatively by the director so scroll sync and scripted
 * sequences never fight through React renders.
 */
export const MonkeyActor = forwardRef(function MonkeyActor({ size, pokeable = false, onPoke }, ref) {
  const el = useRef(null);
  const pos = useRef({ x: -300, y: -300 });
  const [pose, setPose] = useState("idle");
  const [dir, setDir] = useState(1);
  const [eyes, setEyes] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [bubble, setBubble] = useState(null);

  useLayoutEffect(() => {
    if (el.current) {
      el.current.style.transform = "translate3d(-300px,-300px,0)";
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      get pos() {
        return pos.current;
      },
      set(x, y) {
        const n = el.current;
        if (!n) return;
        pos.current = { x, y };
        n.style.transition = "none";
        n.style.transform = `translate3d(${x}px,${y}px,0)`;
      },
      /** current on-screen centre (follows CSS transitions) */
      center() {
        const n = el.current;
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      },
      moveTo(x, y, ms = 600, ease = "ease-in-out") {
        return new Promise((resolve) => {
          const n = el.current;
          if (!n) return resolve();
          n.getBoundingClientRect(); // flush so the transition starts from here
          n.style.transition = ms > 0 ? `transform ${ms}ms ${ease}` : "none";
          n.style.transform = `translate3d(${x}px,${y}px,0)`;
          pos.current = { x, y };
          setTimeout(resolve, ms);
        });
      },
      pose: setPose,
      face: setDir,
      eyes: setEyes,
      paused: setPaused,
      hide: setHidden,
      bubble: setBubble,
    }),
    []
  );

  return (
    <div
      ref={el}
      className="mk-actor"
      data-hidden={hidden ? "true" : "false"}
      data-poke={pokeable ? "true" : "false"}
      onClick={pokeable ? onPoke : undefined}
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      aria-hidden="true"
    >
      {bubble && <span className="mk-bubble">{bubble}</span>}
      <div className="mk-flip" style={{ "--dir": dir }}>
        <MonkeyCharacter pose={pose} eyesClosed={eyes} paused={paused} />
      </div>
    </div>
  );
});
