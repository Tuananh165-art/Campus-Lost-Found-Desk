import { STUDENT } from '../config/student';
import { isLostItem, LostItem, SEED } from '../data/lostItems';
import { FormState, validateForm } from '../data/itemForm';

export type Snapshot = { owner: string; items: LostItem[]; deletedIds: string[]; savedAt: string };
export type ListResult = { items: LostItem[]; savedAt: string; source: 'remote' | 'cache'; warning?: string };
export type StoragePort = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem(key: string): Promise<void> };
export function decodeSnapshot(raw: string | null, owner: string): Snapshot | null {
  try {
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object') return null;
    const value = data as Record<string, unknown>;
    if (value.owner !== owner || !Array.isArray(value.items) || !value.items.every(isLostItem) ||
      new Set(value.items.map(item => item.id)).size !== value.items.length ||
      !Array.isArray(value.deletedIds) || !value.deletedIds.every(id => typeof id === 'string') ||
      typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))) return null;
    return value as Snapshot;
  } catch { return null; }
}
export async function fetchRemote(owner: string, signal?: AbortSignal): Promise<LostItem[]> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${STUDENT.apiPage}&_limit=${STUDENT.seedCount}`, { signal });
  if (!response.ok) throw new Error(`API trả HTTP ${response.status}.`);
  const posts: unknown = await response.json();
  if (!Array.isArray(posts)) throw new Error('API trả dữ liệu không hợp lệ.');
  return posts.slice(0, STUDENT.seedCount).map((post: unknown, index) => {
    if (!post || typeof post !== 'object' || !('id' in post) || typeof post.id !== 'number' ||
      !('title' in post) || typeof post.title !== 'string' || !post.title.trim()) throw new Error('Bản ghi API không hợp lệ.');
    return { ...SEED[index], id: `${owner}-post-${post.id}`, title: post.title.trim().slice(0, 40), reporterName: owner };
  });
}

// A serialized local mock service: JSONPlaceholder GET supplies initial records; writes are local.
export function createItemRepository(owner: string, storage: StoragePort, remote = fetchRemote) {
  let active = true;
  let snapshot: Snapshot | null = null;
  let loaded = false;
  let tail: Promise<unknown> = Promise.resolve();
  let sequence = 0;
  function assertActive() { if (!active) throw new Error('Phiên đã kết thúc.'); }
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = tail.then(operation, operation);
    tail = next.catch(() => undefined);
    return next;
  }
  async function read() {
    if (!loaded) { snapshot = decodeSnapshot(await storage.getItem(STUDENT.cacheKey), owner); loaded = true; }
    assertActive();
  }
  async function save(next: Snapshot) {
    assertActive();
    await storage.setItem(STUDENT.cacheKey, JSON.stringify(next));
    assertActive();
    snapshot = next;
  }
  const result = (source: ListResult['source'], warning?: string): ListResult => ({
    items: snapshot?.items ?? [], savedAt: snapshot?.savedAt ?? '', source, warning,
  });
  return {
    load(signal?: AbortSignal): Promise<ListResult> {
      return enqueue(async () => {
        await read();
        const timeout = new AbortController();
        const abort = () => timeout.abort();
        if (signal?.aborted) abort();
        signal?.addEventListener('abort', abort, { once: true });
        const timer = setTimeout(abort, 10_000);
        try {
          const incoming = await remote(owner, timeout.signal);
          assertActive();
          if (signal?.aborted) throw new Error('Đã hủy yêu cầu.');
          // Previously changed records win; tombstones stop deleted API records returning.
          const previous = snapshot;
          const retained = previous?.items ?? [];
          const known = new Set([...retained.map(item => item.id), ...(previous?.deletedIds ?? [])]);
          const items = [...retained, ...incoming.filter(item => !known.has(item.id))];
          await save({ owner, items, deletedIds: previous?.deletedIds ?? [], savedAt: new Date().toISOString() });
          return result('remote');
        } catch (error) {
          assertActive();
          if (signal?.aborted) throw error;
          if (snapshot) return result('cache', error instanceof Error ? error.message : 'Không thể tải API.');
          throw error;
        } finally {
          clearTimeout(timer);
          signal?.removeEventListener('abort', abort);
        }
      });
    },
    change(command: { type: 'add'; form: FormState } | { type: 'status'; id: string; status: LostItem['status'] } | { type: 'delete'; id: string }): Promise<ListResult> {
      return enqueue(async () => {
        await read();
        if (!snapshot) throw new Error('Cần tải danh sách thành công trước khi chỉnh sửa.');
        let items = snapshot.items;
        let deletedIds = snapshot.deletedIds;
        if (command.type === 'add') {
          const errors = validateForm(command.form, items);
          if (Object.values(errors).some(Boolean)) throw new Error(Object.values(errors).filter(Boolean).join(' '));
          items = [{ ...command.form, title: command.form.title.trim(), locationFound: command.form.locationFound.trim(), reporterName: command.form.reporterName.trim(),
            id: `${owner}-local-${Date.now()}-${++sequence}`, status: 'open', reportedAt: new Date().toISOString() }, ...items];
        } else {
          if (!items.some(item => item.id === command.id)) throw new Error('Món đồ không còn tồn tại.');
          if (command.type === 'status') items = items.map(item => item.id === command.id ? { ...item, status: command.status } : item);
          else { items = items.filter(item => item.id !== command.id); deletedIds = [...deletedIds, command.id]; }
        }
        await save({ owner, items, deletedIds, savedAt: new Date().toISOString() });
        return result('cache');
      });
    },
    async close() { active = false; await tail; },
  };
}
