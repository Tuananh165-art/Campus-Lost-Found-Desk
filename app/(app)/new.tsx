import { useReducer, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { ActionButton, Chip, Field, Loading, Notice, Screen, styles } from '../../components/ui';
import { PhotoField } from '../../components/PhotoField';
import { CATEGORIES } from '../../data/lostItems';
import { CATEGORY_LABELS } from '../../data/presentation';
import { formReducer, validateForm } from '../../data/itemForm';
import { useLostItems } from '../../hooks/useLostItems';
import { useAppStore } from '../../store/useAppStore';
import { useSession } from '../../providers/SessionProvider';
import { useTheme } from '../../theme/useTheme';

export default function NewScreen() {
  const { colors } = useTheme();
  const user = useAppStore(state => state.session?.user);
  const { busy } = useSession();
  const list = useLostItems();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [form, dispatch] = useReducer(formReducer, { title: '', category: 'other', locationFound: '', reporterName: user ?? '', photoUri: null });
  const errors = validateForm(form, list.data?.items ?? []);
  const invalid = !list.data || Object.values(errors).some(Boolean);
  return <Screen><Stack.Screen options={{ title: 'Báo món đồ mới' }} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={[styles.heading, { color: colors.text }]}>Ghi nhận món đồ</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Nhập thông tin giúp chủ sở hữu nhận ra món đồ.</Text>
        {list.isPending && <Loading />}
        {list.isError && !list.data && <><Notice text={list.error.message} error /><ActionButton label="Thử lại" onPress={() => void list.refetch()} /></>}
        <Field label="Tên món đồ" icon="other" value={form.title} onChangeText={value => dispatch({ type: 'title', value })} error={errors.title} editable={!list.mutation.isPending && !busy} />
        <Text style={{ color: colors.muted }}>{form.title.length}/40 ký tự</Text>
        <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Danh mục</Text>
        <View style={styles.row}>{CATEGORIES.map(category => <Chip label={CATEGORY_LABELS[category]} icon={category} key={category}
          selected={form.category === category} disabled={list.mutation.isPending || busy} onPress={() => dispatch({ type: 'category', value: category })} />)}</View>
        <Field label="Nơi tìm thấy" icon="location" value={form.locationFound} onChangeText={value => dispatch({ type: 'location', value })} error={errors.locationFound} editable={!list.mutation.isPending && !busy} />
        <Field label="Người báo" icon="user" value={form.reporterName} onChangeText={value => dispatch({ type: 'reporter', value })} error={errors.reporterName} editable={!list.mutation.isPending && !busy} />
        <PhotoField uri={form.photoUri} disabled={list.mutation.isPending || busy} onBusyChange={setPhotoBusy} onChange={value => dispatch({ type: 'photo', value })} />
        {list.mutation.isError && <Notice text={list.mutation.error.message} error />}
        <ActionButton label={list.mutation.isPending ? 'Đang lưu…' : 'Lưu món đồ'} icon="check" disabled={invalid || list.mutation.isPending || photoBusy || busy}
          onPress={() => { void list.mutation.mutateAsync({ type: 'add', form }).then(() => router.dismissTo('/')).catch(() => undefined); }} />
      </ScrollView>
    </KeyboardAvoidingView>
  </Screen>;
}
