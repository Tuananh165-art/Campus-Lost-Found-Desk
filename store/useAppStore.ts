import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STUDENT } from '../config/student';
import { LostItem } from '../data/lostItems';

export type Session = { user: string; token: string };
type SessionSlice = { session: Session | null; checkingSession: boolean; setSession(session: Session | null): void; finishSessionCheck(): void };
type UiSlice = { query: string; statusFilter: 'all' | LostItem['status']; compact: boolean;
  setQuery(query: string): void; setStatusFilter(statusFilter: UiSlice['statusFilter']): void; setCompact(compact: boolean): void; resetUi(): void };
export type AppState = SessionSlice & UiSlice;
const sessionSlice: StateCreator<AppState, [], [], SessionSlice> = set => ({
  session: null, checkingSession: true,
  setSession: session => set({ session }), finishSessionCheck: () => set({ checkingSession: false }),
});
const uiSlice: StateCreator<AppState, [], [], UiSlice> = set => ({
  query: '', statusFilter: 'all', compact: false,
  setQuery: query => set({ query }), setStatusFilter: statusFilter => set({ statusFilter }),
  setCompact: compact => set({ compact }), resetUi: () => set({ query: '', statusFilter: 'all', compact: false }),
});
export const useAppStore = create<AppState>()(persist((...args) => ({
  ...sessionSlice(...args), ...uiSlice(...args),
}), {
  name: STUDENT.prefsKey,
  storage: createJSONStorage(() => AsyncStorage),
  partialize: state => ({ compact: state.compact }), // Never serialize session or token.
  merge: (persisted, current) => ({ ...current,
    compact: !!persisted && typeof persisted === 'object' && 'compact' in persisted && persisted.compact === true,
  }),
}));
export const selectHasFilters = (state: AppState) => state.query.trim().length > 0 || state.statusFilter !== 'all';
