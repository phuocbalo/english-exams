/*
 * Hani Desk – cấu hình dữ liệu.
 *
 * Mỗi lớp có 2 nguồn dữ liệu dạng CSV:
 *   questions: danh sách câu hỏi        (tab "Questions" trong Google Sheets)
 *   structure: cấu trúc đề              (tab "Cau truc de" trong Google Sheets)
 *
 * Mỗi nguồn là một danh sách đường dẫn, website thử lần lượt từ trên xuống:
 *   1. link CSV "Xuất bản lên web" của Google Sheets (dán vào chỗ SHEETS_... bên dưới)
 *   2. file CSV dự phòng trong thư mục data/ của kho GitHub
 * Để trống link Google Sheets ('') thì website dùng file dự phòng.
 */
var SHEETS_GRADE3_QUESTIONS = '';
var SHEETS_GRADE3_STRUCTURE = '';

window.HANI_CONFIG = {
  grades: {
    3: {
      questions: [SHEETS_GRADE3_QUESTIONS, 'data/grade3.csv'],
      structure: [SHEETS_GRADE3_STRUCTURE, 'data/exam-structure.csv'],
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
