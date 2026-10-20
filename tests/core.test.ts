import assert from 'node:assert/strict';
import test from 'node:test';
import { STUDENT } from '../config/student';
import { DAY_MS, filterItems, formatSummary, LostItem, normalizeRouteId, SEED, summary } from '../data/lostItems';
import { FormState, formReducer, validateForm } from '../data/itemForm';
import { createItemRepository, decodeSnapshot, StoragePort } from '../services/itemRepository';

test('summary: 8 seed, personal constants, strictly older open items, immutable input and filters', () => {
  assert.deepEqual([STUDENT.seedCount, STUDENT.claimDays, STUDENT.radius, STUDENT.accentHue, STUDENT.apiPage,
    STUDENT.staleTime, STUDENT.imageQuality, STUDENT.testsRequired], [8, 4, 11, 5, 2, 20000, 0.7, 3]);
  assert.equal(SEED.length, 8);
  assert.ok(new Set(SEED.map(item => item.category)).size >= 2);
  assert.ok(SEED.some(item => item.status === 'claimed') && SEED.some(item => item.status === 'open'));
  const now = Date.parse('2026-10-14T05:00:00.000Z');
  const sample: LostItem[] = [
    { ...SEED[0], id: '1', title: 'TAI NGHE', locationFound: 'Thư viện', status: 'open', reportedAt: new Date(now - 4 * DAY_MS).toISOString() },
    { ...SEED[0], id: '2', status: 'open', reportedAt: new Date(now - 4 * DAY_MS - 1).toISOString() },
    { ...SEED[0], id: '3', status: 'claimed', reportedAt: new Date(now - 10 * DAY_MS).toISOString() },
    { ...SEED[0], id: '4', status: 'archived', reportedAt: new Date(now - 10 * DAY_MS).toISOString() },
  ];
  const before = JSON.stringify(sample);
  assert.deepEqual(summary(sample, now), { count: 4, openCount: 2, overdueCount: 1 });
  assert.equal(formatSummary(summary(sample, now)), 'Lost items: 4 | Open: 2 | Overdue: 1');
  assert.deepEqual(summary([], now), { count: 0, openCount: 0, overdueCount: 0 });
  assert.equal(filterItems(sample, 'tai nghe', 'open')[0].id, '1');
  assert.equal(filterItems(sample, 'THƯ VIỆN', 'all')[0].id, '1');
  assert.equal(filterItems(sample, 'không có', 'all').length, 0);
  assert.equal(JSON.stringify(sample), before);
  assert.equal(normalizeRouteId(['1', '2']), undefined);
  assert.equal(normalizeRouteId(undefined), undefined);
  assert.equal(normalizeRouteId('1'), '1');
});

test('reducer/form: required, 40-character boundary, duplicate normalization and immutable updates', () => {
  const form: FormState = { title: '', category: 'other', locationFound: 'Sảnh', reporterName: 'user-a', photoUri: null };
  const changed = formReducer(form, { type: 'title', value: 'A'.repeat(40) });
  assert.equal(form.title, '');
  assert.equal(changed.category, 'other');
  assert.ok(validateForm(form, []).title);
  assert.equal(validateForm(changed, []).title, '');
  assert.ok(validateForm({ ...changed, title: 'A'.repeat(41) }, []).title);
  assert.ok(validateForm({ ...form, title: `  ${SEED[0].title.toUpperCase()}  ` }, SEED).title.includes('tồn tại'));
  assert.ok(validateForm({ ...changed, locationFound: ' ' }, []).locationFound);
  assert.ok(validateForm({ ...changed, reporterName: ' ' }, []).reporterName);
  const photo = formReducer(changed, { type: 'photo', value: 'file:///photo.jpg' });
  assert.equal(photo.photoUri, 'file:///photo.jpg');
  assert.equal(changed.photoUri, null);
});

test('repository: guarded cache, A/B isolation, offline fallback, persisted immutable CRUD and closed-session writes', async () => {
  const values = new Map<string, string>();
  const storage: StoragePort = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
  const saved = { owner: 'user-a', items: SEED, deletedIds: [], savedAt: '2026-10-14T05:00:00.000Z' };
  assert.equal(decodeSnapshot('{broken', 'user-a'), null);
  assert.equal(decodeSnapshot(JSON.stringify(saved), 'user-b'), null);
  assert.equal(decodeSnapshot(JSON.stringify({ ...saved, items: [{ ...SEED[0], status: 'bad' }] }), 'user-a'), null);
  assert.equal(decodeSnapshot(JSON.stringify({ ...saved, items: [SEED[0], SEED[0]] }), 'user-a'), null);
  let fail = false;
  const remote = async () => { if (fail) throw new Error('offline'); return SEED.map(item => ({ ...item })); };
  const repository = createItemRepository('user-a', storage, remote);
  const initial = await repository.load();
  assert.equal(initial.items.length, 8);
  assert.equal(initial.source, 'remote');
  const claimed = await repository.change({ type: 'status', id: SEED[0].id, status: 'claimed' });
  assert.equal(initial.items[0].status, 'open');
  assert.equal(claimed.items[0].status, 'claimed');
  await repository.change({ type: 'delete', id: SEED[1].id });
  const form: FormState = { title: 'Riêng của A', category: 'other', locationFound: 'Sảnh', reporterName: 'user-a', photoUri: null };
  await repository.change({ type: 'add', form });
  const refreshed = await repository.load();
  assert.equal(refreshed.items.length, 8);
  assert.ok(!refreshed.items.some(item => item.id === SEED[1].id));
  assert.equal(refreshed.items.find(item => item.id === SEED[0].id)?.status, 'claimed');
  await assert.rejects(repository.change({ type: 'add', form }), /tồn tại/);
  fail = true;
  const offline = await createItemRepository('user-a', storage, remote).load();
  assert.equal(offline.source, 'cache');
  assert.equal(offline.savedAt, refreshed.savedAt);
  assert.ok(offline.warning?.includes('offline'));
  await assert.rejects(createItemRepository('user-b', storage, remote).load(), /offline/);
  await repository.close();
  await assert.rejects(repository.change({ type: 'delete', id: SEED[0].id }), /Phiên đã kết thúc/);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(createItemRepository('user-a', storage, remote).load(abort.signal), /offline/);
  // Logout waits for a late request, then removal cannot be undone by that response.
  let resolveFetch!: (items: LostItem[]) => void;
  const delayed = createItemRepository('user-a', storage, () => new Promise(resolve => { resolveFetch = resolve; }));
  const pending = delayed.load();
  await new Promise(resolve => setTimeout(resolve, 0));
  const closing = delayed.close();
  resolveFetch(SEED);
  await assert.rejects(pending, /Phiên đã kết thúc/);
  await closing;
  await storage.removeItem(STUDENT.cacheKey);
  assert.equal(values.has(STUDENT.cacheKey), false);
});
