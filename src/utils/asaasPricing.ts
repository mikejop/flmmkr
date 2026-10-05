/**
 * Tabela e cálculo oficial de parcelamento com repasse de juros/taxas no cartão de crédito via Asaas.
 * No Asaas, quando o cliente assume as taxas do parcelamento (isFeePaidByCustomerAccount: true),
 * os valores oficiais de cada parcela retornados pelo endpoint oficial da Asaas
 * (/paymentCampaignBill/buildInstallmentList) são os tabelados abaixo.
 */

export const ASAAS_INSTALLMENT_SCHEDULES: Record<number, Record<number, number>> = {
  // Preço R$ 95 (1º Lote de Lançamento)
  95: {
    1: 95.00,
    2: 49.46,
    3: 32.97,
    4: 24.73,
    5: 19.78,
    6: 16.48,
    7: 14.20,
    8: 12.42,
    9: 11.04,
    10: 9.93,
    11: 9.03,
    12: 8.28,
  },
  // Preço R$ 125 (2º Lote)
  125: {
    1: 125.00,
    2: 65.00,
    3: 43.33,
    4: 32.50,
    5: 25.99,
    6: 21.66,
    7: 18.66,
    8: 16.33,
    9: 14.51,
    10: 13.06,
    11: 11.87,
    12: 10.88,
  },
  // Preço R$ 145 (3º Lote)
  145: {
    1: 145.00,
    2: 75.37,
    3: 50.24,
    4: 37.68,
    5: 30.14,
    6: 25.11,
    7: 21.64,
    8: 18.93,
    9: 16.83,
    10: 15.14,
    11: 13.76,
    12: 12.62,
  },
  // Preço R$ 195 (Preço Oficial Regular)
  195: {
    1: 195.00,
    2: 101.27,
    3: 67.51,
    4: 50.63,
    5: 40.50,
    6: 33.75,
    7: 29.08,
    8: 25.44,
    9: 22.61,
    10: 20.35,
    11: 18.49,
    12: 16.96,
  },
};

/**
 * Retorna o valor numérico exato da parcela no Asaas com taxa (ex: 8.28)
 */
export function getAsaasInstallmentNumber(price: number, installmentCount: number = 12): number {
  if (installmentCount <= 1) {
    return price;
  }

  const schedule = ASAAS_INSTALLMENT_SCHEDULES[price];
  if (schedule && schedule[installmentCount]) {
    return schedule[installmentCount];
  }

  // Fallback baseado no coeficiente real do Asaas para cartão parcelado com acréscimo ao comprador
  return Number(((price * 1.0437) / installmentCount).toFixed(2));
}

/**
 * Retorna a string formatada da parcela no Asaas (ex: "8,28")
 */
export function getAsaasInstallmentValue(price: number, installmentCount: number = 12): string {
  const num = getAsaasInstallmentNumber(price, installmentCount);
  return num.toFixed(2).replace('.', ',');
}

/**
 * Retorna especificamente o valor da parcela em 12x no Asaas (ex: "8,28" para R$ 95, "16,96" para R$ 195)
 */
export function getAsaas12xInstallmentValue(price: number): string {
  return getAsaasInstallmentValue(price, 12);
}

/**
 * Retorna a string pronta de exibição (ex: "12x de R$ 8,28" ou "12x de R$ 16,96")
 */
export function formatAsaas12x(price: number): string {
  return `12x de R$ ${getAsaas12xInstallmentValue(price)}`;
}
