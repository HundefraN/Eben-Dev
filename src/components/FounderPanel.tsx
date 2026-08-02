import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { FOUNDER_INFO } from '../data/companyData';
import { StagePanel } from './StagePanel';
import { soundFx } from '../utils/audio';

import founderPhoto from '../assets/images/CEO.jpg';

/** Thin capability meter — a quiet bar, not a game HUD. */
const Meter: React.FC<{ label: string; caption: string; value: number; delay: number }> = ({
  label,
  caption,
  value,
  delay,
}) => {
  const { reduceMotion } = useStudio();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), reduceMotion ? 0 : delay * 1000 + 260);
    return () => clearTimeout(t);
  }, [value, delay, reduceMotion]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-fg">{label}</span>
        <span className="eyebrow" style={{ fontSize: 8.5 }}>
          {caption}
        </span>
      </div>
      <div
        className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
        style={{ background: 'color-mix(in srgb, var(--fg) 8%, transparent)' }}
        role="presentation"
      >
        <motion.span
          className="block h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--accent-strong), var(--accent))',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

const ContactLink: React.FC<{
  href: string;
  icon: React.ElementType;
  label: string;
  value: string;
  external?: boolean;
  quip: string;
}> = ({ href, icon: Icon, label, value, external, quip }) => {
  const { sound } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 0.9, quip });

  return (
    <motion.a
      ref={ref}
      {...linkProps}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onMouseEnter={() => {
        linkProps.onMouseEnter();
        if (sound) soundFx.playHoverSound();
      }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="group flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors"
      style={{
        background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
        border: '1px solid var(--hairline)',
      }}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{ background: 'var(--accent-soft)' }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: 'var(--accent-strong)' }} />
      </span>
      <span className="min-w-0">
        <span className="eyebrow block" style={{ fontSize: 8.5 }}>
          {label}
        </span>
        <span className="block truncate text-[12px] font-semibold text-fg">{value}</span>
      </span>
    </motion.a>
  );
};

export const FounderPanel: React.FC = () => {
  const { goTo, sound } = useStudio();
  const cta = useCompanionLink({ weight: 1, quip: 'Go on — he reads every one of these.' });

  return (
    <StagePanel
      index={2}
      side="left"
      eyebrow="Founder"
      title={FOUNDER_INFO.name}
      intro={FOUNDER_INFO.title}
    >
      {/* Portrait + identity */}
      <div className="flex gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="relative h-[104px] w-[92px] shrink-0 overflow-hidden rounded-[var(--radius-md)]"
          style={{ border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-md)' }}
        >
          <img
            src={founderPhoto}
            alt={FOUNDER_INFO.name}
            className="h-full w-full object-cover object-top"
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--ink-950) 45%, transparent))',
            }}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                  style={{ background: 'var(--accent)' }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              </span>
              Available for new work
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
            <MapPin className="h-3 w-3 shrink-0" style={{ color: 'var(--accent-strong)' }} />
            {FOUNDER_INFO.location}
          </p>
          <p className="mt-1 text-[11.5px] text-muted">{FOUNDER_INFO.experienceYears} in production</p>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{FOUNDER_INFO.bio}</p>

      {/* Capability meters */}
      <div className="mt-5 flex flex-col gap-3.5">
        {FOUNDER_INFO.disciplines.map((d, i) => (
          <Meter key={d.label} label={d.label} caption={d.caption} value={d.value} delay={0.1 + i * 0.1} />
        ))}
      </div>

      {/* Stack */}
      <div className="mt-5">
        <span className="eyebrow">Working stack</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FOUNDER_INFO.skills.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + i * 0.03 }}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] text-muted"
              style={{
                background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                border: '1px solid var(--hairline)',
              }}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Direct lines */}
      <div className="mt-5 grid grid-cols-1 gap-2">
        <ContactLink
          href={`tel:${FOUNDER_INFO.phone}`}
          icon={Phone}
          label="Call"
          value={FOUNDER_INFO.phone}
          quip="He does actually pick up."
        />
        <ContactLink
          href={`mailto:${FOUNDER_INFO.email}`}
          icon={Mail}
          label="Email"
          value={FOUNDER_INFO.email}
          quip="Email is the safest bet for detail."
        />
        <ContactLink
          href={`https://t.me/${FOUNDER_INFO.telegram.replace('@', '')}`}
          icon={Send}
          label="Telegram"
          value={FOUNDER_INFO.telegram}
          external
          quip="Telegram if you want a fast reply."
        />
      </div>

      <motion.button
        ref={cta.ref}
        {...cta.linkProps}
        type="button"
        onClick={() => {
          if (sound) soundFx.playClickChime();
          goTo(3);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 440, damping: 26 }}
        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold"
        style={{
          background: 'var(--action-bg)',
          color: 'var(--action-fg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Brief the studio
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.button>
    </StagePanel>
  );
};
