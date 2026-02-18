"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function FAB() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Link
      href="/create"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors md:bottom-8 md:right-8"
      aria-label="Create recipe"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </Link>
  );
}
