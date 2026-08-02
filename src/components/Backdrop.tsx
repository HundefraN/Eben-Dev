import React, { useEffect, useRef } from 'react';
import { useStudio } from '../core/studio';

/**
 * Ambient stage lighting.
 *
 * Four layers, all on one animation frame:
 *   1. Aurora — big soft colour blooms, rendered at 1/8 resolution into an
 *      offscreen buffer and upscaled. The upscale *is* the blur, which is
 *      dramatically cheaper than ctx.filter or a stack of radial gradients.
 *   2. Dot grid — a tiled pattern that parallaxes against the pointer.
 *   3. Motes — drifting specks that are gently attracted to the character,
 *      so the ambient layer feels like it belongs to her.
 *   4. Key light + vignette — a warm pool of light centred on the character.
 */

interface Palette {
  base: string;
  blobs: { color: string; radius: number; ox: number; oy: number; speed: number; phase: number }[];
  grid: string;
  mote: string;
  key: string;
  vignette: string;
}

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    base: '#fdfcfa',
    // Kept low and well separated — overlapping washes turn muddy fast.
    blobs: [
      { color: 'rgba(226,186,88,0.30)', radius: 0.52, ox: -0.3, oy: -0.26, speed: 0.00007, phase: 0 },
      { color: 'rgba(70,124,190,0.22)', radius: 0.6, ox: 0.34, oy: 0.22, speed: 0.00005, phase: 2.1 },
      { color: 'rgba(198,120,70,0.11)', radius: 0.4, ox: 0.2, oy: -0.32, speed: 0.00009, phase: 1.1 },
      { color: 'rgba(255,255,255,0.85)', radius: 0.42, ox: -0.1, oy: 0.34, speed: 0.00008, phase: 4.2 },
    ],
    grid: 'rgba(11,37,69,0.13)',
    mote: '197,155,39',
    // Low: a strong pool of near-white here desaturates the whole palette.
    key: 'rgba(255,248,232,0.32)',
    vignette: 'rgba(11,37,69,0.07)',
  },
  dark: {
    base: '#060d1c',
    blobs: [
      { color: 'rgba(221,182,74,0.22)', radius: 0.5, ox: -0.22, oy: -0.18, speed: 0.00007, phase: 0 },
      { color: 'rgba(44,110,180,0.42)', radius: 0.66, ox: 0.28, oy: 0.18, speed: 0.00005, phase: 2.1 },
      { color: 'rgba(168,90,42,0.22)', radius: 0.44, ox: 0.18, oy: -0.3, speed: 0.00009, phase: 4.2 },
      { color: 'rgba(20,53,96,0.6)', radius: 0.56, ox: -0.12, oy: 0.32, speed: 0.00006, phase: 1.1 },
    ],
    grid: 'rgba(180,206,255,0.14)',
    mote: '235,205,130',
    key: 'rgba(255,216,146,0.16)',
    vignette: 'rgba(0,0,0,0.5)',
  },
};

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  pulse: number;
  phase: number;
}

