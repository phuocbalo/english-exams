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
var SHEETS_GRADE3_QUESTIONS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqHd8BjeFc1ARAXrhZaQEDMdgSQyutdu2s-2UCO58vun1cFtN3dYtJiqoUC-9BCAeqxLbn87PA_vHU/pub?gid=414394861&single=true&output=csv';
var SHEETS_GRADE3_STRUCTURE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqHd8BjeFc1ARAXrhZaQEDMdgSQyutdu2s-2UCO58vun1cFtN3dYtJiqoUC-9BCAeqxLbn87PA_vHU/pub?gid=1157929152&single=true&output=csv';

// Lớp 4: chưa có Google Sheets, website đọc file CSV trong data/. Khi tạo Google Sheets cho lớp 4 thì dán link vào đây.
var SHEETS_GRADE4_QUESTIONS = '';
var SHEETS_GRADE4_STRUCTURE = '';

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
    },
    4: {
      questions: [SHEETS_GRADE4_QUESTIONS, 'data/grade4.csv'],
      structure: [SHEETS_GRADE4_STRUCTURE, 'data/exam-structure-grade4.csv'],
      units: [
        'My friends', 'Time and daily routines', 'My week', 'My birthday party', 'Things we can do',
        'Our school facilities', 'Our timetables', 'My favourite subjects', 'Our sports day', 'Our summer holidays',
        'My home', 'Jobs', 'Appearance', 'Daily activities', "My family's weekends",
        'Weather', 'In the city', 'At the shopping centre', 'The animal world', 'At summer camp'
      ]
    }
  },
  // Lớp đang mở. Các lớp khác hiện "Coming soon".
  openGrades: [3, 4],
  maxProfiles: 3
};
