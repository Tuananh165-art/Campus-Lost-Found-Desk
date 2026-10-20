import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { STUDENT } from '../config/student';
import { createItemRepository } from '../services/itemRepository';
import { clearSession, restoreSession, saveSession } from '../services/tokenStorage';
import { signInResponse } from '../services/authService';
import { queryClient } from '../services/queryClient';
import { useAppStore } from '../store/useAppStore';
import { clearPhotos } from '../services/photos';

type Repository = ReturnType<typeof createItemRepository>;
type SessionContextValue = { repository: Repository | null; busy: boolean; authError: string;
  signIn(name: string): Promise<void>; signOut(): Promise<void> };
const SessionContext = createContext<SessionContextValue | null>(null);
export function SessionProvider({ children }: PropsWithChildren) {
  const session = useAppStore(state => state.session);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const repository = useMemo(() => session ? createItemRepository(session.user, AsyncStorage) : null, [session]);
  useEffect(() => {
    let mounted = true;
    restoreSession().then(saved => { if (mounted) useAppStore.getState().setSession(saved); })
      .catch(() => { if (mounted) setAuthError('Không thể khôi phục phiên an toàn. Hãy thử đăng nhập.'); })
      .finally(() => { if (mounted) useAppStore.getState().finishSessionCheck(); });
    return () => { mounted = false; };
  }, []);
  async function signIn(name: string) {
    if (busy) return;
    setBusy(true); setAuthError('');
    try {
      const next = await signInResponse(name);
      await saveSession(next);
      queryClient.clear();
      useAppStore.getState().resetUi();
      useAppStore.getState().setSession(next);
      router.replace('/');
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'Đăng nhập thất bại.'); }
    finally { setBusy(false); }
  }
  async function signOut() {
    if (busy) return;
    setBusy(true); setAuthError('');
    try {
      await clearSession(); // Stop if the secure token cannot be removed.
      const closing = repository?.close();
      await queryClient.cancelQueries();
      await closing; // In-flight local writes finish before the persistent cache is removed.
      await AsyncStorage.removeItem(STUDENT.cacheKey);
      await clearPhotos();
      useAppStore.getState().resetUi();
      await useAppStore.persist.clearStorage();
      queryClient.clear();
      useAppStore.getState().setSession(null);
      router.replace('/sign-in');
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'Không thể dọn phiên. Hãy thử lại.'); }
    finally { setBusy(false); }
  }
  return <SessionContext.Provider value={{ repository, busy, authError, signIn, signOut }}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('SessionProvider chưa được gắn.');
  return value;
}
