import { useEffect, useState, type FormEvent } from 'react';
import { classRoomsApi, type CreateClassRoomRequest } from '../api/classRooms';
import { teachersApi } from '../api/teachers';
import type { ClassRoomResponse, TeacherResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyForm: CreateClassRoomRequest = {
  name: '',
  section: '',
  academicYear: '',
  homeroomTeacherId: '',
};

export function ClassRoomsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateClassRoomRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const requests: [Promise<ClassRoomResponse[]>, Promise<TeacherResponse[]>] = [
      classRoomsApi.getAll(),
      isAdmin ? teachersApi.getAll() : Promise.resolve([]),
    ];
    Promise.all(requests)
      .then(([c, t]) => {
        setClassRooms(c);
        setTeachers(t);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [isAdmin]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await classRoomsApi.create({ ...form, homeroomTeacherId: form.homeroomTeacherId || null });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create class room.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this class?')) return;
    await classRoomsApi.remove(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Class
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classRooms.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name} {c.section}</h3>
                  <p className="text-sm text-gray-500">{c.academicYear}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-sm">
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>Homeroom: {c.homeroomTeacherName ?? 'Unassigned'}</p>
                <p>{c.studentCount} student{c.studentCount === 1 ? '' : 's'}</p>
              </div>
            </div>
          ))}
          {classRooms.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-6">No classes yet.</p>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Add Class" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input required placeholder="Name (e.g. Grade 10)" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input required placeholder="Section (e.g. A)" value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input required placeholder="Academic year (e.g. 2026-2027)" value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <select value={form.homeroomTeacherId ?? ''} onChange={(e) => setForm({ ...form, homeroomTeacherId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">No homeroom teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Class
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
