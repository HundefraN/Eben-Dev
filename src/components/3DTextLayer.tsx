import React, { useRef, useMemo } from 'react';
import { motion, useInView } from 'motion/react';
import { ThemePreset } from '../types';

interface TextLayerProps {
  theme: ThemePreset;
  mouseXRatio: number;
  mouseYRatio: number;
  intensity: number;
  enable3dTilt: boolean;
  scrollStage: number;
}

const styleConfig = {
  faceGradient: 'linear-gradient(135deg, #1e4e8c 0%, #0b2545 45%, #c59b27 100%)',
  extrusionColors: ['#1a3d6b', '#143060', '#0f2650', '#0b2040', '#081730', '#050e1e'],
  backShadow: 'rgba(11, 37, 69, 0.40)',
  glow: 'rgba(11, 37, 69, 0.20)',
  bevelLight: 'rgba(255, 255, 255, 0.45)',
};

// Build the text-shadow string — memoised outside render loop
function buildShadow(mxr: number, myr: number, intensity: number): string {
  const layers = 12;
  const c = styleConfig.extrusionColors;
  const parts: string[] = [];

  for (let i = 1; i <= layers; i++) {
    const dx = mxr * -i * 1.0 * intensity;
    const dy = myr * -i * 1.0 * intensity;
    const ci = Math.min(Math.floor((i / layers) * c.length), c.length - 1);
    parts.push(`${dx}px ${dy}px 0px ${c[ci]}`);
  }

  const maxDX = mxr * -16 * intensity;
  const maxDY = myr * -16 * intensity;
  parts.push(`${maxDX}px ${maxDY + 14}px 30px ${styleConfig.backShadow}`);

  return parts.join(', ');
}

