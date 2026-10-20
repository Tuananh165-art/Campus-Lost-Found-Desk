import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { Icon } from './Icon';
import { STUDENT } from '../config/student';

export function DeskIllustration() {
  const { colors } = useTheme();
  // Keep the decorative layers static: perspective transforms inside a Reanimated
  // entering layer can be clipped/mis-composited by Android Expo Go.
  return <View style={art.stage} accessible={false} pointerEvents="none">
    <View style={[art.halo, { backgroundColor: colors.accentSoft }]} />
    <View style={[art.back, { backgroundColor: colors.hero, borderColor: colors.border }]} />
    <LinearGradient colors={[colors.accentEnd, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[art.parcel, { shadowColor: colors.shadow }]}>
      <Icon name="other" color={colors.onAccent} size={60} />
      <Text style={[art.parcelLabel, { color: colors.onAccent }]}>LOST & FOUND</Text>
    </LinearGradient>
    <View style={[art.tag, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <Icon name="location" color={colors.accent} size={21} />
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Đúng nơi. Đúng chủ.</Text>
    </View>
    <View style={[art.seal, { backgroundColor: colors.successSoft, borderColor: colors.card }]}><Icon name="check" color={colors.success} size={27} /></View>
  </View>;
}
const art = StyleSheet.create({
  stage: { height: 205, width: 285, alignSelf: 'center', marginVertical: 12 },
  halo: { position: 'absolute', width: 196, height: 196, borderRadius: 98, top: 0, left: 42 },
  back: { position: 'absolute', zIndex: 1, width: 140, height: 140, borderRadius: STUDENT.radius, borderWidth: 1, top: 18, left: 90,
    transform: [{ rotateZ: '9deg' }] },
  parcel: { width: 150, height: 150, borderRadius: STUDENT.radius, position: 'absolute', top: 22, left: 53,
    zIndex: 2, alignItems: 'center', justifyContent: 'center', gap: 10, transform: [{ rotateZ: '-7deg' }],
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 4 },
  parcelLabel: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  tag: { position: 'absolute', zIndex: 4, left: 27, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 13,
    borderRadius: STUDENT.radius, borderWidth: 1, transform: [{ rotateZ: '3deg' }], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  seal: { position: 'absolute', zIndex: 3, right: 25, top: 9, width: 49, height: 49, borderRadius: 25, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
});
