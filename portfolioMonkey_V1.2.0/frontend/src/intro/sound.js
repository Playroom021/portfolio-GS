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

function noise(start, dur, vol = 0.04, freq = 1800) {
  const c = getCtx();
  if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(c.currentTime + start);
}

export const sfx = {
  // monkey adventure (all short and quiet)
  pop: () => tone(300, 0, 0.12, "sine", 0.05, 720),
  catch: () => {
    tone(660, 0, 0.09, "triangle", 0.05);
    tone(880, 0.09, 0.09, "triangle", 0.05);
    tone(1320, 0.18, 0.2, "triangle", 0.05);
  },
  chime: () => {
    tone(988, 0, 0.12, "sine", 0.045);
    tone(1318, 0.12, 0.3, "sine", 0.045);
  },
  munch: () => {
    noise(0, 0.07, 0.05, 900);
    noise(0.16, 0.07, 0.05, 900);
    noise(0.32, 0.07, 0.05, 900);
  },
  snap: () => {
    tone(190, 0, 0.06, "square", 0.05, 90);
    noise(0, 0.04, 0.05, 3200);
  },
  thud: () => tone(110, 0, 0.14, "sine", 0.07, 55),
  screech: () => {
    tone(520, 0, 0.18, "sawtooth", 0.025, 980);
    tone(980, 0.2, 0.22, "sawtooth", 0.025, 420);
  },
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
