
const projects = [
  {
    number: "01",
    title: "CattleEye 2.0",
    category: "AI / Machine Learning",
    description:
      "An AI-powered cattle breed detection platform using image classification. Designed to make breed identification easier with prediction history and analytics.",
    technologies: ["React", "Python", "FastAPI", "TensorFlow", "MongoDB"],
    status: "In development",
    accent: "from-emerald-500/15 to-transparent",
    github: "",
    demo: "",
  },
  {
    number: "02",
    title: "AuthApp",
    category: "Backend / Authentication",
    description:
      "A multi-role authentication application with user registration, login, password hashing, JWT-based authentication, and a PostgreSQL-backed user store.",
    technologies: ["Java", "Spring Boot", "Spring Security", "JWT", "PostgreSQL"],
    status: "In development",
    accent: "from-blue-500/15 to-transparent",
    github: "",
    demo: "",
  },
  {
    number: "03",
    title: "KeyStone DeliveryService",
    category: "Backend / REST API",
    description:
      "A backend service management system designed to organize customers, users, and work orders using a structured REST API and relational database.",
    technologies: ["Java", "Spring Boot", "PostgreSQL", "Maven", "Docker"],
    status: "In development",
    accent: "from-violet-500/15 to-transparent",
    github: "",
    demo: "",
  },
];

function ProjectCard({ project }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl
        border border-white/[0.08] bg-gradient-to-br
        ${project.accent} bg-[#191919] p-6
        transition duration-300 hover:-translate-y-1
        hover:border-white/20 sm:p-7`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium tracking-widest text-[#737373]">
          / {project.number}
        </span>

        <span
          className="rounded-full border border-white/10
                     px-3 py-1 text-xs text-[#b4b4b4]"
        >
          {project.status}
        </span>
      </div>

      {/* Project details */}
      <p className="mt-8 text-xs font-medium uppercase
                    tracking-[0.16em] text-[#8e8e8e]">
        {project.category}
      </p>

      <h3
        className="mt-3 text-2xl font-semibold tracking-tight
                   text-[#f5f5f5] transition-colors
                   group-hover:text-white"
      >
        {project.title}
      </h3>

      <p className="mt-4 min-h-[100px] text-sm leading-7 text-[#a3a3a3]">
        {project.description}
      </p>

      {/* Technology badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-md border border-white/[0.08]
                       bg-black/20 px-2.5 py-1.5
                       text-xs text-[#c5c5c5]"
          >
            {technology}
          </span>
        ))}
      </div>

      {/* Project links */}
      <div className="mt-7 flex flex-wrap items-center gap-4
                      border-t border-white/[0.08] pt-5">
        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white
                       underline-offset-4 hover:underline"
          >
            GitHub ↗
          </a>
        ) : (
          <span className="text-sm text-[#737373]">
            Source code coming soon
          </span>
        )}

        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#b4b4b4]
                       hover:text-white"
          >
            Live demo ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="min-h-screen scroll-mt-8 border-t
                 border-white/[0.06] bg-[#212121]
                 px-6 py-24 text-[#ececec]
                 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-medium uppercase
                        tracking-[0.2em] text-[#8e8e8e]">
            Selected work
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-4xl font-semibold
                             tracking-tight sm:text-5xl">
                Projects<span className="text-[#737373]">.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7
                            text-[#a3a3a3] sm:text-base">
                Things I'm building, problems I'm solving,
                and technologies I'm exploring.
              </p>
            </div>

            <a
              href="https://github.com/Playroom021"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2
                         rounded-lg border border-white/10
                         px-4 py-2.5 text-sm text-[#d4d4d4]
                         transition hover:bg-white/[0.06]
                         hover:text-white"
            >
              GitHub profile ↗
            </a>
          </div>
        </div>

        {/* Responsive project grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2
                        xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.number}
              project={project}
            />
          ))}
        </div>

        {/* Closing note */}
        <p className="mt-10 text-sm text-[#737373]">
          Always learning. Always building.
        </p>
      </div>
    </section>
  );
}
