/** Short notification tones (Web Audio API — no asset files). */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Call after a user gesture so browsers allow playback (click/tap once on the app). */
export function unlockAudio(): void {
  const ctx = getCtx();
  if (ctx?.state === 'suspended') void ctx.resume();
}

function beep(freq: number, durationMs: number, type: OscillatorType = 'sine') {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

/** Admin: new order or customer message */
export function playAdminIncomingSound() {
  beep(880, 120, 'sine');
  setTimeout(() => beep(660, 140, 'sine'), 100);
}

/** Customer: store notification on order or admin chat reply */
export function playCustomerIncomingSound() {
  beep(523, 100, 'triangle');
  setTimeout(() => beep(784, 120, 'triangle'), 90);
}
