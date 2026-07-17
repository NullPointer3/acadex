import { useEffect, useState, type FormEvent } from 'react';
import { timetableApi, type CreateTimetableEntryRequest } from '../api/timetable';
import { classRoomsApi } from '../api/classRooms';
import { subjectsApi } from '../api/subjects';
import { teachersApi } from '../api/teachers';
import type { ClassRoomResponse, SubjectResponse, TeacherResponse, TimetableEntryResponse, DayOfWeekName } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DAYS: DayOfWeekName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptyForm: CreateTimetableEntryRequest = {
  classRoomId: '',
  subjectId: '',
  teacherId: '',
  dayOfWeek: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
};

export function TimetablePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState('');
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTimetableEntryRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([classRoomsApi.getAll(), subjectsApi.getAll(), isAdmin ? teachersApi.getAll() : Promise.resolve([])])
      .then(([c, s, t]) => {
        setClassRooms(c);
        setSubjects(s);
        setTeachers(t);
        if (c.length > 0) setSelectedClassRoom(c[0].id);
      });
  }, [isAdmin]);

  function loadEntries(classRoomId: string) {
    if (!classRoomId) {
      setEntries([]);
      return;
    }
    timetableApi.getAll({ classRoomId }).then(setEntries);
  }

  useEffect(() => loadEntries(selectedClassRoom), [selectedClassRoom]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await timetableApi.create(form);
      setShowForm(false);
      setForm({ ...emptyForm, classRoomId: selectedClassRoom });
      loadEntries(selectedClassRoom);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create timetable entry.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this timetable entry?')) return;
    await timetableApi.remove(id);
    loadEntries(selectedClassRoom);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Timetable</h1>
        {isAdmin && (
          <button
            onClick={() => { setForm({ ...emptyForm, classRoomId: selectedClassRoom }); setShowForm(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Entry
          </button>
        )}
      </div>

      <select value={selectedClassRoom} onChange={(e) => setSelectedClassRoom(e.target.value)}
        className="mb-6 border border-gray-300 rounded-md px-3 py-2">
        {classRooms.map((c) => (
          <option key={c.id} value={c.id}>{c.name} {c.section}</option>
        ))}
      </select>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Day</th>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Subject</th>
              <th className="px-4 py-2 font-medium">Teacher</th>
              {isAdmin && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {entries
              .slice()
              .sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime))
              .map((entry) => (
                <tr key={entry.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{entry.dayOfWeek}</td>
                  <td className="px-4 py-2">{entry.startTime.slice(0, 5)} - {entry.endTime.slice(0, 5)}</td>
                  <td className="px-4 py-2">{entry.subjectName}</td>
                  <td className="px-4 py-2">{entry.teacherName}</td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline">
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-6 text-center text-gray-400">
                  No timetable entries for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add Timetable Entry" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <select required value={form.classRoomId} onChange={(e) => setForm({ ...form, classRoomId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select class</option>
              {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
            <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select required value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
            <select required value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value as DayOfWeekName })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start time</label>
                <input required type="time" value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End time</label>
                <input required type="time" value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Entry
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
