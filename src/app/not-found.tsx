"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="relative text-center max-w-lg">
        {/* Large 404 */}
        <p className="text-[120px] md:text-[180px] font-black leading-none gradient-text select-none mb-0">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold mb-3 -mt-4">
          Page not found
        </h1>
        <p className="text-[var(--muted-fg)] text-sm md:text-base mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back to the dashboard to continue managing your finances.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-semibold
                       hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)]
                       text-sm font-semibold hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
