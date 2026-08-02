import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECT_HIGHLIGHTS, COMPANY_INFO } from '../data/companyData';
import { ThemePreset } from '../types';
import { Trophy, ArrowUpRight, X, Sparkles, ShieldCheck, TrendingUp, Zap, Flame, Swords } from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface ShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  theme: ThemePreset;
}

export const ShowcaseModal: React.FC<ShowcaseModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  theme: _theme,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071930]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            className="relative w-full max-w-4xl rounded-3xl border-[3px] border-[#0b2545] shadow-[10px_10px_0px_#0b2545] z-10 my-auto overflow-hidden bg-white text-[#0b2545]"
          >
            {/* Manga stripe top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#0b2545]" />
            <div className="absolute top-2 left-0 right-0 h-[4px] bg-[#c59b27]" />

            <div className="p-6 sm:p-8 pt-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-[2.5px] border-[#0b2545] shadow-[3px_3px_0px_#c59b27] bg-[#0b2545] shrink-0">
                    <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#ffea79] text-[#0b2545] border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#0b2545] uppercase tracking-wider mb-2">
                      <Swords className="w-4 h-4" />
                      <span>PROJECT QUEST SHOWCASE</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#0b2545] text-[#ffea79] text-[9px] font-mono">S-TIER</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b2545]">
                      Legendary Systems. Maximum Power.
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                      Enterprise-grade builds crafted by the Eben Dev guild.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#0b2545] hover:bg-[#0b2545] hover:text-[#ffea79] border-[2px] border-[#0b2545] shadow-[2px_2px_0px_#0b2545] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Manga Stats Power Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 rounded-2xl bg-white border-[2.5px] border-[#0b2545] shadow-[5px_5px_0px_#0b2545] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#ffea79] opacity-50 rounded-full blur-xl pointer-events-none" />
                {COMPANY_INFO.stats.map((st) => (
                  <div key={st.label} className="text-center p-2 rounded-xl bg-slate-50 border-[1.5px] border-[#0b2545]/20 hover:border-[#0b2545] transition-colors">
                    <div className="text-2xl sm:text-3xl font-black text-[#0b2545]">{st.value}</div>
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>

              {/* Anime Quest Project Cards */}
              <div className="space-y-4 mb-8">
                {PROJECT_HIGHLIGHTS.map((proj, idx) => {
                  const AccentIcon = [TrendingUp, Zap, Trophy][idx % 3];
                  const sfx = ['BOOM!', 'S-RANK!', 'EPIC BUILD'][idx % 3];
                  return (
                    <div
                      key={proj.id}
                      className="group relative p-5 rounded-2xl border-[2.5px] border-[#0b2545] shadow-[5px_5px_0px_#0b2545] hover:shadow-[6px_6px_0px_#c59b27] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* SFX Burst */}
                      <div className="absolute -top-3 -right-2 px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-[#ff4d4d] text-white border-[1.5px] border-[#0b2545] shadow-[2px_2px_0px_#0b2545] rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all select-none">
                        {sfx}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className="w-8 h-8 rounded-xl bg-[#0b2545] flex items-center justify-center border-[1.5px] border-[#0b2545] shadow-[2px_2px_0px_#c59b27]">
                            <AccentIcon className="w-4 h-4 text-[#ffea79]" />
                          </div>
                          <span className="text-xs font-black text-[#0b2545] bg-[#ffea79]/50 px-2 py-0.5 rounded-md border border-[#0b2545]/20 uppercase tracking-wider">{proj.category}</span>
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border-[1.5px] border-emerald-700 shadow-[2px_2px_0px_#065f46]">
                            <ShieldCheck className="w-3 h-3" />
                            {proj.metrics}
                          </span>
                        </div>
                        <h3 className="text-base font-black group-hover:text-[#c59b27] transition-colors text-[#0b2545]">{proj.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-[#0b2545] border border-[#0b2545]/20 group-hover:bg-[#ffea79]/40 group-hover:border-[#0b2545] transition-colors">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => { onClose(); onOpenContact(); }}
                        className="self-start sm:self-center shrink-0 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border-[2px] border-[#0b2545] bg-[#0b2545] text-[#ffea79] shadow-[3px_3px_0px_#0b2545] hover:bg-[#c59b27] hover:text-[#0b2545] hover:shadow-[4px_4px_0px_#0b2545] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all duration-150"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Request Build</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t-[2px] border-dashed border-slate-200">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#0b2545] text-[#ffea79] border-[2px] border-[#0b2545] shadow-[4px_4px_0px_#0b2545] hover:bg-[#c59b27] hover:text-[#0b2545] hover:shadow-[5px_5px_0px_#0b2545] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
                >
                  Close Showcase
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};