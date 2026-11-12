import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import About from "./components/About";
import Reviews from "./components/Reviews";

import Intro from "./intro/Intro";
import GlowLayer from "./intro/GlowLayer";
import useSettings from "./intro/useSettings";

import './App.css';


export default function App() {
  const [powered, setPowered] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [settings, toggle] = useSettings();

  return (
    <>
      {!introDone && (
        <Intro
          settings={settings}
          toggle={toggle}
          onPower={() => {
            setPowered(true);
            setTimeout(() => setIntroDone(true), 1000);
          }}
        />
      )}

      {powered && (
        <>
          {settings.glow && <GlowLayer />}
          <div className="gs-site-in">
            <Portfolio />
          </div>
        </>
      )}
    </>
  );
}

function Portfolio() {
  return (
    <div className="flex min-h-screen bg-[#212121] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Home />
        <Projects />
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
