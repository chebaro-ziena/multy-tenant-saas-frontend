"use client";

import { useCallback, useEffect, useState } from "react";

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
  companyId?: string | null;
}

export default function PlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paidCheckoutLoading, setPaidCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  
  const loadData = useCallback(async () => {
    setError("");

    try {
      const plansResponse = await fetch(`${API_URL}/subscriptions/plans`);
      if (!plansResponse.ok) {
        throw new Error("Could not load subscription plans.");
      }

      const plansData = await plansResponse.json();
      setPlans(
        Array.isArray(plansData) ? plansData : plansData.plans ?? [],
      );

      const authResponse = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!authResponse.ok) {
        setLoggedIn(false);
        setSubscription(null);
        return;
      }

      setLoggedIn(true);

      const subscriptionResponse = await fetch(
        `${API_URL}/subscriptions/me`,
        { credentials: "include" },
      );

      if (!subscriptionResponse.ok) {
        throw new Error("Could not load your subscription.");
      }

      const subscriptionData = await subscriptionResponse.json();
      setSubscription(subscriptionData.subscription ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  

useEffect(() => {
  let cancelled = false;

  const refreshPlans = () => {
    if (!cancelled) {
      void loadData();
    }
  };

  // Defer the initial load so it doesn't synchronously trigger
  // state updates during the effect.
  void Promise.resolve().then(() => {
    if (!cancelled) {
      void loadData();
    }
  });

  window.addEventListener("companyhub-auth-changed", refreshPlans);
  window.addEventListener(
    "companyhub-subscription-changed",
    refreshPlans,
  );

  return () => {
    cancelled = true;
    window.removeEventListener("companyhub-auth-changed", refreshPlans);
    window.removeEventListener(
      "companyhub-subscription-changed",
      refreshPlans,
    );
  };
}, [loadData]);


  async function activateFreePlan() {
    if (!loggedIn) {
      window.dispatchEvent(new Event("companyhub-open-login"));
      return;
    }

    setActivating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/subscriptions/free`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = data.message;
        throw new Error(
          Array.isArray(details)
            ? details.join(" ")
            : details || "Could not activate the Free plan.",
        );
      }

      setMessage("Your Free plan is active.");
      await loadData();

      window.dispatchEvent(
        new Event("companyhub-subscription-changed"),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setActivating(false);
    }
  }
  
async function startPaidCheckout() {
  setPaidCheckoutLoading(true);
  setCheckoutError("");

  try {
    const response = await fetch(
      `${API_URL}/subscriptions/checkout`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.message === "string"
          ? data.message
          : "Could not start checkout.",
      );
    }

    if (typeof data.url !== "string") {
      throw new Error("Stripe did not return a checkout URL.");
    }

    window.location.assign(data.url);
  } catch (error) {
    setCheckoutError(
      error instanceof Error
        ? error.message
        : "Checkout failed.",
    );
  } finally {
    setPaidCheckoutLoading(false);
  }
}

  if (loading) {
    return (
      <section id="plans" className="scroll-mt-24 py-12">
        <p className="text-gray-500">Loading plans...</p>
      </section>
    );
  }

  const currentPlanIsActive = subscription?.status === "ACTIVE";

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
          Start with Free or upgrade when you&apos;re ready to build your business.
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

      {loggedIn && currentPlanIsActive && (
        <p className="mb-6 text-center text-gray-700">
          Your current plan: <strong>{subscription?.plan}</strong>
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
              className={`rounded-2xl border bg-white p-7 shadow-sm ${
                isFree
                  ? "border-indigo-500 ring-2 ring-indigo-100"
                  : "border-gray-200"
              }`}
            >
              <span className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {isFree ? "Start here" : "For growing businesses"}
              </span>

              <h3 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h3>

              <p className="mt-4 text-4xl font-bold text-gray-900">
                {plan.price === null
                  ? "Contact us"
                  : plan.price === 0
                    ? "Free"
                    : `${plan.currency} ${plan.price}`}
              </p>

              <ul className="my-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-green-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-500"
                >
                  Current Plan
                </button>
              ) : isFree ? (
                <button
                  type="button"
                  onClick={() => void activateFreePlan()}
                  disabled={activating}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activating
                    ? "Activating..."
                    : loggedIn
                      ? "Choose Free"
                      : "Log in to choose Free"}
                </button>
              ) : (
                <button
  type="button"
  onClick={startPaidCheckout}
  disabled={paidCheckoutLoading}
>
  {paidCheckoutLoading
    ? "Redirecting to Stripe..."
    : "Subscribe — $20/month"}
</button>

              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}




