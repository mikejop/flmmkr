import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      cpfCnpj,
      phone,
      productId,
      billingType, // 'PIX' | 'CREDIT_CARD' | 'BOLETO'
      installments = 1,
      creditCard,
      creditCardHolderInfo
    } = body;

    // 1. Validação básica de entrada
    if (!name || !email || !cpfCnpj || !productId || !billingType) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes.' },
        { status: 400 }
      );
    }

    // 2. Definir valor seguro baseado no produto (calculado no servidor)
    let productValue = 95.0; // Padrão promocional Color Master Produto
    let productDescription = 'Masterclass Color Master | Produto';

    if (productId === 'color-master-produto') {
      productValue = 95.0;
      productDescription = 'Masterclass Color Master | Produto - FLMMKR';
    } else if (productId === 'color-master-completo') {
      productValue = 497.0;
      productDescription = 'Color Master Completo - FLMMKR';
    }

    // 3. Buscar ou criar cliente no Asaas
    const customer = await asaasService.findOrCreateCustomer({
      name,
      email,
      cpfCnpj,
      phone
    });

    // 4. Data de vencimento (Hoje ou amanhã para PIX/Boleto)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // 5. Criar Cobrança
    const payment = await asaasService.createPayment({
      customer: customer.id,
      billingType,
      value: productValue,
      dueDate: dueDateStr,
      description: productDescription,
      externalReference: `prod_${productId}_${Date.now()}`,
      installmentCount: installments > 1 ? installments : undefined,
      creditCard,
      creditCardHolderInfo
    });

    // 6. Se for PIX, buscar dados do QR Code
    let pixData = null;
    if (billingType === 'PIX' && payment.id) {
      try {
        pixData = await asaasService.getPixQrCode(payment.id);
      } catch (pixErr) {
        console.error('Erro ao gerar QR Code PIX:', pixErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
      pix: pixData
    });
  } catch (error: any) {
    console.error('Erro no checkout Asaas:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar pagamento.' },
      { status: 500 }
    );
  }
}
