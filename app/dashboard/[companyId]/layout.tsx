
import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import DashboardNavigation, {
  NavigationFallback,
} from './components/DashboardNavigation';
import LogoutButton from './components/LogoutButton';

export default function CompanyDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="flex w-full flex-col border-b border-white/10 bg-slate-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          Company<span className="text-indigo-400">Hub</span>
        </Link>

        <p className="mt-2 text-xs text-slate-500">
          WORKSPACE
        </p>

        <Suspense fallback={<NavigationFallback />}>
          <DashboardNavigation />
        </Suspense>

        <LogoutButton />
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
