import { FlatList, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LostItemRow } from '../../components/LostItemRow';
import { Icon } from '../../components/Icon';
import { ActionButton, Chip, Field, Loading, Notice, Screen, styles } from '../../components/ui';
import { filterItems, formatSummary, isOverdue, STATUSES, summary } from '../../data/lostItems';
import { presentItem, STATUS_LABELS } from '../../data/presentation';
import { STUDENT } from '../../config/student';
import { useLostItems } from '../../hooks/useLostItems';
import { useNow } from '../../hooks/useNow';
import { useSession } from '../../providers/SessionProvider';
import { selectHasFilters, useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/useTheme';

export default function ListScreen() {
  const { colors } = useTheme();
  const list = useLostItems();
  const now = useNow();
  const query = useAppStore(state => state.query);
  const setQuery = useAppStore(state => state.setQuery);
  const statusFilter = useAppStore(state => state.statusFilter);
  const setStatusFilter = useAppStore(state => state.setStatusFilter);
  const compact = useAppStore(state => state.compact);
  const setCompact = useAppStore(state => state.setCompact);
  const hasFilters = useAppStore(selectHasFilters);
  const resetUi = useAppStore(state => state.resetUi);
  const user = useAppStore(state => state.session?.user);
  const { signOut, busy, authError } = useSession();
  const items = list.data?.items ?? [];
  const visibleItems = filterItems(items, query, statusFilter);
  const totals = summary(items, now);
  const header = <View>
    <LinearGradient colors={[colors.hero, colors.heroEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[local.hero, { borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[local.eyebrow, { color: colors.accent }]}>CAMPUS DESK / 104</Text>
        <Text style={[local.title, { color: colors.text }]}>Trạm đồ thất lạc</Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Giúp đồ thất lạc tìm về đúng chủ.</Text>
      </View>
      <View style={[local.heroIcon, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <Icon name="other" color={colors.accent} size={29} />
      </View>
    </LinearGradient>
    <View style={local.stats}>
      {[{ label: 'Tổng số', value: totals.count, icon: 'list' as const }, { label: 'Đang chờ', value: totals.openCount, icon: 'other' as const },
        { label: 'Quá hạn', value: totals.overdueCount, icon: 'clock' as const }].map(stat =>
        <View key={stat.label} style={[local.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name={stat.icon} color={colors.muted} size={14} />
            <Text style={{ color: colors.muted, fontSize: 11 }}>{stat.label}</Text></View>
          <Text style={{ color: stat.label === 'Quá hạn' ? colors.accent : colors.text, fontSize: 22, fontWeight: '700' }}>{stat.value}</Text>
        </View>)}
    </View>
    {!!authError && <Notice text={authError} error />}
    <Field label="Tìm theo tên hoặc nơi tìm thấy" icon="search" value={query} onChangeText={setQuery} placeholder="Tìm món đồ, địa điểm…" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={local.chips}>
      {(['all', ...STATUSES] as const).map(status => <Chip key={status} label={STATUS_LABELS[status]}
        selected={statusFilter === status} onPress={() => setStatusFilter(status)} />)}
    </ScrollView>
    <View style={local.utility}>
      <View style={local.compact}><Switch accessibilityLabel="Thẻ gọn" value={compact} onValueChange={setCompact}
        trackColor={{ false: colors.border, true: colors.accent }} /><Text style={{ color: colors.muted, fontSize: 12 }}>Thẻ gọn</Text></View>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {hasFilters && <ActionButton label="Xóa bộ lọc" icon="close" iconOnly compact secondary onPress={resetUi} />}
        <ActionButton label={list.isFetching ? 'Đang tải lại…' : 'Tải lại'} icon="refresh" iconOnly compact secondary
          disabled={list.isFetching || busy} onPress={() => void list.refetch()} />
      </View>
    </View>
    {list.data?.source === 'cache' && <Notice text={'showing saved data from ' + list.data.savedAt + (list.data.warning ? '\n' + list.data.warning : '')} />}
  </View>;
  const empty = list.isPending ? <Loading /> : list.isError && !list.data ? <View>
    <Notice text={'Không thể tải danh sách. ' + list.error.message} error />
    <ActionButton label="Thử lại" icon="refresh" disabled={list.isFetching || busy} onPress={() => void list.refetch()} />
  </View> : <View style={local.empty}>
    <View style={[local.emptyIcon, { backgroundColor: colors.accentSoft }]}><Icon name="search" color={colors.accent} size={26} /></View>
    <Text style={{ color: colors.text, textAlign: 'center', fontSize: 14, lineHeight: 21 }}>
      {items.length ? 'Không có món đồ khớp bộ lọc.' : 'Chưa có món đồ nào. Hãy báo món đồ mới.'}
    </Text>
  </View>;
  return <Screen topInset>
    <Stack.Screen options={{ title: 'Trạm đồ thất lạc', headerShown: false }} />
    <View style={local.toolbar}>
      <View style={[local.avatar, { backgroundColor: colors.accentSoft }]}><Icon name="user" color={colors.accent} size={18} /></View>
      <Text style={{ color: colors.text, flex: 1, fontSize: 13, fontWeight: '600' }}>Xin chào {user}</Text>
      <ActionButton label="Báo món đồ mới" icon="add" iconOnly compact disabled={!list.data || busy} onPress={() => router.push('/new')} />
      <ActionButton label={busy ? 'Đang đăng xuất…' : 'Đăng xuất'} icon="logout" iconOnly compact secondary disabled={busy} onPress={() => void signOut()} />
    </View>
    <FlatList data={visibleItems} keyExtractor={item => item.id} contentContainerStyle={{ paddingBottom: 18 }}
      keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      renderItem={({ item }) => <LostItemRow item={item} presentation={presentItem(item)} colors={colors} compact={compact} overdue={isOverdue(item, now)}
        onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })} />}
      ListEmptyComponent={empty}
      ListFooterComponent={list.data ? <Text testID="list-footer" style={[styles.footer, { color: colors.muted }]}>{formatSummary(totals)}</Text> : null} />
  </Screen>;
}
const local = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hero: { padding: 17, borderRadius: STUDENT.radius, borderWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 2 },
  eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginBottom: 6 },
  title: { fontSize: 25, fontWeight: '700', letterSpacing: -0.7, lineHeight: 33, marginBottom: 3 },
  heroIcon: { width: 55, height: 60, borderRadius: STUDENT.radius, alignItems: 'center', justifyContent: 'center',
    transform: [{ perspective: 350 }, { rotateY: '-12deg' }, { rotateZ: '-8deg' }], shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  stats: { flexDirection: 'row', gap: 8, marginVertical: 12 }, stat: { flex: 1, padding: 10, gap: 4, borderRadius: STUDENT.radius, borderWidth: 1 },
  chips: { flexDirection: 'row', gap: 6, paddingVertical: 7, paddingRight: 12 },
  utility: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginVertical: 8 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  empty: { alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 30 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
