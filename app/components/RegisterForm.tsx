
'use client';

import { FormEvent, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Registration failed.',
        );
      }

      // Verify the session established by registration.
      const sessionResponse = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error(
          'Account created, but the session could not be verified. Try signing in.',
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
      <h2 className="text-3xl font-bold">Create your account</h2>
      <p className="mt-2 text-sm text-slate-400">
        Get started with your company workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm">
            Email address
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="mb-2 block text-sm">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-400"
            placeholder="At least 8 characters"
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

