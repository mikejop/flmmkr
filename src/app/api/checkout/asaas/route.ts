import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { resolveCheckoutPrice, CheckoutPricingError } from '@/services/checkoutPricing';
import { quoteCoupon, recordCouponOrder, COUPON_PRODUCT_IDS } from '@/services/couponService';
import { provisionSupabaseUserAndProfile } from '@/services/userService';
import { validateAndSanitizeBody } from '@/utils/security';
import { getAsaasInstallmentNumber } from '@/utils/asaasPricing';
import { randomUUID } from 'node:crypto';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, consumeKeyRateLimit } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { isProductionRuntime } from '@/utils/runtimeEnv';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let requestData: any = {};
  let telemetryMeta: {
    trafficSource?: string;
    deviceFingerprint?: string;
    ip?: string;
    utmSource?: string;
    referrer?: string;
  } = {};
  try {
    const rawJson = await req.json();
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawJson);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Tentativa de injeção SQL bloqueada.' }, { status: 400 });
    }
    requestData = sanitized;

    const {
      name,
      email,
      cpfCnpj,
      phone,
      birthDate,
      age,
      profession,
      address,
      productId = 'color-master-produto',
      billingType, // 'PIX' | 'CREDIT_CARD'
      installments = 1,
      creditCard,
      creditCardHolderInfo,
      billingInfo,
      // Pricing flags sent by the browser are deliberately ignored.
    } = requestData;

    // 1. Validação básica de entrada
    if (!name || !email || !cpfCnpj || !billingType) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }
    if (!['PIX', 'CREDIT_CARD'].includes(billingType)) {
      return NextResponse.json({ error: 'Método de pagamento não suportado.' }, { status: 400 });
    }
    if (!['color-master-produto', 'color-master-completo'].includes(productId)) {
      return NextResponse.json({ error: 'Produto inválido.' }, { status: 400 });
    }

    const ip = getClientIp(req) || 'UNKNOWN';

    // Anti-abuso: Turnstile + 5 tentativas a cada 15 min por IP e por e-mail.
    const turnstile = await verifyTurnstile(requestData.turnstileToken, ip === 'UNKNOWN' ? null : ip);
    if (!turnstile.ok) {
      if (turnstile.reason === 'misconfigured') {
        return NextResponse.json({ error: 'Pagamento temporariamente indisponível. Tente novamente em instantes.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página e tente de novo.' }, { status: 403 });
    }
    const emailKey = String(email).trim().toLowerCase().slice(0, 254);
    const [ipAllowed, emailAllowed] = await Promise.all([
      consumeRateLimit(req, 'checkout:ip', 5, 900),
      consumeKeyRateLimit(emailKey, 'checkout:email', 5, 900),
    ]);
    if (ipAllowed === null || emailAllowed === null) {
      // Redis e Postgres indisponíveis (ou sem RATE_LIMIT_HMAC_SECRET): em produção o limite nunca é desligado, então recusa.
      if (isProductionRuntime()) {
        console.error('[checkout] rate limit indisponível em produção: checkout recusado.');
        return NextResponse.json({ error: 'Pagamento temporariamente indisponível. Tente novamente em instantes.' }, { status: 503 });
      }
      console.warn('[checkout] rate limit indisponível (fora de produção): seguindo sem limite.');
    }
    if (ipAllowed === false || emailAllowed === false) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, { status: 429, headers: { 'Retry-After': '900' } });
    }

    // Recuperar atribuição de tráfego (origem, UTM, device fingerprint)
    const cookieAttrRaw = req.cookies.get('flmmkr_attribution')?.value;
    let cookieAttr: any = null;
    if (cookieAttrRaw) {
      try {
        cookieAttr = JSON.parse(decodeURIComponent(cookieAttrRaw));
      } catch {}
    }
    const finalTrafficSource = requestData.trafficSource || cookieAttr?.sourceName || 'Direto';
    const finalDeviceFp = cookieAttr?.deviceFingerprint || null;
    const finalUtmSource = requestData.utmSource || cookieAttr?.utmSource || null;
    const finalReferrer = requestData.referrer || req.headers.get('referer') || null;

    telemetryMeta = {
      trafficSource: finalTrafficSource,
      deviceFingerprint: finalDeviceFp || undefined,
      ip,
      utmSource: finalUtmSource || undefined,
      referrer: finalReferrer || undefined
    };

    // Preço sempre derivado no servidor (fase de preço + cronômetro + desconto do tooltip); não existe preço de teste por IP.
    let price;
    try {
      price = await resolveCheckoutPrice(req, productId, ip);
    } catch (pricingError) {
      if (pricingError instanceof CheckoutPricingError) {
        return NextResponse.json({ error: pricingError.message }, { status: pricingError.status });
      }
      throw pricingError;
    }
    let productValue = price.value;
    let productDescription = price.description;

    // Cupom: o navegador manda só o código. O desconto e o valor final saem do servidor, sobre o preço atual.
    let appliedCoupon: { id: string; code: string; original: number; discount: number; final: number } | null = null;
    const couponCodeInput = typeof requestData.couponCode === 'string' ? requestData.couponCode.trim() : '';
    if (couponCodeInput) {
      if (!(COUPON_PRODUCT_IDS as readonly string[]).includes(productId)) {
        return NextResponse.json({ error: 'Este cupom não vale para este produto.' }, { status: 400 });
      }
      const quote = await quoteCoupon(couponCodeInput, price.value);
      if (!quote.ok) {
        return NextResponse.json({ error: quote.message }, { status: quote.reason === 'unavailable' ? 503 : 400 });
      }
      appliedCoupon = { id: quote.coupon.id, code: quote.coupon.code, original: quote.original, discount: quote.discount, final: quote.final };
      productValue = quote.final;
      productDescription = `${price.description} - Cupom ${quote.coupon.code}`.slice(0, 480);
    }
    const couponSuffix = appliedCoupon ? `|${appliedCoupon.code}` : '';

    // Determinar dados de cobrança (se foram informados dados diferentes do cadastro)
    const payerName = billingInfo?.name || name;
    const payerEmail = billingInfo?.email || email;
    const payerCpf = billingInfo?.cpfCnpj || cpfCnpj;
    const payerPhone = billingInfo?.phone || phone;
    const payerAddress = billingInfo?.address || address;

    // 3. Buscar ou criar cliente no Asaas com dados do pagador
    const customer = await asaasService.findOrCreateCustomer({
      name: payerName,
      email: payerEmail,
      cpfCnpj: payerCpf,
      phone: payerPhone,
      postalCode: payerAddress?.postalCode,
      address: payerAddress?.street,
      addressNumber: payerAddress?.number,
      complement: payerAddress?.complement,
      province: payerAddress?.neighborhood
    });

    // 4. Data de vencimento
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // 5. Se for Cartão de Crédito
    if (billingType === 'CREDIT_CARD') {
      try {
        const installmentCountNum = Number(installments) > 1 ? Number(installments) : undefined;
        const installmentValueNum = installmentCountNum
          ? getAsaasInstallmentNumber(productValue, installmentCountNum)
          : undefined;

        const payment = await asaasService.createPayment({
          customer: customer.id,
          billingType: 'CREDIT_CARD',
          value: productValue,
          installmentCount: installmentCountNum,
          installmentValue: installmentValueNum,
          dueDate: dueDateStr,
          description: productDescription,
          externalReference: `cm_${Date.now()}${couponSuffix}`,
          creditCard,
          creditCardHolderInfo: creditCardHolderInfo || {
            name: payerName,
            email: payerEmail,
            cpfCnpj: payerCpf.replace(/\D/g, ''),
            postalCode: payerAddress?.postalCode?.replace(/\D/g, '') || '',
            addressNumber: payerAddress?.number || 'S/N',
            phone: payerPhone?.replace(/\D/g, '') || ''
          }
        });

        if (appliedCoupon) {
          await recordCouponOrder({ paymentId: payment.id, couponId: appliedCoupon.id, couponCode: appliedCoupon.code, productId, original: appliedCoupon.original, discount: appliedCoupon.discount, final: appliedCoupon.final });
        }

        // Verificar se pagamento foi confirmado imediatamente
        const isApproved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

        if (isApproved) {
          // Criar ou atualizar usuário no Supabase Auth e tabela profiles. O pagamento já foi aprovado: se algo
          // falhar aqui (ex.: e-mail), o aluno não pode ver "pagamento recusado". O webhook do Asaas refaz o envio.
          try {
            await provisionSupabaseUserAndProfile({
              email,
              name,
              phone,
              birthDate,
              age: age ? Number(age) : null,
              profession,
              address,
              asaasCustomerId: customer.id,
              asaasPaymentId: payment.id
            });
          } catch (provisionError) {
            console.error('[checkout] pagamento aprovado, mas a criação da conta/e-mail falhou; o webhook tentará de novo:', provisionError instanceof Error ? provisionError.message : provisionError);
          }

          return NextResponse.json({
            success: true,
            status: payment.status,
            activationSent: true,
            email: email.trim().toLowerCase(),
            name
          });
        }

        // Se o cartão foi recusado ou não aprovado pelo Asaas
        const declineReason = payment?.errors?.[0]?.description || payment?.refusalReason || 'Cartão não autorizado ou recusado pela operadora.';
        
        // Registrar lead de recusa no Supabase (em tabela separada de pesquisa)
        await logRecusadoLead({
          name,
          email,
          phone,
          location: formatLocation(address),
          profession,
          paymentMethod: 'cartao_credito',
          reason: declineReason,
          trafficSource: finalTrafficSource,
          deviceFingerprint: finalDeviceFp,
          ip,
          utmSource: finalUtmSource,
          referrer: finalReferrer
        });

        return NextResponse.json(
          { error: `Pagamento não aprovado: ${declineReason}` },
          { status: 400 }
        );
      } catch (cardError: any) {
        const declineReason = cardError?.message || 'Cartão recusado pela operadora.';
        
        // Registrar recusa na tabela de leads de pesquisa
        await logRecusadoLead({
          name,
          email,
          phone,
          location: formatLocation(address),
          profession,
          paymentMethod: 'cartao_credito',
          reason: declineReason,
          trafficSource: finalTrafficSource,
          deviceFingerprint: finalDeviceFp,
          ip,
          utmSource: finalUtmSource,
          referrer: finalReferrer
        });

        return NextResponse.json(
          { error: declineReason },
          { status: 400 }
        );
      }
    }

    // 6. Se for PIX
    if (billingType === 'PIX') {
      // Referência única do pedido: o webhook confere se bate antes de liberar o acesso.
      const pixExternalReference = `pix_${randomUUID()}${couponSuffix}`;
      const payment = await asaasService.createPayment({
        customer: customer.id,
        billingType: 'PIX',
        value: productValue,
        dueDate: dueDateStr,
        description: productDescription,
        externalReference: pixExternalReference
      });

      if (appliedCoupon) {
        await recordCouponOrder({ paymentId: payment.id, couponId: appliedCoupon.id, couponCode: appliedCoupon.code, productId, original: appliedCoupon.original, discount: appliedCoupon.discount, final: appliedCoupon.final });
      }

      // Salvar na tabela de checkouts pendentes aguardando confirmação do PIX
      try {
        const pendingRow = {
          payment_id: payment.id,
          asaas_customer_id: customer.id,
          full_name: name,
          email: email.trim().toLowerCase(),
          phone: phone || null,
          birth_date: birthDate || null,
          age: age ? Number(age) : null,
          profession: profession || null,
          address: address || null,
          amount: productValue,
          external_reference: pixExternalReference,
          status: 'PENDING',
          traffic_source: finalTrafficSource,
          device_fingerprint: finalDeviceFp,
          ip,
          utm_source: finalUtmSource,
          referrer: finalReferrer,
          updated_at: new Date().toISOString()
        };
        let { error: pendingError } = await supabaseAdmin.from('pending_checkouts').upsert(pendingRow, { onConflict: 'payment_id' });
        if (pendingError && /external_reference/.test(pendingError.message || '')) {
          // Migração ainda não aplicada: salva o pedido sem a referência (o webhook segue funcionando).
          const { external_reference: _ignored, ...legacyRow } = pendingRow;
          void _ignored;
          ({ error: pendingError } = await supabaseAdmin.from('pending_checkouts').upsert(legacyRow, { onConflict: 'payment_id' }));
        }
        if (pendingError) console.error('Erro ao salvar pending_checkout:', pendingError.message);
      } catch (dbErr) {
        console.error('Erro ao salvar pending_checkout:', dbErr);
      }

      // Buscar QR Code PIX
      const pixData = await asaasService.getPixQrCode(payment.id);

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        pix: pixData
      });
    }

    return NextResponse.json({ error: 'Método de pagamento não suportado.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro geral no checkout Asaas:', error?.message || error);
    
    // Registrar erro como lead de recusa se dados básicos existirem
    if (requestData?.name) {
      await logRecusadoLead({
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone,
        location: formatLocation(requestData.address),
        profession: requestData.profession,
        paymentMethod: requestData.billingType || 'desconhecido',
        reason: error?.message || 'Erro inesperado no checkout',
        trafficSource: telemetryMeta.trafficSource,
        deviceFingerprint: telemetryMeta.deviceFingerprint,
        ip: telemetryMeta.ip,
        utmSource: telemetryMeta.utmSource,
        referrer: telemetryMeta.referrer
      });
    }

    return NextResponse.json(
      { error: error?.name === 'AsaasApiError' && error?.message ? error.message : 'Falha ao processar pagamento.' },
      { status: 500 }
    );
  }
}


