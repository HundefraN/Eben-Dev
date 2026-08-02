import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Cloud, Layers, Orbit, Smartphone, Sparkles, X } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { SERVICES_LIST } from '../data/companyData';
import type { ServiceItem } from '../core/types';
import { soundFx } from '../utils/audio';

const ICONS: Record<string, React.ElementType> = { Layers, Sparkles, Orbit, Smartphone, Cloud };

interface ServicesSheetProps {
  open: boolean;
  onClose: () => void;
  onEnquire: () => void;
}

const ServiceCard: React.FC<{ service: ServiceItem; index: number }> = ({ service, index }) => {
  const { sound } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 1, quip: service.quip });
  const Icon = ICONS[service.iconName] ?? Layers;

  return (
    <motion.article
      ref={ref}
      {...linkProps}
      onMouseEnter={() => {
        linkProps.onMouseEnter();
        if (sound) soundFx.playHoverSound();
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.08 + index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] p-4"
      style={{
        background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
        border: '1px solid var(--hairline)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(120% 100% at 0% 0%, var(--accent-soft), transparent 60%)',
        }}
      />
      <div className="relative">
        <span
          className="mb-3 grid h-9 w-9 place-items-center rounded-[11px]"
          style={{ background: 'var(--accent-soft)' }}
        >
          <Icon className="h-4 w-4" style={{ color: 'var(--accent-strong)' }} />
        </span>
        <h3 className="font-display text-[15px] font-bold tracking-[-0.02em] text-fg">
          {service.title}
        </h3>
        <p className="mt-1 text-[12px] font-medium text-fg/70">{service.summary}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">{service.detail}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 font-mono text-[9.5px] text-muted"
              style={{
                background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                border: '1px solid var(--hairline)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

export const ServicesSheet: React.FC<ServicesSheetProps> = ({ open, onClose, onEnquire }) => {
  const { setNavLocked, bus, viewport, sound, setOverlay } = useStudio();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNavLocked(open);
    setOverlay(open && !viewport.isMobile ? 'right' : 'none');
    if (open) {
      bus.react({ kind: 'point', side: 'right' });
      bus.say('Four things we do properly. Hover any of them.', { priority: 3, ttl: 5000 });
      closeRef.current?.focus();
    }
    return () => {
      setNavLocked(false);
      setOverlay('none');
    };
  }, [open, setNavLocked, setOverlay, bus, viewport.isMobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* The scrim stays light so the companion is still visible beside it. */}
          <motion.button
            type="button"
            aria-label="Close services"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[44] h-full w-full cursor-default"
            style={{
              // Graded toward the sheet so she stays sharp and legible on the
              // other side — she is the one presenting this, after all.
              background: viewport.isMobile
                ? 'linear-gradient(180deg, color-mix(in srgb, var(--ink-950) 6%, transparent), color-mix(in srgb, var(--ink-950) 34%, transparent) 58%)'
                : 'linear-gradient(90deg, color-mix(in srgb, var(--ink-950) 4%, transparent), color-mix(in srgb, var(--ink-950) 32%, transparent) 64%)',
              backdropFilter: 'blur(2px)',
            }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Services"
            initial={viewport.isMobile ? { y: '100%' } : { opacity: 0, x: 60, filter: 'blur(10px)' }}
            animate={viewport.isMobile ? { y: 0 } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={viewport.isMobile ? { y: '100%' } : { opacity: 0, x: 50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className={[
              'surface-raised edge-light fixed z-[46] flex flex-col overflow-hidden',
              'inset-x-0 bottom-0 top-[18vh] rounded-t-[var(--radius-2xl)]',
              'md:inset-y-16 md:left-auto md:right-8 md:w-[min(52vw,44rem)] md:rounded-[var(--radius-xl)] lg:right-14',
            ].join(' ')}
          >
            <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
              <div>
                <span className="eyebrow">Capabilities</span>
                <h2 className="font-display mt-1 text-[1.5rem] font-bold leading-tight tracking-[-0.035em] text-fg sm:text-[1.75rem]">
                  What we build
                </h2>
                <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted">
                  Four disciplines, one team. Most engagements combine two of them.
                </p>
              </div>
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-fg"
                style={{ border: '1px solid var(--hairline)', background: 'var(--bg-elevated)' }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </header>

            <div
              data-scroller=""
              className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-7"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {SERVICES_LIST.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </div>
            </div>

            <footer
              className="flex flex-col items-center gap-3 border-t px-5 py-4 sm:flex-row sm:justify-between sm:px-7"
              style={{ borderColor: 'var(--hairline)' }}
            >
              <p className="text-[11.5px] text-subtle">
                Not sure which you need? Describe the problem and we'll scope it.
              </p>
              <motion.button
                type="button"
                onClick={() => {
                  if (sound) soundFx.playClickChime();
                  onClose();
                  onEnquire();
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                className="group flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold sm:w-auto"
                style={{
                  background: 'var(--action-bg)',
                  color: 'var(--action-fg)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                Start a conversation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
