import 'server-only';
import crypto from 'crypto';

function getSecret() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function createExpiredOfferToken(expiresAt: number): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = String(expiresAt);
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isValidExpiredOfferToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [payload, suppliedSignature, extra] = token.split('.');
  if (!payload || !suppliedSignature || extra || !/^\d+$/.test(payload)) return false;
  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(suppliedSignature, 'base64url'); } catch { return false; }
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}
