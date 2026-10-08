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

  // Calcular data de expiração (1 ano após ativação)
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  const formattedExpiration = expirationDate.toLocaleDateString('pt-BR');

  let htmlBody = '';
  try {
    const fs = await import('fs');
    const path = await import('path');
    const templatePath = path.resolve(process.cwd(), 'src/templates/email-boas-vindas.html');
    if (fs.existsSync(templatePath)) {
      const rawHtml = fs.readFileSync(templatePath, 'utf8');
      htmlBody = rawHtml
        .replace(/\{\{nome\}\}/g, firstName)
        .replace(/\{\{link_acesso\}\}/g, activationUrl)
        .replace(/\{\{data_expiracao\}\}/g, formattedExpiration)
        .replace(/\{\{email_cliente\}\}/g, normalizedEmail);
    }
  } catch (readErr) {
    console.warn('[Email Service] Falha ao ler template externo, usando fallback:', readErr);
  }

  if (!htmlBody) {
    htmlBody = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Seu acesso ao Color Master® | Produtos</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #1d1d1f;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 28px; padding: 40px; text-align: left;">
    <div style="font-size: 40px; font-weight: 800; letter-spacing: 2px; color: #1d1d1f; margin-bottom: 24px; text-align: center;">FLMMKR</div>
    <h1 style="font-size: 32px; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0;">Bem-vindo, ${firstName}.<br>Seu acesso está liberado.</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #6e6e73;">Sua compra foi confirmada com sucesso.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${activationUrl}" style="background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 980px; font-size: 16px; font-weight: 700; display: inline-block;">Acessar o Color Master®</a>
    </div>
    <p style="font-size: 13px; color: #6e6e73;">Este link é pessoal e exclusivo para ${normalizedEmail}.</p>
  </div>
</body>
</html>`;
  }

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

  // 1. Envio de alta entregabilidade via Resend SDK
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      const sender = process.env.EMAIL_FROM || 'FLMMKR <contato@flmmkr.site>';
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [normalizedEmail],
        subject: 'Seu acesso exclusivo ao COLOR MASTER® | FLMMKR',
        html: htmlBody,
        text: textBody,
        headers: {
          'X-Entity-Ref-ID': Buffer.from(activationUrl).toString('base64').slice(0, 16)
        }
      });

      if (error) {
        console.error('[Email Service] Falha ao enviar via Resend:', error);
      } else {
        console.log(`[Email Service] E-mail de ativação enviado com sucesso via Resend para ${normalizedEmail}. ID: ${data?.id}`);
        return true;
      }
    } catch (resendErr) {
      console.error('[Email Service] Exceção ao enviar via Resend SDK:', resendErr);
    }
  }

  return true;
}
