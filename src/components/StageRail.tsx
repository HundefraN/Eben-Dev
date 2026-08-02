import React from 'react';
import { motion, useTransform } from 'motion/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useStudio } from '../core/studio';
import { STAGE_META } from '../data/companyData';
import { soundFx } from '../utils/audio';

/** Vertical progress rail — desktop only. Doubles as the section index. */
export const StageRail: React.FC = () => {
  const { stage, goTo, stageFlow, viewport, sound } = useStudio();
  const progress = useTransform(stageFlow, [0, STAGE_META.length - 1], ['0%', '100%']);

  if (viewport.isCompact) return null;

  return (
    <nav
      className="fixed right-6 top-1/2 z-40 -translate-y-1/2"
      aria-label="Sections"
    >
      <div className="relative flex flex-col items-end gap-3 pr-[7px]">
        {/* Track */}
        <span
          className="absolute right-0 top-1 h-[calc(100%-0.5rem)] w-px"
          style={{ background: 'var(--hairline-strong)' }}
          aria-hidden
        />
        <motion.span
          className="absolute right-0 top-1 w-px origin-top"
          style={{ height: progress, background: 'var(--accent)' }}
          aria-hidden
        />

        {STAGE_META.map((meta, i) => {
          const active = stage === i;
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => {
                if (sound) soundFx.playHoverSound();
                goTo(i);
              }}
              aria-current={active ? 'true' : undefined}
              className="group relative flex items-center justify-end py-1.5 pl-8"
            >
              {/* Labels are hover-only: a permanent one would sit on top of
                  whichever panel is open on this side. */}
              <span
                className="pointer-events-none absolute right-6 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  color: active ? 'var(--fg)' : 'var(--fg-muted)',
                  // Deliberately not .surface: four idle backdrop-filter layers
                  // cost more than they are worth for a label you rarely see.
                  background: 'var(--bg-solid)',
                  border: '1px solid var(--hairline)',
                  boxShadow: 'var(--shadow-sm)',
                  transform: 'translateX(4px)',
                }}
              >
                {meta.label}
              </span>
              <motion.span
                className="block rounded-full"
                animate={{
                  width: active ? 9 : 5,
                  height: active ? 9 : 5,
                  backgroundColor: active ? 'var(--accent)' : 'var(--fg-subtle)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                style={{ marginRight: active ? -1 : 1 }}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/** Bottom control: advances the story, and states plainly where it goes next. */
export const StageAdvance: React.FC = () => {
  const { stage, goTo, viewport, sound } = useStudio();
  const isLast = stage === STAGE_META.length - 1;
  const nextIndex = isLast ? 0 : stage + 1;
  const next = STAGE_META[nextIndex];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(0.9rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-center gap-2.5">
      {viewport.isCompact && (
        <div className="pointer-events-auto flex items-center gap-1.5" role="tablist" aria-label="Sections">
          {STAGE_META.map((meta, i) => (
            <button
              key={meta.id}
              type="button"
              role="tab"
              aria-selected={stage === i}
              aria-label={meta.label}
              onClick={() => goTo(i)}
              className="p-1.5"
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: stage === i ? 20 : 5,
                  height: 5,
                  backgroundColor: stage === i ? 'var(--accent)' : 'var(--fg-subtle)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            </button>
          ))}
        </div>
      )}

      <motion.button
        type="button"
        onClick={() => {
          if (sound) soundFx.playHoverSound();
          goTo(nextIndex);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 460, damping: 26 }}
        className="surface pointer-events-auto group flex max-w-[92vw] items-center gap-2.5 rounded-full py-2 pl-4 pr-2.5"
      >
        <span className="eyebrow" style={{ fontSize: 9 }}>
          {isLast ? 'Back to' : 'Next'}
        </span>
        <span className="truncate text-[12.5px] font-semibold text-fg">{next.label}</span>
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-y-0.5"
          style={{ background: 'var(--accent-soft)' }}
        >
          {isLast ? (
            <ArrowUp className="h-3.5 w-3.5" style={{ color: 'var(--accent-strong)' }} />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" style={{ color: 'var(--accent-strong)' }} />
          )}
        </span>
      </motion.button>
    </div>
  );
};
