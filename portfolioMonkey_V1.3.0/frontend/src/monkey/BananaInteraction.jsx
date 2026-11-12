/* A real, focusable button - the monkey reacts when it is clicked. */
function BananaSvg() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" focusable="false">
      <path
        d="M10 20 Q14 52 50 50 Q56 49 58 44 Q36 52 22 24 Z"
        fill="#f5c518"
        stroke="#b98a00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 24 Q20 46 46 47" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20 L8 12 L14 14 L16 21 Z" fill="#6b4a14" />
      <circle cx="58" cy="44" r="2.4" fill="#5b3a12" />
    </svg>
  );
}

export default function BananaInteraction({ state, onClick, innerRef, hint, pos }) {
  const at = (dx = 0, dy = 0) =>
    pos ? { left: pos.x + dx, top: pos.y + dy, bottom: "auto" } : undefined;
  return (
    <>
      {state === "ready" && hint && (
        <span className="mk-banana-hint" style={at(0, -66)}>Hungry monkey! Click the banana</span>
      )}
      <button
        ref={innerRef}
        type="button"
        className="mk-banana-btn"
        data-state={state}
        style={at()}
        aria-label="Give the monkey a banana"
        disabled={state !== "ready"}
        onClick={onClick}
      >
        <BananaSvg />
      </button>
      {state === "peel" && <span className="mk-peel" style={at(0, 14)} aria-hidden="true" />}
    </>
  );
}
