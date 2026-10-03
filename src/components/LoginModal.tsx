'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setForgotMode(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to auth provider
    console.log(forgotMode ? 'Forgot password:' : 'Login:', email, password);
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
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-7 text-center">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <label className="block text-xs font-medium text-white/50 mb-1.5 ml-0.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3]/70 focus:bg-white/12 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
            </div>

            {/* Password field — only in login mode */}
            {!forgotMode && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 ml-0.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!forgotMode}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#0071e3]/70 focus:bg-white/12 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
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
              className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(0,113,227,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all active:scale-[0.98] mt-1"
            >
              {forgotMode ? 'Enviar link de redefinição' : 'Entrar'}
            </button>
          </form>

          {/* Forgot / Back links */}
          <div className="mt-5 text-center">
            {forgotMode ? (
              <button
                onClick={() => setForgotMode(false)}
                className="text-xs text-white/40 hover:text-[#0071e3] transition-colors"
              >
                ← Voltar ao login
              </button>
            ) : (
              <button
                onClick={() => setForgotMode(true)}
                className="text-xs text-white/40 hover:text-[#0071e3] transition-colors"
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
