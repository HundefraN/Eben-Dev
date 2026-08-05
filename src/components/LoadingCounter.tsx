import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { COMPANY_INFO } from '../data/companyData';

import logoImg from '../assets/images/logo.png';
import poseIdle from '../assets/images/eben_dev_character_1784789637344.png';
import poseRight from '../assets/images/cs_pointing to the right.png';
import poseLeft from '../assets/images/cs_pointing to the left.png';
import posePhone from '../assets/images/cs_talking to a phone.png';

const ceoImg = 'https://res.cloudinary.com/dqosuzul4/image/upload/v1785918975/CEO_l5atvz.jpg';

const ASSETS = [logoImg, poseIdle, poseRight, poseLeft, posePhone, ceoImg];
const TOTAL_STEPS = ASSETS.length + 1;

const MIN_MS = 1800;
const MAX_MS = 6500;

const STEPS = [
  'Warming the stage',
  'Decoding the artwork',
  'Setting the type',
  'Tuning the springs',
  'Ready',
];

const stepFor = (v: number) => (v >= 99.6 ? 4 : v >= 82 ? 3 : v >= 56 ? 2 : v >= 26 ? 1 : 0);

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const wheelDigit = (v: number, place: number) => {
  const scaled = Math.max(0, v) / place;
  if (place === 1) return scaled % 10;
  const whole = Math.floor(scaled);
  const frac = scaled - whole;
  const roll = frac > 0.9 ? (frac - 0.9) / 0.1 : 0;
  return (whole + roll) % 10;
};

const WINDOW_FADE =
  'linear-gradient(to bottom, transparent 0%, #000 11%, #000 89%, transparent 100%)';

const Wheel: React.FC<{ value: MotionValue<number>; place: number }> = ({ value, place }) => {
  const y = useTransform(value, (v) => `${(-wheelDigit(v, place) / CELLS.length) * 100}%`);

  return (
    <span
      className="relative block overflow-hidden"
      style={{
        height: '1em',
        width: '0.62em',
        maskImage: WINDOW_FADE,
        WebkitMaskImage: WINDOW_FADE,
      }}
    >
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y }}>
        {CELLS.map((d, i) => (
          <span key={i} className="block text-center" style={{ height: '1em', lineHeight: 1 }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

const PlainCount: React.FC<{ value: MotionValue<number> }> = ({ value }) => {
  const [n, setN] = useState(0);
  useMotionValueEvent(value, 'change', (v) => setN(Math.round(v)));
  return <span>{String(n).padStart(3, '0')}</span>;
};

const MOTES = [
  { x: '12%', y: '18%', size: 2.5, delay: 0, dur: 7.2 },
  { x: '78%', y: '22%', size: 1.8, delay: 0.6, dur: 8.4 },
  { x: '22%', y: '72%', size: 2.2, delay: 1.1, dur: 6.8 },
  { x: '86%', y: '68%', size: 1.6, delay: 0.3, dur: 9.1 },
  { x: '48%', y: '14%', size: 1.4, delay: 1.8, dur: 7.6 },
  { x: '64%', y: '80%', size: 2, delay: 0.9, dur: 8.8 },
  { x: '8%', y: '48%', size: 1.5, delay: 1.4, dur: 7.9 },
  { x: '92%', y: '42%', size: 1.7, delay: 0.2, dur: 6.5 },
];

const CurtainFill: React.FC<{ anchor: 'top' | 'bottom'; reduceMotion: boolean }> = ({
  anchor,
  reduceMotion,
}) => (
  <div
    className={`grain absolute inset-x-0 overflow-hidden ${anchor === 'top' ? 'top-0' : 'bottom-0'}`}
    style={{ height: '200%' }}
    aria-hidden
  >
    <span
      className="absolute inset-0"
      style={{ background: 'linear-gradient(155deg, #0b2545 0%, #061229 48%, #04091a 100%)' }}
    />
    <span
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(58% 46% at 16% 6%, rgba(221,182,74,0.24), transparent 62%)',
      }}
    />
    <span
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(66% 54% at 86% 94%, rgba(44,110,180,0.38), transparent 66%)',
      }}
    />
    <span
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(40% 34% at 78% 14%, rgba(168,90,42,0.2), transparent 70%)',
      }}
    />
    <span
      className="absolute inset-0 opacity-55"
      style={{
        backgroundImage: 'radial-gradient(rgba(180,206,255,0.13) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }}
    />
    {!reduceMotion && (
      <motion.span
        className="absolute inset-y-0 w-[38%]"
        style={{
          left: '-10%',
          background:
            'linear-gradient(90deg, transparent, rgba(247,231,189,0.055), transparent)',
        }}
        animate={{ x: ['0%', '280%'] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: 'linear' }}
      />
    )}
    <span
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(74% 62% at 50% 50%, transparent 28%, rgba(3,7,18,0.74) 100%)',
      }}
    />
  </div>
);

