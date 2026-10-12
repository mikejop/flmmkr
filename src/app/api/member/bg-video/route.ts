import { NextRequest, NextResponse } from 'next/server';
import { getBgVideoSessionStatus, recordBgVideoFinished } from '@/utils/memberBgVideo';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { getClientIp } from '@/utils/clientIp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req) || 'UNKNOWN';
  const { searchParams } = new URL(req.url);
  const macAddress = (searchParams.get('macAddress') || req.cookies.get('flmmkr_device_mac')?.value || '').trim();
  const { user } = await getAuthenticatedUser();
  const userId = user?.id || null;

  const status = await getBgVideoSessionStatus({
    macAddress,
    ip,
    userId
  });

  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req) || 'UNKNOWN';
  const body = await req.json().catch(() => ({}));
  const macAddress = (body.macAddress || req.cookies.get('flmmkr_device_mac')?.value || '').trim();
  const { user } = await getAuthenticatedUser();
  const userId = user?.id || null;

  const result = await recordBgVideoFinished({
    macAddress,
    ip,
    userId
  });

  return NextResponse.json(result);
}
