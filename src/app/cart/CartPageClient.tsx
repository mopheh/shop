"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

export default function CartPageClient() {
  const { items, totalItems, totalKobo, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl">
            🛒
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your cart is empty
          </h1>
          <p className="text-slate-500">
            Browse our products and add something you love.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Your Cart
          <span className="ml-3 text-sm font-normal text-slate-500">
            ({totalItems} item{totalItems !== 1 ? "s" : ""})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          aria-label="Clear all items from cart"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart item list */}
        <section className="lg:col-span-2" aria-label="Cart items">
          <ul className="flex flex-col gap-4" role="list">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.productId}`}
                  className="relative flex-none w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                  aria-label={`View ${item.name}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="flex-none p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity stepper */}
                    <div
                      className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="px-3 text-sm font-medium min-w-[2rem] text-center"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label={`Increase quantity of ${item.name}`}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatPrice(item.priceKobo * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order summary */}
        <aside aria-label="Order summary">
          <div className="sticky top-24 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">
              Order Summary
            </h2>

            <dl className="flex flex-col gap-2 text-sm">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-slate-600 dark:text-slate-400"
                >
                  <dt className="truncate max-w-[60%]">
                    {item.name} × {item.quantity}
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {formatPrice(item.priceKobo * item.quantity)}
                  </dd>
                </div>
              ))}
            </dl>

            <hr className="border-slate-200 dark:border-slate-700" />

            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Subtotal</span>
              <span className="text-green-600 dark:text-green-400 text-xl">
                {formatPrice(totalKobo)}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Shipping and taxes calculated at checkout.
            </p>

            <Link
              href="/checkout"
              id="proceed-to-checkout"
              className="block w-full py-3 px-6 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold text-center rounded-xl transition-all shadow-md hover:shadow-green-200 dark:hover:shadow-green-900"
            >
              Proceed to Checkout →
            </Link>

            <Link
              href="/"
              className="block text-center text-sm text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
