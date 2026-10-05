import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getCurrentBatchPrice } from '@/utils/offerPricing';
import { provisionSupabaseUserAndProfile } from '@/services/userService';

export async function POST(req: NextRequest) {
  let requestData: any = {};
  try {
    requestData = await req.json();

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
      isExpired = false
    } = requestData;

    // 1. Validação básica de entrada
    if (!name || !email || !cpfCnpj || !billingType) {
      return NextResponse.json(
        { error: 'Por favor, preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Definir valor baseado no lote promocional e expiração
    const batchInfo = getCurrentBatchPrice(new Date());
    let productValue = isExpired ? batchInfo.regularPrice : batchInfo.promoPrice;
    let productDescription = `Masterclass Color Master | Produto (${batchInfo.batchName})`;

    if (productId === 'color-master-completo') {
      productValue = 497.0;
      productDescription = 'Color Master Completo - FLMMKR';
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
        const payment = await asaasService.createPayment({
          customer: customer.id,
          billingType: 'CREDIT_CARD',
          value: productValue,
          totalValue: installmentCountNum ? productValue : undefined,
          dueDate: dueDateStr,
          description: productDescription,
          externalReference: `cm_${Date.now()}`,
          installmentCount: installmentCountNum,
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
            redirectUrl: `/definir-senha?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
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
          reason: declineReason
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
          reason: declineReason
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
        reason: error?.message || 'Erro inesperado no checkout'
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
  reason
}: {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  profession?: string;
  paymentMethod?: string;
  reason?: string;
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
