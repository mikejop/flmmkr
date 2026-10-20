'use client';

import { useEffect, useRef, useState } from 'react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { BR_STATES, maskPhone, validatePrisma2Lead } from '@/utils/prisma2Lead';

const DMG_URL = 'https://pub-6bdc7bd5cb4646358136c4989f36d812.r2.dev/PRISMA-2.dmg';
const TURNSTILE_ON = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

const field =
  'w-full h-12 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/20';
const label = 'mb-1.5 block text-[13px] font-medium text-[#6e6e73]';

export default function Prisma2DownloadModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', state: '', city: '', website: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
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

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: key === 'phone' ? maskPhone(e.target.value) : e.target.value }));

  const startDownload = () => {
    const a = document.createElement('a');
    a.href = DMG_URL;
    a.download = 'PRISMA-2.dmg';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const checked = validatePrisma2Lead(form);
    if (!checked.ok) return setError(checked.error);
    if (TURNSTILE_ON && !turnstileToken) return setError('Aguarde a verificação de segurança terminar.');
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/prisma2/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Não foi possível concluir agora. Tente novamente.');
        setTurnstileReset((n) => n + 1);
        return;
      }
      setDone(true);
      startDownload();
    } catch {
      setError('Sem conexão. Verifique a internet e tente de novo.');
      setTurnstileReset((n) => n + 1);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="prisma2-modal-title">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#f5f5f7] p-6 shadow-2xl sm:max-w-[520px] sm:rounded-[28px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8ed] text-[#6e6e73] transition hover:bg-[#d2d2d7]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
        </button>

        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#30d158]/15 text-[#248a3d]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <h2 id="prisma2-modal-title" className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Download iniciado</h2>
            <p className="mx-auto mt-2 max-w-sm text-[17px] leading-snug text-[#6e6e73]">
              Quando terminar, abra o arquivo e siga o passo a passo desta página para liberar o app no Mac.
            </p>
            <a href={DMG_URL} download rel="noopener" className="mt-6 inline-block text-[17px] text-[#0066cc] hover:underline">
              O download não começou? Baixar de novo
            </a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="prisma2-modal-title" className="pr-10 text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Baixar o PRISMA 2</h2>
            <p className="mt-1 text-[15px] text-[#6e6e73]">Preencha seus dados para liberar o download. Campos com * são obrigatórios.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="p2-first" className={label}>Nome *</label>
                <input ref={firstRef} id="p2-first" className={field} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" maxLength={60} required />
              </div>
              <div>
                <label htmlFor="p2-last" className={label}>Sobrenome *</label>
                <input id="p2-last" className={field} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" maxLength={80} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p2-company" className={label}>Empresa (opcional)</label>
                <input id="p2-company" className={field} value={form.company} onChange={set('company')} autoComplete="organization" maxLength={120} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p2-email" className={label}>E-mail *</label>
                <input id="p2-email" type="email" inputMode="email" className={field} value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p2-phone" className={label}>Telefone *</label>
                <input id="p2-phone" type="tel" inputMode="numeric" placeholder="(00) 00000-0000" className={field} value={form.phone} onChange={set('phone')} autoComplete="tel-national" maxLength={15} required />
              </div>
              <div>
                <label htmlFor="p2-state" className={label}>Estado *</label>
                <select id="p2-state" className={`${field} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%2386868b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")" }} value={form.state} onChange={set('state')} autoComplete="address-level1" required>
                  <option value="">Selecione</option>
                  {BR_STATES.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p2-city" className={label}>Cidade *</label>
                <input id="p2-city" className={field} value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={80} required />
              </div>
            </div>

            {/* Campo-isca: invisível para pessoas, robôs costumam preencher. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="p2-website">Site</label>
              <input id="p2-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>

            <div className="mt-5">
              <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-[15px] text-[#d70015]">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-5 h-12 w-full rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition hover:bg-[#0077ed] active:bg-[#006edb] disabled:cursor-wait disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Baixar o programa'}
            </button>
            <p className="mt-4 text-center text-[12px] leading-snug text-[#86868b]">
              Usamos seus dados apenas para contato sobre o PRISMA 2. Veja a{' '}
              <a href="/privacidade" className="text-[#0066cc] hover:underline">Política de Privacidade</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
