import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cloud, Gauge, Orbit, ShieldCheck, Sparkles } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { CAPABILITY_CHIPS } from '../data/companyData';
import type { CapabilityChip } from '../core/types';
import { soundFx } from '../utils/audio';

const ICONS: Record<string, React.ElementType> = { Gauge, Sparkles, Orbit, Cloud, ShieldCheck };

const DEG = Math.PI / 180;

/**
 * Capability chips arranged around the companion.
 *
 * They hold designed positions rather than sweeping a circle — a chip that
 * never stops moving is a target you have to chase. Depth comes from where a
 * chip sits on the ellipse: the back half is dimmed, shrunk and pushed behind
 * her, the front half comes forward and overlaps her. On top of that each chip
 * breathes a few pixels, freezes the moment you reach for it, and bounces
 * outward in sequence whenever she reacts to something.
 */

interface ChipProps {
  chip: CapabilityChip;
  index: number;
  onHoverChange: (index: number, hovering: boolean) => void;
  registerNode: (index: number, el: HTMLDivElement | null) => void;
}

const OrbitChip: React.FC<ChipProps> = ({ chip, index, onHoverChange, registerNode }) => {
  const { sound, viewport, bus } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 1, quip: chip.quip });
  const [open, setOpen] = useState(false);
  const Icon = ICONS[chip.iconName] ?? Sparkles;

  const activate = () => {
    if (sound) soundFx.playHoverSound();
    onHoverChange(index, true);
    setOpen(true);
  };
  const deactivate = () => {
    onHoverChange(index, false);
    setOpen(false);
  };

  // Touch has no hover, so a tap is what makes her speak.
  const onTap = () => {
    setOpen((o) => !o);
    if (viewport.isTouch) bus.say(chip.quip, { priority: 2, ttl: 3800 });
  };

  return (
    <div
      ref={(el) => registerNode(index, el)}
      className="pointer-events-none absolute left-0 top-0"
      style={{ willChange: 'transform' }}
    >
      <div
        ref={ref}
        className="pointer-events-auto relative"
        onMouseEnter={() => {
          linkProps.onMouseEnter();
          activate();
        }}
        onMouseLeave={() => {
          linkProps.onMouseLeave();
          deactivate();
        }}
      >
        <motion.button
          type="button"
          onFocus={() => {
            linkProps.onFocus();
            activate();
          }}
          onBlur={() => {
            linkProps.onBlur();
            deactivate();
          }}
          onClick={onTap}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          aria-label={`${chip.label}. ${chip.detail}`}
          className="surface flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-2 pr-3 text-[11.5px] font-semibold text-fg sm:py-2 sm:pl-2.5 sm:pr-3.5 sm:text-[12px]"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-full sm:h-6 sm:w-6"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: 'var(--accent-strong)' }} />
          </span>
          {chip.label}
        </motion.button>

        <AnimatePresence>
          {open && !viewport.isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 460, damping: 30 }}
              className="surface-raised absolute left-1/2 top-[calc(100%+8px)] w-[210px] -translate-x-1/2 rounded-[var(--radius-md)] px-3 py-2.5"
            >
              <p className="text-[11.5px] leading-snug text-muted">{chip.detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RIPPLE_MS = 560;
const RIPPLE_STAGGER = 70;

export const OrbitField: React.FC = () => {
  const { anchors, stageFlow, viewport, reduceMotion, bus } = useStudio();
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const widths = useRef<number[]>([]);
  const hovered = useRef(-1);
  const rippleAt = useRef(-Infinity);

  const registerNode = (i: number, el: HTMLDivElement | null) => {
    nodes.current[i] = el;
    widths.current[i] = 0;
  };

  // When she reacts, the ring answers: each chip kicks outward in turn.
  useEffect(() => bus.onReaction(() => {
    rippleAt.current = performance.now();
  }), [bus]);

  // Phones get two chips parked beside her hips — a moving orbit is too busy
  // at that size and would collide with the hero copy above.
  const chips = viewport.isMobile ? CAPABILITY_CHIPS.slice(0, 2) : CAPABILITY_CHIPS;
  const staticAngles = [166, 14];

  useEffect(() => {
    let raf = 0;
    let frame = 0;

    const tick = () => {
      frame++;
      const stage = stageFlow.get();
      const visible = Math.max(0, 1 - stage * 1.8);

      if (visible > 0.001) {
        const { core, scale } = anchors.current;
        const rx = (viewport.isMobile ? 120 : 320) * scale;
        const ry = (viewport.isMobile ? 90 : 210) * scale;
        const clearance = rx * 0.78;
        const now = performance.now();
        const sinceRipple = now - rippleAt.current;

        for (let i = 0; i < chips.length; i++) {
          const el = nodes.current[i];
          if (!el) continue;
          // Re-measure occasionally: the first read can land before the webfont
          // swaps in, and a stale width lets a chip hang off the screen edge.
          if (!widths.current[i] || frame % 30 === 0) {
            widths.current[i] = el.offsetWidth || widths.current[i] || 130;
          }

          const theta = (viewport.isMobile ? staticAngles[i] : chips[i].angle) * DEG;
          const cos = Math.cos(theta);
          const sin = Math.sin(theta);

          // sin(theta) > 0 → lower half of the ellipse → nearest the viewer.
          const norm = (sin + 1) / 2;
          const s = 0.86 + norm * 0.14;

          // Idle breathing, but the chip you're reaching for holds still.
          const calm = reduceMotion || hovered.current === i ? 0 : 1;
          const bobX = Math.cos(now * 0.00045 + i * 2.3) * 4 * calm;
          const bobY = Math.sin(now * 0.0006 + i * 1.7) * 5 * calm;

          // Radial kick, staggered so the ripple reads as travelling around her.
          const local = sinceRipple - i * RIPPLE_STAGGER;
          const kick =
            reduceMotion || local < 0 || local > RIPPLE_MS
              ? 0
              : Math.sin((local / RIPPLE_MS) * Math.PI) * 16;

          // Never let a chip drift over her silhouette — it would be unreadable
          // there, and hiding it behind her just loses it entirely.
          const reach = Math.max(Math.abs(cos) * (rx + kick), clearance);
          const half = (widths.current[i] * s) / 2 + 10;
          const x = Math.max(
            half,
            Math.min(viewport.width - half, core.x + Math.sign(cos) * reach + bobX),
          );
          const y = core.y + sin * (ry + kick) + bobY;

          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
          el.style.opacity = String((0.78 + norm * 0.22) * visible);
          el.style.pointerEvents = visible > 0.75 ? 'auto' : 'none';
        }
      } else {
        for (const el of nodes.current) {
          if (el) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anchors, chips, reduceMotion, stageFlow, viewport.isMobile, viewport.width]);

  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden={false}>
      {chips.map((chip, i) => (
        <OrbitChip
          key={chip.id}
          chip={chip}
          index={i}
          registerNode={registerNode}
          onHoverChange={(idx, h) => {
            hovered.current = h ? idx : hovered.current === idx ? -1 : hovered.current;
          }}
        />
      ))}
    </div>
  );
};
