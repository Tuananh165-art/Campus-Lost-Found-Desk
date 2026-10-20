import { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { attachPhoto } from '../services/photos';
import { ActionButton, Notice, styles } from './ui';
import { useTheme } from '../theme/useTheme';

export function PhotoField({ uri, onChange, disabled, onBusyChange }: {
  uri: string | null; onChange(uri: string | null): void; disabled: boolean; onBusyChange(busy: boolean): void;
}) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [settingsRequired, setSettingsRequired] = useState(false);
  async function choose(source: 'camera' | 'library') {
    setBusy(true); onBusyChange(true); setMessage(''); setSettingsRequired(false);
    try {
      const result = await attachPhoto(source);
      if (result.kind === 'picked') onChange(result.uri);
      if (result.kind === 'denied') {
        setMessage('Bạn chưa cho phép truy cập ảnh/camera. Vẫn có thể lưu không ảnh và mô tả món đồ trong tên/nơi tìm thấy.');
        setSettingsRequired(!result.canAskAgain);
      }
    } catch { setMessage('Không thể xử lý ảnh. Bạn vẫn có thể nhập thông tin và lưu món đồ không ảnh.'); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <View>
    <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Ảnh nhận diện (không bắt buộc)</Text>
    {uri && <Image source={{ uri }} contentFit="cover" accessibilityLabel="Ảnh món đồ đang báo"
      placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' }} style={{ width: '100%', height: 190, marginTop: 10 }} />}
    <View style={styles.row}>
      <ActionButton label={busy ? 'Đang xử lý ảnh…' : 'Chụp ảnh'} icon="camera" disabled={busy || disabled} secondary onPress={() => void choose('camera')} />
      <ActionButton label="Chọn ảnh" icon="photo" disabled={busy || disabled} secondary onPress={() => void choose('library')} />
      {!!uri && <ActionButton label="Bỏ ảnh" icon="close" secondary disabled={busy || disabled} onPress={() => onChange(null)} />}
    </View>
    {!!message && <Notice text={message} />}
    {settingsRequired && <ActionButton label="Mở Cài đặt quyền ảnh" secondary onPress={() => {
      if (Platform.OS === 'web') setMessage('Hãy mở quyền camera trong cài đặt của trình duyệt.');
      else void Linking.openSettings().catch(() => setMessage('Hãy mở Cài đặt hệ thống để cấp lại quyền.'));
    }} />}
  </View>;
}
