import { useEffect, useState } from 'react';
import { classRoomsApi } from '../api/classRooms';
import { studentsApi } from '../api/students';
import { attendanceApi } from '../api/attendance';
import type { ClassRoomResponse, StudentResponse, AttendanceStatus } from '../types';

const STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Present: 'bg-green-100 text-green-700 border-green-300',
  Absent: 'bg-red-100 text-red-700 border-red-300',
  Late: 'bg-amber-100 text-amber-700 border-amber-300',
  Excused: 'bg-blue-100 text-blue-700 border-blue-300',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const [classRooms, setClassRooms] = useState<ClassRoomResponse[]>([]);
  const [selectedClassRoom, setSelectedClassRoom] = useState('');
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    classRoomsApi.getAll().then((rooms) => {
      setClassRooms(rooms);
      if (rooms.length > 0) setSelectedClassRoom(rooms[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassRoom) return;
    setSaved(false);
    Promise.all([
      studentsApi.getAll(selectedClassRoom),
      attendanceApi.getByClassAndDate(selectedClassRoom, date),
    ]).then(([studentList, records]) => {
      setStudents(studentList);
      const initial: Record<string, AttendanceStatus> = {};
      for (const s of studentList) {
        const existing = records.find((r) => r.studentId === s.id);
        initial[s.id] = existing?.status ?? 'Present';
      }
      setStatuses(initial);
    });
  }, [selectedClassRoom, date]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await attendanceApi.record({
        classRoomId: selectedClassRoom,
        date,
        entries: students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? 'Present' })),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Attendance</h1>

      <div className="flex items-center gap-3 mb-6">
        <select value={selectedClassRoom} onChange={(e) => setSelectedClassRoom(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2">
          {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Student</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatuses({ ...statuses, [s.id]: status })}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          statuses[s.id] === status ? STATUS_STYLES[status] : 'bg-white text-gray-400 border-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
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
      </div>

      {students.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved.</span>}
        </div>
      )}
    </div>
  );
}
