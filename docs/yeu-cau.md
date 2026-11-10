# Hani Desk – Yêu cầu sản phẩm (bản 1)

Website PWA luyện đề trắc nghiệm Tiếng Anh cho học sinh tiểu học. Bản đầu tiên: **Lớp 3** (sách Global Success).

## Người dùng
- Bé lớp 3 tự làm bài trên điện thoại.
- Nút to, chữ to. Hướng dẫn trên giao diện bằng **tiếng Anh**.
- Không cần đăng nhập. Tiến độ lưu trên máy.
- Mỗi máy tạo được 2–3 hồ sơ (tên + ảnh đại diện).

## Cấu trúc
- Màn hình đầu có bước **chọn lớp** (bản 1 chỉ mở Lớp 3, các lớp khác hiện "Coming soon").
- 3 khu vực luyện tập:
  1. **Bài tập theo Unit**: Unit 1 → Unit 20, mỗi Unit 1 đề. Không khóa Unit.
  2. **Ôn luyện học kỳ**: Học kỳ 1 (Unit 1–10), Học kỳ 2 (Unit 11–20).
  3. **Đề thi**: trộn câu từ cả 20 Unit.
- Số câu mỗi phần của từng loại đề: xem tab `Cau truc de` trong bảng câu hỏi.

## Đề bài
- 100% trắc nghiệm, 4 đáp án A–D.
- Câu hỏi xếp theo thứ tự cố định 5 phần: picture_choice → missing_letter → odd_one_out → fill_blank → response.
- Cả 3 loại đề đều **rút ngẫu nhiên** từ kho câu hỏi; chỉ xáo trộn bên trong mỗi phần.
- **Không** đếm giờ (bản 1).
- Chưa có phần nghe (phát triển sau).

## Chấm điểm và xem lại
- Báo đúng/sai **sau khi nộp bài** (cả 3 loại đề).
- Thang điểm 10.
- Sau khi nộp: xem lại từng câu sai kèm giải thích.

## Giao diện
- Tên: **Hani Desk**.
- Phong cách vui nhộn, hoạt hình, nhiều màu.
- Linh vật: một chú **ốc sên**. Khi tạo hồ sơ, bé chọn Nam hoặc Nữ: bé Nữ dùng mẫu B (Kawaii), bé Nam dùng mẫu E (Speedy). Bản thiết kế hiện dùng mẫu B.
- Hình ảnh: emoji ở bản 1, thay dần bằng hình vẽ.
- Có hiệu ứng âm thanh, kèm nút tắt âm.

## Dữ liệu và triển khai
- Câu hỏi quản lý bằng **Google Sheets**.
- Website đưa lên **GitHub Pages** (kho `phuocbalo/english-exams`, công khai): https://phuocbalo.github.io/english-exams/
- Cài được lên màn hình chính (PWA) và làm bài khi không có mạng (dùng bản câu hỏi đã tải lần gần nhất).
- Nội dung: khoảng 60% bám sát sách giáo khoa, 40% câu hỏi mới.
