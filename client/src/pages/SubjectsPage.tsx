import { useEffect, useState, type FormEvent } from 'react';
import { subjectsApi, type CreateSubjectRequest } from '../api/subjects';
import type { SubjectResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';

const emptyForm: CreateSubjectRequest = { name: '', code: '' };

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSubjectRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    subjectsApi.getAll().then(setSubjects).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await subjectsApi.create(form);
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create subject.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this subject?')) return;
    await subjectsApi.remove(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Add Subject
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
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.code}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-400">No subjects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Subject" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input required placeholder="Name (e.g. Mathematics)" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <input required placeholder="Code (e.g. MATH101)" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Subject
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
