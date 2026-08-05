import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle, ArrowRight, Check, CheckCircle2, Clock, Coins, Copy, Globe, Loader2, Mail, Phone, Send, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { FOUNDER_INFO, SERVICES_LIST } from '../data/companyData';
import { StagePanel } from './StagePanel';
import { soundFx } from '../utils/audio';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  ranges: string[];
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'USD - US Dollar ($)',
    ranges: ['Under $5,000', '$5,000 – $15,000', '$15,000 – $30,000', '$30,000+', 'Not sure yet'],
  },
  {
    code: 'ETB',
    symbol: 'Br',
    name: 'ETB - Ethiopian Birr (Br)',
    ranges: ['Under 250,000 ETB', '250,000 – 750,000 ETB', '750,000 – 1,500,000 ETB', '1,500,000+ ETB', 'Not sure yet'],
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'EUR - Euro (€)',
    ranges: ['Under €5,000', '€5,000 – €15,000', '€15,000 – €30,000', '€30,000+', 'Not sure yet'],
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'GBP - British Pound (£)',
    ranges: ['Under £4,000', '£4,000 – £12,000', '£12,000 – £25,000', '£25,000+', 'Not sure yet'],
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'CAD - Canadian Dollar (C$)',
    ranges: ['Under C$6,000', 'C$6,000 – C$20,000', 'C$20,000 – C$40,000', 'C$40,000+', 'Not sure yet'],
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'AUD - Australian Dollar (A$)',
    ranges: ['Under A$7,000', 'A$7,000 – A$20,000', 'A$20,000 – A$45,000', 'A$45,000+', 'Not sure yet'],
  },
  {
    code: 'AED',
    symbol: 'AED',
    name: 'AED - UAE Dirham (AED)',
    ranges: ['Under 20,000 AED', '20,000 – 60,000 AED', '60,000 – 120,000 AED', '120,000+ AED', 'Not sure yet'],
  },
  {
    code: 'SAR',
    symbol: 'SAR',
    name: 'SAR - Saudi Riyal (SAR)',
    ranges: ['Under 20,000 SAR', '20,000 – 60,000 SAR', '60,000 – 120,000 SAR', '120,000+ SAR', 'Not sure yet'],
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'INR - Indian Rupee (₹)',
    ranges: ['Under ₹400,000', '₹400,000 – ₹1,200,000', '₹1,200,000 – ₹2,500,000', '₹2,500,000+', 'Not sure yet'],
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'JPY - Japanese Yen (¥)',
    ranges: ['Under ¥700,000', '¥700,000 – ¥2,000,000', '¥2,000,000 – ¥4,500,000', '¥4,500,000+', 'Not sure yet'],
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'CHF - Swiss Franc (CHF)',
    ranges: ['Under CHF 5,000', 'CHF 5,000 – 15,000', 'CHF 15,000 – 30,000', 'CHF 30,000+', 'Not sure yet'],
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'CNY - Chinese Yuan (¥)',
    ranges: ['Under ¥35,000', '¥35,000 – ¥100,000', '¥100,000 – ¥200,000', '¥200,000+', 'Not sure yet'],
  },
];

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
    currency: 'USD',
    budget: CURRENCY_OPTIONS[0].ranges[1],
    message: '',
    botcheck: '',
  });

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const currencyObj = CURRENCY_OPTIONS.find((c) => c.code === selectedCode) || CURRENCY_OPTIONS[0];
    setForm((f) => ({
      ...f,
      currency: selectedCode,
      budget: currencyObj.ranges[1] || currencyObj.ranges[0],
    }));
  };

  const getMailtoUrl = (data: typeof form) => {
    const subject = encodeURIComponent(`New Project Brief: ${data.service} - ${data.name}`);
    const bodyText =
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || 'Not provided'}\n` +
      `Service Needed: ${data.service}\n` +
      `Currency: ${data.currency}\n` +
      `Budget Range: ${data.budget}\n\n` +
      `Project Details:\n${data.message}`;
    return `mailto:hundefra@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg(null);

    if (sound) soundFx.playClickChime();

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      const missingKeyErr =
        'Web3Forms access key is missing. Please set VITE_WEB3FORMS_ACCESS_KEY in your environment variables (.env.local).';
      setErrorMsg(missingKeyErr);
      setSending(false);
      return;
    }

    try {
      const payload = {
        access_key: accessKey,
        subject: `New Project Brief: ${form.service} - ${form.name}`,
        from_name: form.name,
        name: form.name,
        email: form.email,
        phone: form.phone || 'Not provided',
        service: form.service,
        currency: form.currency,
        budget: `${form.budget} (${form.currency})`,
        message: form.message,
        botcheck: form.botcheck,
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSending(false);
        setSent(true);
        bus.react({ kind: 'cheer' });
        bus.say(
          `Got it, ${form.name.split(' ')[0] || 'friend'} — your brief was successfully sent via Web3Forms!`,
          {
            priority: 5,
            ttl: 6000,
          }
        );
      } else {
        const errorText = data.message || 'Web3Forms submission failed. Please try again.';
        setErrorMsg(errorText);
        setSending(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error encountered while submitting to Web3Forms.';
      setErrorMsg(message);
      setSending(false);
    }
  };

  const selectedCurrencyObj =
    CURRENCY_OPTIONS.find((c) => c.code === form.currency) || CURRENCY_OPTIONS[0];

  return (
    <StagePanel
      index={3}
      side="right"
      wide
      eyebrow="Contact"
      title="Tell us what you're building"
      intro="Share the shape of the problem and you'll hear back from Hundefra directly, usually within two hours."
    >
      {/* Direct Contact Lines */}
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
              Brief Sent Successfully via Web3Forms!
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
              Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}! Your brief has been submitted to Web3Forms and dispatched to Hundefra. We will review your details and reply to{' '}
              <span style={{ color: 'var(--accent-strong)' }}>{form.email}</span> within two hours.
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-[var(--radius-sm)] p-3 text-left text-[11.5px] space-y-1.5" style={{ background: 'var(--bg)', border: '1px solid var(--hairline)' }}>
              <div><span className="text-subtle font-medium">Service:</span> <span className="text-fg">{form.service}</span></div>
              <div><span className="text-subtle font-medium">Budget:</span> <span className="text-fg">{form.budget} ({form.currency})</span></div>
              {form.phone && <div><span className="text-subtle font-medium">Phone:</span> <span className="text-fg">{form.phone}</span></div>}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setErrorMsg(null);
                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-fg"
                style={{ background: 'var(--bg)', border: '1px solid var(--hairline)' }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Send another brief
              </button>
              <a
                href={getMailtoUrl(form)}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-subtle hover:text-fg"
                style={{ background: 'var(--bg)', border: '1px solid var(--hairline)' }}
              >
                Open email backup
              </a>
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
            {/* Honeypot for Web3Forms anti-spam */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: 'none' }}
              value={form.botcheck}
              onChange={set('botcheck')}
            />

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

            {/* Currency & Budget selection */}
            <Field label="Currency" htmlFor="c-currency">
              <select
                id="c-currency"
                value={form.currency}
                onChange={handleCurrencyChange}
                className={`${inputClass} cursor-pointer appearance-none`}
                style={fieldStyle}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Budget range (${selectedCurrencyObj.symbol})`} htmlFor="c-budget">
              <select
                id="c-budget"
                value={form.budget}
                onChange={set('budget')}
                className={`${inputClass} cursor-pointer appearance-none`}
                style={fieldStyle}
              >
                {selectedCurrencyObj.ranges.map((b) => (
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

            {/* Error indicator banner if submission fails */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="@md:col-span-2 rounded-[var(--radius-sm)] p-3 text-[12px] flex items-start gap-2.5"
                style={{
                  background: 'color-mix(in srgb, #ef4444 12%, transparent)',
                  border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
                  color: 'var(--fg)',
                }}
              >
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-500">Submission Error</div>
                  <div className="mt-0.5 text-muted">{errorMsg}</div>
                  <a
                    href={getMailtoUrl(form)}
                    className="inline-block mt-2 font-medium text-[11.5px] text-accent underline hover:opacity-80"
                  >
                    Click here to send via Email client fallback &rarr;
                  </a>
                </div>
              </motion.div>
            )}

            <div className="@md:col-span-2">
              <motion.button
                ref={submit.ref}
                {...submit.linkProps}
                type="submit"
                disabled={sending}
                whileHover={{ y: sending ? 0 : -2 }}
                whileTap={{ scale: sending ? 1 : 0.985 }}
                transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                className="group flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-semibold disabled:opacity-75"
                style={{
                  background: 'var(--action-bg)',
                  color: 'var(--action-fg)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                    Submitting brief via Web3Forms...
                  </>
                ) : (
                  <>
                    Send brief via Web3Forms
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
          { icon: Coins, label: 'ETB & Global Currencies' },
          { icon: Globe, label: 'Powered by Web3Forms' },
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
