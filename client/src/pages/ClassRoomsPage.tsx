import { useEffect, useState, type FormEvent } from 'react';
import { Plus, School, Search, Users } from 'lucide-react';
import { classRoomsApi, type CreateClassRoomRequest } from '../api/classRooms';
import { teachersApi } from '../api/teachers';
import type { ClassRoomResponse, TeacherResponse } from '../types';
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
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const emptyForm: CreateClassRoomRequest = {
  name: '',
  section: '',
  academicYear: '',
  homeroomTeacherId: '',
};

export function ClassRoomsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'Admin';
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateClassRoomRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClassRoomResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      await classRoomsApi.create({ ...form, homeroomTeacherId: form.homeroomTeacherId || null });
      setShowForm(false);
      setForm(emptyForm);
      load();
      toast.success('Class created.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create class room.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await classRoomsApi.remove(pendingDelete.id);
      toast.success('Class removed.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove class.');
    } finally {
      setPendingDelete(null);
    }
  }

  const filtered = classRooms.filter((c) =>
    `${c.name} ${c.section} ${c.academicYear} ${c.homeroomTeacherName ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Classes"
        description={`${classRooms.length} class${classRooms.length === 1 ? '' : 'es'}`}
        action={
          isAdmin && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Add Class
            </Button>
          )
        }
      />

      <div className="relative max-w-xs mb-5">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search classes..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<School className="w-6 h-6" />}
            title="No classes found"
            description={isAdmin ? 'Add your first class to get started.' : 'No classes have been created yet.'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {c.name} {c.section}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.academicYear}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setPendingDelete(c)} className="text-critical hover:underline text-sm">
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">{c.homeroomTeacherName ?? 'Unassigned'}</span>
                <Badge tone="brand">
                  <Users className="w-3 h-3" />
                  {c.studentCount}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Add Class" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Field label="Name">
              <Input required placeholder="e.g. Grade 10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Section">
              <Input required placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            </Field>
            <Field label="Academic year">
              <Input
                required
                placeholder="e.g. 2026-2027"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              />
            </Field>
            <Field label="Homeroom teacher">
              <Select
                value={form.homeroomTeacherId ?? ''}
                onChange={(e) => setForm({ ...form, homeroomTeacherId: e.target.value })}
              >
                <option value="">No homeroom teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Class'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove class?"
          description={`${pendingDelete.name} ${pendingDelete.section} will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
