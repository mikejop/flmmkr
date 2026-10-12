'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { detectSqlInjection } from '@/utils/security';

function DefinirSenhaContent() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Escuta alteração de auth state para garantir que a sessão de recuperação foi inicializada
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSessionChecking(false);
        }
      } catch {
        if (mounted) {
          setSessionChecking(false);
        }
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setSessionChecking(false);
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

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

  // O botão de salvar só vai aparecer após preencher todos os requisitos
  const isFormValid =
    hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Bloqueador de SQL Injection no frontend
    const passCheck = detectSqlInjection(password);
    const confirmCheck = detectSqlInjection(confirmPassword);

    if (passCheck.isSuspicious || confirmCheck.isSuspicious) {
      setErrorMessage('Padrão suspeito ou caractere inválido detectado pelo bloqueador de segurança.');
      return;
    }

    if (!isFormValid) {
      setErrorMessage('Por favor, atenda a todas as regras de segurança da senha.');
      return;
    }

    setLoading(true);

    try {
      // Verifica sessão do Supabase (criada automaticamente pelo link de recuperação)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('O link de recuperação expirou ou é inválido. Por favor, solicite um novo link de recuperação.');
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redireciona para a página de login
      setTimeout(() => {
        window.location.href = '/?login=true';
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao redefinir senha. Tente novamente.');
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

        {/* Mensagem de Sucesso */}
        {success ? (
          <div className="w-full bg-[#f5f5f7] rounded-[22px] p-8 text-center animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-[#0071e3] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-1.5 tracking-[-0.01em]">Senha atualizada!</h3>
            <p className="text-[15px] text-[#6e6e73] leading-relaxed">
              Sua nova senha foi salva com segurança. Redirecionando para o login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <h2 className="text-[24px] font-semibold text-center tracking-[-0.01em] text-[#0071e3] mb-1">
              Crie sua senha
            </h2>
            <p className="text-[15px] text-[#6e6e73] text-center -mt-3 mb-2">
              Defina uma nova senha para recuperar o acesso à sua conta.
            </p>

            {/* Mensagem de Erro com Bloqueador */}
            {errorMessage && (
              <div className="bg-[#fff2f2] border border-[#ffd6d6] rounded-xl p-3.5 flex items-start gap-2.5 text-[#d70015] text-[13px] leading-relaxed animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo de Nova Senha */}
            <div className="relative">
              <label className="sr-only">Nova senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                required
                autoComplete="new-password"
                aria-label="Nova senha"
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

            {/* Campo de Confirmar Nova Senha */}
            <div className="relative">
              <label className="sr-only">Confirmar nova senha</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova senha"
                required
                autoComplete="new-password"
                aria-label="Confirmar nova senha"
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

            {/* O BOTÃO SALVAR SENHA NOVA SÓ APARECE APÓS ATENDER TODAS AS REGRAS */}
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
                      <span>Salvando…</span>
                    </>
                  ) : (
                    <span>Salvar senha nova</span>
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

export default function DefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0071e3]" />
        </div>
      }
    >
      <DefinirSenhaContent />
    </Suspense>
  );
}
