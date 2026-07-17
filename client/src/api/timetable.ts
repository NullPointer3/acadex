import { api } from './client';
import type { DayOfWeekName, TimetableEntryResponse } from '../types';

export interface CreateTimetableEntryRequest {
  classRoomId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeekName;
  startTime: string;
  endTime: string;
}

export const timetableApi = {
  getAll: (params?: { classRoomId?: string; teacherId?: string }) => {
    const query = new URLSearchParams();
    if (params?.classRoomId) query.set('classRoomId', params.classRoomId);
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    const qs = query.toString();
    return api.get<TimetableEntryResponse[]>(`/timetable${qs ? `?${qs}` : ''}`);
  },
  create: (data: CreateTimetableEntryRequest) => api.post<TimetableEntryResponse>('/timetable', data),
  remove: (id: string) => api.delete<void>(`/timetable/${id}`),
};
