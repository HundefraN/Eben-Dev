import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight, Check, CheckCircle2, Clock, Copy, Loader2, Mail, Phone, Send, ShieldCheck,
} from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { FOUNDER_INFO, SERVICES_LIST } from '../data/companyData';
import { StagePanel } from './StagePanel';
import { soundFx } from '../utils/audio';

const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $30k', '$30k+', 'Not sure yet'];

/* ------------------------------------------------------------------ */

const Field: React.FC<{
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, htmlFor, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="eyebrow mb-1.5 block">
      {label}
    </label>
    {children}
  </div>
);

const fieldStyle: React.CSSProperties = {
  background: 'var(--field)',
  border: '1px solid var(--field-border)',
  color: 'var(--fg)',
};

const inputClass =
  'w-full rounded-[var(--radius-sm)] px-3 py-2.5 text-[13px] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-subtle focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]';

/* ------------------------------------------------------------------ */

const DirectLine: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  quip: string;
}> = ({ icon: Icon, label, value, href, external, quip }) => {
  const { sound } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 0.9, quip });
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (sound) soundFx.playHoverSound();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the link still works */
    }
  };

  return (
    <div
      ref={ref}
      {...linkProps}
      className="group flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5"
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
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="min-w-0 flex-1"
      >
        <span className="eyebrow block" style={{ fontSize: 8.5 }}>
          {label}
        </span>
        <span className="block truncate text-[12px] font-semibold text-fg">{value}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-subtle opacity-0 transition-all duration-200 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
        style={{ background: 'color-mix(in srgb, var(--fg) 6%, transparent)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span key="ok" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Check className="h-3.5 w-3.5" style={{ color: 'var(--accent-strong)' }} />
            </motion.span>
          ) : (
            <motion.span key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Copy className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const ContactPanel: React.FC = () => {
  const { sound, bus } = useStudio();
  const submit = useCompanionLink({ weight: 1, quip: 'Send it over — we reply within two hours.' });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: SERVICES_LIST[0].title,
    budget: BUDGETS[1],
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const getMailtoUrl = (data: typeof form) => {
    const subject = encodeURIComponent(`New Project Brief: ${data.service} - ${data.name}`);
    const bodyText =
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || 'Not provided'}\n` +
      `Service Needed: ${data.service}\n` +
      `Budget: ${data.budget}\n\n` +
      `Project Details:\n${data.message}`;
    return `mailto:hundefra@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    if (sound) soundFx.playClickChime();

    const mailtoUrl = getMailtoUrl(form);

    // Attempt to dispatch via FormSubmit backend API to hundefra@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/hundefra@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || 'Not provided',
          service: form.service,
          budget: form.budget,
          message: form.message,
          _subject: `New Project Brief: ${form.service} - ${form.name}`,
        }),
      });
    } catch {
      /* fallback to mailto if offline or network error */
    }

    // Trigger local mail app draft opening as secondary fail-safe
    window.location.href = mailtoUrl;

    bus.react({ kind: 'cheer' });
    bus.say(`Got it, ${form.name.split(' ')[0] || 'friend'} — that is on its way to hundefra@gmail.com.`, {
      priority: 5,
      ttl: 6000,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <StagePanel
      index={3}
      side="right"
      wide
      eyebrow="Contact"
      title="Tell us what you're building"
      intro="Share the shape of the problem and you'll hear back from Hundefra directly, usually within two hours."
    >
      {/* The email column is widened deliberately — a truncated address is
          worse than an uneven grid. */}
      <div className="grid grid-cols-1 gap-2 @md:grid-cols-[1fr_1.45fr_1fr]">
        <DirectLine
          icon={Phone}
          label="Phone"
          value={FOUNDER_INFO.phone}
          href={`tel:${FOUNDER_INFO.phone}`}
          quip="Call if it is urgent."
        />
        <DirectLine
          icon={Mail}
          label="Email"
          value={FOUNDER_INFO.email}
          href={`mailto:${FOUNDER_INFO.email}`}
          quip="Email works best for detailed briefs."
        />
        <DirectLine
          icon={Send}
          label="Telegram"
          value={FOUNDER_INFO.telegram}
          href={`https://t.me/${FOUNDER_INFO.telegram.replace('@', '')}`}
          external
          quip="Telegram gets the fastest reply."
        />
      </div>

      <span className="my-5 block h-px" style={{ background: 'var(--hairline)' }} />

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="rounded-[var(--radius-lg)] px-5 py-8 text-center"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--hairline)' }}
          >
            <motion.span
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.08 }}
              className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-md)' }}
            >
              <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--accent-strong)' }} />
            </motion.span>
            <h3 className="font-display text-[1.3rem] font-bold tracking-[-0.03em] text-fg">
              Brief sent to hundefra@gmail.com
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
              Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. Your brief has been dispatched to{' '}
              <span style={{ color: 'var(--accent-strong)' }}>hundefra@gmail.com</span>. Hundefra will read this
              personally and reply to{' '}
              <span style={{ color: 'var(--accent-strong)' }}>{form.email || 'your inbox'}</span>{' '}
              within two hours.
            </p>
            {form.phone && (
              <p className="mt-2 text-[11.5px] text-subtle">
                Phone provided: <span className="font-medium text-fg">{form.phone}</span>
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={getMailtoUrl(form)}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-fg"
                style={{ background: 'var(--bg)', border: '1px solid var(--hairline)' }}
              >
                Open in Email app
              </a>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-subtle hover:text-fg"
                style={{ background: 'var(--bg)', border: '1px solid var(--hairline)' }}
              >
                Send another brief
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="grid grid-cols-1 gap-3.5 @md:grid-cols-2"
          >
            <Field label="Your name" htmlFor="c-name">
              <input
                id="c-name"
                required
                autoComplete="name"
                placeholder="Abebe Kebede"
                value={form.name}
                onChange={set('name')}
                className={inputClass}
                style={fieldStyle}
              />
            </Field>

            <Field label="Email" htmlFor="c-email">
              <input
                id="c-email"
                type="email"
                required
                autoComplete="email"
                placeholder="abebe@gmail.com"
                value={form.email}
                onChange={set('email')}
                className={inputClass}
                style={fieldStyle}
              />
            </Field>

            <Field label="Phone number (optional)" htmlFor="c-phone">
              <input
                id="c-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+251 91 234 5678"
                value={form.phone}
                onChange={set('phone')}
                className={inputClass}
                style={fieldStyle}
              />
            </Field>

            <Field label="What do you need" htmlFor="c-service">
              <select
                id="c-service"
                value={form.service}
                onChange={set('service')}
                className={`${inputClass} cursor-pointer appearance-none`}
                style={fieldStyle}
              >
                {SERVICES_LIST.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Budget range" htmlFor="c-budget" className="@md:col-span-2">
              <select
                id="c-budget"
                value={form.budget}
                onChange={set('budget')}
                className={`${inputClass} cursor-pointer appearance-none`}
                style={fieldStyle}
              >
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Project details" htmlFor="c-message" className="@md:col-span-2">
              <textarea
                id="c-message"
                required
                rows={4}
                placeholder="What are you building, who is it for, and when does it need to ship?"
                value={form.message}
                onChange={set('message')}
                className={`${inputClass} resize-none`}
                style={fieldStyle}
              />
            </Field>

            <div className="@md:col-span-2">
              <motion.button
                ref={submit.ref}
                {...submit.linkProps}
                type="submit"
                disabled={sending}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                className="group flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold disabled:opacity-70"
                style={{
                  background: 'var(--action-bg)',
                  color: 'var(--action-fg)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending brief...
                  </>
                ) : (
                  <>
                    Send brief
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div
        className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4"
        style={{ borderColor: 'var(--hairline)' }}
      >
        {[
          { icon: Clock, label: 'Replies within 2 hours' },
          { icon: ShieldCheck, label: 'NDA on request' },
          { icon: CheckCircle2, label: 'Fixed-scope options' },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-subtle">
            <Icon className="h-3.5 w-3.5" style={{ color: 'var(--accent-strong)' }} />
            {label}
          </span>
        ))}
      </div>
    </StagePanel>
  );
};
