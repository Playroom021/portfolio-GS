/**
 * Small persistence layer for the monkey story.
 *  - Achievements live in localStorage (survive reloads and new sessions).
 *  - Battery falls / spider flag live in sessionStorage (one browsing session).
 * Falls back to in-memory values if the browser blocks storage.
 */
const PROGRESS_KEY = "gs-progress";
const memory = { local: {}, session: {} };

function read(area, key) {
  try {
    return (area === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return memory[area][key] ?? null;
  }
}
function write(area, key, value) {
  memory[area][key] = value;
  try {
    (area === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* storage blocked - memory copy is used */
  }
}

export const ACHIEVEMENTS = {
  firstBug: {
    title: "First Bug Cleaned!",
    description: "Caught the very first bug in the portfolio.",
  },
  banana: {
    title: "Banana Feeding!",
    description: "Fed the hungry monkey a banana.",
  },
};

export function getProgress() {
  try {
    return JSON.parse(read("local", PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

export const isUnlocked = (id) => Boolean(getProgress()[id]);

/** Returns true only the first time an achievement is awarded. */
export function unlock(id) {
  const progress = getProgress();
  if (progress[id]) return false;
  progress[id] = new Date().toISOString();
  write("local", PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("gs-progress-change"));
  return true;
}

/* ---- session counters ---- */
export const MAX_FALLS = 2;
export const getFalls = () => Number(read("session", "gs-battery-falls") || 0);
export const addFall = () => {
  write("session", "gs-battery-falls", String(getFalls() + 1));
  return getFalls();
};
export const spiderSeen = () => read("session", "gs-spider") === "1";
export const markSpiderSeen = () => write("session", "gs-spider", "1");
