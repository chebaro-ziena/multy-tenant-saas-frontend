'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export function NavigationFallback() {
  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
      {['Overview', 'Products', 'Team', 'Chat', 'Subscription'].map(
        (label) => (
          <span
            key={label}
            className="rounded-lg px-4 py-3 text-sm text-slate-500"
          >
            {label}
          </span>
        )
      )}
    </nav>
  );
}

export default function DashboardNavigation() {
  const { companyId } = useParams<{ companyId: string }>();
  const pathname = usePathname();

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

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
      {navigation.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
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
  );
}
