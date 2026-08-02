import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useStudio } from '../core/studio';
import type { CompanionReaction } from '../core/types';

import poseIdle from '../assets/images/eben_dev_character_1784789637344.png';
import posePointRight from '../assets/images/cs_pointing to the right.png';
import posePointLeft from '../assets/images/cs_pointing to the left.png';
import posePhone from '../assets/images/cs_talking to a phone.png';

/**
 * Anchor points expressed as fractions of the artwork box (408 × 612).
 * These were measured off each render so the light threads genuinely leave
 * her hand rather than floating somewhere near it.
 */
interface PoseSpec {
  src: string;
  alt: string;
  head: [number, number];
  hand: [number, number];
  core: [number, number];
  feet: [number, number];
}

const POSES: PoseSpec[] = [
  {
    src: poseIdle,
    alt: 'Ebbi, the Eben Dev guide, walking with a laptop',
    head: [0.52, 0.19],
    hand: [0.65, 0.61],
    core: [0.5, 0.55],
    feet: [0.5, 0.96],
  },
  {
    src: posePointRight,
    alt: 'Ebbi pointing toward the featured work',
    head: [0.5, 0.2],
    hand: [0.9, 0.5],
    core: [0.5, 0.55],
    feet: [0.54, 0.96],
  },
  {
    src: posePointLeft,
    alt: 'Ebbi pointing toward the founder profile',
    head: [0.53, 0.2],
    hand: [0.24, 0.42],
    core: [0.52, 0.56],
    feet: [0.55, 0.96],
  },
  {
    src: posePhone,
    alt: 'Ebbi on a call, ready to take an enquiry',
    head: [0.5, 0.19],
    hand: [0.34, 0.39],
    core: [0.5, 0.56],
    feet: [0.5, 0.96],
  },
];

const ART_RATIO = 408 / 612;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Expanding ring emitted from her hand when she gestures. */
const PulseRing: React.FC<{ id: number; x: number; y: number }> = ({ x, y }) => (
  <motion.span
    className="absolute rounded-full border pointer-events-none"
    style={{
      left: x,
      top: y,
      borderColor: 'var(--accent)',
      translateX: '-50%',
      translateY: '-50%',
    }}
    initial={{ width: 8, height: 8, opacity: 0.7 }}
    animate={{ width: 190, height: 190, opacity: 0 }}
    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
  />
);

