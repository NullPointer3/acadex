import { useEffect, useState, type FormEvent } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { subjectsApi, type CreateSubjectRequest } from '../api/subjects';
import type { SubjectResponse } from '../types';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../components/ui/DataTable';

const emptyForm: CreateSubjectRequest = { name: '', code: '' };

export function SubjectsPage() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSubjectRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubjectResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    subjectsApi.getAll().then(setSubjects).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await subjectsApi.create(form);
      setShowForm(false);
      setForm(emptyForm);
      load();
      toast.success('Subject created.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create subject.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await subjectsApi.remove(pendingDelete.id);
      toast.success('Subject removed.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove subject.');
    } finally {
      setPendingDelete(null);
    }
  }

  const columns: Column<SubjectResponse>[] = [
    { key: 'name', header: 'Name', sortValue: (s) => s.name, render: (s) => <span className="font-medium text-gray-800 dark:text-gray-100">{s.name}</span> },
    { key: 'code', header: 'Code', sortValue: (s) => s.code, render: (s) => s.code },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <button onClick={() => setPendingDelete(s)} className="text-critical hover:underline text-sm">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subjects"
        description={`${subjects.length} subject${subjects.length === 1 ? '' : 's'} offered`}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
            Add Subject
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={subjects}
        keyFor={(s) => s.id}
        getSearchText={(s) => `${s.name} ${s.code}`}
        searchPlaceholder="Search subjects..."
        loading={loading}
        emptyState={
          <EmptyState icon={<BookOpen className="w-6 h-6" />} title="No subjects yet" description="Add your first subject to get started." />
        }
      />

      {showForm && (
        <Modal title="Add Subject" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Field label="Name">
              <Input required placeholder="e.g. Mathematics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Code">
              <Input required placeholder="e.g. MATH101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Field>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Subject'}
            </Button>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove subject?"
          description={`${pendingDelete.name} will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
