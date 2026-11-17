
'use client';

import { FormEvent, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Login failed.',
        );
      }

      // Confirm the cookie works by checking the session.
      const sessionResponse = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error(
          'Login succeeded, but the session could not be verified.',
        );
      }

      setPassword('');
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-400">
        Sign in to your company workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="Your password"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Create account
        </button>
      </p>
    </div>
  );
}
