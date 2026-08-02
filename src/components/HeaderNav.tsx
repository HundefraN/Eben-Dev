import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANY_INFO } from '../data/companyData';
import { Code2, Send, Briefcase, User } from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface HeaderNavProps {
  onOpenServices: () => void;
  onOpenProjects: () => void;
  onOpenCeo: () => void;
  onOpenContact: () => void;
}

// Pop burst on contact button click
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2;
    const dist = 24 + Math.random() * 14;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div className="pointer-events-none fixed z-[200]" style={{ left: x, top: y }}>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: ['#ffcc02', '#4fc3f7', '#f06292', '#66bb6a', '#ba68c8', '#ff8a65', '#fff176'][i],
            top: -3, left: -3,
          }}
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={{ scale: 0, x: s.tx, y: s.ty, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <motion.div
        className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-[3px] border-[#c59b27]"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.45 }}
      />
    </div>
  );
};

// Tooltip that pops up cartoon-style
const CartoonTooltip: React.FC<{ label: string; visible: boolean }> = ({ label, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.75, rotate: -4 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 4, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 480, damping: 20 }}
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap pointer-events-none z-50 border-2 border-[#0b2545] shadow-[2px_2px_0px_#0b2545]"
        style={{ background: '#ffcc02', color: '#0b2545' }}
      >
        {label}
        {/* Tooltip tail */}
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#0b2545]" />
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-[#ffcc02]" />
      </motion.div>
    )}
  </AnimatePresence>
);

