
"use client";

import Link from "next/link";

interface NavbarProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Navbar({
  onLogin,
  onRegister,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          CompanyHub
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="#products" className="text-gray-700 hover:text-indigo-600">
            Products
          </a>

          <a href="#plans" className="text-gray-700 hover:text-indigo-600">
            Plans
          </a>

          <button
            onClick={onLogin}
            className="text-gray-700 hover:text-indigo-600"
          >
            Login
          </button>

          <button
            onClick={onRegister}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Register
          </button>
        </div>
      </nav>
    </header>
  );
}

