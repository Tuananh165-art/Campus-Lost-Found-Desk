import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ActionButton, Loading, Notice, Screen, styles } from '../../components/ui';
import { ClaimSuccess } from '../../components/ClaimSuccess';
import { CategoryIcon, Icon } from '../../components/Icon';
import { normalizeRouteId } from '../../data/lostItems';
import { presentItem } from '../../data/presentation';
import { STUDENT } from '../../config/student';
import { useLostItems } from '../../hooks/useLostItems';
import { useSession } from '../../providers/SessionProvider';
import { useTheme } from '../../theme/useTheme';

export default function DetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = normalizeRouteId(params.id);
  const list = useLostItems();
  const { busy } = useSession();
  const { colors } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const item = list.data?.items.find(candidate => candidate.id === id);
  const disabled = list.mutation.isPending || busy;
  const presentation = item ? presentItem(item) : null;
  return <Screen><Stack.Screen options={{ title: item?.title ?? 'Không tìm thấy món đồ' }} />
    {list.isPending ? <Loading /> : list.isError && !list.data ? <><Notice text={list.error.message} error />
      <ActionButton label="Thử lại" icon="refresh" onPress={() => void list.refetch()} /></> : !item || !presentation ? <>
      <Notice text="Không tìm thấy món đồ. ID có thể sai hoặc món đã bị xóa." />
      <ActionButton label="Về danh sách" icon="back" onPress={() => router.dismissTo('/')} />
    </> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={local.categoryLine}>
        <View style={[local.category, { backgroundColor: colors.accentSoft }]}><CategoryIcon category={item.category} color={colors.accent} size={17} />
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>{presentation.category}</Text></View>
        <Text testID="detail-status" style={[local.status, { color: item.status === 'claimed' ? colors.success : colors.muted,
          backgroundColor: item.status === 'claimed' ? colors.successSoft : colors.subtle }]}>{presentation.status}</Text>
      </View>
      <Text style={[styles.heading, { color: colors.text, marginTop: 4 }]}>{item.title}</Text>
      {item.photoUri && <View style={[local.photo, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: item.photoUri }} contentFit="contain" accessibilityLabel={'Ảnh ' + item.title}
          placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }} style={{ width: '100%', height: 225 }} />
      </View>}
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={local.metadata}><Icon name="location" color={colors.accent} size={18} /><View style={{ flex: 1 }}>
          <Text style={[local.label, { color: colors.muted }]}>Nơi tìm thấy</Text><Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item.locationFound}</Text>
        </View></View>
        <View style={[local.grid, { borderColor: colors.border }]}>
          <View style={local.cell}><Text style={[local.label, { color: colors.muted }]}>Người báo</Text>
            <Text style={{ color: colors.text, fontSize: 14 }}>{item.reporterName}</Text></View>
          <View style={local.cell}><Text style={[local.label, { color: colors.muted }]}>Ngày báo</Text>
            <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>{presentation.date}</Text></View>
        </View>
        <Text selectable style={[local.id, { color: colors.muted, borderColor: colors.border }]}>ID: {item.id}</Text>
      </View>
      <ClaimSuccess visible={list.mutation.isSuccess && list.mutation.variables?.type === 'status' && list.mutation.variables.status === 'claimed'} />
      <Text style={[local.section, { color: colors.muted }]}>XỬ LÝ MÓN ĐỒ</Text>
      {item.status !== 'claimed' && <ActionButton label={list.mutation.isPending ? 'Đang cập nhật…' : 'Xác nhận đã nhận'} icon="check" disabled={disabled}
        onPress={() => list.mutation.mutate({ type: 'status', id: item.id, status: 'claimed' })} />}
      <View style={styles.row}>
        {item.status !== 'archived' && <ActionButton label="Lưu trữ" icon="archive" secondary disabled={disabled}
          onPress={() => list.mutation.mutate({ type: 'status', id: item.id, status: 'archived' })} />}
        {item.status !== 'open' && <ActionButton label="Mở lại" icon="refresh" secondary disabled={disabled}
          onPress={() => list.mutation.mutate({ type: 'status', id: item.id, status: 'open' })} />}
        <ActionButton label="Xóa món đồ" icon="delete" danger secondary disabled={disabled} onPress={() => setConfirmDelete(true)} />
      </View>
      {confirmDelete && <View style={[styles.panel, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>Xóa món đồ này khỏi danh sách?</Text>
        <View style={styles.row}><ActionButton label="Xác nhận xóa" icon="delete" danger disabled={disabled} onPress={() => {
          void list.mutation.mutateAsync({ type: 'delete', id: item.id }).then(() => router.dismissTo('/')).catch(() => undefined);
        }} /><ActionButton label="Hủy xóa" secondary disabled={disabled} onPress={() => setConfirmDelete(false)} /></View>
      </View>}
      {list.mutation.isError && <Notice text={list.mutation.error.message} error />}
      <ActionButton label="Về danh sách" icon="back" secondary disabled={disabled} onPress={() => router.dismissTo('/')} />
    </ScrollView>}
  </Screen>;
}
const local = StyleSheet.create({
  categoryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginTop: 18 },
  category: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  status: { paddingHorizontal: 10, paddingVertical: 7, fontSize: 12, fontWeight: '700', borderRadius: 20 },
  photo: { borderRadius: STUDENT.radius, borderWidth: 1, overflow: 'hidden', marginVertical: 8 },
  metadata: { flexDirection: 'row', alignItems: 'center', gap: 10 }, label: { fontSize: 11, marginBottom: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 14, paddingTop: 14 },
  cell: { flex: 1, minWidth: 120 }, id: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, marginTop: 14, fontSize: 11, lineHeight: 16 },
  section: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: 16, marginBottom: 12 },
});
