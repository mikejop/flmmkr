'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, redirectUrl = '/color-master-produto' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Timer countdown for brute-force lock
  useEffect(() => {
    if (lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockCountdown]);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setForgotMode(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      setTimeout(() => emailRef.current?.focus(), 80);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockCountdown > 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (forgotMode) {
        // Envio de link de recuperação de senha pelo Supabase
        const resetRedirect = typeof window !== 'undefined'
          ? `${window.location.origin}/definir-senha`
          : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: resetRedirect,
        });

        if (error) {
          setErrorMessage(error.message || 'Erro ao enviar e-mail de recuperação.');
        } else {
          setSuccessMessage('Enviamos as instruções de redefinição para o seu e-mail.');
        }
      } else {
        // Autenticação com proteção contra Brute-Force e Controle de Sessão Única via /api/auth/login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (data.locked && data.remainingSeconds) {
            setLockCountdown(data.remainingSeconds);
          }
          setErrorMessage(data.error || 'Falha ao autenticar.');
          setLoading(false);
          return;
        }

        if (data.session) {
          // 1. Sincronizar sessão no cliente Supabase
          if (data.session.access_token && data.session.refresh_token) {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          }

          // 2. Salvar token de sessão para verificação de concorrência de dispositivo único
          if (data.sessionToken) {
            localStorage.setItem('flmmkr_session_token', data.sessionToken);
          }

          // 3. Redirecionar para a área do aluno
          window.location.href = redirectUrl;
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro inesperado ao conectar.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-[999] flex items-center justify-center px-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      aria-modal="true"
      role="dialog"
      aria-label={forgotMode ? 'Recuperar senha' : 'Acessar conta'}
    >
      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-white/20 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        style={{
          background: 'rgba(20,20,24,0.88)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        {/* Top specular rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-7 text-center">
            <span className="text-xs font-semibold tracking-widest text-[#0071e3] uppercase mb-2 block">
              FLMMKR
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {forgotMode ? 'Recuperar senha' : 'Acessar conta'}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              {forgotMode
                ? 'Enviaremos um link de redefinição para seu e-mail.'
                : 'Entre para acessar seus treinamentos.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <label className="block text-xs font-medium text-white/60 mb-1.5 ml-0.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/12 text-white placeholder-white/25 text-base sm:text-sm focus:outline-none focus:border-[#0071e3]/70 focus:bg-white/12 transition-all min-h-[44px]"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
            </div>

            {/* Password field — only in login mode */}
            {!forgotMode && (
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 ml-0.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!forgotMode}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/12 text-white placeholder-white/25 text-base sm:text-sm focus:outline-none focus:border-[#0071e3]/70 focus:bg-white/12 transition-all min-h-[44px]"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || lockCountdown > 0}
              className={`w-full min-h-[48px] py-3 rounded-xl text-white text-sm font-semibold shadow-[0_4px_16px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-[0.98] mt-2 cursor-pointer flex items-center justify-center gap-2 ${
                lockCountdown > 0 
                  ? 'bg-neutral-700/80 cursor-not-allowed opacity-80' 
                  : 'bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              {loading
                ? (forgotMode ? 'Enviando...' : 'Entrando...')
                : lockCountdown > 0
                ? `Bloqueado temporariamente (${Math.floor(lockCountdown / 60)}m ${lockCountdown % 60}s)`
                : (forgotMode ? 'Enviar link de redefinição' : 'Entrar')}
            </button>
          </form>

          {/* Forgot / Back links */}
          <div className="mt-5 text-center">
            {forgotMode ? (
              <button
                onClick={() => setForgotMode(false)}
                className="text-xs text-white/50 hover:text-[#0071e3] transition-colors py-2 px-3 cursor-pointer"
              >
                ← Voltar ao login
              </button>
            ) : (
              <button
                onClick={() => setForgotMode(true)}
                className="text-xs text-white/50 hover:text-[#0071e3] transition-colors py-2 px-3 cursor-pointer"
              >
                Esqueci a senha
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
