import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStudio, type SpeechLine } from '../core/studio';
import { STAGE_META } from '../data/companyData';

/**
 * The companion's speech. It rides her head anchor every frame, flips to
 * whichever side has room, and types the line out so your eye is drawn to it.
 */
export const CompanionBubble: React.FC = () => {
  const { bus, anchors, viewport, reduceMotion, stage } = useStudio();
  const { side: panelSide } = STAGE_META[Math.min(stage, STAGE_META.length - 1)];
  const [line, setLine] = useState<SpeechLine | null>(null);
  const [typed, setTyped] = useState('');
  const holderRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<1 | -1>(1);
  const [side, setSide] = useState<1 | -1>(1);

  useEffect(() => bus.onSpeech(setLine), [bus]);

  /* Typewriter reveal — fast enough to never feel like waiting. */
  useEffect(() => {
    if (!line) {
      setTyped('');
      return;
    }
    if (reduceMotion) {
      setTyped(line.text);
      return;
    }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [line, reduceMotion]);

  /* Follow her head. */
  useEffect(() => {
    if (!line) return;
    let raf = 0;
    const bubbleW = viewport.isMobile ? 210 : 290;
    const gap = viewport.isMobile ? 8 : 18;

    const tick = () => {
      const el = holderRef.current;
      if (el) {
        const head = anchors.current.head;

        // A panel owns one side of the screen, so the bubble takes the other.
        // Otherwise pick whichever side has room, with hysteresis so it
        // doesn't flip back and forth as she drifts.
        if (panelSide === 'right') sideRef.current = -1;
        else if (panelSide === 'left') sideRef.current = 1;
        else {
          const roomRight = viewport.width - head.x;
          if (sideRef.current === 1 && roomRight < bubbleW + 60) sideRef.current = -1;
          else if (sideRef.current === -1 && roomRight > bubbleW + 130) sideRef.current = 1;
        }

        const s = sideRef.current;
        setSide((prev) => (prev === s ? prev : s));
        const x = head.x + s * (viewport.isMobile ? 54 : 88) - (s === -1 ? bubbleW : 0);
        const y = head.y - (viewport.isMobile ? 62 : 92);

        el.style.transform = `translate3d(${Math.round(
          Math.max(12, Math.min(viewport.width - bubbleW - 12, x)),
        )}px, ${Math.round(Math.max(70, y))}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line, anchors, viewport.width, viewport.isMobile, panelSide]);

  const width = viewport.isMobile ? 210 : 290;

  return (
    <div
      ref={holderRef}
      className="pointer-events-none fixed left-0 top-0 z-[38]"
      style={{ width }}
      aria-live="polite"
    >
      <AnimatePresence>
        {line && (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, scale: 0.86, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="surface-raised relative rounded-[var(--radius-lg)] px-4 py-3"
            style={{ transformOrigin: side === 1 ? 'bottom left' : 'bottom right' }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <span className="eyebrow" style={{ fontSize: 9 }}>
                Ebbi · your guide
              </span>
            </div>
            <p
              className="text-[12.5px] leading-snug text-fg"
              style={{ fontWeight: 500, letterSpacing: '-0.005em' }}
            >
              {typed}
              {typed.length < line.text.length && (
                <span className="animate-caret ml-px inline-block">▍</span>
              )}
            </p>

            {/* Tail, pointing back down at her — on whichever side she is. */}
            <span
              className="absolute -bottom-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px]"
              style={{
                left: side === 1 ? 22 : undefined,
                right: side === -1 ? 22 : undefined,
                background: 'var(--bg-elevated)',
                borderRight: '1px solid var(--hairline)',
                borderBottom: '1px solid var(--hairline)',
                backdropFilter: 'blur(var(--blur-glass))',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
