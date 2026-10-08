import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getCurrentBatchPrice, resolveOfferTimerSession } from '@/utils/offerPricing';
import { provisionSupabaseUserAndProfile } from '@/services/userService';
import { validateAndSanitizeBody } from '@/utils/security';
import { getAsaasInstallmentNumber } from '@/utils/asaasPricing';

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
      macAddress,
      isExpired = false,
      hasDiscount25 = false
    } = requestData;

    // 1. Validação básica de entrada
    if (!name || !email || !cpfCnpj || !billingType) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Validação estrita do cronômetro no servidor por MAC e IP (Anti-Fraude)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const cookieMac = req.cookies.get('flmmkr_device_mac')?.value;
    const finalMac = (macAddress || cookieMac || '').trim();

    // Recuperar atribuição de tráfego (origem, UTM, device fingerprint)
    const cookieAttrRaw = req.cookies.get('flmmkr_attribution')?.value;
    let cookieAttr: any = null;
    if (cookieAttrRaw) {
      try {
        cookieAttr = JSON.parse(decodeURIComponent(cookieAttrRaw));
      } catch {}
    }
    const finalTrafficSource = requestData.trafficSource || cookieAttr?.sourceName || 'Direto';
    const finalDeviceFp = finalMac || cookieAttr?.deviceFingerprint || null;
    const finalUtmSource = requestData.utmSource || cookieAttr?.utmSource || null;
    const finalReferrer = requestData.referrer || req.headers.get('referer') || null;

    telemetryMeta = {
      trafficSource: finalTrafficSource,
      deviceFingerprint: finalDeviceFp || undefined,
      ip,
      utmSource: finalUtmSource || undefined,
      referrer: finalReferrer || undefined
    };

    const batchInfo = getCurrentBatchPrice(new Date());
    let isRealExpired = false;

    if (productId !== 'color-master-completo') {
      if (batchInfo.isLaunchPhase) {
        // Até 09/10/2026 às 23:59:59: Preço fixo de R$ 95 sem contagem regressiva de expiração
        isRealExpired = false;
      } else {
        try {
          const timerSession = await resolveOfferTimerSession({
            macAddress: finalMac,
            ip,
            userAgent: req.headers.get('user-agent') || undefined
          });
          const now = Date.now();
          const expiresAtTime = new Date(timerSession.expiresAt).getTime();
          isRealExpired = now >= expiresAtTime || timerSession.isExpired;
        } catch (timerErr) {
          console.warn('Erro ao validar timer no checkout:', timerErr);
          isRealExpired = Boolean(isExpired);
        }
      }
    }

    // 3. Definir valor baseado no lote promocional e expiração validada pelo servidor
    let productValue = 95;
    let productDescription = `Masterclass Color Master | Produto (${batchInfo.batchName})`;

    if (productId === 'color-master-completo') {
      productValue = 497.0;
      productDescription = 'Color Master Completo - FLMMKR';
    } else if (batchInfo.isLaunchPhase) {
      // Fase de lançamento (até 09/10): valor garantido R$ 95
      productValue = 95;
    } else {
      // Pós-lançamento (a partir de 10/10):
      // Se não expirou (dentro dos 15 min): R$ 95 (promoção antiga garantida)
      // Se expirou: preço vigente do momento (R$ 125, R$ 150 ou R$ 195)
      productValue = isRealExpired ? batchInfo.currentBatchPrice : 95;

      // Se aplicou desconto de 25% pelo link do tooltip após expirar:
      if (hasDiscount25 && isRealExpired) {
        productValue = Math.round(batchInfo.currentBatchPrice * 0.75);
        productDescription += ' (Desconto Especial 25% OFF)';
      }
    }

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
          externalReference: `cm_${Date.now()}`,
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

        // Verificar se pagamento foi confirmado imediatamente
        const isApproved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

        if (isApproved) {
          // Criar ou atualizar usuário no Supabase Auth e tabela profiles
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
      const payment = await asaasService.createPayment({
        customer: customer.id,
        billingType: 'PIX',
        value: productValue,
        dueDate: dueDateStr,
        description: productDescription,
        externalReference: `pix_${Date.now()}`
      });

      // Salvar na tabela de checkouts pendentes aguardando confirmação do PIX
      try {
        await supabaseAdmin.from('pending_checkouts').upsert({
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
          status: 'PENDING',
          traffic_source: finalTrafficSource,
          device_fingerprint: finalDeviceFp,
          ip,
          utm_source: finalUtmSource,
          referrer: finalReferrer,
          updated_at: new Date().toISOString()
        }, { onConflict: 'payment_id' });
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
      { error: error?.message || 'Falha ao processar pagamento.' },
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
