import { api } from './client';
import type { ClassRoomResponse } from '../types';

export interface CreateClassRoomRequest {
  name: string;
  section: string;
  academicYear: string;
  homeroomTeacherId?: string | null;
}

export const classRoomsApi = {
  getAll: () => api.get<ClassRoomResponse[]>('/classrooms'),
  getById: (id: string) => api.get<ClassRoomResponse>(`/classrooms/${id}`),
  create: (data: CreateClassRoomRequest) => api.post<ClassRoomResponse>('/classrooms', data),
  update: (id: string, data: CreateClassRoomRequest) => api.put<ClassRoomResponse>(`/classrooms/${id}`, data),
  remove: (id: string) => api.delete<void>(`/classrooms/${id}`),
};
