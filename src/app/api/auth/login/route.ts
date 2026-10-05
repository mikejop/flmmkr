import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/userService';
import { validateAndSanitizeBody } from '@/utils/security';
import { getDeviceInfoFromRequest } from '@/utils/deviceDetection';
import { sendSecurityAlertEmail } from '@/services/notificationService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Filtro global contra SQL Injection
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json(
        { success: false, error: reason || 'Tentativa de injeção SQL bloqueada pelo sistema.' },
        { status: 400 }
      );
    }

    const { email, password } = sanitized;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const deviceInfo = getDeviceInfoFromRequest(req);

    // 2. Verificar bloqueio por tentativas (Brute-Force & Lockout)
    const { data: tracking } = await supabaseAdmin
      .from('login_security_tracking')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    const now = new Date();

    if (tracking && tracking.locked_until) {
      const lockedUntil = new Date(tracking.locked_until);
      if (now < lockedUntil) {
        const remainingSeconds = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        return NextResponse.json(
          {
            success: false,
            locked: true,
            remainingSeconds,
            escalationLevel: tracking.escalation_level,
            error: `Acesso temporariamente congelado por excesso de tentativas. Tente novamente em ${timeDisplay}.`,
          },
          { status: 429 }
        );
      }
    }

    // 3. Tentar autenticação no Supabase
    let { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Se falhar e houver whitespace copiado por engano, tentar com trim
    if (authError && password.trim() !== password) {
      const retry = await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });
      if (!retry.error) {
        authData = retry.data;
        authError = null;
      }
    }

    // =========================================================================
    // CASO DE FALHA NA AUTENTICAÇÃO
    // =========================================================================
    if (authError || !authData?.user) {
      let currentAttempts = (tracking?.failed_attempts || 0) + 1;
      let currentLevel = tracking?.escalation_level || 0;
      let lockedUntil: Date | null = null;
      let isLocked = false;
      let lockSeconds = 0;
      let responseMessage = `E-mail ou senha incorretos. Tentativa ${currentAttempts} de 5 antes do bloqueio de segurança.`;

      // Regra de escalonamento:
      // - 1º ciclo: > 5 erros -> 2 minutos
      // - 2º ciclo: + 5 erros -> 5 minutos
      // - 3º ciclo: + 5 erros -> 15 minutos + envio de e-mail de alerta
      if (currentAttempts >= 5) {
        isLocked = true;
        currentAttempts = 0; // Reinicia o contador para o próximo ciclo

        if (currentLevel === 0) {
          lockSeconds = 2 * 60; // 2 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 1;
          responseMessage = 'Senha incorreta. Você errou 5 vezes seguidas. O acesso foi congelado por 2 minutos por segurança.';
        } else if (currentLevel === 1) {
          lockSeconds = 5 * 60; // 5 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 2;
          responseMessage = 'Senha incorreta. Você errou mais 5 vezes consecutivas. O acesso foi congelado por 5 minutos.';
        } else {
          lockSeconds = 15 * 60; // 15 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 3;
          responseMessage = 'Senha incorreta. O acesso foi congelado por 15 minutos. Enviamos um e-mail de alerta de segurança para o seu endereço cadastrado.';

          // Disparar envio de e-mail de alerta de segurança
          await sendSecurityAlertEmail({
            email: normalizedEmail,
            ipAddress: deviceInfo.ipAddress,
            attemptCount: 15,
            lockDurationMinutes: 15,
            deviceInfo: deviceInfo.deviceName,
            location: deviceInfo.location,
          });
        }
      }

      // Upsert tracking record
      await supabaseAdmin.from('login_security_tracking').upsert(
        {
          email: normalizedEmail,
          failed_attempts: currentAttempts,
          escalation_level: currentLevel,
          locked_until: lockedUntil ? lockedUntil.toISOString() : null,
          last_failed_at: now.toISOString(),
          last_ip: deviceInfo.ipAddress,
          updated_at: now.toISOString(),
        },
        { onConflict: 'email' }
      );

      return NextResponse.json(
        {
          success: false,
          locked: isLocked,
          remainingSeconds: lockSeconds,
          attempts: currentAttempts,
          escalationLevel: currentLevel,
          error: responseMessage,
        },
        { status: isLocked ? 429 : 401 }
      );
    }

    // =========================================================================
    // CASO DE SUCESSO NA AUTENTICAÇÃO
    // =========================================================================
    // Resetar contadores de segurança após login bem-sucedido
    if (tracking) {
      await supabaseAdmin
        .from('login_security_tracking')
        .update({
          failed_attempts: 0,
          escalation_level: 0,
          locked_until: null,
          updated_at: now.toISOString(),
        })
        .eq('email', normalizedEmail);
    }

    const userId = authData.user.id;

    // Regra de Sessão Única Concorrente:
    // Se o usuário entrar em outro dispositivo, o dispositivo anterior é desconectado.
    await supabaseAdmin
      .from('user_active_sessions')
      .update({
        is_active: false,
        replaced_by_device: deviceInfo.deviceName,
        replaced_by_location: deviceInfo.location,
        replaced_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Criar nova sessão ativa para o dispositivo atual
    const sessionToken = crypto.randomUUID();
    await supabaseAdmin.from('user_active_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      device_name: deviceInfo.deviceName,
      ip_address: deviceInfo.ipAddress,
      location: deviceInfo.location,
      is_active: true,
      created_at: now.toISOString(),
      last_heartbeat_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      session: authData.session,
      user: authData.user,
      sessionToken,
      deviceName: deviceInfo.deviceName,
      location: deviceInfo.location,
    });
  } catch (err: any) {
    console.error('[API /api/auth/login Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao processar solicitação de login.' },
      { status: 500 }
    );
  }
}
