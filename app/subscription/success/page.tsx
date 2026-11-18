
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subscription = {
  plan?: string;
  status?: string;
};

type SubscriptionResponse = {
  subscription?: Subscription | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function SubscriptionSuccessPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checking, setChecking] = useState(true);

useEffect(() => {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  const maxAttempts = 12; // 12 checks, approximately 30 seconds

  async function checkSubscription() {
    if (cancelled || attempts >= maxAttempts) {
      if (!cancelled) setChecking(false);
      return;
    }

    attempts++;

    try {
      const response = await fetch(`${API_URL}/subscriptions/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not check subscription");
      }

      const data: SubscriptionResponse = await response.json();

      if (cancelled) return;

      const currentSubscription = data.subscription ?? null;
      setSubscription(currentSubscription);

      if (
        currentSubscription?.plan === "PAID" &&
        currentSubscription?.status === "ACTIVE"
      ) {
        setChecking(false);
        return; // Stop polling
      }
    } catch (error) {
      console.error("Subscription status check failed:", error);
    }

    if (cancelled) return;

    if (attempts >= maxAttempts) {
      setChecking(false);
      return;
    }

    timeoutId = setTimeout(checkSubscription, 2500);
  }

  void checkSubscription();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, []);

  const isActive =
    subscription?.plan === "PAID" &&
    subscription?.status === "ACTIVE";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            isActive
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
          aria-hidden="true"
        >
          {isActive ? "✓" : "✓"}
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          {isActive ? "Subscription activated!" : "Thank you for subscribing!"}
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          {isActive
            ? "Your CompanyHub Paid plan is now active. You can create your company and start managing your products and team."
            : "Your checkout was completed. We're waiting for Stripe to confirm your subscription. This usually takes a few moments."}
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
          <p className="text-sm font-semibold text-gray-900">
            Subscription status
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {isActive
              ? "Paid plan · Active"
              : checking
                ? "Confirming your payment..."
                : "Confirmation is taking longer than expected."}
          </p>

          {!isActive && !checking && (
            <p className="mt-2 text-sm text-gray-500">
              Your payment may still be processing. Please check your
              subscription again in a moment before trying to pay again.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Return to CompanyHub
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Check subscription again
          </button>
        </div>
      </section>
    </main>
  );
}
