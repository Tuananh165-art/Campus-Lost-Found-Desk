# Bài giữa kỳ 104 — Campus Lost & Found

## Step 0 — Tham số cá nhân (ghi trước khi viết code)

- Họ tên: Hoàng Minh Tuấn Anh
- MSSV: **1923051085**; hai chữ số cuối: **N = 85**.

| Tham số | Phép tính | Kết quả dùng trong dự án |
| --- | --- | --- |
| Số món seed | 8 + (85 mod 5) | 8 |
| Ngưỡng quá hạn | 3 + (85 mod 4) | 4 ngày |
| Bán kính thẻ | 6 + (85 mod 10) | 11 |
| Hue màu nhấn | (85 × 17) mod 360 | 5° |
| Trang API | (85 mod 4) + 1 | 2 |
| staleTime | 20 + (85 mod 5) × 10 | 20 giây = 20000 ms |
| Cache key | lostfound- + MSSV | lostfound-1923051085 |
| Prefs key | prefs- + MSSV | prefs-1923051085 |
| Chất lượng ảnh | 60 + (85 mod 25) | 70% = 0.7 |
| Số test tối thiểu | 2 + (85 mod 2) | 3 |

## Phạm vi AI

Người dùng xác nhận giảng viên cho phép AI trong Part A.

## Phân tích yêu cầu và quyết định triển khai

Đề mã 104, chủ đề Campus Lost & Found, thời lượng 300 phút, tổng 100 điểm: A 50, B 20, C 15, D 15. A có sáu mục 8 + 10 + 8 + 8 + 8 + 8 = 50. B yêu cầu 5 câu gắn file/dòng của dự án; C yêu cầu bảng 6 nhóm lỗi và sửa tối thiểu; D chưa công bố. Đề yêu cầu một ZIP chạy được sau npm install, không có node_modules, có ANSWERS.md, AI_LOG.md và ảnh hoặc ghi chú cho A→B, denied-permission, tsc/test.

MSSV là nguồn tham số duy nhất trong `config/student.ts:1–14`. Giá trị ví dụ N=45 trong đề không được dùng. `reportedAt` dùng ISO; quá hạn là **open và tuổi lớn hơn 4 × 86400000ms**, không dùng `>=`, không tính claimed/archived. Tổng footer tính trên toàn bộ danh sách, còn bộ lọc chỉ thay đổi những hàng nhìn thấy. Khi thời gian trôi qua, hook cập nhật đồng hồ mỗi 30 giây hoặc lúc app trở lại active để overdue có thể đổi ngay cả khi chưa thao tác CRUD.

Không có starter ZIP Canvas trong workspace. Dùng phương án JSONPlaceholder được đề cho phép. Không có API auth được đề chỉ định nên sign-in là mock cục bộ sinh UUID, không phải xác thực thật. GET lấy dữ liệu remote; CRUD là local mock service có persistence vì JSONPlaceholder không cung cấp lưu trữ bền vững cho ứng dụng này.

Chọn Stack (đề cho phép tab **hoặc** stack), giữ đường dẫn chính xác `app/items/[id].tsx`. Nhóm `(app)` bảo vệ list/new; layout `app/items/_layout.tsx` bảo vệ riêng chi tiết cùng cách, nên gõ URL chi tiết khi chưa đăng nhập không vượt qua bảo vệ.

### Đối chiếu A1–A6

