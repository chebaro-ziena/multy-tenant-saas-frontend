
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
        error instanceof Error ? error.message : 'Logout failed.'
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="mt-auto rounded-lg px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      {loggingOut ? 'Logging out...' : 'Log out'}
    </button>
  );
}
