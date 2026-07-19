import { ApiError } from '../api/errors';
import type {
  AuthResponse,
  UserSummary,
  DayOfWeekName,
  AttendanceStatus,
} from '../types';
import {
  users,
  teachers,
  subjects,
  classRooms,
  classRoomLabel,
  classRoomResponses,
  students,
  studentResponse,
  studentResponses,
  timetableEntries,
  attendanceRecords,
  exams,
  grades,
  nextId,
} from './data';

export const isMockMode = import.meta.env.VITE_USE_MOCKS === 'true';

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function currentUser(token: string | null): UserSummary {
  const id = token?.startsWith('mock:') ? token.slice(5) : null;
  const user = id ? users.find((u) => u.id === id) : undefined;
  if (!user) throw new ApiError(401, 'Not authenticated.');
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
}

function notFound(): never {
  throw new ApiError(404, 'Not found.');
}

function segments(path: string): { pathname: string; query: URLSearchParams } {
  const url = new URL(`http://mock${path}`);
  return { pathname: url.pathname, query: url.searchParams };
}

export async function handleMockRequest<T>(
  path: string,
  method: string,
  body: Record<string, any> | undefined,
  token: string | null,
): Promise<T> {
  const { pathname, query } = segments(path);
  const parts = pathname.split('/').filter(Boolean); // ['students', ':id'] etc.

  try {
    return await delay(dispatch(parts, method, query, body ?? {}, token) as T);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Mock request failed.');
  }
}

