
import {
  ArrowDown,
  ArrowUpRight,
//   Github,
//   Linkedin,
  Code2,
  Terminal,
  Sparkles,
} from "lucide-react";

const technologies = ["React", "Java", "Spring Boot", "Python"];

export default function Home() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center
                 overflow-hidden bg-[#212121] px-6 py-24
                 text-[#ececec] md:px-12 lg:px-16"
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -right-32 -top-32
                   h-96 w-96 rounded-full bg-white/[0.025] blur-3xl"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Introduction badge */}
        <div
          className="mb-8 inline-flex items-center gap-2
                     rounded-full border border-white/10
                     bg-white/[0.03] px-3 py-2"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-[#b4b4b4] sm:text-sm">
            Welcome to my portfolio
          </span>
        </div>

        {/* Hero heading */}
        <div className="max-w-3xl">
          <p className="mb-4 text-base text-[#8e8e8e] sm:text-lg">
            Hello, world! I'm
          </p>

          <h1
            className="text-5xl font-semibold leading-[1.1]
                       tracking-tight sm:text-6xl
                       lg:text-7xl xl:text-8xl"
          >
            Gyan
            <br />
            <span className="text-[#8e8e8e]">Sharma.</span>
          </h1>

          <h2
            className="mt-7 text-xl font-medium text-[#e5e5e5]
                       sm:text-2xl"
          >
            Computer Science Student
            <span className="text-[#666666]"> · </span>
            Developer
          </h2>

          <p
            className="mt-5 max-w-2xl text-base leading-8
                       text-[#a3a3a3] sm:text-lg"
          >
            I enjoy turning ideas into practical applications.
            Currently exploring full-stack development, building
            projects, and strengthening my problem-solving skills
            one line of code at a time.
          </p>
        </div>

        {/* Primary actions */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="group inline-flex items-center gap-2
                       rounded-xl bg-[#ececec] px-5 py-3
                       text-sm font-medium text-[#171717]
                       transition hover:bg-white"
          >
            Explore my work
            <ArrowUpRight
              size={17}
              className="transition-transform
                         group-hover:translate-x-0.5
                         group-hover:-translate-y-0.5"
            />
          </a>

          <a
            href="#about"
            className="inline-flex items-center gap-2
                       rounded-xl border border-white/10
                       px-5 py-3 text-sm font-medium
                       text-[#d4d4d4] transition
                       hover:bg-white/[0.06] hover:text-white"
          >
            About me
            <ArrowDown size={16} />
          </a>
        </div>

        {/* Technology stack */}
        <div className="mt-14 border-t border-white/[0.08] pt-7">
          <div className="mb-4 flex items-center gap-2">
            <Code2 size={16} className="text-[#8e8e8e]" />
            <p
              className="text-xs font-medium uppercase
                         tracking-[0.16em] text-[#8e8e8e]"
            >
              Technologies I work with
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-white/[0.08]
                           bg-white/[0.025] px-3 py-2 text-sm
                           text-[#c5c5c5] transition
                           hover:border-white/20
                           hover:bg-white/[0.06]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Closing note */}
        <div
          className="mt-12 flex items-center gap-2
                     text-sm text-[#737373]"
        >
          <Terminal size={15} />
          <span>Learning, building, and improving.</span>
          <Sparkles size={14} className="ml-1" />
        </div>
      </div>
    </section>
  );
}
