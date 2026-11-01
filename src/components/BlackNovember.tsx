'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { maskPhone } from '@/utils/prisma2Lead';
import { validateBlackNovemberLead } from '@/utils/blackNovemberLead';
import styles from './BlackNovember.module.css';

/** Amarelo quase laranja (mais amarelo que laranja). */
export const BN_YELLOW = '#FFC21A';
const BN_RED = '#E3262E';

export const BN_REGULAR_PRICE = 195;
export const BN_PRICE = 95;
export const BN_PERCENT_OFF = Math.round((1 - BN_PRICE / BN_REGULAR_PRICE) * 100); // 51
export const BN_MINUTES = 7;
const PLUGINS_TEXT = 'Você também terá acesso aos plugins da FLMMKR, inclusive os que estão em Close Beta.';

const AUTO_CLOSE_MS = 5000;
// Área girada do fundo: inset -60% = 2,2x a tela (mesmo valor de .tilt no CSS)
const TILT_SCALE = 2.2;
const FADE_MS = 600;
const VIDEO_ID = 'gp75L5H0kIU'; // mesmo vídeo da seção "PROJETO DO MASTERCLASS"

/**
 * Hora do servidor no navegador: a página recebe a hora do servidor e guarda só a diferença para o relógio local.
 * Mudar o relógio do computador não muda a contagem (a diferença compensa) e o preço é sempre decidido no servidor.
 */
export function useServerNow(serverOffsetMs: number | null): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (serverOffsetMs === null) return;
    const tick = () => setNow(Date.now() + serverOffsetMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [serverOffsetMs]);
  return now;
}

const pad = (n: number) => n.toString().padStart(2, '0');

function splitCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "30/10 às 12:30" no horário de Brasília. */
export function formatStart(startsAtMs: number) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(startsAtMs));
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return `${get('day')}/${get('month')} às ${get('hour')}:${get('minute')}`;
}

