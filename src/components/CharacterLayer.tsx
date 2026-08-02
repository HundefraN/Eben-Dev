import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemePreset, ParallaxConfig, FloatingBadge } from '../types';
import { FLOATING_BADGES } from '../data/companyData';
import { soundFx } from '../utils/audio';
import { Zap, Bot, Layers, Cloud, ShieldCheck, Sparkles, X, Star } from 'lucide-react';

import characterDefaultImg from '../assets/images/eben_dev_character_1784789637344.png';
import characterPointingRightImg from '../assets/images/cs_pointing to the right.png';
import characterPointingLeftImg from '../assets/images/cs_pointing to the left.png';
import characterTalkingPhoneImg from '../assets/images/cs_talking to a phone.png';

// CSS-based orbit dot — no RAF loop per badge
const orbitKeyframesId = 'orbit-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(orbitKeyframesId)) {
  const s = document.createElement('style');
  s.id = orbitKeyframesId;
  s.textContent = `
    @keyframes orbitCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
    @keyframes orbitCCW { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
  `;
  document.head.appendChild(s);
}

const OrbitDot: React.FC<{ color: string; radius: number; durationMs: number; reverse?: boolean }> = ({
  color, radius, durationMs, reverse = false,
}) => (
  // Outer wrapper rotates; inner dot is offset by radius, creating a pure CSS orbit
  <div
    className="pointer-events-none"
    style={{
      position: 'absolute',
      left: '50%',
      top:  '50%',
      width: 0,
      height: 0,
      animation: `${reverse ? 'orbitCCW' : 'orbitCW'} ${durationMs}ms linear infinite`,
      willChange: 'transform',
    }}
  >
    <div
      style={{
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
        left: radius,
        top: -4,
      }}
    />
  </div>
);


interface CharacterLayerProps {
  theme: ThemePreset;
  config: ParallaxConfig;
  mouseXRatio: number;
  mouseYRatio: number;
  scrollStage: number;
  onBadgeSelect?: (badge: FloatingBadge) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Bot,
  Layers,
  Cloud,
  ShieldCheck,
};

// Unique float timing per badge so they never move in sync
const BADGE_FLOAT_CONFIG = [
  { duration: 2.8, yAmp: 10, xAmp: 4, rotAmp: 6, delay: 0.0 },
  { duration: 3.3, yAmp: 13, xAmp: 5, rotAmp: 8, delay: 0.4 },
  { duration: 2.5, yAmp: 8,  xAmp: 6, rotAmp: 5, delay: 0.8 },
  { duration: 3.6, yAmp: 12, xAmp: 3, rotAmp: 7, delay: 0.2 },
  { duration: 3.0, yAmp: 11, xAmp: 5, rotAmp: 6, delay: 1.0 },
];

// Cartoon palette per badge
const BADGE_COLORS = [
  { bg: 'linear-gradient(135deg,#fff176,#ffcc02)', border: '#f7b500', shadow: 'rgba(247,181,0,0.55)', text: '#1a1200', icon: '#e67e00' },
  { bg: 'linear-gradient(135deg,#b3e5fc,#4fc3f7)', border: '#0288d1', shadow: 'rgba(2,136,209,0.5)',  text: '#002a44', icon: '#0288d1' },
  { bg: 'linear-gradient(135deg,#f8bbd0,#f06292)', border: '#c2185b', shadow: 'rgba(194,24,91,0.5)',  text: '#3b0023', icon: '#c2185b' },
  { bg: 'linear-gradient(135deg,#c8e6c9,#66bb6a)', border: '#2e7d32', shadow: 'rgba(46,125,50,0.5)',  text: '#00210a', icon: '#2e7d32' },
  { bg: 'linear-gradient(135deg,#e1bee7,#ba68c8)', border: '#7b1fa2', shadow: 'rgba(123,31,162,0.5)', text: '#1a0035', icon: '#7b1fa2' },
];

