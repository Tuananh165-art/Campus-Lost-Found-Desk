import * as SecureStore from 'expo-secure-store';
import { Session } from '../store/useAppStore';
import { STUDENT_ID } from '../config/student';

const TOKEN_KEY = `session-${STUDENT_ID}`;
export async function saveSession(session: Session) {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(session));
}
export async function restoreSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (value && typeof value === 'object' && 'user' in value && 'token' in value &&
      typeof value.user === 'string' && value.user.trim() && typeof value.token === 'string' && value.token) return value as Session;
  } catch { /* Invalid secure record is discarded below. */ }
  if (raw) await clearSession();
  return null;
}
export async function clearSession() { await SecureStore.deleteItemAsync(TOKEN_KEY); }
