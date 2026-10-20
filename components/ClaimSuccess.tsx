import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
export function ClaimSuccess({ visible }: { visible: boolean }) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(visible ? 1 : 0, { duration: 220, reduceMotion: ReduceMotion.System }); }, [visible, progress]);
  const animated = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ translateY: (1 - progress.value) * 8 }] }));
  return <Animated.View style={animated}>
    {visible && <Text accessibilityLiveRegion="polite" style={{ color: colors.success, paddingVertical: 12 }}>✓ Đã ghi nhận người nhận đồ.</Text>}
  </Animated.View>;
}
