import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { detectSqlInjection } from '@/utils/security';
import { isHoneypotPath } from '@/services/honeypotService';

const BANNED_RESPONSE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>403 - Acesso Bloqueado</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#070709;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;">
  <div style="max-width:440px;padding:32px 24px;border:1px solid rgba(255,69,58,0.25);border-radius:16px;background:#121318;">
    <div style="font-size:36px;margin-bottom:12px;">🚫</div>
    <h1 style="color:#ff453a;font-size:20px;font-weight:700;margin:0 0 10px 0;">403 — Acesso Permanentemente Bloqueado</h1>
    <p style="color:#a1a1a6;font-size:13px;line-height:1.6;margin:0 0 16px 0;">
      Este endereço IP e dispositivo foram bloqueados indefinidamente por acionamento de armadilha de segurança (Honeypot) ou violação das regras do servidor.
    </p>
    <div style="font-size:11px;color:#636366;font-family:monospace;">
      FLMMKR Security Gateway • Incident Recorded
    </div>
  </div>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const decodedPath = decodeURIComponent(url.pathname);

  // 1. CHECAGEM DE BANIMENTO PRÉVIO (Bloqueio total desde a raiz '/')
  const bannedCookie = request.cookies.get('flmmkr_banned');
  if (bannedCookie && bannedCookie.value === '1') {
    return new NextResponse(BANNED_RESPONSE_HTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  // 2. DETECÇÃO E DISPARO DE HONEYPOT
  // Se o atacante acessar qualquer rota de armadilha (ex: /wp-admin, /.env, /dump.sql, /phpmyadmin)
  // O sistema bloqueia o IP e MAC indefinidamente em todo o site desde a raiz.
  if (isHoneypotPath(decodedPath)) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';
    const mac = request.cookies.get('flmmkr_device_mac')?.value || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Disparar registro do atacante no banco de dados de forma assíncrona
    try {
      fetch(`${url.origin}/api/security/honeypot-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip,
          mac,
          honeypotPath: decodedPath,
          userAgent,
          headers: Object.fromEntries(request.headers.entries())
        })
      }).catch(() => {});
    } catch {}

    const banResponse = new NextResponse(BANNED_RESPONSE_HTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

    // Grava o cookie indelével de banimento permanente (10 anos)
    banResponse.cookies.set('flmmkr_banned', '1', {
      path: '/',
      maxAge: 315360000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    return banResponse;
  }

  // 3. Verificação global contra injeção SQL em query parameters e path
  const pathCheck = detectSqlInjection(decodedPath);
  if (pathCheck.isSuspicious) {
    return NextResponse.json(
      { error: 'Acesso bloqueado por segurança: padrão de injeção SQL suspeito detectado na rota.' },
      { status: 400 }
    );
  }

  for (const [key, value] of url.searchParams.entries()) {
    const keyCheck = detectSqlInjection(key);
    const valCheck = detectSqlInjection(value);
    if (keyCheck.isSuspicious || valCheck.isSuspicious) {
      return NextResponse.json(
        { error: 'Acesso bloqueado por segurança: parâmetro com injeção SQL detectado.' },
        { status: 400 }
      );
    }
  }

  // 4. Proteção estrita de rotas da Área do Aluno
  const isMemberRoute = url.pathname.startsWith('/color-master-produto') || url.pathname.startsWith('/conteudo');
  if (isMemberRoute) {
    const allCookies = request.cookies.getAll();
    const hasAuthSession = allCookies.some((c) => 
      c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name.includes('auth-token'))
    );

    if (!hasAuthSession) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
