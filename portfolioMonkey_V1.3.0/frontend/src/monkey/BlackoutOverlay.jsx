import { useCallback, useEffect, useRef, useState } from "react";
import { BatteryLow, Crosshair, Volume2, VolumeX } from "lucide-react";
import { clamp } from "./helpers";

const pad = (n) => String(n).padStart(2, "0");
const stamp = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}  ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;

// Film grain tile generated once (no network, no image file)
function makeGrain() {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      img.data[i] = v * 0.55;
      img.data[i + 1] = v;
      img.data[i + 2] = v * 0.6;
      img.data[i + 3] = Math.random() * 70;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  } catch {
    return "";
  }
}

const TEXT = {
  search: "POWER FAILURE — Find the battery and shine your light!",
  found: "BATTERY LOCATED — the monkey is on it...",
  restoring: "POWER RESTORED",
};

/**
 * Full "power failure" state: opaque black + CCTV night-vision look.
 * - The visitor drives a flashlight (mouse, touch, arrow keys) to find the battery.
 * - The battery only becomes visible/clickable when lit.
 * - Fallbacks: focusing the battery lights it, "Help me find it" aims the light,
 *   and a "Restore power" failsafe appears after 90s so nobody is ever stuck.
 * The monkey, battery sprite and compartment are drawn above this layer (see CSS).
 */