const BRACKETS = [
  { place: 'left-5 top-5 sm:left-8 sm:top-8', edges: 'border-l border-t', origin: '0% 0%' },
  { place: 'right-5 top-5 sm:right-8 sm:top-8', edges: 'border-r border-t', origin: '100% 0%' },
  { place: 'left-5 bottom-5 sm:left-8 sm:bottom-8', edges: 'border-l border-b', origin: '0% 100%' },
  { place: 'right-5 bottom-5 sm:right-8 sm:bottom-8', edges: 'border-r border-b', origin: '100% 100%' },
];

export const LoadingCounter: React.FC<{ onReveal: () => void }> = ({ onReveal }) => {
  const prefersReduced = useReducedMotion();
  const reduceMotion = !!prefersReduced;

  const [landed, setLanded] = useState(false);
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [step, setStep] = useState(0);

  const count = useMotionValue(0);
  const railWidth = useTransform(count, (v) => `${v}%`);
  const leadOpacity = useTransform(count, [0, 92, 100], [0.18, 0.18, 1]);
  const glow = useTransform(count, [0, 100], [0.18, 0.55]);
  const markScale = useTransform(count, [0, 100], [0.94, 1]);

  const loadedRef = useRef(0);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useEffect(() => {
    let alive = true;
    const bump = () => {
      if (!alive) return;
      loadedRef.current += 1;
      setLoaded(loadedRef.current);
    };

    ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });

    const fonts = document.fonts;
    if (fonts?.ready) fonts.ready.then(bump, bump);
    else bump();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const floor = reduceMotion ? 300 : MIN_MS;
    const start = performance.now();
    let raf = 0;
    let shown = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const gated = Math.min(elapsed / floor, loadedRef.current / TOTAL_STEPS);
      const raw = elapsed >= MAX_MS ? 1 : Math.min(1, Math.max(0, gated));
      const goal = (1 - Math.pow(1 - raw, 1.85)) * 100;

      shown += (goal - shown) * (reduceMotion ? 0.35 : 0.1);
      count.set(shown);

      if (raw >= 1 && 100 - shown < 0.35) {
        count.set(100);
        setLanded(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, reduceMotion]);

  useMotionValueEvent(count, 'change', (v) => {
    const next = stepFor(v);
    setStep((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (!landed) return;
    const timers = [
      setTimeout(() => revealRef.current(), reduceMotion ? 0 : 320),
      setTimeout(() => setOpening(true), reduceMotion ? 100 : 560),
      setTimeout(() => setGone(true), reduceMotion ? 360 : 1780),
    ];
    return () => timers.forEach(clearTimeout);
  }, [landed, reduceMotion]);

  if (gone) return null;

  const split = reduceMotion
    ? { duration: 0.2 }
    : { duration: 1.05, delay: 0.18, ease: [0.76, 0, 0.24, 1] as const };

  const brand = COMPANY_INFO.name;

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden">
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden"
        animate={{ y: opening ? '-100%' : '0%' }}
        transition={split}
      >
        <CurtainFill anchor="top" reduceMotion={reduceMotion} />
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
        animate={{ y: opening ? '100%' : '0%' }}
        transition={split}
      >
        <CurtainFill anchor="bottom" reduceMotion={reduceMotion} />
      </motion.div>

      {!reduceMotion &&
        MOTES.map((m, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute z-[5] rounded-full"
            style={{
              left: m.x,
              top: m.y,
              width: m.size,
              height: m.size,
              background: i % 2 === 0 ? 'rgba(247,231,189,0.7)' : 'rgba(160,196,255,0.55)',
              boxShadow:
                i % 2 === 0
                  ? '0 0 10px rgba(221,182,74,0.55)'
                  : '0 0 8px rgba(100,150,220,0.4)',
            }}
            initial={{ opacity: 0 }}
            animate={
              opening
                ? { opacity: 0, y: -20 }
                : { opacity: [0.15, 0.85, 0.25], y: [0, -14, 0] }
            }
            transition={{
              duration: m.dur,
              delay: m.delay,
              repeat: opening ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-1/2 z-20 block h-px origin-center"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(247,231,189,0.95) 30%, rgba(255,255,255,1) 50%, rgba(247,231,189,0.95) 70%, transparent)',
          boxShadow: '0 0 28px rgba(221,182,74,0.75)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={landed ? { scaleX: 1, opacity: opening ? 0 : 1 } : { scaleX: 0, opacity: 0 }}
        transition={{
          scaleX: { duration: reduceMotion ? 0.01 : 0.65, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: opening ? 0.55 : 0.28 },
        }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0 z-10 grid place-items-center px-6 pb-16 sm:pb-20"
        animate={
          opening
            ? { opacity: 0, y: -22, filter: 'blur(14px)', scale: 1.03 }
            : { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
        }
        transition={reduceMotion ? { duration: 0.12 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {BRACKETS.map((b, i) => (
          <motion.span
            key={b.place}
            className={`absolute h-8 w-8 rounded-[3px] sm:h-9 sm:w-9 ${b.place} ${b.edges}`}
            style={{
              borderColor: 'rgba(221,182,74,0.45)',
              transformOrigin: b.origin,
            }}
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{
              opacity: landed ? [1, 0.55, 1] : 1,
              scale: 1,
            }}
            transition={{
              opacity: landed
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.7, delay: 0.12 + i * 0.05, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.7, delay: 0.12 + i * 0.05, ease: [0.22, 1, 0.36, 1] },
            }}
          />
        ))}

        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.01 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[28px] -z-10 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(221,182,74,0.35), transparent 68%)',
              opacity: glow,
            }}
          />

          <motion.div className="relative grid h-[78px] w-[78px] place-items-center" style={{ scale: markScale }}>
            <motion.span
              className="grid h-full w-full place-items-center overflow-hidden rounded-[22px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(247,231,189,0.2)',
                boxShadow: '0 18px 46px -18px rgba(0,0,0,0.9)',
              }}
              animate={
                landed && !reduceMotion
                  ? { boxShadow: ['0 18px 46px -18px rgba(0,0,0,0.9)', '0 0 40px rgba(221,182,74,0.45)', '0 18px 46px -18px rgba(0,0,0,0.9)'] }
                  : undefined
              }
              transition={landed ? { duration: 0.9, ease: 'easeOut' } : undefined}
            >
              <img src={logoImg} alt="" className="h-full w-full object-cover" />
            </motion.span>
          </motion.div>

          <div
            className="mt-6 flex font-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.38em',
              paddingLeft: '0.38em',
              color: 'rgba(247,231,189,0.62)',
            }}
          >
            {brand.split('').map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : { duration: 0.35, delay: 0.2 + i * 0.028, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {ch === ' ' ? '\u00A0' : ch}
              </motion.span>
            ))}
          </div>

          <div
            className="font-display mt-3 flex items-start font-extrabold"
            style={{
              fontSize: 'clamp(3.8rem, 18vw, 9.8rem)',
              lineHeight: 0.92,
              color: '#f7e7bd',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.04em',
              textShadow: '0 0 64px rgba(221,182,74,0.38)',
            }}
          >
            {reduceMotion ? (
              <PlainCount value={count} />
            ) : (
              <span className="flex">
                <motion.span style={{ opacity: leadOpacity }}>
                  <Wheel value={count} place={100} />
                </motion.span>
                <Wheel value={count} place={10} />
                <Wheel value={count} place={1} />
              </span>
            )}
            <motion.span
              className="font-mono"
              style={{
                fontSize: 'clamp(0.85rem, 2.3vw, 1.3rem)',
                marginLeft: '0.32em',
                marginTop: '0.28em',
                color: 'rgba(221,182,74,0.72)',
                letterSpacing: '0.04em',
              }}
              animate={landed && !reduceMotion ? { opacity: [0.72, 1, 0.72], scale: [1, 1.08, 1] } : undefined}
              transition={landed ? { duration: 0.7 } : undefined}
            >
              %
            </motion.span>
          </div>

          <AnimatePresence>
            {step >= 3 && (
              <motion.p
                key="tag"
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 0.7, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 max-w-[18rem] text-center font-display text-[12px] font-medium leading-snug tracking-[-0.01em]"
                style={{ color: 'rgba(247,231,189,0.55)' }}
              >
                {COMPANY_INFO.tagline}
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className="relative mt-7 h-[2px] w-[min(64vw,21rem)] overflow-hidden rounded-full"
            style={{ background: 'rgba(247,231,189,0.12)' }}
          >
            <motion.span
              className="absolute inset-y-0 left-0 block rounded-full"
              style={{
                width: railWidth,
                background: 'linear-gradient(90deg, rgba(197,155,39,0.4), #f7e7bd 70%, #fff)',
                boxShadow: '0 0 18px rgba(221,182,74,0.9)',
              }}
            />
            {!reduceMotion && (
              <motion.span
                aria-hidden
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                style={{
                  left: railWidth,
                  marginLeft: -4,
                  background: '#f7e7bd',
                  boxShadow: '0 0 12px rgba(247,231,189,0.95)',
                  opacity: landed ? 0 : 1,
                }}
              />
            )}
          </div>

          <div className="mt-3.5 flex w-[min(64vw,21rem)] items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 7, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -7, filter: 'blur(3px)' }}
                transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
                className="truncate font-mono uppercase"
                style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(247,231,189,0.58)' }}
              >
                {STEPS[step]}
              </motion.span>
            </AnimatePresence>
            <span
              className="shrink-0 font-mono tabular-nums"
              style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'rgba(247,231,189,0.32)' }}
            >
              {String(Math.min(loaded, TOTAL_STEPS)).padStart(2, '0')} /{' '}
              {String(TOTAL_STEPS).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-6 sm:px-9 sm:pb-8">
          <motion.span
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(247,231,189,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {COMPANY_INFO.role}
          </motion.span>
          <motion.span
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(247,231,189,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Addis Ababa
          </motion.span>
        </div>
      </motion.div>

      <p role="status" aria-live="polite" className="sr-only">
        {landed ? 'Ready' : `Loading ${COMPANY_INFO.name}`}
      </p>
    </div>
  );
};