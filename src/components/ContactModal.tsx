import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemePreset } from '../types';
import { soundFx } from '../utils/audio';
import { Send, CheckCircle2, X, Sparkles, Mail, User, MessageSquare, Building, Star, Zap } from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemePreset;
  soundEnabled: boolean;
}

// Pop burst on submit
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 9 }, (_, i) => {
    const angle = (i / 9) * Math.PI * 2;
    const dist = 28 + Math.random() * 16;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div className="pointer-events-none fixed z-[200]" style={{ left: x, top: y }}>
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ffcc02','#f06292','#66bb6a','#4fc3f7','#ba68c8','#ff8a65','#fff176','#aed581','#ffcc02'][i],
            top: -4, left: -4,
          }}
          initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          animate={{ scale: 0, x: s.tx, y: s.ty, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <motion.div
        className="absolute -top-5 -left-5 w-10 h-10 rounded-full border-4 border-[#ffcc02]"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  theme,
  soundEnabled,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const counter = useRef(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEnabled) soundFx.playClickChime();
    const btn = (e.nativeEvent as SubmitEvent).submitter;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const id = counter.current++;
      setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const fieldBorderColor = (key: string, baseColor: string) =>
    focusedField === key ? baseColor : '#e2e8f0';

  const fieldShadow = (key: string) =>
    focusedField === key ? '3px 3px 0px #0b2545' : 'none';

  return (
    <>
      {bursts.map((b) => (
        <PopBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))} />
      ))}

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

            {/* Modal — cartoon spring pop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.72, y: 40, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className={`relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border-[3px] shadow-2xl z-10 my-auto overflow-hidden ${
                theme === 'studio-light'
                  ? 'bg-white/98 text-[#0b2545] border-[#0b2545]'
                  : 'bg-[#0b2545]/98 text-white border-[#c59b27]'
              }`}
              style={{ boxShadow: '8px 8px 0px #0b2545, 0 20px 60px rgba(11,37,69,0.3)' }}
            >
              {/* Thick cartoon top bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4fc3f7] via-[#ffcc02] to-[#f06292] rounded-t-3xl" />

              {/* Spinning close button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                className="absolute top-5 right-5 p-2 rounded-xl border-[2px] border-slate-200 hover:border-red-400 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shadow-[2px_2px_0px_#cbd5e1] hover:shadow-[2px_2px_0px_#fca5a5]"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ─── Success Screen ─── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.75, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                    className="text-center py-8 space-y-4 mt-2"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 460, damping: 18, delay: 0.1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-[3px] border-[#0b2545] shadow-[4px_4px_0px_#c59b27]"
                      style={{ background: '#ffcc02' }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 15, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <CheckCircle2 className="w-8 h-8 text-[#0b2545]" />
                      </motion.span>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, type: 'spring', stiffness: 360 }}
                      className="text-2xl font-black tracking-tight"
                      style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}
                    >
                      🎉 Transmission Received!
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26, type: 'spring', stiffness: 360 }}
                      className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold"
                    >
                      Thank you,{' '}
                      <span className="font-black text-[#c59b27]">{formData.name || 'Friend'}</span>!{' '}
                      The Eben Dev engineering team will review your inquiry and respond within 24 hours.
                    </motion.p>

                    {/* Stars pop in */}
                    <motion.div className="flex justify-center gap-1">
                      {[0,1,2,3,4].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.34 + i * 0.06, type: 'spring', stiffness: 400 }}
                        >
                          <Star className="w-4 h-4 fill-[#c59b27] text-[#c59b27]" />
                        </motion.span>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 }}
                      className="pt-2 flex justify-center gap-3"
                    >
                      <motion.button
                        onClick={handleReset}
                        whileHover={{ scaleX: 1.06, scaleY: 0.93, rotate: -1 }}
                        whileTap={{ scaleX: 0.93, scaleY: 1.07 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                        className="px-4 py-2 rounded-xl text-xs font-black border-[2px] border-[#0b2545] text-[#0b2545] hover:bg-[#ffcc02] transition-colors"
                        style={{ boxShadow: '2px 2px 0px #0b2545' }}
                      >
                        Send Another Note
                      </motion.button>
                      <motion.button
                        onClick={onClose}
                        whileHover={{ scaleX: 1.06, scaleY: 0.93, rotate: -1 }}
                        whileTap={{ scaleX: 0.93, scaleY: 1.07 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                        className="px-5 py-2 rounded-xl text-xs font-black text-[#ffea79] border-[2px] border-[#0b2545]"
                        style={{ background: '#0b2545', boxShadow: '3px 3px 0px #c59b27' }}
                      >
                        Back to Canvas
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ─── Contact Form ─── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-5 mt-2">
                      <motion.div
                        animate={{ rotate: [0, -6, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-9 h-9 rounded-xl overflow-hidden border-[2px] border-[#0b2545] shadow-[2px_2px_0px_#c59b27] bg-[#0b2545] shrink-0 mt-0.5"
                      >
                        <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
                      </motion.div>
                      <div>
                        <motion.div
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08, type: 'spring', stiffness: 360 }}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-black mb-2 border-[2px] border-[#0b2545] shadow-[2px_2px_0px_#0b2545] uppercase tracking-wider"
                          style={{ background: '#ffcc02', color: '#0b2545' }}
                        >
                          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                            <Sparkles className="w-3.5 h-3.5" />
                          </motion.span>
                          <span>START A PROJECT</span>
                        </motion.div>
                        <motion.h2
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12, type: 'spring', stiffness: 360 }}
                          className="text-2xl font-black tracking-tight mb-1"
                          style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}
                        >
                          Connect with Eben Dev
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.16, type: 'spring', stiffness: 360 }}
                          className="text-xs text-slate-500"
                        >
                          Ready to build something extraordinary? Tell us about your vision.
                        </motion.p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name */}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18, type: 'spring', stiffness: 340 }}
                      >
                        <label className="block text-xs font-black mb-1 text-slate-600 uppercase tracking-wider">Your Name</label>
                        <motion.div
                          animate={focusedField === 'name' ? { scale: 1.02, rotate: -0.4 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 380 }}
                          className="relative"
                        >
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Alex Morgan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all"
                            style={{
                              borderColor: fieldBorderColor('name', '#ffcc02'),
                              boxShadow: fieldShadow('name'),
                            }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Email */}
                      <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22, type: 'spring', stiffness: 340 }}
                      >
                        <label className="block text-xs font-black mb-1 text-slate-600 uppercase tracking-wider">Email Address</label>
                        <motion.div
                          animate={focusedField === 'email' ? { scale: 1.02, rotate: 0.4 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 380 }}
                          className="relative"
                        >
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="alex@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all"
                            style={{
                              borderColor: fieldBorderColor('email', '#f06292'),
                              boxShadow: fieldShadow('email'),
                            }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Company */}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.26, type: 'spring', stiffness: 340 }}
                      >
                        <label className="block text-xs font-black mb-1 text-slate-600 uppercase tracking-wider">Company / Organization (Optional)</label>
                        <motion.div
                          animate={focusedField === 'company' ? { scale: 1.02, rotate: -0.4 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 380 }}
                          className="relative"
                        >
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Acme Technologies"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            onFocus={() => setFocusedField('company')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all"
                            style={{
                              borderColor: fieldBorderColor('company', '#66bb6a'),
                              boxShadow: fieldShadow('company'),
                            }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 340 }}
                      >
                        <label className="block text-xs font-black mb-1 text-slate-600 uppercase tracking-wider">Project Details &amp; Timeline</label>
                        <motion.div
                          animate={focusedField === 'message' ? { scale: 1.01, rotate: -0.3 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 380 }}
                          className="relative"
                        >
                          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            required
                            rows={3}
                            placeholder="Describe your web app, 3D experience, or custom AI system..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            onFocus={() => setFocusedField('message')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none resize-none transition-all"
                            style={{
                              borderColor: fieldBorderColor('message', '#ba68c8'),
                              boxShadow: fieldShadow('message'),
                            }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Submit CTA */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.36, type: 'spring', stiffness: 340 }}
                      >
                        <motion.button
                          type="submit"
                          whileHover={{ scaleX: 1.04, scaleY: 0.94, rotate: -0.8 }}
                          whileTap={{ scaleX: 0.92, scaleY: 1.08, rotate: 1 }}
                          transition={{ type: 'spring', stiffness: 460, damping: 16 }}
                          className="w-full py-3 rounded-xl font-black text-xs sm:text-sm text-[#ffea79] flex items-center justify-center gap-2 border-[2.5px] border-[#0b2545] cursor-pointer"
                          style={{ background: '#0b2545', boxShadow: '5px 5px 0px #c59b27' }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#c59b27';
                            (e.currentTarget as HTMLElement).style.color = '#0b2545';
                            (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0px #0b2545';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#0b2545';
                            (e.currentTarget as HTMLElement).style.color = '#ffea79';
                            (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0px #c59b27';
                          }}
                        >
                          <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                            <Zap className="w-4 h-4" />
                          </motion.span>
                          <span>Submit Project Scope</span>
                          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                            <Send className="w-4 h-4" />
                          </motion.span>
                        </motion.button>
                      </motion.div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};