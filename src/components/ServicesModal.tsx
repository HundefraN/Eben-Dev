import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES_LIST } from '../data/companyData';
import { ThemePreset } from '../types';
import { Code2, Sparkles, Box, Smartphone, X, ArrowRight, CheckCircle2, Star, Zap } from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  theme: ThemePreset;
}

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Sparkles,
  Box,
  Smartphone,
};

// Cartoon palette per service card
const CARD_COLORS = [
  { accent: '#4fc3f7', border: '#0288d1', shadow: '#01579b', pill: '#e1f5fe', pillText: '#01579b' },
  { accent: '#ffcc02', border: '#f7b500', shadow: '#e65100', pill: '#fff9c4', pillText: '#e65100' },
  { accent: '#f06292', border: '#c2185b', shadow: '#880e4f', pill: '#fce4ec', pillText: '#880e4f' },
  { accent: '#66bb6a', border: '#2e7d32', shadow: '#1b5e20', pill: '#e8f5e9', pillText: '#1b5e20' },
];

// Floating sparkle that orbits a card on hover
const FloatingSticker: React.FC<{ emoji: string; angle: number; radius: number; speed: number }> = ({
  emoji, angle, radius, speed,
}) => {
  const [a, setA] = React.useState(angle);
  const rafRef = React.useRef<number>();
  const lastRef = React.useRef(performance.now());

  React.useEffect(() => {
    const loop = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setA((prev) => prev + dt * speed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [speed]);

  return (
    <div
      className="absolute pointer-events-none select-none text-base"
      style={{
        left: `calc(50% + ${Math.cos(a) * radius}px)`,
        top: `calc(50% + ${Math.sin(a) * radius}px)`,
        transform: 'translate(-50%,-50%)',
        zIndex: 10,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
    >
      {emoji}
    </div>
  );
};

const ServiceCard: React.FC<{
  svc: (typeof SERVICES_LIST)[0];
  index: number;
}> = ({ svc, index }) => {
  const [hovered, setHovered] = useState(false);
  const IconComponent = iconMap[svc.iconName] || Code2;
  const colors = CARD_COLORS[index % CARD_COLORS.length];
  const stickers = ['✨', '⚡', '🚀', '💎'];
  const sticker = stickers[index % stickers.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.1 + index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
    >
      {/* Orbiting sticker on hover */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 20 }}>
          <FloatingSticker emoji={sticker} angle={0} radius={72} speed={3.5} />
          <FloatingSticker emoji="⭐" angle={Math.PI} radius={68} speed={-2.8} />
        </div>
      )}

      <motion.div
        animate={
          hovered
            ? { scaleX: 1.03, scaleY: 0.97, rotate: -1, y: -4 }
            : { scaleX: 1, scaleY: 1, rotate: 0, y: 0 }
        }
        whileTap={{ scaleX: 0.96, scaleY: 1.04, rotate: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className="relative p-5 rounded-2xl overflow-hidden cursor-default"
        style={{
          background: '#ffffff',
          border: `3px solid ${hovered ? colors.border : colors.accent}`,
          boxShadow: hovered
            ? `5px 5px 0px ${colors.shadow}, 0 12px 30px ${colors.accent}44`
            : `4px 4px 0px ${colors.accent}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
          style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.border})` }}
        />

        {/* SFX badge */}
        <motion.div
          animate={hovered ? { rotate: 0, scale: 1.1 } : { rotate: 8, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          className="absolute -top-3 -right-2 px-2 py-0.5 rounded-lg text-[9px] font-black text-white border-2 border-[#0b2545] shadow-[2px_2px_0px_#0b2545] select-none"
          style={{ background: colors.border }}
        >
          NEW SKILL
        </motion.div>

        <div className="flex items-center gap-3 mb-3 mt-1">
          <motion.div
            animate={hovered ? { rotate: [0, -20, 15, 0], scale: 1.15 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md border-2 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.border})`,
              borderColor: colors.border,
              boxShadow: `3px 3px 0px ${colors.shadow}`,
            }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-base font-black tracking-tight text-[#0b2545]">{svc.title}</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-medium">
          {svc.fullDesc}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {svc.tags.map((tag, ti) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18 + index * 0.06 + ti * 0.04, type: 'spring', stiffness: 380 }}
              whileHover={{ scale: 1.12, rotate: -2 }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-black border-2 cursor-default select-none"
              style={{
                background: colors.pill,
                color: colors.pillText,
                borderColor: colors.border,
                boxShadow: `1px 1px 0px ${colors.border}`,
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  theme,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071930]/70 backdrop-blur-md"
          />

          {/* Modal Panel — cartoon spring pop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 40, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className={`relative w-full max-w-4xl p-6 sm:p-8 rounded-3xl border-[3px] shadow-2xl z-10 my-auto overflow-hidden ${
              theme === 'studio-light'
                ? 'bg-white/98 text-[#0b2545] border-[#0b2545]'
                : 'bg-[#0b2545]/98 text-white border-[#c59b27]'
            }`}
            style={{ boxShadow: '8px 8px 0px #0b2545, 0 20px 60px rgba(11,37,69,0.3)' }}
          >
            {/* Thick cartoon top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4fc3f7] via-[#c59b27] to-[#f06292] rounded-t-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b-[2.5px] border-dashed border-slate-200 mt-1">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-11 h-11 rounded-2xl overflow-hidden border-[2.5px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] bg-[#0b2545] shrink-0"
                >
                  <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
                </motion.div>
                <div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 320 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-[#ffcc02] text-[#0b2545] border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#0b2545] uppercase tracking-wider mb-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>EBEN DEV CAPABILITIES</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#0b2545] text-[#ffcc02] text-[9px] font-mono">S-TIER</span>
                  </motion.div>
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 320 }}
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                  >
                    High-Impact Engineering Solutions
                  </motion.h2>
                  <motion.p
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 320 }}
                    className="text-xs sm:text-sm text-slate-500 mt-1"
                  >
                    We build custom web systems, AI workflows, and interactive 3D platforms tailored for scale.
                  </motion.p>
                </div>
              </div>

              {/* Spinning X button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 border-2 border-slate-200 hover:border-red-400 shadow-[2px_2px_0px_#cbd5e1] hover:shadow-[2px_2px_0px_#fca5a5] transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8">
              {SERVICES_LIST.map((svc, i) => (
                <ServiceCard key={svc.id} svc={svc} index={i} />
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-[2.5px] border-dashed border-slate-200">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-xs text-slate-500 font-bold"
              >
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                </motion.span>
                <span>Tailored strategy &amp; architecture discovery session</span>
              </motion.div>

              <motion.button
                onClick={() => { onClose(); onOpenContact(); }}
                whileHover={{ scaleX: 1.06, scaleY: 0.95, rotate: -1 }}
                whileTap={{ scaleX: 0.94, scaleY: 1.06, rotate: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-[#ffea79] flex items-center justify-center gap-2 uppercase tracking-wider border-[2.5px] border-[#0b2545]"
                style={{
                  background: '#0b2545',
                  boxShadow: '4px 4px 0px #c59b27',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#c59b27';
                  (e.currentTarget as HTMLElement).style.color = '#0b2545';
                  (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0px #0b2545';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#0b2545';
                  (e.currentTarget as HTMLElement).style.color = '#ffea79';
                  (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px #c59b27';
                }}
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Initiate Project Consultation</span>
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};