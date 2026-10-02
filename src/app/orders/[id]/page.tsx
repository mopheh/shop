import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getOrderWithItems } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ArrowLeftIcon } from "@/components/icons";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id} — ShopNG` };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/orders");

  const order = await getOrderWithItems(Number(id), session.user.id);
  if (!order) notFound();

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          All orders
        </Link>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Order #{order.id}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <section className="lg:col-span-2" aria-label="Order items">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <h2 className="font-semibold text-slate-900 dark:text-white px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              Items ordered
            </h2>
            <ul role="list">
              {order.items.map((item, i) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    i < order.items.length - 1
                      ? "border-b border-slate-100 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <Link
                    href={`/products/${item.product_id}`}
                    className="relative flex-none w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                    aria-label={`View ${item.product_name}`}
                  >
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatPrice(item.unit_price_kobo)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex-none">
                    {formatPrice(item.unit_price_kobo * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Total row */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                {formatPrice(order.total_kobo)}
              </span>
            </div>
          </div>
        </section>

        {/* Shipping info */}
        <aside aria-label="Shipping details">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Shipping to
            </h2>
            <address className="not-italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white block">
                {order.shipping_name}
              </strong>
              {order.shipping_email}
              <br />
              {order.shipping_address}
              <br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </address>
          </div>
        </aside>
      </div>
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
    <span className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${cls}`}>
      {status}
    </span>
  );
}
