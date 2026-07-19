import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassRoomsPage } from './pages/ClassRoomsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TimetablePage } from './pages/TimetablePage';
import { AttendancePage } from './pages/AttendancePage';
import { GradesPage } from './pages/GradesPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/classrooms" element={<ClassRoomsPage />} />
                  <Route path="/timetable" element={<TimetablePage />} />
                  <Route path="/grades" element={<GradesPage />} />

                  <Route element={<ProtectedRoute roles={['Admin', 'Teacher']} />}>
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/students/:id" element={<StudentDetailPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['Admin']} />}>
                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/subjects" element={<SubjectsPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
