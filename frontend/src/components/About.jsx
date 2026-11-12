
import {
  Code2,
  GraduationCap,
  MapPin,
  Target,
  Lightbulb,
  Palette,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";


import { useState } from "react";


const skills = [
  "Java",
  "Spring Boot",
  "React",
  "JavaScript",
  "Python / AI-ML",
  "Data Structures & Algorithms",
  "REST APIs",
  "PostgreSQL",
  "MongoDB",
  "Git & GitHub",
];

const highlights = [
  {
    icon: Code2,
    title: "Building projects",
    description:
      "Learning by creating practical applications and exploring how their components work together.",
  },
  {
    icon: Lightbulb,
    title: "Problem-solving",
    description:
      "Developing logical thinking and breaking complex problems into manageable steps.",
  },
  {
    icon: Target,
    title: "Growing as a developer",
    description:
      "Strengthening my Java and Spring Boot skills while building a foundation for software engineering.",
  },
];



export default function About() {

  const [photoError, setPhotoError] = useState(false);
  
  return (
    <section
      id="about"
      className="scroll-mt-8 border-t border-white/[0.06]
                 bg-[#212121] px-6 py-24 text-[#ececec]
                 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-medium uppercase
                        tracking-[0.2em] text-[#8e8e8e]">
            Get to know me
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            About me<span className="text-[#737373]">.</span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a3a3a3] sm:text-base">
            A little about who I am, what I'm learning, and
            the kind of developer I want to become.
          </p>
        </div>

        {/* Profile and introduction */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
          {/* Profile card */}
          <div className="rounded-2xl border border-white/[0.08]
                          bg-[#191919] p-5">
            
            <div className="relative mx-auto aspect-[4/5] max-w-[280px]
                            overflow-hidden rounded-xl bg-[#252525]">
              {!photoError ? (
                <img
                  src="/20260706_181442(1).png"
                  alt="Gyan Sharma"
                  className="h-full w-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="flex h-full w-full flex-col
                                items-center justify-center gap-3">
                  <span className="flex h-20 w-20 items-center
                                  justify-center rounded-full
                                  border border-white/10 bg-[#303030]
                                  text-2xl font-semibold text-white">
                    GS
                  </span>
                  <span className="text-xs text-[#8e8e8e]">
                    Add your profile photo
                  </span>
                </div>
              )}
            </div>


            <div className="mt-5">
              <h3 className="text-xl font-semibold">Gyan Sharma</h3>
              <p className="mt-1 text-sm text-[#a3a3a3]">
                Full Stack Developer
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-[#8e8e8e]">
                <MapPin size={16} />
                <span>Ghaziabad, India</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-[#8e8e8e]">
                <GraduationCap size={16} />
                <span>B.Tech · Computer Science</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-[#b4b4b4]">
                Hello, I'm Gyan.
              </p>

              <h3 className="max-w-2xl text-2xl font-medium
                             leading-relaxed tracking-tight
                             sm:text-3xl">
                I enjoy building things, solving problems,
                and understanding how technology works.
              </h3>
            </div>

            <div className="space-y-4 text-sm leading-8 text-[#a3a3a3] sm:text-base">
              <p>
                I'm a third-year Computer Science and Engineering
                student with a growing interest in full-stack
                development and software engineering.
              </p>

              <p>
                I'm currently focusing on Java and Spring Boot,
                alongside React, databases, REST APIs, and
                Data Structures and Algorithms. I prefer
                learning by building projects and applying
                concepts to real development problems.
              </p>

              <p>
                My goal is to secure a software engineering
                internship, strengthen my technical foundations,
                and grow into an engineer who can design and
                build reliable, useful applications.
              </p>
            </div>

            {/* Personal interests */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-2 rounded-lg
                               border border-white/10 bg-white/[0.025]
                               px-3 py-2 text-sm text-[#c5c5c5]">
                <Code2 size={16} />
                Exploring technology
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg
                               border border-white/10 bg-white/[0.025]
                               px-3 py-2 text-sm text-[#c5c5c5]">
                <Palette size={16} />
                Sketching
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-16 border-t border-white/[0.08] pt-10">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase
                          tracking-[0.18em] text-[#8e8e8e]">
              My toolkit
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Technologies & skills
            </h3>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-white/[0.08]
                           bg-[#191919] px-3.5 py-2.5
                           text-sm text-[#c5c5c5] transition
                           hover:border-white/20 hover:text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Personal approach */}
        <div className="mt-16 border-t border-white/[0.08] pt-10">
          <p className="text-xs font-medium uppercase
                        tracking-[0.18em] text-[#8e8e8e]">
            What drives me
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-white/[0.08]
                           bg-[#191919] p-5 transition
                           hover:border-white/20"
              >
                <Icon size={21} className="text-[#d4d4d4]" />

                <h4 className="mt-5 font-medium">{title}</h4>

                <p className="mt-3 text-sm leading-7 text-[#a3a3a3]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Career goal */}
        <div className="mt-12 flex flex-col justify-between gap-5
                        rounded-2xl border border-white/[0.08]
                        bg-[#191919] p-6 sm:flex-row sm:items-center
                        sm:p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2
              size={22}
              className="mt-1 shrink-0 text-[#b4b4b4]"
            />

            <div>
              <h3 className="text-lg font-medium">
                What I'm working towards
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#a3a3a3]">
                Becoming a strong software development engineer
                through hands-on projects, consistent practice,
                and real-world development experience.
              </p>
            </div>
          </div>

          <a
            href="#projects"
            className="inline-flex shrink-0 items-center gap-2
                       text-sm font-medium text-white
                       hover:text-[#b4b4b4]"
          >
            Explore my projects
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
