'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function DefinirSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qName = searchParams.get('name');

    if (qEmail) setEmail(qEmail);
    if (qName) setName(qName);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, informe seu e-mail cadastrado na compra.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar a senha pelo backend
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao definir senha.');
      }

      // 2. Realizar login automático com a nova senha
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInErr) {
        console.warn('Login automático falhou, redirecionando para tela com login:', signInErr);
      }

      setSuccess(true);

      // 3. Redirecionar para o conteúdo da área de membros
      setTimeout(() => {
        router.push('/color-master-produto');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-black selection:text-white">
      {/* Top minimal bar */}
      <header className="w-full border-b border-zinc-200/80 px-6 sm:px-10 py-5 flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight text-zinc-950">
          FLMMKR
        </span>
        <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">
          ContentsPlace
        </span>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto px-6 py-12 sm:py-16 my-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 mb-4 border border-zinc-200">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
            Crie sua senha de acesso
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Seu pagamento foi confirmado com sucesso. Defina sua senha pessoal para acessar todos os conteúdos.
          </p>
        </div>

        {/* User identification info */}
        {(name || email) && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
            {name && (
              <div className="text-sm font-medium text-zinc-900">
                <span className="text-xs uppercase tracking-wider text-zinc-400 block mb-0.5">Aluno</span>
                {name}
              </div>
            )}
            {email && (
              <div className="text-sm text-zinc-600 mt-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 block mb-0.5">E-mail de Acesso</span>
                {email}
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Senha criada com sucesso! Redirecionando para a área de membros...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!email && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-0.5">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-0.5">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo de 6 caracteres"
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-0.5">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a senha"
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full min-h-[48px] py-3.5 mt-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-semibold transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Salvar Senha e Acessar Conteúdo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 px-6 py-4 text-center text-xs text-zinc-400">
        FLMMKR • Acesso exclusivo e protegido
      </footer>
    </div>
  );
}

export default function DefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
        </div>
      }
    >
      <DefinirSenhaContent />
    </Suspense>
  );
}