| Yêu cầu | Code đối chiếu | Bằng chứng và giới hạn |
| --- | --- | --- |
| A1 — TypeScript template, Router | `package.json`, `tsconfig.json`, `app/_layout.tsx`; lệnh khởi tạo ở README/AI_LOG | Template Expo SDK 57 thực tế; strict tsc pass |
| A1 — LostItem, đúng 8 seed, ≥2 category, open/claimed | `data/lostItems.ts:3–28` | Test 1 kiểm tra số lượng và phân bố |
| A1 — summary không tính toán ở screen | `data/lostItems.ts:30–47`; screen chỉ gọi tại `app/(app)/index.tsx:32` | Test 1 kiểm biên 4 ngày, archived/claimed và mảng rỗng |
| A1 — 2 palette, hue 5, radius 11, scheme | `theme/colors.ts`, `theme/useTheme.ts`, `components/LostItemRow.tsx:41–50` | E2E light/dark; màu hex chỉ ở theme; stylesheet dùng radius cá nhân |
| A2 — Row presentational, a11y, pressed, ≥44 | `components/LostItemRow.tsx:8–50`; dữ liệu chỉ nhận props, import LostItem chỉ là type | minWidth 44, minHeight ≥88, opacity khi pressed; chưa kiểm screen reader native |
| A2 — Overdue có khác biệt | `data/lostItems.ts:30–31`; `components/LostItemRow.tsx:12–16,36–37` | Border 2 và badge quá hạn, kiểm summary độc lập |
| A2 — FlatList id, filter title/location trong render | `app/(app)/index.tsx:30–32,88–94`; `data/lostItems.ts:40–44` | E2E tìm THƯ VIỆN, filter-empty; không có state visibleItems |
| A2 — CRUD bất biến | `services/itemRepository.ts:89–106` | map/spread/filter; test 3 và E2E giữ claim/delete sau refetch |
| A2 — Form reducer, action union, không default | `data/itemForm.ts:3–34`; `app/(app)/new.tsx` | Test 2, E2E required/41 ký tự/duplicate và submit disabled |
| A3 — Stack, detail/not-found, id-only | `app/(app)/_layout.tsx`, `app/items/[id].tsx:16–29`, `app/+not-found.tsx`; `app/(app)/index.tsx:92` | E2E protected route, missing ID và unknown route |
| A3 — Header từ data, lookup riêng | `app/items/[id].tsx:22–25` | Detail đọc Query hiện tại, không deserialize item từ URL |
| A3 — Footer live đúng mẫu | `hooks/useLostItems.ts:24–27`; `app/(app)/index.tsx:32,94`; `data/lostItems.ts:46–47` | E2E thêm 8→9, claim open 6→5, xóa 9→8 |
| A4 — Fetch trang 2, limit 8, pending/empty/error/content | `services/itemRepository.ts:20–29`; `app/(app)/index.tsx:71–78,88–94` | Probe API thật nhận 8; E2E kiểm soát HTTP 503/200/[] và retry |
| A4 — Persist response, cached banner, parse guard | `services/itemRepository.ts:8–18,45–53,59–87`; `app/(app)/index.tsx:69` | Test 3 và E2E startup fallback/corrupt JSON; owner khác bị bỏ |
| A4 — Query staleTime, mutation invalidate | `hooks/useLostItems.ts:11–29`; `config/student.ts:9` | 20000ms, onSuccess setQueryData rồi invalidate |
| A4 — Disable pending, error inline | `app/items/[id].tsx:23,56–72`; `app/(app)/new.tsx` | E2E mô phỏng Storage quota: lỗi hiện ngay cạnh nút, có thể thử lại |
| A5 — Zustand ≥2 slices, selector derived | `store/useAppStore.ts:8–31`; subscriptions ở `app/(app)/index.tsx:20–28` | Session + UI; `selectHasFilters` là giá trị derived boolean |
| A5 — Prefs persist, token chỉ SecureStore | `store/useAppStore.ts:24–28`; `services/tokenStorage.ts:5–19` | E2E AsyncStorage/web không có token; SecureStore native mới kiểm source/bundle |
| A5 — Restore/loading/redirect/logout | `providers/SessionProvider.tsx:21–57`; `app/_layout.tsx:12–14`; `components/ProtectedLayout.tsx` | E2E redirect và logout; native cold restore cần test thiết bị |
| A5 — A→B không giữ dữ liệu A | `providers/SessionProvider.tsx:41–55`; `services/itemRepository.ts:13,109`; query key có owner | E2E user-b không thấy Riêng của A; cache chỉ owner B, không token |
| A6 — Photo permission, JPEG70%, document copy, expo-image | `services/photos.ts:7–23`; `components/PhotoField.tsx`; `app/items/[id].tsx:38–40` | tsc và native bundle pass; chưa có bằng chứng thao tác camera native |
| A6 — Denied và canAskAgain=false vẫn dùng được | `services/photos.ts:8–9`; `components/PhotoField.tsx:20–25,36–40` | Đường code rõ và manual checklist; chưa giả ghi đã từ chối quyền trên thiết bị |
| A6 — Reanimated <300ms, reduce-motion | `components/ClaimSuccess.tsx:7–10` | 220ms + ReduceMotion.System; E2E thấy thông báo claim, OS native cần kiểm |
| A6 — 3 meaningful tests, strict tsc, README/metadata | `tests/core.test.ts`, `tsconfig.json`, `README.md`, `app.json` | 3/3 unit/integration pass, tsc/lint pass, doctor 21/21, export 3 nền tảng |

