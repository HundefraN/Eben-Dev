import React, { useEffect, useRef } from 'react';
import { ThemePreset } from '../types';

interface BackgroundCanvasProps {
  theme: ThemePreset;
  mouseXRatio: number;
  mouseYRatio: number;
  enableParticles: boolean;
  scrollStage: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  theme,
  mouseXRatio,
  mouseYRatio,
  enableParticles,
  scrollStage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Use refs for all hot-path values so the canvas loop never re-initialises
  const mouseRef = useRef({ x: mouseXRatio, y: mouseYRatio });
  const scrollRef = useRef(scrollStage);

  useEffect(() => {
    mouseRef.current = { x: mouseXRatio, y: mouseYRatio };
  }, [mouseXRatio, mouseYRatio]);

  useEffect(() => {
    scrollRef.current = scrollStage;
  }, [scrollStage]);

  // Canvas is initialised once; scroll + mouse are read via refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ── Particles ──────────────────────────────────────────────────
    const isMob = width < 768;
    const particleCount = enableParticles ? (isMob ? 22 : 48) : 0;
    const particles: Particle[] = [];
    const colors = ['rgba(197, 155, 39, ', 'rgba(11, 37, 69, ', 'rgba(216, 175, 56, '];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.0 + 0.7,
        baseAlpha: Math.random() * 0.4 + 0.12,
        alpha: Math.random() * 0.4 + 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.018 + 0.007,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Pre-built grid for fast nearest-neighbor culling
    const connectDistSq = (isMob ? 80 : 110) ** 2;

    let frame = 0;

    const render = () => {
      frame++;

      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;
      const stage = scrollRef.current;

      // ── Background ──────────────────────────────────────────────
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Stage-aware spotlight offset
      let offsetX = 0;
      if (stage > 0.5 && stage < 1.5)       offsetX =  width * 0.16;
      else if (stage >= 1.5 && stage < 2.5) offsetX = -width * 0.16;
      else if (stage >= 2.5)                offsetX =  width * 0.16;

      const spotlightX = width  / 2 + mX * (width  * 0.18) + offsetX;
      const spotlightY = height / 2 + mY * (height * 0.18);
      const gradRadius  = Math.max(width, height) * 0.65;

      // Primary ambient aura
      const radGrd = ctx.createRadialGradient(spotlightX, spotlightY, 10, spotlightX, spotlightY, gradRadius);
      radGrd.addColorStop(0,   'rgba(197, 155, 39, 0.10)');
      radGrd.addColorStop(0.35,'rgba(11,  37,  69, 0.05)');
      radGrd.addColorStop(1,   'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radGrd;
      ctx.fillRect(0, 0, width, height);

      // Corner vignette for depth
      const vGrd = ctx.createRadialGradient(width/2, height/2, height*0.35, width/2, height/2, height);
      vGrd.addColorStop(0, 'rgba(255,255,255,0)');
      vGrd.addColorStop(1, 'rgba(11,37,69,0.06)');
      ctx.fillStyle = vGrd;
      ctx.fillRect(0, 0, width, height);

      // ── Particles ───────────────────────────────────────────────
      if (enableParticles && particles.length > 0) {
        const mouseCanvasX = (mX + 1) * 0.5 * width;
        const mouseCanvasY = (mY + 1) * 0.5 * height;

        // Draw particle connections (O(n²) — kept small by capping count)
        ctx.lineWidth = 0.7;
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < connectDistSq) {
              const alpha = (1 - Math.sqrt(distSq) / Math.sqrt(connectDistSq)) * 0.16;
              ctx.strokeStyle = `rgba(197, 155, 39, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0)      p.x = width;
          if (p.x > width)  p.x = 0;
          if (p.y < 0)      p.y = height;
          if (p.y > height) p.y = 0;

          // Soft mouse repulsion
          const mdx   = p.x - mouseCanvasX;
          const mdy   = p.y - mouseCanvasY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 130 && mdist > 0) {
            const force = (130 - mdist) / 130;
            p.x += (mdx / mdist) * force * 1.2;
            p.y += (mdy / mdist) * force * 1.2;
          }

          p.alpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.13;
          ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(1, p.alpha))})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  // Only re-init canvas on theme / particle toggle changes — NOT on scroll/mouse
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, enableParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-white"
    />
  );
};