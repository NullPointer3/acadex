import { api } from './client';
import type { ExamResponse } from '../types';

export interface CreateExamRequest {
  name: string;
  term: string;
  academicYear: string;
  date: string;
  maxScore: number;
  subjectId: string;
  classRoomId: string;
}

export const examsApi = {
  getAll: (params?: { classRoomId?: string; subjectId?: string }) => {
    const query = new URLSearchParams();
    if (params?.classRoomId) query.set('classRoomId', params.classRoomId);
    if (params?.subjectId) query.set('subjectId', params.subjectId);
    const qs = query.toString();
    return api.get<ExamResponse[]>(`/exams${qs ? `?${qs}` : ''}`);
  },
  create: (data: CreateExamRequest) => api.post<ExamResponse>('/exams', data),
  remove: (id: string) => api.delete<void>(`/exams/${id}`),
};
