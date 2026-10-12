import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createIsolatedAuthClient } from '@/utils/supabase/admin';
import { getDeviceInfoFromRequest } from '@/utils/deviceDetection';
import { sendSecurityAlertEmail } from '@/services/notificationService';
import { verifyAndSyncPaymentAccess } from '@/services/paymentVerificationService';
import crypto from 'crypto';
import { writeSupabaseSessionCookies } from '@/utils/supabase/sessionCookies';
import { z } from 'zod';
import { isIP } from 'node:net';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(1024),
}).strict();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parsedBody = loginSchema.safeParse(rawBody);
    if (!parsedBody.success) return NextResponse.json({ success: false, error: 'E-mail ou senha inválidos.' }, { status: 400 });
    const { email: normalizedEmail, password } = parsedBody.data;
    const deviceInfo = getDeviceInfoFromRequest(req);
    const parsedIp = deviceInfo.ipAddress ? z.string().refine((value) => isIP(value) !== 0).safeParse(deviceInfo.ipAddress) : null;
    if (parsedIp && !parsedIp.success) return NextResponse.json({ success: false, error: 'IP inválido.' }, { status: 400 });
    const clientIp = parsedIp?.success ? parsedIp.data : '';
    const ipKey = clientIp ? `client_ip:${clientIp}` : null;
    const now = new Date();

    // 2. Verificar bloqueio por tentativas (Brute-Force & Lockout) no Banco de Dados
    // Busca registros por e-mail e por IP do cliente
    const [emailResult, ipResult] = await Promise.all([
      supabaseAdmin.from('login_security_tracking').select('*').eq('email', normalizedEmail).maybeSingle(),
      ipKey
        ? supabaseAdmin.from('login_security_tracking').select('*').eq('email', ipKey).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (emailResult.error || ipResult.error) throw new Error('Não foi possível verificar o acesso.');
    const emailTracking = emailResult.data;
    const ipTracking = ipResult.data;

    // Verifica se o e-mail ou o IP estão com bloqueio ativo no banco
    const activeLock = [emailTracking, ipTracking].find((t) => {
      if (!t?.locked_until) return false;
      return new Date(t.locked_until) > now;
    });

    if (activeLock && activeLock.locked_until) {
      return NextResponse.json(
        {
          success: false,
          error: 'E-mail ou senha incorretos.',
        },
        { status: 429 }
      );
    }

    // Calcula tentativas prévias com base no banco de dados
    const getEffectiveAttempts = (record: any) => {
      if (!record) return 0;
      // Se estava bloqueado e o tempo já passou, o novo ciclo começa do 0
      if (record.locked_until && new Date(record.locked_until) <= now) {
        return 0;
      }
      // Se o último erro foi há mais de 45 minutos sem bloqueio, reseta contagem
      if (record.last_failed_at) {
        const diffMs = now.getTime() - new Date(record.last_failed_at).getTime();
        if (diffMs > 45 * 60 * 1000) {
          return 0;
        }
      }
      return Number(record.failed_attempts) || 0;
    };

    const prevAttempts = Math.max(
      getEffectiveAttempts(emailTracking),
      getEffectiveAttempts(ipTracking)
    );

    // 3. Tentar autenticação no Supabase Auth usando cliente de autenticação isolado
    const authClient = createIsolatedAuthClient();
    let { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Se falhar e houver whitespace copiado por engano, tentar com trim
    if (authError && typeof password === 'string' && password.trim() !== password) {
      const retry = await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });
      if (!retry.error) {
        authData = retry.data;
        authError = null;
      }
    }

    // =========================================================================
    // CASO DE FALHA NA AUTENTICAÇÃO (CONTADOR NO BANCO DE DADOS)
    // =========================================================================
    if (authError || !authData?.user) {
      const currentAttempts = prevAttempts + 1;
      let currentLevel = Math.max(emailTracking?.escalation_level || 0, ipTracking?.escalation_level || 0);
      let lockedUntil: Date | null = null;
      let isLocked = false;
      let lockSeconds = 0;

      // Regra de bloqueio a partir do 5º erro:
      if (currentAttempts >= 5) {
        isLocked = true;
        if (currentLevel === 0) {
          lockSeconds = 2 * 60; // 2 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 1;
        } else if (currentLevel === 1) {
          lockSeconds = 5 * 60; // 5 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 2;
        } else {
          lockSeconds = 15 * 60; // 15 minutos
          lockedUntil = new Date(Date.now() + lockSeconds * 1000);
          currentLevel = 3;

          await sendSecurityAlertEmail({
            email: normalizedEmail,
            ipAddress: clientIp,
            attemptCount: 15,
            lockDurationMinutes: 15,
            deviceInfo: deviceInfo.deviceName,
            location: deviceInfo.location,
          }).catch(() => {});
        }
      }

      // Persistir no banco de dados tanto para o e-mail quanto para o IP do cliente
      const trackingPayload = {
        failed_attempts: currentAttempts,
        escalation_level: currentLevel,
        locked_until: lockedUntil ? lockedUntil.toISOString() : null,
        last_failed_at: now.toISOString(),
        last_ip: clientIp || null,
        updated_at: now.toISOString(),
      };

      const trackingWrites = [supabaseAdmin.from('login_security_tracking').upsert(
        { email: normalizedEmail, ...trackingPayload }, { onConflict: 'email' }
      )];
      if (ipKey) trackingWrites.push(supabaseAdmin.from('login_security_tracking').upsert(
        { email: ipKey, ...trackingPayload }, { onConflict: 'email' }
      ));
      await Promise.all(trackingWrites);
      await supabaseAdmin.from('security_audit_logs').insert({
        event_type: 'login_failed',
        email: normalizedEmail,
        details: { ip: clientIp || null, attempts: currentAttempts, locked: isLocked },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'E-mail ou senha incorretos.',
        },
        { status: isLocked ? 429 : 401 }
      );
    }

    // =========================================================================
    // CASO DE SUCESSO NA AUTENTICAÇÃO
    // =========================================================================
    const userId = authData.user.id;
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'login_succeeded',
      user_id: userId,
      email: normalizedEmail,
      details: { ip: clientIp || null },
    });

    // Regra Zero-Trust: Dupla Validação de Pagamento (Servidor + Asaas)
    const paymentCheck = await verifyAndSyncPaymentAccess({
      userId,
      email: normalizedEmail,
    });

    if (!paymentCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Acesso bloqueado: pagamento não confirmado no Asaas (${paymentCheck.reason || 'Status não pago'}).`,
        },
        { status: 403 }
      );
    }

    // Resetar contadores de segurança no banco de dados após login bem-sucedido
    const trackingResets = [
      supabaseAdmin
        .from('login_security_tracking')
        .update({
          failed_attempts: 0,
          escalation_level: 0,
          locked_until: null,
          updated_at: now.toISOString(),
        })
        .eq('email', normalizedEmail),
    ];
    if (ipKey) trackingResets.push(supabaseAdmin
        .from('login_security_tracking')
        .update({
          failed_attempts: 0,
          escalation_level: 0,
          locked_until: null,
          updated_at: now.toISOString(),
        })
        .eq('email', ipKey));
    await Promise.all(trackingResets);

    // Regra de Sessão Única Concorrente
    const { error: deactivateError } = await supabaseAdmin
      .from('user_active_sessions')
      .update({
        is_active: false,
        replaced_by_device: deviceInfo.deviceName,
        replaced_by_location: deviceInfo.location,
        replaced_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);
    if (deactivateError) throw deactivateError;

    // Criar nova sessão ativa para o dispositivo atual
    const sessionToken = crypto.randomUUID();
    const { error: sessionError } = await supabaseAdmin.from('user_active_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      device_name: deviceInfo.deviceName,
      ip_address: deviceInfo.ipAddress,
      location: deviceInfo.location,
      is_active: true,
      created_at: now.toISOString(),
      last_heartbeat_at: now.toISOString(),
    });
    if (sessionError) throw sessionError;

    const response = NextResponse.json({ success: true, sessionToken });
    await writeSupabaseSessionCookies(req, response, authData.session);
    return response;
  } catch (err: any) {
    console.error('[API /api/auth/login Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao processar solicitação de login.' },
      { status: 500 }
    );
  }
}
