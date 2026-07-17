import { useEffect, useState, type FormEvent } from 'react';
import { studentsApi, type CreateStudentRequest } from '../api/students';
import { classRoomsApi } from '../api/classRooms';
import type { StudentResponse, ClassRoomResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyForm: CreateStudentRequest = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  admissionNumber: '',
  dateOfBirth: '',
  enrollmentDate: '',
  classRoomId: '',
  guardianName: '',
  guardianPhone: '',
};

export function StudentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStudentRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([studentsApi.getAll(), classRoomsApi.getAll()])
      .then(([s, c]) => {
        setStudents(s);
        setClassRooms(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await studentsApi.create({ ...form, classRoomId: form.classRoomId || null });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create student.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this student?')) return;
    await studentsApi.remove(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Student
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Admission #</th>
                <th className="px-4 py-2 font-medium">Class</th>
                <th className="px-4 py-2 font-medium">Guardian</th>
                {isAdmin && <th className="px-4 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.admissionNumber}</td>
                  <td className="px-4 py-2">{s.classRoomName ?? '-'}</td>
                  <td className="px-4 py-2">{s.guardianName ?? '-'}</td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-6 text-center text-gray-400">
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Student" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="First name" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2" />
              <input required placeholder="Last name" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input required type="password" placeholder="Temporary password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input required placeholder="Admission number" value={form.admissionNumber}
              onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date of birth</label>
                <input required type="date" value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Enrollment date</label>
                <input required type="date" value={form.enrollmentDate}
                  onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <select value={form.classRoomId ?? ''} onChange={(e) => setForm({ ...form, classRoomId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">No class assigned</option>
              {classRooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
              ))}
            </select>
            <input placeholder="Guardian name (optional)" value={form.guardianName ?? ''}
              onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input placeholder="Guardian phone (optional)" value={form.guardianPhone ?? ''}
              onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Student
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
