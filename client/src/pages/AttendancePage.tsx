import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { classRoomsApi } from '../api/classRooms';
import { studentsApi } from '../api/students';
import { attendanceApi } from '../api/attendance';
import type { ClassRoomResponse, StudentResponse, AttendanceStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Select, Input } from '../components/ui/Field';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { todayIso } from '../lib/date';

const STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Present: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30',
  Absent: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  Late: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  Excused: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/30',
};

export function AttendancePage() {
  const toast = useToast();
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState('');
  const [date, setDate] = useState(todayIso());
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classRoomsApi.getAll().then((rooms) => {
      setClassRooms(rooms);
      if (rooms.length > 0) setSelectedClassRoom(rooms[0].id);
      else setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassRoom) return;
    setLoading(true);
    Promise.all([studentsApi.getAll(selectedClassRoom), attendanceApi.getByClassAndDate(selectedClassRoom, date)])
      .then(([studentList, records]) => {
        setStudents(studentList);
        const initial: Record<string, AttendanceStatus> = {};
        for (const s of studentList) {
          const existing = records.find((r) => r.studentId === s.id);
          initial[s.id] = existing?.status ?? 'Present';
        }
        setStatuses(initial);
      })
      .finally(() => setLoading(false));
  }, [selectedClassRoom, date]);

  async function handleSave() {
    setSaving(true);
    try {
      await attendanceApi.record({
        classRoomId: selectedClassRoom,
        date,
        entries: students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? 'Present' })),
      });
      toast.success('Attendance saved.');
    } catch {
      toast.error('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  }

  const counts = STATUSES.reduce<Record<AttendanceStatus, number>>(
    (acc, status) => {
      acc[status] = Object.values(statuses).filter((s) => s === status).length;
      return acc;
    },
    { Present: 0, Absent: 0, Late: 0, Excused: 0 },
  );

  return (
    <div>
      <PageHeader title="Attendance" description="Mark today's roll call for a class." />

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
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        {students.length > 0 && !loading && (
          <div className="flex gap-2 ml-auto">
            {STATUSES.map((s) => (
              <Badge key={s} tone={s === 'Present' ? 'good' : s === 'Absent' ? 'critical' : s === 'Late' ? 'warning' : 'accent'}>
                {counts[s]} {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton cols={2} />
        ) : classRooms.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="w-6 h-6" />} title="No classes yet" description="Create a class before taking attendance." />
        ) : students.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="w-6 h-6" />} title="No students in this class" />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.04] text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 dark:border-white/5">
                  <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-100">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatuses({ ...statuses, [s.id]: status })}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            statuses[s.id] === status
                              ? STATUS_STYLES[status]
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-white/10 dark:hover:bg-white/5'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {students.length > 0 && !loading && (
        <div className="mt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      )}
    </div>
  );
}
