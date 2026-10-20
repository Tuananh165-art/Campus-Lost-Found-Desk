export const STUDENT_ID = '1923051085';
export const N = Number(STUDENT_ID.slice(-2));
export const STUDENT = {
  seedCount: 8 + (N % 5),
  claimDays: 3 + (N % 4),
  radius: 6 + (N % 10),
  accentHue: (N * 17) % 360,
  apiPage: (N % 4) + 1,
  staleTime: (20 + (N % 5) * 10) * 1000,
  cacheKey: `lostfound-${STUDENT_ID}`,
  prefsKey: `prefs-${STUDENT_ID}`,
  imageQuality: (60 + (N % 25)) / 100,
  testsRequired: 2 + (N % 2),
} as const;
