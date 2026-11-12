import { createContext, useContext } from "react";

// One shared source of truth for the page settings (theme, sound, glow, smooth scroll).
export const SettingsContext = createContext(null);
export const useSettingsContext = () => useContext(SettingsContext);
