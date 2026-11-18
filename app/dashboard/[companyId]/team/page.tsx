import { Suspense } from 'react';
import TeamContent from './TeamContent';

type TeamPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <Suspense fallback={<TeamLoading />}>
      <TeamPageContent params={params} />
    </Suspense>
  );
}

async function TeamPageContent({ params }: TeamPageProps) {
  const { companyId } = await params;

  return <TeamContent companyId={companyId} />;
}

function TeamLoading() {
  return (
    <div className="p-6">
      <p className="text-gray-500">Loading team...</p>
    </div>
  );
}

