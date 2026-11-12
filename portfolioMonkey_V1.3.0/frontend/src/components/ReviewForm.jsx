import { useEffect, useRef, useState } from "react";
import { Star, Lock, CheckCircle2, Info } from "lucide-react";
import {
  MAX_RATING,
  MAX_WORDS,
  MIN_RATING,
  countWords,
  loadDraft,
  loadReviews,
  saveDraft,
  saveReview,
  validateField,
} from "../data/reviewsStore";

const STARS = Array.from({ length: 6 }, (_, i) => i + 1);

const formatDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
};

function StarsDisplay({ rating }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of ${MAX_RATING} stars`}>
      {STARS.map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= rating ? "text-amber-300" : "text-[#4a4a4a]"}
          fill={n <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function WordCounter({ id, text }) {
  const words = countWords(text);
  const over = words > MAX_WORDS;
  return (
    <p
      id={id}
      aria-live="polite"
      className={`mt-1.5 text-right text-xs ${over ? "text-red-300" : "text-[#8e8e8e]"}`}
    >
      {words} / {MAX_WORDS} words{over ? " - too long" : ""}
    </p>
  );
}

/**
 * Six-star rating (only 4-6 selectable) + review form.
 * Fully independent of the monkey/animation system.
 */
export default function ReviewForm() {
  const draft = useRef(loadDraft()).current;
  const [rating, setRating] = useState(draft?.rating ?? null);
  const [comment, setComment] = useState(draft?.comment ?? "");
  const [suggestions, setSuggestions] = useState(draft?.suggestions ?? "");
  const [hover, setHover] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(loadReviews);
  const submitting = useRef(false);
  const starRefs = useRef([]);

  // keep an unsent draft so reload / Back does not lose what was typed
  useEffect(() => {
    saveDraft(rating || comment || suggestions ? { rating, comment, suggestions } : null);
  }, [rating, comment, suggestions]);

  // stay in sync with other tabs
  useEffect(() => {
    const sync = () => setSaved(loadReviews());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const choose = (n) => {
    if (n < MIN_RATING) {
      // never silently upgrade a lower rating
      setNotice(`This feedback form accepts ratings from ${MIN_RATING} to ${MAX_RATING} stars. ${n} star${n > 1 ? "s are" : " is"} not available.`);
      return;
    }
    setNotice("");
    setDone(false);
    setRating(n);
  };

  const onStarKey = (e, n) => {
    const move = (to) => {
      e.preventDefault();
      const next = Math.min(6, Math.max(1, to));
      starRefs.current[next - 1]?.focus();
    };
    if (e.key === "ArrowRight" || e.key === "ArrowUp") move(n + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") move(n - 1);
    else if (e.key === "Home") move(1);
    else if (e.key === "End") move(6);
  };

  const commentError = validateField("Your review", comment, { required: true });
  const suggestionError = validateField("Suggestions", suggestions, { required: false });
  const commentTouched = comment.length > 0;
  const canSubmit = rating >= MIN_RATING && !commentError && !suggestionError;

  const submit = (e) => {
    e.preventDefault();
    if (submitting.current) return; // block double submits
    setError("");
    if (!(rating >= MIN_RATING)) {
      setError(`Please choose a rating from ${MIN_RATING} to ${MAX_RATING} stars.`);
      return;
    }
    const problem = commentError || suggestionError;
    if (problem) {
      setError(problem);
      return;
    }
    submitting.current = true;
    const result = saveReview({ rating, comment, suggestions });
    submitting.current = false;
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(loadReviews());
    setDone(true);
    setRating(null);
    setComment("");
    setSuggestions("");
    saveDraft(null);
  };

  const shown = hover || rating || 0;

  return (
    <div className="mb-10 rounded-2xl border border-white/[0.08] bg-[#191919] p-6 sm:p-8">
      <h3 className="text-xl font-medium text-white">Rate this portfolio</h3>
      <p className="mt-2 text-sm leading-7 text-[#a3a3a3]">
        Choose a rating from {MIN_RATING} to {MAX_RATING} stars, then share a short review and any
        suggestions.
      </p>

      {/* six-star scale */}
      <div
        role="radiogroup"
        aria-label={`Rating, 1 to ${MAX_RATING} stars. Only ${MIN_RATING} to ${MAX_RATING} can be selected.`}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        {STARS.map((n) => {
          const allowed = n >= MIN_RATING;
          const filled = n <= shown;
          return (
            <button
              key={n}
              ref={(node) => {
                starRefs.current[n - 1] = node;
              }}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-disabled={!allowed}
              aria-label={
                allowed ? `${n} stars` : `${n} star${n > 1 ? "s" : ""}, unavailable on this form`
              }
              title={allowed ? `${n} stars` : `Unavailable: this form accepts ${MIN_RATING}-${MAX_RATING} stars`}
              tabIndex={rating === n || (rating === null && n === MIN_RATING) ? 0 : -1}
              onClick={() => choose(n)}
              onKeyDown={(e) => onStarKey(e, n)}
              onMouseEnter={() => allowed && setHover(n)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => allowed && setHover(n)}
              onBlur={() => setHover(0)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300
                ${
                  allowed
                    ? "cursor-pointer border-white/15 bg-[#222] hover:-translate-y-0.5 hover:border-amber-300/60"
                    : "cursor-not-allowed border-white/5 bg-[#1b1b1b] opacity-50"
                }
                ${rating === n ? "border-amber-300 bg-amber-300/10 scale-105" : ""}`}
            >
              <Star
                size={24}
                className={filled ? "text-amber-300" : "text-[#6b6b6b]"}
                fill={filled ? "currentColor" : "none"}
              />
              {!allowed && <Lock size={11} className="absolute bottom-1 right-1 text-[#8e8e8e]" />}
              <span className="sr-only">{n}</span>
            </button>
          );
        })}
        <span className="ml-1 text-sm text-[#b4b4b4]" aria-live="polite">
          {rating ? `${rating} / ${MAX_RATING} stars selected` : "No rating selected"}
        </span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-[#8e8e8e]">
        <Info size={14} className="mt-1 shrink-0" />
        <span>
          Stars 1, 2 and 3 are shown for the full scale but are disabled - this feedback form only
          accepts ratings from {MIN_RATING} to {MAX_RATING} stars.
        </span>
      </p>
      <p role="status" className="mt-2 min-h-5 text-sm text-amber-200">
        {notice}
      </p>

      {/* review form (opens after an eligible rating) */}
      {rating >= MIN_RATING && (
        <form onSubmit={submit} noValidate className="mt-4 space-y-5 border-t border-white/[0.08] pt-6">
          <p className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            Your rating: <StarsDisplay rating={rating} />
          </p>

          <div>
            <label htmlFor="review-comment" className="text-sm font-medium text-white">
              Your Review
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              aria-describedby="review-comment-count"
              aria-invalid={Boolean(commentTouched && commentError)}
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#141414] p-3 text-sm text-[#ececec]
                         placeholder:text-[#6b6b6b] focus-visible:outline-2 focus-visible:outline-amber-300"
              placeholder="What did you think? (up to 50 words)"
            />
            <WordCounter id="review-comment-count" text={comment} />
          </div>

          <div>
            <label htmlFor="review-suggestions" className="text-sm font-medium text-white">
              Suggestions for Improvement
            </label>
            <textarea
              id="review-suggestions"
              rows={3}
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              aria-describedby="review-suggestions-count"
              aria-invalid={Boolean(suggestionError)}
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#141414] p-3 text-sm text-[#ececec]
                         placeholder:text-[#6b6b6b] focus-visible:outline-2 focus-visible:outline-amber-300"
              placeholder="Anything I could improve? (optional, up to 50 words)"
            />
            <WordCounter id="review-suggestions-count" text={suggestions} />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-[#ececec] px-5 py-3 text-sm font-medium text-[#171717] transition
                       hover:bg-white disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            Submit review
          </button>
        </form>
      )}

      {done && (
        <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>
            Thank you! Your review was saved <strong>in this browser</strong>. It isn&apos;t sent to
            a server, so it may not appear on another device.
          </span>
        </div>
      )}

      {/* saved reviews (rendered as plain text - never as HTML) */}
      {saved.length > 0 && (
        <div className="mt-8 border-t border-white/[0.08] pt-6">
          <h4 className="text-sm font-medium text-white">Your saved reviews</h4>
          <p className="mt-1 text-xs text-[#8e8e8e]">
            Stored in this browser only (local storage). They stay after a reload or the Back button.
          </p>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {saved.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/[0.08] bg-[#151515] p-4">
                <div className="flex items-center justify-between gap-3">
                  <StarsDisplay rating={r.rating} />
                  <span className="text-xs text-[#737373]">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#d4d4d4]">
                  {r.comment}
                </p>
                {r.suggestions && (
                  <p className="mt-3 whitespace-pre-wrap break-words border-t border-white/[0.06] pt-3 text-xs leading-6 text-[#a3a3a3]">
                    <span className="font-medium text-[#b4b4b4]">Suggestion: </span>
                    {r.suggestions}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
