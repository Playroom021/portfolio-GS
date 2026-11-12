import { useEffect } from "react";
import { Settings, X, Smartphone } from "lucide-react";
import Lever from "../intro/Lever";

const MESSAGES = {
  ok: "Battery OK.",
  falling: "Uh-oh... the cover popped open!",
  fallen: "Battery missing! Keep scrolling - the monkey will fix it.",
  repairing: "The monkey is repairing the battery...",
  fixed: "Battery restored. All systems go!",
  secured: "Battery secured - it will not fall out again this session.",
};

/**
 * Bottom-left battery compartment. The hinged cover plate is the physical
 * "cover"; the control board (the former page-settings switchboard) folds up
 * directly above it. The board's controls only talk to the shared settings
 * state, so they keep working whether the battery is in, missing or being
 * repaired.
 */
export default function BatteryCompartment({
  compRef,
  slotRef,
  battery,
  panelOpen,
  onTogglePanel,
  onClosePanel,
  onLatch,
  settings,
  toggle,
  shake,
  secured,
}) {
  const { status, coverOpen } = battery;
  const led = status === "fallen" || status === "falling" ? "out" : status === "fixed" ? "lit" : "ok";

  useEffect(() => {
    if (!panelOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClosePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, onClosePanel]);

  const panelLabel = panelOpen ? "Close the control board" : "Open the control board";

  return (
    <div className="bc">
      {/* Control board - hinged above the compartment */}
      <section
        id="gs-control-board"
        className={`bc-panel ${panelOpen ? "is-open" : ""}`}
        role="dialog"
        aria-label="Portfolio control board"
        inert={!panelOpen}
      >
        <i className="gs-screw tl" />
        <i className="gs-screw tr" />

        <header className="bc-panel-head">
          <div>
            <p>PORTFOLIO CONTROL BOARD</p>
            <small>Changes apply instantly</small>
          </div>
          <button type="button" className="bc-close" onClick={onClosePanel} aria-label="Close the control board">
            <X size={16} />
          </button>
        </header>

        <div className="bc-levers">
          <Lever
            compact
            on={settings.light}
            onToggle={() => toggle("light")}
            label={settings.light ? "LIGHT" : "DARK"}
            hint="theme"
            color="amber"
            a11y="Light theme"
          />
          <Lever
            compact
            on={settings.sound}
            onToggle={() => toggle("sound")}
            label="SOUND"
            hint={settings.sound ? "on" : "muted"}
          />
          <Lever
            compact
            on={settings.glow}
            onToggle={() => toggle("glow")}
            label="GLOW"
            hint="cursor light"
            color="blue"
          />
          <Lever
            compact
            on={settings.smooth}
            onToggle={() => toggle("smooth")}
            label="SMOOTH"
            hint="scrolling"
            color="blue"
          />
        </div>

        {shake.supported && (
          <button
            type="button"
            className="bc-shake"
            onClick={shake.toggle}
            aria-pressed={shake.enabled}
          >
            <Smartphone size={14} />
            {shake.enabled ? "Shake to drop battery: on" : "Enable shake to drop battery"}
          </button>
        )}

        <p className="bc-status" role="status">
          <span className={`bc-led bc-led-${led}`} /> {secured && (status === "ok" || status === "fixed") ? MESSAGES.secured : MESSAGES[status]}
        </p>
      </section>

      {/* Compartment frame */}
      <div ref={compRef} className={`bc-frame bc-frame-${status}`}>
        <div className="bc-top">
          <button
            type="button"
            className="bc-handle"
            onClick={onTogglePanel}
            aria-expanded={panelOpen}
            aria-controls="gs-control-board"
            aria-label={panelLabel}
            title={panelLabel}
          >
            <span className={`bc-led bc-led-${led}`} />
          </button>
          <span className="bc-top-label">PWR</span>
        </div>

        <div className="bc-body">
          <div ref={slotRef} className="bc-slot">
            <span className="bc-plus">+</span>
            <span className="bc-minus">-</span>
          </div>

          {/* hinged cover (swings down when the battery falls out) */}
          <div className={`bc-cover ${coverOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="bc-cover-btn"
              onClick={onTogglePanel}
              aria-expanded={panelOpen}
              aria-controls="gs-control-board"
              aria-label={panelLabel}
              tabIndex={coverOpen ? -1 : 0}
            >
              <Settings size={20} />
              <span>CONTROL</span>
            </button>
            <button
              type="button"
              className={`bc-latch ${secured ? "is-secured" : ""}`}
              onClick={onLatch}
              aria-label={secured ? "Battery cover is secured" : "Release the battery cover"}
              title={secured ? "Battery cover is secured" : "Release the battery cover"}
              tabIndex={coverOpen ? -1 : 0}
            >
              <i />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
