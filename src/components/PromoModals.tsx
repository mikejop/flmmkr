'use client';

import React, { useEffect, useRef } from 'react';
import { X, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PromoModalsProps {
  warningOpen: boolean;
  onCloseWarning: () => void;
  expiredOpen: boolean;
  onCloseExpired: () => void;
  timeLeft: number;
  promoPrice: number;
  regularPrice: number;
  checkoutUrl: string;
  formatTime: (sec: number) => string;
  onOpenCheckout?: () => void;
}

export const PromoModals: React.FC<PromoModalsProps> = ({
  warningOpen,
  onCloseWarning,
  expiredOpen,
  onCloseExpired,
  timeLeft,
  promoPrice,
  regularPrice,
  checkoutUrl,
  formatTime,
  onOpenCheckout,
}) => {
  const warningOverlayRef = useRef<HTMLDivElement>(null);
  const expiredOverlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (warningOpen) onCloseWarning();
        if (expiredOpen) onCloseExpired();
      }
    };
    if (warningOpen || expiredOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [warningOpen, expiredOpen, onCloseWarning, onCloseExpired]);

  // Lock body scroll when either modal is active
  useEffect(() => {
    if (warningOpen || expiredOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [warningOpen, expiredOpen]);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MODAL DE AVISO: FALTANDO 1 MINUTO E 30 SEGUNDOS                        */}
      {/* ========================================================================= */}
      {warningOpen && (
        <div
          ref={warningOverlayRef}
          onClick={(e) => {
            if (e.target === warningOverlayRef.current) onCloseWarning();
          }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="warning-modal-title"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#161618]/95 backdrop-blur-2xl border border-amber-500/30 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 animate-in zoom-in-95"
            style={{ WebkitBackdropFilter: 'blur(32px)' }}
          >
            {/* Top Specular Rim */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onCloseWarning}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 z-20"
              aria-label="Fechar alerta"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 text-center flex flex-col items-center">
              {/* Urgent Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[12px] font-semibold uppercase tracking-[0.04em] mb-4">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span>Última Chance • Promoção Encerrando</span>
              </div>

              {/* Headline */}
              <h2
                id="warning-modal-title"
                className="text-[24px] sm:text-[30px] font-bold text-white tracking-[-0.015em] leading-[1.18] mb-3 max-w-md mx-auto"
              >
                A promoção vai acabar e não vai voltar tão cedo.
              </h2>

              {/* Description */}
              <p className="text-[15px] sm:text-[16px] text-white/75 leading-[1.5] mb-5 max-w-md mx-auto font-normal">
                Restam menos de 1 minuto e meio para encerrar o lote de abertura do{' '}
                <strong className="text-white font-semibold">Color Master | Produto</strong>. Assim que o tempo zerar, o desconto expira e as condições de mentoria individual serão finalizadas.
              </p>

              {/* Countdown & Price Highlight Card */}
              <div className="w-full rounded-2xl bg-black/50 border border-white/10 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] uppercase tracking-wider text-white/50 block font-semibold">Tempo Restante</span>
                    <span className="text-[20px] sm:text-[22px] font-mono font-bold text-amber-400 tracking-wider">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 w-full sm:w-auto">
                  <span className="text-[12px] text-white/50 line-through block">De R$ {regularPrice}</span>
                  <span className="text-[20px] sm:text-[22px] font-extrabold text-white">
                    Por R$ {promoPrice} <span className="text-[13px] font-normal text-white/70">no Pix</span>
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="w-full flex flex-col gap-2.5">
                {onOpenCheckout ? (
                  <button
                    type="button"
                    onClick={() => {
                      onCloseWarning();
                      onOpenCheckout();
                    }}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[15px] sm:text-base shadow-[0_4px_20px_rgba(0,113,227,0.4)] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    Aproveitar Desconto de R$ {promoPrice} Agora
                  </button>
                ) : (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[15px] sm:text-base shadow-[0_4px_20px_rgba(0,113,227,0.4)] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    Aproveitar Desconto de R$ {promoPrice} Agora
                  </a>
                )}

                <button
                  type="button"
                  onClick={onCloseWarning}
                  className="w-full py-2.5 text-[13px] text-white/50 hover:text-white/80 transition-colors font-medium min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  Continuar na página
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-white/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantia incondicional de 7 dias • Liberação imediata</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL DE EXPIRAÇÃO: TEMPO ACABOU (APENAS VALOR REAL VIGENTE)          */}
      {/* ========================================================================= */}
      {expiredOpen && (
        <div
          ref={expiredOverlayRef}
          onClick={(e) => {
            if (e.target === expiredOverlayRef.current) onCloseExpired();
          }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expired-modal-title"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#161618]/95 backdrop-blur-2xl border border-red-500/30 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8),0_0_40px_rgba(239,68,68,0.15)] overflow-hidden transition-all duration-300 animate-in zoom-in-95"
            style={{ WebkitBackdropFilter: 'blur(32px)' }}
          >
            {/* Top Specular Rim */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onCloseExpired}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 z-20"
              aria-label="Fechar aviso"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 text-center flex flex-col items-center">
              {/* Expired Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[12px] font-semibold uppercase tracking-[0.04em] mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Promoção Encerrada</span>
              </div>

              {/* Headline */}
              <h2
                id="expired-modal-title"
                className="text-[24px] sm:text-[30px] font-bold text-white tracking-[-0.015em] leading-[1.18] mb-3 max-w-md mx-auto"
              >
                A promoção acabou.
              </h2>

              {/* Description */}
              <p className="text-[15px] sm:text-[16px] text-white/75 leading-[1.5] mb-5 max-w-md mx-auto font-normal">
                O período de 15 minutos foi concluído e a condição especial promocional expirou. A partir de agora, o acesso ao{' '}
                <strong className="text-white font-semibold">Color Master | Produto</strong> está disponível exclusivamente pelo seu <strong className="text-white font-semibold">valor real oficial</strong>.
              </p>

              {/* Regular Price Highlight Card */}
              <div className="w-full rounded-2xl bg-black/50 border border-white/10 p-5 mb-6 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] uppercase tracking-wider text-white/50 block font-semibold mb-1">
                  Preço Real Oficial Vigente
                </span>
                <div className="text-[34px] sm:text-[38px] font-extrabold text-white tracking-tight leading-tight">
                  R$ {regularPrice} <span className="text-[16px] font-normal text-white/60">no Pix</span>
                </div>
                <div className="text-[14px] sm:text-[15px] font-semibold text-[#2997ff] mt-1">
                  ou em 12x de R$ 16,25 no cartão
                </div>
                <span className="text-[12px] text-white/50 mt-2 block">
                  1 Ano de Acesso Completo • Footages Inclusos
                </span>
              </div>

              {/* Primary Action Button */}
              <div className="w-full flex flex-col gap-2.5">
                {onOpenCheckout ? (
                  <button
                    type="button"
                    onClick={() => {
                      onCloseExpired();
                      onOpenCheckout();
                    }}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[15px] sm:text-base shadow-[0_4px_20px_rgba(0,113,227,0.4)] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    Comprar pelo Valor Oficial
                  </button>
                ) : (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-[15px] sm:text-base shadow-[0_4px_20px_rgba(0,113,227,0.4)] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    Comprar pelo Valor Oficial
                  </a>
                )}

                <button
                  type="button"
                  onClick={onCloseExpired}
                  className="w-full py-2.5 text-[13px] text-white/50 hover:text-white/80 transition-colors font-medium min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-white/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantia incondicional de 7 dias mantida integralmente</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
