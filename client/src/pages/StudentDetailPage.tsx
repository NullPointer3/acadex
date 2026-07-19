import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, School, ClipboardCheck, Award } from 'lucide-react';
import { studentsApi } from '../api/students';
import { attendanceApi } from '../api/attendance';
import { gradesApi } from '../api/grades';
import type { StudentResponse, AttendanceRecordResponse, GradeResponse, AttendanceStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { scorePercent, scoreTone } from '../lib/grade';

const ATTENDANCE_TONE: Record<AttendanceStatus, 'good' | 'critical' | 'warning' | 'accent'> = {
  Present: 'good',
  Absent: 'critical',
  Late: 'warning',
  Excused: 'accent',
};

type Tab = 'attendance' | 'grades';

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecordResponse[]>([]);
  const [grades, setGrades] = useState<GradeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('attendance');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([studentsApi.getById(id), attendanceApi.getByStudent(id), gradesApi.getByStudent(id)])
      .then(([s, a, g]) => {
        setStudent(s);
        setAttendance(a);
        setGrades(g);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return <EmptyState title="Student not found" description="This student may have been removed." />;
  }

  return (
    <div>
      <Link
        to="/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4 flex-wrap">
          <Avatar firstName={student.firstName} lastName={student.lastName} size="lg" />
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Admission #{student.admissionNumber}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> {student.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <School className="w-4 h-4 text-gray-400" /> {student.classRoomName ?? 'Unassigned'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> Born {new Date(student.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            {(student.guardianName || student.guardianPhone) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Guardian: {student.guardianName ?? '-'} {student.guardianPhone ? `(${student.guardianPhone})` : ''}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setTab('attendance')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'attendance'
              ? 'border-brand-600 text-brand-600 dark:text-brand-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> Attendance
        </button>
        <button
          onClick={() => setTab('grades')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'grades'
              ? 'border-brand-600 text-brand-600 dark:text-brand-300'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Award className="w-4 h-4" /> Grades
        </button>
      </div>

      {tab === 'attendance' && (
        <Card className="overflow-hidden">
          {attendance.length === 0 ? (
            <EmptyState title="No attendance records" description="Nothing has been recorded for this student yet." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.04] text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 dark:border-white/5">
                      <td className="px-4 py-2.5 dark:text-gray-200">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={ATTENDANCE_TONE[r.status]}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{r.notes ?? '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === 'grades' && (
        <Card className="overflow-hidden">
          {grades.length === 0 ? (
            <EmptyState title="No grades recorded" description="This student has no exam results yet." />
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
                    <td className="px-4 py-2.5 dark:text-gray-200">{g.examName}</td>
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
      )}
    </div>
  );
}
