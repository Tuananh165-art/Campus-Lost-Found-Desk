# Ảnh demo Expo Go trên điện thoại

19 ảnh JPG trong thư mục này do người dùng cung cấp từ iPhone. Ảnh đã được đổi tên theo nội dung, không chuyển định dạng và được nhúng kèm chú thích trong [README.md](../../README.md), mục “Ảnh demo Expo Go trên điện thoại”.

## Danh sách ảnh hiện có

1. `01-login.jpg` — màn hình đăng nhập.
2. `02-login-invalid-username.jpg` — lỗi tên tài khoản không hợp lệ.
3. `03-list-user-b-all.jpg` — danh sách `user-b` với bộ lọc Tất cả.
4. `04-list-user-a-all.jpg` — danh sách `user-a` sau khi có món Chuột máy tính.
5. `05-list-user-a-private-item.jpg` — danh sách A có món riêng `Riêng của A 1923051085`.
6. `06-list-compact-cards.jpg` — chế độ thẻ gọn.
7. `07-list-overdue-items.jpg` — các thẻ quá hạn và số liệu cuối danh sách.
8. `08-search-no-results.jpg` — tìm kiếm không có kết quả.
9. `09-search-library-results.jpg` — kết quả tìm “Thư viện”.
10. `10-filter-archived-empty.jpg` — bộ lọc Lưu trữ rỗng.
11. `11-filter-claimed.jpg` — bộ lọc Đã nhận.
12. `12-filter-open.jpg` — bộ lọc Đang chờ.
13. `13-filter-all.jpg` — bộ lọc Tất cả.
14. `14-new-item-form-filled.jpg` — form món mới đã điền và có ảnh xem trước.
15. `15-new-item-photo-controls.jpg` — các nút chụp/chọn/bỏ ảnh và lưu món.
16. `16-detail-open.jpg` — chi tiết món đang chờ.
17. `17-detail-claimed-photo.jpg` — chi tiết Chuột máy tính đã nhận, có ảnh.
18. `18-detail-archived.jpg` — chi tiết món lưu trữ.
19. `19-delete-confirmation.jpg` — xác nhận trước khi xóa.

## Phạm vi bằng chứng

Ảnh cho thấy các màn hình thật trên điện thoại và các luồng được chú thích. Bộ hiện tại **chưa có** ảnh từ chối quyền camera/ảnh. Ảnh `05-list-user-a-private-item.jpg` cho thấy món riêng của A; ảnh `03-list-user-b-all.jpg` cho thấy danh sách B ở trạng thái riêng. Hai ảnh này không ghi nhận một lần chuyển liền mạch A → đăng xuất → B, nên chưa chứng minh B không nhìn thấy món A sau chuyển tài khoản. Bộ cũng không bao gồm ảnh terminal `tsc`/test, kết quả sau khi xóa, hay bước khôi phục phiên/ảnh sau khi đóng mở app.

Để bổ sung bằng chứng native: chụp lại trạng thái app sau khi thu hồi quyền ảnh/camera và thử chọn ảnh; rồi tạo món riêng khi đăng nhập A, chụp trước khi đăng xuất, đăng xuất A, đăng nhập B và chụp danh sách hoặc tìm kiếm xác nhận món A không xuất hiện. Giữ log `typecheck` và `test` trong `evidence/`; không dùng ảnh web/E2E thay ảnh Expo Go.
