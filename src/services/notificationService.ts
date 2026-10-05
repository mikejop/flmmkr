/**
 * Notification Service for Security Alerts
 * Sends security email notifications when suspicious activity or repeated failed login attempts occur.
 */

import { supabaseAdmin } from '@/services/userService';

interface SecurityAlertOptions {
  email: string;
  ipAddress?: string;
  attemptCount: number;
  lockDurationMinutes: number;
  deviceInfo?: string;
  location?: string;
}

export async function sendSecurityAlertEmail(options: SecurityAlertOptions): Promise<boolean> {
  const { email, ipAddress, lockDurationMinutes, deviceInfo, location } = options;

  console.warn(`[SECURITY ALERT] Tentativas excessivas de login detectadas para: ${email} a partir de ${ipAddress || 'IP desconhecido'}`);

  try {
    // 1. Registrar na tabela de auditoria de segurança
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'login_lockout_escalated',
      email: email.toLowerCase().trim(),
      ip_address: ipAddress || null,
      details: {
        lockDurationMinutes,
        deviceInfo: deviceInfo || null,
        location: location || null,
        timestamp: new Date().toISOString(),
      },
    });

    // 2. Se houver provedor de e-mail (Resend ou Supabase Auth), enviar notificação por e-mail
    // Verificamos se há RESEND_API_KEY ou usamos template de segurança
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Segurança FLMMKR <seguranca@flmmkr.com.br>',
          to: [email],
          subject: '⚠️ Alerta de Segurança: Tentativas suspeitas de acesso à sua conta',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #0c0d10; color: #f5f5f7; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 22px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff;">FLMMKR</span>
                <p style="font-size: 12px; color: #0071e3; margin-top: 4px; text-transform: uppercase; font-weight: 700;">Alerta de Proteção de Conta</p>
              </div>
              <div style="background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #ff453a; margin: 0 0 8px 0; font-size: 15px;">Acesso temporariamente bloqueado por 15 minutos</h3>
                <p style="color: #f5f5f7; font-size: 13px; margin: 0; line-height: 1.5;">
                  Identificamos mais de 15 tentativas incorretas consecutivas de senha na sua conta. Para garantir a segurança dos seus cursos e dados, congelamos temporariamente novas tentativas de login.
                </p>
              </div>
              <p style="font-size: 13px; color: #a1a1a6; line-height: 1.6;">
                <strong>Horário:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}<br/>
                <strong>IP:</strong> ${ipAddress || 'Não identificado'}<br/>
                <strong>Localização aproximada:</strong> ${location || 'Brasil'}
              </p>
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #86868b; text-align: center;">
                Se você não reconhece esta atividade, recomendamos redefinir sua senha imediatamente assim que o período de proteção expirar.
              </div>
            </div>
          `,
        }),
      });
    }

    return true;
  } catch (err) {
    console.error('Erro ao enviar e-mail de alerta de segurança:', err);
    return false;
  }
}
