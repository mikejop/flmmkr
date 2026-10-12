import { getMediaUrl } from '@/lib/storage';

export interface ImageMeta {
  width: number;
  height: number;
}

/**
 * Mapa de dimensões nativas (width/height) das imagens do artigo.
 * Medido a partir dos arquivos originais em Supabase Storage.
 * sem alterar nenhum arquivo de mídia.
 */
export const INTRODUCAO_DAVINCI_IMAGES_MANIFEST: Record<string, ImageMeta> = {
  [getMediaUrl('assets/artigos/introducao-davinci/davinci-resolve.webp')]: { width: 2132, height: 900 },
  [getMediaUrl('assets/artigos/introducao-davinci/color-page.webp')]: { width: 4112, height: 2582 },
  [getMediaUrl('assets/artigos/introducao-davinci/NODES.webp')]: { width: 1474, height: 1188 },
  [getMediaUrl('assets/artigos/introducao-davinci/PRIMARIES.webp')]: { width: 1544, height: 840 },
  [getMediaUrl('assets/artigos/introducao-davinci/COLOR WHEELS.webp')]: { width: 1492, height: 580 },
  [getMediaUrl('assets/artigos/introducao-davinci/LOG WHEELS.webp')]: { width: 1538, height: 836 },
  [getMediaUrl('assets/artigos/introducao-davinci/HDR.webp')]: { width: 1538, height: 832 },
  [getMediaUrl('assets/artigos/introducao-davinci/RGB MIXER.webp')]: { width: 1544, height: 942 },
  [getMediaUrl('assets/artigos/introducao-davinci/CURVES.webp')]: { width: 1540, height: 842 },
  [getMediaUrl('assets/artigos/introducao-davinci/QUALIFIER.webp')]: { width: 1536, height: 940 },
  [getMediaUrl('assets/artigos/introducao-davinci/POWER WINDOWS.webp')]: { width: 1548, height: 944 },
  [getMediaUrl('assets/artigos/introducao-davinci/TRACKER.webp')]: { width: 1540, height: 840 },
  [getMediaUrl('assets/artigos/introducao-davinci/MAGIC MASK.webp')]: { width: 1540, height: 944 },
  [getMediaUrl('assets/artigos/introducao-davinci/BLUR E SHARPEN.webp')]: { width: 1538, height: 936 },
  [getMediaUrl('assets/artigos/introducao-davinci/KEY.webp')]: { width: 1542, height: 834 },
  [getMediaUrl('assets/artigos/introducao-davinci/SIZING.webp')]: { width: 1544, height: 940 },
  [getMediaUrl('assets/artigos/introducao-davinci/SCOPES.webp')]: { width: 2422, height: 1878 },
  [getMediaUrl('assets/artigos/introducao-davinci/SPLIT SCREEN.webp')]: { width: 1800, height: 1196 },
  [getMediaUrl('assets/artigos/introducao-davinci/GALLERY.webp')]: { width: 940, height: 626 },
  [getMediaUrl('assets/artigos/introducao-davinci/COLOR MATCH.webp')]: { width: 1538, height: 950 }
};

export function getImageDimensions(src?: string): ImageMeta | undefined {
  if (!src) return undefined;
  return INTRODUCAO_DAVINCI_IMAGES_MANIFEST[src];
}
