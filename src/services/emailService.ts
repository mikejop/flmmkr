/**
 * Email Service - Anti-Spam Optimized
 * Formatação simples, botão clicável e link alternativo textual.
 * Otimizado para entregabilidade máxima (RFC 5322 compliance, fallback text/plain, sem termos gatilho de spam).
 */

import { supabaseAdmin } from '@/utils/supabase/admin';
import { getServerSecret } from '@/utils/serverSecrets';

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

  const textBody = `Bem-vindo, ${firstName}. Seu acesso está liberado.

Sua compra da Masterclass Color Master® | Produtos foi confirmada.

Para criar sua senha e acessar a plataforma, abra o seu link exclusivo:
${activationUrl}

Este link é pessoal e exclusivo para ${normalizedEmail}. Não compartilhe com outras pessoas.

Precisa de ajuda? Responda este e-mail ou escreva para contato@flmmkr.com.br.

FLMMKR - Color Master® | Produtos`;

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

  console.log('[Email Service] Link de ativação preparado para envio.');

  // Registrar auditoria no Supabase
  try {
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'activation_email_dispatched',
      email: normalizedEmail,
      details: {
        recipient: normalizedEmail,
        timestamp: new Date().toISOString()
      }
    });
  } catch (logErr) {
    console.error('[Email Service] Falha ao registrar log:', logErr);
  }

  // 1. Envio de alta entregabilidade via Resend SDK
  try {
    const resendApiKey = await getServerSecret('resendApiKey');
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const sender = process.env.EMAIL_FROM || 'FLMMKR <contato@flmmkr.site>';
    const { data, error } = await resend.emails.send({
      from: sender,
      to: [normalizedEmail],
      replyTo: process.env.EMAIL_REPLY_TO || 'contato@flmmkr.com.br',
      // Assunto transacional e neutro (sem termos promocionais como "exclusivo")
      subject: 'Seu acesso ao Color Master está pronto',
      html: htmlBody,
      text: textBody,
      headers: {
        // ID único por envio evita agrupamento/threading suspeito no Gmail
        'X-Entity-Ref-ID': crypto.randomUUID()
      }
    });

    if (error) {
      console.error('[Email Service] Falha ao enviar via Resend:', error);
    } else {
      console.log('[Email Service] E-mail de ativação enviado com sucesso via Resend.');
      return true;
    }
  } catch (resendErr) {
    console.error('[Email Service] Exceção ao enviar via Resend SDK:', resendErr);
  }

  // Falha real: quem chama precisa saber (o aluno pagou e não recebeu o link). Avisa o administrador.
  try {
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'activation_email_failed',
      email: normalizedEmail,
      details: { timestamp: new Date().toISOString() }
    });
  } catch { /* só registro */ }
  await sendAdminAlert({
    subject: 'E-mail de ativação NÃO foi enviado',
    text: `Um aluno pagou e o e-mail de primeiro acesso falhou (${normalizedEmail}). O sistema tenta de novo no reenvio do webhook; se persistir, envie o link manualmente ou peça para ele usar "Enviar novo link" na página de primeiro acesso.`,
  });
  return false;
}

/**
 * Alerta operacional para o administrador (ADMIN_ALERT_EMAIL). Texto simples, sem dado pessoal além do necessário.
 * Nunca lança. Sem ADMIN_ALERT_EMAIL ou sem Resend, só registra no log do servidor.
 */
export async function sendAdminAlert({ subject, text }: { subject: string; text: string }): Promise<void> {
  const to = process.env.ADMIN_ALERT_EMAIL?.trim();
  console.warn('[admin-alert]', subject);
  if (!to) {
    console.error('[admin-alert] ADMIN_ALERT_EMAIL ausente: alerta não enviado.');
    return;
  }
  try {
    const resendApiKey = await getServerSecret('resendApiKey');
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FLMMKR <contato@flmmkr.site>',
      to: [to],
      subject: `[FLMMKR] ${subject}`.slice(0, 150),
      text,
    });
    if (error) console.error('[admin-alert] falha ao enviar:', error);
  } catch (err) {
    console.error('[admin-alert] exceção ao enviar:', err instanceof Error ? err.message : err);
  }
}