export default function BlackoutOverlay({
  phase,
  point,
  reduced,
  soundOn,
  onToggleSound,
  onRetrieve,
  onForceRestore,
  getFollowPoint,
}) {
  const root = useRef(null);
  const batt = useRef(null);
  const light = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 });
  const phaseRef = useRef(phase);
  const [grain] = useState(makeGrain);
  const [clock, setClock] = useState(() => stamp(new Date()));
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState(false);
  const [rescue, setRescue] = useState(false);
  const radius = useRef(120);

  useEffect(() => {
    phaseRef.current = phase;
  });

  const isLit = useCallback(() => {
    const l = light.current;
    return Math.hypot(l.x - point.x, l.y - point.y) < radius.current * 0.8;
  }, [point.x, point.y]);

  const paint = useCallback(() => {
    const r = root.current;
    if (!r) return;
    const l = light.current;
    r.style.setProperty("--lx", `${l.x}px`);
    r.style.setProperty("--ly", `${l.y}px`);
    const lit = isLit() || phaseRef.current !== "search";
    if (batt.current && batt.current.dataset.lit !== String(lit)) {
      batt.current.dataset.lit = String(lit);
    }
  }, [isLit]);

  // flashlight: eased towards the pointer, only runs while it is still moving
  const tick = useCallback(() => {
    const l = light.current;
    l.raf = 0;
    if (phaseRef.current !== "search" && getFollowPoint) {
      const f = getFollowPoint();
      if (f) {
        l.tx = f.x;
        l.ty = f.y;
      }
    }
    const k = reduced ? 1 : 0.22;
    l.x += (l.tx - l.x) * k;
    l.y += (l.ty - l.y) * k;
    paint();
    const settled = Math.abs(l.tx - l.x) < 0.5 && Math.abs(l.ty - l.y) < 0.5;
    if (!settled || phaseRef.current !== "search") l.raf = requestAnimationFrame(tick);
  }, [reduced, paint, getFollowPoint]);

  const aim = useCallback(
    (x, y) => {
      const l = light.current;
      l.tx = clamp(x, 0, window.innerWidth);
      l.ty = clamp(y, 0, window.innerHeight);
      if (!l.raf) l.raf = requestAnimationFrame(tick);
    },
    [tick]
  );

  // start in the middle of the screen
  useEffect(() => {
    radius.current = clamp(Math.min(window.innerWidth, window.innerHeight) * 0.2, 90, 150);
    root.current?.style.setProperty("--lr", `${radius.current}px`);
    const l = light.current;
    l.x = l.tx = window.innerWidth / 2;
    l.y = l.ty = window.innerHeight / 2;
    paint();
    const state = light.current;
    return () => cancelAnimationFrame(state.raf);
  }, [paint]);

  // keep the light running after the search so it follows the monkey
  useEffect(() => {
    if (phase !== "search" && !light.current.raf) light.current.raf = requestAnimationFrame(tick);
  }, [phase, tick]);

  // clock + failsafe timers (all cleaned up)
  useEffect(() => {
    const clockTimer = setInterval(() => setClock(stamp(new Date())), 1000);
    const hintTimer = setTimeout(() => setHint(true), 25000);
    const rescueTimer = setTimeout(() => setRescue(true), 90000);
    return () => {
      clearInterval(clockTimer);
      clearTimeout(hintTimer);
      clearTimeout(rescueTimer);
    };
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(""), 2600);
    return () => clearTimeout(t);
  }, [message]);

  const onPointerMove = (e) => aim(e.clientX, e.clientY);

  const onKeyDown = (e) => {
    const step = 60;
    const l = light.current;
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key] && e.target === root.current) {
      e.preventDefault();
      aim(l.tx + moves[e.key][0], l.ty + moves[e.key][1]);
    }
  };

  const onBatteryClick = () => {
    if (phaseRef.current !== "search") return;
    if (batt.current?.dataset.lit === "true") onRetrieve();
    else setMessage("Too dark to see... shine your light around.");
  };

  const locate = () => {
    aim(point.x, point.y);
    setTimeout(() => batt.current?.focus({ preventScroll: true }), reduced ? 0 : 450);
  };

  const onBatteryFocus = () => aim(point.x, point.y);

  return (
    <div
      ref={root}
      className={`po ${phase === "restoring" ? "po-restoring" : ""} ${reduced ? "po-reduced" : ""}`}
      role="region"
      aria-label="Power failure. Night vision mode."
      tabIndex={0}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onKeyDown={onKeyDown}
    >
      {/* night-vision look */}
      <div className="po-tint" />
      {grain && <div className="po-grain" style={{ backgroundImage: `url(${grain})` }} />}
      <div className="po-scan" />
      <div className="po-roll" />
      <div className="po-light" />
      <div className="po-vignette" />

      {/* the target: invisible until the flashlight reaches it */}
      <button
        ref={batt}
        type="button"
        className="po-battery"
        data-lit="false"
        data-phase={phase}
        style={{ left: point.x, top: point.y }}
        aria-label="Fallen battery. Press Enter to help the monkey retrieve it."
        onClick={onBatteryClick}
        onFocus={onBatteryFocus}
      >
        <span className="po-battery-shape">
          <span className="bc-battery-nub" />
          <span className="bc-battery-body">
            <b>+</b>
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="po-ring" />
      </button>
      {hint && phase === "search" && (
        <span className="po-ping" style={{ left: point.x, top: point.y }} aria-hidden="true" />
      )}

      {/* HUD */}
      <div className="po-hud po-hud-tl">
        <span className="po-rec">
          <i /> REC
        </span>
        <strong>CAM 01</strong>
        <small>{clock}</small>
        <small>NIGHT VISION</small>
      </div>
      <div className="po-hud po-hud-tr">
        <BatteryLow size={22} />
        <strong>LOW BATTERY</strong>
        <small>0%</small>
      </div>

      <div className="po-hud po-hud-bottom" role="status" aria-live="polite">
        <p>{TEXT[phase]}</p>
        {phase === "search" && (
          <small>
            {message ||
              (hint
                ? "Hint: it fell near the bottom-left, close to the battery cover."
                : "Move your mouse, drag your finger, or use the arrow keys to sweep the light.")}
          </small>
        )}
      </div>

      <div className="po-hud po-hud-br">
        {phase === "search" && (
          <button type="button" onClick={locate}>
            <Crosshair size={14} /> Help me find it
          </button>
        )}
        <button type="button" onClick={onToggleSound} aria-pressed={!soundOn}>
          {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundOn ? "Mute" : "Unmute"}
        </button>
        {rescue && phase === "search" && (
          <button type="button" className="po-rescue" onClick={onForceRestore}>
            Restore power
          </button>
        )}
      </div>
    </div>
  );
}
