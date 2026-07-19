import { useEffect, useState, type FormEvent } from 'react';
import { UserPlus, GraduationCap } from 'lucide-react';
import { teachersApi, type CreateTeacherRequest } from '../api/teachers';
import type { TeacherResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../components/ui/DataTable';

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
  const toast = useToast();
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTeacherRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeacherResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    teachersApi.getAll().then(setTeachers).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await teachersApi.create(form);
      setShowForm(false);
      setForm(emptyForm);
      load();
      toast.success('Teacher created.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await teachersApi.remove(pendingDelete.id);
      toast.success('Teacher removed.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove teacher.');
    } finally {
      setPendingDelete(null);
    }
  }

  const columns: Column<TeacherResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (t) => `${t.firstName} ${t.lastName}`,
      render: (t) => (
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {t.firstName} {t.lastName}
        </span>
      ),
    },
    { key: 'email', header: 'Email', sortValue: (t) => t.email, render: (t) => t.email },
    { key: 'employeeNumber', header: 'Employee #', sortValue: (t) => t.employeeNumber, render: (t) => t.employeeNumber },
    {
      key: 'hireDate',
      header: 'Hire Date',
      sortValue: (t) => t.hireDate,
      render: (t) => new Date(t.hireDate).toLocaleDateString(),
    },
    { key: 'phone', header: 'Phone', render: (t) => t.phoneNumber ?? '-' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (t) => (
        <button onClick={() => setPendingDelete(t)} className="text-critical hover:underline text-sm">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Teachers"
        description={`${teachers.length} teacher${teachers.length === 1 ? '' : 's'} on staff`}
        action={
          <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
            Add Teacher
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={teachers}
        keyFor={(t) => t.id}
        getSearchText={(t) => `${t.firstName} ${t.lastName} ${t.email} ${t.employeeNumber}`}
        searchPlaceholder="Search teachers..."
        loading={loading}
        emptyState={
          <EmptyState icon={<GraduationCap className="w-6 h-6" />} title="No teachers yet" description="Add your first teacher to get started." />
        }
      />

      {showForm && (
        <Modal title="Add Teacher" onClose={() => setShowForm(false)}>
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
            <Field label="Employee number">
              <Input
                required
                value={form.employeeNumber}
                onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              />
            </Field>
            <Field label="Hire date">
              <Input required type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
            </Field>
            <Field label="Phone number (optional)">
              <Input value={form.phoneNumber ?? ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </Field>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Teacher'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove teacher?"
          description={`${pendingDelete.firstName} ${pendingDelete.lastName} will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
