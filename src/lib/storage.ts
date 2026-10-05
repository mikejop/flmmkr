const BUCKET_NAME = 'media';
const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnqqaskurjkrllnhjygt.supabase.co';
const SUPABASE_STORAGE_BASE_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}`;

/**
 * Returns the public media path/URL for a given relative media path.
 * In Next.js, local assets are served directly from /media or /img.
 */
export function getMediaUrl(relativePath: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const cleanPath = relativePath.replace(/^\/?(img\/)?/, '');
  
  // Return local public media path if available, or Supabase CDN URL
  return `/media/${cleanPath}`;
}