export const Backdrop: React.FC = () => {
  const { pointer, anchors, theme, reduceMotion, stageFlow } = useStudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const palette = PALETTES[theme];

    // Aurora buffer: tiny on purpose. Upscaling gives us the blur for free.
    const aurora = document.createElement('canvas');
    const actx = aurora.getContext('2d');
    if (!actx) return;

    // The key light and the vignette are static images that only move or
    // resize — baking them once and blitting is far cheaper than rebuilding two
    // full-screen radial gradients on every single frame.
    const keyLight = document.createElement('canvas');
    const vignette = document.createElement('canvas');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let keyR = 0;
    let motes: Mote[] = [];
    let gridPattern: CanvasPattern | null = null;

    const buildGrid = () => {
      const tile = document.createElement('canvas');
      const size = 44;
      tile.width = size;
      tile.height = size;
      const tctx = tile.getContext('2d');
      if (!tctx) return;
      tctx.fillStyle = palette.grid;
      tctx.beginPath();
      tctx.arc(size / 2, size / 2, 1.1, 0, Math.PI * 2);
      tctx.fill();
      gridPattern = ctx.createPattern(tile, 'repeat');
    };

    const bakeLights = () => {
      keyR = Math.max(w, h) * 0.34;
      const size = Math.max(2, Math.round(keyR));
      keyLight.width = size;
      keyLight.height = size;
      const kctx = keyLight.getContext('2d');
      if (kctx) {
        const half = size / 2;
        const kg = kctx.createRadialGradient(half, half, 0, half, half, half);
        kg.addColorStop(0, palette.key);
        kg.addColorStop(1, 'rgba(0,0,0,0)');
        kctx.fillStyle = kg;
        kctx.fillRect(0, 0, size, size);
      }

      vignette.width = Math.max(2, Math.round(w / 2));
      vignette.height = Math.max(2, Math.round(h / 2));
      const vctx = vignette.getContext('2d');
      if (vctx) {
        const vw = vignette.width;
        const vh = vignette.height;
        const vg = vctx.createRadialGradient(
          vw / 2, vh / 2, Math.min(vw, vh) * 0.34,
          vw / 2, vh / 2, Math.max(vw, vh) * 0.78,
        );
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, palette.vignette);
        vctx.fillStyle = vg;
        vctx.fillRect(0, 0, vw, vh);
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      aurora.width = Math.max(48, Math.round(w / 8));
      aurora.height = Math.max(48, Math.round(h / 8));

      const count = w < 768 ? 12 : w < 1280 ? 20 : 30;
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: Math.random() * 1.6 + 0.6,
        a: Math.random() * 0.35 + 0.12,
        pulse: Math.random() * 0.012 + 0.004,
        phase: Math.random() * Math.PI * 2,
      }));

      buildGrid();
      bakeLights();
    };

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let t = 0;
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const drawAurora = (mx: number, my: number, stageShift: number) => {
      const aw = aurora.width;
      const ah = aurora.height;
      actx.globalCompositeOperation = 'source-over';
      actx.fillStyle = palette.base;
      actx.fillRect(0, 0, aw, ah);

      for (const blob of palette.blobs) {
        const drift = reduceMotion ? 0 : t * blob.speed;
        const cx =
          aw * (0.5 + blob.ox + Math.sin(drift + blob.phase) * 0.1 + mx * 0.05 + stageShift * 0.09);
        const cy = ah * (0.5 + blob.oy + Math.cos(drift * 1.3 + blob.phase) * 0.09 + my * 0.05);
        const r = Math.max(aw, ah) * blob.radius;
        const g = actx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, blob.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        actx.fillStyle = g;
        actx.fillRect(0, 0, aw, ah);
      }
    };

    const frame = () => {
      if (!running) return;
      t += 16;

      const mx = pointer.raw.xr;
      const my = pointer.raw.yr;
      const stage = stageFlow.get();
      // Push the light away from whichever side the active panel occupies.
      const stageShift = stage <= 1 ? stage : stage <= 2 ? 2 - stage : -(stage - 2);

      /* 1 — aurora */
      drawAurora(mx, my, stageShift);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.globalAlpha = 1;
      ctx.drawImage(aurora, 0, 0, w, h);

      /* 2 — dot grid, parallaxed */
      if (gridPattern) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.translate(-mx * 14, -my * 14);
        ctx.fillStyle = gridPattern;
        ctx.fillRect(-40, -40, w + 80, h + 80);
        ctx.restore();
      }

      /* 3 — motes drawn toward the character */
      const core = anchors.current.core;
      const hasCore = core.x > 0 || core.y > 0;
      for (const p of motes) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (hasCore) {
            const dx = core.x - p.x;
            const dy = core.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d > 90 && d < 520) {
              // Weak inverse pull — they loiter around her rather than collapse in.
              const pull = 0.0022 * (1 - d / 520);
              p.vx += (dx / d) * pull;
              p.vy += (dy / d) * pull;
            } else if (d <= 90) {
              p.vx -= (dx / d) * 0.004;
              p.vy -= (dy / d) * 0.004;
            }
          }

          // Cheap damping keeps velocities from running away.
          p.vx *= 0.995;
          p.vy *= 0.995;

          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }

        const alpha = p.a + Math.sin(t * p.pulse * 0.06 + p.phase) * 0.1;
        ctx.fillStyle = `rgba(${palette.mote},${Math.max(0.04, alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 4 — key light on the character, then vignette */
      if (hasCore) {
        // 'lighter' in the dark theme reads as a glow; in light it would blow
        // out, so the light theme paints a plain soft bloom instead.
        ctx.globalCompositeOperation = theme === 'dark' ? 'lighter' : 'source-over';
        const d = keyR * 2;
        ctx.drawImage(keyLight, core.x - keyR, core.y - h * 0.06 - keyR, d, d);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.drawImage(vignette, 0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [theme, reduceMotion, pointer, anchors, stageFlow]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden grain pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};
