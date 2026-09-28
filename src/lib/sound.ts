// Tiny synthesized sound effects — no audio assets to ship or license.
let ctx: AudioContext | null = null;
let enabled = readPref();

function readPref(): boolean {
  try {
    return localStorage.getItem('poker-planning:sound') !== 'off';
  } catch {
    return true;
  }
}

export function soundEnabled() {
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem('poker-planning:sound', on ? 'on' : 'off');
  } catch {
    // storage unavailable
  }
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Card flip: a short band-passed noise sweep. */
export function playFlip(delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const len = Math.floor(ac.sampleRate * 0.14);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const ch = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(1800, t);
  filter.frequency.exponentialRampToValueAtTime(4200, t + 0.12);
  const gain = ac.createGain();
  gain.gain.value = 0.35;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t);
}

/** Chip clink: two quick inharmonic pings. */
export function playChip(delay = 0) {
  const ac = audio();
  if (!ac) return;
  [0, 0.07].forEach((offset, i) => {
    const t = ac.currentTime + delay + offset;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = i === 0 ? 2480 : 3120;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

/** Soft two-note chime (timer finished). */
export function playChime() {
  const ac = audio();
  if (!ac) return;
  [659.25, 987.77].forEach((freq, i) => {
    const t = ac.currentTime + i * 0.16;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 1);
  });
}
