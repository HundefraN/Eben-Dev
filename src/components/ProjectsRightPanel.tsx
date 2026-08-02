import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECT_HIGHLIGHTS, COMPANY_INFO } from '../data/companyData';
import { ThemePreset } from '../types';
import { soundFx } from '../utils/audio';
import { ArrowUpRight, Sparkles, ShieldCheck, Trophy, TrendingUp, Zap, Flame, Swords, Star } from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface ProjectsRightPanelProps {
  theme: ThemePreset;
  scrollStage: number;
  mouseXRatio: number;
  mouseYRatio: number;
  onOpenContact: () => void;
  soundEnabled: boolean;
}

const accentIcons = [TrendingUp, Zap, Trophy];
const sfxBadges = ['BOOM!', 'S-RANK BUILD', 'SUPER SPEED'];
const cardColors = [
  { top: '#4fc3f7', shadow: '#0288d1', glow: 'rgba(79,195,247,0.35)', pill: '#e1f5fe', pillText: '#0277bd' },
  { top: '#ba68c8', shadow: '#7b1fa2', glow: 'rgba(186,104,200,0.35)', pill: '#f3e5f5', pillText: '#6a1b9a' },
  { top: '#66bb6a', shadow: '#2e7d32', glow: 'rgba(102,187,106,0.35)', pill: '#e8f5e9', pillText: '#1b5e20' },
];

