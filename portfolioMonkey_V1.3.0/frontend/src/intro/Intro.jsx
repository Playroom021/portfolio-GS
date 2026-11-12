import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
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

/**
 * phase: "logo" -> "split" -> "out"
 * Click anywhere: the logo splits, the doors slide apart and the portfolio
 * fades in automatically. No power/settings panel is shown any more - the
 * settings live in the battery cover at the bottom-left of the portfolio.
 */
export default function Intro({ settings, onPower }) {
  const [phase, setPhase] = useState("logo");
  const timers = useRef([]);

  const handleStart = () => {
    if (phase !== "logo") return;
    if (settings.sound) sfx.split();
    setPhase("split");
    timers.current.push(setTimeout(onPower, 600)); // portfolio mounts behind the black
    timers.current.push(setTimeout(() => setPhase("out"), 950));
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const pending = timers.current;
    return () => {
      document.body.style.overflow = "";
      pending.forEach(clearTimeout);
    };
  }, []);

  const split = phase !== "logo";

  return (
    <div
      className={`gs-intro ${phase === "out" ? "gs-intro-out" : ""}`}
      onClick={phase === "logo" ? handleStart : undefined}
    >
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
