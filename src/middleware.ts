import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { detectSqlInjection } from '@/utils/security';

export async function middleware(request: NextRequest) {
  // 1. Verificação global contra injeção SQL em query parameters e path
  const url = request.nextUrl;
  const decodedPath = decodeURIComponent(url.pathname);
  
  // Inspecionar o caminho
  const pathCheck = detectSqlInjection(decodedPath);
  if (pathCheck.isSuspicious) {
    return NextResponse.json(
      { error: 'Acesso bloqueado por segurança: padrão de injeção SQL suspeito detectado na rota.' },
      { status: 400 }
    );
  }

  // Inspecionar todos os query parameters
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

  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static asset images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
