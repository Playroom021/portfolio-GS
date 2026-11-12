import "./intro.css";

/* Lever switch - shared by the opening POWER board and the battery control board */
export default function Lever({
  on,
  onToggle,
  label,
  hint,
  big = false,
  compact = false,
  color = "green",
  a11y,
}) {
  return (
    <div
      className={`gs-switch ${big ? "gs-switch-big" : ""} ${
        compact ? "gs-switch-sm" : ""
      }`}
    >
      <span className={`gs-led gs-led-${color} ${on ? "gs-led-on" : ""}`} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={a11y || label}
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
