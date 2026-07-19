import type {
  UserRole,
  TeacherResponse,
  StudentResponse,
  ClassRoomResponse,
  SubjectResponse,
  TimetableEntryResponse,
  DayOfWeekName,
  AttendanceStatus,
  AttendanceRecordResponse,
  ExamResponse,
  GradeResponse,
} from '../types';

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export const users: MockUser[] = [
  { id: 'u-admin', email: 'admin@acadex.local', firstName: 'Grace', lastName: 'Whitaker', role: 'Admin' },
  { id: 'u-t1', email: 'emma.clarke@acadex.local', firstName: 'Emma', lastName: 'Clarke', role: 'Teacher' },
  { id: 'u-t2', email: 'daniel.osei@acadex.local', firstName: 'Daniel', lastName: 'Osei', role: 'Teacher' },
  { id: 'u-t3', email: 'priya.nair@acadex.local', firstName: 'Priya', lastName: 'Nair', role: 'Teacher' },
  { id: 'u-t4', email: 'marcus.reid@acadex.local', firstName: 'Marcus', lastName: 'Reid', role: 'Teacher' },
  { id: 'u-t5', email: 'sofia.moreno@acadex.local', firstName: 'Sofia', lastName: 'Moreno', role: 'Teacher' },
];

interface TeacherSeed {
  id: string;
  userId: string;
  employeeNumber: string;
  hireDate: string;
  phoneNumber: string | null;
}

const teacherSeeds: TeacherSeed[] = [
  { id: 't1', userId: 'u-t1', employeeNumber: 'EMP-1001', hireDate: '2019-08-15', phoneNumber: '+1 555-0101' },
  { id: 't2', userId: 'u-t2', employeeNumber: 'EMP-1002', hireDate: '2020-01-10', phoneNumber: '+1 555-0102' },
  { id: 't3', userId: 'u-t3', employeeNumber: 'EMP-1003', hireDate: '2018-06-01', phoneNumber: '+1 555-0103' },
  { id: 't4', userId: 'u-t4', employeeNumber: 'EMP-1004', hireDate: '2021-09-01', phoneNumber: null },
  { id: 't5', userId: 'u-t5', employeeNumber: 'EMP-1005', hireDate: '2022-03-20', phoneNumber: '+1 555-0105' },
];

export const teachers: TeacherResponse[] = teacherSeeds.map((seed) => {
  const user = users.find((u) => u.id === seed.userId)!;
  return {
    id: seed.id,
    userId: seed.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    employeeNumber: seed.employeeNumber,
    hireDate: seed.hireDate,
    phoneNumber: seed.phoneNumber,
  };
});

export const subjects: SubjectResponse[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH101' },
  { id: 'sub2', name: 'English', code: 'ENG101' },
  { id: 'sub3', name: 'Science', code: 'SCI101' },
  { id: 'sub4', name: 'History', code: 'HIST101' },
  { id: 'sub5', name: 'Art', code: 'ART101' },
  { id: 'sub6', name: 'Physical Education', code: 'PE101' },
];

interface ClassRoomSeed {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  homeroomTeacherId: string | null;
}

const classRoomSeeds: ClassRoomSeed[] = [
  { id: 'c1', name: 'Grade 9', section: 'A', academicYear: '2025-2026', homeroomTeacherId: 't1' },
  { id: 'c2', name: 'Grade 9', section: 'B', academicYear: '2025-2026', homeroomTeacherId: 't2' },
  { id: 'c3', name: 'Grade 10', section: 'A', academicYear: '2025-2026', homeroomTeacherId: 't3' },
  { id: 'c4', name: 'Grade 10', section: 'B', academicYear: '2025-2026', homeroomTeacherId: null },
];

export const classRooms: ClassRoomSeed[] = classRoomSeeds;

export function classRoomResponses(): ClassRoomResponse[] {
  return classRooms.map((c) => {
    const homeroom = teachers.find((t) => t.id === c.homeroomTeacherId) ?? null;
    return {
      id: c.id,
      name: c.name,
      section: c.section,
      academicYear: c.academicYear,
      homeroomTeacherId: c.homeroomTeacherId,
      homeroomTeacherName: homeroom ? `${homeroom.firstName} ${homeroom.lastName}` : null,
      studentCount: students.filter((s) => s.classRoomId === c.id).length,
    };
  });
}

