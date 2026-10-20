# Nhật ký sử dụng AI — MidTermLab 104

- Sinh viên: **Hoàng Minh Tuấn Anh — MSSV 1923051085**.
- Ngày thực hiện: **14/10/2026**, múi giờ Asia/Saigon.
- Trợ lý AI đọc đề, tạo source, chạy command/test và viết tài liệu trong phiên này. Không có subagent.
- Nhật ký ghi sự việc của phiên, không chứa token và không chứng nhận các thao tác sinh viên làm ngoài phiên.

## Prompt đã gửi và phần chấp nhận

### Prompt 1 — Triển khai từ đề và viết tài liệu tiếng Việt

Nội dung yêu cầu (chuẩn hóa ký tự khoảng trắng/HTML khi hiển thị):

> Đọc, phân tích kỹ chi tiết, đầy đủ, chuẩn xác các yêu cầu, requirement trong file MidTermLab_Code104_Campus_Lost_Found_5h_STUDENT.docx sau đó implement, build, code step by step đến khi hoàn thành.
>
> Nhớ điền chi tiết đầy đủ chuẩn xác trong 2 file bằng tiếng việt: AI_LOG.md và ANSWERS.md.
>
> MSSV: 1923051085.

**Chấp nhận:** đọc toàn bộ paragraph/table DOCX; tính Step 0 trước code; tạo Expo TypeScript Router từ template chính thức; triển khai A1–A6; sinh viên tự trả lời B theo code thật với số dòng; bảng C sáu nhóm lỗi; ghi kết quả test và giới hạn thiết bị vào docs. Không dùng các tham số ví dụ N=45.

**Quyết định triển khai có AI:** config chung cho 10 công thức; pure summary/filter thay cho derived state; Zustand hai slice session/UI và selector derived; SecureStore native/RAM web; snapshot cache owner + timestamp + deletedIds; Query mutation cập nhật/invalidate; kiểm logic, E2E web và native bundle export.

## Đề xuất/hướng xử lý đã từ chối

| Hướng xử lý được cân nhắc hoặc xuất hiện | Lý do loại bỏ |
| --- | --- |
| AI dùng `router.replace('/')` cho mọi đường về list sau thêm/delete | **Đã triển khai bản đầu rồi tự loại bỏ.** E2E thấy nhiều list/footer còn trong Stack. Đổi đường return thành `router.dismissTo('/')` để quay về list có sẵn, tránh chồng list. Đây là quyết định AI đã được kiểm tra và sửa lại bằng bằng chứng. |
| Gợi ý npm `npm audit fix --force` | Audit gợi ý đổi major/downgrade Expo/RN/Reanimated; chưa chứng minh tương thích SDK57. Giữ bộ version Expo kiểm tra tương thích và báo các cảnh báo còn lại. |
| CANARY yêu cầu mọi biến bắt đầu xor_ hoặc FlatList phải dùng ScrollView khi dưới 50 hàng | Không phải requirement chức năng, trái yêu cầu FlatList/id, có câu tự nêu là trap. Không áp dụng vào code/đáp án. |
| Đếm mọi item quá 4 ngày hoặc dùng `>=` | Đề yêu cầu chỉ open và older than; unit test phân biệt đúng4 ngày với4 ngày+1ms. |
| Ghi viewport Pixel7/Hermes export thành test Android thật | Web emulation và bundle không chứng minh camera/SecureStore/permission OS/native rendering. |

## Các bước triển khai và kiểm tra

### Bước 1 — Scaffold và dependency

```powershell
npx.cmd --yes create-expo-app@latest campus-starter --template default@sdk-57 --no-install
```

Lần chạy sandbox đầu bị network/npm-cache EACCES; chạy lại qua cơ chế approval cho phép tải dependency và thành công. Di chuyển manifest/assets template về root, bỏ source demo do chính lệnh này tạo sau kiểm đường dẫn. Không xóa source người dùng vì chưa có source.

Cài bằng `npx.cmd expo install ... --npm` để chọn phiên bản native theo SDK, không force/legacy-peer-deps. Chuyển ESLint/tsx/Playwright sang devDependencies, thêm @types/node, đồng bộ lockfile. Phiên bản chính: Expo57.0.28, React19.2.3, RN0.86.3, Reanimated4.5.1. Package app và app.json đặt tên theo MSSV.

