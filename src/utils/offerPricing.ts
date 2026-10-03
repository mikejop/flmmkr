export interface UserTimerRecord {
  id?: string;
  ip: string;
  clientIdentifier: string;
  userAgent: string;
  firstAccessAt: string;
  expiresAt: string;
  isExpired: boolean;
  createdAt?: string;
}

/**
 * Função para calcular o preço promocional de acordo com as datas dos lotes:
 * - Até 06/10/2026: R$ 95
 * - De 07/10/2026 até 09/10/2026: R$ 125
 * - De 10/10/2026 até 13/10/2026: R$ 145
 * - A partir de 14/10/2026: R$ 195 (Preço normal)
 */
export function getCurrentBatchPrice(now: Date = new Date()): {
  promoPrice: number;
  regularPrice: number;
  batchName: string;
  nextPriceDate?: string;
} {
  const regularPrice = 195;
  const currentYear = now.getFullYear();

  const refDate = new Date(now);
  if (currentYear < 2026) {
    refDate.setFullYear(2026);
  }

  const lote1End = new Date('2026-10-06T23:59:59-03:00');
  const lote2End = new Date('2026-10-09T23:59:59-03:00');
  const lote3End = new Date('2026-10-13T23:59:59-03:00');

  if (refDate <= lote1End) {
    return {
      promoPrice: 95,
      regularPrice,
      batchName: 'Lote Especial de Abertura',
      nextPriceDate: '06/10/2026'
    };
  }

  if (refDate <= lote2End) {
    return {
      promoPrice: 125,
      regularPrice,
      batchName: '2º Lote Promocional',
      nextPriceDate: '09/10/2026'
    };
  }

  if (refDate <= lote3End) {
    return {
      promoPrice: 145,
      regularPrice,
      batchName: '3º Lote Promocional',
      nextPriceDate: '13/10/2026'
    };
  }

  return {
    promoPrice: regularPrice,
    regularPrice,
    batchName: 'Preço Oficial Regular'
  };
}

/**
 * Adapter preparado para o Supabase
 * Quando você rodar o comando para instalar o Supabase, basta preencher as credenciais no .env
 */
export async function saveSessionToSupabase(record: UserTimerRecord): Promise<void> {
  // Mock pronto: quando o cliente Supabase for configurado, descomente o bloco abaixo:
  /*
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    await supabase.from('timer_sessions').upsert({
      ip: record.ip,
      client_identifier: record.clientIdentifier,
      user_agent: record.userAgent,
      first_access_at: record.firstAccessAt,
      expires_at: record.expiresAt,
      is_expired: record.isExpired
    }, { onConflict: 'client_identifier' });
  }
  */
  console.log('[Supabase Timer Prepared] Sessão gravada no servidor:', record);
}
