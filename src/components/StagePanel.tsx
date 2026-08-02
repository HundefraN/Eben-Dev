import React, { useEffect, useRef, useState } from 'react';
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

interface StagePanelProps {
  index: number;
  side: 'left' | 'right';
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  /** Widened for the contact form, which needs two columns. */
  wide?: boolean;
}

export const StagePanel: React.FC<StagePanelProps> = ({
  index,
  side,
  eyebrow,
  title,
  intro,
  children,
  wide = false,
}) => {
  const { stage, pointer, viewport, reduceMotion } = useStudio();
  const active = stage === index;
  const [mounted, setMounted] = useState(active);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { ref: linkRef, linkProps } = useCompanionLink({ weight: 0.5, alwaysOn: active });

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
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <motion.div
        ref={linkRef}
        {...linkProps}
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

        {/* Body */}
        <div
          ref={scrollerRef}
          data-scroller=""
          // @container: the contents lay themselves out against the panel's
          // width rather than the viewport's, which is what actually matters here.
          className="scroll-area scroll-fade @container min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6 sm:py-5"
        >
          {children}
        </div>
      </motion.div>
    </motion.section>
  );
};
