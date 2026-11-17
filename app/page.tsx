"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import ProductsSection from "./components/ProductsSection";
import PlansSection from "./components/PlansSection";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

type AuthMode = "login" | "register" | null;

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const router = useRouter();

  function handleLoginSuccess() {
    setAuthMode(null);
    router.refresh();
  }

  function handleRegisterSuccess() {
    setAuthMode("login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Welcome to CompanyHub
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-900 md:text-6xl">
          Discover products. Connect with companies.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-gray-600">
          Explore products, connect with businesses, or choose a plan
          to start your own company.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        <ProductsSection />

        <div className="border-t border-gray-200">
          <PlansSection />
        </div>
      </div>

      {authMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAuthMode(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={authMode === "login" ? "Login" : "Register"}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAuthMode(null)}
              aria-label="Close"
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-900"
            >
              &times;
            </button>

            {authMode === "login" ? (
              <>
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setAuthMode("register")}
                />
              </>
            ) : (
              <>
                <RegisterForm
                  onSuccess={handleRegisterSuccess}
                  onSwitchToLogin={() => setAuthMode("login")}
                />
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
