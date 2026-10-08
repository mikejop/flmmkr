import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody, detectSqlInjection } from '@/utils/security';
import { validateActivationToken, consumeActivationToken } from '@/services/activationService';
import { verifyAndSyncPaymentAccess } from '@/services/paymentVerificationService';
import { getDeviceInfoFromRequest } from '@/utils/deviceDetection';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Bloqueador de SQL Injection no corpo da requisição
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json(
        { success: false, error: reason || 'Tentativa de injeção SQL bloqueada pelo sistema.' },
        { status: 400 }
      );
    }

    const { token, password, confirmPassword } = sanitized;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de ativação exclusivo não fornecido.' },
        { status: 400 }
      );
    }

    // Checagem específica de injeção SQL no token e senha
    if (detectSqlInjection(token).isSuspicious || detectSqlInjection(password).isSuspicious) {
      return NextResponse.json(
        { success: false, error: 'Padrão suspeito bloqueado por segurança.' },
        { status: 400 }
      );
    }

    // 2. Regras estritas de complexidade de senha
    // Letra maiúscula, caractere especial, letra minúscula e números
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = (password || '').length >= 8;

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial || !hasMinLength) {
      return NextResponse.json(
        {
          success: false,
          error: 'A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.'
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'As senhas digitadas não coincidem.' },
        { status: 400 }
      );
    }

    // 3. Validação do Token de Ativação Único
    const tokenValidation = await validateActivationToken(token);
    if (!tokenValidation.valid || !tokenValidation.userId) {
      return NextResponse.json(
        { success: false, error: tokenValidation.reason || 'Link de ativação inválido ou expirado.' },
        { status: 400 }
      );
    }

    const userId = tokenValidation.userId;
    const email = tokenValidation.email;

    // 4. DUPLA VALIDAÇÃO ZERO-TRUST (Servidor + Asaas)
    // Só pode acessar se o status estiver pago no servidor E no Asaas.
    // Se no servidor estiver pago e no Asaas não, o servidor recebe 'não pago' e o usuário é barrado.
    const paymentCheck = await verifyAndSyncPaymentAccess({
      userId,
      email
    });

    if (!paymentCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Acesso bloqueado: pagamento não confirmado no Asaas (${paymentCheck.reason || 'Status não aprovado'}).`
        },
        { status: 403 }
      );
    }

    // 5. Criptografia e Atualização de Senha no Supabase Auth
    // O Supabase Auth criptografa a senha nativamente usando Bcrypt com salt seguro
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        has_access: true,
        password_set_at: new Date().toISOString()
      }
    });

    if (updateErr) {
      console.error('[First Access] Erro ao salvar senha no Supabase:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Falha ao criptografar e registrar senha.' },
        { status: 500 }
      );
    }

    // 6. Consumir token único
    await consumeActivationToken(token);

    // 7. Autenticar usuário para gerar sessão
    const { data: signInData, error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (signInErr || !signInData.session) {
      console.warn('[First Access] Login automático pós-ativação falhou:', signInErr);
      return NextResponse.json({
        success: true,
        email,
        requiresLogin: true
      });
    }

    // Registrar sessão do dispositivo
    const deviceInfo = getDeviceInfoFromRequest(req);
    const sessionToken = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await supabaseAdmin.from('user_active_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      device_name: deviceInfo.deviceName,
      ip_address: deviceInfo.ipAddress,
      location: deviceInfo.location,
      is_active: true,
      created_at: nowIso,
      last_heartbeat_at: nowIso
    });

    return NextResponse.json({
      success: true,
      session: signInData.session,
      user: signInData.user,
      sessionToken
    });
  } catch (err: any) {
    console.error('[API /api/auth/first-access Exception]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao ativar primeiro acesso.' },
      { status: 500 }
    );
  }
}
