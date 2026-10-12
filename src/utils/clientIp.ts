import { ipAddress } from '@vercel/functions';
import { isIP } from 'node:net';

/** Return Vercel's connection IP, never a client-controlled forwarding header. */
export function getClientIp(request: Request): string | null {
  const candidate = ipAddress(request)?.trim() || '';
  return isIP(candidate) ? candidate : null;
}