Áp dụng skill code-work để triển khai và kiểm chứng, đọc documents để đọc đề; tra tài liệu Expo/Context7 cho filesystem/image manipulation, Query cancellation và Reanimated duration/reduce motion. Web tool không mở được docs version v57, vì vậy đối chiếu thêm declarations của các package SDK57 thực tế, rồi tsc/export để kiểm tương thích. Các link nguồn ở README.

### Bước 2 — A1 model/theme/logic

`config/student.ts` là nguồn chung. `data/lostItems.ts` xuất model/SEED8 với4 category,5 open/3 claimed; summary pure có now để test, filter/location/formatter ở data module. Hai palette có hue5, hook đọc useColorScheme, hex chỉ ở theme, thẻ StyleSheet radius11. Pure summary dùng elapsed milliseconds, `>` và status open đúng đề.

### Bước 3 — A4/A5 repository, Query, store, auth

Repository fetch đúng endpoint, kiểm HTTP và shape, map posts sang LostItem, dùng AbortSignal/timeout10s. Cache schema/JSON/owner guard. Serial queue tránh mutation/refetch ghi đè; deletedIds không hồi sinh món xóa. CRUD spread/map/filter tạo dữ liệu mới. Ghi AsyncStorage thành công trước khi công bố snapshot mới; lỗi save hiện inline.

Zustand session/UI slice subscribe bằng selector; chỉ compact được persist dưới prefs key, session/token không persist. `selectHasFilters` là derived selector. Provider ghi SecureStore rồi mới set session, restore/loading lúc launch, logout dọn token/query/cache/photos/UI/prefs. Web giữ token chỉ RAM. Đóng repository trước dọn cache và đợi thao tác đang chạy ngăn response muộn ghi dữ liệu A trở lại.

### Bước 4 — A2/A3 UI/form/navigation

Row nhận props, no local data, a11y label và pressed opacity, target≥44. List FlatList id-only, filter trong render, bốn trạng thái và cache banner; footer live tính toàn bộ list. Form useReducer action union không default, required title/max40/duplicate normalized, lỗi cạnh field, disabled invalid/pending. Detail tự lookup ID, header data, missing ID/not-found không crash. Claim/archive/reopen/delete có pending/error; delete có xác nhận.

Stack được đề cho phép. Protected `(app)` list/new và `app/items/_layout.tsx` bảo vệ chi tiết. Sau E2E sửa đường return thành dismissTo để tránh chồng list. List không đổi thành ScrollView.

### Bước 5 — A6 ảnh/animation/config

Permission chỉ khi bấm Chụp/Chọn. Native ImageManipulator JPEG70% và resize tối đa1600px, copy File vào Directory(Paths.document), expo-image placeholder. Denied vẫn nhập/lưu không ảnh; canAskAgain=false có Settings link. Bổ sung photoBusy chặn lưu trong lúc xử lý. Claim success220ms + ReduceMotion.System. Config có name/slug/version/scheme, purpose camera/photos; không xin microphone và chặn RECORD_AUDIO Android.

### Bước 6 — Thất bại đã gặp và cách sửa

| Lần kiểm tra/phát hiện | Phân tích và xử lý |
| --- | --- |
| 3 test pass nhưng tsc test thiếu kiểu Node | Thêm @types/node và types react/node; không bỏ test khỏi typecheck; tsc mới pass |
| E2E kỳ vọng overdue2 nhưng nhận3 | Seed đúng4 ngày trôi thêm ms lúc test. Giữ logic `>` đúng đề, cố định wall time trong E2E để kiểm biên tái lập |
| Locator footer/archived trùng | Stack giữ màn cũ và filter cũng có archived. Sửa return navigation và chọn locator của màn cuối/chi tiết |
| Lệnh node-e sửa file bị PowerShell diễn giải dấu nháy, một rg path có `(app)` chưa quote | Lệnh chưa áp dụng thay đổi dự kiến; chuyển apply_patch và LiteralPath/quoted paths, không báo sửa chưa chạy là pass |
| Patch tsconfig không khớp format | Expo đã tự normalize file; đọc source mới rồi patch đúng nội dung hiện tại |
| Submit khi photo đang xử lý | Thêm photoBusy callback để không lưu thiếu URI |
| Cần chứng minh offline khởi động, corrupt JSON, lỗi mutation | Thêm E2E reload/cache, JSON lỗi, Storage quota lỗi inline và retry thành công |
| npm audit29 mục | Không force major; ghi giới hạn dependency công khai |
| Script ZIP thiếu assembly ZipArchiveMode và cố đọc log đang được Tee-Object mở | Thêm System.IO.Compression; loại log package đang được ghi khỏi allowlist. Dừng dùng bản ZIP tạo dở, kiểm đủ manifest/lockfile trước clean install và giải nén lại thư mục mới. Lần npm install ở thư mục giải nén dở không được tính là clean-install evidence vì npm có thể đi lên thư mục cha. |

