'use client';

import { useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Subscription = {
  id?: string;
  plan?: string | {
    name?: string;
    price?: number | string;
  };
  status?: string;
  currentPeriodEnd?: string | null;
  endDate?: string | null;
};

type SubscriptionResponse = {
  subscription: Subscription | null;
};

const plans = [
  {
    name: 'FREE',
    price: '$0',
    description: 'For getting started',
    features: [
      'Company workspace',
      'Product catalog',
      'Basic team management',
    ],
  },
  {
    name: 'PAID',
    price: '$20 / month',
    description: 'For growing businesses',
    features: [
      'Everything in Free',
      'Expanded team capabilities',
      'Advanced customer support tools',
      'Enhanced business management',
    ],
  },
];

function getPlanName(subscription: Subscription | null) {
  if (!subscription) return 'FREE';

  if (typeof subscription.plan === 'string') {
    return subscription.plan.toUpperCase();
  }

  return subscription.plan?.name?.toUpperCase() ?? 'FREE';
}

function formatDate(date?: string | null) {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      try {
        const response = await fetch(
          `${API_URL}/subscriptions/me`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || 'Could not load subscription.',
          );
        }

        if (!cancelled) {
          setSubscription(data.subscription ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load subscription.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlan = getPlanName(subscription);

  const subscriptionStatus =
    subscription?.status?.toUpperCase() ??
    (currentPlan === 'FREE' ? 'ACTIVE' : 'UNKNOWN');

  const periodEnd =
    subscription?.currentPeriodEnd ??
    subscription?.endDate ??
    null;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-indigo-400">
        BILLING
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        Plans and subscription
      </h1>

      <p className="mt-2 text-slate-400">
        Manage your business subscription and billing plan.
      </p>

      {/* Current subscription */}
      <section className="mt-8 rounded-2xl border border-indigo-400/30 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              YOUR CURRENT PLAN
            </p>

            {loading ? (
              <p className="mt-2 text-slate-400">
                Loading subscription...
              </p>
            ) : (
              <h2 className="mt-2 text-3xl font-bold text-white">
                {currentPlan}
              </h2>
            )}
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              {subscriptionStatus}
            </span>
          )}
        </div>

        {!loading && !error && (
          <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">
                Subscription type
              </p>
              <p className="mt-1 font-medium text-white">
                {currentPlan === 'PAID'
                  ? '$20 / month'
                  : 'Free plan'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Current period ends
              </p>
              <p className="mt-1 font-medium text-white">
                {formatDate(periodEnd)}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </section>

      {/* Available plans */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white">
          Available plans
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Choose the plan that suits your business.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name;

          return (
            <section
              key={plan.name}
              className={`rounded-2xl border bg-slate-900 p-7 ${
                isCurrent
                  ? 'border-indigo-400'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-indigo-300">
                  {plan.name}
                </p>

                {isCurrent && (
                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
                    Current plan
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-3xl font-bold text-white">
                {plan.price}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {plan.description}
              </p>

              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 text-sm text-slate-300"
                  >
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={loading || isCurrent}
                onClick={() => {
                  setMessage(
                    plan.name === 'PAID'
                      ? 'Paid plan checkout will be available through the subscription checkout flow.'
                      : 'You are already using the Free plan.',
                  );
                }}
                className="mt-8 w-full rounded-xl border border-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCurrent
                  ? 'Your current plan'
                  : plan.name === 'PAID'
                    ? 'Upgrade to Paid'
                    : 'Switch to Free'}
              </button>
            </section>
          );
        })}
      </div>

      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-white/5 p-4 text-sm text-slate-300"
        >
          {message}
        </p>
      )}
    </div>
  );
}

