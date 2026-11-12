export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
