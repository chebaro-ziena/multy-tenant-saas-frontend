
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

export default function TeamPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeam = useCallback(async () => {
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/companies/${companyId}/team`,
        {
          credentials: 'include',
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.message === 'string'
            ? data.message
            : `Could not load team (${response.status}).`,
        );
      }

      setMembers(Array.isArray(data) ? data : data.members ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load team.',
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

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
          onClick={() => void loadTeam()}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
        >
          Refresh team
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
          <p className="mt-2 text-red-200/80">
            Confirm that your backend team endpoint exists and that your
            account has ADMIN membership in this company.
          </p>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        {loading ? (
          <p className="p-6 text-slate-400">Loading team...</p>
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
                      <p className="mt-1 text-slate-400">{member.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        member.role === 'ADMIN'
                          ? 'bg-indigo-500/10 text-indigo-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
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
