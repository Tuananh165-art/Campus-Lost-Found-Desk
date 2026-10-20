import { STUDENT } from '../config/student';

export const CATEGORIES = ['electronics', 'clothing', 'documents', 'other'] as const;
export const STATUSES = ['open', 'claimed', 'archived'] as const;
export type LostItem = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number];
  locationFound: string;
  status: (typeof STATUSES)[number];
  reportedAt: string;
  reporterName: string;
  photoUri?: string | null;
};
export const DAY_MS = 86_400_000;
const seedTime = Date.now();
const titles = ['Tai nghe không dây', 'Áo khoác xanh', 'Thẻ sinh viên', 'Bình nước', 'Máy tính cầm tay', 'Mũ thể thao', 'Sổ ghi chép', 'Chùm chìa khóa'];
const locations = ['Thư viện', 'Giảng đường A', 'Căn tin', 'Sân thể thao'];
export const SEED: LostItem[] = Array.from({ length: STUDENT.seedCount }, (_, index) => ({
  id: `seed-${index + 1}`,
  title: titles[index],
  category: CATEGORIES[index % CATEGORIES.length],
  locationFound: locations[index % locations.length],
  status: index % 3 === 1 ? 'claimed' : 'open',
  reportedAt: new Date(seedTime - (index + 1) * DAY_MS).toISOString(),
  reporterName: 'Văn phòng sinh viên',
  photoUri: null,
}));

export function isOverdue(item: LostItem, now = Date.now()): boolean {
  return item.status === 'open' && now - Date.parse(item.reportedAt) > STUDENT.claimDays * DAY_MS;
}
export function summary(list: readonly LostItem[], now = Date.now()) {
  return {
    count: list.length,
    openCount: list.filter(item => item.status === 'open').length,
    overdueCount: list.filter(item => isOverdue(item, now)).length,
  };
}
export function filterItems(list: readonly LostItem[], query: string, status: 'all' | LostItem['status']) {
  const normalized = query.trim().toLocaleLowerCase('vi');
  return list.filter(item =>
    (status === 'all' || item.status === status) &&
    `${item.title}\n${item.locationFound}`.toLocaleLowerCase('vi').includes(normalized));
}
export function formatSummary(value: ReturnType<typeof summary>): string {
  return `Lost items: ${value.count} | Open: ${value.openCount} | Overdue: ${value.overdueCount}`;
}
export function normalizeRouteId(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
export function isLostItem(value: unknown): value is LostItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.title === 'string' && item.title.trim().length > 0 && item.title.length <= 40 &&
    CATEGORIES.some(category => category === item.category) &&
    STATUSES.some(status => status === item.status) &&
    typeof item.locationFound === 'string' && typeof item.reporterName === 'string' &&
    typeof item.reportedAt === 'string' && Number.isFinite(Date.parse(item.reportedAt)) &&
    (item.photoUri == null || typeof item.photoUri === 'string');
}
