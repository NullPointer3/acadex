import { api } from './client';
import type { AttendanceRecordResponse, AttendanceStatus } from '../types';

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface RecordAttendanceRequest {
  classRoomId: string;
  date: string;
  entries: AttendanceEntry[];
}

export const attendanceApi = {
  getByClassAndDate: (classRoomId: string, date: string) =>
    api.get<AttendanceRecordResponse[]>(`/attendance?classRoomId=${classRoomId}&date=${date}`),
  getByStudent: (studentId: string) =>
    api.get<AttendanceRecordResponse[]>(`/attendance/student/${studentId}`),
  record: (data: RecordAttendanceRequest) => api.post<AttendanceRecordResponse[]>('/attendance', data),
};
