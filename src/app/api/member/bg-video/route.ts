import { NextRequest, NextResponse } from 'next/server';
import { getBgVideoSessionStatus, recordBgVideoFinished } from '@/utils/memberBgVideo';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { searchParams } = new URL(req.url);
  const macAddress = (searchParams.get('macAddress') || req.cookies.get('flmmkr_device_mac')?.value || '').trim();
  const userId = (searchParams.get('userId') || '').trim() || null;

  const status = await getBgVideoSessionStatus({
    macAddress,
    ip,
    userId
  });

  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const body = await req.json().catch(() => ({}));
  const macAddress = (body.macAddress || req.cookies.get('flmmkr_device_mac')?.value || '').trim();
  const userId = (body.userId || '').trim() || null;

  const result = await recordBgVideoFinished({
    macAddress,
    ip,
    userId
  });

  return NextResponse.json(result);
}
