
'use client';

import { useCallback, useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type TeamMember = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
  joinedAt: string;
};

type TeamResponse =
  | TeamMember[]
  | { members: TeamMember[] };

type TeamContentProps = {
  companyId: string;
};

async function fetchTeam(
  companyId: string,
  signal?: AbortSignal,
): Promise<TeamMember[]> {
  const response = await fetch(
    `${API_URL}/companies/${companyId}/team`,
    {
      credentials: 'include',
      signal,
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : `Could not load team (${response.status}).`;

    throw new Error(message);
  }

  const result = data as TeamResponse;

  return Array.isArray(result)
    ? result
    : result.members;
}

export default function TeamContent({
  companyId,
}: TeamContentProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    fetchTeam(companyId, controller.signal)
      .then((data) => {
        setMembers(data);
        setError('');
      })
      .catch((err: unknown) => {
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load team.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [companyId]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchTeam(companyId);
      setMembers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load team.',
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold text-indigo-400">
        WORKSPACE MANAGEMENT
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team members</h1>
          <p className="mt-2 text-slate-400">
            View the members assigned to this company.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh team'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        {loading ? (
          <p className="p-6 text-slate-400">
            Loading team...
          </p>
        ) : members.length === 0 && !error ? (
          <p className="p-8 text-center text-slate-400">
            No team members were returned.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Member</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.membershipId}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{member.name}</p>
                      <p className="mt-1 text-slate-400">
                        {member.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          member.role === 'ADMIN'
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                      {member.joinedAt
                        ? new Date(
                            member.joinedAt,
                          ).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
