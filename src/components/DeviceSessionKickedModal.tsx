'use client';

import React from 'react';
import { Smartphone, MapPin, Clock, ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

interface DeviceSessionKickedModalProps {
  isOpen: boolean;
  studentName?: string;
  replacedByDevice: string;
  replacedByLocation: string;
  replacedAt?: string;
  onReLogin: () => void;
}

export const DeviceSessionKickedModal: React.FC<DeviceSessionKickedModalProps> = ({
  isOpen,
  studentName = 'Aluno',
  replacedByDevice,
  replacedByLocation,
  replacedAt,
  onReLogin,
}) => {
  if (!isOpen) return null;

  const formattedTime = replacedAt 
    ? new Date(replacedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' })
    : new Date().toLocaleTimeString('pt-BR');

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[99999] flex items-center justify-center p-4 select-none animate-fadeIn"
      role="alertdialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-[#16161a] border border-[#0071e3]/30 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-white space-y-6 relative overflow-hidden animate-scaleUp"
      >
        {/* Glow & Specular Top Rim */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00c7fc]/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#00c7fc] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
            <ShieldAlert size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Atenção, {studentName}
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed font-medium">
              Sua conta foi conectada em outro dispositivo. Para sua segurança, esta sessão foi pausada.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-[#00c7fc] uppercase tracking-widest border-b border-white/10 pb-2">
            Detalhes do Novo Acesso
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Smartphone size={14} className="text-[#00c7fc]" />
                Dispositivo
              </span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {replacedByDevice || 'Outro Dispositivo'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <MapPin size={14} className="text-[#00c7fc]" />
                Localização
              </span>
              <span className="font-semibold text-white">
                {replacedByLocation || 'Brasil'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 flex items-center gap-2">
                <Clock size={14} className="text-[#00c7fc]" />
                Horário
              </span>
              <span className="font-mono text-neutral-300 text-[11px]">
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Security Rule Note */}
        <p className="text-[11px] text-neutral-400 leading-relaxed text-center">
          {studentName}, para a segurança dos seus dados e direitos autorais, o acesso é restrito a <strong className="text-white">um dispositivo por vez</strong>.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center"
          >
            Ir para Início
          </button>
          <button
            onClick={onReLogin}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <LogIn size={14} />
            Reconectar Aqui
          </button>
        </div>

      </div>
    </div>
  );
};
