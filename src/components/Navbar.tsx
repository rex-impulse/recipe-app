"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Recipes
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/my-recipes"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                My Recipes
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
