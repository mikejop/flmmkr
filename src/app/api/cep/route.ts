import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCep = searchParams.get('cep') || '';
    const cleanCep = rawCep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido. Deve conter 8 dígitos.' },
        { status: 400 }
      );
    }

    // 1. Tentar Brasil API v2
    try {
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
        headers: { 'User-Agent': 'FLMMKR-Site/1.0' },
        next: { revalidate: 86400 } // Cache por 24h
      });

      if (brasilApiRes.ok) {
        const data = await brasilApiRes.json();
        return NextResponse.json({
          success: true,
          cep: cleanCep,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          service: 'brasilapi'
        });
      }
    } catch (e) {
      console.warn('[CEP Server] Brasil API v2 falhou, tentando fallback:', e);
    }

    // 2. Fallback: Brasil API v1
    try {
      const brasilApiV1Res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`, {
        headers: { 'User-Agent': 'FLMMKR-Site/1.0' }
      });

      if (brasilApiV1Res.ok) {
        const data = await brasilApiV1Res.json();
        return NextResponse.json({
          success: true,
          cep: cleanCep,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          service: 'brasilapi_v1'
        });
      }
    } catch (_) {}

    // 3. Fallback: ViaCEP
    try {
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        headers: { 'User-Agent': 'FLMMKR-Site/1.0' }
      });

      if (viaCepRes.ok) {
        const data = await viaCepRes.json();
        if (!data.erro) {
          return NextResponse.json({
            success: true,
            cep: cleanCep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
            service: 'viacep'
          });
        }
      }
    } catch (_) {}

    return NextResponse.json({ error: 'CEP não encontrado.' }, { status: 404 });
  } catch (error: any) {
    console.error('[CEP Server Error]:', error?.message || error);
    return NextResponse.json(
      { error: 'Falha ao consultar o CEP no servidor.' },
      { status: 500 }
    );
  }
}
