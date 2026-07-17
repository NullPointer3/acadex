import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsApi } from '../api/students';
import { teachersApi } from '../api/teachers';
import { classRoomsApi } from '../api/classRooms';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ students: number; teachers: number; classRooms: number } | null>(null);

  useEffect(() => {
    if (user?.role !== 'Admin') return;
    Promise.all([studentsApi.getAll(), teachersApi.getAll(), classRoomsApi.getAll()]).then(
      ([students, teachers, classRooms]) =>
        setStats({ students: students.length, teachers: teachers.length, classRooms: classRooms.length }),
    );
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Welcome, {user?.firstName}
      </h1>
      <p className="text-gray-500 mb-6">Signed in as {user?.role}</p>

      {user?.role === 'Admin' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Students" value={stats.students} />
          <StatCard label="Teachers" value={stats.teachers} />
          <StatCard label="Class Rooms" value={stats.classRooms} />
        </div>
      )}
    </div>
  );
}
