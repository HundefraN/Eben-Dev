import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CEO_INFO } from '../data/companyData';
import { ThemePreset } from '../types';
import { soundFx } from '../utils/audio';
import { Mail, Phone, Send, Sparkles, Zap, Shield, Star, ArrowRight, Flame, Crown, Sword } from 'lucide-react';

import ceoAvatarImg from '../assets/images/CEO.png';
import logoImg from '../assets/images/logo.png';

interface CeoLeftPanelProps {
  theme: ThemePreset;
  scrollStage: number;
  mouseXRatio: number;
  mouseYRatio: number;
  onOpenContact: () => void;
  soundEnabled: boolean;
}

// Pop burst on button click
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 36 + Math.random() * 20;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div className="pointer-events-none fixed z-[100]" style={{ left: x, top: y }}>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ffcc02','#f06292','#66bb6a','#4fc3f7','#ba68c8','#ff8a65','#fff176','#aed581','#ffcc02','#4fc3f7'][i],
            top: -4, left: -4,
          }}
          initial={{ scale: 1.2, x: 0, y: 0, opacity: 1 }}
          animate={{ scale: 0, x: s.tx, y: s.ty, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <motion.div
        className="absolute -top-5 -left-5 w-10 h-10 rounded-full border-4 border-[#c59b27]"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.55 }}
      />
      <motion.div
        className="absolute -top-3 -left-3 text-xl select-none"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0, y: -24 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        ⚡
      </motion.div>
    </div>
  );
};

// Animated RPG stat bar
const StatBar: React.FC<{ label: string; value: number; color: string; text: string; delay: number }> = ({
  label, value, color, text, delay,
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay * 1000 + 400);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 22 }}
      className="flex items-center gap-2"
    >
      <span className="text-[10px] font-black text-[#0b2545] w-24 shrink-0 uppercase">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-slate-200 border-2 border-[#0b2545]/20 overflow-hidden">
        <motion.div
          style={{ backgroundColor: color }}
          className="h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: delay + 0.2 }}
        >
          {/* Shine shimmer */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: delay + 1 }}
          />
        </motion.div>
      </div>
      <span className="text-[9px] font-black text-[#0b2545] w-16 text-right shrink-0">{text}</span>
    </motion.div>
  );
};

