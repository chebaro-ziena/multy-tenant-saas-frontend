import { Suspense } from 'react';

type CompanyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function CompanyPage({
  params,
}: CompanyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-6">
          <p className="text-slate-400">
            Loading company...
          </p>
        </div>
      }
    >
      <CompanyContent params={params} />
    </Suspense>
  );
}

async function CompanyContent({
  params,
}: CompanyPageProps) {
  const { slug } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${slug}`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-bold">
          Company not found
        </h1>
      </main>
    );
  }

  const company = await response.json();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">
        {company.name}
      </h1>

      <p className="mt-3 text-slate-400">
        {company.description}
      </p>
    </main>
  );
}
