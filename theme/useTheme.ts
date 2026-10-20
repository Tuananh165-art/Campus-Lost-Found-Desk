import { useColorScheme } from 'react-native';
import { dark, light } from './colors';
export function useTheme() {
  const scheme = useColorScheme();
  return { colors: scheme === 'dark' ? dark : light, dark: scheme === 'dark' };
}
