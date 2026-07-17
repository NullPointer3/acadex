import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { classRoomsApi } from '../api/classRooms';
import { subjectsApi } from '../api/subjects';
import { examsApi, type CreateExamRequest } from '../api/exams';
import { gradesApi } from '../api/grades';
import { studentsApi } from '../api/students';
import { Modal } from '../components/Modal';
import { ApiError } from '../api/client';
import type { ClassRoomResponse, SubjectResponse, ExamResponse, StudentResponse, GradeResponse } from '../types';

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
    studentsApi.getMe()
      .then((me) => gradesApi.getByStudent(me.id))
      .then(setGrades)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Exam</th>
            <th className="px-4 py-2 font-medium">Score</th>
            <th className="px-4 py-2 font-medium">Comments</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g) => (
            <tr key={g.id} className="border-t border-gray-100">
              <td className="px-4 py-2">{g.examName}</td>
              <td className="px-4 py-2">{g.score} / {g.maxScore}</td>
              <td className="px-4 py-2">{g.comments ?? '-'}</td>
            </tr>
          ))}
          {grades.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-400">No grades yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StaffGradesView() {
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([classRoomsApi.getAll(), subjectsApi.getAll()]).then(([c, s]) => {
      setClassRooms(c);
      setSubjects(s);
      if (c.length > 0) setSelectedClassRoom(c[0].id);
    });
  }, []);

  function loadExams(classRoomId: string) {
    if (!classRoomId) {
      setExams([]);
      return;
    }
    examsApi.getAll({ classRoomId }).then(setExams);
    setSelectedExam(null);
  }

  useEffect(() => loadExams(selectedClassRoom), [selectedClassRoom]);

  async function selectExam(exam: ExamResponse) {
    setSelectedExam(exam);
    setSaved(false);
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
    try {
      await examsApi.create({ ...examForm, classRoomId: selectedClassRoom });
      setShowExamForm(false);
      setExamForm(emptyExamForm);
      loadExams(selectedClassRoom);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create exam.');
    }
  }

  async function handleSaveGrades() {
    if (!selectedExam) return;
    setSaving(true);
    setSaved(false);
    try {
      await gradesApi.record({
        examId: selectedExam.id,
        entries: students
          .filter((s) => scores[s.id] !== '')
          .map((s) => ({ studentId: s.id, score: Number(scores[s.id]) })),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select value={selectedClassRoom} onChange={(e) => setSelectedClassRoom(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2">
          {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        <button
          onClick={() => { setExamForm({ ...emptyExamForm, classRoomId: selectedClassRoom }); setShowExamForm(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Add Exam
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden lg:col-span-1">
          <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-500">Exams</div>
          <ul>
            {exams.map((exam) => (
              <li key={exam.id}>
                <button
                  onClick={() => selectExam(exam)}
                  className={`w-full text-left px-4 py-2 text-sm border-t border-gray-100 hover:bg-gray-50 ${
                    selectedExam?.id === exam.id ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                >
                  {exam.name} <span className="text-gray-400">({exam.subjectName})</span>
                </button>
              </li>
            ))}
            {exams.length === 0 && <li className="px-4 py-6 text-center text-gray-400 text-sm">No exams yet.</li>}
          </ul>
        </div>

        <div className="lg:col-span-2">
          {selectedExam ? (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Student</th>
                      <th className="px-4 py-2 font-medium">Score (max {selectedExam.maxScore})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min={0}
                            max={selectedExam.maxScore}
                            value={scores[s.id] ?? ''}
                            onChange={(e) => setScores({ ...scores, [s.id]: e.target.value })}
                            className="w-24 border border-gray-300 rounded-md px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400">No students in this class.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {students.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleSaveGrades}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Grades'}
                  </button>
                  {saved && <span className="text-sm text-green-600">Saved.</span>}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm">Select an exam to enter grades.</p>
          )}
        </div>
      </div>

      {showExamForm && (
        <Modal title="Add Exam" onClose={() => setShowExamForm(false)}>
          <form onSubmit={handleCreateExam} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input required placeholder="Exam name" value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2" />
            <select required value={examForm.subjectId} onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Term (e.g. Term 1)" value={examForm.term}
                onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2" />
              <input required placeholder="Academic year" value={examForm.academicYear}
                onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input required type="date" value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max score</label>
                <input required type="number" min={1} value={examForm.maxScore}
                  onChange={(e) => setExamForm({ ...examForm, maxScore: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">
              Create Exam
            </button>
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Grades</h1>
      {user?.role === 'Student' ? <StudentGradesView /> : <StaffGradesView />}
    </div>
  );
}
