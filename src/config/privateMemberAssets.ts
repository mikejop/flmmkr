/** Logical names exposed to the member UI mapped to randomized private Storage paths. */
export const PRIVATE_MEMBER_ASSETS = {
  'bg/02.webm': 'member-assets/bg/2e3f243c2f59a450b701c41e4d6d7256.webm',
  'bg/02.webp': 'member-assets/bg/1bbfbfd533d2c667cde531daebbadf39.webp',
} as const;

export type PrivateMemberAssetPath = keyof typeof PRIVATE_MEMBER_ASSETS;

export function getPrivateMemberAssetUrl(path: PrivateMemberAssetPath): string {
  return `/api/members/file?path=${encodeURIComponent(path)}`;
}
