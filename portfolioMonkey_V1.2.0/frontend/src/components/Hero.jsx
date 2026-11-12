import React from 'react';

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-100 overflow-hidden pt-[110px] pb-12 px-6 sm:px-12">
      
      {/* CHROME COLORS AMBIENT BACKGROUND GLOWS (Blue & Red) */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#3b82f6] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 right-10 w-82 h-82 bg-[#ef4444] rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10 w-full">
        
        {/* TEXT CONTENT (LEFT SIDE) */}
        <div className="space-y-5 text-center lg:text-left">
          
          {/* Status Tag -> Chrome Green Theme */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#22c55e] px-4 py-1.5 rounded-full text-sm font-medium border border-green-200">
            <span className="flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
            Available for Internships
          </div>
          
          {/* Main Headline -> FIXED text-gray-900 added to "Hi, I am" */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-gray-900">Hi, I am </span>
            <span className="text-[#ef4444]">Gyan Sharma</span>
          </h1>
          
          <p className="text-base sm:text-lg font-medium text-gray-600 max-w-xl mx-auto lg:mx-0">
            A passionate <span className="text-gray-900 font-semibold">Software Engineering Student</span> focused on crafting clean, high-performance web systems, robust backend logic, and elegant algorithmic solutions.
          </p>

          {/* Tech Stack Mini Tags */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
            {['React.js', 'Tailwind CSS', 'Node.js', 'Java', 'Data Structures'].map((tech) => (
              <span key={tech} className="bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-md text-xs font-semibold text-gray-700">
                {tech}
              </span>
            ))}
          </div>
          
          {/* Call To Action Buttons -> Chrome Green */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
            <a href="#projects" className="w-full sm:w-auto px-8 py-3 bg-[#22c55e] hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 text-center">
              View My Work
            </a>
            <a href="#contact" className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 shadow-sm transition-all duration-300 text-center">
              Let's Connect
            </a>
          </div>
        </div>

        {/* VISUAL / GRAPHIC BLOCK (RIGHT SIDE) */}
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-90 lg:h-90">
            {/* Outer Ring -> Chrome Yellow dashed line */}
            <div className="absolute inset-0 border-2 border-dashed border-[#eab308]/40 rounded-full animate-[spin_40s_linear_infinite]" />
            
            <div className="absolute inset-4 bg-[#333] rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              
              {/* Chrome Logo Window Circle Headers */}
              <div className="flex items-center gap-1.5 border-b border-zinc-700 pb-3">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-zinc-500 ml-2 font-mono">gyan_sharma.py</span>
              </div>
              
              {/* Code Script Rendering Block */}
              <div className="flex-grow font-mono text-xs sm:text-sm text-zinc-300 space-y-2 pt-4 text-left">
                <p><span className="text-[#22c55e]">class</span> <span className="text-[#3b82f6]">SoftwareEngineer</span>:</p>
                <p className="pl-4">def <span className="text-[#eab308]">__init__</span>(self):</p>
                <p className="pl-8">self.name = <span className="text-orange-300">"Gyan Sharma"</span></p>
                <p className="pl-8">self.role = <span className="text-orange-300">"Student"</span></p>
                <p className="pl-8">self.skills = [<span className="text-orange-300">"Code"</span>, <span className="text-orange-300">"Build"</span>]</p>
                <br />
                <p className="pl-4">def <span className="text-[#eab308]">is_passionate</span>(self):</p>
                <p className="pl-8 text-[#22c55e]">return True</p>
              </div>

              <div className="text-right font-mono text-[10px] text-zinc-600">
                // Driven by logic.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
