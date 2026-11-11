# Hani Desk

Website luyện đề trắc nghiệm Tiếng Anh cho học sinh tiểu học (Lớp 3 và Lớp 4, sách Global Success).

## Cấu trúc thư mục

| Đường dẫn | Nội dung |
| --- | --- |
| `index.html` | Trang chính của website |
| `css/styles.css` | Giao diện (màu, chữ, nút) |
| `js/config.js` | Cấu hình: nguồn dữ liệu câu hỏi của từng lớp, tên các Unit |
| `js/app.js` | Toàn bộ chức năng: hồ sơ, rút đề, làm bài, chấm điểm, xem lại |
| `data/cau-hoi-lop-3.xlsx` | Bảng câu hỏi Lớp 3 để xem và sửa |
| `data/cau-hoi-lop-4.xlsx` | Bảng câu hỏi Lớp 4 để xem và sửa |
| `data/grade3.csv` | Câu hỏi Lớp 3 mà website đang đọc |
| `data/grade4.csv` | Câu hỏi Lớp 4 mà website đang đọc (300 câu, Unit 1–20) |
| `data/exam-structure.csv` | Cấu trúc đề: số câu mỗi phần của từng loại đề |
| `data/exam-structure-grade4.csv` | Cấu trúc đề Lớp 4 |
| `docs/yeu-cau.md` | Tài liệu yêu cầu sản phẩm |

## Dữ liệu

Mỗi lớp có 2 file CSV khai báo trong `js/config.js`. Lớp 3 đọc từ Google Sheets trước, Lớp 4 hiện đọc file CSV trong `data/` (chưa có Google Sheets). Sau này chuyển sang Google Sheets thì chỉ cần thay 2 đường dẫn đó bằng link CSV đã "Xuất bản lên web" của Google Sheets.

Câu hỏi bị thiếu đáp án, sai chữ đáp án đúng (không phải A–D) hoặc có `active = FALSE` sẽ tự động bị bỏ qua.

## Chạy thử trên máy

```
python3 -m http.server 8000
```

Rồi mở `http://localhost:8000`.
