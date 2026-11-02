import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStudio, type SpeechLine } from '../core/studio';
import { phonePeek, phonePeekSide } from '../core/layout';
import { STAGE_META } from '../data/companyData';

/** Which way the tail points: down at her from above, or sideways at her face. */
type Tail = 'down' | 'left' | 'right';

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
  const tailRef = useRef<HTMLSpanElement>(null);
  const sideRef = useRef<1 | -1>(1);
  const [side, setSide] = useState<1 | -1>(1);

  /* Phones: centred over her head at home; beside her face once she peeks
     over a panel, filling the strip between her and the far edge. */
  const phone = useMemo(() => {
    if (!viewport.isMobile) return null;
    if (stage === 0) {
      return { mode: 'home' as const, width: Math.min(280, viewport.width - 24), x: 0, bottom: 0 };
    }
    const peekSide = phonePeekSide(STAGE_META[stage]);
    const peek = phonePeek(viewport, peekSide);
    const gap = 6;
    const x = peekSide === -1 ? peek.cx + peek.halfWidth + gap : 12;
    const right = peekSide === -1 ? viewport.width - 12 : peek.cx - peek.halfWidth - gap;
    return {
      mode: 'peek' as const,
      width: Math.max(150, right - x),
      x,
      bottom: peek.panelTop - 10,
      tail: (peekSide === -1 ? 'left' : 'right') as Tail,
    };
  }, [viewport, stage]);

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
      if (el && phone) {
        if (phone.mode === 'home') {
          const { crown, head } = anchors.current;
          const x = Math.max(12, Math.min(viewport.width - phone.width - 12, head.x - phone.width / 2));
          el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(crown.y + 10)}px, 0)`;
          if (tailRef.current) {
            const tx = Math.max(18, Math.min(phone.width - 32, head.x - x - 7));
            tailRef.current.style.left = `${Math.round(tx)}px`;
          }
        } else {
          el.style.transform = `translate3d(${Math.round(phone.x)}px, ${Math.round(phone.bottom)}px, 0)`;
        }
      } else if (el) {
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
  }, [line, anchors, viewport.width, viewport.isMobile, panelSide, phone]);

  const width = phone ? phone.width : 290;
  const tail: Tail = phone?.mode === 'peek' ? phone.tail : 'down';
  const origin = phone
    ? phone.mode === 'home'
      ? 'bottom center'
      : tail === 'left'
        ? 'left center'
        : 'right center'
    : side === 1
      ? 'bottom left'
      : 'bottom right';

  const tailStyle: React.CSSProperties =
    tail === 'down'
      ? {
          bottom: -7,
          left: phone ? undefined : side === 1 ? 22 : undefined,
          right: phone ? undefined : side === -1 ? 22 : undefined,
          borderRight: '1px solid var(--hairline)',
          borderBottom: '1px solid var(--hairline)',
        }
      : tail === 'left'
        ? {
            left: -7,
            top: 'calc(50% - 7px)',
            borderLeft: '1px solid var(--hairline)',
            borderBottom: '1px solid var(--hairline)',
          }
        : {
            right: -7,
            top: 'calc(50% - 7px)',
            borderRight: '1px solid var(--hairline)',
            borderTop: '1px solid var(--hairline)',
          };

  return (
    <div
      ref={holderRef}
      className="pointer-events-none fixed left-0 top-0 z-[38]"
      style={{ width }}
      aria-live="polite"
    >
      {/* On phones the holder marks the bubble's bottom edge, so a two-line
          message grows upward, away from her, rather than down over her. */}
      <div style={{ transform: phone ? 'translateY(-100%)' : undefined }}>
      <AnimatePresence>
        {line && (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, scale: 0.86, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="surface-raised relative rounded-[var(--radius-lg)] px-4 py-3"
            style={{ transformOrigin: origin }}
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

            {/* Tail, pointing back at her — on whichever side she is. */}
            <span
              ref={tailRef}
              className="absolute h-3.5 w-3.5 rotate-45 rounded-[3px]"
              style={{
                ...tailStyle,
                background: 'var(--bg-elevated)',
                backdropFilter: 'blur(var(--blur-glass))',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