export function classRoomLabel(classRoomId: string | null): string | null {
  const c = classRooms.find((cr) => cr.id === classRoomId);
  return c ? `${c.name} ${c.section}` : null;
}

interface StudentSeed {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: string;
  classRoomId: string;
  guardianName: string;
  guardianPhone: string;
}

const STUDENT_NAMES: [string, string][] = [
  ['Liam', 'Carter'], ['Olivia', 'Bennett'], ['Noah', 'Fischer'], ['Ava', 'Thompson'], ['Ethan', 'Brooks'],
  ['Mia', 'Sanders'], ['Lucas', 'Grant'], ['Isabella', 'Cruz'], ['Mason', 'Reed'], ['Sophia', 'Delgado'],
  ['James', 'Whitfield'], ['Amelia', 'Ross'], ['Benjamin', 'Hayes'], ['Charlotte', 'Nguyen'], ['Henry', 'Okafor'],
  ['Grace', 'Patel'], ['Alexander', 'Kim'], ['Chloe', 'Martinez'], ['Sebastian', 'Wright'], ['Zoe', 'Coleman'],
];

const GUARDIANS: [string, string][] = [
  ['Robert Carter', '+1 555-0201'], ['Karen Bennett', '+1 555-0202'], ['David Fischer', '+1 555-0203'],
  ['Linda Thompson', '+1 555-0204'], ['Michael Brooks', '+1 555-0205'], ['Susan Sanders', '+1 555-0206'],
  ['Paul Grant', '+1 555-0207'], ['Maria Cruz', '+1 555-0208'], ['Kevin Reed', '+1 555-0209'],
  ['Laura Delgado', '+1 555-0210'], ['Frank Whitfield', '+1 555-0211'], ['Nancy Ross', '+1 555-0212'],
  ['George Hayes', '+1 555-0213'], ['Helen Nguyen', '+1 555-0214'], ['Chidi Okafor', '+1 555-0215'],
  ['Anita Patel', '+1 555-0216'], ['Steven Kim', '+1 555-0217'], ['Rosa Martinez', '+1 555-0218'],
  ['Peter Wright', '+1 555-0219'], ['Diane Coleman', '+1 555-0220'],
];

const studentSeeds: StudentSeed[] = STUDENT_NAMES.map(([firstName, lastName], i) => ({
  id: `s${i + 1}`,
  userId: `u-s${i + 1}`,
  firstName,
  lastName,
  admissionNumber: `ADM-2026-${String(i + 1).padStart(3, '0')}`,
  dateOfBirth: `${2010 + (i % 4)}-0${((i % 9) + 1)}-1${i % 9}`,
  classRoomId: classRoomSeeds[i % classRoomSeeds.length].id,
  guardianName: GUARDIANS[i][0],
  guardianPhone: GUARDIANS[i][1],
}));

// The first student doubles as the demo "Student" login.
users.push({ id: 'u-s1', email: 'liam.carter@acadex.local', firstName: 'Liam', lastName: 'Carter', role: 'Student' });
for (let i = 1; i < studentSeeds.length; i++) {
  users.push({
    id: `u-s${i + 1}`,
    email: `${studentSeeds[i].firstName.toLowerCase()}.${studentSeeds[i].lastName.toLowerCase()}@acadex.local`,
    firstName: studentSeeds[i].firstName,
    lastName: studentSeeds[i].lastName,
    role: 'Student',
  });
}

export const students: (StudentSeed & { enrollmentDate: string })[] = studentSeeds.map((s) => ({
  ...s,
  enrollmentDate: '2025-08-20',
}));

export function studentResponse(s: (typeof students)[number]): StudentResponse {
  const user = users.find((u) => u.id === s.userId)!;
  return {
    id: s.id,
    userId: s.userId,
    email: user.email,
    firstName: s.firstName,
    lastName: s.lastName,
    admissionNumber: s.admissionNumber,
    dateOfBirth: s.dateOfBirth,
    enrollmentDate: s.enrollmentDate,
    classRoomId: s.classRoomId,
    classRoomName: classRoomLabel(s.classRoomId),
    guardianName: s.guardianName,
    guardianPhone: s.guardianPhone,
  };
}

