/**
 * Asaas Payment Gateway Server-Side Service
 * AppSec Hardening: All requests to Asaas are strictly server-side.
 * Secret keys are never exposed to browser clients.
 */

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

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
}

async function asaasFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY is not configured on the server.');
  }

  const url = `${ASAAS_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.errors?.[0]?.description || 'Erro ao processar requisição no Asaas';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const asaasService = {
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
  async createPayment(input: AsaasPaymentInput): Promise<any> {
    const payload: any = {
      customer: input.customer,
      billingType: input.billingType,
      value: input.value,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference
    };

    if (input.installmentCount && input.installmentCount > 1) {
      payload.installmentCount = input.installmentCount;
      if (input.installmentValue) {
        payload.installmentValue = input.installmentValue;
      }
    }

    if (input.billingType === 'CREDIT_CARD' && input.creditCard) {
      payload.creditCard = input.creditCard;
      payload.creditCardHolderInfo = input.creditCardHolderInfo;
    }

    return asaasFetch('/payments', {
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

  /**
   * Consulta status de uma cobrança existente
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    return asaasFetch(`/payments/${paymentId}`);
  }
};
