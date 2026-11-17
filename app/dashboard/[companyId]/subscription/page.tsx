
'use client';

import { useState } from 'react';

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
    price: 'Coming soon',
    description: 'For growing businesses',
    features: [
      'Everything in Free',
      'Expanded team capabilities',
      'Advanced customer support tools',
    ],
  },
];

export default function SubscriptionPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-semibold text-indigo-400">
        BILLING
      </p>

      <h1 className="mt-2 text-3xl font-bold">Plans and subscription</h1>

      <p className="mt-2 text-slate-400">
        Choose the plan that suits your business.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <section
            key={plan.name}
            className={`rounded-2xl border bg-slate-900 p-7 ${
              plan.name === 'PAID'
                ? 'border-indigo-400/40'
                : 'border-white/10'
            }`}
          >
            <p className="text-sm font-semibold text-indigo-300">
              {plan.name}
            </p>

            <h2 className="mt-4 text-3xl font-bold">{plan.price}</h2>
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
              onClick={() =>
                setMessage(
                  plan.name === 'FREE'
                    ? 'Your current plan needs to be loaded from the subscription API.'
                    : 'Paid plan activation is not available yet.',
                )
              }
              className="mt-8 w-full rounded-xl border border-white/10 px-4 py-3 font-semibold hover:bg-white/5"
            >
              {plan.name === 'FREE' ? 'Free plan' : 'Explore paid plan'}
            </button>
          </section>
        ))}
      </div>

      {message && (
        <p role="status" className="mt-5 rounded-xl bg-white/5 p-4 text-sm text-slate-300">
          {message}
        </p>
      )}
    </div>
  );
}