// Mini sparkle burst on click
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 36 + Math.random() * 18;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div className="pointer-events-none fixed z-[100]" style={{ left: x, top: y }}>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ffcc02','#f06292','#66bb6a','#4fc3f7','#ba68c8','#ff8a65','#fff176','#aed581'][i % 8],
            top: -4,
            left: -4,
          }}
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={{ scale: 0, x: s.tx, y: s.ty, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <motion.div
        className="absolute -top-5 -left-5 w-10 h-10 rounded-full border-4 border-yellow-400"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};



// Individual cartoon badge
const CartoonBadge: React.FC<{
  badge: FloatingBadge;
  index: number;
  config: ParallaxConfig;
  mouseXRatio: number;
  mouseYRatio: number;
  scrollStage: number;
  onClick: (badge: FloatingBadge, x: number, y: number) => void;
}> = ({ badge, index, config, mouseXRatio, mouseYRatio, scrollStage, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const floatCfg = BADGE_FLOAT_CONFIG[index % BADGE_FLOAT_CONFIG.length];
  const colors = BADGE_COLORS[index % BADGE_COLORS.length];
  const IconComponent = iconMap[badge.iconName] || Sparkles;

  const badgeX = mouseXRatio * 75 * badge.depth * config.intensity;
  const badgeY = mouseYRatio * 55 * badge.depth * config.intensity;
  const opacity = Math.max(0, 1 - scrollStage * 2);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onClick(badge, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <motion.div
      className="absolute pointer-events-auto z-30"
      style={{
        top: `calc(50% + ${badge.yOffsetPct}%)`,
        left: `calc(50% + ${badge.xOffsetPct}%)`,
        opacity,
      }}
      // Entry animation: cartoon spring bounce in
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{
        scale: 1,
        rotate: 0,
        opacity,
        x: badgeX,
        y: badgeY,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 420, damping: 18, delay: 0.15 + index * 0.12 },
        rotate: { type: 'spring', stiffness: 380, damping: 14, delay: 0.15 + index * 0.12 },
        opacity: { duration: 0.4, delay: 0.1 + index * 0.12 },
        x: { type: 'spring', stiffness: 95, damping: 16 },
        y: { type: 'spring', stiffness: 95, damping: 16 },
      }}
    >
      {/* Orbiting sparkle dots when hovered — CSS-only, no RAF */}
      <div className="relative" style={{ width: 0, height: 0 }}>
        {hovered && (
          <>
            <OrbitDot color={colors.border} radius={38} durationMs={1350} />
            <OrbitDot color={colors.icon}   radius={44} durationMs={1700} reverse />
          </>
        )}
      </div>

      {/* Continuous wobbly float animation */}
      <motion.div
        animate={{
          y: [0, -floatCfg.yAmp, floatCfg.yAmp * 0.4, -floatCfg.yAmp * 0.7, 0],
          x: [0, floatCfg.xAmp, -floatCfg.xAmp * 0.5, floatCfg.xAmp * 0.3, 0],
          rotate: [0, floatCfg.rotAmp, -floatCfg.rotAmp * 0.5, floatCfg.rotAmp * 0.3, 0],
        }}
        transition={{
          duration: floatCfg.duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: floatCfg.delay,
          repeatType: 'mirror',
        }}
      >
        {/* Hover squish/stretch */}
        <motion.button
          onMouseEnter={() => {
            setHovered(true);
            if (config.soundEnabled) soundFx.playHoverSound();
          }}
          onMouseLeave={() => setHovered(false)}
          onClick={handleClick}
          animate={
            hovered
              ? { scaleX: 1.13, scaleY: 0.9, rotate: -3 }
              : { scaleX: 1, scaleY: 1, rotate: 0 }
          }
          whileTap={{ scaleX: 0.88, scaleY: 1.12, rotate: 3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 16 }}
          className="relative flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-black select-none"
          style={{
            background: colors.bg,
            color: colors.text,
            border: `3px solid ${colors.border}`,
            borderRadius: '999px',
            boxShadow: `
              0 6px 0 ${colors.border},
              0 10px 20px ${colors.shadow},
              inset 0 2px 0 rgba(255,255,255,0.55)
            `,
            textShadow: '0 1px 0 rgba(255,255,255,0.6)',
            outline: 'none',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            fontFamily: '"Nunito", "Fredoka One", system-ui, sans-serif',
            transform: 'translateZ(0)',
          }}
        >
          {/* Icon with wiggle on hover */}
          <motion.span
            animate={hovered ? { rotate: [0, -20, 15, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IconComponent
              className="w-4 h-4 flex-shrink-0"
              style={{ color: colors.icon, filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.18))' }}
            />
          </motion.span>

          <span className="whitespace-nowrap">{badge.label}</span>

          {/* Shine streak */}
          <motion.span
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            aria-hidden
          >
            <motion.span
              className="absolute top-0 left-[-100%] w-full h-full"
              style={{
                background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 55%, transparent 80%)',
                borderRadius: 'inherit',
              }}
              animate={hovered ? { left: ['−100%', '150%'] } : { left: '-100%' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          </motion.span>
        </motion.button>

        {/* Bottom "pressed" shadow that lifts on hover */}
        <motion.div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full blur-sm"
          style={{ background: colors.shadow, width: '80%', height: 8 }}
          animate={hovered ? { scaleX: 0.7, opacity: 0.4, y: 2 } : { scaleX: 1, opacity: 0.7, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        />
      </motion.div>
    </motion.div>
  );
};

export const CharacterLayer: React.FC<CharacterLayerProps> = ({
  theme,
  config,
  mouseXRatio,
  mouseYRatio,
  scrollStage,
  onBadgeSelect,
}) => {
  const [activeBadge, setActiveBadge] = useState<FloatingBadge | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const burstCounter = useRef(0);

  let pose: 'default' | 'pointing-right' | 'pointing-left' | 'talking-phone' = 'default';
  if (scrollStage < 0.5) pose = 'default';
  else if (scrollStage < 1.5) pose = 'pointing-right';
  else if (scrollStage < 2.5) pose = 'pointing-left';
  else pose = 'talking-phone';

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const isMobile = screenWidth < 768;
  const maxShift = isMobile ? 0 : Math.min(screenWidth * 0.22, 320);

  let baseShiftX = 0;
  if (scrollStage <= 1.0) baseShiftX = -scrollStage * maxShift;
  else if (scrollStage <= 2.0) baseShiftX = -maxShift + (scrollStage - 1.0) * (2 * maxShift);
  else baseShiftX = maxShift - Math.min(1.0, scrollStage - 2.0) * (2 * maxShift);

  const charX = mouseXRatio * 55 * config.intensity + baseShiftX;
  const charY = mouseYRatio * 40 * config.intensity;
  const rotateX = config.enable3dTilt ? -mouseYRatio * 12 * config.intensity : 0;
  const rotateY = config.enable3dTilt ? mouseXRatio * 15 * config.intensity : 0;
  const shadowShiftX = -mouseXRatio * 28 * config.intensity;
  const shadowShiftY = -mouseYRatio * 18 * config.intensity;

  const getShadowFilter = () =>
    `drop-shadow(${shadowShiftX * 0.4}px ${18 + shadowShiftY * 0.3}px 25px rgba(11,37,69,0.28)) drop-shadow(0px 10px 18px rgba(197,155,39,0.25))`;

  const handleBadgeClick = (badge: FloatingBadge, x: number, y: number) => {
    if (config.soundEnabled) soundFx.playClickChime();
    // Pop burst
    const id = burstCounter.current++;
    setBursts((b) => [...b, { id, x, y }]);
    setActiveBadge(badge);
    if (onBadgeSelect) onBadgeSelect(badge);
  };

  const removeBurst = (id: number) => setBursts((b) => b.filter((burst) => burst.id !== id));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
      <motion.div
        className="relative flex flex-col items-center justify-center max-w-2xl w-full px-2"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        animate={{ x: charX, y: charY, rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.85 }}
      >
        <motion.div
          className="relative group pointer-events-auto cursor-grab active:cursor-grabbing flex items-center justify-center"
          initial={{ opacity: 0, y: 80, scale: 0.88 }}
          animate={{ opacity: 1, y: [0, -14, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.6, ease: 'easeOut', delay: 0.15 },
            scale:   { type: 'spring', stiffness: 200, damping: 24, delay: 0.15 },
            y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.75 },
          }}
        >
          <div
            className="relative z-10 flex items-center justify-center w-[240px] sm:w-[380px] md:w-[500px] lg:w-[600px] xl:w-[660px] h-[400px] sm:h-[580px] md:h-[720px]"
            style={{ willChange: 'transform' }}
          >
            {([
              { key: 'default', src: characterDefaultImg, alt: 'Eben Dev Default Hero' },
              { key: 'pointing-right', src: characterPointingRightImg, alt: 'Eben Dev Showcase Hero' },
              { key: 'pointing-left', src: characterPointingLeftImg, alt: 'Eben Dev CEO Profile Hero' },
              { key: 'talking-phone', src: characterTalkingPhoneImg, alt: 'Eben Dev Contact Hero' },
            ] as const).map((item) => (
              <img
                key={item.key}
                src={item.src}
                alt={item.alt}
                referrerPolicy="no-referrer"
                style={{
                  filter: getShadowFilter(),
                  opacity: pose === item.key ? 1 : 0,
                  transform: pose === item.key ? 'scale(1)' : 'scale(0.97)',
                }}
                className="absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-out pointer-events-none mix-blend-normal"
              />
            ))}
          </div>

          {/* Ground shadow */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-10 rounded-[100%] blur-xl -z-10 transition-all duration-300 bg-[#0b2545]/20"
            style={{
              transform: `translateX(calc(-50% + ${shadowShiftX * 0.5}px)) scale(${1 - Math.abs(mouseYRatio) * 0.12})`,
            }}
          />
        </motion.div>

        {/* Floating Cartoon Badges */}
        {config.enableFloatingBadges &&
          pose === 'default' &&
          FLOATING_BADGES.map((badge, i) => (
            <CartoonBadge
              key={badge.id}
              badge={badge}
              index={i}
              config={config}
              mouseXRatio={mouseXRatio}
              mouseYRatio={mouseYRatio}
              scrollStage={scrollStage}
              onClick={handleBadgeClick}
            />
          ))}
      </motion.div>

      {/* Pop bursts */}
      {bursts.map((burst) => (
        <PopBurst key={burst.id} x={burst.x} y={burst.y} onDone={() => removeBurst(burst.id)} />
      ))}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {activeBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 30, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm w-11/12 p-5 rounded-3xl border-[3px] shadow-2xl"
            style={{
              background: 'linear-gradient(135deg,#0b2545 70%,#133863)',
              borderColor: '#c59b27',
              boxShadow: '0 8px 0 #7a5e0a, 0 16px 40px rgba(11,37,69,0.6)',
              color: '#fff',
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 20, -15, 10, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Star className="w-5 h-5 text-[#ffd600] fill-[#ffd600]" />
                </motion.span>
                <span className="text-xs uppercase tracking-wider font-black text-[#ffd600]">
                  {activeBadge.category} Excellence
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                onClick={() => setActiveBadge(null)}
                className="p-1.5 rounded-xl bg-[#133863] text-slate-300 hover:text-white hover:bg-[#1e4d8a] transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <h4 className="text-lg font-black mb-1" style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}>
              {activeBadge.label}
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              Eben Dev Solutions crafts high-caliber software architectures centered around{' '}
              {activeBadge.category.toLowerCase()} and optimized user experiences.
            </p>
            <div
              className="text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-xl border"
              style={{
                color: '#ffd600',
                background: '#071930',
                borderColor: 'rgba(197,155,39,0.4)',
                letterSpacing: '0.08em',
              }}
            >
              ✅ STATUS: PRODUCTION READY
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};