function dispatch(
  parts: string[],
  method: string,
  query: URLSearchParams,
  body: Record<string, any>,
  token: string | null,
): unknown {
  const [resource, id, sub] = parts;

  // ---- auth ----
  if (resource === 'auth' && parts.length === 2 && parts[1] === 'login' && method === 'POST') {
    const email = String(body?.email ?? '').toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) throw new ApiError(401, 'Invalid email or password.');
    const response: AuthResponse = {
      token: `mock:${user.id}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
    return response;
  }
  if (resource === 'auth' && parts.length === 2 && parts[1] === 'me' && method === 'GET') {
    return currentUser(token);
  }

  // ---- students ----
  if (resource === 'students') {
    if (parts.length === 1 && method === 'GET') {
      const classRoomId = query.get('classRoomId');
      return studentResponses().filter((s) => !classRoomId || s.classRoomId === classRoomId);
    }
    if (parts.length === 2 && id === 'me' && method === 'GET') {
      const me = currentUser(token);
      const student = students.find((s) => s.userId === me.id);
      if (!student) notFound();
      return studentResponse(student);
    }
    if (parts.length === 2 && method === 'GET') {
      const student = students.find((s) => s.id === id);
      if (!student) notFound();
      return studentResponse(student);
    }
    if (parts.length === 1 && method === 'POST') {
      const newId = nextId('s');
      const userId = nextId('u-s');
      users.push({ id: userId, email: body.email, firstName: body.firstName, lastName: body.lastName, role: 'Student' });
      students.push({
        id: newId,
        userId,
        firstName: body.firstName,
        lastName: body.lastName,
        admissionNumber: body.admissionNumber,
        dateOfBirth: body.dateOfBirth,
        enrollmentDate: body.enrollmentDate,
        classRoomId: body.classRoomId ?? '',
        guardianName: body.guardianName ?? '',
        guardianPhone: body.guardianPhone ?? '',
      });
      return studentResponse(students[students.length - 1]);
    }
    if (parts.length === 2 && method === 'PUT') {
      const student = students.find((s) => s.id === id);
      if (!student) notFound();
      Object.assign(student, {
        firstName: body.firstName,
        lastName: body.lastName,
        admissionNumber: body.admissionNumber,
        dateOfBirth: body.dateOfBirth,
        classRoomId: body.classRoomId ?? student.classRoomId,
        guardianName: body.guardianName ?? student.guardianName,
        guardianPhone: body.guardianPhone ?? student.guardianPhone,
      });
      return studentResponse(student);
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = students.findIndex((s) => s.id === id);
      if (idx === -1) notFound();
      students.splice(idx, 1);
      return undefined;
    }
  }

  // ---- teachers ----
  if (resource === 'teachers') {
    if (parts.length === 1 && method === 'GET') return teachers;
    if (parts.length === 2 && method === 'GET') {
      const teacher = teachers.find((t) => t.id === id);
      if (!teacher) notFound();
      return teacher;
    }
    if (parts.length === 1 && method === 'POST') {
      const newId = nextId('t');
      const userId = nextId('u-t');
      users.push({ id: userId, email: body.email, firstName: body.firstName, lastName: body.lastName, role: 'Teacher' });
      teachers.push({
        id: newId,
        userId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        employeeNumber: body.employeeNumber,
        hireDate: body.hireDate,
        phoneNumber: body.phoneNumber ?? null,
      });
      return teachers[teachers.length - 1];
    }
    if (parts.length === 2 && method === 'PUT') {
      const teacher = teachers.find((t) => t.id === id);
      if (!teacher) notFound();
      Object.assign(teacher, {
        firstName: body.firstName,
        lastName: body.lastName,
        employeeNumber: body.employeeNumber,
        hireDate: body.hireDate,
        phoneNumber: body.phoneNumber ?? null,
      });
      return teacher;
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = teachers.findIndex((t) => t.id === id);
      if (idx === -1) notFound();
      teachers.splice(idx, 1);
      return undefined;
    }
  }

  // ---- classrooms ----
  if (resource === 'classrooms') {
    if (parts.length === 1 && method === 'GET') return classRoomResponses();
    if (parts.length === 2 && method === 'GET') {
      const found = classRoomResponses().find((c) => c.id === id);
      if (!found) notFound();
      return found;
    }
    if (parts.length === 1 && method === 'POST') {
      const newId = nextId('c');
      classRooms.push({
        id: newId,
        name: body.name,
        section: body.section,
        academicYear: body.academicYear,
        homeroomTeacherId: body.homeroomTeacherId || null,
      });
      return classRoomResponses().find((c) => c.id === newId);
    }
    if (parts.length === 2 && method === 'PUT') {
      const room = classRooms.find((c) => c.id === id);
      if (!room) notFound();
      Object.assign(room, {
        name: body.name,
        section: body.section,
        academicYear: body.academicYear,
        homeroomTeacherId: body.homeroomTeacherId || null,
      });
      return classRoomResponses().find((c) => c.id === id);
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = classRooms.findIndex((c) => c.id === id);
      if (idx === -1) notFound();
      classRooms.splice(idx, 1);
      return undefined;
    }
  }

  // ---- subjects ----
  if (resource === 'subjects') {
    if (parts.length === 1 && method === 'GET') return subjects;
    if (parts.length === 2 && method === 'GET') {
      const found = subjects.find((s) => s.id === id);
      if (!found) notFound();
      return found;
    }
    if (parts.length === 1 && method === 'POST') {
      const newId = nextId('sub');
      subjects.push({ id: newId, name: body.name, code: body.code });
      return subjects[subjects.length - 1];
    }
    if (parts.length === 2 && method === 'PUT') {
      const subject = subjects.find((s) => s.id === id);
      if (!subject) notFound();
      Object.assign(subject, { name: body.name, code: body.code });
      return subject;
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = subjects.findIndex((s) => s.id === id);
      if (idx === -1) notFound();
      subjects.splice(idx, 1);
      return undefined;
    }
  }

  // ---- timetable ----
  if (resource === 'timetable') {
    if (parts.length === 1 && method === 'GET') {
      const classRoomId = query.get('classRoomId');
      const teacherId = query.get('teacherId');
      return timetableEntries.filter(
        (e) => (!classRoomId || e.classRoomId === classRoomId) && (!teacherId || e.teacherId === teacherId),
      );
    }
    if (parts.length === 1 && method === 'POST') {
      const subject = subjects.find((s) => s.id === body.subjectId)!;
      const teacher = teachers.find((t) => t.id === body.teacherId)!;
      const entry = {
        id: nextId('tt'),
        classRoomId: body.classRoomId,
        classRoomName: classRoomLabel(body.classRoomId)!,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        dayOfWeek: body.dayOfWeek as DayOfWeekName,
        startTime: body.startTime,
        endTime: body.endTime,
      };
      timetableEntries.push(entry);
      return entry;
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = timetableEntries.findIndex((e) => e.id === id);
      if (idx === -1) notFound();
      timetableEntries.splice(idx, 1);
      return undefined;
    }
  }

  // ---- attendance ----
  if (resource === 'attendance') {
    if (parts.length === 1 && method === 'GET') {
      const classRoomId = query.get('classRoomId');
      const date = query.get('date');
      return attendanceRecords.filter((r) => r.classRoomId === classRoomId && r.date === date);
    }
    if (parts.length === 3 && id === 'student' && method === 'GET') {
      const studentId = sub;
      return attendanceRecords.filter((r) => r.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
    }
    if (parts.length === 1 && method === 'POST') {
      const classRoomId: string = body.classRoomId;
      const date: string = body.date;
      const entries: { studentId: string; status: AttendanceStatus; notes?: string | null }[] = body.entries;
      const result = entries.map((entry) => {
        const student = students.find((s) => s.id === entry.studentId)!;
        let record = attendanceRecords.find((r) => r.classRoomId === classRoomId && r.date === date && r.studentId === entry.studentId);
        if (!record) {
          record = {
            id: nextId('att'),
            studentId: entry.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            classRoomId,
            date,
            status: entry.status,
            notes: entry.notes ?? null,
          };
          attendanceRecords.push(record);
        } else {
          record.status = entry.status;
          record.notes = entry.notes ?? null;
        }
        return record;
      });
      return result;
    }
  }

  // ---- exams ----
  if (resource === 'exams') {
    if (parts.length === 1 && method === 'GET') {
      const classRoomId = query.get('classRoomId');
      const subjectId = query.get('subjectId');
      return exams.filter((e) => (!classRoomId || e.classRoomId === classRoomId) && (!subjectId || e.subjectId === subjectId));
    }
    if (parts.length === 2 && method === 'GET') {
      const exam = exams.find((e) => e.id === id);
      if (!exam) notFound();
      return exam;
    }
    if (parts.length === 1 && method === 'POST') {
      const subject = subjects.find((s) => s.id === body.subjectId)!;
      const exam = {
        id: nextId('ex'),
        name: body.name,
        term: body.term,
        academicYear: body.academicYear,
        date: body.date,
        maxScore: body.maxScore,
        subjectId: subject.id,
        subjectName: subject.name,
        classRoomId: body.classRoomId,
        classRoomName: classRoomLabel(body.classRoomId)!,
      };
      exams.push(exam);
      return exam;
    }
    if (parts.length === 2 && method === 'DELETE') {
      const idx = exams.findIndex((e) => e.id === id);
      if (idx === -1) notFound();
      exams.splice(idx, 1);
      return undefined;
    }
  }

  // ---- grades ----
  if (resource === 'grades') {
    if (parts.length === 3 && id === 'exam' && method === 'GET') {
      return grades.filter((g) => g.examId === sub);
    }
    if (parts.length === 3 && id === 'student' && method === 'GET') {
      return grades.filter((g) => g.studentId === sub);
    }
    if (parts.length === 1 && method === 'POST') {
      const examId: string = body.examId;
      const exam = exams.find((e) => e.id === examId)!;
      const entries: { studentId: string; score: number; comments?: string | null }[] = body.entries;
      const result = entries.map((entry) => {
        const student = students.find((s) => s.id === entry.studentId)!;
        let grade = grades.find((g) => g.examId === examId && g.studentId === entry.studentId);
        if (!grade) {
          grade = {
            id: nextId('gr'),
            studentId: entry.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            examId,
            examName: exam.name,
            score: entry.score,
            maxScore: exam.maxScore,
            comments: entry.comments ?? null,
          };
          grades.push(grade);
        } else {
          grade.score = entry.score;
          grade.comments = entry.comments ?? grade.comments;
        }
        return grade;
      });
      return result;
    }
  }

  notFound();
}
