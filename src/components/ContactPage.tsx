import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CEO_INFO } from '../data/companyData';
import { ThemePreset } from '../types';
import { soundFx } from '../utils/audio';
import {
  Phone, Mail, Send, Sparkles, User, MessageSquare, CheckCircle2,
  Copy, Check, Clock, Globe, ShieldCheck, DollarSign, ArrowRight, Zap, Star,
} from 'lucide-react';

import logoImg from '../assets/images/logo.png';

interface ContactPageProps {
  theme: ThemePreset;
  scrollStage: number;
  mouseXRatio: number;
  mouseYRatio: number;
  soundEnabled: boolean;
}

// Mini confetti burst
const PopBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({ x, y, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  const sparks = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 30 + Math.random() * 18;
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
      <motion.div
        className="absolute -top-2 -left-2 text-lg select-none pointer-events-none"
        initial={{ scale: 0, opacity: 1, y: 0 }}
        animate={{ scale: 1.4, opacity: 0, y: -28 }}
        transition={{ duration: 0.65 }}
      >
        ✨
      </motion.div>
    </div>
  );
};

// Contact info card with cartoon hover
const ContactCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
  copyKey: string;
  copiedField: string | null;
  onCopy: (value: string, key: string) => void;
  accentColor: string;
  index: number;
  isExternal?: boolean;
}> = ({ icon: Icon, label, value, href, copyKey, copiedField, onCopy, accentColor, index, isExternal }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -3, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 20, delay: 0.12 + index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={hovered ? { scaleX: 1.04, scaleY: 0.94, rotate: -1, y: -4 } : { scaleX: 1, scaleY: 1, rotate: 0, y: 0 }}
        whileTap={{ scaleX: 0.96, scaleY: 1.04 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className="p-3.5 rounded-2xl flex flex-col justify-between"
        style={{
          background: hovered ? `${accentColor}18` : 'rgba(11,37,69,0.04)',
          border: `2.5px solid ${hovered ? accentColor : 'rgba(197,155,39,0.3)'}`,
          boxShadow: hovered ? `4px 4px 0px ${accentColor}` : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        }}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <motion.span
            animate={hovered ? { rotate: [0, -18, 14, 0], scale: 1.2 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </motion.span>
          <motion.button
            onClick={() => onCopy(value, copyKey)}
            whileHover={{ scale: 1.2, rotate: -8 }}
            whileTap={{ scale: 0.85, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
            className="p-1 rounded-lg transition-colors"
            style={{ color: hovered ? accentColor : '#94a3b8' }}
            title={`Copy ${label}`}
          >
            <AnimatePresence mode="wait">
              {copiedField === copyKey ? (
                <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="w-3.5 h-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{label}</div>
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          className="text-xs font-black truncate transition-colors"
          style={{ color: hovered ? accentColor : '#0b2545' }}
        >
          {value}
        </a>
      </motion.div>
    </motion.div>
  );
};

export const ContactPage: React.FC<ContactPageProps> = ({
  scrollStage,
  mouseXRatio,
  mouseYRatio,
  soundEnabled,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Full-Stack Web Systems',
    budget: '$5k - $15k',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const counter = useRef(0);

  let opacityVal = 0;
  let slideY = 60;
  if (scrollStage >= 2.05) {
    const progress = Math.max(0, (scrollStage - 2.1) / 0.8);
    opacityVal = Math.min(1, progress * 1.2);
    slideY = (1 - opacityVal) * 80;
  }
  if (opacityVal <= 0.005) return null;

  const tiltX = mouseYRatio * -6;
  const tiltY = mouseXRatio * 8;

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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (soundEnabled) soundFx.playHoverSound();
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const contactCards = [
    {
      icon: Phone, label: 'Direct Call / WhatsApp', value: CEO_INFO.phone,
      href: `tel:${CEO_INFO.phone}`, copyKey: 'phone', accentColor: '#4fc3f7',
    },
    {
      icon: Mail, label: 'Direct Email', value: CEO_INFO.email,
      href: `mailto:${CEO_INFO.email}`, copyKey: 'email', accentColor: '#f06292',
    },
    {
      icon: Send, label: 'Telegram Chat', value: CEO_INFO.telegram,
      href: `https://t.me/${CEO_INFO.telegram.replace('@', '')}`, copyKey: 'telegram',
      accentColor: '#66bb6a', isExternal: true,
    },
  ];

  return (
    <>
      {bursts.map((b) => (
        <PopBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))} />
      ))}

      <motion.div
        style={{ opacity: opacityVal, transform: `translateY(${slideY}px)`, willChange: 'transform, opacity' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed left-3 right-3 sm:left-auto sm:right-8 md:right-12 lg:right-16 top-16 sm:top-20 bottom-12 z-30 w-auto sm:w-full max-w-none sm:max-w-xl md:max-w-2xl pointer-events-auto flex flex-col justify-center overflow-y-auto pr-1 sm:pr-2 custom-scrollbar"
      >
        <motion.div
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: tiltX, rotateY: tiltY }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="space-y-4"
        >
          {/* Header Row */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -6, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 rounded-lg overflow-hidden border-[2px] border-[#0b2545] shadow-[2px_2px_0px_#c59b27] bg-[#0b2545]"
              >
                <img src={logoImg} alt="Eben Dev" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.04, rotate: -1 }}
                transition={{ type: 'spring', stiffness: 380 }}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-black border-[2px] border-[#0b2545] shadow-[3px_3px_0px_#0b2545] uppercase tracking-wider"
                style={{ background: '#ffcc02', color: '#0b2545' }}
              >
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                  <Sparkles className="w-4 h-4 text-[#0b2545]" />
                </motion.span>
                <span>CONTACT US &amp; INQUIRY CENTER</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 380 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold border-[2px] border-emerald-600"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
            >
              <motion.span
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"
              />
              <span>ONLINE &amp; READY TO TALK</span>
            </motion.div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.06 }}
            onMouseEnter={() => soundEnabled && soundFx.playHoverSound()}
            className="relative p-6 sm:p-8 rounded-3xl border-[3px] border-[#0b2545] shadow-[6px_6px_0px_#0b2545] bg-white/98 text-[#0b2545] overflow-hidden"
          >
            {/* Thick cartoon top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4fc3f7] via-[#ffcc02] to-[#f06292] rounded-t-3xl" />

            {/* Title */}
            <div className="mb-5 pb-4 border-b-[2.5px] border-dashed border-slate-200 mt-1">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 340 }}
                className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}
              >
                Get in Touch with Eben Dev
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16, type: 'spring', stiffness: 340 }}
                className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium"
              >
                Have a high-impact project, a custom web app, or an AI vision? Speak directly with Hundefra or submit your scope below.
              </motion.p>
            </div>

            {/* Contact cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {contactCards.map((c, i) => (
                <ContactCard
                  key={c.copyKey}
                  {...c}
                  index={i}
                  copiedField={copiedField}
                  onCopy={handleCopy}
                />
              ))}
            </div>

            {/* Form / Success */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="submitted-card"
                  initial={{ opacity: 0, scale: 0.75, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className="text-center py-8 px-4 rounded-3xl border-[3px] border-[#0b2545] space-y-4"
                  style={{ background: 'linear-gradient(135deg,#fffde7,#fff9c4)', boxShadow: '5px 5px 0px #0b2545' }}
                >
                  {/* Animated success icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 18, delay: 0.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-[3px] border-[#0b2545] shadow-[4px_4px_0px_#0b2545]"
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
                    transition={{ delay: 0.2, type: 'spring', stiffness: 360 }}
                    className="text-2xl font-black text-[#0b2545]"
                    style={{ fontFamily: '"Nunito","Fredoka One",system-ui' }}
                  >
                    🎉 Inquiry Transmitted!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, type: 'spring', stiffness: 360 }}
                    className="text-xs sm:text-sm text-slate-700 max-w-sm mx-auto leading-relaxed font-bold"
                  >
                    Thank you, <span className="text-[#c59b27]">{formData.name}</span>. Hundefra Nassir and the Eben Dev team will follow up within 2 hours.
                  </motion.p>

                  {/* Stars burst */}
                  <motion.div className="flex justify-center gap-1">
                    {[0,1,2,3,4].map((i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.35 + i * 0.06, type: 'spring', stiffness: 400 }}
                      >
                        <Star className="w-4 h-4 fill-[#c59b27] text-[#c59b27]" />
                      </motion.span>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-2 flex justify-center"
                  >
                    <motion.button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', service: 'Full-Stack Web Systems', budget: '$5k - $15k', message: '' });
                      }}
                      whileHover={{ scaleX: 1.06, scaleY: 0.93, rotate: -1 }}
                      whileTap={{ scaleX: 0.93, scaleY: 1.07, rotate: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                      className="px-5 py-2.5 rounded-xl text-xs font-black text-[#ffea79] border-[2px] border-[#0b2545]"
                      style={{ background: '#0b2545', boxShadow: '3px 3px 0px #c59b27' }}
                    >
                      Submit Another Scope
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-3.5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14, type: 'spring', stiffness: 340 }}
                    >
                      <label className="block text-[11px] font-black mb-1 text-slate-600 uppercase tracking-wider">Your Full Name</label>
                      <motion.div
                        animate={focusedField === 'name' ? { scale: 1.02, rotate: -0.5 } : { scale: 1, rotate: 0 }}
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
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all"
                          style={{
                            borderColor: focusedField === 'name' ? '#ffcc02' : '#e2e8f0',
                            boxShadow: focusedField === 'name' ? '3px 3px 0px #0b2545' : 'none',
                          }}
                        />
                      </motion.div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18, type: 'spring', stiffness: 340 }}
                    >
                      <label className="block text-[11px] font-black mb-1 text-slate-600 uppercase tracking-wider">Email Address</label>
                      <motion.div
                        animate={focusedField === 'email' ? { scale: 1.02, rotate: 0.5 } : { scale: 1, rotate: 0 }}
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
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all"
                          style={{
                            borderColor: focusedField === 'email' ? '#f06292' : '#e2e8f0',
                            boxShadow: focusedField === 'email' ? '3px 3px 0px #0b2545' : 'none',
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Service */}
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22, type: 'spring', stiffness: 340 }}
                    >
                      <label className="block text-[11px] font-black mb-1 text-slate-600 uppercase tracking-wider">Primary Service Focus</label>
                      <motion.select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        onFocus={() => setFocusedField('service')}
                        onBlur={() => setFocusedField(null)}
                        animate={focusedField === 'service' ? { scale: 1.02, rotate: -0.5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 380 }}
                        className="w-full px-3 py-2.5 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all appearance-none cursor-pointer"
                        style={{
                          borderColor: focusedField === 'service' ? '#66bb6a' : '#e2e8f0',
                          boxShadow: focusedField === 'service' ? '3px 3px 0px #0b2545' : 'none',
                        }}
                      >
                        <option value="Full-Stack Web Systems">Full-Stack Web Systems</option>
                        <option value="AI & Machine Learning">AI &amp; Generative Automation</option>
                        <option value="3D & Interactive Motion">3D WebGL &amp; Motion Graphics</option>
                        <option value="Cross-Platform Mobile">Cross-Platform Mobile App</option>
                      </motion.select>
                    </motion.div>

                    {/* Budget */}
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.26, type: 'spring', stiffness: 340 }}
                    >
                      <label className="block text-[11px] font-black mb-1 text-slate-600 uppercase tracking-wider">Budget Expectation</label>
                      <motion.div
                        animate={focusedField === 'budget' ? { scale: 1.02, rotate: 0.5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 380 }}
                        className="relative"
                      >
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          onFocus={() => setFocusedField('budget')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none transition-all appearance-none cursor-pointer"
                          style={{
                            borderColor: focusedField === 'budget' ? '#ba68c8' : '#e2e8f0',
                            boxShadow: focusedField === 'budget' ? '3px 3px 0px #0b2545' : 'none',
                          }}
                        >
                          <option value="Under $5k">&lt; $5,000 USD</option>
                          <option value="$5k - $15k">$5,000 - $15,000 USD</option>
                          <option value="$15k - $30k">$15,000 - $30,000 USD</option>
                          <option value="$30k+">$30,000+ USD</option>
                        </select>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 340 }}
                  >
                    <label className="block text-[11px] font-black mb-1 text-slate-600 uppercase tracking-wider">Project Vision &amp; Specs</label>
                    <motion.div
                      animate={focusedField === 'message' ? { scale: 1.01, rotate: -0.3 } : { scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 380 }}
                      className="relative"
                    >
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        required
                        rows={3}
                        placeholder="Outline your tech requirements, target audience, key deliverables, or launch timeline..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border-[2.5px] bg-slate-50 focus:outline-none resize-none transition-all"
                        style={{
                          borderColor: focusedField === 'message' ? '#ffcc02' : '#e2e8f0',
                          boxShadow: focusedField === 'message' ? '3px 3px 0px #0b2545' : 'none',
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
                      whileTap={{ scaleX: 0.93, scaleY: 1.07, rotate: 1 }}
                      transition={{ type: 'spring', stiffness: 460, damping: 16 }}
                      className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm text-[#ffea79] flex items-center justify-center gap-2 border-[2.5px] border-[#0b2545] cursor-pointer"
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
                      <span>Send Direct Inquiry to CEO</span>
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 pt-4 border-t-[2px] border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              {[
                { icon: Clock, label: 'SLA: < 2 Hours' },
                { icon: Globe, label: 'Addis Ababa (Global Sync)' },
                { icon: ShieldCheck, label: 'NDAs Signed on Request' },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.06, type: 'spring', stiffness: 340 }}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold cursor-default"
                >
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#c59b27' }} />
                  </motion.span>
                  <span>{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};