import { api } from './client';
import type { GradeResponse } from '../types';

export interface GradeEntry {
  studentId: string;
  score: number;
  comments?: string | null;
}

export interface RecordGradesRequest {
  examId: string;
  entries: GradeEntry[];
}

export const gradesApi = {
  getByExam: (examId: string) => api.get<GradeResponse[]>(`/grades/exam/${examId}`),
  getByStudent: (studentId: string) => api.get<GradeResponse[]>(`/grades/student/${studentId}`),
  record: (data: RecordGradesRequest) => api.post<GradeResponse[]>('/grades', data),
};
