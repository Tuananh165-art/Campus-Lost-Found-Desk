import { View } from 'react-native';
import Archive from 'lucide-react-native/icons/archive';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Camera from 'lucide-react-native/icons/camera';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import ClipboardList from 'lucide-react-native/icons/clipboard-list';
import Clock3 from 'lucide-react-native/icons/clock-3';
import FileText from 'lucide-react-native/icons/file-text';
import Headphones from 'lucide-react-native/icons/headphones';
import ImagePlus from 'lucide-react-native/icons/image-plus';
import Info from 'lucide-react-native/icons/info';
import LogOut from 'lucide-react-native/icons/log-out';
import MapPin from 'lucide-react-native/icons/map-pin';
import Package from 'lucide-react-native/icons/package';
import Plus from 'lucide-react-native/icons/plus';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Search from 'lucide-react-native/icons/search';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Shirt from 'lucide-react-native/icons/shirt';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Trash2 from 'lucide-react-native/icons/trash';
import UserRound from 'lucide-react-native/icons/user-round';
import X from 'lucide-react-native/icons/x';
import type { LostItem } from '../data/lostItems';

const icons = {
  archive: Archive, back: ArrowLeft, next: ArrowRight, camera: Camera,
  check: Check, chevron: ChevronRight, success: CircleCheck, list: ClipboardList,
  clock: Clock3, documents: FileText, electronics: Headphones, photo: ImagePlus,
  info: Info, logout: LogOut, location: MapPin, other: Package, add: Plus,
  refresh: RotateCcw, search: Search, shield: ShieldCheck, clothing: Shirt,
  sparkles: Sparkles, delete: Trash2, user: UserRound, close: X,
} as const;
export type IconName = keyof typeof icons;
export function Icon({ name, color, size = 20 }: { name: IconName; color: string; size?: number }) {
  const Glyph = icons[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
    <Glyph color={color} size={size} strokeWidth={1.8} focusable={false} />
  </View>;
}
export function CategoryIcon({ category, color, size = 24 }: { category: LostItem['category']; color: string; size?: number }) {
  return <Icon name={category} color={color} size={size} />;
}