function CountdownBlocks({ ms, size = 'lg' }: { ms: number; size?: 'lg' | 'sm' }) {
  const { days, hours, minutes, seconds } = splitCountdown(ms);
  const units = [
    ...(days > 0 ? [{ v: days, l: days === 1 ? 'dia' : 'dias' }] : []),
    { v: hours, l: 'h' },
    { v: minutes, l: 'min' },
    { v: seconds, l: 's' },
  ];
  const num = size === 'lg' ? 'text-[40px] sm:text-[56px]' : 'text-xl sm:text-2xl';
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-3 font-mono tabular-nums" role="timer" aria-live="off">
      {units.map((u, i) => (
        <React.Fragment key={u.l}>
          {i > 0 && <span className={`${num} font-bold text-white/30 leading-none`}>:</span>}
          <div className="flex flex-col items-center">
            <span className={`${num} font-bold text-white leading-none`}>{pad(u.v)}</span>
            <span className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white/50 font-sans">{u.l}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Quantas linhas e quantas vezes "BLACK NOVEMBER" por linha para o fundo cobrir a tela inteira desde o primeiro quadro.
 * A trilha tem duas cópias iguais e anda uma cópia por volta: com cada cópia mais alta que a área girada, nunca sobra vazio.
 */
function backdropGrid() {
  const w = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const h = typeof window === 'undefined' ? 900 : window.innerHeight;
  const fontSize = Math.min(150, Math.max(64, w * 0.11)); // mesmo clamp de .row no CSS
  const rows = Math.ceil((TILT_SCALE * h) / (fontSize * 0.92)) + 2;
  // "BLACK NOVEMBER " na Molde Expanded mede ~13em; +1 por causa do deslocamento das linhas pares
  const repeats = Math.max(3, Math.ceil((TILT_SCALE * w) / (fontSize * 13)) + 1);
  return { rows: rows % 2 === 0 ? rows : rows + 1, repeats };
}

type Stage =
  | { kind: 'soon'; startsAtMs: number; now: number }
  | { kind: 'live'; remainingSeconds: number };

/** Formulário de inscrição para ser avisado do início (grava em black_november_leads). */
function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateBlackNovemberLead({ name, email, phone });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/black-november/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, website, turnstileToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível concluir agora.');
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Não foi possível concluir agora.');
      setTurnstileReset((n) => n + 1);
    }
  };

  if (status === 'done') {
    return (
      <p className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white">
        Pronto! Você vai receber o aviso assim que a Black November começar.
      </p>
    );
  }

  const input = 'w-full rounded-xl bg-white/10 border border-white/15 px-3.5 py-2.5 text-[15px] text-white placeholder:text-white/40 outline-none focus:border-[#FFC21A]';
  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 text-left" noValidate>
      <input className={input} placeholder="Seu nome" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      <input className={input} placeholder="Seu e-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
      <input className={input} placeholder="WhatsApp (opcional)" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
      {/* Campo-isca: invisível para pessoas */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
      {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 w-full rounded-full py-3 text-[15px] font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-60"
        style={{ background: BN_YELLOW }}
      >
        {status === 'sending' ? 'Enviando…' : 'Me avise quando começar'}
      </button>
    </form>
  );
}

/**
 * Modal de alerta da Black November. Abre ao carregar a página e some sozinho em 5 s (com fade),
 * ou antes ao clicar fora ou no X. Se a pessoa interagir com o modal (tocar, clicar, digitar), ele fica aberto.
 * Durante a campanha ele aparece sem cronômetro (o tempo da pessoa fica no aviso da página).
 */
export function BlackNovemberModal({ stage, active, onClose, onBuy, buyLabel }: {
  stage: Stage;
  /** false enquanto o preloader ainda cobre a tela: os 5 s só começam a contar quando o anúncio fica visível. */
  active: boolean;
  onClose: () => void;
  onBuy: () => void;
  /** Texto do botão quando há cupom aplicado (ex.: "Garantir Acesso com o cupom WESLEY"). */
  buyLabel?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [grid, setGrid] = useState(backdropGrid);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactedRef = useRef(false);
  const closingRef = useRef(false);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setVisible(false);
    setTimeout(onClose, FADE_MS);
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    const onResize = () => setGrid(backdropGrid());
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!active || interactedRef.current) return;
    autoCloseRef.current = setTimeout(() => closeRef.current(), AUTO_CLOSE_MS);
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [active]);

  const keepOpen = () => {
    interactedRef.current = true;
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  };

  const rows = Array.from({ length: grid.rows }, (_, i) => i);
  const line = Array.from({ length: grid.repeats }, () => 'BLACK NOVEMBER').join(' ');

  return (
    <div
      className={`${styles.backdrop} ${visible ? '' : styles.backdropHidden}`}
      style={{ ['--bn-yellow' as string]: BN_YELLOW }}
      onClick={close}
      role="presentation"
    >
      <div className={styles.tilt} aria-hidden="true">
        <div className={styles.track}>
          {[...rows, ...rows].map((i, idx) => (
            <div key={idx} className={styles.row}>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bn-title"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={keepOpen}
          onFocus={keepOpen}
          className={`relative w-full max-w-[460px] max-h-[92vh] overflow-y-auto rounded-[22px] bg-black text-white text-center shadow-[0_30px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/15 px-5 sm:px-8 pt-8 pb-6 transition-transform duration-500 ${visible ? 'scale-100' : 'scale-95'}`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-[11px] sm:text-xs tracking-[0.32em] uppercase text-white/80">Color Master® | Produtos</p>

          <div className="relative mt-4 mb-5">
            <h2 id="bn-title" className={`${styles.modalTitle} text-[54px] sm:text-[68px]`}>
              Black
              <br />
              <span className="text-[39px] sm:text-[49px]">November</span>
            </h2>
            <div className={`${styles.strip} absolute left-[-6%] right-[-6%] top-[44%] py-1 text-[11px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-white`} style={{ background: BN_RED }}>
              De R$ {BN_REGULAR_PRICE} por R$ {BN_PRICE} • {BN_PERCENT_OFF}% OFF
            </div>
          </div>

          {stage.kind === 'soon' ? (
            <>
              <p className="mb-2 text-xs sm:text-sm uppercase tracking-[0.28em] text-white/70">Está chegando</p>
              <CountdownBlocks ms={stage.startsAtMs - stage.now} />
              <div className="mt-4 inline-block border px-4 py-1.5 text-sm sm:text-base uppercase tracking-[0.14em]" style={{ borderColor: BN_RED }}>
                Começa {formatStart(stage.startsAtMs)}
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-xs sm:text-sm uppercase tracking-[0.28em]" style={{ color: BN_YELLOW }}>Começou!</p>
              <div className="inline-block border px-4 py-1.5 text-sm sm:text-base uppercase tracking-[0.14em]" style={{ borderColor: BN_RED }}>
                Até 30/11 às 23:59
              </div>
            </>
          )}

          <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl bg-white/5">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${VIDEO_ID}&playsinline=1&rel=0&modestbranding=1`}
              title="Projeto do Masterclass Color Master"
              allow="autoplay; encrypted-media; picture-in-picture"
              className="h-full w-full pointer-events-none"
            />
          </div>

          <p className="mt-5 text-[15px] leading-snug text-white/85">
            O Color Master Produtos sai de <span className="line-through text-white/50">R$ {BN_REGULAR_PRICE}</span> por{' '}
            <strong className="text-white">R$ {BN_PRICE}</strong> ({BN_PERCENT_OFF}% OFF).{' '}
            {stage.kind === 'soon'
              ? `Quando a promoção começar, você vai ter só ${BN_MINUTES} minutos para aproveitar.`
              : `Você tem só ${BN_MINUTES} minutos para aproveitar. Clicou em comprar, o tempo para e o preço fica garantido.`}
          </p>
          <p className="mt-2 text-[14px] leading-snug text-white/85">{PLUGINS_TEXT}</p>

          <div className="mt-5">
            {stage.kind === 'live' ? (
              <button
                type="button"
                onClick={() => {
                  onBuy();
                  close();
                }}
                className="w-full rounded-full py-3 text-[15px] font-bold text-black transition-transform active:scale-[0.98]"
                style={{ background: BN_YELLOW }}
              >
                {buyLabel ?? `Garantir por R$ ${BN_PRICE}`}
              </button>
            ) : showForm ? (
              <SignupForm />
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full rounded-full py-3 text-[15px] font-bold text-black transition-transform active:scale-[0.98]"
                style={{ background: BN_YELLOW }}
              >
                Quero ser avisado e não perder
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Aviso da Black November dentro da landing: preço de/por e o cronômetro (até o início, ou os 7 min da pessoa). */
export function BlackNovemberNotice({ stage, isClaimed, onBuy, buyLabel }: { stage: Stage; isClaimed: boolean; onBuy: () => void; buyLabel?: string | null }) {
  return (
    <div className={`w-full max-w-3xl mx-auto mb-6 sm:mb-8 rounded-2xl bg-black/80 ${styles.noticeIn} backdrop-blur-xl ring-1 ring-white/15 px-4 py-4 sm:px-6 sm:py-5 text-white shadow-2xl`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="text-center sm:text-left">
          <p className={`${styles.modalTitle} text-[26px] sm:text-[30px]`} style={{ ['--bn-yellow' as string]: BN_YELLOW }}>Black November</p>
          <p className="mt-1 text-sm text-white/80">
            De <span className="line-through text-white/50">R$ {BN_REGULAR_PRICE}</span> por{' '}
            <strong className="text-white text-base">R$ {BN_PRICE}</strong>{' '}
            <span className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: BN_RED }}>{BN_PERCENT_OFF}% OFF</span>
          </p>
          <p className="mt-1 text-xs text-white/60">
            {stage.kind === 'soon'
              ? `Começa ${formatStart(stage.startsAtMs)} (Brasília). Cada pessoa terá ${BN_MINUTES} minutos.`
              : isClaimed
                ? `Seu preço de R$ ${BN_PRICE} está garantido.`
                : `Você tem ${BN_MINUTES} minutos para garantir este preço.`}
          </p>
          <p className="mt-1 text-xs text-white/60">{PLUGINS_TEXT}</p>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">
            {stage.kind === 'soon' ? 'Começa em' : isClaimed ? 'Tempo parado' : 'Seu tempo'}
          </span>
          <CountdownBlocks ms={stage.kind === 'soon' ? stage.startsAtMs - stage.now : stage.remainingSeconds * 1000} size="sm" />
          {stage.kind === 'live' && (
            <button
              type="button"
              onClick={onBuy}
              className="mt-1 rounded-full px-5 py-2 text-sm font-bold text-black active:scale-95"
              style={{ background: BN_YELLOW }}
            >
              {buyLabel ?? `Garantir por R$ ${BN_PRICE}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Stage as BlackNovemberStage };
