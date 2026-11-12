import { useEffect, useState } from "react";

const KEY = "gs-portfolio-settings";
const DEFAULTS = { light: false, sound: false, smooth: true, glow: false };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

// Settings controlled from the switchboard. Saved in the browser.
export default function useSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
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
