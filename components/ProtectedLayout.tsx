import { Redirect, Stack } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import { Loading } from './ui';
export function ProtectedLayout() {
  const session = useAppStore(state => state.session);
  const checking = useAppStore(state => state.checkingSession);
  const { colors } = useTheme();
  if (checking) return <Loading label="Đang kiểm tra phiên…" />;
  if (!session) return <Redirect href="/sign-in" />;
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text,
    contentStyle: { backgroundColor: colors.bg }, headerBackTitle: 'Quay lại',
    headerShadowVisible: false, headerTitleStyle: { fontSize: 15, fontWeight: '600' } }} />;
}
