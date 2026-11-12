/**
 * Review persistence.
 *
 * This project is a front-end only app (no backend / database), so reviews are
 * stored with localStorage as a documented fallback:
 *   - They are saved in THIS browser only. They are not sent anywhere and will
 *     not appear on other devices or for other visitors.
 *   - Reload and the browser Back button never remove them.
 * If you add a backend later, replace loadReviews()/saveReview() with API calls
 * (and validate + sanitise again on the server).
 *
 * Drafts (unsent text) are kept in sessionStorage so Back/refresh does not lose them.
 */
const REVIEWS_KEY = "gs-reviews-v1";
const DRAFT_KEY = "gs-review-draft-v1";

export const MIN_RATING = 4;
export const MAX_RATING = 6;
export const MAX_WORDS = 50;
export const MAX_CHARS = 500;
const MAX_SAVED = 50;

const memory = { reviews: [], draft: null };

export const countWords = (text) => (text.trim().match(/\S+/g) || []).length;

/** Trim, strip control characters and collapse stray whitespace. */
export function normalizeText(text) {
  return String(text ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Returns an error message, or "" when the field is fine. */
export function validateField(label, text, { required }) {
  const clean = normalizeText(text);
  if (required && !clean) return `${label} can't be empty.`;
  if (countWords(clean) > MAX_WORDS) return `${label} is limited to ${MAX_WORDS} words.`;
  if (clean.length > MAX_CHARS) return `${label} is too long (max ${MAX_CHARS} characters).`;
  return "";
}

const signature = (r) =>
  `${r.rating}|${r.comment.toLowerCase()}|${r.suggestions.toLowerCase()}`;

export function loadReviews() {
  try {
    const raw = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((r) => r && typeof r.comment === "string") : [];
  } catch {
    return memory.reviews;
  }
}

/**
 * Validates again, blocks exact duplicates, saves.
 * Returns { ok: true, review } or { ok: false, error }.
 */
export function saveReview({ rating, comment, suggestions }) {
  const clean = {
    rating: Number(rating),
    comment: normalizeText(comment),
    suggestions: normalizeText(suggestions),
  };
  if (!Number.isInteger(clean.rating) || clean.rating < MIN_RATING || clean.rating > MAX_RATING) {
    return { ok: false, error: `Ratings from ${MIN_RATING} to ${MAX_RATING} stars are accepted.` };
  }
  const problem =
    validateField("Your review", clean.comment, { required: true }) ||
    validateField("Suggestions", clean.suggestions, { required: false });
  if (problem) return { ok: false, error: problem };

  const existing = loadReviews();
  if (existing.some((r) => signature(r) === signature(clean))) {
    return { ok: false, error: "You've already submitted this exact review." };
  }

  const review = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ...clean,
    createdAt: new Date().toISOString(),
  };
  const next = [review, ...existing].slice(0, MAX_SAVED);
  memory.reviews = next;
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
  } catch {
    return {
      ok: false,
      error: "Your browser blocked storage, so the review could not be saved here.",
    };
  }
  window.dispatchEvent(new CustomEvent("gs-reviews-change"));
  return { ok: true, review };
}

export function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || memory.draft;
  } catch {
    return memory.draft;
  }
}
export function saveDraft(draft) {
  memory.draft = draft;
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
