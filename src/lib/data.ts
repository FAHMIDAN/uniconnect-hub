export interface StudyMaterial {
  id: string;
  title: string;
  type: 'notes' | 'syllabus' | 'question-paper';
  course: string;
  semester: number;
  subject: string;
  uploadedAt: string;
  fileSize: string;
  downloadCount: number;
  isBookmarked?: boolean;
  uploadedBy?: string;
  fileUrl?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  semesters: number;
}

export const courses: Course[] = [
  { id: 'cs', name: 'BSc Computer Science', code: 'BSCCS', semesters: 8 },
  { id: 'phy', name: 'BSc Physics', code: 'BSCPHY', semesters: 8 },
  { id: 'maths', name: 'BSc Mathematics', code: 'BSCMAT', semesters: 8 },
  { id: 'eng', name: 'BA English', code: 'BAENG', semesters: 8 },
  { id: 'eco', name: 'BA Economics', code: 'BAECO', semesters: 8 },
  { id: 'cmh', name: 'BA Communication and Media & History', code: 'BACMH', semesters: 8 },
  { id: 'bcom', name: 'B.Com', code: 'BCOM', semesters: 8 },
];

export const materials: StudyMaterial[] = [
  { id: '1', title: 'Data Structures Complete Notes', type: 'notes', course: 'B.Tech Computer Science', semester: 3, subject: 'Data Structures', uploadedAt: '2025-12-15', fileSize: '4.2 MB', downloadCount: 1245 },
  { id: '2', title: 'Operating Systems Syllabus 2025', type: 'syllabus', course: 'B.Tech Computer Science', semester: 4, subject: 'Operating Systems', uploadedAt: '2025-11-20', fileSize: '1.1 MB', downloadCount: 890 },
  { id: '3', title: 'DBMS Question Paper Dec 2024', type: 'question-paper', course: 'B.Tech Computer Science', semester: 4, subject: 'Database Systems', uploadedAt: '2025-01-10', fileSize: '2.3 MB', downloadCount: 2100 },
  { id: '4', title: 'Computer Networks Notes', type: 'notes', course: 'B.Tech Computer Science', semester: 5, subject: 'Computer Networks', uploadedAt: '2025-10-05', fileSize: '5.8 MB', downloadCount: 670 },
  { id: '5', title: 'Digital Electronics Syllabus', type: 'syllabus', course: 'B.Tech Electronics', semester: 3, subject: 'Digital Electronics', uploadedAt: '2025-09-12', fileSize: '0.9 MB', downloadCount: 430 },
  { id: '6', title: 'Programming in C Question Paper', type: 'question-paper', course: 'BCA', semester: 1, subject: 'Programming in C', uploadedAt: '2025-08-20', fileSize: '1.5 MB', downloadCount: 1560 },
  { id: '7', title: 'Web Technologies Notes', type: 'notes', course: 'BCA', semester: 4, subject: 'Web Technologies', uploadedAt: '2025-07-18', fileSize: '3.7 MB', downloadCount: 920 },
  { id: '8', title: 'Software Engineering Complete Notes', type: 'notes', course: 'MCA', semester: 2, subject: 'Software Engineering', uploadedAt: '2025-06-25', fileSize: '6.1 MB', downloadCount: 780 },
  { id: '9', title: 'Financial Accounting Syllabus', type: 'syllabus', course: 'B.Com', semester: 1, subject: 'Financial Accounting', uploadedAt: '2025-11-01', fileSize: '0.7 MB', downloadCount: 540 },
  { id: '10', title: 'English Literature Question Paper', type: 'question-paper', course: 'BA English', semester: 3, subject: 'British Literature', uploadedAt: '2025-10-22', fileSize: '1.2 MB', downloadCount: 310 },
  { id: '11', title: 'Algorithms Design & Analysis', type: 'notes', course: 'B.Tech Computer Science', semester: 5, subject: 'Algorithms', uploadedAt: '2026-01-15', fileSize: '4.9 MB', downloadCount: 1100 },
  { id: '12', title: 'Machine Learning Basics', type: 'notes', course: 'MCA', semester: 3, subject: 'Machine Learning', uploadedAt: '2026-02-01', fileSize: '7.2 MB', downloadCount: 2300 },
];
