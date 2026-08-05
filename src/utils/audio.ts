/**
 * Small Web Audio kit. Everything is filtered and quiet — the goal is a soft
 * tactile confirmation, not an arcade cabinet. Muted by default; the studio
 * provider opts in only after the user flips the sound switch.
 */
class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastHover = 0;
  private unlocked = false;

  constructor() {
    this.setupGestureListeners();
  }

  private setupGestureListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      this.unlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private init(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Gentle low-pass keeps every cue warm instead of piercing.
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2600;
      filter.Q.value = 0.6;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;

      this.master.connect(filter);
      filter.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(
    ctx: AudioContext,
    {
      freq,
      to,
      type = 'sine',
      at = 0,
      dur = 0.12,
      peak = 0.15,
    }: { freq: number; to?: number; type?: OscillatorType; at?: number; dur?: number; peak?: number },
  ) {
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);

    // Short attack, long-ish exponential tail reads as "soft" rather than "blip".
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Quiet tick. Rate-limited so sweeping across a grid doesn't machine-gun. */
  playHoverSound() {
    const now = performance.now();
    if (now - this.lastHover < 90) return;
    this.lastHover = now;
    try {
      const ctx = this.init();
      if (!ctx) return;
      this.tone(ctx, { freq: 880, to: 1180, dur: 0.07, peak: 0.12 });
    } catch {
      /* audio is decorative — never let it break the page */
    }
  }

  /** Warm major-third confirmation. */
  playClickChime() {
    try {
      const ctx = this.init();
      if (!ctx) return;
      [
        { freq: 587.33, at: 0 },
        { freq: 739.99, at: 0.045 },
        { freq: 987.77, at: 0.09 },
      ].forEach(({ freq, at }) => this.tone(ctx, { freq, at, dur: 0.4, peak: 0.24 }));
    } catch {
      /* ignore */
    }
  }

  /** Airy low sweep for stage transitions. */
  playParallaxSwoosh() {
    try {
      const ctx = this.init();
      if (!ctx) return;
      this.tone(ctx, { freq: 180, to: 420, type: 'triangle', dur: 0.26, peak: 0.18 });
      this.tone(ctx, { freq: 90, to: 210, type: 'sine', dur: 0.3, peak: 0.12 });
    } catch {
      /* ignore */
    }
  }
}

export const soundFx = new SoundEffectsEngine();
