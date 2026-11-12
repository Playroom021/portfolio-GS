import { useMemo, useState } from "react";
import { Trophy, Calendar, ExternalLink } from "lucide-react";
import { achievements } from "../data/achievements";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en", { year: "numeric", month: "short", timeZone: "UTC" });
}

function AchievementCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const date = formatDate(item.date);

  return (
    <article
      data-achievement={item.id}
      className="group flex flex-col rounded-2xl border border-white/[0.08]
                 bg-[#191919] p-6 transition duration-300
                 hover:-translate-y-1 hover:border-white/20 sm:p-7"
    >
      {item.image && !imageError && (
        <img
          src={item.image}
          alt={`${item.title} certificate`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="mb-5 aspect-[16/9] w-full rounded-lg object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b4b4b4]">
          {item.category}
        </span>
        {item.placeholder && (
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
            Placeholder
          </span>
        )}
        {date && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-[#8e8e8e]">
            <Calendar size={13} />
            {date}
          </span>
        )}
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#f5f5f5]">
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-[#a3a3a3]">{item.description}</p>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white underline-offset-4 hover:underline"
        >
          View certificate <ExternalLink size={14} />
        </a>
      )}
    </article>
  );
}

export default function Achievements() {
  const [filter, setFilter] = useState("All");

  const sorted = useMemo(
    () => [...achievements].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    []
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(achievements.map((a) => a.category)))],
    []
  );
  const visible = filter === "All" ? sorted : sorted.filter((a) => a.category === filter);

  return (
    <section
      id="achievements"
      className="scroll-mt-8 border-t border-white/[0.06] bg-[#212121] px-6 py-24 text-[#ececec] md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#8e8e8e]">
            Milestones &amp; certificates
          </p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Achievements<span className="text-[#737373]">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#a3a3a3] sm:text-base">
            An archive of certificates, coding milestones, and project recognition.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter achievements by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                filter === c
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-[#b4b4b4] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <AchievementCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-[#191919] px-6 py-14 text-center">
            <Trophy size={26} className="mx-auto text-[#737373]" />
            <p className="mt-4 text-sm text-[#a3a3a3]">Nothing in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
