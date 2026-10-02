import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getOrdersByUserId } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your Orders — ShopNG",
  description: "View your past orders.",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/orders");

  const orders = await getOrdersByUserId(session.user.id);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        Your Orders
        <span className="ml-3 text-sm font-normal text-slate-500">
          ({orders.length} total)
        </span>
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 text-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-4xl">📦</div>
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No orders yet</p>
            <p className="text-sm text-slate-500 mt-1">
              When you place an order, it will appear here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4" role="list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all group"
              >
                {/* Order ID + date */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Order #{order.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Status + amount */}
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatPrice(order.total_kobo)}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600 group-hover:text-green-500 transition-colors">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    confirmed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    shipped: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    delivered: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  };
  const cls = styles[status] ?? styles.pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${cls}`}>
      {status}
    </span>
  );
}
