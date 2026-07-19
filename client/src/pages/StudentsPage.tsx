import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { studentsApi, type CreateStudentRequest } from '../api/students';
import { classRoomsApi } from '../api/classRooms';
import type { StudentResponse, ClassRoomResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../components/ui/DataTable';

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
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStudentRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StudentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      await studentsApi.create({ ...form, classRoomId: form.classRoomId || null });
      setShowForm(false);
      setForm(emptyForm);
      load();
      toast.success('Student created.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await studentsApi.remove(pendingDelete.id);
      toast.success('Student removed.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove student.');
    } finally {
      setPendingDelete(null);
    }
  }

  const columns: Column<StudentResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (s) => `${s.firstName} ${s.lastName}`,
      render: (s) => (
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {s.firstName} {s.lastName}
        </span>
      ),
    },
    { key: 'email', header: 'Email', sortValue: (s) => s.email, render: (s) => s.email },
    { key: 'admission', header: 'Admission #', sortValue: (s) => s.admissionNumber, render: (s) => s.admissionNumber },
    { key: 'class', header: 'Class', sortValue: (s) => s.classRoomName ?? '', render: (s) => s.classRoomName ?? '-' },
    { key: 'guardian', header: 'Guardian', render: (s) => s.guardianName ?? '-' },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (s: StudentResponse) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(s);
                }}
                className="text-critical hover:underline text-sm"
              >
                Remove
              </button>
            ),
          } satisfies Column<StudentResponse>,
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        description={`${students.length} student${students.length === 1 ? '' : 's'} enrolled`}
        action={
          isAdmin && (
            <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Add Student
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        rows={students}
        keyFor={(s) => s.id}
        getSearchText={(s) => `${s.firstName} ${s.lastName} ${s.email} ${s.admissionNumber} ${s.classRoomName ?? ''}`}
        searchPlaceholder="Search students..."
        onRowClick={(s) => navigate(`/students/${s.id}`)}
        loading={loading}
        emptyState={
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No students yet"
            description={isAdmin ? 'Add your first student to get started.' : 'No students have been added yet.'}
          />
        }
      />

      {showForm && (
        <Modal title="Add Student" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </Field>
            </div>
            <Field label="Email">
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Temporary password">
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
            <Field label="Admission number">
              <Input
                required
                value={form.admissionNumber}
                onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth">
                <Input
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </Field>
              <Field label="Enrollment date">
                <Input
                  required
                  type="date"
                  value={form.enrollmentDate}
                  onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Class">
              <Select value={form.classRoomId ?? ''} onChange={(e) => setForm({ ...form, classRoomId: e.target.value })}>
                <option value="">No class assigned</option>
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Guardian name (optional)">
              <Input value={form.guardianName ?? ''} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
            </Field>
            <Field label="Guardian phone (optional)">
              <Input value={form.guardianPhone ?? ''} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
            </Field>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Student'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove student?"
          description={`${pendingDelete.firstName} ${pendingDelete.lastName} will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
