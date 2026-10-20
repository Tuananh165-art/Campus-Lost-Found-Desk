import { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { STUDENT } from '../config/student';
import { useTheme } from '../theme/useTheme';
import { Icon, IconName } from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function Screen({ children, topInset = false }: PropsWithChildren<{ topInset?: boolean }>) {
  const { colors } = useTheme();
  return <SafeAreaView edges={topInset ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}
    style={[styles.screen, { backgroundColor: colors.bg }]}>
    <View style={styles.container}>{children}</View>
  </SafeAreaView>;
}
export function ActionButton({ label, onPress, disabled = false, secondary = false, danger = false, icon, iconOnly = false, compact = false }: {
  label: string; onPress(): void; disabled?: boolean; secondary?: boolean; danger?: boolean;
  icon?: IconName; iconOnly?: boolean; compact?: boolean;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const foreground = danger ? (secondary ? colors.danger : colors.onDanger) : secondary ? colors.text : colors.onAccent;
  return <AnimatedPressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress}
    onPressIn={() => { scale.set(withTiming(0.97, { duration: 120, reduceMotion: ReduceMotion.System })); }}
    onPressOut={() => { scale.set(withTiming(1, { duration: 180, reduceMotion: ReduceMotion.System })); }}
    style={[styles.button, animated, {
      minHeight: compact ? 44 : 50, paddingHorizontal: iconOnly ? 12 : 16,
      backgroundColor: danger ? (secondary ? colors.dangerSoft : colors.danger) : secondary ? colors.card : colors.accent,
      borderColor: danger ? colors.danger : secondary ? colors.border : colors.accent,
      opacity: disabled ? 0.48 : 1,
    }]}>
    {!secondary && !danger && <LinearGradient pointerEvents="none" colors={[colors.accentEnd, colors.accent]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
    <View style={styles.buttonContent}>
      {icon && <Icon name={icon} color={foreground} size={compact ? 18 : 20} />}
      {!iconOnly && <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>}
    </View>
  </AnimatedPressable>;
}
export function Field({ label, error, icon, ...props }: TextInputProps & { label: string; error?: string; icon?: IconName }) {
  const { colors } = useTheme();
  return <View style={styles.field}>
    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    <View style={[styles.inputShell, { backgroundColor: colors.card, borderColor: error ? colors.danger : colors.border }]}>
      {icon && <Icon name={icon} color={colors.muted} size={19} />}
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text }]} />
    </View>
    {!!error && <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text>}
  </View>;
}
export function Loading({ label = 'Đang tải danh sách…' }: { label?: string }) {
  const { colors } = useTheme();
  return <View style={styles.center}>
    <ActivityIndicator color={colors.accent} /><Text style={{ color: colors.muted }}>{label}</Text>
    {[0, 1, 2].map(key => <View key={key} style={[styles.skeleton, { backgroundColor: colors.subtle }]} />)}
  </View>;
}
export function Notice({ text, error = false }: { text: string; error?: boolean }) {
  const { colors } = useTheme();
  return <View style={[styles.notice, { backgroundColor: error ? colors.dangerSoft : colors.subtle }]}>
    <Icon name={error ? 'info' : 'shield'} color={error ? colors.danger : colors.muted} size={18} />
    <Text accessibilityRole={error ? 'alert' : 'text'} accessibilityLiveRegion="polite"
      style={{ flex: 1, color: error ? colors.danger : colors.text, fontSize: 13, lineHeight: 20 }}>{text}</Text>
  </View>;
}
export function Chip({ label, selected, onPress, disabled = false, icon }: {
  label: string; selected: boolean; onPress(): void; disabled?: boolean; icon?: IconName;
}) {
  const { colors } = useTheme();
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected, disabled }} style={({ pressed }) => [styles.chip, {
      backgroundColor: selected ? colors.accentSoft : colors.card,
      borderColor: selected ? colors.accent : colors.border, opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
    }]}>
    {icon && <Icon name={icon} color={selected ? colors.accent : colors.muted} size={16} />}
    <Text style={{ color: selected ? colors.accent : colors.muted, fontSize: 13, fontWeight: selected ? '700' : '500' }}>{label}</Text>
  </Pressable>;
}
export const styles = StyleSheet.create({
  screen: { flex: 1 }, container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 18 },
  heading: { fontSize: 28, fontWeight: '700', lineHeight: 35, letterSpacing: -0.8, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  button: { minWidth: 44, borderRadius: STUDENT.radius, borderWidth: 1, overflow: 'hidden',
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 11 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  buttonContent: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 },
  field: { gap: 6, marginVertical: 8 }, label: { fontSize: 13, fontWeight: '600' },
  inputShell: { minHeight: 50, borderWidth: 1, borderRadius: STUDENT.radius, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  input: { flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 10, fontSize: 16 }, error: { fontSize: 12, lineHeight: 18 },
  center: { paddingVertical: 24, alignItems: 'center', gap: 12 }, skeleton: { width: '100%', height: 72, borderRadius: STUDENT.radius },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: STUDENT.radius, marginVertical: 8 },
  chip: { minHeight: 44, minWidth: 44, paddingHorizontal: 13, borderRadius: 22, borderWidth: 1,
    flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  footer: { fontSize: 12, lineHeight: 20, paddingVertical: 18 },
  panel: { borderRadius: STUDENT.radius, borderWidth: 1, padding: 16, marginVertical: 8 },
});
