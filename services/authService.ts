import * as Crypto from 'expo-crypto';
import type { Session } from '../store/useAppStore';
// Explicit local mock sign-in, no real campus identity provider is specified in the exam.
export async function signInResponse(name: string): Promise<Session> {
  const user = name.trim().toLocaleLowerCase('vi');
  if (!/^[a-z0-9_-]{1,24}$/.test(user)) throw new Error('Dùng 1–24 chữ thường, số, dấu - hoặc _. Ví dụ: user-a.');
  await new Promise(resolve => setTimeout(resolve, 350));
  return { user, token: Crypto.randomUUID() };
}
