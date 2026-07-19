import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { classRoomsApi } from '../api/classRooms';
import { subjectsApi } from '../api/subjects';
import { examsApi, type CreateExamRequest } from '../api/exams';
import { gradesApi } from '../api/grades';
import { studentsApi } from '../api/students';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import type { ClassRoomResponse, SubjectResponse, ExamResponse, StudentResponse, GradeResponse } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { scorePercent, scoreTone } from '../lib/grade';

const emptyExamForm: CreateExamRequest = {
  name: '',
  term: '',
  academicYear: '',
  date: '',
  maxScore: 100,
  subjectId: '',
  classRoomId: '',
};

function StudentGradesView() {
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi
      .getMe()
      .then((me) => gradesApi.getByStudent(me.id))
      .then(setGrades)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-56" />;

  return (
    <Card className="overflow-hidden">
      {grades.length === 0 ? (
        <EmptyState icon={<Award className="w-6 h-6" />} title="No grades yet" description="Your results will show up here once recorded." />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/[0.04] text-left text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Exam</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium">Comments</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id} className="border-t border-gray-100 dark:border-white/5">
                <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-100">{g.examName}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={scoreTone(g.score, g.maxScore)}>
                    {g.score}/{g.maxScore} &middot; {scorePercent(g.score, g.maxScore)}%
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{g.comments ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function StaffGradesView() {
  const toast = useToast();
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState('');
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamResponse | null>(null);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState<CreateExamRequest>(emptyExamForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(false);

  useEffect(() => {
    Promise.all([classRoomsApi.getAll(), subjectsApi.getAll()])
      .then(([c, s]) => {
        setClassRooms(c);
        setSubjects(s);
        if (c.length > 0) setSelectedClassRoom(c[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  function loadExams(classRoomId: string) {
    if (!classRoomId) {
      setExams([]);
      return;
    }
    setExamsLoading(true);
    examsApi
      .getAll({ classRoomId })
      .then(setExams)
      .finally(() => setExamsLoading(false));
    setSelectedExam(null);
  }

  useEffect(() => loadExams(selectedClassRoom), [selectedClassRoom]);

  async function selectExam(exam: ExamResponse) {
    setSelectedExam(exam);
    const [studentList, existingGrades] = await Promise.all([
      studentsApi.getAll(exam.classRoomId),
      gradesApi.getByExam(exam.id),
    ]);
    setStudents(studentList);
    const initial: Record<string, string> = {};
    for (const s of studentList) {
      const existing = existingGrades.find((g) => g.studentId === s.id);
      initial[s.id] = existing ? String(existing.score) : '';
    }
    setScores(initial);
  }

  async function handleCreateExam(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await examsApi.create({ ...examForm, classRoomId: selectedClassRoom });
      setShowExamForm(false);
      setExamForm(emptyExamForm);
      loadExams(selectedClassRoom);
      toast.success('Exam created.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create exam.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveGrades() {
    if (!selectedExam) return;
    setSaving(true);
    try {
      await gradesApi.record({
        examId: selectedExam.id,
        entries: students.filter((s) => scores[s.id] !== '').map((s) => ({ studentId: s.id, score: Number(scores[s.id]) })),
      });
      toast.success('Grades saved.');
    } catch {
      toast.error('Failed to save grades.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <Field label="Class">
          <Select value={selectedClassRoom} onChange={(e) => setSelectedClassRoom(e.target.value)} className="min-w-[180px]">
            {classRooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setExamForm({ ...emptyExamForm, classRoomId: selectedClassRoom });
            setShowExamForm(true);
          }}
        >
          Add Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] text-sm font-medium text-gray-500 dark:text-gray-400">
            Exams
          </div>
          {examsLoading ? (
            <TableSkeleton cols={1} rows={4} />
          ) : (
            <ul>
              {exams.map((exam) => (
                <li key={exam.id}>
                  <button
                    onClick={() => selectExam(exam)}
                    className={`w-full text-left px-4 py-2.5 text-sm border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                      selectedExam?.id === exam.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'dark:text-gray-200'
                    }`}
                  >
                    {exam.name} <span className="text-gray-400">({exam.subjectName})</span>
                  </button>
                </li>
              ))}
              {exams.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-400 text-sm">No exams yet.</li>
              )}
            </ul>
          )}
        </Card>

        <div className="lg:col-span-2">
          {selectedExam ? (
            <>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.04] text-left text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Student</th>
                      <th className="px-4 py-2.5 font-medium">Score (max {selectedExam.maxScore})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t border-gray-100 dark:border-white/5">
                        <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-100">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            type="number"
                            min={0}
                            max={selectedExam.maxScore}
                            value={scores[s.id] ?? ''}
                            onChange={(e) => setScores({ ...scores, [s.id]: e.target.value })}
                            className="w-24"
                          />
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                          No students in this class.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
              {students.length > 0 && (
                <div className="mt-4">
                  <Button onClick={handleSaveGrades} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Grades'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <EmptyState icon={<Award className="w-6 h-6" />} title="Select an exam" description="Choose an exam from the list to enter grades." />
            </Card>
          )}
        </div>
      </div>

      {showExamForm && (
        <Modal title="Add Exam" onClose={() => setShowExamForm(false)}>
          <form onSubmit={handleCreateExam} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Field label="Exam name">
              <Input required value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} />
            </Field>
            <Field label="Subject">
              <Select required value={examForm.subjectId} onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Term">
                <Input required placeholder="e.g. Term 1" value={examForm.term} onChange={(e) => setExamForm({ ...examForm, term: e.target.value })} />
              </Field>
              <Field label="Academic year">
                <Input required value={examForm.academicYear} onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input required type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} />
              </Field>
              <Field label="Max score">
                <Input
                  required
                  type="number"
                  min={1}
                  value={examForm.maxScore}
                  onChange={(e) => setExamForm({ ...examForm, maxScore: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating...' : 'Create Exam'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function GradesPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Grades" />
      {user?.role === 'Student' ? <StudentGradesView /> : <StaffGradesView />}
    </div>
  );
}
