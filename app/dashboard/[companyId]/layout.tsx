
'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function CompanyDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ companyId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId;
  const [loggingOut, setLoggingOut] = useState(false);

  const navigation = [
    {
      label: 'Overview',
      href: `/dashboard/${companyId}`,
      icon: '▦',
    },
    {
      label: 'Products',
      href: `/dashboard/${companyId}/products`,
      icon: '□',
    },
    {
      label: 'Team',
      href: `/dashboard/${companyId}/team`,
      icon: '♧',
    },
    {
      label: 'Chat',
      href: `/dashboard/${companyId}/chat`,
      icon: '☏',
    },
    {
      label: 'Subscription',
      href: `/dashboard/${companyId}/subscription`,
      icon: '◇',
    },
  ];

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Could not log out. Please try again.');
      }

      router.replace('/');
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Logout failed.',
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="flex w-full flex-col border-b border-white/10 bg-slate-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <Link href={`/dashboard/${companyId}`} className="text-xl font-bold">
          Company<span className="text-indigo-400">Hub</span>
        </Link>

        <p className="mt-2 text-xs text-slate-500">WORKSPACE</p>

        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50 md:mt-auto"
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