## Part B — Giải thích code của dự án

### B1 — Những state trên màn hình danh sách

`ListScreen` không tự gọi `useState`/`useReducer`; nó đọc state từ các hook/store/provider. Không có `items` và `visible` riêng bằng useState. Mọi state dữ liệu ứng dụng mà màn hình sử dụng được liệt kê dưới đây, bao gồm state ẩn trong hook:

| State đọc bởi ListScreen | Nguồn cụ thể | Vì sao phải lưu thay vì chỉ tính trong render |
| --- | --- | --- |
| `query` | `app/(app)/index.tsx:20`, `store/useAppStore.ts:17–18` | Đây là chuỗi người dùng đã nhập; không suy ra được chuỗi này chỉ từ danh sách |
| `statusFilter` | `app/(app)/index.tsx:22`, `store/useAppStore.ts:17–18` | Đây là lựa chọn all/open/claimed/archived của người dùng, độc lập với dữ liệu |
| `compact` | `app/(app)/index.tsx:24`, `store/useAppStore.ts:19,24–28` | Đây là sở thích hiển thị cần nhớ giữa các render và native relaunch |
| Query `data` (`items`, `savedAt`, `source`, `warning`) | `app/(app)/index.tsx:18,30,69`, `hooks/useLostItems.ts:12–17` | Kết quả fetch/cache và timestamp là kết quả bất đồng bộ, không thể tạo bằng render thuần |
| Query lifecycle/error (`isPending`, `isFetching`, `isError`, `error`) | `app/(app)/index.tsx:65–66,71–73` | Chúng ghi nhận tiến trình và kết quả request; một render không biết lịch sử mạng |
| Mutation lifecycle/result/error/variables | `hooks/useLostItems.ts:18–29` | Đây là trạng thái thao tác ghi bất đồng bộ; hook có tạo mutation nhưng list không dùng để render nút claim (nút nằm ở detail/new) |
| `session` và `user` lấy từ session | `app/(app)/index.tsx:28`, `store/useAppStore.ts:7–14` | Session là kết quả đăng nhập/khôi phục; riêng user là trường được chọn từ session, không tạo thêm state user |
| `busy` | `app/(app)/index.tsx:29`, `providers/SessionProvider.tsx:18` | Phải nhớ sign-in/sign-out đang chạy qua nhiều render để chặn thao tác trùng |
| `authError` | `app/(app)/index.tsx:29,54`, `providers/SessionProvider.tsx:19` | Là kết quả lỗi thao tác phiên trước đó, không suy ra được từ danh sách món đồ |
| `now` | `app/(app)/index.tsx:19`, `hooks/useNow.ts:4–8` | Có thể đọc Date.now trong render nhưng không tự gây render khi thời gian trôi qua; state đồng hồ giúp cập nhật overdue theo timer/foreground |
| Scheme hệ điều hành được hook theme đọc | `theme/useTheme.ts:4–5` | Light/dark thay đổi do hệ điều hành nên hook phải subscribe; palette là giá trị suy ra từ scheme, không phải state riêng |

