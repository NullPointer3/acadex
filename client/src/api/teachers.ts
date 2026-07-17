import { api } from './client';
import type { TeacherResponse } from '../types';

export interface CreateTeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  hireDate: string;
  phoneNumber?: string | null;
}

export interface UpdateTeacherRequest {
  firstName: string;
  lastName: string;
  employeeNumber: string;
  hireDate: string;
  phoneNumber?: string | null;
}

export const teachersApi = {
  getAll: () => api.get<TeacherResponse[]>('/teachers'),
  getById: (id: string) => api.get<TeacherResponse>(`/teachers/${id}`),
  create: (data: CreateTeacherRequest) => api.post<TeacherResponse>('/teachers', data),
  update: (id: string, data: UpdateTeacherRequest) => api.put<TeacherResponse>(`/teachers/${id}`, data),
  remove: (id: string) => api.delete<void>(`/teachers/${id}`),
};
