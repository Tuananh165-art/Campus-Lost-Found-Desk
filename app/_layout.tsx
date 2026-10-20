import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider } from '../providers/SessionProvider';
import { queryClient } from '../services/queryClient';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import { Loading, Screen } from '../components/ui';

function Navigation() {
  const checking = useAppStore(state => state.checkingSession);
  const { dark } = useTheme();
  if (checking) return <Screen topInset><Loading label="Đang kiểm tra phiên an toàn…" /></Screen>;
  return <><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false }} /></>;
}
export default function RootLayout() {
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><SessionProvider><Navigation /></SessionProvider></QueryClientProvider></SafeAreaProvider>;
}
