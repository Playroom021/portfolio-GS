import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { sfx } from "./sound";
import "./intro.css";

/* Playroom 021 logo */
function Logo() {
  return (
    <div className="gs-logo" aria-hidden="true">
      <span>P21</span>
    </div>
  );
}

/**
 * phase: "logo" -> "split" -> "powering" -> done (onPower)
 */
export default function Intro({ settings, onPower }) {
  const [phase, setPhase] = useState("logo");
  const timer = useRef(null);

  // click anywhere -> split the logo, then enter the site
  const handleStart = () => {
    if (phase !== "logo") return;
    if (settings.sound) {
      sfx.split();
    }
    setPhase("split");
    timer.current = setTimeout(() => {
      if (settings.sound) sfx.power();
      setPhase("powering");
      timer.current = setTimeout(onPower, 450);
    }, 900);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer.current);
    };
  }, []);

  const split = phase !== "logo";

  return (
    <div
      className={`gs-intro ${phase === "powering" ? "gs-intro-out" : ""}`}
      onClick={phase === "logo" ? handleStart : undefined}
    >
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
