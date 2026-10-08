/**
 * Email Service - Anti-Spam Optimized
 * Formatação simples, botão clicável e link alternativo textual.
 * Otimizado para entregabilidade máxima (RFC 5322 compliance, fallback text/plain, sem termos gatilho de spam).
 */

import { supabaseAdmin } from '@/utils/supabase/admin';

export interface SendActivationEmailOptions {
  email: string;
  name: string;
  activationUrl: string;
}

export async function sendActivationEmail({
  email,
  name,
  activationUrl
}: SendActivationEmailOptions): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const firstName = name.trim().split(' ')[0] || 'Aluno(a)';

  const textBody = `Olá, ${firstName}!

Seu pagamento foi confirmado com sucesso e seu acesso ao COLOR MASTER® | PRODUTO está liberado.

Para cadastrar sua senha e acessar a plataforma, utilize o link exclusivo abaixo:
${activationUrl}

Caso o botão não funcione, você pode copiar e colar o link diretamente no seu navegador.
Este link é seguro, pessoal e intransferível.

Equipe FLMMKR
contato@flmmkr.site`;

  const htmlBody = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Acesso — COLOR MASTER®</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #0c0d10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f7;">
  <div style="max-width: 540px; margin: 0 auto; background-color: #121318; border: 1px solid #232530; border-radius: 12px; padding: 36px 28px; text-align: left;">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 19px; font-weight: 800; letter-spacing: 0.14em; color: #ffffff;">FLMMKR</span>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #8e8e93; margin-top: 4px;">COLOR MASTER® | PRODUTO</div>
    </div>
    
    <p style="font-size: 15px; line-height: 1.6; color: #e5e5ea; margin-bottom: 24px;">
      Olá, <strong>${firstName}</strong>.<br />
      Seu pagamento foi confirmado. Para acessar o curso, libere o seu primeiro acesso cadastrando a sua senha.
    </p>

    <!-- Botão de Ação Clicável -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${activationUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: -0.01em;">
        Liberar Meu Acesso
      </a>
    </div>

    <!-- Link Textual Alternativo -->
    <div style="border-top: 1px solid #232530; padding-top: 20px; margin-top: 32px;">
      <p style="font-size: 12px; line-height: 1.5; color: #8e8e93; margin-bottom: 8px;">
        Se você não conseguir clicar no botão acima, copie e cole o link a seguir no seu navegador:
      </p>
      <a href="${activationUrl}" style="color: #4da3ff; word-break: break-all; text-decoration: underline; font-size: 12px;">${activationUrl}</a>
    </div>

    <p style="font-size: 11px; color: #636366; margin-top: 24px; margin-bottom: 0;">
      Este link é exclusivo para a sua conta e expira em 7 dias. Não compartilhe com terceiros.
    </p>
  </div>
</body>
</html>`;

  console.log(`[Email Service] Link de ativação gerado para ${normalizedEmail}: ${activationUrl}`);

  // Registrar auditoria no Supabase
  try {
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'activation_email_dispatched',
      email: normalizedEmail,
      details: {
        recipient: normalizedEmail,
        activationUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (logErr) {
    console.error('[Email Service] Falha ao registrar log:', logErr);
  }

  // 1. Tentar envio por Resend se configurado
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'FLMMKR <contato@flmmkr.site>',
          to: [normalizedEmail],
          subject: 'Seu acesso exclusivo ao COLOR MASTER® | FLMMKR',
          html: htmlBody,
          text: textBody,
          headers: {
            'X-Entity-Ref-ID': Buffer.from(activationUrl).toString('base64').slice(0, 16)
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[Email Service] Resend error:', errJson);
      } else {
        console.log(`[Email Service] E-mail enviado via Resend com sucesso para ${normalizedEmail}`);
        return true;
      }
    } catch (resendErr) {
      console.error('[Email Service] Falha ao enviar via Resend:', resendErr);
    }
  }

  // 2. Disparo de fallback via Supabase Auth Invite/MagicLink caso aplicável
  try {
    await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: normalizedEmail,
      options: {
        redirectTo: activationUrl
      }
    });
  } catch (supErr) {
    console.warn('[Email Service] Supabase generateLink fallback notice:', supErr);
  }

  return true;
}
