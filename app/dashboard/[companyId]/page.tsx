
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CompanyOverviewPage() {
  const { companyId } = useParams<{ companyId: string }>();

  const cards = [
    {
      title: 'Products',
      description: 'Manage your catalog and publish products for customers.',
      href: `/dashboard/${companyId}/products`,
      action: 'Manage products',
    },
    {
      title: 'Team members',
      description: 'View the people who belong to your company.',
      href: `/dashboard/${companyId}/team`,
      action: 'View team',
    },
    {
      title: 'Customer chat',
      description: 'Create a place for customers to contact your team.',
      href: `/dashboard/${companyId}/chat`,
      action: 'Open chat',
    },
    {
      title: 'Subscription',
      description: 'Review your current plan and available plans.',
      href: `/dashboard/${companyId}/subscription`,
      action: 'View plans',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
        Company workspace
      </p>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Dashboard overview
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your business from one workspace.
          </p>
        </div>

        <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          Workspace selected
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-600/20 to-slate-900 p-6 sm:p-8">
        <p className="text-sm text-slate-400">Company ID</p>
        <p className="mt-2 break-all font-mono text-sm text-slate-200">
          {companyId}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          This workspace is identified by its company ID. Company details
          can be loaded here once the backend exposes a company details endpoint.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-indigo-400/40"
          >
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-5 inline-flex rounded-lg bg-white/5 px-4 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-white/10"
            >
              {card.action} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

