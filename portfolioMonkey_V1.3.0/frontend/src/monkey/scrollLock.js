/**
 * Reference-counted scroll lock used by the mandatory events (first bug, banana,
 * blackout). Locks by reason so one event can never release another's lock.
 * - CSS: html.gs-scroll-locked { overflow: hidden }
 * - Guard: any programmatic scroll (anchors, ladder, focus) snaps back
 * - Anchor clicks are blocked while locked
 * Always released with unlockScroll(reason) or unlockAll().
 */
const reasons = new Set();
let lockY = 0;

const onScroll = () => {
  if (window.scrollY !== lockY) window.scrollTo({ top: lockY, behavior: "instant" });
};
const onClick = (e) => {
  if (e.target.closest?.('a[href^="#"]')) e.preventDefault();
};

function engage() {
  lockY = window.scrollY;
  document.documentElement.classList.add("gs-scroll-locked");
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, true);
}
function release() {
  document.documentElement.classList.remove("gs-scroll-locked");
  window.removeEventListener("scroll", onScroll);
  document.removeEventListener("click", onClick, true);
}

export function lockScroll(reason) {
  if (reasons.has(reason)) return;
  if (reasons.size === 0) engage();
  reasons.add(reason);
}
export function unlockScroll(reason) {
  if (!reasons.delete(reason)) return;
  if (reasons.size === 0) release();
}
export function unlockAll() {
  reasons.clear();
  release();
}
export const isScrollLocked = () => reasons.size > 0;
