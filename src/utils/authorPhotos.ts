export interface AuthorPhotoPair {
  profileSrc: string;
  bgSrc: string;
}

export const PROFILE_PHOTOS = [
  { id: '01', src: '/assets/mike-photos/01.jpg' },
  { id: '02', src: '/assets/mike-photos/02.jpg' },
  { id: '04', src: '/assets/mike-photos/04.jpg' }
];

export const BG_PHOTOS = [
  { id: '01', src: '/assets/bg/about-mike/01.jpg' },
  { id: '02', src: '/assets/bg/about-mike/02.jpg' },
  { id: '03', src: '/assets/bg/about-mike/03.jpg' },
  { id: '04', src: '/assets/bg/about-mike/04.jpg' }
];

export function getRandomAuthorPhotos(): AuthorPhotoPair {
  const randomProfile = PROFILE_PHOTOS[Math.floor(Math.random() * PROFILE_PHOTOS.length)];
  const candidateBgs = BG_PHOTOS.filter((bg) => bg.id !== randomProfile.id);
  const randomBg = candidateBgs[Math.floor(Math.random() * candidateBgs.length)];

  return {
    profileSrc: randomProfile.src,
    bgSrc: randomBg.src
  };
}
