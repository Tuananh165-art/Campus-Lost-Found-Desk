import { expect, test, Page } from '@playwright/test';

const posts = Array.from({ length: 8 }, (_, i) => ({ id: 9 + i, title: `Món đồ từ API ${i + 1}`, body: '', userId: 1 }));
test.beforeEach(async ({ page }) => {
  // Fix wall time: exactly four days is not overdue; real milliseconds otherwise cross that boundary.
  await page.clock.setFixedTime(new Date('2026-10-14T05:00:00.000Z'));
});
async function login(page: Page, name = 'user-a') {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Tên tài khoản', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByText(`Xin chào ${name}`, { exact: false })).toBeVisible();
}
test('pending, API retry, content, filter-empty, reducer validation, claim/archive/delete, A→B isolation and dark theme', async ({ page }) => {
  let fail = true;
  let delay = false;
  await page.route('https://jsonplaceholder.typicode.com/**', async route => {
    expect(route.request().url()).toContain('_page=2&_limit=8');
    if (delay) await new Promise(resolve => setTimeout(resolve, 900));
    await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify(fail ? {} : posts) });
  });
  await login(page);
  await expect(page.getByText('Không thể tải danh sách.', { exact: false })).toBeVisible();
  fail = false; delay = true;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByText('Đang tải danh sách…', { exact: true })).toBeVisible();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
  delay = false;
  await page.screenshot({ path: 'evidence/01-list-light.png', fullPage: true });
  await page.getByLabel('Tìm theo tên hoặc nơi tìm thấy', { exact: true }).fill('KHÔNG TỒN TẠI');
  await expect(page.getByText('Không có món đồ khớp bộ lọc.')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.getByLabel('Tìm theo tên hoặc nơi tìm thấy', { exact: true }).fill('THƯ VIỆN');
  await expect(page.getByRole('button', { name: /^Món đồ từ API 1,/ })).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.getByRole('button', { name: 'Báo món đồ mới', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lưu món đồ', exact: true })).toBeDisabled();
  await page.getByLabel('Tên món đồ', { exact: true }).fill('MÓN ĐỒ TỪ API 1');
  await expect(page.getByText('Tên món đồ đã tồn tại.')).toBeVisible();
  await page.getByLabel('Tên món đồ', { exact: true }).fill('A'.repeat(41));
  await expect(page.getByText('Tên tối đa 40 ký tự.')).toBeVisible();
  await page.getByLabel('Tên món đồ', { exact: true }).fill('Riêng của A');
  await page.getByLabel('Nơi tìm thấy', { exact: true }).fill('Phòng A104');
  await page.screenshot({ path: 'evidence/02-add-form.png', fullPage: true });
  await page.getByRole('button', { name: 'Lưu món đồ', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 9 | Open: 6 | Overdue: 2');
  await page.getByRole('button', { name: /^Riêng của A,/ }).click();
  await page.getByRole('button', { name: 'Xác nhận đã nhận', exact: true }).click();
  await expect(page.getByText('✓ Đã ghi nhận người nhận đồ.')).toBeVisible();
  await expect(page.getByText('✓ Đã ghi nhận người nhận đồ.').locator('..')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'evidence/03-claimed.png', fullPage: true });
  await page.getByRole('button', { name: 'Về danh sách', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 9 | Open: 5 | Overdue: 2');
  await page.getByTestId('list-footer').last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'evidence/09-live-footer.png', fullPage: true });
  await page.getByRole('button', { name: /^Riêng của A,/ }).click();
  await page.getByRole('button', { name: 'Lưu trữ', exact: true }).click();
  await expect(page.getByTestId('detail-status').last()).toHaveText('Lưu trữ');
  await page.getByRole('button', { name: 'Mở lại', exact: true }).click();
  await page.getByRole('button', { name: 'Về danh sách', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 9 | Open: 6 | Overdue: 2');
  fail = true;
  await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
  await expect(page.getByText('showing saved data from', { exact: false })).toBeVisible();
  await page.screenshot({ path: 'evidence/04-offline-cache.png', fullPage: true });
  fail = false;
  await page.getByRole('button', { name: /^Món đồ từ API 1,/ }).click();
  await page.getByRole('button', { name: 'Xóa món đồ', exact: true }).click();
  await page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
  await expect(page.getByRole('button', { name: /^Món đồ từ API 1,/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await page.getByLabel('Tên tài khoản', { exact: true }).fill('user-b');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
  await expect(page.getByRole('button', { name: /^Riêng của A,/ })).toHaveCount(0);
  const storage = await page.evaluate(() => ({ ...localStorage }));
  expect(storage['lostfound-1923051085']).toContain('user-b');
  expect(storage['lostfound-1923051085']).not.toContain('user-a');
  expect(JSON.stringify(storage)).not.toMatch(/"token"/);
  await page.screenshot({ path: 'evidence/05-user-b.png', fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await expect(page.getByText('Trạm đồ thất lạc', { exact: true })).toHaveCSS('color', 'rgb(244, 243, 238)');
  await page.screenshot({ path: 'evidence/06-list-dark.png', fullPage: true });
});

test('empty remote response, invalid detail id, unknown route and protected routes', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.goto('/items/missing');
  await expect(page.getByLabel('Tên tài khoản', { exact: true })).toBeVisible();
  await login(page);
  await expect(page.getByText('Chưa có món đồ nào. Hãy báo món đồ mới.')).toBeVisible();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 0 | Open: 0 | Overdue: 0');
  // Web token is intentionally in memory; perform SPA navigation via History API popstate.
  await page.evaluate(() => { history.pushState({}, '', '/items/missing'); window.dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.getByText('Không tìm thấy món đồ. ID có thể sai hoặc món đã bị xóa.')).toBeVisible();
  await page.screenshot({ path: 'evidence/07-invalid-id.png', fullPage: true });
  await page.goto('/unknown-path');
  await expect(page.getByText('Không tìm thấy trang bạn yêu cầu.')).toBeVisible();
});

test('launch fallback, corrupt JSON recovery and inline mutation failure with retry', async ({ page }) => {
  let fail = false;
  await page.route('https://jsonplaceholder.typicode.com/**', route => route.fulfill({
    status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify(fail ? {} : posts),
  }));
  await login(page);
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
  fail = true;
  await login(page); // Full reload removes the web RAM session; same owner can read the persisted item cache.
  await expect(page.getByText('showing saved data from', { exact: false })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('lostfound-1923051085', '{bad-json'));
  await login(page);
  await expect(page.getByText('Không thể tải danh sách.', { exact: false })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
  await page.getByRole('button', { name: /^Món đồ từ API 1,/ }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'lostfound-1923051085') throw new Error('Storage quota simulated');
      return original.call(this, key, value);
    };
    Object.assign(window, { restoreStorage: () => { Storage.prototype.setItem = original; } });
  });
  await page.getByRole('button', { name: 'Xác nhận đã nhận', exact: true }).click();
  await expect(page.getByText('Storage quota simulated', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xác nhận đã nhận', exact: true })).toBeEnabled();
  await page.screenshot({ path: 'evidence/08-mutation-error.png', fullPage: true });
  await page.evaluate(() => {
    const callback = (window as unknown as { restoreStorage(): void }).restoreStorage;
    callback();
  });
  await page.getByRole('button', { name: 'Xác nhận đã nhận', exact: true }).click();
  await expect(page.getByText('✓ Đã ghi nhận người nhận đồ.')).toBeVisible();
});

test('UI: 320/393/768 widths, readable localized labels, touch targets and reduced-motion', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') browserErrors.push(message.text()); });
  await page.route('https://jsonplaceholder.typicode.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(posts) }));
  for (const width of [320, 393, 768]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 852 });
    await page.emulateMedia({ colorScheme: width === 393 ? 'dark' : 'light', reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Tên tài khoản', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'evidence/ui-login-' + width + '.png', fullPage: true });
    await page.getByLabel('Tên tài khoản', { exact: true }).fill('ui-review');
    const signIn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    const box = await signIn.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(signIn).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await page.mouse.up();
    await expect(page.getByTestId('list-footer').last()).toHaveText('Lost items: 8 | Open: 5 | Overdue: 2');
    await expect(page.getByRole('button', { name: 'Đang chờ', exact: true })).toBeVisible();
    await expect(page.getByText('Trạm đồ thất lạc', { exact: true })).toBeVisible();
    const pageSize = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(pageSize.scrollWidth).toBeLessThanOrEqual(pageSize.width + 1);
    for (const button of await page.getByRole('button').all()) {
      if (!(await button.isVisible())) continue;
      const bounds = await button.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: 'evidence/ui-list-' + width + '.png', fullPage: true });
  }
  expect(browserErrors).toEqual([]);
});
