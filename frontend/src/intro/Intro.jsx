import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Volume2, VolumeX, Sparkles, MousePointer2 } from "lucide-react";
import { sfx } from "./sound";
import "./intro.css";

/* GS logo - same look as the sidebar badge, only bigger */
function Logo() {
  return (
    <div className="gs-logo" aria-hidden="true">
      <span>GS</span>
    </div>
  );
}

/* Lever switch */
function Lever({ on, onToggle, label, hint, big = false, color = "green" }) {
  return (
    <div className={`gs-switch ${big ? "gs-switch-big" : ""}`}>
      <span className={`gs-led gs-led-${color} ${on ? "gs-led-on" : ""}`} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className="gs-housing"
      >
        <span className={`gs-lever ${on ? "gs-lever-on" : ""}`}>
          <span className="gs-knob" />
        </span>
      </button>
      <span className="gs-label">{label}</span>
      <span className="gs-hint">{hint}</span>
    </div>
  );
}

/**
 * phase: "logo" -> "split" -> "board" -> "powering" -> done (onPower)
 */
export default function Intro({ settings, toggle, onPower }) {
  const [phase, setPhase] = useState("logo");
  const [powerOn, setPowerOn] = useState(false);
  const timer = useRef(null);

  const play = (fn, ...args) => settings.sound && fn(...args);

  // click anywhere -> split the logo
  const handleStart = () => {
    if (phase !== "logo") return;
    play(sfx.split);
    setPhase("split");
    setTimeout(() => setPhase("board"), 900);
  };

  const handlePower = () => {
    const next = !powerOn;
    setPowerOn(next);
    play(sfx.flip, next);
    clearTimeout(timer.current);
    if (next) {
      timer.current = setTimeout(() => {
        play(sfx.power);
        setPhase("powering");
        timer.current = setTimeout(onPower, 450);
      }, 450);
    } else {
      setPhase("board");
    }
  };

  const flip = (name) => {
    play(sfx.flip, !settings[name]);
    toggle(name);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer.current);
    };
  }, []);

  const split = phase !== "logo";
  const board = phase === "board" || phase === "powering";

  return (
    <div
      className={`gs-intro ${phase === "powering" ? "gs-intro-out" : ""}`}
      onClick={phase === "logo" ? handleStart : undefined}
    >
      {/* Switchboard (sits behind the two halves) */}
      <div className={`gs-board-wrap ${board ? "gs-board-show" : ""}`}>
        <div className="gs-board">
          <i className="gs-screw tl" />
          <i className="gs-screw tr" />
          <i className="gs-screw bl" />
          <i className="gs-screw br" />

          <div className="gs-board-title">
            <span className="gs-badge">GS</span>
            <div>
              <p>CONTROL PANEL</p>
              <small>Gyan Sharma · Portfolio</small>
            </div>
          </div>

          <div className="gs-row">
            <Lever
              big
              on={powerOn}
              onToggle={handlePower}
              label="POWER"
              hint={powerOn ? "ON" : "FLIP TO START"}
              color="red"
            />
          </div>

          <div className="gs-row gs-row-small">
            <Lever
              on={settings.light}
              onToggle={() => flip("light")}
              label={settings.light ? "LIGHT" : "DARK"}
              hint={settings.light ? "mode" : "mode"}
              color="amber"
            />
            <Lever
              on={settings.sound}
              onToggle={() => flip("sound")}
              label="SOUND"
              hint={settings.sound ? "on" : "off"}
            />
            <Lever
              on={settings.glow}
              onToggle={() => flip("glow")}
              label="GLOW"
              hint="cursor light"
              color="blue"
            />
            <Lever
              on={settings.smooth}
              onToggle={() => flip("smooth")}
              label="SMOOTH"
              hint="scrolling"
              color="blue"
            />
          </div>

          <div className="gs-legend">
            {settings.light ? <Sun size={13} /> : <Moon size={13} />}
            {settings.sound ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <Sparkles size={13} />
            <span>Set things up, then flip POWER</span>
          </div>
        </div>
      </div>

      {/* Two halves of the opening screen, each carrying half of the logo */}
      <div className={`gs-half gs-half-left ${split ? "gs-open" : ""}`}>
        <div className="gs-half-inner"><Logo /></div>
      </div>
      <div className={`gs-half gs-half-right ${split ? "gs-open" : ""}`}>
        <div className="gs-half-inner"><Logo /></div>
      </div>

      {phase === "logo" && (
        <p className="gs-tap">
          <MousePointer2 size={14} /> Click anywhere
        </p>
      )}
    </div>
  );
}
