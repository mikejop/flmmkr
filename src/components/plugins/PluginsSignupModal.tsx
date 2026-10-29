'use client';

import { useEffect, useRef, useState } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { isValidEmail, validatePrisma2Lead, type Prisma2LeadField } from '@/utils/prisma2Lead';
import { PLUGIN_DOWNLOADS, type PluginOs } from '@/config/plugins';
import { OS_ICON } from '@/components/plugins/os';
import { maskEmail } from '@/utils/donation';
import MarketingConsent from '@/components/plugins/MarketingConsent';
import { usePluginsI18n } from '@/components/plugins/i18n/context';

const TURNSTILE_ON = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const OS_LIST = Object.keys(PLUGIN_DOWNLOADS) as PluginOs[];

type Field = Extract<Prisma2LeadField, 'firstName' | 'lastName' | 'email'> | 'os';

const field =
  'w-full h-12 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/20 aria-[invalid=true]:border-[#ff3b30] aria-[invalid=true]:focus:ring-[#ff3b30]/20';
const label = 'mb-1.5 block text-[13px] font-medium text-[#6e6e73]';

export default function PluginsSignupModal({
  initialOs,
  onClose,
  onRegistered,
}: {
  initialOs: PluginOs | null;
  onClose: () => void;
  onRegistered: (os: PluginOs) => void;
}) {
  const { t } = usePluginsI18n();
  const MESSAGES: Record<Field, string> = t.errors;
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', website: '' });
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [os, setOs] = useState<PluginOs | null>(initialOs);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [doneOs, setDoneOs] = useState<PluginOs | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: key === 'email' ? maskEmail(e.target.value) : e.target.value }));
    if (key in fieldError) setFieldError((fe) => ({ ...fe, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const checked = validatePrisma2Lead(form);
    if (!checked.ok) {
      const f = checked.field as Field;
      setError('');
      setFieldError({ [f]: MESSAGES[f] ?? t.errors.check });
      document.getElementById(`pl-${f}`)?.focus();
      return;
    }
    if (!os) {
      setFieldError({ os: MESSAGES.os });
      return;
    }
    if (TURNSTILE_ON && !turnstileToken) return setError(t.errors.wait);
    setError('');
    setFieldError({});
    setSending(true);
    try {
      const res = await fetch('/api/plugins/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, os, marketingOptIn, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; field?: Field };
      if (!res.ok || !data.ok) {
        if (res.status === 400 && data.field) setFieldError({ [data.field]: MESSAGES[data.field] ?? t.errors.check });
        else setError(res.status === 429 ? t.errors.tooMany : t.errors.generic);
        setTurnstileReset((n) => n + 1);
        return;
      }
      setDoneOs(os);
      onRegistered(os);
    } catch {
      setError(t.errors.network);
      setTurnstileReset((n) => n + 1);
    } finally {
      setSending(false);
    }
  };

  const err = (f: Field) =>
    fieldError[f] ? <p id={`pl-${f}-err`} role="alert" className="mt-1.5 text-[13px] text-[#d70015]">{fieldError[f]}</p> : null;
  const inv = (f: Field) => ({ 'aria-invalid': fieldError[f] ? true : undefined, 'aria-describedby': fieldError[f] ? `pl-${f}-err` : undefined });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="plugins-modal-title">
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#f5f5f7] p-6 shadow-2xl sm:max-w-[520px] sm:rounded-[28px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8ed] text-[#6e6e73] transition hover:bg-[#d2d2d7]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
        </button>

        {doneOs ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#30d158]/15 text-[#248a3d]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <h2 id="plugins-modal-title" className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{t.signup.doneTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-[17px] leading-snug text-[#6e6e73]">
              {t.signup.doneText(PLUGIN_DOWNLOADS[doneOs].file)}
            </p>
            <a href={PLUGIN_DOWNLOADS[doneOs].url} download rel="noopener" className="mt-6 inline-block text-[17px] text-[#0066cc] hover:underline">
              {t.signup.retry}
            </a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="plugins-modal-title" className="pe-10 text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{t.signup.title}</h2>
            <p className="mt-1 text-[15px] text-[#6e6e73]">{t.signup.text}</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pl-firstName" className={label}>{t.signup.firstName}</label>
                <input ref={firstRef} id="pl-firstName" className={field} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" maxLength={60} required {...inv('firstName')} />
                {err('firstName')}
              </div>
              <div>
                <label htmlFor="pl-lastName" className={label}>{t.signup.lastName}</label>
                <input id="pl-lastName" className={field} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" maxLength={80} required {...inv('lastName')} />
                {err('lastName')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pl-email" className={label}>{t.signup.email}</label>
                <input
                  id="pl-email"
                  type="email"
                  inputMode="email"
                  className={field}
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() => form.email.trim() && !isValidEmail(form.email) && setFieldError((fe) => ({ ...fe, email: MESSAGES.email }))}
                  autoComplete="email"
                  maxLength={254}
                  required
                  {...inv('email')}
                />
                {err('email')}
              </div>
              <fieldset className="sm:col-span-2">
                <legend className={label}>{t.signup.os}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {OS_LIST.map((key) => {
                    const Icon = OS_ICON[key];
                    const active = os === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => { setOs(key); setFieldError((fe) => ({ ...fe, os: undefined })); }}
                        className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[13px] font-medium transition ${
                          active ? 'border-[#0071e3] bg-[#0071e3]/8 text-[#0071e3] ring-4 ring-[#0071e3]/15' : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {PLUGIN_DOWNLOADS[key].label}
                      </button>
                    );
                  })}
                </div>
                {err('os')}
              </fieldset>
            </div>

            {/* Campo-isca: invisível para pessoas, robôs costumam preencher. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="pl-website">Site</label>
              <input id="pl-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>

            <div className="mt-5">
              <MarketingConsent id="pl-marketing" checked={marketingOptIn} onChange={setMarketingOptIn} />
            </div>

            <div className="mt-5">
              <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
            </div>

            {error && <p role="alert" className="mt-3 rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-[15px] text-[#d70015]">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="mt-5 h-12 w-full rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition hover:bg-[#0077ed] active:bg-[#006edb] disabled:cursor-wait disabled:opacity-60"
            >
              {sending ? t.signup.sending : os ? t.signup.submitFor(PLUGIN_DOWNLOADS[os].label) : t.signup.submit}
            </button>
            <p className="mt-4 text-center text-[12px] leading-snug text-[#86868b]">
              {t.signup.agreeBefore}{' '}
              <a href="/plugins/termos" target="_blank" rel="noopener" className="text-[#0066cc] hover:underline">{t.footer.terms}</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
