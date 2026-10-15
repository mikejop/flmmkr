import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { PRIVATE_MEMBER_ASSETS, type PrivateMemberAssetPath } from '@/config/privateMemberAssets';
import { verifyAccessCached } from '@/services/paymentVerificationService';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { cacheGet, cacheSet } from '@/utils/redis';
import { signedUrlKey } from '@/utils/accessCache';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL_SECONDS = 10 * 60;
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

function notFound() {
  return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404, headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '';
  if (
    !path ||
    path.length > 160 ||
    path.startsWith('/') ||
    path.includes('..') ||
    /[\u0000-\u001f\u007f\\]/.test(path) ||
    !Object.hasOwn(PRIVATE_MEMBER_ASSETS, path)
  ) {
    return notFound();
  }

  const { user } = await getAuthenticatedUser();
  if (!user) return notFound();

  const access = await verifyAccessCached({ userId: user.id, email: user.email });
  if (!access.isAllowed) return notFound();

  // URL assinada em cache por aluno e arquivo. O cache dura metade da validade da URL, então ela nunca chega quase vencida.
  const cacheKey = signedUrlKey(user.id, path);
  let signedUrl = await cacheGet<string>(cacheKey);
  if (!signedUrl) {
    const storagePath = PRIVATE_MEMBER_ASSETS[path as PrivateMemberAssetPath];
    const { data, error } = await supabaseAdmin.storage
      .from('members-private')
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return notFound();
    signedUrl = data.signedUrl;
    await cacheSet(cacheKey, signedUrl, SIGNED_URL_TTL_SECONDS / 2);
  }

  return new Response(null, {
    status: 302,
    headers: { ...PRIVATE_HEADERS, Location: signedUrl },
  });
}
