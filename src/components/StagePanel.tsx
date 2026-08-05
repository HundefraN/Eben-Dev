import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { useCompanionLink, useStudio } from '../core/studio';

import poseIdle from '../assets/images/eben_dev_character_1784789637344.png';

/**
 * On phones there is no room for the full character beside a panel, so her
 * presence is carried by a cropped avatar in the panel header instead. She is
 * still the one introducing the section — just at a size that fits.
 *
 * Always the idle render: the crop is tuned to that artwork's framing, and an
 * avatar that changes identity between sections reads as a different person.
 */
/** Artwork aspect, and where her face sits inside it, as fractions. */
const ART_RATIO = 408 / 612;
const FACE: [number, number] = [0.52, 0.32];
/** Artwork height as a multiple of the pip — higher means a tighter crop. */
const ZOOM = 3.1;

export const CompanionPip: React.FC = () => {
  return (
    <span
      className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full"
      style={{
        background: 'var(--accent-soft)',
        border: '1px solid var(--hairline)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-hidden
    >
      <img
        src={poseIdle}
        alt=""
        className="absolute max-w-none select-none"
        // Scaled and offset so her face lands dead centre in the circle.
        style={{
          height: `${ZOOM * 100}%`,
          width: `${ZOOM * ART_RATIO * 100}%`,
          left: `${(0.5 - FACE[0] * ZOOM * ART_RATIO) * 100}%`,
          top: `${(0.5 - FACE[1] * ZOOM) * 100}%`,
        }}
      />
    </span>
  );
};

/* ------------------------------------------------------------------ */

/** Pixels per second the auto-scroll crawls at. */
const AUTO_SCROLL_SPEED = 30;
/** How long (ms) to pause at the bottom before looping back to top. */
const BOTTOM_PAUSE_MS = 1200;
/** How long (ms) the smooth "rewind to top" animation takes. */
const REWIND_MS = 800;
/** Delay (ms) after the panel appears before auto-scroll starts. */
const START_DELAY_MS = 1400;

interface StagePanelProps {
  index: number;
  side: 'left' | 'right';
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  /** Widened for the contact form, which needs two columns. */
  wide?: boolean;
  /** Enable auto-scroll with pause-on-hover for this panel. */
  showScrollControls?: boolean;
}

export const StagePanel: React.FC<StagePanelProps> = ({
  index,
  side,
  eyebrow,
  title,
  intro,
  children,
  wide = false,
  showScrollControls = false,
}) => {
  const { stage, pointer, viewport, reduceMotion } = useStudio();
  const active = stage === index;
  const [mounted, setMounted] = useState(active);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll machinery
  const rafRef = useRef(0);
  const pausedRef = useRef(false);
  const rewindingRef = useRef(false);
  const lastTimeRef = useRef(0);

  // Keep the panel mounted through its exit animation.
  useEffect(() => {
    if (active) {
      setMounted(true);
      scrollerRef.current?.scrollTo({ top: 0 });
      return;
    }
    const t = setTimeout(() => setMounted(false), 480);
    return () => clearTimeout(t);
  }, [active]);

  /* ---- Auto-scroll effect ---- */
  useEffect(() => {
    if (!showScrollControls || !mounted || !active) return;

    const el = scrollerRef.current;
    if (!el) return;

    let cancelled = false;
    let bottomPauseTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      if (cancelled) return;

      if (pausedRef.current || rewindingRef.current) {
        // Keep the loop alive but don't scroll
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
      }

      const dt = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) {
        // Nothing to scroll
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const newTop = el.scrollTop + AUTO_SCROLL_SPEED * dt;

      if (newTop >= maxScroll) {
        // Reached the bottom — sit there briefly, then rewind
        el.scrollTop = maxScroll;

        if (!bottomPauseTimer) {
          bottomPauseTimer = setTimeout(() => {
            if (cancelled) return;
            bottomPauseTimer = null;
            rewindToTop(el, () => {
              if (!cancelled) {
                lastTimeRef.current = 0; // reset dt so no big jump
                rafRef.current = requestAnimationFrame(tick);
              }
            });
          }, BOTTOM_PAUSE_MS);
        }
        return; // stop the raf loop; rewindToTop will restart it
      }

      el.scrollTop = newTop;
      rafRef.current = requestAnimationFrame(tick);
    };

    /** Smoothly scroll back to 0, then call `onDone`. */
    const rewindToTop = (scrollEl: HTMLElement, onDone: () => void) => {
      rewindingRef.current = true;
      const startY = scrollEl.scrollTop;
      const startTime = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / REWIND_MS, 1);
        // Ease-in-out cubic
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        scrollEl.scrollTop = startY * (1 - ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          scrollEl.scrollTop = 0;
          rewindingRef.current = false;
          onDone();
        }
      };
      requestAnimationFrame(step);
    };

    // Small delay before the auto-scroll kicks in so the panel can finish
    // its entrance animation and the user sees the top content first.
    const startTimer = setTimeout(() => {
      if (!cancelled) {
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(startTimer);
      if (bottomPauseTimer) clearTimeout(bottomPauseTimer);
    };
  }, [showScrollControls, mounted, active]);

  /* ---- Pause on hover / touch ---- */
  const handlePointerEnter = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    pausedRef.current = false;
    lastTimeRef.current = 0; // reset so we don't get a big dt jump
  }, []);

  const { ref: linkRef, linkProps } = useCompanionLink({ weight: 0.5, alwaysOn: active });

  const dir = side === 'right' ? 1 : -1;
  const tiltX = useTransform(pointer.yr, [-1, 1], reduceMotion ? [0, 0] : [3.5, -3.5]);
  const tiltY = useTransform(pointer.xr, [-1, 1], reduceMotion ? [0, 0] : [-4.5, 4.5]);

  if (!mounted) return null;

  return (
    <motion.section
      aria-labelledby={`panel-${index}-title`}
      aria-hidden={!active}
      initial={{ opacity: 0, x: dir * 56, filter: 'blur(10px)' }}
      animate={
        active
          ? { opacity: 1, x: 0, filter: 'blur(0px)' }
          : { opacity: 0, x: dir * 40, filter: 'blur(10px)' }
      }
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 190, damping: 30, mass: 0.9 }
      }
      className={[
        'fixed z-30 flex flex-col',
        // Phones: full bleed, clear of the header and the bottom bar.
        'inset-x-3 top-[calc(env(safe-area-inset-top)+4.25rem)] bottom-[calc(env(safe-area-inset-bottom)+6rem)]',
        // Desktop: anchored to one side, vertically centred.
        'md:inset-x-auto md:top-24 md:bottom-24',
        side === 'right' ? 'md:right-6 lg:right-14' : 'md:left-6 lg:left-14',
        wide
          ? 'md:w-[min(64vw,38rem)] lg:w-[min(46vw,42rem)]'
          : 'md:w-[min(58vw,32rem)] lg:w-[min(40vw,34rem)]',
      ].join(' ')}
      onMouseEnter={showScrollControls ? handlePointerEnter : undefined}
      onMouseLeave={showScrollControls ? handlePointerLeave : undefined}
      onPointerEnter={showScrollControls ? handlePointerEnter : undefined}
      onPointerLeave={showScrollControls ? handlePointerLeave : undefined}
      onPointerOver={showScrollControls ? handlePointerEnter : undefined}
      onTouchStart={showScrollControls ? handlePointerEnter : undefined}
      onTouchEnd={showScrollControls ? handlePointerLeave : undefined}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <motion.div
        ref={linkRef}
        {...linkProps}
        onMouseEnter={showScrollControls ? handlePointerEnter : undefined}
        onMouseLeave={showScrollControls ? handlePointerLeave : undefined}
        onPointerEnter={showScrollControls ? handlePointerEnter : undefined}
        onPointerLeave={showScrollControls ? handlePointerLeave : undefined}
        onPointerOver={showScrollControls ? handlePointerEnter : undefined}
        className="surface-raised edge-light relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)]"
        style={{
          rotateX: viewport.isMobile ? 0 : tiltX,
          rotateY: viewport.isMobile ? 0 : tiltY,
          transformPerspective: 1600,
        }}
      >
        {/* Header */}
        <header className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          {viewport.isMobile && <CompanionPip />}
          <div className="min-w-0 flex-1">
            <span className="eyebrow">{eyebrow}</span>
            <h2
              id={`panel-${index}-title`}
              className="font-display mt-1 text-[1.35rem] font-bold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[1.6rem]"
            >
              {title}
            </h2>
            {intro && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{intro}</p>
            )}
          </div>
        </header>

        <span className="mx-5 block h-px shrink-0 sm:mx-6" style={{ background: 'var(--hairline)' }} />

        {/* Body — pause auto-scroll while the user hovers / touches here */}
        <div
          ref={scrollerRef}
          data-scroller=""
          onMouseEnter={showScrollControls ? handlePointerEnter : undefined}
          onMouseLeave={showScrollControls ? handlePointerLeave : undefined}
          onPointerEnter={showScrollControls ? handlePointerEnter : undefined}
          onPointerLeave={showScrollControls ? handlePointerLeave : undefined}
          onPointerOver={showScrollControls ? handlePointerEnter : undefined}
          onTouchStart={showScrollControls ? handlePointerEnter : undefined}
          onTouchEnd={showScrollControls ? handlePointerLeave : undefined}
          // @container: the contents lay themselves out against the panel's
          // width rather than the viewport's, which is what actually matters here.
          className={[
            'scroll-area @container min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6 sm:py-5',
            showScrollControls ? 'scroll-always-visible pb-6 sm:pb-8' : 'scroll-fade pb-16 sm:pb-20',
          ].join(' ')}
        >
          {children}
        </div>
      </motion.div>
    </motion.section>
  );
};
