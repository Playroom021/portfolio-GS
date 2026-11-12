import React from 'react';

export default function HeroAlt001() {
  return (
    <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50 overflow-hidden pt-[110px] pb-16 px-6 sm:px-12">
      
      {/* 1. LAYERED GEOMETRIC BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Chrome Branding Color Accents (Subtle Floating Blobs) */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* 2. CORE INFOCARD (LEFT SIDE BLOCK) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Minimalist Chrome Identity Tag */}
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm text-xs font-mono font-bold text-gray-800 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>status: production_ready</span>
            </div>

            {/* Split Typography Headline */}
            <div className="space-y-3">
              <span className="text-sm font-mono tracking-widest text-[#3b82f6] uppercase font-bold block">
                // System.out.println("Welcome");
              </span>
              
              {/* FIXED: Explicitly applied text-[#ef4444] directly to make the name highly visible in red */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#ef4444] tracking-tight leading-none block">
                Gyan Sharma
              </h1>
              
              {/* FIXED: Explicitly changed text color from white to high-contrast text-gray-900 */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 block">
                Building the Future of <span className="text-[#22c55e]">Software Systems</span>
              </h2>
            </div>

            {/* Narrative Bio Paragraph */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl font-medium leading-relaxed">
              Software engineering student dedicated to developing reliable backend code architectures, responsive front-end applications, and optimal data structure computations.
            </p>

            {/* Flat Solid Interactive Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#projects" 
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all shadow-sm text-center"
              >
                Inspect Repositories
              </a>
              <a 
                href="#contact" 
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium rounded-lg transition-all shadow-sm text-center"
              >
                Establish Connection
              </a>
            </div>
          </div>

          {/* 3. FLOATING BROWSER CONSOLE (RIGHT SIDE BLOCK) */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Tech Stack Floating Pill Anchors */}
            <div className="absolute -top-4 -left-4 z-20 bg-white border border-gray-200 shadow-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> React.js
            </div>
            
            <div className="absolute top-1/2 -right-6 z-20 bg-white border border-gray-200 shadow-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-800 flex items-center gap-2 transform -translate-y-1/2">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" /> Python
            </div>

            <div className="absolute -bottom-4 left-6 z-20 bg-white border border-gray-200 shadow-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Tailwind CSS
            </div>

            {/* Central Dashboard Terminal Frame */}
            <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden aspect-square flex flex-col transform hover:-rotate-1 transition-transform duration-300">
              
              {/* Top Chrome Window Tab Bar Layout */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                </div>
                <div className="bg-white border border-gray-200 text-[10px] text-gray-500 font-mono px-6 py-0.5 rounded-md shadow-inner select-none truncate max-w-[160px]">
                  localhost:3000/profile
                </div>
                <div className="w-3" />
              </div>

              {/* Data Metric List Display Area */}
              <div className="p-6 flex-grow flex flex-col justify-between font-mono text-xs sm:text-sm text-gray-800">
                <div className="space-y-4">
                  <div className="border-l-2 border-[#3b82f6] pl-3">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Primary Track</p>
                    <p className="font-bold text-gray-900 text-sm">Software Engineering</p>
                  </div>
                  
                  <div className="border-l-2 border-[#ef4444] pl-3">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Core Focus</p>
                    <p className="font-bold text-gray-900 text-sm">Algorithms & Architecture</p>
                  </div>

                  <div className="border-l-2 border-[#eab308] pl-3">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Environment</p>
                    <p className="font-bold text-gray-900 text-sm">Unix / Web Infrastructure</p>
                  </div>
                </div>

                {/* Simulated Success System Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-[#22c55e] font-sans font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Build Successful. Zero errors.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
