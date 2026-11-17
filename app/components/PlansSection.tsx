
"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Plan {
  id: "FREE" | "PAID";
  name: string;
  price: number | null;
  currency: string;
  features: string[];
}

interface Subscription {
  id: string;
  plan: "FREE" | "PAID";
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
}

export default function PlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

 
  
useEffect(() => {
  let cancelled = false;

  async function fetchPlans() {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch(`${API_URL}/subscriptions/plans`),
        fetch(`${API_URL}/subscriptions/me`, {
          credentials: "include",
        }),
      ]);

      if (!plansResponse.ok) {
        throw new Error("Could not load subscription plans.");
      }

      if (!subscriptionResponse.ok) {
        throw new Error(
          "Could not load your subscription. Please log in again.",
        );
      }

      const plansData = await plansResponse.json();
      const subscriptionData = await subscriptionResponse.json();

      if (cancelled) return;

      setPlans(
        Array.isArray(plansData) ? plansData : plansData.plans ?? [],
      );

      setSubscription(subscriptionData.subscription ?? null);
    } catch (err) {
      if (cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchPlans();

  return () => {
    cancelled = true;
  };
}, []);


  async function activateFreePlan() {
    setActivating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/subscriptions/free`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not activate the Free plan.",
        );
      }

      setSubscription(data.subscription);
      setMessage("Your Free plan is now active!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return (
      <section id="plans" className="scroll-mt-24 py-12">
        <p className="text-gray-500">Loading plans...</p>
      </section>
    );
  }

  return (
    <section id="plans" className="scroll-mt-24 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Membership
        </p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Choose Your Plan
        </h2>
        <p className="mt-2 text-gray-600">
          Start free, then upgrade when your business grows.
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-center text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mb-4 text-center text-green-700">
          {message}
        </p>
      )}

      {subscription?.status === "ACTIVE" && (
        <p className="mb-6 text-center text-gray-700">
          Your current plan:{" "}
          <strong>{subscription.plan}</strong>
        </p>
      )}

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isFree = plan.id === "FREE";
          const isCurrent =
            subscription?.plan === plan.id &&
            subscription?.status === "ACTIVE";

          return (
            <article
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-7 shadow-sm ${
                isFree
                  ? "border-indigo-500 ring-2 ring-indigo-100"
                  : "border-gray-200"
              }`}
            >
              {isFree && (
                <span className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Recommended to start
                </span>
              )}

              <h3 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h3>

              <p className="mt-4 text-4xl font-bold text-gray-900">
                {plan.price === null
                  ? "Custom"
                  : plan.price === 0
                    ? "Free"
                    : `${plan.currency} ${plan.price}`}
              </p>

              <ul className="my-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-sm text-gray-600"
                  >
                    <span className="text-green-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-500"
                >
                  Current Plan
                </button>
              ) : isFree ? (
                <button
                  onClick={activateFreePlan}
                  disabled={activating}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activating ? "Activating..." : "Get Started"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-500"
                  title="Paid checkout has not been implemented yet"
                >
                  Paid plan coming soon
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