/**
 * Registra lead de recusa no Supabase (isolado dos dados dos alunos)
 */
async function logRecusadoLead({
  name,
  email,
  phone,
  location,
  profession,
  paymentMethod,
  reason,
  trafficSource,
  deviceFingerprint,
  ip,
  utmSource,
  referrer
}: {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  profession?: string;
  paymentMethod?: string;
  reason?: string;
  trafficSource?: string;
  deviceFingerprint?: string;
  ip?: string;
  utmSource?: string;
  referrer?: string;
}) {
  try {
    await supabaseAdmin.from('checkout_abandonment_leads').insert({
      full_name: name,
      email: email || null,
      phone: phone || null,
      location: location || null,
      profession: profession || null,
      status: 'pagamento_recusado',
      payment_method: paymentMethod || null,
      failure_reason: reason || null,
      traffic_source: trafficSource || null,
      device_fingerprint: deviceFingerprint || null,
      ip: ip || null,
      utm_source: utmSource || null,
      referrer: referrer || null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erro ao registrar lead de pagamento recusado:', err);
  }
}

function formatLocation(address?: any): string {
  if (!address) return '';
  const parts = [
    address.city,
    address.state,
    address.neighborhood,
    address.street ? `${address.street}, ${address.number || 'S/N'}` : null
  ].filter(Boolean);
  return parts.join(' - ');
}
