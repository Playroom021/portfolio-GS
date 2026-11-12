
import {
  MessageSquareQuote,
  Quote,
  Star,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

// Add genuine testimonials here when you receive them.
const reviews = [];

function ReviewCard({ review }) {
  return (
    <article
      className="rounded-2xl border border-white/[0.08]
                 bg-[#191919] p-6 transition duration-300
                 hover:border-white/20 sm:p-7"
    >
      <div className="flex items-center gap-1 text-[#d4d4d4]">
        {Array.from({ length: review.rating || 5 }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </div>

      <Quote
        size={26}
        className="mt-6 text-[#737373]"
      />

      <p className="mt-3 text-sm leading-7 text-[#b4b4b4]">
        {review.message}
      </p>

      <div className="mt-7 flex items-center gap-3 border-t
                      border-white/[0.08] pt-5">
        <div
          className="flex h-10 w-10 shrink-0 items-center
                     justify-center rounded-full bg-[#303030]
                     text-sm font-semibold text-white"
        >
          {review.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-white">
            {review.name}
          </h3>
          <p className="mt-1 text-xs text-[#8e8e8e]">
            {review.role}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="scroll-mt-8 border-t border-white/[0.06]
                 bg-[#212121] px-6 py-24 text-[#ececec]
                 md:px-12 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-12">
          <p
            className="mb-3 text-xs font-medium uppercase
                       tracking-[0.2em] text-[#8e8e8e]"
          >
            Words from others
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Reviews<span className="text-[#737373]">.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7
                        text-[#a3a3a3] sm:text-base">
            Feedback and perspectives from people I've worked
            with, learned from, and built things alongside.
          </p>
        </div>

        {/* Review cards or empty state */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2
                          xl:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}
          </div>
        ) : (
          <div
            className="relative overflow-hidden rounded-2xl
                       border border-white/[0.08] bg-[#191919]
                       px-6 py-14 text-center sm:px-12 sm:py-20"
          >
            {/* Subtle decorative background */}
            <div
              className="pointer-events-none absolute left-1/2
                         top-0 h-40 w-72 -translate-x-1/2
                         rounded-full bg-white/[0.025] blur-3xl"
            />

            <div className="relative mx-auto max-w-lg">
              <div
                className="mx-auto flex h-14 w-14 items-center
                           justify-center rounded-2xl
                           border border-white/10 bg-[#252525]"
              >
                <MessageSquareQuote
                  size={25}
                  strokeWidth={1.5}
                  className="text-[#d4d4d4]"
                />
              </div>

              <h3 className="mt-6 text-xl font-medium sm:text-2xl">
                Every connection leaves a story.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm
                            leading-7 text-[#a3a3a3]">
                I'm focused on learning, building meaningful
                projects, and collaborating with others.
                Genuine feedback will find its place here
                as my journey continues.
              </p>

              <a
                href="#projects"
                className="mt-7 inline-flex items-center gap-2
                           rounded-xl bg-[#ececec] px-5 py-3
                           text-sm font-medium text-[#171717]
                           transition hover:bg-white"
              >
                Explore my projects
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        )}

        {/* Closing note */}
        <div className="mt-8 flex items-center justify-center
                        gap-2 text-xs text-[#737373]">
          <MessageCircle size={14} />
          <span>Always open to feedback and collaboration.</span>
        </div>
      </div>
    </section>
  );
}