`checkingSession` ở `store/useAppStore.ts:13–14` thuộc luồng khởi động root/protected layout, không được ListScreen đọc trực tiếp vì màn hình chưa render khi kiểm tra phiên chưa xong. `items` là alias `list.data?.items ?? []` ở dòng 30; `visibleItems` ở dòng 31, `totals` ở dòng 32 và `hasFilters` qua selector dòng 26 đều là **derived values**, không cần state/effect riêng. `setQuery`, `setCompact`, `signOut`, `repository` và `queryKey` không phải state dữ liệu riêng của list.

Nút con có shared value `scale` tại `components/ui.tsx:23–29`, giữ tiến trình phản hồi press/release qua các frame; đó là state hiệu ứng của ActionButton, không phải derived state của list. `header`/`empty` là JSX trong render và các ô thống kê dùng totals, không có state riêng.

### B2 — Footer cập nhật khi claim/delete

Điểm cập nhật có thể chỉ rõ là `hooks/useLostItems.ts:26`: **`queryClient.setQueryData(queryKey, data)`**. Repository đã tạo mảng mới khi claim bằng `map` tại `services/itemRepository.ts:102` và khi delete bằng `filter` tại dòng 103. Đặt kết quả mới vào Query cache làm subscriber dùng `useLostItems` render lại. Ở `app/(app)/index.tsx:32`, `summary(items, now)` tính tổng từ dữ liệu mới; dòng 94 truyền `formatSummary(totals)` vào `ListFooterComponent`.

Ví dụ trong E2E: sau thêm, footer là `Lost items: 9 | Open: 6 | Overdue: 2`; claim món mới chuyển thành `Lost items: 9 | Open: 5 | Overdue: 2`. Claim món đã quá hạn còn làm overdue giảm một. Xóa một món làm count giảm; open/overdue giảm nếu món bị xóa thuộc nhóm tương ứng. Filter không làm tổng đổi.

Nếu chỉ bỏ dòng 26, footer **không có cập nhật tức thời từ kết quả mutation**, nhưng dòng 27 vẫn invalidate/refetch nên sau tải lại thành công nó vẫn cập nhật. Không thể nói footer sẽ sai mãi khi cơ chế refetch còn tồn tại. Nếu bỏ cả setQueryData và invalidate mà không thay bằng cơ chế thông báo khác, subscriber sẽ còn giữ snapshot cũ và footer cũ cho tới lần fetch sau. Nếu bỏ riêng dòng `ListFooterComponent` ở screen, người dùng không thấy footer; nếu xóa khai báo totals mà vẫn dùng nó thì tsc báo lỗi, ứng dụng không build được.

### B3 — Type của route value và xử lý trước khi so ID

`app/items/[id].tsx:16` khai báo `useLocalSearchParams<{ id?: string | string[] }>()`, nên `params.id` có type **`string | string[] | undefined`**. `LostItem.id` ở `data/lostItems.ts:6` là `string`, vì vậy cần thu hẹp type trước khi so sánh hoặc gọi phương thức string; không ép `as string` để bỏ qua mảng/undefined.

Dòng 17 gọi `normalizeRouteId`; định nghĩa ở `data/lostItems.ts:49–50` chỉ nhận một string không trắng, còn array/undefined trả undefined. Dòng 22 tự `.find(candidate => candidate.id === id)` trong dữ liệu Query hiện tại. Không tìm thấy thì dòng 26–29 hiển thị thông báo và nút trở về; header ở dòng 25 dùng tên món khi tìm được. List chỉ truyền `{ id: item.id }` tại `app/(app)/index.tsx:92`, không truyền object JSON. Test 1 kiểm string/array/undefined; E2E kiểm `/items/missing` không crash.

### B4 — Đường đi token và nguy cơ nếu quên query cache

