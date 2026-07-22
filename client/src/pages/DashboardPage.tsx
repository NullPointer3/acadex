import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Award,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentsApi } from '../api/students';
import { teachersApi } from '../api/teachers';
import { classRoomsApi } from '../api/classRooms';
import { subjectsApi } from '../api/subjects';
import { timetableApi } from '../api/timetable';
import { gradesApi } from '../api/grades';
import type { ClassRoomResponse, TimetableEntryResponse, GradeResponse, UserSummary } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BarChart } from '../components/ui/BarChart';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { todayDayName, formatTime } from '../lib/date';
import { scorePercent, scoreTone } from '../lib/grade';

const QUICK_LINKS = [
  { to: '/students', label: 'Students', icon: Users, roles: ['Admin', 'Teacher'] },
  { to: '/teachers', label: 'Teachers', icon: GraduationCap, roles: ['Admin'] },
  { to: '/classrooms', label: 'Classes', icon: School },
  { to: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['Admin'] },
  { to: '/timetable', label: 'Timetable', icon: CalendarClock },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['Admin', 'Teacher'] },
  { to: '/grades', label: 'Grades', icon: Award },
] as const;

function QuickLinks({ role }: { role: string }) {
  return (
    <div className="@container">
      <div className="stagger-fade-in grid grid-cols-2 @sm:grid-cols-3 @xl:grid-cols-4 gap-3">
        {QUICK_LINKS.filter((l) => !('roles' in l) || (l.roles as readonly string[]).includes(role)).map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-w-0"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
              <l.icon className="w-4.5 h-4.5" size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ students: 0, teachers: 0, subjects: 0 });
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);

  useEffect(() => {
    Promise.all([studentsApi.getAll(), teachersApi.getAll(), classRoomsApi.getAll(), subjectsApi.getAll()])
      .then(([students, teachers, rooms, subjects]) => {
        setCounts({ students: students.length, teachers: teachers.length, subjects: subjects.length });
        setClassRooms(rooms);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-56" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="stagger-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={counts.students} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Teachers" value={counts.teachers} icon={<GraduationCap className="w-5 h-5" />} tone="accent" />
        <StatCard label="Classes" value={classRooms.length} icon={<School className="w-5 h-5" />} />
        <StatCard label="Subjects" value={counts.subjects} icon={<BookOpen className="w-5 h-5" />} tone="accent" />
      </div>

      <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Students per Class</h2>
          <BarChart data={classRooms.map((c) => ({ label: `${c.name} ${c.section}`, value: c.studentCount }))} />
        </Card>
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Links</h2>
          <QuickLinks role="Admin" />
        </div>
      </div>
    </div>
  );
}

function TodaySchedule({ entries }: { entries: TimetableEntryResponse[] }) {
  const sorted = entries.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Today&apos;s Schedule</h2>
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="Nothing scheduled today" description="Enjoy the free time." />
      ) : (
        <ul className="stagger-fade-in divide-y divide-gray-100 dark:divide-white/5">
          {sorted.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{e.subjectName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{e.classRoomName}</p>
              </div>
              <Badge tone="brand">
                {formatTime(e.startTime)} - {formatTime(e.endTime)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TeacherDashboard({ user }: { user: UserSummary }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);

  useEffect(() => {
    timetableApi.getAll().then((all) => {
      const today = todayDayName();
      const fullName = `${user.firstName} ${user.lastName}`;
      setEntries(all.filter((e) => e.dayOfWeek === today && e.teacherName === fullName));
      setLoading(false);
    });
  }, [user]);

  if (loading) return <Skeleton className="h-56" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TodaySchedule entries={entries} />
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Links</h2>
        <QuickLinks role="Teacher" />
      </div>
    </div>
  );
}

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);
  const [grades, setGrades] = useState<GradeResponse[]>([]);

  useEffect(() => {
    studentsApi.getMe().then(async (me) => {
      const today = todayDayName();
      const [timetable, gradeList] = await Promise.all([
        me.classRoomId ? timetableApi.getAll({ classRoomId: me.classRoomId }) : Promise.resolve([]),
        gradesApi.getByStudent(me.id),
      ]);
      setEntries(timetable.filter((e) => e.dayOfWeek === today));
      setGrades(gradeList.slice(-5).reverse());
      setLoading(false);
    });
  }, []);

  if (loading) return <Skeleton className="h-56" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TodaySchedule entries={entries} />
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
          <Award className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent Grades</h2>
        </div>
        {grades.length === 0 ? (
          <EmptyState title="No grades yet" />
        ) : (
          <ul className="stagger-fade-in divide-y divide-gray-100 dark:divide-white/5">
            {grades.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{g.examName}</p>
                <Badge tone={scoreTone(g.score, g.maxScore)}>
                  {g.score}/{g.maxScore} &middot; {scorePercent(g.score, g.maxScore)}%
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <PageHeader title={`Welcome, ${user.firstName}`} description={`Signed in as ${user.role}`} />
      {user.role === 'Admin' && <AdminDashboard />}
      {user.role === 'Teacher' && <TeacherDashboard user={user} />}
      {user.role === 'Student' && <StudentDashboard />}
    </div>
  );
}
