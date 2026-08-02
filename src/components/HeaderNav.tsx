import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Moon, Send, Sun, Volume2, VolumeX, X } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { COMPANY_INFO } from '../data/companyData';
import { soundFx } from '../utils/audio';

import logoImg from '../assets/images/logo.png';

interface HeaderNavProps {
  onOpenServices: () => void;
}

interface NavItem {
  key: string;
  label: string;
  stage?: number;
  action?: () => void;
  quip: string;
}

/* ------------------------------------------------------------------ */

const IconToggle: React.FC<{
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, onClick, children }) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.94 }}
    transition={{ type: 'spring', stiffness: 480, damping: 26 }}
    className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-fg"
    style={{ border: '1px solid var(--hairline)', background: 'var(--bg-elevated)' }}
  >
    {children}
  </motion.button>
);

/* ------------------------------------------------------------------ */

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenServices }) => {
  const { stage, goTo, theme, toggleTheme, sound, toggleSound, viewport, setNavLocked } =
    useStudio();
  const [menuOpen, setMenuOpen] = useState(false);

  const contact = useCompanionLink({ weight: 1, quip: 'Straight to the point — I like it.' });

  const items: NavItem[] = [
    { key: 'work', label: 'Work', stage: 1, quip: 'Four builds worth showing.' },
    { key: 'founder', label: 'Founder', stage: 2, quip: 'That is Hundefra. He does the hard parts.' },
    { key: 'services', label: 'Services', action: onOpenServices, quip: 'Four things we do properly.' },
  ];

  useEffect(() => {
    setNavLocked(menuOpen);
    return () => setNavLocked(false);
  }, [menuOpen, setNavLocked]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const click = (fn: () => void) => () => {
    if (sound) soundFx.playClickChime();
    fn();
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4"
        role="banner"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          {/* Brand */}
          <motion.button
            type="button"
            onClick={click(() => goTo(0))}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
            className="group flex items-center gap-2.5 rounded-full pr-3 text-left"
            aria-label="Eben Dev Solutions — back to start"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[11px] transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'var(--ink-800)', boxShadow: 'var(--shadow-sm)' }}
            >
              <img src={logoImg} alt="" className="h-full w-full object-cover" />
            </span>
            {/* Hidden on tablet, where the nav needs the horizontal room. */}
            <span className="hidden leading-tight min-[420px]:max-md:block lg:block">
              <span className="font-display block whitespace-nowrap text-[14px] font-bold tracking-[-0.02em] text-fg">
                {COMPANY_INFO.name}
              </span>
              <span className="eyebrow block" style={{ fontSize: 8.5 }}>
                {COMPANY_INFO.role}
              </span>
            </span>
          </motion.button>

          {/* Desktop nav */}
          {!viewport.isMobile ? (
            <motion.nav
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
              className="surface flex shrink-0 items-center gap-0.5 rounded-full p-1.5"
              aria-label="Primary"
            >
              {items.map((item) => {
                const isActive = item.stage !== undefined && stage === item.stage;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={click(() =>
                      item.stage !== undefined ? goTo(item.stage) : item.action?.(),
                    )}
                    onMouseEnter={() => sound && soundFx.playHoverSound()}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200"
                    style={{ color: isActive ? 'var(--fg)' : 'var(--fg-muted)' }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'var(--accent-soft)' }}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </button>
                );
              })}
            </motion.nav>
          ) : null}

          {/* Utilities */}
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.15 }}
            className="flex shrink-0 items-center gap-1.5"
          >
            {!viewport.isMobile && (
              <motion.button
                ref={contact.ref}
                {...contact.linkProps}
                type="button"
                onClick={click(() => goTo(3))}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 460, damping: 26 }}
                className="mr-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold"
                style={{
                  background: 'var(--action-bg)',
                  color: 'var(--action-fg)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Contact
              </motion.button>
            )}

            <IconToggle
              label={sound ? 'Mute interface sounds' : 'Enable interface sounds'}
              onClick={toggleSound}
            >
              {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </IconToggle>
            <IconToggle
              label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22 }}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </IconToggle>

            {viewport.isMobile && (
              <IconToggle label="Open menu" onClick={() => setMenuOpen(true)}>
                <Menu className="h-4 w-4" />
              </IconToggle>
            )}
          </motion.div>
        </div>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial="hidden"
            animate="show"
            exit="hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="absolute inset-0 h-full w-full"
              style={{ background: 'color-mix(in srgb, var(--ink-950) 55%, transparent)', backdropFilter: 'blur(14px)' }}
            />

            <motion.div
              variants={{
                hidden: { y: '-100%' },
                show: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 34 } },
              }}
              className="surface-raised absolute inset-x-3 top-3 rounded-[var(--radius-xl)] p-5 pt-4"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="eyebrow">Menu</span>
                <IconToggle label="Close menu" onClick={() => setMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </IconToggle>
              </div>

              <nav className="flex flex-col" aria-label="Primary">
                {[...items, { key: 'contact', label: 'Contact', stage: 3, quip: '' }].map(
                  (item, i) => (
                    <motion.button
                      key={item.key}
                      type="button"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.05, type: 'spring', stiffness: 340, damping: 30 }}
                      onClick={click(() =>
                        item.stage !== undefined ? goTo(item.stage) : item.action?.(),
                      )}
                      className="font-display flex items-center justify-between border-b py-3.5 text-left text-[22px] font-semibold tracking-[-0.03em] text-fg last:border-b-0"
                      style={{ borderColor: 'var(--hairline)' }}
                    >
                      {item.label}
                      <span
                        className="text-[13px] font-normal tabular-nums"
                        style={{ color: 'var(--accent)' }}
                      >
                        0{i + 1}
                      </span>
                    </motion.button>
                  ),
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
