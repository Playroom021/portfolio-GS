import { useEffect, useRef, useState } from "react";
import { Power, MousePointer2 } from "lucide-react";
import { sfx } from "./sound";
import Lever from "./Lever";
import "./intro.css";

/* GS logo - same look as the sidebar badge, only bigger */
function Logo() {
  return (
    <div className="gs-logo" aria-hidden="true">
      <span>GS</span>
    </div>
  );
}

/**
 * phase: "logo" -> "split" -> "board" -> "powering" -> done (onPower)
 * The page settings (theme, sound, glow, smooth scroll) now live in the
 * battery control board inside the portfolio, so only POWER remains here.
 */
export default function Intro({ settings, onPower }) {
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
      {/* Power board (sits behind the two halves) */}
      <div className={`gs-board-wrap ${board ? "gs-board-show" : ""}`}>
        <div className="gs-board gs-board-power">
          <i className="gs-screw tl" />
          <i className="gs-screw tr" />
          <i className="gs-screw bl" />
          <i className="gs-screw br" />

          <div className="gs-board-title">
            <span className="gs-badge">GS</span>
            <div>
              <p>MAIN POWER</p>
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

          <div className="gs-legend">
            <Power size={13} />
            <span>Flip POWER to enter the portfolio</span>
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
