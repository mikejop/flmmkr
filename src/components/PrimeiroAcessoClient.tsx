'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { detectSqlInjection } from '@/utils/security';

interface PrimeiroAcessoProps {
  initialToken?: string;
}

export function PrimeiroAcessoClient({ initialToken = '' }: PrimeiroAcessoProps) {
  const router = useRouter();
  const supabase = createClient();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validação em tempo real dos requisitos de senha
  const hasUpper = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasLower = useMemo(() => /[a-z]/.test(password), [password]);
  const hasNumber = useMemo(() => /[0-9]/.test(password), [password]);
  const hasSpecial = useMemo(() => /[^A-Za-z0-9]/.test(password), [password]);
  const hasMinLength = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );

  // O botão de acessar só vai aparecer depois que o usuário preencher o campo de senha com todas as regras
  const isFormValid =
    hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Bloqueador de SQL Injection no frontend
    const passCheck = detectSqlInjection(password);
    const confirmCheck = detectSqlInjection(confirmPassword);
    const tokenCheck = detectSqlInjection(token);

    if (passCheck.isSuspicious || confirmCheck.isSuspicious || tokenCheck.isSuspicious) {
      setErrorMessage('Padrão suspeito ou caractere inválido detectado pelo bloqueador de segurança.');
      return;
    }

    if (!isFormValid) {
      setErrorMessage('Por favor, atenda a todas as regras de segurança da senha.');
      return;
    }

    if (!token) {
      setErrorMessage('Link de ativação inválido. Verifique o link enviado para o seu e-mail.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/first-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token.trim(),
          password,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Falha ao ativar primeiro acesso.');
      }

      setSuccess(true);

      // Se retornou sessão do Supabase, definir no cliente local
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
      }

      // Redireciona diretamente para a área do aluno
      setTimeout(() => {
        window.location.href = '/color-master-produto';
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar ativação de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center px-4 py-12 selection:bg-white selection:text-black">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Marca Minimalista: Apenas o nome FLMMKR e embaixo o nome do produto */}
        <div className="text-center mb-8 sm:mb-10 select-none">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.22em] text-white">
            FLMMKR
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-zinc-400 mt-1 font-mono font-medium">
            COLOR MASTER® | PRODUTO
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {success ? (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Acesso Liberado!</h3>
            <p className="text-xs text-zinc-300">
              Sua senha foi criptografada e salva com sucesso. Entrando na Área do Aluno...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Mensagem de Erro com Bloqueador */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-red-400 text-xs leading-relaxed animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo de Senha */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                Criar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors pr-11 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo de Confirmar Senha */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua nova senha"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#111218] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors pr-11 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos de Senha */}
            <div className="bg-[#101117] border border-white/5 rounded-xl p-3.5 space-y-1.5 select-none">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono block mb-2">
                Requisitos de Segurança:
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {hasUpper ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1" />}
                  <span>Letra maiúscula</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {hasLower ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1" />}
                  <span>Letra minúscula</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {hasNumber ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1" />}
                  <span>Número</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {hasSpecial ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1" />}
                  <span>Caractere especial</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className={hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}>
                  Mínimo 8 caracteres
                </span>
                <span className={passwordsMatch ? 'text-emerald-400' : 'text-zinc-500'}>
                  {passwordsMatch ? '✓ Senhas coincidem' : 'Senhas devem coincidir'}
                </span>
              </div>
            </div>

            {/* O BOTÃO DE ACESSAR SÓ VAI APARECER DEPOIS QUE O USUÁRIO PREENCHER O CAMPO DE SENHA COM TODAS AS REGRAS */}
            {isFormValid && (
              <div className="pt-2 animate-fadeIn transition-all duration-300">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando e Criptografando...</span>
                    </>
                  ) : (
                    <span>Acessar</span>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