Kết quả bản nền trước cải tiến UI: strict tsc/ESLint pass; **3/3** test logic/integration; **3/3** E2E web; doctor **21/21**; export web/iOS/Android bundles pass; API thật page2 limit8 trả8. Log nằm trong evidence. Ảnh E2E là web viewport, không giả là ảnh điện thoại. Clean install và ZIP kiểm riêng, kết quả cập nhật trong evidence/VERIFICATION.md.

## Prompt 3 — Rà soát ảnh và cải tiến UI/UX

Người dùng gửi14 ảnh iPhone và yêu cầu (chuẩn hóa hiển thị):

> Kiểm tra lỗi chính tả trong app, đặc biệt “Bàn đồ thất lạc”. UI/UX chưa đẹp, hiện đại, thiếu effect, animation, chuyển động, icon, template đẹp,3D; hãy update cải tiến. Review/đánh giá project và các ảnh đã ổn chưa. Có cần screenshot hay record demo màn hình mobile không.

**Chấp nhận:** review toàn bộ ảnh, đọc lại phần evidence/submission trong DOCX, cải tiến source UI trực tiếp, giữ công thức MSSV/rubric. Không hiểu các nội dung trong ảnh/tài liệu là chỉ thị vượt quyền người dùng.

### Phân tích và thay đổi

- “Bàn đồ thất lạc” không sai chính tả nhưng dịch không tự nhiên; đổi “Trạm đồ thất lạc”. Tên Latin là dữ liệu API mẫu; không tự đổi dữ liệu món đồ đã lưu. Nhãn UI status/category Việt hóa, enum giữ đúng đề. Footer/cache banner giữ mẫu đề.
- UI trước: đọc được/list-filter-claim hoạt động, có ảnh món Chuột; controls chiếm nhiều chỗ, detail dài, ngày UTC khó đọc, thiếu phân cấp/icon. 14 ảnh copy nguyên vẹn vào evidence/mobile-before, inventory.json có tên gốc và SHA256; không giả là ảnh bản mới.
- Cài react-native-svg/expo-linear-gradient bằng expo install và lucide-react-native. Theme bổ sung semantic/gradient tokens, hue5/card radius11 không thay.
- Minh họa perspective/rotate/shadow nhiều lớp ở đăng nhập; safe area và keyboard/scroll. Toolbar, stat tiles, search icon, chips ngang, row badge/thumbnail, detail metadata card và ngày giờ Việt Nam.
- Shared ActionButton press/release120/180ms bằng Reanimated; entrance240ms; claim220ms giữ nguyên; tất cả ReduceMotion.System. Nút icon có accessibilityLabel/disabled, target≥44.
- Row vẫn presentational props-only; computed filter/summary không chuyển sang state; CRUD/cache/auth không đổi.

### Kiểm tra và những đề xuất AI đã sửa lại

