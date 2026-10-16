import 'server-only';

/**
 * Materiais de apoio para download. O navegador só conhece o identificador ("projeto"); a chave do arquivo no R2 e o
 * nome do download ficam aqui, no servidor. Para incluir outro material, envie o arquivo ao bucket e acrescente uma linha.
 */
export const MEMBER_DOWNLOADS = {
  projeto: { key: 'materiais/color-master-project.zip', filename: 'color-master-project.zip' },
} as const;

export type MemberDownloadId = keyof typeof MEMBER_DOWNLOADS;
export const MEMBER_DOWNLOAD_IDS = Object.keys(MEMBER_DOWNLOADS) as [MemberDownloadId, ...MemberDownloadId[]];
