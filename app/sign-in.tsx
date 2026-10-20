import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { ActionButton, Field, Notice, Screen, styles } from '../components/ui';
import { DeskIllustration } from '../components/DeskIllustration';
import { Icon } from '../components/Icon';
import { STUDENT } from '../config/student';
import { useSession } from '../providers/SessionProvider';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';

const entrance = FadeInDown.duration(240).reduceMotion(ReduceMotion.System);
export default function SignInScreen() {
  const [name, setName] = useState('');
  const { colors } = useTheme();
  const { signIn, busy, authError } = useSession();
  const session = useAppStore(state => state.session);
  if (session) return <Redirect href="/" />;
  return <Screen topInset>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={local.content}>
        <View style={local.brand}><View style={[local.brandIcon, { backgroundColor: colors.accentSoft }]}><Icon name="location" color={colors.accent} size={20} /></View>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Campus Lost & Found</Text>
          <Text style={[local.paper, { color: colors.accent, borderColor: colors.border }]}>104</Text>
        </View>
        <DeskIllustration />
        <Animated.View entering={entrance}>
          <Text style={[local.eyebrow, { color: colors.accent }]}>TRẠM ĐỒ THẤT LẠC</Text>
          <Text style={[local.title, { color: colors.text }]}>Tìm lại đồ.{ '\n' }Kết nối đúng chủ.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Ghi nhận đồ được tìm thấy, tìm kiếm và trao lại cho chủ sở hữu trong trường.</Text>
          <View style={[local.form, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <Field label="Tên tài khoản" icon="user" value={name} onChangeText={setName} autoCapitalize="none" autoCorrect={false}
              placeholder="user-a hoặc user-b" editable={!busy} returnKeyType="go"
              onSubmitEditing={() => { if (!busy && name.trim()) void signIn(name); }} />
            {!!authError && <Notice text={authError} error />}
            <ActionButton label={busy ? 'Đang đăng nhập…' : 'Đăng nhập'} icon="next" disabled={busy || !name.trim()} onPress={() => void signIn(name)} />
            <View style={local.note}><Icon name="shield" color={colors.muted} size={14} />
              <Text style={{ color: colors.muted, fontSize: 11, flex: 1, lineHeight: 17 }}>Tài khoản thực hành. Không nhập mật khẩu thật.</Text></View>
          </View>
          {Platform.OS === 'web' && <Notice text="Phiên trên web sẽ kết thúc khi tải lại trang." />}
        </Animated.View>
        <Text style={[local.credit, { color: colors.muted }]}>Hoàng Minh Tuấn Anh · 1923051085</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </Screen>;
}
const local = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: 18, width: '100%', maxWidth: 460, alignSelf: 'center' },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 8 },
  brandIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paper: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderRadius: 8, fontSize: 11, fontWeight: '700' },
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 34, lineHeight: 39, letterSpacing: -1.2, fontWeight: '700', marginBottom: 10 },
  form: { borderRadius: STUDENT.radius, borderWidth: 1, padding: 16, gap: 7,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, shadowOpacity: 0.05, elevation: 1 },
  note: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 }, credit: { textAlign: 'center', fontSize: 11, lineHeight: 18, marginTop: 20 },
});
