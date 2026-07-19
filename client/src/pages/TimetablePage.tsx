import { useEffect, useState, type FormEvent } from 'react';
import { Plus, CalendarClock } from 'lucide-react';
import { timetableApi, type CreateTimetableEntryRequest } from '../api/timetable';
import { classRoomsApi } from '../api/classRooms';
import { subjectsApi } from '../api/subjects';
import { teachersApi } from '../api/teachers';
import type { ClassRoomResponse, SubjectResponse, TeacherResponse, TimetableEntryResponse, DayOfWeekName } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { DAYS, formatTime } from '../lib/date';

const WEEK_ORDER: DayOfWeekName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  const toast = useToast();
  const isAdmin = user?.role === 'Admin';
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState('');
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTimetableEntryRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TimetableEntryResponse | null>(null);

  useEffect(() => {
    Promise.all([classRoomsApi.getAll(), subjectsApi.getAll(), isAdmin ? teachersApi.getAll() : Promise.resolve([])]).then(
      ([c, s, t]) => {
        setClassRooms(c);
        setSubjects(s);
        setTeachers(t);
        if (c.length > 0) setSelectedClassRoom(c[0].id);
        else setLoading(false);
      },
    );
  }, [isAdmin]);

  function loadEntries(classRoomId: string) {
    if (!classRoomId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timetableApi
      .getAll({ classRoomId })
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(() => loadEntries(selectedClassRoom), [selectedClassRoom]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await timetableApi.create(form);
      setShowForm(false);
      setForm({ ...emptyForm, classRoomId: selectedClassRoom });
      loadEntries(selectedClassRoom);
      toast.success('Timetable entry added.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create timetable entry.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await timetableApi.remove(pendingDelete.id);
      toast.success('Timetable entry removed.');
      loadEntries(selectedClassRoom);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove entry.');
    } finally {
      setPendingDelete(null);
    }
  }

  const byDay: Record<DayOfWeekName, TimetableEntryResponse[]> = Object.fromEntries(
    DAYS.map((d) => [d, entries.filter((e) => e.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime))]),
  ) as Record<DayOfWeekName, TimetableEntryResponse[]>;

  return (
    <div>
      <PageHeader
        title="Timetable"
        action={
          isAdmin &&
          selectedClassRoom && (
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setForm({ ...emptyForm, classRoomId: selectedClassRoom });
                setShowForm(true);
              }}
            >
              Add Entry
            </Button>
          )
        }
      />

      {classRooms.length === 0 ? (
        <EmptyState icon={<CalendarClock className="w-6 h-6" />} title="No classes yet" description="Create a class first to build its timetable." />
      ) : (
        <>
          <Field label="Class">
            <Select
              value={selectedClassRoom}
              onChange={(e) => setSelectedClassRoom(e.target.value)}
              className="max-w-xs mb-6"
            >
              {classRooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section}
                </option>
              ))}
            </Select>
          </Field>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <EmptyState icon={<CalendarClock className="w-6 h-6" />} title="No timetable entries" description="Nothing scheduled for this class yet." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-start">
              {WEEK_ORDER.filter((d) => d !== 'Sunday' || byDay[d].length > 0).map((day) => (
                <div key={day} className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-1">
                    {day}
                  </p>
                  <div className="space-y-2">
                    {byDay[day].length === 0 ? (
                      <div className="text-xs text-gray-300 dark:text-gray-600 px-1">&mdash;</div>
                    ) : (
                      byDay[day].map((entry) => (
                        <Card key={entry.id} className="p-3">
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-300">
                            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                          </p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-1">{entry.subjectName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{entry.teacherName}</p>
                          {isAdmin && (
                            <button
                              onClick={() => setPendingDelete(entry)}
                              className="text-critical hover:underline text-xs mt-2"
                            >
                              Remove
                            </button>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <Modal title="Add Timetable Entry" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Field label="Class">
              <Select required value={form.classRoomId} onChange={(e) => setForm({ ...form, classRoomId: e.target.value })}>
                <option value="">Select class</option>
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Teacher">
              <Select required value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Day">
              <Select
                required
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value as DayOfWeekName })}
              >
                {WEEK_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time">
                <Input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </Field>
              <Field label="End time">
                <Input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </Field>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Entry'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove timetable entry?"
          description={`${pendingDelete.subjectName} on ${pendingDelete.dayOfWeek} will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