export function studentResponses(): StudentResponse[] {
  return students.map(studentResponse);
}

// Which subjects (and which teacher) are taught in each class.
const CLASS_SUBJECTS: Record<string, { subjectId: string; teacherId: string }[]> = {
  c1: [
    { subjectId: 'sub1', teacherId: 't1' },
    { subjectId: 'sub2', teacherId: 't2' },
    { subjectId: 'sub3', teacherId: 't3' },
  ],
  c2: [
    { subjectId: 'sub1', teacherId: 't1' },
    { subjectId: 'sub4', teacherId: 't4' },
    { subjectId: 'sub5', teacherId: 't5' },
  ],
  c3: [
    { subjectId: 'sub3', teacherId: 't3' },
    { subjectId: 'sub2', teacherId: 't2' },
    { subjectId: 'sub6', teacherId: 't5' },
  ],
  c4: [
    { subjectId: 'sub1', teacherId: 't1' },
    { subjectId: 'sub4', teacherId: 't4' },
    { subjectId: 'sub3', teacherId: 't3' },
  ],
};

const WEEK_DAYS: DayOfWeekName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS: [string, string][] = [['08:00', '09:00'], ['09:15', '10:15'], ['10:30', '11:30']];

let timetableSeq = 1;
export const timetableEntries: TimetableEntryResponse[] = [];

for (const classRoomId of Object.keys(CLASS_SUBJECTS)) {
  const pairs = CLASS_SUBJECTS[classRoomId];
  for (let dayIdx = 0; dayIdx < WEEK_DAYS.length; dayIdx++) {
    for (let period = 0; period < PERIODS.length; period++) {
      const pair = pairs[(dayIdx + period) % pairs.length];
      const subject = subjects.find((s) => s.id === pair.subjectId)!;
      const teacher = teachers.find((t) => t.id === pair.teacherId)!;
      timetableEntries.push({
        id: `tt${timetableSeq++}`,
        classRoomId,
        classRoomName: classRoomLabel(classRoomId)!,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        dayOfWeek: WEEK_DAYS[dayIdx],
        startTime: PERIODS[period][0],
        endTime: PERIODS[period][1],
      });
    }
  }
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

let attendanceSeq = 1;
export const attendanceRecords: AttendanceRecordResponse[] = [];

const STATUS_CYCLE: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Late', 'Present', 'Absent', 'Present', 'Excused'];

for (const dayOffset of [0, 1, 2, 7]) {
  const date = isoDaysAgo(dayOffset);
  students.forEach((s, i) => {
    attendanceRecords.push({
      id: `att${attendanceSeq++}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      classRoomId: s.classRoomId,
      date,
      status: STATUS_CYCLE[(i + dayOffset) % STATUS_CYCLE.length],
      notes: null,
    });
  });
}

let examSeq = 1;
export const exams: ExamResponse[] = [];

for (const classRoomId of Object.keys(CLASS_SUBJECTS)) {
  for (const pair of CLASS_SUBJECTS[classRoomId]) {
    const subject = subjects.find((s) => s.id === pair.subjectId)!;
    exams.push({
      id: `ex${examSeq++}`,
      name: `${subject.name} Midterm`,
      term: 'Term 1',
      academicYear: '2025-2026',
      date: isoDaysAgo(21),
      maxScore: 100,
      subjectId: subject.id,
      subjectName: subject.name,
      classRoomId,
      classRoomName: classRoomLabel(classRoomId)!,
    });
  }
}

let gradeSeq = 1;
export const grades: GradeResponse[] = [];

for (const exam of exams) {
  const classStudents = students.filter((s) => s.classRoomId === exam.classRoomId);
  classStudents.forEach((s, i) => {
    const score = 55 + ((i * 13 + exam.id.length * 7) % 46);
    grades.push({
      id: `gr${gradeSeq++}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      examId: exam.id,
      examName: exam.name,
      score,
      maxScore: exam.maxScore,
      comments: score >= 80 ? 'Excellent work.' : score >= 50 ? 'Good effort, keep practicing.' : 'Needs improvement.',
    });
  });
}

export function nextId(prefix: string): string {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}
