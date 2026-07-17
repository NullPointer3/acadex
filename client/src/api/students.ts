import { api } from './client';
import type { StudentResponse } from '../types';

export interface CreateStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: string;
  enrollmentDate: string;
  classRoomId?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  dateOfBirth: string;
  classRoomId?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export const studentsApi = {
  getAll: (classRoomId?: string) =>
    api.get<StudentResponse[]>(`/students${classRoomId ? `?classRoomId=${classRoomId}` : ''}`),
  getById: (id: string) => api.get<StudentResponse>(`/students/${id}`),
  getMe: () => api.get<StudentResponse>('/students/me'),
  create: (data: CreateStudentRequest) => api.post<StudentResponse>('/students', data),
  update: (id: string, data: UpdateStudentRequest) => api.put<StudentResponse>(`/students/${id}`, data),
  remove: (id: string) => api.delete<void>(`/students/${id}`),
};
