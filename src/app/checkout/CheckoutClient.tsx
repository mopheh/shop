"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { ArrowLeftIcon } from "@/components/icons";

interface Props {
  userId: string;
  userEmail: string;
  userName: string;
}

interface FormFields {
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

export default function CheckoutClient({ userId, userEmail, userName }: Props) {
  const { items, totalKobo, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormFields>({
    shippingName: userName,
    shippingEmail: userEmail,
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
  });

  // Redirect to cart if it is empty
  if (items.length === 0) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-500">Your cart is empty.</p>
        <Link href="/" className="text-green-600 hover:underline">
          Browse products
        </Link>
      </main>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const payload = {
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to place order");
        }

        const data = (await res.json()) as { orderId: number };
        clearCart();
        router.push(`/orders/confirmation?orderId=${data.orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to cart
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* ── Shipping form ── */}
        <section className="lg:col-span-3" aria-label="Shipping details">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-5">
              <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
                Shipping Information
              </h2>

              {/* Name & email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  id="shippingName"
                  label="Full name"
                  value={form.shippingName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
                <Field
                  id="shippingEmail"
                  label="Email"
                  type="email"
                  value={form.shippingEmail}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Address */}
              <Field
                id="shippingAddress"
                label="Street address"
                value={form.shippingAddress}
                onChange={handleChange}
                required
                autoComplete="street-address"
                placeholder="123 Lagos Street"
              />

              {/* City / State / Zip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field
                  id="shippingCity"
                  label="City"
                  value={form.shippingCity}
                  onChange={handleChange}
                  required
                  autoComplete="address-level2"
                  className="col-span-2 sm:col-span-1"
                />
                <Field
                  id="shippingState"
                  label="State"
                  value={form.shippingState}
                  onChange={handleChange}
                  required
                  autoComplete="address-level1"
                  placeholder="Lagos"
                />
                <Field
                  id="shippingZip"
                  label="Postal code"
                  value={form.shippingZip}
                  onChange={handleChange}
                  required
                  autoComplete="postal-code"
                  placeholder="100001"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3"
              >
                {error}
              </div>
            )}

            {/* Submit button (mobile — also shown in summary on desktop) */}
            <button
              type="submit"
              form="checkout-form"
              id="place-order-btn"
              disabled={isPending}
              aria-disabled={isPending}
              className="lg:hidden w-full py-3.5 px-6 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-wait text-white font-bold rounded-xl transition-all shadow-md"
            >
              {isPending ? "Placing order…" : `Place Order · ${formatPrice(totalKobo)}`}
            </button>
          </form>
        </section>

        {/* ── Order summary ── */}
        <aside className="lg:col-span-2" aria-label="Order summary">
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">
              Order Summary
            </h2>

            {/* Items */}
            <ul className="flex flex-col gap-3" role="list">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative flex-none w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-none">
                    {formatPrice(item.priceKobo * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <hr className="border-slate-200 dark:border-slate-700" />

            {/* Totals */}
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <dt>Subtotal</dt>
                <dd className="font-medium">{formatPrice(totalKobo)}</dd>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <dt>Shipping</dt>
                <dd className="font-medium text-green-600 dark:text-green-400">Free</dd>
              </div>
            </dl>

            <hr className="border-slate-200 dark:border-slate-700" />

            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-400 text-xl">
                {formatPrice(totalKobo)}
              </span>
            </div>

            {/* Desktop submit */}
            <button
              type="submit"
              form="checkout-form"
              id="place-order-btn-desktop"
              disabled={isPending}
              aria-disabled={isPending}
              className="hidden lg:block w-full py-3.5 px-6 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-wait text-white font-bold rounded-xl transition-all shadow-md text-center"
            >
              {isPending ? "Placing order…" : `Place Order · ${formatPrice(totalKobo)}`}
            </button>

            <p className="text-xs text-slate-400 text-center">
              🔒 Secure order — prices verified server-side
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ── Reusable form field ────────────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: keyof FormFields;
  label: string;
  className?: string;
}

function Field({ id, label, className = "", ...rest }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {rest.required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
        )}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        {...rest}
      />
    </div>
  );
}
