import { MIGRATED_PUBLIC_ASSETS } from '@/config/migratedPublicAssets';

const SITE_PUBLIC_BUCKET = 'site-public';
const LEGACY_PUBLIC_VIDEO_BUCKET = 'media';
const SUPABASE_PROJECT_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnqqaskurjkrllnhjygt.supabase.co').replace(/\/+$/, '');

function publicUrl(bucket: string, relativePath: string): string {
  const cleanPath = relativePath.trim().replace(/^\/+/, '').replace(/^(?:img|media)\//, '');
  const encodedPath = cleanPath.split('/').map((segment) => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  }).join('/');
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

/**
 * Returns the public media path/URL for a given relative media path.
 * Resolves a media path to its public Supabase Storage URL.
 */
export function getMediaUrl(relativePath: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const cleanPath = relativePath.trim().replace(/^\/+/, '').replace(/^(?:img|media)\//, '');
  const canonicalPath = cleanPath.split('/').map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }).join('/');
  return publicUrl(SITE_PUBLIC_BUCKET, MIGRATED_PUBLIC_ASSETS[canonicalPath] || canonicalPath);
}

/** Transitional helper for the existing self-hosted public promo video. */
export function getLegacyPublicVideoUrl(relativePath: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath;
  return publicUrl(LEGACY_PUBLIC_VIDEO_BUCKET, relativePath);
}
