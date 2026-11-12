import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { MonkeyCharacter } from "./MonkeyCharacter";

/**
 * Brief, playful surprise when the Reviews section is reached.
 * No flashing, short, skippable (button or Esc), never blocks scrolling,
 * and a calm banner replaces the zoom when reduced motion is requested.
 */
export default function ReviewJumpScare({ active, reduced, play, onFinish }) {
  const [phase, setPhase] = useState("pop"); // pop -> react -> leave
  const finish = useRef(onFinish);

  useEffect(() => {
    finish.current = onFinish;
  });

  useEffect(() => {
    if (!active) return undefined;
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    setPhase(reduced ? "react" : "pop");
    if (reduced) {
      at(3200, () => setPhase("leave"));
      at(3700, () => finish.current());
    } else {
      at(250, () => play("screech"));
      at(2200, () => setPhase("react"));
      at(3500, () => setPhase("leave"));
      at(4100, () => finish.current());
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

  const message =
    phase === "react" && !reduced
      ? "...okay. Carry on. I'm watching."
      : "HEY! WHAT ARE THEY SAYING ABOUT ME?!";

  return (
    <div className={`rv rv-${phase} ${reduced ? "rv-reduced" : ""}`} aria-live="polite">
      <div className="rv-dim" />
      <div className="rv-monkey">
        <MonkeyCharacter pose={phase === "pop" ? "reviewSurprise" : "celebrating"} />
      </div>
      <p className="rv-bubble">{message}</p>
      <button type="button" className="rv-skip" onClick={() => finish.current()}>
        <X size={14} /> Skip
      </button>
    </div>
  );
}