1. Người dùng nhập tên ở `app/sign-in.tsx`; nút Đăng nhập gọi `signIn(name)` của provider.
2. `providers/SessionProvider.tsx:32` gọi `services/authService.ts:4–9`. Response mock là `{ user, token }`; token sinh bằng `Crypto.randomUUID()`, không in console và không phải token dịch vụ thật.
3. Provider dòng 33 `await saveSession(next)`; `services/tokenStorage.ts:5–7` ghi JSON session vào **SecureStore**, key `session-1923051085`.
4. Chỉ sau ghi thành công, provider dòng 34–37 dọn Query/UI, cập nhật Zustand session trong RAM rồi replace `/`. `store/useAppStore.ts:26` chỉ partialize compact, nên persist không ghi token hoặc session xuống AsyncStorage.
5. Lần mở native app sau, root `app/_layout.tsx:12–14` hiện loading khi `checkingSession=true`. Provider dòng 23 gọi restore; `services/tokenStorage.ts:9–17` đọc SecureStore, parse có guard và kiểm tra user/token; record lỗi bị dọn. Provider dòng 23 đặt session và dòng 25 kết thúc kiểm tra. `components/ProtectedLayout.tsx` cho vào protected stack nếu có session, nếu không redirect sign-in.
6. Logout ở provider dòng 45–55 xóa SecureStore; đóng repository và hủy request; đợi các thao tác đang chạy; xóa cache AsyncStorage và thư mục ảnh; reset UI, clear prefs, **`queryClient.clear()` ở dòng 53**, set session null và replace `/sign-in`.

Nếu quên clear Query cache, dữ liệu món đồ/tên người báo/photoUri và mutation errors/variables của A có thể còn trong RAM cho tới gc/khởi động lại; query key có owner ở `hooks/useLostItems.ts:11` ngăn B đọc cùng key trực tiếp nhưng không thay thế việc dọn dữ liệu. Trong dự án này sign-in cũng clear ở provider dòng 34, nên bỏ **chỉ** clear ở sign-out chưa đủ để kết luận B chắc chắn nhìn thấy A; vẫn là dữ liệu A còn lưu trong cache lúc logged-out và có nguy cơ lộ nếu tái dùng key, đọc cache hoặc bỏ bảo vệ khác. Token không nằm trong Query cache, vì vậy không nói token sẽ lộ từ query cache.

`services/tokenStorage.web.ts` là nhánh xem trước, chỉ RAM vì SecureStore không hỗ trợ web. Full reload cần sign-in lại. E2E A→B là bằng chứng web; khôi phục SecureStore trên native chưa có bằng chứng thiết bị.

### B5 — Thời điểm permission và denied không thể hỏi lại

Xin quyền trong `services/photos.ts:8`, chỉ sau khi người dùng bấm Chụp ảnh/Chọn ảnh tại `components/PhotoField.tsx:32–33`; handler `choose` dòng 15–18 mới gọi `attachPhoto`. Camera dùng `requestCameraPermissionsAsync`; thư viện dùng `requestMediaLibraryPermissionsAsync`. Không xin quyền ở launch: người dùng có thể chỉ tìm/claim đồ hoặc nhập báo cáo không ảnh, và hỏi đúng lúc giúp họ hiểu mục đích.

Nếu `granted=false`, service dòng 9 trả `{ kind: 'denied', canAskAgain }` và dừng trước khi mở picker/camera. Component dòng 20–22 hiện thông báo vẫn có thể lưu không ảnh, đồng thời đặt `settingsRequired = !canAskAgain`. Khi **denied và canAskAgain=false**, dòng 37–40 hiện nút Cài đặt; trên native dòng 39 gọi `Linking.openSettings()`, thất bại thì hướng dẫn mở thủ công. `finally` dòng 25 bỏ busy để form dùng lại, không lặp prompt tự động. Trên web nút giải thích quyền trình duyệt; đây không thay cho bằng chứng permission native.

