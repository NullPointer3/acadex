import { api } from './client';
import type { SubjectResponse } from '../types';

export interface CreateSubjectRequest {
  name: string;
  code: string;
}

export const subjectsApi = {
  getAll: () => api.get<SubjectResponse[]>('/subjects'),
  create: (data: CreateSubjectRequest) => api.post<SubjectResponse>('/subjects', data),
  update: (id: string, data: CreateSubjectRequest) => api.put<SubjectResponse>(`/subjects/${id}`, data),
  remove: (id: string) => api.delete<void>(`/subjects/${id}`),
};
