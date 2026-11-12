/**
 * Achievements archive data.
 *
 * Add your REAL achievements here. Each entry supports:
 *   id          unique string
 *   title       what you achieved
 *   date        "YYYY-MM-DD" or "YYYY-MM" (optional)
 *   category    one of achievementCategories (or any label you like)
 *   description short text
 *   image       optional path (e.g. "/certificates/java.png" placed in /public)
 *   link        optional URL to the certificate / proof
 *   placeholder true  -> shows a "Placeholder" badge (delete these once you add real ones)
 */
export const achievementCategories = ["Certification", "Coding", "Project", "Award", "Milestone"];

export const achievements = [
  {
    id: "placeholder-certification",
    placeholder: true,
    title: "Certificate title goes here",
    date: "",
    category: "Certification",
    description:
      "Placeholder entry - replace this with a real certificate. Add an image and a verification link if you have them.",
  },
  {
    id: "placeholder-coding",
    placeholder: true,
    title: "Coding / DSA milestone goes here",
    date: "",
    category: "Coding",
    description:
      "Placeholder entry - for example a contest result or problem-solving milestone. Edit src/data/achievements.js.",
  },
  {
    id: "placeholder-project",
    placeholder: true,
    title: "Project award or recognition goes here",
    date: "",
    category: "Project",
    description:
      "Placeholder entry - remove it once you have added your own achievements.",
  },
];
