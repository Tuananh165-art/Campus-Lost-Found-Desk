import type { Session } from '../store/useAppStore';
// SecureStore has no web implementation. Preview keeps the token only in RAM.
let memorySession: Session | null = null;
export async function saveSession(session: Session) { memorySession = session; }
export async function restoreSession() { return memorySession; }
export async function clearSession() { memorySession = null; }
