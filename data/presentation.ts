import type { LostItem } from './lostItems';
export const CATEGORY_LABELS: Record<LostItem['category'], string> = {
  electronics: 'Điện tử', clothing: 'Quần áo', documents: 'Giấy tờ', other: 'Khác',
};
export const STATUS_LABELS: Record<LostItem['status'] | 'all', string> = {
  all: 'Tất cả', open: 'Đang chờ', claimed: 'Đã nhận', archived: 'Lưu trữ',
};
export function formatDate(iso: string) {
  const value = new Date(iso);
  if (!Number.isFinite(value.getTime())) return 'Chưa rõ ngày';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(value);
}
export function presentItem(item: LostItem) {
  return { category: CATEGORY_LABELS[item.category], status: STATUS_LABELS[item.status], date: formatDate(item.reportedAt) };
}
