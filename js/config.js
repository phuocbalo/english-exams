/*
 * Hani Desk – cấu hình dữ liệu.
 *
 * Mỗi lớp có 2 nguồn dữ liệu dạng CSV:
 *   questions: danh sách câu hỏi
 *   structure: cấu trúc đề (số câu mỗi phần của từng loại đề)
 *
 * Hiện đang đọc file CSV trong thư mục data/ của kho GitHub.
 * Khi chuyển sang Google Sheets, chỉ cần thay 2 đường dẫn này bằng
 * link "Xuất bản lên web" (định dạng CSV) của từng tab trong Google Sheets.
 */
window.HANI_CONFIG = {
  grades: {
    3: {
      questions: 'data/grade3.csv',
      structure: 'data/exam-structure.csv',
      units: [
        'Hello', 'Our names', 'Our friends', 'Our bodies', 'My hobbies',
        'Our school', 'Classroom instructions', 'My school things', 'Colours', 'Break time activities',
        'My family', 'Jobs', 'My house', 'My bedroom', 'At the dining table',
        'My pets', 'Our toys', 'Playing and doing', 'Outdoor activities', 'At the zoo'
      ]
    }
  },
  // Lớp đang mở. Các lớp khác hiện "Coming soon".
  openGrades: [3],
  maxProfiles: 3
};
