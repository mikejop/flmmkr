import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { detectSqlInjection } from '@/utils/security';
import { banAttacker, isAttackerBanned, isHoneypotPath, isAutoLoadedResource, BLOCK_DURATION_MS } from '@/services/honeypotService';
import { consumeRateLimit } from '@/utils/rateLimit';
import { buildCsp } from '@/utils/csp';
import { randomBytes } from 'node:crypto';
import { getClientIp } from '@/utils/clientIp';

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
    <h1 style="color:#ff453a;font-size:20px;font-weight:700;margin:0 0 10px 0;">403 — Acesso bloqueado temporariamente</h1>
    <p style="color:#a1a1a6;font-size:13px;line-height:1.6;margin:0 0 16px 0;">
      Este endereço IP foi bloqueado por 1 hora após atividade suspeita no servidor. Se isso foi um engano, tente novamente mais tarde.
    </p>
    <div style="font-size:11px;color:#636366;font-family:monospace;">
      FLMMKR Security Gateway • Incident Recorded
    </div>
  </div>
</body>
</html>`;

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(18).toString('base64');
  const csp = buildCsp(nonce);
  const strictCsp = buildCsp(nonce, { strictStyles: true });
  // Em produção a política é aplicada (Content-Security-Policy). Em desenvolvimento só relata, para não quebrar o HMR.
  const enforce = process.env.NODE_ENV === 'production';
  const forwardedHeaders = new Headers(request.headers);
  // Next lê o nonce do CSP da requisição para marcar seus próprios scripts.
  forwardedHeaders.set('Content-Security-Policy', csp);
  forwardedHeaders.set('x-nonce', nonce);
  const applyReportOnly = (response: NextResponse) => {
    response.headers.set(enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', csp);
    // Política paralela mais estrita, só para observação (sem 'unsafe-inline' em estilos).
    if (enforce) response.headers.set('Content-Security-Policy-Report-Only', strictCsp);
    return response;
  };
  const url = request.nextUrl;
  let decodedPath = url.pathname;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    return applyReportOnly(NextResponse.json({ error: 'Caminho inválido.' }, { status: 400 }));
  }

  const ip = getClientIp(request) || '';
  const mac = request.cookies.get('flmmkr_device_mac')?.value || '';

  // 1. CHECAGEM DE BANIMENTO PRÉVIO (cookie, cache e registro no banco)
  const bannedCookie = request.cookies.get('flmmkr_banned');
  const banned = await isAttackerBanned({
    ip,
    mac,
    hasBannedCookie: bannedCookie?.value === '1',
  });
  if (banned) {
    return applyReportOnly(new NextResponse(BANNED_RESPONSE_HTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    }));
  }

  // 2. HONEYPOT: bloqueio TEMPORÁRIO (1 hora).
  // Métodos de escrita (POST/PUT/PATCH/DELETE) em rota-armadilha bloqueiam na hora.
  // Leituras (GET/HEAD) só bloqueiam na 3ª vez em 10 minutos; antes disso respondem 404.
  // Recursos carregados automaticamente pelo navegador nunca contam.
  if (isHoneypotPath(decodedPath)) {
    const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    if (!unsafeMethod && isAutoLoadedResource(request.headers)) {
      return applyReportOnly(new NextResponse('Not found', { status: 404 }));
    }

    let shouldBlock = unsafeMethod;
    if (!unsafeMethod) {
      // Contador: 2 tentativas permitidas por janela de 10 min; a 3ª estoura e bloqueia.
      const allowed = await consumeRateLimit(request, 'honeypot-hits', 2, 600);
      shouldBlock = allowed === false;
    }

    if (!shouldBlock) {
      return applyReportOnly(new NextResponse('Not found', { status: 404 }));
    }

    const userAgent = request.headers.get('user-agent') || '';
    await banAttacker({ ip, mac, honeypotPath: decodedPath, userAgent });

    const banResponse = new NextResponse(BANNED_RESPONSE_HTML, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

    banResponse.cookies.set('flmmkr_banned', '1', {
      path: '/',
      maxAge: Math.floor(BLOCK_DURATION_MS / 1000),
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    return applyReportOnly(banResponse);
  }

  // 3. Verificação global contra injeção SQL em query parameters e path
  const pathCheck = detectSqlInjection(decodedPath);
  if (pathCheck.isSuspicious) {
    return applyReportOnly(NextResponse.json(
      { error: 'Acesso bloqueado por segurança: padrão de injeção SQL suspeito detectado na rota.' },
      { status: 400 }
    ));
  }

  for (const [key, value] of url.searchParams.entries()) {
    const keyCheck = detectSqlInjection(key);
    const valCheck = detectSqlInjection(value);
    if (keyCheck.isSuspicious || valCheck.isSuspicious) {
      return applyReportOnly(NextResponse.json(
        { error: 'Acesso bloqueado por segurança: parâmetro com injeção SQL detectado.' },
        { status: 400 }
      ));
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
      return applyReportOnly(NextResponse.redirect(redirectUrl));
    }
  }

  return applyReportOnly(createClient(request, forwardedHeaders));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js$|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2?|ttf|otf|webm|mp4)$).*)',
  ],
};