export const TextLayer3D: React.FC<TextLayerProps> = ({
  theme,
  mouseXRatio,
  mouseYRatio,
  intensity,
  enable3dTilt,
  scrollStage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isMobile = screenWidth < 768;
  const maxTextShift = isMobile ? 0 : Math.min(screenWidth * 0.1, 120);

  let stageShiftX = 0;
  if (scrollStage <= 1.0) {
    stageShiftX = -scrollStage * maxTextShift;
  } else if (scrollStage <= 2.0) {
    const t = scrollStage - 1.0;
    stageShiftX = -maxTextShift + t * (2 * maxTextShift);
  } else {
    const t = Math.min(1.0, scrollStage - 2.0);
    stageShiftX = maxTextShift - t * (2 * maxTextShift);
  }

  const textOpacity = scrollStage >= 2.6 ? Math.max(0, 1 - (scrollStage - 2.6) * 2.5) : 1;

  const textX  = mouseXRatio * -45 * intensity + stageShiftX;
  const textY  = mouseYRatio * -32 * intensity;
  const rotateX = enable3dTilt ? -mouseYRatio * 18 * intensity : 0;
  const rotateY = enable3dTilt ?  mouseXRatio * 22 * intensity : 0;

  // Memoised shadow — only recalculates when mouse or intensity changes
  const shadow = useMemo(
    () => buildShadow(mouseXRatio, mouseYRatio, intensity),
    [mouseXRatio, mouseYRatio, intensity],
  );

  const lightAngle = Math.atan2(mouseYRatio, mouseXRatio) * (180 / Math.PI) + 90;

  const getSubtitle   = () => {
    if (scrollStage < 0.5)  return 'WE ARE';
    if (scrollStage < 1.5)  return 'FEATURED SHOWCASE';
    if (scrollStage < 2.5)  return 'THE MIND BEHIND';
    return 'DIRECT CONTACT';
  };
  const getTitlePart1 = () => {
    if (scrollStage < 0.5)  return 'EBEN DEV';
    if (scrollStage < 1.5)  return 'PROJECTS';
    if (scrollStage < 2.5)  return 'EBENDEV';
    return 'CONTACT';
  };
  const getTitlePart2 = () => {
    if (scrollStage < 0.5)  return 'SOLUTIONS';
    if (scrollStage < 1.5)  return 'EXCELLENCE';
    if (scrollStage < 2.5)  return 'LEADERSHIP';
    return 'CENTER';
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden select-none"
      style={{ opacity: textOpacity, transition: 'opacity 0.5s ease' }}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center text-center px-2 w-full max-w-[95vw]"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        animate={{ x: textX, y: textY, rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
      >
        {/* ── Cinematic entrance badge ───────────────────────── */}
        <motion.div
          className="mb-3 sm:mb-4 md:mb-7 tracking-[0.3em] sm:tracking-[0.45em] font-extrabold uppercase"
          initial={{ opacity: 0, y: -28, scale: 0.7 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : -28, scale: isInView ? 1 : 0.7 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.1 }}
          style={{ transform: 'translateZ(60px)' }}
        >
          {/* Subtle pulse ring behind badge */}
          <span className="relative inline-block">
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'rgba(197,155,39,0.18)', borderRadius: 'inherit' }}
            />
            <span className="relative px-5 py-1.5 sm:px-7 sm:py-2 rounded-full text-[10px] sm:text-sm md:text-base font-black shadow-2xl backdrop-blur-md text-[#0b2545] border-2 border-[#c59b27]/70 bg-white/90 inline-block"
              style={{ boxShadow: '0 4px 24px rgba(197,155,39,0.25), 0 1px 0 rgba(255,255,255,0.9) inset' }}
            >
              {getSubtitle()}
            </span>
          </span>
        </motion.div>

        {/* ── 3D Typography ──────────────────────────────────── */}
        <div
          className="relative leading-[0.82] tracking-tight font-black uppercase font-sans flex flex-col items-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Specular light sweep */}
          <div
            className="absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              background: `linear-gradient(${lightAngle}deg, rgba(255,255,255,0.9) 0%, transparent 40%, rgba(255,255,255,0.9) 100%)`,
              transform: 'translateZ(30px)',
              transition: 'background 0.1s linear',
            }}
          />

          {/* Heading Line 1 — springs in from below on load */}
          <motion.h1
            className="text-3xl sm:text-6xl md:text-[9rem] lg:text-[12rem] xl:text-[14.5rem] font-black tracking-tighter select-none relative"
            initial={{ opacity: 0, y: 60, scale: 0.88 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 60, scale: isInView ? 1 : 0.88 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.22 }}
            style={{
              background: styleConfig.faceGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: shadow,
              filter: `drop-shadow(0px 0px 55px ${styleConfig.glow})`,
              letterSpacing: '-0.03em',
              transform: 'translateZ(25px)',
            }}
          >
            {getTitlePart1()}
          </motion.h1>

          {/* Heading Line 2 — offset spring so it follows line 1 */}
          <motion.h2
            className="text-2xl sm:text-5xl md:text-[7.5rem] lg:text-[10rem] xl:text-[12rem] font-black tracking-widest -mt-1 sm:-mt-3 md:-mt-6 lg:-mt-10 select-none relative"
            initial={{ opacity: 0, y: 70, scale: 0.85 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 70, scale: isInView ? 1 : 0.85 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.34 }}
            style={{
              background: styleConfig.faceGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: shadow,
              filter: `drop-shadow(0px 0px 55px ${styleConfig.glow})`,
              letterSpacing: '0.08em',
              transform: 'translateZ(25px)',
            }}
          >
            {getTitlePart2()}
          </motion.h2>

          {/* Decorative golden underline that draws in */}
          <motion.div
            className="mt-3 sm:mt-5 h-[3px] sm:h-[4px] rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isInView ? '60%' : 0, opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            style={{
              background: 'linear-gradient(90deg, transparent, #c59b27 30%, #ffea79 50%, #c59b27 70%, transparent)',
              boxShadow: '0 0 16px rgba(197,155,39,0.5)',
              transformOrigin: 'center',
            }}
          />
        </div>

        {/* Ambient backlight aura */}
        <div
          className="absolute -inset-28 rounded-full blur-[130px] opacity-55 -z-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${styleConfig.glow} 0%, transparent 70%)`,
            transform: `translate(${mouseXRatio * -50}px, ${mouseYRatio * -50}px) translateZ(-80px)`,
          }}
        />
      </motion.div>
    </div>
  );
};