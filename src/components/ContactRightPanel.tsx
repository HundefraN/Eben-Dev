import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CEO_INFO } from '../data/companyData';
import { ThemePreset } from '../types';
import { soundFx } from '../utils/audio';
import { Phone, Mail, Send, Sparkles, User, MessageSquare, CheckCircle2, Copy, Check, Clock, Globe } from 'lucide-react';

interface ContactRightPanelProps {
  theme: ThemePreset;
  scrollStage: number;
  mouseXRatio: number;
  mouseYRatio: number;
  soundEnabled: boolean;
}

export const ContactRightPanel: React.FC<ContactRightPanelProps> = ({
  theme,
  scrollStage,
  mouseXRatio,
  mouseYRatio,
  soundEnabled,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Full-Stack Web',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // All hooks must come before any conditional returns (Rules of Hooks)
  if (scrollStage < 2.2) return null;

  const tiltX = mouseYRatio * -8;
  const tiltY = mouseXRatio * 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEnabled) soundFx.playClickChime();
    setSubmitted(true);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (soundEnabled) soundFx.playHoverSound();
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{
        opacity: Math.min(1, (scrollStage - 2.2) * 2.5),
        x: 0,
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed right-4 sm:right-8 md:right-12 lg:right-16 top-20 bottom-10 z-30 w-full max-w-md sm:max-w-lg md:max-w-xl pointer-events-auto flex flex-col justify-center overflow-y-auto pr-2 custom-scrollbar"
    >
      <motion.div
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#0b2545]/10 border border-[#c59b27]/40 text-[#0b2545] dark:text-[#d8af38] backdrop-blur-md w-fit">
            <Sparkles className="w-4 h-4 text-[#c59b27]" />
            <span>24/7 DIRECT TRANSMISSION</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE ON CALL</span>
          </div>
        </div>

        <div
          onMouseEnter={() => soundEnabled && soundFx.playHoverSound()}
          className={`p-6 sm:p-7 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            theme === 'studio-light'
              ? 'bg-white/95 text-[#0b2545] border-slate-200/90 shadow-[#0b2545]/10'
              : 'bg-[#0b2545]/95 text-white border-[#133863] shadow-black/80'
          }`}
        >
          <div className="mb-5 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Let's Build Something Extraordinary
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Connect directly with Hundefra or send us your project scope for immediate feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
            <div className="p-3 rounded-2xl bg-[#0b2545]/5 dark:bg-[#071930] border border-[#c59b27]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                <button
                  onClick={() => handleCopy(CEO_INFO.phone, 'phone')}
                  className="p-1 hover:text-[#c59b27] transition-colors"
                  title="Copy Phone"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">DIRECT LINE</div>
              <a
                href={`tel:${CEO_INFO.phone}`}
                className="text-xs font-bold truncate hover:text-[#c59b27] transition-colors"
              >
                {CEO_INFO.phone}
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-[#0b2545]/5 dark:bg-[#071930] border border-[#c59b27]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#c59b27]" />
                <button
                  onClick={() => handleCopy(CEO_INFO.email, 'email')}
                  className="p-1 hover:text-[#c59b27] transition-colors"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">EMAIL US</div>
              <a
                href={`mailto:${CEO_INFO.email}`}
                className="text-xs font-bold truncate hover:text-[#c59b27] transition-colors"
              >
                {CEO_INFO.email}
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-[#0b2545]/5 dark:bg-[#071930] border border-[#c59b27]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <Send className="w-3.5 h-3.5 text-[#c59b27]" />
                <button
                  onClick={() => handleCopy(CEO_INFO.telegram, 'telegram')}
                  className="p-1 hover:text-[#c59b27] transition-colors"
                  title="Copy Telegram"
                >
                  {copiedField === 'telegram' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">TELEGRAM</div>
              <a
                href={`https://t.me/${CEO_INFO.telegram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold truncate hover:text-[#c59b27] transition-colors"
              >
                {CEO_INFO.telegram}
              </a>
            </div>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3 bg-[#c59b27]/10 rounded-2xl border border-[#c59b27]/40 p-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#c59b27] text-[#0b2545] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-[#c59b27]">{formData.name}</span>. Hundefra and the engineering team will review your inquiry and get back to you within 2 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', category: 'Full-Stack Web', message: '' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0b2545] text-white hover:bg-[#c59b27] hover:text-[#0b2545] transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-300">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border bg-slate-50 dark:bg-[#071930] border-slate-200 dark:border-[#133863] focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border bg-slate-50 dark:bg-[#071930] border-slate-200 dark:border-[#133863] focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-300">
                  Project Capability Need
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-slate-50 dark:bg-[#071930] border-slate-200 dark:border-[#133863] focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                >
                  <option value="Full-Stack Web">Full-Stack Web Systems</option>
                  <option value="AI & Machine Learning">AI & Machine Learning Integration</option>
                  <option value="3D & Interactive Motion">3D WebGL & Motion Graphics</option>
                  <option value="Mobile App Development">Mobile App Development (iOS / Android)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-slate-600 dark:text-slate-300">
                  Project Vision & Scope
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about your timeline, feature goals, or custom requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border bg-slate-50 dark:bg-[#071930] border-slate-200 dark:border-[#133863] focus:outline-none focus:ring-2 focus:ring-[#c59b27] resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#0b2545] hover:bg-[#c59b27] text-white hover:text-[#0b2545] flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Project Inquiry</span>
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Response Time: &lt; 2 hrs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Location: Addis Ababa (Global Sync)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};