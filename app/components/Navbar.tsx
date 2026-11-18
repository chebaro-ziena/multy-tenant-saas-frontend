
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface NavbarProps {
  onLogin: () => void;
  onRegister: () => void;
}

interface CurrentUser {
  name?: string;
  email?: string;
}

export default function Navbar({ onLogin, onRegister }: NavbarProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  

  useEffect(() => {
  let active = true;

  const checkUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (active) setUser(null);
        return;
      }

      const data = await response.json();

      if (active) setUser(data.user ?? null);
    } catch {
      if (active) setUser(null);
    } finally {
      if (active) setLoading(false);
    }
  };

  const handleAuthChanged = () => {
    void checkUser();
  };

  // Defer the initial check until after the effect runs.
  void Promise.resolve().then(() => {
    if (active) void checkUser();
  });

  window.addEventListener('companyhub-auth-changed', handleAuthChanged);

  return () => {
    active = false;
    window.removeEventListener(
      'companyhub-auth-changed',
      handleAuthChanged,
    );
  };
}, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed. Please try again.');
      }

      setUser(null);
      window.dispatchEvent(new Event('companyhub-auth-changed'));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Logout failed.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          CompanyHub
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="#products"
            className="hidden text-gray-600 hover:text-indigo-600 sm:inline"
          >
            Products
          </Link>

          <Link
            href="#plans"
            className="hidden text-gray-600 hover:text-indigo-600 sm:inline"
          >
            Plans
          </Link>

          {!loading && user ? (
            <>
              <span className="max-w-48 truncate text-sm font-medium text-gray-700">
                {user.name || user.email || 'Logged in'}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : !loading ? (
            <>
              <button
                type="button"
                onClick={onLogin}
                className="font-medium text-gray-700 hover:text-indigo-600"
              >
                Login
              </button>

              <button
                type="button"
                onClick={onRegister}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
              >
                Register
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