export const CeoLeftPanel: React.FC<CeoLeftPanelProps> = ({
  scrollStage,
  mouseXRatio,
  mouseYRatio,
  onOpenContact,
  soundEnabled,
}) => {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const counter = useRef(0);

  let opacityVal = 0;
  let slideX = -60;

  if (scrollStage >= 1.05 && scrollStage <= 2.0) {
    const progress = Math.max(0, (scrollStage - 1.1) / 0.8);
    opacityVal = Math.min(1, progress * 1.2);
    slideX = -(1 - opacityVal) * 80;
  } else if (scrollStage > 2.0 && scrollStage <= 2.95) {
    const progress = Math.max(0, (2.9 - scrollStage) / 0.8);
    opacityVal = Math.min(1, Math.max(0, progress * 1.2));
    slideX = -(1 - opacityVal) * 80;
  }

  if (opacityVal <= 0.005) return null;

  const tiltX = mouseYRatio * -5;
  const tiltY = mouseXRatio * -7;

  const fireBurst = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = counter.current++;
    setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
  };

  return (
    <>
      {bursts.map((b) => (
        <PopBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))} />
      ))}

      <motion.div
        style={{ opacity: opacityVal, transform: `translateX(${slideX}px)`, willChange: 'transform, opacity' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed left-3 right-3 sm:right-auto sm:left-8 md:left-12 lg:left-16 top-20 sm:top-24 bottom-14 sm:bottom-16 z-30 w-auto sm:w-full max-w-none sm:max-w-lg md:max-w-xl pointer-events-auto flex flex-col justify-center overflow-y-auto pl-1 sm:pl-2 custom-scrollbar"
      >
        <motion.div
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: tiltX, rotateY: tiltY }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="space-y-4"
        >
          {/* Anime Boss Header */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [3, -4, 3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-11 h-11 rounded-2xl overflow-hidden border-[2.5px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] bg-[#0b2545] shrink-0"
            >
              <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex-1">
              <motion.div
                whileHover={{ scale: 1.04, rotate: -1 }}
                transition={{ type: 'spring', stiffness: 380 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-[#0b2545] text-[#ffea79] border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] uppercase tracking-wider"
              >
                <motion.span
                  animate={{ scale: [1, 1.35, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <Crown className="w-4 h-4 text-[#ffea79]" />
                </motion.span>
                <span>S-RANK GUILD MASTER</span>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                  <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                </motion.span>
              </motion.div>
              <p className="text-[11px] text-slate-700 font-extrabold mt-1 pl-1 flex items-center gap-1">
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Flame className="w-3 h-3 text-[#c59b27]" />
                </motion.span>
                <em>"The mastermind of Eben Dev Solutions!"</em>
              </p>
            </div>
          </motion.div>

          {/* Boss Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.08 }}
            onMouseEnter={() => soundEnabled && soundFx.playHoverSound()}
            className="relative p-5 sm:p-6 rounded-3xl border-[3px] border-[#0b2545] shadow-[6px_6px_0px_#0b2545] hover:shadow-[7px_7px_0px_#c59b27] bg-white text-[#0b2545] overflow-hidden transition-shadow duration-300"
          >
            {/* Thick manga stripes */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#0b2545]" />
            <div className="absolute top-2 left-0 right-0 h-1 bg-[#c59b27]" />

            {/* Floating boss badge */}
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 right-4 px-3 py-0.5 rounded-lg text-[9px] font-black bg-[#c59b27] text-[#0b2545] border-[2px] border-[#0b2545] shadow-[2px_2px_0px_#0b2545] uppercase tracking-wider"
            >
              FOUNDER / CEO
            </motion.div>

            {/* Profile Row */}
            <div className="flex items-start gap-4 mt-2 mb-4 pb-4 border-b-[2px] border-dashed border-slate-200">
              {/* Avatar with aura */}
              <div className="relative shrink-0">
                <motion.div
                  whileHover={{ scale: 1.06, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-[3px] border-[#0b2545] shadow-[4px_4px_0px_#c59b27] bg-slate-100 relative z-10"
                >
                  <img
                    src={ceoAvatarImg}
                    alt={CEO_INFO.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {/* Floating MAX badge */}
                <motion.div
                  animate={{ rotate: [-12, -8, -14, -12], y: [0, -2, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md text-[8px] font-black bg-[#ffea79] text-[#0b2545] border border-[#0b2545] shadow-[1px_1px_0px_#0b2545]"
                >
                  ⚡ MAX
                </motion.div>
                {/* Verified dot */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 border-[2px] border-white rounded-full z-20 flex items-center justify-center shadow-[2px_2px_0px_#065f46]"
                >
                  <span className="text-[7px] font-black text-white">✓</span>
                </motion.div>
              </div>

              {/* Name + Stars */}
              <div className="flex-1 space-y-1.5">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 340 }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#ffea79] text-[#0b2545] text-[10px] font-black border-2 border-[#0b2545] shadow-[2px_2px_0px_#0b2545]"
                >
                  <Sword className="w-3 h-3" />
                  {CEO_INFO.title}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 340 }}
                  className="text-xl sm:text-2xl font-black tracking-tight text-[#0b2545]"
                >
                  {CEO_INFO.name}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="flex items-center gap-0.5"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 400 }}
                    >
                      <Star className="w-3.5 h-3.5 fill-[#c59b27] text-[#c59b27]" />
                    </motion.span>
                  ))}
                  <span className="text-[10px] font-black text-slate-500 ml-1">5.0 / 5.0</span>
                </motion.div>
                <div className="text-[10px] font-extrabold text-slate-500">{CEO_INFO.experienceYears} · Addis Ababa</div>
              </div>
            </div>

            {/* Manga Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 340, damping: 20 }}
              className="relative mb-4 p-4 rounded-2xl bg-[#ffea79] border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#0b2545]"
            >
              {/* Speech tail */}
              <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#0b2545]" />
              <div className="absolute -bottom-1 left-8 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#ffea79]" />
              <p className="text-xs sm:text-sm text-[#0b2545] leading-relaxed font-extrabold italic">
                "{CEO_INFO.bio}"
              </p>
            </motion.div>

            {/* RPG Power Stats */}
            <div className="mb-4 space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 }}
                className="flex items-center gap-2 text-xs font-black text-[#0b2545] uppercase tracking-wider mb-2"
              >
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Shield className="w-4 h-4 text-[#c59b27]" />
                </motion.span>
                <span>POWER STATS</span>
                <div className="flex-1 h-[2px] bg-[#0b2545]/20" />
              </motion.div>
              <StatBar label="CODE POWER" value={98} color="#0b2545" text="9999+" delay={0.36} />
              <StatBar label="INTELLECT" value={95} color="#c59b27" text="S-RANK" delay={0.44} />
              <StatBar label="BUILD SPEED" value={90} color="#ff4d4d" text="LIGHTNING" delay={0.52} />
            </div>

            {/* Skill Tags */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {CEO_INFO.skills.map((skill, si) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.55 + si * 0.05, type: 'spring', stiffness: 400 }}
                  whileHover={{ scale: 1.12, rotate: -3, y: -2 }}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-black border-2 border-[#0b2545]/25 hover:border-[#0b2545] bg-[#0b2545]/5 hover:bg-[#ffea79]/60 text-[#0b2545] transition-colors cursor-default select-none"
                >
                  ⚡ {skill}
                </motion.span>
              ))}
            </div>

            {/* Contact Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { href: `tel:${CEO_INFO.phone}`, icon: Phone, label: 'CALL SIGNAL', id: 'call' },
                { href: `mailto:${CEO_INFO.email}`, icon: Mail, label: 'TELEPORT MSG', id: 'mail' },
                { href: `https://t.me/${CEO_INFO.telegram.replace('@', '')}`, icon: Send, label: 'TG BEAM!', id: 'tg' },
              ].map(({ href, icon: Icon, label, id }) => (
                <motion.a
                  key={id}
                  href={href}
                  target={id === 'tg' ? '_blank' : undefined}
                  rel={id === 'tg' ? 'noreferrer' : undefined}
                  onMouseEnter={() => { setHoveredBtn(id); if (soundEnabled) soundFx.playHoverSound(); }}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={(e) => fireBurst(e as unknown as React.MouseEvent)}
                  whileHover={{ scaleX: 1.08, scaleY: 0.93, rotate: -1 }}
                  whileTap={{ scaleX: 0.92, scaleY: 1.08, rotate: 1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl border-[2px] border-[#0b2545] cursor-pointer"
                  style={{
                    background: hoveredBtn === id ? '#c59b27' : '#0b2545',
                    color: hoveredBtn === id ? '#0b2545' : '#ffea79',
                    boxShadow: hoveredBtn === id ? '3px 3px 0px #0b2545' : '3px 3px 0px #c59b27',
                    transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                    textDecoration: 'none',
                  }}
                >
                  <motion.span
                    animate={hoveredBtn === id ? { rotate: [0, -20, 15, 0], scale: 1.2 } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.span>
                  <div className="text-[8px] font-black uppercase tracking-wider">{label}</div>
                </motion.a>
              ))}
            </div>

            {/* Mega CTA */}
            <motion.button
              onClick={(e) => {
                if (soundEnabled) soundFx.playClickChime();
                fireBurst(e);
                onOpenContact();
              }}
              whileHover={{ scaleX: 1.04, scaleY: 0.94, rotate: -0.8 }}
              whileTap={{ scaleX: 0.93, scaleY: 1.07, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 16 }}
              className="group w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider text-[#0b2545] flex items-center justify-center gap-2 border-[2.5px] border-[#0b2545] cursor-pointer"
              style={{
                background: '#c59b27',
                boxShadow: '5px 5px 0px #0b2545',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0b2545';
                (e.currentTarget as HTMLElement).style.color = '#ffea79';
                (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px #c59b27';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#c59b27';
                (e.currentTarget as HTMLElement).style.color = '#0b2545';
                (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0px #0b2545';
              }}
            >
              <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Zap className="w-5 h-5" />
              </motion.span>
              <span>START A QUEST!</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="group-hover:translate-x-1 transition-transform"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};
