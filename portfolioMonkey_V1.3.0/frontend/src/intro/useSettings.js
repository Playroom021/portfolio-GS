import { useEffect, useState } from "react";

const KEY = "gs-portfolio-settings";
// Sound is on by default but only ever plays after the visitor has interacted
// with the page (see monkey/MonkeyAdventure). Use the SOUND switch to mute.
const DEFAULTS = { light: false, sound: true, smooth: true, glow: false };
const VERSION = 2;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw);
    // older saves recorded the old default for sound; let the new default apply once
    if (saved.v !== VERSION) delete saved.sound;
    return { ...DEFAULTS, ...saved };
  } catch {
    return DEFAULTS;
  }
}

// Settings controlled from the switchboard. Saved in the browser.
export default function useSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...settings, v: VERSION }));
    } catch {
      /* storage unavailable - ignore */
    }
    const root = document.documentElement;
    root.classList.toggle("theme-light", settings.light);
    root.classList.toggle("smooth-scroll", settings.smooth);
  }, [settings]);

  const toggle = (name) =>
    setSettings((s) => ({ ...s, [name]: !s[name] }));

  return [settings, toggle];
}
