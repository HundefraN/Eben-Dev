import React from 'react';
import { AnimatePresence, motion, useTransform } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { COMPANY_INFO, STAGE_META } from '../data/companyData';
import { soundFx } from '../utils/audio';

/* ------------------------------------------------------------------ */

const PrimaryCta: React.FC<{
  label: string;
  onClick: () => void;
  quip: string;
  variant?: 'solid' | 'ghost';
  icon?: React.ElementType;
}> = ({ label, onClick, quip, variant = 'solid', icon: Icon = ArrowRight }) => {
  const { sound } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 1, quip });

  const solid = variant === 'solid';

  return (
    <motion.button
      ref={ref}
      {...linkProps}
      onClick={() => {
        if (sound) soundFx.playClickChime();
        onClick();
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 460, damping: 26 }}
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-[13px] font-semibold ${
        solid ? '' : 'surface'
      }`}
      style={
        solid
          ? {
              background: 'var(--action-bg)',
              color: 'var(--action-fg)',
              boxShadow: 'var(--shadow-lg)',
            }
          : { color: 'var(--fg)' }
      }
    >
      {solid && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'linear-gradient(100deg, transparent, color-mix(in srgb, var(--action-fg) 30%, transparent), transparent)',
            animation: 'sheen 1.1s var(--ease-out-soft)',
          }}
        />
      )}
      <span className="relative">{label}</span>
      <Icon className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </motion.button>
  );
};

/* ------------------------------------------------------------------ */

export const Hero: React.FC = () => {
  const { stage, stageFlow, viewport, goTo, reduceMotion, pointer } = useStudio();

  // Everything in the hero drifts a little against the pointer for depth.
  const driftX = useTransform(pointer.xr, [-1, 1], reduceMotion ? [0, 0] : [16, -16]);
  const driftY = useTransform(pointer.yr, [-1, 1], reduceMotion ? [0, 0] : [10, -10]);
  const markDriftX = useTransform(pointer.xr, [-1, 1], reduceMotion ? [0, 0] : [34, -34]);
  const markDriftY = useTransform(pointer.yr, [-1, 1], reduceMotion ? [0, 0] : [20, -20]);

  const homeOpacity = useTransform(stageFlow, [0, 0.55], [1, 0]);
  const homeScale = useTransform(stageFlow, [0, 1], [1, 0.94]);

  const rise = {
    hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: reduceMotion
        ? { duration: 0.01 }
        : { type: 'spring' as const, stiffness: 230, damping: 28, delay: 0.18 + i * 0.075 },
    }),
  };

  return (
    <>
      {/* ---------- Giant wordmark: the stage she stands in ----------
          Suppressed on phones, where it would collide with both the headline
          and the character; the h1 carries the message there instead. */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[8] flex select-none items-center justify-center overflow-hidden"
        style={{
          opacity: homeOpacity,
          scale: homeScale,
          display: viewport.isMobile ? 'none' : 'flex',
        }}
        aria-hidden="true"
      >
        <motion.div
          className="flex w-full flex-col items-center"
          style={{ x: markDriftX, y: markDriftY }}
        >
          <motion.span
            className="font-display block w-full text-center font-extrabold leading-[0.84]"
            style={{
              fontSize: 'clamp(3.2rem, 15.5vw, 15rem)',
              letterSpacing: '-0.045em',
              marginBottom: viewport.isMobile ? '-0.04em' : '-0.06em',
              // A ghost, not a headline. At full ink it fights the character for
              // attention and wins, which is the wrong outcome. Flat rather than
              // a clipped gradient: Chrome drops background-clip:text the moment
              // a filter is animated on the same element, and this one blurs in.
              color: 'var(--ghost)',
            }}
            initial={{ opacity: 0, y: 46, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 150, damping: 26, delay: 0.1 }
            }
          >
            EBEN DEV
          </motion.span>
          <motion.span
            className="font-display block w-full text-center font-semibold leading-[0.9]"
            style={{
              fontSize: 'clamp(1.55rem, 7.1vw, 7rem)',
              letterSpacing: '0.2em',
              color: 'transparent',
              // Gold outline, echoing her sneakers, without muddying the ink above.
              WebkitTextStroke: '1px color-mix(in srgb, var(--accent) 45%, transparent)',
              paddingLeft: '0.2em',
            }}
            initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 150, damping: 26, delay: 0.22 }
            }
          >
            SOLUTIONS
          </motion.span>
        </motion.div>
      </motion.div>

      {/* ---------- Home copy + calls to action ---------- */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 z-[30]"
        style={{
          opacity: homeOpacity,
          bottom: viewport.isMobile ? 'auto' : '3.5rem',
          top: viewport.isMobile ? 'calc(env(safe-area-inset-top) + 5.25rem)' : 'auto',
        }}
      >
        <div
          className={`mx-auto flex w-full max-w-[1600px] px-5 sm:px-8 ${
            viewport.isMobile ? 'justify-center' : 'justify-start'
          }`}
        >
          <motion.div
            className={`flex max-w-[26rem] flex-col gap-4 ${viewport.isMobile ? 'items-center text-center' : 'items-start'}`}
            style={{ x: driftX, y: driftY }}
          >
            <motion.span custom={0} variants={rise} initial="hidden" animate="show" className="eyebrow">
              {COMPANY_INFO.role} · Addis Ababa
            </motion.span>

            <motion.h1
              custom={1}
              variants={rise}
              initial="hidden"
              animate="show"
              className="font-display text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.025em] text-fg sm:text-[1.85rem]"
            >
              {COMPANY_INFO.tagline}
            </motion.h1>

            <motion.p
              custom={2}
              variants={rise}
              initial="hidden"
              animate="show"
              className="max-w-[24rem] text-[13.5px] leading-relaxed text-muted"
            >
              {COMPANY_INFO.subtext}
            </motion.p>

            <motion.div
              custom={3}
              variants={rise}
              initial="hidden"
              animate="show"
              className={`pointer-events-auto mt-1 flex flex-wrap items-center gap-3 ${
                viewport.isMobile ? 'justify-center' : ''
              }`}
            >
              <PrimaryCta
                label="Start a project"
                onClick={() => goTo(3)}
                quip="Yes — start here. I will walk you through it."
              />
              <PrimaryCta
                label="See the work"
                variant="ghost"
                icon={ArrowUpRight}
                onClick={() => goTo(1)}
                quip="Four builds I am genuinely proud of."
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ---------- Stats, balancing the composition ---------- */}
      {!viewport.isCompact && (
        <motion.div
          className="pointer-events-none fixed bottom-14 right-8 z-[30]"
          style={{ opacity: homeOpacity }}
        >
          <motion.dl
            className="flex flex-col items-end gap-3"
            initial="hidden"
            animate="show"
            style={{ x: driftX, y: driftY }}
          >
            {COMPANY_INFO.stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i + 2}
                variants={rise}
                className="flex items-baseline gap-2.5"
              >
                <dt className="eyebrow order-2 text-muted" style={{ fontSize: 9.5 }}>
                  {s.label}
                </dt>
                <dd
                  className="font-display order-1 text-[15px] font-bold tabular-nums text-fg"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {s.value}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      )}

      {/* ---------- Section index for the inner stages ----------
          Small and set under the panel: an oversized numeral had nowhere to go
          that wasn't either behind the panel or on top of her. */}
      <AnimatePresence mode="wait">
        {stage > 0 && !viewport.isCompact && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 240, damping: 30 }}
            className="pointer-events-none fixed bottom-10 z-[9] select-none"
            // Sits under the panel, on the panel's side — the other half of the
            // screen belongs to her, and the numeral would collide with her feet.
            style={
              STAGE_META[stage].side === 'right'
                ? { right: '2.5rem', textAlign: 'right' }
                : { left: '2.5rem' }
            }
            aria-hidden
          >
            <motion.div
              className="flex items-baseline gap-2"
              style={{ x: markDriftX, y: markDriftY }}
            >
              <span
                className="font-display font-bold tabular-nums"
                style={{ fontSize: 13, color: 'var(--accent)' }}
              >
                {String(stage).padStart(2, '0')}
              </span>
              <span className="eyebrow">{STAGE_META[stage].label}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