export const Companion: React.FC = () => {
  const { pointer, anchors, stage, stageFlow, viewport, reduceMotion, bus, gaze, overlay } =
    useStudio();
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const ringSeq = useRef(0);
  const controls = useAnimationControls();

  const poseIndex = Math.max(0, Math.min(POSES.length - 1, stage));
  const pose = POSES[poseIndex];

  /* ---- sizing ---------------------------------------------------- */
  const { figureH, figureW, baseY } = useMemo(() => {
    const { width, height, isMobile, isCompact } = viewport;
    const h = isMobile
      ? Math.min(height * 0.47, 400)
      : isCompact
        ? Math.min(height * 0.6, 520)
        : Math.min(height * 0.82, 780);
    return {
      figureH: h,
      figureW: h * ART_RATIO,
      // Lower on phones so the headline above her has clear air.
      baseY: isMobile ? height * 0.62 : height * 0.55,
    };
  }, [viewport]);

  /* ---- stage choreography ---------------------------------------- */
  // Home centred; then she steps aside so the panel has room, and gestures at it.
  const shift = viewport.isMobile
    ? 0
    : viewport.isCompact
      ? viewport.width * 0.24
      : Math.min(viewport.width * 0.21, 330);
  const stageX = useTransform(stageFlow, [0, 1, 2, 3], [0, -shift, shift, -shift * 0.72]);

  // On phones a full-bleed panel leaves no room beside her, so she hands over
  // to the avatar in the panel header (see CompanionPip) and steps back.
  const dock = useTransform(stageFlow, (s) => (viewport.isMobile ? Math.min(1, Math.max(0, s)) : 0));
  const dockX = useTransform(dock, (d) => lerp(0, -viewport.width * 0.12, d));
  const dockY = useTransform(dock, (d) => lerp(0, viewport.height * 0.12, d));
  const dockScale = useTransform(dock, (d) => lerp(1, 0.7, d));
  const dockOpacity = useTransform(dock, [0, 0.7], [1, 0]);

  /* ---- lean: toward the gazed element, else toward the pointer ---- */
  const leanXRaw = useMotionValue(0);
  const leanYRaw = useMotionValue(0);
  const springCfg = reduceMotion
    ? { stiffness: 800, damping: 80 }
    : { stiffness: 70, damping: 18, mass: 0.7 };
  const leanX = useSpring(leanXRaw, springCfg);
  const leanY = useSpring(leanYRaw, springCfg);

  const rotateY = useTransform(leanX, [-1, 1], reduceMotion ? [0, 0] : [-13, 13]);
  const rotateX = useTransform(leanY, [-1, 1], reduceMotion ? [0, 0] : [7, -7]);
  const driftX = useTransform(leanX, [-1, 1], reduceMotion ? [0, 0] : [-26, 26]);
  const driftY = useTransform(leanY, [-1, 1], reduceMotion ? [0, 0] : [-16, 16]);

  // An overlay claims one half of the screen; she steps clear of it rather than
  // being half-hidden behind the thing she just opened.
  const asideRaw = useMotionValue(0);
  const aside = useSpring(asideRaw, { stiffness: 120, damping: 24 });
  useEffect(() => {
    const room = viewport.isMobile ? 0 : Math.min(viewport.width * 0.2, 300);
    asideRaw.set(overlay === 'right' ? -room : overlay === 'left' ? room : 0);
  }, [overlay, viewport.isMobile, viewport.width, asideRaw]);

  const totalX = useTransform<number, number>(
    [stageX, dockX, driftX, aside],
    ([a, b, c, d]) => a + b + c + d,
  );
  const totalY = useTransform<number, number>([dockY, driftY], ([a, b]) => a + b);

  const shadowX = useTransform(leanX, [-1, 1], [18, -18]);
  const shadowScaleX = useTransform(leanY, [-1, 1], [1.08, 0.9]);

  /* ---- per-frame: publish anchors, resolve gaze ------------------- */
  useEffect(() => {
    let raf = 0;
    const centerX = () => viewport.width / 2;

    const tick = () => {
      const scale = dockScale.get();
      const w = figureW * scale;
      const h = figureH * scale;
      const cx = centerX() + totalX.get();
      const cy = baseY + totalY.get();
      const left = cx - w / 2;
      const top = cy - h / 2;

      const a = anchors.current;
      a.head = { x: left + pose.head[0] * w, y: top + pose.head[1] * h };
      a.hand = { x: left + pose.hand[0] * w, y: top + pose.hand[1] * h };
      a.core = { x: left + pose.core[0] * w, y: top + pose.core[1] * h };
      a.feet = { x: left + pose.feet[0] * w, y: top + pose.feet[1] * h };
      a.scale = scale;

      // Where should she be looking?
      const target = gaze.current;
      if (target) {
        const r = target.getBoundingClientRect();
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;
        leanXRaw.set(Math.max(-1, Math.min(1, (tx - a.core.x) / (viewport.width * 0.45))));
        leanYRaw.set(Math.max(-1, Math.min(1, (ty - a.core.y) / (viewport.height * 0.5))));
      } else if (pointer.raw.active) {
        leanXRaw.set(pointer.raw.xr);
        leanYRaw.set(pointer.raw.yr);
      } else {
        leanXRaw.set(0);
        leanYRaw.set(0);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    anchors, baseY, dockScale, figureH, figureW, gaze, leanXRaw, leanYRaw,
    pointer, pose, totalX, totalY, viewport.width, viewport.height,
  ]);

  /* ---- reactions -------------------------------------------------- */
  useEffect(() => {
    const emitRing = () => {
      const id = ringSeq.current++;
      setRings((r) => [...r, { id, x: pose.hand[0] * figureW, y: pose.hand[1] * figureH }]);
      setTimeout(() => setRings((r) => r.filter((x) => x.id !== id)), 1300);
    };

    return bus.onReaction((reaction: CompanionReaction) => {
      if (reduceMotion) return;
      switch (reaction.kind) {
        case 'nod':
          controls.start({ rotateZ: [0, -2.5, 1.5, 0], y: [0, 8, -2, 0], transition: { duration: 0.7 } });
          break;
        case 'cheer':
          controls.start({ y: [0, -34, 0], scale: [1, 1.05, 1], transition: { duration: 0.7, ease: [0.34, 1.4, 0.5, 1] } });
          emitRing();
          break;
        case 'point':
          controls.start({
            rotateZ: reaction.side === 'right' ? [0, 2.5, 0] : [0, -2.5, 0],
            transition: { duration: 0.6 },
          });
          emitRing();
          break;
        case 'pulse':
          emitRing();
          break;
      }
    });
  }, [bus, controls, figureH, figureW, pose, reduceMotion]);

  /* ---- idle breathing --------------------------------------------- */
  const breathe = reduceMotion
    ? {}
    : { y: [0, -13, 0], transition: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
      aria-hidden={false}
      role="img"
      aria-label={pose.alt}
    >
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: baseY,
          width: figureW,
          height: figureH,
          x: totalX,
          y: totalY,
          scale: dockScale,
          opacity: dockOpacity,
          translateX: '-50%',
          translateY: '-50%',
          perspective: 1400,
          willChange: 'transform',
        }}
      >
        {/* Rim light seats her into the scene rather than pasting her on top. */}
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: figureW * 1.5,
            height: figureW * 1.5,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 62%)',
            filter: 'blur(30px)',
            opacity: 0.85,
          }}
        />

        <motion.div
          className="relative h-full w-full"
          animate={breathe}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="relative h-full w-full"
            animate={controls}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          >
            {POSES.map((p, i) => (
              <motion.img
                key={p.src}
                src={p.src}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                className="absolute inset-0 h-full w-full object-contain select-none"
                initial={false}
                animate={{
                  opacity: i === poseIndex ? 1 : 0,
                  scale: i === poseIndex ? 1 : 0.965,
                  filter: i === poseIndex ? 'blur(0px)' : 'blur(6px)',
                }}
                transition={{
                  opacity: { duration: reduceMotion ? 0.01 : 0.42, ease: [0.22, 1, 0.36, 1] },
                  scale: { type: 'spring', stiffness: 180, damping: 24 },
                  filter: { duration: 0.35 },
                }}
                style={{
                  filter: 'drop-shadow(0 26px 34px rgba(11,37,69,0.24))',
                  willChange: 'opacity, transform',
                }}
              />
            ))}

            {/* Gesture rings originate exactly at the active pose's hand. */}
            {rings.map((r) => (
              <PulseRing key={r.id} id={r.id} x={r.x} y={r.y} />
            ))}
          </motion.div>
        </motion.div>

        {/* Contact shadow — tracks her lean so she stays grounded. */}
        <motion.div
          className="absolute left-1/2 rounded-[100%] pointer-events-none"
          style={{
            bottom: -figureH * 0.02,
            width: figureW * 0.62,
            height: figureH * 0.045,
            translateX: '-50%',
            x: shadowX,
            scaleX: shadowScaleX,
            background: 'radial-gradient(ellipse, rgba(11,37,69,0.34) 0%, transparent 72%)',
            filter: 'blur(9px)',
          }}
        />
      </motion.div>
    </div>
  );
};