`services/photos.ts:17–21` nén JPEG với quality 0.7 rồi copy từ cache tạm vào thư mục document của app. Form chặn submit khi ảnh đang xử lý để không lưu trước khi có URI; ảnh không bắt buộc nên permission denied không làm invalid form. Sau khi từ chối, nhập đủ title/location/reporter vẫn submit được. Đường denied/canAskAgain=false đã kiểm nguồn và bundle; cần chạy checklist native ở phần bằng chứng để xác nhận UI của hệ điều hành.

## Part C — Nhận diện lỗi và sửa tối thiểu

| Số dòng | Lỗi trong một câu | Sửa tối thiểu |
| --- | --- | --- |
| 4, 6–8 | `visible` là derived state cập nhật bằng effect chỉ phụ thuộc query nên lỗi thời khi items đổi, và filter chỉ xét title có phân biệt hoa thường. | Bỏ useState visible và effect 6–8; tính ngay khi render: `const q = query.trim().toLowerCase(); const visible = items.filter(i => i.title.toLowerCase().includes(q) || i.locationFound.toLowerCase().includes(q));` |
| 10–15 | Fetch chạy lại mỗi ký tự query, không cleanup/abort, không xử lý HTTP/network/JSON và đưa posts thẳng vào model có thể sai. | Đổi dependency thành `[]` vì URL cố định theo MSSV; tạo `const controller = new AbortController()` trong effect, fetch với `{ signal: controller.signal }`, kiểm `res.ok`, map posts thành LostItem trước setItems, catch lỗi trừ AbortError, cleanup `return () => controller.abort()` và không set state nếu đã aborted. |
| 18–20 | Claim sửa trực tiếp object trong mảng rồi set lại cùng tham chiếu, có thể không render và còn crash nếu findIndex trả -1. | Thay thân cập nhật bằng `setItems(prev => prev.map(x => x.id === id ? { ...x, status: 'claimed' } : x));`; không cần findIndex, không có phần tử phù hợp thì không đụng dữ liệu. |
| 23–24 | `await` nằm trong component không async và JSON.parse không guard/null/schema nên đọc cache có thể lỗi cú pháp hoặc crash khi dữ liệu hỏng. | Chuyển đọc vào async IIFE trong `useEffect` với cleanup, dùng key `lostfound-1923051085`; `try { const raw = await AsyncStorage.getItem(key); const value: unknown = raw ? JSON.parse(raw) : null; /* kiểm schema LostItem[] và owner trước setItems */ } catch { /* bỏ cache hỏng, hiện lỗi/fetch lại */ }`. Không biến component thành async để sửa. |
| 26 | Token bí mật bị lưu ở AsyncStorage và thao tác await ở thân render gây side effect không hợp lệ. | Chuyển vào handler sign-in async sau response, dùng `await SecureStore.setItemAsync('session-1923051085', token)`; restore/delete cũng qua SecureStore, không đưa token vào phần zustand persist. |
| 31, 35 | Key lấy index đổi khi xóa/lọc, còn route nhận item JSON thay vì id nên identity/lookup động bị sai. | Dòng 31: `keyExtractor={item => item.id}`; dòng 35: `params: { id: item.id }`, giữ pathname `/items/[id]`; detail tự tìm item bằng id. |

### Mức hoàn thành và media

| Phần | Kết luận theo bằng chứng hiện tại |
| --- | --- |
| A1–A4 | Đã triển khai; tsc/lint,3 test logic, E2E list/form/navigation/cache/CRUD và export pass |
| A5 | Đã triển khai; A→B web pass. SecureStore/prefs cold restore native cần xác nhận trên thiết bị |
| A6 | Đã triển khai photo/permission/animation/tests/README/config. Ảnh cũ chứng minh photo-display; denied, file persistence và giảm chuyển động OS cần test thật |
| B | B1–B5 có đáp án và file/dòng hiện tại |
| C | Đủ 6 nhóm lỗi và minimal fix |
| D | Chưa có đề |

## Part D

