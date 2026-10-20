import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { LostItem } from '../data/lostItems';
import type { Palette } from '../theme/colors';
import { STUDENT } from '../config/student';
import { CategoryIcon, Icon } from './Icon';

type Props = { item: LostItem; overdue: boolean; compact: boolean; colors: Palette;
  presentation: { category: string; status: string; date: string }; onPress(): void };
export function LostItemRow({ item, overdue, compact, colors, presentation, onPress }: Props) {
  return <Pressable onPress={onPress} accessibilityRole="button"
    accessibilityLabel={item.title + ', tìm thấy ở ' + item.locationFound + ', trạng thái ' + presentation.status + (overdue ? ', quá hạn nhận' : '') + '. Xem chi tiết.'}
    style={({ pressed }) => [rowStyles.card, { backgroundColor: colors.card, shadowColor: colors.shadow,
      borderColor: overdue ? colors.accent : colors.border, borderWidth: overdue ? 2 : 1,
      paddingVertical: compact ? 12 : 16, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.985 : 1 }],
    }]}>
    <View style={rowStyles.body}>
      <View style={[rowStyles.tile, { backgroundColor: colors.accentSoft }]}>
        {item.photoUri ? <Image source={{ uri: item.photoUri }} contentFit="cover" style={rowStyles.thumbnail}
          placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }} /> : <CategoryIcon category={item.category} color={colors.accent} size={23} />}
      </View>
      <View style={rowStyles.content}>
        <View style={rowStyles.top}>
          <Text style={[rowStyles.category, { color: colors.muted }]}>{presentation.category}</Text>
          <Text style={[rowStyles.status, { color: item.status === 'claimed' ? colors.success : item.status === 'archived' ? colors.muted : colors.accent,
            backgroundColor: item.status === 'claimed' ? colors.successSoft : item.status === 'archived' ? colors.subtle : colors.accentSoft }]}>{presentation.status}</Text>
        </View>
        <Text numberOfLines={2} style={[rowStyles.title, { color: colors.text }]}>{item.title}</Text>
        <View style={rowStyles.metadata}><Icon name="location" color={colors.muted} size={13} />
          <Text numberOfLines={1} style={[rowStyles.metaText, { color: colors.muted }]}>{item.locationFound}</Text>
        </View>
        {!compact && <Text numberOfLines={1} style={[rowStyles.metaText, { color: colors.muted }]}>Người báo: {item.reporterName}</Text>}
      </View>
      <Icon name="chevron" color={colors.muted} size={16} />
    </View>
    {overdue && <View style={[rowStyles.overdue, { borderColor: colors.border }]}>
      <Icon name="clock" color={colors.accent} size={14} /><Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Quá hạn nhận · hơn {STUDENT.claimDays} ngày</Text>
    </View>}
  </Pressable>;
}
const rowStyles = StyleSheet.create({
  card: { borderRadius: STUDENT.radius, minHeight: 88, minWidth: 44, paddingHorizontal: 14, marginVertical: 6,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  body: { flexDirection: 'row', alignItems: 'center', gap: 11 }, content: { flex: 1, minWidth: 0, gap: 6 },
  tile: { width: 47, height: 53, borderRadius: STUDENT.radius, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' },
  category: { fontSize: 11, fontWeight: '600' }, status: { fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 22, letterSpacing: -0.25 },
  metadata: { flexDirection: 'row', alignItems: 'center', gap: 4 }, metaText: { fontSize: 12, lineHeight: 17, flexShrink: 1 },
  overdue: { marginTop: 11, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
