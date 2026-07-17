import { useEffect, useState, type FormEvent } from 'react';
import { teachersApi, type CreateTeacherRequest } from '../api/teachers';
import type { TeacherResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';

const emptyForm: CreateTeacherRequest = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  employeeNumber: '',
  hireDate: '',
  phoneNumber: '',
};

export function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTeacherRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    teachersApi.getAll().then(setTeachers).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await teachersApi.create(form);
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create teacher.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this teacher?')) return;
    await teachersApi.remove(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Add Teacher
        </button>
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
                <th className="px-4 py-2 font-medium">Employee #</th>
                <th className="px-4 py-2 font-medium">Hire Date</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{t.firstName} {t.lastName}</td>
                  <td className="px-4 py-2">{t.email}</td>
                  <td className="px-4 py-2">{t.employeeNumber}</td>
                  <td className="px-4 py-2">{new Date(t.hireDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{t.phoneNumber ?? '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No teachers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Teacher" onClose={() => setShowForm(false)}>
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
            <input required placeholder="Employee number" value={form.employeeNumber}
              onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hire date</label>
              <input required type="date" value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <input placeholder="Phone number (optional)" value={form.phoneNumber ?? ''}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Teacher
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