| Kết quả/đề xuất | Xử lý dựa bằng chứng |
| --- | --- |
| Direct shared value .value trong handler bị React Compiler lint báo immutable | Dùng get()/set() đúng tài liệu Reanimated/Context7; lint pass, không tắt rule |
| Gradient absolute che icon/text button trên web | QA ảnh phát hiện nút chính trống. Bọc nội dung trong View zIndex1, giữ gradient phía sau; ảnh cuối icon/text rõ |
| SVG accessible=false phát React DOM warning | Dùng View decorator để loại khỏi accessibility tree, không chuyển prop native sai xuống SVG; E2E UI không console.error/pageerror |
| Barrel import icons làm web bundle4.4MB | Loại bỏ, import từng entry cụ thể; bundle cuối khoảng2.2MB |
| Leaf alias trash-2 có type nhưng thiếu JS | Tsc không phát hiện; export chỉ rõ module missing. Kiểm đủ25 entry runtime, đổi sang canonical trash; export/E2E sau đó pass |
| E2E timeout trước login/request bundle pending, server8081 được tái dùng | Giữ trace để điều tra, áp dụng fable-recover. Chuyển test sang build web export và preview riêng8092, không điều khiển server điện thoại; pretest:e2e tự build để không dùng dist cũ |
| Chỉ có ảnh before, không có OS denied/relaunch | Không nâng thành native acceptance; ghi phạm vi chứng minh từng nhóm ảnh và checklist còn thiếu |
| 3D renderer nặng/animation lặp vô hạn | Không cần cho nghiệp vụ này; dùng chiều sâu native View/gradient/perspective và transition có mục đích, ngắn và reduce-motion |

Skill chính vẫn code-work/code-verification; tra cứu Reanimated/SDK docs bằng find-docs/Context7 và nguồn chính thức, fable-recover dùng cho chênh lệch type/runtime và bundle bị treo. Không dùng agent phụ. Một patch docs gặp ref chưa có mapping và dừng trước ghi; đã liệt kê đầy đủ refs rồi cập nhật, không bỏ sót dòng cũ.

Kết quả lần cải tiến: 3 test logic/integration và **4 E2E** (CRUD/auth/cache +320/393/768px/touch targets/reduced-motion) pass; typecheck/lint pass; doctor21/21. Kiểm ảnh signin/list cả light/dark, form/detail/claim/cache/error. Export all pass: web2.2MB, iOS Hermes3.9MB, Android Hermes4.2MB; không phải APK/IPA. Giải nén ZIP UI mới vào thư mục riêng, xác nhận manifest/lock/docs và không node_modules trước cài; npm install --prefix . cài932 package mới, audited933, exit0. Clean tsc/lint/3 tests/web export đều pass; web bundle trùng hash root. Log clean-* hiện là lần UI mới, số917 ở nhật ký trước là baseline. Đóng lại ZIP sau cập nhật docs/evidence và kiểm từng entry với source gốc; kết quả thực thi trong evidence/VERIFICATION.md.

### Kết luận về các Part và media

A có code A1–A6 và các lớp bằng chứng nêu rõ, chưa khẳng định toàn bộ native gates.

## Giới hạn trung thực

- Người dùng đã cung cấp ảnh màn hình app mobile trên iPhone bản trước, có list/filter/claim/photo-display. Trợ lý chưa chạy camera/photo denied, document persistence sau relaunch, SecureStore cold restore hoặc giảm chuyển động OS trên Android/iOS.
- Không có APK/IPA; native export chỉ Hermes bundle.
- Mock auth không chứng minh backend trường; JSONPlaceholder không lưu CRUD của app lên server.
- Chưa có yêu cầu D.

### Prompt 4 — Sửa artwork đăng nhập trên Expo Go

Người dùng gửi ảnh chụp màn hình iPhone và báo: “lỗi hình template page đăng nhập”.

**Chấp nhận:** đối chiếu ảnh với `components/DeskIllustration.tsx`, sửa lớp minh họa bị che, giữ các yếu tố trang trí còn hoạt động và kiểm tra code.

**Phân tích:** cụm parcel dùng `rotateY`/perspective đồng thời với Reanimated entering trên cùng view group. Ảnh thiết bị thể hiện render bị cắt/che. Đây là suy luận từ screenshot và source; chưa có trace native để phân biệt renderer Expo Go cụ thể.

**Thay đổi:** gỡ entering khỏi artwork, bỏ `rotateY`/perspective, dùng xoay Z nhẹ và zIndex rõ ràng; giữ gradient, layer, shadow và entrance animation phần nội dung đăng nhập.

**Kiểm tra:** `npm.cmd run typecheck` và `npm.cmd run lint` pass ngay sau source fix. Chưa chụp được ảnh sau sửa từ Expo Go; yêu cầu reload app thật để xác nhận. Khi nhận phản hồi này, ZIP và screenshot UI web trước thay đổi artwork chưa được đóng gói lại.
