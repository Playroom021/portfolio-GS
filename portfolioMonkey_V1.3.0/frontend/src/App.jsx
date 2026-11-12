import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Achievements from "./components/Achievements";
import About from "./components/About";
import Reviews from "./components/Reviews";

import Intro from "./intro/Intro";
import GlowLayer from "./intro/GlowLayer";
import useSettings from "./intro/useSettings";
import { SettingsContext } from "./intro/settingsContext";
import MonkeyAdventure from "./monkey/MonkeyAdventure";

import './App.css';


export default function App() {
  const [powered, setPowered] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [settings, toggle] = useSettings();

  return (
    <SettingsContext.Provider value={{ settings, toggle }}>
      {!introDone && (
        <Intro
          settings={settings}
          onPower={() => {
            setPowered(true);
            setTimeout(() => setIntroDone(true), 1700);
          }}
        />
      )}

      {powered && (
        <>
          {settings.glow && <GlowLayer />}
          <div className="gs-site-in">
            <Portfolio />
          </div>
          <MonkeyAdventure />
        </>
      )}
    </SettingsContext.Provider>
  );
}

function Portfolio() {
  return (
    <div className="flex min-h-screen bg-[#212121] text-white">
      <Sidebar />

      <main id="gs-main" className="min-w-0 flex-1 pr-10 md:pr-14">
        <Home />
        <Projects />
        <Achievements />
        <About />
        <Reviews />

        <footer
          className="border-t border-white/[0.06] px-8 py-6
                     text-center text-sm text-[#737373]"
        >
          © {new Date().getFullYear()} Gyan Sharma. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
