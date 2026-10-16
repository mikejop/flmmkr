'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { detectSqlInjection } from '@/utils/security';
import TurnstileWidget from '@/components/TurnstileWidget';

interface PrimeiroAcessoProps {
  initialToken?: string;
}

export function PrimeiroAcessoClient({ initialToken = '' }: PrimeiroAcessoProps) {
  const router = useRouter();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // O link do e-mail é conferido assim que a página abre, para o aluno não digitar a senha à toa.
  const [linkState, setLinkState] = useState<'checking' | 'valid' | 'invalid'>(initialToken ? 'checking' : 'invalid');
  const [linkReason, setLinkReason] = useState<string>(initialToken ? '' : 'Abra o link de primeiro acesso que enviamos para o seu e-mail.');
  const [resendEmail, setResendEmail] = useState('');
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  useEffect(() => {
    if (!initialToken) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/auth/first-access?token=${encodeURIComponent(initialToken)}`, { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!alive) return;
        if (data && data.valid === false) {
          setLinkReason(data.reason || 'Este link não é mais válido.');
          setLinkState('invalid');
        } else {
          setLinkState('valid');
        }
      } catch {
        if (alive) setLinkState('valid'); // sem rede para conferir: deixa tentar, o envio mostra o erro
      }
    })();
    return () => { alive = false; };
  }, [initialToken]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resendBusy) return;
    setResendBusy(true);
    setResendError(null);
    setResendMessage(null);
    try {
      const res = await fetch('/api/auth/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim(), turnstileToken: turnstileToken || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar agora.');
      setResendMessage(data?.message || 'Se existir um acesso aguardando ativação para este e-mail, enviamos um novo link.');
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Não foi possível enviar agora.');
      setTurnstileReset((n) => n + 1);
    } finally {
      setResendBusy(false);
    }
  };

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

      // Senha criada, mas o login automático falhou: manda para a tela de login em vez de uma área que exige sessão.
      const destination = data.requiresLogin ? '/?login=true' : '/color-master-produto';
      setTimeout(() => {
        window.location.href = destination;
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar ativação de acesso.');
    } finally {
      setLoading(false);
    }
  };

  const Requirement = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-2 transition-colors duration-300 ${ok ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-all duration-300 ${
          ok ? 'bg-[#0071e3]' : 'border border-[#d2d2d7] bg-white'
        }`}
      >
        {ok && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </div>
  );

  const inputClass =
    'w-full bg-white border border-[#d2d2d7] rounded-xl px-4 h-14 text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 transition-all pr-12';

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col items-center justify-center px-5 py-16 antialiased selection:bg-[#0071e3]/20 selection:text-[#1d1d1f] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,Arial,sans-serif]">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Marca Minimalista: Apenas o nome FLMMKR e embaixo o nome do produto */}
        <div className="text-center mb-10 sm:mb-12 select-none">
          <h1 className="font-molde-heavy text-[42px] sm:text-[50px] leading-none text-[#1d1d1f] tracking-tight">
            FLMMKR
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#6e6e73] mt-3 font-normal tracking-[-0.01em]">
            COLOR MASTER® | PRODUTO
          </p>
        </div>

        {linkState === 'checking' && !success ? (
          <div role="status" className="flex items-center gap-2 text-[15px] text-[#6e6e73]">
            <Loader2 className="w-4 h-4 animate-spin" /> Conferindo seu link…
          </div>
        ) : linkState === 'invalid' && !success ? (
          <div className="w-full space-y-5">
            <div className="bg-[#fff2f2] border border-[#ffd6d6] rounded-xl p-3.5 flex items-start gap-2.5 text-[#d70015] text-[13px] leading-relaxed" role="alert">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{linkReason}</span>
            </div>
            <form onSubmit={handleResend} className="space-y-4">
              <p className="text-[15px] text-[#6e6e73]">Informe o e-mail da compra e enviamos um novo link.</p>
              <input
                type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} required autoComplete="email"
                placeholder="seu@email.com" aria-label="E-mail da compra" className={inputClass}
              />
              <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
              {resendError && <p role="alert" className="text-[13px] text-[#d70015]">{resendError}</p>}
              {resendMessage && <p role="status" className="text-[13px] text-[#1d1d1f] bg-[#f5f5f7] rounded-xl p-3.5">{resendMessage}</p>}
              <button
                type="submit" disabled={resendBusy || !resendEmail}
                className="w-full h-12 px-6 rounded-full bg-[#0071e3] text-white text-[17px] hover:bg-[#0077ed] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {resendBusy ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando…</span></> : <span>Enviar novo link</span>}
              </button>
              <Link href="/?login=true" className="block text-center text-[15px] text-[#0071e3] hover:underline">Já tenho senha: entrar</Link>
            </form>
          </div>
        ) : success ? (
          <div className="w-full bg-[#f5f5f7] rounded-[22px] p-8 text-center animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-[#0071e3] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-1.5 tracking-[-0.01em]">Acesso liberado.</h3>
            <p className="text-[15px] text-[#6e6e73] leading-relaxed">
              Sua senha foi criada com segurança. Entrando na Área do Aluno…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <h2 className="text-[24px] font-semibold text-center tracking-[-0.01em] text-[#0071e3] mb-1">
              Crie sua senha
            </h2>
            <p className="text-[15px] text-[#6e6e73] text-center -mt-3 mb-2">
              Defina uma senha para acessar a sua área do aluno.
            </p>

            {/* Mensagem de Erro com Bloqueador */}
            {errorMessage && (
              <div className="bg-[#fff2f2] border border-[#ffd6d6] rounded-xl p-3.5 flex items-start gap-2.5 text-[#d70015] text-[13px] leading-relaxed animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo de Senha */}
            <div className="relative">
              <label className="sr-only">Criar senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                required
                autoComplete="new-password"
                aria-label="Criar senha"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Campo de Confirmar Senha */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar senha"
                required
                autoComplete="new-password"
                aria-label="Confirmar senha"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Requisitos de Senha */}
            <div className="bg-[#f5f5f7] rounded-[18px] p-5 select-none">
              <span className="text-[13px] font-semibold text-[#1d1d1f] block mb-3">
                Sua senha precisa ter:
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                <Requirement ok={hasUpper} label="Letra maiúscula" />
                <Requirement ok={hasLower} label="Letra minúscula" />
                <Requirement ok={hasNumber} label="Número" />
                <Requirement ok={hasSpecial} label="Caractere especial" />
                <Requirement ok={hasMinLength} label="Mínimo 8 caracteres" />
                <Requirement ok={passwordsMatch} label="Senhas iguais" />
              </div>
            </div>

            {/* O BOTÃO DE ACESSAR SÓ VAI APARECER DEPOIS QUE O USUÁRIO PREENCHER O CAMPO DE SENHA COM TODAS AS REGRAS */}
            {isFormValid && (
              <div className="pt-1 animate-fadeIn transition-all duration-300">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 px-6 rounded-full bg-[#0071e3] text-white font-normal text-[17px] hover:bg-[#0077ed] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando…</span>
                    </>
                  ) : (
                    <span>Acessar</span>
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        <p className="mt-12 text-[12px] text-[#86868b] text-center">
          © {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
