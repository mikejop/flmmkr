/**
 * Asaas Payment Gateway Server-Side Service
 * AppSec Hardening: All requests to Asaas are strictly server-side.
 * Secret keys are never exposed to browser clients.
 */

import { getServerSecret } from '@/utils/serverSecrets';

function getAsaasApiUrl(): string {
  return process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
}

interface AsaasCustomerInput {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
}

interface AsaasPaymentInput {
  customer: string; // Asaas customer ID
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
  value: number;
  totalValue?: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  /** IP de quem paga (recomendado pelo Asaas em cobrança com cartão). */
  remoteIp?: string;
  /** Repasse automático (afiliado): valor fixo da cobrança à vista ou total do parcelamento (dividido entre as parcelas). */
  split?: Array<{ walletId: string; fixedValue?: number; totalFixedValue?: number }>;
}

interface AsaasCustomer {
  id: string;
  name: string;
  email?: string;
  mobilePhone?: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  cityName?: string;
  state?: string;
  postalCode?: string;
}

interface AsaasPayment {
  id: string;
  status: string;
  /** Valor da cobrança (de cada parcela, quando for parcelada). */
  value?: number;
  externalReference?: string | null;
  customer?: string;
  installment?: string | null;
  deleted?: boolean;
  invoiceUrl?: string;
  transactionReceiptUrl?: string | null;
  billingType?: string;
  description?: string | null;
  /** ID do link de pagamento do Asaas, quando a cobrança veio de um. */
  paymentLink?: string | null;
  /** Datas civis (YYYY-MM-DD). O Asaas pode omitir confirmedDate em alguns meios; use a primeira que existir. */
  confirmedDate?: string | null;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  chargeback?: { status?: string } | null;
  errors?: { description?: string }[];
  refusalReason?: string;
}

async function asaasFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = await getServerSecret('asaasApiKey');

  const baseUrl = getAsaasApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'flmmkr-site/1.0',
      'access_token': apiKey,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.errors?.[0]?.description ||
      data?.message ||
      (typeof data === 'string' ? data : 'Erro ao processar requisição no Asaas');
    const apiError = new Error(errorMessage);
    apiError.name = 'AsaasApiError'; // mensagem do Asaas (ex.: cartão recusado) pode ser mostrada ao comprador
    throw apiError;
  }

  return data as T;
}

export const asaasService = {
  /**
   * Obtém os detalhes de um cliente por ID
   */
  async getCustomer(id: string): Promise<AsaasCustomer> {
    return asaasFetch<AsaasCustomer>(`/customers/${id}`);
  },

  /**
   * Procura ou cria um cliente no Asaas
   */
  async findOrCreateCustomer(input: AsaasCustomerInput): Promise<{ id: string; name: string; email: string }> {
    // 1. Procurar por CPF/CNPJ ou email
    const searchUrl = `/customers?cpfCnpj=${encodeURIComponent(input.cpfCnpj.replace(/\D/g, ''))}`;
    const listRes = await asaasFetch<{ data: Array<{ id: string; name: string; email: string }> }>(searchUrl);

    if (listRes.data && listRes.data.length > 0) {
      return listRes.data[0];
    }

    // 2. Criar novo cliente se não existir
    const createRes = await asaasFetch<{ id: string; name: string; email: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        cpfCnpj: input.cpfCnpj.replace(/\D/g, ''),
        email: input.email,
        phone: input.phone?.replace(/\D/g, ''),
        postalCode: input.postalCode?.replace(/\D/g, ''),
        address: input.address,
        addressNumber: input.addressNumber,
        complement: input.complement,
        province: input.province
      })
    });

    return createRes;
  },

  /**
   * Cria uma nova cobrança (PIX, Cartão de Crédito ou Boleto)
   */
  async createPayment(input: AsaasPaymentInput): Promise<AsaasPayment> {
    const isInstallment = !!(input.installmentCount && input.installmentCount > 1);

    const payload: Record<string, unknown> = {
      customer: input.customer,
      billingType: input.billingType,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference
    };

    if (isInstallment) {
      payload.installmentCount = input.installmentCount;
      if (input.installmentValue) {
        payload.installmentValue = input.installmentValue;
      } else {
        payload.totalValue = input.totalValue ?? input.value;
      }
    } else {
      payload.value = input.value;
    }

    if (input.billingType === 'CREDIT_CARD' && input.creditCard) {
      payload.creditCard = input.creditCard;
      payload.creditCardHolderInfo = input.creditCardHolderInfo;
      if (input.remoteIp) payload.remoteIp = input.remoteIp;
    }

    if (input.split?.length) payload.split = input.split;

    return asaasFetch<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Obtém QRCode e chave Copia e Cola do PIX para uma cobrança
   */
  async getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
    return asaasFetch(`/payments/${paymentId}/pixQrCode`);
  },

  /** Primeira chave Pix ativa da conta (usada no QR Code estático de doação). */
  async getActivePixAddressKey(): Promise<string | null> {
    const res = await asaasFetch<{ data?: Array<{ key: string }> }>('/pix/addressKeys?status=ACTIVE');
    return res.data?.[0]?.key ?? null;
  },

  /** QR Code Pix estático com valor fixo, sem cliente cadastrado. POST /pix/qrCodes/static */
  async createStaticPixQrCode(input: {
    addressKey: string;
    value: number;
    description: string;
    externalReference: string;
    expirationSeconds: number;
  }): Promise<{ id: string; encodedImage: string; payload: string; expirationDate?: string }> {
    return asaasFetch('/pix/qrCodes/static', {
      method: 'POST',
      body: JSON.stringify({ ...input, format: 'ALL', allowsMultiplePayments: false }),
    });
  },

  /** Cobranças com um externalReference (ex.: o Pix de um QR Code estático depois de pago). */
  async listPaymentsByExternalReference(externalReference: string): Promise<AsaasPayment[]> {
    const res = await asaasFetch<{ data?: AsaasPayment[] }>(`/payments?externalReference=${encodeURIComponent(externalReference)}&limit=10`);
    return res.data ?? [];
  },

  /**
   * Consulta status de uma cobrança existente
   */
  async getPaymentStatus(paymentId: string): Promise<AsaasPayment> {
    return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
  },

  /** Alias com nome mais claro para a consulta completa de uma cobrança. */
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`);
  },

  /** Parcelamento (valor total e quantidade de parcelas). */
  async getInstallment(installmentId: string): Promise<{ id: string; value?: number; installmentCount?: number }> {
    return asaasFetch(`/installments/${encodeURIComponent(installmentId)}`);
  },

  /** Estorno integral de cobrança paga com cartão (à vista) ou Pix. POST /payments/{id}/refund */
  async refundPayment(paymentId: string, description?: string): Promise<AsaasPayment> {
    return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      body: JSON.stringify(description ? { description } : {}),
    });
  },

  /** Estorno de boleto: devolve o link em que o pagador informa os dados bancários. POST /payments/{id}/bankSlip/refund */
  async refundBankSlip(paymentId: string): Promise<{ requestUrl?: string }> {
    return asaasFetch(`/payments/${encodeURIComponent(paymentId)}/bankSlip/refund`, { method: 'POST', body: JSON.stringify({}) });
  },

  /** Estorno integral de parcelamento no cartão. POST /installments/{id}/refund */
  async refundInstallment(installmentId: string): Promise<unknown> {
    return asaasFetch(`/installments/${encodeURIComponent(installmentId)}/refund`, { method: 'POST', body: JSON.stringify({}) });
  },
};
