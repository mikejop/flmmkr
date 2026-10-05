'use client';

import React from 'react';
import { Eye, Headphones, Play, Pause, AlertCircle, ShieldCheck } from 'lucide-react';

interface FocusPromptModalProps {
  isOpen: boolean;
  studentName: string;
  lessonTitle: string;
  onAllowBackground: () => void;
  onKeepPaused: () => void;
}

export const FocusPromptModal: React.FC<FocusPromptModalProps> = ({
  isOpen,
  studentName,
  lessonTitle,
  onAllowBackground,
  onKeepPaused,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-modal-title"
    >
      <div className="w-full max-w-lg bg-[#18181b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white space-y-6 relative overflow-hidden animate-scaleUp">
        
        {/* Glow Blue FLMMKR */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00c7fc]/60 to-transparent pointer-events-none" />

        {/* Header com Ícone e Saudação Pessoal */}
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#00c7fc] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
            <Eye size={28} className="animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#00c7fc] text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={11} /> Sistema de Foco Ativo
            </div>
            <h2 id="focus-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Olá, {studentName}!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              Notamos que você saiu da janela da aula ou alternou para outro aplicativo.
            </p>
          </div>
        </div>

        {/* Aula em reprodução */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
          <span className="text-[10px] font-bold text-[#00c7fc] uppercase tracking-wider block">
            Aula pausada:
          </span>
          <p className="text-sm font-semibold text-white line-clamp-2">
            {lessonTitle}
          </p>
        </div>

        {/* Pergunta e Regra de Foco */}
        <div className="space-y-3">
          <p className="text-sm text-neutral-200 leading-relaxed">
            Deseja que o áudio da aula continue rodando em <strong className="text-white font-bold">segundo plano</strong> enquanto você pratica em outro software (como o DaVinci Resolve)?
          </p>

          <div className="rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/25 p-3.5 flex items-start gap-3">
            <AlertCircle size={18} className="text-[#00c7fc] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed space-y-1">
              <span className="font-bold text-white block">
                Regra de Avanço Automático:
              </span>
              <span>
                {studentName}, se você optar por rodar em segundo plano, a aula <strong>não passará automaticamente ao final</strong>, garantindo que você não perca o início dos próximos conteúdos.
              </span>
            </div>
          </div>
        </div>

        {/* Botões de Decisão */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onAllowBackground}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Headphones size={16} />
            <span>Sim, rodar em segundo plano</span>
          </button>

          <button
            type="button"
            onClick={onKeepPaused}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Pause size={16} />
            <span>Não, manter pausado</span>
          </button>
        </div>

      </div>
    </div>
  );
};