// Pop burst particles on button click
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 32 + Math.random() * 16;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div className="pointer-events-none fixed z-[100]" style={{ left: x, top: y }}>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ffcc02','#f06292','#66bb6a','#4fc3f7','#ba68c8','#ff8a65','#fff176','#aed581'][i % 8],
            top: -4, left: -4,
          }}
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={{ scale: 0, x: s.tx, y: s.ty, opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <motion.div
        className="absolute -top-5 -left-5 w-10 h-10 rounded-full border-4 border-yellow-400"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

const ProjectCard: React.FC<{
  project: (typeof PROJECT_HIGHLIGHTS)[0];
  idx: number;
  onOpenContact: () => void;
  soundEnabled: boolean;
}> = ({ project, idx, onOpenContact, soundEnabled }) => {
  const [hovered, setHovered] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const counter = useRef(0);
  const AccentIcon = accentIcons[idx % accentIcons.length];
  const sfxText = sfxBadges[idx % sfxBadges.length];
  const colors = cardColors[idx % cardColors.length];

  const handleBtnClick = (e: React.MouseEvent) => {
    if (soundEnabled) soundFx.playClickChime();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = counter.current++;
    setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    onOpenContact();
  };

  return (
    <>
      {bursts.map((b) => (
        <PopBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))} />
      ))}

      <motion.div
        initial={{ opacity: 0, x: 60, rotate: 3, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.1 + idx * 0.1 }}
        onMouseEnter={() => { setHovered(true); if (soundEnabled) soundFx.playHoverSound(); }}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          animate={
            hovered
              ? { scaleX: 1.02, scaleY: 0.97, y: -5, rotate: -0.8 }
              : { scaleX: 1, scaleY: 1, y: 0, rotate: 0 }
          }
          whileTap={{ scaleX: 0.97, scaleY: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="relative p-5 sm:p-6 rounded-2xl border-[3px] bg-white text-[#0b2545] overflow-hidden"
          style={{
            borderColor: hovered ? colors.shadow : '#0b2545',
            boxShadow: hovered
              ? `6px 6px 0px ${colors.shadow}, 0 16px 40px ${colors.glow}`
              : '5px 5px 0px #0b2545',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Animated top color stripe */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
            style={{ background: `linear-gradient(90deg, ${colors.top}, ${colors.shadow})` }}
            animate={hovered ? { scaleX: 1.04 } : { scaleX: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />

          {/* Manga SFX Badge — bounces on hover */}
          <motion.div
            animate={hovered ? { rotate: 0, scale: 1.15, y: -2 } : { rotate: 6, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
            className="absolute -top-3.5 -right-2 px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-[#ff4d4d] text-white border-2 border-[#0b2545] shadow-[2px_2px_0px_#0b2545] select-none"
          >
            {sfxText}
          </motion.div>

          <div className="flex items-center justify-between gap-2 mb-3 mt-1">
            <div className="flex items-center gap-2">
              <motion.div
                animate={hovered ? { rotate: [0, -15, 12, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.top}, ${colors.shadow})`,
                  borderColor: colors.shadow,
                  boxShadow: `2px 2px 0px ${colors.shadow}`,
                }}
              >
                <AccentIcon className="w-4 h-4 text-white" />
              </motion.div>
              <span
                className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-2"
                style={{ background: colors.pill, color: colors.pillText, borderColor: colors.top }}
              >
                {project.category}
              </span>
            </div>

            <motion.span
              animate={hovered ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350 }}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border-[2px] border-emerald-700 shadow-[2px_2px_0px_#065f46]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              {project.metrics}
            </motion.span>
          </div>

          <h3
            className="text-base sm:text-lg font-black tracking-tight transition-colors duration-200"
            style={{ color: hovered ? colors.shadow : '#0b2545' }}
          >
            {project.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            {project.description}
          </p>

          {/* Tag Pills — stagger in */}
          <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t-[2px] border-dashed border-slate-300">
            {project.tags.map((tag, ti) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.08 + ti * 0.04, type: 'spring', stiffness: 380 }}
                whileHover={{ scale: 1.12, rotate: -3 }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold border-2 cursor-default select-none"
                style={{ background: colors.pill, color: colors.pillText, borderColor: colors.top }}
              >
                #{tag}
              </motion.span>
            ))}
          </div>

          {/* Cartoon action button with squish */}
          <motion.button
            onClick={handleBtnClick}
            whileHover={{ scaleX: 1.04, scaleY: 0.94, rotate: -0.8 }}
            whileTap={{ scaleX: 0.93, scaleY: 1.07, rotate: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 16 }}
            className="mt-4 w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-[#ffea79] flex items-center justify-center gap-2 border-[2.5px] border-[#0b2545] cursor-pointer"
            style={{
              background: '#0b2545',
              boxShadow: '4px 4px 0px #0b2545',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = colors.top;
              (e.currentTarget as HTMLElement).style.color = '#0b2545';
              (e.currentTarget as HTMLElement).style.boxShadow = `5px 5px 0px ${colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#0b2545';
              (e.currentTarget as HTMLElement).style.color = '#ffea79';
              (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px #0b2545';
            }}
          >
            <motion.span animate={hovered ? { rotate: [0, -20, 20, 0] } : {}} transition={{ duration: 0.45 }}>
              <Flame className="w-4 h-4" />
            </motion.span>
            <span>REQUEST QUEST BUILD</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
              <ArrowUpRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export const ProjectsRightPanel: React.FC<ProjectsRightPanelProps> = ({
  scrollStage,
  mouseXRatio,
  mouseYRatio,
  onOpenContact,
  soundEnabled,
}) => {
  let opacityVal = 0;
  let slideX = 60;

  if (scrollStage >= 0.05 && scrollStage <= 1.0) {
    const progress = Math.max(0, (scrollStage - 0.1) / 0.8);
    opacityVal = Math.min(1, progress * 1.2);
    slideX = (1 - opacityVal) * 80;
  } else if (scrollStage > 1.0 && scrollStage <= 1.95) {
    const progress = Math.max(0, (1.9 - scrollStage) / 0.8);
    opacityVal = Math.min(1, Math.max(0, progress * 1.2));
    slideX = (1 - opacityVal) * 80;
  }

  if (opacityVal <= 0.005) return null;

  const tiltX = mouseYRatio * -4;
  const tiltY = mouseXRatio * 6;

  return (
    <motion.div
      style={{ opacity: opacityVal, transform: `translateX(${slideX}px)`, willChange: 'transform, opacity' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed left-3 right-3 sm:left-auto sm:right-8 md:right-12 lg:right-16 top-20 sm:top-24 bottom-14 sm:bottom-16 z-30 w-auto sm:w-full max-w-none sm:max-w-lg md:max-w-xl pointer-events-auto flex flex-col justify-center overflow-y-auto pr-1 sm:pr-2 custom-scrollbar"
    >
      <motion.div
        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="space-y-4 sm:space-y-4"
      >
        {/* Anime Character Header — spring bounce */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 20 }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, -8, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-11 h-11 rounded-2xl overflow-hidden border-[2.5px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] bg-[#0b2545] shrink-0"
          >
            <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
          </motion.div>
          <div className="flex-1">
            <motion.div
              whileHover={{ scale: 1.04, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 380 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-[#ffea79] text-[#0b2545] border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#0b2545] uppercase tracking-wider"
            >
              <Swords className="w-4 h-4 text-[#0b2545]" />
              <span>GUILD QUEST SHOWCASE</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#0b2545] text-[#ffea79] text-[9px] font-mono">S-TIER</span>
            </motion.div>
            <p className="text-[11px] text-slate-700 font-extrabold mt-1 pl-1 flex items-center gap-1">
              <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                <Sparkles className="w-3 h-3 text-[#c59b27]" />
              </motion.span>
              <em>"Legendary enterprise systems — crafted with full power!"</em>
            </p>
          </div>
        </motion.div>

        {/* Stats Power Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 20, delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-white border-[2.5px] border-[#0b2545] shadow-[5px_5px_0px_#0b2545] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffea79] opacity-30 rounded-full blur-xl pointer-events-none" />
          {COMPANY_INFO.stats.map((st, si) => (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + si * 0.06, type: 'spring', stiffness: 380 }}
              whileHover={{ scale: 1.08, rotate: -2, y: -2 }}
              className="text-center py-1.5 px-2 rounded-xl bg-slate-50 border-[2px] border-[#0b2545]/20 hover:border-[#0b2545] hover:bg-[#ffea79]/30 transition-colors cursor-default"
            >
              <div className="text-sm sm:text-base font-black text-[#0b2545] tracking-tight">{st.value}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-tight">{st.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quest Cards */}
        <div className="space-y-3.5">
          {PROJECT_HIGHLIGHTS.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              idx={idx}
              onOpenContact={onOpenContact}
              soundEnabled={soundEnabled}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};