import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { useStudio } from '../core/studio';

/**
 * Draws a light thread from the companion's hand to whichever widget is
 * currently engaged. This is the piece that makes the interface feel like it
 * belongs to her rather than merely sitting next to her.
 *
 * All geometry is written straight to the DOM inside one animation frame —
 * React only re-renders when the *set* of active links changes (i.e. on hover),
 * never while the thread is moving.
 */

const MAX_THREADS = 4;

interface Slot {
  group: SVGGElement | null;
  path: SVGPathElement | null;
  glow: SVGPathElement | null;
  bead: SVGCircleElement | null;
  socket: SVGCircleElement | null;
  socketRing: SVGCircleElement | null;
}

/** Point on the target's outline nearest the character, so the thread lands on an edge. */
function edgePoint(rect: DOMRect, fromX: number, fromY: number) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = fromX - cx;
  const dy = fromY - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  // Scale the direction vector until it hits the rectangle border.
  const hw = rect.width / 2;
  const hh = rect.height / 2;
  const scale = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: cx + dx * scale, y: cy + dy * scale };
}

function cubicAt(
  t: number,
  p0: [number, number],
  c1: [number, number],
  c2: [number, number],
  p3: [number, number],
): [number, number] {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
  ];
}

export const ConnectorLayer: React.FC = () => {
  const { links, anchors, viewport, reduceMotion } = useStudio();

  const active = useSyncExternalStore(links.subscribe, links.getSnapshot, links.getSnapshot);
  const slots = useRef<Slot[]>(
    Array.from({ length: MAX_THREADS }, () => ({
      group: null, path: null, glow: null, bead: null, socket: null, socketRing: null,
    })),
  );

  const enabled = !viewport.isMobile && !viewport.isTouch;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let t = 0;

    const tick = () => {
      t += 1;
      const hand = anchors.current.hand;
      const list = activeRef.current;

      for (let i = 0; i < MAX_THREADS; i++) {
        const slot = slots.current[i];
        if (!slot.group) continue;
        const link = list[i];

        if (!link || !link.el.isConnected) {
          slot.group.style.opacity = '0';
          continue;
        }

        const rect = link.el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          slot.group.style.opacity = '0';
          continue;
        }

        const end = edgePoint(rect, hand.x, hand.y);
        const p0: [number, number] = [hand.x, hand.y];
        const p3: [number, number] = [end.x, end.y];
        const dx = p3[0] - p0[0];
        const dy = p3[1] - p0[1];
        const dist = Math.hypot(dx, dy);

        // Arc the thread so it reads as a slack filament, not a laser.
        const sag = Math.min(90, dist * 0.16);
        const c1: [number, number] = [p0[0] + dx * 0.35, p0[1] + dy * 0.1 - sag];
        const c2: [number, number] = [p0[0] + dx * 0.68, p0[1] + dy * 0.82 - sag * 0.35];

        const d = `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p3[0].toFixed(1)} ${p3[1].toFixed(1)}`;

        slot.path?.setAttribute('d', d);
        slot.glow?.setAttribute('d', d);
        slot.group.style.opacity = String(Math.min(1, link.weight));

        // Bead of light travelling toward the widget.
        if (slot.bead && !reduceMotion) {
          const phase = ((t * 0.9) % 100) / 100;
          const [bx, by] = cubicAt(phase, p0, c1, c2, p3);
          slot.bead.setAttribute('cx', bx.toFixed(1));
          slot.bead.setAttribute('cy', by.toFixed(1));
          slot.bead.setAttribute('opacity', String(Math.sin(phase * Math.PI) * 0.9));
        }

        if (slot.socket && slot.socketRing) {
          slot.socket.setAttribute('cx', p3[0].toFixed(1));
          slot.socket.setAttribute('cy', p3[1].toFixed(1));
          slot.socketRing.setAttribute('cx', p3[0].toFixed(1));
          slot.socketRing.setAttribute('cy', p3[1].toFixed(1));
          const breathe = reduceMotion ? 5 : 4.5 + Math.sin(t * 0.08) * 1.8;
          slot.socketRing.setAttribute('r', breathe.toFixed(2));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anchors, enabled, reduceMotion]);

  if (!enabled) return null;

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[45] h-full w-full"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.55" />
        </linearGradient>
        <filter id="thread-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {Array.from({ length: MAX_THREADS }, (_, i) => (
        <g
          key={i}
          ref={(el) => {
            slots.current[i].group = el;
          }}
          style={{ opacity: 0, transition: 'opacity 260ms var(--ease-out-soft)' }}
        >
          <path
            ref={(el) => {
              slots.current[i].glow = el;
            }}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={5}
            strokeOpacity={0.22}
            strokeLinecap="round"
            filter="url(#thread-blur)"
          />
          <path
            ref={(el) => {
              slots.current[i].path = el;
            }}
            fill="none"
            stroke="url(#thread-grad)"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="7 9"
            style={
              reduceMotion
                ? undefined
                : { animation: 'threadFlow 9s linear infinite', willChange: 'stroke-dashoffset' }
            }
          />
          <circle
            ref={(el) => {
              slots.current[i].bead = el;
            }}
            r={2.6}
            fill="var(--accent)"
            opacity={0}
          />
          <circle
            ref={(el) => {
              slots.current[i].socketRing = el;
            }}
            r={5}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity={0.5}
            strokeWidth={1}
          />
          <circle
            ref={(el) => {
              slots.current[i].socket = el;
            }}
            r={2.4}
            fill="var(--accent)"
          />
        </g>
      ))}
    </svg>
  );
};
