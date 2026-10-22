'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LANG, LANGS, detectLang, type LangCode } from '@/components/prisma2/i18n';


type Strings = { checking: string; invalidTitle: string; invalidText: string; doneTitle: string; doneText: string; title: string; intro: string; pw: string; pw2: string; short: string; mismatch: string; limited: string; fail: string; save: string; saving: string };
const T: Record<LangCode, Strings> = {
  'pt-BR': { checking: 'Verificando o link…', invalidTitle: 'Link inválido ou já usado', invalidText: 'Este link de nova senha já foi usado ou expirou (vale 1 hora, uma única vez). No PRISMA 2, toque em “Esqueci a senha” para receber outro.', doneTitle: 'Senha alterada', doneText: 'Pronto! Volte ao PRISMA 2 e entre com o seu e-mail e a nova senha. Você já pode fechar esta página.', title: 'Criar nova senha', intro: 'Escolha a nova senha do PRISMA 2 (mínimo 8 caracteres).', pw: 'Nova senha', pw2: 'Repita a nova senha', short: 'A senha precisa ter pelo menos 8 caracteres.', mismatch: 'As senhas não são iguais.', limited: 'Muitas tentativas. Aguarde alguns minutos.', fail: 'Não foi possível trocar a senha agora. Tente de novo.', save: 'Salvar nova senha', saving: 'Salvando…' },
  en: { checking: 'Checking the link…', invalidTitle: 'Invalid or already used link', invalidText: 'This new-password link was already used or has expired (valid for 1 hour, one time only). In PRISMA 2, tap “Forgot password” to get another one.', doneTitle: 'Password changed', doneText: 'Done! Go back to PRISMA 2 and sign in with your email and the new password. You can close this page.', title: 'Create a new password', intro: 'Choose your new PRISMA 2 password (at least 8 characters).', pw: 'New password', pw2: 'Repeat the new password', short: 'The password must be at least 8 characters.', mismatch: 'The passwords don’t match.', limited: 'Too many attempts. Wait a few minutes.', fail: 'Couldn’t change the password right now. Try again.', save: 'Save new password', saving: 'Saving…' },
  es: { checking: 'Comprobando el enlace…', invalidTitle: 'Enlace no válido o ya usado', invalidText: 'Este enlace de nueva contraseña ya se usó o caducó (vale 1 hora, una sola vez). En PRISMA 2, toca “Olvidé la contraseña” para recibir otro.', doneTitle: 'Contraseña cambiada', doneText: '¡Listo! Vuelve a PRISMA 2 e inicia sesión con tu correo y la nueva contraseña. Ya puedes cerrar esta página.', title: 'Crear nueva contraseña', intro: 'Elige la nueva contraseña de PRISMA 2 (mínimo 8 caracteres).', pw: 'Nueva contraseña', pw2: 'Repite la nueva contraseña', short: 'La contraseña debe tener al menos 8 caracteres.', mismatch: 'Las contraseñas no coinciden.', limited: 'Demasiados intentos. Espera unos minutos.', fail: 'No se pudo cambiar la contraseña ahora. Inténtalo de nuevo.', save: 'Guardar nueva contraseña', saving: 'Guardando…' },
  it: { checking: 'Verifica del link…', invalidTitle: 'Link non valido o già usato', invalidText: 'Questo link per la nuova password è già stato usato o è scaduto (vale 1 ora, una sola volta). In PRISMA 2 tocca “Password dimenticata” per riceverne un altro.', doneTitle: 'Password cambiata', doneText: 'Fatto! Torna a PRISMA 2 e accedi con la tua e-mail e la nuova password. Puoi chiudere questa pagina.', title: 'Crea una nuova password', intro: 'Scegli la nuova password di PRISMA 2 (minimo 8 caratteri).', pw: 'Nuova password', pw2: 'Ripeti la nuova password', short: 'La password deve avere almeno 8 caratteri.', mismatch: 'Le password non coincidono.', limited: 'Troppi tentativi. Attendi qualche minuto.', fail: 'Impossibile cambiare la password ora. Riprova.', save: 'Salva nuova password', saving: 'Salvataggio…' },
  fr: { checking: 'Vérification du lien…', invalidTitle: 'Lien invalide ou déjà utilisé', invalidText: 'Ce lien de nouveau mot de passe a déjà été utilisé ou a expiré (valable 1 heure, une seule fois). Dans PRISMA 2, touchez « Mot de passe oublié » pour en recevoir un autre.', doneTitle: 'Mot de passe modifié', doneText: 'C’est fait ! Retournez dans PRISMA 2 et connectez-vous avec votre e-mail et le nouveau mot de passe. Vous pouvez fermer cette page.', title: 'Créer un nouveau mot de passe', intro: 'Choisissez le nouveau mot de passe de PRISMA 2 (8 caractères minimum).', pw: 'Nouveau mot de passe', pw2: 'Répétez le nouveau mot de passe', short: 'Le mot de passe doit contenir au moins 8 caractères.', mismatch: 'Les mots de passe ne correspondent pas.', limited: 'Trop de tentatives. Patientez quelques minutes.', fail: 'Impossible de changer le mot de passe pour le moment. Réessayez.', save: 'Enregistrer le nouveau mot de passe', saving: 'Enregistrement…' },
  ar: { checking: 'جارٍ التحقق من الرابط…', invalidTitle: 'رابط غير صالح أو مستخدم', invalidText: 'تم استخدام رابط كلمة المرور الجديدة هذا أو انتهت صلاحيته (صالح ساعة واحدة ومرة واحدة فقط). في PRISMA 2 اضغط «نسيت كلمة المرور» للحصول على رابط آخر.', doneTitle: 'تم تغيير كلمة المرور', doneText: 'تم! ارجع إلى PRISMA 2 وسجّل الدخول ببريدك وكلمة المرور الجديدة. يمكنك إغلاق هذه الصفحة.', title: 'إنشاء كلمة مرور جديدة', intro: 'اختر كلمة مرور PRISMA 2 الجديدة (8 أحرف على الأقل).', pw: 'كلمة المرور الجديدة', pw2: 'أعد كتابة كلمة المرور الجديدة', short: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.', mismatch: 'كلمتا المرور غير متطابقتين.', limited: 'محاولات كثيرة. انتظر بضع دقائق.', fail: 'تعذّر تغيير كلمة المرور الآن. حاول مرة أخرى.', save: 'حفظ كلمة المرور الجديدة', saving: 'جارٍ الحفظ…' },
  zh: { checking: '正在验证链接…', invalidTitle: '链接无效或已使用', invalidText: '此新密码链接已被使用或已过期（1 小时内有效，仅可使用一次）。请在 PRISMA 2 中点击“忘记密码”重新获取。', doneTitle: '密码已修改', doneText: '完成！请返回 PRISMA 2，用邮箱和新密码登录。你可以关闭此页面。', title: '创建新密码', intro: '请设置 PRISMA 2 的新密码（至少 8 个字符）。', pw: '新密码', pw2: '再次输入新密码', short: '密码至少需要 8 个字符。', mismatch: '两次输入的密码不一致。', limited: '尝试次数过多，请等待几分钟。', fail: '暂时无法修改密码，请重试。', save: '保存新密码', saving: '正在保存…' },
};

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
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  const t = T[lang];

  // Idioma: o mesmo da página de download (escolha salva) ou o do navegador.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('prisma2-lang'); } catch {}
    const known = LANGS.find((l) => l.code === saved)?.code;
    const l = known ?? detectLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
    setLang(l);
    document.documentElement.lang = l;
    document.documentElement.dir = LANGS.find((x) => x.code === l)?.dir ?? 'ltr';
  }, []);

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
    if (password.length < 8) { setError(t.short); return; }
    if (password !== again) { setError(t.mismatch); return; }
    setBusy(true);
    const r = await call({ action: 'reset', token, password });
    setBusy(false);
    if (r?.ok === true) { setPhase('done'); return; }
    if (r?.reason === 'invalid_token') { setPhase('invalid'); return; }
    setError(r?.reason === 'rate_limited' ? t.limited : t.fail);
  };

  const field = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none focus:border-blue-400';
  return (
    <main dir={LANGS.find((x) => x.code === lang)?.dir ?? 'ltr'} className="flex min-h-screen items-center justify-center bg-[#0b0c10] px-5 py-10 text-white">
      <div className="w-full max-w-sm text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/prisma2/favicon-192.png" alt="PRISMA 2" width={72} height={72} className="mx-auto mb-6 rounded-2xl" />
        {phase === 'checking' && <p className="text-white/60">{t.checking}</p>}
        {phase === 'invalid' && (
          <>
            <h1 className="mb-2 text-xl font-bold">{t.invalidTitle}</h1>
            <p className="text-sm text-white/60">{t.invalidText}</p>
          </>
        )}
        {phase === 'done' && (
          <>
            <h1 className="mb-2 text-xl font-bold">{t.doneTitle}</h1>
            <p className="text-sm text-white/60">{t.doneText}</p>
          </>
        )}
        {phase === 'form' && (
          <form onSubmit={submit} className="space-y-3 text-left">
            <h1 className="text-center text-xl font-bold">{t.title}</h1>
            <p className="pb-1 text-center text-sm text-white/60">{t.intro}</p>
            <input className={field} type="password" autoComplete="new-password" placeholder={t.pw} value={password} onChange={(e) => setPassword(e.target.value)} maxLength={200} autoFocus />
            <input className={field} type="password" autoComplete="new-password" placeholder={t.pw2} value={again} onChange={(e) => setAgain(e.target.value)} maxLength={200} />
            {error && <p className="text-center text-sm text-orange-400">{error}</p>}
            <button type="submit" disabled={busy || !password || !again} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? t.saving : t.save}</button>
          </form>
        )}
      </div>
    </main>
  );
}