// Individual nav button with squish + tooltip
const NavBtn: React.FC<{
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  shortLabel?: string;
  hideLabel?: string; // tailwind classes for label visibility
  index: number;
}> = ({ onClick, icon: Icon, label, shortLabel, hideLabel = 'hidden min-[420px]:inline', index }) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: -16, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.08 + index * 0.07 }}
    >
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        animate={
          pressed
            ? { scaleX: 0.9, scaleY: 1.1, rotate: 2 }
            : hovered
            ? { scaleX: 1.1, scaleY: 0.92, rotate: -1, y: -2 }
            : { scaleX: 1, scaleY: 1, rotate: 0, y: 0 }
        }
        transition={{ type: 'spring', stiffness: 460, damping: 18 }}
        title={label}
        className="relative px-2 sm:px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 sm:gap-1.5 text-[#0b2545] transition-colors duration-150 select-none outline-none"
        style={{
          background: hovered ? '#ffcc02' : 'transparent',
          border: hovered ? '2px solid #0b2545' : '2px solid transparent',
          boxShadow: hovered ? '3px 3px 0px #0b2545' : 'none',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <motion.span
          animate={hovered ? { rotate: [0, -20, 16, 0], scale: 1.25 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: hovered ? '#0b2545' : '#c59b27' }} />
        </motion.span>
        <span className={hideLabel} style={{ color: hovered ? '#0b2545' : '#0b2545' }}>
          {label}
        </span>
        {shortLabel && (
          <span className="hidden min-[420px]:inline min-[480px]:hidden" style={{ color: hovered ? '#0b2545' : '#0b2545' }}>
            {shortLabel}
          </span>
        )}
      </motion.button>

      {/* Cartoon tooltip */}
      <CartoonTooltip label={label} visible={hovered} />
    </motion.div>
  );
};

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenServices,
  onOpenProjects,
  onOpenCeo,
  onOpenContact,
}) => {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [contactHovered, setContactHovered] = useState(false);
  const counter = useRef(0);

  const fireContactBurst = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = counter.current++;
    setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    onOpenContact();
  };

  return (
    <>
      {/* Pop bursts rendered outside header */}
      {bursts.map((b) => (
        <PopBurst
          key={b.id}
          x={b.x}
          y={b.y}
          onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))}
        />
      ))}

      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 md:px-8 md:py-4 pointer-events-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo + Brand — spring drop in */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
            className="flex items-center gap-3"
          >
            {/* Logo icon — rocks continuously */}
            <motion.div
              animate={{ rotate: [0, -6, 5, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.15, rotate: -8 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-[2.5px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] bg-[#0b2545] shrink-0"
              style={{ cursor: 'default' }}
            >
              <img src={logoImg} alt="Eben Dev Solutions Logo" className="w-full h-full object-cover" />
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 360 }}
                className="font-black text-base sm:text-lg tracking-tight leading-none text-[#0b2545]"
                style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}
              >
                {COMPANY_INFO.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18, type: 'spring', stiffness: 360 }}
                className="text-[10px] sm:text-xs tracking-wider font-black"
                style={{ color: '#c59b27' }}
              >
                NEXT-GEN SOFTWARE LAB
              </motion.p>
            </div>
          </motion.div>

          {/* Nav Pill — spring slide down from top */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.12 }}
            className="flex items-center gap-0.5 sm:gap-1 p-1.5 rounded-full border-[2.5px] border-[#0b2545] bg-white/96 backdrop-blur-xl shadow-[4px_4px_0px_#0b2545] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,249,235,0.95) 100%)',
            }}
          >
            {/* CSS shimmer sweep across the pill */}
            <style>{`
              @keyframes pillShimmer {
                0%   { transform: translateX(-120%); }
                100% { transform: translateX(320%); }
              }
              .pill-shimmer {
                animation: pillShimmer 3.5s ease-in-out 1.2s infinite;
                will-change: transform;
              }
            `}</style>
            <span
              aria-hidden
              className="pill-shimmer absolute top-0 left-0 w-1/3 h-full pointer-events-none rounded-full"
              style={{
                background: 'linear-gradient(100deg, transparent 10%, rgba(255,204,2,0.22) 50%, transparent 90%)',
              }}
            />

            <NavBtn
              onClick={onOpenServices}
              icon={Code2}
              label="Services"
              hideLabel="hidden min-[420px]:inline"
              index={0}
            />
            <NavBtn
              onClick={onOpenProjects}
              icon={Briefcase}
              label="Showcase"
              hideLabel="hidden min-[420px]:inline"
              index={1}
            />
            <NavBtn
              onClick={onOpenCeo}
              icon={User}
              label="CEO / Founder"
              shortLabel="CEO"
              hideLabel="hidden min-[480px]:inline sm:hidden md:inline"
              index={2}
            />

            {/* Divider */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="w-[2px] h-5 mx-0.5 rounded-full bg-[#0b2545]/20"
            />

            {/* Contact CTA — special cartoon button with burst */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.6, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.38 }}
            >
              <motion.button
                onClick={fireContactBurst}
                onMouseEnter={() => setContactHovered(true)}
                onMouseLeave={() => setContactHovered(false)}
                whileHover={{ scaleX: 1.08, scaleY: 0.93, rotate: -1, y: -2 }}
                whileTap={{ scaleX: 0.9, scaleY: 1.1, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 460, damping: 18 }}
                title="Contact Us"
                className="relative px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 sm:gap-1.5 text-[#ffea79] shrink-0 border-[2px] border-[#0b2545] overflow-hidden"
                style={{
                  background: contactHovered ? '#c59b27' : '#0b2545',
                  boxShadow: contactHovered ? '3px 3px 0px #0b2545' : '3px 3px 0px #c59b27',
                  transition: 'background 0.15s, box-shadow 0.15s',
                  color: contactHovered ? '#0b2545' : '#ffea79',
                }}
              >
                {/* Shine sweep */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden
                >
                  <motion.span
                    className="absolute top-0 left-[-80%] w-1/2 h-full"
                    style={{
                      background:
                        'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.35) 55%, transparent 80%)',
                    }}
                    animate={contactHovered ? { left: ['-80%', '180%'] } : { left: '-80%' }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </motion.span>

                <motion.span
                  animate={contactHovered ? { rotate: [0, -20, 15, 0], scale: 1.2 } : { rotate: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                </motion.span>
                <span className="hidden min-[360px]:inline sm:inline">Contact</span>
                <motion.span
                  className="hidden sm:inline"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Us
                </motion.span>
              </motion.button>

              {/* Floating "!" badge that bobs above the contact button */}
              <motion.div
                animate={{ y: [0, -4, 0], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-3.5 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-[#0b2545] shadow-[1px_1px_0px_#0b2545] pointer-events-none select-none"
                style={{ background: '#ff4d4d', color: '#fff' }}
              >
                !
              </motion.div>

              {/* Cartoon tooltip */}
              <CartoonTooltip label="Contact Us" visible={contactHovered} />
            </motion.div>
          </motion.div>
        </div>
      </header>
    </>
  );
};