// Tiny synthesized sound effects — no audio assets to ship or license.
let ctx: AudioContext | null = null;
let enabled = readPref();
let style: 'soft' | 'chiptune' | 'pcspeaker' = 'soft';

export function setSoundStyle(next: 'soft' | 'chiptune' | 'pcspeaker') {
  style = next;
}

function blip(ac: AudioContext, freq: number, start: number, dur: number, gain = 0.07, to?: number) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(gain, start);
  g.gain.setValueAtTime(0, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

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
  if (style === 'chiptune') {
    blip(ac, 330, ac.currentTime + delay, 0.07, 0.06, 990);
    return;
  }
  if (style === 'pcspeaker') {
    // PC speaker tick: one flat square beep, no sweep
    blip(ac, 1200, ac.currentTime + delay, 0.025, 0.04);
    return;
  }
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
  if (style === 'pcspeaker') {
    blip(ac, 880, ac.currentTime + delay, 0.08, 0.05);
    blip(ac, 1760, ac.currentTime + delay + 0.1, 0.12, 0.05);
    return;
  }
  if (style === 'chiptune') {
    // rising major arpeggio: C6 E6 G6 C7
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => blip(ac, f, ac.currentTime + delay + i * 0.06, 0.055, 0.05));
    return;
  }
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
  if (style === 'pcspeaker') {
    [0, 0.18, 0.36].forEach((t) => blip(ac, 1000, ac.currentTime + t, 0.1, 0.05));
    return;
  }
  if (style === 'chiptune') {
    [523.25, 659.25, 783.99, 659.25, 1046.5].forEach((f, i) => blip(ac, f, ac.currentTime + i * 0.11, i === 4 ? 0.3 : 0.09, 0.06));
    return;
  }
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
