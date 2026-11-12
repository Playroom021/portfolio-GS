import React, { useState, useEffect } from 'react';

export default function Navbar() {
  // 1. STATE MANAGEMENT
  // 'isScrolled' tracks whether the user has scrolled down the page more than 50 pixels.
  // Default is 'false' (at the very top of the page).
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. SCROLL LISTENER EFFECT
  // useEffect runs once when the component mounts to set up a scroll event listener on the window.
  useEffect(() => {
    const handleScroll = () => {
      // If window scroll position is greater than 50px, set isScrolled to true
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Attach the scroll event listener to the browser window
    window.addEventListener('scroll', handleScroll);

    // Cleanup function: removes the event listener when the component unmounts 
    // to prevent memory leaks.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array means this effect runs only once on mount.

  return (
    <>
      {/* 3. INITIAL ROUNDED FLOATING HEADER BLOCK */}
      {/* 
        - 'fixed top-4 left-4 right-4': Pins the bar near the top with horizontal margins.
        - 'bg-[#333]': Dark charcoal background color.
        - 'z-40': Sets layering priority so it sits nicely above regular content.
        - 'transition-all duration-500 ease-in-out': Animates all property changes smoothly over 0.5 seconds.
        - CONDITIONAL LOGIC: 
          If isScrolled is true -> Collapses height to 0, hides it completely (opacity-0, pointer-events-none), and removes border-radius.
          If isScrolled is false -> Displays as a 70px tall full-width pill bar (rounded-full).
      */}
      <div 
        className={`fixed top-4 left-4 right-4 bg-[#1e293b] z-40 transition-all duration-500 ease-in-out shadow-lg ${
          isScrolled 
            ? 'h-0 opacity-0 pointer-events-none rounded-none' 
            : 'h-[70px] opacity-100 rounded-full'
        }`} 
      />

      {/* 4. DYNAMIC LOGO BUBBLE (CHROME GREEN) */}
      {/* 
        - 'fixed z-50': Pins the logo above the background header block.
        - CONDITIONAL LOGIC:
          Scrolled -> Transforms into a compact 54x54px green circle (#22c55e) with a heavy shadow.
          Top -> Expands into a standard 200px wide text container with a transparent background.
      */}
      <div
        className={`fixed z-50 flex items-center transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'top-5 left-5 w-[54px] h-[54px] justify-center bg-[#22c55e] rounded-full shadow-2xl'
            : 'top-6 left-12 h-[50px] justify-start w-[200px] bg-opacity-0'
        }`}
      >
        <span
          className={`font-bold transition-all duration-500 whitespace-nowrap ${
            isScrolled ? 'text-white text-xs tracking-tighter' : 'text-[#22c55e] text-2xl'
          }`}
        >
          {/* Text toggles dynamically based on scroll state */}
          {isScrolled ? 'GS' : 'GyanSharma'}
        </span>
      </div>

      {/* 5. SEPARATED NAVIGATION ICONS (CHROME RED, YELLOW, BLUE) */}
      {/* 
        - 'pointer-events-none': Disables clicks on the wrapper layout container itself, 
          while individual interactive list items re-enable clicks ('pointer-events-auto').
      */}
      <nav
        className={`fixed z-50 flex items-center transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'top-5 right-5 w-auto h-[54px] justify-end pointer-events-none'
            : 'top-6 right-12 left-0 w-auto h-[50px] justify-end pointer-events-none'
        }`}
      >
        <ul className="flex items-center list-none m-0 p-0 gap-4 pointer-events-auto">
          
          {/* HOME POD -> CHROME RED */}
          {/* 
            - When scrolled: Becomes a 54x54px red circle (#ef4444).
            - When at top: Becomes an invisible wrapper container holding standard text.
          */}
          <li className={`flex items-center justify-center transition-all duration-500 ease-in-out ${
            isScrolled ? 'w-[54px] h-[54px] rounded-full shadow-2xl bg-[#ef4444]' : 'w-auto h-auto bg-opacity-0 px-2'
          }`}>
            <a href="#" className="flex items-center text-white hover:text-red-200 transition-colors" title="Home">
              {/* SVG Icon: Appears only when scrolled (w-5 h-5), hidden otherwise (w-0 h-0 hidden) */}
              <svg className={`transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-0 h-0 opacity-0 hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              {/* Text Link: Appears only when at top, hidden when scrolled */}
              <span className={`transition-all duration-500 ${isScrolled ? 'w-0 h-0 opacity-0 hidden' : 'text-base hover:text-[#ef4444]'}`}>Home</span>
            </a>
          </li>

          {/* SERVICES POD -> CHROME YELLOW */}
          {/* Works identically to the Home pod, but uses yellow styling (#eab308) */}
          <li className={`flex items-center justify-center transition-all duration-500 ease-in-out ${
            isScrolled ? 'w-[54px] h-[54px] rounded-full shadow-2xl bg-[#eab308]' : 'w-auto h-auto bg-opacity-0 px-2'
          }`}>
            <a href="#" className="flex items-center text-white hover:text-yellow-100 transition-colors" title="Services">
              <svg className={`transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-0 h-0 opacity-0 hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className={`transition-all duration-500 ${isScrolled ? 'w-0 h-0 opacity-0 hidden' : 'text-base hover:text-[#eab308]'}`}>Services</span>
            </a>
          </li>

          {/* CONTACT POD -> CHROME BLUE */}
          {/* Works identically to the Home pod, but uses blue styling (#3b82f6) */}
          <li className={`flex items-center justify-center transition-all duration-500 ease-in-out ${
            isScrolled ? 'w-[54px] h-[54px] rounded-full shadow-2xl bg-[#3b82f6]' : 'w-auto h-auto bg-opacity-0 px-2'
          }`}>
            <a href="#" className="flex items-center text-white hover:text-blue-200 transition-colors" title="Contact">
              <svg className={`transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-0 h-0 opacity-0 hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2,2 0 002.22 0L21 8M5 19h14a2,2 0 002-2V7a2,2 0 00-2-2H5a2,2 0 00-2 2v10a2,2 0 002 2z"/>
              </svg>
              <span className={`transition-all duration-500 ${isScrolled ? 'w-0 h-0 opacity-0 hidden' : 'text-base hover:text-[#3b82f6]'}`}>Contact</span>
            </a>
          </li>

        </ul>
      </nav>
    </>
  );
}
