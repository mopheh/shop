"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckIcon } from "@/components/icons";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full flex flex-col items-center gap-6 text-center">
        {/* Animated success circle */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-50" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white shadow-lg shadow-green-300/40 dark:shadow-green-900/40">
            <CheckIcon className="w-12 h-12" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Order Confirmed! 🎉
          </h1>
          {orderId && (
            <p className="text-slate-500 dark:text-slate-400">
              Order <span className="font-semibold text-slate-700 dark:text-slate-300">#{orderId}</span> has been placed.
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            A confirmation email is on its way to you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {orderId && (
            <Link
              href={`/orders/${orderId}`}
              id="view-order-btn"
              className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-center transition-colors"
            >
              View Order
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 py-3 px-6 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-center transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <ConfirmationContent />
    </Suspense>
  );
}
