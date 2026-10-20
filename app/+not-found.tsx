import { router } from 'expo-router';
import { ActionButton, Notice, Screen } from '../components/ui';
export default function NotFoundScreen() {
  return <Screen><Notice text="Không tìm thấy trang bạn yêu cầu." /><ActionButton label="Về trang chính" onPress={() => router.replace('/')} /></Screen>;
}
