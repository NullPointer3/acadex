import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
        <CompassIcon className="w-7 h-7 text-brand-600 dark:text-brand-300" />
      </div>
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">404</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
        This page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link to="/">
        <Button size="sm">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
