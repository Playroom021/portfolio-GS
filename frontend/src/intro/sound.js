let ctx;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = "square", vol = 0.05, endFreq) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const sfx = {
  split: () => tone(120, 0, 0.5, "sawtooth", 0.05, 40),
  flip: (on) => {
    tone(on ? 900 : 600, 0, 0.04, "square", 0.05);
    tone(on ? 500 : 300, 0.035, 0.06, "square", 0.04);
  },
  power: () => {
    tone(80, 0, 0.9, "sawtooth", 0.06, 420);
    tone(1200, 0.7, 0.35, "sine", 0.05, 2400);
  },
};
