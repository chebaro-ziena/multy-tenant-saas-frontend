
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Subscription {
  status: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  plan: "FREE" | "PAID";
  companyId: string | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

export default function CreateCompanyForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAccount = useCallback(async () => {
    setError("");

    try {
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
        throw new Error("Unable to load your subscription.");
      }

      const data = await subscriptionResponse.json();
      setSubscription(data.subscription ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your account.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

 
useEffect(() => {
  let cancelled = false;

  const refreshAccount = () => {
    if (!cancelled) {
      void loadAccount();
    }
  };

  void Promise.resolve().then(() => {
    if (!cancelled) {
      void loadAccount();
    }
  });

  window.addEventListener("companyhub-auth-changed", refreshAccount);
  window.addEventListener(
    "companyhub-subscription-changed",
    refreshAccount,
  );

  return () => {
    cancelled = true;
    window.removeEventListener("companyhub-auth-changed", refreshAccount);
    window.removeEventListener(
      "companyhub-subscription-changed",
      refreshAccount,
    );
  };
}, [loadAccount]);


  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 180),
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!loggedIn) {
      window.dispatchEvent(new Event("companyhub-open-login"));
      return;
    }

    if (
      subscription?.status !== "ACTIVE" ||
      subscription?.plan !== "PAID"
    ) {
      setError("An active Paid subscription is required to create a company.");
      return;
    }

    if (subscription.companyId) {
      setError("Your subscription is already linked to a company.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = data.message;
        throw new Error(
          Array.isArray(details)
            ? details.join(" ")
            : details || "Company creation failed.",
        );
      }

      const company = data.company as Company | undefined;

      if (!company?.id) {
        throw new Error("Company was created, but its ID was not returned.");
      }

      window.dispatchEvent(
        new Event("companyhub-subscription-changed"),
      );

      router.push(`/dashboard/${company.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
        <p className="text-gray-500">Loading your account...</p>
      </section>
    );
  }

  if (!loggedIn) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create your company
        </h2>
        <p className="mt-2 text-gray-600">
          Log in and activate an eligible Paid subscription to create your company.
        </p>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event("companyhub-open-login"))
          }
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Log in
        </button>
      </section>
    );
  }

  if (subscription?.companyId) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your company
        </h2>
        <p className="mt-2 text-gray-600">
          Your subscription is already linked to a company.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push(`/dashboard/${subscription.companyId}`)
          }
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Open company dashboard
        </button>
      </section>
    );
  }

  if (
    subscription?.status !== "ACTIVE" ||
    subscription?.plan !== "PAID"
  ) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create your company
        </h2>
        <p className="mt-2 text-gray-600">
          An active Paid subscription is required before you can create a company.
          Choose a plan above to continue.
        </p>
        <a
          href="#plans"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          View plans
        </a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6">
      <h2 className="text-2xl font-semibold text-gray-900">
        Create your company
      </h2>
      <p className="mt-2 text-gray-600">
        Set up your company, then manage your products from your dashboard.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="company-name"
            className="mb-1 block font-medium text-gray-800"
          >
            Company name
          </label>
          <input
            id="company-name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
            minLength={2}
            maxLength={150}
            placeholder="My Store"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="company-slug"
            className="mb-1 block font-medium text-gray-800"
          >
            Company URL slug
          </label>
          <input
            id="company-slug"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/-+/g, "-")
                  .replace(/^-|-$/g, "")
                  .slice(0, 180),
              );
            }}
            required
            minLength={2}
            maxLength={180}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="my-store"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          />
          <p className="mt-1 text-sm text-gray-500">
            Use lowercase letters, numbers, and single hyphens.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating company..." : "Create company"}
        </button>
      </form>
    </section>
  );
}
