'use client';

import { useEffect, useState } from 'react';

type Phase = 'checking' | 'form' | 'invalid' | 'done';

async function call(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch('/api/prisma2/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await r.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function Prisma2ResetForm({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confere se o link ainda vale (sem gastá-lo).
  useEffect(() => {
    if (!/^[0-9a-f]{64}$/.test(token)) { setPhase('invalid'); return; }
    let live = true;
    call({ action: 'check', token }).then((r) => { if (live) setPhase(r?.valid === true ? 'form' : 'invalid'); });
    return () => { live = false; };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('A senha precisa ter pelo menos 8 caracteres.'); return; }
    if (password !== again) { setError('As senhas não são iguais.'); return; }
    setBusy(true);
    const r = await call({ action: 'reset', token, password });
    setBusy(false);
    if (r?.ok === true) { setPhase('done'); return; }
    if (r?.reason === 'invalid_token') { setPhase('invalid'); return; }
    setError(r?.reason === 'rate_limited' ? 'Muitas tentativas. Aguarde alguns minutos.' : 'Não foi possível trocar a senha agora. Tente de novo.');
  };

  const field = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none focus:border-blue-400';
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0c10] px-5 py-10 text-white">
      <div className="w-full max-w-sm text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/prisma2/favicon-192.png" alt="PRISMA 2" width={72} height={72} className="mx-auto mb-6 rounded-2xl" />
        {phase === 'checking' && <p className="text-white/60">Verificando o link…</p>}
        {phase === 'invalid' && (
          <>
            <h1 className="mb-2 text-xl font-bold">Link inválido ou já usado</h1>
            <p className="text-sm text-white/60">Este link de nova senha já foi usado ou expirou (vale 1 hora, uma única vez). No PRISMA 2, toque em “Esqueci a senha” para receber outro.</p>
          </>
        )}
        {phase === 'done' && (
          <>
            <h1 className="mb-2 text-xl font-bold">Senha alterada</h1>
            <p className="text-sm text-white/60">Pronto! Volte ao PRISMA 2 e entre com o seu e-mail e a nova senha. Você já pode fechar esta página.</p>
          </>
        )}
        {phase === 'form' && (
          <form onSubmit={submit} className="space-y-3 text-left">
            <h1 className="text-center text-xl font-bold">Criar nova senha</h1>
            <p className="pb-1 text-center text-sm text-white/60">Escolha a nova senha do PRISMA 2 (mínimo 8 caracteres).</p>
            <input className={field} type="password" autoComplete="new-password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={200} autoFocus />
            <input className={field} type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={again} onChange={(e) => setAgain(e.target.value)} maxLength={200} />
            {error && <p className="text-center text-sm text-orange-400">{error}</p>}
            <button type="submit" disabled={busy || !password || !again} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Salvando…' : 'Salvar nova senha'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
