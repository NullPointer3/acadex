export type UserRole = 'Admin' | 'Teacher' | 'Student';

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserSummary;
}

export interface TeacherResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  hireDate: string;
  phoneNumber: string | null;
}

export interface StudentResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: string;
  enrollmentDate: string;
  classRoomId: string | null;
  classRoomName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
}

export interface ClassRoomResponse {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  homeroomTeacherId: string | null;
  homeroomTeacherName: string | null;
  studentCount: number;
}

export interface SubjectResponse {
  id: string;
  name: string;
  code: string;
}

export type DayOfWeekName =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntryResponse {
  id: string;
  classRoomId: string;
  classRoomName: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: DayOfWeekName;
  startTime: string;
  endTime: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecordResponse {
  id: string;
  studentId: string;
  studentName: string;
  classRoomId: string;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
}

export interface ExamResponse {
  id: string;
  name: string;
  term: string;
  academicYear: string;
  date: string;
  maxScore: number;
  subjectId: string;
  subjectName: string;
  classRoomId: string;
  classRoomName: string;
}

export interface GradeResponse {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  score: number;
  maxScore: number;
  comments: string | null;
}
