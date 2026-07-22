import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { Field, Input } from '../components/ui/Field';
import { Button } from '../components/ui/Button';

const isMockMode = import.meta.env.VITE_USE_MOCKS === 'true';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@acadex.local' },
  { role: 'Teacher', email: 'emma.clarke@acadex.local' },
  { role: 'Student', email: 'liam.carter@acadex.local' },
] as const;

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await doLogin(email, password);
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111016]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 text-white flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:28px_28px]" />
        <div
          className="animate-float-blob absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="animate-float-blob absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl"
          style={{ animationDelay: '4s' }}
        />
        <div className="animate-fade-in-up relative flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center font-bold transition-transform duration-300 hover:rotate-[12deg] hover:scale-110">
            A
          </div>
          <span className="text-xl font-semibold">Acadex</span>
        </div>
        <div className="animate-fade-in-up relative max-w-md" style={{ animationDelay: '80ms' }}>
          <h1 className="text-3xl font-semibold leading-tight mb-3">
            Everything your school runs on, in one place.
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Manage students, teachers, classes, timetables, attendance, and grades &mdash; built
            for admins, teachers, and students alike.
          </p>
        </div>
        <p className="relative text-xs text-white/60">&copy; {new Date().getFullYear()} Acadex</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="animate-fade-in-up w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Acadex</span>
          </div>

          <div className="mb-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your school account</p>
          </div>

          {error && (
            <div className="animate-fade-in-up mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-shadow"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-shadow"
              />
            </Field>
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-6" size="md">
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>

          {isMockMode && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/10">
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Demo mode &mdash; jump in as
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => doLogin(acct.email, 'demo')}
                    className="text-xs font-medium px-2 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-50 transition-all duration-150"
                  >
                    {acct.role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
